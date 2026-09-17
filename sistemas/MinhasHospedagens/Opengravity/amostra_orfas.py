# -*- coding: utf-8 -*-
"""Mostra uma amostra das imagens que o limpa_disco.py apagaria.

Serve para conferir, ANTES de apagar, que sao mesmo restos de artigo podado e nao
arquivo em uso que a varredura deixou de ver.
"""
import glob
import io
import json
import os
import random
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
SLUG = sys.argv[1] if len(sys.argv) > 1 else 'publisherbrasil'
RX = re.compile(r'/img/([^"\'\s)>\\]+)')

cfg_txt = io.open('/opt/portal-engine/sites.json', encoding='utf-8').read()
IMG = '/srv/portais/%s/public/img' % SLUG
cit = set(RX.findall(cfg_txt))
for f in glob.glob('/srv/portais/%s/data/*.json' % SLUG):
    t = io.open(f, encoding='utf-8').read()
    cit.update(RX.findall(t))
    d = json.loads(t)
    if (d.get('image') or {}).get('file'):
        cit.add(d['image']['file'])
for f in glob.glob('/srv/portais/%s/public/**/*.html' % SLUG, recursive=True):
    cit.update(RX.findall(io.open(f, encoding='utf-8').read()))

orf = [a for a in os.listdir(IMG)
       if os.path.isfile(os.path.join(IMG, a)) and not a.startswith('_') and a not in cit]
print('  %s: %d citadas | %d orfas de %d arquivos'
      % (SLUG, len(cit), len(orf), len(os.listdir(IMG))))
random.seed(1)
for a in random.sample(orf, min(8, len(orf))):
    print('    %s' % a)
