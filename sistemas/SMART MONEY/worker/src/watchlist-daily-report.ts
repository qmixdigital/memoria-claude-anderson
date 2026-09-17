// Watchlist daily report — runs after market close (18h45 BRT, weekdays).
// Sends a consolidated Telegram message: per-ticker close, change, P/L, scores.

import { sql } from 'drizzle-orm';
import { db } from './db.js';
import { logger } from './logger.js';
import { sendTelegramMessage } from './telegram.js';

interface ReportRow {
  ticker: string;
  company_name: string | null;
  last_quote: number | null;
  change_pct: number | null;
  purchase_price: number | null;
  pnl_pct: number | null;
}

async function loadReport(): Promise<ReportRow[]> {
  const result = await db.execute(sql`
    select
      w.ticker,
      c.name as company_name,
      t.last_quote_brl::numeric as last_quote,
      t.last_quote_change_pct::numeric as change_pct,
      w.purchase_price_brl::numeric as purchase_price,
      case
        when w.purchase_price_brl is not null and w.purchase_price_brl > 0 and t.last_quote_brl is not null
          then ((t.last_quote_brl::numeric - w.purchase_price_brl::numeric) / w.purchase_price_brl::numeric) * 100
        else null
      end as pnl_pct
    from qmix_invest.user_portfolio w
    left join qmix_invest.tickers t on t.ticker = w.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    order by w.ticker
  `);

  return (result as unknown as Array<Record<string, unknown>>).map((r) => ({
    ticker: r.ticker as string,
    company_name: (r.company_name as string | null) ?? null,
    last_quote: r.last_quote ? Number(r.last_quote) : null,
    change_pct: r.change_pct ? Number(r.change_pct) : null,
    purchase_price: r.purchase_price ? Number(r.purchase_price) : null,
    pnl_pct: r.pnl_pct ? Number(r.pnl_pct) : null,
  }));
}

function fmt(v: number | null, digits = 2): string {
  if (v === null) return '—';
  return v.toFixed(digits);
}

function pct(v: number | null): string {
  if (v === null) return '—';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function arrow(v: number | null): string {
  if (v === null) return '·';
  if (v > 0) return '🟢';
  if (v < 0) return '🔴';
  return '⚪';
}

export async function buildAndSendWatchlistDailyReport(): Promise<{ rows: number }> {
  const log = logger.child({ job: 'watchlist-daily-report' });
  const rows = await loadReport();
  if (rows.length === 0) {
    log.info('watchlist empty, skipping daily report');
    return { rows: 0 };
  }

  const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const lines: string[] = [`📊 *Watchlist — fechamento ${today}*`, ''];

  // Per-ticker rows (compact: ticker · close · var · P/L)
  for (const r of rows) {
    const head = `${arrow(r.change_pct)} *${r.ticker}* R$ ${fmt(r.last_quote)} ${pct(r.change_pct)}`;
    const pnlPart = r.pnl_pct !== null ? ` · P/L ${pct(r.pnl_pct)}` : '';
    lines.push(`${head}${pnlPart}`);
  }

  // Highlights
  const movers = rows.filter((r) => r.change_pct !== null);
  if (movers.length > 0) {
    const topUp = [...movers].sort((a, b) => (b.change_pct ?? 0) - (a.change_pct ?? 0))[0]!;
    const topDown = [...movers].sort((a, b) => (a.change_pct ?? 0) - (b.change_pct ?? 0))[0]!;

    lines.push('');
    lines.push('🏆 *Destaques do dia*');
    lines.push(`• Maior alta: ${topUp.ticker} ${pct(topUp.change_pct)}`);
    lines.push(`• Maior baixa: ${topDown.ticker} ${pct(topDown.change_pct)}`);
  }

  // Carteira P/L (se houver preços de compra)
  const withPrice = rows.filter((r) => r.purchase_price !== null && r.last_quote !== null);
  if (withPrice.length > 0) {
    const avgPnl = withPrice.reduce((acc, r) => acc + (r.pnl_pct ?? 0), 0) / withPrice.length;
    lines.push('');
    lines.push(`💼 P/L médio (${withPrice.length} com preço informado): *${pct(avgPnl)}*`);
  }

  lines.push('');
  lines.push('_Detalhes em https://qf.qmix.digital/watchlist_');

  await sendTelegramMessage(lines.join('\n'));
  log.info({ rows: rows.length }, 'daily report sent');
  return { rows: rows.length };
}
