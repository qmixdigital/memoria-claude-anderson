# OpenGravity - Projeto Principal

Bot Telegram pessoal com IA (GPT-4o), monitoramento de sites, integração Twitter/X e email.
Hospedado em VPS (root@77.37.69.175) com PM2. Usuario fala portugues BR.

## Arquitetura
- **Runtime:** Node.js + TypeScript
- **Bot:** grammY (Telegram)
- **LLM primario:** OpenAI GPT-4o (fallback: Groq llama-3.3-70b)
- **DB:** Firebase (historico de mensagens)
- **Monitoramento:** 134 sites a cada 10min (sites_monitorar.txt)
- **Twitter/X:** OAuth 1.0a, conta @QmixDigital
- **Email:** DESATIVADO temporariamente (dependia do Stripe)
- **Stripe:** DESATIVADO (conta cancelada). Arquivos em src/stripe/ e src/email/ excluidos do tsconfig
- **HTTP Server:** Porta 3000 (health check apenas)

## Estrutura de Arquivos Chave
- `src/index.ts` - Entry point (HTTP server, bot, email, monitor)
- `src/bot.ts` - Comandos Telegram (/start, /help, /status, /limpar, /sites)
- `src/agent/loop.ts` - Agent loop com tool calling
- `src/agent/llm.ts` - OpenAI (primario) + Groq (fallback)
- `src/handlers/message.ts` - Handler de mensagens + workflow de tweets
- `src/tools/index.ts` - Tools do agente (web_search, get_current_time)
- `src/monitor/sites.ts` - Monitoramento de sites (HEAD/GET, HTTPS/HTTP fallback)
- `src/config.ts` - Configuracao centralizada (.env)
- `src/stripe/webhook.ts` - Webhook Stripe
- `sites_monitorar.txt` - Lista de 134 dominios monitorados

## Deploy
```bash
tar czf - package.json package-lock.json tsconfig.json src/ sites_monitorar.txt .env | ssh -i ~/.ssh/id_ed25519_vps root@77.37.69.175 "cd /opt/opengravity && tar xzf - && npm run build && pm2 restart opengravity"
```

## VPS (Hostinger)
- **IP:** 77.37.69.175, **SSH key:** ~/.ssh/id_ed25519_vps, **alias:** `ssh opengravity`
- **HestiaCP** v1.9.4 na porta 8083
- **SWAP:** 2GB, **fail2ban:** IP 177.200.37.63 na whitelist
- **Backup:** /root/backup-20260310/ (opengravity, mysql, sites, ssh)

## Detalhes importantes -> ver [project-details.md](project-details.md)

## Operacional / Troubleshooting
- [Ghost bot 409](ghost-bot-instance-409.md) — 409 do bot (instância duplicada externa) RESOLVIDO migrando p/ webhook (revistamsaude.com.br/tgwh/); manter vars TELEGRAM_WEBHOOK_* no .env
- [PM2 watchdog](pm2-watchdog-resurrect.md) — cron ressuscita apps pm2 parados a cada 2 min; comentar antes de debugar
- [PM2 x needrestart](pm2-needrestart-dump-race.md) — 11/09/2026: apt automático reiniciou pm2-root e o dump ficou com 1 app de 18; restaurar via dump.pm2.bak; blindagem em needrestart + drop-in systemd
- [PM2 sem limite de memória](pm2-limite-memoria-fora-do-ecosystem.md) — 16/09/2026: app iniciado fora do ecosystem não tem max_memory_restart (desentupidora 2,1 GB); relançar com -b como ponte; `bash -c bunx` sem caminho quebra no reboot; idle_session_timeout do Postgres na srv1166087 derruba pool Prisma (isentar role). Varredura -b a cada 5 min nas 3 VPS (/opt/pm2-b-sweeper.sh)
- [srv1166087 limpeza PM2](srv1166087-pm2-limpeza-2026-09-14.md) — 14/09/2026: 34 `-b` ligadas (6,4 GB) + bot-validador em loop paradas; swap 12 GB→0,3 GB; deploy.sh lá ainda é o padrão antigo (religa -b)
- [geladeirastop migrado](geladeirastop-migrado-srv1166087.md) — 14/09/2026: saiu da opengravity p/ srv1166087 (porta 3220, Node 20 nvm, pnpm, crons em /root/scripts-geladeirastop); cópia antiga na opengravity apagar após 21/09; RFB mensal conferir em 05/10
- [Limite de CPU Hostinger](hostinger-cpu-cap-2026-09-14.md) — 14/09/2026: steal 90% = VPS cortada a 20% após 7h em 100% (ClaudeBot em Next.js); reboot NÃO resolve; suporte remove; blindado com Block AI bots no Cloudflare (11 zonas), 429 no nginx, vigia /cpu no bot, pm2-dump-guard na subida
- [502 intermitente (keepalive)](nginx-keepalive-reset-502.md) — smoke "rota X: HTTP 502" aleatório = reset keepalive nginx×Node + porta -b desligada; corrigido 13/09/2026 com keepalive_timeout 3s em todos os upstreams da opengravity; aplicar em upstream novo
- Vigia de backups (src/monitor/backups.ts, /backups) — as 3 VPS (srv1000825=opengravity, srv984283=clinicas-vps, srv1166087=hostinger) fazem POST em revistamsaude.com.br/tgwh/hb/<host>?status=ok|erro no fim do /opt/portal-engine/backup_engine.sh (curl -4; bot aceita só IPv4 das VPS via X-Real-IP). Conferência diária 05:00 UTC. Hostinger manda o backup dela p/ opengravity (chave id_backup_opengravity)
- Monitor de créditos de API (src/monitor/credits.ts, /creditos) — OpenRouter, Runware, Serper, Tavily; OpenAI/Claude só com chave admin (OPENAI_ADMIN_KEY / ANTHROPIC_ADMIN_KEY). Groq aposentou os Llama: fallback é openai/gpt-oss-120b
