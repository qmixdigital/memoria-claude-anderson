# -*- coding: utf-8 -*-
"""Confere no HTML PUBLICADO o que a skill exige da arquitetura nova.

Uso, no servidor:  python3 /tmp/confere_arch.py <slug>

Roda sobre o que foi gerado, e nao sobre o dado: varios defeitos so existem
depois da renderizacao. O que ele pega, e que ja passou despercebido:

  - `<body>` que nao abre (quem emite a tag e a arch, e nao o motor)
  - link de editoria montado a mao, ignorando o `categoryBase`: o menu fica
    bonito e so quebra no clique
  - `<script>` sem fechamento no corpo, que engole o rodape inteiro
  - `<span>` com aspect-ratio sem `display:block`
  - listagem que repete o destaque na grade
  - h3 antes do primeiro h2
  - `<img>` sem width/height, e primeira imagem com loading=lazy
  - title acima de 60 e meta description fora da regua
"""
import glob
import html as _html
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
SLUG = sys.argv[1]
PUB = '/srv/portais/%s/public' % SLUG
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
site = [s for s in cfg['sites'] if s['slug'] == SLUG][0]
base = (site.get('categoryBase') or '').strip('/')
eds = sorted({v['slug'] for v in (site.get('categoryMap') or {}).values()})

FIXAS = {'contato', 'quem-somos', 'politica-de-privacidade', 'termos-de-uso', 'busca',
         'equipe', 'politica-editorial', 'autor', 'img', 'assets', base or '_'}
SMAP = {'mapa-do-site', 'indice', 'todos-os-artigos', 'arquivo-de-noticias', 'conteudo',
        'mapa-de-conteudo', 'indice-de-artigos', 'todo-o-conteudo', 'central-de-conteudo',
        'navegacao', 'indice-geral', 'arquivo-completo', 'lista-de-materias',
        'indice-de-materias', 'mapa-de-navegacao', 'todas-as-noticias', 'indice-do-site',
        'sumario'}

achados = []


def diz(f, *a):
    achados.append(f % a if a else f)


def carrega(p):
    return io.open(p, encoding='utf-8').read()


todas = sorted(glob.glob(PUB + '/**/index.html', recursive=True)) + [PUB + '/index.html']
todas = sorted(set(x for x in todas if os.path.isfile(x)))

artigos = []
for p in todas:
    rel = os.path.relpath(os.path.dirname(p), PUB).replace(os.sep, '/')
    if rel in ('.', ''):
        continue
    partes = rel.split('/')
    if partes[0] in FIXAS or partes[0] in SMAP:
        continue
    if site.get('flatUrl'):
        if len(partes) == 1:
            artigos.append(p)
    else:
        if len(partes) == 2 and partes[0] in eds:
            artigos.append(p)

print('  %s: %d paginas, %d artigos' % (SLUG, len(todas), len(artigos)))

sem_body = sem_fecha = script_aberto = 0
lazy_primeiro = img_sem_medida = h3_antes = 0
title_longo = desc_fora = 0
for p in todas:
    t = carrega(p)
    if '<body' not in t:
        sem_body += 1
        if sem_body <= 2:
            diz('🔴 sem <body>: %s', p.replace(PUB, ''))
    if not t.rstrip().endswith('</html>'):
        sem_fecha += 1
    if t.count('<script') != t.count('</script>'):
        script_aberto += 1
        if script_aberto <= 2:
            diz('🔴 <script> sem fechamento: %s', p.replace(PUB, ''))
    # ⚠️ medir o atributo CRU conta `&quot;` como 6 caracteres e reprova texto
    # que esta certo. A regua vale para o texto que o Google le
    m = re.search(r'<title>(.*?)</title>', t, re.S)
    if m and len(re.sub(r'\s+', ' ', _html.unescape(m.group(1))).strip()) > 60:
        title_longo += 1
    m = re.search(r'name="description" content="(.*?)"', t, re.S)
    if m:
        n = len(re.sub(r'\s+', ' ', _html.unescape(m.group(1))).strip())
        if n < 100 or n > 175:
            desc_fora += 1
    corpo = t
    imgs = re.findall(r'<img\b[^>]*>', corpo)
    if imgs and 'loading="lazy"' in imgs[0]:
        lazy_primeiro += 1
    for i in imgs:
        if 'width=' not in i or 'height=' not in i:
            img_sem_medida += 1
    ih2, ih3 = corpo.find('<h2'), corpo.find('<h3')
    if ih3 >= 0 and (ih2 < 0 or ih3 < ih2):
        h3_antes += 1

if sem_body:
    diz('🔴 %d pagina(s) sem <body>', sem_body)
if sem_fecha:
    diz('%d pagina(s) sem </html> no fim', sem_fecha)
if script_aberto:
    diz('🔴 %d pagina(s) com <script> sem fechamento', script_aberto)
if title_longo:
    diz('%d title acima de 60 caracteres', title_longo)
if desc_fora:
    diz('%d meta description fora da regua de 100 a 175', desc_fora)
if lazy_primeiro:
    diz('%d pagina(s) com a PRIMEIRA imagem em loading=lazy, o que atrasa o LCP',
        lazy_primeiro)
if img_sem_medida:
    diz('%d <img> sem width ou height', img_sem_medida)
if h3_antes:
    diz('%d pagina(s) com h3 antes do primeiro h2', h3_antes)

# ---- link de editoria: tem que sair com o categoryBase
home = carrega(PUB + '/index.html')
espera = ('/%s/' % base) if base else '/'
errado = 0
for ed in eds:
    if base and re.search(r'href="/%s/"' % re.escape(ed), home):
        errado += 1
if errado:
    diz('🔴 %d link(s) de editoria montado(s) a mao, sem o categoryBase "%s": '
        'o menu fica bonito e quebra no clique', errado, base)

certos = len(re.findall(r'href="/%s/[a-z0-9-]+/"' % re.escape(base), home)) if base \
    else len(re.findall(r'href="/[a-z0-9-]+/"', home))
print('  links de editoria no formato certo na home: %d' % certos)

# ---- span com aspect-ratio precisa de display:block
css = glob.glob(PUB + '/*.css') + glob.glob(PUB + '/assets/*.css')
for c in css:
    tc = carrega(c)
    for m in re.finditer(r'\{[^}]*aspect-ratio[^}]*\}', tc):
        if 'display:block' not in m.group(0) and 'display: block' not in m.group(0):
            diz('aspect-ratio sem display:block em %s', os.path.basename(c))
            break

# ---- listagem nao pode repetir o destaque
for ed in eds:
    p = os.path.join(PUB, base, ed, 'index.html') if base else os.path.join(PUB, ed, 'index.html')
    if not os.path.isfile(p):
        continue
    t = carrega(p)
    hrefs = re.findall(r'<a class="[^"]*" href="(/[^"]+/)"', t)
    art = [h for h in hrefs if h.count('/') >= 2]
    rep = [h for h in set(art) if art.count(h) > 1]
    if rep:
        diz('🔴 listagem de %s repete o destaque na grade: %s', ed, rep[0])
    break

print()
if achados:
    for a in achados:
        print('  ' + a)
else:
    print('  nenhum apontamento')
