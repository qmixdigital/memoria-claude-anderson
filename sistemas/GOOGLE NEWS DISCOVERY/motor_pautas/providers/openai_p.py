"""Provedor OpenAI.

Entrou para o teste cego, mas virou DEPENDENCIA DE PRODUCAO: os embeddings do
dedupe usam a mesma chave. Sem ela o motor nao para, mas agrupa so pela peneira
de fichas raras, e o resultado sao clusters fragmentados (o mesmo fato vira
dois). Ver o runbook.

Modelo e preco confirmados pelo Anderson em 20/08/2026: `gpt-5.6-luna`,
US$ 0,20/M de entrada e US$ 1,20/M de saida, Batch a 50% e cached input a 10%.
O id continua em MP_MODELO_OPENAI para ser trocavel sem deploy, e
`validar_modelo()` confere contra o endpoint de modelos na primeira chamada
real.
"""
from __future__ import annotations

import json
import logging

from .. import budget, config

log = logging.getLogger("motor.openai")

_cliente = None
_modelo_validado = None


def _falhou(e, contexto):
    budget.alertar_falha_credito("openai", e, contexto)
    raise e


def disponivel():
    return bool(config.env("OPENAI_API_KEY"))


def cliente():
    global _cliente
    if _cliente is None:
        from openai import OpenAI
        _cliente = OpenAI(api_key=config.env("OPENAI_API_KEY",
                                             obrigatorio=True))
    return _cliente


def modelo_padrao():
    return config.env("MP_MODELO_OPENAI", "gpt-5.6-luna")


def validar_modelo(modelo=None, avisar=True):
    """Confere o id contra o endpoint de modelos. Roda uma vez por processo.

    Devolve (existe, mensagem). Se divergir, alerta em vez de falhar em
    silencio: o teste cego iria registrar 'erro' em todos os codigos daquele
    modelo e ninguem entenderia por que.
    """
    global _modelo_validado
    modelo = modelo or modelo_padrao()
    if _modelo_validado == modelo:
        return True, "ja validado nesta execucao"
    try:
        ids = {m.id for m in cliente().models.list().data}
    except Exception as e:
        budget.alertar_falha_credito("openai", e, "models.list")
        return False, "nao consegui listar modelos: {}".format(e)

    if modelo in ids:
        _modelo_validado = modelo
        log.info("modelo OpenAI %s confirmado no endpoint de modelos", modelo)
        return True, "confirmado"

    parecidos = sorted(i for i in ids if i.startswith("gpt-5"))[:12]
    msg = ("O id {!r} NAO aparece no endpoint de modelos da OpenAI.\n"
           "Modelos gpt-5* disponiveis nesta conta: {}\n"
           "Trocar em MP_MODELO_OPENAI no motor-pautas.env, e conferir o "
           "preco em precos.py se o modelo for outro.").format(
               modelo, ", ".join(parecidos) or "nenhum")
    log.error(msg)
    if avisar:
        budget.alertar("[Motor de pautas] id de modelo OpenAI divergente", msg,
                       urgente=True)
    return False, msg


def chamar(modelo, system_texto, usuario_texto, max_tokens=4000):
    """Chamada sincrona. Devolve (texto, uso)."""
    validar_modelo(modelo)
    try:
        r = cliente().chat.completions.create(
            model=modelo,
            max_completion_tokens=max_tokens,
            messages=[{"role": "system", "content": system_texto},
                      {"role": "user", "content": usuario_texto}],
        )
    except Exception as e:
        _falhou(e, "chat.completions modelo={}".format(modelo))
    texto = r.choices[0].message.content or ""
    u = getattr(r, "usage", None)
    uso = {
        "in": getattr(u, "prompt_tokens", 0) or 0,
        "out": getattr(u, "completion_tokens", 0) or 0,
        "cache_read": 0, "cache_write": 0,
    }
    return texto, uso


def json_de(texto):
    t = (texto or "").strip()
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
