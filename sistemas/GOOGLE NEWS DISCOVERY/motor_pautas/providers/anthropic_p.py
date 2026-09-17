"""Provedor Anthropic: Batch API para a producao e chamada direta para o resto.

Duas alavancas de custo aplicadas aqui:

  Batch API   -50% sobre entrada e saida. O pipeline nao e sensivel a latencia
              (a materia e gerada na vespera do slot agendado), entao o lote e
              gratuito em termos de experiencia.

  Prompt cache  o perfil de redacao de cada site e estavel e passa do minimo de
              ~1024 tokens, entao entra como bloco de system com cache_control.
              O corpo das fontes varia e fica DEPOIS do ponto de cache, para
              nao invalidar o prefixo.

Thinking fica desligado na geracao em lote por decisao de orcamento: token de
raciocinio e cobrado como saida, e no volume de 1.950 materias/mes ligar
thinking adaptativo levaria o total de ~US$ 63 para ~US$ 83. O teste cego mede
se compensa.
"""
from __future__ import annotations

import json
import logging
import time

from .. import budget, config

log = logging.getLogger("motor.anthropic")

_cliente = None


def _falhou(e, contexto):
    """Toda falha passa por aqui: credito e auth viram alerta imediato."""
    budget.alertar_falha_credito("anthropic", e, contexto)
    raise e


def cliente():
    global _cliente
    if _cliente is None:
        import anthropic
        _cliente = anthropic.Anthropic(
            api_key=config.env("ANTHROPIC_API_KEY", obrigatorio=True))
    return _cliente


def bloco_system(perfil_texto, cachear=True):
    """System como lista de blocos, com cache_control no ultimo."""
    bloco = {"type": "text", "text": perfil_texto}
    if cachear:
        bloco["cache_control"] = {"type": "ephemeral"}
    return [bloco]


def params_mensagem(modelo, system_blocos, mensagens, max_tokens=4000,
                    schema=None, thinking="disabled"):
    """Monta o corpo de uma chamada, igual para lote e para chamada direta."""
    p = {
        "model": modelo,
        "max_tokens": max_tokens,
        "system": system_blocos,
        "messages": mensagens,
    }
    if thinking == "disabled":
        p["thinking"] = {"type": "disabled"}
    elif thinking == "adaptive":
        p["thinking"] = {"type": "adaptive"}
    if schema:
        p["output_config"] = {"format": {"type": "json_schema",
                                         "schema": schema}}
    return p


def uso(msg):
    """Extrai o uso de tokens de uma resposta, tolerando campos ausentes."""
    u = getattr(msg, "usage", None)
    if u is None:
        return {"in": 0, "out": 0, "cache_read": 0, "cache_write": 0}
    return {
        "in": getattr(u, "input_tokens", 0) or 0,
        "out": getattr(u, "output_tokens", 0) or 0,
        "cache_read": getattr(u, "cache_read_input_tokens", 0) or 0,
        "cache_write": getattr(u, "cache_creation_input_tokens", 0) or 0,
    }


def texto_de(msg):
    """Concatena os blocos de texto da resposta (ignora thinking)."""
    partes = []
    for b in getattr(msg, "content", []) or []:
        if getattr(b, "type", None) == "text":
            partes.append(b.text)
    return "".join(partes)


def json_de(msg):
    """Le a resposta como JSON, tolerando cerca de crase."""
    t = texto_de(msg).strip()
    if t.startswith("```"):
        t = t.split("\n", 1)[1] if "\n" in t else t
        t = t.rsplit("```", 1)[0]
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        i, f = t.find("{"), t.rfind("}")
        if i >= 0 and f > i:
            return json.loads(t[i:f + 1])
        raise


# ------------------------------------------------------------- chamada direta

def chamar(modelo, system_blocos, mensagens, max_tokens=4000, schema=None,
           thinking="disabled"):
    """Chamada sincrona. Usada nos estagios mecanicos e no teste cego."""
    p = params_mensagem(modelo, system_blocos, mensagens, max_tokens,
                        schema, thinking)
    try:
        msg = cliente().messages.create(**p)
    except Exception as e:
        _falhou(e, "messages.create modelo={}".format(modelo))
    if getattr(msg, "stop_reason", None) == "refusal":
        det = getattr(msg, "stop_details", None)
        raise RuntimeError("recusa do modelo: {}".format(
            getattr(det, "category", "sem categoria")))
    return msg


# ------------------------------------------------------------------- em lote

def enviar_lote(pedidos):
    """pedidos: lista de (custom_id, params). Devolve o id do lote."""
    reqs = [{"custom_id": cid, "params": params} for cid, params in pedidos]
    try:
        lote = cliente().messages.batches.create(requests=reqs)
    except Exception as e:
        _falhou(e, "batches.create com {} pedidos".format(len(reqs)))
    log.info("lote %s enviado com %d pedidos", lote.id, len(reqs))
    return lote.id


def validar_chave():
    """Confere que a chave responde. Usado no comando `testar-chaves`."""
    try:
        ms = cliente().models.list(limit=20)
        return True, [m.id for m in ms.data]
    except Exception as e:
        budget.alertar_falha_credito("anthropic", e, "models.list")
        return False, str(e)


def estado_lote(batch_id):
    b = cliente().messages.batches.retrieve(batch_id)
    return b.processing_status


def aguardar_lote(batch_id, intervalo=60, teto_seg=24 * 3600):
    """Espera o lote terminar. Devolve True se terminou, False se estourou."""
    gasto = 0
    while gasto < teto_seg:
        st = estado_lote(batch_id)
        if st == "ended":
            return True
        time.sleep(intervalo)
        gasto += intervalo
    return False


def resultados_lote(batch_id):
    """Itera (custom_id, msg_ou_None, erro). A ordem NAO e a do envio."""
    for r in cliente().messages.batches.results(batch_id):
        tipo = r.result.type
        if tipo == "succeeded":
            yield r.custom_id, r.result.message, None
        else:
            erro = getattr(r.result, "error", None)
            yield r.custom_id, None, "{}: {}".format(tipo, erro)
