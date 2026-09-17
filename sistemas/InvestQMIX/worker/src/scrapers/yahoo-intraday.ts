// Coletor de barras intradiarias (Yahoo Finance v8 chart, interval=5m).
//
// O Yahoo devolve ate ~60 dias de historico em 5 minutos. Rodar isto uma vez
// por dia mantem a tabela completa sem precisar capturar snapshot ao vivo de
// 5 em 5 minutos — que perderia qualquer barra em que o worker estivesse fora.
//
// Limitacoes assumidas, e que valem para ESTUDO e nao para execucao:
//  - dado atrasado e nao auditado pela B3;
//  - sem book, sem leilao de abertura e fechamento;
//  - barras de papel ilíquido vem esburacadas.

import { sql } from 'drizzle-orm';
import { fetchWithRetry } from './http.js';
import { logger } from '../logger.js';
import { db } from '../db.js';

const YAHOO_HEADERS: Record<string, string> = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  accept: 'application/json,*/*',
  'accept-language': 'en-US,en;q=0.9',
};

export interface BarraIntraday {
  ticker: string;
  ts: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface YahooChart {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
  };
}

export async function buscarIntraday(
  ticker: string,
  intervalo = '5m',
  range = '60d'
): Promise<BarraIntraday[]> {
  const symbol = `${ticker}.SA`;
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?range=${range}&interval=${intervalo}&includePrePost=false`;

  const resp = await fetchWithRetry(url, {
    timeoutMs: 20_000,
    retries: 2,
    headers: YAHOO_HEADERS,
  });
  if (resp.statusCode !== 200) return [];

  let json: YahooChart;
  try {
    json = JSON.parse(resp.body.toString('utf8')) as YahooChart;
  } catch {
    return [];
  }

  const r = json.chart?.result?.[0];
  const ts = r?.timestamp;
  const q = r?.indicators?.quote?.[0];
  if (!ts || !q) return [];

  const barras: BarraIntraday[] = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const c = q.close?.[i];
    // Barra sem negocio vem com null. Descartar em vez de repetir o ultimo
    // preco: inventar liquidez que nao houve e o jeito mais facil de um
    // backtest de day trade executar ordens impossiveis.
    if (o == null || h == null || l == null || c == null) continue;
    if (!(o > 0 && h > 0 && l > 0 && c > 0)) continue;

    barras.push({
      ticker,
      ts: new Date(ts[i]! * 1000),
      open: o,
      high: h,
      low: l,
      close: c,
      volume: q.volume?.[i] ?? 0,
    });
  }
  return barras;
}

async function gravar(barras: BarraIntraday[], intervalo: string): Promise<number> {
  if (barras.length === 0) return 0;
  let gravadas = 0;
  const LOTE = 500;

  for (let i = 0; i < barras.length; i += LOTE) {
    const lote = barras.slice(i, i + LOTE);
    const values = lote
      .map(
        (b) =>
          `('${b.ticker}', to_timestamp(${Math.floor(b.ts.getTime() / 1000)}), '${intervalo}',` +
          ` ${b.open}, ${b.high}, ${b.low}, ${b.close}, ${Math.round(b.volume)}, 'yahoo')`
      )
      .join(',');

    await db.execute(
      sql.raw(`
        insert into qmix_invest.prices_intraday
          (ticker, ts, intervalo, open, high, low, close, volume, fonte)
        values ${values}
        on conflict (ticker, ts, intervalo) do update set
          open = excluded.open, high = excluded.high,
          low = excluded.low, close = excluded.close,
          volume = excluded.volume
      `)
    );
    gravadas += lote.length;
  }
  return gravadas;
}

/** Universo intradiario ativo; cai para a watchlist se a tabela estiver vazia. */
export async function universoIntraday(): Promise<string[]> {
  const rows = (await db.execute(sql`
    select ticker from qmix_invest.paper_universo_intraday where ativo = true order by ticker
  `)) as unknown as Array<{ ticker: string }>;
  if (rows.length > 0) return rows.map((r) => r.ticker);

  const fallback = (await db.execute(sql`
    select ticker from qmix_invest.user_watchlist
    union select ticker from qmix_invest.user_portfolio
    order by 1
  `)) as unknown as Array<{ ticker: string }>;
  return fallback.map((r) => r.ticker);
}

export async function coletarIntraday(
  tickers?: string[],
  intervalo = '5m'
): Promise<{ tickers: number; barras: number; falhas: number }> {
  const log = logger.child({ job: 'yahoo-intraday' });
  const universo = tickers ?? (await universoIntraday());
  if (universo.length === 0) {
    log.warn('universo intradiario vazio, nada a coletar');
    return { tickers: 0, barras: 0, falhas: 0 };
  }

  let barras = 0;
  let falhas = 0;

  for (const t of universo) {
    try {
      const bs = await buscarIntraday(t, intervalo);
      if (bs.length === 0) {
        falhas++;
        log.warn({ ticker: t }, 'sem barras intradiarias');
        continue;
      }
      barras += await gravar(bs, intervalo);
    } catch (err) {
      falhas++;
      log.error({ err, ticker: t }, 'falha ao coletar intraday');
    }
    // O Yahoo nao publica limite, mas responde com 429 sob rajada.
    await new Promise((r) => setTimeout(r, 400));
  }

  log.info({ tickers: universo.length, barras, falhas }, 'coleta intradiaria concluida');
  return { tickers: universo.length, barras, falhas };
}
