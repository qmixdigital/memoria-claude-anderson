# -*- coding: utf-8 -*-
"""Repoe o bloco "Veja tambem" nos artigos que ficaram sem nenhuma saida.

Tres artigos perderam o unico link interno que tinham: o bloco da malha entrava
dentro do trecho que a limpeza do italico removeu, ou o link apontava para uma
pagina que depois foi podada.

Artigo sem saida e beco: o leitor chega e nao tem para onde ir, e a autoridade
que ele recebeu nao circula.

O bloco novo segue a mesma regra da malha: **ancora e o titulo do destino**, tres
destinos da mesma editoria, os mais proximos por data.
"""
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
CFG = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


n = 0
for site in CFG['sites']:
    slug = site['slug']
    D = '/srv/portais/%s/data' % slug
    if not os.path.isdir(D):
        continue
    arts = {}
    for f in glob.glob(os.path.join(D, '*.json')):
        try:
            arts[f] = json.load(io.open(f, encoding='utf-8'))
        except Exception:
            pass
    plano = bool(site.get('flatUrl'))
    marca = ((site.get('fp') or {}).get('prefix') or slug[:3]) + '-veja'

    for f, d in sorted(arts.items()):
        c = d.get('content') or ''
        if re.search(r'(?i)<a\s[^>]*href="/', c):
            continue
        cat = (d.get('category') or {}).get('slug')
        irmaos = [x for x in arts.values()
                  if x is not d and (x.get('category') or {}).get('slug') == cat]
        irmaos.sort(key=lambda x: x.get('date') or '', reverse=True)
        if len(irmaos) < 3:
            irmaos += [x for x in arts.values() if x is not d and x not in irmaos][:3]
        alvos = irmaos[:3]
        if not alvos:
            continue
        itens = ''
        for a in alvos:
            url = ('/%s/' % a['slug']) if plano else \
                ('/%s/%s/' % ((a.get('category') or {}).get('slug') or 'noticias', a['slug']))
            itens += '<li><a href="%s">%s</a></li>' % (url, esc(a.get('title') or a['slug']))
        bloco = ('\n<div class="%s"><h2>Veja também</h2><ul>%s</ul></div>' % (marca, itens))
        print('  %-18s %-52s +%d links' % (slug, d['slug'][:52], len(alvos)))
        n += 1
        if APLICA:
            d['content'] = c + bloco
            io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

print('  artigos que ganharam saida: %d' % n)
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
