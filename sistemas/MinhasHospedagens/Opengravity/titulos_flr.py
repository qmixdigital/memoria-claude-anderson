# -*- coding: utf-8 -*-
"""Desempata os tres pares de titulo identico do folhar e conserta os genericos.

⚠️ Titulo repetido nao se resolve apagando: cada copia carrega o backlink de um
cliente e a segunda tem o slug que o Google indexou. **Muda o titulo, nunca o
slug.**

Junto entram quatro titulos que a plataforma publicou como fragmento de frase
("Como desejar sem exagero"), com a palavra-chave so no primeiro paragrafo. A
pagina ranqueia por nada e o resultado da busca nao diz do que se trata.
"""
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/folhar/data'

NOVOS = {
    # os tres pares publicados duas vezes
    'os-reality-shows-de-culinaria-mais-assistidos-no-mundo-hoje-2':
        'Reality de cozinha: por que o gênero não sai de moda',
    'por-que-os-personagens-de-burton-tem-olhos-grandes-e-fundos-2':
        'O olhar dos personagens de Burton, traço a traço',
    'a-mulher-gato-de-michelle-pfeiffer-no-batman-de-burton-2':
        'Michelle Pfeiffer e a Mulher-Gato que mudou o papel',
    # fragmentos de frase, com a palavra-chave escondida no corpo
    'como-desejar-sem-exagero':
        'Mensagens de aniversário curtas: o que escrever',
    'como-fortalecer-vinculos-no-dia-certo':
        'Mensagens de aniversário para amigos: ideias práticas',
    'como-transformar-habilidade-manual-em-profissao':
        'Extensão de cílios: como aprender com aulas online',
    'como-transformar-uma-habilidade-em-trabalho-real':
        'Formação rápida em extensão de cílios: por onde começar',
    'onde-vale-investir-para-trabalhar-forte':
        'Maquininhas de alto desempenho: qual aguenta o ritmo',
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
