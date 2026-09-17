---
name: cliquex-deploy
description: Onde vive o código do CLIQUEX (rotador de links) e como fazer deploy zero-downtime
metadata: 
  node_type: memory
  type: project
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-08-06T20:55:02.754Z
---

**⚠️ SERVIDOR CERTO (verificado 2026-08-06) = `ssh hostinger-vps-srv1166087` (IP `31.97.173.40`, Hostinger srv1166087).** É pra ONDE o `cliquex.click` aponta: CF DNS A `cliquex.click`+`www` → `31.97.173.40` proxied (zona `3b4b5ac0afc33d9c803ef68139901edf`, conta 011fa32b). Código em **`/var/www/cliquex`**, PM2 roda como **root** (`cliquex-a` 3005 / `cliquex-b` 3006, ids 58/59). **Build: `npm run build` MAS com Node 20 via nvm** — o `node` do PATH é v18 (velho demais p/ Next 16); prefixar `export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH`.

**ARMADILHA QUE JÁ CUSTOU UM DEPLOY INTEIRO (2026-08-06)**: o alias **`ssh cliquex` (45.142.141.184) NÃO é o origin do cliquex.click** — é outro servidor (app em `/home/deploy/cliquex`, user deploy, bun) que tem o mesmo código+dados mas a CF NÃO aponta pra ele. Deployar lá NÃO muda nada no ar. **Sempre conferir o A record real da zona antes de deployar** (`/zones/{id}/dns_records`). Para checar o HTML que a origem realmente serve (painel é atrás de login), gerar cookie de sessão: `clx_session = "<exp>.<hmac_sha256(exp, COOKIE_SECRET)>"` (COOKIE_SECRET no `.env`, cookie name `clx_session`, ver `lib/auth.ts`) e `curl -H "Cookie: clx_session=..." http://127.0.0.1:3005/clk/...`. Via CF, `cf-cache-status: DYNAMIC` confirma que não é cache de edge.

Stack: Next.js 16 (App Router) + Prisma + **PostgreSQL local** (DATABASE_URL localhost no `.env`) + PM2 (2 instâncias 3005/3006) + Nginx upstream. Sem git (edição in-place). Domínio: cliquex.click. Cliques contados direto no banco por incremento (`app/[slug]/route.ts`: `cliquesTotal+1` + bucket `cliques_hora_campanha`), sem buffer que re-infle → zerar no banco é definitivo.

Backup do banco (grátis): `/usr/local/bin/cliquex-db-backup.sh` roda por cron 03:10 → `pg_dump` em `/home/deploy/backups/*.dump.gz` (guarda 14). Cópia inicial no PC em `d:/SISTEMAS/CLIQUEX/backups-banco/`. Nginx: `worker_connections 8192` (ok nos 8 GB) + session cache. **REGRA CRÍTICA: o rotador é ferramenta de LEAD — NUNCA pôr bloqueio/desafio (Under Attack, SBFM block, WAF agressivo) no cliquex.click; barra cliente real. Deixar `security_level` baixo e sem WAF de bot.** Ver [[cliquex-ddos-hardening]].

Deploy zero-downtime no servidor certo (srv1166087, PM2 roda como root):
```
ssh hostinger-vps-srv1166087 "export PATH=/root/.nvm/versions/node/v20.20.2/bin:\$PATH && cd /var/www/cliquex && npm run build && pm2 reload cliquex-a && sleep 2 && pm2 reload cliquex-b"
```
Nunca `pm2 restart/stop/delete` (só `reload`, um de cada vez). DATABASE_URL no `.env` (ler com grep p/ usar psql). Após deploy, purgar CF (`purge_everything`) e confirmar via cookie de sessão (acima).

Hot path do rodízio: `app/route.ts` (raiz `/`). Endpoint de campanhas: `app/[slug]/route.ts`. CRUD: `app/clk/`. **MAS em produção `/` e `/whatsapp-*` são servidos por um Cloudflare Worker no edge, não pela origem** — ver [[cliquex-worker-rotador]]. A origem só serve `/clk`, `/api/*` e é a fonte da config (via `/api/rotator-config`) e destino dos cliques (`/api/rotator-sync`).
