---
name: suite-testes-vicio
description: Suíte de testes de autoavaliação de vício (/testes) multi-etapas para engajamento + AdSense; no ar
metadata: 
  node_type: memory
  type: project
  originSessionId: fab07a3e-8707-4a23-979e-3bf26cd09b20
  modified: 2026-07-28T23:21:45.779Z
---

Suíte de **testes de vício** (autoavaliação) no [[diretorio-clinicas]], criada 28/jul/2026. Spec: `docs/superpowers/specs/2026-07-28-testes-vicio-suite-design.md`. Objetivo: engajamento, conversão (CTA clínicas/CAPS), compartilhamento e **receita AdSense** (multi-etapas). No ar.

**7 testes** em `/testes` (hub) + `/testes/[slug]`: `alcoolismo`, `drogas`, `apostas`, `remedios`, `codependencia`, `celular` (nomofobia), `redes-sociais` (internet). 12 perguntas cada (originais, inspiradas em CAGE/AUDIT/PGSI/DAST), escala 0-4, 4 níveis de risco. Adicionar teste = 1 entrada em `TESTS` (rotas/sitemap/hub automáticos). Depressão foi avaliada mas NÃO incluída (fora do foco de vício + mais sensível).

**Arquitetura multi-etapas (para AdSense):** fluxo em páginas reais para o Auto Ads recarregar por etapa — `/testes/[slug]` (intro, INDEXÁVEL, FAQ+WebApplication schema) → `/testes/[slug]/[step]` (3 perguntas/página, **noindex**, navegação HARD via `window.location.assign` p/ carregar anúncios novos) → `/testes/[slug]/resultado` (noindex). ~6 pageviews por teste concluído. Respostas só no navegador (**localStorage** `teste:<slug>`), nada enviado. **Regra AdSense:** máx 3 perguntas/página, conteúdo real por página, sem 1-Q/página nem auto-refresh (evita "conteúdo de baixo valor"/"tráfego inválido"). Steps/resultado noindex para não competir no SEO/thin-content; só hub+intros indexam.

**Peças:** dados em `src/lib/testes/data.ts` (type `TestConfig`, array `TESTS`, `getTest/stepCount/maxScore`, `QUESTIONS_PER_STEP=3`). Componentes client `src/components/testes/{test-step,test-result,test-start}.tsx` (reusam UX do `AddictionQuiz` legado, que permanece no artigo `teste-para-saber-se-sou-dependente-quimico`). Rotas em `src/app/(public)/testes/`. Sitemap: hub + 5 intros (não as etapas). Link "Testes" no footer.

**Linkagem:** 10 artigos de cluster → seu teste (remedios-para-parar-de-beber/quanto-tempo-alcoolatra→alcoolismo; tipos-de-drogas/cocaina→drogas; vicio-em-apostas/como-parar-de-apostar→apostas; naltrexona→remedios; desabafo/meu-marido→codependencia; teste-antigo→hub). IndexNow disparado.

**Fase 2 (não feita):** "receba resultado por e-mail" (captura de lead — precisa DB + Resend + consentimento LGPD); calculadora "quanto o vício custa"; contador de dias de sobriedade.
