// Real-time alerts for watchlist tickers — runs after every quote-watchlist tick.
// Anti-spam: 1 alert per ticker × type × date (UTC).

import { sql } from 'drizzle-orm';
import { db } from './db.js';
import { logger } from './logger.js';
import { sendTelegramMessage } from './telegram.js';

type AlertType =
  | 'big_move_up'       // variação intraday >= +5%
  | 'big_move_down'     // variação intraday <= -5%
  | 'gap_up'            // abertura > +3% vs fechamento anterior
  | 'gap_down'          // abertura < -3% vs fechamento anterior
  | 'ma200_break_up'    // cruzou MA200 pra cima (close ontem < MA200, hoje >)
  | 'ma200_break_down'; // cruzou MA200 pra baixo

interface AlertCandidate {
  ticker: string;
  type: AlertType;
  message: string;
  payload: Record<string, unknown>;
}

interface WatchlistTickerData {
  ticker: string;
  company_name: string | null;
  purchase_price: number | null;
  last_quote: number | null;
  change_pct: number | null;
  open: number | null;
  prev_close: number | null;
  ma200: number | null;
  ma200_yesterday: number | null;
  close_yesterday: number | null;
}

async function loadWatchlistData(): Promise<WatchlistTickerData[]> {
  const result = await db.execute(sql`
    with last_2_prices as (
      select ticker, date, close, open,
        row_number() over (partition by ticker order by date desc) as rn
      from qmix_invest.prices_daily
    ),
    ma200_2d as (
      select ticker, date, avg(close) over (
        partition by ticker order by date rows between 199 preceding and current row
      ) as ma200,
      row_number() over (partition by ticker order by date desc) as rn
      from qmix_invest.prices_daily
    )
    select
      w.ticker,
      c.name as company_name,
      w.purchase_price_brl::numeric as purchase_price,
      t.last_quote_brl::numeric as last_quote,
      t.last_quote_change_pct::numeric as change_pct,
      (select close from last_2_prices p where p.ticker = w.ticker and p.rn = 1) as close_yesterday,
      (select open from last_2_prices p where p.ticker = w.ticker and p.rn = 1) as open,
      (select close from last_2_prices p where p.ticker = w.ticker and p.rn = 2) as prev_close,
      (select ma200 from ma200_2d m where m.ticker = w.ticker and m.rn = 1) as ma200,
      (select ma200 from ma200_2d m where m.ticker = w.ticker and m.rn = 2) as ma200_yesterday
    from qmix_invest.user_portfolio w
    left join qmix_invest.tickers t on t.ticker = w.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
  `);

  return (result as unknown as Array<Record<string, unknown>>).map((r) => ({
    ticker: r.ticker as string,
    company_name: (r.company_name as string | null) ?? null,
    purchase_price: r.purchase_price ? Number(r.purchase_price) : null,
    last_quote: r.last_quote ? Number(r.last_quote) : null,
    change_pct: r.change_pct ? Number(r.change_pct) : null,
    open: r.open ? Number(r.open) : null,
    prev_close: r.prev_close ? Number(r.prev_close) : null,
    ma200: r.ma200 ? Number(r.ma200) : null,
    ma200_yesterday: r.ma200_yesterday ? Number(r.ma200_yesterday) : null,
    close_yesterday: r.close_yesterday ? Number(r.close_yesterday) : null,
  }));
}

function buildCandidates(d: WatchlistTickerData): AlertCandidate[] {
  const out: AlertCandidate[] = [];
  const tag = `*${d.ticker}*`;

  if (d.change_pct !== null && d.change_pct >= 5) {
    out.push({
      ticker: d.ticker,
      type: 'big_move_up',
      message: `📈 ${tag} subiu *${d.change_pct.toFixed(2)}%* hoje — uma alta forte e fora do comum.`,
      payload: { changePct: d.change_pct },
    });
  }
  if (d.change_pct !== null && d.change_pct <= -5) {
    out.push({
      ticker: d.ticker,
      type: 'big_move_down',
      message: `📉 ${tag} caiu *${d.change_pct.toFixed(2)}%* hoje — uma queda forte e fora do comum.`,
      payload: { changePct: d.change_pct },
    });
  }
  if (d.open !== null && d.prev_close !== null && d.prev_close > 0) {
    const gapPct = ((d.open - d.prev_close) / d.prev_close) * 100;
    if (gapPct >= 3) {
      out.push({
        ticker: d.ticker,
        type: 'gap_up',
        message: `📈 ${tag} já abriu o dia em alta de *+${gapPct.toFixed(2)}%* em relação a ontem (de R$ ${d.prev_close.toFixed(2)} para R$ ${d.open.toFixed(2)}).`,
        payload: { gapPct, open: d.open, prevClose: d.prev_close },
      });
    }
    if (gapPct <= -3) {
      out.push({
        ticker: d.ticker,
        type: 'gap_down',
        message: `📉 ${tag} já abriu o dia em queda de *${gapPct.toFixed(2)}%* em relação a ontem.`,
        payload: { gapPct },
      });
    }
  }
  if (
    d.close_yesterday !== null &&
    d.ma200 !== null &&
    d.ma200_yesterday !== null
  ) {
    const yesterdayBelow = d.close_yesterday < d.ma200_yesterday;
    const todayQuote = d.last_quote ?? d.close_yesterday;
    const todayAbove = todayQuote > d.ma200;
    if (yesterdayBelow && todayAbove) {
      out.push({
        ticker: d.ticker,
        type: 'ma200_break_up',
        message: `🚀 ${tag} entrou num bom momento: o preço (R$ ${todayQuote.toFixed(2)}) passou da média dos últimos meses (R$ ${d.ma200.toFixed(2)}) — costuma indicar tendência de alta.`,
        payload: { close: todayQuote, ma200: d.ma200 },
      });
    }
    if (!yesterdayBelow && !todayAbove) {
      out.push({
        ticker: d.ticker,
        type: 'ma200_break_down',
        message: `⚠️ ${tag} ligou um sinal de atenção: o preço (R$ ${todayQuote.toFixed(2)}) caiu abaixo da média dos últimos meses (R$ ${d.ma200.toFixed(2)}) — costuma indicar tendência de baixa.`,
        payload: { close: todayQuote, ma200: d.ma200 },
      });
    }
  }
  return out;
}

async function alreadySentToday(ticker: string, type: AlertType): Promise<boolean> {
  const result = await db.execute(sql`
    select 1 from qmix_invest.watchlist_alerts_sent
    where ticker = ${ticker} and alert_type = ${type} and sent_date = current_date
    limit 1
  `);
  return (result as unknown as unknown[]).length > 0;
}

async function recordSent(c: AlertCandidate): Promise<void> {
  await db.execute(sql`
    insert into qmix_invest.watchlist_alerts_sent (ticker, alert_type, payload_json)
    values (${c.ticker}, ${c.type}, ${JSON.stringify(c.payload)})
    on conflict (ticker, alert_type, sent_date) do nothing
  `);
}

export async function runWatchlistRealtimeAlerts(): Promise<{ checked: number; sent: number }> {
  const log = logger.child({ job: 'watchlist-realtime-alerts' });
  const data = await loadWatchlistData();
  if (data.length === 0) {
    log.info('watchlist empty');
    return { checked: 0, sent: 0 };
  }

  const fresh: AlertCandidate[] = [];
  for (const row of data) {
    const candidates = buildCandidates(row);
    for (const c of candidates) {
      if (await alreadySentToday(c.ticker, c.type)) continue;
      fresh.push(c);
    }
  }

  if (fresh.length === 0) {
    log.info({ checked: data.length }, 'no new alerts');
    return { checked: data.length, sent: 0 };
  }

  // Group all fresh alerts into one Telegram message
  const lines: string[] = ['⚡ *Movimentos das ações que você acompanha*'];
  for (const c of fresh) {
    lines.push(c.message);
    await recordSent(c);
  }
  lines.push('');
  lines.push(`_${new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })} BRT_`);

  await sendTelegramMessage(lines.join('\n'));
  log.info({ checked: data.length, sent: fresh.length }, 'alerts dispatched');
  return { checked: data.length, sent: fresh.length };
}
