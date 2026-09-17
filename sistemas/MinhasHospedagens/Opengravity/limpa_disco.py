# -*- coding: utf-8 -*-
"""Limpa o que se acumula em silencio: backup antigo e imagem que ninguem cita.

Depois de dezenas de conversoes, dois montes crescem sozinhos:

  - **backup de `sites.json`, `archs.js` e `render.js`**: cada patch grava um, e
    o `archs.js` tem 800 KB. Sao centenas de arquivos e centenas de MB
  - **imagem de artigo podado**: a poda apaga o JSON, e o arquivo em
    `public/img/` fica. Nao quebra nada, mas ocupa disco e entra em backup

Regra dos backups: fica **o mais recente de cada dia dos ultimos 7 dias**, mais
os 3 mais recentes de todos. O resto sai.

⚠️ **A imagem so sai depois de tres varreduras**, e nao so do `data/`:

  1. o corpo e o campo `image` de cada artigo
  2. o `sites.json` inteiro (as `extraPages` citam avatar e ilustracao)
  3. o HTML ja gerado em `public/`, que pode citar arquivo que o JSON nao cita

⚠️ Nada que comece com `_` sai: sao os arquivos de marca (`_marca.webp`).

🔴 **A remocao das imagens fica atras de `--imagens`, e nao entra por padrao.**
Boa parte das orfas sao as variantes de tamanho do WordPress
(`-300x169.webp`, `-768x432.jpg`), que podem estar indexadas no Google Imagens e
sao servidas pelo rewrite de `/wp-content/uploads/` do vhost. Apagar troca
imagem por 404 numa URL que ainda pode receber visita. Enquanto o disco nao
apertar, o ganho nao paga o risco.
"""
import collections
import glob
import io
import json
import os
import re
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
IMAGENS = '--imagens' in sys.argv
AGORA = time.time()

# ---------- backups
liberado = 0
n_bak = 0
for alvo in ('/opt/portal-engine/sites.json', '/opt/portal-engine/src/archs.js',
             '/opt/portal-engine/src/render.js'):
    arquivos = sorted(glob.glob(alvo + '.bak*'), key=os.path.getmtime, reverse=True)
    manter = set(arquivos[:3])
    por_dia = {}
    for f in arquivos:
        dia = time.strftime('%Y-%m-%d', time.localtime(os.path.getmtime(f)))
        if AGORA - os.path.getmtime(f) < 7 * 86400 and dia not in por_dia:
            por_dia[dia] = f
            manter.add(f)
    for f in arquivos:
        if f in manter:
            continue
        liberado += os.path.getsize(f)
        n_bak += 1
        if APLICA:
            os.remove(f)
    print('  %-12s %3d backups, mantendo %d' % (os.path.basename(alvo), len(arquivos),
                                                len(manter)))
print('  backups a remover: %d (%.0f MB)' % (n_bak, liberado / 1048576.0))

# ---------- imagens orfas
cfg_txt = io.open('/opt/portal-engine/sites.json', encoding='utf-8').read()
cfg = json.loads(cfg_txt)
RX = re.compile(r'/img/([^"\'\s)>\\]+)')

tot = 0
peso = 0
for site in cfg['sites']:
    slug = site['slug']
    IMG = '/srv/portais/%s/public/img' % slug
    D = '/srv/portais/%s/data' % slug
    PUB = '/srv/portais/%s/public' % slug
    if not os.path.isdir(IMG):
        continue
    citadas = set()
    # 1. o acervo
    for f in glob.glob(os.path.join(D, '*.json')):
        try:
            txt = io.open(f, encoding='utf-8').read()
        except Exception:
            continue
        citadas.update(RX.findall(txt))
        try:
            d = json.loads(txt)
        except Exception:
            continue
        if (d.get('image') or {}).get('file'):
            citadas.add(d['image']['file'])
    # 2. o sites.json inteiro
    citadas.update(RX.findall(cfg_txt))
    # 3. o HTML ja gerado
    for f in glob.glob(PUB + '/**/*.html', recursive=True):
        try:
            citadas.update(RX.findall(io.open(f, encoding='utf-8').read()))
        except Exception:
            pass
    n = 0
    for a in os.listdir(IMG):
        cam = os.path.join(IMG, a)
        if not os.path.isfile(cam) or a.startswith('_'):
            continue
        if a in citadas:
            continue
        n += 1
        peso += os.path.getsize(cam)
        if APLICA and IMAGENS:
            os.remove(cam)
    if n:
        print('  %-24s %4d imagem(ns) sem nenhuma citacao' % (slug, n))
        tot += n

print('  imagens a remover: %d (%.0f MB)' % (tot, peso / 1048576.0))
print('  total liberado: %.0f MB' % ((liberado + peso) / 1048576.0))
print('  apagado' if APLICA else '  ensaio. rode com --aplica.')
