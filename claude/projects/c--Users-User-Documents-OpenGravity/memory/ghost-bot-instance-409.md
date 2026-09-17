---
name: ghost-bot-instance-409
description: Bot Telegram — 409 Conflict resolvido migrando de long-polling para WEBHOOK
metadata: 
  node_type: memory
  type: project
  originSessionId: 9e3d727b-f10a-4e01-a65f-ff67464848d4
  modified: 2026-07-24T16:14:25.427Z
---

O bot @qmixdigital_bot (id 8726948248) sofria loop eterno de **409 Conflict "terminated by other getUpdates request"**. Causa raiz (confirmada em 2026-07-24): existe uma **segunda instância do bot rodando FORA da VPS** (cloud antigo tipo Render — há comentário "evitar crash no Render" no histórico) usando o **mesmo TELEGRAM_BOT_TOKEN**. Duas instâncias fazendo `getUpdates` (long-polling) brigam → 409 → mensagens recebidas se perdiam (o *enviar* via sendMessage sempre funcionou, o que dava a falsa impressão de que estava OK).

Não dava pra revogar o token (várias ferramentas usam o mesmo token pra ENVIAR dados; revogar quebraria todas) nem pra achar/matar o fantasma (é externo, não está em nenhum host SSH conhecido).

**SOLUÇÃO APLICADA (2026-07-24): modo WEBHOOK.** Com webhook ativo, o Telegram empurra os updates pra nossa URL e qualquer `getUpdates` externo passa a falhar sem roubar nossos updates — o fantasma fica inofensivo automaticamente.

Como ficou montado:
- Código: `startBot()` em `src/bot.ts` usa webhook se `TELEGRAM_WEBHOOK_URL` + `TELEGRAM_WEBHOOK_SECRET` existirem no `.env` (senão cai no polling legado). `src/index.ts` roteia POST no path secreto pro `webhookCallback(bot, 'http', { secretToken })`; demais rotas = health check. `src/config.ts` expõe `webhookUrl`/`webhookSecret`.
- `.env` (VPS `/opt/opengravity/.env`): `TELEGRAM_WEBHOOK_URL="https://revistamsaude.com.br/tgwh/<hash>"` e `TELEGRAM_WEBHOOK_SECRET="<hash>"`.
- Nginx: include isolado `/home/qmix/conf/web/revistamsaude.com.br/nginx.ssl.conf_telegram` com `location /tgwh/ { proxy_pass http://127.0.0.1:3000; }` (método custom-include do HestiaCP, não altera o site). O bot escuta em `*:3000`.
- Domínio revistamsaude.com.br aponta DIRETO pra 77.37.69.175 (sem Cloudflare), cert LE válido.

Verificação OK: `getWebhookInfo` retorna url + ip 77.37.69.175 + 0 erros; `curl` na rota retorna "OpenGravity is alive!".

IMPORTANTE p/ deploy futuro: manter as vars de webhook no `.env` — se sumirem, o bot volta pro polling e o 409 retorna. O classificador do harness bloqueia mudanças no nginx da VPS pela IA; a parte de nginx precisa ser feita pelo usuário. Ver [[pm2-watchdog-resurrect]].

Adicionar usuário: mensagem de "Acesso negado" mostra `🆔 Seu ID: XXXX` (src/middleware/whitelist.ts); ID entra em `TELEGRAM_ALLOWED_USER_IDS` no .env. Guilherme (6615926271) já foi adicionado.
