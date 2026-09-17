import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// ──────────────────────────────────────────────────────────────────────
// Top intraday movers (up + down)
// ──────────────────────────────────────────────────────────────────────

export interface MoverRow {
  ticker: string;
  companyName: string | null;
  lastQuote: number;
  changePct: number;
  inWatchlist: boolean;
}

export async function getMovers(direction: 'up' | 'down', limit = 5): Promise<MoverRow[]> {
  const orderBy = direction === 'up'
    ? sql`t.last_quote_change_pct::numeric desc`
    : sql`t.last_quote_change_pct::numeric asc`;
  const filter = direction === 'up'
    ? sql`t.last_quote_change_pct::numeric > 0`
    : sql`t.last_quote_change_pct::numeric < 0`;

  const result = await db.execute(sql`
    select
      t.ticker,
      c.name as company_name,
      t.last_quote_brl::numeric as last_quote,
      t.last_quote_change_pct::numeric as change_pct,
      exists(select 1 from qmix_invest.user_portfolio w where w.ticker = t.ticker) as in_watchlist
    from qmix_invest.tickers t
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    where t.last_quote_change_pct is not null
      and t.last_quote_at >= current_date
      and ${filter}
    order by ${orderBy}
    limit ${limit}
  `);

  return (result as unknown as Record<string, unknown>[])
    .filter((r) => r.last_quote !== null)
    .map((r) => ({
      ticker: r.ticker as string,
      companyName: (r.company_name as string | null) ?? null,
      lastQuote: Number(r.last_quote),
      changePct: Number(r.change_pct),
      inWatchlist: r.in_watchlist as boolean,
    }));
}

// ──────────────────────────────────────────────────────────────────────
// Sector heatmap (média de variação por setor)
// ──────────────────────────────────────────────────────────────────────

export interface SectorRow {
  sector: string;
  tickerCount: number;
  avgChangePct: number;
  topUpTicker: string | null;
  topDownTicker: string | null;
}

export async function getSectorHeatmap(): Promise<SectorRow[]> {
  const result = await db.execute(sql`
    with sector_data as (
      select
        coalesce(c.sector, 'Sem classificação') as sector,
        t.ticker,
        t.last_quote_change_pct::numeric as change_pct
      from qmix_invest.tickers t
      left join qmix_invest.companies c on c.cnpj = t.cnpj
      where t.last_quote_change_pct is not null
        and t.last_quote_at >= current_date
    )
    select
      sector,
      count(*)::int as ticker_count,
      avg(change_pct)::numeric(8,3) as avg_change_pct,
      (array_agg(ticker order by change_pct desc))[1] as top_up_ticker,
      (array_agg(ticker order by change_pct asc))[1] as top_down_ticker
    from sector_data
    group by sector
    having count(*) >= 2
    order by avg(change_pct) desc
  `);

  return (result as unknown as Record<string, unknown>[]).map((r) => ({
    sector: r.sector as string,
    tickerCount: Number(r.ticker_count),
    avgChangePct: Number(r.avg_change_pct),
    topUpTicker: (r.top_up_ticker as string | null) ?? null,
    topDownTicker: (r.top_down_ticker as string | null) ?? null,
  }));
}
