#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera/renova endereco de deposito BTC na CoinEx e lista formatos disponiveis."""
import hmac, hashlib, json, time, requests

BASE = "https://api.coinex.com"
ACCESS_ID = "<<REMOVIDO>>"
SECRET_KEY = "<<REMOVIDO>>"


def sign(method, path, body, ts):
    prepared = f"{method}{path}{body}{ts}"
    return hmac.new(SECRET_KEY.encode("latin-1"), prepared.encode("latin-1"), hashlib.sha256).hexdigest().lower()


def req(method, path, params=None, body_obj=None):
    ts = str(int(time.time() * 1000))
    query = "?" + "&".join(f"{k}={v}" for k, v in params.items()) if params else ""
    full_path = path + query
    body = json.dumps(body_obj) if body_obj is not None else ""
    headers = {
        "X-COINEX-KEY": ACCESS_ID,
        "X-COINEX-SIGN": sign(method, full_path, body, ts),
        "X-COINEX-TIMESTAMP": ts,
        "Content-Type": "application/json",
    }
    url = BASE + full_path
    r = requests.get(url, headers=headers, timeout=20) if method == "GET" else requests.post(url, headers=headers, data=body, timeout=20)
    try:
        return r.status_code, r.json()
    except Exception:
        return r.status_code, r.text


def show(t, s, d):
    print("=" * 60); print(t, f"(HTTP {s})"); print("-" * 60)
    print(json.dumps(d, indent=2, ensure_ascii=False)); print()

# 0. Configuracao de deposito da BTC (mostra chains e formatos suportados)
s, d = req("GET", "/v2/assets/deposit-withdraw-config", params={"ccy": "BTC"})
show("CONFIG DE DEPOSITO/SAQUE BTC", s, d)

# 1. Renovar / gerar novo endereco de deposito BTC
s, d = req("POST", "/v2/assets/renewal-deposit-address", body_obj={"ccy": "BTC", "chain": "BTC"})
show("NOVO ENDERECO BTC (renewal)", s, d)

# 2. Conferir o endereco atual depois da renovacao
s, d = req("GET", "/v2/assets/deposit-address", params={"ccy": "BTC", "chain": "BTC"})
show("ENDERECO BTC ATUAL", s, d)
