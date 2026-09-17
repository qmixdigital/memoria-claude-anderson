# -*- coding: utf-8 -*-
"""A regua tambem no mapa do site e nas ultimas listagens fora dela.

O mapa do site (`/indice-geral/`, `/todas-as-noticias/` e os outros 16 nomes que
o motor sorteia) tem descricao propria, escrita direto no `render.js`, com 89 a
95 caracteres. Ela nao passava pelo `_descNaRegua`.

⚠️ Passar a descricao pela regua aqui e melhor do que alongar o molde: o
complemento sai do `metaDescription` de cada portal, entao os 34 mapas nao ficam
com a mesma frase.
"""
import io
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
s = io.open(P, encoding='utf-8').read()

A = ("desc: `Mapa do site do ${site.name}: todo o conteúdo organizado por editoria "
     "para navegação rápida.`")
B = ("desc: _descNaRegua(site, `Mapa do site do ${site.name}: todo o conteúdo organizado "
     "por editoria para navegação rápida.`)")
if A not in s:
    print('  nao achei a descricao do mapa do site')
    raise SystemExit(1)
if B in s:
    print('  ja aplicado')
    raise SystemExit()
s = s.replace(A, B, 1)
print('  descricao do mapa do site agora passa pela regua')
if not APLICA:
    print('  ensaio. rode com --aplica.')
    raise SystemExit()
shutil.copyfile(P, P + '.bak-descmapa-' + time.strftime('%Y%m%d-%H%M%S'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  gravado.')
