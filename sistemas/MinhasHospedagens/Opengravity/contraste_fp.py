# -*- coding: utf-8 -*-
"""Mede o contraste do botao de fonte preferida em cada portal.

Le o CSS que o proprio motor gerou para o botao, tira a cor de fundo e a do
texto, e calcula a razao. A regua da rede e 4,5:1.

⚠️ A variante "cor do tema" usa `theme.primary` de fundo e `theme.onPrimary` de
texto: onde o `onPrimary` esta errado ou ausente, sai texto escuro sobre fundo
escuro, e nenhum auditor de HTML acusa, porque o elemento esta la e o texto
tambem.
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
    cls = m.group(1)
    # 🔴 sao DUAS regras para a mesma classe: a generica, sem cor, e a da
    # variante, com fundo e texto. Pegar so a primeira faz o script pular o
    # portal inteiro e o relatorio sair limpo sem ter medido nada
    regras = re.findall(r'\.' + re.escape(cls) + r'\{([^}]*)\}', t)
    if not regras:
        continue
    corpo = ' ;'.join(regras)
    bg = re.search(r'background:\s*([^;}]+)', corpo)
    fg = re.search(r'(?<![-\w])color:\s*([^;}]+)', corpo)
    if not bg or not fg:
        continue
    # ⚠️ o valor agora vem com `!important`: sem tirar, o hex nao converte
    # e o portal conta como reprovado sem ter sido medido
    b = bg.group(1).replace('!important', '').strip()
    f = fg.group(1).replace('!important', '').strip()
    rz = razao(f, b)
    marca = 'ok ' if (rz and rz >= 4.5) else '🔴 '
    if not rz or rz < 4.5:
        ruins.append((slug, dom, b, f, rz))
    print('  %s%-24s fundo %-9s texto %-9s %s'
          % (marca, slug, b, f, ('%.2f:1' % rz) if rz else 'nao calculei'))
print('  ---')
print('  abaixo de 4,5:1: %d' % len(ruins))
