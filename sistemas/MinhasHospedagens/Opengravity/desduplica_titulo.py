# -*- coding: utf-8 -*-
"""Desfaz o titulo repetido pondo a diferenca onde ela SOBREVIVE ao corte.

🔴 O sufixo acrescentado no fim do titulo nao serve: o motor corta o `<title>`
em 60 caracteres com a marca junto, e a parte que diferenciava e justamente a
que some. Os dois artigos continuam competindo na busca e o mesmo texto ancora
segue servindo a dois destinos, sem que nada no acervo pareca errado.

O conserto e um `metaTitle` proprio, curto, com a diferenca no COMECO. O `title`
volta ao original, porque ele e o `h1` da pagina e nao tem limite de 60.

⚠️ O slug nao muda nunca: ele e o endereco que o cliente comprou.
"""
import collections
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
PORTAIS = ('saudeacessivel', 'saudicas', 'saudeemalta', 'revistatopsaude', 'matogrossosaude')

for SLUG in PORTAIS:
    D = '/srv/portais/%s/data' % SLUG
    porTitulo = collections.defaultdict(list)
    for f in sorted(glob.glob(D + '/*.json')):
        d = json.load(io.open(f, encoding='utf-8'))
        # o sufixo antigo, posto no fim, e desfeito
        t = re.sub(r':\s*(?:o que muda em \d{4}|guia de [^:]+)$', '',
                   (d.get('title') or '')).strip()
        porTitulo[re.sub(r'\s+', ' ', t).lower()].append((f, d, t))

    for chave, itens in porTitulo.items():
        if len(itens) < 2 or not chave:
            continue
        print('  %-18s %r  (%d copias)' % (SLUG, chave[:56], len(itens)))
        for i, (f, d, t) in enumerate(itens):
            d['title'] = t
            if i == 0:
                d.pop('metaTitle', None)
                marca = 'original'
            else:
                ano = (d.get('date') or '')[:4]
                cat = (d.get('category') or {}).get('name') or ''
                # a diferenca vai no COMECO, que e a parte que sobrevive ao corte
                nucleo = re.sub(r'[:,].*$', '', t).strip()
                # ⚠️ o corte tem que respeitar o SUFIXO, senao ele mesmo e
                # cortado e as duas paginas voltam a ter o mesmo `<title>`
                sufixo = (' em %s' % ano) if ano else (', guia de %s' % cat)
                teto = 46 - len(sufixo)
                if len(nucleo) > teto:
                    nucleo = nucleo[:teto].rsplit(' ', 1)[0]
                    # ⚠️ cortar na fronteira de palavra ainda deixa preposicao
                    # solta no fim, e o titulo sai sem sentido: "plano de em 2023"
                    nucleo = re.sub(r'\s+(?:de|da|do|das|dos|em|no|na|para|com|por|'
                                    r'a|o|e|ou)$', '', nucleo, flags=re.I).rstrip(' ,:;')
                d['metaTitle'] = nucleo + sufixo
                marca = 'metaTitle: %r' % d['metaTitle']
            print('     %-54s %s' % (os.path.basename(f)[:-5][:54], marca))
            if APLICA:
                io.open(f, 'w', encoding='utf-8', newline='\n').write(
                    json.dumps(d, ensure_ascii=False, indent=2))

if not APLICA:
    print('  ensaio. rode com --aplica.')
