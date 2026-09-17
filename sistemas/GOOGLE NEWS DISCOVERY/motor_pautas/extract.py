"""Extracao do texto limpo das materias.

Trafilatura como principal, readability-lxml como rede de seguranca para
pagina dificil. O risco desta etapa nao e o Google, sao os veiculos: por isso
uma requisicao por dominio a cada 5-10 s, concorrencia global baixa e
robots.txt respeitado.

O texto extraido serve so de INSUMO para a sintese. Nunca e reproduzido.
"""
from __future__ import annotations

import datetime as dt
import logging
import random
import re
import threading
import time
import urllib.parse as up
import urllib.robotparser as rp
from concurrent.futures import ThreadPoolExecutor

import httpx

from . import db

log = logging.getLogger("motor.extract")

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0 Safari/537.36")
MIN_PALAVRAS = 180
CONCORRENCIA = 3
ESPACO_POR_DOMINIO = (5.0, 10.0)

_ultimo_acesso = {}
_trava = threading.Lock()
_robots = {}
_robots_trava = threading.Lock()


def _esperar_dominio(dominio):
    """Garante o espacamento minimo entre dois acessos ao mesmo dominio."""
    while True:
        with _trava:
            agora = time.monotonic()
            ultimo = _ultimo_acesso.get(dominio, 0.0)
            espera = random.uniform(*ESPACO_POR_DOMINIO)
            if agora - ultimo >= espera:
                _ultimo_acesso[dominio] = agora
                return
            falta = espera - (agora - ultimo)
        time.sleep(min(falta, 10.0))


def _pode_buscar(url):
    """robots.txt, com cache por dominio. Na duvida, permite."""
    try:
        p = up.urlparse(url)
        base = "{}://{}".format(p.scheme, p.netloc)
        with _robots_trava:
            r = _robots.get(base)
        if r is None:
            r = rp.RobotFileParser()
            r.set_url(base + "/robots.txt")
            try:
                r.read()
            except Exception:
                r = False  # sem robots acessivel: nao bloqueia
            with _robots_trava:
                _robots[base] = r
        if r is False:
            return True
        return r.can_fetch(UA, url)
    except Exception:
        return True


def _limpar(texto):
    texto = re.sub(r"\n{3,}", "\n\n", texto or "")
    return texto.strip()


def _trafilatura(html, url):
    try:
        import trafilatura
        t = trafilatura.extract(
            html, url=url, include_comments=False, include_tables=True,
            favor_precision=True, target_language=None, no_fallback=False)
        if t and len(t.split()) >= MIN_PALAVRAS:
            return _limpar(t), "trafilatura"
    except Exception as e:
        log.debug("trafilatura falhou em %s: %s", url, e)
    return None, None


def _readability(html, url):
    try:
        from readability import Document
        from bs4 import BeautifulSoup
        doc = Document(html)
        sopa = BeautifulSoup(doc.summary(), "lxml")
        t = sopa.get_text("\n")
        if t and len(t.split()) >= MIN_PALAVRAS:
            return _limpar(t), "readability"
    except Exception as e:
        log.debug("readability falhou em %s: %s", url, e)
    return None, None


def extrair_url(url, http=None):
    """Baixa e extrai. Devolve (texto, metodo, erro)."""
    dominio = up.urlparse(url).netloc.lower()
    if not _pode_buscar(url):
        return None, None, "robots.txt proibe"

    _esperar_dominio(dominio)
    fechar = http is None
    http = http or httpx.Client(timeout=15, headers={"User-Agent": UA},
                                follow_redirects=True)
    try:
        try:
            r = http.get(url)
        except Exception:
            time.sleep(3)
            try:
                r = http.get(url)  # uma tentativa extra, so uma
            except Exception as e:
                return None, None, "rede: {}".format(e)

        if r.status_code >= 400:
            return None, None, "http {}".format(r.status_code)
        html = r.text

        texto, metodo = _trafilatura(html, url)
        if not texto:
            texto, metodo = _readability(html, url)
        if not texto:
            return None, None, "sem texto util (menos de {} palavras)".format(
                MIN_PALAVRAS)
        return texto, metodo, None
    finally:
        if fechar:
            http.close()


def _processar(linha):
    texto, metodo, erro = extrair_url(linha["url_final"])
    if texto:
        db.exec1(
            "UPDATE artigos_fonte SET texto=%s, n_palavras=%s, "
            "extraido_em=now(), extracao_metodo=%s, extracao_erro=NULL, "
            "estado='extraido' WHERE id=%s",
            (texto, len(texto.split()), metodo, linha["id"]))
        return True
    db.exec1(
        "UPDATE artigos_fonte SET extracao_erro=%s, extraido_em=now(), "
        "estado='descartado', descarte_motivo='extracao' WHERE id=%s",
        (erro, linha["id"]))
    return False


def extrair_pendentes(limite=150):
    """Extrai o texto das fontes ja decodificadas."""
    linhas = db.q(
        "SELECT id, url_final FROM artigos_fonte "
        "WHERE estado='decodificado' AND url_final IS NOT NULL "
        "ORDER BY coletado_em DESC LIMIT %s", (limite,)) or []
    if not linhas:
        return 0, 0

    ok = 0
    with ThreadPoolExecutor(max_workers=CONCORRENCIA) as ex:
        for sucesso in ex.map(_processar, linhas):
            ok += 1 if sucesso else 0
    log.info("extracao: %d ok, %d falharam", ok, len(linhas) - ok)
    return ok, len(linhas) - ok
