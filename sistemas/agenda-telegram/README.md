# agenda-telegram

Bot Telegram (`@agendaqmix_bot`) que transforma um áudio ou texto em evento no Google Calendar.

```
áudio/texto → Whisper (Groq) → Claude Opus 5 (structured outputs) → cartão com [Confirmar] [Cancelar] → Google Calendar
```

- Só responde ao `ALLOWED_CHAT_ID`; qualquer outro chat é ignorado em silêncio.
- Mensagem nova enquanto há rascunho pendente é tratada como correção ("não, é às 16h").
- Rascunhos ficam em `data/pending.json` e sobrevivem a reload do PM2 (validade 24 h).
- O evento leva a descrição limpa mais o recado original ao final.

## Produção

- Host: opengravity, `/var/www/agenda-telegram`, PM2 `agenda-telegram`, porta 3080.
- URL pública: `https://api-indexation.qmix.com.br/agenda-bot/` (location no nginx da api-indexation).
- Deploy: `./deploy.sh` (typecheck, build, tar por ssh, `npm ci`, `pm2 reload`, health).
- Segredos: `.env` e `service-account.json` ficam só no servidor e na máquina local (gitignored).

## Configuração externa (uma vez)

1. Google Cloud, projeto `qmix-diversos`: ativar **Google Calendar API**.
2. Google Calendar: compartilhar a agenda com `qmix-seo@qmix-diversos.iam.gserviceaccount.com`, permissão **Fazer alterações em eventos**.
3. `.env`: `ANTHROPIC_API_KEY` válida e `GROQ_API_KEY` (console.groq.com, grátis).

## Desenvolvimento

```bash
npm install
npm test          # funções puras de calendário
npm run dev       # tsx watch com .env local (registra o webhook na PUBLIC_BASE_URL!)
```
