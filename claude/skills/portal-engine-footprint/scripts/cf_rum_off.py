# -*- coding: utf-8 -*-
"""Desliga o Cloudflare Web Analytics (RUM) das zonas dos portais do Pages.
Usa o token do Pages (ganhou Account Settings Write em 17/09/2026).
uso (pelo cofre_run, segredos=["cloudflare-pages"]): python cf_rum_off.py dominios-pages.txt [--so-ver]
"""
import json, os, sys, urllib.request, urllib.error
# token vem do cofre: rodar via cofre_run com segredos=["cloudflare-pages"] (injeta CLOUDFLARE_PAGES)
pg = os.environ.get('CLOUDFLARE_PAGES') or sys.exit('sem CLOUDFLARE_PAGES no ambiente: rode pelo cofre_run com segredos=["cloudflare-pages"]')
tok = 'cfut_' + pg.split('cfut_')[1].strip().split()[0]
H = {'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'}
def call(m, u, body=None):
    r = urllib.request.Request('https://api.cloudflare.com/client/v4' + u, headers=H, method=m, data=json.dumps(body).encode() if body else None)
    try: return json.load(urllib.request.urlopen(r, timeout=60))
    except urllib.error.HTTPError as e:
        try: return json.load(e)
        except Exception: return {'success': False, 'errors': [{'message': 'HTTP %s' % e.code}]}
so_ver = '--so-ver' in sys.argv
doms = [l.strip() for l in open(sys.argv[1], encoding='utf-8') if l.strip()]
res = {'apagado': [], 'sem_rum': [], 'zona_fora': [], 'erro': []}
cache = {}
for d in doms:
    z = call('GET', '/zones?name=' + d)
    if not z.get('success') or not z['result']:
        res['zona_fora'].append(d); continue
    Z, acc = z['result'][0]['id'], z['result'][0]['account']['id']
    if acc not in cache:
        cache[acc] = call('GET', f'/accounts/{acc}/rum/site_info/list?per_page=500')
    ru = cache[acc]
    if not ru.get('success'):
        res['erro'].append(d + ': lista ' + json.dumps(ru.get('errors'))[:100]); continue
    alvos = [s for s in ru.get('result', []) if ((s.get('ruleset') or {}).get('zone_tag') == Z) or (s.get('host') in (d, 'www.' + d))]
    if not alvos:
        res['sem_rum'].append(d); continue
    for s in alvos:
        if so_ver: res['apagado'].append(d + ' (veria)'); continue
        x = call('DELETE', f'/accounts/{acc}/rum/site_info/{s["site_tag"]}')
        (res['apagado'] if x.get('success') else res['erro']).append(d if x.get('success') else d + ': ' + json.dumps(x.get('errors'))[:100])
for k, v in res.items():
    print(k, ':', len(v), v if len(v) <= 12 else '')
