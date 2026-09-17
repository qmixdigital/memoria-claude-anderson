---
name: reference_portal_engine_publish_articles
description: "Como criar/publicar artigos direto num portal portal-engine (ex.: diariodegoiania) via script Node usando publishArticle/slugify/rebuildIndexes/pingIndexNow do motor, em vez de mandar pela plataforma QMIX/Antônio."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8d9dd106-0331-4431-8d43-88e3c9feee05
---

Para **gerar e publicar artigos eu mesmo** num portal portal-engine (não-WP, srv1166087), sem depender da plataforma QMIX/Antônio: script Node que usa as funções exportadas de `/opt/portal-engine/src/render.js` → `{ slugify, publishArticle, rebuildIndexes, pingIndexNow }`. Ver motor em [[reference_portal_engine_html]].

**Fatos do motor (confirmados 2026-06-22):**
- `sites.json` é OBJETO `{ sitesRoot, port, host, sites:[...], resendKey }` (NÃO array). `cfg = JSON.parse(sites.json)`; `site = cfg.sites.find(s=>s.slug===SLUG)`.
- `publishArticle(cfg, site, payload)` — payload: `{ title, content (HTML), excerpt, categories, author, status:'publish', date }`. **O slug vem de `slugify(payload.title)`** (não aceita slug custom). `categories` aceita string nome → vira `{name, slug:slugify(name)}`; também aceita id numérico mapeado por `site.categoryMap`. É idempotente por slug (republica = atualiza). Retorna `{slug, url, status}`.
- `slugify`: NFD→sem acento, lower, `&`→' e ', `[^a-z0-9]+`→'-', trim, colapsa '-', corta 80 chars.
- URL: `site.flatUrl` ? `/slug/` : `/<catSlug>/<slug>/`. **diariodegoiania NÃO é flat** → `/teste-iptv/<slug>/`.
- Depois de publicar, chamar `rebuildIndexes(cfg, site)` (regenera home/categorias/sitemap). `pingIndexNow(site, urls)` notifica IndexNow (precisa `site.indexnowKey` + keyfile servido).
- Rodar como user dono dos dados: `runuser -u portais -- node /tmp/script.js` (dados em `/srv/portais/<slug>/data/*.json`).

**Técnica p/ linkar artigos do mesmo lote entre si:** definir array com `key`+`title`, montar `slugMap[key]=slugify(title)`, e no HTML usar token tipo `@@KEY:outro@@` que o script troca por `/<cat>/<slug>/` — garante slug correto sem adivinhar.

**diariodegoiania — categoria "Teste IPTV" criada (2026-06-22):** adicionada ao `categoryMap` como **ID 7** (`"7":"Teste IPTV"`, backup `sites.json.bak-iptv-20260622`), então a plataforma QMIX pode enviar pra ela com categoria 7. 12 artigos publicados em `/teste-iptv/` (keywords "teste IPTV iPhone/celular/email/4h/4K/8h/24h/TV Samsung/smart/Samsung/online/M3U"). Categorias reais do portal: Notícias(noticias), Entretenimento(entretenimento), Insights(insights), Saúde(saude), Marketing(marketing) — Casa(6) sem artigos.
