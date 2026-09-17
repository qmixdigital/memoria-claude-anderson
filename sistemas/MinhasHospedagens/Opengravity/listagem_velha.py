# -*- coding: utf-8 -*-
"""Apaga a listagem de editoria que ficou no disco depois de a editoria esvaziar.

O rebuild **nao toca em pasta que ele nao gera mais**: quando a ultima materia de
uma editoria sai (poda, mudanca de categoria, artigo apagado), a pagina
`/categoria/<slug>/` continua no ar, com os cartoes antigos e a descricao antiga.

Foi assim que tres listagens apareceram com descricao de 36 caracteres depois de
toda a rede ter sido normalizada: elas nao passam mais pelo motor.

⚠️ Nao apagar por lista escrita a mao: a pasta so sai quando **nenhum artigo do
`data/`** aponta para aquela editoria. E so dentro de `categoryBase`, para nao
confundir com artigo em portal de URL plana.

⚠️ Apagar pelo caminho do MOTOR (`/srv/portais/<slug>/public/...`), e nao pelo da
origem: pelo caminho errado o `index.html` fica e a auditoria mente.
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

n = 0
for site in CFG['sites']:
    slug = site['slug']
    PUB = '/srv/portais/%s/public' % slug
    base = (site.get('categoryBase') or '').strip('/')
    if not base or not os.path.isdir(os.path.join(PUB, base)):
        continue
    vivas = set()
    for f in glob.glob('/srv/portais/%s/data/*.json' % slug):
        try:
            d = json.load(io.open(f, encoding='utf-8'))
        except Exception:
            continue
        c = d.get('category') or {}
        if c.get('slug'):
            vivas.add(c['slug'])
    for nome in sorted(os.listdir(os.path.join(PUB, base))):
        cam = os.path.join(PUB, base, nome)
        if not os.path.isdir(cam) or nome in vivas:
            continue
        quantos = len(glob.glob(cam + '/**/index.html', recursive=True))
        print('  %-20s /%s/%s/  (%d pagina%s no disco, 0 artigo)'
              % (slug, base, nome, quantos, 's' if quantos != 1 else ''))
        n += 1
        if APLICA:
            shutil.rmtree(cam)

print('  listagens de editoria vazias: %d' % n)
print('  apagadas' if APLICA else '  ensaio. rode com --aplica.')
