# -*- coding: utf-8 -*-
"""O icone do df8, em vetor, tirado do favicon que a origem ja tinha.

Um "8" branco e gordo sobre preto. Sao duas elipses cheias que se cruzam, mais
os dois vazados horizontais. Nao entra fonte nenhuma: glifo de fonte no favicon
depende de a fonte existir na maquina que renderiza, e ja deixou marca sem letra
nesta rede.

⚠️ O Google recorta o favicon em circulo na busca. O "8" fica dentro de uma zona
segura de raio 228, sem encostar na borda do quadrado.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
PRETO = '#0B0B0B'

SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" '
    'role="img" aria-label="DF8 News">'
    '<rect width="512" height="512" fill="%s"/>'
    # o 8: duas elipses cheias que se cruzam
    '<ellipse cx="256" cy="188" rx="120" ry="102" fill="#fff"/>'
    '<ellipse cx="256" cy="330" rx="133" ry="112" fill="#fff"/>'
    # os dois vazados, horizontais e pequenos, como no original
    '<ellipse cx="256" cy="182" rx="34" ry="19" fill="%s"/>'
    '<ellipse cx="256" cy="336" rx="42" ry="23" fill="%s"/>'
    '</svg>' % (PRETO, PRETO, PRETO)
)
io.open('icone-df8.svg', 'w', encoding='utf-8', newline='\n').write(SVG)
print('  icone-df8.svg %d bytes' % len(SVG))
