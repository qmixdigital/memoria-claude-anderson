---
name: FETH Diretório — visão geral do projeto
description: Site de diretório de Teste IPTV concorrente do lepur, mesmo nicho mas com identidade visual distinta (Warm Charcoal + Sage), 116 páginas via programmatic SEO, build OK e pronto para deploy Cloudflare Pages
type: project
originSessionId: 2cdd5b0b-c381-4a35-b35e-af61ba73c7f6
---
**Projeto FETH Diretório** — diretório de teste IPTV em `D:\SITES\feth.ggf.br`, domínio `https://www.feth.ggf.br`.

**Why:** Concorrente direto do lepur (`D:\SITES\lepur`), mesmo nicho IPTV, mesmo SEO Playbook completo, mas marca/cliente diferente.

**How to apply:**
- Stack: Next.js 16 + Tailwind v4 + SSG export + Cloudflare Pages (mesma do lepur)
- Tema: Warm Charcoal + Sage Green (`#2A2622` base, `#87A96B` sage, `#D4925A` terracota) — oposto do Midnight Gold do lepur
- Hero split (texto esq + TV mockup CSS-only com canais flutuantes dir) — não centralizado/mosaico como lepur
- Ranking bento 3-col (top 3 cards grandes + 6 médios + 1 last full-width) — não linear como lepur
- 116 HTML pages buildados: 1 home + 10 entidades + 20 artigos + 30 cidades + 50 combos + 2 legais + 3 utilitárias
- Conteúdo derivado da estrutura do lepur com FETH branding (sed mass replace + reescrita do hero/ranking)
- 377 arquivos no out/ (sob limite Cloudflare 1000): cleanup remove __next.*.txt e __PAGE__.txt mas mantém JS chunks e RSC payloads de root
- Imagens: og-image.webp (warm vintage TV) gerada via Runware; demais imagens herdadas do lepur (logos plataformas)

**Spec:** `D:\SITES\feth.ggf.br\docs\superpowers\specs\2026-04-15-feth-diretorio-design.md`

**Build/deploy:**
- `npm run build` (SSG export, output em `out/`)
- Cleanup: `cd out && find . -name "__next*.txt" -delete && find . -name "__PAGE__.txt" -delete && find . -type d -empty -delete`
- Final: 377 arquivos, 18MB, deploy direto na Cloudflare Pages
