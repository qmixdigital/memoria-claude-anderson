# -*- coding: utf-8 -*-
"""Apara o fim dos `metaTitle` que ficaram pendurados numa palavra vazia.

O corte em fronteira de palavra resolve o comprimento e cria outro problema: o
titulo termina em preposicao ou artigo, e o resultado da busca fica com frase
pela metade:

    "Como o funil de vendas pode auxiliar na administracao do seu"
    "Sou um profissional de TI. Qual e o melhor caminho para"

Aqui as palavras vazias do fim saem, ate sobrar palavra com conteudo. Fica mais
curto e le como frase inteira.

⚠️ Nao mexe no `title` nem no `h1`: so no `metaTitle`, que existe justamente para
isso.

⚠️ Nao apara abaixo de 30 caracteres: melhor um titulo com preposicao no fim do
que um titulo que nao diz nada.
"""
import glob
import io
import json
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv

VAZIAS = {'de', 'do', 'da', 'dos', 'das', 'a', 'o', 'as', 'os', 'e', 'em', 'no', 'na',
          'nos', 'nas', 'para', 'por', 'com', 'sem', 'que', 'se', 'ao', 'aos', 'à', 'às',
          'um', 'uma', 'uns', 'umas', 'seu', 'sua', 'seus', 'suas', 'meu', 'minha',
          'este', 'esta', 'esse', 'essa', 'isso', 'como', 'mais', 'menos', 'ou', 'mas',
          'pelo', 'pela', 'num', 'numa', 'até', 'ate', 'sobre', 'entre', 'apos', 'após',
          'qual', 'quais', 'é', 'e_', 'the', 'of'}

n = 0
for f in sorted(glob.glob('/srv/portais/*/data/*.json')):
    d = json.load(io.open(f, encoding='utf-8'))
    mt = (d.get('metaTitle') or '').strip()
    if not mt:
        continue
    # ⚠️ metaTitle escrito a mao tambem pode passar de 60: dois artigos tinham
    # 69 e 70, e o script anterior os pulou justamente por ja terem o campo
    novo = mt
    if len(novo) > 60:
        corte = novo[:61]
        i = corte.rfind(' ')
        if i > 30:
            novo = corte[:i].rstrip(' .,;:–-')
    while True:
        m = re.search(r'\s+([\wÀ-ÿ\'’]+)[\s.,;:–-]*$', novo)
        if not m or m.group(1).lower() not in VAZIAS:
            break
        cand = novo[:m.start()].rstrip(' .,;:–-')
        if len(cand) < 30:
            break
        novo = cand
    novo = novo.rstrip(' .,;:–-')
    if novo != mt and len(novo) >= 30:
        portal = f.split('/srv/portais/')[1].split('/')[0]
        print('  %-18s %-34s %-58s -> %s' % (portal, d['slug'][:34], mt[:58], novo[:58]))
        n += 1
        if APLICA:
            d['metaTitle'] = novo
            io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

print('  metaTitle aparados: %d' % n)
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
