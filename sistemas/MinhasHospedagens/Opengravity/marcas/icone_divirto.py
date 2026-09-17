# -*- coding: utf-8 -*-
"""O icone do divirto, em vetor, tirado do favicon que a origem ja tinha.

Um globo com meridianos cortado por uma faixa horizontal. Na origem a faixa traz
a palavra "News"; aqui ela sai. Em 48px, que e a medida que o Google le na busca,
a palavra vira borrao, e letra desenhada a mao em SVG sai errada: ja foi ao ar
marca com uma letra a menos nesta rede. O que carrega a marca e o globo cortado
pela faixa.

O portal e escuro, entao o icone e ambar sobre grafite, e nao grafite sobre
branco como estava na origem: assim ele aparece na aba do navegador em vez de
sumir.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
GRAFITE = '#141416'
AMBAR = '#FFC93C'

SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" '
    'role="img" aria-label="Divirto">'
    '<rect width="512" height="512" fill="%s"/>'
    '<g fill="none" stroke="%s" stroke-width="26">'
    '<circle cx="256" cy="256" r="176"/>'
    '<ellipse cx="256" cy="256" rx="82" ry="176"/>'
    '<path d="M92 196 h328 M92 316 h328"/>'
    '</g>'
    # ⚠️ a palavra "News" da faixa NAO entra. Em 48px ela vira borrao, e letra
    # desenhada a mao em SVG sai errada: ja foi ao ar marca com uma letra a
    # menos nesta rede. A faixa sozinha ja carrega o desenho
    '<rect x="40" y="224" width="432" height="64" fill="%s"/>'
    '<rect x="40" y="224" width="432" height="64" fill="none" stroke="%s" stroke-width="16"/>'
    '</svg>' % (GRAFITE, AMBAR, AMBAR, GRAFITE)
)
io.open('icone-divirto.svg', 'w', encoding='utf-8', newline='\n').write(SVG)
print('  icone-divirto.svg %d bytes' % len(SVG))
