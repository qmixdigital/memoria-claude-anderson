// Alertas de oscilação de preço pra carteira + watchlist.
// Roda após cada quote-watchlist tick (5 min). Para cada ticker monitorado,
// checa se a variação intraday cruzou 3% (médio 🟡) ou 5% (forte 🔴) em
// qualquer direção. Anti-spam: 1 alerta por (ticker, direção, tier, dia).

import { sql } from 'drizzle-orm';
import { db } from './db.js';
import { logger } from './logger.js';
import { sendTelegramMessage } from './telegram.js';

const MEDIUM_THRESHOLD = 3; // 3% absoluto
const STRONG_THRESHOLD = 5; // 5% absoluto

type Direction = 'up' | 'down';
type Tier = 'medium' | 'strong';

interface MonitoredTicker {
  ticker: string;
  source: 'portfolio' | 'watchlist';
  last_quote: number;
  change_pct: number;
  // Portfolio context (null se for só watchlist)
  quantity: number | null;
  purchase_price: number | null;
  // Empresa
  company_name: string | null;
}

function tierFor(pct: number): Tier | null {
  const abs = Math.abs(pct);
  if (abs >= STRONG_THRESHOLD) return 'strong';
  if (abs >= MEDIUM_THRESHOLD) return 'medium';
  return null;
}

function fmtBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function fmtPct(v: number): string {
  const s = v > 0 ? '+' : '';
  return `${s}${v.toFixed(2)}%`;
}

function fmtNum(v: number): string {
  return new Intl.NumberFormat('pt-BR').format(v);
}

function buildMessage(t: MonitoredTicker, direction: Direction, tier: Tier): string {
  const up = direction === 'up';
  const strong = tier === 'strong';

  // Cabeçalho em linguagem simples: está subindo (valorizando) ou caindo (desvalorizando)
  const emoji = up ? '📈' : '📉';
  const titulo = up
    ? (strong ? 'está subindo FORTE hoje' : 'está subindo hoje')
    : (strong ? 'está caindo FORTE hoje' : 'está caindo hoje');

  const lines: string[] = [`${emoji} *${t.ticker} ${titulo}*`];

  if (t.company_name) {
    lines.push(`_${t.company_name}_`);
  }

  // Explicação do movimento do dia
  lines.push('');
  const movimento = up ? 'se valorizou' : 'se desvalorizou';
  lines.push(
    `A ação ${movimento} *${fmtPct(t.change_pct)}* hoje — agora cada cota custa *${fmtBRL(t.last_quote)}*.`
  );

  // Contexto de posição — em linguagem de lucro/prejuízo
  if (t.source === 'portfolio' && t.quantity !== null && t.purchase_price !== null) {
    const positionValue = t.quantity * t.last_quote;
    const investedValue = t.quantity * t.purchase_price;
    const pnl = positionValue - investedValue;
    const pnlPct = ((t.last_quote - t.purchase_price) / t.purchase_price) * 100;
    lines.push('');
    lines.push(
      `👜 Você tem ${fmtNum(t.quantity)} cotas (comprou a ${fmtBRL(t.purchase_price)} cada).`
    );
    if (pnl >= 0) {
      lines.push(
        `🟢 No total, você está com *lucro de ${fmtBRL(pnl)}* (${fmtPct(pnlPct)} sobre o que investiu).`
      );
    } else {
      lines.push(
        `🔴 No total, você está com *prejuízo de ${fmtBRL(Math.abs(pnl))}* (${fmtPct(pnlPct)} sobre o que investiu).`
      );
    }
  } else {
    lines.push('');
    lines.push('👀 _Você está só acompanhando essa ação (ainda não tem na carteira)._');
  }

  lines.push('');
  lines.push(`[Ver gráfico e detalhes](https://qf.qmix.digital/ativo/${t.ticker})`);

  return lines.join('\n');
}

export async function checkAndDispatchMovementAlerts(): Promise<{ checked: number; triggered: number }> {
  const log = logger.child({ job: 'check-movement-alerts' });

  // Pega todos os tickers da carteira + watchlist com cotação atualizada nos últimos 15 min
  const result = await db.execute(sql`
    with monitored as (
      select p.ticker, 'portfolio'::text as source,
        p.quantity, p.purchase_price_brl::numeric as purchase_price
      from qmix_invest.user_portfolio p
      union all
      select w.ticker, 'watchlist'::text as source,
        null::int as quantity, null::numeric as purchase_price
      from qmix_invest.user_watchlist w
      where not exists (select 1 from qmix_invest.user_portfolio p2 where p2.ticker = w.ticker)
    )
    select
      m.ticker,
      m.source,
      m.quantity,
      m.purchase_price,
      t.last_quote_brl::numeric as last_quote,
      t.last_quote_change_pct::numeric as change_pct,
      c.name as company_name
    from monitored m
    join qmix_invest.tickers t on t.ticker = m.ticker
    left join qmix_invest.companies c on c.cnpj = t.cnpj
    where t.last_quote_brl is not null
      and t.last_quote_change_pct is not null
      and t.last_quote_at >= now() - interval '15 minutes'
  `);

  const monitored = (result as unknown as Array<Record<string, unknown>>).map((r) => ({
    ticker: r.ticker as string,
    source: r.source as 'portfolio' | 'watchlist',
    last_quote: Number(r.last_quote),
    change_pct: Number(r.change_pct),
    quantity: r.quantity !== null && r.quantity !== undefined ? Number(r.quantity) : null,
    purchase_price: r.purchase_price !== null && r.purchase_price !== undefined ? Number(r.purchase_price) : null,
    company_name: (r.company_name as string | null) ?? null,
  })) as MonitoredTicker[];

  if (monitored.length === 0) return { checked: 0, triggered: 0 };

  let triggered = 0;
  for (const t of monitored) {
    const tier = tierFor(t.change_pct);
    if (!tier) continue;

    const direction: Direction = t.change_pct >= 0 ? 'up' : 'down';

    // Try to insert anti-spam record; ON CONFLICT = já disparado hoje, skip
    const insertResult = await db.execute(sql`
      insert into qmix_invest.movement_alerts_sent
        (ticker, direction, tier, alert_date, change_pct, quote_brl)
      values (${t.ticker}, ${direction}, ${tier}, current_date, ${t.change_pct}, ${t.last_quote})
      on conflict (ticker, direction, tier, alert_date) do nothing
      returning id
    `);

    const inserted = (insertResult as unknown as Array<{ id: number }>).length > 0;
    if (!inserted) continue; // já alertou hoje pra este tier/direção

    try {
      await sendTelegramMessage(buildMessage(t, direction, tier));
      triggered++;
      log.info({ ticker: t.ticker, direction, tier, changePct: t.change_pct }, 'movement alert sent');
    } catch (err) {
      log.error({ err, ticker: t.ticker }, 'failed to send movement alert');
    }
  }

  if (triggered > 0) {
    log.info({ checked: monitored.length, triggered }, 'movement alerts dispatched');
  }
  return { checked: monitored.length, triggered };
}
