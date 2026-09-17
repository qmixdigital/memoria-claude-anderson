import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface WatchlistRow {
  ticker: string;
  addedAt: Date;
  notes: string | null;
  purchasePriceBrl: number | null;
  purchaseDate: string | null;
  quantity: number | null;
  companyName: string | null;
  isSmallCap: boolean;
  lastQuoteBrl: number | null;
  lastQuoteChangePct: number | null;
  lastQuoteAt: Date | null;
  lastQuoteVolume: number | null;
  // Computed
  pnlPct: number | null;
  pnlBrl: number | null;
  daysHeld: number | null;
  monthlyReturnPct: number | null;
  positionValueBrl: number | null;
}

export async function getWatchlistWithLatest(): Promise<WatchlistRow[]> {
  const result = await db.execute(sql`
    select
      w.ticker,
      w.added_at,
      w.notes,
      w.purchase_price_brl,
      w.purchase_date::text,
      w.quantity,
      c.name as company_name,
      coalesce(t.is_small_cap, false) as is_small_cap,
      t.last_quote_brl,
      t.last_quote_change_pct,
      t.last_quote_volume,
      t.last_quote_at,
      coalesce(
        t.last_quote_brl,
        (select close from qmix_invest.prices_daily p
          where p.ticker = w.ticker order by p.date desc limit 1)
      ) as effective_quote
    from qmix_invest.user_portfolio w
    left join qmix_invest.tickers t on t.ticker = w.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    order by w.added_at desc
  `);

  type Row = {
    ticker: string;
    added_at: Date;
    notes: string | null;
    purchase_price_brl: string | null;
    purchase_date: string | null;
    quantity: number | null;
    company_name: string | null;
    is_small_cap: boolean;
    last_quote_brl: string | null;
    last_quote_change_pct: string | null;
    last_quote_volume: string | null;
    last_quote_at: Date | null;
    effective_quote: string | null;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (result as unknown as Row[]).map((r) => {
    const purchase = r.purchase_price_brl ? Number(r.purchase_price_brl) : null;
    const effective = r.effective_quote ? Number(r.effective_quote) : null;
    const qty = r.quantity;

    const pnlPct = purchase !== null && effective !== null && purchase > 0
      ? ((effective - purchase) / purchase) * 100
      : null;
    const pnlBrl = purchase !== null && effective !== null && qty !== null
      ? (effective - purchase) * qty
      : null;
    const positionValue = effective !== null && qty !== null ? effective * qty : null;

    let daysHeld: number | null = null;
    let monthlyReturn: number | null = null;
    if (r.purchase_date) {
      const pd = new Date(r.purchase_date);
      const diffMs = today.getTime() - pd.getTime();
      daysHeld = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      if (pnlPct !== null && daysHeld > 0) {
        monthlyReturn = (pnlPct / daysHeld) * 30;
      }
    }

    return {
      ticker: r.ticker,
      addedAt: r.added_at,
      notes: r.notes,
      purchasePriceBrl: purchase,
      purchaseDate: r.purchase_date,
      quantity: qty,
      companyName: r.company_name,
      isSmallCap: r.is_small_cap,
      lastQuoteBrl: effective,
      lastQuoteChangePct: r.last_quote_change_pct ? Number(r.last_quote_change_pct) : null,
      lastQuoteAt: r.last_quote_at,
      lastQuoteVolume: r.last_quote_volume ? Number(r.last_quote_volume) : null,
      pnlPct,
      pnlBrl,
      daysHeld,
      monthlyReturnPct: monthlyReturn,
      positionValueBrl: positionValue,
    };
  });
}
