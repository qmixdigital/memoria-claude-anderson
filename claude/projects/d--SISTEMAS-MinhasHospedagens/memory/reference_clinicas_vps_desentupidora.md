---
name: reference_clinicas_vps_desentupidora
description: "VPS clinicas-vps (HestiaCP) e o app Next desentupidora.pro — acesso, deploy, gotchas"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 611c5219-ea2f-4933-b1d7-762f552ee8c8
  modified: 2026-08-11T15:58:00.103Z
---

**clinicas-vps** (HestiaCP, `31.97.162.199`, `ssh clinicas-vps`) hospeda apps **Next.js** (não-WP): `desentupidora-pro` (porta 3008), `clinicas-sp`, `distribuidoras`. Process manager é **PM2** do root (`/root/.pm2`).

- **Conta e vencimento (informado pelo Anderson em 11/08/2026):** conta Hostinger **cesarwalsh097@gmail.com**, **vence em 30/08/2027**. Hostname `srv984283.hstgr.cloud`, IPv6 `2a02:4780:14:82ae::1`, instance id `hvps-740d22ea72688688`, plano **KVM 2** (2 vCPU EPYC 7543P, 8 GB, 96 GB), provisionada em 19/08/2025. Domínios no Hestia: `desentupidora.pro` e `consultaplacabrasil.com`. Em 11/08/2026 estava **praticamente ociosa** (load 0,03, disco 14%) — é o melhor destino livre para apps Next novos, ver [[reference_vps_cliquex_zerada]].

- **Gotcha PM2:** em SSH não-interativo `pm2 ls` vem vazio (daemon novo, PM2_HOME errado). Usar `bash -lc` ou `HOME=/root PM2_HOME=/root/.pm2 pm2 ...`. Nomes das apps nos logs `/root/.pm2/logs/`.
- **desentupidora.pro**: diretório de desentupidoras (Receita Federal/CNAE), **mesma engine do [[reference_setorenergetico_next]]** (Next 16 + Drizzle/Postgres + pnpm). App em `/home/user/web/desentupidora.pro/app`, Cloudflare na frente. 42k empresas / 28 UF / 2.869 cidades / 140 notícias. Backup DB cron 3h30 → `/home/qmix/backups/postgres-desentupidora/`.
- **Deploy:** `cd app && pnpm build && HOME=/root PM2_HOME=/root/.pm2 pm2 reload desentupidora-pro`.
- **DOCS DO REPO SÃO STALE** (cópias do setorenergetico: `DEPLOY.md`, `DIRETORIO.md`, `ecosystem.config.js` citam OpenGravity/porta 3015-3020/`/var/www`). Não seguir. Realidade documentada em `D:\SISTEMAS\MinhasHospedagens\clinicas-vps\ACESSO.md`.
- **Ajustes de qualidade FEITOS (2026-06-10):** helpers `cidadeLabel` (re-acenta via IBGE, `municipios-ibge.ts`) + `tituloEmpresa` (Title-Case) em `src/lib/empresas/utils.ts`, aplicados em cidade/estado/empresa/listagens/home/autocomplete/mapa (display-layer, sem mutar banco); schema CollectionPage/ItemList nas páginas de cidade/estado; títulos das 42k empresas reescritos ("Nome — Desentupidora em Cidade (UF)", ignora meta_title auto-gerado salvo já que 0 empresas são curadas); limpeza do next.config + ecosystem. Diffs em `D:\SISTEMAS\MinhasHospedagens\clinicas-vps\desentupidora-src-ajustes-2026-06-10\`. **Deploy:** PATH do nvm v20.20.2 + `pnpm build` + `pm2 reload` (ver ACESSO.md).
- **SEO Fases 1-3 FEITAS (2026-06-10):** (1) páginas de cidade/estado/segmento com intro única+FAQ(FAQPage schema)+CollectionPage/ItemList+linkagem interna; (2) 42k páginas de empresa com descrição/serviços/FAQ gerados de dados reais + schema LocalBusiness (ignora descricao/meta_title/meta_description salvos que são auto-gerados ruins, exceto empresas reivindicadas); (3) topic cluster bidirecional cidade↔guias(notícias)↔diretório. Componentes: `src/components/seo/FaqSection.tsx`, helpers `cidadeLabel`/`tituloEmpresa`/`estadoComPrep`/`UF_PREP` em utils.ts, `municipios-ibge.ts` (IBGE), `getGuiasDesentupimento`. (4) auditoria SEO (meta length, OG da empresa, og:url, title length via `tituloSeo`); (5) **geocoding** — 41.892/42.012 empresas com lat/lng via centroide IBGE (`centroids.json` + `scripts/geocode-centroids.ts`, bulk via psql `\copy`+temp table porque `unnest(array)` do drizzle estoura params) + jitter determinístico → mapas Leaflet (lazy via IntersectionObserver) nas páginas de cidade/empresa + `geo` no schema LocalBusiness; geocode PRECISO por CEP (BrasilAPI) sob demanda p/ pagas/reivindicadas via `scripts/geocode-precise.ts` + painel PATCH. Detalhe completo em ACESSO.md.
