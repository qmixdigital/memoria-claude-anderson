---
name: cloudflare-pages-armadilhas
description: "Limites não documentados do Cloudflare Pages medidos na migração de 17/09/2026 (10 KB de _redirects, barra final, host no _redirects)"
metadata: 
  node_type: memory
  type: project
  originSessionId: de5fad1b-f7e5-4473-8196-ec1fb9617cf1
  modified: 2026-09-17T09:20:36.470Z
---

Na migração do cirurgiadecolunagoiania.com.br para o Cloudflare Pages (17/09/2026) medi três
comportamentos que a documentação não descreve e que valem para qualquer site da rede que for
para o Pages:

1. **O Pages só honra os primeiros ~10 KB do `_redirects`.** A regra 125 (byte 10.458) era a
   última aplicada; da 126 em diante, 404. O limite documentado é de 2.000 regras, mas na
   prática é o tamanho. Redirects em massa vão para uma Pages Function (`functions/[[path]].js`)
   com `env.ASSETS.fetch` primeiro e fallback depois.
2. **Não casa barra final sozinho:** `/x` funciona e `/x/` não. Toda regra estática vem em par.
3. **Regra de host no `_redirects` (`https://www.dominio/* https://dominio/:splat 301`) não pega**
   mesmo com o www adicionado como custom domain. O www→apex tem que ir na Function.

Também: uma Cache Rule "Cache Everything" na zona **não é invalidada pelo deploy do Pages** e segura
HTML velho pelo TTL. Ou apagar a regra, ou purgar as URLs de HTML no workflow (purgar tudo esfria
os assets e faz o PageSpeed cair por ruído). **Nunca medir PageSpeed logo depois de purgar.**

**How to apply:** ao levar qualquer site para o Pages, dimensionar o `_redirects` abaixo de
10 KB, gerar pares com/sem barra, e colocar www→apex e catch-alls numa Function. O gerador e a
Function prontos estão em `d:\SITES\cirurgiadecoluna\_nao-deploy\gerar-redirects.py`.
