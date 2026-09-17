# -*- coding: utf-8 -*-
"""Troca o comentario de topo da AS, que ainda descrevia a AR."""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AS.js'
s = io.open(P, encoding='utf-8').read()

CAB = '''/*
 * Arquitetura AS, arquetipo SINAL. Feita para o pontonaturalbrasil.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca e a palavra PN BRASIL em grotesco geometrico pesado, com tres arcos
 * concentricos e um ponto a esquerda: o desenho de um sinal irradiando. O
 * favicon da origem e so esse simbolo, em verde vivo sobre branco.
 *
 * O gesto da arquitetura sai dai: cada secao ganha um rotulo lateral estreito
 * que acompanha a rolagem, com os arcos por cima do nome da editoria, e a
 * coluna de materias corre a direita. O sinal fica parado enquanto o conteudo
 * passa por ele.
 *
 * ## O que a diferencia das 44 vizinhas da opengravity
 *
 *   - rotulo de secao horizontal, estreito e preso na rolagem. A AL gira o
 *     texto na vertical, a AK usa faixa cheia, a AM caixas, a AN mosaico, a AO
 *     linha do tempo, a AP moldura de tela, a AQ cabecalho de revista e a AR
 *     modulo assimetrico. Nenhuma prende o rotulo
 *   - trio de colunas separadas por filete vertical embaixo da materia de
 *     abertura, e nao lista com miniatura ao lado
 *   - Darker Grotesque e Rubik: nenhuma das duas esta nas 55 familias em uso
 *   - verde profundo com verde vivo: a unica paleta verde da maquina, e o vivo
 *     vem medido do favicon da origem
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 flatUrl false COM categoryBase "categoria". O artigo mora em
 * /<editoria>/<slug>/ e o arquivo de editoria em /categoria/<slug>/. Os dois
 * nao coincidem: montar o link de editoria a mao poe o menu do topo, o do
 * rodape e o chapeu de cada artigo em 404, sem aparecer em print nenhum.
 * Editoria sai de H.curl(slug), artigo de H.url(a), sempre.
 *
 * ⚠️ Como o artigo mora dentro da pasta da editoria, /<editoria>/ vira
 * diretorio sem indice e o nginx responde 403: o vhost precisa do 301 de cada
 * editoria e do error_page 403 =404.
 *
 * ⚠️ O verde vivo #00FF30 da 1,4:1 sobre branco. Ele e filete, arco e bloco,
 * nunca texto. Chapeu e etiqueta usam --tinta, com 5,4:1.
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por H.curl(slug) e de artigo por H.url(a)
 *   - menu sanfonado abaixo de 1100px, com aria-expanded, aria-controls e
 *     rotulo que muda ao abrir
 *   - todo span com aspect-ratio tem display block, e o a do cartao tem display
 *   - body aberto no cabecalho e H.bodyEnd() nos tres caminhos de pagina
 *   - nada centralizado alem da marca
 *   - lista de editoria abre em h1, e o cartao dela sobe para h2
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *   - a legenda da imagem so aparece quando o alt descreve a foto
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no :root, e nao no seletor do elemento principal
 *   - o respiro lateral usa padding-block, nunca padding completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG
 *   - a classe do bloco "Veja tambem" leva o prefixo DESTE portal
 */'''

i = s.index('/*')
j = s.index('*/') + 2
s = s[:i] + CAB + s[j:]
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  comentario de topo da AS trocado')
