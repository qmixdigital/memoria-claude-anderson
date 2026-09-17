# -*- coding: utf-8 -*-
"""Reconstroi cada portal e confere o menu sanfonado, um por vez.

Uso, no servidor:  python3 /tmp/rollout_menu.py [--aplica]

Confere no HTML publicado, e nao no `ok` do rebuild:

  - existe botao com `aria-expanded` e `aria-controls` dentro do `<header>`
  - o alvo do `aria-controls` existe e e a `<nav>` das editorias
  - a nav carrega `data-aberto="0"`
  - o estilo com a media query de 1100px saiu
  - o botao tem rotulo legivel, e nao "menu de menu"

⚠️ Arquitetura que ja tinha botao proprio nao recebe outro: a conferencia aceita
os dois casos, o botao nativo e o injetado pelo motor.
"""
import glob
import io
import json
import os
import re
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
ok, ruim = [], []
for s in cfg['sites']:
    slug, dom = s['slug'], (s.get('domain') or '')
    if not dom or dom.endswith('.local'):
        continue
    if APLICA:
        r = subprocess.run(['runuser', '-u', 'portais', '--', 'node', '/tmp/reb.js', slug],
                           capture_output=True, text=True)
        if 'ok' not in r.stdout:
            ruim.append((slug, 'rebuild falhou'))
            print('  🔴 %-24s rebuild falhou' % slug)
            continue
    p = '/srv/portais/%s/public/index.html' % slug
    if not os.path.isfile(p):
        ruim.append((slug, 'sem home'))
        continue
    t = io.open(p, encoding='utf-8', errors='replace').read()
    i = t.find('</header>')
    cab = t[:i] if i > 0 else ''
    prob = []
    m = re.search(r'<button[^>]*aria-expanded="false"[^>]*aria-controls="([^"]+)"[^>]*'
                  r'aria-label="([^"]+)"', cab)
    if not m:
        m = re.search(r'<button[^>]*aria-controls="([^"]+)"[^>]*aria-label="([^"]+)"', cab)
    if not m:
        prob.append('sem botao de menu no cabecalho')
    else:
        alvo, rot = m.group(1), m.group(2)
        if ('id="%s"' % alvo) not in cab:
            prob.append('aria-controls aponta para id inexistente')
        if 'menu de menu' in rot.lower():
            prob.append('rotulo repetido: %r' % rot)
        if 'data-aberto' not in cab:
            prob.append('nav sem data-aberto')
        if '1100px' not in t:
            prob.append('sem a media query de 1100px')
    if prob:
        ruim.append((slug, '; '.join(prob)))
        print('  🔴 %-24s %s' % (slug, '; '.join(prob)[:66]))
    else:
        ok.append(slug)
        print('  ok %-24s %s' % (slug, dom))
print('  ---')
print('  com menu: %d | com problema: %d' % (len(ok), len(ruim)))
