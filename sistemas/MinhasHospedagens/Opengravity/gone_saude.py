# -*- coding: utf-8 -*-
"""Monta o arquivo de 410 de cada portal de saude.

Uso, no servidor:  python3 /tmp/gone_saude.py <slug> [--aplica]

Blocos de `location` com 10 slugs cada, para o nginx nao ficar com milhares de
regras soltas.

🔴 **Slug podado que o motor REGENERA fica de fora.** Nos portais planos o artigo
mora na raiz, junto com contato, quem-somos, politica-de-privacidade,
termos-de-uso, busca, equipe, politica-editorial e o mapa do site: mandar 410
neles mataria a pagina institucional nova, e ninguem descobre.

🔴 **Slug que ainda existe fica de fora.** Se o mesmo slug foi preservado, o 410
apagaria a pagina que carrega o backlink.

🔴 **Slug igual ao de uma EDITORIA fica de fora** nos portais planos: a regra
casaria a listagem inteira.

⚠️ **O `$` do regex nao pode ir escapado.** Escrito `\\$`, ele vira caractere
literal: o 410 passa no `nginx -t` e nunca casa com nada.

⚠️ **Slug fora do ASCII nao casa com `[a-z0-9-]`.** O nginx compara o URI ja
decodificado, entao acento precisa entrar por lista propria.

⚠️ O sufixo `__trashed` que o WordPress poe no slug da lixeira e retirado: essa
URL nunca existiu em publico.
"""
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
SLUG = sys.argv[1]
APLICA = '--aplica' in sys.argv
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
site = [s for s in cfg['sites'] if s['slug'] == SLUG][0]
PLANO = bool(site.get('flatUrl'))
BASE = (site.get('categoryBase') or '').strip('/')
DATA = '/srv/portais/%s/data' % SLUG

vivos = {os.path.basename(f)[:-5] for f in glob.glob(os.path.join(DATA, '*.json'))}
eds = {v['slug'] for v in (site.get('categoryMap') or {}).values()}
extras = {p['slug'].split('/')[0] for p in (site.get('extraPages') or [])}
SMAP = {'mapa-do-site', 'indice', 'todos-os-artigos', 'arquivo-de-noticias', 'conteudo',
        'mapa-de-conteudo', 'indice-de-artigos', 'todo-o-conteudo', 'central-de-conteudo',
        'navegacao', 'indice-geral', 'arquivo-completo', 'lista-de-materias',
        'indice-de-materias', 'mapa-de-navegacao', 'todas-as-noticias', 'indice-do-site',
        'sumario'}
MOTOR = ({'contato', 'quem-somos', 'politica-de-privacidade', 'termos-de-uso', 'busca',
          'equipe', 'politica-editorial', 'autor', 'img', 'assets', 'category',
          'categoria'} | SMAP | extras | eds)

brutos = [l.strip() for l in io.open('/tmp/%s-slugs.txt' % SLUG, encoding='utf-8')
          if l.strip()]
limpos, fora = [], []
for s in brutos:
    s = re.sub(r'__trashed.*$', '', s).strip('/')
    if not s:
        continue
    if s in vivos:
        fora.append((s, 'ainda existe no acervo'))
        continue
    if PLANO and s in MOTOR:
        fora.append((s, 'pagina que o motor regenera'))
        continue
    limpos.append(s)

limpos = sorted(set(limpos))
ascii_ok = [s for s in limpos if re.match(r'^[a-z0-9-]+$', s)]
outros = [s for s in limpos if s not in set(ascii_ok)]

linhas = ['# 410 dos artigos apagados na poda do %s' % SLUG,
          '# %d slugs. Gerado em bloco de 10 por location, com o $ SEM escape:' % len(limpos),
          '# escrito \\$ ele vira caractere literal e a regra nunca casa.']
prefixo = '' if PLANO else '[a-z0-9-]+/'
for i in range(0, len(ascii_ok), 10):
    grupo = '|'.join(ascii_ok[i:i + 10])
    linhas.append('location ~* "^/%s(%s)/?$" { return 410; }' % (prefixo, grupo))
for s in outros:
    # slug fora do ASCII: o nginx compara o URI ja decodificado
    linhas.append('location ~* "^/%s%s/?$" { return 410; }'
                  % (prefixo, re.escape(s).replace('\\-', '-')))

texto = '\n'.join(linhas) + '\n'
alvo = '/etc/nginx/gone/%s.conf' % SLUG
print('  %s: %d slug(s) no 410 (%d ASCII, %d com acento)'
      % (SLUG, len(limpos), len(ascii_ok), len(outros)))
print('  fora do 410: %d' % len(fora))
for s, m in fora[:8]:
    print('     %-46s %s' % (s[:46], m))
if APLICA:
    os.makedirs('/etc/nginx/gone', exist_ok=True)
    io.open(alvo, 'w', encoding='utf-8', newline='\n').write(texto)
    print('  gravado em %s (%d regras)' % (alvo, len(linhas) - 3))
else:
    print('  ensaio. rode com --aplica.')
