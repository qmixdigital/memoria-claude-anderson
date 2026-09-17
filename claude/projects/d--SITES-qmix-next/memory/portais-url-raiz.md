---
name: portais-url-raiz
description: "Portais/produtos servidos na raiz /<slug>, não mais em /comprar-backlinks/<slug>"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
  modified: 2026-08-31T22:38:01.623Z
---

Desde 2026-08-30, as páginas de portal/produto vivem na **raiz** `qmix.com.br/<slug>` (ex: `/patosnoticias`), não mais em `/comprar-backlinks/<slug>`.

- Rota: `src/app/(frontend)/[slug]/page.tsx` (movida de `comprar-backlinks/[slug]`). Tem `generateStaticParams` (SSG dos ativos) + `revalidate=3600` + dynamicParams (produto novo aparece na hora). `getProduto` filtra `status='ativo'`; inválido → `notFound()`.
- 301 catch-all em `next.config.ts`: `/comprar-backlinks/:slug` → `/:slug` (single-hop), DEPOIS dos redirects específicos e dos `inativosRedirects` (inativos → `/comprar-backlinks`). `ibahia` → `/bahianoticias`.
- `/comprar-backlinks` (catálogo) continua existindo. Todos os links internos e o sitemap usam `/<slug>` (troca feita em ~22 arquivos: catálogo, busca, favoritos, carrinho, minha-conta, sitemap, merchant-feed, admin, emails).
- **Trava de namespace:** um slug de portal não pode colidir com rota estática do site (blog, qmix, comprar-backlinks, contato, servicos, pacotes-de-backlinks, etc.) — a rota estática vence.
- **Soft-404 conhecido (app-wide, pré-existente):** `notFound()` deste app devolve HTTP **200** com página de "não encontrado" que tem `noindex` (vale p/ blog, pacotes e produtos). Google não indexa (noindex), mas o status não é 404 real. Corrigir é tarefa app-wide separada, com risco; ficou adiado.
