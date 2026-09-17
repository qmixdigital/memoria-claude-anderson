import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  date,
  index,
  integer,
  numeric,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const qmixInvest = pgSchema('qmix_invest');

// ============================================================
// REFERÊNCIA — companies, tickers
// ============================================================

export const tickerClassEnum = qmixInvest.enum('ticker_class', ['ON', 'PN', 'UNT', 'OTHER']);

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
  assetClass: text('asset_class'), // 'acao' | 'fii' | 'etf' | 'bdr' | 'outro' — isenção só vale p/ 'acao'
  isSmallCap: boolean('is_small_cap').default(false).notNull(),
  marketCapBrl: bigint('market_cap_brl', { mode: 'bigint' }),
  active: boolean('active').default(true).notNull(),
  lastQuoteBrl: numeric('last_quote_brl', { precision: 12, scale: 4 }),
  lastQuoteChangePct: numeric('last_quote_change_pct', { precision: 8, scale: 4 }),
  lastQuoteVolume: bigint('last_quote_volume', { mode: 'bigint' }),
  lastQuoteAt: timestamp('last_quote_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  cnpjIdx: index('tickers_cnpj_idx').on(t.cnpj),
  smallCapIdx: index('tickers_small_cap_idx').on(t.isSmallCap).where(sql`${t.active} = true`),
}));

// ============================================================
// SÉRIES TEMPORAIS — preços
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

// ============================================================
// SCRAPER RUNS — observabilidade dos scrapers
// ============================================================

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

// ============================================================
// USER DATA — preferências, carteira, watchlist, alertas de preço
// ============================================================

export const userPreferences = qmixInvest.table('user_preferences', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  thresholdEntryAlert: integer('threshold_entry_alert').default(70).notNull(),
  thresholdExitAlert: integer('threshold_exit_alert').default(70).notNull(),
  thresholdExitCriticalPortfolio: integer('threshold_exit_critical_portfolio').default(80).notNull(),
  reportTimeBrt: text('report_time_brt').default('06:30').notNull(),
  pausedUntil: timestamp('paused_until', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Carteira — posições que o usuário possui (qty + preço médio).
export const userPortfolio = qmixInvest.table('user_portfolio', {
  ticker: varchar('ticker', { length: 12 }).primaryKey().references(() => tickers.ticker),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  notes: text('notes'),
  purchasePriceBrl: numeric('purchase_price_brl', { precision: 12, scale: 4 }),
  quantity: integer('quantity'),
  purchaseDate: date('purchase_date'),
});

// Watchlist — ações em observação (sem posição).
export const userWatchlist = qmixInvest.table('user_watchlist', {
  ticker: varchar('ticker', { length: 12 }).primaryKey().references(() => tickers.ticker, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  notes: text('notes'),
});

export const priceAlerts = qmixInvest.table('price_alerts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  ticker: varchar('ticker', { length: 12 }).notNull().references(() => tickers.ticker, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // 'target_high' | 'stop_loss'
  targetPrice: numeric('target_price', { precision: 12, scale: 4 }).notNull(),
  notes: text('notes'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }),
  triggeredPrice: numeric('triggered_price', { precision: 12, scale: 4 }),
  notifiedAt: timestamp('notified_at', { withTimezone: true }),
}, (t) => ({
  activeTickerIdx: index('price_alerts_active_ticker_idx').on(t.ticker, t.active),
}));

// ============================================================
// PROVENTOS — dividendos e JCP
// ============================================================

export const proventos = qmixInvest.table('proventos', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  ticker: varchar('ticker', { length: 12 }).notNull(),
  productType: text('product_type'),
  eventType: text('event_type').notNull(),
  referenceDate: date('reference_date'),
  comDate: date('com_date'),
  paymentDate: date('payment_date'),
  grossPerShareBrl: numeric('gross_per_share_brl', { precision: 14, scale: 6 }),
  closePriceBrl: numeric('close_price_brl', { precision: 12, scale: 4 }),
  dyEventPct: numeric('dy_event_pct', { precision: 8, scale: 4 }),
  inPortfolio: boolean('in_portfolio').default(false),
  sourceUrl: text('source_url'),
  sourceHash: text('source_hash').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tickerPaymentIdx: index('proventos_ticker_payment_idx').on(t.ticker, t.paymentDate),
  paymentIdx: index('proventos_payment_idx').on(t.paymentDate),
  eventTypeIdx: index('proventos_event_type_idx').on(t.eventType),
}));

export const proventosAReceber = qmixInvest.table('proventos_a_receber', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  ticker: varchar('ticker', { length: 12 }).notNull(),
  eventType: text('event_type').notNull(),
  paymentDate: date('payment_date'),
  quantity: integer('quantity').notNull(),
  grossPerShareBrl: numeric('gross_per_share_brl', { precision: 14, scale: 6 }),
  netValueBrl: numeric('net_value_brl', { precision: 12, scale: 2 }).notNull(),
  sourceHash: text('source_hash').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tickerIdx: index('proventos_ar_ticker_idx').on(t.ticker, t.paymentDate),
  paymentIdx: index('proventos_ar_payment_idx').on(t.paymentDate),
}));

// ============================================================
// ALERTAS WATCHLIST — registro anti-spam dos alertas Telegram
// ============================================================

export const watchlistAlertsSent = qmixInvest.table('watchlist_alerts_sent', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  ticker: varchar('ticker', { length: 12 }).notNull(),
  alertType: text('alert_type').notNull(),
  sentDate: date('sent_date').defaultNow().notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  payloadJson: text('payload_json'),
}, (t) => ({
  uniqueIdx: uniqueIndex('watchlist_alerts_sent_unique_idx').on(t.ticker, t.alertType, t.sentDate),
  recentIdx: index('watchlist_alerts_sent_recent_idx').on(t.sentAt),
}));

// ============================================================
// MÓDULO FISCAL — ledger de operações + apuração de ganho de capital
// ============================================================

// Ledger de operações (escrituração manual de compra/venda).
export const trades = qmixInvest.table('trades', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  ticker: varchar('ticker', { length: 12 }).notNull().references(() => tickers.ticker),
  side: text('side').notNull(), // 'buy' | 'sell'
  tradeDate: date('trade_date').notNull(),
  quantity: integer('quantity').notNull(),
  priceBrl: numeric('price_brl', { precision: 12, scale: 4 }).notNull(),
  feesBrl: numeric('fees_brl', { precision: 12, scale: 4 }).default('0').notNull(),
  nature: text('nature').default('swing').notNull(), // 'swing' | 'day'
  natureInferred: boolean('nature_inferred').default(false).notNull(),
  isOpening: boolean('is_opening').default(false).notNull(),
  repurchaseIntent: boolean('repurchase_intent').default(false).notNull(), // venda pra subir PM (vai recomprar)
  repurchaseRemindedAt: timestamp('repurchase_reminded_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  dateIdx: index('trades_date_idx').on(t.tradeDate),
  tickerDateIdx: index('trades_ticker_date_idx').on(t.ticker, t.tradeDate),
}));

// Eventos corporativos que ajustam qty/PM sem ser compra/venda.
export const corporateEvents = qmixInvest.table('corporate_events', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  ticker: varchar('ticker', { length: 12 }).notNull().references(() => tickers.ticker),
  eventDate: date('event_date').notNull(),
  eventType: text('event_type').notNull(), // 'split'|'reverse_split'|'bonus'|'subscription'|'adjust'
  factor: numeric('factor', { precision: 14, scale: 8 }),
  newQuantity: integer('new_quantity'),
  newPmBrl: numeric('new_pm_brl', { precision: 12, scale: 4 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tickerDateIdx: index('corporate_events_ticker_date_idx').on(t.ticker, t.eventDate),
}));

// Estoque de prejuízo a compensar por natureza (não vence).
export const taxLossCarryforward = qmixInvest.table('tax_loss_carryforward', {
  nature: text('nature').primaryKey(), // 'swing' | 'day'
  amountBrl: numeric('amount_brl', { precision: 14, scale: 2 }).default('0').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Imposto < R$10 acumula aqui até atingir o piso e virar DARF.
export const taxDuePending = qmixInvest.table('tax_due_pending', {
  nature: text('nature').primaryKey(), // 'swing' | 'day'
  amountBrl: numeric('amount_brl', { precision: 14, scale: 2 }).default('0').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
