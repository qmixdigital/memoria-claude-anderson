import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import unzipper from 'unzipper';
import { pricesDaily, tickers } from '@qmix-invest/db/schema';
import type { Scraper, ScraperContext, ScraperOutcome } from './types.js';
import { fetchWithRetry } from './http.js';

const URL_TEMPLATE = (date: Date) => {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  return `https://bvmf.bmfbovespa.com.br/InstDados/SerHist/COTAHIST_D${dd}${mm}${yyyy}.ZIP`;
};

export function hash(...parts: (string | number)[]): string {
  return createHash('sha256').update(parts.join('|')).digest('hex');
}

export interface CotahistRow {
  date: string;
  bdi: string;
  ticker: string;
  open: number;
  high: number;
  low: number;
  avg: number;
  close: number;
  trades: number;
  volume: bigint;
  financialVolume: bigint;
}

/**
 * Parses a single COTAHIST fixed-width line (245 chars).
 *
 * Byte offsets (0-based, half-open intervals):
 *  [0,2)   record type ('01' = trading data)
 *  [2,10)  date YYYYMMDD
 *  [10,12) BDI code
 *  [12,24) ticker
 *  [56,69) open price  (13 chars, implicit 2 decimals)
 *  [69,82) high
 *  [82,95) low
 *  [95,108) average
 *  [108,121) close
 *  [147,152) number of trades (5 chars)
 *  [152,170) total quantity / volume (18 chars, integer)
 *  [170,188) financial volume BRL (18 chars, integer)
 */
export function parseLine(line: string): CotahistRow | null {
  if (line.length < 245) return null;
  const recordType = line.substring(0, 2);
  if (recordType !== '01') return null;

  const dateRaw = line.substring(2, 10); // YYYYMMDD
  const bdi = line.substring(10, 12);
  const ticker = line.substring(12, 24).trim().toUpperCase();
  const open = parseInt(line.substring(56, 69), 10) / 100;
  const high = parseInt(line.substring(69, 82), 10) / 100;
  const low = parseInt(line.substring(82, 95), 10) / 100;
  const avg = parseInt(line.substring(95, 108), 10) / 100;
  const close = parseInt(line.substring(108, 121), 10) / 100;
  const trades = parseInt(line.substring(147, 152), 10);
  const volume = BigInt(line.substring(152, 170).trim() || '0');
  const financialVolume = BigInt(line.substring(170, 188).trim() || '0');

  if (!ticker || !/^\d{8}$/.test(dateRaw)) return null;
  const date = `${dateRaw.substring(0, 4)}-${dateRaw.substring(4, 6)}-${dateRaw.substring(6, 8)}`;

  return { date, bdi, ticker, open, high, low, avg, close, trades, volume, financialVolume };
}

export async function* extractTxtFromZip(zipBuffer: Buffer): AsyncGenerator<string> {
  const directory = await unzipper.Open.buffer(zipBuffer);
  const txtEntry = directory.files.find((f) => /\.txt$/i.test(f.path));
  if (!txtEntry) throw new Error('No .TXT file in COTAHIST ZIP');

  const stream = txtEntry.stream();
  let buffer = '';
  for await (const chunk of stream as AsyncIterable<Buffer>) {
    buffer += chunk.toString('latin1');
    let nl: number;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      yield buffer.slice(0, nl).replace(/\r$/, '');
      buffer = buffer.slice(nl + 1);
    }
  }
  if (buffer.length > 0) yield buffer;
}

export const scraper: Scraper = {
  source: 'b3-prices',
  async run(ctx: ScraperContext): Promise<ScraperOutcome> {
    const log = ctx.logger.child({ scraper: 'b3-prices' });
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    let zipBuffer: Buffer;
    try {
      const resp = await fetchWithRetry(URL_TEMPLATE(yesterday), { timeoutMs: 60_000, retries: 3 });
      if (resp.statusCode !== 200) return { status: 'failed', errorMessage: `HTTP ${resp.statusCode}` };
      zipBuffer = resp.body;
    } catch (err) {
      return { status: 'failed', errorMessage: err instanceof Error ? err.message : String(err) };
    }

    let totalFetched = 0;
    let totalInserted = 0;
    let totalSkipped = 0;
    const tickerCache = new Set<string>();
    const BATCH = 1000;
    let batch: typeof pricesDaily.$inferInsert[] = [];

    try {
      for await (const line of extractTxtFromZip(zipBuffer)) {
        const row = parseLine(line);
        if (!row) continue;
        // Aceita ações (02), FIIs (12), ETFs cripto (14) e BDRs (34/35/36)
        if (!['02', '12', '14', '34', '35', '36'].includes(row.bdi)) {
          totalSkipped += 1;
          continue;
        }
        totalFetched += 1;

        if (!tickerCache.has(row.ticker)) {
          const found = await ctx.db
            .select({ ticker: tickers.ticker })
            .from(tickers)
            .where(eq(tickers.ticker, row.ticker))
            .limit(1);
          if ((found as Array<unknown>).length === 0) {
            totalSkipped += 1;
            totalFetched -= 1; // revert the count — this row is effectively skipped
            continue;
          }
          tickerCache.add(row.ticker);
        }

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
          source: 'b3-cotahist',
          sourceHash,
        });

        if (batch.length >= BATCH) {
          const result = await ctx.db
            .insert(pricesDaily)
            .values(batch as never)
            .onConflictDoNothing({ target: pricesDaily.sourceHash });
          totalInserted += (result as { rowCount?: number }).rowCount ?? batch.length;
          batch = [];
        }
      }

      if (batch.length > 0) {
        const result = await ctx.db
          .insert(pricesDaily)
          .values(batch as never)
          .onConflictDoNothing({ target: pricesDaily.sourceHash });
        totalInserted += (result as { rowCount?: number }).rowCount ?? batch.length;
      }
    } catch (err) {
      return {
        status: 'partial',
        itemsFetched: totalFetched,
        itemsInserted: totalInserted,
        itemsSkipped: totalSkipped,
        errorMessage: err instanceof Error ? err.message : String(err),
      };
    }

    log.info({ totalFetched, totalInserted, totalSkipped }, 'b3-prices completed');

    return {
      status: 'success',
      itemsFetched: totalFetched,
      itemsInserted: totalInserted,
      itemsSkipped: totalSkipped,
    };
  },
};
