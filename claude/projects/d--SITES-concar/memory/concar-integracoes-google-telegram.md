---
name: concar-integracoes-google-telegram
description: Concar — integrações Telegram (bot de avisos) e Google (GA4/Search Console); tokens e o que falta
metadata: 
  node_type: memory
  type: project
  originSessionId: 24ee2264-5b12-4716-bf06-61ee77213ed9
---

Integrações configuradas em 2026-06-11 (envs setados no Coolify via API; cuidado: POST cria entrada NOVA — pra atualizar um env existente use DELETE da antiga + POST, e confira duplicatas listando `/api/v1/applications/{uuid}/envs`).

**Telegram (bot de avisos do site)** — ✅ no ar. Bot `@concar_avisos_bot`. Token em `C:\Users\User\telegram_concar_token.txt` (local, fora do repo) e no Coolify (`TELEGRAM_BOT_TOKEN`). `TELEGRAM_CHAT_ID` aceita vários IDs por vírgula; atual = `<<REMOVIDO>>` (Anderson @qmixdigital) + `5996383932` (Lucas Ayala, o sócio/dono da VPS). Avisa: pedido, pagamento, reembolso, ticket, resposta de ticket, cadastro. Código: `src/lib/telegram.ts` + hooks em `/api/orders`, webhook asaas, `/api/suporte(+responder)`, `/api/auth/register`. Pra centralizar em grupo: criar grupo, add bot, pegar ID `-100...` via getUpdates.

**Google Analytics 4** — tracking ✅ no ar (`NEXT_PUBLIC_GA4_ID=G-JQ7F9NJKBT`, build-time). Dashboard admin `/admin/analytics` (Data API, `GA4_PROPERTY_ID=538777492`) pronto mas **pendente**: o service account precisa ser aceito como Leitor na propriedade.

**Google Search Console** — dashboard `/admin/search-console` (`GSC_SITE_URL=sc-domain:concar.com.br`) pronto, API ativada, **pendente** o mesmo grant.

**Service account Google** (compartilhado GA+GSC): `concar-analytics@concar-499120.iam.gserviceaccount.com`, JSON em `GA_SERVICE_ACCOUNT_JSON` (Coolify) e no Desktop. **Autentica OK** (testado) mas o Google **recusa adicioná-lo como usuário** ("não corresponde a uma Conta do Google") — é propagação de SA novo (conta GA é Gmail comum, sem política de Workspace). Quando o Google aceitar, os dois dashboards ligam na hora (só restart). Auth compartilhada em `src/lib/google-auth.ts`.

Ver [[concar-infra-parceiro]] e [[concar-precos-e-combos]].
