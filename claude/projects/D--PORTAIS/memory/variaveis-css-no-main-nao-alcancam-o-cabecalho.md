---
name: variaveis-css-no-main-nao-alcancam-o-cabecalho
description: "Declarar as variáveis de cor no seletor do <main> deixa cabeçalho e rodapé sem elas; o botão do menu some no celular"
metadata:
  node_type: memory
  type: project
---

As arquiteturas declaram a paleta no seletor do elemento principal:

```css
.zwrap{--pri:#123A5C;--ink:#14181C;...}
```

Cabeçalho e rodapé são **irmãos** desse elemento, não filhos: dentro deles
`var(--pri)` não resolve. E variável indefinida **não cai para um valor
parecido**: a declaração inteira é descartada. `border:2px solid var(--pri)` não
vira borda fina, vira **borda nenhuma**.

Na arquitetura Z isso deixou o botão do menu sanfonado invisível no celular, com
`borderTopWidth: 0px` medido no navegador, e a régua de 4px do cabeçalho virou
uma linha de 1px herdada.

**Por que não aparece em revisão:** o CSS está sintaticamente correto, e no
desktop o botão está escondido de propósito. Só apareceu perguntando a caixa do
elemento por CDP.

**Correção:** declarar em `:root`, que cobre a página inteira e não depende de
onde a arquitetura pendura cada bloco. As arquiteturas mais antigas escapam
porque interpolam a cor literal no cabeçalho em vez de usar `var()`, mas isso é
sorte, não desenho.

Ver [[motor-duas-funcoes-de-hash]] e [[span-com-aspect-ratio-precisa-de-block]].
