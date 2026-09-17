#!/usr/bin/env python3
"""Verifica quais URLs estao indexadas no Google usando a SerpApi.

Uso:
    python check_index.py <arquivo_de_urls> [--workers 5] [--limit N]

Faz uma busca `site:URL` por link. Resultado fica em cache JSON, entao
rodar de novo NAO gasta credito com URLs ja verificadas.
"""
import argparse
import json
import os
import sys
import threading
from concurrent.futures import ThreadPoolExecutor

import requests

API_KEY = "<<REMOVIDO>>"
ENDPOINT = "https://serpapi.com/search.json"
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULTS_DIR = os.path.join(BASE, "resultados")

lock = threading.Lock()


def normalize(url):
    u = url.strip().lower()
    for prefix in ("https://", "http://"):
        if u.startswith(prefix):
            u = u[len(prefix):]
    if u.startswith("www."):
        u = u[4:]
    return u.rstrip("/")


def check(url):
    """Retorna dict com status: indexado | nao_indexado | outra_pagina | erro."""
    params = {
        "engine": "google",
        "q": "site:" + normalize(url),
        "google_domain": "google.com.br",
        "gl": "br",
        "hl": "pt-br",
        "num": 10,
        "api_key": API_KEY,
    }
    try:
        r = requests.get(ENDPOINT, params=params, timeout=60)
        data = r.json()
    except Exception as exc:
        return {"url": url, "status": "erro", "detalhe": str(exc)}

    if r.status_code != 200 and "organic_results" not in data:
        return {"url": url, "status": "erro", "detalhe": data.get("error", r.status_code)}

    resultados = data.get("organic_results") or []
    links = [item.get("link", "") for item in resultados]
    alvo = normalize(url)
    if any(normalize(link) == alvo for link in links):
        return {"url": url, "status": "indexado", "posicao": 1}
    if links:
        return {"url": url, "status": "outra_pagina", "encontrados": links[:3]}
    return {"url": url, "status": "nao_indexado", "detalhe": data.get("error", "")}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("arquivo")
    ap.add_argument("--workers", type=int, default=5)
    ap.add_argument("--limit", type=int, default=0, help="verifica no maximo N URLs novas")
    args = ap.parse_args()

    with open(args.arquivo, encoding="utf-8") as fh:
        urls = [l.strip() for l in fh if l.strip()]

    os.makedirs(RESULTS_DIR, exist_ok=True)
    nome = os.path.splitext(os.path.basename(args.arquivo))[0]
    cache_path = os.path.join(RESULTS_DIR, nome + ".json")

    cache = {}
    if os.path.exists(cache_path):
        with open(cache_path, encoding="utf-8") as fh:
            cache = json.load(fh)

    # so refaz o que ainda nao foi verificado com sucesso
    pendentes = [u for u in urls if cache.get(u, {}).get("status") in (None, "erro")]
    if args.limit:
        pendentes = pendentes[: args.limit]

    print(f"total={len(urls)} em_cache={len(urls) - len([u for u in urls if u not in cache])} pendentes={len(pendentes)}", flush=True)

    feitos = 0

    def worker(u):
        nonlocal feitos
        res = check(u)
        with lock:
            cache[u] = res
            feitos += 1
            if feitos % 20 == 0 or feitos == len(pendentes):
                with open(cache_path, "w", encoding="utf-8") as fh:
                    json.dump(cache, fh, ensure_ascii=False, indent=1)
                print(f"  {feitos}/{len(pendentes)} verificadas", flush=True)
        return res

    if pendentes:
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            list(pool.map(worker, pendentes))

    with open(cache_path, "w", encoding="utf-8") as fh:
        json.dump(cache, fh, ensure_ascii=False, indent=1)

    # relatorio
    grupos = {}
    for u in urls:
        st = cache.get(u, {}).get("status", "nao_verificado")
        grupos.setdefault(st, []).append(u)

    print("\n=== RESUMO ===")
    for st in sorted(grupos):
        print(f"{st}: {len(grupos[st])}")

    nao_ok = grupos.get("nao_indexado", []) + grupos.get("outra_pagina", [])
    saida = os.path.join(RESULTS_DIR, nome + "-nao-indexadas.txt")
    with open(saida, "w", encoding="utf-8") as fh:
        fh.write("\n".join(nao_ok) + ("\n" if nao_ok else ""))
    print(f"\nNao indexadas gravadas em: {saida}")


if __name__ == "__main__":
    main()
