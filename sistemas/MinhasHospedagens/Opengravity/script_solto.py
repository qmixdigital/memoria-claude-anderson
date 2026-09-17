# -*- coding: utf-8 -*-
"""`<script>` aberto e nunca fechado dentro do corpo importado.

Um artigo do incast trazia um `<script type="application/ld+json">` com um
FAQPage **truncado**: a origem cortou o texto no meio do JSON e o `</script>`
nunca veio. Consequencias na pagina publicada:

  - o navegador engole todo o HTML que vem depois como se fosse codigo, entao o
    bloco de compartilhar, os relacionados e o rodape **somem da tela**
  - o Google le um JSON-LD invalido e descarta o schema da pagina inteira

⚠️ O corpo nunca deve ter `<script>`. Aqui ele sai inteiro, do `<script` ate o
fim do texto quando nao existe fechamento.

Varre a maquina toda: o defeito vem da raspagem e pode estar em qualquer portal.
"""
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
RAIZ = '/srv/portais'
RX_PAR = re.compile(r'(?is)<script\b.*?</script>')
n = 0
for slug in sorted(os.listdir(RAIZ)):
    D = os.path.join(RAIZ, slug, 'data')
    if slug.startswith('_') or not os.path.isdir(D):
        continue
    for f in sorted(glob.glob(D + '/*.json')):
        try:
            d = json.load(io.open(f, encoding='utf-8'))
        except Exception:
            continue
        c = d.get('content') or ''
        if '<script' not in c.lower():
            continue
        novo = RX_PAR.sub('', c)
        # o que sobrou sem fechamento: corta do `<script` ate o fim
        i = novo.lower().find('<script')
        if i >= 0:
            novo = novo[:i]
        novo = re.sub(r'(?is)<(p|div)[^>]*>(?:\s|<br\s*/?>)*</\1>', '', novo).rstrip()
        n += 1
        print('  %-18s %-52s %d -> %d bytes' % (slug, d['slug'][:52], len(c), len(novo)))
        if APLICA:
            d['content'] = novo
            io.open(f, 'w', encoding='utf-8', newline=chr(10)).write(
                json.dumps(d, ensure_ascii=False, indent=2))
print('  artigos com <script> no corpo: %d' % n)
if not APLICA:
    print('  ensaio. rode com --aplica.')
