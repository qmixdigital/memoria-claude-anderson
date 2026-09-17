import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface PriceAlertRow {
  id: number;
  ticker: string;
  kind: 'target_high' | 'stop_loss';
  targetPrice: number;
  notes: string | null;
  active: boolean;
  createdAt: Date;
  triggeredAt: Date | null;
  triggeredPrice: number | null;
  // Context: cotação atual
  currentPrice: number | null;
  changePct: number | null;
  // Distância pra alvo (% — negativo = ainda longe pra alvo de venda, positivo = passou)
  distancePct: number | null;
  companyName: string | null;
}

export async function getAllPriceAlerts(): Promise<PriceAlertRow[]> {
  const result = await db.execute(sql`
    select
      a.id,
      a.ticker,
      a.kind,
      a.target_price::numeric as target_price,
      a.notes,
      a.active,
      a.created_at,
      a.triggered_at,
      a.triggered_price::numeric as triggered_price,
      t.last_quote_brl::numeric as current_price,
      t.last_quote_change_pct::numeric as change_pct,
      c.name as company_name
    from qmix_invest.price_alerts a
    left join qmix_invest.tickers t on t.ticker = a.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    order by a.active desc, a.created_at desc
  `);

  return (result as unknown as Array<Record<string, unknown>>).map((r) => {
    const target = Number(r.target_price);
    const current = r.current_price ? Number(r.current_price) : null;
    const distancePct = current !== null && target > 0 ? ((current - target) / target) * 100 : null;

    return {
      id: Number(r.id),
      ticker: r.ticker as string,
      kind: r.kind as 'target_high' | 'stop_loss',
      targetPrice: target,
      notes: (r.notes as string | null) ?? null,
      active: r.active as boolean,
      createdAt: r.created_at as Date,
      triggeredAt: (r.triggered_at as Date | null) ?? null,
      triggeredPrice: r.triggered_price ? Number(r.triggered_price) : null,
      currentPrice: current,
      changePct: r.change_pct ? Number(r.change_pct) : null,
      distancePct,
      companyName: (r.company_name as string | null) ?? null,
    };
  });
}

export async function getActiveAlertsByTicker(ticker: string): Promise<PriceAlertRow[]> {
  const result = await db.execute(sql`
    select
      a.id, a.ticker, a.kind,
      a.target_price::numeric as target_price,
      a.notes, a.active, a.created_at,
      a.triggered_at,
      a.triggered_price::numeric as triggered_price,
      t.last_quote_brl::numeric as current_price,
      t.last_quote_change_pct::numeric as change_pct,
      c.name as company_name
    from qmix_invest.price_alerts a
    left join qmix_invest.tickers t on t.ticker = a.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    where a.ticker = ${ticker} and a.active = true
    order by a.created_at desc
  `);

  return (result as unknown as Array<Record<string, unknown>>).map((r) => {
    const target = Number(r.target_price);
    const current = r.current_price ? Number(r.current_price) : null;
    const distancePct = current !== null && target > 0 ? ((current - target) / target) * 100 : null;
    return {
      id: Number(r.id),
      ticker: r.ticker as string,
      kind: r.kind as 'target_high' | 'stop_loss',
      targetPrice: target,
      notes: (r.notes as string | null) ?? null,
      active: r.active as boolean,
      createdAt: r.created_at as Date,
      triggeredAt: (r.triggered_at as Date | null) ?? null,
      triggeredPrice: r.triggered_price ? Number(r.triggered_price) : null,
      currentPrice: current,
      changePct: r.change_pct ? Number(r.change_pct) : null,
      distancePct,
      companyName: (r.company_name as string | null) ?? null,
    };
  });
}

export async function countActiveAlerts(): Promise<{ active: number; triggered30d: number }> {
  const r = await db.execute(sql`
    select
      count(*) filter (where active = true)::int as active,
      count(*) filter (where active = false and triggered_at >= current_date - interval '30 days')::int as triggered30d
    from qmix_invest.price_alerts
  `);
  type Row = { active: number; triggered30d: number };
  const row = (r as unknown as Row[])[0];
  return {
    active: Number(row?.active) || 0,
    triggered30d: Number(row?.triggered30d) || 0,
  };
}
