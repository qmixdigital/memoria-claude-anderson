# -*- coding: utf-8 -*-
"""Uma URL de artigo por portal, para a medida de cor no navegador."""
import glob
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
for s in cfg['sites']:
    dom = s.get('domain') or ''
    if not dom or dom.endswith('.local'):
        continue
    fs = sorted(glob.glob('/srv/portais/%s/data/*.json' % s['slug']))
    if not fs:
        continue
    d = json.load(io.open(fs[0], encoding='utf-8'))
    base = s['baseUrl'].rstrip('/')
    u = ('%s/%s/' % (base, d['slug'])) if s.get('flatUrl') else \
        ('%s/%s/%s/' % (base, (d.get('category') or {}).get('slug') or 'noticias', d['slug']))
    print('%s\t%s' % (s['slug'], u))
