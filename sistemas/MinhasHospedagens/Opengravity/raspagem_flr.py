# -*- coding: utf-8 -*-
"""Tira do folhar o que sobrou da raspagem que alimentava a origem.

Achado ao conferir os artigos sem imagem, e nao por auditoria: alguns textos
comecam com pedacos da **pagina de onde foram copiados**, e nao com o proprio
conteudo.

Tres residuos, todos no primeiro paragrafo:

  - **`@ » folha r trends »`**, a trilha de navegacao do proprio site raspado,
    escrita como texto
  - **`Watch CBS News`**, o botao do site americano de onde a nota veio
  - **um paragrafo inteiro em ingles** sobre outro assunto, colado antes do
    texto em portugues

E dois titulos terminam em **hifen solto**, resto do sufixo do veiculo de origem
que foi cortado pela metade.

⚠️ Nada disso aparece em auditoria de HTML: e texto valido dentro de `<p>`. O que
denuncia e ler o comeco do artigo.

⚠️ O corte e por **paragrafo inteiro**, e so nos tres primeiros: procurar a
expressao no texto todo removeria mencao legitima no meio da materia.
"""
import glob
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/folhar/data'

# marcas que so existem por causa da raspagem
RUINS = [
    re.compile(r'(?i)folha\s*r\s*trends'),
    re.compile(r'(?i)watch\s+cbs\s+news'),
    re.compile(r'(?i)fans are looking to solve|while the knives out'),
]
RX_P = re.compile(r'(?is)<p[^>]*>.*?</p>')


def limpa(c):
    paras = RX_P.findall(c)
    fora = 0
    for p in paras[:3]:
        nu = re.sub(r'<[^>]+>', ' ', p)
        if any(rx.search(nu) for rx in RUINS):
            c = c.replace(p, '', 1)
            fora += 1
    return c, fora


n_corpo = n_tit = 0
for f in sorted(glob.glob(os.path.join(DATA, '*.json'))):
    d = json.load(io.open(f, encoding='utf-8'))
    mudou = False

    c, fora = limpa(d.get('content') or '')
    if fora:
        d['content'] = c
        n_corpo += 1
        mudou = True
        print('  corpo  %-56s %d paragrafo(s)' % (d['slug'][:56], fora))

    # ⚠️ hifen solto no fim do titulo: resto do sufixo do veiculo de origem
    t = (d.get('title') or '').strip()
    novo = re.sub(r'\s*[-–—:]\s*$', '', t)
    if novo != t:
        d['title'] = novo
        if d.get('image'):
            d['image']['title'] = novo
        n_tit += 1
        mudou = True
        print('  titulo %-56s -> %s' % (d['slug'][:56], novo[:50]))

    if mudou and APLICA:
        io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

print('  corpos limpos: %d | titulos aparados: %d' % (n_corpo, n_tit))
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
