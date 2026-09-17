---
name: ferramentas-subdominio
description: Como o subdomínio ferramentas.qmix.com.br serve as 55 tools e os 301 cross-domain
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
  modified: 2026-08-27T12:09:07.973Z
---

As ferramentas SEO grátis (55 tools, ~30k linhas) foram tiradas de qmix.com.br (tese de topic-dilution do E-E-A-T que NÃO deu resultado) e restauradas em **ferramentas.qmix.com.br** em 2026-08-12, em **raiz limpa** (ex: `ferramentas.qmix.com.br/gerador-de-senhas`).

**Chrome isolado (2026-08-27):** as ferramentas foram movidas de `(frontend)/ferramentas` para o route group próprio **`src/app/(tools)/ferramentas`**, com `(tools)/layout.tsx` renderizando `ToolsHeader`+`ToolsFooter` (em `(frontend)/components/`) — SEM HeaderNav/FooterSection/WhatsAppButton/ConsumerAlert da QMIX. Motivo: evitar leads fora do perfil; visitantes das tools não têm caminho de contato com a agência. Feito por route group (não `headers()` no layout) pra NÃO tornar o site dinâmico e preservar o SSG do blog. Todos os links de conteúdo pra QMIX (`/qmix`, `/contato`, `/comprar-*`, `/blog`, etc.) foram de-linkados (viram `<span>`) em ~71 tool pages. Único resquício QMIX: os links de política no banner `CookieConsent` (legais). BannerEnjai (afiliado externo enjai.com.br) foi mantido.

**Arquitetura (mesmo app qmix-next serve o subdomínio):**
- `src/middleware.ts`: se `host === 'ferramentas.qmix.com.br'`: `/` → reescreve `/ferramentas` (índice); `/slug` que existe em `FERRAMENTAS_SET` (importado de tool-slugs) → reescreve `/ferramentas/slug`; **qualquer outra rota (header/rodapé/CTA) → 301 para `https://qmix.com.br{path}`**. Isso conserta o bug em que links do menu compartilhado (comprar-backlinks, blog, etc.) davam 404 no subdomínio. Matcher ampliado para todas as rotas.
- `src/app/(frontend)/ferramentas/layout.tsx`: `metadataBase = https://ferramentas.qmix.com.br` → todos os 56 canonicals (relativos `/tool`) resolvem para o subdomínio.
- `robots.ts` e `sitemap.ts` são **host-aware** (leem `headers()`): no subdomínio devolvem robots próprio + sitemap com as 56 URLs (`src/app/(frontend)/ferramentas/tool-slugs.ts`). O sitemap principal NÃO lista mais `/ferramentas`.
- nginx `/etc/nginx/conf.d/qmix.conf`: `ferramentas.qmix.com.br` adicionado ao `server_name` (cert wildcard `*.qmix.com.br` já cobre). DNS A proxied no Cloudflare.
- `next.config.ts`: `/ferramentas/:tool*` → 301 `https://ferramentas.qmix.com.br/:tool*` (catch-all; substituiu os ~40 redirects antigos que iam pro qmixdigital).

**301 cross-domain (crítico p/ não duplicar conteúdo):** qmixdigital.com.br (WordPress/LiteSpeed na conta [[Hostinger-anderson-gna]], `ssh hostinger-anderson-gna`, `~/domains/qmixdigital.com.br/public_html/.htaccess`) tem bloco `# BEGIN ferramentas-migradas-para-subdominio` no topo: `RewriteRule ^ferramentas/(.+)$ https://ferramentas.qmix.com.br/$1 [R=301,L]`. Backup `.htaccess.bak-20260812`.

Chave IndexNow: `qmix2026indexnow` (em `public/qmix2026indexnow.txt`, servida nos dois hosts). Deploy padrão qmix-next (build gate + `pm2 reload`). Pendente: usuário adicionar `ferramentas.qmix.com.br` como propriedade no Google Search Console + submeter o sitemap.
