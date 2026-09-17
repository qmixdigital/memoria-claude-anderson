# -*- coding: utf-8 -*-
"""Poe o `<title>` dentro dos 60 caracteres, sem tocar no `h1`.

Dois casos, e cada um tem o seu campo:

  - **home** com `metaTitle` ausente: o motor monta `descricao | nome` e passa de
    70. O conserto e gravar `metaTitle` no `sites.json`
  - **artigo** cujo TITULO ja passa sozinho de 65: o motor ate tira a marca, mas
    nao corta o titulo do cliente. O conserto e gravar `metaTitle` no artigo

⚠️ **O `h1` nao muda.** O `metaTitle` existe justamente para separar o que o
Google mostra do que o leitor le, e o titulo e o texto que o cliente comprou.

⚠️ O corte e em fronteira de palavra, e preserva o **comeco**, onde mora a
palavra-chave. Quando ha dois-pontos ou travessao antes dos 60, corta ali: a
primeira metade costuma ser a manchete e a segunda o complemento.
"""
import glob
import io
import json
import os
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
CFG = '/opt/portal-engine/sites.json'
cfg = json.load(io.open(CFG, encoding='utf-8'))
LIM = 60


def encurta(t, lim=LIM):
    t = re.sub(r'\s+', ' ', t or '').strip()
    if len(t) <= lim:
        return t
    corte = t[:lim + 1]
    for sep in (': ', ' - ', ' | ', ' , '):
        i = corte.find(sep)
        if 25 <= i <= lim:
            return t[:i].strip()
    i = corte.rfind(' ')
    return t[:i].strip() if i > 25 else t[:lim].strip()


n_home = n_art = 0
for site in cfg['sites']:
    slug = site['slug']
    marca = site.get('shortName') or site.get('name') or ''

    # --- a home
    mt = (site.get('metaTitle') or '').strip()
    if not mt:
        montado = (site.get('description') + ' | ' + site.get('name')) \
            if site.get('description') else site.get('name', '')
        if len(montado) > 65:
            novo = encurta(site.get('description') or site.get('name'), LIM - len(marca) - 3)
            novo = (novo + ' | ' + marca).strip(' |')
            if len(novo) > LIM:
                novo = encurta(novo, LIM)
            print('  home    %-22s %3d -> %2d  %s' % (slug, len(montado), len(novo), novo))
            n_home += 1
            if APLICA:
                site['metaTitle'] = novo

    # --- os artigos
    for f in sorted(glob.glob('/srv/portais/%s/data/*.json' % slug)):
        d = json.load(io.open(f, encoding='utf-8'))
        if (d.get('metaTitle') or '').strip():
            continue
        t = (d.get('title') or '').strip()
        if len(t) <= 65:
            continue
        novo = encurta(t)
        if not novo or len(novo) < 25:
            continue
        print('  artigo  %-18s %-36s %3d -> %2d' % (slug, d['slug'][:36], len(t), len(novo)))
        n_art += 1
        if APLICA:
            d['metaTitle'] = novo
            io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

print('  homes: %d | artigos: %d' % (n_home, n_art))
if APLICA and n_home:
    shutil.copyfile(CFG, CFG + '.bak-title-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(CFG, 'w', encoding='utf-8', newline='\n').write(
        json.dumps(cfg, ensure_ascii=False, indent=2))
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
