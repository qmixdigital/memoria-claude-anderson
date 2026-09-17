---
name: cache-css-hash-cloudflare-pages
description: No Cloudflare Pages, CSS e JS com nome fixo e Cache-Control imutavel ficam presos na borda apos deploy; usar hash no nome do arquivo
metadata:
  type: feedback
---

Em 11/09/2026 o deploy novo do eletricistasemgoiania.com.br saiu com HTML novo mas a borda da Cloudflare seguiu servindo o styles.css ANTIGO (HIT, Cache-Control public max-age=2592000 immutable, herdado do _headers antigo). A pagina apareceu sem layout e o Anderson viu "bem feio". Purge da zona nao basta se o nome do arquivo nao muda, porque o navegador dele tambem guardou o imutavel.

**Why:** o _headers marcava /*.css como immutable por 30 dias; o deploy do Pages nao invalida o cache da zona custom.
**How to apply:** o build.py do projeto grava styles.<hash>.css e script.<hash>.js e o _headers so marca imutavel esses padroes; HTML fica max-age=0. Em qualquer site estatico no Pages, nunca marcar asset de nome fixo como immutable. Depois de deploy que muda CSS, rodar `python d:/SISTEMAS/Cloudflare/cf_purge.py DOMINIO`.
