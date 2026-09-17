// bootstrap-prices.ts — carga histórica de prices via COTAHIST anual.
// Roda 1x após primeiro deploy. Itera N anos para trás, baixa
// COTAHIST_A<YYYY>.ZIP de cada um, parseia e insere em prices_daily.
// Idempotente via source_hash UNIQUE.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { pricesDaily, tickers } from '@qmix-invest/db/schema';
import { db, queryClient } from './db.js';
import { logger } from './logger.js';
import { fetchWithRetry } from './scrapers/http.js';
import { extractTxtFromZip, parseLine, hash } from './scrapers/b3-prices.js';

const ANNUAL_URL = (year: number) =>
  `https://bvmf.bmfbovespa.com.br/InstDados/SerHist/COTAHIST_A${year}.ZIP`;

const DEFAULT_YEARS_BACK = 5;
const BATCH = 5000;

async function loadKnownTickers(): Promise<Set<string>> {
  const rows = (await db
    .select({ ticker: tickers.ticker })
    .from(tickers)) as Array<{ ticker: string }>;
  return new Set(rows.map((r) => r.ticker));
}

async function bootstrapYear(year: number, knownTickers: Set<string>): Promise<{ fetched: number; inserted: number; skipped: number }> {
  const log = logger.child({ year });
  log.info({ url: ANNUAL_URL(year) }, 'downloading COTAHIST annual');

  let zipBuffer: Buffer;
  try {
    const resp = await fetchWithRetry(ANNUAL_URL(year), { timeoutMs: 600_000, retries: 3 });
    if (resp.statusCode !== 200) {
      log.warn({ statusCode: resp.statusCode }, 'failed to fetch annual COTAHIST');
      return { fetched: 0, inserted: 0, skipped: 0 };
    }
    zipBuffer = resp.body;
    log.info({ sizeMB: (zipBuffer.length / 1024 / 1024).toFixed(2) }, 'downloaded');
  } catch (err) {
    log.error({ err }, 'fetch failed');
    return { fetched: 0, inserted: 0, skipped: 0 };
  }

  let fetched = 0;
  let inserted = 0;
  let skipped = 0;
  let batch: typeof pricesDaily.$inferInsert[] = [];

  try {
    for await (const line of extractTxtFromZip(zipBuffer)) {
      const row = parseLine(line);
      if (!row) continue;
      // Aceita ações (02), FIIs (12), ETFs cripto (14) e BDRs (34/35/36)
      if (!['02', '12', '14', '34', '35', '36'].includes(row.bdi)) {
        skipped += 1;
        continue;
      }
      if (!knownTickers.has(row.ticker)) {
        skipped += 1;
        continue;
      }
      fetched += 1;

      const sourceHash = hash(row.ticker, row.date, row.close.toFixed(4), row.volume.toString());
      batch.push({
        ticker: row.ticker,
        date: row.date,
        open: row.open.toString(),
        high: row.high.toString(),
        low: row.low.toString(),
        close: row.close.toString(),
        volume: row.volume,
        financialVolumeBrl: row.financialVolume,
        trades: row.trades,
        source: 'b3-cotahist-annual',
        sourceHash,
      });

      if (batch.length >= BATCH) {
        const result = await db
          .insert(pricesDaily)
          .values(batch as never)
          .onConflictDoNothing({ target: pricesDaily.sourceHash });
        inserted += (result as { rowCount?: number }).rowCount ?? batch.length;
        batch = [];
        if (fetched % 25_000 === 0) log.info({ fetched, inserted, skipped }, 'progress');
      }
    }

    if (batch.length > 0) {
      const result = await db
        .insert(pricesDaily)
        .values(batch as never)
        .onConflictDoNothing({ target: pricesDaily.sourceHash });
      inserted += (result as { rowCount?: number }).rowCount ?? batch.length;
    }
  } catch (err) {
    log.error({ err, fetched, inserted }, 'parse failed mid-stream');
  }

  log.info({ fetched, inserted, skipped }, 'year complete');
  return { fetched, inserted, skipped };
}

export async function bootstrapPrices(yearsBack: number = DEFAULT_YEARS_BACK): Promise<void> {
  const currentYear = new Date().getUTCFullYear();
  const knownTickers = await loadKnownTickers();
  logger.info({ yearsBack, currentYear, knownTickers: knownTickers.size }, 'bootstrap-prices starting');

  let totalFetched = 0;
  let totalInserted = 0;

  // Most recent year first (most relevant data first)
  for (let offset = 0; offset < yearsBack; offset++) {
    const year = currentYear - offset;
    const r = await bootstrapYear(year, knownTickers);
    totalFetched += r.fetched;
    totalInserted += r.inserted;
  }

  logger.info({ totalFetched, totalInserted }, 'bootstrap-prices complete');
}

const argv1 = process.argv[1];
if (argv1 && fileURLToPath(import.meta.url) === path.resolve(argv1)) {
  const yearsBack = parseInt(process.argv[2] ?? `${DEFAULT_YEARS_BACK}`, 10);
  bootstrapPrices(yearsBack)
    .then(() => queryClient.end())
    .then(() => process.exit(0))
    .catch(async (err) => {
      logger.fatal({ err }, 'bootstrap-prices failed');
      await queryClient.end();
      process.exit(1);
    });
}
