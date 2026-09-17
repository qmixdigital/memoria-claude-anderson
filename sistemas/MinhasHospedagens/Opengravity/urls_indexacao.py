# -*- coding: utf-8 -*-
"""Junta as URLs dos cinco portais para o Rapid URL Indexer.

⚠️ **Nada e enviado aqui.** A indexacao so roda quando o Anderson pedir, e
sempre no modo barato, com no maximo 30 URLs por projeto.

A prioridade e a home, as listagens de editoria e as institucionais: o artigo
preservado ja era indexado na URL antiga, que nao mudou.
"""
import glob
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
linhas = []
for slug in ('saudeacessivel', 'saudicas', 'saudeemalta', 'revistatopsaude', 'matogrossosaude'):
    s = [x for x in cfg['sites'] if x['slug'] == slug][0]
    base = s['baseUrl'].rstrip('/')
    b = (s.get('categoryBase') or '').strip('/')
    PUB = '/srv/portais/%s/public' % slug
    u = [base + '/']
    for ed in sorted(os.listdir(os.path.join(PUB, b)) if b else []):
        if os.path.isdir(os.path.join(PUB, b, ed)):
            u.append('%s/%s/%s/' % (base, b, ed))
    for pag in ('quem-somos', 'equipe', 'politica-editorial', 'contato'):
        if os.path.isdir(os.path.join(PUB, pag)):
            u.append('%s/%s/' % (base, pag))
    for a in sorted(glob.glob(os.path.join(PUB, 'autor', '*'))):
        if os.path.isdir(a):
            u.append('%s/autor/%s/' % (base, os.path.basename(a)))
    linhas.append((slug, u))
    print('  %-18s %d URLs' % (slug, len(u)))

io.open('/tmp/urls-indexacao-saude.txt', 'w', encoding='utf-8', newline='\n').write(
    ''.join('# %s\n%s\n' % (s, '\n'.join(u)) for s, u in linhas))
print('  total: %d URLs em /tmp/urls-indexacao-saude.txt'
      % sum(len(u) for _, u in linhas))
