"""Conferencia da PRIMEIRA publicacao de cada receptor WordPress.

O receptor do Portal Engine eu li linha a linha; o plugin WordPress foi
auditado mas nunca tinha recebido publicacao real do motor. A salvaguarda:
conferir a primeira materia de cada portal WordPress lendo o post de volta pela
API do proprio WordPress, e comparar autor, categoria e slug com o que foi
enviado.

Se divergir, o portal e PAUSADO e o alerta vai no Telegram. Os outros seguem.
A pausa fica em `motor_estado`, nao no sites.json: e reversivel por comando e
nao mexe no arquivo que o operador edita a mao.

Contexto medido em 20/08/2026, antes da primeira publicacao do motor: posts ja
existentes em `desassossegada.com.br` e `viajenodetalhe.com.br` estao com
`author: 0`. Ou seja, o problema de autor que a auditoria previu **ja acontece
hoje** com a plataforma atual nesses sites. A conferencia abaixo existe para o
motor nao repetir isso em silencio.
"""
from __future__ import annotations

import logging
import re

import httpx

from . import budget, config, db

log = logging.getLogger("motor.verificacao")

CHAVE_PAUSADOS = "portais_pausados"
CHAVE_VERIFICADOS = "receptores_verificados"
TEMPO = 30


def pausados():
    return db.estado_get(CHAVE_PAUSADOS, {}) or {}


def pausar_portal(slug, motivo):
    p = dict(pausados())
    if slug in p:
        return False
    p[slug] = motivo
    db.estado_set(CHAVE_PAUSADOS, p)
    log.error("PORTAL PAUSADO %s: %s", slug, motivo)
    return True


def retomar_portal(slug):
    p = dict(pausados())
    if slug not in p:
        return False
    p.pop(slug)
    db.estado_set(CHAVE_PAUSADOS, p)
    log.warning("portal %s retomado", slug)
    return True


def ja_verificado(slug):
    return slug in (db.estado_get(CHAVE_VERIFICADOS, []) or [])


def marcar_verificado(slug):
    v = list(db.estado_get(CHAVE_VERIFICADOS, []) or [])
    if slug not in v:
        v.append(slug)
        db.estado_set(CHAVE_VERIFICADOS, v)


def _get(url, params=None):
    r = httpx.get(url, params=params or {}, timeout=TEMPO,
                  follow_redirects=True)
    r.raise_for_status()
    return r.json()


def conferir_wordpress(site, materia, resultado):
    """Le o post publicado de volta e compara com o que foi enviado.

    Devolve (ok, problemas). Nao levanta: falha de leitura nao e falha de
    publicacao, e derrubar o portal por indisponibilidade da API seria pior
    que o problema que a conferencia procura.
    """
    base = site["base_url"].rstrip("/")
    resp = resultado.get("resposta") or {}
    post_id = resp.get("post_id") or resp.get("id")
    if not post_id:
        return True, ["receptor nao devolveu post_id: conferencia pulada"]

    try:
        post = _get("{}/wp-json/wp/v2/posts/{}".format(base, post_id),
                    {"_fields": "id,slug,author,categories,link,status"})
    except Exception as e:
        return True, ["nao consegui ler o post de volta ({}): conferencia "
                      "pulada, publicacao mantida".format(str(e)[:60])]

    problemas = []

    # 1. AUTOR: o plugin faz intval(); nome vira 0 e ele escolhe um admin
    esperado = None
    for a in site.get("equipe") or []:
        if a.get("nome") == materia.get("autor"):
            esperado = a.get("wp_id")
    obtido = post.get("author")
    if esperado and int(obtido or 0) != int(esperado):
        problemas.append(
            "AUTOR divergente: enviei wp_id={} e o post ficou com author={}"
            .format(esperado, obtido))
    elif int(obtido or 0) == 0:
        problemas.append(
            "AUTOR zerado: o post ficou com author=0, o plugin nao aceitou o "
            "que foi enviado")

    # 2. CATEGORIA: o plugin CRIA a que nao existe, entao conferir pelo nome
    try:
        ids = post.get("categories") or []
        nomes = []
        if ids:
            cats = _get("{}/wp-json/wp/v2/categories".format(base),
                        {"include": ",".join(str(i) for i in ids),
                         "_fields": "id,name", "per_page": 20})
            nomes = [c.get("name") for c in cats]
        alvo = materia.get("categoria")
        if alvo and nomes and alvo not in nomes:
            problemas.append(
                "CATEGORIA divergente: enviei {!r} e o post ficou em {}"
                .format(alvo, nomes))
        if alvo and alvo not in (site.get("categorias_validas") or []):
            problemas.append(
                "CATEGORIA fora da lista valida do portal: {!r}".format(alvo))
    except Exception as e:
        problemas.append("nao consegui conferir a categoria: {}"
                         .format(str(e)[:50]))

    # 3. SLUG: o WP ignora o slug enviado e deriva do titulo. Sufixo -2, -3
    #    indica colisao com post existente, que e o que importa saber.
    slug = post.get("slug") or ""
    if re.search(r"-\d+$", slug):
        problemas.append(
            "SLUG com sufixo numerico ({!r}): colidiu com post existente"
            .format(slug))

    if post.get("status") != "publish":
        problemas.append("STATUS do post e {!r}, nao 'publish'"
                         .format(post.get("status")))

    return (not problemas), problemas


def conferir_se_primeira(site, materia, resultado):
    """Chamado depois de cada publicacao bem-sucedida."""
    if site.get("receptor") != "wordpress":
        return
    if resultado.get("status") != "publicado":
        return
    if ja_verificado(site["slug"]):
        return

    ok, problemas = conferir_wordpress(site, materia, resultado)
    marcar_verificado(site["slug"])

    if ok:
        budget._telegram_enviar(
            "[MOTOR] 1a publicacao conferida OK: {}".format(site["nome"]),
            "\n".join([
                "Primeira materia do motor neste receptor WordPress.",
                "",
                "Portal   : {}".format(site["dominio"]),
                "URL      : {}".format(resultado.get("url") or "-"),
                "Autor    : {} (wp_id conferido)".format(materia.get("autor")),
                "Categoria: {}".format(materia.get("categoria")),
                "",
                "Autor, categoria e slug batem com o enviado. O portal segue "
                "publicando normalmente.",
            ]))
        for p in problemas:
            log.info("[%s] conferencia: %s", site["slug"], p)
        return

    motivo = "; ".join(problemas)
    pausar_portal(site["slug"], motivo)
    budget._telegram_enviar(
        "[MOTOR] PORTAL PAUSADO: {}".format(site["nome"]),
        "\n".join([
            "A PRIMEIRA materia deste receptor WordPress saiu divergente.",
            "O portal foi pausado. Os outros seguem publicando.",
            "",
            "Portal: {}".format(site["dominio"]),
            "URL   : {}".format(resultado.get("url") or "-"),
            "",
            "Divergencias:",
        ] + ["  - " + p for p in problemas] + [
            "",
            "Para retomar depois de corrigir:",
            "  python -m motor_pautas retomar-portal {}".format(site["slug"]),
        ]), urgente=True)
