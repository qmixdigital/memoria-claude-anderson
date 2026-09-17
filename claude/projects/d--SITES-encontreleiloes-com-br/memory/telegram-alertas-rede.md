---
name: telegram-alertas-rede
description: Bot e canal de alertas Telegram da rede QMIX (monitoramento de scrapers/jobs)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 35d4fc21-fa09-41ec-afee-617f9060f67f
---

Alertas de monitoramento da rede vão pelo bot **@qmixdigital_bot** (first_name "OpenGravity").

- Credenciais (token) ficam em `C:\Users\User\Documents\OpenGravity\.env` → variável `TELEGRAM_BOT_TOKEN`. NUNCA imprimir o token em transcript; passar por pipe direto pro `.env` de destino.
- Destino dos alertas: DM do dono → `TELEGRAM_CHAT_ID=<<REMOVIDO>>` (Anderson Alves QMIX, @qmixdigital).
- Envio: `POST https://api.telegram.org/bot<TOKEN>/sendMessage` com `parse_mode: HTML` (Markdown legado quebra com acento/asterisco).

No projeto encontreleiloes.com.br isso virou o job `src/jobs/monitor.ts` (helper `src/lib/notify.ts`), cron PM2 `radar-job-monitor` às 06:15. Alerta só em problema: run FAILED, queda de volume >30% entre sucessos, ou fonte sem sucesso há 48h. Reaproveitável nos outros 100+ sites: mesmo bot/token, mesmo chat (ou um chat/tópico por site).
