# -*- coding: utf-8 -*-
"""Diagnostico de saude do portal-engine da maquina onde roda.

Cobre o que costuma quebrar em silencio depois de muitas conversoes seguidas:

  1. **integridade do `sites.json`**: carrega, nao tem slug repetido, nao tem
     dominio repetido, e todo portal tem `data/`, `public/`, `index.html`,
     `sitemap.xml` e `404.html`
  2. **letra de arquitetura repetida** entre portais da mesma maquina, que faria
     dois sites saírem iguais
  3. **prefixo de classe repetido**, que e impressao digital de rede
  4. **namespace e chave da plataforma do Antonio** repetidos entre portais: dois
     portais com o mesmo `ns` disputam a mesma rota
  5. **rota de recebimento** respondendo, uma por portal
  6. **backup acumulado** de `sites.json` e `archs.js`, que enche o disco devagar
  7. **peso de cada portal** no disco, para achar o que cresce sozinho
  8. **arquivo orfao em `public/img/`**: imagem que nenhum artigo cita
"""
import collections
import glob
import io
import json
import os
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = '/opt/portal-engine/sites.json'
cfg = json.load(io.open(P, encoding='utf-8'))
sites = cfg['sites']
print('  portais no sites.json: %d' % len(sites))

# 1. integridade
faltando = []
for s in sites:
    base = '/srv/portais/%s' % s['slug']
    for alvo in ('data', 'public', 'public/index.html', 'public/sitemap.xml',
                 'public/404.html', 'public/robots.txt'):
        cam = os.path.join(base, alvo)
        if not os.path.exists(cam):
            faltando.append('%s: %s' % (s['slug'], alvo))
print('  arquivos obrigatorios faltando: %d %s' % (len(faltando), faltando[:5]))

for campo in ('slug', 'domain'):
    c = collections.Counter(s.get(campo) for s in sites)
    rep = [k for k, v in c.items() if v > 1 and k]
    print('  %s repetido: %s' % (campo, rep or 'nenhum'))

# 2 e 3. arquitetura e prefixo
for campo in ('arch', 'prefix'):
    c = collections.Counter((s.get('fp') or {}).get(campo) for s in sites)
    rep = {k: v for k, v in c.items() if v > 1 and k}
    print('  fp.%s repetido: %s' % (campo, rep or 'nenhum'))

# 4. o contrato do Antonio
for campo in ('ns', 'apikey'):
    c = collections.Counter(s.get(campo) for s in sites if s.get(campo))
    rep = {k: v for k, v in c.items() if v > 1}
    print('  %s repetido: %s' % (campo, rep or 'nenhum'))
sem = [s['slug'] for s in sites if not s.get('ns') or not s.get('apikey')]
print('  portais sem ns ou apikey: %s' % (sem or 'nenhum'))

# 5. a rota de recebimento, uma por portal
ruins = []
for s in sites:
    d = s.get('domain') or ''
    ns = s.get('ns') or ''
    if not d or not ns or d.endswith('.local'):
        continue
    r = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-m', '15',
                        '-X', 'POST', '-H', 'Content-Type: application/json',
                        '-H', 'x-api-key: <<REMOVIDO>>', '-d', '{}',
                        'https://%s/%s/v1/artigos' % (d, ns)], capture_output=True, text=True)
    # 401 e o certo: a rota existe e recusou a chave falsa
    if r.stdout.strip() not in ('401', '403'):
        ruins.append((s['slug'], r.stdout.strip()))
print('  rota do Antonio fora do esperado (401/403): %d %s' % (len(ruins), ruins[:6]))

# 6. backups acumulados
for alvo in ('/opt/portal-engine/sites.json', '/opt/portal-engine/src/archs.js',
             '/opt/portal-engine/src/render.js'):
    b = glob.glob(alvo + '.bak*')
    peso = sum(os.path.getsize(x) for x in b) / 1048576.0
    print('  backups de %-28s %3d arquivos, %.1f MB' % (os.path.basename(alvo), len(b), peso))

# 7. peso por portal
pesos = []
for s in sites:
    base = '/srv/portais/%s' % s['slug']
    if not os.path.isdir(base):
        continue
    t = 0
    for raiz, _, arqs in os.walk(base):
        for a in arqs:
            try:
                t += os.path.getsize(os.path.join(raiz, a))
            except OSError:
                pass
    pesos.append((t, s['slug']))
pesos.sort(reverse=True)
print('  disco em /srv/portais: %.1f GB | os 4 maiores:'
      % (sum(p for p, _ in pesos) / 1073741824.0))
for t, slug in pesos[:4]:
    print('     %-24s %6.0f MB' % (slug, t / 1048576.0))

# 8. imagem orfa
orfas = 0
peso_orfo = 0
for s in sites:
    IMG = '/srv/portais/%s/public/img' % s['slug']
    D = '/srv/portais/%s/data' % s['slug']
    if not os.path.isdir(IMG):
        continue
    citadas = set()
    for f in glob.glob(os.path.join(D, '*.json')):
        try:
            txt = io.open(f, encoding='utf-8').read()
        except Exception:
            continue
        for m in __import__('re').finditer(r'/img/([^"\'\\\s)>]+)', txt):
            citadas.add(m.group(1))
        try:
            d = json.loads(txt)
        except Exception:
            continue
        if (d.get('image') or {}).get('file'):
            citadas.add(d['image']['file'])
    for a in os.listdir(IMG):
        cam = os.path.join(IMG, a)
        if not os.path.isfile(cam) or a.startswith('_'):
            continue
        if a not in citadas:
            orfas += 1
            peso_orfo += os.path.getsize(cam)
print('  imagens que nenhum artigo cita: %d (%.0f MB)' % (orfas, peso_orfo / 1048576.0))
