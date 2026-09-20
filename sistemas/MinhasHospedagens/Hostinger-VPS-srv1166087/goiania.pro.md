# goiania.pro

Diretório de empresas e serviços de Goiânia (Next.js + Prisma + PostgreSQL).
Não é portal WordPress: vive fora do HestiaCP, em `/var/www/goiania`, com PM2 e
nginx próprios. Ficha criada em 13/09/2026.

## Onde vive

| | |
|---|---|
| URL | https://goiania.pro (www redireciona 301 para o apex) |
| Servidor | Hostinger VPS srv1166087 (ver `CONEXAO.md` nesta pasta) |
| IP de origem | `31.97.173.40` |
| Acesso | `ssh hostinger-vps-srv1166087` (chave `<<REMOVIDO>>`) |
| Raiz do app | `/var/www/goiania` (release atual) |
| Release anterior | `/var/www/goiania-prev` (rollback) |
| Compartilhado | `/var/www/goiania-shared/.env` (symlink `.env` dentro da release) |
| Uploads | `/var/www/goiania/public/storage` |
| DNS / borda | Cloudflare (proxied, SSL Full), cert de origem em `/etc/ssl/portais/goiania.pro/` (válido até 2036) |
| Staging | `novo.goiania.pro` chega ao mesmo server block; `STAGING` no `.env` controla o noindex |

## Código fonte

| | |
|---|---|
| GitHub | https://github.com/qmixdigital/goiania.pro (privado, branch `main`) |
| Conta | `qmixdigital`, token em `C:\Users\User\Documents\APIs\github.txt` |
| Clone local | `d:\SITES\goiania.pro`; **o app fica em `app/`** (raiz tem briefing, docs e `_design`) |
| Histórico | em 14/09/2026 o repositório original do projeto (app em `app/`, STATUS.md, PLANO.md, briefing) voltou ao GitHub por cima do meu import; em 18/09 reconciliei colocando todo o trabalho de 13 a 18/09 dentro de `app/` (commit `02f3701`). O histórico do import de 13/09 (`b2a6b82`…) foi descartado |

O servidor **não tem `.git`**. O deploy sobe um tarball da máquina local, então o
fluxo é: editar no clone local, commitar, `bun run deploy`.

## Stack

| | |
|---|---|
| Framework | Next.js 16.3 (App Router) + React 19 |
| Banco | PostgreSQL 16 local, base `goiania`, usuário `goiania` (URL no `.env`) |
| ORM | Prisma 6 (`prisma/schema.prisma`, migrações em `prisma/migrations`) |
| CSS | Tailwind v4 |
| Runtime | Node 20.20.2 (`/root/.nvm/versions/node/v20.20.2/bin`) e Bun 1.3.14 (`/root/.bun/bin`) |
| Processos PM2 | `goiania-web` (porta 3170) e `goiania-web-b` (porta 3171), **os dois ficam ligados** de propósito: o deploy reinicia um por vez |
| nginx | `/etc/nginx/conf.d/goiania.conf` + `goiania-common.inc` + `goiania-proxy.inc` + `goiania-limite.conf` (cópias em `nginx/` no repo) |
| E-mail | Resend (`RESEND_API_KEY`), remetente em `CONTACT_FROM`, avisos para `OPERATOR_EMAIL` |
| Pagamento | Asaas (`ASAAS_API_KEY`, ainda vazio) |
| AdSense / GA4 | variáveis `NEXT_PUBLIC_ADSENSE_*` e `NEXT_PUBLIC_GA_ID`, ainda vazias |

Base em 13/09/2026 (fim do dia): **~60 mil empresas** em **87 categorias** (20 novas
adicionadas nesse dia, ver `CATEGORIAS-NOVAS-2026-09.md` no repo).

## Variáveis de ambiente

Cópia fiel do `.env` de produção em **`goiania.pro.env`** nesta pasta (chaves de
banco, sessão, admin, Resend e IndexNow). Ao mudar algo no servidor, atualizar
a cópia aqui também.

Chaves: `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `STAGING`, `NEXT_PUBLIC_ADSENSE_CLIENT`,
`NEXT_PUBLIC_ADSENSE_SLOT_{CAT_TOP,CAT_LIST,EMPRESA,HOME}`, `ADS_TXT`, `NEXT_PUBLIC_GA_ID`,
`ADMIN_KEY`, `SESSION_SECRET`, `RESEND_API_KEY`, `CONTACT_FROM`, `OPERATOR_EMAIL`,
`ASAAS_API_KEY`, `INDEXNOW_KEY`, `PORT`.

## Painel admin

| | |
|---|---|
| URL | https://goiania.pro/admin |
| Login | chave única `ADMIN_KEY` (no `.env`), sem usuário |
| Seções | fichas, cadastros, reivindicações, correções, remoções, leads, banners, planos, importação, config, logs |

Área do anunciante (conta própria): `/entrar`, `/cadastro`, `/painel`.

## Rotas públicas

`/` home, `/[categoria]`, `/[categoria]/[bairro]`, `/[categoria]/pagina/[n]`,
`/[categoria]/busca`, `/empresa/[slug]`, `/bairros`, `/bairros/[bairro]`,
`/categorias`, `/busca`, `/anuncie`, `/reivindicar`, `/remocao`, `/sobre`,
`/contato`, `/metodologia-dos-dados`, `/politica-de-privacidade`, `/termos-de-uso`,
`/sitemap.xml` (índice) e `/sitemaps/[arquivo]`, `/ads.txt`, `/ir` (redirect de saída).

Conteúdo editorial por categoria em `src/content/editorial/*.json`; lista de
categorias em `src/content/categorias.json`; dados legados em `src/content/legado.json`.

**Guia da cidade (`/guia/`)**: artigos em `src/content/guia/*.json` (schema em
`src/lib/guia.ts`: seções com blocos `p`, `lista` e `tabela`, FAQ, fontes,
relacionados; links no texto como `[âncora](/caminho/)`). Novo artigo = novo
JSON + deploy; entra sozinho no índice, no sitemap e no OG. Criado em 13/09/2026
com 3 artigos (regiões e bairros, Goiânia em números, telefones úteis) mirando
consultas informacionais de KD baixo do Semrush.

## Deploy (zero downtime)

Roda da máquina local, dentro do clone:

```bash
cd d:/SITES/goiania.pro
bash app/scripts/deploy.sh --fast      # build no servidor, release nova, migrate, troca atômica, restart em rolagem
bash app/scripts/deploy.sh --rollback  # volta para /var/www/goiania-prev
```

`app/scripts/deploy.sh` fala com `root@31.97.173.40` pela chave
`<<REMOVIDO>>` (a mesma do alias; a `id_ed25519_vps` que o
script usava antes não autentica nesse servidor). Sem Bun local, rodar
`bash scripts/deploy.sh --fast` no Git Bash: o build acontece no servidor, em
`/var/www/goiania-build`, e só troca se compilar. Log remoto em
`/tmp/goiania-deploy.log`; o script exige `git status` limpo.

Nunca `pm2 restart all`, `pm2 kill` ou `pm2 update` nessa VPS: ela hospeda dezenas
de apps (ver `ARQUITETURAS.md`).

## Ingestão de dados

Scripts em `ingest/` (Python + `load.ts`): extração de CNAEs (`cnaes.csv`),
bairros, categorias, MEI, acentuação, legado. Saída vai para `ingest/out`
(ignorado no git). Carga no banco: `bun run ingest:load`.

**Adicionar categoria (fluxo usado em 13/09/2026):**
1. `src/content/categorias.json` (metadados) + regra em `REGRAS` de `ingest/categorias.py`
   (nunca escrever a regra por string Python normal: `` vira backspace; usar raw string).
2. Medir no servidor: `/root/goiania-teste` tem cópia do ingest; rodar
   `python3 categorias.py /root/goiania-ingest/out/goiania-ativos.csv` e amostrar `out/final.csv`.
3. Editorial em `src/content/editorial/<slug>.json`; commit; `bash scripts/deploy.sh --fast`.
4. No app: `cd /var/www/goiania/ingest && python3 categorias.py /root/goiania-ingest/out/goiania-ativos.csv`
   (precisa do symlink `out/mei-goiania.csv`), depois
   `bun run ingest/load.ts ingest/out/final.csv --versao 2026-08` (uns 20 min; ficha
   reivindicada ou de cadastro público não é desativada).

## Backup

O cron `/usr/local/bin/qmix-backup-bancos.sh` (03:20, diário) despeja todas as
bases PostgreSQL da VPS em `/var/backups/qmix`, então a base `goiania` está
coberta. O código fica no GitHub. Uploads (`public/storage`) não têm backup
separado.

## Search Console

| | |
|---|---|
| Propriedade | `sc-domain:goiania.pro` |
| Leitura por API | conta de serviço `seoqmix@seoqmix.iam.gserviceaccount.com` (siteFullUser), chave em `C:/Users/User/Documents/APIs/seoqmix-024e9465e9d9.json` |
| Script | `C:/Users/User/.claude/skills/diretorios-do-zero/scripts/gsc.py` com `GSC_CREDENCIAL` apontando para a chave acima |

Em 09/2026 cerca de 80% das impressões ainda chegam pelos subdomínios antigos
(`categoria.goiania.pro`), que fazem 301 para `/categoria/`.

## Política de indexação (13/09/2026)

Ficha reivindicada pelo dono abre a lista da categoria, do bairro e dos
destaques (regra de 18/09/2026, `ordemPadrao` e `listaEmpresas` em
`src/lib/queries.ts`).

Tudo indexável: fichas (inclusive sem telefone ou número), categorias, páginas
categoria+bairro (`MIN_CAT_BAIRRO = 1` em `src/lib/queries.ts`) e bairros com
ao menos 1 empresa. Cadastro aprovado nasce `indexavel: true`. Fora do índice
só busca interna, painel, login, admin e fichas removidas (410).

Limitação do Next 16: rota dinâmica que lança `notFound()` (categoria, bairro
ou empresa inexistente) responde 404 correto e `noindex`, mas o HTML vem com a
casca `__next_error__` e o conteúdo do 404 monta no cliente. Rota sem nenhum
match usa o `global-not-found.tsx` completo.

## Pendências conhecidas

- `/metodologia-dos-dados/` tem números da base de agosto (5.259 empresas, 28
  categorias) enquanto o banco tem 38.723 e 67. A tabela por categoria também.
- AdSense, GA4 e Asaas sem chave no `.env`.
- Planilha de keywords do Semrush em `d:\SITES\goiania.pro\goiania_all-keywords_br_2026-09-02.csv` (fora do git).
