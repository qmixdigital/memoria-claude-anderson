---
name: reference_portal_engine_slug_owner_e_deploy_pages
description: "publishArticle devolve status 'skipped' (duplicate, owner=outro portal) em silêncio quando o slug já é de outro site, e artigo publicado só vai ao ar após `node pages_pack.js <slug>` (deploy no Pages); até lá a URL dá 404"
metadata:
  node_type: memory
  type: reference
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-21T10:29:14.456Z
---

Publicando o lote José Mário (21/10/2026) por script Node (`publishArticle` + `rebuildIndexes`):

- **Slug já tomado:** `publishArticle` NÃO lança erro, devolve `status:'skipped', duplicate:true, owner:'euvo'` e imprime "OK". `quantas-vezes-por-semana-treinar` era do euvo e o qmixdigital não publicou nada. Sempre ler o `status` do retorno; se `skipped`, trocar o slug (payload.slug aceito) e rodar de novo.
- **404 logo após publicar:** os portais servem HTML estático no Cloudflare Pages. `publishArticle` grava no disco da VPS e o motor na 8791 pode devolver 404 até o deploy. Rodar `HOME=/opt/portal-engine node pages_pack.js <slug>` (um por portal, pode ir em paralelo em background) e esperar "Deployment complete" antes de auditar no ar.
- O `slug` do payload e o `categories:[id]` do `categoryMap` do `sites.json` funcionam; `subtitle` vira a linha fina; `metaTitle` é cortado pelo motor com o sufixo do portal.

**Why:** perdi uma rodada achando que o artigo do qmixdigital estava publicado e que o 404 era cache. **How to apply:** conferir o retorno de cada `publishArticle` e fazer o deploy no Pages antes da checagem no ar. Ver [[reference_portal_engine_pub_sem_rebuild]] e [[reference_portal_engine_dedup_por_host]].
