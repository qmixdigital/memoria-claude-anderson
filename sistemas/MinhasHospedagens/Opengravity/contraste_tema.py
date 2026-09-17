# -*- coding: utf-8 -*-
"""Contraste de TODOS os pares de cor que o tema usa como texto sobre fundo.

O rodape foi o que apareceu na tela, mas a regra vale para o tema inteiro. Sete
pares, todos com a regua de 4,5:1 para texto normal:

  ink/paper e ink/surface        o texto corrido
  dek/paper e dek/surface        a linha fina e o resumo do cartao
  muted/paper                    data, chapeu e credito
  primary/paper                  link e titulo de secao
  footerTx/footerBg              o rodape
  onPrimary/primary              texto sobre a cor da marca

⚠️ 3:1 basta para **texto grande**, mas nao da para saber pelo tema quais pares
so aparecem grande. A regua aqui e a de texto normal, e o que passa raspando fica
marcado.
"""
import io
import json
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
CLARO = {'U'}


def lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def lum(h):
    h = str(h or '').lstrip('#')
    if len(h) != 6:
        return None
    try:
        r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    except ValueError:
        return None
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def razao(a, b):
    la, lb = lum(a), lum(b)
    if la is None or lb is None:
        return None
    if la < lb:
        la, lb = lb, la
    return (la + 0.05) / (lb + 0.05)


PARES = [('ink', 'paper'), ('ink', 'surface'), ('dek', 'paper'), ('dek', 'surface'),
         ('muted', 'paper'), ('primary', 'paper'), ('onPrimary', 'primary')]
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
ruins = 0
for s in cfg['sites']:
    t = s.get('theme') or {}
    arch = (s.get('fp') or {}).get('arch') or ''
    linhas = []
    for a, b in PARES:
        r = razao(t.get(a), t.get(b))
        if r is not None and r < 4.5:
            linhas.append('%s/%s %.1f' % (a, b, r))
    fb = t.get('surface') if arch in CLARO else t.get('footerBg')
    ft = t.get('muted') if arch in CLARO else t.get('footerTx')
    r = razao(fb, ft)
    if r is not None and r < 4.5:
        linhas.append('rodape %.1f' % r)
    if linhas:
        ruins += 1
        print('  %-22s %s' % (s['slug'], ' | '.join(linhas)))
print('  portais com algum par abaixo de 4,5:1: %d de %d' % (ruins, len(cfg['sites'])))
