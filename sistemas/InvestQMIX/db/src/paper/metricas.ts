import Decimal from 'decimal.js';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = new Decimal(0);

export interface PontoEquity {
  data: string;
  patrimonio: Decimal;
}

export interface TradeFechado {
  ticker: string;
  dataEntrada: string;
  dataSaida: string;
  lucro: Decimal;
}

export interface Metricas {
  patrimonioInicial: Decimal;
  patrimonioFinal: Decimal;
  retornoPct: Decimal;
  /** Retorno anualizado (CAGR). So faz sentido acima de ~3 meses. */
  cagrPct: Decimal | null;
  maxDrawdownPct: Decimal;
  /** Data em que o pior drawdown tocou o fundo. */
  maxDrawdownEm: string | null;
  volatilidadeAnualPct: Decimal | null;
  sharpe: Decimal | null;
  totalTrades: number;
  tradesVencedores: number;
  taxaAcertoPct: Decimal | null;
  ganhoMedio: Decimal | null;
  perdaMedia: Decimal | null;
  /** Soma dos ganhos dividida pela soma das perdas. Abaixo de 1 = destroi capital. */
  profitFactor: Decimal | null;
  diasCorridos: number;
}

function dias(a: string, b: string): number {
  return Math.round(
    (new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / 86400000
  );
}

/**
 * Serie de drawdown a partir da curva de capital. Drawdown e a queda desde o
 * pico anterior — e o numero que diz se a estrategia era suportavel de viver,
 * nao so lucrativa no fim.
 */
export function curvaDrawdown(
  serie: PontoEquity[]
): Array<{ data: string; pico: Decimal; drawdownPct: Decimal }> {
  let pico = ZERO;
  return serie.map((p) => {
    if (p.patrimonio.gt(pico)) pico = p.patrimonio;
    const dd = pico.gt(0) ? pico.minus(p.patrimonio).div(pico).times(100) : ZERO;
    return { data: p.data, pico, drawdownPct: dd.toDecimalPlaces(4) };
  });
}

export function calcularMetricas(
  serie: PontoEquity[],
  trades: TradeFechado[],
  taxaLivreRiscoAnual = 0.10 // Selic aproximada; o custo de oportunidade real no Brasil
): Metricas | null {
  if (serie.length < 2) return null;

  const inicial = serie[0]!.patrimonio;
  const final = serie[serie.length - 1]!.patrimonio;
  const retorno = inicial.gt(0) ? final.div(inicial).minus(1).times(100) : ZERO;

  const dd = curvaDrawdown(serie);
  let maxDd = ZERO;
  let maxDdEm: string | null = null;
  for (const p of dd) {
    if (p.drawdownPct.gt(maxDd)) {
      maxDd = p.drawdownPct;
      maxDdEm = p.data;
    }
  }

  // Retornos diarios para volatilidade e Sharpe
  const retornosDiarios: Decimal[] = [];
  for (let i = 1; i < serie.length; i++) {
    const ant = serie[i - 1]!.patrimonio;
    if (ant.gt(0)) retornosDiarios.push(serie[i]!.patrimonio.div(ant).minus(1));
  }

  let volAnual: Decimal | null = null;
  let sharpe: Decimal | null = null;
  if (retornosDiarios.length > 1) {
    const media = retornosDiarios
      .reduce((a, b) => a.plus(b), ZERO)
      .div(retornosDiarios.length);
    const variancia = retornosDiarios
      .reduce((a, r) => a.plus(r.minus(media).pow(2)), ZERO)
      .div(retornosDiarios.length - 1);
    const desvio = variancia.sqrt();
    const raiz252 = D(252).sqrt();
    volAnual = desvio.times(raiz252).times(100).toDecimalPlaces(4);
    const retAnual = media.times(252);
    const excedente = retAnual.minus(taxaLivreRiscoAnual);
    const volDec = desvio.times(raiz252);
    sharpe = volDec.gt(0) ? excedente.div(volDec).toDecimalPlaces(4) : null;
  }

  const corridos = dias(serie[0]!.data, serie[serie.length - 1]!.data);
  let cagr: Decimal | null = null;
  if (corridos >= 90 && inicial.gt(0) && final.gt(0)) {
    const anos = corridos / 365.25;
    const r = Math.pow(final.div(inicial).toNumber(), 1 / anos) - 1;
    cagr = D(r * 100).toDecimalPlaces(4);
  }

  const vencedores = trades.filter((t) => t.lucro.gt(0));
  const perdedores = trades.filter((t) => t.lucro.lt(0));
  const somaGanhos = vencedores.reduce((a, t) => a.plus(t.lucro), ZERO);
  const somaPerdas = perdedores.reduce((a, t) => a.plus(t.lucro.abs()), ZERO);

  return {
    patrimonioInicial: inicial,
    patrimonioFinal: final,
    retornoPct: retorno.toDecimalPlaces(4),
    cagrPct: cagr,
    maxDrawdownPct: maxDd,
    maxDrawdownEm: maxDdEm,
    volatilidadeAnualPct: volAnual,
    sharpe,
    totalTrades: trades.length,
    tradesVencedores: vencedores.length,
    taxaAcertoPct: trades.length
      ? D(vencedores.length).div(trades.length).times(100).toDecimalPlaces(2)
      : null,
    ganhoMedio: vencedores.length
      ? somaGanhos.div(vencedores.length).toDecimalPlaces(2)
      : null,
    perdaMedia: perdedores.length
      ? somaPerdas.div(perdedores.length).toDecimalPlaces(2)
      : null,
    profitFactor: somaPerdas.gt(0) ? somaGanhos.div(somaPerdas).toDecimalPlaces(4) : null,
    diasCorridos: corridos,
  };
}
