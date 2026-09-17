# -*- coding: utf-8 -*-
"""Conserta os titulos que vieram como fragmento de frase.

Oito dos preservados nasceram na plataforma com titulo que e so a metade de uma
frase: "Como uniformizar regioes especificas", "Como escrever algo doce e
simples". A palavra-chave do texto esta no primeiro paragrafo, e nao no titulo,
entao a pagina ranqueia por nada e o resultado da busca nao diz do que se trata.

⚠️ **Dois deles tem o titulo IDENTICO**, e a rede ja aprendeu que titulo repetido
nao se resolve apagando: cada copia carrega o backlink de um cliente. Muda o
titulo, nunca o slug.

⚠️ O `slug` fica intacto: e ele que segura o backlink e o que o Google indexou.
"""
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/pontonaturalbrasil/data'

NOVOS = {
    'como-cada-categoria-atende-diferentes-perfis':
        'Maquininhas por categoria: qual atende cada perfil',
    'como-dar-os-primeiros-passos-no-atendimento-feminino':
        'Treinamento para lash designer: os primeiros passos',
    'como-escrever-algo-doce-e-simples':
        'Mensagens de aniversário para crianças: o que escrever',
    'como-funciona-a-evolucao-profissional-na-estetica':
        'Capacitação para lash designer: como evoluir na estética',
    'como-quem-esta-comecando-deve-escolher':
        'Maquininhas para autônomos: como escolher a primeira',
    'como-traduzir-amor-e-cuidado':
        'Mensagens de aniversário para mães: o que escrever',
    'como-uniformizar-regioes-especificas':
        'Clareador de pele para a linha da mandíbula',
    'como-uniformizar-regioes-especificas-2':
        'Clareador de pele na mandíbula: como reduzir manchas',
}

for slug, titulo in sorted(NOVOS.items()):
    assert len(titulo) <= 60, (slug, len(titulo))
    assert chr(8212) not in titulo
    caminho = os.path.join(DATA, slug + '.json')
    if not os.path.isfile(caminho):
        print('  ⚠️ nao existe: %s' % slug)
        continue
    d = json.load(io.open(caminho, encoding='utf-8'))
    print('  %-52s\n     de: %s\n     para: %s' % (slug[:52], d.get('title'), titulo))
    if APLICA:
        d['title'] = titulo
        if d.get('image'):
            d['image']['title'] = titulo
        io.open(caminho, 'w', encoding='utf-8').write(
            json.dumps(d, ensure_ascii=False, indent=2))

print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
