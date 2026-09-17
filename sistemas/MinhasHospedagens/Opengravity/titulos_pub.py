# -*- coding: utf-8 -*-
"""Desempata os cinco pares de titulo identico do publisherbrasil.

⚠️ Titulo repetido nao se resolve apagando: cada copia carrega o backlink de um
cliente e a segunda tem o slug que o Google indexou. **Muda o titulo, nunca o
slug.**

O titulo novo diz o angulo daquele texto, que e o que separa as duas paginas aos
olhos de quem le e aos do Google.

Entra tambem um titulo em espanhol que veio da raspagem, num artigo cujo corpo
esta em portugues.
"""
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/publisherbrasil/data'

NOVOS = {
    'a-influencia-dos-contos-de-fadas-sombrios-na-obra-de-burton-2':
        'Os contos sombrios que Tim Burton levou para o cinema',
    'como-manter-disciplina-na-rotina-2':
        'Disciplina na rotina: o que fazer quando a vontade falta',
    'o-legado-dos-filmes-de-batman-dirigidos-por-tim-burton-2':
        'O Batman de Burton, filme a filme',
    'os-reality-shows-que-mais-geraram-polemica-na-tv-mundial-2':
        'As polêmicas de reality que mudaram a regra do jogo',
    'os-melhores-filmes-de-animacao-para-assistir-em-familia-2':
        'Animações para ver em família, por faixa de idade',
    # ⚠️ titulo em espanhol num artigo escrito em portugues
    'rafael-jodar-colapsa-redes-con-su-camiseta-en-roland-garros':
        'Rafael Jódar e a camiseta que agitou Roland Garros',
}

for slug, titulo in sorted(NOVOS.items()):
    assert len(titulo) <= 60, (slug, len(titulo))
    assert chr(8212) not in titulo
    caminho = os.path.join(DATA, slug + '.json')
    if not os.path.isfile(caminho):
        print('  ⚠️ nao existe: %s' % slug)
        continue
    d = json.load(io.open(caminho, encoding='utf-8'))
    print('  %s\n     de: %s\n     para: %s' % (slug[:62], d.get('title'), titulo))
    if APLICA:
        d['title'] = titulo
        if d.get('image'):
            d['image']['title'] = titulo
        io.open(caminho, 'w', encoding='utf-8').write(
            json.dumps(d, ensure_ascii=False, indent=2))

print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
