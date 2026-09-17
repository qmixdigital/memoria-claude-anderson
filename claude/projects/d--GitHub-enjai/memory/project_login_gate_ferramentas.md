---
name: project_login_gate_ferramentas
description: "Login com Google trava as ferramentas gratuitas nos 4 sites (bloqueia bots + captura lead); view admin filtra \"nunca comprou\""
metadata: 
  node_type: memory
  type: project
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-08-04T18:28:55.257Z
---

2026-08-04: implementado **login gate com Google** nas ferramentas gratuitas dos 4 sites SMM (enjai, portuga, skipark, truenet). Motivo: bots martelavam `/api/ferramentas/*` (API paga RapidAPI). Decisão do dono: prefere login interno com Gmail p/ **capturar contato e mandar promoção depois** — não liga se quem não loga desiste.

**Arquitetura (idêntica nos 4 sites):**
- `middleware.ts`: intercepta `/api/ferramentas/*` → sem token JWT retorna **401** `{requireLogin:true}`. Exceção: `FLUXO_COMPRA = ["/api/ferramentas/validar-perfil"]` fica **aberto** (preview de perfil na página do produto — senão quebra a venda de quem não está logado). Também protege `/admin/*` (redireciona não-admin p/ `/`, usando `token.role`).
- `lib/auth.ts` (patch): `GoogleProvider` no topo dos providers + callback `signIn` que faz `prisma.usuarioFerramenta.upsert` (captura lead) quando `account.provider==="google"` + `token.role = google?"user":"admin"` no jwt.
- Model `UsuarioFerramenta` (email @unique, nome, avatar, googleId, usos, criadoEm, ultimoUso). Tabela criada via SQL direto em cada postgres.
- Frontend: `components/shared/AuthProvider.tsx` (SessionProvider) envolve `{children}` no `app/(loja)/layout.tsx`; `components/loja/LoginGate.tsx` (useSession → botão "Entrar com o Google") envolve o componente interativo de **cada uma das 27 ferramentas** (texto SEO fica FORA do gate, indexável).
- Admin: `/admin/usuarios-ferramentas` (page + `export/route.ts` CSV). Filtro **todos / clientes / nunca-comprou** via `$queryRaw` — "comprou" = `EXISTS Pedido p WHERE LOWER(p.emailCliente)=LOWER(uf.email) AND p.status::text <> 'AGUARDANDO_PAGAMENTO'`.

**Credenciais OAuth (mesmas nos 4 sites — 1 client "Ferramentas enjai", multi-redirect):** `GOOGLE_CLIENT_ID=325392343815-dntgid1...`, secret `GOCSPX-W5Yq...` no `.env.local`. **CONCLUÍDO (2026-08-04):** projeto OAuth publicado (Em produção, Externo, escopos email/perfil não-sensíveis → sem cap de 100 e sem verificação Google); os 4 redirect URIs `https://DOMINIO/api/auth/callback/google` cadastrados e batendo com o NEXTAUTH_URL de cada site (validado via `/api/auth/providers`). Origens JS ficam vazias de propósito (NextAuth usa fluxo server-side). Login funcional nos 4.

**Relatório diário Telegram (2026-08-04):** `/root/relatorio-ferramentas.sh` no srv1166087 agrega os 4 sites e manda 1 msg (novos 24h · total · clientes · nunca compraram · ativos 24h) via bot `8568397071:...` p/ chats `<<REMOVIDO>>,7945216822`. Cron `0 9 * * *` UTC = **06:00 America/Sao_Paulo** (servidores em UTC). enjai/truenet/portuga consultados via `docker exec <site>-postgres psql`; **skipark fica no opengravity e o srv1166087 NÃO tem SSH pra lá** → skipark expõe `GET /api/cron/leads-stats?secret=<CRON_SECRET>` (JSON) e o script busca via HTTPS. **Desativar:** `crontab -e` no srv1166087 e remover/comentar a linha `relatorio-ferramentas.sh`. Log em `/var/log/relatorio-ferramentas.log`.

**Notas:** portuga tem `middleware.ts` custom (redirects legados `legacy-portuga-redirects` + matcher que exclui `api`) → foi MESCLADO, adicionando `/api/ferramentas/:path*` ao matcher. skipark tinha `NEXTAUTH_URL` errado apontando p/ enjai.com.br → corrigido p/ www.skipark.com.br. Scripts idempotentes em `/tmp/gate/` (apply_gate.sh, patch_auth.py, wrap_all_tools.py, wrap_layout.py, insert_menu.py). Ver [[project_migracao_enjai_srv1166087]] [[reference_deploy_skipark]] [[feedback_deploy_use_script]].
