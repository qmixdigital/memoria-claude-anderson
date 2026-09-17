# -*- coding: utf-8 -*-
"""Desfaz o prefixo de classe repetido entre dois portais da mesma maquina.

O `fp.prefix` alimenta duas coisas:

  - as **classes hasheadas**, que tambem levam o slug e por isso **nao colidem**
  - a classe **literal** do bloco "Veja tambem", que e gravada dentro do corpo do
    artigo e nao leva slug nenhum

O `sabedoriaglobal` e o `saberdefato` compartilhavam o prefixo `sab`, e com ele a
classe `.sab-veja` em **1.135 artigos dos dois portais somados**. Nome de classe
literal igual entre portais e impressao digital de rede.

O portal mais novo troca de prefixo. Mudam tres lugares, e os tres precisam ficar
de acordo, senao o bloco sobe sem estilo:

  1. `fp.prefix` no `sites.json`
  2. o seletor no CSS da arquitetura
  3. a classe gravada no corpo dos artigos
"""
import glob
import io
import json
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
SLUG = 'saberdefato'
VELHO = 'sab'
NOVO = 'sdf'
CFG = '/opt/portal-engine/sites.json'
ARCHS = '/opt/portal-engine/src/archs.js'

cfg = json.load(io.open(CFG, encoding='utf-8'))
site = [x for x in cfg['sites'] if x['slug'] == SLUG][0]
atual = (site.get('fp') or {}).get('prefix')
print('  prefixo atual do %s: %s' % (SLUG, atual))
outros = [x['slug'] for x in cfg['sites']
          if x['slug'] != SLUG and (x.get('fp') or {}).get('prefix') == NOVO]
if outros:
    print('  ⚠️ o prefixo %s ja e de: %s' % (NOVO, outros))
    raise SystemExit(1)

arch = (site.get('fp') or {}).get('arch')
a = io.open(ARCHS, encoding='utf-8').read()
n_css = a.count('.%s-veja' % VELHO)
print('  ocorrencias de .%s-veja no archs.js: %d' % (VELHO, n_css))

artigos = [f for f in glob.glob('/srv/portais/%s/data/*.json' % SLUG)
           if ('%s-veja' % VELHO) in io.open(f, encoding='utf-8').read()]
print('  artigos com a classe literal: %d' % len(artigos))

if not APLICA:
    print('  ensaio. rode com --aplica.')
    raise SystemExit()

# 1. o sites.json
shutil.copyfile(CFG, CFG + '.bak-prefixo-' + time.strftime('%Y%m%d-%H%M%S'))
site['fp']['prefix'] = NOVO
io.open(CFG, 'w', encoding='utf-8', newline='\n').write(
    json.dumps(cfg, ensure_ascii=False, indent=2))

# 2. o CSS da arquitetura. ⚠️ so o seletor DESTA arquitetura muda: o `.sab-veja`
# de outra arch pertence ao sabedoriaglobal
shutil.copyfile(ARCHS, ARCHS + '.bak-prefixo-' + time.strftime('%Y%m%d-%H%M%S'))
ini = a.index(' * Arquitetura %s,' % arch)
ini = a.rindex('/*', 0, ini)
fim = a.index('const ARCHS')
prox = re.search(r'\n/\*\n \* Arquitetura [A-Z]{1,2},', a[ini + 10:fim])
if prox:
    fim = ini + 10 + prox.start()
bloco = a[ini:fim]
n = bloco.count('.%s-veja' % VELHO)
a = a[:ini] + bloco.replace('.%s-veja' % VELHO, '.%s-veja' % NOVO) + a[fim:]
io.open(ARCHS, 'w', encoding='utf-8', newline='\n').write(a)
print('  seletores trocados dentro da arquitetura %s: %d' % (arch, n))

# 3. os artigos
for f in artigos:
    d = json.load(io.open(f, encoding='utf-8'))
    d['content'] = (d.get('content') or '').replace('%s-veja' % VELHO, '%s-veja' % NOVO)
    io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))
print('  artigos regravados: %d' % len(artigos))
print('  gravado. reiniciar o motor e reconstruir o %s.' % SLUG)
