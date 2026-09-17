# -*- coding: utf-8 -*-
"""O icone do pontonaturalbrasil: os arcos de sinal da marca, em vetor.

A origem ja tinha o desenho isolado, em `favicon-PN-BRASIL.png`: tres arcos
concentricos e um ponto, verde vivo `#00FF30` sobre branco. Nao ha letra nenhuma
nele, entao desta vez o icone **se desenha**, e nao precisa embrulhar o PNG.

Duas correcoes sobre o arquivo da origem:

  - **verde vivo sobre branco some** na aba clara e na busca. O fundo passa a ser
    o verde profundo da paleta, e o traco fica no vivo
  - ⚠️ **o Google recorta o favicon em circulo.** Na origem os arcos encostam nos
    quatro cantos do quadrado e as pontas seriam cortadas. Aqui o conjunto cabe
    dentro do circulo inscrito, com folga.
"""
import io
import math
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
FUNDO = '#0B3D22'
VIVO = '#00FF30'
OX, OY = 146.0, 366.0     # o ponto de onde o sinal sai
RAIOS = [96, 172, 248]
LARG = 34


def arco(r):
    """Quarto de circunferencia do leste ao norte, em torno de (OX, OY)."""
    x1, y1 = OX + r, OY
    x2, y2 = OX, OY - r
    return 'M%.1f %.1f A%d %d 0 0 0 %.1f %.1f' % (x1, y1, r, r, x2, y2)


tracos = ''.join('<path d="%s"/>' % arco(r) for r in RAIOS)
SVG = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" '
       'height="512" role="img" aria-label="PN Brasil">'
       '<rect width="512" height="512" fill="%s"/>'
       '<g fill="none" stroke="%s" stroke-width="%d" stroke-linecap="round">%s</g>'
       '<circle cx="%.0f" cy="%.0f" r="30" fill="none" stroke="%s" stroke-width="%d"/>'
       '</svg>' % (FUNDO, VIVO, LARG, tracos, OX, OY, VIVO, LARG))

# a prova de que nada essencial sai do recorte circular do Google
pior = 0.0
for r in RAIOS:
    for g in range(0, 91, 5):
        x = OX + r * math.cos(math.radians(g))
        y = OY - r * math.sin(math.radians(g))
        pior = max(pior, math.hypot(x - 256, y - 256))
print('  ponto mais distante do centro: %.0f px de 256 (com o traco: %.0f)'
      % (pior, pior + LARG / 2))
io.open('icone-pnb.svg', 'w', encoding='utf-8', newline='\n').write(SVG)
print('  icone-pnb.svg %d bytes' % len(SVG))
