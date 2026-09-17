# -*- coding: utf-8 -*-
"""Liga a linkagem automatica do pontonaturalbrasil.

A malha do acervo resolve o que ja existe. O `autoLink` resolve o que vem
**depois**: ele roda no momento da publicacao, entao o conteudo novo da
plataforma do Antonio ja nasce com link interno. Sem ele o portal volta a
acumular artigo sem nenhuma saida, um por vez, e so a auditoria semanal acusa.

⚠️ **O destino sai do disco, e nao de lista escrita a mao.** Aqui o portal tem
`flatUrl: false` com `categoryBase: "categoria"`, entao a listagem mora em
`/categoria/<slug>/`. Montar `/<slug>/` de cor mandaria a malha nova para 404.

⚠️ **Nenhuma frase se repete entre portais.** Ancora repetida entre portais e
impressao digital de conjunto, e ancora ambigua nao passa autoridade.

⚠️ Sem mapa de termo: termo mal escolhido nunca casa, o fallback dispara em todo
artigo e o mesmo paragrafo se repete pelo portal inteiro.
"""
import collections
import glob
import io
import json
import os
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/sites.json'
SLUG = 'pontonaturalbrasil'

# moldes proprios: nenhum deles esta em uso nos outros portais da maquina
MOLDES = ['tudo o que o PN Brasil publicou em %s',
          'o acervo de %s do PN Brasil',
          'as matérias de %s do PN Brasil']

cfg = json.load(io.open(P, encoding='utf-8'))
sites = {s['slug']: s for s in cfg['sites']}
s = sites[SLUG]
D = '/srv/portais/%s/data' % SLUG
PUB = '/srv/portais/%s/public' % SLUG
base = s.get('categoryBase') or ''

conta = collections.Counter()
nome = {}
for f in glob.glob(D + '/*.json'):
    d = json.load(io.open(f, encoding='utf-8'))
    cat = d.get('category') or {}
    if cat.get('slug'):
        conta[cat['slug']] += 1
        nome[cat['slug']] = cat.get('name') or cat['slug']

# nenhuma frase pode existir em outro portal desta maquina
usadas = set()
for outro in cfg['sites']:
    al = outro.get('autoLink') or {}
    for p in ((al.get('fallback') or {}).get('pool') or []):
        for a in p.get('anchors') or []:
            usadas.add(a.strip().lower())

pool = []
for cs, _n in conta.most_common(6):
    cam = os.path.join(PUB, base, cs) if base else os.path.join(PUB, cs)
    if not os.path.isfile(os.path.join(cam, 'index.html')):
        print('  destino sem pagina no disco, fora: %s' % cs)
        continue
    url = '/%s/%s/' % (base, cs) if base else '/%s/' % cs
    rot = (nome[cs] or cs).lower()
    anchors = []
    for molde in MOLDES:
        a = molde % rot
        if a.lower() in usadas:
            print('  ancora ja usada na rede, fora: %s' % a)
            continue
        usadas.add(a.lower())
        anchors.append(a)
    if anchors:
        pool.append({'url': url, 'anchors': anchors})

print('  %s: %d destinos | %d ancoras' % (SLUG, len(pool), sum(len(p['anchors']) for p in pool)))
for p in pool:
    print('     %-30s %s' % (p['url'], ' | '.join(p['anchors'])))
assert len(pool) >= 3, 'poucos destinos vivos'

if not APLICA:
    print('  ensaio. rode com --aplica.')
    sys.exit()

s['autoLink'] = {'enabled': True, 'maxLinks': 3, 'maxSameAnchor': 2,
                 'map': [], 'fallback': {'pool': pool}}
shutil.copyfile(P, P + '.bak-autolinkpnb-' + time.strftime('%Y%m%d-%H%M%S'))
io.open(P, 'w', encoding='utf-8', newline=chr(10)).write(
    json.dumps(cfg, ensure_ascii=False, indent=2))
print('  gravado. reiniciar o motor para valer.')
