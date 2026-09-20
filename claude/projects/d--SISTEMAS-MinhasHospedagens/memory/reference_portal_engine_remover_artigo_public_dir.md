---
name: reference_portal_engine_remover_artigo_public_dir
description: Apagar o JSON em data/ e rodar rebuild_site NÃO tira o artigo do ar no portal-engine; a pasta public/<cat>/<slug>/ fica e continua 200 (Pages e nginx); tem que rm -rf a pasta antes do rebuild
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-19T08:59:54.500Z
---

Em 19/09/2026, ao mover m06 e r19 dos portais bloqueados (diariodegoiania, noticiasgoias):
apaguei `data/<slug>.json` e `public/img/<slug>.webp`, rodei `rebuild_site.js` ("pages
deploy ok") e reiniciei o motor, e a URL antiga continuou 200 nos dois hosts (nginx no
srv1166087 e Cloudflare Pages na opengravity), com `cf-cache-status: DYNAMIC`.

**Causa:** o rebuild só escreve; não remove `public/<cat>/<slug>/index.html` de artigo que
saiu do `data/`. O sitemap já vinha sem o slug, mas a página física seguia sendo servida.

**Como remover de verdade:** `rm -rf /srv/portais/<portal>/public/<cat>/<slug>` (ou
`public/<slug>` em portal flat), depois `rebuild_site.js <portal>` (para o Pages subir
sem a pasta) e `systemctl restart portal-engine.service`. Conferir com `curl ?nc=` até dar
404. Complementa [[reference_portal_engine_motor_cache_404]] (o restart resolve o fallback
@motor, não a pasta estática).
