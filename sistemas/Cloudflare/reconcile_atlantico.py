"""Reconcilia as regras WAF/rate-limit da zona livrariaatlantico.com.br:
remove a regra que bloqueia IA e a de admin/login (inutil em site estatico),
adiciona bloqueio de SEO tools + bots que nao sejam IA/buscador, e troca o
rate limit por um anti-flood global."""
import json, os, requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONTAS = json.load(open(os.path.join(SCRIPT_DIR, "contas.json")))
ACCOUNT_ID = "862514f37ef20f4575c631621a1dd750"
conta = next(c for c in CONTAS if c["account_id"] == ACCOUNT_ID)
H = {"Authorization": f"Bearer {conta['token']}", "Content-Type": "application/json"}
ZID = "97fd77ebb4b859f9f0cf7a7d7535e024"
BASE = f"https://api.cloudflare.com/client/v4/zones/{ZID}"

ALLOW = " or ".join(f'lower(http.user_agent) contains "{x}"' for x in [
    "googlebot","google-inspectiontool","storebot-google","googleother","google-extended",
    "bingbot","bingpreview","msnbot","slurp","duckduckbot","yandex","baiduspider",
    "applebot","petalbot","mojeek","seznambot","yahoo",
    "gptbot","oai-searchbot","chatgpt-user","claudebot","claude-user","claude-searchbot",
    "anthropic-ai","perplexitybot","perplexity-user","ccbot","bytespider","youbot",
    "meta-externalagent","meta-externalfetcher","facebookbot","amazonbot","mistralai",
    "google-cloudvertexbot","cohere-ai","kagibot","timpibot","duckassistbot",
])
BOTSIG = " or ".join(f'lower(http.user_agent) contains "{x}"' for x in [
    "bot","crawl","spider","scrap","wget","curl","python-requests","python-urllib",
    "go-http-client","libwww","httpclient","headlesschrome","phantomjs","scrapy","node-fetch",
])
SEO = " or ".join(f'lower(http.user_agent) contains "{x}"' for x in [
    "ahrefs","semrush","mj12bot","majestic","dotbot","rogerbot","blexbot","dataforseo",
    "barkrowler","seokicks","sistrix","serpstat","spbot","linkdex","screaming frog",
    "moz.com","openlinkprofiler","megaindex","zoominfobot","dnbcrawler","awariosmartbot",
])

# ruleset ids
rsets = requests.get(f"{BASE}/rulesets", headers=H).json()["result"]
waf_rs = next(x["id"] for x in rsets if x["phase"] == "http_request_firewall_custom")
rate_rs = next(x["id"] for x in rsets if x["phase"] == "http_ratelimit")

# --- 1. deletar regras indesejadas (por descricao) ---
cur = requests.get(f"{BASE}/rulesets/{waf_rs}", headers=H).json()["result"]["rules"]
DEL = ["AI Crawl Control - Block AI bots by User Agent", "Managed Challenge em /admin, /login"]
for rule in cur:
    if rule.get("description") in DEL:
        rr = requests.delete(f"{BASE}/rulesets/{waf_rs}/rules/{rule['id']}", headers=H)
        print(f"DELETE WAF '{rule['description'][:40]}':", "OK" if rr.status_code in (200,204) or rr.json().get("success") else rr.text[:120])

# --- 2. adicionar novas regras ---
novas = [
    {"action": "block", "enabled": True,
     "description": "Block SEO/recon bots (Ahrefs, Semrush, Majestic, Moz, etc.)",
     "expression": f"({SEO})"},
    {"action": "block", "enabled": True,
     "description": "Block bots nao-IA e nao-buscador (+ sem User-Agent)",
     "expression": f'(({BOTSIG}) or http.user_agent eq "") and not ({ALLOW}) and http.request.uri.path ne "/robots.txt"'},
]
exist = {x.get("description","") for x in requests.get(f"{BASE}/rulesets/{waf_rs}", headers=H).json()["result"]["rules"]}
for rule in novas:
    if rule["description"] in exist:
        print(f"WAF '{rule['description'][:40]}': ja existe"); continue
    rr = requests.post(f"{BASE}/rulesets/{waf_rs}/rules", headers=H, json=rule)
    print(f"ADD WAF '{rule['description'][:40]}':", "OK" if rr.json().get("success") else rr.json().get("errors"))

# --- 3. rate limit: remover regra /admin e adicionar anti-flood ---
cur_rl = requests.get(f"{BASE}/rulesets/{rate_rs}", headers=H).json()["result"].get("rules", [])
for rule in cur_rl:
    if "admin" in rule.get("description","").lower():
        rr = requests.delete(f"{BASE}/rulesets/{rate_rs}/rules/{rule['id']}", headers=H)
        print("DELETE rate '"+rule['description'][:30]+"':", "OK" if rr.status_code in (200,204) or rr.json().get("success") else rr.text[:120])

rl = {"action": "block", "enabled": True,
      "description": "Anti-flood: bloqueia IP com >200 req/10s",
      "expression": 'starts_with(http.request.uri.path, "/")',
      "ratelimit": {"characteristics": ["ip.src", "cf.colo.id"], "period": 10,
                    "requests_per_period": 200, "mitigation_timeout": 10}}
exist_rl = {x.get("description","") for x in requests.get(f"{BASE}/rulesets/{rate_rs}", headers=H).json()["result"].get("rules", [])}
if rl["description"] in exist_rl:
    print("rate anti-flood: ja existe")
else:
    rr = requests.post(f"{BASE}/rulesets/{rate_rs}/rules", headers=H, json=rl)
    print("ADD rate anti-flood:", "OK" if rr.json().get("success") else rr.json().get("errors"))

# --- estado final ---
print("\n=== WAF final ===")
for i, r in enumerate(requests.get(f"{BASE}/rulesets/{waf_rs}", headers=H).json()["result"]["rules"], 1):
    print(f"  {i}) [{r['action']}] {r.get('description')}")
print("=== Rate limit final ===")
for i, r in enumerate(requests.get(f"{BASE}/rulesets/{rate_rs}", headers=H).json()["result"].get("rules", []), 1):
    print(f"  {i}) [{r['action']}] {r.get('description')}")
