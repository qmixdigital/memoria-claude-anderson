# -*- coding: utf-8 -*-
"""O icone do In Cast, em vetor, tirado do simbolo do proprio logotipo.

O portal nao tinha `site_icon` no WordPress: o campo estava em 0. O que existe e
o microfone com balao de fala do logotipo, e e ele que vira icone.

Marinho de fundo, microfone branco, balao vermelho. Em 48px, que e a medida que o
Google le na busca, o microfone continua reconhecivel porque e silhueta cheia, e
nao contorno fino.

⚠️ Nenhuma letra: letra desenhada a mao em SVG sai errada, e ja foi ao ar marca
com uma letra a menos nesta rede.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
MARINHO = '#054A91'
VERMELHO = '#E30D13'

SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" '
    'role="img" aria-label="In Cast">'
    '<rect width="512" height="512" fill="%s"/>'
    # corpo do microfone, capsula cheia
    '<rect x="196" y="86" width="120" height="212" rx="60" fill="#fff"/>'
    # as tres estrias da capsula, na cor do fundo
    '<rect x="214" y="132" width="84" height="16" rx="8" fill="%s"/>'
    '<rect x="214" y="176" width="84" height="16" rx="8" fill="%s"/>'
    '<rect x="214" y="220" width="84" height="16" rx="8" fill="%s"/>'
    # o arco do suporte
    '<path d="M138 236 a118 118 0 0 0 236 0" fill="none" stroke="#fff" stroke-width="30" '
    'stroke-linecap="round"/>'
    # a haste
    '<rect x="240" y="340" width="32" height="52" rx="14" fill="#fff"/>'
    # o balao de fala do logotipo, em vermelho: corpo arredondado com a ponta
    # apontando para baixo e para a esquerda, como no original
    '<path d="M186 386 h140 a30 30 0 0 1 30 30 v46 a30 30 0 0 1-30 30 h-58 '
    'l-62 40 v-40 h-20 a30 30 0 0 1-30-30 v-46 a30 30 0 0 1 30-30 Z" fill="%s"/>'
    '</svg>' % (MARINHO, MARINHO, MARINHO, MARINHO, VERMELHO)
)
io.open('icone-incast.svg', 'w', encoding='utf-8', newline='\n').write(SVG)
print('  icone-incast.svg %d bytes' % len(SVG))
