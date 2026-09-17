---
name: autolink-portal-engine
description: "Auto-linkagem interna no portal-engine (opengravity), opt-in por site via sites.json, implantada no wtw19 em 14/08/2026"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1c15d1b5-4f6a-4b2e-86d9-fb1e56d41f21
  modified: 2026-08-14T13:16:52.167Z
---

O portal-engine (`/opt/portal-engine/src/render.js` na opengravity) tem função `autoLinkContent` (exportada) que roda dentro de `publishArticle`: injeta links internos na primeira ocorrência natural de termos mapeados. Opt-in por site via `sites.json` → `autoLink: {enabled, maxLinks, map: [{terms, url}], fallback: {pool: [{url, anchors}]}}`. Se nenhum termo casa, anexa parágrafo "Leia também" com 2 links rotacionados por hash do slug.

Regras embutidas: máx N links, 1 por destino, nunca dentro de `<a>` ou headings, nunca para a própria página, pula destinos já linkados. Backup do motor pré-patch: `render.js.bak-20260814`.

Complementos no wtw19: cron `auto-link-retro.js` (diário 04:15, user portais) republica artigos com zero links internos aplicando o autolink (preserva imagem via re-encode base64 e data via scheduled_date); cron `gen-feed.py` (30 em 30 min) regenera o RSS `/feed/`. Ligado só no wtw19; os outros 8 portais não têm `autoLink` no config. Para ativar em outro portal, basta adicionar o bloco `autoLink` no site correspondente do `sites.json` (recarrega sozinho via fs.watchFile, mas o receiver precisa de restart se o render.js mudar).

Detalhe: republicar via `publishArticle` sem `image_base64` APAGA a imagem do artigo (não preserva a anterior) — sempre reenviar a imagem do disco em republicações programáticas.
