import Decimal from 'decimal.js';
import { TAX_CONFIG } from '../tax/config.js';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = D(0);
const money = (d: Decimal) => d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

/**
 * Apuracao de DAY TRADE. E um regime separado do swing, e as diferencas nao sao
 * detalhe:
 *
 *  - aliquota de 20%, contra 15% do swing;
 *  - NAO existe a isencao de R$20 mil. Vendeu, apurou, deve;
 *  - prejuizo de day trade so compensa lucro de DAY TRADE. Nao se mistura com o
 *    estoque do swing, nem em um sentido nem no outro;
 *  - o IRRF ("dedo-duro") e de 1% sobre o resultado POSITIVO de cada dia, contra
 *    0,005% sobre o valor da venda no swing. Ele e antecipacao e abate o devido.
 *
 * A conta de 1% ao dia e o que costuma surpreender: um operador que faz muitos
 * dias positivos e poucos dias muito negativos pode terminar o mes no prejuizo
 * e ainda assim ter tido retencao em vários dias. O valor nao se perde, mas
 * fica preso ate haver lucro que o absorva.
 */

export interface OperacaoDayTrade {
  data: string; // YYYY-MM-DD
  ticker: string;
  /** Resultado liquido da operacao, ja descontados custos. */
  resultado: Decimal;
}

export interface DiaDayTrade {
  data: string;
  resultado: Decimal;
  /** 1% sobre o resultado do dia, quando positivo. */
  irrf: Decimal;
}

export interface ApuracaoDayTrade {
  mes: string; // YYYY-MM
  resultadoBruto: Decimal;
  prejuizoAnteriorUsado: Decimal;
  baseCalculo: Decimal;
  imposto: Decimal;
  irrfRetido: Decimal;
  /** imposto - irrf, com piso em zero. */
  impostoARecolher: Decimal;
  /** IRRF que sobrou por nao haver imposto que o absorvesse. */
  irrfAcumulado: Decimal;
  prejuizoAcumuladoDepois: Decimal;
  dias: DiaDayTrade[];
}

export interface EntradaApuracaoDayTrade {
  ano: number;
  mes: number; // 1-12
  operacoes: OperacaoDayTrade[];
  prejuizoAnterior?: Decimal.Value;
  irrfAnterior?: Decimal.Value;
  aliquota?: number;
  irrfPct?: number;
}

/** Agrupa por dia, porque o IRRF de 1% incide sobre o resultado DIARIO. */
export function agruparPorDia(ops: OperacaoDayTrade[], irrfPct: number): DiaDayTrade[] {
  const porDia = new Map<string, Decimal>();
  for (const o of ops) {
    porDia.set(o.data, (porDia.get(o.data) ?? ZERO).plus(o.resultado));
  }
  return [...porDia.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([data, resultado]) => ({
      data,
      resultado: money(resultado),
      irrf: resultado.gt(0) ? money(resultado.times(irrfPct)) : ZERO,
    }));
}

export function apurarDayTrade(e: EntradaApuracaoDayTrade): ApuracaoDayTrade {
  const aliquota = e.aliquota ?? TAX_CONFIG.ALIQUOTA_DAYTRADE;
  const irrfPct = e.irrfPct ?? 0.01;
  const prefixo = `${e.ano}-${String(e.mes).padStart(2, '0')}`;

  const doMes = e.operacoes.filter((o) => o.data.startsWith(prefixo));
  const dias = agruparPorDia(doMes, irrfPct);

  const resultadoBruto = money(dias.reduce((a, d) => a.plus(d.resultado), ZERO));
  const irrfDoMes = money(dias.reduce((a, d) => a.plus(d.irrf), ZERO));
  const irrfDisponivel = money(irrfDoMes.plus(D(e.irrfAnterior ?? 0)));

  const prejuizoEntrada = D(e.prejuizoAnterior ?? 0);

  // Mes negativo: nada a pagar, o prejuizo engorda o estoque e o IRRF fica retido.
  if (resultadoBruto.lte(0)) {
    return {
      mes: prefixo,
      resultadoBruto,
      prejuizoAnteriorUsado: ZERO,
      baseCalculo: ZERO,
      imposto: ZERO,
      irrfRetido: irrfDoMes,
      impostoARecolher: ZERO,
      irrfAcumulado: irrfDisponivel,
      prejuizoAcumuladoDepois: money(prejuizoEntrada.plus(resultadoBruto.abs())),
      dias,
    };
  }

  const usado = Decimal.min(prejuizoEntrada, resultadoBruto);
  const base = money(resultadoBruto.minus(usado));
  const imposto = money(base.times(aliquota));

  const abatido = Decimal.min(irrfDisponivel, imposto);
  const aRecolher = money(imposto.minus(abatido));

  return {
    mes: prefixo,
    resultadoBruto,
    prejuizoAnteriorUsado: money(usado),
    baseCalculo: base,
    imposto,
    irrfRetido: irrfDoMes,
    impostoARecolher: aRecolher,
    irrfAcumulado: money(irrfDisponivel.minus(abatido)),
    prejuizoAcumuladoDepois: money(prejuizoEntrada.minus(usado)),
    dias,
  };
}

/**
 * Encadeia varios meses. Prejuizo e IRRF so andam para frente — apurar cada mes
 * isoladamente com o estoque atual faria o prejuizo de dezembro abater o lucro
 * de janeiro, o que a lei nao permite.
 */
export function apurarSerieDayTrade(
  operacoes: OperacaoDayTrade[]
): ApuracaoDayTrade[] {
  const meses = [...new Set(operacoes.map((o) => o.data.slice(0, 7)))].sort();
  let prejuizo = ZERO;
  let irrf = ZERO;

  return meses.map((m) => {
    const [ano, mes] = m.split('-').map(Number);
    const r = apurarDayTrade({
      ano: ano!,
      mes: mes!,
      operacoes,
      prejuizoAnterior: prejuizo,
      irrfAnterior: irrf,
    });
    prejuizo = r.prejuizoAcumuladoDepois;
    irrf = r.irrfAcumulado;
    return r;
  });
}
