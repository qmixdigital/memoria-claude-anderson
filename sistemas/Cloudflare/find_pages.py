"""Find Cloudflare Pages projects matching given domains across all accounts."""
import json
import os
import sys
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CONTAS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "contas.json")
DOMAINS = ["teste-iptv.top", "teste-iptv.mov", "playmax.mov", "teste-iptv.nexus"]


def check_account(conta):
    """Return list of (domain, account_name, account_id, project_name) found in this account."""
    headers = {"Authorization": f"Bearer {conta['token']}"}
    results = []

    # 1) Check zones
    zones = []
    try:
        r = requests.get(
            f"https://api.cloudflare.com/client/v4/zones?account.id={conta['account_id']}&per_page=200",
            headers=headers, timeout=15
        )
        if r.status_code == 200:
            zones = [z["name"] for z in r.json().get("result", [])]
    except Exception as e:
        pass

    # 2) Check Pages projects
    pages = []
    try:
        r = requests.get(
            f"https://api.cloudflare.com/client/v4/accounts/{conta['account_id']}/pages/projects",
            headers=headers, timeout=15
        )
        if r.status_code == 200:
            for p in r.json().get("result", []):
                pages.append({
                    "name": p["name"],
                    "subdomain": p.get("subdomain", ""),
                    "domains": p.get("domains", []),
                })
    except Exception:
        pass

    for domain in DOMAINS:
        # Try to match by zone presence
        zone_match = domain in zones
        # Try to match by pages custom domain
        page_match = None
        for p in pages:
            if domain in p["domains"] or domain in p["name"] or domain.replace(".", "-") in p["name"]:
                page_match = p
                break
        if zone_match or page_match:
            results.append({
                "domain": domain,
                "account": conta["nome"],
                "account_id": conta["account_id"],
                "zone_match": zone_match,
                "pages_project": page_match["name"] if page_match else None,
                "pages_domains": page_match["domains"] if page_match else [],
            })
    return results, conta["nome"]


def main():
    with open(CONTAS_FILE) as f:
        contas = json.load(f)

    print(f"Buscando {len(DOMAINS)} dominios em {len(contas)} contas...")
    all_results = []
    with ThreadPoolExecutor(max_workers=10) as ex:
        futures = {ex.submit(check_account, c): c["nome"] for c in contas}
        for fut in as_completed(futures):
            try:
                results, conta_nome = fut.result()
                if results:
                    all_results.extend(results)
                    for r in results:
                        print(f"  [{r['account']}] {r['domain']}: zone={r['zone_match']}, project={r['pages_project']}, custom_domains={r['pages_domains']}")
            except Exception as e:
                print(f"  Erro em {futures[fut]}: {e}")

    print("\n=== SUMMARY ===")
    for d in DOMAINS:
        matches = [r for r in all_results if r["domain"] == d]
        if matches:
            for m in matches:
                print(f"{d} -> account={m['account']} ({m['account_id']}), project={m['pages_project']}")
        else:
            print(f"{d} -> NOT FOUND")


if __name__ == "__main__":
    main()
