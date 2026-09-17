"""
Aplica o pacote de hardening + Leaked Credentials Detection em TODAS as zonas
de uma conta Cloudflare (pelo nome local em contas.json).

Uso:
  python harden_conta.py conta3            # endurece todas as zonas da conta3
  python harden_conta.py conta3 --dry      # so lista as zonas, nao aplica

Idempotente: checa descricao das WAF rules antes de criar.
"""
import json, sys, os, requests
from concurrent.futures import ThreadPoolExecutor, as_completed

SD = os.path.dirname(os.path.abspath(__file__))
CONTAS = {c["nome"]: c for c in json.load(open(os.path.join(SD, "contas.json")))}
AI_EXPR = open(os.path.join(SD, "ai_bots_expression.txt"), encoding="utf-8").read().strip()
API = "https://api.cloudflare.com/client/v4"

SETTINGS = [
    ("ssl", "strict"), ("min_tls_version", "1.2"), ("always_use_https", "on"),
    ("security_level", "high"), ("0rtt", "on"), ("early_hints", "on"),
    ("always_online", "on"), ("tls_1_3", "on"), ("opportunistic_encryption", "on"),
    ("automatic_https_rewrites", "on"), ("browser_check", "on"),
    ("email_obfuscation", "on"), ("brotli", "on"), ("http3", "on"),
]


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


def aplicar(token, zname, zid):
    h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    BASE = f"{API}/zones/{zid}"
    out = []

    s_ok = 0
    for key, val in SETTINGS:
        r = requests.patch(f"{BASE}/settings/{key}", headers=h, json={"value": val})
        if r.json().get("success"):
            s_ok += 1
    out.append(f"set={s_ok}/{len(SETTINGS)}")

    hsts = {"value": {"strict_transport_security": {"enabled": True, "max_age": 31536000,
            "include_subdomains": True, "preload": True, "nosniff": True}}}
    out.append("HSTS=" + ("OK" if requests.patch(f"{BASE}/settings/security_header", headers=h, json=hsts).json().get("success") else "X"))
    out.append("DNSSEC=" + ("OK" if requests.patch(f"{BASE}/dnssec", headers=h, json={"status": "active"}).json().get("success") else "X"))
    out.append("LCC=" + ("OK" if requests.post(f"{BASE}/leaked-credential-checks", headers=h, json={"enabled": True}).json().get("success") else "X"))

    r = requests.get(f"{BASE}/rulesets", headers=h).json()
    waf_rs = next((x["id"] for x in r.get("result", []) if x.get("phase") == "http_request_firewall_custom"), None)
    rate_rs = next((x["id"] for x in r.get("result", []) if x.get("phase") == "http_ratelimit"), None)

    waf_rules = [
        {"action": "block", "expression": AI_EXPR, "description": "AI Crawl Control - Block AI bots by User Agent", "enabled": True},
        {"action": "block", "expression": '(http.request.uri.path contains "/.env" or http.request.uri.path contains "/.git" or http.request.uri.path contains "/wp-config.php")', "description": "Block arquivos sensiveis (.env, .git, wp-config)", "enabled": True},
        {"action": "block", "expression": "(cf.threat_score gt 30)", "description": "Block IPs com threat score >30", "enabled": True},
        {"action": "managed_challenge", "expression": '(http.request.uri.path contains "/admin" or http.request.uri.path contains "/wp-admin" or http.request.uri.path contains "/wp-login" or http.request.uri.path contains "/login")', "description": "Managed Challenge em /admin, /login", "enabled": True},
        {"action": "block", "expression": '(http.user_agent eq "" or http.user_agent eq "-")', "description": "Block requests sem User-Agent (bots)", "enabled": True},
    ]
    waf_ok = 0
    if waf_rs:
        ex = {x.get("description", "") for x in requests.get(f"{BASE}/rulesets/{waf_rs}", headers=h).json()["result"].get("rules", [])}
        for rule in waf_rules:
            if rule["description"] in ex:
                waf_ok += 1; continue
            if requests.post(f"{BASE}/rulesets/{waf_rs}/rules", headers=h, json=rule).json().get("success"):
                waf_ok += 1
    else:
        body = {"name": "default", "kind": "zone", "phase": "http_request_firewall_custom", "rules": waf_rules}
        if requests.post(f"{BASE}/rulesets", headers=h, json=body).json().get("success"):
            waf_ok = 5
    out.append(f"WAF={waf_ok}/5")

    rl_rule = {"action": "block", "expression": '(http.request.uri.path eq "/admin" or http.request.uri.path eq "/login" or http.request.uri.path eq "/wp-login.php")',
               "description": "Rate limit /admin /login 5req/10s", "enabled": True,
               "ratelimit": {"characteristics": ["ip.src", "cf.colo.id"], "period": 10, "requests_per_period": 5, "mitigation_timeout": 10}}
    if rate_rs:
        ex = {x.get("description", "") for x in requests.get(f"{BASE}/rulesets/{rate_rs}", headers=h).json()["result"].get("rules", [])}
        if rl_rule["description"] in ex:
            out.append("RL=OK(ja)")
        else:
            out.append("RL=" + ("OK" if requests.post(f"{BASE}/rulesets/{rate_rs}/rules", headers=h, json=rl_rule).json().get("success") else "X"))
    else:
        body = {"name": "default", "kind": "zone", "phase": "http_ratelimit", "rules": [rl_rule]}
        out.append("RL=" + ("OK" if requests.post(f"{BASE}/rulesets", headers=h, json=body).json().get("success") else "X"))

    return zname, " | ".join(out)


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    conta = sys.argv[1]
    dry = "--dry" in sys.argv
    if conta not in CONTAS:
        print(f"Conta '{conta}' nao existe. Disponiveis: {', '.join(CONTAS)}"); sys.exit(1)
    c = CONTAS[conta]
    zonas = zonas_da_conta(c)
    print(f"Conta '{conta}' tem {len(zonas)} zonas.\n")
    if dry:
        for n, _ in zonas:
            print(f"  {n}")
        return
    full = fail = 0
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(aplicar, c["token"], n, i) for n, i in zonas]
        done = 0
        for fut in as_completed(futs):
            n, status = fut.result()
            done += 1
            ok = "X" not in status and "set=0" not in status
            full += ok
            fail += (not ok)
            print(f"[{done:3d}/{len(zonas)}] {n:42s} {status}")
    print(f"\nRESUMO: {len(zonas)} zonas | {full} completas | {fail} com alguma falha")


if __name__ == "__main__":
    main()
