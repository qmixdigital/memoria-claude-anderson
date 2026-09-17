---
name: cluster-drogas-tipos-efeitos
description: "Topic cluster SEO \"drogas\" (tipos + efeitos) no blog — 2 pilares + 7 satélites por droga, todos no ar"
metadata: 
  node_type: memory
  type: project
  originSessionId: fab07a3e-8707-4a23-979e-3bf26cd09b20
  modified: 2026-07-28T22:45:37.491Z
---

Topic cluster de SEO sobre **drogas** no blog do [[diretorio-clinicas]], criado 28/jul/2026 a partir de gaps do GSC ("o que são drogas" 2,9mil, "tipos de drogas" 1mil, "drogas efeitos" etc.). Publicado via [[blog-publish-workflow]]. Todos no ar, no sitemap, IndexNow disparado.

**2 PILARES:**
- `/blog/tipos-de-drogas` — "O Que São Drogas? Tipos, Nomes e Classificação" (hub; tabela de 12 drogas + nomes populares; seção "Guias por droga" que linka os 7 satélites).
- `/blog/efeitos-das-drogas-no-organismo` — "Efeitos das Drogas no Organismo" (cérebro, sistema nervoso, corpo, sociedade; tabela por tipo).
Os dois pilares se linkam mutuamente.

**7 SATÉLITES** (cada um linka de volta aos 2 pilares): `/blog/crack-droga`, `/blog/maconha-efeitos` (amplo; distinto de `skank-droga` que é supermaconha), `/blog/lsd-droga`, `/blog/ecstasy-mdma`, `/blog/metanfetamina-cristal`, `/blog/heroina-droga`, `/blog/drogas-licitas`.

**Malha:** pilares ↔ satélites ↔ artigos existentes (o-impacto-das-drogas-no-cerebro, skank-droga, cocaina-tem-cheiro, pupila-dilatada-drogas, olho-de-quem-cheira-po, pedra-de-craque-tem-cheiro, desintoxicar, remedio-para-abstinencia-de-alcool). Links externos: NIDA, gov.br saúde, UNODC, OMS. Categoria de todos: "Drogas e Substâncias" (6f9d75e8-7067-47de-984b-0ef2aad85064).

**Hub de Cocaína (feito):** `/blog/cocaina` — "Cocaína: O Que É, Efeitos e Sinais de Uso", página-hub que agrega os ~10 artigos de cocaína existentes (cocaina-tem-cheiro, como-identificar, como-saber-se-a-pessoa-usou, como-saber-se-po-branco, sintomas, olho, pupila, venvanse-e-cocaina, vacina) + crack + os 2 pilares. Recebe link do pilar tipos-de-drogas (lista Guias) e de 3 sub-artigos (inbound). Slug curto `cocaina` mira o head term.

**Otimização "remédio para parar de beber" (feito):** `remedios-para-parar-de-beber` (9 medicamentos, conteúdo WP legado) estava com ZERO links internos, sem FAQ e sem cobrir singular. Otimização ADITIVA: meta_title/title reforçados ("Remédio Para Parar de Beber: 9 Medicamentos"), intro "Existe remédio para parar de beber?" com variantes (medicamento/deixar de beber/bebida alcoólica), 7 links internos (habitos, como-corpo-reage, remedio-abstinencia-alcool, naltrexona, home, caps) e FAQ com as queries exatas. Visava ~1.900 impressões pos ~8.

**Nota de infra:** o nginx tem rate limit compartilhado (`nextjs_ip` 5r/s burst 15) + fail2ban que dispara 429 em páginas com muitos links (prefetch do Next). Correção proposta (subir limite/isentar prefetch) foi bloqueada pelo classificador e o usuário disse que já conseguiu acessar — deixado como está.
