import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface UpcomingProvento {
  id: number;
  ticker: string;
  companyName: string | null;
  eventType: string;
  productType: string | null;
  comDate: string | null;
  paymentDate: string | null;
  grossPerShareBrl: number | null;
  closePriceBrl: number | null;
  dyEventPct: number | null;
  inWatchlist: boolean;
  inPortfolio: boolean;
  qtyInPortfolio: number | null;
  expectedValueBrl: number | null;
  sourceUrl: string | null;
}

export async function getUpcomingProventos(limit = 100): Promise<UpcomingProvento[]> {
  const result = await db.execute(sql`
    select
      p.id,
      p.ticker,
      c.name as company_name,
      p.event_type,
      p.product_type,
      p.com_date::text,
      p.payment_date::text,
      p.gross_per_share_brl::numeric as gross,
      p.close_price_brl::numeric as close_price,
      p.dy_event_pct::numeric as dy,
      exists(select 1 from qmix_invest.user_portfolio w where w.ticker = p.ticker) as in_watchlist,
      p.in_portfolio,
      (
        select w.quantity from qmix_invest.user_portfolio w where w.ticker = p.ticker
      ) as qty_in_portfolio,
      p.source_url
    from qmix_invest.proventos p
    left join qmix_invest.tickers t on t.ticker = p.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    where p.payment_date is null or p.payment_date >= current_date - interval '7 days'
    order by p.payment_date asc nulls last
    limit ${limit}
  `);

  return (result as unknown as Record<string, unknown>[]).map((r) => {
    const qty = r.qty_in_portfolio ? Number(r.qty_in_portfolio) : null;
    const gross = r.gross ? Number(r.gross) : null;
    const expected = qty !== null && gross !== null ? qty * gross : null;
    return {
      id: Number(r.id),
      ticker: r.ticker as string,
      companyName: (r.company_name as string | null) ?? null,
      eventType: r.event_type as string,
      productType: (r.product_type as string | null) ?? null,
      comDate: (r.com_date as string | null) ?? null,
      paymentDate: (r.payment_date as string | null) ?? null,
      grossPerShareBrl: gross,
      closePriceBrl: r.close_price ? Number(r.close_price) : null,
      dyEventPct: r.dy ? Number(r.dy) : null,
      inWatchlist: r.in_watchlist as boolean,
      inPortfolio: r.in_portfolio as boolean,
      qtyInPortfolio: qty,
      expectedValueBrl: expected,
      sourceUrl: (r.source_url as string | null) ?? null,
    };
  });
}

export interface TopYieldRow {
  ticker: string;
  companyName: string | null;
  totalDyPct12m: number;
  numEvents12m: number;
  totalGrossPerShare: number;
  lastClose: number | null;
  inWatchlist: boolean;
  isMyPortfolio: boolean;
}

export async function getTopYield12m(limit = 25): Promise<TopYieldRow[]> {
  const result = await db.execute(sql`
    with last12 as (
      select
        ticker,
        sum(coalesce(gross_per_share_brl::numeric, 0)) as total_gross,
        sum(coalesce(dy_event_pct::numeric, 0)) as total_dy,
        count(*)::int as num_events
      from qmix_invest.proventos
      where com_date >= current_date - interval '12 months'
        and com_date <= current_date
      group by ticker
    )
    select
      l.ticker,
      c.name as company_name,
      l.total_gross::numeric as total_gross,
      l.total_dy::numeric as total_dy,
      l.num_events,
      t.last_quote_brl::numeric as last_close,
      exists(select 1 from qmix_invest.user_portfolio w where w.ticker = l.ticker) as in_watchlist,
      exists(select 1 from qmix_invest.user_portfolio w where w.ticker = l.ticker and w.notes like '%cotas%') as is_my_portfolio
    from last12 l
    left join qmix_invest.tickers t on t.ticker = l.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    where l.total_dy > 0
    order by l.total_dy desc
    limit ${limit}
  `);

  return (result as unknown as Record<string, unknown>[]).map((r) => ({
    ticker: r.ticker as string,
    companyName: (r.company_name as string | null) ?? null,
    totalDyPct12m: Number(r.total_dy),
    numEvents12m: Number(r.num_events),
    totalGrossPerShare: Number(r.total_gross),
    lastClose: r.last_close ? Number(r.last_close) : null,
    inWatchlist: r.in_watchlist as boolean,
    isMyPortfolio: r.is_my_portfolio as boolean,
  }));
}

export interface PortfolioYieldRow {
  ticker: string;
  companyName: string | null;
  qty: number;
  expectedNext30d: number;
  receivedLast12m: number;
  numEvents12m: number;
  lastClose: number | null;
  yieldOnCostPct: number | null;
}

export async function getPortfolioProventos(): Promise<PortfolioYieldRow[]> {
  const result = await db.execute(sql`
    with portfolio as (
      select
        w.ticker,
        w.quantity as qty,
        w.purchase_price_brl::numeric as purchase_price
      from qmix_invest.user_portfolio w
    ),
    next30 as (
      select ticker, sum(coalesce(gross_per_share_brl::numeric, 0)) as gross
      from qmix_invest.proventos
      where payment_date is not null
        and payment_date between current_date and current_date + interval '30 days'
      group by ticker
    ),
    last12 as (
      select ticker,
        sum(coalesce(gross_per_share_brl::numeric, 0)) as gross,
        count(*)::int as num_events
      from qmix_invest.proventos
      where com_date >= current_date - interval '12 months'
        and com_date <= current_date
      group by ticker
    )
    select
      p.ticker,
      c.name as company_name,
      p.qty,
      coalesce(n.gross, 0) as next30_gross,
      coalesce(l.gross, 0) as last12_gross,
      coalesce(l.num_events, 0) as num_events_12m,
      t.last_quote_brl::numeric as last_close,
      p.purchase_price
    from portfolio p
    left join qmix_invest.tickers t on t.ticker = p.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    left join next30 n on n.ticker = p.ticker
    left join last12 l on l.ticker = p.ticker
    where p.qty is not null and p.qty > 0
    order by coalesce(l.gross, 0) * p.qty desc
  `);

  return (result as unknown as Record<string, unknown>[]).map((r) => {
    const qty = Number(r.qty);
    const next30Gross = Number(r.next30_gross);
    const last12Gross = Number(r.last12_gross);
    const purchasePrice = r.purchase_price ? Number(r.purchase_price) : null;
    const yieldOnCost = purchasePrice && purchasePrice > 0
      ? (last12Gross / purchasePrice) * 100
      : null;
    return {
      ticker: r.ticker as string,
      companyName: (r.company_name as string | null) ?? null,
      qty,
      expectedNext30d: qty * next30Gross,
      receivedLast12m: qty * last12Gross,
      numEvents12m: Number(r.num_events_12m),
      lastClose: r.last_close ? Number(r.last_close) : null,
      yieldOnCostPct: yieldOnCost,
    };
  });
}

export interface ProventoAReceber {
  id: number;
  ticker: string;
  companyName: string | null;
  eventType: string;
  paymentDate: string | null;
  quantity: number;
  grossPerShareBrl: number | null;
  netValueBrl: number;
  inWatchlist: boolean;
}

export async function getProventosAReceber(): Promise<ProventoAReceber[]> {
  const result = await db.execute(sql`
    select p.id, p.ticker, p.event_type, p.payment_date::text,
      p.quantity, p.gross_per_share_brl::numeric as gross,
      p.net_value_brl::numeric as net, c.name as company_name,
      exists(select 1 from qmix_invest.user_portfolio w where w.ticker = p.ticker) as in_watchlist
    from qmix_invest.proventos_a_receber p
    left join qmix_invest.tickers t on t.ticker = p.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    order by p.payment_date asc nulls last, p.ticker
  `);
  return (result as unknown as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    ticker: r.ticker as string,
    companyName: (r.company_name as string | null) ?? null,
    eventType: r.event_type as string,
    paymentDate: (r.payment_date as string | null) ?? null,
    quantity: Number(r.quantity),
    grossPerShareBrl: r.gross ? Number(r.gross) : null,
    netValueBrl: Number(r.net),
    inWatchlist: r.in_watchlist as boolean,
  }));
}

export interface PayerRanking {
  ticker: string;
  companyName: string | null;
  totalNetReceived: number;
  numEvents: number;
  isMyPortfolio: boolean;
}

export async function getTopPayersOfMyPortfolio(): Promise<PayerRanking[]> {
  const result = await db.execute(sql`
    with combined as (
      -- Recebidos no calendário (passado, estimativa qty × R$/cota)
      select p.ticker, w.quantity * coalesce(p.gross_per_share_brl::numeric, 0) as net_value
      from qmix_invest.proventos p
      join qmix_invest.user_portfolio w on w.ticker = p.ticker
      where p.com_date is not null and p.com_date <= current_date
        and p.com_date >= current_date - interval '24 months'
        and w.quantity is not null
      union all
      -- A receber líquido (declarado)
      select pa.ticker, pa.net_value_brl::numeric as net_value
      from qmix_invest.proventos_a_receber pa
    )
    select
      cm.ticker,
      c.name as company_name,
      sum(cm.net_value)::numeric as total_net,
      count(*)::int as num_events,
      exists(select 1 from qmix_invest.user_portfolio w where w.ticker = cm.ticker) as is_my_portfolio
    from combined cm
    left join qmix_invest.tickers t on t.ticker = cm.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    where cm.net_value > 0
    group by cm.ticker, c.name
    order by total_net desc
    limit 20
  `);
  return (result as unknown as Record<string, unknown>[]).map((r) => ({
    ticker: r.ticker as string,
    companyName: (r.company_name as string | null) ?? null,
    totalNetReceived: Number(r.total_net),
    numEvents: Number(r.num_events),
    isMyPortfolio: r.is_my_portfolio as boolean,
  }));
}

export async function getProventosCount(): Promise<{ total: number; upcoming: number; carteira: number }> {
  const r = await db.execute(sql`
    select
      count(*)::int as total,
      count(*) filter (where payment_date >= current_date)::int as upcoming,
      count(*) filter (where ticker in (select ticker from qmix_invest.user_portfolio) and payment_date >= current_date)::int as carteira
    from qmix_invest.proventos
  `);
  type Row = { total: number; upcoming: number; carteira: number };
  const row = (r as unknown as Row[])[0];
  return {
    total: Number(row?.total) || 0,
    upcoming: Number(row?.upcoming) || 0,
    carteira: Number(row?.carteira) || 0,
  };
}
