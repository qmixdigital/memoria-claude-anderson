# -*- coding: utf-8 -*-
"""O icone da Revista Rumo sai do arquivo da origem, e nao de vetor desenhado.

A marca e um **R italico serifado** em rosa sobre petroleo, com um ponto coral.
Letra desenhada a mao em SVG sai errada, e ja foi ao ar marca com uma letra a
menos nesta rede. Fonte dentro de SVG tambem nao serve: depende de a fonte
existir na maquina que renderiza.

Entao aqui o caminho e outro: as sete medidas de PNG e o `.ico` saem do arquivo
de 512px da origem, e o `favicon.svg` que o `<head>` declara e um SVG que
**embrulha** esse PNG em base64. E SVG valido, o navegador renderiza igual, e o
desenho fica identico ao da marca.

⚠️ **Nao definir `iconSvg` no `sites.json`.** Se ele existir, o motor tenta
converter o SVG com o ImageMagick, e o renderizador interno nao desenha imagem
embutida: sairia um icone vazio. Com `favicon.svg` ja no disco e sem `iconSvg`, o
motor encontra o arquivo e nao mexe.
"""
import base64
import io
import os
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ORIG = '/tmp/rev-favicon.png'
PUB = '/srv/portais/revistarumo/public'
MED = [('icon-512.png', 512), ('icon-192.png', 192), ('favicon-144.png', 144),
       ('favicon-96.png', 96), ('favicon-48.png', 48), ('apple-touch-icon.png', 180)]
for nome, px in MED:
    subprocess.run(['convert', ORIG, '-resize', '%dx%d' % (px, px),
                    os.path.join(PUB, nome)], check=True)
    print('  %-22s %d px' % (nome, px))
subprocess.run(['convert', os.path.join(PUB, 'icon-512.png'), '-define',
                'icon:auto-resize=48,32,16', os.path.join(PUB, 'favicon.ico')], check=True)
b64 = base64.b64encode(open(os.path.join(PUB, 'icon-192.png'), 'rb').read()).decode()
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192" '
       'role="img" aria-label="Revista Rumo">'
       '<image width="192" height="192" href="data:image/png;base64,%s"/></svg>' % b64)
io.open(os.path.join(PUB, 'favicon.svg'), 'w', encoding='utf-8', newline=chr(10)).write(svg)
print('  favicon.svg %d KB (PNG de 192 embutido)' % (len(svg) // 1024))
subprocess.run(['chown', '-R', 'portais:portais', '/srv/portais/revistarumo'])
