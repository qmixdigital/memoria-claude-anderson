# -*- coding: utf-8 -*-
"""Clica TODO link do cabecalho e do rodape, item por item.

⚠️ Link de editoria montado a mao nao aparece em captura de tela: o menu fica
bonito e so quebra no clique. A unica forma de saber e pedir cada URL.

O teste vai pelo IP de origem, com o Host na mao: o DNS ainda nao virou.
"""
import io
import json
import re
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
IP = '77.37.69.175'
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
ruim = 0
for slug in ('saudeacessivel', 'saudicas', 'saudeemalta', 'revistatopsaude',
             'matogrossosaude'):
    s = [x for x in cfg['sites'] if x['slug'] == slug][0]
    host = s['baseUrl'].replace('https://', '').rstrip('/')
    t = io.open('/srv/portais/%s/public/index.html' % slug, encoding='utf-8').read()
    # so o cabecalho e o rodape
    cab = t[:t.find('<main')] if '<main' in t else t
    rod = t[t.rfind('<footer'):] if '<footer' in t else ''
    urls = []
    for parte in (cab, rod):
        for u in re.findall(r'href="(/[^"#?]*)"', parte):
            if u not in urls:
                urls.append(u)
    print('  %s (%d link[s] no cabecalho e no rodape)' % (host, len(urls)))
    for u in urls:
        r = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-m', '20',
                            '-H', 'Host: ' + host, 'http://%s%s' % (IP, u)],
                           capture_output=True, text=True)
        c = r.stdout.strip()
        if c != '200':
            print('     🔴 %-46s %s' % (u, c))
            ruim += 1
    print('     %d link(s) conferido(s), %s' % (len(urls), 'todos 200' if not ruim else 'ver acima'))
print('  links quebrados no total: %d' % ruim)
