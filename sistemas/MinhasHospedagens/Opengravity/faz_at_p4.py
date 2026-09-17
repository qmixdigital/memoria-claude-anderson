# -*- coding: utf-8 -*-
"""Troca o comentario de topo da AT, que ainda descrevia a AS."""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AT.js'
s = io.open(P, encoding='utf-8').read()

CAB = '''/*
 * Arquitetura AT, arquetipo MANCHETE. Feita para o folhar.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca do Folha R e a palavra FOLHA em grotesco pesado com extrusao, e um R
 * atravessado por uma seta que sobe. A assinatura da origem e "noticias e
 * conteudos 24 horas". O favicon dela e so esse R, branco sobre preto.
 *
 * Dois gestos saem dai: a **barra chumbo** no topo e no rodape, e a **lista
 * numerada** de cada secao, com o numeral grande em contorno prata a esquerda do
 * titulo, que le como ordem de chegada.
 *
 * ## O que a diferencia das 45 vizinhas da opengravity
 *
 *   - 🔴 **cabecalho e rodape escuros**. Todas as 45 tem barra clara. Aqui nao e
 *     escolha estetica: a versao "preta" do logotipo da origem tem a palavra
 *     preta mas **o R continua branco**, e sobre papel branco o simbolo some.
 *     A barra escura e o que deixa a marca aparecer inteira
 *   - **lista numerada sem miniatura**. A AO usa marcador redondo de linha do
 *     tempo, a AS arcos, a AM caixas: nenhuma numera
 *   - **manchete horizontal com imagem a esquerda**, e o filete que corre da
 *     editoria ate a borda do contentor
 *   - **Oswald e Barlow**: nenhuma das duas esta nas 55 familias em uso
 *   - **chumbo com brasa**: nao existe quase-preto com laranja-brasa na maquina
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **`flatUrl: true` COM `categoryBase: "categoria"`.** O artigo mora em
 * `/<slug>/`, na raiz, e a editoria em `/categoria/<slug>/`. Montar o link de
 * editoria a mao poe o menu do topo, o do rodape e o chapeu de cada artigo em
 * 404. Editoria sai de `H.curl(slug)`, artigo de `H.url(a)`, sempre.
 *
 * ⚠️ Como tudo divide a raiz, **slug podado colide com pagina que o motor
 * regenera**: contato, politica-de-privacidade, termos-de-uso e quem-somos ficam
 * fora do 410.
 *
 * ⚠️ **O `--barbg` e o `--bartx` sao declarados no `:root`.** Variavel de cor
 * definida no seletor do elemento principal nao alcanca o cabecalho, e o botao
 * do menu fica invisivel no celular.
 *
 * ⚠️ **O numeral da lista sai de `counter` em `::before`**, e nao de texto no
 * HTML: assim leitor de tela nao anuncia "zero dois" no meio do titulo. O
 * contorno usa `-webkit-text-stroke`, com reserva para quem nao tem suporte.
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
print('  comentario de topo da AT trocado')
