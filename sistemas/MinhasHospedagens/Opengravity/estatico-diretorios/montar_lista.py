#!/usr/bin/env python3
"""Cruza o sitemap com o Search Console e gera a lista final de URLs a congelar.

Regra:
  - fica TODA pagina "estrutural": home, artigos, noticias, categorias, autores,
    cidades, segmentos, marcas, paginas institucionais
  - pagina "podavel" (casa com <regex_podavel>: fichas, hubs de cidade, paginas
    locais geradas) so fica se teve impressao no Google nos ultimos 16 meses
  - nunca entra: painel, admin, login, cadastro, reivindicar, precos, newsletter,
    busca, esqueci/reset de senha, contato (todos dependem de servidor)

Uso: python montar_lista.py todas.txt gsc.txt <regex_podavel> > congelar.txt
  (regexes por site no RUNBOOK; '^$' = nao poda nada)
"""
import re, sys, urllib.parse

NUNCA = re.compile(r"^/(painel|admin|admin-diretorio|painel-diretorio|login|cadastrar|cadastro-livraria|"
                   r"precos|newsletter|busca|esqueci-senha|reset-senha|contato|remocao-diretorio|wp-content|wp-json|wp-includes|page)(/|$)"
                   r"|/reivindicar/?$|/busca/?$|/filtro(/|$)")

def path(u):
    p = urllib.parse.urlparse(u.strip()).path or "/"
    return p if p.endswith("/") or "." in p.rsplit("/", 1)[-1] else p + "/"

def main(todas, gsc, regex_ficha):
    ficha = re.compile(regex_ficha)
    com_impressao = set()
    for l in open(gsc, encoding="utf-8"):
        if l.strip() and not l.startswith("#"):
            com_impressao.add(path(l.split("\t")[0]))
    fica, fichas_total, fichas_fica = [], 0, 0
    for u in dict.fromkeys(x.strip() for x in open(todas, encoding="utf-8") if x.strip()):
        p = path(u)
        if NUNCA.search(p):
            continue
        if ficha.search(p):
            fichas_total += 1
            if p not in com_impressao:
                continue
            fichas_fica += 1
        fica.append(p)
    # paginas com impressao que nao estao no sitemap (ex.: paginacao, hubs antigos)
    for p in sorted(com_impressao - set(fica)):
        if not NUNCA.search(p) and not p.startswith("/_next"):
            fica.append(p)
    for p in fica:
        print(p)
    print(f"# {len(fica)} paginas | podaveis: {fichas_fica} de {fichas_total} ficam", file=sys.stderr)

if __name__ == "__main__":
    main(*sys.argv[1:4])
