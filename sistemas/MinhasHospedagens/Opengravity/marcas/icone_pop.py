# -*- coding: utf-8 -*-
"""O icone do Popular Blog, em vetor, tirado do simbolo do proprio logotipo.

Um monitor com microfone e ondas dentro. Em 48px, que e a medida que o Google le
na busca, contorno fino de 2px vira borrao: aqui a moldura do monitor e cheia,
com a tela vazada, e o microfone e silhueta.

⚠️ As ondas do original saem: tres arcos finos somem em 48px e so sujam o
desenho.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
VINHO = '#8C1F15'
CREME = '#FBF7F6'

SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" '
    'role="img" aria-label="Popular Blog">'
    '<rect width="512" height="512" fill="%s"/>'
    # a moldura do monitor, cheia, com a tela vazada
    '<path d="M74 116 h364 a34 34 0 0 1 34 34 v212 a34 34 0 0 1-34 34 h-364 '
    'a34 34 0 0 1-34-34 v-212 a34 34 0 0 1 34-34 Z" fill="%s"/>'
    '<rect x="94" y="170" width="324" height="172" rx="12" fill="%s"/>'
    # o pe do monitor
    '<rect x="236" y="396" width="40" height="34" fill="%s"/>'
    '<rect x="158" y="430" width="196" height="30" rx="15" fill="%s"/>'
    # o microfone, silhueta cheia dentro da tela
    '<rect x="232" y="196" width="48" height="76" rx="24" fill="%s"/>'
    '<path d="M198 254 a58 58 0 0 0 116 0" fill="none" stroke="%s" stroke-width="18" '
    'stroke-linecap="round"/>'
    '<rect x="246" y="298" width="20" height="26" rx="9" fill="%s"/>'
    '</svg>' % (CREME, VINHO, CREME, VINHO, VINHO, VINHO, VINHO, VINHO)
)
io.open('icone-pop.svg', 'w', encoding='utf-8', newline='\n').write(SVG)
print('  icone-pop.svg %d bytes' % len(SVG))
