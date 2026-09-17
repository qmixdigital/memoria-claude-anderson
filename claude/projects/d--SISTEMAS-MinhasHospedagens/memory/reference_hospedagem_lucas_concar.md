---
name: reference_hospedagem_lucas_concar
description: "Hospedagem do Lucas (terceiro) na Hostinger — VPS com Coolify rodando o projeto concar.com.br (Next.js, consulta veicular por placa). Acesso via API Hostinger (MCP)."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 611c5219-ea2f-4933-b1d7-762f552ee8c8
---

Hospedagem de **terceiro (Lucas)**, adicionada 2026-06-06 para trabalhar no projeto **concar.com.br** (consulta veicular oficial pela placa; app **Next.js** atrás do Cloudflare, deployado via **Coolify**).

**⚠️ NÃO é da rede QMIX.** Igual aos [[feedback_sites_clientes_rede]] / [[feedback_marketing_qmix]]: trabalhar só no projeto contratado (concar), com autorização. NÃO aplicar content-pruning, link-audit, deploy de portais nem mexer nos outros domínios do Lucas (refordiesel.com, bellarico.com.br).

**Doc + credenciais:** `D:\SISTEMAS\MinhasHospedagens\Hospedagem Lucas\ACESSO.md` + `mcp.json`.

**Acesso = API Hostinger** (não SSH/painel direto ainda). Token `<<REMOVIDO>>`, base `https://developers.hostinger.com/api`, header `Authorization: Bearer <token>`. MCP `hostinger-api-mcp@latest` (stdio, env API_TOKEN).

**VPS:** id 1607429, `srv1607429.hstgr.cloud`, KVM 8 (8 vCPU/32GB/400GB), Ubuntu 24.04 + **Coolify**, IPv4 `2.24.220.46`, IPv6 `2a02:4780:75:77af::1`, running.

**SSH (key-auth):** alias **`ssh concar-lucas`** → root@2.24.220.46, chave `<<REMOVIDO>>` (instalada 2026-06-06; senha de root usada só 1x via paramiko, não fica em disco). git bash: plink trava → usar OpenSSH `ssh` (key) ou paramiko (senha).

**🛡️ BLINDAGEM (regras p/ não derrubar outros apps):** cada app = projeto docker compose separado (isolado); **compartilhado por todos** = rede `coolify` + `coolify-proxy`(traefik) + core `coolify*`. **NUNCA:** `docker system/image/volume/network prune`, mexer na rede `coolify`, restart/stop/down de `coolify*`/traefik ou de containers de OUTROS projetos (drrmr2du*, c14okyxz*, u1jlv8vb*, lce6vvld*, h8quwn3*, adew2nx*, d9jmyo9*, m13a4skz*), comandos docker em massa, `systemctl restart docker`, reboot, "Redeploy all"/restart de Server no Coolify. **PERMITIDO:** logs/exec/inspect só nos containers concar; redeploy SÓ do recurso `concar-app` no Coolify (zero-downtime, health-check); DB `concar`. **Backup escopado:** `ssh concar-lucas 'bash /root/concar-backup.sh'` (dump DB + .env + compose + retag `concar-rollback:latest`); rodar ANTES de qualquer mudança. Rollback: Coolify rollback do concar-app, ou imagem `concar-rollback:latest` + restaurar dump no DB concar. Regras completas em ACESSO.md. Baseline: `/root/concar-backups/20260606-142609`.

**Repo + workflow de deploy (2026-06-06):** código em `git@github.com:LucasAyala7/concar-app.git` (branch `main`), clonado em **D:\SITES\concar** (clone HTTPS funciona com as credenciais GitHub do usuário; Lucas compartilhou). Stack: Next.js 16.2.4 (src/, breaking changes — espelhar padrões do repo, ver AGENTS.md), Prisma+adapter-pg, auth PRÓPRIO (`@/lib/auth` getSession/requireUser; `@/lib/admin-auth` requireAdmin→redirect /nem-tente), email via `sendTransactional`+registry `email-templates.ts`, UI em `@/components/ui` + `@/components/admin/ui`. **Deploy = `prisma db push` no docker-entrypoint** (sem migrations; aditivo) + seed idempotente. **Coolify SEM webhook GitHub** → push no main NÃO auto-deploya. Triggar deploy via SSH: criar token Sanctum temp (tinker: team_id de `team_user`, `new App\Models\PersonalAccessToken` c/ team_id+tokenable+abilities, salvar, usar `id|plain`) → `GET http://localhost:8000/api/v1/deploy?uuid=htumn5rot4sxyhj26zani4e7` Bearer → revogar token. Rebuilda só concar-app (zero-downtime). TODO: configurar webhook+auto-deploy no Coolify.

**Fase 1 ENTREGUE e no ar (2026-06-06):** tickets (cliente `/suporte`+`/suporte/acompanhar`; admin `/admin/tickets`+`[id]`+menu; APIs `/api/suporte`+`/api/admin/tickets/[id]`; models Ticket/TicketMessage/QuickReply; emails tx.ticket-created/reply). WhatsApp removido do site todo → Suporte/email. Fix 404 `/detran/rj` e `/sp` (MegaDropdown + redirects 308). Pendente: CRUD QuickReply (respostas rápidas, model existe falta UI) + dashboard métricas. concar já tem o resto do admin (Pedidos/Produtos/B2B/Reviews/Email/Webhooks).

**App concar no Coolify:** resourceName **concar-app**, UUID/container `htumn5rot4sxyhj26zani4e7` (Next.js porta 3000, exposto via traefik→concar.com.br); banco PostgreSQL 16 container `v10le9z3d0uap4bvy77cguu8`; dir `/data/coolify/applications/htumn5rot4sxyhj26zani4e7/` (.env+docker-compose.yaml); **deploy git-based via Coolify** (imagem buildada do commit; repo no painel Coolify). Editar = repo Git→push→Coolify rebuilda, ou redeploy no painel. ⚠️ VPS tem VÁRIOS apps do Lucas (multi Postgres/Redis) — mexer SÓ no concar-app.
