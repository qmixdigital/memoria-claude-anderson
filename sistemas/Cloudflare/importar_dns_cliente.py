"""
Copia os registros DNS vivos de um dominio de cliente para a zona dele no Cloudflare.

Uso:
  python importar_dns_cliente.py <dominio> [--conta medicosbh] [--dry]

Por que existe: ao criar a zona pela API o scanner do Cloudflare as vezes nao
importa nada (aconteceu com korpem.com.br em 20/09/2026, zona ficou com 0
registros). Sem os registros, a virada de NS derruba site e e-mail.

O que faz:
  1. resolve pelo DNS publico (dns.google) apex, www e subdominios comuns de
     hospedagem compartilhada (mail, cpanel, webmail, ftp, autodiscover, smtp,
     imap, pop) + MX, TXT do apex, DKIM (default/google._domainkey) e _dmarc
  2. cria na zona cada registro que ainda nao existe (idempotente)
  3. apex e www ficam proxied (nuvem laranja); o resto fica DNS-only, porque
     e-mail, FTP e cPanel nao passam pelo proxy
"""
import json, os, sys, requests

SD = os.path.dirname(os.path.abspath(__file__))
CONTAS = {c["nome"]: c for c in json.load(open(os.path.join(SD, "contas.json"), encoding="utf-8"))}
API = "https://api.cloudflare.com/client/v4"
TYPES = {"A": 1, "AAAA": 28, "CNAME": 5, "MX": 15, "TXT": 16}
SUBS_PROXY = ["www"]
SUBS_DNSONLY = ["mail", "cpanel", "webmail", "ftp", "autodiscover", "smtp", "imap", "pop", "whm"]
TXT_HOSTS = ["", "_dmarc", "default._domainkey", "google._domainkey", "mail._domainkey", "k1._domainkey"]


def doh(name, t):
    r = requests.get("https://dns.google/resolve", params={"name": name, "type": t}, timeout=20).json()
    return [a["data"] for a in r.get("Answer", []) if a.get("type") == TYPES[t]]


def coletar(dom):
    recs = []
    for host, proxied in [("@", True)] + [(s, True) for s in SUBS_PROXY] + [(s, False) for s in SUBS_DNSONLY]:
        fqdn = dom if host == "@" else f"{host}.{dom}"
        cn = doh(fqdn, "CNAME")
        if cn and host != "@":
            recs.append({"type": "CNAME", "name": host, "content": cn[0].rstrip("."), "proxied": proxied})
            continue
        for ip in doh(fqdn, "A"):
            recs.append({"type": "A", "name": host, "content": ip, "proxied": proxied})
        for ip in doh(fqdn, "AAAA"):
            recs.append({"type": "AAAA", "name": host, "content": ip, "proxied": proxied})
    for mx in doh(dom, "MX"):
        p, h = mx.split()
        recs.append({"type": "MX", "name": "@", "content": h.rstrip("."), "priority": int(p)})
    for host in TXT_HOSTS:
        fqdn = dom if host == "" else f"{host}.{dom}"
        for t in doh(fqdn, "TXT"):
            txt = t.replace('" "', "").replace('""', "").strip('"')
            recs.append({"type": "TXT", "name": host or "@", "content": txt})
    return recs


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    conta = "medicosbh"
    if "--conta" in sys.argv:
        conta = sys.argv[sys.argv.index("--conta") + 1]
        args = [a for a in args if a != conta]
    if not args:
        print(__doc__); sys.exit(1)
    dry = "--dry" in sys.argv
    c = CONTAS[conta]
    h = {"Authorization": "Bearer " + c["token"], "Content-Type": "application/json"}
    dom = args[0].lower().strip().removeprefix("www.")
    zs = requests.get(f"{API}/zones?name={dom}", headers=h, timeout=30).json()["result"]
    if not zs:
        print(f"{dom}: zona nao existe. Rode onboard_cliente.py antes."); sys.exit(1)
    zid = zs[0]["id"]
    have = requests.get(f"{API}/zones/{zid}/dns_records?per_page=500", headers=h, timeout=30).json()["result"]
    chave = lambda r: (r["type"], r["name"].removesuffix("." + dom) if r["name"] != dom else "@", r["content"])
    existentes = {chave(r) for r in have}
    print(f"{dom}: zona {zid}, {len(have)} registros ja existentes")
    for r in coletar(dom):
        if chave(r) in existentes:
            print("  ja tem", r["type"], r["name"], r["content"][:50]); continue
        r.setdefault("ttl", 1)
        if dry:
            print("  [dry]", r["type"], r["name"], r["content"][:60], r.get("priority", "")); continue
        res = requests.post(f"{API}/zones/{zid}/dns_records", headers=h, json=r, timeout=30).json()
        print("  OK " if res.get("success") else "  ERR", r["type"], r["name"], r["content"][:60],
              r.get("priority", ""), "" if res.get("success") else res.get("errors"))


if __name__ == "__main__":
    main()
