# BacklinkGuard

Ferramenta interna da **QMIX Digital** para monitorar os backlinks feitos para
clientes. Para cada backlink cadastrado, verifica **3 estados**:

1. **Artigo publicado?** — a página que hospeda o backlink está online (HTTP 2xx, não 404/deletada).
2. **Link do cliente presente?** — a página realmente contém o link para o domínio do cliente (ou, em links do tipo redirect, o 301 continua ativo).
3. **Indexado no Google?** — a URL aparece no índice do Google (via DataForSEO `site:`).

Nasce interna, mas com a modelagem multi-tenant (`Account`) já pronta para
**revenda** como SaaS futuramente.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Prisma 6** — ORM
- **SQLite** no dev / **PostgreSQL (Neon)** em produção (troca de 1 linha, ver [Deploy](#deploy))
- **DataForSEO** — só para o check de indexação
- **Tailwind CSS 4**
- **Bun** como runtime e package manager

## Como rodar (dev)

```bash
bun install
bunx prisma migrate dev      # cria o SQLite dev.db
bun run seed                 # popula com 2 clientes de exemplo (CSVs reais em prisma/samples)
bun run dev                  # http://localhost:3000
```

Sem nenhuma credencial externa, os checks **1 e 2 já funcionam** (são só
`fetch` + parse de HTML, de graça). O check **3 (indexação)** fica como “—”
(desconhecido) até configurar o DataForSEO.

## Os 3 checks — como funcionam

| Check | Implementação | Custo |
|---|---|---|
| 1. Publicado | `fetchWithTrace()` segue redirects manualmente; publicado = status final 2xx | grátis |
| 2. Link presente | **DIRECT**: procura um `<a href>` para o domínio do cliente no HTML (`findLinkToDomain`). **REDIRECT_301**: confirma que a URL faz 301 e o destino bate com o alvo | grátis |
| 3. Indexado | `checkIndexation()` consulta `site:<url>` na SERP do Google via DataForSEO | ~US$0,01/check |

Código em [`src/lib/checks/`](src/lib/checks/). O orquestrador é
[`run.ts`](src/lib/checks/run.ts); a persistência em lote (com concorrência 5)
é [`service.ts`](src/lib/checks/service.ts).

### Tipos de backlink

O campo `Backlink.type` (`DIRECT` | `REDIRECT_301`) muda a regra do check 2. O
import de CSV detecta automaticamente: a coluna **Comportamento** contendo
“301” marca o link como `REDIRECT_301` (formato `feth-backlinks.csv`).

## Import de CSV

Reconhece os dois formatos usados na QMIX (parser em
[`src/lib/import/csv.ts`](src/lib/import/csv.ts)):

```
# backlinks.csv
Texto Âncora,URL

# feth-backlinks.csv
Texto Âncora,URL Backlink (use externamente),Comportamento
```

Cole o conteúdo na tela do cliente, ou importe programaticamente via
`importBacklinksCsv(clientId, csvText)`. Dedup por `(clientId, articleUrl)`.

## ⚠️ Dois pontos que precisam de decisão de negócio

Validado contra os CSVs reais da rede — dois pontos dependem de como cada
esquema de link passa equity:

1. **Qual é o domínio-alvo de cada cliente.** O seed assume "nome da pasta =
   domínio do cliente", mas isso nem sempre é verdade. Ex.: o `backlinks.csv`
   da pasta `cinemus.com.br` aponta para páginas que linkam para sites de IPTV
   (`playpro.mov`, etc.), não para `cinemus.com.br`. **O `domain` de cada
   `Client` precisa ser o domínio que os backlinks realmente deveriam apontar.**

2. **Esquema de redirect da rede feth.** Os `feth-backlinks` fazem 301 para a
   **home do próprio feth** (“passa equity”), não para o site do cliente. Ou
   seja, o link para o cliente está na home do feth, não no destino do 301. A
   regra atual do check 2 para `REDIRECT_301` confere se o 301 leva ao alvo —
   o que **não** cobre esse padrão "301 → home intermediária → link". Se esse
   esquema for comum, dá para adicionar um 3º tipo (ex.: `REDIRECT_VIA_HUB`)
   que segue o 301 e depois procura o link do cliente na página de destino.

## Deploy

Produção usa **Neon (PostgreSQL)**:

1. Em [`prisma/schema.prisma`](prisma/schema.prisma), trocar o `datasource`:
   `provider = "postgresql"`.
2. Em produção, `DATABASE_URL` = connection string **pooled** do Neon (com
   `-pooler` no host).
3. `bunx prisma migrate deploy`.
4. Deploy no servidor QMIX em subdomínio novo (ex.: `backlinkguard.qmix...`).
   Como a ferramenta é interna, proteger com auth simples (senha em env var ou
   middleware) até a fase de revenda.

O único campo do schema que muda entre dev e prod é o `provider` — os modelos
são portáveis (não usamos enum nativo do Postgres justamente por isso).

## Configurar o DataForSEO (check de indexação)

No `.env`:

```
DATAFORSEO_LOGIN="seu_login"
DATAFORSEO_PASSWORD="sua_senha"
```

Registro gratuito com crédito de trial em [dataforseo.com](https://dataforseo.com).
Sem isso, indexação fica “desconhecida” e os outros 2 checks seguem funcionando.

## Estrutura

```
src/
├── app/
│   ├── page.tsx                  # Dashboard: lista de clientes + saúde
│   ├── actions.ts                # Server Actions (seed, criar cliente, importar, checar)
│   └── clients/[id]/page.tsx     # Tabela de backlinks com semáforo + re-check
├── components/                   # StatusDot (semáforo), botões de ação
└── lib/
    ├── checks/                   # html.ts, indexation.ts, run.ts, service.ts
    ├── dataforseo/client.ts      # Basic Auth wrapper
    ├── import/                   # csv.ts (parser), service.ts
    ├── utils/                    # domain.ts (tldts), concurrency.ts (pMap)
    ├── env.ts  prisma.ts  types.ts  seed.ts
```

## Roadmap

- **Fase 1 (feito):** schema multi-tenant, import de CSV (2 formatos), os 3 checks, tabela com semáforo, re-check manual, seed com dados reais.
- **Fase 2:** re-check agendado (cron) com histórico de “quando o link morreu” + alertas; tratar o esquema `REDIRECT_VIA_HUB`; export CSV.
- **Fase 3:** multi-tenant real (login por `Account`, cobrança) para revenda.
