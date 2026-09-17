---
name: qmix-render-um-video
description: Como renderizar UM video da fabrica QMIX sem re-renderizar o catalogo inteiro em 4K
metadata:
  type: feedback
---

Para renderizar um video so: `node scripts/render-all.mjs <CompId> --scale=1`, de dentro
de `remotion/`. O id vai como argumento **solto**.

**Why:** o `render-all.mjs` monta a lista de ids com `args.filter(a => !a.startsWith('--'))`,
entao `--only=<CompId>` e descartado, a lista fica vazia e o script renderiza **todo o
manifesto**. E o padrao de escala e 2, ou seja, saida em 4K, enquanto a serie QMIX inteira
entrega 1080p. No qmix-18 essa combinacao gastou 25 minutos re-renderizando outros videos
em 3840x2160 sem nunca chegar no vídeo novo, e o Anderson cobrou a demora.

**How to apply:** sempre os dois, o id solto e `--scale=1`. Se o log comecar a mostrar um
id que nao e o seu (`Ai1Door: 0%`, por exemplo), o filtro nao pegou: mate e refaca. Os
arquivos de `remotion/out/` sao intermediarios ignorados pelo git, entao um render errado
nao danifica entrega, mas custa tempo. Ver [[qmix-serie-backlinks]].
