# -*- coding: utf-8 -*-
"""Estende a regua de meta description aos tres caminhos que faltaram.

O `desc_regua.py` cobriu as paginas fixas. Sobraram, e cada uma por um motivo
diferente:

  - **as `extraPages`** (equipe, politica editorial, autores): na opengravity o
    `staticPages` foi partido em `_staticFixas` + as extras, e o `.map` da regua
    ficou so na primeira metade
  - **a home**: sai de `homeMeta`, e o `metaDescription` de alguns portais e mais
    curto que 100
  - **a listagem de editoria**: sai do `catDesc`, que em um portal passou de 175

⚠️ A pagina de **busca** fica de fora de proposito: ela e `noindex`, e alongar a
descricao dela nao serve para nada.
"""
import io
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
s = io.open(P, encoding='utf-8').read()

if '_descNaRegua' not in s:
    print('  o desc_regua.py ainda nao rodou aqui')
    raise SystemExit(1)

mudou = []

# 1. as extraPages, onde a lista foi partida em duas
A = '  return _staticFixas(site).concat(extra);'
B = ('  // ⚠️ a regua vale para as extras tambem: equipe, politica editorial e as\n'
     '  // paginas de autor nascem com `desc` curta, tirada do `lead`\n'
     '  return _staticFixas(site).concat(extra)\n'
     '    .map(x => Object.assign({}, x, { desc: _descNaRegua(site, x.desc) }));')
if A in s and 'concat(extra)\n    .map' not in s:
    s = s.replace(A, B, 1)
    mudou.append('extraPages')

# 2. a home
A = ("    return { title, desc: site.metaDescription || site.description || site.name, "
     "canonical: site.baseUrl + '/'")
B = ("    return { title, desc: _descNaRegua(site, site.metaDescription || site.description "
     "|| site.name), canonical: site.baseUrl + '/'")
if A in s:
    s = s.replace(A, B, 1)
    mudou.append('home')

# 3. a listagem de editoria
A = "listMeta: (ctx, opts) => ({ title: _cortaTitle(String(opts.title), "
if A in s and 'desc: _descNaRegua(ctx.site, opts.desc)' not in s:
    i = s.index(A)
    j = s.index('desc: opts.desc', i)
    s = s[:j] + 'desc: _descNaRegua(ctx.site, opts.desc)' + s[j + len('desc: opts.desc'):]
    mudou.append('listagem')

print('  caminhos ajustados: %s' % (', '.join(mudou) or 'nenhum'))
if not mudou:
    raise SystemExit()

io.open('/tmp/render-novo2.js', 'w', encoding='utf-8', newline='\n').write(s)
if not APLICA:
    print('  ensaio. rode com --aplica.')
    raise SystemExit()

shutil.copyfile(P, P + '.bak-desc2-' + time.strftime('%Y%m%d-%H%M%S'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  gravado. conferir com node antes de reiniciar.')
