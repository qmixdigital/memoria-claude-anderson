---
name: agenda-telegram-bot
description: Bot @agendaqmix_bot (audio/texto -> Google Calendar) em d:\SISTEMAS\agenda-telegram, roda na opengravity porta 3080 atras de api-indexation.qmix.com.br/agenda-bot
metadata:
  type: project
---

Criado em 16/09/2026. Codigo em `d:\SISTEMAS\agenda-telegram` (TypeScript, grammY,
@anthropic-ai/sdk com `messages.parse` + Zod 4, googleapis). Producao: opengravity,
`/var/www/agenda-telegram`, PM2 `agenda-telegram`, porta 3080, publicado como
location `/agenda-bot/` dentro do server da `api-indexation.qmix.com.br` (evitou
mexer em DNS). Deploy: `./deploy.sh` (tar por ssh, sem rsync no Windows).

Chat autorizado: <<REMOVIDO>> (Anderson). Token do bot no cofre,
entrada `telegram-agenda-bot` (variavel `TELEGRAM_AGENDA_BOT`, via `cofre_run`).
Service account usada: `qmix-seo@qmix-diversos.iam.gserviceaccount.com` (cofre,
entrada `qmix-diversos-f14b156e6b10`, tipo arquivo).

**Why:** Anderson quer mandar audio na rua e cadastrar tarefa na agenda com titulo
e descricao. Fluxo com confirmacao por botao porque transcricao de rua erra.

**How to apply:** a `ANTHROPIC_API_KEY` do ambiente Windows estava INVALIDA em
16/09/2026 (api devolve authentication_error); nao confiar nela, pedir chave.
Calendar API precisava ser ativada no projeto qmix-diversos e a agenda
compartilhada com a SA. Groq (whisper-large-v3-turbo) faz a transcricao; sem
GROQ_API_KEY o bot aceita so texto.
