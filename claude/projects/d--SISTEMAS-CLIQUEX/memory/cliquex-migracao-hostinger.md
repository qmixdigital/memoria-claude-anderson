---
name: cliquex-migracao-hostinger
description: "O cliquex (painel + banco + origem) migrou do Hetzner para o VPS Hostinger srv1166087"
metadata:
  node_type: memory
  type: project
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-07-26T20:02:58.806Z
---

**MIGRADO em 2026-07-26**: a ORIGEM do cliquex (painel `/clk` + banco + `/api/rotator-*`) saiu do Hetzner (`cliquex-new`, que dava OOM com 8GB) para o **VPS Hostinger srv1166087** (`ssh hostinger-vps-srv1166087`, IP **31.97.173.40**, KVM 8 = **8 vCPU / 32 GB RAM / 400 GB**, Ubuntu 24.04 + HestiaCP; já roda ~51 apps PM2). Motivo: consolidar num servidor que o usuário já paga (venc. 2027) e muito mais parrudo (fim dos OOMs). O **rodízio continua no Cloudflare Worker** (edge) — só a origem mudou. Ver [[cliquex-worker-rotador]], [[cliquex-deploy]].

**Onde vive agora**: app em **`/var/www/cliquex`**, Node **nvm v20.20.2** (`export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH`), PM2 `cliquex-a`:3005 + `cliquex-b`:3006 (rodam como **root**, não deploy). Banco **PostgreSQL 16** local `cliquex_db` / role `cliquex_app` (mesma senha do Hetzner). nginx `/etc/nginx/conf.d/cliquex.conf` (upstream failover 3005/3006, `listen 31.97.173.40:443` + `listen 127.0.0.1:443`, origin só-CF via `if ($cf_trusted=0) return 403` do `00-cf-realip.conf`). Cert LE copiado do Hetzner em `/etc/ssl/portais/cliquex.click/origin-cf.{pem,key}`. Deploy: `cd /var/www/cliquex && export PATH=...v20.20.2/bin:$PATH && npm run build && pm2 reload cliquex-a && pm2 reload cliquex-b`.

**Cutover feito**: A record `cliquex.click` + `www` no CF (zona `3b4b5ac0...`) apontam pra **31.97.173.40** (era 46.225.109.216). O `ORIGIN` do Worker/DO continua `https://cliquex.click` (não mudou — só o A record). Banco migrado por `pg_dump -Fp` (plain SQL; o `-Fc` do PG17 não abre no PG16) + restore; **teve que dar `GRANT ALL ON ALL TABLES/SEQUENCES + ALTER TABLE OWNER TO cliquex_app`** senão Prisma dava "permission denied for table links".

**Scripts de suporte migrados** (`/usr/local/bin/cliquex-*`, configs `/root/.cliquex-{tg,cf,whitelist}`): alertas Telegram (cron `/etc/cron.d/cliquex-alerts` com `CRON_TZ=America/Sao_Paulo` pois o servidor é UTC) + auto-defesa + backup diário (`cliquex-db-backup.sh` → `/root/cliquex-backups`, cron `cliquex-backup`). **NÃO migrados de propósito**: `cliquex-watchdog` (reinicia nginx — perigoso, o Hostinger tem 51 sites) e `cliquex-slowloris-guard` (olha conexões :443 GLOBAIS — falso positivo com 51 sites). O health-check do `cliquex-tg-infra` foi trocado p/ `http://127.0.0.1:3005/login` (o nginx não escuta 127.0.0.1 por hostname). Postgres protegido do OOM no Hetzner (OOMScoreAdjust=-900) — no Hostinger com 32GB o risco é baixo.

**PENDENTE — desligar os 2 VPS Hetzner**: o `cliquex-new` (46.225.109.216) e o antigo (45.142.141.184) não recebem mais tráfego. Recomendado manter o `cliquex-new` ligado ~24-48h como fallback pós-cutover, depois CANCELAR (irreversível/financeiro — confirmar com o usuário; token Hetzner não fica salvo). O antigo pode cancelar já.
