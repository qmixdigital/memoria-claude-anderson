# -*- coding: utf-8 -*-
"""Troca as quatro ancoras "blog" que apontam para a home do saberdefato.

⚠️ O `conserta_dois.py` nao pegou estas: ele so troca a ancora quando o destino e
um **artigo**, para poder usar o titulo dele. Aqui o destino e a **home**, que nao
tem arquivo em `data/`.

Ancora generica nao passa autoridade. Para a home a regra da rede e usar a
palavra-chave do portal com **variacao natural**: nenhum texto ancora se repete.
"""
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/saberdefato/data'

# uma variacao por artigo: nenhuma se repete
NOVAS = {
    'tenis-para-corrida-masculino': 'Saber de Fato',
    'a-importancia-do-sono-para-os-bebes': 'nossas dicas conferidas',
    'como-tirar-manchas-de-desodorante-da-roupa': 'o portal Saber de Fato',
    'como-escolher-travesseiro': 'a página inicial do Saber de Fato',
}
RX = re.compile(r'(?i)(<a\s[^>]*href="/"[^>]*>)(\s*blog\s*)(</a>)')

n = 0
for slug, texto in sorted(NOVAS.items()):
    caminho = os.path.join(DATA, slug + '.json')
    if not os.path.isfile(caminho):
        print('  ⚠️ nao existe: %s' % slug)
        continue
    d = json.load(io.open(caminho, encoding='utf-8'))
    c = d.get('content') or ''
    novo, k = RX.subn(lambda m: m.group(1) + texto + m.group(3), c, count=1)
    if not k:
        print('  ⚠️ nao achei a ancora em %s' % slug)
        continue
    print('  %-46s "blog" -> "%s"' % (slug[:46], texto))
    n += 1
    if APLICA:
        d['content'] = novo
        io.open(caminho, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

print('  ancoras trocadas: %d' % n)
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
