# -*- coding: utf-8 -*-
"""Diagnostico diario do portal-engine. Escreve uma linha por achado.

Feito para rodar em cron e ser lido depois. So imprime o que ESTA errado: dia sem
achado sai com uma linha de "tudo certo".

Vigia os quatro defeitos que ja passaram despercebidos por dias:

  1. 🔴 **conteudo preso como rascunho.** O motor guarda como rascunho tudo que
     chega da plataforma **sem imagem**, devolve HTTP 201 e nao renderiza. Foram
     72 artigos parados por uma semana em 31 portais, e nada acusou
  2. 🔴 **renovacao de certificado falhando.** Certificado de dominio que nao mora
     mais na maquina faz o `certbot.service` sair com erro, e o erro esconde os
     que renovam de verdade. Eram 77 falhas em 30 dias
  3. **pagina de artigo sem JSON**: o rebuild nao apaga pasta, entao artigo
     removido continua no ar com HTML velho
  4. **portal fora do ar**, medido no proprio dominio
  5. 🔴 **arquivo com dono `root`** dentro de `/srv/portais`. O motor roda como
     `portais`: script de manutencao rodado como root deixa o rebuild falhando
     com EACCES naquela pagina, e o portal para de reconstruir a partir dali

Alem disso: espaco em disco, servico ativo e backup acumulado.
"""
import glob
import io
import json
import os
import re
import shutil
import subprocess
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
CFG = '/opt/portal-engine/sites.json'
achados = []


def diz(fmt, *a):
    achados.append(fmt % a if a else fmt)


# 1. servico e disco
r = subprocess.run(['systemctl', 'is-active', 'portal-engine'], capture_output=True, text=True)
if r.stdout.strip() != 'active':
    diz('🔴 portal-engine NAO esta ativo: %s', r.stdout.strip())
u = shutil.disk_usage('/')
pct = 100.0 * u.used / u.total
if pct > 85:
    diz('🔴 disco em %.0f%% (%.0f GB livres)', pct, u.free / 1073741824.0)

cfg = json.load(io.open(CFG, encoding='utf-8'))

# 2. rascunho preso
presos = []
for f in glob.glob('/srv/portais/*/data/*.json'):
    try:
        d = json.load(io.open(f, encoding='utf-8'))
    except Exception:
        continue
    if d.get('status') == 'draft':
        presos.append((f.split('/srv/portais/')[1].split('/')[0], d.get('slug'),
                       (d.get('date') or '')[:10]))
if presos:
    diz('🔴 %d conteudo(s) preso(s) como rascunho, o mais antigo de %s. Sem imagem, '
        'o motor nao publica. Ex: %s / %s',
        len(presos), min(p[2] for p in presos), presos[0][0], presos[0][1])

# 3. certificados
#
# ⚠️ Duas das tres maquinas nao usam Let's Encrypt: elas servem **certificado de
# origem da Cloudflare**, valido ate 2036, e nem tem o `certbot` instalado. Sem
# este `try`, o diagnostico inteiro morre nelas com FileNotFoundError.
try:
    r = subprocess.run(['certbot', 'certificates'], capture_output=True, text=True)
except FileNotFoundError:
    r = None
if r and 'Certificate Name' in r.stdout:
    dias = [int(x) for x in re.findall(r'VALID: (\d+) days?', r.stdout)]
    invalidos = len(re.findall(r'INVALID', r.stdout))
    if invalidos:
        diz('🔴 %d certificado(s) invalido(s)', invalidos)
    if dias and min(dias) < 20:
        diz('🔴 certificado vencendo em %d dias', min(dias))
    j = subprocess.run(['journalctl', '-u', 'certbot', '--since', '3 days ago', '--no-pager'],
                       capture_output=True, text=True)
    falhas = len(re.findall(r'Failed to renew certificate (\S+)', j.stdout))
    if falhas:
        nomes = sorted(set(re.findall(r'Failed to renew certificate (\S+)', j.stdout)))
        diz('🔴 renovacao falhou em 3 dias para: %s. Certificado de dominio que nao '
            'mora mais aqui faz o servico inteiro sair com erro', ', '.join(nomes[:5]))

else:
    # certificado de origem da Cloudflare, em /etc/ssl/portais/<dominio>/
    import datetime
    perto = []
    for pem in glob.glob('/etc/ssl/portais/*/origin*.pem'):
        p = subprocess.run(['openssl', 'x509', '-enddate', '-noout', '-in', pem],
                           capture_output=True, text=True)
        m = re.search(r'notAfter=(.+)', p.stdout)
        if not m:
            continue
        try:
            fim = datetime.datetime.strptime(m.group(1).strip(), '%b %d %H:%M:%S %Y %Z')
        except ValueError:
            continue
        dias = (fim.replace(tzinfo=datetime.timezone.utc)
                - datetime.datetime.now(datetime.timezone.utc)).days
        if dias < 60:
            perto.append('%s(%dd)' % (os.path.basename(os.path.dirname(pem)), dias))
    if perto:
        diz('🔴 certificado de origem vencendo: %s', ', '.join(perto[:6]))

# 4. pagina sem JSON e portal fora do ar
SMAP = {'mapa-do-site', 'indice', 'todos-os-artigos', 'arquivo-de-noticias', 'conteudo',
        'mapa-de-conteudo', 'indice-de-artigos', 'todo-o-conteudo', 'central-de-conteudo',
        'navegacao', 'indice-geral', 'arquivo-completo', 'lista-de-materias',
        'indice-de-materias', 'mapa-de-navegacao', 'todas-as-noticias', 'indice-do-site',
        'sumario'}
FIXAS = {'quem-somos', 'contato', 'politica-de-privacidade', 'termos-de-uso', 'busca',
         'equipe', 'politica-editorial', 'autor', 'img', 'assets'} | SMAP

fantasmas = 0
fora = []
for site in cfg['sites']:
    slug = site['slug']
    PUB = '/srv/portais/%s/public' % slug
    D = '/srv/portais/%s/data' % slug
    if not os.path.isdir(PUB):
        diz('🔴 %s nao tem pasta public/', slug)
        continue
    vivos = {os.path.basename(f)[:-5] for f in glob.glob(os.path.join(D, '*.json'))}
    eds = set()
    for f in glob.glob(os.path.join(D, '*.json')):
        try:
            c = (json.load(io.open(f, encoding='utf-8')).get('category') or {})
        except Exception:
            continue
        if c.get('slug'):
            eds.add(c['slug'])
    extras = {p['slug'].split('/')[0] for p in (site.get('extraPages') or [])}
    base = (site.get('categoryBase') or '').strip('/')
    plano = bool(site.get('flatUrl'))
    ignora = FIXAS | extras | eds | ({base} if base else set())
    for f in glob.glob(PUB + '/**/index.html', recursive=True):
        rel = os.path.relpath(os.path.dirname(f), PUB).replace(os.sep, '/')
        if rel in ('.', ''):
            continue
        p = rel.split('/')
        if p[0] in ignora:
            continue
        alvo = p[0] if (plano and len(p) == 1) else (
            p[1] if (not plano and len(p) == 2 and p[0] in eds) else None)
        if alvo and alvo not in vivos:
            fantasmas += 1

    d = site.get('domain') or ''
    if d and not d.endswith('.local'):
        # ⚠️ uma medida so nao serve: com a Cloudflare na frente, pedido em
        # rajada devolve `000` sem o portal ter caido. So conta se falhar duas
        # vezes, com um respiro entre elas
        codigo = ''
        for tentativa in (0, 1):
            if tentativa:
                time.sleep(3)
            rr = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}',
                                 '-m', '20', 'https://%s/' % d], capture_output=True, text=True)
            codigo = rr.stdout.strip()
            if codigo in ('200', '301', '302'):
                break
        if codigo not in ('200', '301', '302'):
            fora.append('%s(%s)' % (d, codigo))

if fantasmas:
    diz('%d pagina(s) de artigo sem JSON no data/: HTML velho continua no ar', fantasmas)
if fora:
    diz('🔴 portal(is) fora do ar: %s', ', '.join(fora[:6]))

# 5. dono dos arquivos
#
# 🔴 O motor roda como `portais`. Script rodado como root deixa arquivo e pasta
# com dono `root`, e o rebuild seguinte falha com EACCES **naquela pagina**: o
# portal inteiro para de reconstruir a partir dali. Foram 2.511 arquivos nas tres
# maquinas depois de uma rodada de manutencao.
r = subprocess.run(['find', '/srv/portais', '!', '-user', 'portais'],
                   capture_output=True, text=True)
alheios = [x for x in r.stdout.splitlines() if x.strip()]
if alheios:
    diz('🔴 %d arquivo(s) em /srv/portais com dono diferente de `portais`: '
        'o rebuild falha com EACCES. Corrigir com chown -R portais:portais /srv/portais',
        len(alheios))

# 6. backups acumulados
n = sum(len(glob.glob(a + '.bak*')) for a in
        (CFG, '/opt/portal-engine/src/archs.js', '/opt/portal-engine/src/render.js'))
if n > 60:
    diz('%d backups de sites.json/archs.js/render.js acumulados', n)

print('== portal-engine, %s' % time.strftime('%Y-%m-%d %H:%M'))
print('   portais: %d | disco: %.0f%%' % (len(cfg['sites']), pct))
if achados:
    for a in achados:
        print('   ' + a)
else:
    print('   tudo certo: nenhum apontamento')
