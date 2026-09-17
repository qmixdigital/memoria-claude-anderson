---
name: favicon-para-o-google
description: O Google so mostra icone quadrado e multiplo de 48px, lido da home; e declarar arquivo que nao existe da 404 no head
metadata:
  type: reference
---

Para o icone aparecer no resultado de busca, o Google exige:

  - **quadrado e multiplo de 48px**. Os 16 e 32 de habito ele descarta
  - declarado **na home**, com `rel` entre `icon`, `shortcut icon`,
    `apple-touch-icon` ou a variante `-precomposed`
  - **rastreavel** e em **URL estavel**: ele guarda o icone por bastante tempo e
    so revisita quando rerrastreia a home

Conjunto que cobre o Google e o resto dos aparelhos: PNG em **48, 96, 144, 192,
512**, `.ico` com 16/32/48 dentro para navegador antigo, `apple-touch-icon` em
**180** com o atributo `sizes` (sem ele o iOS reescala e borra), e um `favicon.svg`.

🔴 **O patch do `<head>` e o arquivo tem que ir juntos.** O bloco de icone do motor
e compartilhado por todos os portais da maquina: declarar `/favicon-48.png` sem
gerar o arquivo troca um icone faltando por **404 no cabecalho de toda pagina**.

Para vetorizar o `favicon.svg` a partir do PNG, sem embutir raster:
`skimage.measure.find_contours` mais `approximate_polygon`, com
`fill-rule="evenodd"` para os vazios de dentro das letras. Conferir o **limiar**
pela soma dos canais da cor de fundo, e nao por chute: no AdOnline a lima soma
247 e um corte em 300 fazia 99,8% da imagem virar monograma.

Ver [[marca-tem-duas-cores]].
