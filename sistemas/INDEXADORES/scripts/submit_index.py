#!/usr/bin/env python3
"""Envia URLs para indexacao no Rapid URL Indexer.

Uso:
    python submit_index.py <arquivo_de_urls> "Nome do Projeto" [--apex]
"""
import argparse
import json
import os
import sys

import requests

API_KEY = "<<REMOVIDO>>"
BASE_URL = "https://rapidurlindexer.com/wp-json/api/v1"
# o LiteSpeed do site devolve 403 para o User-Agent padrao do requests/curl
HEADERS = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
}


def saldo():
    r = requests.get(BASE_URL + "/credits/balance", headers=HEADERS, timeout=60)
    return r.json().get("credits")


def enviar(nome, urls, apex=False):
    payload = {
        "project_name": nome,
        "urls": urls,
        "notify_on_status_change": False,
        "apex_mode_enabled": apex,
    }
    r = requests.post(BASE_URL + "/projects", headers=HEADERS, json=payload, timeout=120)
    return r.status_code, r.json()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("arquivo")
    ap.add_argument("nome")
    ap.add_argument("--apex", action="store_true", help="Apex Mode: 3 creditos/URL, crawl em ~5 min")
    args = ap.parse_args()

    with open(args.arquivo, encoding="utf-8") as fh:
        urls = [l.strip() for l in fh if l.strip().startswith("http")]

    custo = len(urls) * (3 if args.apex else 1)
    antes = saldo()
    print(f"URLs: {len(urls)} | custo: {custo} creditos | saldo antes: {antes}")
    if antes is not None and custo > antes:
        sys.exit("Creditos insuficientes.")

    status, resp = enviar(args.nome, urls, args.apex)
    print(f"HTTP {status}: {json.dumps(resp, ensure_ascii=False)}")
    print(f"Saldo depois: {saldo()}")


if __name__ == "__main__":
    main()
