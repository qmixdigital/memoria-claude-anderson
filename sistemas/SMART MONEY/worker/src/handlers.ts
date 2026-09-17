import type PgBoss from 'pg-boss';
import { db } from './db.js';
import { logger } from './logger.js';
import { runScraper } from './scrapers/base.js';
import * as b3Prices from './scrapers/b3-prices.js';
import { refreshWatchlistQuotes } from './scrapers/quote-watchlist.js';
import { runWatchlistRealtimeAlerts } from './watchlist-alerts.js';
import { buildAndSendWatchlistDailyReport } from './watchlist-daily-report.js';
import { bootstrapAllTickers } from './scrapers/b3-tickers-bootstrap.js';
import { checkAndDispatchPriceAlerts } from './check-price-alerts.js';
import { checkAndDispatchMovementAlerts } from './check-movement-alerts.js';
import { runAlertaFimDeMes, runLembreteRecompra, runLembreteDarf } from './tax/alertas.js';

interface RegisteredScraper {
  scraper: { source: string; run: typeof b3Prices.scraper.run };
  schedule: string;
}

const SCRAPERS: RegisteredScraper[] = [
  { scraper: b3Prices.scraper, schedule: '30 21 * * 1-5' /* dia útil 21:30 UTC = 18:30 BRT */ },
];

export async function registerHandlers(boss: PgBoss): Promise<void> {
  for (const { scraper, schedule } of SCRAPERS) {
    const queueName = `scrape:${scraper.source}`;

    await boss.createQueue(queueName);
    await boss.work(queueName, { batchSize: 1 }, async (jobs) => {
      for (const _job of jobs) {
        await runScraper(scraper, { db, logger });
      }
    });

    await boss.schedule(queueName, schedule, undefined, { tz: 'UTC' });
    logger.info({ source: scraper.source, schedule }, 'scraper handler registered');
  }

  // Watchlist intraday quotes — every 5 min during BR market hours (10h-18h BRT = 13h-21h UTC, Mon-Fri)
  await boss.createQueue('quote-watchlist');
  await boss.work('quote-watchlist', { batchSize: 1 }, async (jobs) => {
    for (const job of jobs) {
      const data = (job.data ?? {}) as { tickers?: string[] };
      try {
        await refreshWatchlistQuotes(db, { tickers: data.tickers });
        // Trigger realtime alerts evaluation right after quote update
        await boss.send('watchlist-realtime-alerts', {});
        // Check user-defined price alerts (target/stop) — disparos diretos via Telegram
        await checkAndDispatchPriceAlerts();
        // Check movement alerts (oscilação ≥3% intraday) — anti-spam 1x/dia/tier/direção
        await checkAndDispatchMovementAlerts();
        // NOTA: alerta fiscal de oportunidade intraday DESATIVADO a pedido do usuário
        // (repetia a mesma ação todo dia). O resumo de fim de mês continua ativo.
      } catch (err) {
        logger.error({ err }, 'quote-watchlist failed');
      }
    }
  });
  await boss.schedule('quote-watchlist', '*/5 13-21 * * 1-5', undefined, { tz: 'UTC' });
  logger.info({ source: 'quote-watchlist', schedule: '*/5 13-21 * * 1-5' }, 'quote handler registered');

  // Watchlist realtime alerts — fired after each quote refresh
  await boss.createQueue('watchlist-realtime-alerts');
  await boss.work('watchlist-realtime-alerts', { batchSize: 1 }, async (_jobs) => {
    try {
      await runWatchlistRealtimeAlerts();
    } catch (err) {
      logger.error({ err }, 'watchlist-realtime-alerts failed');
    }
  });
  logger.info({ source: 'watchlist-realtime-alerts' }, 'watchlist alerts handler registered');

  // Bootstrap entire B3 universe from COTAHIST + Yahoo names
  // Schedule: 1st day of every month at 4h UTC (catches IPOs)
  await boss.createQueue('b3-tickers-bootstrap');
  await boss.work('b3-tickers-bootstrap', { batchSize: 1 }, async (_jobs) => {
    try {
      const stats = await bootstrapAllTickers(db);
      logger.info(stats, 'b3-tickers-bootstrap done');
    } catch (err) {
      logger.error({ err }, 'b3-tickers-bootstrap failed');
    }
  });
  await boss.schedule('b3-tickers-bootstrap', '0 4 1 * *', undefined, { tz: 'UTC' });
  logger.info({ source: 'b3-tickers-bootstrap', schedule: '0 4 1 * *' }, 'b3 bootstrap handler registered');

  // Watchlist daily report — 20:10 UTC = 17:10 BRT (logo após o fechamento da B3 às 17h)
  await boss.createQueue('watchlist-daily-report');
  await boss.work('watchlist-daily-report', { batchSize: 1 }, async (_jobs) => {
    try {
      // Atualiza as cotações de fechamento ANTES de montar o relatório,
      // pra garantir que ele sai com os preços finais do dia.
      await refreshWatchlistQuotes(db);
      await buildAndSendWatchlistDailyReport();
    } catch (err) {
      logger.error({ err }, 'watchlist-daily-report failed');
    }
  });
  await boss.schedule('watchlist-daily-report', '10 20 * * 1-5', undefined, { tz: 'UTC' });
  logger.info({ source: 'watchlist-daily-report', schedule: '10 20 * * 1-5' }, 'watchlist daily report registered');

  // Alerta fiscal de fim de mês — roda nos últimos dias úteis às 20:30 UTC (17:30 BRT);
  // o job só dispara de fato no penúltimo dia útil do mês (guard interno c/ feriados B3).
  await boss.createQueue('tax-fim-de-mes');
  await boss.work('tax-fim-de-mes', { batchSize: 1 }, async (_jobs) => {
    try {
      await runAlertaFimDeMes();
    } catch (err) {
      logger.error({ err }, 'tax-fim-de-mes failed');
    }
  });
  await boss.schedule('tax-fim-de-mes', '30 20 25-31 * 1-5', undefined, { tz: 'UTC' });
  logger.info({ source: 'tax-fim-de-mes', schedule: '30 20 25-31 * 1-5' }, 'tax month-end alert registered');

  // Lembrete de recompra — dias úteis às 16h UTC (13h BRT); guard interno checa o prazo.
  await boss.createQueue('tax-lembrete-recompra');
  await boss.work('tax-lembrete-recompra', { batchSize: 1 }, async (_jobs) => {
    try {
      await runLembreteRecompra();
    } catch (err) {
      logger.error({ err }, 'tax-lembrete-recompra failed');
    }
  });
  await boss.schedule('tax-lembrete-recompra', '0 16 * * 1-5', undefined, { tz: 'UTC' });
  logger.info({ source: 'tax-lembrete-recompra', schedule: '0 16 * * 1-5' }, 'tax repurchase reminder registered');

  // Lembrete de DARF — dias úteis perto do fim do mês às 13h UTC (10h BRT);
  // guard interno dispara só 3 dias úteis antes do vencimento.
  await boss.createQueue('tax-lembrete-darf');
  await boss.work('tax-lembrete-darf', { batchSize: 1 }, async (_jobs) => {
    try {
      await runLembreteDarf();
    } catch (err) {
      logger.error({ err }, 'tax-lembrete-darf failed');
    }
  });
  await boss.schedule('tax-lembrete-darf', '0 13 20-31 * 1-5', undefined, { tz: 'UTC' });
  logger.info({ source: 'tax-lembrete-darf', schedule: '0 13 20-31 * 1-5' }, 'tax DARF reminder registered');
}

export const REGISTERED_SCRAPERS = SCRAPERS;
