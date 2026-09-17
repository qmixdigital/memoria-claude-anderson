---
name: lista-de-duas-colunas-preenche-por-linha
description: Grade de duas colunas com fluxo padrão põe o 2º item no topo da direita, e a data pula ao ler descendo a coluna
metadata:
  type: feedback
---

`display:grid;grid-template-columns:1fr 1fr` preenche **por linha**. O segundo
item mais recente vai para o **topo da coluna da direita**, então quem lê
descendo a coluna da esquerda vê 04/ago, 31/jul, e ao lado 04/set do ano
anterior. Parece acervo fora de ordem, e não é.

**Why:** a regra da rede já mandava usar `grid-auto-flow:column`, mas o número de
linhas não dá para cravar no CSS: muda de 3, no bloco de editoria da home, a
dezenas, na listagem completa. Por não ter onde pôr esse número, a regra vinha
sendo ignorada, e a AL e a **AK do folhadonoroeste** foram ao ar com o defeito. A
AK já estava em produção quando apareceu.

**How to apply:** o número de linhas vai numa variável CSS calculada no render, e
a media query devolve o fluxo por linha no celular:

```css
.lista{display:grid;grid-template-columns:1fr 1fr;
  grid-auto-flow:column;grid-template-rows:repeat(var(--l,3),auto)}
@media(max-width:900px){.lista{grid-template-columns:1fr;
  grid-auto-flow:row;grid-template-rows:none}}
```

```js
<div class="lista" style="--l:${Math.ceil(resto.length / 2)}">
```

Cada chamada precisa do próprio `--l`: o bloco da home corta em 6, o de
relacionados em 3, a listagem usa a lista inteira. Só a captura de tela mostra —
o HTML fica idêntico. Ver [[conferir-por-captura-usar-cache-busting]] e
[[deploy-de-arch-aponta-para-a-vizinha]].
