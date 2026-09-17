# Conexão — Hostinger VPS srv1166087 (KVM 8 + HestiaCP)

## Dados do servidor

| Campo | Valor |
|-------|-------|
| **Hostname** | `srv1166087.hstgr.cloud` |
| **IP** | `31.97.173.40` |
| **Porta SSH** | `22` |
| **Usuário** | `root` |
| **Senha** | `<<REMOVIDO>>` |
| **OS** | Ubuntu 24.04 + HestiaCP |
| **Plano** | KVM 8 (8 vCPU / 32 GB RAM / 400 GB disco) |
| **Localização** | Brazil — São Paulo |
| **Vencimento** | 2027-11-30 |

## Painel HestiaCP (hospedagem dos sites)

| Campo | Valor |
|-------|-------|
| **Usuário** | `user` |
| **Senha** | _(redefinir no painel Hostinger → seção "Senha")_ |

HestiaCP escuta nas portas padrão (`8083` HTTPS por default).

## Comando de conexão SSH

```bash
ssh root@31.97.173.40
# ou via alias após editar ~/.ssh/config:
ssh hostinger-vps-srv1166087
```

## Onde ficam os sites

HestiaCP organiza por usuário em `/home/<USER>/web/<DOMINIO>/public_html/`. Padrão:

```bash
ls /home/user/web/
```

## Notas

- Backup: 2 snapshots configurados (mensais Hostinger). Sem detector de malware.
- WP-CLI: rodar dentro do `public_html` de cada site.
- Renovação automática ATIVA até 2027-11-30.
- Disco em uso: ~21 GB / 400 GB (5%) — folgadíssimo.

## Sites nesta conta

Auditado em 2026-06-03. Todos no usuário HestiaCP `boot`.

| Domínio | Diretório |
|---|---|
| `acesso.qmix.com.br` | `/home/boot/web/acesso.qmix.com.br/` |
| `acesso2.qmix.com.br` | `/home/boot/web/acesso2.qmix.com.br/` |
| `chatbotbrx.com.br` | `/home/boot/web/chatbotbrx.com.br/` |
| `editor.qmix.com.br` | `/home/boot/web/editor.qmix.com.br/` |

Outros usuários HestiaCP existentes mas sem sites próprios:
- `qmix2` — vazio
- `user` — só hostname default `srv1166087.hstgr.cloud`

## Apps Next.js (fora do HestiaCP, em /var/www)

Convenção: `/var/www/<app>`, `next start` em 2 instâncias (zero-downtime), nvm **node v20.20.2**
(`/root/.nvm/versions/node/v20.20.2/bin`), nginx em `/etc/nginx/conf.d/<app>.conf` com upstream
failover, cert Cloudflare Origin em `/etc/ssl/portais/<dominio>/origin-cf.{pem,key}`.

| App | Dir | Portas PM2 | Banco |
|---|---|---|---|
| `coegoiania.com.br` | `/var/www/coegoiania` | `coe`:3026 + `coe-b`:3027 | SQLite (`prisma/coe.db`) |
| `cirurgiadojoelhogoiania.com` | `/var/www/cirurgiadojoelhogoiania` | `joelho`:3009 + `joelho-b`:3018 | PostgreSQL local `cirurgiadojoelho` |
| `drhenriquebufaical.com.br` | `/var/www/dr-henrique-bufaical` | `henrique`:3007 + `henrique-b`:3017 | — (Next estático, sem banco) |
| `distribuidorasdealimentos.com.br` | `/var/www/distribuidoras` | `distribuidoras`:3019 + `distribuidoras-b`:3030 | PostgreSQL local `distribuidoras_db` |
| `goiania.pro` | `/var/www/goiania` | `goiania-web`:3170 + `goiania-web-b`:3171 | PostgreSQL local `goiania` (ficha: `goiania.pro.md`) |
| setorenergetico, qmix-next, enjai, portuga, ... | `/var/www/*` | (pm2 list) | — |

### blog.coegoiania.com.br (WordPress) — migrado jun/2026

- HestiaCP (user **boot**), PHP **8.1**, dir `/home/boot/web/blog.coegoiania.com.br/public_html`.
- Banco MySQL **`boot_coegoiania`** / user `boot_coegoiania` / senha `<<REMOVIDO>>` (prefixo `wp_lFw7A_`).
- Tema Jannah. Usa **Redis Object Cache** (instalado: `redis-server`, db 3, prefixo `blog.coegoiania.com.br:`).
- SSL: cert wildcard CF Origin (`*.coegoiania.com.br`) via Hestia. DNS A → `31.97.173.40` (proxied).
- Migrado do OpenGravity (banco `qmix_99030` 398MB + 173MB de arquivos).

#### Performance & Segurança (jun/2026) — blog

**Servidor:** PHP **8.3**; OPcache 256MB/20k; FPM `dynamic` 16; **Redis** 512mb+allkeys-lru;
MySQL `innodb_buffer_pool` **2GB** (resize online, persistido em `/etc/mysql/mysql.conf.d/zzz-qmix-tuning.cnf`).
nginx: bloqueio de PHP em `wp-content/uploads`; `geo $realip_remote_addr $cf_trusted` em
`/etc/nginx/conf.d/00-cf-realip.conf` + `if ($cf_trusted=0) return 403` nos includes
`nginx{,.ssl}.conf_cfsecurity` → **origin só aceita Cloudflare** (acesso direto ao IP = 403).

**Cloudflare:** HTTP/3, 0-RTT, Early Hints, Tiered Cache, Brotli, Full(strict).
**Page cache** = Cache Rule "Cache Everything" para anônimos (bypass wp-admin/login/json/xmlrpc/cookies),
edge TTL 4h; **auto-purge** via mu-plugin `coe-cf-autopurge.php` (purga ao publicar/editar; usa
constantes `COE_CF_TOKEN`/`COE_CF_ZONE` no wp-config).
**Segurança CF:** Bot Fight Mode; WAF custom (block xmlrpc + `.env/.git/.sql/.bak/wp-config`);
rate-limit `/wp-login.php` POST (5/10s → block).

**WordPress:** `DISABLE_WP_CRON` + system cron do user `boot` (a cada 5min); `WP_POST_REVISIONS=5`;
`WP_MEMORY_LIMIT=256M`; pingbacks off; heartbeat 60s + emojis off (mu-plugin `coe-perf.php`).

**coegoiania.com.br** — migrado do OpenGravity em jun/2026. Deploy: `bash deploy-to-vps.sh`
em `d:\SITES\coegoiania`. Cloudflare: zona `272c7b7283f852082d5988f440b7bf65`,
SSL **Full (strict)** + Origin CA cert, min TLS 1.2, TLS 1.3, Brotli, Always-HTTPS.
DNS A `coegoiania.com.br` → `31.97.173.40` (proxied); `blog.` continua no OpenGravity (77.37.69.175).

### cirurgiadojoelhogoiania.com (Next.js app) — migrado 22/jun/2026

- Dr. Ulbiramar Correia, ortopedista de joelho. App **Next.js 16** em `/var/www/cirurgiadojoelhogoiania`.
- PM2 `joelho`:3009 + `joelho-b`:3018 (failover). nginx `/etc/nginx/conf.d/joelho.conf` (upstream `joelho_backend`).
- Banco: **PostgreSQL local** `cirurgiadojoelho` / user `cirurgiajoelho` / senha `<<REMOVIDO>>` (tabela `agendamentos`).
- `.env`: `DATABASE_URL` (postgres local), `ADMIN_SECRET=<<REMOVIDO>>`, `PORT=3009`.
- SSL: CF Origin cert `*.cirurgiadojoelhogoiania.com` em `/etc/ssl/portais/cirurgiadojoelhogoiania.com/origin-cf.{pem,key}` (val. 2041).
- **476 redirects** (recuperação de backlinks) em `/etc/nginx/conf.d/joelho-redirects.inc` (incluído pelo joelho.conf).
- Deploy: `ssh hostinger-vps-srv1166087`, `cd /var/www/cirurgiadojoelhogoiania`, `export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH`, `npm run build`, `pm2 reload joelho && pm2 reload joelho-b`.
- Origin só-CF (403 fora do Cloudflare). DNS A apex+www+blog → `31.97.173.40` (proxied).

### blog.cirurgiadojoelhogoiania.com (WordPress) — migrado 22/jun/2026

- HestiaCP (user **boot**), PHP **8.3**, dir `/home/boot/web/blog.cirurgiadojoelhogoiania.com/public_html`.
- Banco MySQL **`boot_cdjoelho`** / user `boot_cdjoelho` / senha `<<REMOVIDO>>` (prefixo `wp_gXf44_`, 432 posts).
- Tema Jannah. **Redis Object Cache** (PhpRedis, db **1**, prefixo `blog.cirurgiadojoelhogoiania.com:`).
- SSL: CF Origin (`*.cirurgiadojoelhogoiania.com`) via Hestia. DNS A → `31.97.173.40` (proxied).
- **Page cache** = Cloudflare Cache Rule (Cache Everything anônimo, edge TTL 4h); auto-purge via mu-plugin
  `joelho-cf-autopurge.php` (constantes `JOELHO_CF_TOKEN`/`JOELHO_CF_ZONE` no wp-config).
- **Segurança CF:** Full(strict), Bot Fight Mode, Browser Integrity Check, Email Obfuscation;
  WAF (block xmlrpc + `.env/.git/.sql/.bak/wp-config`; **managed challenge** em `/wp-admin`+`/wp-login` p/ anônimos);
  rate-limit `/wp-login.php` POST (5/10s). nginx bloqueia PHP em uploads; origin só-CF.
- Hardening WP: mu-plugins `s3de979-shield` + `author-privacy` + `joelho-perf`; `DISABLE_WP_CRON` + system cron;
  `WP_POST_REVISIONS=5`; salts rotacionados; wp-super-cache removido.
- Avatar do autor (Dr. Ulbiramar) via mu-plugin `joelho-author-avatar.php` (usa Gravatar real hash `a2c179...`).
- Migrado do OpenGravity (DB `qmix_21248` 28MB + 319MB arquivos). **Cópia antiga no OpenGravity foi DELETADA.**
- Backup completo (pré-deleção): `d:\SITES\cirurgiadojoelhogoiania\backup-blog-wordpress\`.

### drhenriquebufaical.com.br (Next.js app, blog interno) — migrado 22/jun/2026

- Dr. Henrique Bufaiçal, ortopedista especialista em mãos. App **Next.js 15.4.11** (App Router, React 19)
  em `/var/www/dr-henrique-bufaical`. **Sem WordPress, sem banco** — blog é interno em `/blog/`
  (posts em `src/data/posts/`, 137 posts SSG). Já tinha sido migrado de Payload → Next estático.
- PM2 `henrique`:3007 + `henrique-b`:3017 (failover zero-downtime). nginx `/etc/nginx/conf.d/henrique.conf`
  (upstream `henrique_backend`). Node nvm **v20.20.2**.
- `.env`: `NEXT_PUBLIC_SITE_URL=https://drhenriquebufaical.com.br`, `PORT=3007`. Única env var.
- **Redirects ficam todos in-app no `next.config.mjs`** (não há include nginx separado): subdomínio
  `blog.` → `/blog/`, `.html` → URL limpa, `/categoria/*` e `/blog/categoria/*` → `/blog`,
  `/wp-content`, `/wp-admin`, legados de termos/política, `/servicos` → `/especialidades`, typo `bufailcal`.
- nginx roteia `drhenriquebufaical.com.br` + `www.` + `blog.` (todos) para o backend; o redirect de
  `blog.` é feito pelo Next (precisa que o host chegue ao app, por isso `blog.` está no `server_name`).
- SSL: CF Origin cert (`drhenriquebufaical.com.br` + `*.drhenriquebufaical.com.br`) em
  `/etc/ssl/portais/drhenriquebufaical.com.br/origin-cf.{pem,key}` (val. **2041**).
- **Origin só-CF:** `if ($cf_trusted=0) return 403` (geo em `00-cf-realip.conf`). Acesso direto ao IP = **403** (confirmado).
- **Cloudflare:** zona `12e801f1eb688c27067e0535e9057f9b`, **conta "COE"** (token qmix, mesmo do coegoiania).
  DNS A apex `77.37.69.175` → **`31.97.173.40`** (proxied); `www` e `blog` são CNAME do apex (seguem junto).
  Full(strict) + Origin cert.
- **Sem GitHub** — código canônico é a pasta local `d:\SITES\dr-henrique-bufaical-next`.
  Deploy direto por tar (local → VPS): `tar czf - src | ssh hostinger-vps-srv1166087 "tar xzf - -C /var/www/dr-henrique-bufaical"`,
  depois no VPS `export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH && npm run build &&
  pm2 reload henrique --update-env && sleep 3 && pm2 reload henrique-b --update-env && pm2 save`.
- Migrado do OpenGravity (`/var/www/dr-henrique-bufaical`, PM2 `dr-henrique-bufaical` porta 3007).
  **Cópia antiga no OpenGravity DELETADA em 22/06/2026** (PM2, 3 confs nginx, cert Let's Encrypt e
  `/var/www/dr-henrique-bufaical` removidos; porta 3007 liberada). Demais sites do opengravity intactos.

### cirurgiadecolunagoiania.com.br (HTML estático + blog WP em `/blog/`) — migrado 22/jun/2026

- Dr. Aurélio Felipe Arantes, ortopedista de coluna. **Site HTML estático** + **blog WordPress no
  subdiretório `/blog/`** (mesmo domínio, NÃO subdomínio — difere do joelho).
- HestiaCP (user **boot**), PHP **8.3**, Apache backend (lê `.htaccess`), dir
  `/home/boot/web/cirurgiadecolunagoiania.com.br/public_html` (estático na raiz, WP em `/blog`).
- **`.htaccess` crítico** na raiz: strip de `.html` (301 → URL limpa), ~30 redirects 301 de páginas
  antigas, regras AMP legadas, e regra que joga slug desconhecido da raiz → `/blog/$1/`. Funciona
  porque o Apache backend lê `.htaccess` (`AllowOverride All`).
- **PROXY_EXT sem `htm,html`**: removidos do proxy nginx do Hestia para que `.html` passe pelo Apache
  (senão nginx serviria `.html` direto e a regra `.html`→URL-limpa não dispararia).
- **Blog:** Banco MySQL **`boot_cdcoluna`** / user `boot_cdcoluna` / senha `<<REMOVIDO>>`
  (prefixo `wp_`, 322 posts). Tema Jannah-child. **Redis Object Cache** (PhpRedis, db **2**,
  prefixo `cirurgiadecolunagoiania.com.br:`).
- **LiteSpeed-cache REMOVIDO** (não há LiteSpeed no servidor novo) → page cache agora é **Cloudflare**
  (Cache Rule "Cache Everything" anônimo p/ estático+blog, bypass `/blog/wp-admin|wp-login|wp-json|xmlrpc`
  + cookies logado; edge TTL 4h). Auto-purge via mu-plugin `coluna-cf-autopurge.php`
  (constantes `COLUNA_CF_TOKEN`/`COLUNA_CF_ZONE` no wp-config).
- Hardening WP: mu-plugins `coluna-shield` (= s3de979-shield: XML-RPC off, esconde versão, anti
  user-enum, REST users bloqueado, security headers) + `author-privacy` + `coluna-perf`;
  `DISABLE_WP_CRON`=true + system cron do `boot` (`*/5` rodando `php8.3 wp-cron.php`); `WP_POST_REVISIONS=5`
  (4097 revisions limpas); salts rotacionados; mu-plugins Hostinger (preview/auto-updates) removidos.
- **SSL:** CF Origin cert (`*.cirurgiadecolunagoiania.com.br` + apex) em
  `/etc/ssl/portais/cirurgiadecolunagoiania.com.br/origin-cf.{pem,key}` (+`-ca.pem`), val. **2041**.
  Instalado no Hestia (`apache2.ssl.conf`/`nginx.ssl.conf`).
- **Origin só-CF:** includes `nginx{,.ssl}.conf_cfsecurity` em `/home/boot/conf/web/<dom>/`
  (`if ($cf_trusted=0) return 403` + bloqueio PHP em `^/blog/wp-content/uploads/.*\.php$`). Acesso
  direto ao IP = **403** (confirmado de IP externo).
- **DNS cutover (22/jun):** A apex `cirurgiadecolunagoiania.com.br` `77.37.69.175` → **`31.97.173.40`**
  (proxied); `www` é CNAME → apex (segue junto). SSL CF **Full(strict)** + Always-HTTPS + min TLS 1.2 +
  TLS 1.3 + Brotli + HTTP/3 + 0-RTT.
- Migrado do OpenGravity (`/home/qmix/web/cirurgiadecolunagoiania.com.br/`, DB `qmix_wp_blog_coluna`
  55MB + ~390MB arquivos). **Cópia antiga no OpenGravity ainda PRESENTE** (aguardando OK p/ deletar).

### distribuidorasdealimentos.com.br (Next.js + Postgres) — migrado 22/jun/2026

- Diretório nacional de distribuidoras de alimentos (93.687 registros). App **Next.js 16.2.1** em `/var/www/distribuidoras`.
- PM2 `distribuidoras`:3019 + `distribuidoras-b`:3030 (failover). nginx `/etc/nginx/conf.d/distribuidoras.conf` (upstream `distribuidoras_backend`). Node nvm **v20.20.2**.
- Banco: **PostgreSQL local** `distribuidoras_db` / user `distribuidoras_user` / senha `<<REMOVIDO>>`. Tabelas via Drizzle ORM (distributors, cities, states, categories, blog_posts, glossary_terms, etc.).
- `.env` em `/var/www/distribuidoras/.env`: `DATABASE_URL=<<REMOVIDO>> NextAuth secret, Google OAuth, Resend, ASAAS, GA4, QMIX_API_KEY, SERPAPI_API_KEY.
- **Uploads:** `/var/www/distribuidoras/public/uploads/blog/` (33MB de imagens das notícias QMIX). Alias nginx `/uploads/`.
- **Rewrite QMIX:** `/wp-json/sistema-qmix/v1/artigos` → `/api/wp-json/sistema-qmix/v1/artigos` (painel QMIX usa URL legada; rewrite dentro de `distribuidoras.conf`).
- **mgmt-api descontinuado:** sidecar HTTP `/mgmt-api/` na porta 9876 não foi recriado (acesso agora é via `ssh hostinger-vps-srv1166087`).
- SSL: CF Origin cert (`distribuidorasdealimentos.com.br` + `*`) em `/etc/ssl/portais/distribuidorasdealimentos.com.br/origin-cf.{pem,key}` (val. **2041**).
- Origin só-CF (403 fora do Cloudflare). DNS A apex → `31.97.173.40` (proxied).
- Deploy: `ssh hostinger-vps-srv1166087`, `cd /var/www/distribuidoras`, `export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH`, `npm run build`, `pm2 reload distribuidoras --update-env && sleep 3 && pm2 reload distribuidoras-b --update-env`.
- Migrado do `clinicas-vps` (`31.97.162.199`, HestiaCP user `user`, dir `/home/user/web/distribuidorasdealimentos.com.br/app`). Database e uploads transferidos via dump + tar. **Cópia antiga DELETADA em 22/06/2026** (PM2, postgres DB, dir, domínio Hestia, templates customizados Hestia `nextjs-distribuidoras`).

### smspix.com.br (Next.js 16 + Prisma/Neon) — venda de números virtuais / SMS

- Loja de **números virtuais para receber SMS** (WhatsApp, Telegram, Instagram, Google, OpenAI…),
  pagamento em **PIX**, carteira com saldo. App **Next.js 16.2.1** (App Router, React 19) em
  `/var/www/sms-virtual` (nome da pasta ≠ domínio). **Sem git local, sem cópia em `d:\SITES`** —
  o código canônico é o próprio servidor (deploy por edição direta / scp).
- PM2: `sms-web`:3060 + `sms-web-b`:3061 (failover) + `sms-worker` (background). Node nvm v20.20.2.
- nginx: `/etc/nginx/conf.d/sms-virtual.conf` (upstream `sms_backend`) + `/etc/nginx/conf.d/smspix.conf`
  (vhosts apex/www, `www` → 301 apex). Tem `limit_req zone=nextjs_ip burst=15` (anti-bot bombardier).
- **Banco: PostgreSQL na Neon** (não é local!) — `ep-polished-feather-atbb3iwo-pooler.c-9.us-east-1.aws.neon.tech/neondb`,
  user `neondb_owner` / senha `<<REMOVIDO>>`. Prisma 6 (`prisma/schema.prisma`, migrations `0_init` e `1_admin_auth`).
- SSL: CF Origin cert em `/etc/ssl/portais/smspix.com.br/origin-cf.{pem,key}`. **Origin só-CF** (`$cf_trusted=0` → 403).
- **Fornecedores (atacado) com failover:** `5sim` (USD) e `handlerapi` (Grizzly/Tiger, USD).
  Registro em `lib/providers/index.ts`; sem API key o provider é ignorado. `SMS_USE_MOCK=1` liga o mock.
- **Motor de preço** (`lib/pricing.ts`): custo nativo → BRL (`USD_BRL_FALLBACK` × `1+FX_MARGIN`) → markup.
  Markup por regra em `MarkupRule` (GLOBAL < SERVICE < SERVICE_COUNTRY), fallback nas envs
  `MARKUP_DEFAULT_MULTIPLIER=5.0`/floor 50c e `MARKUP_WHATSAPP_MULTIPLIER=4.0`/floor 90c.
  Regra ativa no banco hoje: **whatsapp ×2.0, piso R$0,90**.
- **Carteira** (`lib/wallet.ts`): razão contábil com `WalletTransaction`. Compra faz `FREEZE`;
  SMS chegou → `settle` (DEBIT); timeout/cancel → `unfreeze` (cliente **não paga**).
  Débitos usam `updateMany` condicional (atômico no Postgres, nunca fica negativo).
- **Worker** (`worker/index.ts`): poll de ativações PENDING a cada 3s; sync do catálogo a cada 15min
  (~1798 linhas: fivesim 1298 + handlerapi 500, leva ~4min); check de saldo dos fornecedores; housekeeping.
- **Pagamento:** OpenPix (PIX) — webhook em `app/api/webhooks/openpix/route.ts`. **`OPENPIX_WEBHOOK_SECRET` está VAZIO.**
- E-mail: **Resend** (domínio verificado, sa-east-1), `REQUIRE_EMAIL_VERIFICATION=true`. Auth: NextAuth v5 (credentials).
- Admin em `/admin` (dashboard, ativações, financeiro, markup, providers, usuários, logs); acesso por `ADMIN_EMAILS`.
- SEO: `app/sitemap.ts` dinâmico (só combos **com estoque**), páginas programáticas
  `/numero-virtual/[servico]` e `/numero-virtual/[servico]/[pais]`, blog estático em `lib/blog.ts`,
  JSON-LD Product/AggregateOffer + FAQPage. `NEXT_PUBLIC_INDEXABLE=true` (domínio definitivo).
- Deploy: `ssh hostinger-vps-srv1166087`, `cd /var/www/sms-virtual`,
  `export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH && npm run build && pm2 reload sms-web && sleep 3 && pm2 reload sms-web-b`.
- Estado (30/07/2026): 14 usuários, 1 recarga paga (R$10), 2 ativações (ambas EXPIRED/estornadas), 1791 linhas de catálogo.

#### Sistema de suporte por chamados (tickets) — 30/07/2026

Portado da arquitetura do **enjai** (`/var/www/enjai`, `app/(loja)/suporte` + `app/admin/tickets`),
reescrito nas convenções do smspix (server actions + Prisma + CSS do site, sem API routes).

- **Banco:** migration `2_tickets` — `Ticket`, `TicketMensagem`, `RespostaRapida` + enum `TicketStatus`
  (ABERTO / EM_ANDAMENTO / RESOLVIDO / FECHADO). Puramente aditiva; nenhuma tabela existente alterada.
- **Cliente:** `/suporte` (formulário, FAQ, JSON-LD ContactPage+FAQPage+Breadcrumb) e
  `/suporte/acompanhar` (consulta por **número + e-mail**, thread e resposta). Funciona **logado ou
  deslogado** — logado, o form oferece as últimas 10 compras para vincular ao chamado.
- **Admin:** `/admin/tickets` (fila "precisam de resposta", bolinha de não-lido, filtros por status/
  categoria/busca, tempo de espera) e `/admin/tickets/[id]` (contexto do cliente com saldo/recargas/
  ativações + últimas 5 compras, thread, respostas prontas com 1 clique, fechar com motivo).
  A aba "Chamados" no layout do admin mostra **badge vermelho** com quantos aguardam resposta.
- **Lógica** em `lib/tickets.ts`; server actions em `lib/ticket-actions.ts`.
  - Numeração `SUP-001` sequencial com **retry em colisão** (P2002) — seguro sob concorrência.
  - **Anti-duplicata:** mensagem nova do mesmo e-mail sobre a mesma ativação (ou mesma categoria)
    entra no chamado aberto em vez de criar outro.
  - Par `(aguardando, lidoAdmin)` governa a fila: cliente escreve → volta para a fila e para não-lido;
    suporte responde → sai da fila. Chamado RESOLVIDO em que o cliente escreve **reabre** sozinho.
  - Rate limit: 3 chamados/hora por e-mail, 20 consultas/10min.
- **E-mails** (Resend, layout escuro do site): `sendTicketAbertoEmail` (confirmação com o número) e
  `sendTicketRespostaEmail` (resposta do suporte, com o texto embutido). Admin é avisado via `sendAlert`
  (e-mail + Telegram se configurado).
- **13 respostas prontas** já cadastradas: `tsx scripts/seed-respostas-rapidas.ts` (idempotente).
- **Teste:** `tsx scripts/teste-tickets.ts [email]` — 22 verificações ponta a ponta (abertura,
  anti-duplicata, isolamento por e-mail, contadores, resposta admin/cliente, reabertura, bloqueio em
  chamado fechado, validações). Roda contra o banco real e limpa o que criou. 22/22 em 30/07/2026.

**Deploy sem tocar no site no ar (padrão a usar daqui em diante):** compilar em
`/var/www/sms-virtual-build` (cópia do projeto + `cp -a node_modules`, **não** symlink — o Turbopack
recusa symlink que aponta para fora da raiz) e só então trocar o build pronto:
```bash
cd /var/www/sms-virtual-build && npm run build
cd /var/www/sms-virtual && rm -rf .next-new .next-old && cp -a ../sms-virtual-build/.next .next-new
mv .next .next-old && mv .next-new .next
pm2 reload sms-web && sleep 4 && pm2 reload sms-web-b && pm2 reload sms-worker && pm2 save
```
Rollback: `mv .next .next-ruim && mv .next-old .next && pm2 reload sms-web sms-web-b`.

#### ✅ MIGRADO DO NEON PARA POSTGRESQL LOCAL (01/08/2026)

**O banco agora é local.** `smspix_db` no PostgreSQL 16 do próprio servidor —
`<<REMOVIDO>><senha em /root/.smspix-db-pass>@127.0.0.1:5432/smspix_db`.
Backup do `.env` antigo (com o Neon): `.env.bak-neon-20260731`.

**Dados conferidos, origem × destino, batendo em tudo:** 15 usuários, 1 chamado, 2 ativações,
1 recarga, R$10,00 em carteiras, 1.791 linhas de catálogo, 5 lançamentos, 13 respostas rápidas,
207 logs. A Isbelia chegou íntegra (saldo R$10,00 + chamado SUP-001 EM_ANDAMENTO).

**Três armadilhas na migração (todas custaram tentativa):**
1. **`pg_dump` 16 recusa servidor 18.** O Neon roda PostgreSQL **18.4**; o cliente local é 16.14 →
   `aborting because of server version mismatch`. Solução: exportar por `\copy` para CSV via `psql`
   (o psql não faz essa checagem), não por `pg_dump`.
2. **`CSV HEADER` NÃO casa colunas por nome** — só *pula* a linha do cabeçalho e insere por posição.
   Como o `db push` criou as colunas em ordem física diferente da do Neon, os dados entraram
   trocados (`invalid input syntax for type boolean` num campo de data). Solução: lista explícita de
   colunas lida do próprio cabeçalho do CSV:
   `\copy public."User" ("id","email",...) FROM ... WITH (FORMAT csv, HEADER true)`.
3. **O schema do Neon tinha DRIFT em relação às migrations.** `User.passwordHash` é `NOT NULL` no
   que as migrations criam, mas o Neon tinha linhas com nulo (login via Google) — alguém rodou
   `db push` no Neon sem gerar migration. O arquivo `schema.prisma` diz `String?`, que é o certo.
   Solução: recriar o banco local com `prisma db push` (o schema é a fonte da verdade) e depois
   `prisma migrate resolve --applied` em cada migration, porque o `db push` não registra histórico.

**Backup automático** (o Neon fazia por nós): `/root/backup-smspix.sh` no cron às **6h20**,
guarda 14 dias em `/root/backups/smspix/`, e **avisa no Telegram se o dump sair vazio**.

**Suítes de teste rodadas contra o banco local, todas verdes:** `teste-estoque`,
`teste-nunca-abaixo-custo`, `teste-handlerapi`, `teste-tickets`.

**Ganho de latência:** de 118-126 ms (Neon us-east-1) para **0,6-1,5 ms**. ~200×.

**Neon:** pode ser desativado. Ainda tem a cópia dos dados até 31/07; nada mais escreve lá.

#### Relatório diário de crédito no atacado (01/08/2026)

`lib/relatorio-fornecedores.ts` + `scripts/relatorio-fornecedores.ts`, no cron
`0 11 * * *` UTC = **8h de Brasília**. Vai por e-mail **e** Telegram (categoria `fornecedor`).

**O que o relatório responde:** não "quanto tem na conta", e sim **por quantos dias ainda dá** e
**quantas ativações cabem**. Saldo de US$5 parece confortável até se descobrir que o consumo diário
é US$4.

- **Consumo** = custo das ativações **RECEIVED** dos últimos 7 dias. As EXPIRED são estornadas pelo
  fornecedor; contá-las inflaria o gasto e geraria alarme falso.
- **Sem histórico de consumo**, cai para **capacidade**: saldo ÷ custo do WhatsApp Brasil daquele
  fornecedor. Sem esse fallback o relatório dizia **"🟢 ok" com saldo para 4 clientes** — o tipo de
  sinal tranquilizador e falso que ensina o dono a ignorar o alerta de verdade. Níveis por
  capacidade: <15 crítico, <50 atenção.
- **Links de recarga verificados** (retornam 200): 5sim `https://5sim.net/`,
  handlerapi/Grizzly `https://grizzlysms.com/profile`. As URLs "óbvias" (`/settings/payments`,
  `/billing`, `/pay`) dão **404** — não inventar.

**Estado no primeiro envio:** fivesim R$29,36 (~3 ativações) e handlerapi R$29,16 (~4) — **crítico
nos dois**. Recarga é a pendência mais urgente do projeto.

#### Preço ancorado no concorrente + comissão de 20% (01/08/2026, migration `7_comissao_20`)

**Análise de concorrência** (Cent3r, Salvy, Yesim, BR DID): nenhum vende ativação descartável como
nós — todos alugam número por mês. O único produto comparável é o **pacote de temporários da
Cent3r**: R$19,90 (5 un.), R$17,90 (10), **R$16,90 (25 un.)**. Mensalidades: Cent3r R$19,90,
BR DID WhatsApp R$28,30, Salvy R$29,90, BR DID "número para apps" R$34,90.

**Descoberta que inverteu a decisão:** o smspix estava a R$14,12, já **16% abaixo** do concorrente
mais barato. Aplicar "10% abaixo do mais barato" era um **AUMENTO**, não redução — e o dono optou por
aplicar mesmo assim, porque a margem extra banca a comissão de afiliado.

**WhatsApp Brasil: R$14,12 → R$15,21** (margem R$7,06 → **R$8,15**, de 50% para 54%).
Implementado como regra `MarkupRule` `SERVICE_COUNTRY` (whatsapp/brazil, ×2,0, **piso 1521**,
priority 100) — **piso, não preço fixo**: o preço é `max(custo × 2, R$15,21)`. Se o custo do atacado
subir a ponto de custo×2 passar de R$15,21, o preço sobe junto e a margem não é espremida em
silêncio. Script: `tsx scripts/preco-whatsapp-brasil.ts` (idempotente, mostra antes/depois).

**Comissão padrão de afiliado: 10% → 20%.** Continua limitada pelo teto de metade da margem real.
Em `whatsapp/brazil`: 20% = R$3,04, sobra R$5,11 por venda. Acima de 25% o teto passa a cortar.

**A regra NÃO se aplica ao resto do catálogo:** existe referência de concorrente para **2 dos 1.759
combos** (os concorrentes vendem só número brasileiro, quase só WhatsApp). Nos demais o motor de
custo × markup continua mandando — ancorar "Twitter Indonésia" em preço de concorrente brasileiro
não faria sentido nenhum.

#### Manchete de preço só com combo comprovado (01/08/2026)

O "a partir de" da home, das páginas de serviço e do **JSON-LD** passou a usar
`precoMinimoComprovado(service)` — o combo mais barato **que já entregou** (`buyOk > 0`), com
fallback para o catálogo quando o serviço ainda não tem nenhum comprovado. Anunciar o mais barato do
catálogo é apostar num combo que talvez nunca tenha funcionado, e quem descobre é o cliente.

Junto, a **sondagem mudou de prioridade**: `manchete > mina > mais barato`. A "manchete" é o combo
mais barato de cada serviço — o que vira o "a partir de". Sem isso a correção sairia pela culatra:
o Telegram anuncia R$3,00 mas o único combo comprovado era a Estônia a R$13,20 (só ela tinha sido
sondada), e o site passaria a mostrar 4× o preço real.

**Medição antes de mexer:** em **8 dos 10 serviços** o mais barato anunciado já era o comprovado —
a correção do `getCatalog` do 5sim já tinha resolvido quase tudo.

#### Cobrança automática de chamados parados (01/08/2026, migration `6_lembretes_ticket`)

Quando o suporte responde e o cliente some, o sistema cobra **1× por dia, por 5 dias**, e no 5º
encerra o chamado avisando que não foi resolvido.

- **Só age quando a bola está com o CLIENTE** (`aguardando = false`) **e já existe resposta nossa**
  (`mensagens: { some: { remetente: "admin" } }`). Cobrar quem ainda não foi atendido seria absurdo.
- **Qualquer mensagem zera a régua** — do cliente OU do suporte (`lembretes = 0`).
- **Tom escala**: 1ª "ainda precisa de ajuda?" → 4ª "vamos encerrar amanhã" → 5ª encerramento.
  Nunca vira ameaça: o cliente pode ter resolvido sozinho.
- **Encerrado por silêncio REABRE quando o cliente responde.** O e-mail promete isso, então
  `responderComoCliente` abre exceção para `motivoFechamento === "sem_resposta"` — promessa que o
  sistema não cumpre é pior do que não ter prometido.
- **Auditoria**: tabela `LembreteTicket` (numero, sucesso, erro, enviadoEm) — dá para provar quantas
  vezes tentamos falar antes de encerrar. Visível em `/admin/tickets/[id]` e na coluna "Cobranças"
  da lista.
- Roda no worker junto do ciclo de sync (a cada 15 min), então a cadência de 24h é respeitada.

**Teste:** `tsx scripts/teste-lembretes.ts` — 20 verificações, simula a passagem dos 5 dias
empurrando `ultimoLembreteEm` para trás. 20/20.

**Armadilha do teste (mesma de antes, anotada de novo):** a primeira asserção contava cobranças no
**banco inteiro** e falhou porque um chamado REAL (SUP-001, da Isbelia) estava legitimamente na fila
— e recebeu a 1ª cobrança de verdade, corretamente. Asserção precisa ser escopada ao próprio
registro de teste, nunca a contadores globais.

#### ✅ ENTREGUE E NO AR — 01/08/2026 (vendas liberadas)

**Vendas e recargas REATIVADAS** (`VENDAS_PAUSADAS="0"`). A chave geral continua em
`lib/config.ts` para uso futuro — trava `doBuy` e `doCreateRecharge` no servidor, não só o botão.
Como `NEXT_PUBLIC_` é embutido no bundle, mexer nela exige **rebuild**, não só `pm2 reload`.
O lembrete no Telegram para sozinho: o script checa `VENDAS_PAUSADAS="1"` antes de disparar.

**Programa de afiliados COMPLETO e no ar:** `/afiliados` (página pública com FAQ e JSON-LD),
`/afiliados/painel` (link, KPIs, comissões, saque PIX) e `/admin/afiliados` (aprovar, ajustar %,
pagar saques). Ligado no header, no menu mobile, no rodapé, no sitemap e na barra do admin.
**Nenhum afiliado inscrito ainda** — o programa nasce vazio, esperando as primeiras inscrições.

**Suítes de teste, todas verdes contra o banco local:**
`teste-estoque` · `teste-nunca-abaixo-custo` · `teste-handlerapi` · `teste-tickets` ·
`teste-afiliados` (24 verificações) · `teste-trava-prejuizo`.

**Validação final em produção:** compra real entregue (`+12722954285`, venda R$0,50 / custo R$0,10),
cancelamento e estorno corretos. Bypass externo do Cloudflare = **403** nos dois protocolos.
Webhooks OpenPix e Telegram respondendo **401** (vivos e protegidos por assinatura).
5 cabeçalhos de segurança presentes. Googlebot = 200. Zero erros nos logs.

**Ganho do banco local, medido:** o sync do catálogo caiu de **~4 minutos (Neon)** para
**8-11 segundos**. ~25× mais rápido no que mais roda.

**Estado dos dados:** 15 usuários, 1 chamado (SUP-001, Isbelia), R$10,00 em carteira,
1.764 combos em estoque, 21 em quarentena de estoque fantasma.

**Limpeza feita:** usuários e linhas de teste removidos; CSVs da migração (continham dados de
clientes) apagados com `shred`; dump do Neon, scripts temporários e banco `smspix_rascunho`
removidos; `.next-old` limpo.

**Pendências conhecidas (nada bloqueante):**
- **Cloudflare:** falta ligar Bot Fight Mode e mudar SSL de `full` para `full (strict)` — as duas
  chamadas foram bloqueadas pelo classificador de permissões; o Origin CA já está instalado, então
  o `strict` é seguro. Comandos prontos na seção de segurança.
- **Saldo baixo nos fornecedores:** ~US$ 5 em cada (≈19 ativações da Colômbia). Vale recarregar.
- **Câmbio fixo** em `USD_BRL_FALLBACK="5.6"` +5% de margem. Se o dólar passar de R$5,88 a margem
  encolhe em silêncio. Com o markup ×2 do WhatsApp só haveria prejuízo se o dólar dobrasse.
- **Neon** pode ser desativado: nada mais escreve lá.

#### Histórico: vendas pausadas em 31/07/2026 (RESOLVIDO em 01/08)

**O Neon estourou a cota de computação do plano gratuito** e parou de aceitar QUALQUER conexão
(`Your account or project has exceeded the compute time quota`). A home passou a devolver **500**.

**Estado atual:**
- Site **no ar** e indexável: home, blog, suporte e páginas pSEO todas em 200. Cada consulta ao
  banco cai para valor neutro em vez de derrubar a página (`.catch(() => …)` na home, nas páginas
  `/numero-virtual/*` e nos respectivos `generateMetadata`).
- **Compras e recargas PAUSADAS** por decisão do dono, até ele mandar reativar.
- **Não foi possível extrair os dados**: o Neon bloqueia até `pg_dump`. Retry automático rodando em
  `/root/aguarda-neon.sh` (60 tentativas de 2 em 2 min, log em `/root/aguarda-neon.log`).
- Dados presos lá: 14 usuários, saldo R$10 da Isbelia, chamado SUP-001, 1 recarga paga, 13 respostas
  rápidas. O catálogo não importa — regenera pelo sync.

**Chave geral de vendas** (`lib/config.ts`): `VENDAS_PAUSADAS` bloqueia `doBuy` **e**
`doCreateRecharge` no servidor (botão desabilitado não impede POST na mão), com banner na home e no
painel. Recarga entra na pausa junto porque o pior caso é o cliente pagar o PIX e o webhook não
conseguir creditar.

**Para REATIVAR:**
```bash
ssh hostinger-vps-srv1166087
cd /var/www/sms-virtual
sed -i 's/^VENDAS_PAUSADAS="1"/VENDAS_PAUSADAS="0"/; s/^NEXT_PUBLIC_VENDAS_PAUSADAS="1"/NEXT_PUBLIC_VENDAS_PAUSADAS="0"/' .env
# NEXT_PUBLIC_ é embutido no bundle: precisa rebuildar, não basta reload
tar cf - --exclude=.next --exclude=node_modules . | (cd ../sms-virtual-build && tar xf -)
cd ../sms-virtual-build && set -a && . ../sms-virtual/.env && set +a && npm run build
cd ../sms-virtual && rm -rf .next-old && cp -a ../sms-virtual-build/.next .next-new && mv .next .next-old && mv .next-new .next
pm2 reload sms-web && sleep 4 && pm2 reload sms-web-b
```
**Lembrete automático:** `/root/lembrete-vendas-pausadas.sh` no cron (`0 12,21 * * *` UTC = 9h e 18h
de Brasília) manda no Telegram enquanto `VENDAS_PAUSADAS="1"`. Para sozinho ao reativar.

**Banco local já preparado:** `smspix_db` (usuário `smspix`, senha em `/root/.smspix-db-pass`),
PostgreSQL 16 local, **5 migrations aplicadas, 13 tabelas**. Deixado VAZIO de propósito para receber
o restore do Neon sem conflito de `_prisma_migrations`.
Trocar depois: `DATABASE_URL="<<REMOVIDO>><senha>@127.0.0.1:5432/smspix_db"` (e `DIRECT_URL`).

**Latência medida — o argumento a favor do banco local:** Neon (us-east-1) leva **118-126 ms** só no
TCP e 250 ms com TLS; o PostgreSQL local responde em **0,6-1,5 ms**. ~200× mais rápido. Explica os
syncs de 4 minutos. E o servidor já roda 10 bancos locais (radar_leiloes, distribuidoras, clinicas,
palpitemestre, cliquex, ptdf, qmiximoveis, cortes_ia, facoqr, backlinkguard) — o smspix era o único
projeto da casa com banco externo.

#### CAUSA RAIZ do estoque fantasma: bug de preço no getCatalog do 5sim (30/07/2026)

O "estoque fantasma" era **sintoma**. A doença estava em `FiveSimProvider.getCatalog()`.

O `/guest/prices` do 5sim devolve, por país, **várias operadoras**, cada uma com `cost` e `count`.
O laço antigo escolhia o "melhor custo" de forma que **uma operadora ESGOTADA podia definir o preço**,
enquanto o `stock` somava o `count` de TODAS. Resultado: o catálogo saía com o **preço de quem não
tem número** e o **estoque de quem tem**.

```
whatsapp/poland   orange    cost 0.0769  count 0        <- virava o nosso preço
                  virtual34 cost 1.0628  count 925.586  <- era o único com número
```
Vendíamos a **R$0,90** um número que custa **R$6,25**.

**Escala medida antes da correção:** 472 de 1.298 combos 5sim (**36%**) com custo errado, até **20×**
subestimado (`tiktok/southafrica` US$0,0128 no catálogo vs US$0,2564 real).

**Correção** (`lib/providers/fivesim.ts`): só operadora com `count > 0` pode precificar.
```ts
const count = op.count ?? 0;
totalStock += count;
if (count <= 0) continue;            // esgotada não precifica
if (!best || op.cost < best.cost) best = { cost: op.cost, rate: op.rate };
```

**Resultado após ressincronizar:** 1.295 de 1.295 combos com custo **100% igual** ao do fornecedor.
467 linhas tiveram o custo corrigido para cima, 823 já estavam certas, **nenhuma caiu**.
Maiores correções de preço ao cliente: `instagram/mauritius` R$6,65→R$101,80, `telegram/poland`
R$3,00→R$50,90, `whatsapp/poland` R$0,90→R$12,50, `tiktok/southafrica` R$0,50→R$7,55.
WhatsApp mais barato saiu de R$0,90 (fictício) para **R$1,32** (real).

**Por que isso enganou todas as auditorias anteriores:** a consulta "existe linha com
`priceCents <= costCents`?" sempre devolvia ZERO — porque o `costCents` armazenado **também estava
errado**. A margem parecia saudável (média R$5,55) sobre um custo fictício. Só comparar contra a
API do fornecedor revela. **Lição: auditar dado derivado contra a fonte externa, não contra ele mesmo.**

**Armadilhas operacionais descobertas no processo:**
- Rodar `syncCatalog()` manualmente **enquanto o worker sincroniza** dá `deadlock detected` (40P01)
  no `updateMany` que zera o estoque. Chegou a abrir **338 conexões** no Neon. Deixar o worker fazer,
  ou parar o worker de verdade antes (conferir com `pm2 list`, o `pm2 stop` pode não pegar).
- O `handlerapi.getCatalog()` **não tem esse bug**: lê `cost` e `count` do mesmo objeto.

#### Garantia "nunca vender abaixo do custo" — 4 camadas (30/07/2026)

Decisão do dono: **manter os preços como estão** (WhatsApp ×2,0, piso R$0,90) e blindar contra venda
no prejuízo. Quatro camadas independentes, todas testadas:

1. **O preço nasce ≥ custo.** `priceFromCost = max(custo × multiplicador, piso)`. Com multiplicador
   ≥ 1 é matematicamente impossível nascer no prejuízo.
2. **Trava no failover.** Fornecedor cujo `costCents > priceCents` anunciado é pulado (log
   `guard/blocked`); se não sobrar nenhum, estorna e lança `PriceChangedError`.
3. **Teto NO FORNECEDOR (novo).** `buyNumber()` ganhou `maxCostNative` — o teto que aceitamos pagar,
   na moeda do fornecedor, calculado por `fromBRLCents(priceCents, moeda)`.
   - 5sim: `?maxPrice=X` na URL de compra.
   - handlerapi: **`maxPrice` estava fixo em `"0"` = SEM TETO** — o fornecedor podia cobrar qualquer
     valor e só descobriríamos depois de comprado. Agora vai o teto real.
   Esta é a única camada que **não depende de o nosso catálogo estar atualizado**: fecha a janela
   entre o sync (15 min) e a compra. Quem recusa é o fornecedor, antes de qualquer cobrança.
4. **Validação no admin.** `criarRegraMarkup` aceitava `multiplier > 0`; um 0,5 faria o catálogo
   inteiro nascer no prejuízo. Agora exige `>= 1`.

**Testes:** `tsx scripts/teste-nunca-abaixo-custo.ts` — 13 verificações (13/13), incluindo a captura
da URL para provar que o teto realmente sai na requisição.
**Validação com compra real dos DOIS caminhos** (o teto podia quebrar todas as compras):
- handlerapi — whatsapp/brazil, número `+5521969757619`, venda R$14,12 / custo R$7,06.
- 5sim — twitter/usa, número `+13025795056`, venda R$0,50 / custo R$0,10.
Ambos entregues e cancelados; nenhuma compra quebrada pelo parâmetro novo.

**Estado do catálogo:** 0 linhas com preço ≤ custo; pior margem +R$0,40; margem média R$5,55.
As 2 únicas ativações com prejuízo do histórico são as da Isbelia (30/07 manhã, pré-correção).

**Por que o bug existia** (para não repetir o padrão): três decisões corretas isoladamente —
(a) cada linha do catálogo é calculada por fornecedor e sempre lucrativa; (b) a loja mostra a mais
barata; (c) a compra faz failover para o próximo fornecedor. O defeito mora na **costura entre (b) e
(c)**: o preço vem do fornecedor A, a entrega pode vir do B, e ninguém verificava se o custo de B
cabia no preço de A. Só dispara quando um fornecedor **mente sobre estoque** — por isso nenhum teste
unitário pegaria.
**Agravante:** a regra `whatsapp ×2,0` (criada no banco, não no código) encolheu a folga. Medição:
19 minas em 41 combos WhatsApp (46%) contra 34 em 387 nos demais (9%); com o padrão ×5,0 as minas do
WhatsApp cairiam de **19 para 3**. Números baratos são os perigosos — no Brasil a folga é R$5,28,
na Colômbia era R$0,60.

#### Auditoria de segurança — 30/07/2026

Zona `smspix.com.br` = **`b53b7dcc04f21fba190227aff96ee4b6`**, conta **conta27** do
`D:\SISTEMAS\Cloudflare\contas.json` (não estava mapeada em lugar nenhum antes).

**Já estava OK** (herdado do hardening em massa de 28-29/07): rate limit nginx `nextjs_ip`
(5r/s, burst 15) nos dois vhosts; origin só-CF funcionando (bypass externo = 403, testado);
fail2ban com 5 jails (`nginx-limit-req` 1.603 banimentos totais, `recidive` 26); security_level
`high`; browser_check on; WAF com skip do Googlebot em 1º lugar; rate-limit de borda; security
headers via Transform Rule.

**Corrigido: certificado de origem era AUTOASSINADO** (`issuer = CN = smspix.com.br`) — por isso o
SSL da zona estava em `full` e não `full (strict)`. Na prática o Cloudflare **não validava nada**
ao falar com a origem. Emitido Origin CA real (`POST /certificates`, RSA, `smspix.com.br` +
`*.smspix.com.br`, válido até **2041**), instalado em `/etc/ssl/portais/smspix.com.br/`.
Backups: `origin-cf.{pem,key}.bak-autoassinado-20260730`.
Conferido antes do reload: módulos do cert e da chave batem (`openssl ... -modulus | md5`).

**Corrigido: webhooks podiam ser desafiados pelo Cloudflare.** A regra WAF nº 4 dá
`managed_challenge` em `cf.threat_score > 30` — a OpenPix ou o Telegram caindo nessa faixa
receberiam um desafio e o **pagamento não seria creditado**. Criada regra `skip` (2ª posição,
antes de qualquer challenge) para `/api/webhooks/openpix` e `/api/webhook/telegram`.
WAF agora em **5/5 regras** (limite do plano Free) — para adicionar outra, é preciso estender uma
existente.

**PENDENTE (bloqueado pelo classificador de permissões, precisa de OK do usuário):**
```bash
Z=b53b7dcc04f21fba190227aff96ee4b6; T=<token conta27>
curl -X PUT   ".../zones/$Z/bot_management"   -H "Authorization: Bearer $T" -d '{"fight_mode":true}'
curl -X PATCH ".../zones/$Z/settings/ssl"     -H "Authorization: Bearer $T" -d '{"value":"strict"}'
```
O `strict` só é seguro **porque** o Origin CA já está instalado — antes disso daria 526.

**Decisão deliberada: 0-RTT fica DESLIGADO.** O playbook sugere ligar, mas 0-RTT permite replay de
requisições; num site que move dinheiro (webhook de PIX, compra debitando saldo) o ganho de
latência não paga o risco.

#### Estoque fantasma — solução definitiva (30/07/2026, migrations 3 e 4)

O catálogo dos fornecedores é **vitrine, não estoque**. A única fonte de verdade é a chamada de
compra. A solução tem 4 camadas, todas em produção:

1. **Medir** (`lib/estoque.ts`) — `ServicePrice` ganhou `buyOk`, `buyFail`, `failStreak`,
   `lastOkAt`, `lastFailAt`. `registrarFalha()`/`registrarSucesso()` são chamados em toda compra
   real **e** em toda sondagem. O campo `successRate` que já existia é a taxa que o fornecedor
   **alega** — não serve para decidir nada.
2. **Punir com backoff** — quarentena de 15 min → 1 h → 6 h → 24 h conforme `failStreak`.
   Falha isolada pode ser azar; falha repetida é mentira sistemática.
3. **Perdoar** — uma entrega de verdade zera o streak, limpa `blockedUntil` e devolve a linha à
   vitrine. Sem isso um combo bom ficaria banido para sempre por um azar.
4. **Sondar** (`lib/probe.ts`, no worker a cada 15 min, 3 por ciclo) — o worker testa os combos
   suspeitos em vez de esperar o cliente descobrir.
   **A economia é o que torna a ideia viável: sondar um combo FANTASMA custa ZERO** (a compra
   falha, nada é cobrado). Só custa sondar um combo REAL — e essa compra é cancelada e estornada.
   Descobrimos as mentiras de graça. Limite de 3 por ciclo é proposital: fornecedor que vê muito
   cancelamento restringe a conta.

`combosParaSondar()` prioriza as **minas** (combos onde o 2º fornecedor custa mais que o preço
anunciado pelo 1º) e, entre elas, as mais baratas — que são as que mais aparecem na loja.

**Visibilidade:** `/admin/providers` ganhou a seção "Estoque real" — em quarentena, comprovados,
nunca testados, mentirosos crônicos, taxa real de entrega por fornecedor, tabela de quem está em
quarentena e ranking de quem mais mente.

**Descoberta que derrubou uma hipótese:** cheguei a cogitar rebaixar o 5sim a fornecedor de reserva.
A primeira sondagem real mostrou que **o 5sim entrega normalmente** (twitter/israel e twitter/usa
entregues na hora). A mentira é **por combo, não por fornecedor** — o que valida medir por
(fornecedor, serviço, país) em vez de aplicar regra no fornecedor inteiro.

**Testes:** `tsx scripts/teste-estoque.ts` — 24 verificações (backoff, punição, perdão, o sync não
ressuscitando quarentena, prioridade da sondagem, estatísticas, fuso). Rodado 2× seguidas: 24/24.

**Armadilhas do teste (custaram tempo, não repetir):**
- Asserção com tolerância de 5 s em tempo de quarentena é **intermitente**: cada ida ao Neon leva
  1–2 s. Usar faixa generosa (90 s) — o que importa é o degrau do backoff, não o milissegundo.
- Assertar posição em `combosParaSondar(10)` testa o **tamanho do catálogo**, não a regra: o banco
  real tem dezenas de minas mais baratas que qualquer combo fictício. Pedir a lista inteira.

#### Dois bugs silenciosos achados nos logs (30/07/2026)

Auditoria de `/admin/logs` revelou um `handlerapi/check` devolvendo **página HTML do Cloudflare**.
A investigação expôs dois bugs latentes com a mesma raiz: `call()` não validava que a resposta
pertencia ao protocolo handler_api.

1. **Perda silenciosa de dinheiro.** `call()` só lançava se o corpo casasse com um erro conhecido
   **ou** se o HTTP não fosse 2xx. Com **HTTP 200 + HTML** (interstitial do Cloudflare, manutenção)
   o HTML passava como resposta boa; `checkOrder()` não casava com nenhum `STATUS_` e caía no
   `return PENDING`. Ou seja: **SMS entregue que nunca era lido** — a ativação expirava, o cliente
   era estornado (certo para ele), o número tinha sido consumido e o custo de atacado ficava
   conosco, sem nenhum registro de que algo deu errado.
2. **Alarme falso de saldo.** `getBalance()` fazia `return m ? Number(m[1]) : 0` — resposta
   ilegível virava **saldo zero**, e o monitor disparava "saldo zerado, recarregue com urgência"
   sobre um problema inexistente.

**Correção:** constante `RESPOSTA_VALIDA = /^(ACCESS_|STATUS_|EARLY_CANCEL|\{|\[)/` — toda resposta
legítima do handler_api começa com um desses tokens ou é JSON. Qualquer outra coisa vira
`PROVIDER_DOWN`. `getBalance()` passou a lançar em vez de devolver 0.
**Teste:** `tsx scripts/teste-handlerapi.ts` — 13 verificações com `fetch` trocado por respostas
controladas (nenhuma chamada real). 13/13.

**Observabilidade, no mesmo lote:**
- A trava de prejuízo gravava `action: "buy", status: "error"`, inflando o KPI "Erros de provider
  (24h)" com o sistema funcionando certo. Virou `action: "guard", status: "blocked"`.
- `probe.ts` só registrava sondagem bem-sucedida. Fantasma encontrado — a informação mais valiosa —
  não deixava rastro. Agora grava `status: "fantasma"` com o preço que era anunciado.

#### Fuso horário — America/Sao_Paulo (30/07/2026)

O servidor roda em UTC, então toda data aparecia **3 h adiantada** (compra das 19h exibida como 22h).
- **`lib/datas.ts`** — `dataHora`, `dataHoraCurta`, `data`, `dataExtenso`, `hora`, `faz`, todas com
  `timeZone: "America/Sao_Paulo"` explícito. Usadas em todas as telas (admin, suporte, blog, pSEO).
- **`TZ: "America/Sao_Paulo"`** no `env` dos 3 apps do `ecosystem.config.js`. Isso corrige também as
  contas de **dia**: buckets do dashboard (`lib/admin-stats.ts`) e teto diário do antifraude
  (`lib/antifraud.ts`) usavam `setHours(0,0,0,0)` em UTC — o "dia" virava às 21h de Brasília.
- **`pm2 reload` NÃO reaplica `env` do ecosystem.** É preciso `pm2 startOrReload ecosystem.config.js
  --update-env`. Verificar com `/proc/<pid>/environ`.
- O formatador explícito é a garantia real: as telas mostram Brasília mesmo se o `TZ` sumir.

#### Bot de alertas no Telegram — 30/07/2026

Bot **@smspixbot_bot** (id `8805802505`), portado do enjai (`lib/telegram-notifier.ts` +
`app/api/webhook/telegram`). Destinatário: `<<REMOVIDO>>` (Anderson).

- **`lib/telegram.ts`** — `enviarAlerta({categoria, titulo, corpo, botoes, linkAdmin, silent})`.
  Múltiplos destinatários por vírgula, categorias desligáveis, botões inline. Nunca lança:
  sem token configurado o site funciona igual, só não notifica.
- **Categorias:** `ticket-novo` 🎫, `ticket-resposta` 💬, `recarga` 💰, `prejuizo` ⚠️,
  `fornecedor` 🔴, `erro` 🚨, `resumo` 📊, `teste` ✅.
- **`lib/alerts.ts`** — `sendAlert` manda nos DOIS canais (e-mail sempre + Telegram se houver bot).
  `paraTelegram()` converte o corpo HTML do e-mail para o subconjunto do Telegram.
- **Webhook `/api/webhook/telegram`** — cliques nos botões, fluxo **preview → confirmar → enviar**.
  Reusa `responderComoAdmin()` (mesma função do admin web), então status, fila e e-mail ao cliente
  ficam consistentes vindo de onde vier a resposta.
- **Variáveis** (`.env`, backup em `.env.bak-20260730-telegram`): `TELEGRAM_BOT_TOKEN`,
  `TELEGRAM_ADMIN_CHAT_IDS`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_DISABLED_CATEGORIES`.
- **Scripts:** `tsx scripts/telegram-setup.ts [diagnostico|descobrir|webhook|remover]` e
  `tsx scripts/teste-telegram.ts` (11 verificações; 11/11 em 30/07/2026).

**Três diferenças propositais em relação ao enjai:**
1. **Allowlist de quem clica** — o enjai valida só o secret do webhook; aqui `ehAdminTelegram()`
   confere `callback_query.from.id` contra `TELEGRAM_ADMIN_CHAT_IDS`. Sem isso, quem descobrisse
   o bot poderia responder chamados em nome do suporte.
2. **HTML em vez de MarkdownV2** — o MarkdownV2 exige escapar 18 caracteres e um escape esquecido
   faz o Telegram recusar a mensagem inteira, perdendo o alerta justamente na hora do problema.
3. **Sem lógica duplicada** — o enjai reimplementa gravação de mensagem + e-mail dentro do webhook;
   aqui o webhook chama a mesma função do admin web.

**Armadilhas descobertas (não repetir):**
- `paraTelegram()` **não** escapa: o corpo já é HTML válido. Escapar de novo virava `&amp;gt;`.
  Quem monta a mensagem é que precisa `esc()` o conteúdo do cliente (feito em `avisarAdmin`).
- `callback_data` do Telegram tem **limite de 64 bytes**. `p:<cuid>:r:<cuid>` = 55 bytes. Se os ids
  mudarem de formato, isso estoura silenciosamente e os botões param de funcionar.
- O webhook responde **200 mesmo em erro** — 5xx faz o Telegram reenviar o mesmo update em loop.
- `getUpdates` só funciona com o webhook DESLIGADO (por isso o `descobrir` remove e recoloca).
- **Scripts de teste exportam `SMSPIX_TESTE=1`**, que prefixa `[TESTE — ignore]` no assunto.
  Sem isso os alertas de teste chegam idênticos aos reais — em 30/07/2026 isso fez alertas de
  teste serem lidos como reclamação de cliente.

#### Incidente 30/07/2026 — venda abaixo do custo (CORRIGIDO)

- **Sintoma:** cliente pagou R$10 via PIX (OK), comprou WhatsApp/Colômbia 2× e não recebeu SMS.
  As ativações registraram **custo 147c contra preço 120c** — prejuízo de R$0,27 por venda.
- **Causa raiz:** `createActivation` fixava o preço em `candidates[0].priceCents` (fornecedor mais
  barato do catálogo = 5sim), mas o 5sim estava com **estoque fantasma** (catálogo anunciava 256 mil
  números para colombia/whatsapp, o `buy` respondia `no free phones`). O failover caía no handlerapi,
  cujo custo real (R$1,47) é MAIOR que o preço já anunciado (R$1,20).
- **A OpenPix nunca falhou.** O webhook chegou e creditou em 1s. O `correlationID` gravado no banco é
  o UUID que o app gera — **não** é o ID de transação mostrado no painel da Woovi (busca por ele não acha nada).
- **`OPENPIX_WEBHOOK_SECRET` é variável morta:** a validação é RSA-SHA256 com a chave pública da Woovi
  embutida em `lib/openpix.ts`. Não existe segredo compartilhado nessa integração.
- **Correções** (em `lib/activations.ts`, backups `.bak-20260730`):
  1. **Trava de prejuízo:** no failover, fornecedor com `costCents > priceCents` é pulado e logado.
     Se sobrar nenhum, estorna e lança `PriceChangedError` — nunca cobra mais que o anunciado.
  2. **Estoque fantasma:** `NO_NUMBERS` no `buy` zera a linha do catálogo **na hora** (`markOutOfStock`),
     sem esperar o sync de 15min. O preço de vitrine se corrige sozinho na próxima carga da página.
  3. **Alerta pós-compra:** se o custo real ainda vier acima do preço, dispara `alertOnce`.
- **Escala do problema:** 47 de 388 combos multi-fornecedor eram "minas" (failover daria prejuízo).
  Nenhuma linha vende abaixo do custo do próprio fornecedor — o motor de markup está são.
- **Testes:** `scripts/teste-trava-prejuizo.ts` (regressão, sem custo — usa serviço fictício `zzteste` e o
  `NO_NUMBERS` local do handlerapi) e `scripts/teste-compra-real.ts <servico> <pais>` (compra real
  cancelável, valida o caminho feliz). Ambos validados em produção em 30/07/2026.
- **Quarentena de estoque fantasma (migration `3_quarentena_estoque`)** — coluna
  `ServicePrice.blockedUntil`. Descoberto horas depois que zerar o estoque **não bastava**: o sync de
  15 min ressuscitava o estoque falso do 5sim e o próximo cliente batia na mesma parede.
  Agora `markOutOfStock()` grava `blockedUntil = agora + 1h` e o `syncCatalog()` termina com dois passos:
  re-zera tudo que está em quarentena e limpa as quarentenas vencidas. Verificado em produção:
  com 252.956 números falsos repostos pelo catálogo, a linha continuou zerada.
- **Pendência conhecida (UX):** nos 47 combos-mina o cliente ainda vê "o preço mudou, atualize a página"
  na 1ª tentativa (depois disso a quarentena segura por 1h). Correção definitiva seria precificar o
  combo pelo fornecedor que realmente entrega, em vez do mais barato do catálogo.
- **O 5sim mente cronicamente em whatsapp/colombia:** anuncia de 250 mil a 1,2 milhão de números e
  responde `no free phones` em 100% das tentativas (3 verificações independentes em 30/07/2026).
  Quem entrega de verdade é o handlerapi, a R$2,94 (custo R$1,47).

#### Navegação do admin (30/07/2026)

As abas viviam dentro de `app/admin/layout.tsx`, então quem entrava em `/painel` ficava sem caminho
para as telas de gestão. Extraídas para **`components/AdminNav.tsx`**, usado pelo layout do admin e
pelo `/painel` (só quando `role === "ADMIN"`). A aba "Painel" entrou na lista para a navegação
funcionar nos dois sentidos.

## Cloudflare — API (conta distribuidoras — 4ª conta, separada de qmix/joelho/coluna)

> Zona `distribuidorasdealimentos.com.br` numa conta CF distinta das outras 3.
> Token usado no cutover de 22/06/2026 (emissão de Origin CA cert + atualização do A record).

| Campo | Valor |
|---|---|
| **API Token** | `<<REMOVIDO>>` |
| **Account ID** | `75a81880f2e1e1a7300ef71d7a4bc4e1` |
| **Zona distribuidorasdealimentos.com.br** | `fc69977f878137ae764e1048570223e8` |

## Cloudflare — API (conta "Coluna" — 3ª conta, separada de qmix e joelho)

> A zona `cirurgiadecolunagoiania.com.br` está numa conta CF própria (nome **"Coluna"**), distinta
> das contas qmix e cirurgiadojoelho. Token usado no cutover e no auto-purge do blog (`COLUNA_CF_TOKEN`).

| Campo | Valor |
|---|---|
| **API Token** | `<<REMOVIDO>>` |
| **Account ID** | `16b79dbb69a62b8ffe1b8c51df4e3ab1` |
| **Zona cirurgiadecolunagoiania.com.br** | `9f892c7a6026bec7aba67cfab8a4d734` |

## Cloudflare — API (conta qmix)

| Campo | Valor |
|---|---|
| **API Token** | `<<REMOVIDO>>` |
| **Account ID** | `00c4b1553ff620a1931e72d10e3c75c8` |
| **Zona coegoiania.com.br** | `272c7b7283f852082d5988f440b7bf65` |

Uso (Bearer): `curl -H "Authorization: Bearer $TOKEN" https://api.cloudflare.com/client/v4/zones`.

## Cloudflare — API (conta cirurgiadojoelhogoiania — OUTRA conta, NS anderson/frida)

> A zona `cirurgiadojoelhogoiania.com` **NÃO** está na conta qmix acima; é uma conta separada.
> Este é o token usado no auto-purge do blog (`JOELHO_CF_TOKEN` no wp-config) e no cutover.
> Token atualizado 24/07/2026 (o anterior `cfat_oxeFk40b...` estava rotacionado/inválido — erro 10000 no purge). Válido para Cache Purge; testado com sucesso.

| Campo | Valor |
|---|---|
| **API Token** | `<<REMOVIDO>>` |
| **Account ID** | `e1afd354b17fd5c336f44c6095f41081` |
| **Zona cirurgiadojoelhogoiania.com** | `a543b64e2c25df9d5174e012757e71a0` |

Permissões do token: DNS Edit, SSL & Certificates Edit, Cache Purge, Zone Settings Edit, Zone WAF Edit.
Permite: DNS, settings de SSL/segurança, e emissão de Origin CA cert (`POST /certificates`).
