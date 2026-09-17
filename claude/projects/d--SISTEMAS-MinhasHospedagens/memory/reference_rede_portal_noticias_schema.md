---
name: reference_rede_portal_noticias_schema
description: "Rede QMIX convertida de \"blog de conteúdo\" para portal de notícias em 04/08/2026 - NewsArticle, publisher NewsMediaOrganization e /news-sitemap.xml próprio (Rank Math Pro não existe em nenhum site)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-04T17:55:33.295Z
---

Em 04/08/2026 os 91 sites da rede (clientes excluídos, ver [[feedback_sites_clientes_rede]]) passaram a ser marcados como veículo de notícias. Antes: 31 sites como `BlogPosting`/`Article`, 32 com SEOPress **sem schema de artigo nenhum** (só breadcrumb) e 9 sem plugin de SEO — 72 de 104 não eram lidos como notícia, apesar de 68 publicarem diariamente.

**O que foi feito:**
1. Rank Math (67 sites): `pt_post_default_article_type=NewsArticle` + `knowledgegraph_type=company` + nome + logo (custom_logo → site_icon → nenhum). Nativo e reversível pelo painel.
2. mu-plugin `qmix-news-portal.php` (91 sites, fonte em `D:\SISTEMAS\MinhasHospedagens\scripts\`): emite `NewsArticle` **só onde o plugin de SEO não emite nenhum** (guarda por `class_exists('RankMath')` + snippet=article, evita schema duplicado), converte `Organization` → `NewsMediaOrganization` no grafo do Rank Math via filtro `rank_math/json_ld`, e serve `/news-sitemap.xml`.
3. O sitemap é servido por hook `parse_request` comparando `REQUEST_URI` — **sem rewrite rule**, portanto sem `flush_rewrite_rules` em massa. Janela de 48h, limite 1000 URLs, namespace `sitemap-news/0.9`. Também injeta a linha `Sitemap:` no robots.txt.

**ARMADILHA que motivou o item 3:** o módulo *News Sitemap* do Rank Math é recurso **Pro**, e nenhum site da rede tem Pro. O módulo aparecia "ativo" em 16 sites e não gerava nada — vários `robots.txt` anunciavam um `/news-sitemap.xml` que dava **404**. Não adianta ligar o módulo; o sitemap tem que vir do mu-plugin.

**Armadilha de operação:** o script de opções nativas rodou primeiro sem a lista de exclusão e alterou `itacaiugo.com.br` (cliente); foi revertido para `BlogPosting`/`person`/sem logo. Todo script de rede precisa da guarda de clientes ANTES do primeiro loop.

Remoção: apagar o mu-plugin e purgar cache. Reversão do item 1: repor `pt_post_default_article_type` e `knowledgegraph_type` no `rank-math-options-titles`.
