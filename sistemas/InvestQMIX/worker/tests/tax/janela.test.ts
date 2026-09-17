import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { analisarJanela, type PosicaoJanela } from '@qmix-invest/db/tax/janela';

const D = (v: Decimal.Value) => new Decimal(v);

function pos(
  ticker: string,
  quantidade: number,
  pm: string,
  cotacao: string,
  assetClass: PosicaoJanela['assetClass'] = 'acao'
): PosicaoJanela {
  return { ticker, quantidade, precoMedio: D(pm), cotacao: D(cotacao), assetClass };
}

describe('janela isenta', () => {
  it('sugere realizar lucro dentro dos R$20 mil sem tocar no credito', () => {
    const j = analisarJanela({
      mes: '2026-09',
      posicoes: [pos('ITUB4', 4700, '41.2815', '41.75')],
      vendidoNoMes: 0,
      creditoSwing: 9145.04,
    });

    expect(j.margemIsenta.toString()).toBe('20000');
    expect(j.mesJaTributavel).toBe(false);
    expect(j.janelaIsenta.length).toBeGreaterThan(0);
    // a venda sugerida cabe no teto
    const total = j.janelaIsenta.reduce((a, s) => a.plus(s.valorVenda), D(0));
    expect(total.lte(20000)).toBe(true);
    // credito intacto
    expect(j.creditoDisponivel.toString()).toBe('9145.04');
    expect(j.janelaCredito).toHaveLength(0);
    expect(j.veredito).toContain('SEM consumir o crédito');
  });

  it('respeita o que ja foi vendido no mes', () => {
    const j = analisarJanela({
      mes: '2026-09',
      posicoes: [pos('ITUB4', 4700, '41.2815', '41.75')],
      vendidoNoMes: 15000,
      creditoSwing: 9145.04,
    });
    expect(j.margemIsenta.toString()).toBe('5000');
    const total = j.janelaIsenta.reduce((a, s) => a.plus(s.valorVenda), D(0));
    expect(total.lte(5000)).toBe(true);
  });
});

describe('janela do credito', () => {
  it('so abre quando o mes JA e tributavel', () => {
    // Antes de estourar o teto, consumir credito seria trocar recurso por nada:
    // o lucro seria isento de qualquer jeito.
    const antes = analisarJanela({
      mes: '2026-09',
      posicoes: [pos('ITUB4', 4700, '41.2815', '41.75')],
      vendidoNoMes: 19000,
      creditoSwing: 9145.04,
    });
    expect(antes.mesJaTributavel).toBe(false);
    expect(antes.janelaCredito).toHaveLength(0);

    const depois = analisarJanela({
      mes: '2026-09',
      posicoes: [pos('ITUB4', 4700, '41.2815', '41.75')],
      vendidoNoMes: 50000,
      creditoSwing: 9145.04,
    });
    expect(depois.mesJaTributavel).toBe(true);
    expect(depois.janelaCredito.length).toBeGreaterThan(0);
    expect(depois.veredito).toContain('hora de usar o crédito');
  });

  it('nao sugere mais lucro do que o credito cobre', () => {
    const j = analisarJanela({
      mes: '2026-09',
      posicoes: [pos('PETR4', 100000, '10.00', '20.00')], // lucro enorme
      vendidoNoMes: 50000,
      creditoSwing: 1000,
    });
    expect(j.lucroCobertoPeloCredito.lte(1000)).toBe(true);
  });
});

describe('armadilha do prejuizo em mes isento', () => {
  it('avisa quando vender a perdedora sozinha queima o prejuizo', () => {
    // DIRR3 inteira vale R$19.962: fica SOB o teto, entao o prejuizo de
    // R$9.768 nao viraria credito.
    const j = analisarJanela({
      mes: '2026-09',
      posicoes: [pos('DIRR3', 1800, '16.5167', '11.09')],
      vendidoNoMes: 0,
      creditoSwing: 0,
    });
    const aviso = j.avisos.find((a) => a.ticker === 'DIRR3');
    expect(aviso).toBeDefined();
    expect(aviso!.queimaSeSozinho).toBe(true);
    expect(Number(aviso!.prejuizo)).toBeGreaterThan(9000);
    // falta pouco pra virar tributavel
    expect(Number(aviso!.faltaParaTributavel)).toBeGreaterThan(0);
    expect(Number(aviso!.faltaParaTributavel)).toBeLessThan(100);
  });

  it('nao avisa quando a venda ja passa do teto sozinha', () => {
    const j = analisarJanela({
      mes: '2026-09',
      posicoes: [pos('BBDC3', 2600, '16.4192', '15.85')],
      vendidoNoMes: 25000, // mes ja tributavel
      creditoSwing: 0,
    });
    expect(j.avisos.find((a) => a.ticker === 'BBDC3')!.queimaSeSozinho).toBe(false);
  });

  it('ignora prejuizo irrelevante', () => {
    const j = analisarJanela({
      mes: '2026-09',
      posicoes: [pos('XPTO3', 10, '10.00', '9.90')], // R$1 de prejuizo
      vendidoNoMes: 0,
      creditoSwing: 0,
    });
    expect(j.avisos).toHaveLength(0);
  });
});

describe('FII fica de fora', () => {
  it('nao entra na isencao nem nas sugestoes — regime proprio de 20%', () => {
    const j = analisarJanela({
      mes: '2026-09',
      posicoes: [pos('KNCR11', 38, '105.98', '106.58', 'fii')],
      vendidoNoMes: 0,
      creditoSwing: 9145.04,
    });
    expect(j.janelaIsenta).toHaveLength(0);
    expect(j.lucroNaoRealizado.toString()).toBe('0');
    expect(j.veredito).toContain('Nenhuma posição no lucro');
  });
});

describe('carteira sem lucro', () => {
  it('diz que nao ha o que realizar', () => {
    const j = analisarJanela({
      mes: '2026-09',
      posicoes: [pos('DIRR3', 1800, '16.5167', '11.09')],
      vendidoNoMes: 0,
      creditoSwing: 9145.04,
    });
    expect(j.lucroNaoRealizado.toString()).toBe('0');
    expect(j.veredito).toContain('Nenhuma posição no lucro');
  });
});
