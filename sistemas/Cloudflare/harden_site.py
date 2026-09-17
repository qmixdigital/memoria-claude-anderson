"""
Aplica pacote de hardening de segurança contra DDoS em uma zona Cloudflare.

Uso:
  python harden_site.py <dominio>            # aplica em 1 zona, localiza conta automaticamente
  python harden_site.py <dominio1> <dominio2> ...   # aplica em várias zonas

Aplicado:
  - SSL Full Strict, TLS 1.2+, Always HTTPS, TLS 1.3
  - HSTS 1 ano + includeSubDomains + preload + nosniff
  - DNSSEC
  - Security Level HIGH, 0-RTT, Early Hints, Always Online
  - 5 WAF Custom Rules: AI bots block, .env/.git block, threat>30 block,
    challenge admin/login, sem User-Agent block
  - Rate Limit: 5req/10s em /admin, /login, /wp-login.php

Limites no plano Free:
  - WAF Custom Rules: 5 (atinge o limite)
  - Rate Limit: período fixo 10s + timeout 10s

Para mais proteção (Bot Fight Mode, Managed WAF, Rate Limit flexível): plano Pro+
"""
import json, sys, os, requests
from concurrent.futures import ThreadPoolExecutor, as_completed

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONTAS = json.load(open(os.path.join(SCRIPT_DIR, 'contas.json')))
CONTAS_MAP = {c['nome']: c for c in CONTAS}

# Carrega expression de AI bots (mesma do lepur.com.br)
AI_EXPR_FILE = os.path.join(SCRIPT_DIR, 'ai_bots_expression.txt')
with open(AI_EXPR_FILE, encoding='utf-8') as f:
    AI_EXPR = f.read().strip()


def localizar_zona(dominio):
    """Procura em todas as contas o zone_id do dominio."""
    for c in CONTAS:
        try:
            h = {'Authorization': f'Bearer {c["token"]}'}
            page = 1
            while True:
                r = requests.get(
                    f'https://api.cloudflare.com/client/v4/zones?account.id={c["account_id"]}&per_page=50&page={page}',
                    headers=h
                )
                data = r.json()
                if not data.get('success'):
                    break
                for z in data['result']:
                    if z['name'].lower() == dominio.lower():
                        return c['nome'], z['id']
                if page >= data.get('result_info', {}).get('total_pages', 1):
                    break
                page += 1
        except Exception:
            pass
    return None, None


def aplicar(zone):
    conta_nome, zid = localizar_zona(zone)
    if not zid:
        return zone, 'ZONA NAO LOCALIZADA'
    c = CONTAS_MAP[conta_nome]
    h = {'Authorization': f'Bearer {c["token"]}', 'Content-Type': 'application/json'}
    BASE = f'https://api.cloudflare.com/client/v4/zones/{zid}'
    out = []

    settings = [
        ('ssl', 'strict'),
        ('min_tls_version', '1.2'),
        ('always_use_https', 'on'),
        ('security_level', 'high'),
        ('0rtt', 'on'),
        ('early_hints', 'on'),
        ('always_online', 'on'),
        ('tls_1_3', 'on'),
        ('opportunistic_encryption', 'on'),
        ('automatic_https_rewrites', 'on'),
        ('browser_check', 'on'),
        ('email_obfuscation', 'on'),
        ('brotli', 'on'),
        ('http3', 'on'),
    ]
    s_ok = 0
    for key, val in settings:
        r = requests.patch(f'{BASE}/settings/{key}', headers=h, json={'value': val})
        if r.json().get('success'):
            s_ok += 1
    out.append(f'settings={s_ok}/{len(settings)}')

    hsts = {'value': {'strict_transport_security': {
        'enabled': True, 'max_age': 31536000, 'include_subdomains': True,
        'preload': True, 'nosniff': True
    }}}
    r = requests.patch(f'{BASE}/settings/security_header', headers=h, json=hsts)
    out.append(f'HSTS={"OK" if r.json().get("success") else "X"}')

    r = requests.patch(f'{BASE}/dnssec', headers=h, json={'status': 'active'})
    out.append(f'DNSSEC={"OK" if r.json().get("success") else "X"}')

    r = requests.get(f'{BASE}/rulesets', headers=h)
    waf_rs = next((rs['id'] for rs in r.json().get('result', []) if rs.get('phase') == 'http_request_firewall_custom'), None)
    rate_rs = next((rs['id'] for rs in r.json().get('result', []) if rs.get('phase') == 'http_ratelimit'), None)

    waf_rules = [
        {'action': 'block', 'expression': AI_EXPR,
         'description': 'AI Crawl Control - Block AI bots by User Agent', 'enabled': True},
        {'action': 'block',
         'expression': '(http.request.uri.path contains "/.env" or http.request.uri.path contains "/.git" or http.request.uri.path contains "/wp-config.php")',
         'description': 'Block arquivos sensiveis (.env, .git, wp-config)', 'enabled': True},
        {'action': 'block', 'expression': '(cf.threat_score gt 30)',
         'description': 'Block IPs com threat score >30', 'enabled': True},
        {'action': 'managed_challenge',
         'expression': '(http.request.uri.path contains "/admin" or http.request.uri.path contains "/wp-admin" or http.request.uri.path contains "/wp-login" or http.request.uri.path contains "/login")',
         'description': 'Managed Challenge em /admin, /login', 'enabled': True},
        {'action': 'block', 'expression': '(http.user_agent eq "" or http.user_agent eq "-")',
         'description': 'Block requests sem User-Agent (bots)', 'enabled': True},
    ]
    waf_ok = 0
    if waf_rs:
        r = requests.get(f'{BASE}/rulesets/{waf_rs}', headers=h)
        existentes = {x.get('description', '') for x in r.json()['result'].get('rules', [])}
        for rule in waf_rules:
            if rule['description'] in existentes:
                waf_ok += 1
                continue
            r = requests.post(f'{BASE}/rulesets/{waf_rs}/rules', headers=h, json=rule)
            if r.json().get('success'):
                waf_ok += 1
    else:
        body = {'name': 'default', 'kind': 'zone', 'phase': 'http_request_firewall_custom', 'rules': waf_rules}
        r = requests.post(f'{BASE}/rulesets', headers=h, json=body)
        if r.json().get('success'):
            waf_ok = len(waf_rules)
    out.append(f'WAF={waf_ok}/5')

    rl_rule = {
        'action': 'block',
        'expression': '(http.request.uri.path eq "/admin" or http.request.uri.path eq "/login" or http.request.uri.path eq "/wp-login.php")',
        'description': 'Rate limit /admin /login 5req/10s', 'enabled': True,
        'ratelimit': {'characteristics': ['ip.src', 'cf.colo.id'], 'period': 10,
                      'requests_per_period': 5, 'mitigation_timeout': 10}
    }
    if rate_rs:
        r = requests.get(f'{BASE}/rulesets/{rate_rs}', headers=h)
        existentes = {x.get('description', '') for x in r.json()['result'].get('rules', [])}
        if rl_rule['description'] in existentes:
            out.append('RL=OK(ja)')
        else:
            r = requests.post(f'{BASE}/rulesets/{rate_rs}/rules', headers=h, json=rl_rule)
            out.append(f'RL={"OK" if r.json().get("success") else "X"}')
    else:
        body = {'name': 'default', 'kind': 'zone', 'phase': 'http_ratelimit', 'rules': [rl_rule]}
        r = requests.post(f'{BASE}/rulesets', headers=h, json=body)
        out.append(f'RL={"OK" if r.json().get("success") else "X"}')

    return f'{zone} ({conta_nome})', ' | '.join(out)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    dominios = sys.argv[1:]
    print(f'Aplicando hardening em {len(dominios)} zona(s)...\n')
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(aplicar, d): d for d in dominios}
        for fut in as_completed(futs):
            label, status = fut.result()
            print(f'  {label:45s} {status}')


if __name__ == '__main__':
    main()
