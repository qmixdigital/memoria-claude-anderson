---
name: indexnow-bing
description: Como enviar URLs da revista ao Bing (API Webmaster Tools) e ao IndexNow, e reenviar o sitemap no Google e no Bing
metadata:
  type: reference
---

- **Bing Webmaster Tools**: chave em `C:/Users/User/Documents/APIs/bing-webmaster-tools.txt` (conta com 64 sites; revistamsaude.com.br já verificada). Endpoints usados: `GetUserSites`, `SubmitFeed` (sitemap), `SubmitUrlBatch` (até 10.000 URLs/dia), `GetUrlSubmissionQuota`. Base `https://ssl.bing.com/webmaster/api.svc/json/<metodo>?apikey=K`, POST em JSON com `siteUrl` = `https://revistamsaude.com.br/`.
- **IndexNow**: chave `<<REMOVIDO>>`, guardada em `Documents/APIs/indexnow-revistamsaude.txt` e publicada em `public/<chave>.txt` (entra no build do Next; sem deploy dá 404). POST em `https://api.indexnow.org/indexnow` e `https://www.bing.com/indexnow` com `{host,key,keyLocation,urlList}`; resposta 202 = aceito.
- **Google**: `gsc-sitemap.mjs` no scratchpad (googleapis, `sitemaps.submit` + `sitemaps.list`), rodado na VPS com `node --env-file=.env`.
- Feito em 20/09/2026: sitemap reenviado nos dois, 110 URLs (matérias novas e alteradas, 6 especialidades, 9 fichas) submetidas ao Bing e ao IndexNow.

**How to apply:** depois de cada leva de conteúdo, gerar a lista de URLs alteradas e repetir o envio; o script `urls-indexnow.txt` + trecho Python estão no scratchpad desta sessão.
