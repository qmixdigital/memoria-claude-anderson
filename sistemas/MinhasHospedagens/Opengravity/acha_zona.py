# -*- coding: utf-8 -*-
"""Acha em QUAL conta da Cloudflare mora uma zona.

⚠️ O token "master" nao cobre tudo. O incast.com.br usa nameserver da Cloudflare
e mesmo assim `?name=` devolve vazio com ele: a zona esta em outra conta do
`contas.json`. Procurar zona so no master faz parecer que o dominio nao esta na
Cloudflare, e a virada para no meio.
"""
import io
import json
import sys
import urllib.error
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
DOM = sys.argv[1]
contas = json.load(io.open(r'D:\SISTEMAS\Cloudflare\contas.json', encoding='utf-8'))
for c in contas:
    tok = c.get('token')
    if not tok:
        continue
    try:
        r = urllib.request.Request(
            'https://api.cloudflare.com/client/v4/zones?name=' + DOM,
            headers={'Authorization': 'Bearer ' + tok})
        d = json.loads(urllib.request.urlopen(r, timeout=40).read().decode())
    except urllib.error.HTTPError as e:
        print('  %-12s HTTP %s' % (c.get('nome'), e.code))
        continue
    except Exception as e:
        print('  %-12s %s' % (c.get('nome'), str(e)[:50]))
        continue
    z = d.get('result') or []
    if z:
        print('  %-12s ACHOU  zona %s  status %s  account %s'
              % (c.get('nome'), z[0]['id'], z[0]['status'],
                 (z[0].get('account') or {}).get('name')))
