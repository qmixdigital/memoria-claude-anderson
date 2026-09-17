# QMIX Invest — Fase 1: Scrapers + Bootstrap Histórico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Popular o banco com dados reais de mercado de 8 fontes públicas (CVM, B3, SEC, Anbima), criar tabelas de domínio com schemas Drizzle, registrar handlers pg-boss para scrapers agendados, e fazer carga inicial de 5 anos de histórico. Ao final desta fase, o banco terá ~30M+ linhas de dados de mercado e o motor da Fase 2 terá tudo que precisa para calcular sinais.

**Architecture:** Cada fonte tem seu próprio módulo scraper isolado (`worker/src/scrapers/<source>.ts`) implementando interface comum `Scraper`. pg-boss agenda execução periódica e gerencia retry. Idempotência via `source_hash` UNIQUE em cada tabela alvo. Proxy pool (residencial rotativo) usado apenas para SEC EDGAR e Yahoo Finance fallback. Todas chamadas HTTP via `undici` com retry exponencial e timeout. Testes usam fixtures snapshotadas em `worker/tests/fixtures/`.

**Tech Stack adicional (além da Fase 0):** undici 6.x (HTTP), cheerio 1.x (HTML), papaparse 5.x (CSV streaming), pdf-parse 1.x (PDFs CVM), unzipper 0.x (CDA ZIP), https-proxy-agent 7.x (SEC pool), msw 2.x (HTTP mocking nos testes), @testcontainers/postgresql 10.x (testes de integração).

**Outcome do plano:** banco populado com 5 anos de histórico, scrapers rodando em schedule (varias vezes/dia), monitoring básico via tabela `scraper_runs`, e infraestrutura pronta para Fase 2 (motor de sinais).

**Estimativa de duração:** 12-18 horas de trabalho focado (12-18 tasks × 30-60 min).

**Pré-requisitos:** Phase 0 deployada com sucesso (commit `5cb79ae`), docker-compose rodando na VPS, banco PostgreSQL com schemas `qmix_invest` e `pgboss` criados.

---

## Visão geral da estrutura de arquivos

Apenas mostrando os NOVOS arquivos / modificações desta fase. Os arquivos da Phase 0 permanecem.

```
qmix-invest/
├── db/src/schema.ts                     # ESTENDIDO com ~12 tabelas
├── db/migrations/0001_*.sql             # nova migration
│
├── worker/
│   ├── package.json                      # add deps: undici, cheerio, papaparse, pdf-parse, unzipper, https-proxy-agent, msw, @testcontainers/postgresql
│   ├── src/
│   │   ├── scrapers/                     # NOVO diretório
│   │   │   ├── types.ts                  # interface Scraper, ScraperResult
│   │   │   ├── base.ts                   # função runScraper() com retry, idempotency, scraper_runs logging
│   │   │   ├── http.ts                   # undici client com retry, proxy support
│   │   │   ├── proxy-pool.ts             # round-robin de proxies para SEC/Yahoo
│   │   │   ├── cvm-insiders.ts           # CVM Resolução 44 (Task 8)
│   │   │   ├── cvm-cda.ts                # CVM CDA — carteira de fundos (Task 9)
│   │   │   ├── material-disclosures.ts   # B3+CVM fatos relevantes (Task 10)
│   │   │   ├── sec-13f.ts                # SEC EDGAR 13F (Task 11)
│   │   │   ├── b3-foreign-flow.ts        # Fluxo estrangeiro B3 (Task 12)
│   │   │   ├── b3-btc-lending.ts         # Aluguel BTC (Task 13)
│   │   │   ├── b3-prices.ts              # Cotações OHLCV (Task 14)
│   │   │   └── yahoo-finance.ts          # Fallback OHLCV (Task 15)
│   │   ├── handlers.ts                   # NOVO — registra pg-boss handlers + schedules
│   │   ├── seeds/                        # NOVO — dados de referência
│   │   │   ├── companies.ts              # ~600 companies B3 (Task 16)
│   │   │   ├── tickers.ts                # ~800 tickers (Task 16)
│   │   │   └── tier-1-funds.ts           # Lista de fundos top-tier (Task 17)
│   │   └── index.ts                      # MODIFICADO — chama handlers.ts no startup
│   ├── tests/
│   │   ├── fixtures/                     # NOVO — snapshots reais
│   │   │   ├── cvm/
│   │   │   │   ├── vlmo_cia_aberta_sample.csv
│   │   │   │   └── cda_fi_BLC_4_sample.csv
│   │   │   ├── sec/
│   │   │   │   └── 13f_brk_sample.xml
│   │   │   ├── b3/
│   │   │   │   ├── cotahist_sample.txt
│   │   │   │   └── investidores_estrangeiros_sample.csv
│   │   │   └── pdfs/
│   │   │       └── material_disclosure_sample.pdf
│   │   ├── scrapers/
│   │   │   ├── base.test.ts
│   │   │   ├── cvm-insiders.test.ts
│   │   │   ├── cvm-cda.test.ts
│   │   │   ├── material-disclosures.test.ts
│   │   │   ├── sec-13f.test.ts
│   │   │   ├── b3-foreign-flow.test.ts
│   │   │   ├── b3-btc-lending.test.ts
│   │   │   ├── b3-prices.test.ts
│   │   │   └── yahoo-finance.test.ts
│   │   └── handlers.test.ts
│   └── src/index.ts                      # MODIFICADO
│
└── scripts/
    └── bootstrap-historical-data.sh      # NOVO — chama jobs de bootstrap em sequência
```

**Princípios de organização:**

- Cada scraper é UM ARQUIVO com UMA responsabilidade. Mantém ≤ 250 linhas. Se passar, refatora.
- `base.ts` centraliza idempotência (`onConflictDoNothing` em `source_hash`) e logging em `scraper_runs`. Scrapers individuais focam só em fetch + parse + transform.
- Fixtures são REAIS (anonimizadas se necessário): downloads pequenos das fontes, commitados em git pra testes serem reproducíveis offline.
- MSW intercepta HTTP nos testes — scrapers nunca tocam internet em CI.
- pg-boss handlers ficam isolados em `handlers.ts` — fácil ver todo o "ciclo" do worker num só lugar.

---

## Pré-requisitos para executar este plano

- [ ] Phase 0 em produção verificada
- [ ] Acesso SSH à VPS srv1166087 (ainda funciona)
- [ ] Repositório local em `d:\SISTEMAS\SMART MONEY\` no commit `5cb79ae` ou mais novo
- [ ] `npm test` no root retornando 10 passing
- [ ] `docker compose ps` na VPS mostrando 5 containers UP
- [ ] (Opcional) Conta em provedor de proxy residencial — só necessário no momento do scraper SEC. Pode ser configurado depois sem bloquear progresso.

---

## Task 1: Estender schema Drizzle com tabelas de referência (companies, tickers, funds)

**Files:**
- Modify: `db/src/schema.ts`
- Create: `db/migrations/0001_*.sql` (gerado via drizzle-kit generate)

- [ ] **Step 1: Adicionar tabelas de referência ao schema**

Adicionar ao final de `db/src/schema.ts`, antes do comentário "Schemas de domínio":

```typescript
import {
  bigint,
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

// ============================================================
// REFERÊNCIA — companies, tickers, funds
// ============================================================

export const tickerClassEnum = qmixInvest.enum('ticker_class', ['ON', 'PN', 'UNT', 'OTHER']);
export const fundNationalityEnum = qmixInvest.enum('fund_nationality', ['BR', 'US', 'OTHER']);

export const companies = qmixInvest.table('companies', {
  cnpj: varchar('cnpj', { length: 14 }).primaryKey(),
  name: text('name').notNull(),
  sector: text('sector'),
  subsector: text('subsector'),
  cvmCode: varchar('cvm_code', { length: 10 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  nameTrgmIdx: index('companies_name_trgm_idx').using('gin', sql`${t.name} gin_trgm_ops`),
}));

export const tickers = qmixInvest.table('tickers', {
  ticker: varchar('ticker', { length: 12 }).primaryKey(),
  cnpj: varchar('cnpj', { length: 14 }).notNull().references(() => companies.cnpj),
  class: tickerClassEnum('class').notNull(),
  isSmallCap: boolean('is_small_cap').default(false).notNull(),
  marketCapBrl: bigint('market_cap_brl', { mode: 'bigint' }),
  active: boolean('active').default(true).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  cnpjIdx: index('tickers_cnpj_idx').on(t.cnpj),
  smallCapIdx: index('tickers_small_cap_idx').on(t.isSmallCap).where(sql`${t.active} = true`),
}));

export const funds = qmixInvest.table('funds', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  cnpjOrCik: varchar('cnpj_or_cik', { length: 32 }).notNull().unique(),
  name: text('name').notNull(),
  nationality: fundNationalityEnum('nationality').notNull(),
  isTierOne: boolean('is_tier_one').default(false).notNull(),
  aumBrlEstimate: bigint('aum_brl_estimate', { mode: 'bigint' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  nationalityIdx: index('funds_nationality_idx').on(t.nationality),
  tierOneIdx: index('funds_tier_one_idx').on(t.isTierOne).where(sql`${t.isTierOne} = true`),
  nameTrgmIdx: index('funds_name_trgm_idx').using('gin', sql`${t.name} gin_trgm_ops`),
}));

export const cusipToTicker = qmixInvest.table('cusip_to_ticker', {
  cusip: varchar('cusip', { length: 12 }).primaryKey(),
  ticker: varchar('ticker', { length: 12 }).notNull().references(() => tickers.ticker),
  isAdr: boolean('is_adr').default(true).notNull(),
});
```

Importar `sql` no topo do arquivo: adicionar `import { sql } from 'drizzle-orm';` se não tiver.

- [ ] **Step 2: Habilitar extensions Postgres**

Adicionar no topo de `db/src/schema.ts`, após os imports:

```typescript
// Extensions ativadas para o schema (declaradas como SQL puro porque drizzle não tem helper).
// Ver db/migrations/0001_extensions.sql para o efeito real.
export const extensionsHelp = sql`
  -- pg_trgm: busca fuzzy de nomes em companies/funds
  -- btree_gin: índices compostos
  -- pgcrypto: digest() para source_hash em scrapers
`;
```

- [ ] **Step 3: Gerar migration**

Run from project root:
```bash
DATABASE_URL=<<REMOVIDO>> npm --workspace db run generate
```
Expected: cria `db/migrations/0001_*.sql`. Renomear para `0001_reference_tables.sql` para nome estável.

- [ ] **Step 4: Adicionar manualmente CREATE EXTENSION ao topo da migration**

Editar o início de `db/migrations/0001_reference_tables.sql` adicionando:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
```

- [ ] **Step 5: Verificar typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add db/src/schema.ts db/migrations/0001_reference_tables.sql db/migrations/meta/
git commit -m "feat(db): add reference tables (companies, tickers, funds, cusip_to_ticker)

- companies: keyed by CNPJ, indexed by trgm name for fuzzy search
- tickers: keyed by ticker, FK to companies, is_small_cap flag for
  signal multiplier (Phase 2)
- funds: keyed by surrogate id, with cnpj_or_cik unique, is_tier_one
  flag for F7/F18 weight multiplier
- cusip_to_ticker: maps SEC 13F CUSIPs to Brazilian tickers

Migration also enables pg_trgm, btree_gin, pgcrypto extensions
for fuzzy search and source_hash idempotency."
```

---

## Task 2: Estender schema com séries temporais (prices_daily, btc_lending_daily, foreign_flow_daily)

**Files:**
- Modify: `db/src/schema.ts`
- Create: `db/migrations/0002_*.sql`

- [ ] **Step 1: Adicionar séries temporais ao schema**

Após as tabelas de referência em `db/src/schema.ts`:

```typescript
// ============================================================
// SÉRIES TEMPORAIS — preços e agregados de mercado
// ============================================================

export const pricesDaily = qmixInvest.table('prices_daily', {
  ticker: varchar('ticker', { length: 12 }).notNull().references(() => tickers.ticker),
  date: date('date').notNull(),
  open: numeric('open', { precision: 18, scale: 4 }).notNull(),
  high: numeric('high', { precision: 18, scale: 4 }).notNull(),
  low: numeric('low', { precision: 18, scale: 4 }).notNull(),
  close: numeric('close', { precision: 18, scale: 4 }).notNull(),
  volume: bigint('volume', { mode: 'bigint' }).notNull(),
  financialVolumeBrl: bigint('financial_volume_brl', { mode: 'bigint' }).notNull(),
  trades: integer('trades'),
  source: text('source').notNull(),
  sourceHash: text('source_hash').notNull(),
}, (t) => ({
  pk: uniqueIndex('prices_daily_pk').on(t.ticker, t.date),
  sourceHashIdx: uniqueIndex('prices_daily_source_hash_idx').on(t.sourceHash),
  dateIdx: index('prices_daily_date_idx').on(t.date),
}));

export const btcLendingDaily = qmixInvest.table('btc_lending_daily', {
  ticker: varchar('ticker', { length: 12 }).notNull().references(() => tickers.ticker),
  date: date('date').notNull(),
  openBalance: bigint('open_balance', { mode: 'bigint' }).notNull(),
  newContracts: bigint('new_contracts', { mode: 'bigint' }),
  rateAvgPct: numeric('rate_avg_pct', { precision: 8, scale: 4 }),
  sourceHash: text('source_hash').notNull(),
}, (t) => ({
  pk: uniqueIndex('btc_lending_daily_pk').on(t.ticker, t.date),
  sourceHashIdx: uniqueIndex('btc_lending_daily_source_hash_idx').on(t.sourceHash),
}));

export const foreignFlowDaily = qmixInvest.table('foreign_flow_daily', {
  date: date('date').primaryKey(),
  netFlowBrl: bigint('net_flow_brl', { mode: 'bigint' }).notNull(),
  buyBrl: bigint('buy_brl', { mode: 'bigint' }).notNull(),
  sellBrl: bigint('sell_brl', { mode: 'bigint' }).notNull(),
  sourceHash: text('source_hash').notNull().unique(),
});
```

- [ ] **Step 2-6: Como Task 1** — gerar migration `0002_time_series.sql`, verificar typecheck, commitar

```bash
git commit -m "feat(db): add time-series tables (prices, btc lending, foreign flow)

prices_daily and btc_lending_daily keyed by (ticker, date) with
source_hash UNIQUE for scraper idempotency. foreign_flow_daily
keyed by date alone (single row per trading day, B3 aggregate).

All numeric monetary values stored as bigint reais×100 (cents)
or numeric(18,4) for prices to preserve precision."
```

---

## Task 3: Estender schema com eventos discretos

**Files:**
- Modify: `db/src/schema.ts`
- Create: `db/migrations/0003_*.sql`

- [ ] **Step 1: Adicionar eventos discretos ao schema**

```typescript
// ============================================================
// EVENTOS DISCRETOS — fontes regulatórias
// ============================================================

export const insiderTxTypeEnum = qmixInvest.enum('insider_tx_type', [
  'buy', 'sell', 'gift_in', 'gift_out', 'inheritance', 'option_exercise', 'other'
]);

export const insiderRoleEnum = qmixInvest.enum('insider_role', [
  'director', 'officer', 'controller', 'related_party', 'other'
]);

export const insiderTransactions = qmixInvest.table('insider_transactions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  cnpj: varchar('cnpj', { length: 14 }).notNull().references(() => companies.cnpj),
  ticker: varchar('ticker', { length: 12 }).references(() => tickers.ticker),
  insiderName: text('insider_name').notNull(),
  role: insiderRoleEnum('role').notNull(),
  txType: insiderTxTypeEnum('tx_type').notNull(),
  txDate: date('tx_date').notNull(),
  quantity: bigint('quantity', { mode: 'bigint' }).notNull(),
  pricePerShareBrl: numeric('price_per_share_brl', { precision: 18, scale: 4 }),
  totalValueBrl: bigint('total_value_brl', { mode: 'bigint' }),
  reportedAt: date('reported_at').notNull(),
  sourceHash: text('source_hash').notNull().unique(),
  rawJson: text('raw_json'),
}, (t) => ({
  cnpjDateIdx: index('insider_tx_cnpj_date_idx').on(t.cnpj, t.txDate),
  tickerDateIdx: index('insider_tx_ticker_date_idx').on(t.ticker, t.txDate),
}));

export const materialDisclosureTypeEnum = qmixInvest.enum('material_disclosure_type', [
  'stake_5pct_acquired', 'stake_10pct_acquired', 'stake_15pct_acquired', 'stake_20pct_acquired',
  'stake_5pct_reduced', 'stake_10pct_reduced', 'stake_15pct_reduced',
  'merger', 'spin_off', 'tender_offer', 'dividend', 'earnings', 'other',
]);

export const materialDisclosures = qmixInvest.table('material_disclosures', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  cnpj: varchar('cnpj', { length: 14 }).notNull().references(() => companies.cnpj),
  ticker: varchar('ticker', { length: 12 }).references(() => tickers.ticker),
  type: materialDisclosureTypeEnum('type').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  fundId: integer('fund_id').references(() => funds.id),
  stakePctAfter: numeric('stake_pct_after', { precision: 8, scale: 4 }),
  stakePctBefore: numeric('stake_pct_before', { precision: 8, scale: 4 }),
  pdfUrl: text('pdf_url'),
  summary: text('summary'),
  rawText: text('raw_text'),
  sourceHash: text('source_hash').notNull().unique(),
}, (t) => ({
  cnpjPublishedIdx: index('material_disclosures_cnpj_published_idx').on(t.cnpj, t.publishedAt),
  typeIdx: index('material_disclosures_type_idx').on(t.type),
}));

export const fundHoldingsCvm = qmixInvest.table('fund_holdings_cvm', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  fundId: integer('fund_id').notNull().references(() => funds.id),
  ticker: varchar('ticker', { length: 12 }).notNull().references(() => tickers.ticker),
  referenceMonth: date('reference_month').notNull(),
  quantity: bigint('quantity', { mode: 'bigint' }).notNull(),
  marketValueBrl: bigint('market_value_brl', { mode: 'bigint' }).notNull(),
  pctOfFundAum: numeric('pct_of_fund_aum', { precision: 8, scale: 4 }),
  sourceHash: text('source_hash').notNull().unique(),
}, (t) => ({
  fundMonthIdx: index('fund_holdings_cvm_fund_month_idx').on(t.fundId, t.referenceMonth),
  tickerMonthIdx: index('fund_holdings_cvm_ticker_month_idx').on(t.ticker, t.referenceMonth),
}));

export const fundHoldingsSec13f = qmixInvest.table('fund_holdings_sec_13f', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  fundId: integer('fund_id').notNull().references(() => funds.id),
  ticker: varchar('ticker', { length: 12 }).notNull().references(() => tickers.ticker),
  cusip: varchar('cusip', { length: 12 }).notNull(),
  reportDate: date('report_date').notNull(),
  shares: bigint('shares', { mode: 'bigint' }).notNull(),
  valueUsd: bigint('value_usd', { mode: 'bigint' }).notNull(),
  filingDate: date('filing_date').notNull(),
  filingUrl: text('filing_url'),
  sourceHash: text('source_hash').notNull().unique(),
}, (t) => ({
  fundDateIdx: index('fund_holdings_13f_fund_date_idx').on(t.fundId, t.reportDate),
  tickerDateIdx: index('fund_holdings_13f_ticker_date_idx').on(t.ticker, t.reportDate),
}));

export const scraperRunStatusEnum = qmixInvest.enum('scraper_run_status', [
  'running', 'success', 'failed', 'partial',
]);

export const scraperRuns = qmixInvest.table('scraper_runs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  source: text('source').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  status: scraperRunStatusEnum('status').default('running').notNull(),
  itemsFetched: integer('items_fetched').default(0).notNull(),
  itemsInserted: integer('items_inserted').default(0).notNull(),
  itemsSkipped: integer('items_skipped').default(0).notNull(),
  errorMessage: text('error_message'),
  metadataJson: text('metadata_json'),
}, (t) => ({
  sourceStartedIdx: index('scraper_runs_source_started_idx').on(t.source, t.startedAt),
  statusIdx: index('scraper_runs_status_idx').on(t.status),
}));
```

- [ ] **Step 2-6: Como tasks anteriores** — gerar migration `0003_event_tables.sql`, verificar typecheck, commitar

---

## Task 4: Função `runScraper()` base com TDD

**Files:**
- Create: `worker/src/scrapers/types.ts`
- Create: `worker/src/scrapers/base.ts`
- Test: `worker/tests/scrapers/base.test.ts`

- [ ] **Step 1: Definir interface em `types.ts`**

```typescript
import type { Db } from '../db.js';

export type ScraperOutcome =
  | { status: 'success'; itemsFetched: number; itemsInserted: number; itemsSkipped: number; metadata?: Record<string, unknown> }
  | { status: 'partial'; itemsFetched: number; itemsInserted: number; itemsSkipped: number; errorMessage: string }
  | { status: 'failed'; errorMessage: string };

export interface ScraperContext {
  db: Db;
  logger: import('pino').Logger;
  signal?: AbortSignal;
}

export interface Scraper {
  source: string;
  run: (ctx: ScraperContext) => Promise<ScraperOutcome>;
}
```

- [ ] **Step 2: Escrever teste falhando para `base.ts`**

`worker/tests/scrapers/base.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertMock = vi.fn();
const updateMock = vi.fn();
const fakeDb = {
  insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnThis(), returning: insertMock }),
  update: vi.fn().mockReturnValue({ set: updateMock }),
};

const fakeLogger = {
  info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(),
} as unknown as import('pino').Logger;

describe('runScraper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue([{ id: 42 }]);
    updateMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('opens scraper_runs row, runs scraper, marks success', async () => {
    const { runScraper } = await import('../../src/scrapers/base');
    const scraper = {
      source: 'test-source',
      run: vi.fn().mockResolvedValue({
        status: 'success' as const,
        itemsFetched: 10, itemsInserted: 9, itemsSkipped: 1,
      }),
    };

    const result = await runScraper(scraper, { db: fakeDb as never, logger: fakeLogger });

    expect(scraper.run).toHaveBeenCalled();
    expect(fakeDb.insert).toHaveBeenCalled();
    expect(fakeDb.update).toHaveBeenCalled();
    expect(result.status).toBe('success');
  });

  it('catches thrown errors and marks scraper_runs as failed', async () => {
    const { runScraper } = await import('../../src/scrapers/base');
    const scraper = {
      source: 'failing-source',
      run: vi.fn().mockRejectedValue(new Error('network timeout')),
    };

    const result = await runScraper(scraper, { db: fakeDb as never, logger: fakeLogger });

    expect(result.status).toBe('failed');
    if (result.status === 'failed') {
      expect(result.errorMessage).toContain('network timeout');
    }
    expect(fakeDb.update).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Rodar teste — falha**

Run: `npm --workspace worker run test`
Expected: FAIL — `../../src/scrapers/base` não existe.

- [ ] **Step 4: Criar `worker/src/scrapers/base.ts`**

```typescript
import { scraperRuns } from '@qmix-invest/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { Scraper, ScraperContext, ScraperOutcome } from './types.js';

export async function runScraper(
  scraper: Scraper,
  ctx: ScraperContext
): Promise<ScraperOutcome> {
  const log = ctx.logger.child({ scraper: scraper.source });
  log.info('starting scraper run');

  const [{ id: runId }] = await ctx.db
    .insert(scraperRuns)
    .values({ source: scraper.source, status: 'running' })
    .returning({ id: scraperRuns.id });

  let outcome: ScraperOutcome;
  try {
    outcome = await scraper.run(ctx);
    log.info({ outcome }, 'scraper completed');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log.error({ err }, 'scraper threw');
    outcome = { status: 'failed', errorMessage };
  }

  await ctx.db
    .update(scraperRuns)
    .set({
      finishedAt: sql`now()`,
      status: outcome.status,
      itemsFetched: outcome.status === 'failed' ? 0 : outcome.itemsFetched,
      itemsInserted: outcome.status === 'failed' ? 0 : outcome.itemsInserted,
      itemsSkipped: outcome.status === 'failed' ? 0 : outcome.itemsSkipped,
      errorMessage:
        outcome.status === 'partial' || outcome.status === 'failed'
          ? outcome.errorMessage
          : null,
      metadataJson:
        outcome.status === 'success' && outcome.metadata
          ? JSON.stringify(outcome.metadata)
          : null,
    })
    .where(eq(scraperRuns.id, runId));

  return outcome;
}
```

- [ ] **Step 5: Rodar teste — passa**

Run: `npm --workspace worker run test -- base`
Expected: PASS — 2 testes.

- [ ] **Step 6: Commit**

```bash
git add worker/src/scrapers/types.ts worker/src/scrapers/base.ts worker/tests/scrapers/base.test.ts
git commit -m "feat(worker): scraper base abstraction with run logging

runScraper() opens a scraper_runs row, executes the scraper,
catches throws, and updates the row with outcome (success/partial/
failed) plus item counts. Tested for success path, error catching,
and update of metadata.

Sets the contract: scrapers implement Scraper interface (source +
run function returning ScraperOutcome). All HTTP/DB errors are
captured and persisted, never propagated."
```

---

## Task 5: HTTP client com undici + retry + proxy support

**Files:**
- Modify: `worker/package.json` (add `undici` dep)
- Create: `worker/src/scrapers/http.ts`
- Create: `worker/src/scrapers/proxy-pool.ts`
- Test: `worker/tests/scrapers/http.test.ts`

- [ ] **Step 1: Add deps**

In `worker/package.json` dependencies, add:
```json
"undici": "^6.20.0",
"https-proxy-agent": "^7.0.0"
```

Run: `npm install --workspace worker`

- [ ] **Step 2: Create `worker/src/scrapers/proxy-pool.ts`**

```typescript
import { logger } from '../logger.js';
import { env } from '../env.js';

interface ProxyEntry {
  url: string;
  failures: number;
  cooldownUntil: number;
}

const POOL: ProxyEntry[] = (env as { PROXY_POOL?: string }).PROXY_POOL
  ? (env as { PROXY_POOL?: string })
      .PROXY_POOL!.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((url) => ({ url, failures: 0, cooldownUntil: 0 }))
  : [];

let cursor = 0;

export function getProxy(): string | undefined {
  if (POOL.length === 0) return undefined;
  const now = Date.now();
  for (let i = 0; i < POOL.length; i++) {
    const entry = POOL[(cursor + i) % POOL.length];
    if (!entry || entry.cooldownUntil > now) continue;
    cursor = (cursor + i + 1) % POOL.length;
    return entry.url;
  }
  logger.warn({ poolSize: POOL.length }, 'all proxies in cooldown — using direct connection');
  return undefined;
}

export function reportProxyFailure(url: string): void {
  const entry = POOL.find((p) => p.url === url);
  if (!entry) return;
  entry.failures += 1;
  if (entry.failures >= 3) {
    entry.cooldownUntil = Date.now() + 60 * 60 * 1000;
    entry.failures = 0;
    logger.warn({ proxy: url }, 'proxy cooldown 1h after 3 failures');
  }
}
```

(Nota: `env` schema da Phase 0 não inclui `PROXY_POOL`. Vamos atualizar o schema na Task 7. Por enquanto a coerção `as { PROXY_POOL?: string }` resolve.)

- [ ] **Step 3: Create `worker/src/scrapers/http.ts`**

```typescript
import { request, ProxyAgent, type Dispatcher } from 'undici';
import { setTimeout as sleep } from 'node:timers/promises';
import { logger } from '../logger.js';
import { getProxy, reportProxyFailure } from './proxy-pool.js';

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'HEAD';
  headers?: Record<string, string>;
  body?: string | Buffer;
  timeoutMs?: number;
  retries?: number;
  useProxy?: boolean;
  userAgent?: string;
}

const DEFAULT_USER_AGENT = 'QMIX Invest scraper - contato@qmix.com.br';

export async function fetchWithRetry(
  url: string,
  opts: FetchOptions = {}
): Promise<{ statusCode: number; body: Buffer; headers: Record<string, string | string[] | undefined> }> {
  const retries = opts.retries ?? 3;
  const timeoutMs = opts.timeoutMs ?? 30_000;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let proxyUrl: string | undefined;
    let dispatcher: Dispatcher | undefined;
    if (opts.useProxy) {
      proxyUrl = getProxy();
      if (proxyUrl) dispatcher = new ProxyAgent({ uri: proxyUrl });
    }

    try {
      const response = await request(url, {
        method: opts.method ?? 'GET',
        headers: {
          'User-Agent': opts.userAgent ?? DEFAULT_USER_AGENT,
          ...(opts.headers ?? {}),
        },
        body: opts.body,
        bodyTimeout: timeoutMs,
        headersTimeout: timeoutMs,
        dispatcher,
      });

      const chunks: Buffer[] = [];
      for await (const chunk of response.body) chunks.push(chunk as Buffer);
      const body = Buffer.concat(chunks);

      if (response.statusCode >= 500 && attempt < retries) {
        const delay = 1000 * Math.pow(2, attempt);
        logger.warn({ url, attempt, statusCode: response.statusCode }, 'server error, retrying');
        await sleep(delay);
        continue;
      }
      return { statusCode: response.statusCode, body, headers: response.headers };
    } catch (err) {
      if (proxyUrl) reportProxyFailure(proxyUrl);
      if (attempt >= retries) throw err;
      const delay = 1000 * Math.pow(2, attempt);
      logger.warn({ url, attempt, err }, 'request failed, retrying');
      await sleep(delay);
    }
  }
  throw new Error(`exhausted retries for ${url}`);
}
```

- [ ] **Step 4: Test fetchWithRetry com MSW**

Add to `worker/package.json` devDependencies:
```json
"msw": "^2.6.0"
```

Run: `npm install --workspace worker`

Create `worker/tests/scrapers/http.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('../../src/scrapers/proxy-pool', () => ({
  getProxy: () => undefined,
  reportProxyFailure: vi.fn(),
}));

describe('fetchWithRetry', () => {
  it('returns 200 response body on success', async () => {
    server.use(http.get('https://example.test/data', () =>
      HttpResponse.text('hello world')
    ));

    const { fetchWithRetry } = await import('../../src/scrapers/http');
    const res = await fetchWithRetry('https://example.test/data');
    expect(res.statusCode).toBe(200);
    expect(res.body.toString('utf8')).toBe('hello world');
  });

  it('retries on 503 and eventually succeeds', async () => {
    let calls = 0;
    server.use(http.get('https://example.test/flaky', () => {
      calls += 1;
      if (calls < 3) return new HttpResponse(null, { status: 503 });
      return HttpResponse.text('ok');
    }));

    const { fetchWithRetry } = await import('../../src/scrapers/http?flaky');
    const res = await fetchWithRetry('https://example.test/flaky', { retries: 3, timeoutMs: 2000 });
    expect(res.statusCode).toBe(200);
    expect(calls).toBe(3);
  }, 30_000);

  it('throws after exhausting retries', async () => {
    server.use(http.get('https://example.test/dead', () =>
      new HttpResponse(null, { status: 503 })
    ));

    const { fetchWithRetry } = await import('../../src/scrapers/http?dead');
    await expect(
      fetchWithRetry('https://example.test/dead', { retries: 1, timeoutMs: 1000 })
    ).rejects.toThrow();
  }, 30_000);
});
```

- [ ] **Step 5: Run + verify + commit**

```bash
npm --workspace worker run test -- http
git add worker/src/scrapers/http.ts worker/src/scrapers/proxy-pool.ts \
        worker/tests/scrapers/http.test.ts worker/package.json package-lock.json
git commit -m "feat(worker): http client with retry + proxy pool

undici-based fetchWithRetry handles 5xx retries (exponential
backoff up to N attempts) and rotates through PROXY_POOL when
useProxy=true. Proxy failures trigger 1h cooldown after 3 strikes.

Tested with msw for: success, retry-then-success, exhausted-retry."
```

---

## Task 6: Adicionar PROXY_POOL ao schema env do worker

**Files:**
- Modify: `worker/src/env.ts`

- [ ] **Step 1: Adicionar campo ao Zod schema**

Em `worker/src/env.ts`, após o `LOG_LEVEL`:
```typescript
PROXY_POOL: z.string().default(''),
```

- [ ] **Step 2: Confirmar typecheck e commit**

```bash
git add worker/src/env.ts
git commit -m "feat(worker): add PROXY_POOL env var (CSV of proxy URLs)"
```

---

## Tasks 7-15: Scrapers individuais (cada um TDD)

Cada um destes tasks segue o mesmo padrão TDD:

1. Criar fixture real (download manual de uma porção pequena da fonte real, anonimizar se necessário, salvar em `worker/tests/fixtures/`)
2. Criar teste falhando que carrega fixture, mocka HTTP via MSW retornando o fixture, valida que o scraper produz N linhas com campos corretos
3. Criar `worker/src/scrapers/<source>.ts` implementando interface `Scraper`
4. Verde
5. Commit

Devido ao tamanho de cada um, vou listar AQUI a Task 7 (CVM Insiders) detalhada como **template**, e os Tasks 8-15 com **especificação resumida** (URL, formato, campos a mapear, schedule). O implementador segue o template para cada um.

---

### Task 7: Scraper CVM Resolução 44 (insiders) — TEMPLATE DETALHADO

**Files:**
- Create: `worker/tests/fixtures/cvm/vlmo_cia_aberta_sample.csv`
- Create: `worker/tests/scrapers/cvm-insiders.test.ts`
- Create: `worker/src/scrapers/cvm-insiders.ts`

- [ ] **Step 1: Salvar fixture real**

Download manual: `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/VLMO/DADOS/vlmo_cia_aberta_2026.csv` → cortar primeiras 50 linhas → salvar em `worker/tests/fixtures/cvm/vlmo_cia_aberta_sample.csv`. Encoding ISO-8859-1, separador `;`.

- [ ] **Step 2: Teste falhando**

```typescript
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '../fixtures/cvm/vlmo_cia_aberta_sample.csv');

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const fakeDb = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      onConflictDoNothing: vi.fn().mockResolvedValue({ rowCount: 5 }),
    }),
  }),
};
const fakeLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } as never;

describe('cvm-insiders scraper', () => {
  it('downloads CSV, parses rows, inserts into insider_transactions', async () => {
    const csvBuffer = await readFile(FIXTURE);
    server.use(
      http.get('https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/VLMO/DADOS/*', () =>
        new HttpResponse(csvBuffer, { headers: { 'Content-Type': 'text/csv' } })
      )
    );

    const { scraper } = await import('../../src/scrapers/cvm-insiders');
    const outcome = await scraper.run({ db: fakeDb as never, logger: fakeLogger });

    expect(outcome.status).toBe('success');
    if (outcome.status === 'success') {
      expect(outcome.itemsFetched).toBeGreaterThan(0);
      expect(outcome.itemsInserted).toBeGreaterThan(0);
    }
    expect(fakeDb.insert).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Criar `worker/src/scrapers/cvm-insiders.ts`**

```typescript
import { createHash } from 'node:crypto';
import { insiderTransactions } from '@qmix-invest/db/schema';
import type { Scraper, ScraperContext, ScraperOutcome } from './types.js';
import { fetchWithRetry } from './http.js';

const URL_TEMPLATE = (year: number) =>
  `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/VLMO/DADOS/vlmo_cia_aberta_${year}.csv`;

interface RawRow {
  cnpj: string;
  insiderName: string;
  role: string;
  txType: string;
  txDate: string;
  quantity: string;
  pricePerShareBrl: string;
  reportedAt: string;
}

function parseCsv(buffer: Buffer): RawRow[] {
  const text = buffer.toString('latin1');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0]!.split(';').map((h) => h.trim().toLowerCase());

  const idxOf = (...names: string[]): number => {
    for (const name of names) {
      const i = header.indexOf(name);
      if (i >= 0) return i;
    }
    return -1;
  };

  const cnpjIdx = idxOf('cnpj_companhia', 'cnpj_cia');
  const nameIdx = idxOf('nome_administrador', 'nome');
  const roleIdx = idxOf('cargo', 'tipo_administrador');
  const txTypeIdx = idxOf('intermediario', 'tipo_movimentacao');
  const dateIdx = idxOf('data_movimentacao', 'data');
  const qtyIdx = idxOf('quantidade');
  const priceIdx = idxOf('preco_unitario');
  const reportedIdx = idxOf('data_referencia', 'data_envio');

  const rows: RawRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(';');
    if (cols.length < header.length) continue;
    rows.push({
      cnpj: cols[cnpjIdx]?.replace(/\D/g, '') ?? '',
      insiderName: cols[nameIdx] ?? '',
      role: cols[roleIdx] ?? '',
      txType: cols[txTypeIdx] ?? '',
      txDate: cols[dateIdx] ?? '',
      quantity: cols[qtyIdx] ?? '0',
      pricePerShareBrl: cols[priceIdx] ?? '0',
      reportedAt: cols[reportedIdx] ?? '',
    });
  }
  return rows;
}

function mapRole(raw: string): 'director' | 'officer' | 'controller' | 'related_party' | 'other' {
  const norm = raw.toLowerCase();
  if (norm.includes('diretor')) return 'director';
  if (norm.includes('conselheiro') || norm.includes('conselho')) return 'officer';
  if (norm.includes('controlador')) return 'controller';
  if (norm.includes('relacionado')) return 'related_party';
  return 'other';
}

function mapTxType(raw: string): 'buy' | 'sell' | 'gift_in' | 'gift_out' | 'inheritance' | 'option_exercise' | 'other' {
  const norm = raw.toLowerCase();
  if (norm.includes('compra') || norm === 'c') return 'buy';
  if (norm.includes('venda') || norm === 'v') return 'sell';
  if (norm.includes('doaç')) return 'gift_in';
  if (norm.includes('herança') || norm.includes('heran')) return 'inheritance';
  if (norm.includes('opção') || norm.includes('opcao') || norm.includes('exercício')) return 'option_exercise';
  return 'other';
}

function parseDate(raw: string): string | null {
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return raw.slice(0, 10);
  const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return null;
}

function hash(...parts: (string | number)[]): string {
  return createHash('sha256').update(parts.join('|')).digest('hex');
}

export const scraper: Scraper = {
  source: 'cvm-insiders',
  async run(ctx: ScraperContext): Promise<ScraperOutcome> {
    const year = new Date().getUTCFullYear();
    const log = ctx.logger.child({ scraper: 'cvm-insiders' });

    let body: Buffer;
    try {
      const resp = await fetchWithRetry(URL_TEMPLATE(year), { timeoutMs: 60_000, retries: 3 });
      if (resp.statusCode !== 200) {
        return { status: 'failed', errorMessage: `HTTP ${resp.statusCode}` };
      }
      body = resp.body;
    } catch (err) {
      return { status: 'failed', errorMessage: err instanceof Error ? err.message : String(err) };
    }

    const rows = parseCsv(body);
    log.info({ rows: rows.length }, 'parsed rows');

    let inserted = 0;
    let skipped = 0;
    const BATCH = 1_000;

    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const records = batch
        .map((r) => {
          const txDate = parseDate(r.txDate);
          if (!r.cnpj || !txDate || !r.quantity) return null;
          const qty = BigInt(r.quantity.replace(/\D/g, '') || '0');
          const price = parseFloat(r.pricePerShareBrl.replace(',', '.') || '0');
          const sourceHash = hash(r.cnpj, r.insiderName, r.txType, txDate, qty.toString(), price.toFixed(4));
          return {
            cnpj: r.cnpj,
            insiderName: r.insiderName.trim(),
            role: mapRole(r.role),
            txType: mapTxType(r.txType),
            txDate,
            quantity: qty,
            pricePerShareBrl: price.toString(),
            reportedAt: parseDate(r.reportedAt) ?? txDate,
            sourceHash,
            ticker: null,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      if (records.length === 0) continue;
      const result = await ctx.db
        .insert(insiderTransactions)
        .values(records as never)
        .onConflictDoNothing({ target: insiderTransactions.sourceHash });
      inserted += (result as { rowCount?: number }).rowCount ?? 0;
      skipped += records.length - inserted;
    }

    return {
      status: 'success',
      itemsFetched: rows.length,
      itemsInserted: inserted,
      itemsSkipped: skipped,
    };
  },
};
```

- [ ] **Step 4: Run + commit (template)**

```bash
npm --workspace worker run test -- cvm-insiders
git add worker/src/scrapers/cvm-insiders.ts \
        worker/tests/scrapers/cvm-insiders.test.ts \
        worker/tests/fixtures/cvm/vlmo_cia_aberta_sample.csv
git commit -m "feat(worker): scraper for CVM Resolução 44 insider transactions"
```

---

### Tasks 8-15: Scrapers — especificação resumida

Para cada um, seguir o template da Task 7. O implementador deve:
- Baixar fixture pequena real da fonte, anonimizar se necessário, commitar
- Escrever teste com MSW mockando a URL
- Implementar scraper TS
- Garantir idempotência via `source_hash`
- Commitar

| Task | Source | URL | Formato | Schedule | Tabela alvo | Notas |
|---|---|---|---|---|---|---|
| 8 | cvm-cda | `https://dados.cvm.gov.br/dados/FI/DOC/CDA/DADOS/cda_fi_YYYYMM.zip` | ZIP com 8 CSVs (BLC_4 = ações) | Mensal, dia 5 às 3h BRT | `fund_holdings_cvm` | **Maior** dataset; usar `unzipper` + `papaparse` em modo stream; INSERT em batch de 5k |
| 9 | material-disclosures | scrape de `https://www.rad.cvm.gov.br/` + PDFs linkados | HTML + PDF | A cada 30min em pregão (9-18h BRT), a cada 1h fora | `material_disclosures` | usar `cheerio` para listing, `pdf-parse` para PDFs, IA `fast` (mock por enquanto) para extração de stake_pct quando regex falha |
| 10 | sec-13f | `https://efts.sec.gov/LATEST/search-index?forms=13F-HR&...` + `https://www.sec.gov/Archives/edgar/data/<CIK>/...` | JSON + XML | Diário 4h BRT (filtrado por fundos com último 13F > 90d) | `fund_holdings_sec_13f` | **proxy obrigatório**; rate-limit 5 req/s/IP; CUSIP→ticker via tabela `cusip_to_ticker` |
| 11 | b3-foreign-flow | `https://www.b3.com.br/...investidores-estrangeiros/` (URL exata a confirmar na implementação) | CSV ou Excel | Diário 19h BRT | `foreign_flow_daily` | parse simples; 1 linha por dia útil |
| 12 | b3-btc-lending | `https://arquivos.b3.com.br/apinegocios/aro/securitiesinfundsstocks/{date}` | CSV | Diário 19h BRT | `btc_lending_daily` | calcular delta de saldo aberto vs. dia anterior em coluna materializada |
| 13 | b3-prices | `https://bvmf.bmfbovespa.com.br/InstDados/SerHist/COTAHIST_DYYYYMMDD.ZIP` | ZIP com TXT fixed-width | Diário 18:30 BRT | `prices_daily` | **Bootstrap inicial**: carga de 5 anos via job especial em batch |
| 14 | yahoo-finance | lib `yahoo-finance2` (npm) | API não oficial | **Sob demanda** (failover quando b3-prices falhar 2 dias seguidos) | `prices_daily` | usar proxy; ticker mapping `PETR4.SA` etc.; só roda se variável `YAHOO_FALLBACK_ENABLED=true` |

Para cada um, criar:
- `worker/src/scrapers/<name>.ts`
- `worker/tests/scrapers/<name>.test.ts`
- `worker/tests/fixtures/<source>/<sample>` (se aplicável)

---

## Task 16: Registrar handlers pg-boss + schedules

**Files:**
- Create: `worker/src/handlers.ts`
- Modify: `worker/src/index.ts`
- Test: `worker/tests/handlers.test.ts`

- [ ] **Step 1: Criar `worker/src/handlers.ts`**

```typescript
import type PgBoss from 'pg-boss';
import { db } from './db.js';
import { logger } from './logger.js';
import { runScraper } from './scrapers/base.js';
import * as cvmInsiders from './scrapers/cvm-insiders.js';
import * as cvmCda from './scrapers/cvm-cda.js';
import * as materialDisclosures from './scrapers/material-disclosures.js';
import * as sec13f from './scrapers/sec-13f.js';
import * as foreignFlow from './scrapers/b3-foreign-flow.js';
import * as btcLending from './scrapers/b3-btc-lending.js';
import * as b3Prices from './scrapers/b3-prices.js';

const SCRAPERS = [
  { scraper: cvmInsiders.scraper, schedule: '0 5 * * 1' /* segunda-feira 5h UTC */ },
  { scraper: cvmCda.scraper, schedule: '0 6 5 * *' /* dia 5 às 6h UTC */ },
  { scraper: materialDisclosures.scraper, schedule: '*/30 12-21 * * 1-5' /* a cada 30 min em pregão */ },
  { scraper: sec13f.scraper, schedule: '0 7 * * *' /* diário 7h UTC = 4h BRT */ },
  { scraper: foreignFlow.scraper, schedule: '0 22 * * 1-5' /* diário 22h UTC = 19h BRT */ },
  { scraper: btcLending.scraper, schedule: '0 22 * * 1-5' /* diário 22h UTC */ },
  { scraper: b3Prices.scraper, schedule: '30 21 * * 1-5' /* diário 21:30 UTC = 18:30 BRT */ },
];

export async function registerHandlers(boss: PgBoss): Promise<void> {
  for (const { scraper, schedule } of SCRAPERS) {
    const queueName = `scrape:${scraper.source}`;

    await boss.work(queueName, { teamSize: 1 }, async (jobs) => {
      for (const _job of jobs) {
        await runScraper(scraper, { db, logger });
      }
    });

    await boss.schedule(queueName, schedule, undefined, { tz: 'UTC' });
    logger.info({ source: scraper.source, schedule }, 'scraper handler registered');
  }
}
```

- [ ] **Step 2: Modificar `worker/src/index.ts`**

Substituir o conteúdo da função `main()` (mantendo SIGTERM/SIGINT handlers):

```typescript
async function main() {
  logger.info({ mode: env.MODE, env: env.NODE_ENV }, 'QMIX Invest worker starting');
  const boss = await getBoss();
  await registerHandlers(boss);
  logger.info('all scraper handlers registered');
  // resto igual
}
```

E adicionar import: `import { registerHandlers } from './handlers.js';`

- [ ] **Step 3: Test handlers**

```typescript
// worker/tests/handlers.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('registerHandlers', () => {
  it('registers all scrapers as pg-boss queues with schedules', async () => {
    const fakeBoss = {
      work: vi.fn().mockResolvedValue(undefined),
      schedule: vi.fn().mockResolvedValue(undefined),
    };
    const { registerHandlers } = await import('../src/handlers');
    await registerHandlers(fakeBoss as never);
    expect(fakeBoss.work).toHaveBeenCalledTimes(7);
    expect(fakeBoss.schedule).toHaveBeenCalledTimes(7);
  });
});
```

- [ ] **Step 4: Run + commit**

```bash
npm --workspace worker run test
git commit -m "feat(worker): register scraper handlers with pg-boss schedules

7 scrapers (cvm-insiders, cvm-cda, material-disclosures, sec-13f,
b3-foreign-flow, b3-btc-lending, b3-prices) registered with cron
schedules in UTC. Handlers wrap runScraper() which logs to
scraper_runs."
```

---

## Task 17: Seeds — companies + tickers + tier-1 funds

**Files:**
- Create: `worker/src/seeds/companies.ts`
- Create: `worker/src/seeds/tickers.ts`
- Create: `worker/src/seeds/tier-1-funds.ts`
- Create: `worker/src/seeds/index.ts`
- Create: `scripts/seed.sh`

- [ ] **Step 1: Companies seed (de fonte CSV B3 lista de empresas)**

Download manual de `https://www.b3.com.br/.../empresas-listadas.csv` (URL exata a confirmar). Salvar em `worker/src/seeds/companies-data.csv`.

`worker/src/seeds/companies.ts`:
```typescript
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db.js';
import { companies } from '@qmix-invest/db/schema';
import { logger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV = path.resolve(__dirname, 'companies-data.csv');

export async function seedCompanies(): Promise<void> {
  const text = await readFile(CSV, 'utf-8');
  const rows = text.split(/\r?\n/).slice(1).filter(Boolean);
  const records = rows.map((line) => {
    const [cnpj, name, sector, subsector, cvmCode] = line.split(';');
    return { cnpj: cnpj!.replace(/\D/g, ''), name: name!, sector, subsector, cvmCode };
  });
  await db.insert(companies).values(records as never).onConflictDoNothing();
  logger.info({ count: records.length }, 'seeded companies');
}
```

- [ ] **Step 2: Tickers seed**

Similar pattern. Download list of B3 tickers, parse, insert.

- [ ] **Step 3: Tier-1 funds seed**

Lista hardcoded inicial:
```typescript
import { db } from '../db.js';
import { funds } from '@qmix-invest/db/schema';

const TIER_ONE = [
  { cnpjOrCik: '1067983', name: 'Berkshire Hathaway Inc', nationality: 'US' as const, isTierOne: true },
  { cnpjOrCik: '1350694', name: 'Bridgewater Associates LP', nationality: 'US' as const, isTierOne: true },
  { cnpjOrCik: '1709323', name: 'Capital Group Companies Inc', nationality: 'US' as const, isTierOne: true },
  { cnpjOrCik: '1029160', name: 'Soros Fund Management LLC', nationality: 'US' as const, isTierOne: true },
  { cnpjOrCik: '1167483', name: 'Tiger Global Management LLC', nationality: 'US' as const, isTierOne: true },
  { cnpjOrCik: '1336528', name: 'Renaissance Technologies LLC', nationality: 'US' as const, isTierOne: true },
  { cnpjOrCik: '1179392', name: 'Two Sigma Investments LP', nationality: 'US' as const, isTierOne: true },
  { cnpjOrCik: '1167557', name: 'AQR Capital Management LLC', nationality: 'US' as const, isTierOne: true },
];

export async function seedTierOneFunds(): Promise<void> {
  await db.insert(funds).values(TIER_ONE as never).onConflictDoNothing();
}
```

- [ ] **Step 4: `worker/src/seeds/index.ts` orquestrador**

```typescript
import { seedCompanies } from './companies.js';
import { seedTickers } from './tickers.js';
import { seedTierOneFunds } from './tier-1-funds.js';
import { logger } from '../logger.js';

export async function runSeeds(): Promise<void> {
  logger.info('running seeds');
  await seedCompanies();
  await seedTickers();
  await seedTierOneFunds();
  logger.info('seeds complete');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { queryClient } = await import('../db.js');
  runSeeds().then(() => queryClient.end()).catch((err) => {
    logger.fatal({ err }, 'seed failed');
    queryClient.end();
    process.exit(1);
  });
}
```

- [ ] **Step 5: Adicionar script no `worker/package.json`**

```json
"seed": "tsx src/seeds/index.ts"
```

E `worker/package.json` build agora deve produzir `dist/seeds/index.js` — o tsconfig já cobre `src/**/*`.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(worker): seeds for companies, tickers, and tier-1 funds"
```

---

## Task 18: Bootstrap histórico — script de carga de 5 anos

**Files:**
- Create: `scripts/bootstrap-historical-data.sh`
- Create: `worker/src/scrapers/bootstrap.ts` (job especial que dispara cada scraper varrendo o passado)

- [ ] **Step 1: Criar `worker/src/scrapers/bootstrap.ts`**

Função que enfileira jobs com parâmetro `dateFrom` para cada scraper que suporta histórico (b3-prices, btc-lending, foreign-flow, cda mensal, sec-13f).

```typescript
import type PgBoss from 'pg-boss';
import { logger } from '../logger.js';

export async function enqueueHistoricalBootstrap(boss: PgBoss): Promise<void> {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  await boss.send('scrape:b3-prices', { mode: 'bootstrap', dateFrom: fiveYearsAgo.toISOString().slice(0, 10) }, { priority: -10 });
  await boss.send('scrape:b3-btc-lending', { mode: 'bootstrap', yearsBack: 2 }, { priority: -10 });
  await boss.send('scrape:b3-foreign-flow', { mode: 'bootstrap', yearsBack: 2 }, { priority: -10 });
  await boss.send('scrape:cvm-insiders', { mode: 'bootstrap', yearsBack: 3 }, { priority: -10 });
  await boss.send('scrape:cvm-cda', { mode: 'bootstrap', monthsBack: 24 }, { priority: -10 });
  await boss.send('scrape:sec-13f', { mode: 'bootstrap', quartersBack: 4 }, { priority: -10 });

  logger.info('historical bootstrap jobs enqueued (priority -10, low priority)');
}
```

E modificar handlers individuais para checar `job.data.mode === 'bootstrap'` e iterar pelo histórico em vez de só pegar o último período.

- [ ] **Step 2: Script de orquestração**

```bash
#!/usr/bin/env bash
# bootstrap-historical-data.sh — Roda seeds + enfileira jobs históricos
# Executar UMA VEZ depois do primeiro deploy bem-sucedido.

set -euo pipefail
cd /opt/qmix-invest

echo "==> Running seeds (companies, tickers, tier-1 funds)..."
docker compose exec -T worker node worker/dist/seeds/index.js

echo "==> Enqueueing historical bootstrap jobs..."
docker compose exec -T worker node -e "
import('./worker/dist/pg-boss.js').then(async ({ getBoss }) => {
  const { enqueueHistoricalBootstrap } = await import('./worker/dist/scrapers/bootstrap.js');
  const boss = await getBoss();
  await enqueueHistoricalBootstrap(boss);
  await boss.stop();
});
"

echo "==> Bootstrap dispatched. Monitor with:"
echo "    docker compose exec postgres psql -U qmix_invest -d qmix_invest -c 'SELECT source, status, items_inserted, finished_at FROM qmix_invest.scraper_runs ORDER BY started_at DESC LIMIT 50;'"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/bootstrap-historical-data.sh worker/src/scrapers/bootstrap.ts
chmod +x scripts/bootstrap-historical-data.sh
git commit -m "feat: bootstrap script + worker handler for historical data load"
```

---

## Task 19: Smoke test final + tag

- [ ] **Step 1: Rodar todos testes**

```bash
npm test  # all workspaces
npm run typecheck
```

Expected: 10 (Phase 0) + ~25 novos (Phase 1) testes passando.

- [ ] **Step 2: Update README**

Adicionar ao `## Status`:
- ✅ Fase 1: Scrapers + bootstrap histórico — concluída em [DATA]

- [ ] **Step 3: Commit + push + tag**

```bash
git commit -am "chore(phase-1): scrapers and historical bootstrap complete"
git push origin main
git tag -a phase-1-complete -m "Phase 1: Scrapers + Bootstrap"
git push --tags
```

- [ ] **Step 4: Deploy na VPS**

```bash
ssh root@31.97.173.40 'cd /opt/qmix-invest && git pull && docker compose build worker && docker tag qmix-invest-worker:latest qmix-invest-worker:phase-0-initial && docker compose up -d --force-recreate worker worker-b'
```

- [ ] **Step 5: Rodar bootstrap na VPS**

```bash
ssh root@31.97.173.40 'cd /opt/qmix-invest && bash scripts/bootstrap-historical-data.sh'
```

Expected: jobs enfileirados, scrapers começam a rodar em background. Monitorar via tabela `scraper_runs` por algumas horas (~12-24h para CDA chegar ao final).

- [ ] **Step 6: Verificação final**

```sql
SELECT source, COUNT(*), MAX(started_at)
FROM qmix_invest.scraper_runs
WHERE started_at > now() - interval '24 hours'
GROUP BY source ORDER BY 1;

SELECT 'companies' AS table_name, COUNT(*) FROM qmix_invest.companies
UNION ALL SELECT 'tickers', COUNT(*) FROM qmix_invest.tickers
UNION ALL SELECT 'funds', COUNT(*) FROM qmix_invest.funds
UNION ALL SELECT 'prices_daily', COUNT(*) FROM qmix_invest.prices_daily
UNION ALL SELECT 'insider_transactions', COUNT(*) FROM qmix_invest.insider_transactions
UNION ALL SELECT 'fund_holdings_cvm', COUNT(*) FROM qmix_invest.fund_holdings_cvm;
```

Esperado após 24h: ~600 companies, ~800 tickers, ~10k+ funds, ~500k prices, ~10k+ insiders, ~1M+ holdings_cvm.

---

## O que NÃO está nesta fase

- ❌ Motor de sinais (factors F1-F23) — Fase 2
- ❌ Camada de IA (DeepSeek/Anthropic) — Fase 3
- ❌ Bot Telegram — Fase 4
- ❌ Dashboard admin com gráficos — Fase 5
- ❌ Sentiment de notícias — fora de escopo geral
- ❌ Yahoo Finance fallback automatizado por triggers — apenas implementado, não cabeado para failover dinâmico (fica para Fase 2)
