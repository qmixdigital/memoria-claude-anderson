---
name: layout-nada-centralizado
description: Regra do Anderson - conteúdo centralizado no desktop é layout americano e desorganizado; só marca pode centralizar
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T20:01:32.278Z
---

**Nenhum conteúdo centralizado no desktop.** O Anderson rejeitou o single post do
boxnoticias em 15/08/2026 com essa frase: *"não gosto desse conteúdo centralizado,
me parece muito desorganizado, quem gosta de layout centralizado são os americanos"*.

O que pode continuar centralizado: **apenas identidade de marca** — o masthead do
topo e o bloco de logo do rodapé. Todo o resto do conteúdo vai à esquerda.

Não basta alinhar à esquerda: **uma coluna estreita sozinha no meio da tela também
é desorganizada**, porque deixa metade do desktop vazio. O que resolveu no single
post da arch V:

- **abertura dividida**: kicker, H1, resumo e assinatura à esquerda; imagem à
  direita, os dois blocos fechando na mesma linha (`align-items:end`, imagem em 3/2)
- **corpo em duas colunas**: trilho fixo de 214px à esquerda com sumário
  "Neste artigo" (gerado dos `<h2>`, com id injetado) e compartilhamento, e o texto
  numa medida de 74ch ao lado
- abaixo de 1000px tudo empilha, a imagem sobe para o topo e o sumário some

Bug achado no caminho: `body p:first-of-type::first-letter` pintava capitular na
**primeira letra de cada resposta do FAQ**, porque cada resposta é `p` dentro do
próprio `div`. Tem que ser **`body > p:first-of-type`**, filho direto, inclusive na
regra do media query mobile, que era fácil de esquecer.

Ver [[arch-u-identidade]] e [[classes-css-nao-podem-repetir]].
