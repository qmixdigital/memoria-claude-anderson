// Intraday quote scraper — Yahoo Finance v8 chart endpoint (no auth required).
// Updates qmix_invest.tickers.last_quote_* for every ticker the user cares about:
// carteira (user_portfolio) ∪ watchlist (user_watchlist) ∪ alertas de preço ativos.
// Assim qualquer alerta criado funciona, mesmo de ação fora da carteira.
// Also fills companies.name when the current name is the placeholder stub.

import { sql } from 'drizzle-orm';
import { fetchWithRetry } from './http.js';
import { logger } from '../logger.js';
import type { db as Db } from '../db.js';

interface QuoteData {
  ticker: string;
  price: number;
  changePct: number | null;
  volume: number | null;
  marketCap: number | null;
  shortName: string | null;
  longName: string | null;
}

const YAHOO_HEADERS: Record<string, string> = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  accept: 'application/json,*/*',
  'accept-language': 'en-US,en;q=0.9',
};

async function fetchYahooChart(ticker: string): Promise<QuoteData | null> {
  const symbol = `${ticker}.SA`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d&includePrePost=false`;

  const resp = await fetchWithRetry(url, {
    timeoutMs: 12_000,
    retries: 2,
    headers: YAHOO_HEADERS,
  });
  if (resp.statusCode !== 200) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(resp.body.toString('utf8'));
  } catch {
    return null;
  }
  type YahooResp = {
    chart?: {
      result?: Array<{
        meta?: {
          regularMarketPrice?: number;
          chartPreviousClose?: number;
          previousClose?: number;
          regularMarketVolume?: number;
          shortName?: string;
          longName?: string;
        };
      }>;
      error?: unknown;
    };
  };
  const json = parsed as YahooResp;
  const meta = json.chart?.result?.[0]?.meta;
  if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? null;
  const changePct = prev && prev > 0 ? ((price - prev) / prev) * 100 : null;

  return {
    ticker,
    price,
    changePct,
    volume: meta.regularMarketVolume ?? null,
    marketCap: null,
    shortName: meta.shortName ?? null,
    longName: meta.longName ?? null,
  };
}

async function pLimitAll<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
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

export async function refreshWatchlistQuotes(
  database: typeof Db,
  filter?: { tickers?: string[] }
): Promise<{ updated: number; skipped: number; errors: number }> {
  const log = logger.child({ scraper: 'quote-watchlist' });

  let symbolList: string[];
  if (filter?.tickers && filter.tickers.length > 0) {
    symbolList = filter.tickers;
  } else {
    // Carteira ∪ watchlist ∪ tickers com alerta de preço ativo
    const rows = (await database.execute(sql`
      select ticker from qmix_invest.user_portfolio
      union
      select ticker from qmix_invest.user_watchlist
      union
      select ticker from qmix_invest.price_alerts where active = true
    `)) as unknown as Array<{ ticker: string }>;
    symbolList = rows.map((r) => r.ticker);
  }

  if (symbolList.length === 0) {
    log.info('no tickers to quote');
    return { updated: 0, skipped: 0, errors: 0 };
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  const settled = await pLimitAll(symbolList, 4, async (ticker) => {
    try {
      const q = await fetchYahooChart(ticker);
      return { ticker, q, err: null as unknown };
    } catch (err) {
      return { ticker, q: null, err };
    }
  });

  for (const { ticker, q, err } of settled) {
    if (err) {
      log.warn({ err, ticker }, 'yahoo fetch failed');
      errors++;
      continue;
    }
    if (!q) {
      skipped++;
      continue;
    }

    try {
      await database.execute(sql`
        update qmix_invest.tickers
        set last_quote_brl = ${q.price},
            last_quote_change_pct = ${q.changePct},
            last_quote_volume = ${q.volume},
            last_quote_at = now(),
            updated_at = now()
        where ticker = ${ticker}
      `);

      const name = q.longName || q.shortName;
      if (name) {
        await database.execute(sql`
          update qmix_invest.companies c
          set name = ${name}
          from qmix_invest.tickers t
          where t.ticker = ${ticker}
            and t.cnpj = c.cnpj
            and (c.name like 'Cadastro manual%' or c.name = '')
        `);
      }
      updated++;
    } catch (e) {
      log.error({ err: e, ticker }, 'quote update db failed');
      errors++;
    }
  }

  log.info({ updated, skipped, errors, total: symbolList.length }, 'quote-watchlist done');
  return { updated, skipped, errors };
}
