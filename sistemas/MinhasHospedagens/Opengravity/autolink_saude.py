# -*- coding: utf-8 -*-
"""Liga a linkagem automatica dos cinco portais de saude e passa no acervo.

Uso, no servidor:  python3 /tmp/autolink_saude.py [--aplica]

Sao duas frentes, e uma nao substitui a outra:

  - o **`autoLink`** roda no momento da publicacao, entao o conteudo novo da
    plataforma do Antonio ja nasce com link interno
  - 🔴 **ele NAO alcanca o acervo importado**, que entrou gravando o JSON direto
    no `data/`. Sem uma passada unica, os 903 artigos ficam sem nenhuma saida no
    corpo, e a limpeza ainda tirou 484 links que apontavam para artigo apagado

⚠️ **O destino sai do disco.** Tres destes portais servem a listagem em
`/category/`, em ingles, e dois em `/categoria/`: escrever a forma de cor manda a
malha inteira para 404.

⚠️ **Nenhuma frase se repete entre portais.** Ancora repetida entre vizinhos e
impressao digital de conjunto.

⚠️ **Teto de oito usos por ancora**, contado no portal inteiro, e no maximo tres
links por artigo.

🔴 **O link nao entra dentro de `<script>`, de `<a>` nem de atributo.** Dentro do
JSON-LD ele quebra o bloco e o Google descarta o schema inteiro; dentro de outro
`<a>` o navegador serve dois links aninhados.
"""
import collections
import glob
import io
import json
import os
import random
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/sites.json'
random.seed(11)

MOLDES = {
 'saudeacessivel': ['o que já publicamos sobre %s', 'nossa cobertura de %s',
                    'as matérias de %s do Saúde Acessível'],
 'saudicas': ['as dicas de %s', 'tudo que reunimos sobre %s',
              'a seção de %s do Saúde Dicas'],
 'saudeemalta': ['as fichas de %s', 'o que apuramos sobre %s',
                 'a editoria de %s do Saúde em Alta'],
 'revistatopsaude': ['as reportagens de %s', 'o que a revista publicou sobre %s',
                     'o caderno de %s da Revista Top Saúde'],
 'matogrossosaude': ['o serviço de %s', 'o que saiu sobre %s',
                     'as publicações de %s do MT Saúde'],
}
TETO_ANCORA = 8
POR_ARTIGO = 3

cfg = json.load(io.open(P, encoding='utf-8'))
sites = {s['slug']: s for s in cfg['sites']}

# nenhuma frase pode existir em outro portal desta maquina
usadas = set()
for outro in cfg['sites']:
    al = outro.get('autoLink') or {}
    for p in ((al.get('fallback') or {}).get('pool') or []):
        for a in p.get('anchors') or []:
            usadas.add(a.strip().lower())

# o link nunca entra dentro destas regioes
RX_PROIBIDO = re.compile(r'(?is)<script\b.*?</script>|<style\b.*?</style>|'
                         r'<a\b.*?</a>|<h[1-6]\b[^>]*>.*?</h[1-6]>|<[^>]+>')

total_links = 0
for SLUG, moldes in MOLDES.items():
    s = sites[SLUG]
    D = '/srv/portais/%s/data' % SLUG
    PUB = '/srv/portais/%s/public' % SLUG
    base = (s.get('categoryBase') or '').strip('/')

    conta = collections.Counter()
    nome = {}
    for f in glob.glob(D + '/*.json'):
        d = json.load(io.open(f, encoding='utf-8'))
        cat = d.get('category') or {}
        if cat.get('slug'):
            conta[cat['slug']] += 1
            nome[cat['slug']] = cat.get('name') or cat['slug']

    pool = []
    for cs, _ in conta.most_common(6):
        cam = os.path.join(PUB, base, cs) if base else os.path.join(PUB, cs)
        if not os.path.isfile(os.path.join(cam, 'index.html')):
            print('  %s: destino sem pagina no disco, fora: %s' % (SLUG, cs))
            continue
        url = '/%s/%s/' % (base, cs) if base else '/%s/' % cs
        rot = (nome[cs] or cs).lower()
        anchors = []
        for molde in moldes:
            a = molde % rot
            if a.lower() in usadas:
                continue
            usadas.add(a.lower())
            anchors.append(a)
        if anchors:
            pool.append({'url': url, 'anchors': anchors})

    print('  %-18s %d destino(s), %d ancora(s)'
          % (SLUG, len(pool), sum(len(p['anchors']) for p in pool)))
    if len(pool) < 2:
        print('     🔴 destinos de menos, pulando')
        continue
    s['autoLink'] = {'enabled': True, 'maxLinks': POR_ARTIGO, 'maxSameAnchor': 2,
                     'map': [], 'fallback': {'pool': pool}}

    # ---------- passada unica no acervo
    uso = collections.Counter()
    postos = 0
    for f in sorted(glob.glob(D + '/*.json')):
        d = json.load(io.open(f, encoding='utf-8'))
        c = d.get('content') or ''
        if not c:
            continue
        proprio = (d.get('category') or {}).get('slug')
        ja = c.count('href="/')
        if ja >= POR_ARTIGO:
            continue
        # candidatos: destino que nao e a propria editoria e que ainda nao esta
        # no corpo, com ancora abaixo do teto
        cand = []
        for p in pool:
            if base and p['url'] == '/%s/%s/' % (base, proprio):
                continue
            if not base and p['url'] == '/%s/' % proprio:
                continue
            if p['url'] in c:
                continue
            for a in p['anchors']:
                if uso[a] < TETO_ANCORA:
                    cand.append((p['url'], a))
        if not cand:
            continue
        random.shuffle(cand)
        quantos = min(POR_ARTIGO - ja, len(cand), 2)
        escolhidos = cand[:quantos]

        # o bloco entra depois do ultimo paragrafo inteiro, fora de script,
        # de heading e de outro link
        itens = ''.join('<li><a href="%s">%s</a></li>' % (u, a) for u, a in escolhidos)
        bloco = ('<aside class="veja"><p><strong>Veja também</strong></p><ul>%s</ul></aside>'
                 % itens)
        if '</p>' in c:
            k = c.rfind('</p>') + 4
            d['content'] = c[:k] + bloco + c[k:]
        else:
            d['content'] = c + bloco
        for _, a in escolhidos:
            uso[a] += 1
        postos += len(escolhidos)
        if APLICA:
            io.open(f, 'w', encoding='utf-8', newline='\n').write(
                json.dumps(d, ensure_ascii=False, indent=2))
    total_links += postos
    pico = uso.most_common(1)
    print('     %d link(s) posto(s) no acervo | ancora mais usada: %s'
          % (postos, ('%s (%d)' % pico[0]) if pico else 'nenhuma'))

print('  total de links internos criados: %d' % total_links)
if APLICA:
    shutil.copyfile(P, P + '.bak-autolink-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(
        json.dumps(cfg, ensure_ascii=False, indent=1))
    print('  sites.json gravado. reiniciar o motor para valer.')
else:
    print('  ensaio. rode com --aplica.')
