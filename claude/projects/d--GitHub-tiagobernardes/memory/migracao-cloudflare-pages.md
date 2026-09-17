---
name: migracao-cloudflare-pages
description: "drtiagobernardes.com.br (site + 143 posts do blog) está inteiro no Cloudflare Pages desde 16/09/2026; como publicar, gerar o blog e o que ficou na VPS"
metadata: 
  node_type: memory
  type: project
  originSessionId: 8a58b60f-f60d-44d7-bb9c-3b44a3adf3e5
  modified: 2026-09-16T12:50:51.109Z
---

**Virada feita em 16/09/2026, com autorização do Anderson.** O apex é CNAME para
`drtiagobernardes.pages.dev` (projeto `drtiagobernardes`, conta "Dr. Tiago Bernardes",
account `f5e8c0bf0ca55ddb3d1b80711dd23b8b`, zona `33fbc91ab385e29bd5c2f1294110b776`).
Redirect Rules na borda: `www.` e `blog.` -> apex (`blog.` ainda tem A para a VPS, só
para a regra ter onde disparar). Sitemap único reenviado no Search Console; os três do
WordPress foram removidos de lá.

**WordPress e site antigo APAGADOS da opengravity em 16/09/2026** (vhosts, zonas DNS do
Hestia e banco `qmix_80399`), com autorização do Anderson. Backups apagados também (decisão do Anderson, 16/09): o site vive só no Pages e no
repositório. `blog/dados/wp-export.json` guarda os 143 posts completos (HTML, meta,
categorias, imagem), o bastante para gerar um WordPress novo se o cliente pedir. O mapa de CTA por intenção está em
`blog/dados/cta-intencao.json`.

**Como publicar:** `python gerar_blog.py` (regenera blog, sitemaps, `_redirects`,
`functions/[[path]].js`) e depois `CLOUDFLARE_API_TOKEN=<master> ./deploy-pages.sh`.
Tokens: zona (`cfat_fqXX...`, só DNS) em `D:\SISTEMAS\MinhasHospedagens\MIGRACAO-BLOGS-CLIENTES.md`;
`master` (`cfut_...`) em `D:\SISTEMAS\Cloudflare\contas.json` (Pages, Rulesets, purge).
Artigo novo entra em `blog/dados/wp-export.json` (mesmo formato), nunca mais no WordPress.

**Limites e armadilhas medidos:**
- `_redirects` do Pages aplica só as 100 primeiras regras (a 101ª dá 404, sem aviso do
  wrangler). Os 99 slugs antigos da raiz vivem em `functions/[[path]].js` + `_routes.json`.
- As 143 imagens do WP são copiadas no deploy também para `blog/wp-content/uploads/...`.
- A ferramenta Bash converte `\1` em byte 0x01 dentro de heredoc: regex com backreference
  se escreve com Write/Edit, nunca em heredoc.
- Depois da virada, por ~10 min parte das requisições ainda caía na VPS (domínio `pending`
  no Pages); resolve sozinho, sem purge.
- Ao trocar A por CNAME, apagar só A/AAAA/CNAME: o TXT do Search Console foi apagado
  junto e recriado (`google-site-verification=<<REMOVIDO>>`).

**Why:** blog no Jannah tinha LCP 7,8 s e a VPS oscila. **How to apply:** medir com
[[gsc-service-account]] em outubro; canibalização do cluster de cisto subcondral e
links contextuais nos 50 artigos sem link no corpo são as próximas melhorias.
