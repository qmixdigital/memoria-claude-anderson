---
name: body-nao-abre-nas-archs-novas
description: O motor fecha em </head> e quem abre o <body> e a arquitetura; U/V/W/X e 15 da srv1166087 nao abriam
metadata:
  type: project
---

O `buildHead` do motor termina em `</head>`. Quem emite a tag `<body>` e a funcao
`*Header` de cada arquitetura. As arquiteturas mais novas foram escritas sem ela,
e o HTML saia com `<header>` colado no `</head>`.

Nao quebra nada na tela, porque o navegador insere o `<body>` sozinho. Mas o
documento e invalido e o `</body>` do `H.bodyEnd()` fecha algo que nunca abriu.

**Onde estava:** U, V, W e X na opengravity (blogse, euvo, qmixdigital, adonline)
e 15 arquiteturas da srv1166087. A clinicas-vps ja estava certa nas 34.

**Armadilha:** nas arquiteturas **N** e **R** da srv1166087, `nHome`, `nArticle` e
`nList` chamam `nRail` e `rNav` **direto**, e nunca passam pelo `*Header`. Corrigir
o `*Header` so acertava a pagina institucional; a home continuava sem `<body>`.
Antes de dar o patch por feito, conferir a home, e nao so o codigo.

Ver [[deploy-de-arch-nao-pode-cortar-a-vizinha]] e [[arch-local-e-fonte-unica]].
