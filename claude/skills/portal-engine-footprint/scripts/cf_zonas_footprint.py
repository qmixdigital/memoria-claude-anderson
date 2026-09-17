# -*- coding: utf-8 -*-
"""
Nas zonas dos portais do Pages, com o token master:
  1. apaga a regra "Security headers (CSP/XFO/Permissions)" (http_response_headers_transform),
     que saia igual em 102 zonas; os cabecalhos agora vem do _headers de cada portal, variados;
  2. desliga o Cloudflare Web Analytics (RUM) da zona, se o token alcancar.
uso: python cf_zonas_footprint.py dominios-pages.txt [--so-ver]
"""
import json, sys, urllib.request, urllib.error
c = json.load(open('D:/SISTEMAS/Cloudflare/contas.json', encoding='utf-8'))
tok = [x for x in c if x['nome'] == 'master'][0]['token']
H = {'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'}
def call(m, u, body=None):
    r = urllib.request.Request('https://api.cloudflare.com/client/v4' + u, headers=H, method=m, data=json.dumps(body).encode() if body else None)
    try: return json.load(urllib.request.urlopen(r, timeout=60))
    except urllib.error.HTTPError as e:
        try: return json.load(e)
        except Exception: return {'success': False, 'errors': [{'message': 'HTTP %s' % e.code}]}
so_ver = '--so-ver' in sys.argv
doms = [l.strip() for l in open(sys.argv[1], encoding='utf-8') if l.strip()]
res = {'regra_apagada': [], 'sem_regra': [], 'zona_fora': [], 'erro': [], 'rum_off': [], 'rum_sem_acesso': 0}
rum_cache = {}
for d in doms:
    z = call('GET', '/zones?name=' + d)
    if not z.get('success') or not z['result']:
        res['zona_fora'].append(d); continue
    Z, acc = z['result'][0]['id'], z['result'][0]['account']['id']
    rs = call('GET', f'/zones/{Z}/rulesets/phases/http_response_headers_transform/entrypoint')
    regras = rs.get('result', {}).get('rules', []) if rs.get('success') else []
    alvo = [r for r in regras if 'Security headers' in (r.get('description') or '') or 'Permissions-Policy' in json.dumps(r.get('action_parameters', {}))]
    if not alvo:
        res['sem_regra'].append(d)
    elif so_ver:
        res['regra_apagada'].append(d + ' (veria)')
    else:
        ok = True
        for r in alvo:
            x = call('DELETE', f'/zones/{Z}/rulesets/{rs["result"]["id"]}/rules/{r["id"]}')
            if not x.get('success'): ok = False; res['erro'].append(d + ': ' + json.dumps(x.get('errors'))[:120])
        if ok: res['regra_apagada'].append(d)
    # RUM: lista por conta (uma vez) e apaga o site da zona
    if acc not in rum_cache:
        rum_cache[acc] = call('GET', f'/accounts/{acc}/rum/site_info/list?per_page=200')
    ru = rum_cache[acc]
    if not ru.get('success'):
        res['rum_sem_acesso'] += 1
    else:
        for si in ru.get('result', []):
            if (si.get('ruleset') or {}).get('zone_name') == d or si.get('host') in (d, 'www.' + d):
                if so_ver: res['rum_off'].append(d + ' (veria)'); continue
                x = call('DELETE', f'/accounts/{acc}/rum/site_info/{si["site_tag"]}')
                if x.get('success'): res['rum_off'].append(d)
                else: res['erro'].append(d + ' rum: ' + json.dumps(x.get('errors'))[:120])
for k, v in res.items():
    print(k, ':', (len(v) if isinstance(v, list) else v), (v if isinstance(v, list) and len(v) <= 12 else ''))
json.dump(res, open('cf_zonas_footprint.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
