---
name: feedback_padrao_links_guest_post
description: "Padrão obrigatório de links em guest post da rede QMIX: link do cliente primeiro, sem nenhum link antes dele, no máximo 2 links internos depois"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-25T13:47:43.980Z
---

Em guest post para cliente, quando houver linkagem interna, o padrão é:

1. O **link do cliente é o primeiro link do conteúdo**. Nada de link interno,
   externo ou de categoria antes dele.
2. Abaixo do link do cliente entram **no máximo 2 links internos** do próprio
   portal.
3. Nunca mais que isso, e nunca acima.

**Why:** o primeiro link do corpo concentra o valor que o cliente está pagando;
link interno antes dele dilui e ainda faz o crawler sair da página antes de
chegar no destino comercial.

**How to apply:** vale para WordPress e para portal-engine. Atenção ao engine: o
`autoLinkContent` insere links de categoria dentro do texto e o rodapé injeta um
"Leia também" automático, então é preciso conferir se algum deles caiu antes do
link do cliente e limpar. Fluxo e scripts em
[[reference_runbook_backlinks_clientes]].

**Regra exata do portal-engine** (medida no `render.js`, função
`_leiaTambemNoMeio`): o bloco `<aside class="pe-leia-meio">` com três links
internos é injetado **logo antes do 3º `<h2>`** do artigo (ou do 2º, se o texto
tiver menos de três). Então, no engine, **o link do cliente precisa estar antes
do 3º h2** — na prática, até o fim da segunda seção. Publicar com o link no meio
do texto coloca três links internos na frente dele. Conferência rápida depois de
publicar: comparar `content.indexOf('pe-leia-meio')` com o índice do link do
cliente, ou olhar a ordem dos `<a>` dentro de `<article>` na página renderizada.

**Segunda injeção, que o guard NÃO cobre** (medida em 01/09/2026): incluir
`class="pe-leia-meio"` no meu próprio aside suprime só a injeção do MEIO. O
`autoLinkContent` tem um **fallback separado**: quando nenhum termo do
vocabulário do portal casa dentro do texto, ele **anexa um parágrafo no fim**
com até 2 links internos a mais, com rótulo variável por portal ("Relacionado:",
"Mais sobre isso:", "Também sobre o tema:"). Aconteceu em 3 dos 5 portais da
rodada danfemax.

Esse parágrafo é **gravado no JSON do artigo na publicação**, não montado no
render, então dá para removê-lo de `/srv/portais/<slug>/data/<slug>.json` e
rodar `rebuildIndexes` que ele não volta.

Conferência que pega os dois casos: contar os `<a>` de dentro de `</article>`
na página publicada, descartando `/autor/`, botões de compartilhar e o widget
de relacionados que fica **fora** do `<article>` (esse é chrome do tema, existe
em todo artigo do portal e não conta).
