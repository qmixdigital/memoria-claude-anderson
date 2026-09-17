#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Relatorio completo da conta CoinEx via API v2.
Le as credenciais de API.txt e consulta saldo + endereco de deposito de BTC.
"""
import hmac
import hashlib
import json
import time
import requests

BASE = "https://api.coinex.com"

ACCESS_ID = "<<REMOVIDO>>"
SECRET_KEY = "<<REMOVIDO>>"


def sign(method, path, body, ts):
    prepared = f"{method}{path}{body}{ts}"
    return hmac.new(
        SECRET_KEY.encode("latin-1"),
        prepared.encode("latin-1"),
        hashlib.sha256,
    ).hexdigest().lower()


def req(method, path, params=None, body_obj=None):
    ts = str(int(time.time() * 1000))
    query = ""
    if params:
        query = "?" + "&".join(f"{k}={v}" for k, v in params.items())
    full_path = path + query
    body = ""
    if body_obj is not None:
        body = json.dumps(body_obj)
    signature = sign(method, full_path, body, ts)
    headers = {
        "X-COINEX-KEY": ACCESS_ID,
        "X-COINEX-SIGN": signature,
        "X-COINEX-TIMESTAMP": ts,
        "Content-Type": "application/json",
    }
    url = BASE + full_path
    if method == "GET":
        r = requests.get(url, headers=headers, timeout=20)
    else:
        r = requests.post(url, headers=headers, data=body, timeout=20)
    try:
        return r.status_code, r.json()
    except Exception:
        return r.status_code, r.text


def show(title, status, data):
    print("=" * 60)
    print(title, f"(HTTP {status})")
    print("-" * 60)
    print(json.dumps(data, indent=2, ensure_ascii=False))
    print()


# 1. Saldo spot
s, d = req("GET", "/v2/assets/spot/balance")
show("SALDO SPOT", s, d)

# 2. Saldo futures (se houver)
s, d = req("GET", "/v2/assets/futures/balance")
show("SALDO FUTURES", s, d)

# 3. Endereco de deposito de BTC (varios chains possiveis)
for chain in ["BTC", "BSC", "TRC20", "ERC20"]:
    s, d = req("GET", "/v2/assets/deposit-address", params={"ccy": "BTC", "chain": chain})
    show(f"ENDERECO DE DEPOSITO BTC - chain {chain}", s, d)
