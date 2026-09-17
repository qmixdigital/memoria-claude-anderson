"""
Remove TODA friccao de usuario das zonas de uma conta (sem desafios):
  - Security Level -> essentially_off
  - Browser Integrity Check -> off
  - Deleta qualquer WAF custom rule com acao de desafio (managed_challenge/challenge/js_challenge)

Mantem intactas: SSL/HSTS/DNSSEC, blocks (.env/.git, AI bots, sem-UA, threat>30),
rate limit e leaked-cred detection.

Uso: python suavizar_conta.py conta3
"""
import json, sys, os, requests
from concurrent.futures import ThreadPoolExecutor, as_completed

SD = os.path.dirname(os.path.abspath(__file__))
CONTAS = {c["nome"]: c for c in json.load(open(os.path.join(SD, "contas.json")))}
API = "https://api.cloudflare.com/client/v4"
CHALLENGE_ACTIONS = {"managed_challenge", "challenge", "js_challenge"}


def zonas_da_conta(c):
    h = {"Authorization": f"Bearer {c['token']}"}
    out, page = [], 1
    while True:
        r = requests.get(f"{API}/zones?account.id={c['account_id']}&per_page=50&page={page}", headers=h).json()
        if not r.get("success"):
            break
        out += [(z["name"], z["id"]) for z in r["result"]]
        if page >= r.get("result_info", {}).get("total_pages", 1):
            break
        page += 1
    return sorted(out)


def suavizar(token, zname, zid):
    h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    BASE = f"{API}/zones/{zid}"
    out = []
    out.append("seclvl=" + ("OK" if requests.patch(f"{BASE}/settings/security_level", headers=h, json={"value": "essentially_off"}).json().get("success") else "X"))
    out.append("BIC=" + ("off" if requests.patch(f"{BASE}/settings/browser_check", headers=h, json={"value": "off"}).json().get("success") else "X"))

    removed = 0
    rs = requests.get(f"{BASE}/rulesets", headers=h).json().get("result", [])
    waf = next((x["id"] for x in rs if x.get("phase") == "http_request_firewall_custom"), None)
    if waf:
        rules = requests.get(f"{BASE}/rulesets/{waf}", headers=h).json()["result"].get("rules", [])
        for rule in rules:
            if rule.get("action") in CHALLENGE_ACTIONS:
                r = requests.delete(f"{BASE}/rulesets/{waf}/rules/{rule['id']}", headers=h)
                if r.json().get("success"):
                    removed += 1
    out.append(f"challenge_removidas={removed}")
    return zname, " | ".join(out)


def main():
    conta = sys.argv[1] if len(sys.argv) > 1 else None
    if conta not in CONTAS:
        print(f"Uso: python suavizar_conta.py <conta>  (disponiveis: {', '.join(CONTAS)})"); sys.exit(1)
    c = CONTAS[conta]
    zonas = zonas_da_conta(c)
    print(f"Suavizando {len(zonas)} zonas da '{conta}'...\n")
    tot_rm = 0
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(suavizar, c["token"], n, i) for n, i in zonas]
        done = 0
        for fut in as_completed(futs):
            n, status = fut.result()
            done += 1
            tot_rm += int(status.split("challenge_removidas=")[1])
            print(f"[{done:3d}/{len(zonas)}] {n:42s} {status}")
    print(f"\nRESUMO: {len(zonas)} zonas suavizadas | {tot_rm} regras de desafio removidas")


if __name__ == "__main__":
    main()
