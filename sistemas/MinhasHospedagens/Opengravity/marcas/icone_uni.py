# -*- coding: utf-8 -*-
"""O icone do UniversOneo: o "neo" do favicon da origem, em vetor.

O favicon da origem e a palavra "neo" em grotesco geometrico pesado, preta sobre
transparente. Duas coisas contra usa-la como esta:

  - **preto sobre transparente some** na aba do navegador em tema escuro
  - tres letras em 48px, que e a medida que o Google le, viram borrao

Letra desenhada a mao em SVG sai errada, entao a saida e outra: o icone fica com
o **"o" final**, que e um circulo perfeito no desenho da fonte, sobre o roxo da
paleta, com o filete amarelo do "blog" do logotipo por baixo. Circulo e filete se
desenham exatos em vetor, e o conjunto continua reconhecivel em 16px.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROXO = '#5B2AB5'
AMARELO = '#FFD400'

SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" '
    'role="img" aria-label="UniversOneo">'
    '<rect width="512" height="512" fill="%s"/>'
    # o "o" do logotipo: circulo grosso, como na fonte geometrica da marca
    '<circle cx="256" cy="228" r="122" fill="none" stroke="#fff" stroke-width="62"/>'
    # os dois filetes que ladeiam a palavra "blog" no logotipo
    '<path d="M96 404 h108 M308 404 h108" stroke="%s" stroke-width="26" '
    'stroke-linecap="round"/>'
    '</svg>' % (ROXO, AMARELO)
)
io.open('icone-uni.svg', 'w', encoding='utf-8', newline='\n').write(SVG)
print('  icone-uni.svg %d bytes' % len(SVG))
