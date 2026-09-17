---
name: fp-do-sites-json-nao-chegava
description: fpOf devolvia só 4 campos, então as 39 arquiteturas usavam as medidas de reserva e não as configuradas por portal
metadata:
  type: project
---

`fpOf(site)` do `render.js` devolvia `{arch, prefix, paletteMode, T}`. As
arquiteturas leem **direto** `fp.container`, `fp.baseFs`, `fp.corpoFs`,
`fp.medida`, `fp.medidaLarga`, `fp.heroAr`, `fp.cardAr`, `fp.kickerLs` e
`fp.radius`. Todos vinham `undefined`.

**Why:** cada portal renderizava com a medida de reserva escrita na própria
arquitetura, e não com a do `sites.json`. Portais que dividem arquitetura ficavam
idênticos em largura de contentor, medida da coluna, proporção de foto e raio de
canto, mesmo com valores diferentes configurados — o oposto do que o
anti-impressão-digital pretende. E `fp.radius === 'sharp'` nunca era verdadeiro,
então não existia portal de canto reto na rede.

Descoberto por captura de tela: a foto de abertura do df8 saía em 4/3 com
`heroAr: "3/2"` no `sites.json`. As duas regras da arquitetura tinham reservas
diferentes (`|| '3/2'` e `|| '4/3'`), e a segunda ganhava — o que só acontece se
o campo for `undefined`.

**How to apply:**

```js
return Object.assign({}, base, { arch, prefix, paletteMode: mode, T: tok });
```

O `T` continua: o `render.js` usa `ctx.fp.T.headOrder` e `ctx.fp.T.schemaVariant`,
que são os únicos campos que passam por `resolveTokens`.

Corrigido nas três máquinas em 23/08/2026, com reconstrução dos 88 portais.
Ver [[classes-hasheadas-no-motor]] e [[conferir-por-captura-usar-cache-busting]].
