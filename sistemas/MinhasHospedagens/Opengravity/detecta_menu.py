# -*- coding: utf-8 -*-
"""Detecta menu sanfonado no HTML publicado, aceitando os TRES padroes.

⚠️ Procurar so `aria-expanded` dentro do `<header>` acusa falso positivo em
massa: ha arquitetura com a `<nav>` **depois** do `</header>`, e ha arquitetura
que resolve o menu **sem JavaScript**, com `<input type="checkbox">` e `<label>`,
que e um padrao legitimo e nao tem botao nenhum.

O que conta como menu sanfonado:
  1. botao com `aria-expanded` e `aria-controls`
  2. `<input type="checkbox">` com `<label>` que o controla, o truque CSS puro
  3. o botao que o proprio motor injeta, com `data-mh`
"""
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
tem, falta = [], []
for s in cfg['sites']:
    slug, dom = s['slug'], (s.get('domain') or '')
    if not dom or dom.endswith('.local'):
        continue
    p = '/srv/portais/%s/public/index.html' % slug
    if not os.path.isfile(p):
        continue
    t = io.open(p, encoding='utf-8', errors='replace').read()
    k = t.find('<main')
    topo = t[:k] if k > 0 else t
    botao = bool(re.search(r'<button[^>]*aria-expanded', topo)) and 'aria-controls' in topo
    caixa = bool(re.search(r'<input[^>]+type="checkbox"', topo)) and '<label' in topo
    motor = 'data-mh=' in topo
    if botao or caixa or motor:
        qual = 'botao' if botao else ('checkbox' if caixa else 'motor')
        tem.append((slug, qual))
    else:
        falta.append(slug)
print('  com menu: %d | sem menu: %d' % (len(tem), len(falta)))
for s in falta:
    print('     🔴 %s' % s)
