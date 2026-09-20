---
name: qmix-ahrefs-auditoria-2026-09
description: "Auditoria Ahrefs de 18/09/2026 do qmix.com.br + ferramentas; o que foi corrigido (links para 301, OG, metas) e o que ficou por decisão (portais órfãos, 3xx normais)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-19T00:21:14.291Z
---

Exports do Ahrefs Site Audit (crawl de 01/09/2026) lidos em 18/09/2026 (`D:/tmp/ahrefs.py` lê os CSV em UTF-16/TSV).

**Corrigido no mesmo dia:**
- 641 páginas com link interno para URL que redireciona. Causas: item "Ferramentas SEO" do HeaderNav apontava para
  `/ferramentas` (301 para o subdomínio) em 565 páginas → agora `https://ferramentas.qmix.com.br/`; nas ferramentas,
  400 `href="/ferramentas/<slug>"` e JSON-LD `${SITE_URL}/ferramentas/...` viraram `/<slug>` (o middleware do subdomínio
  serve `/<slug>` direto); 66 artigos do blog tinham `/comprar-backlinks/` com barra final ou `/blog/guest-post`
  (→ `/comprar-guest-post`) no Lexical, corrigidos por regex no banco (backup em `backups/artigos-links-301-*.json`).
- Open Graph incompleto em 87 páginas: faltavam `og:type`, `og:site_name` e `og:locale` nas 85 ferramentas e `og:type`
  em 6 páginas institucionais. O Next NÃO faz merge profundo de `openGraph` entre layouts, então cada layout precisa
  declarar `type/siteName/locale` (feito por regex em 90 arquivos).
- 9 meta descriptions das ferramentas acima de 160 caracteres reescritas (140 a 160).
- Link externo morto em `7-motivos-para-comprar-backlinks` (ghostmarketing.co.uk 404): o script de remoção não achou o
  nó (url pode estar com variação); conferir manualmente no admin.

**Não mexido, por decisão ou por ser normal:**
- 387 "páginas órfãs" = fichas de portal `/<slug>`: estão no sitemap e sem link interno DE PROPÓSITO (lista fica atrás
  do login, regra dos portais não expostos). O Google as descobre pelo sitemap.
- 3xx: www→raiz, http→https, barra final, `/ferramentas/*` do domínio principal → subdomínio. Redirecionamentos
  corretos; o Ahrefs só lista.
- `mercadohoje.uai.com.br` (ficha ativa) deu 404 no crawl do Ahrefs mas responde 200 hoje.
- "Páginas redirecionadas sem inlink" (numero-aleatorio-1-a-N): dado velho do crawl; hoje são 200.

**How to apply:** ao criar link interno para ferramentas a partir do site, usar sempre o host completo
`https://ferramentas.qmix.com.br/<slug>`; dentro das ferramentas, `/<slug>`. Ao criar layout de ferramenta, copiar
o bloco `openGraph` completo com `type: 'website', siteName, locale`.
