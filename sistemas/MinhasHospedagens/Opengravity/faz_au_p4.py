# -*- coding: utf-8 -*-
"""Troca o comentario de topo da AU, que ainda descrevia a AT."""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AU.js'
s = io.open(P, encoding='utf-8').read()

CAB = '''/*
 * Arquitetura AU, arquetipo ANEL. Feita para o publisherbrasil.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca do Publisher Brasil e um **anel de crescente verde-limao** sobre
 * preto, com um segundo crescente cinza por dentro e a palavra Publisher em
 * branco. O favicon da origem e uma lampada acesa segurada por uma mao.
 *
 * Dois gestos saem dai: o **anel abre cada secao**, ao lado do nome da
 * editoria, e as **miniaturas da lista sao circulares**, com um anel limao em
 * volta.
 *
 * ## O que a diferencia das 46 vizinhas da opengravity
 *
 *   - **foto redonda**. Nenhuma das 46 usa miniatura circular: e o que muda a
 *     silhueta da secao a distancia
 *   - **anel desenhado abrindo a editoria**, e nao pastilha, faixa ou filete
 *   - o "ver tudo" e uma **pilula limao cheia**, e nao texto sublinhado
 *   - **Bricolage Grotesque e Public Sans**: as duas ja existem na maquina, mas
 *     nunca juntas, e nenhuma outra combina display variavel com grotesca de
 *     interface
 *   - **preto com limao**: o folhadonoroeste tem lima, mas sobre marinho. Preto
 *     com limao nao existe na maquina
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **`flatUrl: false` COM `categoryBase: "categoria"`.** O artigo mora em
 * `/<editoria>/<slug>/` e o arquivo de editoria em `/categoria/<slug>/`. Os dois
 * nao coincidem: montar o link de editoria a mao poe o menu do topo, o do rodape
 * e o chapeu de cada artigo em 404, sem aparecer em print nenhum. Editoria sai
 * de `H.curl(slug)`, artigo de `H.url(a)`, sempre.
 *
 * ⚠️ Como o artigo mora dentro da pasta da editoria, `/<editoria>/` vira
 * diretorio sem indice e o nginx responde 403: o vhost precisa do 301 de cada
 * editoria e do `error_page 403 =404`.
 *
 * ⚠️ **O limao `#DFFB00` da 1,1:1 sobre branco.** Ele e anel, filete e pilula,
 * nunca texto. Chapeu, link e etiqueta usam o `--tinta`, uma azeitona escura.
 *
 * ⚠️ **A miniatura redonda precisa de `border-radius` no `span` E no `[data-f]`**:
 * o `overflow:hidden` do pai nao recorta o filho que tem `aspect-ratio` proprio
 * em todos os navegadores.
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por `H.curl(slug)` e de artigo por `H.url(a)`
 *   - menu sanfonado abaixo de 1100px, com aria-expanded, aria-controls e
 *     rotulo que muda ao abrir
 *   - todo `span` com aspect-ratio tem `display:block`, e o `a` do cartao tem
 *     `display`
 *   - body aberto no cabecalho e `H.bodyEnd()` nos tres caminhos de pagina
 *   - nada centralizado alem da marca
 *   - lista de editoria abre em h1, e o cartao dela sobe para h2
 *   - a grade da listagem pula o destaque, e nao o repete
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *   - a legenda da imagem so aparece quando o `alt` descreve a foto
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG
 *   - a classe do bloco "Veja tambem" leva o prefixo DESTE portal
 */'''

i = s.index('/*')
j = s.index('*/') + 2
s = s[:i] + CAB + s[j:]
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  comentario de topo da AU trocado')
