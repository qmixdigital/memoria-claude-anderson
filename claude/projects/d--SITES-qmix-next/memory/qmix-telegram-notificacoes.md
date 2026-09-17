---
name: qmix-telegram-notificacoes
description: "Notificações do site qmix-next vão para o Telegram do admin (bot @qmixmarktplace_bot), não só e-mail"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
  modified: 2026-09-01T17:54:34.289Z
---

Desde 2026-09-01 o qmix-next envia notificações de eventos para o **Telegram do admin** (Anderson), via bot **@qmixmarktplace_bot**.

- Config em `.env` do VPS: `TELEGRAM_BOT_TOKEN` e `TELEGRAM_ADMIN_CHAT_ID` (chat_id do Anderson = **<<REMOVIDO>>**). O token é secreto — não versionar.
- Helper: `src/lib/telegram.ts` → `sendTelegramAdmin(text)` (HTML, no-op silencioso se faltar env, nunca lança).
- **Hook central:** `src/lib/app-logger.ts` — `logEvent` encaminha ao Telegram APENAS `tipo` error/warning (evita duplicar com os gatilhos explícitos e cortar ruído como impersonação). Eventos de negócio têm gatilho próprio.
- **Botão de aprovar afiliado no Telegram:** a msg de solicitação vem com botão inline `✅ Aprovar afiliado` (callback_data `aff_ok:<id>`). Webhook em **`src/app/api/webhooks/telegram/route.ts`** (POST) valida `TELEGRAM_WEBHOOK_SECRET` (header `X-Telegram-Bot-Api-Secret-Token`) + confere que `callback_query.from.id` == chat do admin; aprova (`afiliadoAtivo=true, afiliadoSolicitado=true`), envia `emailAfiliadoAprovado`, edita a msg. `telegram.ts` tem `sendTelegramAdmin(text, replyMarkup?)`, `answerCallbackQuery`, `editTelegramMessage`.
- **GOTCHA WAF:** o webhook DEVE ficar sob `/api/webhooks/*` — o Cloudflare tem regra de skip do Super Bot Fight Mode só pra `/webhooks/*` e `/api/webhooks/*`. Fora disso o Telegram leva **403** (bot bloqueado). setWebhook com `secret_token`; conferir `getWebhookInfo` → `last_error_message`.
- **Gatilhos explícitos:** novo pedido e nova pergunta (embutidos em `emailAdminNovoPedido`/`emailAdminNovaPergunta` em `src/lib/emails/admin.ts`), venda paga (`src/app/webhooks/asaas/route.ts`), novo cadastro (`cadastro/actions.ts`), novo ticket (`src/lib/ticket-actions.ts` `criarTicket`), solicitação de afiliado (`api/afiliados/solicitar`), carrinho abandonado (`api/cron/carrinho-abandonado`).
- **E-mails de admin DESLIGADOS:** guard em `enviarEmailComId` (`src/lib/emails/helpers.ts`) pula qualquer envio para `ADMIN_EMAIL` = `qmixdigital@gmail.com`. Tudo que ia pra ele agora só vai pro Telegram. E-mails de cliente/afiliado/publisher intactos.
- Para pegar chat_id de um bot novo: usuário manda /start, depois `getUpdates`. Enviar mensagem: POST `sendMessage` com body JSON UTF-8 (curl -d quebra acento/`\n` — usar python/json).

Afiliados: comissão padrão **10%** (produto sobrepõe afiliado), hold de **15 dias** (cron `afiliados-liberar`) antes de virar saldo. Ver [[portais-url-raiz]].

Link de afiliado: `qmix.com.br/comprar-backlinks?ref=<codigo_indicacao>`. O `codigo_indicacao` é gerado no cadastro (`gerarCodigoIndicacao`: primeiro nome + 4 aleatórios) — cadastro normal e via Google. Contas antigas (81) estavam sem código (link `?ref=` vazio) → **backfill feito em 2026-09-01**. O afiliado personaliza o próprio código no painel (aba Afiliados → "Personalizar") via `POST /api/afiliados/codigo` (valida 4-20 A-Z0-9, palavras reservadas, unicidade case-insensitive; bloqueado em impersonação). Painel abre em aba específica via `/minha-conta?tab=afiliados` (prop `initialTab`). Botão "Ver como afiliado" em `/admin/afiliados` (ativos) usa a mesma impersonação.
