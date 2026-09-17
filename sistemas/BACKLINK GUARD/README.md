# BacklinkGuard — Handoff / Documentação completa

> Snapshot tirado em **2026-08-04** da ferramenta em produção
> **https://backlinkguard.qmix.com.br**. Esta pasta tem **o código-fonte
> completo, o dump do banco e todas as credenciais/configs** — o suficiente
> para abrir em outro chat/VS Code e continuar de onde parou.

## O que é

Ferramenta **interna da QMIX** para **monitorar os backlinks feitos para clientes**.
Para cada backlink cadastrado, verifica 3 estados:

1. **Artigo publicado?** — a página que hospeda o link está no ar (HTTP 2xx, não 404/deletada). *(grátis, só `fetch`)*
2. **Link do cliente presente?** — a página realmente contém o `<a href>` pro domínio do cliente (ou, em links `REDIRECT_301`, o 301 segue ativo). *(grátis)*
3. **Indexado no Google?** — a URL está no índice (`site:` via Google Search Console grátis → fallback DataForSEO pago). *(~US$0,01/check só no fallback)*

Modelagem já é **multi-tenant** (`Account`) prevendo revenda futura como SaaS. Hoje há 1 Account (QMIX).

## Stack

Next.js 16.2.11 (App Router, Server Actions) · **Prisma 6** · **PostgreSQL** · Tailwind 4 · **Bun** (runtime + package manager) · DataForSEO (indexação paga) · Google Search Console API (indexação grátis) · Resend (alertas de saldo).

## O que tem nesta pasta

| Caminho | Conteúdo |
|---|---|
| `source/` | **Código-fonte completo** (148 arquivos) — src, prisma, scripts, public, configs, e os docs do próprio projeto (`README.md`, `DEPLOY.md`, `AGENTS.md`). Inclui o `.env`. Falta só `node_modules`/`.next` (rodar `bun install`). |
| `backlinkguard-src.tar.gz` | O mesmo source empacotado (backup). |
| `banco/backlinkguard-db.sql.gz` | **Dump completo do Postgres** (schema + dados). Restaurar: `gunzip -c backlinkguard-db.sql.gz \| psql -d backlinkguard`. |
| `infra/env-completo.txt` | **Todas as variáveis de ambiente** (credenciais reais). |
| `infra/google-sa.json` | Chave da **conta de serviço Google** (check de indexação grátis via GSC). |
| `infra/nginx-backlinkguard.conf` | Vhost Nginx de produção. |
| `infra/cron-e-shared.txt` | Cron de alerta de saldo + conteúdo da pasta `-shared`. |

> **Leia primeiro `source/README.md` e `source/DEPLOY.md`** — são muito bons e explicam a arquitetura, os 3 checks, o import de CSV e o deploy em detalhe. Este arquivo é o índice + acessos.

## 🔑 Acessos (produção)

| Item | Valor |
|---|---|
| **URL** | https://backlinkguard.qmix.com.br |
| **Login do app** | senha única em `APP_PASSWORD` = **`<<REMOVIDO>>`** (página `/login`, cookie de sessão HMAC 30 dias) |
| **Servidor** | `ssh hostinger-vps-srv1166087` (31.97.173.40) — mesmo VPS do qmix-next |
| **Diretório** | `/var/www/backlinkguard` · `.env` → symlink p/ `/var/www/backlinkguard-shared/.env` |
| **PM2** | `backlinkguard-web` (porta **3090**) + `backlinkguard-web-b` (**3091**), dual-instance. Start: `next start -p 3090`, cwd `/var/www/backlinkguard`, Node 20.20.2 (nvm) |
| **Nginx** | `/etc/nginx/conf.d/backlinkguard.conf` (upstream `backlinkguard_backend` 3090/3091, só via Cloudflare) |
| **Cert** | `/etc/ssl/portais/backlinkguard.qmix.com.br/` (Cloudflare Full) |
| **DNS/CDN** | Cloudflare **conta14**, zona `dominioprovisorio.net.br`, A `backlinkguard` → 31.97.173.40 proxied. Page Rule `backlinkguard.qmix.com.br/*` = **Bypass cache** (senão o CF cacheia o app e fura o login) |

## 🗄️ Banco de dados

Postgres **local no VPS** (`localhost:5432`), separado do container `qmix-postgres`.

- **Conexão:** `<<REMOVIDO>>
- **Schema:** sem migrations em prod — usa `prisma db push`. Definição em `source/prisma/schema.prisma`.
- **Modelos:** `Account` → `Client` → `Backlink` → `Check` (histórico). O `Backlink` tem snapshot desnormalizado do último check (`lastPublished/lastLinkOk/lastIndexed`) pra ordenar a tabela rápido.
- **Volume no snapshot:** `Check` **6.166** · `Backlink` **1.820** · `Client` **9** · `Account` **1**.

## 🔌 Integrações / credenciais (todas em `infra/env-completo.txt`)

- **DataForSEO** (indexação paga, fallback): `marketing@qmix.com.br` / `<<REMOVIDO>>`. Alerta de saldo só quando zera (cron diário 9h → Resend).
- **Google Search Console** (indexação grátis, autoritativa): conta de serviço em `infra/google-sa.json` (no servidor: `/var/www/backlinkguard-shared/google-sa.json`). Quota 2.000 inspeções/dia por propriedade. Verificar novos domínios: `bun run scripts/gsc-verify-domains.ts <dominios>`.
- **Resend** (email de alerta): chave `re_RwCsCqSm_...`, from `nao-responder@smspix.com.br`, to `qmixdigital@gmail.com,marketing@qmix.com.br`.
- **CSE** (Google Custom Search, alternativa de indexação): não configurado (`CSE_API_KEY`/`CSE_CX` vazios).

## ▶️ Rodar localmente (a partir de `source/`)

```bash
cd source
bun install
# usar o banco de prod (read-only recomendado) OU restaurar o dump num Postgres local
./node_modules/.bin/prisma generate
bun run dev            # http://localhost:3000
```
Os checks 1 e 2 funcionam sem credencial nenhuma. O check 3 precisa do DataForSEO/GSC do `.env`.

## 🚀 Redeploy (resumo — detalhe em `source/DEPLOY.md`)

```bash
# empacotar local (sem node_modules/.next/.git/.env) → enviar → no servidor:
export PATH=/root/.nvm/versions/node/v20.20.2/bin:/root/.bun/bin:$PATH
cd /var/www/backlinkguard
bun install
./node_modules/.bin/prisma generate && ./node_modules/.bin/prisma db push --skip-generate
bun run build
pm2 restart backlinkguard-web backlinkguard-web-b
```

## ⚠️ 2 decisões de negócio em aberto (do README do projeto)

1. **Domínio-alvo de cada cliente:** o `Client.domain` precisa ser o domínio que os backlinks *deveriam* apontar. O seed assumiu "nome da pasta = domínio", o que nem sempre é verdade (ex.: pasta `cinemus.com.br` cujos backlinks apontam pra sites de IPTV).
2. **Esquema de redirect da rede feth:** os `feth-backlinks` fazem 301 pra **home do próprio feth** (o link do cliente está na home, não no destino do 301). A regra atual de `REDIRECT_301` não cobre isso — precisaria de um tipo `REDIRECT_VIA_HUB` (segue o 301 e procura o link na página de destino).

## Mapa rápido do código (`source/src/`)

- `app/page.tsx` — dashboard (clientes + saúde) · `app/clients/[id]/page.tsx` — tabela de backlinks com semáforo + re-check · `app/actions.ts` — server actions · `app/login/` — auth
- `lib/checks/` — `run.ts` (orquestrador), `service.ts` (persistência em lote, concorrência 5), `html.ts` (checks 1 e 2), `indexation*.ts` (GSC/CSE/DataForSEO)
- `lib/dataforseo/client.ts` · `lib/google/auth.ts` · `lib/import/csv.ts` (parser 2 formatos) · `lib/auth.ts` (sessão HMAC) · `lib/prisma.ts` · `lib/env.ts`
- `scripts/` — `seed.ts`, `gsc-verify-domains.ts`, `check-balance.ts` (alerta de saldo)

## Roadmap (do projeto)

- **Fase 1 (feito):** schema multi-tenant, import CSV, os 3 checks, tabela com semáforo, re-check manual, seed.
- **Fase 2:** re-check agendado (cron) + histórico "quando o link morreu" + alertas; tratar `REDIRECT_VIA_HUB`; export CSV.
- **Fase 3:** multi-tenant real (login por Account, cobrança) para revenda.
