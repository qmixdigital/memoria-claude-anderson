"""
Aplica o microcache HTML client-safe (mesmas regras do cache_wp_edge.py) usando UM token
mestre (arquivo .token_master, gitignored) que enxerga quase todas as zonas.

Uso:
  python cache_master.py dom1 [dom2 ...]      # aplica
  python cache_master.py --undo dom1 [...]    # remove as 2 regras
  python cache_master.py --list               # só lista zonas visíveis
Regras: cache-everything 300s + BYPASS (admin/login/wp-json/xmlrpc/cron/POST/cookie-logado/busca/preview).
NUNCA bloqueia: anônimo GET->cache; logado/form/admin->origem.
"""
import os, sys, requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TOKEN = open(os.path.join(SCRIPT_DIR, '.token_master'), encoding='utf-8').read().strip()
H = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
API = 'https://api.cloudflare.com/client/v4'

DESC_CACHE = 'WP edge microcache HTML (rede QMIX)'
DESC_BYPASS = 'WP bypass cache admin/rest/cookie/POST (rede QMIX)'
BYPASS_EXPR = (
    '(http.request.uri.path contains "/wp-admin") or (http.request.uri.path contains "/wp-login") or '
    '(starts_with(http.request.uri.path, "/wp-json")) or (http.request.uri.path contains "/xmlrpc.php") or '
    '(http.request.uri.path contains "/wp-cron.php") or (http.request.method ne "GET") or '
    '(http.cookie contains "wordpress_logged_in") or (http.cookie contains "wp-postpass") or '
    '(http.cookie contains "comment_author") or (http.request.uri.query contains "s=") or '
    '(http.request.uri.query contains "preview=")'
)


def zones_index():
    idx, page = {}, 1
    while True:
        r = requests.get(f'{API}/zones?per_page=50&page={page}', headers=H, timeout=25).json()
        if not r.get('success'):
            print('  ERRO ao listar zonas:', r.get('errors')); break
        for z in r['result']:
            idx.setdefault(z['name'].lower(), z['id'])
        info = r.get('result_info', {})
        if page >= info.get('total_pages', 1):
            break
        page += 1
    return idx


def cache_rules(ttl=300):
    return [
        {'action': 'set_cache_settings', 'expression': '(starts_with(http.request.uri.path, "/"))',
         'description': DESC_CACHE, 'enabled': True,
         'action_parameters': {'cache': True, 'edge_ttl': {'mode': 'override_origin', 'default': ttl},
                               'browser_ttl': {'mode': 'respect_origin'}}},
        {'action': 'set_cache_settings', 'expression': BYPASS_EXPR,
         'description': DESC_BYPASS, 'enabled': True, 'action_parameters': {'cache': False}},
    ]


def get_entrypoint(zid):
    base = f'{API}/zones/{zid}'
    r = requests.get(f'{base}/rulesets/phases/http_request_cache_settings/entrypoint', headers=H, timeout=25).json()
    if r.get('success'):
        return r['result']['id'], r['result'].get('rules', []) or []
    # 404: cria vazio (body só 'rules')
    r = requests.put(f'{base}/rulesets/phases/http_request_cache_settings/entrypoint', headers=H, json={'rules': []}, timeout=25).json()
    if r.get('success'):
        return r['result']['id'], r['result'].get('rules', []) or []
    return None, r.get('errors')


def aplicar(dom, zid):
    base = f'{API}/zones/{zid}'
    rs_id, rules = get_entrypoint(zid)
    if not rs_id:
        return f'FALHOU entrypoint: {rules}'
    existentes = {r.get('description', '') for r in rules}
    out = []
    for rule in cache_rules():
        if rule['description'] in existentes:
            out.append('ja'); continue
        r = requests.post(f'{base}/rulesets/{rs_id}/rules', headers=H, json=rule, timeout=25).json()
        out.append('OK' if r.get('success') else f'ERRO({r.get("errors")})')
    return 'cache=%s bypass=%s' % (out[0], out[1])


def desfazer(dom, zid):
    base = f'{API}/zones/{zid}'
    rs_id, rules = get_entrypoint(zid)
    n = 0
    for r in rules:
        if r.get('description') in (DESC_CACHE, DESC_BYPASS):
            rr = requests.delete(f'{base}/rulesets/{rs_id}/rules/{r["id"]}', headers=H, timeout=25)
            if rr.status_code in (200, 204) or rr.json().get('success'):
                n += 1
    return f'removidas={n}'


def main():
    v = requests.get(f'{API}/user/tokens/verify', headers=H, timeout=20).json()
    print('token verify:', v.get('success'), (v.get('result') or {}).get('status', ''))
    idx = zones_index()
    print(f'zonas visíveis pelo token: {len(idx)}\n')
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    undo = '--undo' in sys.argv
    if '--list' in sys.argv:
        for n in sorted(idx): print(' ', n)
        return
    for d in args:
        zid = idx.get(d.lower())
        if not zid:
            print(f'  {d:34s} ZONA NAO VISIVEL neste token'); continue
        status = desfazer(d, zid) if undo else aplicar(d, zid)
        print(f'  {d:34s} {status}')


if __name__ == '__main__':
    main()
