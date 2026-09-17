---
name: palpitemestre-deploy
description: Infra e fluxo de deploy do site palpitemestre.com.br (Next.js diretório de palpites)
metadata: 
  node_type: memory
  type: project
  originSessionId: 5b96686e-b85c-460a-b9b6-3fdfaec3533d
---

Site **palpitemestre.com.br** (d:\SITES\palpitemestre.com.br): diretório programático de palpites de futebol. Next.js 15 + Prisma + PostgreSQL + tsx/PM2. Fonte de dados: API-Football (plano com cota diária; throttle 250ms). Conteúdo via DeepSeek (fallback determinístico por template). Autor persona: Rafael Monteiro.

**Deploy (VPS gerenciada por painel):**
- Host SSH: `hostinger-vps-srv1166087` (31.97.173.40). Dir: `/var/www/palpitemestre`. Node: `/root/.nvm/versions/node/v20.20.2/bin`.
- Atrás de Cloudflare. Reverse proxy = **HestiaCP** (user `boot`), config gerada em `/etc/nginx/conf.d/domains/palpitemestre.com.br{,.ssl}.conf` a partir dos templates `/usr/local/hestia/data/templates/web/nginx/palpitemestre.{tpl,stpl}`. Editar o **template** (não o .conf) e rodar `v-rebuild-web-domain boot palpitemestre.com.br`.
- **HA (alta disponibilidade):** 2 instâncias PM2 `palpitemestre` (3050) + `palpitemestre-b` (3051). Upstream com failover em `/etc/nginx/conf.d/palpitemestre-upstream.conf` (standalone, fora do painel). Deploy zero-downtime: `npm run build` depois `pm2 reload palpitemestre && pm2 reload palpitemestre-b` (um de cada vez).
- **scp falha** nesse host ("Connection closed"); transferir arquivos via `base64 -w0 arquivo | ssh host "base64 -d > destino"`. Build só roda com o node v20 no PATH.

**Jobs (system crontab, NÃO PM2):** sync-fixtures/stats/standings/odds, run-engine, gen-content, settle-results. **IMPORTANTE:** os jobs foram tirados do PM2 porque o `cron_restart` entrou em loop de restart (rodaram 2000+×/dia) e **queimaram toda a cota da API-Football (Pro, 7.500/dia)** — era isso que deixava a Série A vazia e as classificações sem popular, não falta de plano. Agora rodam via `crontab -l` do root (horários UTC, `TZ=America/Sao_Paulo` no comando, `cd /var/www/palpitemestre` p/ o Prisma achar o .env). O `ecosystem.config.cjs` só tem as 2 web apps — NÃO reintroduzir jobs nele. Chave API Pro no .env termina em `...ca201b`. Consumo real sem loop: ~300-400/dia.

Ligas-âncora (Série A, Copa do Brasil, Libertadores) podem ficar com 0 jogos por pausa de Copa do Mundo OU por cota drenada pelo loop (já corrigido).

**Automação (jobs no crontab):** `watchdog.ts` (11:00 UTC, health-check diário: site, cota API, pipeline, liquidação, alerta via Telegram), `manage-leagues.ts` (dom 06:00 UTC, ativa/desativa ligas e vira temporada pela API — não precisa mais editar seed pra Premier em agosto etc.), `telegram-post.ts` (10:15 UTC, posta palpites do dia). Housekeeping: `/etc/logrotate.d/palpite` (rotaciona /var/log/palpite-jobs.log) + `/root/backup-palpite.sh` (06:30 UTC, pg_dump gzip em /root/backups/palpite, mantém 7 dias; usa DATABASE_URL SEM o `?schema=public`). **Telegram dorme sem `TELEGRAM_BOT_TOKEN`+`TELEGRAM_CHANNEL_ID` no .env** — quando o Anderson criar o bot e adicionar, watchdog e post ativam sozinhos.

**Auto-conteúdo (guias):** job `gen-guide.ts` (crontab ter/sex 12:00 UTC) gera guias educativos com IA a partir do backlog em `src/content/guide-topics.ts`, valida regras QMIX (sem travessão/promessa, links só da allowlist), grava na tabela **GuideArticle** (banco, não código), revalida /guia+sitemap, pinga IndexNow, avisa no Telegram. As páginas /guia e /guia/[slug] leem o merge estático (`guia-articles.ts`) + banco via `src/lib/guide.ts`. **Dois provedores de IA** (`src/lib/llm.ts`): OpenAI (`OPENAI_API_KEY`, `OPENAI_MODEL="gpt-5.4-nano"`) nos guias; DeepSeek nas análises dos jogos (gen-content). Se OpenAI não setada, gen-guide cai no DeepSeek. **Família GPT-5 mudou a API**: `llm.ts` detecta modelo `gpt-5*` e usa `max_completion_tokens` (não `max_tokens`), sem `temperature`, com orçamento dobrado (raciocínio gasta tokens). A chave OpenAI do Anderson veio colada crua no .env local (só `sk-proj-...` sem o nome da var) — copiada pro .env da VPS no formato certo.

Helpers úteis: `correctTeamName` ([[teamName]]) corrige acento dos nomes vindos da API; `clampTitle` mantém title ≤65 chars.
