---
name: project_gsc_keyword_bot
description: Automação semanal que puxa keywords do Google Search Console e envia oportunidades de conteúdo no bot do Telegram
metadata: 
  node_type: memory
  type: project
  originSessionId: fab07a3e-8707-4a23-979e-3bf26cd09b20
  modified: 2026-07-31T20:15:11.536Z
---

Automação de sugestão de keywords via **Google Search Console API**, no VPS srv1166087 (mesmo do site — ver [[project_diretorio_clinicas]]).

**Auth:** conta de serviço reusada do Enjai `enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com` (projeto `enjai-493011`), adicionada como Proprietário na propriedade `sc-domain:clinicasrecuperacaosaopaulo.com`. Chave em `/var/www/clinicasrecuperacaosaopaulo/gsc-credentials.json` (chmod 600, no .gitignore). GSC isola dados por propriedade — a mesma conta serve Enjai/Portugal/Clínica sem misturar. API "Google Search Console API" ativada no projeto enjai-493011. Se a chave sumir, gerar nova em console.cloud.google.com/iam-admin/serviceaccounts (só baixa 1x).

**Como funciona:** `scripts/gsc-keywords.sh` (dump slugs+títulos de blog_posts via psql → /tmp/gsc_inventory.txt + páginas estáticas) chama `scripts/gsc-keywords.mjs` (Node puro, JWT RS256 sem libs). Puxa queries dos últimos 28 dias, normaliza (sem acento/stopwords), cruza cobertura com inventário: cobertura ≥0.6 e pos≥4 e impr≥80 → **⬆️ reforçar**; cobertura <0.4 e impr≥40 → **🆕 criar artigo**. Envia top 12 de cada no bot Telegram (chat <<REMOVIDO>>, reusa TELEGRAM_BOT_TOKEN do .env). Prefixo/canal = mesmo bot de [[project_avaliacoes_reviews]] e [[project_comentarios_blog]].

**Cron:** toda segunda 13h UTC (~10h BRT), log em /var/log/gsc-keywords.log.

**Fluxo de trabalho:** usuário recebe a lista no bot → traz pro Claude → Claude decide artigo novo × H2/H3 e escreve (ver [[reference_blog_publish_workflow]]). Deploy sincroniza só `src/`, então scripts/ e gsc-credentials.json persistem entre deploys.
