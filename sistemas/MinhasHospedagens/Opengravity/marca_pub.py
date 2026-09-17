# -*- coding: utf-8 -*-
"""Monta a marca do publisherbrasil a partir do que a origem tinha.

⚠️ **A origem nao tem wordmark horizontal utilizavel.** O que existe e:

- `logo-BLOG-Publisher.webp`, 310x70: uma lampada acesa e a palavra "Blog" em
  amarelo. O nome do portal **nao aparece**
- `Publisher-Brasil.png`, 300x300: o anel de crescente limao sobre preto, com um
  segundo crescente cinza e "Publisher" em corpo minusculo no centro

Nenhum dos dois serve como logotipo de cabecalho: um nao tem o nome, o outro e
quadrado e so funciona sobre preto.

A saida e a mesma que a AS usou: **o simbolo se desenha** (o crescente e
geometrico e sai exato em vetor) e o nome vem como texto, na fonte de titulo do
portal. `logoImg` fica ausente de proposito.

O **favicon**, esse sim, sai do arquivo da origem: o anel limao sobre preto ja e
quadrado e legivel em 16px. Ele e recomposto com folga, porque o Google recorta o
favicon em circulo e as pontas do crescente encostam na borda.
"""
import io
import math
import sys

from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
D = 'logos/pub/'
PRETO = (13, 13, 13)

src = Image.open(D + 'Publisher-Brasil.png').convert('RGBA')
w, h = src.size
px = src.load()

# o desenho e claro sobre fundo escuro: a caixa sai dos pixels que nao sao pretos
x0, y0, x1, y1 = w, h, 0, 0
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a > 120 and (r + g + b) > 150:
            x0 = min(x0, x); y0 = min(y0, y); x1 = max(x1, x); y1 = max(y1, y)
corte = src.crop((x0, y0, x1 + 1, y1 + 1))
print('  desenho: %dx%d dentro de %dx%d' % (corte.size[0], corte.size[1], w, h))

LADO = 512
alvo_diag = 0.74 * LADO
esc = alvo_diag / math.hypot(*corte.size)
novo = corte.resize((max(1, int(corte.size[0] * esc)), max(1, int(corte.size[1] * esc))),
                    Image.LANCZOS)
fundo = Image.new('RGBA', (LADO, LADO), PRETO + (255,))
fundo.alpha_composite(novo, ((LADO - novo.size[0]) // 2, (LADO - novo.size[1]) // 2))
fundo.convert('RGB').save(D + 'publisherbrasil-favicon.png', 'PNG')
print('  publisherbrasil-favicon.png %dx%d, desenho em %dx%d'
      % (LADO, LADO, novo.size[0], novo.size[1]))
