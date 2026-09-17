# -*- coding: utf-8 -*-
"""Fecha os tres apontamentos da auditoria no publisherbrasil e no saberdefato.

1. **4 links internos quebrados** no publisherbrasil, todos para
   `/resumo/resumo-do-livro-de-jo/`, um artigo que a poda apagou. ⚠️ O
   `limpa_*.py` nao pegou: ele compara com a lista de slugs podados, e este link
   traz a **editoria na frente**, entao o slug nao bate direto.
2. **8 imagens sem `alt`** nas duas.
3. **5 ancoras genericas** no saberdefato.

Link para pagina morta vira o `alt` do texto: a ancora fica, o link sai. Apagar
a frase inteira mudaria o texto que o cliente comprou.
"""
import collections
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv

GEN = {'blog', 'site', 'nosso blog', 'nosso site', 'aqui', 'clique aqui', 'saiba mais',
       'veja mais', 'leia mais', 'confira', 'veja', 'inicio', 'início', 'home',
       'clique', 'acesse', 'link', 'este link', 'esse link', 'ver mais'}
RX_IMG = re.compile(r'(?i)<img\b[^>]*>')
RX_ALT = re.compile(r'(?i)alt="([^"]*)"')
RX_A = re.compile(r'(?i)<a\s[^>]*href="(/[^"#?]*)"[^>]*>(.*?)</a>', re.S)

conta = collections.Counter()
for portal in ('publisherbrasil', 'saberdefato'):
    D = '/srv/portais/%s/data' % portal
    PUB = '/srv/portais/%s/public' % portal
    for f in sorted(glob.glob(os.path.join(D, '*.json'))):
        d = json.load(io.open(f, encoding='utf-8'))
        c = d.get('content') or ''
        antes = c

        # --- 1. link para pagina que nao existe: vira texto puro
        for m in list(RX_A.finditer(c)):
            alvo = m.group(1).strip('/')
            if os.path.isfile(os.path.join(PUB, alvo, 'index.html')):
                continue
            txt = m.group(2)
            c = c.replace(m.group(0), txt, 1)
            conta[portal + ' link quebrado'] += 1
            print('  %-16s link morto em %-42s -> %s' % (portal, d['slug'][:42], m.group(1)))

        # --- 2. imagem sem alt: recebe o titulo do artigo
        for tag in RX_IMG.findall(c):
            al = RX_ALT.search(tag)
            if al and al.group(1).strip():
                continue
            titulo = (d.get('title') or '').replace('"', '').strip()
            if al:
                novo = tag.replace(al.group(0), 'alt="%s"' % titulo, 1)
            else:
                novo = tag[:-1].rstrip('/').rstrip() + ' alt="%s">' % titulo
            c = c.replace(tag, novo, 1)
            conta[portal + ' sem alt'] += 1
            print('  %-16s alt escrito em %-42s' % (portal, d['slug'][:42]))

        # --- 3. ancora generica: vira o titulo da pagina de destino
        for m in list(RX_A.finditer(c)):
            txt = re.sub('<[^>]+>', '', m.group(2)).strip()
            if txt.lower() not in GEN:
                continue
            alvo = m.group(1).strip('/').split('/')[-1]
            dest = os.path.join(D, alvo + '.json')
            if not os.path.isfile(dest):
                continue
            t = (json.load(io.open(dest, encoding='utf-8')).get('title') or '').strip()
            if not t:
                continue
            novo = m.group(0).replace('>' + m.group(2) + '</a>', '>' + t + '</a>')
            c = c.replace(m.group(0), novo, 1)
            conta[portal + ' generica'] += 1
            print('  %-16s ancora %-22r -> %s' % (portal, txt, t[:44]))

        if c != antes and APLICA:
            d['content'] = c
            io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

for k, v in sorted(conta.items()):
    print('  %-34s %d' % (k, v))
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
