---
name: project_context
description: Contexto geral do projeto consultaplacabrasil.com — stack, arquitetura, módulo de notícias
type: project
---

## Projeto: consultaplacabrasil.com

**Stack:** Next.js (App Router), TypeScript, Drizzle ORM + PostgreSQL, Tailwind CSS, hospedado na Vercel.

**Módulo de Notícias (auto-geradas por IA):**
- Pipeline: RSS feeds → dedup → DeepSeek V3 (reescrita) → salva no banco como `draft`
- Cron: `/api/cron/noticias` — executa 1 artigo por vez para evitar timeout Vercel
- Categorias configuradas na tabela `noticias_config`: detran, recalls, mercado-usados, legislacao, multas
- Artigos ficam em `draft` e precisam de aprovação manual no admin para virar `published`
- Tabela principal: `noticias` em `src/lib/db/schema.ts`
- Pipeline de geração em `src/lib/noticias/`

**Sitemap:**
- `src/app/sitemap.ts` — sitemap regular (inclui notícias)
- Blog (posts antigos) removido do sitemap por problema de canonical CSR
- Não existe Google News Sitemap ainda

**Why:** Imagens automáticas via Pexels API estão sendo implementadas para habilitar Google News Sitemap e melhorar CTR no Google Discover.
