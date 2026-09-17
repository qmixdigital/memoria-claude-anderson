"""
Hardening sob medida para livrariaatlantico.com.br (Cloudflare Pages / zona Free).

Diferente do harden_site.py padrao: NAO bloqueia bots de IA nem buscadores.
Permite IA (GPTBot, ClaudeBot, PerplexityBot, CCBot, Bytespider, etc.) e
mecanismos de busca (Googlebot, Bingbot, DuckDuckBot, YandexBot, Applebot...),
e BLOQUEIA ferramentas de SEO/recon de concorrentes (Ahrefs, Semrush, Majestic,
Moz/DotBot, DataForSeo, etc.) e demais bots/scrapers.

Aplica:
  - SSL Full Strict, TLS 1.2+, Always HTTPS, TLS 1.3, 0-RTT, brotli, http3, always_online
  - HSTS 1 ano + includeSubDomains + preload + nosniff
  - DNSSEC ativo
  - Security Level HIGH
  - 5 WAF Custom Rules (ver abaixo)
  - Rate limit: bloqueia IP com > 200 req/10s (anti-flood/DDoS)
  - Purga todo o cache
"""
import json, os, sys, requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONTAS = json.load(open(os.path.join(SCRIPT_DIR, "contas.json")))
ACCOUNT_ID = "862514f37ef20f4575c631621a1dd750"
ZONE = "livrariaatlantico.com.br"

conta = next(c for c in CONTAS if c["account_id"] == ACCOUNT_ID)
H = {"Authorization": f"Bearer {conta['token']}", "Content-Type": "application/json"}

# --- localizar zone_id ---
r = requests.get(f"https://api.cloudflare.com/client/v4/zones?account.id={ACCOUNT_ID}&per_page=50", headers=H)
ZID = next(z["id"] for z in r.json()["result"] if z["name"] == ZONE)
BASE = f"https://api.cloudflare.com/client/v4/zones/{ZID}"
print(f"Zona {ZONE} -> {ZID}\n")

out = []

# --- 1. Settings de seguranca/performance (sem browser_check p/ nao atrapalhar IA/buscadores) ---
settings = [
    ("ssl", "strict"), ("min_tls_version", "1.2"), ("always_use_https", "on"),
    ("security_level", "high"), ("tls_1_3", "on"), ("0rtt", "on"),
    ("always_online", "on"), ("opportunistic_encryption", "on"),
    ("automatic_https_rewrites", "on"), ("brotli", "on"), ("http3", "on"),
    ("email_obfuscation", "on"),
]
ok = 0
for k, v in settings:
    rr = requests.patch(f"{BASE}/settings/{k}", headers=H, json={"value": v})
    if rr.json().get("success"): ok += 1
    else: print(f"  setting {k}: {rr.json().get('errors')}")
print(f"settings: {ok}/{len(settings)}")

# --- HSTS ---
hsts = {"value": {"strict_transport_security": {"enabled": True, "max_age": 31536000,
        "include_subdomains": True, "preload": True, "nosniff": True}}}
rr = requests.patch(f"{BASE}/settings/security_header", headers=H, json=hsts)
print("HSTS:", "OK" if rr.json().get("success") else rr.json().get("errors"))

# --- DNSSEC ---
rr = requests.patch(f"{BASE}/dnssec", headers=H, json={"status": "active"})
print("DNSSEC:", "OK" if rr.json().get("success") else rr.json().get("errors"))

# --- Allowlist de IA + buscadores (NAO bloquear) ---
ALLOW = " or ".join(f'lower(http.user_agent) contains "{x}"' for x in [
    # search engines
    "googlebot","google-inspectiontool","storebot-google","googleother","google-extended",
    "bingbot","bingpreview","msnbot","slurp","duckduckbot","yandex","baiduspider",
    "applebot","petalbot","mojeek","seznambot","yahoo",
    # AI crawlers / assistants
    "gptbot","oai-searchbot","chatgpt-user","claudebot","claude-user","claude-searchbot",
    "anthropic-ai","perplexitybot","perplexity-user","ccbot","bytespider","youbot",
    "meta-externalagent","meta-externalfetcher","facebookbot","amazonbot","mistralai",
    "google-cloudvertexbot","cohere-ai","kagibot","timpibot","duckassistbot",
])

# Indicadores genericos de bot
BOTSIG = " or ".join(f'lower(http.user_agent) contains "{x}"' for x in [
    "bot","crawl","spider","scrap","wget","curl","python-requests","python-urllib",
    "go-http-client","libwww","httpclient","headlesschrome","phantomjs","scrapy","node-fetch",
])

# SEO/recon tools (bloqueio explicito e nomeado)
SEO = " or ".join(f'lower(http.user_agent) contains "{x}"' for x in [
    "ahrefs","semrush","mj12bot","majestic","dotbot","rogerbot","blexbot","dataforseo",
    "barkrowler","seokicks","sistrix","serpstat","spbot","linkdex","screaming frog",
    "moz.com","openlinkprofiler","megaindex","zoominfobot","dnbcrawler","awariosmartbot",
])

waf_rules = [
    {"action": "block", "enabled": True,
     "description": "Block SEO/recon bots (Ahrefs, Semrush, Majestic, Moz, etc.)",
     "expression": f"({SEO})"},
    {"action": "block", "enabled": True,
     "description": "Block bots que nao sejam IA nem buscador (+ sem User-Agent)",
     "expression": f'(({BOTSIG}) or http.user_agent eq "") and not ({ALLOW}) and http.request.uri.path ne "/robots.txt"'},
    {"action": "block", "enabled": True,
     "description": "Block arquivos sensiveis (.env, .git, wp-config)",
     "expression": '(http.request.uri.path contains "/.env" or http.request.uri.path contains "/.git" or http.request.uri.path contains "/wp-config")'},
    {"action": "block", "enabled": True,
     "description": "Block IPs com threat score alto (>30)",
     "expression": "(cf.threat_score gt 30)"},
    {"action": "managed_challenge", "enabled": True,
     "description": "Challenge IPs com reputacao suspeita (threat score >15)",
     "expression": "(cf.threat_score gt 15)"},
]

r = requests.get(f"{BASE}/rulesets", headers=H)
rsets = r.json().get("result", [])
waf_rs = next((x["id"] for x in rsets if x.get("phase") == "http_request_firewall_custom"), None)
rate_rs = next((x["id"] for x in rsets if x.get("phase") == "http_ratelimit"), None)

waf_ok = 0
if waf_rs:
    cur = requests.get(f"{BASE}/rulesets/{waf_rs}", headers=H).json()["result"].get("rules", [])
    existentes = {x.get("description", "") for x in cur}
    for rule in waf_rules:
        if rule["description"] in existentes:
            waf_ok += 1; continue
        rr = requests.post(f"{BASE}/rulesets/{waf_rs}/rules", headers=H, json=rule)
        if rr.json().get("success"): waf_ok += 1
        else: print(f"  WAF '{rule['description'][:30]}': {rr.json().get('errors')}")
else:
    body = {"name": "default", "kind": "zone", "phase": "http_request_firewall_custom", "rules": waf_rules}
    rr = requests.post(f"{BASE}/rulesets", headers=H, json=body)
    if rr.json().get("success"): waf_ok = len(waf_rules)
    else: print("  WAF create:", rr.json().get("errors"))
print(f"WAF custom rules: {waf_ok}/{len(waf_rules)}")

# --- Rate limit anti-flood ---
rl = {"action": "block", "enabled": True,
      "description": "Rate limit anti-flood: >200 req/10s por IP",
      "expression": "(http.request.uri.path ne \"\")",
      "ratelimit": {"characteristics": ["ip.src", "cf.colo.id"], "period": 10,
                    "requests_per_period": 200, "mitigation_timeout": 10}}
if rate_rs:
    cur = requests.get(f"{BASE}/rulesets/{rate_rs}", headers=H).json()["result"].get("rules", [])
    if rl["description"] in {x.get("description","") for x in cur}:
        print("Rate limit: OK (ja existe)")
    else:
        rr = requests.post(f"{BASE}/rulesets/{rate_rs}/rules", headers=H, json=rl)
        print("Rate limit:", "OK" if rr.json().get("success") else rr.json().get("errors"))
else:
    body = {"name": "default", "kind": "zone", "phase": "http_ratelimit", "rules": [rl]}
    rr = requests.post(f"{BASE}/rulesets", headers=H, json=body)
    print("Rate limit:", "OK" if rr.json().get("success") else rr.json().get("errors"))

# --- Purga cache ---
rr = requests.post(f"{BASE}/purge_cache", headers=H, json={"purge_everything": True})
print("Purge cache:", "OK" if rr.json().get("success") else rr.json().get("errors"))

print("\nConcluido.")
