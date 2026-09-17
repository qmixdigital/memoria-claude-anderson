# -*- coding: utf-8 -*-
"""Acha (e apaga) pagina de artigo que ficou no `public/` sem artigo no `data/`.

O rebuild **nao remove pasta que ele nao gera mais**. Quando um artigo e apagado
do `data/`, a pasta dele continua no ar com o HTML antigo: cartoes velhos,
trilha velha, marca velha. E ela nao aparece em auditoria nenhuma, porque o
sitemap tambem nao a lista.

Foi assim que apareceram 53 paginas com a trilha "Inicio ›", o defeito de ancora
generica ja corrigido no motor ha semanas: elas simplesmente nao passam mais pelo
motor.

⚠️ **Nao e tudo que fica no `public/` sem JSON.** Sao legitimas, e ficam de fora:
a home, a 404, a busca, o mapa do site, as institucionais, as paginas de autor,
as `extraPages` do `sites.json` e as listagens de editoria.

⚠️ Apagar pelo caminho do MOTOR, e nao pelo da origem: pelo caminho errado o
`index.html` fica e a auditoria mente.
"""
import glob
import io
import json
import os
import shutil
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
CFG = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))

SMAP = {'mapa-do-site', 'indice', 'todos-os-artigos', 'arquivo-de-noticias', 'conteudo',
        'mapa-de-conteudo', 'indice-de-artigos', 'todo-o-conteudo', 'central-de-conteudo',
        'navegacao', 'indice-geral', 'arquivo-completo', 'lista-de-materias',
        'indice-de-materias', 'mapa-de-navegacao', 'todas-as-noticias', 'indice-do-site',
        'sumario'}
FIXAS = {'quem-somos', 'contato', 'politica-de-privacidade', 'termos-de-uso', 'busca',
         'equipe', 'politica-editorial', 'autor', 'img', 'assets'} | SMAP

total = 0
for site in CFG['sites']:
    slug = site['slug']
    PUB = '/srv/portais/%s/public' % slug
    D = '/srv/portais/%s/data' % slug
    if not os.path.isdir(PUB):
        continue
    vivos = {os.path.basename(f)[:-5] for f in glob.glob(os.path.join(D, '*.json'))}
    editorias = set()
    for f in glob.glob(os.path.join(D, '*.json')):
        try:
            c = (json.load(io.open(f, encoding='utf-8')).get('category') or {})
        except Exception:
            continue
        if c.get('slug'):
            editorias.add(c['slug'])
    extras = {p['slug'].split('/')[0] for p in (site.get('extraPages') or [])}
    base = (site.get('categoryBase') or '').strip('/')
    plano = bool(site.get('flatUrl'))
    fora = FIXAS | extras | editorias | ({base} if base else set())

    achados = []
    for f in glob.glob(PUB + '/**/index.html', recursive=True):
        rel = os.path.relpath(os.path.dirname(f), PUB).replace(os.sep, '/')
        if rel in ('.', ''):
            continue
        partes = rel.split('/')
        if partes[0] in fora:
            continue
        # artigo: /<slug>/ no plano, /<editoria>/<slug>/ nos outros
        if plano and len(partes) == 1:
            alvo = partes[0]
        elif not plano and len(partes) == 2 and partes[0] in editorias:
            alvo = partes[1]
        elif not plano and len(partes) == 2:
            # editoria que nao tem mais artigo: o listagem_velha.py cuida
            continue
        else:
            continue
        if alvo not in vivos:
            achados.append((rel, os.path.dirname(f)))

    if achados:
        print('  %-22s %d pagina(s) sem artigo no data/' % (slug, len(achados)))
        for rel, _ in achados[:4]:
            print('       /%s/' % rel)
        total += len(achados)
        if APLICA:
            for _, cam in achados:
                shutil.rmtree(cam)

print('  paginas fantasma: %d' % total)
print('  apagadas' if APLICA else '  ensaio. rode com --aplica.')
