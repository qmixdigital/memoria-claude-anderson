"""Geracao das materias, via Batch API.

Fluxo: para cada slot da agenda que precisa de materia, escolhe o fato, monta o
pedido e manda tudo num lote so. Quando o lote termina, cada resposta vira uma
linha em `materias` com a imagem ja gerada, pronta para o publicador pegar na
hora do slot.

Portao de orcamento: nada e enviado se o motor estiver pausado por teto.
"""
from __future__ import annotations

import datetime as dt
import json
import logging
import re
import unicodedata

from . import budget, config, db, dedupe, prompts, schedule
from .providers import anthropic_p as ap
from .providers import runware

log = logging.getLogger("motor.generate")


def slugificar(texto, maximo=60):
    t = unicodedata.normalize("NFKD", (texto or "").lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    if len(t) > maximo:
        t = t[:maximo].rsplit("-", 1)[0]
    return t or "materia"


def _sem_travessao(texto):
    """Rede de seguranca: o travessao nao pode passar, mesmo se o modelo usar."""
    if not texto:
        return texto
    t = texto.replace(" — ", ", ").replace("—", ",")
    return t.replace(" – ", ", ").replace("–", "-")


def _validar(dados, site):
    """Corrige o que da para corrigir, recusa o que nao da."""
    for chave in ("titulo", "dek", "meta_title", "meta_description",
                  "corpo_html", "categoria"):
        if not dados.get(chave):
            raise ValueError("campo ausente na resposta: " + chave)

    for chave in ("titulo", "dek", "meta_title", "meta_description",
                  "corpo_html"):
        dados[chave] = _sem_travessao(dados[chave])

    validas = site.get("categorias_validas", ["Notícias"])
    if dados["categoria"] not in validas:
        # categoria fora da lista criaria categoria nova no portal e sujaria o
        # menu. Cai para a padrao em vez de recusar a materia inteira.
        log.warning("[%s] categoria invalida %r, usando padrao",
                    site["slug"], dados["categoria"])
        dados["categoria"] = site.get("categoria_padrao", validas[0])

    if len(dados["titulo"]) > 70:
        dados["titulo"] = dados["titulo"][:70].rsplit(" ", 1)[0]
    if "<h1" in dados["corpo_html"].lower():
        dados["corpo_html"] = re.sub(r"</?h1[^>]*>", "", dados["corpo_html"],
                                     flags=re.I)
    return dados


def _autor(site, categoria):
    """Assinatura do portal com afinidade pela categoria.

    Respeita `geral.autores_bloqueados`: nome nessa lista NUNCA assina, em
    portal nenhum. A checagem fica aqui, e nao so na configuracao, porque
    reconfigurar um portal e trivial e trazer o nome de volta por acidente
    seria silencioso.
    """
    bloqueados = {b.strip().lower()
                  for b in (config.geral().get("autores_bloqueados") or [])}
    equipe = [a for a in (site.get("equipe") or [])
              if str(a.get("nome", "")).strip().lower() not in bloqueados]
    if not equipe:
        if site.get("equipe"):
            log.error("[%s] todos os autores estao bloqueados; assinando com "
                      "o nome do portal", site["slug"])
        return site.get("nome")
    alvo = slugificar(categoria)
    for a in equipe:
        if alvo in [slugificar(c) for c in a.get("cats", [])]:
            return a["nome"]
    return equipe[0]["nome"]


def montar_pedidos(limite=200):
    """Reserva slots, escolhe fatos e monta os pedidos do lote."""
    if not budget.pode_gerar():
        log.warning("geracao pausada por orcamento, nada sera enviado")
        return []

    pedidos, contexto = [], {}
    for slot in schedule.slots_para_gerar(limite=limite):
        site = config.site(slot["site_slug"])
        if not site:
            continue
        usados = {str(r["fato_guid"]) for r in (db.q(
            "SELECT fato_guid FROM publicacoes WHERE site_slug=%s",
            (site["slug"],)) or [])}
        fato = schedule.escolher_fato(site, usados)
        if not fato:
            log.info("[%s] sem fato disponivel para o slot %s",
                     site["slug"], slot["slot"])
            continue
        fontes = dedupe.fontes_do_fato(fato["id"])
        if len(fontes) < config.min_dominios():
            continue

        if not schedule.reservar(slot["id"], fato["guid"]):
            continue

        cid = "s{}_{}".format(slot["id"], str(fato["guid"])[:8])
        params = ap.params_mensagem(
            config.modelo_geracao(),
            [
                {"type": "text", "text": prompts.REGRAS,
                 "cache_control": {"type": "ephemeral"}},
                {"type": "text", "text": prompts.perfil_do_site(site)},
            ],
            [{"role": "user",
              "content": prompts.mensagem_fontes(
                  fato["titulo_representativo"], fontes)}],
            max_tokens=4000,
            # SEM output_config/json_schema de proposito. Medido em
            # 20/08/2026: com o schema, o modelo encerra a materia no meio da
            # frase com stop_reason=end_turn (1.027 tokens de saida, corpo
            # cortado em "venceu com o romance "). Sem o schema, a mesma pauta
            # sai completa com 2.659 tokens. O decodificador restrito nao esta
            # conseguindo emitir o texto inteiro, provavelmente por aspas
            # dentro do corpo. O contrato de campos e garantido por
            # _validar(), que recusa resposta incompleta.
            schema=None,
            thinking=config.thinking_geracao(),
        )
        pedidos.append((cid, params))
        contexto[cid] = {
            "agenda_id": slot["id"], "site_slug": site["slug"],
            "fato_guid": str(fato["guid"]),
            "fontes": [{"veiculo": f.get("veiculo") or f["dominio"],
                        "url": f["url_final"], "dominio": f["dominio"]}
                       for f in fontes],
        }
    if contexto:
        db.estado_set("contexto_lote", contexto)
    return pedidos


def enviar():
    """Monta e envia o lote do dia. Devolve o batch_id ou None."""
    pedidos = montar_pedidos()
    if not pedidos:
        log.info("nenhum pedido a enviar")
        return None
    batch_id = ap.enviar_lote(pedidos)
    db.exec1(
        "INSERT INTO lotes (batch_id, provedor, modelo, finalidade, "
        "n_pedidos, estado) VALUES (%s,'anthropic',%s,'geracao',%s,'enviado')",
        (batch_id, config.modelo_geracao(), len(pedidos)))
    return batch_id


def colher(batch_id=None):
    """Colhe os lotes terminados e grava as materias."""
    if batch_id:
        lotes = [{"batch_id": batch_id}]
    else:
        lotes = db.q("SELECT batch_id FROM lotes WHERE estado='enviado' "
                     "AND finalidade='geracao'") or []
    contexto = db.estado_get("contexto_lote", {}) or {}
    total = 0

    for l in lotes:
        bid = l["batch_id"]
        try:
            if ap.estado_lote(bid) != "ended":
                continue
        except Exception as e:
            log.error("nao consegui consultar o lote %s: %s", bid, e)
            continue

        for cid, msg, erro in ap.resultados_lote(bid):
            ctx = contexto.get(cid)
            if not ctx:
                log.warning("resultado sem contexto: %s", cid)
                continue
            if erro or msg is None:
                log.error("[%s] pedido falhou: %s", ctx["site_slug"], erro)
                schedule.marcar(ctx["agenda_id"], "falhou")
                continue
            try:
                _gravar_materia(ctx, msg)
                total += 1
            except Exception as e:
                log.exception("[%s] falha ao gravar materia: %s",
                              ctx["site_slug"], e)
                schedule.marcar(ctx["agenda_id"], "falhou")

        db.exec1("UPDATE lotes SET estado='processado', processado_em=now() "
                 "WHERE batch_id=%s", (bid,))
    if total:
        log.info("colhidas %d materias", total)
    return total


def _gravar_materia(ctx, msg):
    site = config.site(ctx["site_slug"])
    dados = _validar(prompts.parse_blocos(ap.texto_de(msg)), site)
    u = ap.uso(msg)
    usd = budget.registrar(
        "geracao", provedor="anthropic", modelo=config.modelo_geracao(),
        tokens_in=u["in"], tokens_out=u["out"], cache_read=u["cache_read"],
        cache_write=u["cache_write"], batch=True)

    corpo = _injetar_fontes(dados["corpo_html"], ctx["fontes"])
    autor = _autor(site, dados["categoria"])

    # imagem e caminho critico: sem ela o receptor grava como rascunho
    b64, err_img = runware.gerar(dados.get("prompt_imagem")
                                 or dados["palavra_chave"])
    if err_img:
        log.warning("[%s] imagem falhou (%s): a materia iria como rascunho",
                    site["slug"], err_img)

    db.exec1(
        "INSERT INTO materias (fato_guid, site_slug, agenda_id, titulo, slug, "
        "meta_title, meta_description, dek, corpo_html, categoria, autor, "
        "imagem_b64, imagem_alt, imagem_prompt, fontes, modelo, provedor, "
        "tokens_in, tokens_out, cache_read, cache_write, usd, estado) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'anthropic',"
        "%s,%s,%s,%s,%s,%s) "
        "ON CONFLICT (fato_guid, site_slug) DO NOTHING",
        (ctx["fato_guid"], site["slug"], ctx["agenda_id"], dados["titulo"],
         slugificar(dados["titulo"]), dados["meta_title"],
         dados["meta_description"], dados["dek"], corpo, dados["categoria"],
         autor, b64, dados["titulo"], dados.get("prompt_imagem"),
         json.dumps(ctx["fontes"]), config.modelo_geracao(),
         u["in"], u["out"], u["cache_read"], u["cache_write"], usd,
         "pronta" if b64 else "sem_imagem"))
    schedule.marcar(ctx["agenda_id"], "gerado" if b64 else "falhou")


def _injetar_fontes(corpo, fontes):
    """Garante a secao Fontes com link, mesmo se o modelo esquecer."""
    if re.search(r"<h2[^>]*>\s*fontes", corpo, re.I):
        return corpo
    itens = "".join(
        '<li><a href="{}" rel="noopener nofollow" target="_blank">{}</a></li>'
        .format(f["url"], f["veiculo"]) for f in fontes if f.get("url"))
    if not itens:
        return corpo
    return corpo + "<h2>Fontes consultadas</h2><ul>" + itens + "</ul>"
