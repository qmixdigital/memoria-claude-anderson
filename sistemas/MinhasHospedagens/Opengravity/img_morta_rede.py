# -*- coding: utf-8 -*-
"""Tira do corpo a `<img>` que aponta para arquivo que nao existe no disco.

No medicodasmaos sao 27 imagens de corpo apontando para `/img/` sem arquivo: o
WordPress de origem **nao existe mais em lugar nenhum**, entao nao ha de onde
baixar. Reapontar so mudaria o endereco do 404, e o navegador desenha o icone de
quebrado do mesmo jeito.

A tag sai inteira, junto com o `figure` que a embrulha quando ela e a unica coisa
dentro dele. A legenda vai junto: ela descrevia a foto que saiu.

⚠️ So sai a imagem **do corpo**. A destacada tem tratamento proprio, e neste
portal todas elas existem.
"""
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
_B = chr(92) + 'b'
_S = chr(92) + 's'
RX = re.compile('(?is)<figure[^>]*>' + _S + '*<img' + _B + '[^>]*>.*?</figure>'
                '|<img' + _B + '[^>]*>')

tot = 0
for portal in sorted(os.listdir('/srv/portais')):
    D = '/srv/portais/%s/data' % portal
    IMG = '/srv/portais/%s/public/img' % portal
    if not os.path.isdir(D):
        continue
    n = 0
    for f in sorted(glob.glob(os.path.join(D, '*.json'))):
        d = json.load(io.open(f, encoding='utf-8'))
        c = d.get('content') or ''
        if '<img' not in c:
            continue

        def some(m):
            bloco = m.group(0)
            alvo = re.search(r'(?i)src="/img/([^"]+)"', bloco)
            if not alvo:
                return bloco
            return '' if not os.path.isfile(os.path.join(IMG, alvo.group(1))) else bloco

        novo = RX.sub(some, c)
        if novo != c:
            n += c.count('<img') - novo.count('<img')
            d['content'] = novo
            if APLICA:
                io.open(f, 'w', encoding='utf-8').write(
                    json.dumps(d, ensure_ascii=False, indent=2))
    if n:
        print('  %-22s %d imagem(ns) morta(s) removida(s)' % (portal, n))
        tot += n

print('  total: %d' % tot)
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
