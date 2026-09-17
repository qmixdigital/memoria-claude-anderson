---
name: span-com-aspect-ratio-precisa-de-block
description: "Span inline com aspect-ratio não conta altura: a imagem passa por cima do título do cartão"
metadata:
  type: project
---

Nas arquiteturas do portal-engine, a imagem do cartão costuma vir num
`<span class="...">` dentro de um `<a>`. Span é inline, e **span inline com
`aspect-ratio` não cria caixa de bloco**: a altura da imagem não entra na conta do
cartão, e a foto passa por cima do texto que vem depois.

O sintoma engana: parece título cortado, ou faixa com altura travada, ou seção
sobrepondo a seguinte. A correção é uma linha:

```css
${s('xcard')} .xph{display:block;aspect-ratio:4/3;overflow:hidden}
```

**Já apareceu nove vezes**, em arquiteturas diferentes: W (sejanoticia), X
(gazetadoconsumidor), P (umjornal), M (mundodasnoticias), T (filmeseseriesnovas)
e no cartão da capa. Em 19/08/2026 virou a primeira coisa a checar em toda
arquitetura nova: na T o `<a>` do cartão nem tinha `display`, então o próprio
link era inline. Ao mexer em qualquer arquitetura, checar
antes todos os `span` que carregam `aspect-ratio`.

Relacionado, do mesmo grupo de armadilhas de grade: `grid-auto-flow:column` com
`grid-auto-columns:minmax(N,1fr)` estica o único cartão pela largura toda quando a
editoria tem um artigo só. Coluna fixa resolve. E `aspect-ratio` junto com
`max-height` encolhe o bloco em largura para preservar a proporção, o que tira a
faixa da largura total: nesse caso usar `height` em `clamp()`.
