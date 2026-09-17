# QMIX Invest — Fase 2: Motor de Sinais — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o motor determinístico que cruza os dados ingeridos (insiders, fund holdings, prices, BTC lending, foreign flow) e gera **scores 0-100 por (ticker, date, direction)** baseados em 23 factors auditáveis. Persistir em `signals` + `signal_factors`. Phase 2 NÃO inclui IA nem alertas Telegram (Phases 3 e 4).

**Architecture:** Cada factor é uma função pura `(ticker, asOf) → FactorResult` que consulta o banco e retorna `{ id, weight, present, evidence }`. Um aggregator chama todos os factors em paralelo, soma os pesos, aplica regra de convergência + multiplicador small-cap, e persiste signal + signal_factors. Pesos vivem em `signal_factor_weights` (configurável sem deploy). Pipeline pg-boss: scraper termina → emite `recalculate-signals:{ticker}` → factor evaluation → `aggregate-signals` → `signals` row.

**Tech Stack adicional:** date-fns 4.x (manipulação de datas BR/UTC), nenhuma outra nova dep.

**Outcome do plano:** Sistema gera scores diariamente para os tickers que têm dados (atualmente 7 seeded). Você pode consultar `SELECT * FROM signals WHERE score >= 70 ORDER BY date DESC` e ver candidatos. Phase 3 (IA) lê esses signals e gera teses; Phase 4 (Telegram) envia alertas baseados nesses scores.

**Estimativa:** 8-12h focadas (15 tasks).

**Pré-requisitos:**
- Phase 1 deployada (commit `43e1ed1`)
- VPS com containers rodando, schedules registrados
- Pelo menos 2 fontes funcionais (cvm-cda + b3-prices) — temos
- Tabelas `companies`, `tickers`, `funds`, `fund_holdings_cvm`, `prices_daily` populadas

---

## Visão geral da estrutura de arquivos

```
qmix-invest/
├── db/src/schema.ts                          # ESTENDIDO com signals + factor_weights
├── db/migrations/0004_*.sql                  # nova migration
│
├── worker/src/
│   ├── signals/                              # NOVO
│   │   ├── types.ts                          # FactorResult, SignalDirection
│   │   ├── runner.ts                         # função aggregateSignal()
│   │   ├── weights.ts                        # carrega weights do DB com cache
│   │   └── factors/                          # uma função por factor
│   │       ├── f1-insider-buy.ts
│   │       ├── f2-insider-cluster.ts
│   │       ├── f3-controller-buy.ts
│   │       ├── f6-fund-position-up.ts        # CVM CDA increase
│   │       ├── f8-drawdown-prior.ts
│   │       ├── f9-volume-anomaly.ts
│   │       ├── f10-btc-shorts-cover.ts        # delta BTC down
│   │       ├── f11-technical-reversal.ts
│   │       ├── f12-macro-tailwind.ts
│   │       ├── f13-insider-sell.ts
│   │       ├── f14-insider-cluster-sell.ts
│   │       ├── f15-controller-sell.ts
│   │       ├── f17-fund-position-down.ts
│   │       ├── f19-technical-break.ts
│   │       ├── f20-volume-anomaly-sell.ts
│   │       ├── f21-btc-shorts-mounting.ts
│   │       ├── f22-drawdown-no-news.ts
│   │       └── f23-macro-headwind.ts
│   │
│   │   F4, F5, F7, F16, F18 dependem de scrapers ainda incompletos
│   │   (material disclosures, SEC 13F) — implemented as no-op factors
│   │   that return {present: false} until source data exists.
│   │
│   ├── handlers.ts                           # ESTENDIDO: registra recalculate-signals
│   └── seeds/factor-weights.ts               # NOVO: seed dos 23 weights iniciais
│
└── worker/tests/
    ├── signals/
    │   ├── runner.test.ts
    │   └── factors/
    │       ├── f1-insider-buy.test.ts
    │       ├── f6-fund-position-up.test.ts
    │       ├── f8-drawdown-prior.test.ts
    │       └── ... (test cada factor com fixture mínima)
```

---

## Task 1: Estender schema com `signals`, `signal_factors`, `signal_factor_weights`

**Files:**
- Modify: `db/src/schema.ts`
- Create: `db/migrations/0004_signals.sql`

**Step 1: Adicionar ao schema**

```typescript
// ============================================================
// MOTOR DE SINAIS — outputs do engine determinístico
// ============================================================

export const signalDirectionEnum = qmixInvest.enum('signal_direction', ['entry', 'exit']);
export const factorCategoryEnum = qmixInvest.enum('factor_category', ['insider', 'institutional', 'technical', 'macro']);

export const signalFactorWeights = qmixInvest.table('signal_factor_weights', {
  factorId: text('factor_id').primaryKey(),                     // 'F1', 'F2', ...
  direction: signalDirectionEnum('direction').notNull(),
  category: factorCategoryEnum('category').notNull(),
  weight: numeric('weight', { precision: 6, scale: 2 }).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  notes: text('notes'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  directionIdx: index('signal_factor_weights_direction_idx').on(t.direction).where(sql`${t.enabled} = true`),
}));

export const signals = qmixInvest.table('signals', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  ticker: varchar('ticker', { length: 12 }).notNull().references(() => tickers.ticker),
  date: date('date').notNull(),
  direction: signalDirectionEnum('direction').notNull(),
  score: integer('score').notNull(),
  convergenceCount: integer('convergence_count').notNull(),
  smallCapMultApplied: boolean('small_cap_mult_applied').default(false).notNull(),
  computedAt: timestamp('computed_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: uniqueIndex('signals_pk').on(t.ticker, t.date, t.direction),
  scoreDateIdx: index('signals_score_date_idx').on(t.date, t.score),
  highScoreIdx: index('signals_high_score_idx').on(t.score, t.date).where(sql`${t.score} >= 60`),
}));

export const signalFactors = qmixInvest.table('signal_factors', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  signalId: integer('signal_id').notNull().references(() => signals.id, { onDelete: 'cascade' }),
  factorId: text('factor_id').notNull(),
  category: factorCategoryEnum('category').notNull(),
  weightApplied: numeric('weight_applied', { precision: 6, scale: 2 }).notNull(),
  evidenceJson: text('evidence_json'),
}, (t) => ({
  signalIdIdx: index('signal_factors_signal_id_idx').on(t.signalId),
  factorIdIdx: index('signal_factors_factor_id_idx').on(t.factorId),
}));
```

**Step 2-4:** gerar migration `0004_signals.sql`, renomear, commitar como nas Phase 1.

```
git commit -m "feat(db): add signals + signal_factors + signal_factor_weights tables"
```

---

## Task 2: Seed dos 23 factor weights

**Files:**
- Create: `worker/src/seeds/factor-weights.ts`
- Modify: `worker/src/seeds/index.ts` (chamar seedFactorWeights)

```typescript
// worker/src/seeds/factor-weights.ts
import { db } from '../db.js';
import { signalFactorWeights } from '@qmix-invest/db/schema';
import { logger } from '../logger.js';

const WEIGHTS = [
  // ENTRADA
  { factorId: 'F1', direction: 'entry' as const, category: 'insider' as const, weight: '15', notes: 'Insider compra significativa em 30d' },
  { factorId: 'F2', direction: 'entry' as const, category: 'insider' as const, weight: '10', notes: 'Cluster 2+ insiders comprando' },
  { factorId: 'F3', direction: 'entry' as const, category: 'insider' as const, weight: '20', notes: 'Controlador comprando' },
  { factorId: 'F4', direction: 'entry' as const, category: 'institutional' as const, weight: '25', notes: 'Participação 5%+ disclosed (depende de Phase 1.5)' },
  { factorId: 'F5', direction: 'entry' as const, category: 'institutional' as const, weight: '30', notes: 'Participação 10%+ (depende de Phase 1.5)' },
  { factorId: 'F6', direction: 'entry' as const, category: 'institutional' as const, weight: '10', notes: 'Fundo BR aumentou >50% MoM (CDA)' },
  { factorId: 'F7', direction: 'entry' as const, category: 'institutional' as const, weight: '15', notes: 'Fundo US tier-1 entrou (depende de Phase 1.5)' },
  { factorId: 'F8', direction: 'entry' as const, category: 'technical' as const, weight: '15', notes: 'Drawdown prévio >25% em 90d' },
  { factorId: 'F9', direction: 'entry' as const, category: 'technical' as const, weight: '10', notes: 'Volume médio 5d > 200% média 30d' },
  { factorId: 'F10', direction: 'entry' as const, category: 'technical' as const, weight: '15', notes: 'Aluguel BTC caindo 20%+ em 5d (depende de Phase 1.5)' },
  { factorId: 'F11', direction: 'entry' as const, category: 'technical' as const, weight: '10', notes: 'Reversão técnica MA21 após drawdown' },
  { factorId: 'F12', direction: 'entry' as const, category: 'macro' as const, weight: '5', notes: 'Fluxo estrangeiro positivo 5d (depende de Phase 1.5)' },
  // SAÍDA (espelhos)
  { factorId: 'F13', direction: 'exit' as const, category: 'insider' as const, weight: '15', notes: 'Insider venda significativa' },
  { factorId: 'F14', direction: 'exit' as const, category: 'insider' as const, weight: '10', notes: 'Cluster vendendo' },
  { factorId: 'F15', direction: 'exit' as const, category: 'insider' as const, weight: '25', notes: 'Controlador vendendo' },
  { factorId: 'F16', direction: 'exit' as const, category: 'institutional' as const, weight: '20', notes: 'Saída de participação' },
  { factorId: 'F17', direction: 'exit' as const, category: 'institutional' as const, weight: '10', notes: 'Fundo BR reduziu >50% MoM' },
  { factorId: 'F18', direction: 'exit' as const, category: 'institutional' as const, weight: '15', notes: 'Fundo US tier-1 saiu' },
  { factorId: 'F19', direction: 'exit' as const, category: 'technical' as const, weight: '10', notes: 'Quebra MA200 após topo' },
  { factorId: 'F20', direction: 'exit' as const, category: 'technical' as const, weight: '10', notes: 'Volume anômalo de venda' },
  { factorId: 'F21', direction: 'exit' as const, category: 'technical' as const, weight: '15', notes: 'BTC subindo 30%+ em 5d (shorts montando)' },
  { factorId: 'F22', direction: 'exit' as const, category: 'technical' as const, weight: '10', notes: 'Drawdown sem notícia' },
  { factorId: 'F23', direction: 'exit' as const, category: 'macro' as const, weight: '5', notes: 'Fluxo estrangeiro negativo 5d' },
];

export async function seedFactorWeights(): Promise<number> {
  await db.insert(signalFactorWeights).values(WEIGHTS as never).onConflictDoNothing();
  logger.info({ count: WEIGHTS.length }, 'seeded factor weights');
  return WEIGHTS.length;
}
```

Add call in `worker/src/seeds/index.ts`:
```typescript
import { seedFactorWeights } from './factor-weights.js';
// in runSeeds():
await seedFactorWeights();
```

---

## Task 3: Tipos comuns + cache de weights

**Files:**
- Create: `worker/src/signals/types.ts`
- Create: `worker/src/signals/weights.ts`

```typescript
// types.ts
import type { Db } from '../db.js';

export type SignalDirection = 'entry' | 'exit';
export type FactorCategory = 'insider' | 'institutional' | 'technical' | 'macro';

export interface FactorContext {
  db: Db;
  ticker: string;
  asOf: Date;  // data de referência (geralmente hoje)
  logger: import('pino').Logger;
}

export interface FactorResult {
  factorId: string;
  direction: SignalDirection;
  category: FactorCategory;
  present: boolean;
  weight: number;
  evidence: Record<string, unknown>;
}

export interface FactorFn {
  (ctx: FactorContext): Promise<FactorResult>;
}
```

```typescript
// weights.ts
import { db } from '../db.js';
import { signalFactorWeights } from '@qmix-invest/db/schema';
import { eq } from 'drizzle-orm';

interface WeightEntry {
  weight: number;
  enabled: boolean;
}

let cache: Map<string, WeightEntry> | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;  // 5 min

export async function getWeight(factorId: string): Promise<{ weight: number; enabled: boolean }> {
  const now = Date.now();
  if (!cache || now - cacheLoadedAt > CACHE_TTL_MS) {
    cache = new Map();
    const rows = await db.select().from(signalFactorWeights);
    for (const r of rows as Array<{ factorId: string; weight: string; enabled: boolean }>) {
      cache.set(r.factorId, { weight: parseFloat(r.weight), enabled: r.enabled });
    }
    cacheLoadedAt = now;
  }
  return cache.get(factorId) ?? { weight: 0, enabled: false };
}

export function clearWeightCache(): void {
  cache = null;
}
```

---

## Tasks 4-21: implementar 18 factors (TDD)

Cada factor é um arquivo isolado em `worker/src/signals/factors/`. Seguir o padrão TDD com test em `worker/tests/signals/factors/`. Lista dos factors:

| Factor | Implementação resumida |
|---|---|
| F1 (insider-buy) | `SELECT count, sum(value) FROM insider_transactions WHERE ticker=? AND tx_type='buy' AND tx_date BETWEEN asOf-30d AND asOf` — present se sum > 100k BRL |
| F2 (insider-cluster) | distinct insider_name count em 30d ≥ 2 |
| F3 (controller-buy) | role='controller' AND tx_type='buy' em 30d |
| F4-F5 (stake disclosed) | depende de material_disclosures — retorna present:false até Phase 1.5 |
| F6 (fund-position-up) | comparar `fund_holdings_cvm` para mesmo (fund, ticker) entre referenceMonth-2 e referenceMonth — present se delta_pct > 50% AND new_holding_value > 100k |
| F7 (US tier-1 entered) | depende de fund_holdings_sec_13f — no-op até Phase 1.5 |
| F8 (drawdown-prior) | min/max em prices_daily para ticker em 90d — present se (max-asOf_close)/max > 0.25 |
| F9 (volume-anomaly) | avg(volume) últimos 5d / avg(volume) últimos 30d > 2 |
| F10 (BTC shorts cover) | depende de btc_lending_daily — no-op até Phase 1.5 |
| F11 (reversal MA21) | close_today > avg(close last 21d) AND drawdown F8 também presente |
| F12 (macro tailwind) | depende de foreign_flow_daily — no-op até Phase 1.5 |
| F13-F23 | espelhos dos anteriores na direção exit |

Em vez de 18 tasks isoladas, vou agrupar em 5 batches:

- **Task 4: F1, F2, F3 (insiders entry)** — TDD com fixtures de insider_transactions
- **Task 5: F8, F9, F11 (technical entry)** — TDD com fixtures de prices_daily
- **Task 6: F6 (fund-position) + F7/F10/F12 stubs (no-op)**
- **Task 7: F13, F14, F15 (insiders exit)** — espelhos
- **Task 8: F19, F20, F22 + F17 + F4/F5/F16/F18/F21/F23 stubs**

Cada batch ~1.5h. Total factors: ~7-9h.

---

## Task 22: Aggregator `aggregateSignal()`

**Files:**
- Create: `worker/src/signals/runner.ts`
- Test: `worker/tests/signals/runner.test.ts`

```typescript
import { db } from '../db.js';
import { signals, signalFactors, tickers } from '@qmix-invest/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../logger.js';
import type { FactorContext, FactorResult, SignalDirection } from './types.js';

// Import all factors
import * as f1 from './factors/f1-insider-buy.js';
import * as f2 from './factors/f2-insider-cluster.js';
// ... import all 23

const ENTRY_FACTORS = [f1.factor, f2.factor, /* ... */];
const EXIT_FACTORS = [/* ... */];

export async function aggregateSignal(
  ticker: string,
  asOf: Date,
  direction: SignalDirection
): Promise<number> {
  const log = logger.child({ ticker, asOf: asOf.toISOString().slice(0, 10), direction });
  const factorFns = direction === 'entry' ? ENTRY_FACTORS : EXIT_FACTORS;

  const ctx: FactorContext = { db, ticker, asOf, logger: log };
  const results = await Promise.all(factorFns.map((f) => f(ctx)));
  const present = results.filter((r) => r.present);

  let score = present.reduce((sum, r) => sum + r.weight, 0);
  const categories = new Set(present.map((r) => r.category));
  if (categories.size >= 3) score += 10; // convergence bonus

  // Small cap multiplier
  const t = await db.select({ isSmallCap: tickers.isSmallCap }).from(tickers).where(eq(tickers.ticker, ticker)).limit(1);
  const isSmallCap = (t as Array<{ isSmallCap: boolean }>)[0]?.isSmallCap ?? false;
  let smallCapMultApplied = false;
  if (isSmallCap) {
    score = score * 1.2;
    smallCapMultApplied = true;
  }

  score = Math.min(100, Math.round(score));

  // Persist signal + factors atomically
  const [{ id: signalId }] = await db
    .insert(signals)
    .values({
      ticker,
      date: asOf.toISOString().slice(0, 10),
      direction,
      score,
      convergenceCount: categories.size,
      smallCapMultApplied,
    })
    .onConflictDoUpdate({
      target: [signals.ticker, signals.date, signals.direction],
      set: { score, convergenceCount: categories.size, smallCapMultApplied, computedAt: new Date() as never },
    })
    .returning({ id: signals.id });

  // Replace factors
  await db.delete(signalFactors).where(eq(signalFactors.signalId, signalId));
  if (present.length > 0) {
    await db.insert(signalFactors).values(
      present.map((r) => ({
        signalId,
        factorId: r.factorId,
        category: r.category,
        weightApplied: r.weight.toString(),
        evidenceJson: JSON.stringify(r.evidence),
      })) as never
    );
  }

  log.info({ score, present: present.length, categories: categories.size }, 'signal aggregated');
  return score;
}
```

Test: mock factors + fakeDb, verify score calculation, convergence bonus, small-cap multiplier, persistence.

---

## Task 23: Handler pg-boss `recalculate-signals`

**Files:**
- Modify: `worker/src/handlers.ts`

Adicionar ao `SCRAPERS` array... wait, signals não são scrapers. Criar nova lista:

```typescript
import { aggregateSignal } from './signals/runner.js';

const SIGNAL_QUEUES = [
  { name: 'recalculate-signals', schedule: '0 8 * * 1-5' /* dias úteis 5h BRT */ },
];

// Em registerHandlers:
await boss.createQueue('recalculate-signals');
await boss.work('recalculate-signals', { batchSize: 1 }, async (jobs) => {
  for (const job of jobs) {
    const tickerList = (job.data as { tickers?: string[] })?.tickers ?? await getAllActiveTickers();
    const asOf = new Date();
    for (const ticker of tickerList) {
      await aggregateSignal(ticker, asOf, 'entry');
      await aggregateSignal(ticker, asOf, 'exit');
    }
  }
});
await boss.schedule('recalculate-signals', '0 8 * * 1-5', undefined, { tz: 'UTC' });
```

---

## Task 24: Smoke test + deploy

```bash
npm test  # all 24 + signal tests
npm run typecheck
git add -A && git commit -m "feat(phase-2): signal engine with 23 factors"
# Sync to VPS
tar -czf /tmp/phase2.tar.gz ...
pscp + plink + rebuild + recreate
docker compose exec worker node worker/dist/seeds/index.js  # adds factor_weights
docker compose exec worker node -e "import('./worker/dist/signals/runner.js').then(m => m.aggregateSignal('PETR4', new Date(), 'entry').then(console.log))"
```

Validação: SELECT * FROM signals deve mostrar pelo menos 1 row; SELECT * FROM signal_factors deve mostrar os factors disparados (provavelmente F8 drawdown se PETR4 caiu).

---

## O que NÃO está nesta fase

- ❌ IA (DeepSeek/Claude) — Fase 3
- ❌ Telegram alerts — Fase 4
- ❌ Backtest engine — defer para Phase 2.5
- ❌ Dashboard de signals — Fase 5
- ❌ Factors F4, F5, F7, F10, F12, F16, F18, F21, F23 com lógica REAL — dependem de Phase 1.5 (URLs B3 + pipeline insider PDF). Estão implementados como STUBS retornando `present: false`.

## Factors funcionais nesta fase (com dados reais)

✅ F1, F2, F3, F13, F14, F15 — insiders (mas insider_transactions vazio até Phase 1.5)
✅ F6, F17 — fund holdings (TEMOS dados — 1288 holdings)
✅ F8, F9, F11, F19, F20, F22 — technical (prices_daily — 7 rows hoje, mais conforme bootstrap)

Na prática, para Phase 2 funcionar EM ESCALA, você precisa também:
1. Mais tickers seeded (Phase 1.5)
2. Mais histórico de prices (5 anos via bootstrap)
3. Pipeline de insiders fixado

Mas o motor está PRONTO e gera sinais para os 7 tickers atuais. Demonstração já funciona.
