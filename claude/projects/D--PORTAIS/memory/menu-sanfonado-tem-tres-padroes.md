---
name: menu-sanfonado-tem-tres-padroes
description: procurar só `aria-expanded` dentro do header acusa falta de menu onde ele existe
metadata:
  type: feedback
---

Auditar menu sanfonado procurando `aria-expanded` dentro do `<header>` acusa
falso positivo em massa. São **três** padrões legítimos na rede:

1. botão com `aria-expanded` e `aria-controls`
2. `<input type="checkbox">` com `<label>`, o acordeão em CSS puro, sem botão
3. a injeção do próprio motor, marcada com `data-mh`

E a `<nav>` das editorias **nem sempre está dentro do `<header>`**: em várias
arquiteturas ela é uma faixa logo abaixo. A região a examinar vai até o `<main>`.

**Why:** com o critério estreito, 10 dos 12 portais acusados tinham menu
funcionando, e o injetor não achava nav nenhuma nos que estavam de fato sem.

**How to apply:** `detecta_menu.py`, em
`D:\SISTEMAS\MinhasHospedagens\Opengravity`, já cobre os três. Desde 24/08/2026 o
motor injeta o botão quando nenhum dos três aparece, com cor de `currentColor` e
estilo escopado pelo `id` da nav, que vence qualquer classe da arquitetura.
