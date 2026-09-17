"""
Operações Cloudflare isoladas e seguras.

REGRAS DE OURO:
  - Só mexer em regras CROSS-DOMAIN (destino é outro dominio que não o proprio)
  - NUNCA tocar em regras internas (raiz<->www, path-rewrite, WAF, etc)
  - Identificação: se a expression do target tem ${N} ou wildcard_replace dentro
    do mesmo dominio, é INTERNA -> preservar.
"""
import json
import os
import re
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = "https://api.cloudflare.com/client/v4"
TIMEOUT = 30
WORKERS = 4

DIR = os.path.dirname(os.path.abspath(__file__))
CONTAS = json.load(open(os.path.join(DIR, "contas.json"), encoding="utf-8"))
CONTAS_MAP = {c["nome"]: c for c in CONTAS}

with open(os.path.join(DIR, "dominios_funnel.txt"), encoding="utf-8") as f:
    LISTA_FUNNEL = sorted(set(l.strip() for l in f if l.strip()))

SUBDOMINIOS_ZONA = {"happybiz.com.br", "nucleomusicanova.com"}


def _is_cross_domain(rule, zone):
    """True se a regra redireciona para outro dominio (não interna raiz<->www)."""
    tu = rule.get("action_parameters", {}).get("from_value", {}).get("target_url", {})
    expr = tu.get("expression", "")
    val = tu.get("value", "")
    destino = expr or val
    if not destino:
        return False
    # Expressões com ${N} são wildcard_replace -> normalmente raiz<->www (interna)
    if "${" in expr:
        return False
    # Extrair dominio do destino
    base = zone.lower().removeprefix("www.")
    if "concat(" in expr:
        try:
            url = expr.split('concat("')[1].split('"')[0]
        except Exception:
            return False
    else:
        url = val
    if not url:
        return False
    dom = url.replace("https://", "").replace("http://", "").split("/")[0].removeprefix("www.").split('"')[0]
    return bool(dom) and dom != base


def _http(method, path, conta_nome, json_body=None):
    c = CONTAS_MAP[conta_nome]
    h = {"Authorization": f"Bearer {c['token']}", "Content-Type": "application/json"}
    for attempt in range(3):
        try:
            r = requests.request(method, f"{BASE}{path}", headers=h, json=json_body, timeout=TIMEOUT)
            return r
        except requests.RequestException:
            if attempt == 2:
                raise


def _localizar_zonas():
    """Retorna {zone_name: (conta_nome, zone_id)} para todas as zonas do funnel."""
    zone_to = {}
    lista_set = set(LISTA_FUNNEL)
    for c in CONTAS:
        try:
            page = 1
            while True:
                r = _http("get", f"/zones?account.id={c['account_id']}&per_page=50&page={page}", c["nome"])
                data = r.json()
                if not data.get("success"):
                    break
                for z in data["result"]:
                    if z["name"].lower() in lista_set:
                        zone_to[z["name"].lower()] = (c["nome"], z["id"])
                if page >= data.get("result_info", {}).get("total_pages", 1):
                    break
                page += 1
        except Exception:
            pass
    return zone_to


def _listar_regras(conta_nome, zid):
    r = _http("get", f"/zones/{zid}/rulesets", conta_nome)
    rs_id = None
    for rs in r.json().get("result", []) or []:
        if rs.get("phase") == "http_request_dynamic_redirect":
            rs_id = rs["id"]
            break
    if not rs_id:
        return None, []
    r = _http("get", f"/zones/{zid}/rulesets/{rs_id}", conta_nome)
    return rs_id, r.json().get("result", {}).get("rules", [])


def _get_cross_domain_rules(zone, conta_nome, zid):
    """Retorna lista de regras cross-domain (ignora internas)."""
    rs_id, rules = _listar_regras(conta_nome, zid)
    if not rs_id:
        return None, []
    return rs_id, [r for r in rules if _is_cross_domain(r, zone)]


# ── Operações públicas ────────────────────────────────────────────────


def status():
    """Retorna (qtd_redirecionando, destino_atual, total_funnel)."""
    zone_to = _localizar_zonas()
    destinos = {}
    ativos = 0

    def check(zone):
        conta_nome, zid = zone_to[zone]
        try:
            _, rules = _get_cross_domain_rules(zone, conta_nome, zid)
            for r in rules:
                if not r.get("enabled"):
                    continue
                tu = r.get("action_parameters", {}).get("from_value", {}).get("target_url", {})
                destino = tu.get("value") or tu.get("expression", "")
                # Extrair dominio destino
                if "concat(" in destino:
                    try:
                        url = destino.split('concat("')[1].split('"')[0]
                    except Exception:
                        url = destino
                else:
                    url = destino
                dom = url.replace("https://", "").replace("http://", "").split("/")[0].removeprefix("www.").split('"')[0]
                return zone, dom
        except Exception:
            pass
        return zone, None

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for fut in as_completed([ex.submit(check, z) for z in zone_to]):
            zone, dest = fut.result()
            if dest:
                ativos += 1
                destinos[dest] = destinos.get(dest, 0) + 1

    return ativos, destinos, len(LISTA_FUNNEL)


def criar_redirect(dest_url, preservar_path=False):
    """Cria/substitui redirect cross-domain para dest_url em todas as zonas do funnel."""
    zone_to = _localizar_zonas()
    dest_clean = dest_url.rstrip("/")
    sucessos = []
    falhas = []

    def trocar(zone):
        try:
            conta_nome, zid = zone_to[zone]
            rs_id, existentes = _get_cross_domain_rules(zone, conta_nome, zid)
            for r in existentes:
                _http("delete", f"/zones/{zid}/rulesets/{rs_id}/rules/{r['id']}", conta_nome)
            if zone in SUBDOMINIOS_ZONA:
                expr = f'(ends_with(http.host, "{zone}"))'
            else:
                expr = f'(http.host eq "{zone}" or http.host eq "www.{zone}")'
            if preservar_path:
                target = {"expression": f'concat("{dest_clean}", http.request.uri.path)'}
                preserve_qs = True
            else:
                target = {"value": dest_url}
                preserve_qs = False
            rule = {
                "action": "redirect",
                "expression": expr,
                "description": f"Bot: redirecionar para {dest_url}",
                "enabled": True,
                "action_parameters": {
                    "from_value": {
                        "preserve_query_string": preserve_qs,
                        "status_code": 301,
                        "target_url": target,
                    }
                },
            }
            if rs_id:
                r = _http("post", f"/zones/{zid}/rulesets/{rs_id}/rules", conta_nome, rule)
            else:
                body = {
                    "name": "default",
                    "kind": "zone",
                    "phase": "http_request_dynamic_redirect",
                    "rules": [rule],
                }
                r = _http("post", f"/zones/{zid}/rulesets", conta_nome, body)
            if r.json().get("success"):
                sucessos.append(zone)
            else:
                falhas.append((zone, str(r.json().get("errors", "?"))[:60]))
        except Exception as e:
            falhas.append((zone, str(e)[:60]))

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for fut in as_completed([ex.submit(trocar, z) for z in zone_to]):
            fut.result()

    return len(sucessos), len(falhas), falhas


def desativar():
    """Desativa (enabled=false) todas as regras cross-domain (preserva internas)."""
    zone_to = _localizar_zonas()
    afetados = 0

    def tog(zone):
        nonlocal afetados
        try:
            conta_nome, zid = zone_to[zone]
            rs_id, regras = _get_cross_domain_rules(zone, conta_nome, zid)
            if not rs_id:
                return
            for r in regras:
                if not r.get("enabled"):
                    continue
                patch = {
                    "action": r["action"],
                    "expression": r["expression"],
                    "description": r.get("description", ""),
                    "enabled": False,
                    "action_parameters": r["action_parameters"],
                }
                _http("patch", f"/zones/{zid}/rulesets/{rs_id}/rules/{r['id']}", conta_nome, patch)
                afetados += 1
        except Exception:
            pass

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for fut in as_completed([ex.submit(tog, z) for z in zone_to]):
            fut.result()
    return afetados


def ativar():
    """Reativa regras cross-domain desativadas."""
    zone_to = _localizar_zonas()
    afetados = 0

    def tog(zone):
        nonlocal afetados
        try:
            conta_nome, zid = zone_to[zone]
            rs_id, rules = _listar_regras(conta_nome, zid)
            if not rs_id:
                return
            for r in rules:
                if not _is_cross_domain(r, zone):
                    continue
                if r.get("enabled"):
                    continue
                patch = {
                    "action": r["action"],
                    "expression": r["expression"],
                    "description": r.get("description", ""),
                    "enabled": True,
                    "action_parameters": r["action_parameters"],
                }
                _http("patch", f"/zones/{zid}/rulesets/{rs_id}/rules/{r['id']}", conta_nome, patch)
                afetados += 1
        except Exception:
            pass

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for fut in as_completed([ex.submit(tog, z) for z in zone_to]):
            fut.result()
    return afetados


def desfazer():
    """Deleta todas as regras cross-domain (preserva internas)."""
    zone_to = _localizar_zonas()
    afetados = 0

    def del_z(zone):
        nonlocal afetados
        try:
            conta_nome, zid = zone_to[zone]
            rs_id, regras = _get_cross_domain_rules(zone, conta_nome, zid)
            if not rs_id:
                return
            for r in regras:
                _http("delete", f"/zones/{zid}/rulesets/{rs_id}/rules/{r['id']}", conta_nome)
                afetados += 1
        except Exception:
            pass

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for fut in as_completed([ex.submit(del_z, z) for z in zone_to]):
            fut.result()
    return afetados


def criar_aleatorio(qty, dest_url):
    """Sorteia N zonas e redireciona apenas elas (substitui regras cross-domain nelas)."""
    import random

    candidatos = [d for d in LISTA_FUNNEL if d.lower() != dest_url.replace("https://", "").replace("http://", "").rstrip("/").lower()]
    qty = min(qty, len(candidatos))
    sorteados = sorted(random.sample(candidatos, qty))

    zone_to = _localizar_zonas()
    zone_to = {z: zone_to[z] for z in sorteados if z in zone_to}
    dest_clean = dest_url.rstrip("/")
    sucessos = []
    falhas = []

    def trocar(zone):
        try:
            conta_nome, zid = zone_to[zone]
            rs_id, existentes = _get_cross_domain_rules(zone, conta_nome, zid)
            for r in existentes:
                _http("delete", f"/zones/{zid}/rulesets/{rs_id}/rules/{r['id']}", conta_nome)
            if zone in SUBDOMINIOS_ZONA:
                expr = f'(ends_with(http.host, "{zone}"))'
            else:
                expr = f'(http.host eq "{zone}" or http.host eq "www.{zone}")'
            rule = {
                "action": "redirect",
                "expression": expr,
                "description": f"Bot: aleatório para {dest_url}",
                "enabled": True,
                "action_parameters": {
                    "from_value": {
                        "preserve_query_string": True,
                        "status_code": 301,
                        "target_url": {"expression": f'concat("{dest_clean}", http.request.uri.path)'},
                    }
                },
            }
            if rs_id:
                r = _http("post", f"/zones/{zid}/rulesets/{rs_id}/rules", conta_nome, rule)
            else:
                body = {
                    "name": "default",
                    "kind": "zone",
                    "phase": "http_request_dynamic_redirect",
                    "rules": [rule],
                }
                r = _http("post", f"/zones/{zid}/rulesets", conta_nome, body)
            if r.json().get("success"):
                sucessos.append(zone)
            else:
                falhas.append(zone)
        except Exception:
            falhas.append(zone)

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for fut in as_completed([ex.submit(trocar, z) for z in zone_to]):
            fut.result()
    return len(sucessos), len(falhas)
