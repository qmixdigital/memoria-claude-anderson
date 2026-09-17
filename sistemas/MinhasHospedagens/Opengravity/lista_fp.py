# -*- coding: utf-8 -*-
"""Lista final, uma linha por portal, para colar em planilha."""
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
MAQ = sys.argv[1]
ESTILO = ['azul solido', 'contorno azul', 'pilula escura', 'cor do tema']
ICONE = ['G do Google', 'estrela', 'sem icone']
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
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
        continue
    b = m.group(1)
    cls = (re.search(r'<a class="([^"]+)"', b) or ['', ''])[1]
    url = (re.search(r'(https://google\.com/preferences/source\?q=[^"]+)', b) or ['', ''])[1]
    txt = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', re.search(
        r'<a [^>]*data-fp[^>]*>([\s\S]*?)</a>', b).group(1))).strip()
    x = 0
    for ch in url.split('q=')[1]:
        x = (x * 31 + ord(ch)) & 0xFFFFFFFF
    est = ESTILO[(x // 13) % 4]
    ico = ICONE[(x // 17) % 3]
    art = len(glob.glob('/srv/portais/%s/data/*.json' % slug))
    print('\t'.join([dom, s.get('name') or '', MAQ, s['fp']['arch'], cls, est, ico,
                     str(art), txt, url]))
