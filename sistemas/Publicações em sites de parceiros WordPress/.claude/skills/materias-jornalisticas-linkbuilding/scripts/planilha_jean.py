#!/usr/bin/env python3
"""
Planilha de pedidos do Jean (parceiro que publica nos portais dele).

    python planilha_jean.py preco  <dominio>            -> imprime o preco da aba DOMINIOS
    python planilha_jean.py enviar <dominio> "<titulo>" <link> [--apostas] [--aba "Pedidos Fevereiro"]
    python planilha_jean.py ultimas [N]                  -> ultimas N linhas da aba de pedidos

Formato da linha na aba de pedidos: valor | PAUTA (titulo) | TEXTO (link da materia) | SITE (dominio).
A coluna "Link Publicado" fica vazia: o Jean preenche quando publica.
O valor vem da aba DOMINIOS (coluna NORMAL; --apostas usa a coluna APOSTAS, para site de aposta).
Credencial: conta de servico seoqmix (Sheets API ativada e planilha compartilhada em 14/09/2026).
"""
import sys
import argparse
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

SA = r"C:\Users\User\Documents\APIs\seoqmix-024e9465e9d9.json"
ID = "<<REMOVIDO>>"
ABA_PEDIDOS = "Pedidos Fevereiro"  # a aba em uso continua com esse nome mesmo fora de fevereiro
ABA_PRECOS = "DOMÍNIOS"
API = f"https://sheets.googleapis.com/v4/spreadsheets/{ID}"

sys.stdout.reconfigure(encoding="utf-8")


def sessao():
    creds = service_account.Credentials.from_service_account_file(SA, scopes=["https://www.googleapis.com/auth/spreadsheets"])
    return AuthorizedSession(creds)


def valores(s, rng):
    r = s.get(f"{API}/values/{rng}")
    r.raise_for_status()
    return r.json().get("values", [])


def normaliza(d):
    return d.strip().lower().replace("https://", "").replace("http://", "").replace("www.", "").rstrip("/")


def preco(s, dominio, apostas=False):
    alvo = normaliza(dominio)
    for row in valores(s, f"'{ABA_PRECOS}'!A2:C1100"):
        if row and normaliza(row[0]) == alvo:
            col = 2 if apostas else 1
            if len(row) > col and row[col].strip():
                return row[col].strip().replace(",00", "").replace(".", "").replace(",", ".")
            return None
    return None


def enviar(s, dominio, titulo, link, apostas=False, aba=ABA_PEDIDOS):
    p = preco(s, dominio, apostas)
    if p is None:
        print(f"AVISO: {dominio} não está na aba {ABA_PRECOS} (ou sem preço na coluna); gravando valor em branco")
        p = ""
    linha = [p, titulo, link, normaliza(dominio)]
    r = s.post(f"{API}/values/'{aba}'!A:E:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS", json={"values": [linha]})
    r.raise_for_status()
    print("gravado em", r.json().get("updates", {}).get("updatedRange"), "->", linha)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("preco"); a.add_argument("dominio"); a.add_argument("--apostas", action="store_true")
    b = sub.add_parser("enviar"); b.add_argument("dominio"); b.add_argument("titulo"); b.add_argument("link")
    b.add_argument("--apostas", action="store_true"); b.add_argument("--aba", default=ABA_PEDIDOS)
    c = sub.add_parser("ultimas"); c.add_argument("n", type=int, nargs="?", default=5); c.add_argument("--aba", default=ABA_PEDIDOS)
    args = ap.parse_args()
    s = sessao()
    if args.cmd == "preco":
        print(preco(s, args.dominio, args.apostas))
    elif args.cmd == "enviar":
        enviar(s, args.dominio, args.titulo, args.link, args.apostas, args.aba)
    else:
        rows = valores(s, f"'{args.aba}'!A1:E1100")
        for i, row in enumerate(rows[-args.n:], len(rows) - args.n + 1):
            print(i, row)


if __name__ == "__main__":
    main()
