#!/usr/bin/env python3
"""Valida a credencial e a configuracao de um portal contra o receptor real.

Roda ANTES de o portal entrar na rampa. Com 150 portais, credencial errada
descoberta na hora da publicacao custa caro: o receptor devolve 401 e a materia
ja foi gerada e paga.

  python scripts/validar_portal.py                 valida todos os ativos
  python scripts/validar_portal.py slug1 slug2     valida so esses
  python scripts/validar_portal.py --profundo slug tambem testa a categoria

A sonda de credencial e NAO DESTRUTIVA. Ela manda um corpo vazio: o receptor
confere a X-API-KEY antes de olhar o conteudo, entao

  401  -> chave errada ou ausente
  400  "title e content obrigatorios" -> chave BOA, receptor e o Portal Engine
  400  outra mensagem                 -> chave boa, receptor e o plugin do WP

Nada e criado no portal.

O --profundo publica um artigo de teste SEM imagem. Como o receptor grava sem
imagem como rascunho, ele nao vai ao ar, mas deixa um JSON em
/srv/portais/<slug>/data/. O script avisa e imprime o caminho para apagar.
A categoria aceita volta na resposta, que e a unica forma de conferir o
categoryMap de fora da maquina.
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx  # noqa: E402

from motor_pautas import config  # noqa: E402

OK, AVISO, ERRO = "  ok  ", " aviso", " ERRO "


def sonda_credencial(endpoint, chave):
    try:
        r = httpx.post(endpoint, timeout=30,
                       headers={"Content-Type": "application/json",
                                "X-API-KEY": chave},
                       json={})
    except Exception as e:
        return ERRO, "rede: {}".format(e), None

    try:
        corpo = r.json()
    except Exception:
        corpo = {"bruto": r.text[:200]}
    msg = str(corpo.get("message") or corpo.get("bruto") or "")

    if r.status_code == 401:
        return ERRO, "401: chave recusada ({})".format(msg[:60]), corpo
    if r.status_code == 400:
        motor = ("Portal Engine" if "obrigatorio" in msg.lower()
                 or "obrigatório" in msg.lower() else "WordPress")
        return OK, "chave aceita, receptor: {}".format(motor), corpo
    if r.status_code == 404:
        return ERRO, "404: rota nao existe, confira o namespace", corpo
    return AVISO, "http {}: {}".format(r.status_code, msg[:80]), corpo


def sonda_categoria(endpoint, chave, categoria, slug_site):
    """Publica um rascunho de teste para descobrir a categoria efetiva."""
    marca = "mp-validacao-{}".format(int(time.time()))
    corpo = {
        "title": "Validacao de integracao {}".format(marca),
        "slug": marca,
        "content": "<p>Artigo de validacao do motor de pautas. "
                   "Pode ser apagado.</p>",
        "excerpt": "Validacao de integracao.",
        "categories": [categoria],
        "status": "draft",
    }
    try:
        r = httpx.post(endpoint, timeout=60,
                       headers={"Content-Type": "application/json",
                                "X-API-KEY": chave},
                       json=corpo)
        d = r.json()
    except Exception as e:
        return ERRO, "rede: {}".format(e)

    if r.status_code >= 400:
        return ERRO, "http {}: {}".format(r.status_code,
                                          str(d)[:120])
    if str(d.get("status", "")).lower() == "skipped":
        return AVISO, "slug de teste pulado pela guarda de exclusividade"
    url = d.get("url") or d.get("link") or ""
    dica = ("/srv/portais/{}/data/{}.json".format(slug_site, marca))
    return OK, "aceito, url {} | APAGAR: {}".format(url or "(rascunho)", dica)


def validar(site, profundo=False):
    slug = site["slug"]
    cred = config.credencial(slug)
    linhas = []

    if not cred:
        return [(ERRO, slug, "sem entrada em credenciais.json")]
    for campo in ("endpoint", "api_key"):
        if not cred.get(campo):
            return [(ERRO, slug, "credencial sem campo {}".format(campo))]

    if not cred["endpoint"].startswith("https://"):
        linhas.append((ERRO, slug, "endpoint nao e https"))
    if not cred["endpoint"].rstrip("/").endswith("/artigos"):
        linhas.append((AVISO, slug, "endpoint nao termina em /artigos"))
    if len(cred["api_key"]) != 64:
        linhas.append((AVISO, slug,
                       "chave com {} caracteres (o padrao da rede e 64)"
                       .format(len(cred["api_key"]))))

    st, msg, _ = sonda_credencial(cred["endpoint"], cred["api_key"])
    linhas.append((st, slug, msg))

    # conferencias de configuracao que nao dependem da rede
    if not site.get("categorias_validas"):
        linhas.append((ERRO, slug, "categorias_validas vazio: o motor criaria "
                                   "categoria nova e sujaria o menu"))
    if not site.get("instancia"):
        linhas.append((AVISO, slug, "sem instancia: o throttle de publicacao "
                                    "vai tratar como maquina propria"))
    if not site.get("perfil_redacao", {}).get("voz"):
        linhas.append((ERRO, slug, "perfil_redacao.voz ausente"))
    if not site.get("equipe"):
        linhas.append((ERRO, slug, "sem equipe: a materia sairia sem "
                                   "rel=author e quebraria a auditoria"))
    if not site.get("assuntos"):
        linhas.append((AVISO, slug, "sem assuntos: o portal aceita qualquer "
                                    "fato do pool"))

    if profundo and st == OK:
        cat = (site.get("categoria_padrao")
               or (site.get("categorias_validas") or ["Notícias"])[0])
        st2, msg2 = sonda_categoria(cred["endpoint"], cred["api_key"], cat,
                                    slug)
        linhas.append((st2, slug, "categoria {!r}: {}".format(cat, msg2)))
    return linhas


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    profundo = "--profundo" in sys.argv
    # portal com ativo=false ainda nao entrou na rampa, mas precisa ser
    # validavel: a conferencia acontece ANTES de virar ativo, nunca depois.

    if "--incluir-inativos" in sys.argv:
        d = config._carregar(config.CAM_SITES, "sites")
        sites = d.get("sites", d) if isinstance(d, dict) else d
    else:
        sites = config.sites()
    if args:
        sites = [s for s in sites if s["slug"] in args]
    if not sites:
        print("nenhum portal encontrado")
        return 1

    total_erros = 0
    for s in sites:
        for st, slug, msg in validar(s, profundo):
            print("[{}] {:<24} {}".format(st, slug, msg))
            total_erros += 1 if st == ERRO else 0
        if profundo:
            time.sleep(2)

    print("\n{} portais verificados, {} problemas bloqueantes".format(
        len(sites), total_erros))
    return 1 if total_erros else 0


if __name__ == "__main__":
    sys.exit(main())
