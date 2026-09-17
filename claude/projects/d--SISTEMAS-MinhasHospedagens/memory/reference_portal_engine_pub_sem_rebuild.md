---
name: reference-portal-engine-pub-sem-rebuild
description: Publicar no portal-engine por script one-shot escreve o artigo mas NAO atualiza sitemap/home/categoria (rebuildIndexes tem debounce + timer.unref)
metadata:
  type: reference
---

No `render.js` do portal-engine, o `publishArticle` escreve a pagina do artigo de
forma sincrona, mas os INDICES (home, categoria, **sitemap.xml**, news-sitemap,
robots) sao reconstruidos por `scheduleRebuild()`, que usa `setTimeout` com
debounce de 1,2s **e `timer.unref()`**. O unref existe para nao segurar o processo
do servico HTTP.

Consequencia: um script one-shot tipo `node /tmp/pub_engine.js payload.json`
**sai do Node antes do timer disparar** e o rebuild nunca roda. O artigo fica no
ar e responde 200, mas nao entra no sitemap nem aparece na home/categoria. Nao ha
erro nenhum, o publish devolve `{"status":"publish"}` normalmente.

Descoberto em 29/08/2026 auditando a campanha rblc: 25 dos 40 guest posts dos
lotes 1 e 2 e 12 dos 20 do lote 3 estavam fora do sitemap. Os que estavam OK so
estavam porque outro publish (pelo servico HTTP do Antonio, que fica vivo)
reconstruiu o site depois.

**Correcao:** acrescentar ao fim do publicador one-shot
`R.rebuildIndexes(cfg, site);`. Copias em
`D:\SISTEMAS\MinhasHospedagens\scripts\portal-engine-pub_engine.js` e
`portal-engine-rebuild_site.js` (esse ultimo reconstroi um site avulso:
`node rebuild_site.js DOMINIO`). Rodar como root com
`export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin`.

**Armadilha ao conferir:** `sitemap.xml` e cacheado na borda do Cloudflare e o
`cfPurge` do proprio rebuild falha nas zonas sem token (ver
[[reference_portal_engine_cf_purge_token]]). Conferir sempre com cache-buster
(`/sitemap.xml?nc=xxx`), senao da falso negativo. Relacionado:
[[reference_portal_engine_motor_cache_404]] e
[[reference_portal_engine_publish_articles]].
