# -*- coding: utf-8 -*-
"""Confere a ocultacao dos artigos de apostas nos 64 portais.

Para cada portal: baixa a home e conta quantos slugs da lista ainda aparecem
(tem que ser zero), e sorteia um slug para provar que a URL continua no ar (200)
e que o artigo segue no sitemap. Nada foi apagado, so saiu da home.
"""
import json, io, ssl, gzip, random, sys
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
ctx = ssl.create_default_context()
ARQ = r'D:\SISTEMAS\portal-engine\scripts\oneoff\apostas-hideslugs-20260928.json'
TSV = r'D:\SISTEMAS\portal-engine\scripts\oneoff\apostas-scan-20260928.tsv'

def get(url, timeout=25):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Encoding': 'gzip'})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            raw = r.read()
            if r.headers.get('Content-Encoding') == 'gzip':
                raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
            return r.status, raw.decode('utf-8', 'ignore')
    except urllib.error.HTTPError as e:
        return e.code, ''
    except Exception:
        return 0, ''

# baseUrl de cada portal sai do tsv da varredura
base = {}
for ln in io.open(TSV, encoding='utf-8'):
    p = ln.rstrip('\n').split('\t')
    if len(p) > 2 and p[2].startswith('http'):
        base[p[0] + '|' + p[1]] = p[2].rstrip('/')

alvo = json.load(io.open(ARQ, encoding='utf-8'))
random.seed(7)

def confere(item):
    chave, slugs = item
    b = base.get(chave)
    if not b:
        return (chave, None, 'sem baseUrl no tsv')
    st, home = get(b + '/?v=conf')
    if st != 200:
        return (chave, None, 'home %s' % st)
    restam = [s for s in slugs if ('/%s/' % s) in home]
    s = random.choice(slugs)
    st2, _ = get(b + '/' + s + '/')
    if st2 != 200:                      # portal com URL por categoria
        stm, sm = get(b + '/sitemap.xml')
        alvo_url = [u for u in sm.split('<loc>') if ('/%s/' % s) in u[:300]]
        st2 = 200 if alvo_url else st2
        url = alvo_url[0].split('<')[0] if alvo_url else b + '/' + s + '/'
        if alvo_url:
            st2, _ = get(url)
    stm, sm = get(b + '/sitemap.xml')
    no_sitemap = ('/%s/' % s) in sm
    return (chave, {'na_home': len(restam), 'artigo': st2, 'no_sitemap': no_sitemap, 'exemplo': s, 'restam': restam[:3]}, None)

with ThreadPoolExecutor(10) as ex:
    res = list(ex.map(confere, alvo.items()))

ruins = [(k, r, e) for k, r, e in res if e or not r or r['na_home'] or r['artigo'] != 200 or not r['no_sitemap']]
print('portais conferidos:', len(res))
print('home limpa (nenhum slug da lista):', sum(1 for k, r, e in res if r and not r['na_home']))
print('artigo sorteado responde 200:', sum(1 for k, r, e in res if r and r['artigo'] == 200))
print('artigo sorteado no sitemap:', sum(1 for k, r, e in res if r and r['no_sitemap']))
if ruins:
    print('\nCONFERIR:')
    for k, r, e in ruins:
        print(' ', k, e or r)
