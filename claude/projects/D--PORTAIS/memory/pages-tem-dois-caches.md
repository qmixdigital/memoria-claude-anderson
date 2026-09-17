---
name: pages-tem-dois-caches
description: "Cloudflare Pages não renova o cache de assets no deploy, e a zona cacheia o 404; artigo novo ficava em 404 e artigo apagado em 200 por minutos"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1f871aca-8ade-42dd-b70a-66ffccd1c807
  modified: 2026-09-17T13:05:10.467Z
---

Medido em 17/09/2026 no matogrossosaude: publicar pela plataforma levou 45 s até o
deploy, mas o domínio seguia em 404 (`cf-cache-status: HIT`) e, depois de apagar,
seguia em 200 dez minutos depois, no pages.dev também. `purge_everything` na zona
devolvia MISS e o 200 velho vinha de cima, com `Age` (cache de assets do Pages, por
URL com query, que a documentação diz renovar no deploy e não renova).

**Why:** a zona tem a regra "WP edge microcache HTML" (1800 s por cima da origem),
que cacheia 404; e o Pages tem cache próprio de assets que o purge da zona não
alcança. `?nc=` pula os dois e mente.

**How to apply:** o `pages_pack.js` purga a zona depois de "Deployment complete"
e o `_middleware.js` pede cada página de texto por `ctx.next(new Request(url +
'?_d=<marca do deploy>'))`, tirando o `_d=` do `Location` se vier redirect. Só
página de texto; imagem, css e fonte ficam fora. Provar sempre sem query.
Ver [[portais-no-cloudflare-pages]].
