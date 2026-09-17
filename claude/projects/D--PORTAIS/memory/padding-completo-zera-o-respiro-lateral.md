---
name: padding-completo-zera-o-respiro-lateral
description: "Classe que divide elemento com o contentor e declara padding completo apaga o respiro lateral; só aparece no celular"
metadata:
  node_type: memory
  type: feedback
---

No cabeçalho a mesma `<div>` carrega duas classes: a do contentor, que dá o
respiro lateral, e a da faixa, que dá o respiro vertical.

```css
.zin  {max-width:1200px;margin:0 auto;padding:0 22px}
.zcapa{padding:20px 0 14px}      /* o zero do meio apaga os 22px */
```

**Why:** no desktop não aparece. O contentor tem largura máxima e a margem
automática sobra dos dois lados, então o texto nunca encosta na borda. No
celular, onde a largura útil é a da tela, a marca cola no canto esquerdo. Perdi
uma rodada achando que era problema da captura.

**How to apply:** em classe que divide elemento com o contentor, usar
`padding-block`, que mexe só no eixo vertical. E conferir medindo:
`getComputedStyle(el).paddingLeft` no elemento que tem as duas classes, não a
olho no print de desktop.

Ver [[variaveis-css-no-main-nao-alcancam-o-cabecalho]] e [[qa-mobile-chrome-headless]].
