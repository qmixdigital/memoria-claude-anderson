import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const url = new URL(request.url);
  const range = url.searchParams.get('range') ?? '1y';
  const interval = url.searchParams.get('interval') ?? '1d';

  const symbol = `${ticker.toUpperCase()}.SA`;
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

  try {
    const resp = await fetch(yahooUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120',
        accept: 'application/json,*/*',
      },
      next: { revalidate: 300 },
    });
    if (!resp.ok) return NextResponse.json({ error: `yahoo ${resp.status}` }, { status: 502 });

    const json = (await resp.json()) as {
      chart?: {
        result?: Array<{
          meta?: { regularMarketPrice?: number; chartPreviousClose?: number; previousClose?: number };
          timestamp?: number[];
          indicators?: { quote?: Array<{ close?: (number | null)[]; volume?: (number | null)[] }> };
        }>;
      };
    };

    const r = json.chart?.result?.[0];
    if (!r?.meta || typeof r.meta.regularMarketPrice !== 'number') {
      return NextResponse.json({ error: 'sem dados' }, { status: 404 });
    }
    const closes = r.indicators?.quote?.[0]?.close ?? [];
    const volumes = r.indicators?.quote?.[0]?.volume ?? [];
    const ts = r.timestamp ?? [];

    const series: Array<{ date: string; close: number; volume: number | null }> = [];
    for (let i = 0; i < closes.length; i++) {
      const c = closes[i];
      const t = ts[i];
      const v = volumes[i];
      if (typeof c === 'number' && typeof t === 'number') {
        const d = new Date(t * 1000);
        series.push({
          date: d.toISOString().slice(0, 10),
          close: c,
          volume: typeof v === 'number' ? v : null,
        });
      }
    }

    return NextResponse.json({
      ticker,
      range,
      interval,
      currentPrice: r.meta.regularMarketPrice,
      previousClose: r.meta.chartPreviousClose ?? r.meta.previousClose ?? null,
      series,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
