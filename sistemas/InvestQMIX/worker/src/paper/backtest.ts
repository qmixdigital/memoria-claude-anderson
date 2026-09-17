import Decimal from 'decimal.js';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { logger } from '../logger.js';
import {
  executarOrdem,
  aplicarFill,
  patrimonio,
} from '@qmix-invest/db/paper/execucao';
import {
  calcularMetricas,
  type Metricas,
  type PontoEquity,
  type TradeFechado,
} from '@qmix-invest/db/paper/metricas';
import {
  CUSTOS_PADRAO,
  type Bar,
  type CustosConfig,
  type EstadoConta,
} from '@qmix-invest/db/paper/types';
import type { Estrategia } from './estrategia.js';
import { apurarImpostoSwing, type ResumoImpostoSwing, type VendaBacktest } from './imposto-swing.js';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = D(0);

export interface OpcoesBacktest {
  estrategia: Estrategia;
  inicio: string; // YYYY-MM-DD
  fim: string;
  caixaInicial?: number;
  custos?: CustosConfig;
  /** Grava a conta e os fills no banco. Falso = so devolve o resultado. */
  persistir?: boolean;
  nome?: string;
}

export interface ResultadoBacktest {
  accountId: number | null;
  estrategia: string;
  inicio: string;
  fim: string;
  pregoes: number;
  metricas: Metricas | null;
  serie: PontoEquity[];
  trades: TradeFechado[];
  ordensRejeitadas: Record<string, number>;
  custoTotal: Decimal;
  /** IR de swing: 15% com a isencao de R$20 mil por mes. */
  imposto: ResumoImpostoSwing;
  /** Resultado depois de custo E imposto — o unico numero que importa. */
  resultadoLiquido: Decimal;
  /** Quanto do resultado bruto foi consumido por custo de transacao. */
  custoSobrePatrimonioPct: Decimal;
}

interface LinhaPreco {
  ticker: string;
  data: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  financeiro: string;
}

/** Carrega as barras do periodo, uma vez, para o universo pedido. */
async function carregarBarras(
  tickers: string[],
  inicio: string,
  fim: string
): Promise<Map<string, Bar[]>> {
  const rows = (await db.execute(sql`
    select ticker, date::text as data,
           open::text, high::text, low::text, close::text,
           volume::text, financial_volume_brl::text as financeiro
      from qmix_invest.prices_daily
     where date >= ${inicio}::date and date <= ${fim}::date
       and ticker = any(${sql.raw(`array[${tickers.map((t) => `'${t.replace(/'/g, "''")}'`).join(',')}]`)})
     order by ticker, date
  `)) as unknown as LinhaPreco[];

  const porTicker = new Map<string, Bar[]>();
  for (const r of rows) {
    const barra: Bar = {
      ticker: r.ticker,
      date: r.data,
      open: D(r.open),
      high: D(r.high),
      low: D(r.low),
      close: D(r.close),
      volume: Number(r.volume),
      financeiro: D(r.financeiro),
    };
    const lista = porTicker.get(r.ticker);
    if (lista) lista.push(barra);
    else porTicker.set(r.ticker, [barra]);
  }
  return porTicker;
}

/**
 * Roda a estrategia pregao a pregao.
 *
 * O ciclo de um dia e deliberadamente nesta ordem: a estrategia decide olhando
 * SO o passado, as ordens executam na abertura de hoje, e o patrimonio e
 * marcado no fechamento de hoje. Decidir com o fechamento do proprio dia e o
 * atalho que transforma qualquer estrategia em maquina de dinheiro no papel.
 */
export async function rodarBacktest(opts: OpcoesBacktest): Promise<ResultadoBacktest> {
  const { estrategia, inicio, fim } = opts;
  const custos = opts.custos ?? CUSTOS_PADRAO;
  const caixaInicial = D(opts.caixaInicial ?? 100000);
  const log = logger.child({ backtest: estrategia.chave });

  const universo = estrategia.universo ?? [];
  if (universo.length === 0) throw new Error('estrategia precisa declarar universo');

  const barrasPorTicker = await carregarBarras(universo, inicio, fim);
  if (barrasPorTicker.size === 0) {
    throw new Error(`sem dados de preco para ${universo.join(', ')} no periodo`);
  }

  // Calendario: uniao das datas de todos os papeis, em ordem.
  const datas = [
    ...new Set([...barrasPorTicker.values()].flatMap((bs) => bs.map((b) => b.date))),
  ].sort();

  // Indice por (ticker, data) e posicao para o historico
  const indice = new Map<string, Map<string, number>>();
  for (const [t, bs] of barrasPorTicker) {
    const m = new Map<string, number>();
    bs.forEach((b, i) => m.set(b.date, i));
    indice.set(t, m);
  }

  const classesRows = (await db.execute(sql.raw(`
    select ticker, coalesce(asset_class, 'acao') as classe
      from qmix_invest.tickers
     where ticker in (${universo.map((t) => `'${t.replace(/'/g, "''")}'`).join(',')})
  `))) as unknown as Array<{ ticker: string; classe: string }>;
  const classes = new Map(
    classesRows.map((r) => [r.ticker, r.classe as VendaBacktest['assetClass']])
  );

  let estado: EstadoConta = { caixa: caixaInicial, posicoes: new Map() };
  const serie: PontoEquity[] = [];
  const trades: TradeFechado[] = [];
  const vendas: VendaBacktest[] = [];
  const entradas = new Map<string, string>(); // ticker -> data da 1a compra aberta
  const rejeicoes: Record<string, number> = {};
  let custoTotal = ZERO;

  for (const data of datas) {
    const barrasHoje = new Map<string, Bar>();
    const fechamentoAnterior = new Map<string, Decimal>();

    for (const [t, bs] of barrasPorTicker) {
      const i = indice.get(t)!.get(data);
      if (i === undefined) continue;
      barrasHoje.set(t, bs[i]!);
      if (i > 0) fechamentoAnterior.set(t, bs[i - 1]!.close);
    }

    const historico = (ticker: string, n: number): Bar[] => {
      const bs = barrasPorTicker.get(ticker);
      const i = indice.get(ticker)?.get(data);
      if (!bs || i === undefined) return [];
      return bs.slice(Math.max(0, i - n), i); // exclui o dia corrente
    };

    const ordens = estrategia.decidir({
      data,
      barras: barrasHoje,
      historico,
      estado,
      precos: fechamentoAnterior,
      universo,
    });

    for (const ordem of ordens) {
      const barra = barrasHoje.get(ordem.ticker) ?? null;
      const { fill, rejeicao } = executarOrdem(ordem, barra, estado, custos);
      if (rejeicao) {
        rejeicoes[rejeicao] = (rejeicoes[rejeicao] ?? 0) + 1;
        continue;
      }
      if (!fill) continue;

      if (fill.side === 'sell') {
        const pos = estado.posicoes.get(fill.ticker);
        if (pos) {
          const bruto = fill.caixaDelta;
          const custo = pos.precoMedio.times(fill.quantidade);
          trades.push({
            ticker: fill.ticker,
            dataEntrada: entradas.get(fill.ticker) ?? data,
            dataSaida: data,
            lucro: bruto.minus(custo),
          });
          vendas.push({
            data,
            ticker: fill.ticker,
            quantidade: fill.quantidade,
            bruto,
            custo,
            assetClass: classes.get(fill.ticker) ?? 'acao',
          });
          if (pos.quantidade === fill.quantidade) entradas.delete(fill.ticker);
        }
      } else if (!estado.posicoes.has(fill.ticker)) {
        entradas.set(fill.ticker, data);
      }

      custoTotal = custoTotal.plus(fill.emolumentos).plus(fill.corretagem);
      estado = aplicarFill(estado, fill);
    }

    // Marcacao a mercado no fechamento do dia
    const precosFech = new Map<string, Decimal>();
    for (const [t, b] of barrasHoje) precosFech.set(t, b.close);
    for (const p of estado.posicoes.values()) {
      if (!precosFech.has(p.ticker)) {
        const bs = barrasPorTicker.get(p.ticker);
        const anterior = bs?.filter((b) => b.date < data).at(-1);
        if (anterior) precosFech.set(p.ticker, anterior.close);
      }
    }
    serie.push({ data, patrimonio: patrimonio(estado, precosFech).total });
  }

  const metricas = calcularMetricas(serie, trades);
  const patrimonioFinal = serie.at(-1)?.patrimonio ?? caixaInicial;
  const imposto = apurarImpostoSwing(vendas);

  log.info(
    {
      pregoes: datas.length,
      trades: trades.length,
      retorno: metricas?.retornoPct?.toString(),
      maxDd: metricas?.maxDrawdownPct?.toString(),
    },
    'backtest concluido'
  );

  return {
    accountId: null,
    estrategia: estrategia.chave,
    inicio,
    fim,
    pregoes: datas.length,
    metricas,
    serie,
    trades,
    ordensRejeitadas: rejeicoes,
    custoTotal: custoTotal.toDecimalPlaces(2),
    custoSobrePatrimonioPct: patrimonioFinal.gt(0)
      ? custoTotal.div(patrimonioFinal).times(100).toDecimalPlaces(3)
      : ZERO,
    imposto,
    resultadoLiquido: patrimonioFinal
      .minus(caixaInicial)
      .minus(imposto.impostoTotal)
      .toDecimalPlaces(2),
  };
}
