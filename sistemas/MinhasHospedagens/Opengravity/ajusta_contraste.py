# -*- coding: utf-8 -*-
"""Leva todos os pares de cor do tema para 4,5:1, com o menor empurrao possivel.

O que estava abaixo da regua, e onde isso aparece na tela:

  `muted`/`paper`     data, chapeu e credito. Texto pequeno, que e justamente
                      onde a regua mais importa. 3,5 a 4,4:1 em 31 portais
  `primary`/`paper`   **o link do corpo**, e o link do corpo e o backlink do
                      cliente, o produto desta rede
  `onPrimary`/`primary`  o texto do botao e da faixa cheia

⚠️ **O empurrao preserva matiz e saturacao.** So a luminosidade anda, um passo de
cada vez, ate cruzar a regua. Assim a cor da marca continua reconhecivel: o
carmim do diariopernambucano sai de `#DA3444` para um vizinho, e nao para outro
vermelho.

⚠️ **`onPrimary` se resolve escolhendo**, e nao empurrando: branco ou quase preto,
o que der mais contraste sobre a primaria. So se nenhum dos dois passar e que a
primaria anda.

A ordem importa: primaria primeiro, porque mexer nela muda o par seguinte.
"""
import colorsys
import io
import json
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
ALVO = 4.6
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


def hexa(r, g, b):
    return '#%02X%02X%02X' % (max(0, min(255, int(round(r)))),
                              max(0, min(255, int(round(g)))),
                              max(0, min(255, int(round(b)))))


def empurra(cor, fundo, alvo=ALVO):
    """Anda so a luminosidade, no sentido que afasta do fundo."""
    h = cor.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    hh, ll, ss = colorsys.rgb_to_hls(r, g, b)
    escuro = (lum(fundo) or 0) > 0.18   # fundo claro -> a cor tem que escurecer
    passo = -0.01 if escuro else 0.01
    atual = cor
    for _ in range(100):
        if (razao(atual, fundo) or 0) >= alvo:
            return atual
        ll = max(0.0, min(1.0, ll + passo))
        rr, gg, bb = colorsys.hls_to_rgb(hh, ll, ss)
        atual = hexa(rr * 255, gg * 255, bb * 255)
        if ll <= 0.0 or ll >= 1.0:
            break
    return atual


cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
mudou = 0
for s in cfg['sites']:
    t = s.get('theme') or {}
    arch = (s.get('fp') or {}).get('arch') or ''
    antes = dict(t)
    notas = []

    # 1. a primaria, que e a cor do link do corpo
    if t.get('primary') and t.get('paper') and (razao(t['primary'], t['paper']) or 9) < 4.5:
        t['primary'] = empurra(t['primary'], t['paper'])
        notas.append('primary %s->%s (%.1f)' % (antes['primary'], t['primary'],
                                                razao(t['primary'], t['paper'])))

    # 2. o texto sobre a primaria: escolher, e nao empurrar
    if t.get('primary') and t.get('onPrimary'):
        if (razao(t['onPrimary'], t['primary']) or 9) < 4.5:
            branco = razao('#FFFFFF', t['primary']) or 0
            escuro = razao('#101014', t['primary']) or 0
            melhor = '#FFFFFF' if branco >= escuro else '#101014'
            if max(branco, escuro) < 4.5:
                t['primary'] = empurra(t['primary'], melhor, 4.6)
            t['onPrimary'] = melhor
            notas.append('onPrimary %s->%s (%.1f)' % (antes['onPrimary'], t['onPrimary'],
                                                      razao(t['onPrimary'], t['primary'])))

    # 3. o muted, que e data, chapeu e credito
    if t.get('muted') and t.get('paper') and (razao(t['muted'], t['paper']) or 9) < 4.5:
        t['muted'] = empurra(t['muted'], t['paper'])
        notas.append('muted %s->%s (%.1f)' % (antes['muted'], t['muted'],
                                              razao(t['muted'], t['paper'])))

    # 4. o rodape
    fb = 'surface' if arch in CLARO else 'footerBg'
    ft = 'muted' if arch in CLARO else 'footerTx'
    if t.get(fb) and t.get(ft) and (razao(t[ft], t[fb]) or 9) < 4.5:
        t[ft] = empurra(t[ft], t[fb])
        notas.append('%s %s->%s (%.1f)' % (ft, antes.get(ft), t[ft], razao(t[ft], t[fb])))

    if notas:
        mudou += 1
        print('  %-22s %s' % (s['slug'], ' | '.join(notas)))

print('  portais ajustados: %d de %d' % (mudou, len(cfg['sites'])))
if APLICA and mudou:
    P = '/opt/portal-engine/sites.json'
    shutil.copyfile(P, P + '.bak-contraste-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline=chr(10)).write(
        json.dumps(cfg, ensure_ascii=False, indent=2))
    print('  gravado.')
elif not APLICA:
    print('  ensaio. rode com --aplica.')
