---
name: criar-categoria-quando-faltar
description: "Se o portal não tem editoria adequada para a pauta, criar a editoria em vez de encaixar em categoria errada"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-16T21:16:35.124Z
---

Quando a pauta não couber em nenhuma editoria existente do portal, **criar a
editoria nova**. Não precisa perguntar.

**Por quê:** eu vinha encaixando pauta em categoria aproximada para não mexer no
menu, e isso custa duas vezes. A página de categoria é o hub do cluster: sem uma
editoria própria, os artigos do mesmo tema ficam espalhados e não passam
autoridade entre si. E editoria errada polui a semântica do portal aos olhos do
Google. Ver [[palavras-chave-e-entrega]].

**Como aplicar:** criar a categoria antes de publicar o primeiro artigo do
cluster, com nome de editoria de jornal (não nome de keyword), e conferir que ela
entrou no menu, no `categoryMap` e no sitemap. Lembrar que nos motores antigos o
menu é montado a partir da categoria dos artigos, não do `categoryMap` — ver
[[tres-instancias-do-motor]].

**Autor novo tem uma pegadinha:** acrescentar a pessoa em `equipe` no
`sites.json` faz a assinatura aparecer no artigo, mas a página `/autor/slug/`
continua devolvendo 404. Ela só existe se houver um item em `extraPages` com
`slug: "autor/<slug>"`. Depois de acrescentar, rodar `rebuildIndexes` como
usuário `portais` e purgar a Cloudflare. A página de equipe também não se
atualiza sozinha: o texto dela é conteúdo fixo do `extraPages`, inclusive a
frase que conta quantas frentes existem, e costuma trazer `&mdash;`, que é
travessão e precisa sair. Ver [[nunca-citar-a-agencia-nos-portais]] e
[[pacote-editorial-eeat]].
