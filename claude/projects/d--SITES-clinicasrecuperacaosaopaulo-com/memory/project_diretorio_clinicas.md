---
name: diret-rio-cl-nicas-sp-estado-do-projeto
description: "Diretório de clínicas de recuperação em SP - Next.js + Drizzle, EM PRODUÇÃO na VPS srv1166087 (31.97.173.40) — migrado 22/jun/2026 de 31.97.162.199"
metadata: 
  node_type: memory
  type: project
  originSessionId: fab07a3e-8707-4a23-979e-3bf26cd09b20
---

Diretório dinâmico Next.js de clínicas de recuperação em São Paulo. **Em produção** em https://clinicasrecuperacaosaopaulo.com.

**Stack:** Next.js 16 + Drizzle ORM + PostgreSQL local + NextAuth v5 + Tailwind v4 + shadcn + TipTap + Recharts. Gerenciador: **pnpm**.

**Infra ATUAL (VPS Hostinger srv1166087, IP `31.97.173.40`, alias SSH `hostinger-vps-srv1166087`, loga root) — migrado 22/jun/2026:**
- App em `/var/www/clinicasrecuperacaosaopaulo` — **2 instâncias PM2 failover: `clinicas`:3028 + `clinicas-b`:3029** (PM2 sob `/root/.pm2`, node nvm v20.20.2). Ecosystem em `ecosystem.config.js` do app.
- Postgres local: db `clinicas_db`, user `clinicas_user`, senha `<<REMOVIDO>>` (no `.env`/`.env.local`).
- nginx `/etc/nginx/conf.d/clinicas.conf`: upstream `clinicas_backend` (3028/3029), **origin só-CF** (`if $cf_trusted=0 return 403`, geo em `00-cf-realip.conf`). Alias `/uploads/` → `public/uploads`.
- SSL: cert **CF Origin** em `/etc/ssl/portais/clinicasrecuperacaosaopaulo.com/origin-cf.{pem,key}` (val. 2041).
- Deploy: `ssh hostinger-vps-srv1166087`, `export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH HOME=/root PM2_HOME=/root/.pm2`, `cd /var/www/clinicasrecuperacaosaopaulo`, `pnpm build`, `pm2 reload clinicas && pm2 reload clinicas-b`.
- ⚠️ **GOTCHA (queimei 22/jun):** ao sincronizar source via `tar` da máquina local, SEMPRE excluir `--exclude='.env*' --exclude=ecosystem.config.js`. O `.env`/`.env.local` local tem senha placeholder `CHANGE_ME` e o ecosystem local tem porta 3006; sobrescrever quebra DB auth (Next prioriza `.env.local` sobre `.env`) e as portas. O `.env` real (completo, com ASAAS/GA4/RESEND/GOOGLE) vive só no servidor. Não há `.env.local` no servidor (removido; `.env` é a fonte única).
- **Cloudflare:** zona `clinicasrecuperacaosaopaulo.com` id `1cc17d520227d0a116d5366fd7a22b05` (token `<<REMOVIDO>>`, account id `9ecbf885a61a34c6ac4d73033fa0f497`; conta com ~38 zonas). SSL **Full(strict)**. DNS apex A→31.97.173.40 (proxied), www CNAME→apex. `blog.` (DNS + redirect rule) **DELETADO** em 22/jun (blog é interno em `/blog/`).

**Servidor ANTIGO (clinicas-vps, 31.97.162.199):** cópia do clinicas **DELETADA em 22/jun/2026** (PM2 `clinicas-sp`, db `clinicas_db`+role, app dir, e domínio Hestia via `/usr/local/hestia/bin/v-delete-web-domain user clinicasrecuperacaosaopaulo.com` removidos). Esse servidor segue hospedando OUTROS apps (desentupidora.pro:3008, distribuidoras) — intactos, NÃO mexer. Backup do dump em `d:\SITES\clinicasrecuperacaosaopaulo.com\backup-db\clinicas_db-20260622.dump`. ⚠️ Gotcha: binários Hestia (`v-*`) não estão no PATH em SSH não-interativo — usar caminho completo `/usr/local/hestia/bin/`.

**Auth:** login por e-mail+senha (bcrypt) OU Google; NÃO exige email_verified. Role fica no JWT — mudar `users.role` no banco só vale após logout/login. Acesso admin: `/admin/*` exige role `admin` (senão redireciona p/ `/`). qmixdigital@gmail.com já é admin.

**How to apply:** editar dados de clínicas pelo painel admin OU SQL direto (`ssh hostinger-vps-srv1166087` + psql). Spec em `docs/superpowers/specs/2026-03-30-diretorio-clinicas-design.md`. Código canônico local em `d:\SITES\clinicasrecuperacaosaopaulo.com` (repo git).
