# -*- coding: utf-8 -*-
"""Liga a linkagem automatica nos seis portais desta leva.

A malha do acervo resolve o que ja existe. O `autoLink` resolve o que vem
**depois**: ele roda no momento da publicacao, entao o conteudo novo da
plataforma do Antonio ja nasce com link interno.

Sem ele o portal volta a acumular artigo sem nenhuma saida, um por vez, e so a
auditoria semanal acusa. Ja aconteceu no exquisito, no sabedoriaglobal e agora no
jornaldobairroalto.

⚠️ **O destino sai do disco, e nao de lista escrita a mao.** Cada portal tem
`flatUrl` e `categoryBase` proprios, e montar `/categoria/<slug>/` de cor manda a
malha nova para 404 em metade deles.

⚠️ **Ancora de fallback precisa fazer sentido.** Sinonimo mecanico do tipo "nosso
cartucho de noticias" ja foi para 106 paginas de um portal desta rede. Aqui as
variacoes sao frases que alguem escreveria.

⚠️ **Nenhuma frase se repete entre destinos nem entre portais.** Ancora ambigua
nao passa autoridade, e ancora repetida entre portais e impressao digital de
conjunto.
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
ALVOS = ['jornaldobairroalto', 'df8', 'divirto', 'opopularjornal', 'revistarumo',
         'universoneo']

# um jeito de dizer "a editoria X" por portal, para nenhuma frase se repetir
MOLDES = {
    'jornaldobairroalto': ['a editoria de %s', 'nossa cobertura de %s', 'as matérias de %s'],
    'df8':                ['o que o DF8 publica sobre %s', 'as reportagens de %s',
                           'o caderno de %s'],
    'divirto':            ['tudo o que reunimos em %s', 'a seção de %s do Divirto',
                           'os textos de %s'],
    'opopularjornal':     ['o que sai em %s', 'a página de %s', 'nossos textos de %s'],
    'revistarumo':        ['a editoria de %s da Rumo', 'o acervo de %s', 'as pautas de %s'],
    'universoneo':        ['o que o UniversOneo tem sobre %s', 'a área de %s',
                           'as publicações de %s'],
}

cfg = json.load(io.open(P, encoding='utf-8'))
sites = {s['slug']: s for s in cfg['sites']}
usadas = set()
mudou = 0

for slug in ALVOS:
    s = sites.get(slug)
    if not s:
        print('  %s: nao existe' % slug)
        continue
    if s.get('autoLink'):
        print('  %s: ja tinha autoLink, nao mexi' % slug)
        continue
    D = '/srv/portais/%s/data' % slug
    PUB = '/srv/portais/%s/public' % slug
    base = s.get('categoryBase') or ''

    # as editorias com mais artigo, que sao os destinos que valem
    conta = collections.Counter()
    nome = {}
    for f in glob.glob(D + '/*.json'):
        try:
            d = json.load(io.open(f, encoding='utf-8'))
        except Exception:
            continue
        cat = d.get('category') or {}
        if cat.get('slug'):
            conta[cat['slug']] += 1
            nome[cat['slug']] = cat.get('name') or cat['slug']

    pool = []
    for cs, _n in conta.most_common(6):
        # ⚠️ o caminho sai do disco: cada portal tem o seu formato
        cam = os.path.join(PUB, base, cs) if base else os.path.join(PUB, cs)
        if not os.path.isfile(os.path.join(cam, 'index.html')):
            continue
        url = '/%s/%s/' % (base, cs) if base else '/%s/' % cs
        rot = (nome[cs] or cs).lower()
        anchors = []
        for molde in MOLDES[slug]:
            a = molde % rot
            if a in usadas:
                continue
            usadas.add(a)
            anchors.append(a)
        if anchors:
            pool.append({'url': url, 'anchors': anchors})

    if len(pool) < 3:
        print('  %s: so achei %d destino vivo, nao liguei' % (slug, len(pool)))
        continue

    s['autoLink'] = {
        'enabled': True,
        'maxLinks': 3,
        'maxSameAnchor': 2,
        # sem mapa de termo: termo mal escolhido nunca casa e o fallback dispara
        # em todo artigo, repetindo o mesmo paragrafo pelo portal inteiro
        'map': [],
        'fallback': {'pool': pool},
    }
    mudou += 1
    print('  %-20s %d destinos | %d ancoras'
          % (slug, len(pool), sum(len(p['anchors']) for p in pool)))

if APLICA and mudou:
    shutil.copyfile(P, P + '.bak-autolink-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline=chr(10)).write(
        json.dumps(cfg, ensure_ascii=False, indent=2))
    print('  gravado. reiniciar o motor para valer.')
elif not APLICA:
    print('  ensaio. rode com --aplica.')
