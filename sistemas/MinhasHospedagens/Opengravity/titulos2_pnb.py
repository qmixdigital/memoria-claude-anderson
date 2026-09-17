# -*- coding: utf-8 -*-
"""Desempata os tres pares de titulo identico que sobraram no acervo preservado.

Sao pares que a plataforma publicou duas vezes, com slug `-2`. ⚠️ Nao se apaga
nenhum dos dois: cada copia carrega o backlink de um cliente diferente, e a
segunda tem o slug que o Google indexou. **Muda o titulo, nunca o slug.**

O titulo novo nao e sinonimo mecanico: ele diz o angulo que aquele texto tem, que
e o que separa as duas paginas aos olhos de quem le e aos do Google.
"""
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/pontonaturalbrasil/data'

NOVOS = {
    'como-tim-burton-revolucionou-o-stop-motion-na-animacao-mundial-2':
        'O stop motion de Tim Burton, técnica por técnica',
    'as-series-sobre-restaurantes-e-cozinhas-que-fazem-sucesso-2':
        'Séries de cozinha: o que explica o sucesso do gênero',
    'todos-os-filmes-de-johnny-depp-dirigidos-por-tim-burton-2':
        'Johnny Depp e Tim Burton: a parceria filme a filme',
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
