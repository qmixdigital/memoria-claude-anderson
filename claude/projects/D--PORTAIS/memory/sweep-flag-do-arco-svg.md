---
name: sweep-flag-do-arco-svg
description: Arco de SVG com sweep-flag errado curva para o lado oposto e nada acusa; só a captura de tela mostra
metadata:
  type: project
---

Num comando `A` de SVG, os dois valores de `sweep-flag` produzem arcos
geometricamente válidos. Com o errado a curva passa do lado oposto: o símbolo dos
três arcos de sinal do PN Brasil (arquitetura AS) saiu como um gancho.

`node -e "require(...)"` carrega, o HTML sai inteiro, o console fica limpo e
nenhum auditor de HTML tem como ver. **Só a captura de tela mostra.**

**Why:** desenhei o arco de cabeça, de `M9 31 A22 22 0 0 1 31 9`, e o centro caiu
em (31,31) em vez de (9,9).

**How to apply:** para um quarto de circunferência do leste ao norte em torno de
(ox, oy), a forma é `M(ox+r) oy A r r 0 0 0 ox (oy-r)`, com **sweep-flag 0**.
Quando o mesmo desenho já existe validado em outro arquivo (aqui, o favicon),
gerar os dois com a mesma função em vez de reescrever.

Ver [[conferir-por-captura-usar-cache-busting]] e [[wordmark-svg-pode-faltar-letra]].
