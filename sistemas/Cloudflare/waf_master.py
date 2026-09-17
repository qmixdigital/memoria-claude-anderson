"""
Segurança básica WAF (human-safe) via token mestre (.token_master), para todas as zonas
que o token enxerga. NADA que afete navegação de humano:
  R1 block  AI bots (User-Agent) — transparente
  R2 block  arquivos sensíveis (.env/.git/wp-config) — humano nunca pede
  R3 managed_challenge  cf.threat_score > 30 — desafio gerenciado (quase invisível), NÃO block
  R4 managed_challenge  wp-admin / wp-login — só login, não navegação
Não mexe em Settings (o token é cache+WAF; settings dá 403 e não é necessário aqui).
Idempotente: pula regra cuja description já existe. Limite Free = 5 regras/zona.

Uso:
  python waf_master.py dom1 dom2 ...     # zonas específicas
  python waf_master.py --all             # todas as zonas visíveis (pagina)
  python waf_master.py --all --limit 5   # piloto
"""
import os, sys, requests
from concurrent.futures import ThreadPoolExecutor, as_completed

SD = os.path.dirname(os.path.abspath(__file__))
TOKEN = open(os.path.join(SD, '.token_master'), encoding='utf-8').read().strip()
AI_EXPR = open(os.path.join(SD, 'ai_bots_expression.txt'), encoding='utf-8').read().strip()
H = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
API = 'https://api.cloudflare.com/client/v4'
LOG = os.path.join(SD, 'waf_master_applied.txt')

RULES = [
    {'action': 'block', 'expression': AI_EXPR,
     'description': 'AI Crawl Control - Block AI bots by User Agent', 'enabled': True},
    {'action': 'block',
     'expression': '(http.request.uri.path contains "/.env" or http.request.uri.path contains "/.git" or http.request.uri.path contains "/wp-config.php")',
     'description': 'Block arquivos sensiveis (.env, .git, wp-config)', 'enabled': True},
    {'action': 'managed_challenge', 'expression': '(cf.threat_score gt 30)',
     'description': 'Managed Challenge IPs com threat score >30 (human-safe)', 'enabled': True},
    {'action': 'managed_challenge',
     'expression': '(http.request.uri.path contains "/wp-admin" or http.request.uri.path contains "/wp-login")',
     'description': 'Managed Challenge em wp-admin, wp-login', 'enabled': True},
]


def zones_index():
    idx, page = {}, 1
    while True:
        r = requests.get(f'{API}/zones?per_page=50&page={page}', headers=H, timeout=25).json()
        if not r.get('success'):
            break
        for z in r['result']:
            idx.setdefault(z['name'].lower(), z['id'])
        if page >= r.get('result_info', {}).get('total_pages', 1):
            break
        page += 1
    return idx


def zone_by_name(dom):
    r = requests.get(f'{API}/zones?name={dom}', headers=H, timeout=20).json()
    return r['result'][0]['id'] if r.get('success') and r.get('result') else None


def firewall_ruleset(base):
    rs = requests.get(f'{base}/rulesets', headers=H, timeout=20).json().get('result', [])
    rid = next((r['id'] for r in rs if r.get('phase') == 'http_request_firewall_custom'), None)
    if rid:
        full = requests.get(f'{base}/rulesets/{rid}', headers=H, timeout=20).json()
        rules = full.get('result', {}).get('rules', []) if full.get('success') else []
        return rid, rules
    # cria vazio
    r = requests.post(f'{base}/rulesets', headers=H, timeout=20,
                      json={'name': 'default', 'kind': 'zone', 'phase': 'http_request_firewall_custom', 'rules': []}).json()
    return (r['result']['id'], []) if r.get('success') else (None, None)


def aplicar(dom, zid):
    base = f'{API}/zones/{zid}'
    rid, rules = firewall_ruleset(base)
    if not rid:
        return dom, 'FALHOU ruleset firewall'
    existentes = {r.get('description', '') for r in rules}
    livres = 5 - len(existentes)
    add, ja = 0, 0
    for rule in RULES:
        if rule['description'] in existentes:
            ja += 1; continue
        if livres <= 0:
            break
        r = requests.post(f'{base}/rulesets/{rid}/rules', headers=H, json=rule, timeout=20).json()
        if r.get('success'):
            add += 1; livres -= 1
    return dom, f'add={add} ja={ja}'


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    limit = int(sys.argv[sys.argv.index('--limit') + 1]) if '--limit' in sys.argv else None
    if '--all' in sys.argv:
        idx = zones_index()
        items = sorted(idx.items())
    else:
        items = [(d, zone_by_name(d)) for d in args]
    if limit:
        items = items[:limit]
    print(f'alvos: {len(items)}')
    ok = 0
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(aplicar, d, z): d for d, z in items if z}
        for f in as_completed(futs):
            d, st = f.result()
            print(f'  {d:34s} {st}')
            if 'FALHOU' not in st:
                ok += 1
                with open(LOG, 'a', encoding='utf-8') as fh:
                    fh.write(f'{d}\n')
    print(f'\nok={ok}/{len(items)}')


if __name__ == '__main__':
    main()
