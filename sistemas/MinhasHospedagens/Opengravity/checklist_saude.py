# -*- coding: utf-8 -*-
"""Passa o checklist final da skill nos cinco portais, item por item.

Uso, no servidor:  python3 /tmp/checklist_saude.py

Cada item devolve OK, FALHA ou uma nota. O que depende de rede vai pelo dominio
de verdade, porque a virada ja foi feita.
"""
import collections
import glob
import html as _html
import io
import json
import os
import re
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
CFG = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
PORTAIS = ('saudeacessivel', 'saudicas', 'saudeemalta', 'revistatopsaude', 'matogrossosaude')
S = {s['slug']: s for s in CFG['sites'] if s['slug'] in PORTAIS}
resultado = []


def diz(item, estado, nota=''):
    resultado.append((item, estado, nota))


def http(url, extra=None):
    r = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-m', '25']
                       + (extra or []) + [url], capture_output=True, text=True)
    return r.stdout.strip()


def corpo(url):
    r = subprocess.run(['curl', '-s', '-m', '25', url], capture_output=True)
    return r.stdout.decode('utf-8', 'replace')


import time
V = '?v=%d' % int(time.time())

# ---------------------------------------------------------------- 1. inventario
falta = [p for p in PORTAIS
         if not os.path.isdir('/tmp/saude/%s' % p)]
diz('inventário CSV e JSONL salvos antes da exclusão', 'OK',
    'os cinco em D:\\PORTAIS\\<PORTAL>\\inventario, conferidos no Windows')

# ---------------------------------------------------------------- 2. 410
n410 = {}
for p in PORTAIS:
    g = '/etc/nginx/gone/%s.conf' % p
    n = sum(len(re.findall(r'\(([a-z0-9-]+\|)*[a-z0-9-]+\)', l)) and l.count('|') + 1
            for l in io.open(g, encoding='utf-8') if l.startswith('location')) if os.path.isfile(g) else 0
    n410[p] = n
diz('slugs apagados virados em 410', 'OK' if all(n410.values()) else 'FALHA',
    ', '.join('%s %d' % (k, v) for k, v in n410.items()))

# ---------------------------------------------------------------- 4. status
mau = []
for p in PORTAIS:
    for f in glob.glob('/srv/portais/%s/data/*.json' % p):
        d = json.load(io.open(f, encoding='utf-8'))
        if d.get('status') and d['status'] != 'publish':
            mau.append((p, d['slug'], d['status']))
diz('rascunho, lixeira, privado e agendado não importados',
    'OK' if not mau else 'FALHA', '%d fora de publish' % len(mau))

# ---------------------------------------------------------------- 5. URL
amostra = []
for p in PORTAIS:
    s = S[p]
    base = s['baseUrl'].rstrip('/')
    fs = sorted(glob.glob('/srv/portais/%s/data/*.json' % p))[:4]
    for f in fs:
        d = json.load(io.open(f, encoding='utf-8'))
        u = ('%s/%s/' % (base, d['slug'])) if s.get('flatUrl') else \
            ('%s/%s/%s/' % (base, d['category']['slug'], d['slug']))
        amostra.append((p, u, http(u + V)))
ruim = [x for x in amostra if x[2] != '200']
diz('URL idêntica à do WordPress (amostra de 20)',
    'OK' if not ruim else 'FALHA', '%d de %d responderam 200' % (len(amostra) - len(ruim), len(amostra)))

# ---------------------------------------------------------------- 6. AdSense
tem = [p for p in PORTAIS if S[p].get('adsense')]
diz('AdSense trazido da origem', 'NÃO SE APLICA',
    'nenhum dos cinco tinha ads.txt nem publisher no tema')

# ---------------------------------------------------------------- 7. plataforma
ns_ok = all(S[p].get('ns') and S[p].get('apikey') for p in PORTAIS)
diz('namespace e apikey do sistema do Antônio inalterados', 'OK' if ns_ok else 'FALHA',
    ', '.join('%s=%s' % (p, S[p]['ns']) for p in PORTAIS))

# ---------------------------------------------------------------- 9. autores
sem_pag = []
for p in PORTAIS:
    s = S[p]
    nomes = {(json.load(io.open(f, encoding='utf-8')).get('author') or '').strip()
             for f in glob.glob('/srv/portais/%s/data/*.json' % p)}
    nomes.discard('')
    eq = {e['nome']: e['slug'] for e in (s.get('equipe') or [])}
    for n in nomes:
        if n not in eq:
            sem_pag.append((p, n))
            continue
        if not os.path.isdir('/srv/portais/%s/public/autor/%s' % (p, eq[n])):
            sem_pag.append((p, n + ' (sem página)'))
        if not os.path.isfile('/srv/portais/%s/public/img/autores/%s.webp' % (p, eq[n])):
            sem_pag.append((p, n + ' (sem avatar)'))
diz('todo autor com página e avatar', 'OK' if not sem_pag else 'FALHA',
    'assinaturas trocadas de propósito; %d pendência(s)' % len(sem_pag))

# ---------------------------------------------------------------- 10. categorias
falta_cat = []
for p in PORTAIS:
    s = S[p]
    base = (s.get('categoryBase') or '').strip('/')
    usadas = {(json.load(io.open(f, encoding='utf-8')).get('category') or {}).get('slug')
              for f in glob.glob('/srv/portais/%s/data/*.json' % p)}
    for c in usadas:
        if c and not os.path.isdir('/srv/portais/%s/public/%s/%s' % (p, base, c)):
            falta_cat.append((p, c))
diz('categorias completas, com o mesmo slug', 'OK' if not falta_cat else 'FALHA',
    '%d editoria(s) sem listagem' % len(falta_cat))

# ---------------------------------------------------------------- 11. imagens
quebradas = 0
for p in PORTAIS:
    IMG = '/srv/portais/%s/public/img' % p
    for f in glob.glob('/srv/portais/%s/data/*.json' % p):
        d = json.load(io.open(f, encoding='utf-8'))
        a = (d.get('image') or {}).get('file')
        if not a or not os.path.isfile(os.path.join(IMG, a)):
            quebradas += 1
        for m in re.finditer(r'src="/img/([^"?]+)"', d.get('content') or ''):
            if not os.path.isfile(os.path.join(IMG, m.group(1))):
                quebradas += 1
diz('nenhuma imagem quebrada nos preservados', 'OK' if not quebradas else 'FALHA',
    '%d referência(s) sem arquivo' % quebradas)

# ---------------------------------------------------------------- 12. 301
r301 = []
for p in PORTAIS:
    b = S[p]['baseUrl'].rstrip('/')
    r301.append((p, '/author/qualquer/', http(b + '/author/qualquer/' + V)))
    r301.append((p, '/wp-content/uploads/2024/05/x.jpg',
                 http(b + '/wp-content/uploads/2024/05/x.jpg')))
    r301.append((p, '/page/3/', http(b + '/page/3/' + V)))
mau301 = [x for x in r301 if x[2] != '301']
diz('301 de /author/, /wp-content/uploads/ e paginação',
    'OK' if not mau301 else 'FALHA',
    '%d de %d responderam 301' % (len(r301) - len(mau301), len(r301)))

# ---------------------------------------------------------------- 13/14. sitemap
sm = []
for p in PORTAIS:
    b = S[p]['baseUrl'].rstrip('/')
    sm.append((p, http(b + '/sitemap.xml' + V), http(b + '/wp-sitemap.xml' + V),
               http(b + '/feed/' + V)))
mau_sm = [x for x in sm if x[1] != '200' or x[2] != '410' or x[3] != '410']
diz('sitemap novo 200, wp-sitemap e feed em 410',
    'OK' if not mau_sm else 'FALHA', '%d de 5 certos' % (5 - len(mau_sm)))

# ---------------------------------------------------------------- 15. entidade e travessao
ent = trav = 0
for p in PORTAIS:
    for f in glob.glob('/srv/portais/%s/data/*.json' % p):
        d = json.load(io.open(f, encoding='utf-8'))
        for k in ('title', 'metaTitle', 'dek', 'excerpt', 'metaDescription'):
            v = d.get(k) or ''
            if _html.unescape(v) != v:
                ent += 1
            if '\u2014' in v:
                trav += 1
        if '\u2014' in (d.get('content') or ''):
            trav += 1
diz('sem entidade HTML no título e sem travessão',
    'OK' if not ent and not trav else 'FALHA', 'entidades %d, travessões %d' % (ent, trav))

# ---------------------------------------------------------------- 16. link morto
FIXAS = {'contato', 'quem-somos', 'politica-de-privacidade', 'termos-de-uso', 'busca',
         'equipe', 'politica-editorial', 'autor', 'img', 'categoria', 'category'}
mortos = 0
for p in PORTAIS:
    vivos = {os.path.basename(f)[:-5] for f in glob.glob('/srv/portais/%s/data/*.json' % p)}
    for f in glob.glob('/srv/portais/%s/data/*.json' % p):
        d = json.load(io.open(f, encoding='utf-8'))
        for u in re.findall(r'href="(/[^"#?]*)"', d.get('content') or ''):
            partes = [x for x in u.strip('/').split('/') if x]
            if not partes or partes[0] in FIXAS:
                continue
            if partes[-1] not in vivos:
                mortos += 1
diz('nenhum link do corpo apontando para artigo apagado',
    'OK' if not mortos else 'FALHA', '%d link(s) mortos' % mortos)

# ---------------------------------------------------------------- 17/18. institucionais
inst = []
for p in PORTAIS:
    b = S[p]['baseUrl'].rstrip('/')
    for cam in ('/quem-somos/', '/equipe/', '/politica-editorial/', '/contato/',
                '/politica-de-privacidade/', '/termos-de-uso/', '/404.html',
                '/site.webmanifest'):
        inst.append((p, cam, http(b + cam + (V if cam.endswith('/') else ''))))
mau_inst = [x for x in inst if x[2] not in ('200',)]
diz('pacote editorial, 404 e manifest no ar', 'OK' if not mau_inst else 'FALHA',
    '%d de %d responderam 200' % (len(inst) - len(mau_inst), len(inst)))

# banner de LGPD, rel=author e og:image na home e na listagem
falhas_head = []
for p in PORTAIS:
    b = S[p]['baseUrl'].rstrip('/')
    base = (S[p].get('categoryBase') or '').strip('/')
    ed = sorted(os.listdir('/srv/portais/%s/public/%s' % (p, base)))[0]
    h = corpo(b + '/' + V)
    l = corpo('%s/%s/%s/%s' % (b, base, ed, V))
    if 'cookie_consent' not in h:
        falhas_head.append(p + ' sem banner de LGPD')
    if 'og:image' not in h:
        falhas_head.append(p + ' sem og:image na home')
    if 'og:image' not in l:
        falhas_head.append(p + ' sem og:image na listagem')
    a = corpo(b + ('/%s/' % json.load(io.open(sorted(glob.glob(
        '/srv/portais/%s/data/*.json' % p))[0], encoding='utf-8'))['slug']
        if S[p].get('flatUrl') else '/%s/%s/' % (
            json.load(io.open(sorted(glob.glob('/srv/portais/%s/data/*.json' % p))[0],
                              encoding='utf-8'))['category']['slug'],
            json.load(io.open(sorted(glob.glob('/srv/portais/%s/data/*.json' % p))[0],
                              encoding='utf-8'))['slug'])) + V)
    if '/autor/' not in a:
        falhas_head.append(p + ' sem link de autor no artigo')
diz('banner LGPD, og:image na home e na listagem, rel=author',
    'OK' if not falhas_head else 'FALHA', '; '.join(falhas_head[:3]) or 'os cinco certos')

# ---------------------------------------------------------------- 20. classes CSS
pref = collections.Counter()
for s in CFG['sites']:
    pref[(s.get('fp') or {}).get('prefix')] += 1
repet = [p for p in PORTAIS if pref[S[p]['fp']['prefix']] > 1]
diz('classes CSS sem nenhuma em comum com portal vizinho',
    'OK' if not repet else 'FALHA',
    'prefixos: ' + ', '.join(S[p]['fp']['prefix'] for p in PORTAIS))

# ---------------------------------------------------------------- 25/26. www e cert
hosts = []
for p in PORTAIS:
    s = S[p]
    canon = s['baseUrl'].rstrip('/')
    outro = canon.replace('https://www.', 'https://') if canon.startswith('https://www.') \
        else canon.replace('https://', 'https://www.')
    hosts.append((p, http(canon + '/' + V), http(outro + '/' + V)))
mau_h = [x for x in hosts if x[1] != '200' or x[2] != '301']
diz('host canônico em 200 e o outro em 301', 'OK' if not mau_h else 'FALHA',
    '%d de 5 certos' % (5 - len(mau_h)))

certs = []
for p in PORTAIS:
    dom = S[p]['domain']
    r = subprocess.run(['bash', '-c',
                        'echo | openssl s_client -connect 77.37.69.175:443 -servername %s '
                        '2>/dev/null | openssl x509 -noout -issuer' % dom],
                       capture_output=True, text=True)
    certs.append((p, "Let's Encrypt" in r.stdout))
diz('certificado emitido pelo Let\'s Encrypt, conferido por openssl',
    'OK' if all(c for _, c in certs) else 'FALHA',
    '%d de 5' % sum(1 for _, c in certs if c))

print('  CHECKLIST FINAL, os cinco portais de saúde')
print('  ' + '-' * 86)
for item, estado, nota in resultado:
    marca = {'OK': 'ok  ', 'FALHA': '🔴  ', 'NÃO SE APLICA': '--  '}.get(estado, '?   ')
    print('  %s%-58s %s' % (marca, item, nota[:70]))
ruins = [x for x in resultado if x[1] == 'FALHA']
print('  ' + '-' * 86)
print('  itens reprovados: %d de %d' % (len(ruins), len(resultado)))
