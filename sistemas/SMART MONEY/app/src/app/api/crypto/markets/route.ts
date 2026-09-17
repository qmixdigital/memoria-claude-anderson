import { NextResponse } from 'next/server';

export const revalidate = 120; // 2 min cache

export async function GET() {
  const url = 'https://api.coingecko.com/api/v3/coins/markets'
    + '?vs_currency=brl'
    + '&order=market_cap_desc'
    + '&per_page=30'
    + '&page=1'
    + '&sparkline=true'
    + '&price_change_percentage=24h,7d,30d';
  try {
    const resp = await fetch(url, {
      headers: { accept: 'application/json' },
      next: { revalidate: 120 },
    });
    if (!resp.ok) {
      return NextResponse.json({ error: `coingecko ${resp.status}` }, { status: 502 });
    }
    const data = await resp.json();
    return NextResponse.json({ coins: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
