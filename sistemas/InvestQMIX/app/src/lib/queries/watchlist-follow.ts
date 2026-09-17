import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export interface WatchlistFollowItem {
  ticker: string;
  companyName: string | null;
  className: string;
  isSmallCap: boolean;
  lastQuote: number | null;
  changePct: number | null;
  lastQuoteAt: string | null;
  addedAt: string;
  series30d: Array<{ date: string; close: number }>;
}

// Lista todos os tickers em observação com sparkline 30d.
// Usa um único query: LEFT JOIN tickers + agregação de prices_daily como JSON.
export async function getWatchlistFollow(): Promise<WatchlistFollowItem[]> {
  const result = await db.execute(sql`
    select
      w.ticker,
      w.added_at,
      c.name as company_name,
      t.class::text as class_name,
      coalesce(t.is_small_cap, false) as is_small_cap,
      t.last_quote_brl::numeric as last_quote,
      t.last_quote_change_pct::numeric as change_pct,
      t.last_quote_at,
      coalesce(
        (
          select json_agg(json_build_object('date', p.date, 'close', p.close::numeric) order by p.date)
          from qmix_invest.prices_daily p
          where p.ticker = w.ticker and p.date >= current_date - interval '45 days'
        ),
        '[]'::json
      ) as series30d
    from qmix_invest.user_watchlist w
    left join qmix_invest.tickers t on t.ticker = w.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    order by w.added_at desc
  `);

  const rows = result as unknown as Array<{
    ticker: string;
    added_at: string;
    company_name: string | null;
    class_name: string;
    is_small_cap: boolean;
    last_quote: string | null;
    change_pct: string | null;
    last_quote_at: string | null;
    series30d: Array<{ date: string; close: string | number }>;
  }>;

  return rows.map((r) => ({
    ticker: r.ticker,
    companyName: r.company_name,
    className: r.class_name,
    isSmallCap: r.is_small_cap,
    lastQuote: r.last_quote ? Number(r.last_quote) : null,
    changePct: r.change_pct ? Number(r.change_pct) : null,
    lastQuoteAt: r.last_quote_at,
    addedAt: r.added_at,
    series30d: r.series30d.map((s) => ({ date: s.date, close: Number(s.close) })).slice(-30),
  }));
}
