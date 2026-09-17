# -*- coding: utf-8 -*-
"""Acha os portais em que o cabecalho EMPILHA no celular.

O botao injetado entra como irmao da `<nav>`. Se o contentor dos dois vira
coluna numa media query, o botao cai numa linha propria, embaixo da marca, e e
isso que o Anderson viu no barranews.

A deteccao le o CSS publicado: acha a classe do elemento que contem a nav e
procura, dentro de `@media` de largura maxima, regra que ponha
`flex-direction:column` nele.
"""
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
empilha, ok, semnav = [], [], []
for s in cfg['sites']:
    slug, dom = s['slug'], (s.get('domain') or '')
    if not dom or dom.endswith('.local'):
        continue
    p = '/srv/portais/%s/public/index.html' % slug
    if not os.path.isfile(p):
        continue
    t = io.open(p, encoding='utf-8', errors='replace').read()
    m = re.search(r'<nav id="([a-z0-9]+)"', t)
    if not m:
        semnav.append(slug)
        continue
    idn = m.group(1)
    # o contentor e a tag aberta imediatamente antes do botao
    i = t.find('data-mh="%s"' % idn)
    antes = t[:i]
    mm = None
    for x in re.finditer(r'<(div|header|section|nav)\b[^>]*class="([^"]+)"[^>]*>', antes):
        mm = x
    if not mm:
        ok.append(slug)
        continue
    classes = mm.group(2).split()
    achou = False
    for bloco in re.finditer(r'@media[^{]*max-width[^{]*\{((?:[^{}]|\{[^{}]*\})*)\}', t):
        corpo = bloco.group(1)
        for c in classes:
            for r in re.finditer(r'\.' + re.escape(c) + r'\s*\{([^}]*)\}', corpo):
                if 'flex-direction:column' in r.group(1).replace(' ', ''):
                    achou = True
    (empilha if achou else ok).append(slug)

print('  cabecalho que EMPILHA no celular: %d' % len(empilha))
for s in empilha:
    print('     🔴 %s' % s)
print('  em linha: %d | sem nav injetada (menu proprio): %d' % (len(ok), len(semnav)))
