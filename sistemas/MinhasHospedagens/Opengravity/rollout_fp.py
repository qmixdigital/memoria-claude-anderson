# -*- coding: utf-8 -*-
"""Reconstroi cada portal e confere o botao de fonte preferida, um por vez.

Uso, no servidor:  python3 /tmp/rollout_fp.py [--aplica]

Para cada portal, nesta ordem:

 1. reconstroi
 2. confere na HOME: o bloco no rodape, com o dominio certo na URL
 3. confere num ARTIGO: dois blocos (corpo e rodape), e o do corpo **antes** da
    area de compartilhar e de relacionados
 4. confere que o estilo e o script sairam, e uma vez so por pagina
 5. so entao passa para o proximo

⚠️ **A prova e o HTML publicado**, e nao o `ok` do rebuild: arquitetura que nao
chamasse `instLinks` deixaria o rodape sem botao sem nenhum erro.

⚠️ O `teste.local` e pulado: nao e portal de verdade.
"""
import glob
import io
import json
import os
import re
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
RX = re.compile(r'https://google\.com/preferences/source\?q=([a-z0-9.-]+)')

feitos, ruins = [], []
for s in cfg['sites']:
    slug = s['slug']
    dom = (s.get('domain') or '')
    if not dom or dom.endswith('.local'):
        continue
    PUB = '/srv/portais/%s/public' % slug
    if APLICA:
        r = subprocess.run(['runuser', '-u', 'portais', '--', 'node', '/tmp/reb.js', slug],
                           capture_output=True, text=True)
        if 'ok' not in r.stdout:
            ruins.append((slug, 'rebuild falhou: ' + (r.stderr or r.stdout)[:70]))
            print('  🔴 %-24s rebuild falhou' % slug)
            continue

    esperado = dom.replace('www.', '')
    problemas = []

    home = os.path.join(PUB, 'index.html')
    if not os.path.isfile(home):
        problemas.append('sem home')
    else:
        t = io.open(home, encoding='utf-8', errors='replace').read()
        achados = RX.findall(t)
        if len(achados) != 1:
            problemas.append('home com %d botao(oes)' % len(achados))
        elif achados[0] != esperado:
            problemas.append('home com dominio %s' % achados[0])
        if t.count('data-fp') < 1:
            problemas.append('home sem data-fp')
        if 'gpref' not in t:
            problemas.append('home sem o script do popup')

    # um artigo qualquer
    base = (s.get('categoryBase') or '').strip('/')
    # ⚠️ o artigo se identifica pelo JSON em data/, e nao por exclusao de pasta:
    # a lista de pastas a pular esquece contato, quem-somos, o mapa do site e as
    # institucionais, e o teste passava a conferir uma pagina que so tem o botao
    # do rodape
    vivos = {os.path.basename(f)[:-5]
             for f in glob.glob('/srv/portais/%s/data/*.json' % slug)}
    art = None
    padrao = PUB + ('/*/index.html' if s.get('flatUrl') else '/*/*/index.html')
    for p in sorted(glob.glob(padrao)):
        # ⚠️ a pasta da BASE de categoria tem que sair: existe editoria cujo slug
        # e igual ao de um artigo, e `/categoria/<slug>/` entrava como se fosse
        # o artigo. Foi o caso do ebookcult, com a editoria `sonhar`
        if base and ('/%s/' % base) in p:
            continue
        if os.path.basename(os.path.dirname(p)) in vivos:
            art = p
            break
    if not art:
        problemas.append('nao achei artigo para conferir')
    else:
        t = io.open(art, encoding='utf-8', errors='replace').read()
        achados = RX.findall(t)
        if len(achados) != 2:
            problemas.append('artigo com %d botao(oes)' % len(achados))
        elif set(achados) != {esperado}:
            problemas.append('artigo com dominio %s' % ','.join(set(achados)))
        # o do corpo tem que vir antes do rodape
        i = t.find('preferences/source')
        j = t.rfind('<footer')
        if i < 0 or (j > 0 and i > j):
            problemas.append('o bloco do corpo nao esta antes do rodape')
        if t.count('<style>') and t.count('-box{') > 1:
            problemas.append('estilo duplicado')

    if problemas:
        ruins.append((slug, '; '.join(problemas)))
        print('  🔴 %-24s %s' % (slug, '; '.join(problemas)[:70]))
    else:
        feitos.append((slug, dom))
        print('  ok %-24s %s' % (slug, esperado))

print('  ---')
print('  conferidos: %d | com problema: %d' % (len(feitos), len(ruins)))
io.open('/tmp/fp-feitos.txt', 'w', encoding='utf-8', newline='\n').write(
    ''.join('%s\t%s\n' % x for x in feitos))
