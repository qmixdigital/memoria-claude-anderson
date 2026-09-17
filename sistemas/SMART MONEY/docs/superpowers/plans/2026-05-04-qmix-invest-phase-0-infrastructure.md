# QMIX Invest — Fase 0: Infraestrutura — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levantar a infraestrutura encapsulada (Docker Compose com 5 serviços, Postgres, Drizzle, pg-boss, Nginx vhost, deploy/rollback scripts), com `/api/health` respondendo via HTTPS em `qf.qmix.digital`, sem afetar os outros 4 sites + 4 bots já hospedados na VPS srv1166087.

**Architecture:** Monorepo npm workspaces com 3 packages (`app/` Next.js, `worker/` Node, `db/` schema Drizzle compartilhado). 5 containers Docker em rede privada `qmix_invest_internal`: 2× app (failover), 2× worker (failover), 1× postgres (não exposto). Nginx do host com vhost dedicado faz proxy via upstream com `proxy_next_upstream`. Deploy zero-downtime rola um container por vez com healthcheck antes de avançar.

**Tech Stack:** Next.js 15.x + TypeScript 5.6+ + Drizzle 0.40+ + pg-boss 10+ + Postgres 17 + Docker Compose v2 + Nginx 1.24+ + Vitest 2.x + grammY 1.x (pré-instalado para Fase 4)

**Outcome do plano:** sistema vazio mas estruturalmente completo, testável (`docker compose up` localmente + `./scripts/deploy.sh` na VPS), pronto para receber lógica de negócio (scrapers, factors, IA) nas fases seguintes. Nenhum dado de mercado é raspado nesta fase.

**Estimativa de duração:** 6-12 horas de trabalho focado.

---

## Visão geral da estrutura de arquivos

```
qmix-invest/                         (root do monorepo)
├── package.json                     # workspaces config
├── tsconfig.base.json               # tsconfig compartilhado
├── .gitignore
├── .env.example                     # template de env vars
├── README.md
├── docker-compose.yml               # composição production-like
├── docker-compose.dev.yml           # override para dev local
├── vitest.config.ts                 # config de testes raiz
│
├── app/                             # workspace: Next.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   └── api/health/route.ts
│   │   └── lib/
│   │       ├── env.ts                # validação zod das env vars do app
│   │       ├── db.ts                 # cliente Drizzle conectado
│   │       └── pg-boss-client.ts     # cliente pg-boss para enfileirar
│   └── tests/
│       └── api/health.test.ts
│
├── worker/                          # workspace: pg-boss consumer
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts                  # entry point
│   │   ├── env.ts                    # validação zod das env vars do worker
│   │   ├── db.ts                     # mesma conexão Drizzle
│   │   ├── pg-boss.ts                # factory pg-boss (com lock distribuído)
│   │   ├── migrate.ts                # migration runner com pg_advisory_lock
│   │   └── logger.ts                 # pino instance compartilhada
│   └── tests/
│       ├── pg-boss.test.ts
│       └── migrate.test.ts
│
├── db/                              # workspace: schema compartilhado
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts
│   ├── src/
│   │   └── schema.ts                 # schemas (vazio nesta fase, só boilerplate)
│   └── migrations/                   # gerado pelo Drizzle Kit
│       └── 0000_initial.sql
│
├── nginx/
│   ├── qmix-invest.conf              # vhost para colocar em /etc/nginx/conf.d/
│   └── README.md                     # instruções de instalação SSL
│
└── scripts/
    ├── deploy.sh                     # deploy zero-downtime
    ├── rollback.sh                   # reverter para imagem :previous
    ├── verify-other-sites.sh         # checa os 4 sites + 4 bots da VPS
    ├── setup-vps.sh                  # one-time: instala Docker, cria /opt/qmix-invest
    └── setup-telegram-webhook.sh     # placeholder para Fase 4 (não usado agora)
```

**Responsabilidades por arquivo (regras de design):**

- `app/src/lib/db.ts` e `worker/src/db.ts` ambos importam o schema de `db/src/schema.ts` (single source of truth) — isso evita drift entre app e worker.
- `app/src/lib/env.ts` e `worker/src/env.ts` validam apenas as variáveis que cada processo realmente usa (princípio do menor privilégio).
- `worker/src/migrate.ts` é o ÚNICO lugar que aplica migrations — app nunca migra. Lock distribuído impede `worker` e `worker-b` de tentarem simultaneamente.
- `nginx/qmix-invest.conf` fica versionado, mas a aplicação acontece manualmente por `setup-vps.sh` (host-level change não pode ser automática num projeto que prioriza não derrubar outros sites).

---

## Pré-requisitos para executar este plano

Antes de começar:

- [ ] Docker Desktop instalado e funcionando localmente (Windows/Mac/Linux)
- [ ] Node.js 22 LTS ou superior instalado localmente
- [ ] `git` configurado
- [ ] Acesso SSH à VPS `srv1166087` (`ssh root@31.97.173.40` com a senha de `D:\SISTEMAS\MinhasHospedagens\VPS ferramentasqmix@gmail.com\CONEXAO.md`)
- [ ] DNS de `qf.qmix.digital` apontando para `31.97.173.40` (registrar em Cloudflare ou painel Hostinger antes de rodar `setup-vps.sh`)

---

## Task 1: Inicializar o monorepo local com workspaces

**Files:**
- Modify: `package.json` (criar — não existe ainda)
- Modify: `tsconfig.base.json` (criar)
- Modify: `.gitignore` (já existe, adicionar entradas Node/Next)
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Criar `package.json` raiz com workspaces**

```json
{
  "name": "qmix-invest",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "workspaces": [
    "app",
    "worker",
    "db"
  ],
  "scripts": {
    "dev:app": "npm --workspace app run dev",
    "dev:worker": "npm --workspace worker run dev",
    "build": "npm --workspaces run build",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc -p tsconfig.base.json --noEmit && npm --workspaces run typecheck",
    "db:generate": "npm --workspace db run generate",
    "db:migrate": "npm --workspace worker run migrate",
    "compose:up": "docker compose up -d",
    "compose:down": "docker compose down",
    "compose:logs": "docker compose logs -f --tail=200"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "@types/node": "^22.0.0"
  }
}
```

- [ ] **Step 2: Criar `tsconfig.base.json` compartilhado**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

- [ ] **Step 3: Atualizar `.gitignore` com entradas Node/Next**

Adicionar ao `.gitignore` existente (após as linhas atuais):

```
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Next.js
.next/
out/
next-env.d.ts

# Testes
coverage/
.vitest-cache/

# IDE
.vscode/settings.json

# Drizzle Kit cache
.drizzle/
```

- [ ] **Step 4: Criar `.env.example` com todas as variáveis previstas**

```bash
# ===== Banco de dados =====
DATABASE_URL=<<REMOVIDO>>

# ===== Geral =====
NODE_ENV=development           # development | production
MODE=dry-run                   # dry-run | live
LOG_LEVEL=info                 # trace | debug | info | warn | error

# ===== IA (placeholders, populados na Fase 3) =====
AI_PROVIDER=mock               # anthropic | openai | google | deepseek | mock
AI_API_KEY=
AI_FALLBACK_PROVIDER=mock
AI_MONTHLY_BUDGET_BRL=500

# ===== Telegram (placeholders, populados na Fase 4) =====
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_OWNER_CHAT_ID=

# ===== Proxies (placeholders, populados na Fase 1) =====
PROXY_POOL=
```

- [ ] **Step 5: Criar `README.md` minimal**

```markdown
# QMIX Invest

Sistema de inteligência financeira pessoal para monitorar smart money em ações brasileiras (B3).

Spec: [docs/superpowers/specs/2026-05-04-qmix-invest-design.md](docs/superpowers/specs/2026-05-04-qmix-invest-design.md)

## Quick start (desenvolvimento local)

\`\`\`bash
cp .env.example .env
npm install
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
npm run db:migrate
npm run dev:app
\`\`\`

App responde em http://localhost:3000.

## Estrutura

- `app/` — Next.js 15 (dashboard + API + webhook Telegram)
- `worker/` — Worker Node consumindo fila pg-boss
- `db/` — Schema Drizzle compartilhado entre app e worker
- `nginx/` — Vhost para Nginx do host
- `scripts/` — deploy, rollback, setup VPS

## Comandos úteis

- `npm test` — roda testes unitários e integração
- `npm run typecheck` — checa types em todos os workspaces
- `npm run db:generate` — gera nova migration Drizzle
- `npm run compose:logs` — tail de logs de todos os containers

## Deploy em produção

Veja `scripts/deploy.sh` e `nginx/README.md`.
```

- [ ] **Step 6: Instalar dependências raiz**

Run: `npm install`
Expected: instala TypeScript e Vitest no root, cria `node_modules/` e `package-lock.json`.

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.base.json .gitignore .env.example README.md package-lock.json
git commit -m "chore: initialize monorepo with npm workspaces

Sets up root package.json with TypeScript and Vitest as devDependencies,
base tsconfig with strict settings, .env.example template, and README
pointing to the design spec."
```

---

## Task 2: Setup do workspace `db/` com Drizzle

**Files:**
- Create: `db/package.json`
- Create: `db/tsconfig.json`
- Create: `db/drizzle.config.ts`
- Create: `db/src/schema.ts`
- Create: `db/src/index.ts`

- [ ] **Step 1: Criar `db/package.json`**

```json
{
  "name": "@qmix-invest/db",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema.ts"
  },
  "scripts": {
    "generate": "drizzle-kit generate",
    "studio": "drizzle-kit studio",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "drizzle-orm": "^0.40.0",
    "postgres": "^3.4.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Criar `db/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Criar `db/drizzle.config.ts`**

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '<<REMOVIDO>>',
  },
  schemaFilter: ['qmix_invest'],
  verbose: true,
  strict: true,
} satisfies Config;
```

- [ ] **Step 4: Criar `db/src/schema.ts` com bootstrap mínimo**

```typescript
import { pgSchema } from 'drizzle-orm/pg-core';

export const qmixInvest = pgSchema('qmix_invest');

// Schemas de domínio serão adicionados nas fases seguintes:
// Fase 1: companies, tickers, funds, prices_daily, btc_lending_daily,
//         foreign_flow_daily, insider_transactions, material_disclosures,
//         fund_holdings_cvm, fund_holdings_sec_13f, scraper_runs
// Fase 2: signals, signal_factors, signal_factor_weights
// Fase 3: ai_analyses
// Fase 4: alerts_sent, alert_feedback, daily_reports, user_portfolio,
//         user_watchlist, user_preferences
// Fase 5: metrics_daily
```

- [ ] **Step 5: Criar `db/src/index.ts` (re-export do schema)**

```typescript
export * from './schema';
export { qmixInvest } from './schema';
```

- [ ] **Step 6: Instalar dependências do workspace**

Run: `npm install --workspace db`
Expected: instala `drizzle-orm`, `postgres`, `drizzle-kit` em `db/node_modules/` (ou hoisted).

- [ ] **Step 7: Gerar migration inicial vazia**

Run (do diretório raiz):
```bash
DATABASE_URL=<<REMOVIDO>> \
  npm --workspace db run generate
```

Expected: cria `db/migrations/0000_<random_name>.sql` contendo apenas `CREATE SCHEMA "qmix_invest";`. Drizzle gera nome aleatório — renomeia depois.

- [ ] **Step 8: Renomear migration para nome estável**

```bash
mv db/migrations/0000_*.sql db/migrations/0000_create_schema.sql
```

Verificar que o conteúdo do arquivo é `CREATE SCHEMA "qmix_invest";\n--> statement-breakpoint\n` ou similar. Se vier vazio (Drizzle às vezes não emite quando não há tabelas), criar manualmente:

```sql
CREATE SCHEMA IF NOT EXISTS "qmix_invest";
```

Salvar em `db/migrations/0000_create_schema.sql`.

- [ ] **Step 9: Commit**

```bash
git add db/ package-lock.json
git commit -m "feat(db): setup Drizzle workspace with empty schema

Adds db/ workspace with Drizzle Kit configuration, empty schema.ts
declaring the qmix_invest pgSchema, and initial migration creating
the schema. Tables will be added in subsequent phases."
```

---

## Task 3: Setup do workspace `app/` com Next.js base

**Files:**
- Create: `app/package.json`
- Create: `app/tsconfig.json`
- Create: `app/next.config.ts`
- Create: `app/tailwind.config.ts`
- Create: `app/postcss.config.mjs`
- Create: `app/src/app/layout.tsx`
- Create: `app/src/app/page.tsx`
- Create: `app/src/app/globals.css`

- [ ] **Step 1: Criar `app/package.json`**

```json
{
  "name": "@qmix-invest/app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@qmix-invest/db": "*",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "drizzle-orm": "^0.40.0",
    "postgres": "^3.4.0",
    "pg-boss": "^10.0.0",
    "zod": "^3.23.0",
    "pino": "^9.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Criar `app/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    },
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true
  },
  "include": ["next-env.d.ts", "src/**/*", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Criar `app/next.config.ts`**

```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
};

export default config;
```

Notas:
- `output: 'standalone'`: o spec menciona evitar `standalone` em deploys legacy PM2. Aqui usamos com Docker — reduz drasticamente o tamanho da imagem e funciona quando o container é `next start` direto da pasta `.next/standalone`.
- `typedRoutes`: a partir do Next.js 15.3 essa opção saiu de `experimental` e virou top-level. Se você estiver em Next < 15.3, mova para dentro de `experimental: {}`.

- [ ] **Step 4: Criar `app/tailwind.config.ts` e `app/postcss.config.mjs`**

`app/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
```

`app/postcss.config.mjs`:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 5: Criar `app/src/app/globals.css`**

```css
@import "tailwindcss";

:root {
  --foreground: 240 10% 4%;
  --background: 0 0% 100%;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground: 0 0% 98%;
    --background: 240 10% 4%;
  }
}

body {
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  font-family: system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 6: Criar `app/src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QMIX Invest',
  description: 'Sistema de inteligência financeira pessoal — smart money tracking na B3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Criar `app/src/app/page.tsx` (placeholder)**

```typescript
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">QMIX Invest</h1>
        <p className="text-sm opacity-70">
          Sistema em construção. Veja /api/health para status.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 8: Instalar dependências do workspace**

Run: `npm install --workspace app`
Expected: instala Next, React, Tailwind, etc.

- [ ] **Step 9: Verificar que o app builda**

Run (do diretório raiz):
```bash
DATABASE_URL=<<REMOVIDO>> \
  npm --workspace app run build
```

Expected: build do Next.js completa sem erros (deve criar `.next/` e `.next/standalone/`).

- [ ] **Step 10: Commit**

```bash
git add app/ package-lock.json
git commit -m "feat(app): scaffold Next.js 15 app workspace

Sets up Next.js 15 with App Router, TypeScript strict, Tailwind v4,
React 19. Includes placeholder home page and base layout. Build
verified to produce standalone output for Docker."
```

---

## Task 4: Validação de env vars no app com Zod

**Files:**
- Create: `app/src/lib/env.ts`
- Test: `app/tests/lib/env.test.ts`

- [ ] **Step 1: Escrever teste falhando para `env.ts`**

`app/tests/lib/env.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('env validation', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('parses valid env vars', async () => {
    process.env.DATABASE_URL = '<<REMOVIDO>>';
    process.env.NODE_ENV = 'production';
    process.env.MODE = 'dry-run';
    process.env.LOG_LEVEL = 'info';
    const { env } = await import('../../src/lib/env');
    expect(env.DATABASE_URL).toBe('<<REMOVIDO>>');
    expect(env.MODE).toBe('dry-run');
  });

  it('throws on invalid MODE', async () => {
    process.env.DATABASE_URL = '<<REMOVIDO>>';
    process.env.NODE_ENV = 'production';
    process.env.MODE = 'invalid-mode';
    process.env.LOG_LEVEL = 'info';
    await expect(import('../../src/lib/env?invalid')).rejects.toThrow();
  });

  it('defaults LOG_LEVEL to info when missing', async () => {
    process.env.DATABASE_URL = '<<REMOVIDO>>';
    process.env.NODE_ENV = 'production';
    process.env.MODE = 'dry-run';
    delete process.env.LOG_LEVEL;
    const { env } = await import('../../src/lib/env?defaults');
    expect(env.LOG_LEVEL).toBe('info');
  });
});
```

- [ ] **Step 2: Rodar teste para confirmar que falha**

Run: `npm --workspace app run test -- env`
Expected: FAIL — módulo `../../src/lib/env` não existe.

- [ ] **Step 3: Criar `app/src/lib/env.ts`**

```typescript
import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url().refine(
    (s) => s.startsWith('postgres://') || s.startsWith('postgresql://'),
    { message: 'DATABASE_URL must be a postgres:// URL' }
  ),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MODE: z.enum(['dry-run', 'live']).default('dry-run'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
export type Env = typeof env;
```

- [ ] **Step 4: Rodar teste para confirmar que passa**

Run: `npm --workspace app run test -- env`
Expected: PASS — 3 testes passando.

- [ ] **Step 5: Commit**

```bash
git add app/src/lib/env.ts app/tests/lib/env.test.ts
git commit -m "feat(app): add zod-validated env loader

Validates required env vars at boot with clear error messages on
misconfig. Defaults LOG_LEVEL to info, MODE to dry-run. Tested for
valid/invalid inputs and defaults."
```

---

## Task 5: Cliente Drizzle no app

**Files:**
- Create: `app/src/lib/db.ts`
- Test: `app/tests/lib/db.test.ts`

- [ ] **Step 1: Escrever teste falhando para `db.ts`**

`app/tests/lib/db.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('db client', () => {
  it('exports a Drizzle client with the qmix_invest schema', async () => {
    process.env.DATABASE_URL = '<<REMOVIDO>>';
    process.env.NODE_ENV = 'test';
    process.env.MODE = 'dry-run';
    process.env.LOG_LEVEL = 'error';
    const { db, qmixInvest } = await import('../../src/lib/db');
    expect(db).toBeDefined();
    expect(qmixInvest).toBeDefined();
    expect(typeof db.execute).toBe('function');
  });
});
```

- [ ] **Step 2: Rodar teste — falha**

Run: `npm --workspace app run test -- db`
Expected: FAIL — `../../src/lib/db` não existe.

- [ ] **Step 3: Criar `app/src/lib/db.ts`**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env';

export { qmixInvest } from '@qmix-invest/db/schema';

const queryClient = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === 'production' ? 10 : 3,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);
export type Db = typeof db;
```

- [ ] **Step 4: Rodar teste — passa**

Run: `npm --workspace app run test -- db`
Expected: PASS.

(Nota: o teste só importa o módulo; não conecta de fato. Conexão real será exercitada em testes de integração após Docker estar de pé.)

- [ ] **Step 5: Commit**

```bash
git add app/src/lib/db.ts app/tests/lib/db.test.ts
git commit -m "feat(app): add Drizzle client wired to qmix_invest schema

Exports postgres-js + drizzle client with conservative pool settings
(10 connections in production, 3 in dev). Re-exports qmixInvest schema
from @qmix-invest/db so app code never imports schema directly."
```

---

## Task 6: Health endpoint no app

**Files:**
- Create: `app/src/app/api/health/route.ts`
- Test: `app/tests/api/health.test.ts`

- [ ] **Step 1: Escrever teste falhando**

`app/tests/api/health.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/lib/db', () => ({
  db: {
    execute: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
  qmixInvest: {},
}));

vi.mock('../../src/lib/env', () => ({
  env: {
    DATABASE_URL: '<<REMOVIDO>>',
    NODE_ENV: 'test',
    MODE: 'dry-run',
    LOG_LEVEL: 'error',
  },
}));

describe('GET /api/health', () => {
  it('returns ok JSON when database responds', async () => {
    const { GET } = await import('../../src/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.checks.database.ok).toBe(true);
    expect(typeof body.uptime_seconds).toBe('number');
    expect(body.version).toBeDefined();
  });

  it('returns degraded JSON when database fails', async () => {
    const dbModule = await import('../../src/lib/db');
    vi.mocked(dbModule.db.execute).mockRejectedValueOnce(new Error('connection refused'));
    const { GET } = await import('../../src/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.checks.database.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar teste — falha**

Run: `npm --workspace app run test -- health`
Expected: FAIL — rota `/api/health` não existe.

- [ ] **Step 3: Criar `app/src/app/api/health/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { sql } from 'drizzle-orm';

const startedAt = Date.now();
const VERSION = process.env.APP_VERSION ?? 'dev';

export async function GET() {
  const checks: Record<string, { ok: boolean; latency_ms?: number; error?: string }> = {};

  const dbStart = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = { ok: true, latency_ms: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      ok: false,
      latency_ms: Date.now() - dbStart,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // queue, ai_provider, telegram são adicionados nas Fases 1, 3, 4 respectivamente.
  // Por ora apenas database é o gate.

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      version: VERSION,
      mode: env.MODE,
      uptime_seconds: Math.floor((Date.now() - startedAt) / 1000),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
```

- [ ] **Step 4: Rodar teste — passa**

Run: `npm --workspace app run test -- health`
Expected: PASS — 2 testes.

- [ ] **Step 5: Commit**

```bash
git add app/src/app/api/health/route.ts app/tests/api/health.test.ts
git commit -m "feat(app): add /api/health endpoint with DB ping

Returns 200/ok with database latency when healthy, 503/degraded when
DB unreachable. Slots for queue/AI/Telegram checks reserved for later
phases. Includes APP_VERSION (set at build time) and process uptime."
```

---

## Task 7: Setup do workspace `worker/` com pg-boss e logger

**Files:**
- Create: `worker/package.json`
- Create: `worker/tsconfig.json`
- Create: `worker/src/env.ts`
- Create: `worker/src/logger.ts`
- Create: `worker/src/db.ts`
- Create: `worker/src/pg-boss.ts`
- Create: `worker/src/index.ts`

- [ ] **Step 1: Criar `worker/package.json`**

```json
{
  "name": "@qmix-invest/worker",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "tsx src/migrate.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@qmix-invest/db": "*",
    "drizzle-orm": "^0.40.0",
    "postgres": "^3.4.0",
    "pg-boss": "^10.0.0",
    "pino": "^9.5.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Criar `worker/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": false
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Criar `worker/src/env.ts`**

```typescript
import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url().refine(
    (s) => s.startsWith('postgres://') || s.startsWith('postgresql://'),
    { message: 'DATABASE_URL must be a postgres:// URL' }
  ),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MODE: z.enum(['dry-run', 'live']).default('dry-run'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid worker env:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

- [ ] **Step 4: Criar `worker/src/logger.ts`**

```typescript
import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'qmix-invest-worker' },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

- [ ] **Step 5: Criar `worker/src/db.ts`**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env';

export { qmixInvest } from '@qmix-invest/db/schema';

export const queryClient = postgres(env.DATABASE_URL, {
  max: 5,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);
```

- [ ] **Step 6: Criar `worker/src/pg-boss.ts`**

```typescript
import PgBoss from 'pg-boss';
import { env } from './env';
import { logger } from './logger';

let bossInstance: PgBoss | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (bossInstance) return bossInstance;

  bossInstance = new PgBoss({
    connectionString: env.DATABASE_URL,
    schema: 'pgboss',
    retryLimit: 5,
    retryDelay: 30,
    retryBackoff: true,
    expireInHours: 24,
    archiveCompletedAfterSeconds: 60 * 60 * 24 * 7, // 7 dias
    deleteAfterDays: 30,
  });

  bossInstance.on('error', (err) => {
    logger.error({ err }, 'pg-boss error');
  });

  await bossInstance.start();
  logger.info('pg-boss started');

  return bossInstance;
}

export async function stopBoss(): Promise<void> {
  if (!bossInstance) return;
  await bossInstance.stop({ graceful: true, wait: true });
  bossInstance = null;
  logger.info('pg-boss stopped');
}
```

- [ ] **Step 7: Criar `worker/src/index.ts` (entry point)**

```typescript
import { logger } from './logger';
import { getBoss, stopBoss } from './pg-boss';
import { env } from './env';

async function main() {
  logger.info({ mode: env.MODE, env: env.NODE_ENV }, 'QMIX Invest worker starting');

  const boss = await getBoss();

  // Job handlers serão registrados nas fases seguintes:
  // Fase 1: scrape-cvm-44, scrape-cvm-cda, scrape-sec-13f, etc.
  // Fase 2: recalculate-factors, aggregate-signals, evaluate-alerts
  // Fase 3: ai-analysis, generate-daily-report
  // Fase 4: send-telegram-message
  // Por ora, worker apenas inicia pg-boss e fica idle (mantém processo vivo).

  logger.info('worker idle — no handlers registered yet (Phase 0)');

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down');
    await stopBoss();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down');
    await stopBoss();
    process.exit(0);
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'worker failed to start');
  process.exit(1);
});
```

- [ ] **Step 8: Instalar dependências do worker**

Run: `npm install --workspace worker`
Expected: instala pg-boss, pino, postgres, drizzle, tsx.

- [ ] **Step 9: Verificar build**

Run: `npm --workspace worker run build`
Expected: compila para `worker/dist/`. Sem erros de tipo.

- [ ] **Step 10: Commit**

```bash
git add worker/ package-lock.json
git commit -m "feat(worker): scaffold pg-boss worker with structured logging

Adds worker workspace with pg-boss factory (singleton, graceful start/
stop, schema 'pgboss'), pino logger with service tag, env validator,
and entry point that starts pg-boss and waits for handlers.

No job handlers registered yet — those come in Phase 1+."
```

---

## Task 8: Migration runner com `pg_advisory_lock`

**Files:**
- Create: `worker/src/migrate.ts`
- Test: `worker/tests/migrate.test.ts`

- [ ] **Step 1: Escrever teste falhando**

`worker/tests/migrate.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('migrate runner', () => {
  it('exports a runMigrations function', async () => {
    const mod = await import('../src/migrate');
    expect(typeof mod.runMigrations).toBe('function');
  });

  it('acquires advisory lock before running migrations', async () => {
    const fakeDb = {
      execute: vi.fn().mockResolvedValue([]),
    };
    const fakeMigrate = vi.fn().mockResolvedValue(undefined);

    const { runMigrationsWithDeps } = await import('../src/migrate');
    await runMigrationsWithDeps(fakeDb as never, fakeMigrate, '/tmp/migrations');

    expect(fakeDb.execute).toHaveBeenCalledTimes(2); // lock + unlock
    expect(fakeMigrate).toHaveBeenCalledTimes(1);

    const lockCall = fakeDb.execute.mock.calls[0]?.[0];
    const unlockCall = fakeDb.execute.mock.calls[1]?.[0];
    expect(String(lockCall)).toContain('pg_advisory_lock');
    expect(String(unlockCall)).toContain('pg_advisory_unlock');
  });

  it('releases lock even if migration fails', async () => {
    const fakeDb = {
      execute: vi.fn().mockResolvedValue([]),
    };
    const fakeMigrate = vi.fn().mockRejectedValue(new Error('migration failed'));

    const { runMigrationsWithDeps } = await import('../src/migrate');
    await expect(
      runMigrationsWithDeps(fakeDb as never, fakeMigrate, '/tmp/migrations')
    ).rejects.toThrow('migration failed');

    expect(fakeDb.execute).toHaveBeenCalledTimes(2); // lock + unlock mesmo com falha
  });
});
```

- [ ] **Step 2: Rodar teste — falha**

Run: `npm --workspace worker run test`
Expected: FAIL — `../src/migrate` não existe.

- [ ] **Step 3: Criar `worker/src/migrate.ts`**

```typescript
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, queryClient } from './db';
import { logger } from './logger';

const LOCK_KEY = <<REMOVIDO>>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_MIGRATIONS = path.resolve(__dirname, '../../db/migrations');

type DbLike = { execute: (q: unknown) => Promise<unknown> };
type MigrateFn = (db: unknown, opts: { migrationsFolder: string }) => Promise<void>;

export async function runMigrationsWithDeps(
  database: DbLike,
  migrateFn: MigrateFn,
  migrationsFolder: string
): Promise<void> {
  await database.execute(sql`SELECT pg_advisory_lock(${LOCK_KEY})`);
  try {
    await migrateFn(database, { migrationsFolder });
  } finally {
    await database.execute(sql`SELECT pg_advisory_unlock(${LOCK_KEY})`);
  }
}

export async function runMigrations(): Promise<void> {
  logger.info({ folder: DEFAULT_MIGRATIONS }, 'running migrations');
  await runMigrationsWithDeps(db, migrate as MigrateFn, DEFAULT_MIGRATIONS);
  logger.info('migrations applied');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => queryClient.end())
    .catch((err) => {
      logger.fatal({ err }, 'migrate failed');
      queryClient.end();
      process.exit(1);
    });
}
```

- [ ] **Step 4: Rodar teste — passa**

Run: `npm --workspace worker run test`
Expected: PASS — 3 testes.

- [ ] **Step 5: Commit**

```bash
git add worker/src/migrate.ts worker/tests/migrate.test.ts
git commit -m "feat(worker): migration runner with distributed advisory lock

Wraps Drizzle migrator in pg_advisory_lock(123456789) so worker and
worker-b never apply migrations simultaneously. Lock is released in
finally block so failures don't leave the lock held. Tested with
mock db for both success and failure paths."
```

---

## Task 9: Dockerfile do worker

**Files:**
- Create: `worker/Dockerfile`
- Create: `worker/.dockerignore`

- [ ] **Step 1: Criar `worker/.dockerignore`**

```
node_modules
dist
.env
.env.*
tests
*.log
.git
```

- [ ] **Step 2: Criar `worker/Dockerfile` (multi-stage)**

```dockerfile
# ---- deps stage ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY worker/package.json ./worker/
COPY db/package.json ./db/
COPY app/package.json ./app/
RUN npm ci --workspace=worker --workspace=db --include-workspace-root

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/worker/node_modules ./worker/node_modules
COPY --from=deps /app/db/node_modules ./db/node_modules
COPY tsconfig.base.json ./
COPY worker/tsconfig.json ./worker/
COPY worker/src ./worker/src
COPY db/src ./db/src
COPY db/migrations ./db/migrations
COPY db/tsconfig.json ./db/
RUN npm --workspace worker run build

# ---- runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# uid:gid não-root
RUN addgroup -g 10001 -S app && adduser -u 10001 -S app -G app
USER app

COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --from=deps --chown=app:app /app/worker/node_modules ./worker/node_modules
COPY --from=deps --chown=app:app /app/db/node_modules ./db/node_modules
COPY --from=build --chown=app:app /app/worker/dist ./worker/dist
COPY --from=build --chown=app:app /app/db/migrations ./db/migrations
COPY --chown=app:app worker/package.json ./worker/
COPY --chown=app:app db/package.json ./db/
COPY --chown=app:app package.json ./

CMD ["node", "worker/dist/index.js"]
```

- [ ] **Step 3: Build local da imagem para verificar**

Run (do diretório raiz):
```bash
docker build -f worker/Dockerfile -t qmix-invest-worker:test .
```
Expected: build completa sem erros, imagem ~150-200 MB.

- [ ] **Step 4: Verificar tamanho final**

Run: `docker images qmix-invest-worker:test`
Expected: tamanho razoável (alpine + node_modules de runtime apenas).

- [ ] **Step 5: Commit**

```bash
git add worker/Dockerfile worker/.dockerignore
git commit -m "feat(worker): multi-stage Dockerfile with non-root user

Three stages: deps (npm ci with workspace filter), build (tsc), and
runtime (node:22-alpine, uid 10001 non-root). Final image runs
worker/dist/index.js. Built and verified locally."
```

---

## Task 10: Dockerfile do app

**Files:**
- Create: `app/Dockerfile`
- Create: `app/.dockerignore`

- [ ] **Step 1: Criar `app/.dockerignore`**

```
node_modules
.next
.env
.env.*
tests
*.log
.git
coverage
```

- [ ] **Step 2: Criar `app/Dockerfile`**

```dockerfile
# ---- deps stage ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY app/package.json ./app/
COPY db/package.json ./db/
COPY worker/package.json ./worker/
RUN npm ci --workspace=app --workspace=db --include-workspace-root

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/node_modules ./app/node_modules
COPY --from=deps /app/db/node_modules ./db/node_modules
COPY tsconfig.base.json ./
COPY app/ ./app/
COPY db/ ./db/
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION
RUN npm --workspace app run build

# ---- runtime stage (Next.js standalone) ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -g 10001 -S app && adduser -u 10001 -S app -G app
USER app

# Standalone do Next coloca tudo em .next/standalone com server.js na raiz
COPY --from=build --chown=app:app /app/app/.next/standalone ./
COPY --from=build --chown=app:app /app/app/.next/static ./app/.next/static
COPY --from=build --chown=app:app /app/app/public ./app/public

EXPOSE 3000
CMD ["node", "app/server.js"]
```

- [ ] **Step 3: Build local**

Run:
```bash
docker build -f app/Dockerfile -t qmix-invest-app:test --build-arg APP_VERSION=test-build .
```
Expected: build completa. Pode demorar 2-5 min na primeira vez (Next + Tailwind).

- [ ] **Step 4: Smoke run da imagem**

Run:
```bash
docker run --rm -e DATABASE_URL=<<REMOVIDO>> \
  -e NODE_ENV=production -e MODE=dry-run -e LOG_LEVEL=info \
  -p 3000:3000 qmix-invest-app:test &
sleep 5
curl -i http://localhost:3000/
```
Expected: HTTP 200 com HTML da home page. Mate o container com `docker stop $(docker ps -q --filter ancestor=qmix-invest-app:test)`.

- [ ] **Step 5: Commit**

```bash
git add app/Dockerfile app/.dockerignore
git commit -m "feat(app): multi-stage Dockerfile using Next standalone output

Three stages: deps, build (with APP_VERSION build-arg propagated to
runtime), runtime (alpine + standalone bundle). Non-root uid 10001.
Final image starts with 'node app/server.js' on port 3000.

Smoke-tested locally — home page returns 200."
```

---

## Task 11: docker-compose.yml — composição completa

**Files:**
- Create: `docker-compose.yml`
- Create: `docker-compose.dev.yml` (override para dev local)

- [ ] **Step 1: Criar `docker-compose.yml`**

```yaml
name: qmix-invest

services:
  postgres:
    image: postgres:17-alpine
    container_name: qmix-invest-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-qmix_invest}
      POSTGRES_PASSWORD: <<REMOVIDO>> is required}
      POSTGRES_DB: ${POSTGRES_DB:-qmix_invest}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - qmix-invest-postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - qmix_invest_internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-qmix_invest}"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 10s
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: "2.0"

  app:
    image: qmix-invest-app:${APP_VERSION:-latest}
    build:
      context: .
      dockerfile: app/Dockerfile
      args:
        APP_VERSION: ${APP_VERSION:-dev}
    container_name: qmix-invest-app
    restart: unless-stopped
    environment:
      DATABASE_URL: <<REMOVIDO>>
      NODE_ENV: production
      MODE: ${MODE:-dry-run}
      LOG_LEVEL: ${LOG_LEVEL:-info}
      APP_VERSION: ${APP_VERSION:-dev}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - qmix_invest_internal
    ports:
      - "127.0.0.1:3010:3000"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 20s
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "0.5"

  app-b:
    image: qmix-invest-app:${APP_VERSION:-latest}
    build:
      context: .
      dockerfile: app/Dockerfile
      args:
        APP_VERSION: ${APP_VERSION:-dev}
    container_name: qmix-invest-app-b
    restart: unless-stopped
    environment:
      DATABASE_URL: <<REMOVIDO>>
      NODE_ENV: production
      MODE: ${MODE:-dry-run}
      LOG_LEVEL: ${LOG_LEVEL:-info}
      APP_VERSION: ${APP_VERSION:-dev}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - qmix_invest_internal
    ports:
      - "127.0.0.1:3011:3000"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 20s
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "0.5"

  worker:
    image: qmix-invest-worker:${APP_VERSION:-latest}
    build:
      context: .
      dockerfile: worker/Dockerfile
    container_name: qmix-invest-worker
    restart: unless-stopped
    environment:
      DATABASE_URL: <<REMOVIDO>>
      NODE_ENV: production
      MODE: ${MODE:-dry-run}
      LOG_LEVEL: ${LOG_LEVEL:-info}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - qmix_invest_internal
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: "2.0"

  worker-b:
    image: qmix-invest-worker:${APP_VERSION:-latest}
    build:
      context: .
      dockerfile: worker/Dockerfile
    container_name: qmix-invest-worker-b
    restart: unless-stopped
    environment:
      DATABASE_URL: <<REMOVIDO>>
      NODE_ENV: production
      MODE: ${MODE:-dry-run}
      LOG_LEVEL: ${LOG_LEVEL:-info}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - qmix_invest_internal
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: "2.0"

networks:
  qmix_invest_internal:
    driver: bridge

volumes:
  qmix-invest-postgres-data:
```

- [ ] **Step 2: Criar `docker-compose.dev.yml` (override para dev local)**

```yaml
services:
  postgres:
    ports:
      # Em dev, expõe Postgres em localhost para você poder conectar com DBeaver/psql.
      # Em produção este override NÃO é aplicado, mantendo Postgres não exposto.
      - "127.0.0.1:5432:5432"
```

- [ ] **Step 3: Adicionar variáveis necessárias ao `.env.example`**

Editar `.env.example` (já criado em Task 1) e acrescentar (no topo, antes de DATABASE_URL):

```
# ===== Postgres (usado pelo Docker Compose) =====
POSTGRES_USER=qmix_invest
POSTGRES_PASSWORD=devpassword                  # use senha forte em produção
POSTGRES_DB=qmix_invest

# ===== Versão da aplicação (setada pelo deploy) =====
APP_VERSION=dev
```

- [ ] **Step 4: Criar `.env` local (cópia do .env.example) — NÃO commitar**

Run:
```bash
cp .env.example .env
```

Verificar que `.env` está no `.gitignore` (já está pela Task 1, Step 3).

- [ ] **Step 5: Subir o stack localmente**

Run:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```
Expected: builda 2 imagens, sobe 5 containers. Aguarda ~30-60s.

- [ ] **Step 6: Verificar healthchecks**

Run:
```bash
sleep 30
docker compose ps
```
Expected: todos os 5 services com status `running` e `healthy` (postgres, app, app-b) ou apenas `running` (worker, worker-b — não têm healthcheck nesta fase).

- [ ] **Step 7: Smoke test do health endpoint**

Run:
```bash
curl -i http://127.0.0.1:3010/api/health
curl -i http://127.0.0.1:3011/api/health
```
Expected: ambos retornam 200 com JSON contendo `"status":"ok"` (ou 503 com `"status":"degraded"` se a migration ainda não rodou — esperado nesta etapa).

- [ ] **Step 8: Rodar migrations dentro do worker container**

`worker/src/migrate.ts` (criado na Task 8) é compilado para `worker/dist/migrate.js` automaticamente pelo `tsc` durante o build do Dockerfile (todo `src/**/*` é incluído pelo `worker/tsconfig.json`).

Run:
```bash
docker compose exec worker node worker/dist/migrate.js
```
Expected: log `migrations applied`. O schema `qmix_invest` é criado no Postgres.

- [ ] **Step 9: Re-verificar /api/health agora retorna 200/ok**

Run: `curl http://127.0.0.1:3010/api/health`
Expected: `{"status":"ok","checks":{"database":{"ok":true,...}},...}`.

- [ ] **Step 10: Commit**

```bash
git add docker-compose.yml docker-compose.dev.yml .env.example
git commit -m "feat: docker-compose with 5 services (postgres, app, app-b, worker, worker-b)

Private network qmix_invest_internal isolates services. Postgres NOT
exposed in production (only via dev override on 127.0.0.1:5432).
Apps bind to 127.0.0.1:3010/3011 for Nginx upstream. Resource limits
applied (postgres/worker 4G/2cpu, app 1G/0.5cpu).

Healthchecks: pg_isready for postgres, /api/health for app/app-b.
worker/worker-b healthcheck deferred until pg-boss handlers exist.

Smoke-tested: all 5 containers start, migrations apply, /api/health
returns 200/ok against running Postgres."
```

---

## Task 12: Health endpoint estende com queue check

**Files:**
- Modify: `app/src/lib/pg-boss-client.ts` (criar)
- Modify: `app/src/app/api/health/route.ts`
- Modify: `app/tests/api/health.test.ts`

- [ ] **Step 1: Criar `app/src/lib/pg-boss-client.ts`**

Nota: nesta fase o app **não inicia o pg-boss** (não publica jobs ainda). A função `getBoss()` é exportada para uso futuro pelas Fases 2-4 (quando comandos do Telegram vão enfileirar jobs como `recalculate-factors`). Por ora, apenas `getQueueHealth()` é chamada.

```typescript
import PgBoss from 'pg-boss';
import { env } from './env';

let boss: PgBoss | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (boss) return boss;
  boss = new PgBoss({
    connectionString: env.DATABASE_URL,
    schema: 'pgboss',
    // app não consome jobs, apenas enfileira — usar perfil read-only
    noScheduling: true,
    noSupervisor: true,
  });
  await boss.start();
  return boss;
}

export async function getQueueHealth(): Promise<{
  ok: boolean;
  pending?: number;
  failed_24h?: number;
  error?: string;
}> {
  try {
    // Não usamos a API interna do pg-boss para contar jobs (instável entre versões).
    // Em vez disso, query direta no schema pgboss via Drizzle, que já temos.
    // Se o schema/tabela não existir ainda, capturamos erro abaixo.
    const { db } = await import('./db');
    const { sql } = await import('drizzle-orm');
    const result = await db.execute(sql`
      SELECT
        COALESCE(COUNT(*) FILTER (WHERE state IN ('created', 'retry', 'active')), 0)::int AS pending,
        COALESCE(COUNT(*) FILTER (WHERE state = 'failed' AND completed_on > now() - interval '24 hours'), 0)::int AS failed_24h
      FROM pgboss.job
    `);
    const row = result[0] as { pending: number; failed_24h: number } | undefined;
    return {
      ok: true,
      pending: row?.pending ?? 0,
      failed_24h: row?.failed_24h ?? 0,
    };
  } catch (err) {
    // Se pgboss schema ainda não foi criado (boss.start() nunca rodou),
    // o teste falha mas isso é OK na Fase 0 — fica degraded até o worker subir.
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
```

- [ ] **Step 2: Modificar `app/src/app/api/health/route.ts`**

Substituir o conteúdo por:

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { getQueueHealth } from '@/lib/pg-boss-client';
import { sql } from 'drizzle-orm';

const startedAt = Date.now();
const VERSION = process.env.APP_VERSION ?? 'dev';

export async function GET() {
  const checks: Record<string, unknown> = {};

  const dbStart = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = { ok: true, latency_ms: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      ok: false,
      latency_ms: Date.now() - dbStart,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  checks.queue = await getQueueHealth();

  const allOk = Object.values(checks).every(
    (c) => typeof c === 'object' && c !== null && (c as { ok: boolean }).ok
  );

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      version: VERSION,
      mode: env.MODE,
      uptime_seconds: Math.floor((Date.now() - startedAt) / 1000),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
```

- [ ] **Step 3: Atualizar teste existente**

Substituir `app/tests/api/health.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/lib/db', () => ({
  db: { execute: vi.fn() },
  qmixInvest: {},
}));

vi.mock('../../src/lib/pg-boss-client', () => ({
  getQueueHealth: vi.fn(),
  getBoss: vi.fn(),
}));

vi.mock('../../src/lib/env', () => ({
  env: { DATABASE_URL: '<<REMOVIDO>>', NODE_ENV: 'test', MODE: 'dry-run', LOG_LEVEL: 'error' },
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ok when DB and queue are healthy', async () => {
    const dbModule = await import('../../src/lib/db');
    const queueModule = await import('../../src/lib/pg-boss-client');
    vi.mocked(dbModule.db.execute).mockResolvedValue([{ '?column?': 1 }] as never);
    vi.mocked(queueModule.getQueueHealth).mockResolvedValue({ ok: true, pending: 0, failed_24h: 0 });

    const { GET } = await import('../../src/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.checks.database.ok).toBe(true);
    expect(body.checks.queue.ok).toBe(true);
  });

  it('returns degraded when DB fails', async () => {
    const dbModule = await import('../../src/lib/db');
    const queueModule = await import('../../src/lib/pg-boss-client');
    vi.mocked(dbModule.db.execute).mockRejectedValue(new Error('connection refused'));
    vi.mocked(queueModule.getQueueHealth).mockResolvedValue({ ok: true });

    const { GET } = await import('../../src/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.checks.database.ok).toBe(false);
  });

  it('returns degraded when queue fails', async () => {
    const dbModule = await import('../../src/lib/db');
    const queueModule = await import('../../src/lib/pg-boss-client');
    vi.mocked(dbModule.db.execute).mockResolvedValue([{ '?column?': 1 }] as never);
    vi.mocked(queueModule.getQueueHealth).mockResolvedValue({ ok: false, error: 'pgboss schema missing' });

    const { GET } = await import('../../src/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.checks.queue.ok).toBe(false);
  });
});
```

- [ ] **Step 4: Rodar testes**

Run: `npm --workspace app run test`
Expected: 3 + outros previamente já passantes → todos PASS.

- [ ] **Step 5: Re-build e re-deploy local**

```bash
docker compose build app app-b
docker compose up -d app app-b
sleep 15
curl http://127.0.0.1:3010/api/health | python3 -m json.tool
```
Expected: JSON com `database.ok=true` e `queue.ok=true`.

- [ ] **Step 6: Commit**

```bash
git add app/src/lib/pg-boss-client.ts app/src/app/api/health/route.ts app/tests/api/health.test.ts
git commit -m "feat(app): extend /api/health with pg-boss queue check

Adds getQueueHealth() that queries pgboss.job for pending/failed
counts. Health endpoint now returns 503 if either DB or queue is
unhealthy. Tested with mocked DB+queue in 3 scenarios."
```

---

## Task 13: Nginx vhost config

**Files:**
- Create: `nginx/qmix-invest.conf`
- Create: `nginx/README.md`

- [ ] **Step 1: Criar `nginx/qmix-invest.conf`**

```nginx
# /etc/nginx/conf.d/qmix-invest.conf
# Vhost para QMIX Invest. Aplicação roda em containers Docker locais
# nas portas 3010 (app) e 3011 (app-b) com failover via upstream.

upstream qmix_invest_backend {
    server 127.0.0.1:3010 max_fails=2 fail_timeout=10s;
    server 127.0.0.1:3011 max_fails=2 fail_timeout=10s backup;
    keepalive 32;
}

# Redirect HTTP -> HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name qf.qmix.digital;

    # Permite que o certbot (Let's Encrypt) faça challenges via HTTP-01
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name qf.qmix.digital;

    ssl_certificate     /etc/letsencrypt/live/qf.qmix.digital/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qf.qmix.digital/privkey.pem;

    # SSL hardening (mesmos defaults dos outros sites do host)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Security headers (alinhados com qmix-security-headers.conf existente)
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Logs separados (não polui logs dos outros sites)
    access_log /var/log/nginx/qmix-invest.access.log;
    error_log  /var/log/nginx/qmix-invest.error.log warn;

    # Limite de tamanho de body (relatórios podem ser grandes via Telegram webhook)
    client_max_body_size 10m;

    location / {
        proxy_pass http://qmix_invest_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        # Failover automático
        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 2;
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Webhook do Telegram (Fase 4) — endpoint sensível, sem cache
    location /api/telegram/webhook {
        proxy_pass http://qmix_invest_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
}
```

- [ ] **Step 2: Criar `nginx/README.md`**

```markdown
# Nginx — instruções de instalação na VPS

Este diretório contém o vhost dedicado de QMIX Invest. **NUNCA edite os
vhosts dos outros sites do host** — apenas adicione/altere este arquivo.

## Instalação inicial (uma vez por VPS)

\`\`\`bash
# Na VPS srv1166087, como root
cp /opt/qmix-invest/nginx/qmix-invest.conf /etc/nginx/conf.d/qmix-invest.conf

# Testa a config sem aplicar
nginx -t

# Se OK, reload (NÃO restart — restart pode causar drop de conexões dos outros sites)
systemctl reload nginx
\`\`\`

## Obter SSL Let's Encrypt

\`\`\`bash
# Pré-requisito: DNS de qf.qmix.digital já apontando para 31.97.173.40
apt install -y certbot python3-certbot-nginx
certbot certonly --nginx -d qf.qmix.digital --non-interactive --agree-tos -m qmixdigital@gmail.com

# Renovação automática já vem ativada como cron systemd
systemctl status certbot.timer
\`\`\`

## Atualizar a config no futuro

\`\`\`bash
# Edite localmente, faça push, e na VPS:
cd /opt/qmix-invest && git pull
diff /etc/nginx/conf.d/qmix-invest.conf nginx/qmix-invest.conf
cp nginx/qmix-invest.conf /etc/nginx/conf.d/qmix-invest.conf
nginx -t && systemctl reload nginx
\`\`\`
```

- [ ] **Step 3: Validar sintaxe do Nginx config**

Validação local não é direta (Nginx não está instalado na máquina dev). Pulamos teste automatizado — validação real acontece na VPS no Step 1 do `setup-vps.sh` (Task 15) com `nginx -t`.

- [ ] **Step 4: Commit**

```bash
git add nginx/
git commit -m "feat(nginx): vhost config for qf.qmix.digital

Upstream with primary (3010) and backup (3011) for failover via
proxy_next_upstream. Logs to dedicated files. SSL hardened (TLS 1.2+,
HSTS-equivalent headers). Telegram webhook location has tighter
timeouts and no buffering. README documents install steps without
restarting nginx."
```

---

## Task 14: Script `verify-other-sites.sh`

**Files:**
- Create: `scripts/verify-other-sites.sh`

- [ ] **Step 1: Criar `scripts/verify-other-sites.sh`**

```bash
#!/usr/bin/env bash
# verify-other-sites.sh
# Verifica que os 4 sites + 4 bots PM2 da VPS srv1166087 continuam saudáveis
# após qualquer ação no QMIX Invest. Sai com exit-code != 0 se algum estiver
# afetado, sinalizando ao deploy.sh para iniciar rollback.

set -euo pipefail

OTHER_SITES=(
  "https://acesso.qmix.com.br"
  "https://acesso2.qmix.com.br"
  "https://chatbotbrx.com.br"
  "https://editor.qmix.com.br"
)

OTHER_PM2_BOTS=(
  "bot-rest-1"
  "bot-sae-1"
  "bot-sae-1b"
  "bot-afiliado-1"
)

failures=0

echo "==> Verificando sites HTTPS..."
for url in "${OTHER_SITES[@]}"; do
  code=$(curl -ksI -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")
  if [[ "$code" =~ ^(200|301|302|401|403)$ ]]; then
    echo "    OK  $url ($code)"
  else
    echo "    FAIL $url ($code)"
    ((failures++))
  fi
done

echo "==> Verificando bots PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  echo "    AVISO pm2 não encontrado neste ambiente (script rodando fora da VPS?)"
else
  pm2_status=$(pm2 jlist 2>/dev/null || echo "[]")
  for bot in "${OTHER_PM2_BOTS[@]}"; do
    status=$(echo "$pm2_status" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for app in data:
    if app.get('name') == '$bot':
        print(app.get('pm2_env', {}).get('status', 'unknown'))
        sys.exit(0)
print('not_found')
" 2>/dev/null || echo "parse_error")
    if [ "$status" = "online" ]; then
      echo "    OK  $bot ($status)"
    else
      echo "    FAIL $bot ($status)"
      ((failures++))
    fi
  done
fi

if [ "$failures" -gt 0 ]; then
  echo ""
  echo "==> $failures verificação(ões) falharam — outros serviços do host podem ter sido afetados."
  exit 1
fi

echo ""
echo "==> Todos os outros sites e bots da VPS estão saudáveis."
exit 0
```

- [ ] **Step 2: Tornar executável**

```bash
chmod +x scripts/verify-other-sites.sh
```

- [ ] **Step 3: Smoke test local (vai falhar fora da VPS, isso é esperado)**

Run: `./scripts/verify-other-sites.sh`
Expected: na máquina dev local, todos os HTTPS sites devem retornar OK (eles são públicos), e o pm2 vai reportar AVISO (não instalado localmente). Exit code 0 se HTTPS estiver OK.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-other-sites.sh
git commit -m "feat(scripts): verify-other-sites checks 4 sites + 4 PM2 bots

Polls the 4 QMix sites already on the VPS (acesso, acesso2, chatbotbrx,
editor) and verifies the 4 WhatsApp PM2 bots are 'online'. Used by
deploy.sh to fail-fast and trigger rollback if QMIX Invest deploy
disrupted any of them. Acceptable HTTP codes: 200/301/302/401/403."
```

---

## Task 15: Script `deploy.sh`

**Files:**
- Create: `scripts/deploy.sh`

- [ ] **Step 1: Criar `scripts/deploy.sh`**

```bash
#!/usr/bin/env bash
# deploy.sh — Deploy zero-downtime para QMIX Invest
# Executar na VPS srv1166087 dentro de /opt/qmix-invest

set -euo pipefail
cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"

# Carrega .env (sem export blanket — apenas se a variável de telegram existir)
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . .env
  set +a
fi

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

log() { echo "[$(date +%H:%M:%S)] $*"; }
notify() {
  local msg="$1"
  if [ -n "<<REMOVIDO>>" ] && [ -n "<<REMOVIDO>>" ]; then
    curl -sS --max-time 10 -X POST \
      "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_OWNER_CHAT_ID}" \
      -d "text=${msg}" >/dev/null || log "(falha ao notificar Telegram)"
  fi
}

run() {
  log "+ $*"
  if [ "$DRY_RUN" = "1" ]; then return 0; fi
  "$@"
}

# 0. Snapshot do estado atual
PREV_TAG=$(docker compose images app --format '{{.Tag}}' 2>/dev/null | head -n1 || echo "none")
PREV_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "none")
echo "$PREV_COMMIT" > "$PROJECT_ROOT/.deploy-prev-commit"
log "Snapshot: previous tag=$PREV_TAG, commit=$PREV_COMMIT"

# 1. Pull + build
run git fetch
run git pull --ff-only
NEW_TAG="v$(date -u +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
log "New tag: $NEW_TAG"
run docker compose build --pull \
  --build-arg APP_VERSION="$NEW_TAG" \
  app worker

run docker tag qmix-invest-app:latest "qmix-invest-app:$NEW_TAG"
run docker tag qmix-invest-worker:latest "qmix-invest-worker:$NEW_TAG"

# 2. Migrate (com lock distribuído — seguro de chamar múltiplas vezes)
run docker compose run --rm worker node worker/dist/migrate.js

# 3. Roll app (uma instância por vez)
for service in app app-b; do
  log "Deploying $service..."
  run docker compose up -d --no-deps --build "$service"

  # Healthcheck loop
  for i in $(seq 1 30); do
    if [ "$DRY_RUN" = "1" ]; then break; fi
    if docker compose exec -T "$service" wget -qO- http://localhost:3000/api/health 2>/dev/null | grep -q '"status":"ok"'; then
      log "  $service healthy"
      break
    fi
    sleep 2
    if [ "$i" = "30" ]; then
      log "FAIL: $service não passou healthcheck"
      notify "❌ Deploy QMIX Invest FAILED no $service. Iniciando rollback."
      "$PROJECT_ROOT/scripts/rollback.sh" "$PREV_TAG"
      exit 1
    fi
  done
  sleep 3  # janela para Nginx detectar
done

# 4. Roll worker
for service in worker worker-b; do
  log "Deploying $service..."
  run docker compose up -d --no-deps --build "$service"
  sleep 5
done

# 5. Verificação dos OUTROS sites/bots da VPS (CRÍTICO)
log "Verificando outros sites e bots do host..."
if [ "$DRY_RUN" = "0" ] && ! "$PROJECT_ROOT/scripts/verify-other-sites.sh"; then
  log "ALERTA: outros sites afetados. Iniciando rollback..."
  notify "🚨 Deploy QMIX Invest afetou outros sites. Rollback automático iniciado."
  "$PROJECT_ROOT/scripts/rollback.sh" "$PREV_TAG"
  exit 2
fi

# 6. Tag :previous para rollback rápido
run docker tag "qmix-invest-app:$NEW_TAG" qmix-invest-app:previous
run docker tag "qmix-invest-worker:$NEW_TAG" qmix-invest-worker:previous

# 7. Limpeza de imagens antigas (mantém últimas 5 versões)
run docker image prune -f --filter "label=app=qmix-invest" --filter "until=168h" || true

log "✅ Deploy $NEW_TAG concluído."
notify "✅ Deploy QMIX Invest $NEW_TAG concluído. Outros sites verificados OK."
```

- [ ] **Step 2: Tornar executável**

```bash
chmod +x scripts/deploy.sh
```

- [ ] **Step 3: Smoke test local em dry-run**

Run: `./scripts/deploy.sh --dry-run`
Expected: imprime os comandos sem executá-los, exit 0. (Não tente rodar sem `--dry-run` localmente — `docker compose exec` numa máquina sem o stack vai falhar.)

- [ ] **Step 4: Commit**

```bash
git add scripts/deploy.sh
git commit -m "feat(scripts): zero-downtime deploy with auto-rollback

Snapshots :previous tag and prev commit before any change. Builds new
image tagged with timestamp+SHA. Runs migrations once with advisory
lock. Rolls app then app-b then worker then worker-b, waiting for
healthcheck after each app instance. After all 4 services roll,
calls verify-other-sites.sh — if any of the 4 other QMix sites or
4 PM2 bots are unhealthy, triggers rollback.sh automatically.

Notifies via Telegram on success and any failure path.

--dry-run flag prints commands without executing for local testing."
```

---

## Task 16: Script `rollback.sh`

**Files:**
- Create: `scripts/rollback.sh`

- [ ] **Step 1: Criar `scripts/rollback.sh`**

```bash
#!/usr/bin/env bash
# rollback.sh — Reverte deploy para a tag :previous (ou tag específica)
# Uso: ./rollback.sh [TAG]
# Se TAG omitida, usa :previous.

set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . .env
  set +a
fi

TARGET_TAG="${1:-previous}"

log() { echo "[$(date +%H:%M:%S)] $*"; }
notify() {
  local msg="$1"
  if [ -n "<<REMOVIDO>>" ] && [ -n "<<REMOVIDO>>" ]; then
    curl -sS --max-time 10 -X POST \
      "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_OWNER_CHAT_ID}" \
      -d "text=${msg}" >/dev/null || true
  fi
}

log "Rolling back to tag: $TARGET_TAG"

# Verifica que as tags existem
if ! docker image inspect "qmix-invest-app:$TARGET_TAG" >/dev/null 2>&1; then
  log "ERRO: imagem qmix-invest-app:$TARGET_TAG não existe"
  exit 1
fi

# Reverte tags
docker tag "qmix-invest-app:$TARGET_TAG" qmix-invest-app:latest
docker tag "qmix-invest-worker:$TARGET_TAG" qmix-invest-worker:latest

# Recria containers em ordem (app primeiro, worker depois)
for service in app app-b; do
  log "Recriando $service com $TARGET_TAG..."
  docker compose up -d --no-deps --force-recreate "$service"
  sleep 5
done

for service in worker worker-b; do
  log "Recriando $service com $TARGET_TAG..."
  docker compose up -d --no-deps --force-recreate "$service"
  sleep 3
done

# Reverte código local (se .deploy-prev-commit existir)
if [ -f .deploy-prev-commit ]; then
  PREV_COMMIT=$(cat .deploy-prev-commit)
  log "Revertendo git para $PREV_COMMIT"
  git reset --hard "$PREV_COMMIT" || log "(reset falhou, mas containers já foram revertidos)"
fi

log "✅ Rollback concluído para $TARGET_TAG"
notify "⚠️ Rollback executado. QMIX Invest revertido para $TARGET_TAG."
```

- [ ] **Step 2: Tornar executável**

```bash
chmod +x scripts/rollback.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/rollback.sh
git commit -m "feat(scripts): rollback script reverts to :previous tag

Validates target tag exists, retags as :latest, force-recreates app
then worker containers (preserving order so DB schema isn't impacted),
and resets git to the commit recorded in .deploy-prev-commit.
Notifies Telegram on completion."
```

---

## Task 17: Script `setup-vps.sh` (one-time)

**Files:**
- Create: `scripts/setup-vps.sh`

- [ ] **Step 1: Criar `scripts/setup-vps.sh`**

```bash
#!/usr/bin/env bash
# setup-vps.sh — One-time setup para QMIX Invest na VPS srv1166087.
# Executar como root. NÃO toca em nenhum serviço existente.

set -euo pipefail

log() { echo "[$(date +%H:%M:%S)] $*"; }

# 1. Verifica que estamos rodando como root
if [ "$(id -u)" != "0" ]; then
  log "ERRO: este script precisa ser executado como root"
  exit 1
fi

# 2. Verifica que estamos em uma VPS Linux com Nginx instalado (não na máquina dev)
if ! command -v nginx >/dev/null 2>&1; then
  log "ERRO: Nginx não está instalado — este script é para a VPS srv1166087"
  exit 1
fi

# 3. Instala Docker se não estiver instalado
if ! command -v docker >/dev/null 2>&1; then
  log "Docker não encontrado — instalando..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

# 4. Verifica que docker compose v2 funciona
if ! docker compose version >/dev/null 2>&1; then
  log "ERRO: docker compose v2 não está disponível"
  exit 1
fi

# 5. Cria diretório do projeto se não existir
PROJECT_DIR="/opt/qmix-invest"
if [ ! -d "$PROJECT_DIR" ]; then
  log "Criando $PROJECT_DIR..."
  mkdir -p "$PROJECT_DIR"
  chown root:root "$PROJECT_DIR"
  chmod 755 "$PROJECT_DIR"
fi

# 6. Cria diretório de backups
mkdir -p "$PROJECT_DIR/backups"
chmod 700 "$PROJECT_DIR/backups"

# 7. Verifica conflito de portas (3010, 3011 NÃO podem estar ocupadas por outros serviços)
for port in 3010 3011; do
  if ss -ltn "sport = :$port" | grep -q LISTEN; then
    log "ERRO: porta $port já está em uso. Veja com: ss -ltnp 'sport = :$port'"
    exit 1
  fi
done

# 8. Verifica conflito de portas Postgres no host (5432) NÃO importa, pois Postgres vai
#    rodar dentro da rede Docker privada (não exposto no host em produção).

# 9. Verifica que Nginx vhost ainda não existe (idempotência)
NGINX_CONF="/etc/nginx/conf.d/qmix-invest.conf"
if [ -f "$NGINX_CONF" ]; then
  log "Nginx vhost já existe em $NGINX_CONF — pulando criação"
else
  log "Aplicando Nginx vhost..."
  if [ -f "$PROJECT_DIR/nginx/qmix-invest.conf" ]; then
    cp "$PROJECT_DIR/nginx/qmix-invest.conf" "$NGINX_CONF"
    if nginx -t; then
      systemctl reload nginx
      log "  vhost aplicado e Nginx recarregado"
    else
      log "ERRO: nginx -t falhou. Removendo vhost..."
      rm "$NGINX_CONF"
      exit 1
    fi
  else
    log "  AVISO: $PROJECT_DIR/nginx/qmix-invest.conf não existe ainda. Pule este passo até clonar o repo."
  fi
fi

# 10. Verifica DNS de qf.qmix.digital
log "Verificando DNS de qf.qmix.digital..."
DNS_IP=$(dig +short qf.qmix.digital A | head -n1 || echo "")
HOST_IP="31.97.173.40"
if [ "$DNS_IP" = "$HOST_IP" ]; then
  log "  DNS OK ($DNS_IP)"
elif [ -z "$DNS_IP" ]; then
  log "  AVISO: DNS de qf.qmix.digital não resolve — configure no Cloudflare apontando para $HOST_IP"
else
  log "  AVISO: DNS aponta para $DNS_IP, esperado $HOST_IP"
fi

log ""
log "✅ Setup concluído. Próximos passos:"
log "  1. cd $PROJECT_DIR && git clone <repo> ."
log "  2. cp .env.example .env && edit .env (POSTGRES_PASSWORD, AI_API_KEY, TELEGRAM_*)"
log "  3. ./scripts/deploy.sh"
log "  4. certbot certonly --nginx -d qf.qmix.digital --non-interactive --agree-tos -m qmixdigital@gmail.com"
log "  5. systemctl reload nginx"
```

- [ ] **Step 2: Tornar executável e commit**

```bash
chmod +x scripts/setup-vps.sh
git add scripts/setup-vps.sh
git commit -m "feat(scripts): one-time VPS bootstrap script

Validates: running as root, Nginx installed (sanity check we're on
the VPS), Docker available + compose v2. Creates /opt/qmix-invest
and /opt/qmix-invest/backups with safe perms. Verifies ports 3010
and 3011 are free. Idempotently applies Nginx vhost from the repo
(only after nginx -t passes). Validates DNS of qf.qmix.digital.

Designed to fail loudly without changing system state if anything
is wrong, so it cannot disrupt the existing 4 sites + 4 bots."
```

---

## Task 18: Smoke test integrado e commit final da Fase 0

**Files:**
- Modify: `README.md` (adicionar seção "Status da Fase 0")

- [ ] **Step 1: Subir tudo localmente do zero**

Run:
```bash
docker compose down -v  # limpa estado anterior
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
sleep 45
```

- [ ] **Step 2: Verificar estado de todos os containers**

Run: `docker compose ps`
Expected: 5 services rodando, app/app-b/postgres com healthcheck `healthy`.

- [ ] **Step 3: Aplicar migrations**

Run: `docker compose exec worker node worker/dist/migrate.js`
Expected: log `migrations applied`.

- [ ] **Step 4: Verificar `/api/health` em ambas instâncias**

Run:
```bash
curl -s http://127.0.0.1:3010/api/health | python3 -m json.tool
curl -s http://127.0.0.1:3011/api/health | python3 -m json.tool
```
Expected: ambas `{"status":"ok",...}` com `database.ok=true` e `queue.ok=true`.

- [ ] **Step 5: Rodar suite de testes completa**

Run: `npm test`
Expected: todos os testes (env, db, health, migrate, pg-boss) PASS.

- [ ] **Step 6: Verificar typecheck**

Run: `npm run typecheck`
Expected: sem erros TypeScript.

- [ ] **Step 7: Atualizar README com status da Fase 0**

Adicionar ao final do `README.md`:

```markdown
## Status

- ✅ Fase 0: Infraestrutura — concluída em 2026-05-04
- ⏳ Fase 1: Scrapers + bootstrap histórico — pendente
- ⏳ Fase 2: Motor de sinais — pendente
- ⏳ Fase 3: Camada de IA — pendente
- ⏳ Fase 4: Bot Telegram — pendente
- ⏳ Fase 5: Dashboard admin — pendente
- ⏳ Fase 7: Deploy + dry-run + go-live — pendente

## Como adicionar uma nova migration

\`\`\`bash
# 1. Edite db/src/schema.ts adicionando/alterando tabelas
# 2. Gere a SQL
DATABASE_URL=<your_db> npm run db:generate
# 3. Revise db/migrations/<NNNN>_<name>.sql antes de commit
# 4. Aplique
docker compose exec worker node worker/dist/migrate.js
\`\`\`

## Como rodar testes

\`\`\`bash
npm test                # tudo
npm run test:watch      # watch mode
npm --workspace app run test    # só app
npm --workspace worker run test # só worker
\`\`\`
```

- [ ] **Step 8: Commit final da Fase 0**

```bash
git add README.md
git commit -m "chore(phase-0): infrastructure complete

All 5 services start cleanly via docker compose. Migrations apply with
distributed lock. /api/health returns 200/ok with DB and queue checks.
All unit/integration tests pass on both app and worker workspaces.

Ready for Phase 1: scrapers and historical bootstrap."
```

- [ ] **Step 9: Tag de release da Fase 0**

```bash
git tag -a phase-0-complete -m "Phase 0: Infrastructure ready"
```

---

## Como executar este plano

A skill `superpowers:writing-plans` recomenda dois modos:

1. **Subagent-driven (recomendado)** — um subagente fresco por task, com revisão entre tasks. Bom quando você quer paralelismo controlado e contexto limpo a cada passo.
2. **Inline execution** — executa as tasks na sessão atual em batches com checkpoints. Bom quando você quer ver o progresso em tempo real.

Veja seção "Execution Handoff" da skill para detalhes.

---

## O que NÃO está nesta fase (vai para Fase 1+)

- ❌ Tabelas de domínio (companies, tickers, prices_daily, etc.) — Fase 1
- ❌ Qualquer scraper (CVM, B3, SEC) — Fase 1
- ❌ Motor de sinais (factors F1-F23, agregação) — Fase 2
- ❌ Camada de IA com providers reais — Fase 3
- ❌ Bot Telegram funcional (apenas placeholders no env e nginx) — Fase 4
- ❌ Dashboard admin — Fase 5
- ❌ SSL Let's Encrypt obtido (depende de DNS) — Task 17 documenta como, mas a execução é manual após DNS
- ❌ Bootstrap histórico de dados — Fase 1
- ❌ GitHub Actions CI — Fase 7 (pré-go-live)
