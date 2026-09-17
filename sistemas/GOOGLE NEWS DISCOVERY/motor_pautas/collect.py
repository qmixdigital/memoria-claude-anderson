"""Coleta: feeds RSS do Google News e decodificacao dos links.

Decisao de arquitetura que importa: as queries NAO ficam por portal. Ficam num
pool de ASSUNTOS compartilhado (geral.assuntos no sites.json) e cada portal
assina os assuntos que quiser. Com 150 portais, uma query por portal seria
150x o volume de requisicoes ao Google para colher em grande parte a mesma
noticia. Assim sao ~20 a 40 feeds no total, e o filtro de inclusao/exclusao de
cada portal roda depois, sobre o fato ja formado.

Cadencia: um feed por vez, com jitter, espalhados na janela de coleta. O que
toma 429 nao e o RSS, e a decodificacao do link, por isso ela tem cache
permanente e backoff proprio.
"""
from __future__ import annotations

import datetime as dt
import logging
import random
import re
import time
import urllib.parse as up

import feedparser
import httpx

from . import config, db

log = logging.getLogger("motor.collect")

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0 Safari/537.36")
BASE_RSS = "https://news.google.com/rss/search"
TZ = dt.timezone(dt.timedelta(hours=-3))


def url_feed(query, idioma="pt-BR", pais="BR", ceid="BR:pt-419", quando="2d"):
    q = query if not quando else "{} when:{}".format(query, quando)
    params = {"q": q, "hl": idioma, "gl": pais, "ceid": ceid}
    return BASE_RSS + "?" + up.urlencode(params)


def _gn_id(link):
    """Extrai o id codificado da URL do Google News."""
    m = re.search(r"/(?:rss/)?articles/([A-Za-z0-9_\-]+)", link or "")
    return m.group(1) if m else None


def _dominio(url):
    try:
        h = up.urlparse(url).netloc.lower()
        return h[4:] if h.startswith("www.") else h
    except Exception:
        return None


def assuntos():
    return config.geral().get("assuntos", [])


def coletar_assunto(assunto, http=None):
    """Le um feed e grava as fontes novas. Devolve (novos, vistos)."""
    fechar = http is None
    http = http or httpx.Client(timeout=25, headers={"User-Agent": UA},
                                follow_redirects=True)
    novos = vistos = 0
    try:
        for query in assunto.get("queries", []):
            url = url_feed(query,
                           idioma=assunto.get("idioma", "pt-BR"),
                           pais=assunto.get("pais", "BR"),
                           ceid=assunto.get("ceid", "BR:pt-419"),
                           quando=assunto.get("janela", "2d"))
            try:
                r = http.get(url)
                r.raise_for_status()
            except Exception as e:
                log.warning("feed falhou [%s] %s: %s",
                            assunto["slug"], query, e)
                continue

            fd = feedparser.parse(r.content)
            for ent in fd.entries:
                vistos += 1
                gid = _gn_id(ent.get("link"))
                if not gid:
                    continue
                pub = None
                if ent.get("published_parsed"):
                    pub = dt.datetime(*ent.published_parsed[:6],
                                      tzinfo=dt.timezone.utc)
                veiculo = (ent.get("source", {}) or {}).get("title")
                titulo = re.sub(r"\s+-\s+[^-]+$", "",
                                ent.get("title", "")).strip()
                r2 = db.inserir_devolvendo(
                    "INSERT INTO artigos_fonte (gn_id, url_google, titulo, "
                    "publicado_em, query_origem, idioma, veiculo, estado) "
                    "VALUES (%s,%s,%s,%s,%s,%s,%s,'coletado') "
                    "ON CONFLICT (gn_id) DO NOTHING RETURNING id",
                    (gid, ent.get("link"), titulo or ent.get("title", ""),
                     pub, assunto["slug"],
                     assunto.get("idioma", "pt-BR"), veiculo),
                )
                if r2:
                    novos += 1

            # jitter entre queries: nunca rajada
            time.sleep(random.uniform(3.0, 8.0))
    finally:
        if fechar:
            http.close()
    return novos, vistos


def coletar_tudo():
    """Percorre todos os assuntos, espalhando as requisicoes."""
    total_n = total_v = 0
    with httpx.Client(timeout=25, headers={"User-Agent": UA},
                      follow_redirects=True) as http:
        lista = list(assuntos())
        random.shuffle(lista)  # nao bater sempre na mesma ordem
        for a in lista:
            n, v = coletar_assunto(a, http)
            total_n += n
            total_v += v
            log.info("assunto %s: %d novos de %d vistos", a["slug"], n, v)
    return total_n, total_v


# ---------------------------------------------------------------- decodificar

def _decode_lib(gn_id, url_google):
    """Decodifica via googlenewsdecoder. Devolve URL final ou None."""
    try:
        from googlenewsdecoder import gnewsdecoder
    except ImportError:
        log.error("googlenewsdecoder nao instalado")
        return None
    try:
        res = gnewsdecoder(url_google, interval=1)
        if isinstance(res, dict) and res.get("status"):
            return res.get("decoded_url")
        log.debug("decode sem sucesso para %s: %s", gn_id, res)
    except Exception as e:
        log.debug("decode levantou para %s: %s", gn_id, e)
    return None


def decodificar_pendentes(limite=120):
    """Resolve a URL real das fontes ainda sem url_final.

    Cache permanente por gn_id: um id so e decodificado uma vez na vida.
    Backoff crescente por tentativa, porque e esta etapa que toma 429.
    """
    linhas = db.q(
        "SELECT a.id, a.gn_id, a.url_google FROM artigos_fonte a "
        "LEFT JOIN cache_decode c ON c.gn_id = a.gn_id "
        "WHERE a.url_final IS NULL AND a.estado = 'coletado' "
        "AND (c.gn_id IS NULL OR (c.falhou AND c.tentativas < 3)) "
        "ORDER BY a.coletado_em DESC LIMIT %s", (limite,)) or []

    ok = falhou = 0
    for l in linhas:
        cache = db.q("SELECT url_final, falhou, tentativas FROM cache_decode "
                     "WHERE gn_id=%s", (l["gn_id"],), um=True)
        url = cache["url_final"] if (cache and cache["url_final"]) else None

        if not url:
            url = _decode_lib(l["gn_id"], l["url_google"])
            db.exec1(
                "INSERT INTO cache_decode (gn_id, url_final, falhou, tentativas) "
                "VALUES (%s,%s,%s,1) ON CONFLICT (gn_id) DO UPDATE SET "
                "url_final = COALESCE(EXCLUDED.url_final, cache_decode.url_final), "
                "falhou = EXCLUDED.falhou, "
                "tentativas = cache_decode.tentativas + 1",
                (l["gn_id"], url, url is None))
            # backoff: mais lento quando esta falhando
            time.sleep(random.uniform(1.5, 3.0) if url
                       else random.uniform(8.0, 15.0))

        if url:
            db.exec1(
                "UPDATE artigos_fonte SET url_final=%s, dominio=%s, "
                "estado='decodificado' WHERE id=%s",
                (url, _dominio(url), l["id"]))
            ok += 1
        else:
            falhou += 1
            if cache and cache["tentativas"] >= 2:
                db.exec1("UPDATE artigos_fonte SET estado='descartado', "
                         "descarte_motivo='decode falhou 3x' WHERE id=%s",
                         (l["id"],))
    log.info("decodificacao: %d ok, %d falharam", ok, falhou)
    return ok, falhou


def limpar_antigos(dias=30):
    """Poda fontes velhas que nunca viraram fato. O cache de decode fica."""
    n = db.exec1(
        "DELETE FROM artigos_fonte WHERE fato_id IS NULL "
        "AND coletado_em < now() - (%s || ' days')::interval", (str(dias),))
    if n:
        log.info("poda: %d fontes antigas removidas", n)
    return n
