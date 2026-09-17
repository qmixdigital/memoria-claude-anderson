---
name: cluster-tratamento-gratuito-caps-seo
description: "Cluster SEO aditivo /tratamento-gratuito (hub + localizador CAPS + páginas de cidade) sobre os 150 CAPS já no banco — Fase 1 no ar, Fase 2 pausada aguardando indexação"
metadata: 
  node_type: memory
  type: project
  originSessionId: fab07a3e-8707-4a23-979e-3bf26cd09b20
  modified: 2026-07-28T17:29:19.327Z
---

Cluster SEO **aditivo** para capturar o funil de tratamento gratuito pelo SUS (validado no GSC: "caps" = 76 mil impr/mês pos ~6,9; "remédio para parar de beber" = 13,4 mil impr pos ~9).

**Decisão de arquitetura (ADAPTADA do briefing, jul/2026):** o briefing original assumia greenfield nacional (27 UFs, JSON do CNES, SSG sem banco, Bun). A realidade: site é **100% SP** e os **150 CAPS já são "clínicas" no banco** (31% das 483), cada um com página em `/{citySlug}/{slug}` já ranqueando. Então NÃO duplicar: o cluster é **DB-driven** (helper `src/lib/caps.ts`, filtra clinics com "caps"), **pnpm** (não Bun), e agrega/linka as páginas existentes.

**Fase 1 (NO AR):**
- `/tratamento-gratuito/` (hub), `/tratamento-gratuito/caps/` (localizador: filtro client `caps-city-filter.tsx` + links server-rendered), `/tratamento-gratuito/caps/[citySlug]/` (SSG via generateStaticParams, ~50 cidades, lista unidades → linka `/{citySlug}/{slug}`).
- Componentes em `src/components/tratamento-gratuito/` (crisis-help obrigatório, city-filter). Schema FAQPage/ItemList(MedicalClinic)/BreadcrumbList. Sitemap unificado (não separado). Fonte CNES/DATASUS citada.
- Footer linka hub + localizador. 10 posts de maior tráfego receberam 1 link contextual cada (âncoras variadas, no `content` do DB).
- `getAllCaps` tem try/catch → retorna [] (build local sem DB não quebra; servidor com DB pré-renderiza real).

**PAUSA (critério de parada do briefing):** monitorar Search Console 2-3 semanas. Só iniciar Fase 2 se indexação/posições das páginas antigas do blog NÃO caírem.

**CTR + on-page dos 150 CAPS (FEITO):** títulos/meta reescritos no `generateMetadata` do `[clinicSlug]` (detecta CAPS: "Telefone e Endereço" só quando há telefone, senão "Endereço e Como Chegar", title-case, "gratuito pelo SUS"). Perfil adaptado no `clinic-profile.tsx` via prop `isCaps` (badge "Serviço público gratuito do SUS", sem WhatsApp, "Como funciona o atendimento" no lugar de "Tipos de Internação").

**DADOS DOS CAPS — RESOLVIDO via CNES (jul/2026):** telefone original era placeholder (102 unidades c/ mesmo número). Enriquecido pela **API de Dados Abertos do CNES** (`apidadosabertos.saude.gov.br/cnes/estabelecimentos?codigo_municipio=<IBGE 6 díg>&codigo_tipo_unidade=70`; tipo 70 = CAPS). Match por nome+modalidade+bairro com trava de confiança. Resultado: **144/150 com telefone real, todos distintos** (6 sem, pois o CNES não tem). `whatsapp` segue NULL em todos (CAPS não usam). Script protótipo em `scratchpad/enrich_caps.py` (usa IBGE API p/ códigos: código IBGE tem 7 díg, CNES usa os 6 primeiros; API do IBGE responde gzip). O CNES também traz email/CEP/lat-lng se precisar depois.

**Fase 2 (PENDENTE):** telefones reais via CNES; medicamentos `/tratamento-gratuito/medicamentos/` (verificar cada princípio ativo na RENAME antes de publicar); expandir CAPS via CNES para unidades NÃO no banco. **Fase 3:** artigos editoriais (1-2/semana).
