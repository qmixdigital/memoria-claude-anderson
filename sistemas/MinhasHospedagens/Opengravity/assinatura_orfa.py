# -*- coding: utf-8 -*-
"""Reatribui os artigos que ficaram assinados com o NOME DO SITE.

Sete portais tem um artigo cada assinado com "WTW19", "Giro das Noticias",
"Portal Noticias BH" e afins. E o resto do defeito ja corrigido no motor: durante
um periodo o receptor carimbava o nome do site quando o conteudo da plataforma
chegava sem autor.

Marca nao assina texto. Cada um passa para a assinatura da equipe que cobre a
**editoria do artigo**, que e a mesma regra da importacao.

⚠️ Sem pagina de autor, o `rel=author` do artigo aponta para 404 e o
`ProfilePage` do schema fica sem dono. Foi assim que o `portalnoticiasbh`
aparecia com `auth NAO` na auditoria do pacote editorial.
"""
import glob
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
CFG = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))

n = 0
for site in CFG['sites']:
    equipe = site.get('equipe') or []
    if not equipe:
        continue
    nomes = {e['nome'] for e in equipe}
    # editoria -> assinatura, tirado do proprio sites.json
    por_cat = {}
    for e in equipe:
        for c in (e.get('cats') or []):
            por_cat[c] = e['nome']
    for f in sorted(glob.glob('/srv/portais/%s/data/*.json' % site['slug'])):
        d = json.load(io.open(f, encoding='utf-8'))
        autor = (d.get('author') or '').strip()
        if not autor or autor in nomes:
            continue
        cat = (d.get('category') or {}).get('slug') or ''
        novo = por_cat.get(cat) or equipe[0]['nome']
        print('  %-20s %-44s %-24s -> %s'
              % (site['slug'], d['slug'][:44], autor, novo))
        n += 1
        if APLICA:
            d['author'] = novo
            io.open(f, 'w', encoding='utf-8').write(
                json.dumps(d, ensure_ascii=False, indent=2))

print('  artigos reatribuidos: %d' % n)
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
