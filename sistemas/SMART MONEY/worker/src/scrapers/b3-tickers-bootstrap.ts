// Bootstrap: discover all active B3 tickers from the latest annual COTAHIST,
// then enrich with company name via Yahoo Finance v8.
// Use this once to populate the universe; rerun monthly to catch IPOs.

import { sql } from 'drizzle-orm';
import { fetchWithRetry } from './http.js';
import { extractTxtFromZip, parseLine } from './b3-prices.js';
import { logger } from '../logger.js';
import type { db as Db } from '../db.js';

const COTAHIST_ANNUAL = (year: number) =>
  `https://bvmf.bmfbovespa.com.br/InstDados/SerHist/COTAHIST_A${year}.ZIP`;

const YAHOO_HEADERS: Record<string, string> = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  accept: 'application/json,*/*',
  'accept-language': 'en-US,en;q=0.9',
};

interface TickerMeta {
  ticker: string;
  shortName: string | null;
  longName: string | null;
  marketCap: number | null;
}

async function fetchYahooMeta(ticker: string): Promise<TickerMeta | null> {
  try {
    const symbol = `${ticker}.SA`;
    const resp = await fetchWithRetry(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
      { timeoutMs: 10_000, retries: 1, headers: YAHOO_HEADERS }
    );
    if (resp.statusCode !== 200) return null;
    type Resp = {
      chart?: {
        result?: Array<{ meta?: { shortName?: string; longName?: string; marketCap?: number } }>;
      };
    };
    const json = JSON.parse(resp.body.toString('utf8')) as Resp;
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;
    return {
      ticker,
      shortName: meta.shortName ?? null,
      longName: meta.longName ?? null,
      marketCap: meta.marketCap ?? null,
    };
  } catch {
    return null;
  }
}

function inferClass(ticker: string, bdi?: string): 'ON' | 'PN' | 'UNT' | 'OTHER' {
  // BDI 12 = FII (Fundos Imobiliários, todos terminam em 11) → UNT no enum atual
  if (bdi === '12') return 'UNT';
  // BDI 14 = ETFs cripto e variações (COIN11, COPN11) → UNT
  if (bdi === '14') return 'UNT';
  // BDI 34/35/36 = BDR (recibos de empresas estrangeiras: AAPL34, EVEB31, BLBT39) → OTHER
  if (bdi === '34' || bdi === '35' || bdi === '36') return 'OTHER';
  // BDI 02 = lote-padrão de ações
  const suffix = ticker.slice(4);
  if (suffix === '3') return 'ON';
  if (suffix === '4' || suffix === '5' || suffix === '6') return 'PN';
  if (suffix === '11') return 'UNT';
  return 'OTHER';
}

function stubCnpjFor(ticker: string): string {
  return `STUB${ticker.padStart(10, '0')}`.slice(0, 14);
}

async function pLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]!);
    }
  });
  await Promise.all(workers);
  return results;
}

interface BootstrapStats {
  totalTickersInCotahist: number;
  alreadyKnown: number;
  newlyInserted: number;
  enrichedWithName: number;
  yahooFailures: number;
  year: number;
}

export async function bootstrapAllTickers(database: typeof Db): Promise<BootstrapStats> {
  const log = logger.child({ scraper: 'b3-tickers-bootstrap' });
  const currentYear = new Date().getUTCFullYear();

  // Try current year first, fallback to previous (early Jan, current may be missing)
  let zipBuffer: Buffer | null = null;
  let year = currentYear;
  for (const y of [currentYear, currentYear - 1]) {
    year = y;
    try {
      const resp = await fetchWithRetry(COTAHIST_ANNUAL(y), { timeoutMs: 600_000, retries: 2 });
      if (resp.statusCode === 200) {
        zipBuffer = resp.body;
        break;
      }
      log.warn({ year: y, statusCode: resp.statusCode }, 'COTAHIST annual not available, trying previous');
    } catch (err) {
      log.warn({ err, year: y }, 'COTAHIST fetch failed');
    }
  }

  if (!zipBuffer) {
    throw new Error(`COTAHIST not available for ${currentYear} or ${currentYear - 1}`);
  }

  log.info({ year, sizeMB: (zipBuffer.length / 1024 / 1024).toFixed(2) }, 'COTAHIST downloaded, parsing tickers');

  // Collect distinct tickers
  // BDI 02 = lote-padrão à vista (ações ON/PN/UNT, ETFs/FIIs antigos terminando em 11)
  // BDI 12 = FII (fundos imobiliários, todos terminam em 11)
  // BDI 14 = ETFs cripto e variações (terminam em 11)
  // BDI 34/35/36 = BDR (recibos de empresas estrangeiras: AAPL34, EVEB31, BLBT39)
  const universe = new Map<string, string>(); // ticker -> bdi (primeiro BDI visto)
  for await (const line of extractTxtFromZip(zipBuffer)) {
    const row = parseLine(line);
    if (!row) continue;
    if (!['02', '12', '14', '34', '35', '36'].includes(row.bdi)) continue;
    if (row.volume === 0n) continue;
    if (!/^[A-Z]{4}\d{1,2}$/.test(row.ticker)) continue;
    if (!universe.has(row.ticker)) universe.set(row.ticker, row.bdi);
  }
  log.info({ count: universe.size }, 'distinct active tickers extracted from COTAHIST');

  // Filter to those NOT already in DB
  const knownRows = (await database.execute(sql`select ticker from qmix_invest.tickers`)) as unknown as Array<{
    ticker: string;
  }>;
  const knownSet = new Set(knownRows.map((r) => r.ticker));
  const todo = Array.from(universe.entries()).filter(([t]) => !knownSet.has(t));

  log.info(
    { universe: universe.size, alreadyKnown: knownSet.size, toInsert: todo.length },
    'tickers to be inserted'
  );

  let enriched = 0;
  let yahooFailures = 0;

  // Fetch Yahoo metadata in parallel with concurrency limit
  const metas = await pLimit(todo, 6, async ([ticker, bdi]) => {
    const m = await fetchYahooMeta(ticker);
    if (!m) {
      yahooFailures++;
      return { ticker, shortName: null, longName: null, marketCap: null, bdi } as TickerMeta & { bdi: string };
    }
    if (m.shortName || m.longName) enriched++;
    return { ...m, bdi } as TickerMeta & { bdi: string };
  });

  // Insert in transaction-like batches
  let inserted = 0;
  for (const meta of metas) {
    const stubCnpj = stubCnpjFor(meta.ticker);
    const companyName = meta.longName || meta.shortName || `B3: ${meta.ticker}`;
    const klass = inferClass(meta.ticker, meta.bdi);
    try {
      await database.execute(sql`
        insert into qmix_invest.companies (cnpj, name, sector)
        values (${stubCnpj}, ${companyName}, 'A classificar')
        on conflict (cnpj) do update set name = excluded.name where qmix_invest.companies.name like 'Cadastro manual%' or qmix_invest.companies.name like 'B3:%'
      `);
      await database.execute(sql`
        insert into qmix_invest.tickers (ticker, cnpj, class, active, market_cap_brl)
        values (${meta.ticker}, ${stubCnpj}, ${klass}::qmix_invest.ticker_class, true, ${meta.marketCap ?? null})
        on conflict (ticker) do nothing
      `);
      inserted++;
    } catch (err) {
      log.warn({ err, ticker: meta.ticker }, 'insert failed');
    }
  }

  const stats: BootstrapStats = {
    totalTickersInCotahist: universe.size,
    alreadyKnown: knownSet.size,
    newlyInserted: inserted,
    enrichedWithName: enriched,
    yahooFailures,
    year,
  };
  log.info(stats, 'bootstrap complete');
  return stats;
}
