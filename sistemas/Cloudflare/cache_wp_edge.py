"""
Ativa microcache de HTML na borda do Cloudflare para sites WordPress da rede.

Objetivo: aliviar origem PHP sobrecarregada (nó Hostinger com oversubscription).
Estrategia: Cache Rules (phase http_request_cache_settings) com duas regras:
  1. cache-everything (catch-all): cache=true, edge_ttl override_origin=300s (microcache),
     browser_ttl=respect_origin.
  2. bypass WP (admin/rest/cron/xmlrpc/POST/cookie-logado/busca/preview): cache=false.
  Ordem importa: no cache phase o ULTIMO match vence, entao bypass fica por ULTIMO.

Bypass inclui /wp-json => NAO cacheia o receptor do Antonio (publicacao de artigos).

Uso:
  python cache_wp_edge.py dominio1 [dominio2 ...]
  python cache_wp_edge.py --ttl 600 dominio1
  python cache_wp_edge.py --undo dominio1   # remove as 2 regras
"""
import json, os, sys, requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONTAS = json.load(open(os.path.join(SCRIPT_DIR, 'contas.json'), encoding='utf-8'))

DESC_CACHE = 'WP edge microcache HTML (rede QMIX)'
DESC_BYPASS = 'WP bypass cache admin/rest/cookie/POST (rede QMIX)'

BYPASS_EXPR = (
    '(http.request.uri.path contains "/wp-admin") or '
    '(http.request.uri.path contains "/wp-login") or '
    '(starts_with(http.request.uri.path, "/wp-json")) or '
    '(http.request.uri.path contains "/xmlrpc.php") or '
    '(http.request.uri.path contains "/wp-cron.php") or '
    '(http.request.method ne "GET") or '
    '(http.cookie contains "wordpress_logged_in") or '
    '(http.cookie contains "wp-postpass") or '
    '(http.cookie contains "comment_author") or '
    '(http.request.uri.query contains "s=") or '
    '(http.request.uri.query contains "preview=")'
)
CACHE_EXPR = '(starts_with(http.request.uri.path, "/"))'  # sempre verdadeiro


_INDEX = None   # {dominio: (conta, zone_id)}
_TOKEN_ERR = []  # contas cujo token falhou ao indexar


def build_index():
    """Lista as zonas de cada conta UMA vez (economico p/ rate-limit) e mapeia dominio->zona."""
    global _INDEX, _TOKEN_ERR
    if _INDEX is not None:
        return _INDEX
    _INDEX, _TOKEN_ERR = {}, []
    for c in CONTAS:
        h = {'Authorization': f'Bearer {c["token"]}'}
        page, ok_any = 1, False
        while True:
            try:
                r = requests.get(
                    f'https://api.cloudflare.com/client/v4/zones?account.id={c["account_id"]}&per_page=50&page={page}',
                    headers=h, timeout=25)
                data = r.json()
            except Exception:
                break
            if not data.get('success'):
                break
            ok_any = True
            for z in data['result']:
                _INDEX.setdefault(z['name'].lower(), (c, z['id']))
            if page >= data.get('result_info', {}).get('total_pages', 1):
                break
            page += 1
        if not ok_any:
            _TOKEN_ERR.append(c['nome'])
    return _INDEX


def localizar_zona(dominio):
    idx = build_index()
    hit = idx.get(dominio.lower())
    return (hit[0], hit[1]) if hit else (None, None)


def get_cache_ruleset(base, h):
    """Retorna (ruleset_id, rules[]) do entrypoint de cache; cria se nao existir."""
    r = requests.get(f'{base}/rulesets/phases/http_request_cache_settings/entrypoint', headers=h, timeout=25)
    d = r.json()
    if d.get('success'):
        rs = d['result']
        return rs['id'], rs.get('rules', []) or []
    # nao existe entrypoint: cria vazio (o PUT do entrypoint aceita SO 'rules'; 'name'/'kind'/'phase' dao 400)
    body = {'rules': []}
    r = requests.put(f'{base}/rulesets/phases/http_request_cache_settings/entrypoint', headers=h, json=body, timeout=25)
    d = r.json()
    if d.get('success'):
        return d['result']['id'], d['result'].get('rules', []) or []
    return None, None


def aplicar(dominio, ttl):
    c, zid = localizar_zona(dominio)
    if not zid:
        return dominio, 'ZONA NAO LOCALIZADA em nenhuma das 27 contas'
    h = {'Authorization': f'Bearer {c["token"]}', 'Content-Type': 'application/json'}
    base = f'https://api.cloudflare.com/client/v4/zones/{zid}'
    rs_id, rules = get_cache_ruleset(base, h)
    if not rs_id:
        return f'{dominio} ({c["nome"]})', 'falhou ao obter/criar ruleset de cache'

    existentes = {r.get('description', '') for r in rules}
    out = []

    cache_rule = {
        'action': 'set_cache_settings',
        'expression': CACHE_EXPR,
        'description': DESC_CACHE,
        'enabled': True,
        'action_parameters': {
            'cache': True,
            'edge_ttl': {'mode': 'override_origin', 'default': ttl},
            'browser_ttl': {'mode': 'respect_origin'},
        },
    }
    bypass_rule = {
        'action': 'set_cache_settings',
        'expression': BYPASS_EXPR,
        'description': DESC_BYPASS,
        'enabled': True,
        'action_parameters': {'cache': False},
    }

    # cache-everything primeiro (para o bypass, por ultimo, sobrepor onde casa)
    if DESC_CACHE not in existentes:
        r = requests.post(f'{base}/rulesets/{rs_id}/rules', headers=h, json=cache_rule, timeout=25)
        out.append('cache=OK' if r.json().get('success') else f'cache=ERRO({r.text[:120]})')
    else:
        out.append('cache=ja')
    if DESC_BYPASS not in existentes:
        r = requests.post(f'{base}/rulesets/{rs_id}/rules', headers=h, json=bypass_rule, timeout=25)
        out.append('bypass=OK' if r.json().get('success') else f'bypass=ERRO({r.text[:120]})')
    else:
        out.append('bypass=ja')

    return f'{dominio} ({c["nome"]})', f'ttl={ttl}s | ' + ' | '.join(out)


def desfazer(dominio):
    c, zid = localizar_zona(dominio)
    if not zid:
        return dominio, 'ZONA NAO LOCALIZADA'
    h = {'Authorization': f'Bearer {c["token"]}', 'Content-Type': 'application/json'}
    base = f'https://api.cloudflare.com/client/v4/zones/{zid}'
    rs_id, rules = get_cache_ruleset(base, h)
    if not rs_id:
        return dominio, 'sem ruleset'
    removidos = 0
    for r in rules:
        if r.get('description') in (DESC_CACHE, DESC_BYPASS):
            rr = requests.delete(f'{base}/rulesets/{rs_id}/rules/{r["id"]}', headers=h, timeout=25)
            if rr.status_code in (200, 204) or rr.json().get('success'):
                removidos += 1
    return f'{dominio} ({c["nome"]})', f'regras removidas={removidos}'


def main():
    args = sys.argv[1:]
    undo = '--undo' in args
    if undo:
        args.remove('--undo')
    ttl = 300
    if '--ttl' in args:
        i = args.index('--ttl')
        ttl = int(args[i + 1])
        del args[i:i + 2]
    if not args:
        print(__doc__)
        sys.exit(1)
    print(f'{"DESFAZENDO" if undo else "APLICANDO microcache"} em {len(args)} dominio(s)'
          f'{"" if undo else f", edge_ttl={ttl}s"}...\n')
    build_index()
    print(f'  indice: {len(_INDEX)} zonas visiveis em {len(CONTAS)-len(_TOKEN_ERR)}/{len(CONTAS)} contas'
          f' | contas sem resposta: {_TOKEN_ERR or "nenhuma"}\n')
    for d in args:
        label, status = (desfazer(d) if undo else aplicar(d, ttl))
        print(f'  {label:42s} {status}')


if __name__ == '__main__':
    main()
