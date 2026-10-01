# -*- coding: utf-8 -*-
"""Roda NA VPS: aplica a lista de apostas no campo hideSlugs do sites.json.

Uniao, nunca substituicao: hideSlugs que ja exista por outro motivo e preservado.
Idempotente. Imprime o que mudou e a lista de portais a reconstruir.

uso: aplica_hideslugs.py <arquivo.json> <host>   [--conferir]
"""
import json, sys, shutil, time, io

arq, host = sys.argv[1], sys.argv[2]
so_ver = '--conferir' in sys.argv
alvo = json.load(io.open(arq, encoding='utf-8'))
meus = {k.split('|')[1]: v for k, v in alvo.items() if k.split('|')[0] == host}

P = '/opt/portal-engine/sites.json'
cfg = json.load(io.open(P, encoding='utf-8'))
sites = {s['slug']: s for s in cfg['sites']}

mudou, faltam, ja = [], [], []
for slug, lista in sorted(meus.items()):
    s = sites.get(slug)
    if not s:
        faltam.append(slug); continue
    atual = s.get('hideSlugs') or []
    novos = [x for x in lista if x not in atual]
    if not novos:
        ja.append('%s (%d)' % (slug, len(atual))); continue
    if not so_ver:
        s['hideSlugs'] = atual + novos
    mudou.append('%s +%d (tinha %d)' % (slug, len(novos), len(atual)))

if mudou and not so_ver:
    shutil.copy(P, P + '.bak-apostas-' + time.strftime('%Y%m%d%H%M'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(json.dumps(cfg, ensure_ascii=False, indent=2) + '\n')

print(host, '| portais na lista:', len(meus), '| alterados:', len(mudou), '| ja tinham tudo:', len(ja), '| nao existem no sites.json:', faltam)
for m in mudou: print('  ', m)
print('REBUILD:', ' '.join(sorted(s.split(' ')[0] for s in mudou)))
