# -*- coding: utf-8 -*-
"""Contraste do estado :hover do botao, que a medida no navegador nao alcanca.

⚠️ O `getComputedStyle` le o estado em repouso. O `:hover` da variante "cor do
tema" usa `theme.vivid` de fundo com o mesmo `onPrimary` de texto: onde o vivo e
claro, o hover fica branco sobre claro.
"""
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


def lum(h):
    h = h.strip().lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    try:
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    except Exception:
        return None
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def razao(a, b):
    la, lb = lum(a), lum(b)
    if la is None or lb is None:
        return None
    if la < lb:
        la, lb = lb, la
    return (la + 0.05) / (lb + 0.05)


cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
ruins = []
for s in cfg['sites']:
    slug, dom = s['slug'], (s.get('domain') or '')
    if not dom or dom.endswith('.local'):
        continue
    p = '/srv/portais/%s/public/index.html' % slug
    if not os.path.isfile(p):
        continue
    t = io.open(p, encoding='utf-8', errors='replace').read()
    m = re.search(r'<a class="([^"]+)"[^>]*data-fp="1"', t)
    if not m:
        continue
    r = re.search(r'\.' + re.escape(m.group(1)) + r':hover\{([^}]*)\}', t)
    if not r:
        continue
    bg = re.search(r'background:\s*([^;!}]+)', r.group(1))
    fg = re.search(r'(?<![-\w])color:\s*([^;!}]+)', r.group(1))
    if not bg or not fg:
        continue
    rz = razao(fg.group(1).strip(), bg.group(1).strip())
    if not rz or rz < 4.5:
        ruins.append((slug, bg.group(1).strip(), fg.group(1).strip(), rz))
        print('  🔴 %-24s hover: fundo %-9s texto %-9s %s'
              % (slug, bg.group(1).strip(), fg.group(1).strip(),
                 ('%.2f:1' % rz) if rz else '?'))
print('  hover abaixo de 4,5:1: %d' % len(ruins))
