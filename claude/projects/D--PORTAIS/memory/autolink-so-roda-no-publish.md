---
name: autolink-so-roda-no-publish
description: autoLinkContent e chamado dentro do publishArticle; ligar no sites.json nao alcanca o acervo importado
metadata:
  type: project
---

`autoLinkContent` do `render.js` e chamado **dentro do `publishArticle`**, e nao
no caminho de renderizacao. Consequencia: ligar `autoLink` no `sites.json` vale
so para o conteudo novo que chega pela plataforma, e **o acervo importado
continua sem link interno nenhum**, mesmo depois de reconstruir.

Um portal convertido nasce orfao por isso. No adonline eram 94 de 688 artigos com
algum link no corpo.

**Resolve com uma passada unica** aplicando a propria funcao do motor ao `content`
ja gravado. Ela e idempotente: pula destino que o texto ja linka.

```js
const r = require('/opt/portal-engine/src/render.js');
a.content = r.autoLinkContent(site, a.slug, a.content);
```

Duas coisas que so aparecem depois de ligar:

**Termo escolhido de intuicao alcanca pouco.** Minha lista pegava 9% do acervo. A
lista boa sai de minerar o corpus e ver que expressao tematica se repete de
verdade.

**O bloco de reserva concentra ancora.** Ele usa as ancoras fixas do
`fallback.pool` em todo artigo onde nenhum termo casa: no adonline "a cobertura de
TikTok" saiu 135 vezes. Trocar por "Veja tambem" com materias da mesma editoria,
ancora igual ao titulo do destino, que e unica por definicao.

Ver [[linkagem-interna-portal-novo]] e [[padrao-de-crosslinking-do-lote]].
