---
name: flat-url-com-category-base
description: Os dois campos são independentes; o par flatUrl + categoryBase existe e faz três slugs podados colidirem na raiz
metadata:
  type: reference
---

O desassossegada é o único das três máquinas com **`flatUrl: true` E
`categoryBase: "categoria"` ao mesmo tempo**: `permalink_structure = /%postname%/`
com `category_base = categoria`. O artigo mora em `/<slug>/`, na raiz, e a
editoria em `/categoria/<slug>/`. O motor trata os dois campos separados
(`H.url` para o artigo, `H.curl` para a editoria), então o par funciona. O que
não pode é assumir que um implica o outro.

**Duas consequências:**

1. **Não existe o 403 de diretório sem índice** que os portais com
   `flatUrl: false` mais `categoryBase` têm: `/dicas/` nunca foi diretório de
   artigo. Ver [[diretorio-sem-indice-devolve-403]].
2. ⚠️ **Slug podado colide com página que o motor regenera.** Com URL plana,
   `contato`, `politica-de-privacidade` e `termos-de-uso` disputam a raiz com as
   páginas institucionais. Entrassem no 410, a página de contato nova morreria e
   ninguém descobriria. Ver [[slug-podado-que-o-motor-regenera]].

Ler `permalink_structure` e `category_base` na origem, sempre, e lembrar que
[[category-base-vazio-e-category]].
