import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
  apurarDayTrade,
  apurarSerieDayTrade,
  agruparPorDia,
  type OperacaoDayTrade,
} from '@qmix-invest/db/paper/imposto-daytrade';

const D = (v: Decimal.Value) => new Decimal(v);
const op = (data: string, ticker: string, resultado: string): OperacaoDayTrade => ({
  data,
  ticker,
  resultado: D(resultado),
});

describe('IRRF diario de 1%', () => {
  it('incide sobre o resultado do DIA, nao por operacao', () => {
    // Duas operacoes no mesmo dia, uma ganhando e outra perdendo: o IRRF olha o
    // liquido do dia, entao +500 e -300 retem 1% de 200, e nao 1% de 500.
    const dias = agruparPorDia([op('2026-03-02', 'PETR4', '500'), op('2026-03-02', 'VALE3', '-300')], 0.01);
    expect(dias).toHaveLength(1);
    expect(dias[0]!.resultado.toString()).toBe('200');
    expect(dias[0]!.irrf.toString()).toBe('2');
  });

  it('dia negativo nao retem nada', () => {
    const dias = agruparPorDia([op('2026-03-02', 'PETR4', '-500')], 0.01);
    expect(dias[0]!.irrf.toString()).toBe('0');
  });
});

describe('apuracao mensal', () => {
  it('aplica 20% e NAO concede isencao de 20 mil', () => {
    // No swing, vender pouco isenta. Em day trade nao existe isencao: 1000 de
    // lucro paga 200 mesmo com giro baixo.
    const r = apurarDayTrade({
      ano: 2026, mes: 3,
      operacoes: [op('2026-03-02', 'PETR4', '1000')],
    });
    expect(r.imposto.toString()).toBe('200');
    expect(r.baseCalculo.toString()).toBe('1000');
  });

  it('abate o IRRF do imposto devido', () => {
    const r = apurarDayTrade({
      ano: 2026, mes: 3,
      operacoes: [op('2026-03-02', 'PETR4', '1000')],
    });
    expect(r.irrfRetido.toString()).toBe('10'); // 1% de 1000
    expect(r.impostoARecolher.toString()).toBe('190'); // 200 - 10
  });

  it('mes negativo acumula prejuizo e prende o IRRF dos dias positivos', () => {
    // Tres dias positivos e um dia muito negativo: o mes fecha no vermelho, mas
    // ja houve retencao nos dias bons. O valor nao se perde, fica acumulado.
    const r = apurarDayTrade({
      ano: 2026, mes: 3,
      operacoes: [
        op('2026-03-02', 'PETR4', '300'),
        op('2026-03-03', 'PETR4', '400'),
        op('2026-03-04', 'PETR4', '300'),
        op('2026-03-05', 'PETR4', '-2000'),
      ],
    });
    expect(r.resultadoBruto.toString()).toBe('-1000');
    expect(r.impostoARecolher.toString()).toBe('0');
    expect(r.irrfRetido.toString()).toBe('10'); // 1% de 300+400+300
    expect(r.irrfAcumulado.toString()).toBe('10');
    expect(r.prejuizoAcumuladoDepois.toString()).toBe('1000');
  });

  it('prejuizo de day trade abate lucro de day trade', () => {
    const r = apurarDayTrade({
      ano: 2026, mes: 4,
      operacoes: [op('2026-04-02', 'PETR4', '1500')],
      prejuizoAnterior: '1000',
    });
    expect(r.prejuizoAnteriorUsado.toString()).toBe('1000');
    expect(r.baseCalculo.toString()).toBe('500');
    expect(r.imposto.toString()).toBe('100');
    expect(r.prejuizoAcumuladoDepois.toString()).toBe('0');
  });
});

describe('encadeamento de meses', () => {
  it('prejuizo so anda para frente, nunca retroage', () => {
    const serie = apurarSerieDayTrade([
      op('2026-01-05', 'PETR4', '2000'),   // janeiro: lucro
      op('2026-02-05', 'PETR4', '-3000'),  // fevereiro: prejuizo
      op('2026-03-05', 'PETR4', '5000'),   // marco: lucro, abatido pelo de fev
    ]);
    expect(serie).toHaveLength(3);

    // Janeiro paga cheio: nao ha prejuizo anterior.
    expect(serie[0]!.imposto.toString()).toBe('400');
    // Fevereiro nao paga e acumula 3000.
    expect(serie[1]!.impostoARecolher.toString()).toBe('0');
    expect(serie[1]!.prejuizoAcumuladoDepois.toString()).toBe('3000');
    // Marco usa os 3000: base 2000, imposto 400.
    expect(serie[2]!.prejuizoAnteriorUsado.toString()).toBe('3000');
    expect(serie[2]!.baseCalculo.toString()).toBe('2000');
    expect(serie[2]!.imposto.toString()).toBe('400');
  });

  it('IRRF acumulado de um mes abate o imposto do mes seguinte', () => {
    const serie = apurarSerieDayTrade([
      op('2026-01-05', 'PETR4', '1000'),
      op('2026-01-06', 'PETR4', '-1500'), // mes fecha negativo, mas reteve 10
      op('2026-02-05', 'PETR4', '2000'),
    ]);
    expect(serie[0]!.irrfAcumulado.toString()).toBe('10');
    // Fevereiro: 2000 - 500 de prejuizo = 1500, imposto 300, menos IRRF
    // (10 acumulado + 20 do mes) = 270.
    expect(serie[1]!.baseCalculo.toString()).toBe('1500');
    expect(serie[1]!.imposto.toString()).toBe('300');
    expect(serie[1]!.impostoARecolher.toString()).toBe('270');
  });
});
