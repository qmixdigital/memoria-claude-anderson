---
name: gsc-migracao-abril-2026
description: A migração WordPress para Next.js (abril/2026) zerou as páginas de maior tráfego; 3 artigos foram perdidos e 10 pilares caíram a zero. Base do plano de conteúdo de set/2026.
metadata:
  type: project
---

Análise do Search Console em 11/09/2026 (16 meses, 23.924 pares query+página via API na VPS, script em scratchpad `gsc-full.mjs`):

**Fato central:** todas as páginas informacionais de maior tráfego caíram para ~0 impressões em abril/2026, mês da migração para Next.js. Exemplos (impressões/mês antes → depois): barriga começa a crescer 11-15 mil → 30; tendão do ombro rompido 6-9 mil → 100; rybelsus 5-8 mil → 15; síndrome do intestino irritável 4 mil → 0; nutricionista unimed goiânia 6-9 mil → 1,3 mil. As URLs legadas foram rastreadas em 07-10/04/2026 como "Crawled, currently not indexed" (404 na época, antes do middleware de redirect), e as versões `/materia/` estão indexadas mas sem ranking: conteúdo migrado sem H2 (625 de 637) e mais curto (300-700 palavras onde o original tinha 10-16 seções com âncoras).

**Perdidos de vez (não existem no banco em nenhum status):** `depoimentos-de-pessoas-que-colocaram-protese-no-joelho` (41 mil impr, p5.8), `depoimentos-de-pessoas-que-fizeram-cirurgia-de-quadril` (38 mil, p4.2), `depoimentos-de-pessoas-que-fizeram-cirurgia-da-coluna-cervical` (34 mil, p4.7). Recriar com os mesmos slugs (o middleware já redireciona a URL antiga).

**Convênio é o maior cluster comercial:** 229 queries, 135 mil impressões; "nutricionista unimed goiânia" sozinho 51 mil impr / 538 cliques em 16 m.

**Why:** explica a queda de 735 → 434 cliques/28 d e orienta o que publicar: primeiro reconstruir, depois criar.

**How to apply:** ver [[pendencias-seo-2026-09]] (linkagem) e usar [[importar-materia-markdown]] para republicar com H2/FAQ mantendo o slug (`--atualizar`). Redirects legados (/nutrologia, /category/x, /tipos-de-profissionais/x, /estados/goias, /mais-profissionais/x, /tag, /blog, /edicao-*) entraram no middleware em 11/09/2026.
