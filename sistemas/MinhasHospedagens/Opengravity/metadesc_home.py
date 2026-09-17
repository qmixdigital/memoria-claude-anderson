# -*- coding: utf-8 -*-
"""Poe o `metaDescription` de cada portal dentro da regua de 100 a 175.

46 portais das duas maquinas mais antigas tem a descricao da **home** abaixo de
100 caracteres, alguns com 13 (so o nome do site). A home e a pagina mais
importante do portal, e o Google reescreve a descricao curta por conta.

O texto novo se monta com o que o proprio portal ja tem, e nao com molde:

    <descricao existente>. <as editorias com mais artigo>, atualizado <cadencia>.

⚠️ **As editorias vem do disco**, na ordem de tamanho, entao cada portal fecha a
frase com um conjunto diferente. Sem isso, 46 descricoes iguais seriam assinatura
de rede.

⚠️ O fecho varia por portal, sorteado de uma lista pelo **hash do slug**: o mesmo
portal sempre recebe o mesmo, e dois vizinhos dificilmente recebem o mesmo.
"""
import collections
import glob
import hashlib
import io
import json
import os
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/sites.json'
cfg = json.load(io.open(P, encoding='utf-8'))

FECHOS = [
    'atualizado ao longo do dia',
    'com texto conferido antes de publicar',
    'em linguagem direta, sem enrolação',
    'com o custo de cada escolha dito por extenso',
    'publicado todos os dias',
    'com o que muda de caso dito antes da recomendação',
    'sem promessa fácil e sem número solto',
    'com a fonte à vista em cada dado',
]

mudou = 0
for site in cfg['sites']:
    atual = (site.get('metaDescription') or site.get('description') or '').strip()
    if 100 <= len(atual) <= 175:
        continue
    slug = site['slug']

    # as editorias com mais artigo, tiradas do disco
    conta = collections.Counter()
    nome = {}
    for f in glob.glob('/srv/portais/%s/data/*.json' % slug):
        try:
            d = json.load(io.open(f, encoding='utf-8'))
        except Exception:
            continue
        cat = d.get('category') or {}
        if cat.get('slug'):
            conta[cat['slug']] += 1
            nome[cat['slug']] = (cat.get('name') or cat['slug']).lower()
    tops = [nome[c] for c, _ in conta.most_common(4)]

    fecho = FECHOS[int(hashlib.sha256(slug.encode()).hexdigest(), 16) % len(FECHOS)]
    base = atual.rstrip(' .')
    if len(atual) > 175:
        novo = base[:170].rsplit(' ', 1)[0] + '.'
    else:
        pedacos = [base]
        if tops:
            pedacos.append('Cobrimos ' + ', '.join(tops[:-1]) + ' e ' + tops[-1]
                           if len(tops) > 1 else 'Cobrimos ' + tops[0])
        pedacos.append(fecho[0].upper() + fecho[1:])
        novo = '. '.join(x.rstrip(' .') for x in pedacos) + '.'
        while len(novo) > 175 and len(pedacos) > 1:
            pedacos.pop()
            novo = '. '.join(x.rstrip(' .') for x in pedacos) + '.'
    if len(novo) < 100 or len(novo) > 175:
        print('  ⚠️ %-24s nao coube: %d caracteres' % (slug, len(novo)))
        continue
    print('  %-24s %3d -> %3d  %s' % (slug, len(atual), len(novo), novo[:96]))
    site['metaDescription'] = novo
    mudou += 1

print('  portais ajustados: %d' % mudou)
if not APLICA or not mudou:
    print('  ensaio. rode com --aplica.' if not APLICA else '  nada a gravar')
    raise SystemExit()

shutil.copyfile(P, P + '.bak-metadesc-' + time.strftime('%Y%m%d-%H%M%S'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(
    json.dumps(cfg, ensure_ascii=False, indent=2))
print('  gravado. reiniciar o motor e reconstruir.')
