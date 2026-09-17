# -*- coding: utf-8 -*-
"""Tira do corpo do folhar o bloco de imagem de abertura que veio do tema.

Quatro artigos trazem a foto de abertura **dentro do `content`**, embrulhada em
`entry-featured-image` ou `ct-featured-image`. O motor ja renderiza a destacada
no topo, entao a mesma foto aparece duas vezes, uma colada na outra.

⚠️ **O `destacada_no_corpo.py` da rede nao pega estes**: ele compara o nome do
arquivo da `image` com o `src` do corpo, e aqui o `src` do corpo aponta para
**outro tamanho** do mesmo arquivo, ou para o dominio raspado. O que identifica e
a classe do tema.

O `ct-featured-image` traz junto um `figcaption` com **link para `cbsnews.com`** e
texto vazio: legenda invisivel com link externo para veiculo estrangeiro.
"""
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/folhar/data'

BLOCOS = [
    re.compile(r'(?is)<figure[^>]*class="[^"]*ct-featured-image[^"]*"[^>]*>.*?</figure>\s*'),
    re.compile(r'(?is)<div[^>]*class="[^"]*entry-featured-image[^"]*"[^>]*>.*?</div>\s*'),
]

n = 0
for f in sorted(glob.glob(os.path.join(DATA, '*.json'))):
    d = json.load(io.open(f, encoding='utf-8'))
    c = d.get('content') or ''
    antes = c
    for rx in BLOCOS:
        c = rx.sub('', c)
    if c != antes:
        d['content'] = c
        n += 1
        print('  %-60s %d -> %d bytes' % (d['slug'][:60], len(antes), len(c)))
        if APLICA:
            io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

print('  artigos com a abertura duplicada no corpo: %d' % n)
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
