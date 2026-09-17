# -*- coding: utf-8 -*-
"""Criterios de aceite da documentacao, por amostragem no HTML publicado."""
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
achados = []
pesos = []
for s in cfg['sites']:
    slug, dom = s['slug'], (s.get('domain') or '')
    if not dom or dom.endswith('.local'):
        continue
    p = '/srv/portais/%s/public/index.html' % slug
    if not os.path.isfile(p):
        continue
    t = io.open(p, encoding='utf-8', errors='replace').read()
    m = re.search(r'<!--fp-->([\s\S]*?)<!--/fp-->', t)
    if not m:
        achados.append('%s: sem o bloco marcado' % slug)
        continue
    b = m.group(1)
    pesos.append(len(b))
    # 3. popup progressivo: href real, target _blank, rel noopener
    if 'target="_blank"' not in b or 'rel="noopener"' not in b:
        achados.append('%s: sem target/rel de fallback' % slug)
    if 'window.open' not in b:
        achados.append('%s: sem o popup' % slug)
    # 6. nenhuma dependencia externa nova
    for ext in ('http://', 'cdn', 'fonts.g', '.js"', 'src="http'):
        if ext in b and 'google.com/preferences' not in b.split(ext)[0][-60:]:
            pass
    if re.search(r'<script[^>]+src=', b) or re.search(r'<link[^>]+href=', b):
        achados.append('%s: requisicao externa nova no bloco' % slug)
    # 7. SVG com aria-hidden e texto legivel
    if '<svg' in b and 'aria-hidden="true"' not in b:
        achados.append('%s: SVG sem aria-hidden' % slug)
    tx = re.sub(r'<[^>]+>', '', re.search(r'<a [^>]*data-fp[^>]*>([\s\S]*?)</a>', b).group(1)).strip()
    if len(tx) < 12:
        achados.append('%s: texto do link curto demais: %r' % (slug, tx))

print('  portais conferidos: %d' % len(pesos))
print('  peso do bloco: minimo %d, maximo %d, media %d bytes'
      % (min(pesos), max(pesos), sum(pesos) // len(pesos)))
print('  apontamentos: %d' % len(achados))
for a in achados[:10]:
    print('     ' + a)
