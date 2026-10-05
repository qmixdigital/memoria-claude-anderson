"""advdobrasil.com.br: bloqueia trafego de fora do Brasil/Portugal que NAO seja robo verificado.

Motivo (05/10/2026): ~80% das requisicoes do Worker ponte-areas-embargadas vem de um
raspador espalhado pelo mundo (EUA, AR, VN, PK, MX, SG, BD, ZA, IN...) fingindo ser
navegador. Robos verificados (Google, Bing, Apple, IA de busca como ChatGPT/Perplexity
Search) passam por `cf.client.bot`. Publico do site e brasileiro.

Reaproveita a regra "Trafego" que estava desligada (nao ocupa vaga nova).
Backup antes de alterar: waf_advdobrasil_backup_20261005.json.
Desfazer: python scripts/advdobrasil_bloqueio_pais.py --desfazer
Rodar de d:\\SISTEMAS\\Cloudflare.
"""
import json, re, sys, requests

s = open(".env", encoding="utf-8").read()
tok = re.search(r"^CF_USER_TOKEN=(\S+)", s, re.M).group(1)
H = {"Authorization": "Bearer " + tok, "Content-Type": "application/json"}
API = "https://api.cloudflare.com/client/v4"
ZID = "fb025bc1b9a01c97bd13a47bc0958817"
EP = f"{API}/zones/{ZID}/rulesets/phases/http_request_firewall_custom/entrypoint"
BAK = "waf_advdobrasil_backup_20261005.json"

if "--desfazer" in sys.argv:
    rules = json.load(open(BAK, encoding="utf-8"))["rules"]
else:
    r = requests.get(EP, headers=H, timeout=30).json()["result"]
    json.dump(r, open(BAK, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    rules = r["rules"]
    alvo = [x for x in rules if x.get("description", "").startswith(("Tr", "Bloqueio fora do Brasil"))][0]
    alvo["action"] = "block"
    alvo["enabled"] = True
    alvo["description"] = "Bloqueio fora do Brasil/Portugal (exceto robos verificados) - raspador global 10/2026"
    alvo["expression"] = '(not ip.geoip.country in {"BR" "PT"} and not cf.client.bot)'
    alvo.pop("action_parameters", None)

body = {"rules": [{k: v for k, v in x.items() if k in ("action", "expression", "description", "enabled", "id", "action_parameters")} for x in rules]}
p = requests.put(EP, headers=H, json=body, timeout=60).json()
print("ok" if p.get("success") else p.get("errors"))
