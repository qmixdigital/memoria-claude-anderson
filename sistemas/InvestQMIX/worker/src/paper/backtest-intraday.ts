import Decimal from 'decimal.js';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { logger } from '../logger.js';
import { executarOrdem, aplicarFill, patrimonio } from '@qmix-invest/db/paper/execucao';
import {
  calcularMetricas,
  type Metricas,
  type PontoEquity,
  type TradeFechado,
} from '@qmix-invest/db/paper/metricas';
import {
  apurarSerieDayTrade,
  type ApuracaoDayTrade,
  type OperacaoDayTrade,
} from '@qmix-invest/db/paper/imposto-daytrade';
import {
  CUSTOS_PADRAO,
  type Bar,
  type CustosConfig,
  type EstadoConta,
  type Ordem,
} from '@qmix-invest/db/paper/types';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = D(0);

/** O que a estrategia intradiaria enxerga numa barra de 5 minutos. */
export interface ContextoIntraday {
  /** Data do pregao, YYYY-MM-DD. */
  dia: string;
  /** Hora local da barra corrente, HH:MM. */
  hora: string;
  /** Barra corrente por ticker. A ordem executa na ABERTURA da PROXIMA barra. */
  barras: Map<string, Bar>;
  /** Barras de HOJE anteriores a corrente. Nunca inclui a corrente nem futuras. */
  hoje(ticker: string): Bar[];
  estado: EstadoConta;
  /** Minutos restantes ate o fechamento compulsorio. */
  minutosAteFechar: number;
}

export interface EstrategiaIntraday {
  chave: string;
  descricao: string;
  universo: string[];
  decidir(ctx: ContextoIntraday): Ordem[];
}

export interface OpcoesBacktestIntraday {
  estrategia: EstrategiaIntraday;
  inicio: string;
  fim: string;
  caixaInicial?: number;
  custos?: CustosConfig;
  /** Hora local a partir da qual tudo e zerado. Depois disto vira swing. */
  horaFechamento?: string;
}

export interface ResultadoIntraday {
  estrategia: string;
  inicio: string;
  fim: string;
  pregoes: number;
  barras: number;
  metricas: Metricas | null;
  serie: PontoEquity[];
  trades: TradeFechado[];
  rejeicoes: Record<string, number>;
  custoTotal: Decimal;
  /** Apuracao de IR de day trade, mes a mes. */
  imposto: ApuracaoDayTrade[];
  impostoTotal: Decimal;
  /** Resultado depois de custo E imposto — o unico numero que importa. */
  resultadoLiquido: Decimal;
  fechamentosForcados: number;
}

interface LinhaIntraday {
  ticker: string;
  dia: string;
  hora: string;
  ts: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

/**
 * Backtest de day trade sobre barras de 5 minutos.
 *
 * Duas regras que definem o regime, e que sao onde simulador caseiro erra:
 *
 * 1. A ordem decidida na barra N executa na ABERTURA da barra N+1. Executar na
 *    mesma barra que gerou o sinal e olhar o futuro: o preco que disparou a
 *    decisao ja passou.
 * 2. Toda posicao e zerada antes do fim do pregao. Sem isso vira swing, muda o
 *    regime tributario e o resultado deixa de ser comparavel.
 */
export async function rodarBacktestIntraday(
  opts: OpcoesBacktestIntraday
): Promise<ResultadoIntraday> {
  const { estrategia, inicio, fim } = opts;
  const custos = opts.custos ?? CUSTOS_PADRAO;
  const horaFechamento = opts.horaFechamento ?? '16:40';
  const caixaInicial = D(opts.caixaInicial ?? 100000);
  const log = logger.child({ backtest: estrategia.chave, modo: 'intraday' });

  const lista = estrategia.universo.map((t) => `'${t.replace(/'/g, "''")}'`).join(',');
  const rows = (await db.execute(sql.raw(`
    select ticker,
           (ts at time zone 'America/Sao_Paulo')::date::text as dia,
           to_char(ts at time zone 'America/Sao_Paulo', 'HH24:MI') as hora,
           ts::text,
           open::text, high::text, low::text, close::text, volume::text
      from qmix_invest.prices_intraday
     where ticker in (${lista})
       and (ts at time zone 'America/Sao_Paulo')::date between '${inicio}'::date and '${fim}'::date
     order by ts, ticker
  `))) as unknown as LinhaIntraday[];

  if (rows.length === 0) {
    throw new Error(
      `sem barras intradiarias para ${estrategia.universo.join(', ')} entre ${inicio} e ${fim}. ` +
        `Rode a coleta antes: node worker/dist/paper/coletar-cli.js`
    );
  }

  // Agrupa por dia -> hora -> ticker
  const porDia = new Map<string, Map<string, Map<string, Bar>>>();
  for (const r of rows) {
    const barra: Bar = {
      ticker: r.ticker,
      date: r.dia,
      open: D(r.open),
      high: D(r.high),
      low: D(r.low),
      close: D(r.close),
      volume: Number(r.volume),
      // Volume financeiro da barra, para o teto de participacao.
      financeiro: D(r.close).times(Number(r.volume)),
    };
    let dia = porDia.get(r.dia);
    if (!dia) porDia.set(r.dia, (dia = new Map()));
    let hora = dia.get(r.hora);
    if (!hora) dia.set(r.hora, (hora = new Map()));
    hora.set(r.ticker, barra);
  }

  const minutos = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h! * 60 + m!;
  };
  const fechamentoMin = minutos(horaFechamento);

  let estado: EstadoConta = { caixa: caixaInicial, posicoes: new Map() };
  const serie: PontoEquity[] = [];
  const trades: TradeFechado[] = [];
  const operacoesIR: OperacaoDayTrade[] = [];
  const rejeicoes: Record<string, number> = {};
  let custoTotal = ZERO;
  let barrasProcessadas = 0;
  let fechamentosForcados = 0;

  for (const dia of [...porDia.keys()].sort()) {
    const horas = [...porDia.get(dia)!.keys()].sort();
    let pendentes: Ordem[] = [];

    for (let i = 0; i < horas.length; i++) {
      const hora = horas[i]!;
      const barras = porDia.get(dia)!.get(hora)!;
      barrasProcessadas++;

      // 1) Executa o que foi decidido na barra anterior, na abertura desta.
      for (const ordem of pendentes) {
        const barra = barras.get(ordem.ticker) ?? null;
        const { fill, rejeicao } = executarOrdem(ordem, barra, estado, custos);
        if (rejeicao) {
          rejeicoes[rejeicao] = (rejeicoes[rejeicao] ?? 0) + 1;
          continue;
        }
        if (!fill) continue;

        if (fill.side === 'sell') {
          const pos = estado.posicoes.get(fill.ticker);
          if (pos) {
            const lucro = fill.caixaDelta.minus(pos.precoMedio.times(fill.quantidade));
            trades.push({ ticker: fill.ticker, dataEntrada: dia, dataSaida: dia, lucro });
            operacoesIR.push({ data: dia, ticker: fill.ticker, resultado: lucro });
          }
        }
        custoTotal = custoTotal.plus(fill.emolumentos).plus(fill.corretagem);
        estado = aplicarFill(estado, fill);
      }
      pendentes = [];

      const restantes = fechamentoMin - minutos(hora);

      // 2) Fechamento compulsorio: e o que faz disto day trade.
      if (restantes <= 0 && estado.posicoes.size > 0) {
        for (const pos of [...estado.posicoes.values()]) {
          const barra = barras.get(pos.ticker) ?? null;
          const { fill } = executarOrdem(
            { ticker: pos.ticker, side: 'sell', tipo: 'market', quantidade: pos.quantidade,
              razao: 'fechamento compulsorio de day trade' },
            barra, estado, custos
          );
          if (!fill) continue;
          const lucro = fill.caixaDelta.minus(pos.precoMedio.times(fill.quantidade));
          trades.push({ ticker: pos.ticker, dataEntrada: dia, dataSaida: dia, lucro });
          operacoesIR.push({ data: dia, ticker: pos.ticker, resultado: lucro });
          custoTotal = custoTotal.plus(fill.emolumentos).plus(fill.corretagem);
          estado = aplicarFill(estado, fill);
          fechamentosForcados++;
        }
        continue; // depois do fechamento nao se abre posicao nova
      }

      // 3) Estrategia decide olhando so o que ja passou.
      if (restantes > 0) {
        const anteriores = horas.slice(0, i);
        pendentes = estrategia.decidir({
          dia,
          hora,
          barras,
          hoje: (ticker) =>
            anteriores
              .map((h) => porDia.get(dia)!.get(h)?.get(ticker))
              .filter((b): b is Bar => b !== undefined),
          estado,
          minutosAteFechar: restantes,
        });
      }
    }

    // Patrimonio no fim do pregao. Em day trade puro, tudo em caixa.
    const precos = new Map<string, Decimal>();
    const ultima = porDia.get(dia)!.get(horas.at(-1)!)!;
    for (const [t, b] of ultima) precos.set(t, b.close);
    serie.push({ data: dia, patrimonio: patrimonio(estado, precos).total });
  }

  const imposto = apurarSerieDayTrade(operacoesIR);
  const impostoTotal = imposto.reduce((a, m) => a.plus(m.impostoARecolher), ZERO);
  const bruto = (serie.at(-1)?.patrimonio ?? caixaInicial).minus(caixaInicial);

  log.info(
    { pregoes: porDia.size, trades: trades.length, impostoTotal: impostoTotal.toString() },
    'backtest intradiario concluido'
  );

  return {
    estrategia: estrategia.chave,
    inicio, fim,
    pregoes: porDia.size,
    barras: barrasProcessadas,
    metricas: calcularMetricas(serie, trades),
    serie, trades, rejeicoes,
    custoTotal: custoTotal.toDecimalPlaces(2),
    imposto,
    impostoTotal: impostoTotal.toDecimalPlaces(2),
    resultadoLiquido: bruto.minus(impostoTotal).toDecimalPlaces(2),
    fechamentosForcados,
  };
}
