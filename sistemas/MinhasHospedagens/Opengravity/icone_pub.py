# -*- coding: utf-8 -*-
"""O icone do publisherbrasil: os dois crescentes da marca, em vetor.

⚠️ O favicon da origem traz a palavra "Publisher" em corpo minusculo no centro do
anel. Em 16px, que e a medida que o navegador usa na aba, ela vira borrao; e o
Google le o favicon em 48px, onde tambem nao se resolve. **Texto nao entra em
icone.**

O que fica e o gesto: o **crescente limao** por fora e o **crescente cinza** por
dentro, exatamente como na marca. Os dois se desenham com circulos, entao saem
exatos em qualquer medida.

⚠️ O Google recorta o favicon em circulo: os dois crescentes cabem no circulo
inscrito com folga.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
FUNDO = '#0D0D0D'
LIMAO = '#DFFB00'
CINZA = '#4A4A4A'

SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" '
    'role="img" aria-label="Publisher Brasil">'
    '<rect width="512" height="512" fill="%s"/>'
    # o crescente limao: circulo cheio menos um circulo do fundo, deslocado
    '<circle cx="256" cy="250" r="178" fill="%s"/>'
    '<circle cx="286" cy="286" r="152" fill="%s"/>'
    # o crescente cinza, virado para o outro lado
    '<circle cx="286" cy="292" r="132" fill="%s"/>'
    '<circle cx="262" cy="258" r="112" fill="%s"/>'
    '</svg>' % (FUNDO, LIMAO, FUNDO, CINZA, FUNDO)
)
io.open('icone-pub.svg', 'w', encoding='utf-8', newline='\n').write(SVG)
print('  icone-pub.svg %d bytes' % len(SVG))
