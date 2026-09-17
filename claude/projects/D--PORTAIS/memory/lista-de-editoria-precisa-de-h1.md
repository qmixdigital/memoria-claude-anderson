---
name: lista-de-editoria-precisa-de-h1
description: Arquitetura que abre a lista com h2 deixa a pagina de categoria sem h1, e o cartao vira h2 junto
metadata:
  type: project
---

A pagina de lista de editoria e a pagina principal daquele assunto no portal. Se
a arquitetura abre o titulo dela com `h2`, a pagina fica **sem h1 nenhum** e o
Google nao tem como saber qual e o tema. Aconteceu nas 17 editorias do adonline.

**A correcao tem duas metades, e esquecer a segunda cria defeito novo:** o titulo
da lista vira `h1`, e o cartao, que era `h3` sob um `h2` de secao na home, tem que
virar `h2` na lista. Senao a hierarquia pula de h1 para h3.

Jeito que resolveu: `xGrid(ctx, a, eager, nivel)` com `const n = nivel || 3`, e a
lista passando `2`. A home continua chamando sem o quarto argumento.

O CSS tambem precisa cobrir os dois: `${s('xg')} h2,${s('xg')} h3{...}`.

Ver [[classes-hasheadas-no-motor]] e [[arch-local-e-fonte-unica]].
