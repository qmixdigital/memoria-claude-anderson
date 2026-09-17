# Cloudflare Redirect Manager — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Python CLI script to manage Cloudflare Single Redirect Rules across all zones, operated via Claude Code in VS Code.

**Architecture:** Single-file Python script (`cf_redirects.py`) using `requests` + `python-dotenv`. CLI via `argparse` with subcommands. API calls wrapped in a `CloudflareAPI` class. Parallel zone fetching via `ThreadPoolExecutor`.

**Tech Stack:** Python 3.10+, requests, python-dotenv, argparse, concurrent.futures

**Spec:** `docs/superpowers/specs/2026-03-24-cloudflare-redirect-manager-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `.env` | API token and account ID (never committed) |
| `.gitignore` | Excludes `.env` |
| `requirements.txt` | Python dependencies |
| `cf_redirects.py` | Main script: CLI parsing, API class, all commands |
| `CLAUDE.md` | Instructions for Claude Code to use the script |

---

### Task 1: Project Setup

**Files:**
- Create: `d:\SISTEMAS\Cloudflare\.gitignore`
- Create: `d:\SISTEMAS\Cloudflare\.env`
- Create: `d:\SISTEMAS\Cloudflare\requirements.txt`

- [ ] **Step 1: Create `.gitignore`**

```
.env
__pycache__/
```

- [ ] **Step 2: Create `.env`**

```env
CF_API_TOKEN=<<REMOVIDO>>
CF_ACCOUNT_ID=9ecbf885a61a34c6ac4d73033fa0f497
```

Note: User must replace `<<REMOVIDO>>` with their new API token after revoking the exposed one.

- [ ] **Step 3: Create `requirements.txt`**

```
requests>=2.31.0
python-dotenv>=1.0.0
```

- [ ] **Step 4: Install dependencies**

Run: `pip install -r requirements.txt`
Expected: Both packages install successfully.

- [ ] **Step 5: Verify setup**

Run: `python -c "import requests; from dotenv import load_dotenv; print('OK')"`
Expected: `OK`

---

### Task 2: CloudflareAPI Class — Core

**Files:**
- Create: `d:\SISTEMAS\Cloudflare\cf_redirects.py`

The core API class with authentication, retry logic, and zone listing.

- [ ] **Step 1: Create `cf_redirects.py` with CloudflareAPI class**

```python
import os
import sys
import json
import csv
import argparse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
import requests

load_dotenv()

BASE_URL = "https://api.cloudflare.com/client/v4"
REDIRECT_PHASE = "http_request_dynamic_redirect"


class CloudflareAPI:
    def __init__(self):
        self.token = os.getenv("CF_API_TOKEN")
        self.account_id = os.getenv("CF_ACCOUNT_ID")
        if not self.token or not self.account_id:
            print("Erro: CF_API_TOKEN e CF_ACCOUNT_ID devem estar definidos no .env")
            sys.exit(1)
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def _request(self, method, endpoint, data=None):
        url = f"{BASE_URL}{endpoint}"
        for attempt in range(3):
            resp = getattr(requests, method)(url, headers=self.headers, json=data)
            if resp.status_code in (429, 500, 502, 503):
                delay = (2 ** attempt)
                print(f"  Retry {attempt + 1}/3 em {delay}s (HTTP {resp.status_code})...")
                time.sleep(delay)
                continue
            result = resp.json()
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
```

- [ ] **Step 2: Test the core class loads correctly**

Run: `python -c "from cf_redirects import CloudflareAPI; api = CloudflareAPI(); zones = api.get_all_zones(); print(f'{len(zones)} zonas encontradas')"`
Expected: `42 zonas encontradas`

---

### Task 3: Command `listar`

**Files:**
- Modify: `d:\SISTEMAS\Cloudflare\cf_redirects.py`

- [ ] **Step 1: Add `cmd_listar` function after the CloudflareAPI class**

```python
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
```

- [ ] **Step 2: Test `listar`**

Run: `python cf_redirects.py listar`
Expected: List of 42 zones with redirect rule counts. `cinemateca.com.br` should show `2 regras (2 ativas, 0 inativas)`.

---

### Task 4: Command `regras`

**Files:**
- Modify: `d:\SISTEMAS\Cloudflare\cf_redirects.py`

- [ ] **Step 1: Add `cmd_regras` function**

```python
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
```

- [ ] **Step 2: Test `regras`**

Run: `python cf_redirects.py regras cinemateca.com.br`
Expected: Shows 2 rules with details for cinemateca.com.br.

---

### Task 5: Commands `ativar` and `desativar`

**Files:**
- Modify: `d:\SISTEMAS\Cloudflare\cf_redirects.py`

**Key discovery from API testing:** PATCH on individual rules requires the full rule body (action, expression, action_parameters, enabled). The flow is: GET rule → modify `enabled` → PATCH with full body.

- [ ] **Step 1: Add `_toggle_rule` helper and `cmd_ativar`/`cmd_desativar`**

```python
def _toggle_rule(api, zone_name, rule_id_or_all, enabled):
    action = "Ativando" if enabled else "Desativando"
    zone = api.get_zone_by_name(zone_name)
    if not zone:
        return
    ruleset, rules = api.get_redirect_rules(zone["id"])
    if not rules:
        print(f"Nenhuma regra de redirect em {zone_name}.")
        return

    targets = rules if rule_id_or_all == "--all" else [r for r in rules if r["id"] == rule_id_or_all]
    if not targets:
        print(f"Regra '{rule_id_or_all}' não encontrada em {zone_name}.")
        print(f"  IDs disponíveis:")
        for r in rules:
            print(f"    {r['id']} — {r.get('description', 'Sem descrição')}")
        return

    for rule in targets:
        if rule.get("enabled") == enabled:
            status = "ativa" if enabled else "inativa"
            print(f"  [{rule.get('description', rule['id'])}] já está {status}. Pulando.")
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
            status = "ativada" if enabled else "desativada"
            print(f"  [{rule.get('description', rule['id'])}] {status} com sucesso.")
        else:
            print(f"  Erro ao atualizar [{rule.get('description', rule['id'])}].")


def cmd_ativar(api, args):
    if not args.rule_id and not args.all:
        print("Erro: informe o rule_id ou use --all para ativar todas as regras.")
        return
    rule_target = "--all" if args.all else args.rule_id
    _toggle_rule(api, args.dominio, rule_target, True)


def cmd_desativar(api, args):
    if not args.rule_id and not args.all:
        print("Erro: informe o rule_id ou use --all para desativar todas as regras.")
        return
    rule_target = "--all" if args.all else args.rule_id
    _toggle_rule(api, args.dominio, rule_target, False)
```

- [ ] **Step 2: Test desativar a specific rule**

Run: `python cf_redirects.py desativar cinemateca.com.br f16cb69e56dd4577b750e2db3ffcefb4`
Expected: `[Redirecionar para um domínio diferente] desativada com sucesso.`

- [ ] **Step 3: Verify it's disabled**

Run: `python cf_redirects.py regras cinemateca.com.br`
Expected: Rule #2 shows `[INATIVA]`.

- [ ] **Step 4: Re-enable it**

Run: `python cf_redirects.py ativar cinemateca.com.br f16cb69e56dd4577b750e2db3ffcefb4`
Expected: `[Redirecionar para um domínio diferente] ativada com sucesso.`

---

### Task 6: Commands `ativar-todos` and `desativar-todos`

**Files:**
- Modify: `d:\SISTEMAS\Cloudflare\cf_redirects.py`

- [ ] **Step 1: Add `cmd_ativar_todos` and `cmd_desativar_todos`**

```python
def _toggle_all(api, enabled, yes=False):
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
        print("Nenhuma regra de redirect encontrada em nenhuma zona.")
        return

    if not yes:
        print(f"\n{action} {total_rules} regras em {len(all_zone_rules)} zonas. Continuar? (s/n): ", end="")
        if input().strip().lower() != "s":
            print("Cancelado.")
            return

    for zone, ruleset, rules in sorted(all_zone_rules, key=lambda x: x[0]["name"]):
        print(f"\n  {zone['name']}:")
        for rule in rules:
            if rule.get("enabled") == enabled:
                status = "ativa" if enabled else "inativa"
                print(f"    [{rule.get('description', rule['id'])}] já está {status}.")
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
                status = "ativada" if enabled else "desativada"
                print(f"    [{rule.get('description', rule['id'])}] {status}.")


def cmd_ativar_todos(api, args):
    _toggle_all(api, True, yes=args.yes)


def cmd_desativar_todos(api, args):
    _toggle_all(api, False, yes=args.yes)
```

- [ ] **Step 2: Test (dry run — just check it lists rules before confirming)**

Run: `echo "n" | python cf_redirects.py desativar-todos`
Expected: Shows count of rules and zones, then `Cancelado.`

---

### Task 7: Command `criar`

**Files:**
- Modify: `d:\SISTEMAS\Cloudflare\cf_redirects.py`

- [ ] **Step 1: Add `cmd_criar` function**

```python
def cmd_criar(api, zone_name, destino, status_code=301):
    zone = api.get_zone_by_name(zone_name)
    if not zone:
        return

    # Strip www. prefix if user passed it
    domain = zone_name.lstrip("www.")
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
        print(f"Redirect criado: {domain} → {destino} (HTTP {status_code})")
    elif result is None:
        # Check if it was a rule limit error (already printed by _request)
        pass


def cmd_criar_handler(api, args):
    destino = args.destino
    if not destino.startswith("https://"):
        destino = f"https://{destino}"
    cmd_criar(api, args.dominio, destino, args.status_code)
```

- [ ] **Step 2: Verify command loads (don't create a real rule yet — save for integration test)**

Run: `python -c "from cf_redirects import cmd_criar; print('OK')"`
Expected: `OK`

---

### Task 8: Commands `deletar` and `criar-lote`

**Files:**
- Modify: `d:\SISTEMAS\Cloudflare\cf_redirects.py`

- [ ] **Step 1: Add `cmd_deletar` function**

```python
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
        print(f"Regra [{rule.get('description', args.rule_id)}] deletada de {args.dominio}.")
    else:
        print(f"Erro ao deletar regra de {args.dominio}.")
```

- [ ] **Step 2: Add `cmd_criar_lote` function**

```python
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

    print(f"Criando {len(rows)} redirects...\n")
    for row in rows:
        origem = row.get("origem", "").strip()
        destino = row.get("destino", "").strip()
        try:
            status_code = int(row.get("status_code", "301").strip())
        except ValueError:
            print(f"  status_code inválido para {origem}: '{row.get('status_code')}' — usando 301.")
            status_code = 301
        if not origem or not destino:
            print(f"  Linha inválida: {row} — pulando.")
            continue
        if not destino.startswith("https://"):
            destino = f"https://{destino}"
        cmd_criar(api, origem, destino, status_code)
```

- [ ] **Step 3: Verify both functions load**

Run: `python -c "from cf_redirects import cmd_deletar, cmd_criar_lote; print('OK')"`
Expected: `OK`

---

### Task 9: CLI Argument Parser (main)

**Files:**
- Modify: `d:\SISTEMAS\Cloudflare\cf_redirects.py`

- [ ] **Step 1: Add the argparse main block at the end of the file**

```python
def main():
    parser = argparse.ArgumentParser(description="Cloudflare Redirect Manager")
    parser.add_argument("--json", action="store_true", help="Saída em JSON")
    parser.add_argument("--yes", "-y", action="store_true", help="Pular confirmação")
    subparsers = parser.add_subparsers(dest="comando", required=True)

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
    p_criar.add_argument("--status-code", type=int, default=301, help="Código HTTP (301, 302, 307, 308)")

    # deletar
    p_deletar = subparsers.add_parser("deletar", help="Deletar uma redirect rule")
    p_deletar.add_argument("dominio", help="Nome do domínio")
    p_deletar.add_argument("rule_id", help="ID da rule")

    # criar-lote
    p_lote = subparsers.add_parser("criar-lote", help="Criar redirects em massa via CSV")
    p_lote.add_argument("arquivo", help="Caminho do arquivo CSV")

    args = parser.parse_args()
    api = CloudflareAPI()

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
```

- [ ] **Step 2: Test help**

Run: `python cf_redirects.py --help`
Expected: Shows all subcommands with descriptions.

- [ ] **Step 3: Full integration test — listar**

Run: `python cf_redirects.py listar`
Expected: Lists all 42 zones with rule counts.

- [ ] **Step 4: Full integration test — regras**

Run: `python cf_redirects.py regras cinemateca.com.br`
Expected: Shows 2 rules with full details.

- [ ] **Step 5: Full integration test — desativar + ativar**

Run: `python cf_redirects.py desativar cinemateca.com.br f16cb69e56dd4577b750e2db3ffcefb4`
Then: `python cf_redirects.py regras cinemateca.com.br` (verify INATIVA)
Then: `python cf_redirects.py ativar cinemateca.com.br f16cb69e56dd4577b750e2db3ffcefb4`
Then: `python cf_redirects.py regras cinemateca.com.br` (verify ATIVA)

- [ ] **Step 6: Test JSON output**

Run: `python cf_redirects.py --json listar`
Expected: Valid JSON array with zone names, IDs, and rule counts.

---

### Task 10: CLAUDE.md

**Files:**
- Create: `d:\SISTEMAS\Cloudflare\CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md**

```markdown
# Cloudflare Redirect Manager

Gerenciador de Single Redirect Rules da Cloudflare via CLI Python.

## Setup

- Token e Account ID estão em `.env` — NUNCA expor o token em mensagens
- Dependências: `pip install -r requirements.txt`

## Como usar

Quando o usuário pedir algo relacionado a redirects Cloudflare, execute o comando apropriado:

| Pedido do usuário | Comando |
|-------------------|---------|
| "liste os domínios" / "quais domínios têm redirect?" | `python cf_redirects.py listar` |
| "mostre as regras do X" | `python cf_redirects.py regras X` |
| "desative o redirect do X" | `python cf_redirects.py desativar X --all` ou com rule_id específico |
| "ative o redirect do X" | `python cf_redirects.py ativar X --all` ou com rule_id específico |
| "desative todos os redirects" | `python cf_redirects.py --yes desativar-todos` |
| "ative todos os redirects" | `python cf_redirects.py --yes ativar-todos` |
| "redirecione X para Y" | `python cf_redirects.py criar X Y` |
| "delete a regra Z do domínio X" | `python cf_redirects.py deletar X Z` |
| "redirecione esses domínios (lista)" | Criar CSV temporário e rodar `python cf_redirects.py criar-lote arquivo.csv` |

## Flags globais

- `--json`: saída em JSON (usar quando precisar parsear o resultado)
- `--yes` / `-y`: pular confirmação em operações em massa

## Notas

- Use `--json` quando precisar extrair IDs ou dados estruturados
- Para ativar/desativar uma regra específica, primeiro rode `regras <dominio>` para obter o rule_id
- O script usa `d:\SISTEMAS\Cloudflare` como diretório de trabalho
```

- [ ] **Step 2: Verify CLAUDE.md is readable**

Run: `python -c "open('CLAUDE.md').read(); print('OK')"`
Expected: `OK`

---

### Task 11: Final Validation

- [ ] **Step 1: Run full command suite verification**

Run each command and verify no errors:
```
python cf_redirects.py --help
python cf_redirects.py listar
python cf_redirects.py --json listar
python cf_redirects.py regras cinemateca.com.br
python cf_redirects.py --json regras cinemateca.com.br
```

- [ ] **Step 2: Remind user to rotate API token**

Print message: "IMPORTANTE: O token exposto nesta conversa deve ser revogado. Crie um novo token no dashboard da Cloudflare e atualize o arquivo .env"
