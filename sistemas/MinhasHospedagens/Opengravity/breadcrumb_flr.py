# -*- coding: utf-8 -*-
"""Remove do corpo o breadcrumb raspado e o embrulho de tema do folhar.

Achado ao investigar por que dois artigos comecavam com `@ » folha r trends »`:
o corpo trazia um **bloco `evte-breadcrumbs` inteiro**, com `BreadcrumbList` em
microdados e **link para `auto.docsbrasil.work`**, um dominio que nao e da rede.

Tres problemas de uma vez:

1. **trilha visivel no meio do texto**, que o leitor le como lixo
2. **`BreadcrumbList` duplicado**: o motor ja emite o dele, e dois na mesma
   pagina fazem o Google escolher um por conta
3. **link externo para dominio de terceiro** que ninguem contratou, e que pode
   mudar de dono a qualquer momento

Junto sai o `<div id="post-NNN">` do tema, que embrulha o texto inteiro em
quatro artigos: ele nao conta como contentor para a insercao de anuncio, e ja
custou 47 artigos sem bloco num portal desta rede.

⚠️ O `div` do tema **nao pode ser removido com o conteudo dentro**: o que sai e a
tag de abertura e a de fechamento correspondente, e nao o bloco.
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

RX_CRUMB = re.compile(r'(?is)<div class="[^"]*evte-breadcrumbs[^"]*".*?</div>\s*')
RX_ABRE = re.compile(r'(?i)<div id="post-\d+"[^>]*>\s*')


def tira_embrulho(c):
    """Tira o `<div id="post-NNN">` sem levar o conteudo: some a abertura e o
    `</div>` que fecha ELA, encontrado por contagem de profundidade."""
    m = RX_ABRE.search(c)
    if not m:
        return c, 0
    ini = m.start()
    i = m.end()
    prof = 1
    for t in re.finditer(r'(?i)<div\b[^>]*>|</div>', c[i:]):
        prof += 1 if t.group(0).lower().startswith('<div') else -1
        if prof == 0:
            fim = i + t.start()
            return c[:ini] + c[m.end():fim] + c[i + t.end():], 1
    # sem fechamento: tira so a abertura
    return c[:ini] + c[m.end():], 1


n_crumb = n_div = 0
for f in sorted(glob.glob(os.path.join(DATA, '*.json'))):
    d = json.load(io.open(f, encoding='utf-8'))
    c = d.get('content') or ''
    antes = c

    c, k = RX_CRUMB.subn('', c)
    if k:
        n_crumb += 1
        print('  breadcrumb  %s' % d['slug'][:60])

    c, k = tira_embrulho(c)
    if k:
        n_div += 1
        print('  embrulho    %s' % d['slug'][:60])

    if c != antes:
        d['content'] = c
        if APLICA:
            io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

print('  breadcrumbs raspados removidos: %d | embrulhos de tema: %d' % (n_crumb, n_div))
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
