import { IndexChartClient } from './IndexChartClient';

interface IndexQuote {
  symbol: string;
  label: string;
  current: number;
  previousClose: number;
  changePct: number;
  marketTime: number | null;
  series: Array<{ date: string; close: number }>;
}

async function fetchIndex(symbol: string, label: string): Promise<IndexQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
    const resp = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json' },
      next: { revalidate: 60 }, // 60s — fresh durante pregão sem estourar rate limit
    });
    if (!resp.ok) return null;
    const json = await resp.json() as {
      chart?: { result?: Array<{
        meta?: { regularMarketPrice?: number; chartPreviousClose?: number; previousClose?: number; regularMarketTime?: number };
        timestamp?: number[];
        indicators?: { quote?: Array<{ close?: (number | null)[] }> };
      }> };
    };
    const r = json.chart?.result?.[0];
    if (!r?.meta || typeof r.meta.regularMarketPrice !== 'number') return null;
    const closes = r.indicators?.quote?.[0]?.close ?? [];
    const ts = r.timestamp ?? [];
    const series: Array<{ date: string; close: number }> = [];
    for (let i = 0; i < closes.length; i++) {
      const c = closes[i];
      const t = ts[i];
      if (typeof c === 'number' && typeof t === 'number') {
        const d = new Date(t * 1000);
        series.push({
          date: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
          close: c,
        });
      }
    }
    const current = r.meta.regularMarketPrice;
    const prev = r.meta.chartPreviousClose ?? r.meta.previousClose ?? current;
    return {
      symbol,
      label,
      current,
      previousClose: prev,
      changePct: prev > 0 ? ((current - prev) / prev) * 100 : 0,
      marketTime: r.meta.regularMarketTime ?? null,
      series,
    };
  } catch {
    return null;
  }
}

export async function MarketIndexChart() {
  const [stockIndexes, cryptoIndexes] = await Promise.all([
    Promise.all([
      fetchIndex('^BVSP', 'Ibovespa'),
      fetchIndex('USDBRL=X', 'USD/BRL'),
      fetchIndex('SMAL11.SA', 'Small Caps (SMAL11)'),
    ]),
    Promise.all([
      fetchIndex('BTC-USD', 'Bitcoin (USD)'),
      fetchIndex('ETH-USD', 'Ethereum (USD)'),
      fetchIndex('SOL-USD', 'Solana (USD)'),
    ]),
  ]);
  const validStocks = stockIndexes.filter((i): i is IndexQuote => i !== null);
  const validCryptos = cryptoIndexes.filter((i): i is IndexQuote => i !== null);
  return (
    <>
      {validStocks.length > 0 && <IndexChartClient indexes={validStocks} />}
      {validCryptos.length > 0 && <IndexChartClient indexes={validCryptos} />}
    </>
  );
}
