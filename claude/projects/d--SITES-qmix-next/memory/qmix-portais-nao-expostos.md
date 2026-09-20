---
name: qmix-portais-nao-expostos
description: "nenhum nome ou slug de portal parceiro pode aparecer em página pública do qmix.com.br, nem no HTML nem no JSON-LD"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
  modified: 2026-09-08T21:45:39.955Z
---

Portais parceiros são veículos de imprensa reais e pediram para não aparecer no
Google como vendedores de backlink: quem buscava o nome do jornal encontrava a
página de venda da QMIX. Desde setembro de 2026 a lista vive em
`/lista-de-backlinks` e `/lista-de-pacotes`, atrás do login e com noindex.

**Why:** o vazamento reaparece por caminhos que não são a grade de produtos, e
já reapareceu três vezes depois de a grade sair: (1) `OfferCatalog`/`ItemList`
de `Product` no JSON-LD, que continuava mapeando a lista inteira; (2) arrays de
fallback com nomes reais escritos no código, usados quando o snapshot falha;
(3) texto de venda citando portal pelo nome, inclusive em resposta de FAQ
guardada no banco (`perguntas_respostas`), não no código.

**How to apply:** ao mexer em página pública, conferir o HTML **servido** contra
a lista de slugs e nomes do banco, não só o código. Buscar por slug em contexto
de URL (`["/]slug["?/]`) e por nome exato, no HTML e nos blocos
`application/ld+json` separadamente. Grep por nome de exibição falha quando o
vazamento está em slug, e vice-versa. Para números em schema, usar `Service` com
`AggregateOffer` (preço mín/máx e `offerCount`), que informa a oferta sem
identificar veículo.

Relacionado: [[qmix-loading-suspense]], [[portais-url-raiz]]

**4º vazamento (18/09/2026):** o mural de avaliações de `/comprar-backlinks` (`MuralAvaliacoes` + `/api/avaliacoes/recentes`)
mostrava domínio e link do portal avaliado. A API agora devolve só `portalDa` e `portalEstado`; nome/slug saíram
de `getAvaliacoesRecentes`. Conferir também endpoints públicos em `/api/*`, não só o HTML.
