# -*- coding: utf-8 -*-
"""Conserta as ultimas descricoes de ARTIGO fora da regua, uma a uma.

Sao os poucos casos que sobreviveram as passadas anteriores porque o motor nao
conseguiu derivar nada melhor do corpo: paragrafo de abertura curto demais, ou
uma lista onde deveria haver texto.

⚠️ Nao vale reescrever os 715 artigos cujo JSON esta fora da regua: o HTML deles
sai certo, porque o motor deriva a descricao do corpo. So entram os que **saem
errados na pagina**.
"""
import glob
import html as H
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
RX = re.compile(r'(?i)<meta name="description" content="(.*?)"')


def limpo(t):
    return re.sub(r'\s+', ' ', H.unescape(re.sub('<[^>]+>', ' ', t or ''))).strip()


n = 0
for f in glob.glob('/srv/portais/*/public/**/index.html', recursive=True):
    x = io.open(f, encoding='utf-8').read()
    if 'noindex' in x:
        continue
    m = RX.search(x)
    if not m:
        continue
    t = H.unescape(m.group(1)).strip()
    if not t or 100 <= len(t) <= 175:
        continue
    portal = f.replace('/srv/portais/', '').split('/public/')[0]
    slug = os.path.basename(os.path.dirname(f))
    alvo = '/srv/portais/%s/data/%s.json' % (portal, slug)
    if not os.path.isfile(alvo):
        continue
    d = json.load(io.open(alvo, encoding='utf-8'))
    corpo = limpo(d.get('content') or '')
    if len(t) > 175:
        novo = t[:170]
        i = max(novo.rfind('. '), novo.rfind('; '), novo.rfind(', '))
        novo = novo[:i + 1].strip() if i > 100 else novo.rsplit(' ', 1)[0] + '.'
    else:
        # completa com o corpo, a partir de onde a descricao termina
        resto = corpo
        p = corpo.find(t[-40:]) if len(t) >= 40 else -1
        if p > 0:
            resto = corpo[p + 40:]
        junto = (t.rstrip(' .') + '. ' + resto).strip()
        novo = junto[:170]
        i = max(novo.rfind('. '), novo.rfind('; '))
        novo = novo[:i + 1].strip() if i > 100 else novo.rsplit(' ', 1)[0] + '.'
    if not (100 <= len(novo) <= 175):
        print('  ⚠️ %-16s %-42s nao coube (%d)' % (portal, slug[:42], len(novo)))
        continue
    print('  %-16s %-42s %3d -> %3d' % (portal, slug[:42], len(t), len(novo)))
    n += 1
    if APLICA:
        d['metaDescription'] = novo
        io.open(alvo, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

print('  artigos ajustados: %d' % n)
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
