# -*- coding: utf-8 -*-
"""O `defaultCategory` tem que existir no `categoryMap` do proprio portal.

Quando nao existe, o conteudo que a plataforma publica sem categoria cai numa
editoria que **nao tem listagem, nao esta no menu e nao entra em auditoria
nenhuma**. E o jeito silencioso de fabricar editoria orfa.

Aconteceu no divirto: veio "Noticias" da copia do portal anterior, e o divirto
nunca teve essa editoria.
"""
import io
import json
import os
import sys
import unicodedata

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


def slugify(t):
    t = unicodedata.normalize('NFKD', str(t or '')).encode('ascii', 'ignore').decode()
    return ''.join(c if c.isalnum() else '-' for c in t.lower()).strip('-')


cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
ruins = 0
for s in cfg['sites']:
    dc = s.get('defaultCategory')
    mapa = set()
    for v in (s.get('categoryMap') or {}).values():
        if isinstance(v, dict) and v.get('slug'):
            mapa.add(v['slug'])
    if not dc or not mapa:
        continue
    if slugify(dc) in mapa:
        continue
    # existe pagina no disco?
    base = s.get('categoryBase') or ''
    cam = os.path.join('/srv/portais', s['slug'], 'public', base, slugify(dc))
    tem = os.path.isfile(os.path.join(cam, 'index.html'))
    ruins += 1
    print('  %-24s defaultCategory=%-16s fora do mapa | pagina no disco: %s'
          % (s['slug'], dc, 'sim' if tem else 'NAO'))
print('  portais com defaultCategory fora do categoryMap: %d de %d' % (ruins, len(cfg['sites'])))
