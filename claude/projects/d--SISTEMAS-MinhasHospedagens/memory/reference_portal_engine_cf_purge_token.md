---
name: reference_portal_engine_cf_purge_token
description: Token de purge do Cloudflare no sites.json do portal-engine (opengravity) estava revogado; wtw19 é o único que cacheia HTML e sofria com isso
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-08T16:37:56.788Z
---

Os 9 portais do portal-engine no opengravity (`/opt/portal-engine/sites.json`) compartilhavam o mesmo token `<<REMOVIDO>>` em `cf.token`. Esse token está **revogado** ("Invalid API Token" no `/user/tokens/verify`), então todo `publishArticle` terminava com `cfPurge 401` silencioso.

Impacto real (medido em 08/08/2026): só o **wtw19** sofria. A zona dele (conta24, `ce5139f1f2a6328b06b8f59411d8de3c`) tem regra de cache de HTML, então a home ficava com o artigo velho mesmo respondendo `cf-cache-status: DYNAMIC` — o mesmo engano documentado em [[reference_mariana_cache_apo_lsws]]. Os outros 8 (girodasnoticias, jornaldebarcelos, nerddahora, noticias9, noticiasdasemana, noticiasgoias, osertaoenoticia, portalnoticiasbh) servem HTML fresco no edge, logo o purge quebrado não os afeta.

Corrigido: `cf.token` do wtw19 agora é o token da **conta24** (`D:/SISTEMAS/cloudflare/contas.json`), backup em `sites.json.bak-cftoken-20260808`.

Pendência: as 8 zonas restantes **não pertencem a nenhuma conta do contas.json** (nenhum token consegue nem ler nem purgar). Se algum dia uma delas ganhar regra de cache de HTML, vai precisar de token novo.

Verificação certa de "está no ar": comparar o `index.html` em disco com o que o edge devolve (`grep -c <slug>`), nunca confiar no `cf-cache-status`.
