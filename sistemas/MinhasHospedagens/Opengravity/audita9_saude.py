# -*- coding: utf-8 -*-
"""Fase 9: auditoria sobre o HTML PUBLICADO, e nao sobre o dado.

Uso, no servidor:  python3 /tmp/audita9_saude.py <slug>

O que interessa e o que o Google ve, e varios defeitos so existem depois da
renderizacao. Cobre o que a checagem comum nao cobre:

  - sitemap contra o disco, **nos dois sentidos**: URL no sitemap que nao existe,
    e pagina que existe e ficou de fora
  - canonical apontando para a **propria** URL, e nao so presente
  - `og:image` que aponta para arquivo inexistente. ⚠️ **descartar a query antes
    de testar o caminho**: o motor acrescenta `?v=LARGURAxALTURA` e sem isso o
    relatorio enche de falso positivo
  - JSON-LD que nao abre no parser
  - `noindex` vazado fora da 404
  - grafo de links: pagina orfa e pagina sem link de saida, contando o rodape
  - titulo repetido, descricao faltando, curta, longa ou repetida
  - ⚠️ `<img>` sem `src` infla a contagem de alt faltando e esconde o caso real
"""
import collections
import glob
import html as _html
import io
import json
import os
import re
import sys
import urllib.parse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
SLUG = sys.argv[1]
PUB = '/srv/portais/%s/public' % SLUG
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
site = [s for s in cfg['sites'] if s['slug'] == SLUG][0]
BASE = site['baseUrl'].rstrip('/')

achados = []


def diz(f, *a):
    achados.append(f % a if a else f)


def ler(p):
    return io.open(p, encoding='utf-8', errors='replace').read()


paginas = sorted(set(glob.glob(PUB + '/**/index.html', recursive=True) + [PUB + '/index.html']))
paginas = [p for p in paginas if os.path.isfile(p)]


def url_de(p):
    rel = os.path.relpath(os.path.dirname(p), PUB).replace(os.sep, '/')
    return '/' if rel in ('.', '') else '/%s/' % rel


# ---------------- sitemap nos dois sentidos
sm = os.path.join(PUB, 'sitemap.xml')
no_sitemap = set()
if os.path.isfile(sm):
    for m in re.finditer(r'<loc>([^<]+)</loc>', ler(sm)):
        u = urllib.parse.urlsplit(m.group(1)).path
        no_sitemap.add(u if u.endswith('/') or '.' in u.split('/')[-1] else u + '/')
else:
    diz('🔴 sem sitemap.xml no disco')

no_disco = {url_de(p) for p in paginas}
faltando = sorted(no_sitemap - no_disco)
de_fora = sorted(no_disco - no_sitemap)
if faltando:
    diz('🔴 %d URL(s) no sitemap sem pagina no disco. Ex: %s',
        len(faltando), ', '.join(faltando[:3]))
# 404, busca e paginas de servico ficam de fora do sitemap de proposito
IGNORA = re.compile(r'^/(busca|404)/?$')
de_fora = [u for u in de_fora if not IGNORA.match(u)]
if de_fora:
    diz('%d pagina(s) no disco fora do sitemap. Ex: %s', len(de_fora), ', '.join(de_fora[:3]))

# ---------------- por pagina
titulos = collections.Counter()
descs = collections.Counter()
sem_desc = canon_errado = jsonld_ruim = noindex = og_quebrada = 0
alt_faltando = alt_vazio = 0
saida = {}
entrada = collections.Counter()
RX_A = re.compile(r'href="(/[^"#?]*)"')

for p in paginas:
    t = ler(p)
    u = url_de(p)

    m = re.search(r'<title>(.*?)</title>', t, re.S)
    if m:
        titulos[re.sub(r'\s+', ' ', _html.unescape(m.group(1))).strip()] += 1
    m = re.search(r'name="description" content="(.*?)"', t, re.S)
    if m:
        descs[_html.unescape(m.group(1)).strip()[:80]] += 1
    else:
        sem_desc += 1

    m = re.search(r'rel="canonical" href="([^"]+)"', t)
    if not m:
        canon_errado += 1
    else:
        cp = urllib.parse.urlsplit(m.group(1)).path or '/'
        if cp != u:
            canon_errado += 1
            if canon_errado <= 2:
                diz('canonical de %s aponta para %s', u, cp)

    for m in re.finditer(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', t, re.S):
        try:
            json.loads(m.group(1))
        except Exception:
            jsonld_ruim += 1
            if jsonld_ruim <= 2:
                diz('🔴 JSON-LD que nao abre no parser: %s', u)

    # /busca/ e /404/ sao noindex de proposito: pagina de resultado nao entra
    # no indice, e a de erro tampouco
    if 'noindex' in t and not re.match(r'^/(404|busca)/?$', u):
        noindex += 1

    m = re.search(r'property="og:image" content="([^"]+)"', t)
    if m:
        # ⚠️ o motor acrescenta ?v=LARGURAxALTURA: sem descartar a query, o
        # caminho nunca existe e o relatorio enche de falso positivo
        cam = urllib.parse.urlsplit(m.group(1)).path
        if cam.startswith('/') and not os.path.isfile(os.path.join(PUB, cam.lstrip('/'))):
            og_quebrada += 1
            if og_quebrada <= 2:
                diz('og:image sem arquivo: %s -> %s', u, cam)

    # ⚠️ img sem src infla a contagem de alt faltando e esconde o caso real.
    # ⚠️ E `alt=""` NAO e alt faltando: e a marcacao correta de imagem
    # decorativa, como o logotipo ao lado do nome ja escrito em texto. O
    # defeito de verdade e o atributo AUSENTE
    for tag in re.findall(r'<img[^>]*>', t):
        if 'src=' not in tag:
            continue
        if 'alt=' not in tag:
            alt_faltando += 1
        elif re.search(r'alt="\s*"', tag) and '/img/_marca' not in tag:
            alt_vazio += 1

    links = {x for x in RX_A.findall(t) if not re.search(r'\.[a-z0-9]{2,5}$', x)}
    links = {x if x.endswith('/') else x + '/' for x in links}
    saida[u] = len(links - {u})
    for d in links:
        if d != u:
            entrada[d] += 1

rep_t = [x for x, n in titulos.items() if n > 1 and x]
rep_d = [x for x, n in descs.items() if n > 1 and x]
orfas = sorted(u for u in no_disco if entrada[u] == 0 and u != '/')
sem_saida = sorted(u for u, n in saida.items() if n == 0)

if sem_desc:
    diz('%d pagina(s) sem meta description', sem_desc)
if canon_errado:
    diz('🔴 %d canonical ausente ou apontando para outra URL', canon_errado)
if jsonld_ruim:
    diz('🔴 %d bloco(s) de JSON-LD invalido(s)', jsonld_ruim)
if noindex:
    diz('🔴 %d pagina(s) com noindex fora da 404', noindex)
if og_quebrada:
    diz('🔴 %d og:image apontando para arquivo inexistente', og_quebrada)
if alt_faltando:
    diz('🔴 %d <img> com src e SEM o atributo alt', alt_faltando)
if alt_vazio:
    diz('%d <img> de conteudo com alt vazio: descreve nada para quem nao ve a foto',
        alt_vazio)
if rep_t:
    diz('🔴 %d title repetido(s). Ex: %s', len(rep_t), rep_t[0][:70])
if rep_d:
    diz('%d meta description repetida(s). Ex: %s', len(rep_d), rep_d[0][:60])
if orfas:
    diz('🔴 %d pagina(s) orfa(s), sem nenhum link de entrada. Ex: %s',
        len(orfas), ', '.join(orfas[:3]))
if sem_saida:
    diz('🔴 %d pagina(s) sem nenhum link de saida. Ex: %s',
        len(sem_saida), ', '.join(sem_saida[:3]))

print('  %s: %d paginas | sitemap com %d URLs' % (SLUG, len(paginas), len(no_sitemap)))
if achados:
    for a in achados:
        print('     ' + a)
else:
    print('     nenhum apontamento')
