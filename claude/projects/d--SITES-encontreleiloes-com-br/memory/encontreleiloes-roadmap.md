---
name: encontreleiloes-roadmap
description: "Roadmap competitivo do encontreleiloes.com.br (vs \"Mapa dos Leilões\" pago) e a fonte-moat PNCP"
metadata: 
  node_type: memory
  type: project
  originSessionId: 35d4fc21-fa09-41ec-afee-617f9060f67f
  modified: 2026-07-28T20:50:54.772Z
---

Diretório de leilões **encontreleiloes.com.br** (Next.js 15 + Prisma + PG, VPS hostinger-vps-srv1166087, `/var/www/radar-leiloes`, PM2 `radar-web`/`radar-web-b`). Concorrente de referência: **"Mapa dos Leilões"** (ferramenta paga, R$ 997/ano) que agrega leilões municipais "escondidos" e mostra agenda por data + por origem (prefeitura, exército, financeira, DETRAN).

Estratégia: ser a versão **gratuita + AdSense, descoberta por SEO**, do que ele cobra.

Roadmap derivado do vídeo do concorrente (jul/2026):
- **P1 — Agenda de leilões** ✅ FEITO. `/calendario` navegável; `/calendario/[date]` lista lotes por dia (fuso America/Sao_Paulo), **veículos E imóveis** (query sem filtro de kind). Usa `auctionDate` (~5.700 veículos + ~1.650 imóveis com data futura).
- **P3 — Moat (leilões municipais)** ✅ FEITO. Fonte = **API oficial do PNCP** (`pncp.gov.br/api/consulta/v1/contratacoes/publicacao`, modalidades 1=Leilão Eletrônico e 13=Presencial; itens em `/api/pncp/v1/orgaos/{cnpj}/compras/{ano}/{seq}/itens`). Pública, sem auth/WAF. Adapter `src/scrapers/adapters/pncp.ts` (`source: PNCP`, `modality: LEILAO_PUBLICO`). ~2.000 leilões/ano, ~1.956 lotes na 1ª carga (veículos+imóveis). Roda no automático via o cron PM2 de `scrape:leiloeiras` (03:30). Só ingere VEÍCULO e IMÓVEL (ignora móveis/sucata). Sem imagem (campo vazio no PNCP).
- **Qualidade PNCP** ✅ FEITO. Portão de qualidade no adapter (`NON_LOT`, `headMeaningful`, `stripTail`, `findBrandInText` multi-palavra em `lib/vehicle.ts`) removeu ~45% de lixo/duplicata: 1.956→**1.347 lotes limpos** (dup 879→204, títulos-lixo ~500→0, marca 41%→61%, **ano 50%→78%** — resolvido SEM PDF). Distribuição real por esfera: municipal 1.203, estadual 133, federal só 11 (órgãos federais usam edital-resumo genérico, poucos têm dado por lote). NÃO fazer PDF-parsing do ano (baixo ROI, o portão já resolveu).
- **P2 — Hubs por origem** ✅ FEITO. `/leilao-de-prefeitura` (nacional + `/[uf]`, dados reais, agora filtra `orgLevel=MUNICIPAL`) + 3 hubs de conteúdo: `/leilao-do-exercito`, `/leilao-de-financeira`, `/leilao-da-receita-federal` (militar/receita deram 0 lotes no PNCP, ficam só conteúdo). **Refino (b) FEITO**: coluna `Listing.orgLevel` (MUNICIPAL/ESTADUAL/FEDERAL) classificada por `src/lib/orgao.ts` (`classifyOrg`) no adapter PNCP; hub `/leilao-do-governo` (índice) + `/leilao-do-governo/[nivel]` estadual(349)/federal(337). Municipal=1270. Backfill via `src/jobs/backfill-orglevel.ts`. Tudo linkado no footer e sitemap.

Automação diária confirmada roda via **PM2 `cron_restart`** (NÃO crontab): caixa 04:00, leiloeiras 03:30 (superbid/mega/emgea/**pncp**), `job:expire` (lastSeenAt>3d → EXPIRED). AdSense já ativo: `pub-3880875536722698`, `/ads.txt` dinâmico + Auto Ads (ver [[telegram-alertas-rede]] para o canal de alertas).
