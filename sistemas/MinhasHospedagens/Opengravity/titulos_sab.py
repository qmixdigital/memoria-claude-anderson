# -*- coding: utf-8 -*-
"""Desempata os cinco pares de titulo identico do saberdefato e conserta os
titulos que sao fragmento de frase ou vieram em outro idioma.

⚠️ Titulo repetido nao se resolve apagando: cada copia carrega o backlink de um
cliente e a segunda tem o slug que o Google indexou. **Muda o titulo, nunca o
slug.**
"""
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/saberdefato/data'

NOVOS = {
    # os cinco pares publicados duas vezes
    'consorcio-de-moto-o-que-e-e-como-funciona':
        'Consórcio de moto: parcela, lance e prazo de contemplação',
    'os-programas-de-moda-que-definiram-tendencias-na-televisao-2':
        'Moda na TV: os programas que viraram referência',
    'frankenweenie-e-a-homenagem-de-burton-aos-monstros-classicos-2':
        'Frankenweenie e o cinema de terror que Burton assistiu',
    'como-acelerar-a-rotina-diaria-2':
        'Creme clareador de ação rápida: o que esperar do uso',
    'a-parceria-entre-burton-e-o-compositor-danny-elfman-explicada-2':
        'Danny Elfman e a trilha que define o cinema de Burton',
    # fragmentos de frase, com a palavra-chave escondida no corpo
    'como-equilibrar-maturidade-e-afeto':
        'Mensagens de aniversário maduras: o que escrever',
    'o-que-considerar-ao-escolher-uma-nova-profissao':
        'Mudar de carreira: como avaliar um curso online',
    'o-impacto-das-tecnicas-atuais-no-mercado-estetico-brasileiro':
        'Curso de extensão de cílios: os métodos de aplicação',
    'como-demandas-urbanas-influenciam-a-escolha':
        'Maquininhas para cidade grande: qual aguenta o volume',
    'como-transmitir-carinho-atemporal':
        'Mensagens de aniversário para avós: frases e ideias',
    'como-acelerar-a-rotina-diaria':
        'Creme clareador: como encaixar no cuidado do dia a dia',
    'como-comprovante-fisico-ajuda-no-atendimento':
        'Maquininha com impressão: quando o comprovante ajuda',
    # ⚠️ titulo em ingles num artigo escrito em portugues
    'brandon-moreno-predestined-ufc-journey-with-loneer-kavanagh':
        'Brandon Moreno e o encontro anunciado com Kavanagh',
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
