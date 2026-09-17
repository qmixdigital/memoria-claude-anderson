import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher, type Dispatcher } from 'undici';
import JSZip from 'jszip';

let originalDispatcher: Dispatcher;
let mockAgent: MockAgent;

beforeEach(() => {
  originalDispatcher = getGlobalDispatcher();
  mockAgent = new MockAgent();
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);
});

afterEach(async () => {
  setGlobalDispatcher(originalDispatcher);
  await mockAgent.close();
});

const insertedRecords: unknown[] = [];
const fakeDb = {
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue([{ ticker: 'EXISTS' }]),
      })),
    })),
  })),
  insert: vi.fn(() => ({
    values: vi.fn((records: unknown[]) => {
      insertedRecords.push(...records);
      return { onConflictDoNothing: vi.fn().mockResolvedValue({ rowCount: records.length }) };
    }),
  })),
};
const fakeLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  child: vi.fn().mockReturnThis(),
} as never;

/**
 * Builds a single COTAHIST fixed-width record of exactly 245 chars.
 *
 * Field layout matches the COTAHIST spec:
 *  [0,2)   '01' record type
 *  [2,10)  date YYYYMMDD
 *  [10,12) BDI code (zero-padded left)
 *  [12,24) ticker (right-padded with spaces)
 *  [24,27) market type '010'
 *  [27,39) issuer short name (right-padded)
 *  [39,49) spec (right-padded)
 *  [49,52) term days '   '
 *  [52,56) currency 'R$  '
 *  [56,69) open  (13 chars, integer = price × 100)
 *  [69,82) high
 *  [82,95) low
 *  [95,108) avg (= open here)
 *  [108,121) close
 *  [121,134) bid (= close)
 *  [134,147) ask (= close)
 *  [147,152) trades (5 chars)
 *  [152,170) quantity / volume (18 chars integer)
 *  [170,188) financial volume (18 chars integer)
 *  [188,201) strike price (13 chars zeros)
 *  [201,202) strike indicator ' '
 *  [202,210) expiration date '00000000'
 *  [210,217) trading factor '0000000'
 *  [217,230) strike price 2 (13 chars zeros)
 *  [230,242) ISIN (12 chars)
 *  [242,245) distribution number (3 chars)
 */
function buildCotahistRow(
  date: string,
  bdi: string,
  ticker: string,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: bigint,
  finVolume: bigint,
): string {
  const dateField = date.replace(/-/g, '').padEnd(8);        // 8 chars
  const bdiField = bdi.padStart(2, '0');                     // 2 chars
  const tickerField = ticker.padEnd(12);                     // 12 chars
  const marketField = '010';                                 // 3 chars
  const issuerField = ticker.slice(0, 12).padEnd(12);        // 12 chars
  const specField = 'ON'.padEnd(10);                         // 10 chars
  const termField = '   ';                                   // 3 chars
  const currencyField = 'R$  ';                              // 4 chars
  const priceField = (n: number) =>
    Math.round(n * 100).toString().padStart(13, '0');        // 13 chars
  const qtyField = (n: bigint) =>
    n.toString().padStart(18, '0');                          // 18 chars
  const tradesField = '00100';                               // 5 chars
  const strikeField = '0000000000000';                       // 13 chars
  const indicator = ' ';                                     // 1 char
  const expDate = '00000000';                               // 8 chars
  const tradingFactor = '0000000';                          // 7 chars
  const isin = 'BRPETRACNOR9';                              // 12 chars
  const distNum = '100';                                    // 3 chars

  const line = [
    '01',           // [0,2)
    dateField,      // [2,10)
    bdiField,       // [10,12)
    tickerField,    // [12,24)
    marketField,    // [24,27)
    issuerField,    // [27,39)
    specField,      // [39,49)
    termField,      // [49,52)
    currencyField,  // [52,56)
    priceField(open),   // [56,69)
    priceField(high),   // [69,82)
    priceField(low),    // [82,95)
    priceField(open),   // [95,108) avg = open
    priceField(close),  // [108,121)
    priceField(close),  // [121,134) bid = close
    priceField(close),  // [134,147) ask = close
    tradesField,    // [147,152)
    qtyField(volume),   // [152,170)
    qtyField(finVolume),// [170,188)
    strikeField,    // [188,201)
    indicator,      // [201,202)
    expDate,        // [202,210)
    tradingFactor,  // [210,217)
    strikeField,    // [217,230)
    isin,           // [230,242)
    distNum,        // [242,245)
  ].join('');

  return line.padEnd(245);
}

describe('b3-prices scraper', () => {
  beforeEach(() => {
    insertedRecords.length = 0;
    vi.clearAllMocks();
  });

  it('parses COTAHIST ZIP, filters BDI 02, inserts price rows', async () => {
    const lines = [
      '00COTAHIST.AAA20260425          BOVESPA   '.padEnd(245), // header type 00 — skip
      buildCotahistRow('2026-04-25', '02', 'PETR4',  38.50, 38.95, 38.10, 38.85, 1_500_000n, 58_275_000_000n),
      buildCotahistRow('2026-04-25', '02', 'VALE3',  65.10, 65.80, 64.95, 65.55,   800_000n, 52_440_000_000n),
      buildCotahistRow('2026-04-25', '02', 'VITT3',   5.20,  5.32,  5.15,  5.28,    50_000n,    264_000_000n),
      buildCotahistRow('2026-04-25', '78', 'PETRH40', 38.50, 38.95, 38.10, 38.85, 1_500_000n, 58_275_000_000n), // option BDI 78 — skip
      '99COTAHIST.AAA20260425          BOVESPA   '.padEnd(245), // trailer type 99 — skip
    ];
    const content = lines.join('\r\n');

    const zip = new JSZip();
    zip.file('COTAHIST_D25042026.TXT', Buffer.from(content, 'latin1'));
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    const pool = mockAgent.get('https://bvmf.bmfbovespa.com.br');
    pool
      .intercept({ path: /\/InstDados\/SerHist\/COTAHIST_D\d+\.ZIP/i })
      .reply(200, zipBuffer, { headers: { 'content-type': 'application/zip' } });

    const { scraper } = await import('../../src/scrapers/b3-prices?run');
    const out = await scraper.run({ db: fakeDb as never, logger: fakeLogger });

    expect(out.status).toBe('success');
    if (out.status === 'success') {
      expect(out.itemsFetched).toBe(3);          // 3 BDI-02 rows
      expect(out.itemsSkipped).toBeGreaterThanOrEqual(1); // BDI-78 row skipped
    }
    expect(insertedRecords.length).toBe(3);

    const tickers = (insertedRecords as { ticker: string }[]).map((r) => r.ticker);
    expect(tickers).toContain('PETR4');
    expect(tickers).toContain('VALE3');
    expect(tickers).toContain('VITT3');

    // Verify PETR4 prices are parsed correctly
    const petr4 = (insertedRecords as { ticker: string; open: string; close: string; volume: bigint }[])
      .find((r) => r.ticker === 'PETR4');
    expect(petr4).toBeDefined();
    expect(parseFloat(petr4!.open)).toBeCloseTo(38.50, 2);
    expect(parseFloat(petr4!.close)).toBeCloseTo(38.85, 2);
    expect(petr4!.volume).toBe(1_500_000n);
  });

  it('returns failed on 5xx', async () => {
    const pool = mockAgent.get('https://bvmf.bmfbovespa.com.br');
    // Intercept all 4 attempts (initial + 3 retries)
    for (let i = 0; i < 4; i++) {
      pool.intercept({ path: /\/InstDados\/.*/i }).reply(500, Buffer.from(''));
    }
    const { scraper } = await import('../../src/scrapers/b3-prices?fail');
    const out = await scraper.run({ db: fakeDb as never, logger: fakeLogger });
    expect(out.status).toBe('failed');
  }, 30_000);
});
