// Verifica alertas de preço ativos contra cotações atualizadas.
// Executa após cada quote-watchlist tick. Anti-spam: usa notified_at
// pra não disparar Telegram repetido em < 24h pro mesmo alerta.

import { sql } from 'drizzle-orm';
import { db } from './db.js';
import { logger } from './logger.js';
import { sendTelegramMessage } from './telegram.js';

interface ActiveAlert {
  id: number;
  ticker: string;
  kind: 'target_high' | 'stop_loss';
  target_price: number;
  current_quote: number;
  notes: string | null;
  notified_at: Date | null;
}

export async function checkAndDispatchPriceAlerts(): Promise<{ checked: number; triggered: number }> {
  const log = logger.child({ job: 'check-price-alerts' });

  const result = await db.execute(sql`
    select
      a.id,
      a.ticker,
      a.kind,
      a.target_price::numeric as target_price,
      t.last_quote_brl::numeric as current_quote,
      a.notes,
      a.notified_at
    from qmix_invest.price_alerts a
    join qmix_invest.tickers t on t.ticker = a.ticker
    where a.active = true
      and t.last_quote_brl is not null
      and t.last_quote_at >= now() - interval '15 minutes'
  `);

  const alerts = (result as unknown as Array<Record<string, unknown>>).map((r) => ({
    id: Number(r.id),
    ticker: r.ticker as string,
    kind: r.kind as 'target_high' | 'stop_loss',
    target_price: Number(r.target_price),
    current_quote: Number(r.current_quote),
    notes: (r.notes as string | null) ?? null,
    notified_at: (r.notified_at as Date | null) ?? null,
  })) as ActiveAlert[];

  if (alerts.length === 0) {
    return { checked: 0, triggered: 0 };
  }

  let triggered = 0;
  for (const a of alerts) {
    const isTriggered =
      (a.kind === 'target_high' && a.current_quote >= a.target_price) ||
      (a.kind === 'stop_loss' && a.current_quote <= a.target_price);

    if (!isTriggered) continue;

    // Anti-spam: se já notificou nas últimas 24h, não notifica de novo
    const recentlyNotified =
      a.notified_at && (Date.now() - new Date(a.notified_at).getTime()) < 24 * 60 * 60 * 1000;

    if (recentlyNotified) continue;

    triggered++;
    // target_high = preço de VENDA (subiu até o teto que você marcou pra vender)
    // stop_loss   = preço de COMPRA (caiu até o valor que você marcou pra comprar)
    const isVenda = a.kind === 'target_high';
    const emoji = isVenda ? '🎯' : '🛒';
    const titulo = isVenda
      ? `${a.ticker} subiu até o seu preço de VENDA!`
      : `${a.ticker} caiu até o seu preço de COMPRA!`;
    const explica = isVenda
      ? `A ação está cotando *R$ ${a.current_quote.toFixed(2)}* — chegou no valor de R$ ${a.target_price.toFixed(2)} que você marcou pra vender.`
      : `A ação está cotando *R$ ${a.current_quote.toFixed(2)}* — chegou no valor de R$ ${a.target_price.toFixed(2)} que você marcou pra comprar.`;
    const guidance = isVenda
      ? '💡 Pode ser um bom momento pra vender e garantir o lucro — avalie com calma.'
      : '💡 Pode ser uma boa oportunidade pra comprar — avalie com calma.';

    const text = [
      `${emoji} *${titulo}*`,
      ``,
      explica,
      ``,
      guidance,
      ``,
      `[Ver gráfico e detalhes](https://qf.qmix.digital/ativo/${a.ticker})`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await sendTelegramMessage(text);
      // Desativa o alerta + marca disparado
      await db.execute(sql`
        update qmix_invest.price_alerts
        set active = false,
            triggered_at = now(),
            triggered_price = ${a.current_quote},
            notified_at = now()
        where id = ${a.id}
      `);
      log.info({ alertId: a.id, ticker: a.ticker, kind: a.kind }, 'price alert triggered + notified');
    } catch (err) {
      log.error({ err, alertId: a.id }, 'failed to dispatch price alert');
    }
  }

  if (triggered > 0) {
    log.info({ checked: alerts.length, triggered }, 'price alerts dispatched');
  }
  return { checked: alerts.length, triggered };
}
