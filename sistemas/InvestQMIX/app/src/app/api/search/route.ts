import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  if (q.length < 1) return NextResponse.json({ results: [] });

  const upperQ = q.toUpperCase();
  const lowerQ = q.toLowerCase();

  const result = await db.execute(sql`
    select
      t.ticker,
      c.name as company_name,
      t.class::text as class,
      coalesce(t.is_small_cap, false) as is_small_cap,
      t.last_quote_brl::numeric as last_quote,
      t.last_quote_change_pct::numeric as change_pct,
      exists(select 1 from qmix_invest.user_portfolio p where p.ticker = t.ticker) as in_portfolio,
      exists(select 1 from qmix_invest.user_watchlist w where w.ticker = t.ticker) as in_watchlist
    from qmix_invest.tickers t
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    where t.active = true
      and (
        t.ticker like ${upperQ + '%'}
        or t.ticker like ${'%' + upperQ + '%'}
        or lower(c.name) like ${'%' + lowerQ + '%'}
      )
    order by
      case when t.ticker = ${upperQ} then 0
           when t.ticker like ${upperQ + '%'} then 1
           when t.ticker like ${'%' + upperQ + '%'} then 2
           else 3 end,
      t.ticker
    limit 12
  `);

  const results = (result as unknown as Array<Record<string, unknown>>).map((r) => ({
    ticker: r.ticker as string,
    companyName: (r.company_name as string | null) ?? null,
    class: r.class as string,
    isSmallCap: r.is_small_cap as boolean,
    lastQuote: r.last_quote ? Number(r.last_quote) : null,
    changePct: r.change_pct ? Number(r.change_pct) : null,
    inPortfolio: r.in_portfolio as boolean,
    inWatchlist: r.in_watchlist as boolean,
  }));

  return NextResponse.json({ results });
}
