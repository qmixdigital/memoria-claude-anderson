---
name: project_vps_migration
description: "qmix.com.br rodando em srv1166087 (Hostinger) desde 2026-06-16; estado atual da hospedagem, portas, Node e Postgres"
metadata: 
  node_type: memory
  type: project
  originSessionId: f0fe6811-0d34-4f0f-86c9-aff621746640
---

qmix.com.br foi migrado em **2026-06-16** de `opengravity` para `srv1166087`. Estado AO VIVO é só na srv1166087 — opengravity está morta (sem DNS, sem tráfego, sem crons), pendente de limpeza.

**Why:** Hardware maior (KVM8 8 vCPU/32 GB SP), Postgres isolado em container, e oportunidade de hardening completo (CF Origin CA + Full Strict + WAF). A migração de março (Vercel → opengravity) já estava feita; esta foi opengravity → srv1166087.

**How to apply:** Quando precisar SSH, deploy, ou diagnóstico em qmix.com.br, usar SEMPRE os dados abaixo. Ignorar qualquer doc/memória que cite opengravity, 3005/3006, Node 22 ou Postgres local — isso é estado antigo. Doc canônica viva: `d:/SITES/qmix-Payload/MIGRACAO-VPS.md`.

## Estado atual (2026-06-16+)

- **Host:** srv1166087 — `ssh hostinger-vps-srv1166087` / `31.97.173.40` (Hostinger KVM8, Ubuntu, São Paulo)
- **Diretório:** `/var/www/qmix-next`
- **Node:** **20.20.2 via nvm** em `/root/.nvm/versions/node/v20.20.2/bin/node` (NÃO usar Node 18 do sistema). Exportar PATH antes de qualquer `npm`/`pm2`.
- **PM2:** `qmix-next` :**3020** + `qmix-next-b` :**3021** (zero-downtime, ecosystem em `/var/www/qmix-next/ecosystem.config.cjs`)
- **Banco:** Postgres 16 em container Docker `qmix-postgres` em **127.0.0.1:5434** (db `qmix`, role `qmix`, volume `qmix_pgdata`). Acesso: `docker exec -it qmix-postgres psql -U qmix -d qmix`
- **Nginx:** `/etc/nginx/conf.d/qmix.conf` (upstream 3020/3021 + failover, :80 e :443)
- **SSL:** Cloudflare Origin CA em `/etc/ssl/portais/qmix.com.br/origin-cf.pem` (válido até 2041); Cloudflare em **Full (Strict)**, proxied
- **Stack:** Next.js 16.2.1 puro (sem Payload) + Drizzle + Postgres + Tailwind v4

## Deploy (zero downtime — mesmo padrão de antes, só mudaram host/portas)

```bash
ssh hostinger-vps-srv1166087
export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH
cd /var/www/qmix-next
npm ci && npm run build
pm2 reload qmix-next && pm2 reload qmix-next-b   # um por vez
```

Nunca `pm2 delete`/`stop`/`restart` — só `reload`. Sem `output: 'standalone'`.

## Crons (7) — todos no crontab do root do srv1166087

Chamam `https://qmix.com.br/api/cron/<rota>` com `Authorization: Bearer <CRON_SECRET>`:
`entregas-pendentes`, `remarketing-favoritos`, `relatorio-mensal`, `afiliados-liberar`, `carrinho-abandonado`, `conciliar-pagamentos`, `expirar-propostas`. Foram movidos da opengravity (removidos de lá).

## Cloudflare

- Conta **QMIX** (`2ff4c5d06407622c756c5b57c46924a5`), zona `qmix.com.br` (`f5f7d6c9deebedfb89f5f3b6b0884a23`)
- A `qmix.com.br` + CNAME `www` → `31.97.173.40` (proxied)
- E-mail (MX/SPF Google), CAA (`amazon.com`), TXT — **preservados, não mexer**
- WAF hardened: bloqueia bots IA, `.env`/`.git`, threat>30, challenge admin/login, **bloqueia UA não-navegador (`curl` puro → 403/1020)**. Para testar via terminal: `-A "Mozilla/5.0 ..."`
- Token CF salvo em `D:\SISTEMAS\Cloudflare\contas.json` como `conta23`

## Mudanças de DNS

- `blog.qmix.com.br` (A) e `www.blog.qmix.com.br` (CNAME) **deletados** do Cloudflare em 2026-06-16

## Backups

- Backup frio do banco (pré + final migração): `D:\SISTEMAS\MinhasHospedagens\qmix\qmix_FINAL_20260616.sql.gz`

## Pendência

Desativar app antigo na opengravity (`/var/www/qmix-next` + db `qmix`) e remover vhost órfão `/etc/nginx/conf.d/domains/qmix.com.br.conf` — só após confirmar estabilidade do srv1166087.

Relacionado: [[feedback_deploy_reload]], [[feedback_no_manual_deploy]]
