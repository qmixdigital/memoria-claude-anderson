import os
import re
import sys
import json
import csv
import argparse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

# Ensure UTF-8 output on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_URL = "https://api.cloudflare.com/client/v4"
REDIRECT_PHASE = "http_request_dynamic_redirect"
CONTAS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "contas.json")


def load_contas():
    try:
        with open(CONTAS_FILE, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Erro: Arquivo '{CONTAS_FILE}' não encontrado.")
        sys.exit(1)


def save_contas(contas):
    with open(CONTAS_FILE, "w", encoding="utf-8") as f:
        json.dump(contas, f, indent=2, ensure_ascii=False)


def get_conta(nome):
    contas = load_contas()
    for c in contas:
        if c["nome"] == nome:
            return c
    nomes = [c["nome"] for c in contas]
    print(f"Erro: Conta '{nome}' não encontrada. Disponíveis: {', '.join(nomes)}")
    sys.exit(1)


class CloudflareAPI:
    def __init__(self, token=None, account_id=None, conta_nome=None):
        if token and account_id:
            self.token = token
            self.account_id = account_id
            self.conta_nome = conta_nome or "?"
        else:
            print("Erro: token e account_id são obrigatórios.")
            sys.exit(1)
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    @classmethod
    def from_conta(cls, nome):
        conta = get_conta(nome)
        return cls(token=conta["token"], account_id=conta["account_id"], conta_nome=conta["nome"])

    def _request(self, method, endpoint, data=None):
        url = f"{BASE_URL}{endpoint}"
        for attempt in range(3):
            try:
                resp = getattr(requests, method)(url, headers=self.headers, json=data)
            except requests.exceptions.RequestException as e:
                print(f"Erro de conexão: {e}")
                return None
            if resp.status_code in (429, 500, 502, 503):
                delay = (2 ** attempt)
                print(f"  Retry {attempt + 1}/3 em {delay}s (HTTP {resp.status_code})...")
                time.sleep(delay)
                continue
            try:
                result = resp.json()
            except ValueError:
                print(f"Erro: Resposta não-JSON da API (HTTP {resp.status_code})")
                return None
            if not result.get("success"):
                errors = result.get("errors", [])
                if errors:
                    msg = errors[0].get("message", "Erro desconhecido")
                    code = errors[0].get("code", 0)
                    if "not authorized" in msg.lower() or resp.status_code == 403:
                        print(f"Erro: Permissão negada. Verifique as permissões do token.")
                    elif resp.status_code == 401:
                        print(f"Erro: Token inválido ou expirado. Atualize o .env")
                    elif "maximum number of rules" in msg.lower() or code == 10015:
                        print(f"Erro: Limite de regras excedido nesta zona. Verifique o plano Cloudflare.")
                    else:
                        print(f"Erro API: {msg}")
                return None
            return result
        print("Erro: Máximo de tentativas excedido.")
        return None

    def get_all_zones(self):
        zones = []
        page = 1
        while True:
            result = self._request("get", f"/zones?account.id={self.account_id}&per_page=50&page={page}")
            if not result:
                break
            zones.extend(result["result"])
            total_pages = result.get("result_info", {}).get("total_pages", 1)
            if page >= total_pages:
                break
            page += 1
        return sorted(zones, key=lambda z: z["name"])

    def get_zone_by_name(self, name):
        result = self._request("get", f"/zones?name={name}&account.id={self.account_id}")
        if result and result["result"]:
            return result["result"][0]
        print(f"Erro: Zona '{name}' não encontrada.")
        zones = self.get_all_zones()
        suggestions = [z["name"] for z in zones if name.split(".")[0] in z["name"]]
        if suggestions:
            print(f"  Sugestões: {', '.join(suggestions[:5])}")
        return None

    def get_redirect_ruleset(self, zone_id):
        result = self._request("get", f"/zones/{zone_id}/rulesets")
        if not result:
            return None
        for rs in result["result"]:
            if rs.get("phase") == REDIRECT_PHASE:
                return rs
        return None

    def get_redirect_rules(self, zone_id):
        ruleset = self.get_redirect_ruleset(zone_id)
        if not ruleset:
            return None, []
        detail = self._request("get", f"/zones/{zone_id}/rulesets/{ruleset['id']}")
        if not detail:
            return ruleset, []
        return ruleset, detail["result"].get("rules", [])


def cmd_listar(api, args):
    zones = api.get_all_zones()
    if not zones:
        print("Nenhuma zona encontrada.")
        return

    def fetch_rules(zone):
        ruleset, rules = api.get_redirect_rules(zone["id"])
        return zone, rules

    results = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_rules, z): z for z in zones}
        for future in as_completed(futures):
            results.append(future.result())

    results.sort(key=lambda x: x[0]["name"])

    if args.json:
        output = []
        for zone, rules in results:
            ativas = sum(1 for r in rules if r.get("enabled"))
            inativas = len(rules) - ativas
            output.append({
                "zone": zone["name"],
                "zone_id": zone["id"],
                "total_rules": len(rules),
                "active": ativas,
                "inactive": inativas,
            })
        print(json.dumps(output, indent=2))
        return

    for zone, rules in results:
        name = zone["name"]
        total = len(rules)
        if total == 0:
            print(f"  {name:45s} | 0 regras")
        else:
            ativas = sum(1 for r in rules if r.get("enabled"))
            inativas = total - ativas
            label = "regra" if total == 1 else "regras"
            print(f"  {name:45s} | {total} {label} ({ativas} ativas, {inativas} inativas)")


def cmd_regras(api, args):
    zone = api.get_zone_by_name(args.dominio)
    if not zone:
        return
    ruleset, rules = api.get_redirect_rules(zone["id"])

    if args.json:
        print(json.dumps({"zone": zone["name"], "zone_id": zone["id"], "rules": rules}, indent=2))
        return

    print(f"\nZona: {zone['name']} (ID: {zone['id']})\n")
    if not rules:
        print("  Nenhuma regra de redirect encontrada.")
        return

    for i, rule in enumerate(rules, 1):
        status = "ATIVA" if rule.get("enabled") else "INATIVA"
        desc = rule.get("description", "Sem descrição")
        expression = rule.get("expression", "")
        target_expr = rule.get("action_parameters", {}).get("from_value", {}).get("target_url", {})
        target = target_expr.get("expression", target_expr.get("value", "N/A"))
        status_code = rule.get("action_parameters", {}).get("from_value", {}).get("status_code", "N/A")
        rule_id = rule.get("id", "N/A")

        print(f"  #{i} [{status}] {desc}")
        print(f"     Expression: {expression}")
        print(f"     Target: {target}")
        print(f"     Status: {status_code} | ID: {rule_id}")
        print()


def _toggle_rule(api, zone, ruleset, rules, rule_id_or_all, enabled):
    """Toggle rules. Returns list of {rule_id, description, status, success}."""
    results = []
    targets = rules if rule_id_or_all == "--all" else [r for r in rules if r["id"] == rule_id_or_all]
    if not targets:
        return results

    for rule in targets:
        desc = rule.get("description", rule["id"])
        if rule.get("enabled") == enabled:
            results.append({"rule_id": rule["id"], "description": desc, "status": "skipped", "success": True})
            continue

        patch_body = {
            "action": rule["action"],
            "expression": rule["expression"],
            "description": rule.get("description", ""),
            "enabled": enabled,
            "action_parameters": rule["action_parameters"],
        }
        result = api._request("patch", f"/zones/{zone['id']}/rulesets/{ruleset['id']}/rules/{rule['id']}", patch_body)
        if result:
            results.append({"rule_id": rule["id"], "description": desc, "status": "changed", "success": True})
        else:
            # Fallback: PUT full ruleset with modified enabled field
            detail = api._request("get", f"/zones/{zone['id']}/rulesets/{ruleset['id']}")
            if detail:
                all_rules = detail["result"].get("rules", [])
                for r in all_rules:
                    if r["id"] == rule["id"]:
                        r["enabled"] = enabled
                put_result = api._request("put", f"/zones/{zone['id']}/rulesets/{ruleset['id']}", {"rules": all_rules})
                if put_result:
                    results.append({"rule_id": rule["id"], "description": desc, "status": "changed_fallback", "success": True})
                else:
                    results.append({"rule_id": rule["id"], "description": desc, "status": "error", "success": False})
            else:
                results.append({"rule_id": rule["id"], "description": desc, "status": "error", "success": False})
    return results


def cmd_ativar(api, args):
    if not args.rule_id and not args.all:
        print("Erro: informe o rule_id ou use --all para ativar todas as regras.")
        return
    zone = api.get_zone_by_name(args.dominio)
    if not zone:
        return
    ruleset, rules = api.get_redirect_rules(zone["id"])
    if not rules:
        print(f"Nenhuma regra de redirect em {args.dominio}.")
        return
    rule_target = "--all" if args.all else args.rule_id
    if rule_target != "--all" and not any(r["id"] == rule_target for r in rules):
        print(f"Regra '{rule_target}' não encontrada em {args.dominio}.")
        print(f"  IDs disponíveis:")
        for r in rules:
            print(f"    {r['id']} — {r.get('description', 'Sem descrição')}")
        return
    results = _toggle_rule(api, zone, ruleset, rules, rule_target, True)
    if args.json:
        print(json.dumps({"zone": args.dominio, "action": "ativar", "results": results}, indent=2))
    else:
        for r in results:
            if r["status"] == "skipped":
                print(f"  [{r['description']}] já está ativa. Pulando.")
            elif r["success"]:
                print(f"  [{r['description']}] ativada com sucesso.")
            else:
                print(f"  Erro ao ativar [{r['description']}].")


def cmd_desativar(api, args):
    if not args.rule_id and not args.all:
        print("Erro: informe o rule_id ou use --all para desativar todas as regras.")
        return
    zone = api.get_zone_by_name(args.dominio)
    if not zone:
        return
    ruleset, rules = api.get_redirect_rules(zone["id"])
    if not rules:
        print(f"Nenhuma regra de redirect em {args.dominio}.")
        return
    rule_target = "--all" if args.all else args.rule_id
    if rule_target != "--all" and not any(r["id"] == rule_target for r in rules):
        print(f"Regra '{rule_target}' não encontrada em {args.dominio}.")
        print(f"  IDs disponíveis:")
        for r in rules:
            print(f"    {r['id']} — {r.get('description', 'Sem descrição')}")
        return
    results = _toggle_rule(api, zone, ruleset, rules, rule_target, False)
    if args.json:
        print(json.dumps({"zone": args.dominio, "action": "desativar", "results": results}, indent=2))
    else:
        for r in results:
            if r["status"] == "skipped":
                print(f"  [{r['description']}] já está inativa. Pulando.")
            elif r["success"]:
                print(f"  [{r['description']}] desativada com sucesso.")
            else:
                print(f"  Erro ao desativar [{r['description']}].")


def _toggle_all(api, enabled, yes=False, json_mode=False):
    action = "Ativar" if enabled else "Desativar"
    zones = api.get_all_zones()

    all_zone_rules = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(api.get_redirect_rules, z["id"]): z for z in zones}
        for future in as_completed(futures):
            zone = futures[future]
            ruleset, rules = future.result()
            if rules and ruleset:
                all_zone_rules.append((zone, ruleset, rules))

    total_rules = sum(len(rules) for _, _, rules in all_zone_rules)
    if total_rules == 0:
        if not json_mode:
            print("Nenhuma regra de redirect encontrada em nenhuma zona.")
        return

    if not yes:
        print(f"\n{action} {total_rules} regras em {len(all_zone_rules)} zonas. Continuar? (s/n): ", end="")
        if input().strip().lower() != "s":
            print("Cancelado.")
            return

    all_results = []
    for zone, ruleset, rules in sorted(all_zone_rules, key=lambda x: x[0]["name"]):
        if not json_mode:
            print(f"\n  {zone['name']}:")
        results = _toggle_rule(api, zone, ruleset, rules, "--all", enabled)
        if json_mode:
            all_results.append({"zone": zone["name"], "results": results})
        else:
            for r in results:
                if r["status"] == "skipped":
                    status = "ativa" if enabled else "inativa"
                    print(f"    [{r['description']}] já está {status}.")
                elif r["success"]:
                    status = "ativada" if enabled else "desativada"
                    print(f"    [{r['description']}] {status}.")

    if json_mode:
        print(json.dumps({"action": action.lower(), "zones": all_results}, indent=2))


def cmd_ativar_todos(api, args):
    _toggle_all(api, True, yes=args.yes, json_mode=args.json)


def cmd_desativar_todos(api, args):
    _toggle_all(api, False, yes=args.yes, json_mode=args.json)


def cmd_criar(api, zone_name, destino, status_code=301, json_mode=False):
    zone = api.get_zone_by_name(zone_name)
    if not zone:
        return {"success": False, "error": f"Zona '{zone_name}' não encontrada"}

    # Strip www. prefix if user passed it
    domain = zone_name.removeprefix("www.")
    # Strip trailing slash from destino to avoid double slashes with uri.path
    destino = destino.rstrip("/")

    ruleset = api.get_redirect_ruleset(zone["id"])

    rule_body = {
        "action": "redirect",
        "expression": f'(http.host eq "{domain}" or http.host eq "www.{domain}")',
        "description": f"Redirecionar para {destino}",
        "enabled": True,
        "action_parameters": {
            "from_value": {
                "preserve_query_string": True,
                "status_code": status_code,
                "target_url": {
                    "expression": f'concat("{destino}", http.request.uri.path)'
                }
            }
        }
    }

    if ruleset:
        result = api._request("post", f"/zones/{zone['id']}/rulesets/{ruleset['id']}/rules", rule_body)
    else:
        ruleset_body = {
            "name": "default",
            "kind": "zone",
            "phase": REDIRECT_PHASE,
            "rules": [rule_body]
        }
        result = api._request("post", f"/zones/{zone['id']}/rulesets", ruleset_body)

    if result:
        msg = f"Redirect criado: {domain} → {destino} (HTTP {status_code})"
        if not json_mode:
            print(msg)
        return {"success": True, "domain": domain, "destino": destino, "status_code": status_code}
    return {"success": False, "domain": domain, "error": "Falha ao criar redirect"}


def cmd_criar_handler(api, args):
    destino = args.destino
    if not destino.startswith("https://"):
        destino = f"https://{destino}"
    result = cmd_criar(api, args.dominio, destino, args.status_code, json_mode=args.json)
    if args.json and result:
        print(json.dumps(result, indent=2))


def cmd_deletar(api, args):
    zone = api.get_zone_by_name(args.dominio)
    if not zone:
        return
    ruleset, rules = api.get_redirect_rules(zone["id"])
    if not ruleset:
        print(f"Nenhum ruleset de redirect em {args.dominio}.")
        return

    rule = next((r for r in rules if r["id"] == args.rule_id), None)
    if not rule:
        print(f"Regra '{args.rule_id}' não encontrada em {args.dominio}.")
        return

    result = api._request("delete", f"/zones/{zone['id']}/rulesets/{ruleset['id']}/rules/{args.rule_id}")
    if result:
        desc = rule.get("description", args.rule_id)
        if args.json:
            print(json.dumps({"success": True, "zone": args.dominio, "rule_id": args.rule_id, "description": desc}, indent=2))
        else:
            print(f"Regra [{desc}] deletada de {args.dominio}.")
    else:
        if args.json:
            print(json.dumps({"success": False, "zone": args.dominio, "rule_id": args.rule_id}, indent=2))
        else:
            print(f"Erro ao deletar regra de {args.dominio}.")


def cmd_criar_lote(api, args):
    try:
        with open(args.arquivo, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
    except FileNotFoundError:
        print(f"Erro: Arquivo '{args.arquivo}' não encontrado.")
        return

    if not rows:
        print("Arquivo CSV vazio.")
        return

    if not args.json:
        print(f"Criando {len(rows)} redirects...\n")
    all_results = []
    for row in rows:
        origem = row.get("origem", "").strip()
        destino = row.get("destino", "").strip()
        try:
            status_code = int(row.get("status_code", "301").strip())
        except ValueError:
            if not args.json:
                print(f"  status_code inválido para {origem}: '{row.get('status_code')}' — usando 301.")
            status_code = 301
        if not origem or not destino:
            if not args.json:
                print(f"  Linha inválida: {row} — pulando.")
            continue
        if not destino.startswith("https://"):
            destino = f"https://{destino}"
        result = cmd_criar(api, origem, destino, status_code, json_mode=args.json)
        if args.json and result:
            all_results.append(result)
    if args.json:
        print(json.dumps(all_results, indent=2))


# ─── Comandos de gerenciamento de contas ───

def cmd_contas(args):
    contas = load_contas()
    if args.json:
        print(json.dumps([{"nome": c["nome"], "account_id": c["account_id"]} for c in contas], indent=2))
        return
    print(f"\n  {len(contas)} contas cadastradas:\n")
    for i, c in enumerate(contas, 1):
        print(f"  {i}. {c['nome']:20s} | Account ID: {c['account_id']}")
    print()


def cmd_conta_add(args):
    contas = load_contas()
    for c in contas:
        if c["nome"] == args.nome:
            print(f"Erro: Conta '{args.nome}' já existe.")
            return
        if c["account_id"] == args.account_id:
            print(f"Erro: Account ID '{args.account_id}' já cadastrado como '{c['nome']}'.")
            return

    # Verificar token (tenta endpoint da conta, depois genérico)
    headers = {"Authorization": f"Bearer {args.token}", "Content-Type": "application/json"}
    try:
        resp = requests.get(f"{BASE_URL}/accounts/{args.account_id}/tokens/verify", headers=headers)
        data = resp.json()
        if not data.get("success") or data.get("result", {}).get("status") != "active":
            # Fallback para endpoint genérico
            resp = requests.get(f"{BASE_URL}/user/tokens/verify", headers=headers)
            data = resp.json()
            if not data.get("success") or data.get("result", {}).get("status") != "active":
                print("Erro: Token inválido ou inativo.")
                return
    except Exception as e:
        print(f"Erro ao verificar token: {e}")
        return

    contas.append({"nome": args.nome, "token": args.token, "account_id": args.account_id})
    save_contas(contas)
    print(f"Conta '{args.nome}' adicionada com sucesso.")


def cmd_conta_remover(args):
    contas = load_contas()
    nova_lista = [c for c in contas if c["nome"] != args.nome]
    if len(nova_lista) == len(contas):
        print(f"Erro: Conta '{args.nome}' não encontrada.")
        return
    save_contas(nova_lista)
    print(f"Conta '{args.nome}' removida.")


# ─── Comando STATUS global ───

def _extract_cross_domain(zone_name, rules):
    """Extrai regras que redirecionam para domínios diferentes."""
    cross = []
    base = zone_name.removeprefix("www.")
    for rule in rules:
        target_url = rule.get("action_parameters", {}).get("from_value", {}).get("target_url", {})
        expression_target = target_url.get("expression", "")
        value_target = target_url.get("value", "")

        destino = ""
        if expression_target:
            # Ignorar regras com variáveis (www→raiz, raiz→www)
            if "${" in expression_target:
                continue
            if 'concat("' in expression_target:
                destino = expression_target.split('concat("')[1].split('"')[0]
            elif 'wildcard_replace' in expression_target and 'https://' in expression_target:
                parts = expression_target.split('"')
                for p in reversed(parts):
                    if p.startswith("https://") or p.startswith("http://"):
                        destino = p
                        break
        elif value_target:
            destino = value_target

        if not destino:
            continue
        # Remove protocolo para comparar domínios
        destino_domain = destino.replace("https://", "").replace("http://", "").split("/")[0].removeprefix("www.")
        if destino_domain and destino_domain != base:
            # Detecta path-restrição na expression do match (não no target)
            match_expr = rule.get("expression", "")
            path_match = re.search(
                r'http\.request\.uri\.path\s+(?:eq|starts_with|contains|matches|wildcard)\s+r?"([^"]+)"',
                match_expr,
            )
            path = path_match.group(1) if path_match else ""
            origem_display = f"{zone_name}{path}" if path else zone_name

            status = "ATIVA" if rule.get("enabled") else "INATIVA"
            cross.append({
                "origem": zone_name,
                "origem_display": origem_display,
                "path": path,
                "destino": destino,
                "status": status,
                "rule_id": rule.get("id", ""),
                "description": rule.get("description", ""),
            })
    return cross


def cmd_status(args):
    contas = load_contas()
    all_data = []

    for conta in contas:
        api = CloudflareAPI(token=conta["token"], account_id=conta["account_id"], conta_nome=conta["nome"])
        zones = api.get_all_zones()

        zone_rules = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(api.get_redirect_rules, z["id"]): z for z in zones}
            for future in as_completed(futures):
                zone = futures[future]
                ruleset, rules = future.result()
                zone_rules.append((zone, rules))

        zone_rules.sort(key=lambda x: x[0]["name"])

        cross_domain = []
        for zone, rules in zone_rules:
            cross = _extract_cross_domain(zone["name"], rules)
            cross_domain.extend(cross)

        all_data.append({
            "conta": conta["nome"],
            "total_dominios": len(zones),
            "dominios": [(z["name"], len(r)) for z, r in zone_rules],
            "cross_domain": cross_domain,
        })

    if args.json:
        print(json.dumps(all_data, indent=2))
        return

    for data in all_data:
        print(f"\n{'='*60}")
        print(f"  CONTA: {data['conta'].upper()} ({data['total_dominios']} domínios)")
        print(f"{'='*60}")

        # Cross-domain ativos
        ativos = [c for c in data["cross_domain"] if c["status"] == "ATIVA"]
        inativos = [c for c in data["cross_domain"] if c["status"] == "INATIVA"]

        if ativos:
            print(f"\n  Cross-domain ATIVOS ({len(ativos)}):")
            for c in sorted(ativos, key=lambda x: x["origem_display"]):
                print(f"    {c['origem_display']:50s} → {c['destino']}")

        if inativos:
            print(f"\n  Cross-domain INATIVOS ({len(inativos)}):")
            for c in sorted(inativos, key=lambda x: x["origem_display"]):
                print(f"    {c['origem_display']:50s} → {c['destino']}")

        if not ativos and not inativos:
            print(f"\n  Nenhum redirect cross-domain.")

        # Domínios sem cross-domain
        cross_origins = {c["origem"] for c in data["cross_domain"]}
        sem_cross = [(name, count) for name, count in data["dominios"] if name not in cross_origins]
        if sem_cross:
            print(f"\n  Apenas redirects internos ({len(sem_cross)}):")
            for name, count in sem_cross:
                label = f"{count} regra{'s' if count != 1 else ''}" if count > 0 else "sem regras"
                print(f"    {name:40s} | {label}")

    print()


def main():
    parser = argparse.ArgumentParser(description="Cloudflare Redirect Manager")
    parser.add_argument("--json", action="store_true", help="Saída em JSON")
    parser.add_argument("--yes", "-y", action="store_true", help="Pular confirmação")
    parser.add_argument("--conta", default="principal", help="Nome da conta Cloudflare")
    subparsers = parser.add_subparsers(dest="comando", required=True)

    # contas
    subparsers.add_parser("contas", help="Listar contas cadastradas")

    # conta-add
    p_add = subparsers.add_parser("conta-add", help="Adicionar nova conta")
    p_add.add_argument("nome", help="Nome da conta")
    p_add.add_argument("token", help="API Token")
    p_add.add_argument("account_id", help="Account ID")

    # conta-remover
    p_rem = subparsers.add_parser("conta-remover", help="Remover conta")
    p_rem.add_argument("nome", help="Nome da conta")

    # status
    subparsers.add_parser("status", help="Status de todas as contas (redirects cross-domain)")

    # listar
    subparsers.add_parser("listar", help="Listar zonas e suas redirect rules")

    # regras
    p_regras = subparsers.add_parser("regras", help="Detalhes das redirect rules de um domínio")
    p_regras.add_argument("dominio", help="Nome do domínio")

    # ativar
    p_ativar = subparsers.add_parser("ativar", help="Ativar redirect rules")
    p_ativar.add_argument("dominio", help="Nome do domínio")
    p_ativar.add_argument("rule_id", nargs="?", help="ID da rule")
    p_ativar.add_argument("--all", action="store_true", help="Ativar todas as regras do domínio")

    # desativar
    p_desativar = subparsers.add_parser("desativar", help="Desativar redirect rules")
    p_desativar.add_argument("dominio", help="Nome do domínio")
    p_desativar.add_argument("rule_id", nargs="?", help="ID da rule")
    p_desativar.add_argument("--all", action="store_true", help="Desativar todas as regras do domínio")

    # ativar-todos
    subparsers.add_parser("ativar-todos", help="Ativar todos os redirects de todas as zonas")

    # desativar-todos
    subparsers.add_parser("desativar-todos", help="Desativar todos os redirects de todas as zonas")

    # criar
    p_criar = subparsers.add_parser("criar", help="Criar redirect para domínio")
    p_criar.add_argument("dominio", help="Domínio de origem")
    p_criar.add_argument("destino", help="URL de destino")
    p_criar.add_argument("--status-code", type=int, default=301, choices=[301, 302, 307, 308], help="Código HTTP (301, 302, 307, 308)")

    # deletar
    p_deletar = subparsers.add_parser("deletar", help="Deletar uma redirect rule")
    p_deletar.add_argument("dominio", help="Nome do domínio")
    p_deletar.add_argument("rule_id", help="ID da rule")

    # criar-lote
    p_lote = subparsers.add_parser("criar-lote", help="Criar redirects em massa via CSV")
    p_lote.add_argument("arquivo", help="Caminho do arquivo CSV")

    args = parser.parse_args()

    # Comandos que não precisam de --conta
    if args.comando == "contas":
        cmd_contas(args)
        return
    if args.comando == "conta-add":
        cmd_conta_add(args)
        return
    if args.comando == "conta-remover":
        cmd_conta_remover(args)
        return
    if args.comando == "status":
        cmd_status(args)
        return

    api = CloudflareAPI.from_conta(args.conta)

    commands = {
        "listar": cmd_listar,
        "regras": cmd_regras,
        "ativar": cmd_ativar,
        "desativar": cmd_desativar,
        "ativar-todos": cmd_ativar_todos,
        "desativar-todos": cmd_desativar_todos,
        "criar": cmd_criar_handler,
        "deletar": cmd_deletar,
        "criar-lote": cmd_criar_lote,
    }

    commands[args.comando](api, args)


if __name__ == "__main__":
    main()
