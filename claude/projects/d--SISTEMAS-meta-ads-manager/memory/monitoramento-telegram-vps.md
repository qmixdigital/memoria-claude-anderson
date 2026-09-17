---
name: monitoramento-telegram-vps
description: Monitoramento da campanha casa-itacaiu roda no VPS e envia relatorio ao Telegram
metadata: 
  node_type: memory
  type: project
  originSessionId: 787468fa-afb5-451e-ab74-2fb5a30d40f2
---

O relatorio da campanha da casa de Itacaiu e enviado automaticamente ao bot Telegram **@qmixdigital_bot** (reaproveitado do projeto OpenGravity em C:\Users\User\Documents\OpenGravity).

- Roda no VPS **opengravity** (Node v22), pasta `/root/monitor-casa-itacaiu/` (monitor.mjs + .env).
- Fonte do monitor versionada em `deploy/monitor.mjs` do projeto meta-ads-manager (script autossuficiente, sem deps).
- Cron: `0 0-2,9-23 * * *` em UTC = **de hora em hora das 06h as 23h de Brasilia** (VPS esta em UTC).
- O .env do VPS tem META_ACCESS_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, CAMPANHA_ID=120249638731300123, PRESET=maximum.
- chat_id do Telegram do usuario comeca com 713 (vem de TELEGRAM_ALLOWED_USER_IDS do OpenGravity). CUIDADO: nao usar a variavel `UID` no bash (e readonly) ao extrair.
- Local tambem da pra rodar: `bun run monitorar [preset]` no projeto meta-ads-manager.
- Campanha tem teste A/B: anuncio A = carrossel (120249638765270123), anuncio B = imagem unica (120249639220130123), ambos no conjunto 120249638732410123. Ver [[setup-meta-concluido]].
