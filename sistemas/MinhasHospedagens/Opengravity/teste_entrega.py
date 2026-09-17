# -*- coding: utf-8 -*-
"""Testa a entrega real da plataforma do Antonio em UM portal por maquina.

⚠️ **O motor devolve HTTP 201 mesmo quando barra slug repetido.** O status nao
prova nada: o que prova e o arquivo em `data/` e a URL respondendo no ar.

Publica, confere, e apaga em seguida. ⚠️ Artigo de teste deixa rastro no bloco
"Leia tambem" das vizinhas: depois de apagar, o portal e reconstruido.
"""
import io
import json
import os
import shutil
import subprocess
import sys
import time
import uuid

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
SLUG = sys.argv[1]
CFG = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
site = [x for x in CFG['sites'] if x['slug'] == SLUG][0]
ns = (site.get('ns') or '').rstrip('/')
if not ns.endswith('/v1'):
    ns += '/v1'
dom = site['domain']
teste = 'diagnostico-do-motor-%s' % uuid.uuid4().hex[:8]

payload = {'title': 'Diagnóstico do motor, não publicar', 'slug': teste,
           'content': '<p>Conteúdo de diagnóstico. Será apagado em seguida.</p>',
           'category': site.get('defaultCategory') or 'Notícias',
           'status': 'publish'}
r = subprocess.run(['curl', '-s', '-w', '\n%{http_code}', '-m', '30', '-X', 'POST',
                    '-H', 'Content-Type: application/json',
                    '-H', 'x-api-key: ' + site['apikey'],
                    '-d', json.dumps(payload, ensure_ascii=False),
                    'https://%s/%s/artigos' % (dom, ns)], capture_output=True, text=True)
linhas = r.stdout.strip().split('\n')
print('  %-20s POST %s -> %s' % (SLUG, ns, linhas[-1]))
time.sleep(5)

D = '/srv/portais/%s/data/%s.json' % (SLUG, teste)
existe = os.path.isfile(D)
print('  arquivo em data/: %s' % ('existe' if existe else 'NAO EXISTE'))
if existe:
    d = json.load(io.open(D, encoding='utf-8'))
    cat = (d.get('category') or {}).get('slug')
    url = ('/%s/' % teste) if site.get('flatUrl') else ('/%s/%s/' % (cat, teste))
    p = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-m', '20',
                        'https://%s%s' % (dom, url)], capture_output=True, text=True)
    print('  editoria: %-16s | URL no ar: %s -> %s' % (cat, url, p.stdout.strip()))
    os.remove(D)
    pub = '/srv/portais/%s/public%s' % (SLUG, url)
    if os.path.isdir(pub):
        shutil.rmtree(pub)
    subprocess.run(['runuser', '-u', 'portais', '--', 'node', '/tmp/reb.js', SLUG],
                   capture_output=True)
    print('  apagado e portal reconstruido')
