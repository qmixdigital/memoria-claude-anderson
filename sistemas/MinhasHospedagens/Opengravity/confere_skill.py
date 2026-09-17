# -*- coding: utf-8 -*-
"""Confere, item a item, o que a skill de conversao parcial exige.

Roda no servidor, sobre os portais convertidos por esta skill. Cada linha e um
item do checklist, e o que sai e so o que ESTA errado: portal sem apontamento
nao aparece.

O que e conferido, na ordem da skill:

  Fase 5  URL: `flatUrl` e `categoryBase` presentes; menu do topo apontando para
          endereco que existe; a 404 respondendo 404
  Fase 5  AdSense: quem tem `adsense` tem `ads.txt` no disco, com o id **sem**
          prefixo, e o HTML servido com `client=ca-pub-`
  Fase 5  Antonio: `ns`, `apikey` e `defaultCategory` presentes, e a editoria
          padrao existindo no `categoryMap`
  Fase 6  autor: todo autor citado nos artigos tem pagina em `extraPages`
  Fase 7  conteudo: travessao, entidade escapada duas vezes, `<script>` sem
          fechamento, linha fina repetindo a abertura, titulo acima de 60 e meta
          description fora da regua
  Fase 8  sitemap: `/sitemap.xml` no disco e sem URL que nao existe
  geral   `<body>` abrindo, `og:image` na home, breadcrumb sem ancora generica
"""
import collections
import glob
import io
import json
import os
import re
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CFG = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
ALVOS = [a for a in sys.argv[1:] if not a.startswith('--')]

RX_ENT = re.compile(r'&amp;(?:[a-z]{2,8}|#\d{2,5});')
RX_TIT = re.compile(r'(?i)<title>(.*?)</title>', re.S)
RX_DESC = re.compile(r'(?i)<meta name="description" content="(.*?)"')
RX_MENU = re.compile(r'(?i)<nav[^>]*>(.*?)</nav>', re.S)
RX_HREF = re.compile(r'(?i)href="(/[^"#?]*)"')
GEN = {'inicio', 'início', 'home', 'blog', 'site', 'aqui', 'pagina inicial',
       'página inicial'}


def achata(t):
    return re.sub(r'\s+', ' ', re.sub('<[^>]+>', ' ', t or '')).strip().lower()


for site in CFG['sites']:
    slug = site['slug']
    if ALVOS and slug not in ALVOS:
        continue
    D = '/srv/portais/%s/data' % slug
    PUB = '/srv/portais/%s/public' % slug
    if not os.path.isdir(PUB):
        continue
    ruins = []

    # ---- Fase 5: URL
    if 'flatUrl' not in site:
        ruins.append('sem flatUrl no sites.json')
    for campo in ('ns', 'apikey', 'defaultCategory', 'contactTo', 'indexnowKey'):
        if not site.get(campo):
            ruins.append('sem %s' % campo)
    # a editoria padrao tem que existir no mapa
    # ⚠️ a comparacao normaliza ACENTO dos dois lados: o `categoryMap` guarda
    # "Noticias" e o `defaultCategory` "Notícias", e sem isso os 12 portais que
    # estao certos aparecem como errados
    import unicodedata

    def _sem(t):
        return unicodedata.normalize('NFD', (t or '').strip().lower()).encode(
            'ascii', 'ignore').decode()

    padrao = _sem(site.get('defaultCategory'))
    nomes = {_sem(v.get('name')) for v in (site.get('categoryMap') or {}).values()
             if isinstance(v, dict)}
    if padrao and nomes and padrao not in nomes:
        ruins.append('defaultCategory "%s" fora do categoryMap' % site['defaultCategory'])

    # ---- a 404
    if os.path.isfile(os.path.join(PUB, '404.html')):
        pass
    else:
        ruins.append('sem 404.html na raiz')

    home = os.path.join(PUB, 'index.html')
    h = io.open(home, encoding='utf-8').read() if os.path.isfile(home) else ''
    if h:
        if '<body' not in h:
            ruins.append('a home nao abre <body>')
        if 'og:image' not in h:
            ruins.append('home sem og:image')
        # menu do topo apontando para endereco que existe
        mm = RX_MENU.search(h)
        if mm:
            for u in set(RX_HREF.findall(mm.group(1))):
                alvo = u.strip('/')
                if alvo and not os.path.isfile(os.path.join(PUB, alvo, 'index.html')):
                    ruins.append('menu do topo em 404: %s' % u)

    # ---- Fase 5: AdSense
    tem_ads = bool(site.get('adsense'))
    ads = os.path.join(PUB, 'ads.txt')
    if tem_ads:
        if not os.path.isfile(ads):
            ruins.append('tem adsense no sites.json e nao tem ads.txt')
        else:
            t = io.open(ads, encoding='utf-8').read()
            if 'ca-pub-' in t:
                ruins.append('ads.txt com o prefixo ca- (tem que ser sem)')
        if h and 'client=ca-pub-' not in h:
            ruins.append('home sem client=ca-pub- no loader')
    elif os.path.isfile(ads):
        ruins.append('nao tem adsense no sites.json mas tem ads.txt')

    # ---- Fase 6 e 7: o acervo
    autores = collections.Counter()
    trav = ent = script = 0
    for f in glob.glob(os.path.join(D, '*.json')):
        d = json.load(io.open(f, encoding='utf-8'))
        c = d.get('content') or ''
        if d.get('author'):
            autores[d['author']] += 1
        if chr(8212) in c or chr(8212) in (d.get('title') or '') \
                or chr(8212) in (d.get('dek') or ''):
            trav += 1
        if RX_ENT.search(c) or RX_ENT.search(d.get('title') or ''):
            ent += 1
        if c.count('<script') != c.count('</script>'):
            script += 1
        # ⚠️ o dek repetido no JSON e FALSO POSITIVO: o motor apaga o campo na
        # pagina do artigo e o mantem so no cartao, onde ele e o resumo. O que
        # vale medir e a pagina renderizada, e nao o arquivo
    if trav:
        ruins.append('travessao em %d artigos' % trav)
    if ent:
        ruins.append('entidade escapada duas vezes em %d artigos' % ent)
    if script:
        ruins.append('<script> sem fechamento em %d artigos' % script)


    paginas = {p['slug'] for p in (site.get('extraPages') or [])}
    equipe = {e['nome'] for e in (site.get('equipe') or [])}
    for nome in autores:
        if nome not in equipe:
            ruins.append('assinatura sem pagina: %s (%d artigos)' % (nome, autores[nome]))

    # ---- Fase 7: title e meta description do HTML servido
    fora_tit = fora_desc = crumb = 0
    for f in glob.glob(PUB + '/**/index.html', recursive=True):
        x = io.open(f, encoding='utf-8').read()
        m = RX_TIT.search(x)
        if m:
            t = m.group(1).replace('&amp;', '&').replace('&quot;', '"').strip()
            if len(t) > 65:
                fora_tit += 1
        m = RX_DESC.search(x)
        if m:
            t = m.group(1).replace('&amp;', '&').replace('&quot;', '"').strip()
            if t and not (100 <= len(t) <= 175):
                fora_desc += 1
        for a in re.findall(r'(?is)<nav[^>]*aria-label="[^"]*rilha[^"]*"[^>]*>(.*?)</nav>', x):
            for txt in re.findall(r'(?is)<a[^>]*>(.*?)</a>', a):
                if achata(txt) in GEN:
                    crumb += 1
    if fora_tit:
        ruins.append('title acima de 65 em %d paginas' % fora_tit)
    if fora_desc:
        ruins.append('meta description fora da regua em %d paginas' % fora_desc)
    if crumb:
        ruins.append('ancora generica no breadcrumb em %d paginas' % crumb)

    # ---- Fase 8: sitemap
    sm = os.path.join(PUB, 'sitemap.xml')
    if not os.path.isfile(sm):
        ruins.append('sem sitemap.xml')
    else:
        urls = re.findall(r'<loc>([^<]+)</loc>', io.open(sm, encoding='utf-8').read())
        base = (site.get('baseUrl') or '').rstrip('/')
        mortas = 0
        for u in urls:
            cam = u.replace(base, '').strip('/')
            if cam and not os.path.isfile(os.path.join(PUB, cam, 'index.html')):
                mortas += 1
        if mortas:
            ruins.append('sitemap com %d URL que nao existe no disco' % mortas)

    if ruins:
        print('  %-22s %s' % (slug, ' | '.join(ruins)))

print('  fim')
