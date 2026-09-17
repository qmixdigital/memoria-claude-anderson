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
import { executarPedido, registrarFalha, type PedidoBacktest } from './paper/job.js';
import { rodarDespertar, type Slot } from './paper/agente-live.js';
import { cicloLive } from './paper/live.js';
import { runAlertaFimDeMes, runLembreteRecompra, runLembreteDarf } from './tax/alertas.js';
import { runAlertaJanelaFiscal } from './tax/alerta-janela.js';

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
        // Ordem do robo executa contra a cotacao que acabou de chegar.
        await cicloLive();
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

  // Janela fiscal: avisa quando da pra realizar lucro sem imposto, ou quando
  // vender no prejuizo queimaria o prejuizo por o mes ficar isento. Segunda e
  // quinta as 20h UTC (17h BRT), depois do fechamento. O proprio job so manda
  // mensagem se houver acao possivel — alerta que chega dizendo "nada a fazer"
  // treina a ignorar o alerta, e ai o dia que importa passa batido.
  await boss.createQueue('tax-janela-fiscal');
  await boss.work('tax-janela-fiscal', { batchSize: 1 }, async (_jobs) => {
    try {
      await runAlertaJanelaFiscal();
    } catch (err) {
      logger.error({ err }, 'tax-janela-fiscal failed');
    }
  });
  await boss.schedule('tax-janela-fiscal', '0 20 * * 1,4', undefined, { tz: 'UTC' });
  logger.info({ source: 'tax-janela-fiscal', schedule: '0 20 * * 1,4' }, 'alerta de janela fiscal registrado');

  // Simulador: a tela enfileira o pedido e o worker roda. Backtest de 5 anos
  // sobre dezenas de papeis passa do timeout confortavel de uma requisicao.
  await boss.createQueue('paper-backtest');
  await boss.work('paper-backtest', { batchSize: 1 }, async (jobs) => {
    for (const job of jobs) {
      const pedido = (job.data ?? {}) as PedidoBacktest;
      if (!pedido.tickers?.length || !pedido.inicio || !pedido.fim) {
        logger.warn({ pedido }, 'paper-backtest: pedido incompleto, ignorando');
        continue;
      }
      try {
        await executarPedido(pedido);
      } catch (err) {
        logger.error({ err, pedido }, 'paper-backtest falhou');
        await registrarFalha(pedido, err instanceof Error ? err.message : String(err));
      }
    }
  });
  logger.info({ source: 'paper-backtest' }, 'paper backtest handler registered');

  // Coleta intradiaria: sem ela o backtest de day trade nao tem dado. Roda
  // depois do fechamento, quando as barras do dia ja estao consolidadas.
  await boss.createQueue('paper-coletar-intraday');
  await boss.work('paper-coletar-intraday', { batchSize: 1 }, async (_jobs) => {
    try {
      const { coletarIntraday } = await import('./scrapers/yahoo-intraday.js');
      const r = await coletarIntraday();
      logger.info(r, 'coleta intradiaria concluida');
    } catch (err) {
      logger.error({ err }, 'paper-coletar-intraday falhou');
    }
  });
  await boss.schedule('paper-coletar-intraday', '0 22 * * 1-5', undefined, { tz: 'UTC' });
  logger.info({ source: 'paper-coletar-intraday' }, 'coleta intradiaria registrada');

  // Robo de IA: seis despertares por pregao, espelhando o ritmo de um operador.
  // Horarios em UTC; a B3 abre 10h e fecha 17h BRT (13h-20h UTC).
  const DESPERTARES: Array<{ slot: Slot; cron: string }> = [
    { slot: 'pre-abertura',   cron: '30 12 * * 1-5' }, //  9:30 BRT
    { slot: 'abertura',       cron: '15 13 * * 1-5' }, // 10:15 BRT
    { slot: 'meio-pregao',    cron: '0 15 * * 1-5'  }, // 12:00 BRT
    { slot: 'revisao',        cron: '30 17 * * 1-5' }, // 14:30 BRT
    { slot: 'pre-fechamento', cron: '30 19 * * 1-5' }, // 16:30 BRT
    { slot: 'pos-fechamento', cron: '30 20 * * 1-5' }, // 17:30 BRT
  ];

  for (const { slot, cron } of DESPERTARES) {
    const fila = `robo-ia-${slot}`;
    await boss.createQueue(fila);
    await boss.work(fila, { batchSize: 1 }, async (_jobs) => {
      try {
        await rodarDespertar(slot);
      } catch (err) {
        logger.error({ err, slot }, 'despertar do robo falhou');
      }
    });
    await boss.schedule(fila, cron, undefined, { tz: 'UTC' });
  }
  logger.info({ despertares: DESPERTARES.length }, 'robo de IA registrado');

  // Agente de pesquisa: propoe hipoteses, o worker executa os backtests de
  // verdade e o modelo interpreta os resultados REAIS. Ele nunca produz metrica.
  // Sabado as 12h UTC (9h BRT): mercado fechado, dado do fim de semana estavel,
  // e uma rodada por semana e suficiente pra estudo sem virar gasto recorrente.
  await boss.createQueue('paper-agente-pesquisa');
  await boss.work('paper-agente-pesquisa', { batchSize: 1 }, async (_jobs) => {
    try {
      const { rodarAgentePesquisa } = await import('./paper/agente.js');
      const r = await rodarAgentePesquisa();
      logger.info(r, 'agente de pesquisa concluido');
    } catch (err) {
      logger.error({ err }, 'paper-agente-pesquisa falhou');
    }
  });
  await boss.schedule('paper-agente-pesquisa', '0 12 * * 6', undefined, { tz: 'UTC' });
  logger.info({ source: 'paper-agente-pesquisa', schedule: '0 12 * * 6' }, 'agente de pesquisa registrado');
}

export const REGISTERED_SCRAPERS = SCRAPERS;
