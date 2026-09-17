import Decimal from 'decimal.js';
import { apurarMes, type ApuracaoResult } from '@qmix-invest/db/tax/apuracao';
import type { SaleResult } from '@qmix-invest/db/tax/types';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = D(0);

/** Venda realizada no backtest, no formato que o motor fiscal entende. */
export interface VendaBacktest {
  data: string; // YYYY-MM-DD
  ticker: string;
  quantidade: number;
  /** Valor da alienacao, ja liquido dos custos de venda. */
  bruto: Decimal;
  /** Custo de aquisicao da parcela vendida. */
  custo: Decimal;
  assetClass: 'acao' | 'fii' | 'etf' | 'bdr' | 'outro';
}

export interface ResumoImpostoSwing {
  meses: ApuracaoResult[];
  impostoTotal: Decimal;
  /** Lucro que ficou isento por o mes ter vendido menos que o teto. */
  lucroIsentoTotal: Decimal;
  /** Quantos meses ficaram sob a isencao de R$20 mil. */
  mesesIsentos: number;
  mesesTributaveis: number;
  prejuizoFinal: Decimal;
}

/**
 * Apura o IR de swing trade sobre as vendas de um backtest, encadeando os meses
 * em ordem — prejuizo e imposto pendente so andam para frente.
 *
 * Reaproveita `apurarMes` do modulo fiscal, o MESMO codigo que apura a carteira
 * real do Anderson. Se o simulador tivesse a propria conta de imposto, as duas
 * divergiriam com o tempo e o backtest passaria a prometer um liquido que a
 * vida real nao entrega.
 */
export function apurarImpostoSwing(vendas: VendaBacktest[]): ResumoImpostoSwing {
  // `bruto` ja vem liquido dos custos de venda, entao fees fica em zero e
  // netSale = gross. Assim o motor fiscal nao desconta o custo duas vezes.
  const sales: SaleResult[] = vendas.map((v) => ({
    ticker: v.ticker,
    date: v.data,
    quantity: v.quantidade,
    assetClass: v.assetClass,
    nature: 'swing' as const,
    natureInferred: false,
    grossBrl: v.bruto,
    feesBrl: ZERO,
    netSaleBrl: v.bruto,
    costBrl: v.custo,
    profitBrl: v.bruto.minus(v.custo),
  }));

  const meses = [...new Set(vendas.map((v) => v.data.slice(0, 7)))].sort();
  let prejuizo = ZERO;
  let pendente = ZERO;

  const resultados: ApuracaoResult[] = [];
  for (const m of meses) {
    const [ano, mes] = m.split('-').map(Number);
    const r = apurarMes({
      year: ano!,
      month: mes!,
      sales,
      lossCarryforwardSwing: prejuizo,
      duePending: pendente,
    });
    prejuizo = r.acao.novoPrejuizoAcumulado;
    pendente = r.duePendingNovo;
    resultados.push(r);
  }

  return {
    meses: resultados,
    impostoTotal: resultados
      .reduce((a, r) => a.plus(r.darf?.valor ?? ZERO), ZERO)
      .toDecimalPlaces(2),
    lucroIsentoTotal: resultados
      .reduce((a, r) => a.plus(r.codigo20), ZERO)
      .toDecimalPlaces(2),
    mesesIsentos: resultados.filter((r) => r.acao.isento).length,
    mesesTributaveis: resultados.filter((r) => !r.acao.isento).length,
    prejuizoFinal: prejuizo.toDecimalPlaces(2),
  };
}
