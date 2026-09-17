# -*- coding: utf-8 -*-
"""Tira do corpo o resumo em italico que abre o artigo, na rede inteira.

O `italico_<portal>.py` de cada conversao so pegava a forma `<p><i>...</i></p>`
como **primeiro paragrafo**. Ficaram de fora duas formas muito mais comuns:

  - `<i>...</i>` **solto**, sem paragrafo em volta
  - o mesmo, dentro de um ou mais `<div>` de embrulho do tema

Sao **1.883 artigos em 24 portais**. O leitor ve o mesmo resumo duas vezes: uma
na linha fina e outra na abertura do texto, quase sempre com a redacao pior.

Regra aplicada:

  - se o artigo **nao tem** linha fina, o texto do italico vira a linha fina
  - se **ja tem**, o italico so sai do corpo: linha fina repetida e pior

⚠️ So o **primeiro** bloco conta, e so quando ele abre o corpo. Italico no meio do
texto e enfase de verdade.

⚠️ O bloco tem que ter entre 40 e 400 caracteres: abaixo disso e uma palavra em
enfase, acima e um trecho citado.
"""
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
RAIZ = '/srv/portais'

# o italico que ABRE o corpo, com ou sem <div> de embrulho e com ou sem <p>
RX_ABRE = re.compile(r'(?is)^((?:\s*<div[^>]*>)*\s*)(<p[^>]*>\s*)?<(i|em)>(.*?)</\3>'
                     r'(\s*</p>)?')


def texto(t):
    return re.sub(r'\s+', ' ', re.sub('<[^>]+>', ' ', t or '')).strip()


tot = movidos = removidos = 0
por_portal = {}
for portal in sorted(os.listdir(RAIZ)):
    D = os.path.join(RAIZ, portal, 'data')
    if not os.path.isdir(D):
        continue
    n = 0
    for f in sorted(glob.glob(os.path.join(D, '*.json'))):
        d = json.load(io.open(f, encoding='utf-8'))
        c = d.get('content') or ''
        m = RX_ABRE.match(c.lstrip())
        if not m:
            continue
        bruto = texto(m.group(4))
        if not (40 <= len(bruto) <= 400):
            continue
        c2 = c.lstrip()
        c2 = c2[:m.start()] + m.group(1) + c2[m.end():]
        # ⚠️ o <div> de embrulho fica: tirar so o italico, e nao o contentor
        if not (d.get('dek') or '').strip():
            d['dek'] = bruto
            movidos += 1
        else:
            removidos += 1
        d['content'] = c2
        n += 1
        tot += 1
        if APLICA:
            io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))
    if n:
        por_portal[portal] = n

for k in sorted(por_portal):
    print('  %-24s %4d' % (k, por_portal[k]))
print('  artigos: %d | virou linha fina: %d | so removido: %d'
      % (tot, movidos, removidos))
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
