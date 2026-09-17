import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { reconstructLedger } from '@qmix-invest/db/tax/ledger';
import { apurarMes } from '@qmix-invest/db/tax/apuracao';
import { recomendarVendaIsenta } from '@qmix-invest/db/tax/recomendacao';
import { exportarAnual } from './export.js';
import { analisarFimDeMes, detectarOportunidades, type FullState } from './service.js';
import type { ProventoProximo } from './service.js';
import { msgConfirmacaoRegistro, msgOportunidade, msgFimDeMes, msgAvisoDayTrade } from '@qmix-invest/db/tax/mensagens';
import type { Trade, CorporateEvent, AssetClassMap } from '@qmix-invest/db/tax/types';

// helpers
const buy = (ticker: string, date: string, qty: number, price: number, fees = 0, nature: 'swing' | 'day' = 'swing'): Trade =>
  ({ ticker, side: 'buy', tradeDate: date, quantity: qty, priceBrl: price, feesBrl: fees, nature });
const sell = (ticker: string, date: string, qty: number, price: number, fees = 0, nature: 'swing' | 'day' = 'swing'): Trade =>
  ({ ticker, side: 'sell', tradeDate: date, quantity: qty, priceBrl: price, feesBrl: fees, nature });

const ACAO: AssetClassMap = { BBDC4: 'acao', PETR4: 'acao', A: 'acao', B: 'acao', C: 'acao', HGLG11: 'fii' };

describe('reconstructLedger — preço médio e step-up', () => {
  it('embute corretagem da compra no PM (ponderado)', () => {
    const { positions } = reconstructLedger(
      [buy('BBDC4', '2026-06-01', 100, 10, 5), buy('BBDC4', '2026-06-02', 100, 12, 5)],
      [],
      ACAO,
    );
    // (100*10+5 + 100*12+5) / 200 = (1005 + 1205)/200 = 11.05
    expect(positions.get('BBDC4')!.pm.toFixed(2)).toBe('11.05');
    expect(positions.get('BBDC4')!.quantity).toBe(200);
  });

  it('step-up: vender e recomprar reposiciona o PM pela recompra', () => {
    const { positions } = reconstructLedger(
      [
        buy('BBDC4', '2026-06-01', 200, 10, 0),
        sell('BBDC4', '2026-06-10', 200, 15, 0),
        buy('BBDC4', '2026-06-11', 200, 15, 10), // recompra no dia seguinte (evita day trade)
      ],
      [],
      ACAO,
    );
    // recompra zera a posição e refaz PM = (200*15+10)/200 = 15.05
    expect(positions.get('BBDC4')!.pm.toFixed(2)).toBe('15.05');
    expect(positions.get('BBDC4')!.quantity).toBe(200);
  });

  it('venda: corretagem abate da venda no lucro', () => {
    const { sales } = reconstructLedger(
      [buy('BBDC4', '2026-06-01', 100, 10, 0), sell('BBDC4', '2026-06-10', 100, 15, 20)],
      [],
      ACAO,
    );
    // lucro = (100*15 − 20) − 100*10 = 1480 − 1000 = 480
    expect(sales[0]!.profitBrl.toFixed(2)).toBe('480.00');
  });
});

describe('eventos corporativos', () => {
  it('split dobra a quantidade e divide o PM', () => {
    const ev: CorporateEvent = { ticker: 'BBDC4', eventDate: '2026-06-05', eventType: 'split', factor: 2 };
    const { positions } = reconstructLedger([buy('BBDC4', '2026-06-01', 100, 10, 0)], [ev], ACAO);
    expect(positions.get('BBDC4')!.quantity).toBe(200);
    expect(positions.get('BBDC4')!.pm.toFixed(2)).toBe('5.00');
  });
});

describe('apuração — isenção e estouro (Ponto 1)', () => {
  it('vendas de ação ≤ R$20k no mês: lucro isento (código 20), sem imposto', () => {
    const { sales } = reconstructLedger(
      [buy('BBDC4', '2026-05-01', 2000, 10, 0), sell('BBDC4', '2026-06-10', 1000, 15, 0)],
      [],
      ACAO,
    );
    const r = apurarMes({ year: 2026, month: 6, sales });
    expect(r.acao.isento).toBe(true);
    expect(r.acao.vendidoBruto.toFixed(2)).toBe('15000.00');
    expect(r.codigo20.toFixed(2)).toBe('5000.00'); // (15−10)*1000
    expect(r.acao.impostoLiquido.toFixed(2)).toBe('0.00');
    expect(r.darf).toBeNull();
  });

  it('ESTOURO: vendas > R$20k tributam o LUCRO DO MÊS INTEIRO, não só o excedente', () => {
    const { sales } = reconstructLedger(
      [buy('BBDC4', '2026-05-01', 2000, 10, 0), sell('BBDC4', '2026-06-10', 1500, 15, 0)],
      [],
      ACAO,
    );
    const r = apurarMes({ year: 2026, month: 6, sales });
    expect(r.acao.isento).toBe(false);
    expect(r.acao.vendidoBruto.toFixed(2)).toBe('22500.00');
    // lucro do mês inteiro = (15−10)*1500 = 7500; imposto = 15% * 7500 = 1125
    expect(r.acao.lucroTributavel.toFixed(2)).toBe('7500.00');
    expect(r.acao.imposto.toFixed(2)).toBe('1125.00');
    // dedo-duro = 22500 * 0,005% = 1.125 → abate
    expect(r.acao.dedoDuro.toFixed(2)).toBe('1.13');
    expect(r.acao.impostoLiquido.toFixed(2)).toBe('1123.88');
    // NÃO é 15% sobre (22500−20000): isso daria muito menos — confirma o mês inteiro
    expect(r.acao.imposto.toFixed(2)).not.toBe('375.00');
  });
});

describe('apuração — FII fora da isenção (Ponto 2)', () => {
  it('FII não conta pro teto da ação e é tributado a 20%; ação continua isenta', () => {
    const { sales } = reconstructLedger(
      [
        buy('BBDC4', '2026-05-01', 2000, 10, 0),
        buy('HGLG11', '2026-05-01', 1000, 100, 0),
        sell('BBDC4', '2026-06-10', 1000, 15, 0), // ação: gross 15000 ≤ 20k → isento
        sell('HGLG11', '2026-06-12', 100, 120, 0), // FII: gross 12000, lucro 2000
      ],
      [],
      ACAO,
    );
    const r = apurarMes({ year: 2026, month: 6, sales });
    expect(r.acao.isento).toBe(true); // FII não contaminou o teto da ação
    expect(r.codigo20.toFixed(2)).toBe('5000.00');
    expect(r.fii.lucro.toFixed(2)).toBe('2000.00');
    expect(r.fii.imposto.toFixed(2)).toBe('400.00'); // 20% * 2000
    expect(r.darf!.valor.toFixed(2)).toBe('400.00');
  });
});

describe('apuração — day trade detectado (trava de segurança)', () => {
  it('compra e venda do mesmo ticker no mesmo dia: marcado day, fora da isenção de ação', () => {
    const { sales } = reconstructLedger(
      [buy('BBDC4', '2026-06-10', 100, 10, 0), sell('BBDC4', '2026-06-10', 100, 11, 0)],
      [],
      ACAO,
    );
    expect(sales[0]!.nature).toBe('day');
    expect(sales[0]!.natureInferred).toBe(true);
    const r = apurarMes({ year: 2026, month: 6, sales });
    expect(r.dayTradeDetectado.length).toBe(1);
    expect(r.acao.vendidoBruto.toFixed(2)).toBe('0.00'); // venda day não entra no swing de ação
  });
});

describe('saldo de abertura não dispara day trade', () => {
  it('venda no mesmo dia da abertura sintética é swing, não day', () => {
    const abertura: Trade = { ticker: 'BBDC4', side: 'buy', tradeDate: '2026-06-29', quantity: 1000, priceBrl: 17.82, feesBrl: 0, nature: 'swing', isOpening: true };
    const { sales } = reconstructLedger([abertura, sell('BBDC4', '2026-06-29', 100, 18.5, 0)], [], ACAO);
    expect(sales[0]!.nature).toBe('swing');
    expect(sales[0]!.natureInferred).toBe(false);
  });
});

describe('apuração — DARF mínimo R$10 acumula (Ponto 5)', () => {
  it('imposto < R$10 não gera DARF; acumula até o piso', () => {
    // Mês 1: FII lucro 20 → imposto 4 (< 10) → sem DARF, pending 4
    const s1 = reconstructLedger(
      [buy('HGLG11', '2026-05-01', 1000, 100, 0), sell('HGLG11', '2026-06-10', 10, 102, 0)],
      [],
      ACAO,
    ).sales;
    const r1 = apurarMes({ year: 2026, month: 6, sales: s1 });
    expect(r1.fii.imposto.toFixed(2)).toBe('4.00'); // 20% * (102−100)*10 = 4
    expect(r1.darf).toBeNull();
    expect(r1.duePendingNovo.toFixed(2)).toBe('4.00');

    // Mês 2: pending 4 entra + imposto 6 → acumulado 10 → DARF 10
    const s2 = reconstructLedger(
      [buy('HGLG11', '2026-05-01', 1000, 100, 0), sell('HGLG11', '2026-07-10', 15, 102, 0)],
      [],
      ACAO,
    ).sales;
    const r2 = apurarMes({ year: 2026, month: 7, sales: s2, duePending: r1.duePendingNovo });
    expect(r2.fii.imposto.toFixed(2)).toBe('6.00'); // 20% * (102−100)*15 = 6
    expect(r2.darf!.valor.toFixed(2)).toBe('10.00');
    expect(r2.duePendingNovo.toFixed(2)).toBe('0.00');
  });
});

describe('apuração — compensação de prejuízo (segregado; isento não compensa)', () => {
  it('prejuízo de mês tributável entra no estoque; mês isento com prejuízo NÃO', () => {
    // mês tributável (>20k) com prejuízo
    const sPrej = reconstructLedger(
      [buy('BBDC4', '2026-05-01', 3000, 10, 0), sell('BBDC4', '2026-06-10', 2500, 9, 0)],
      [],
      ACAO,
    ).sales;
    const rPrej = apurarMes({ year: 2026, month: 6, sales: sPrej });
    expect(rPrej.acao.isento).toBe(false); // 2500*9 = 22500 > 20k
    expect(rPrej.acao.novoPrejuizoAcumulado.toFixed(2)).toBe('2500.00'); // (9−10)*2500 = −2500

    // mês isento com prejuízo: NÃO entra no estoque
    const sIsentoPrej = reconstructLedger(
      [buy('PETR4', '2026-05-01', 1000, 10, 0), sell('PETR4', '2026-06-10', 500, 9, 0)],
      [],
      ACAO,
    ).sales;
    const rIsentoPrej = apurarMes({ year: 2026, month: 6, sales: sIsentoPrej, lossCarryforwardSwing: 1000 });
    expect(rIsentoPrej.acao.isento).toBe(true); // 500*9 = 4500 ≤ 20k
    expect(rIsentoPrej.acao.novoPrejuizoAcumulado.toFixed(2)).toBe('1000.00'); // inalterado
  });

  it('mês tributável com lucro compensa prejuízo acumulado antes de aplicar 15%', () => {
    const s = reconstructLedger(
      [buy('BBDC4', '2026-05-01', 3000, 10, 0), sell('BBDC4', '2026-06-10', 1500, 15, 0)],
      [],
      ACAO,
    ).sales;
    const r = apurarMes({ year: 2026, month: 6, sales: s, lossCarryforwardSwing: 2000 });
    // lucro 7500; compensa 2000 → base 5500; imposto 15% = 825
    expect(r.acao.prejuizoUsado.toFixed(2)).toBe('2000.00');
    expect(r.acao.base.toFixed(2)).toBe('5500.00');
    expect(r.acao.imposto.toFixed(2)).toBe('825.00');
    expect(r.acao.novoPrejuizoAcumulado.toFixed(2)).toBe('0.00');
  });
});

describe('modo estouro real — estouro + compensação de prejuízo juntos (pedido da revisão)', () => {
  it('vendido R$22.500, lucro R$7.500, prejuízo estoque R$3.000 → base R$4.500 → 15% = R$675', () => {
    const s = reconstructLedger(
      [buy('BBDC4', '2026-05-01', 3000, 10, 0), sell('BBDC4', '2026-06-10', 1500, 15, 0)],
      [],
      ACAO,
    ).sales;
    const r = apurarMes({ year: 2026, month: 6, sales: s, lossCarryforwardSwing: 3000 });
    expect(r.acao.isento).toBe(false); // 22.500 > 20k
    expect(r.acao.lucroTributavel.toFixed(2)).toBe('7500.00');
    expect(r.acao.prejuizoUsado.toFixed(2)).toBe('3000.00'); // compensa ANTES do 15%
    expect(r.acao.base.toFixed(2)).toBe('4500.00');
    expect(r.acao.imposto.toFixed(2)).toBe('675.00');
    expect(r.acao.novoPrejuizoAcumulado.toFixed(2)).toBe('0.00'); // estoque consumido
  });
});

describe('evento corporativo — split reflete no lucro da venda posterior (pedido da revisão)', () => {
  it('100 ações PM R$20, split 1:2 → 200 PM R$10; venda calcula lucro sobre o PM ajustado', () => {
    const ev: CorporateEvent = { ticker: 'BBDC4', eventDate: '2026-06-05', eventType: 'split', factor: 2 };
    const { sales, positions } = reconstructLedger(
      [buy('BBDC4', '2026-06-01', 100, 20, 0), sell('BBDC4', '2026-06-10', 100, 15, 0)],
      [ev],
      ACAO,
    );
    // após split: 200 cotas a PM 10; vende 100 a 15 → lucro = (15 − 10) * 100 = 500
    expect(sales[0]!.profitBrl.toFixed(2)).toBe('500.00');
    expect(positions.get('BBDC4')!.quantity).toBe(100); // 200 − 100 vendidas
    expect(positions.get('BBDC4')!.pm.toFixed(2)).toBe('10.00');
  });
});

describe('day trade FORA do escopo (pedido da revisão)', () => {
  it('detectado, mas não gera imposto (sem apuração de 20%/dedo-duro 1%)', () => {
    const { sales } = reconstructLedger(
      [buy('BBDC4', '2026-06-10', 100, 10, 0), sell('BBDC4', '2026-06-10', 100, 11, 0)],
      [],
      ACAO,
    );
    const r = apurarMes({ year: 2026, month: 6, sales });
    expect(r.dayTradeDetectado.length).toBe(1); // só avisa
    expect(r.totalImpostoMes.toFixed(2)).toBe('0.00'); // nenhum imposto de day trade calculado
    expect(r.darf).toBeNull();
  });
});

describe('recomendação de venda isenta', () => {
  it('prioriza maior ganho %, respeita a margem e simula novo PM', () => {
    const r = recomendarVendaIsenta({
      positions: [
        { ticker: 'A', quantity: 1000, pm: 10, precoAtual: 15, assetClass: 'acao' }, // +50%
        { ticker: 'B', quantity: 1000, pm: 10, precoAtual: 11, assetClass: 'acao' }, // +10%
      ],
      vendidoAcaoSwingBrutoMes: 0,
      feeEstimadoPorOperacao: 5,
    });
    // A primeiro (maior %): 1000 cotas a 15 = 15.000; sobra margem ~4.900 p/ B
    expect(r.sugestoes[0]!.ticker).toBe('A');
    expect(r.sugestoes[0]!.valorVendaBrl.toFixed(2)).toBe('15000.00');
    expect(r.sugestoes[0]!.novoPmBrl.toFixed(2)).toBe('15.00');
    expect(r.sugestoes[0]!.impostoFuturoEconomizadoBrl.toFixed(2)).toBe('750.00'); // 15% de 5000
    expect(r.totalSugeridoBrl.lte(19900)).toBe(true);
  });

  it('ignora giro cujo custo supera o imposto economizado', () => {
    const r = recomendarVendaIsenta({
      positions: [{ ticker: 'C', quantity: 100, pm: 10, precoAtual: 10.01, assetClass: 'acao' }],
      vendidoAcaoSwingBrutoMes: 0,
      feeEstimadoPorOperacao: 5,
    });
    // ganho = 0,01*100 = 1; imposto economizado = 0,15; custo giro = 10 → ignora
    expect(r.sugestoes.length).toBe(0);
    expect(r.ignoradasPorCusto.length).toBe(1);
  });

  it('sem margem (já vendeu o teto) não sugere nada', () => {
    const r = recomendarVendaIsenta({
      positions: [{ ticker: 'A', quantity: 1000, pm: 10, precoAtual: 15, assetClass: 'acao' }],
      vendidoAcaoSwingBrutoMes: 19900,
      feeEstimadoPorOperacao: 5,
    });
    expect(r.sugestoes.length).toBe(0);
  });
});

describe('export anual', () => {
  it('consolida o ano e leva o lucro isento pro código 20', async () => {
    const st: FullState = {
      trades: [
        { ticker: 'BBDC4', side: 'buy', tradeDate: '2026-01-01', quantity: 2000, priceBrl: 10, feesBrl: 0, nature: 'swing', isOpening: true },
        { ticker: 'BBDC4', side: 'sell', tradeDate: '2026-06-10', quantity: 1000, priceBrl: 15, feesBrl: 0, nature: 'swing' },
      ],
      events: [],
      assetClass: { BBDC4: 'acao' },
      precos: new Map(),
      carryforwardSwing: new Decimal(0),
      duePending: new Decimal(0),
      proventos: new Map(),
      volumeMedio: new Map(),
    };
    const r = await exportarAnual(2026, st);
    expect(r.meses.length).toBe(12);
    const junho = r.meses.find((m) => m.mes === '2026-06')!;
    expect(junho.isento).toBe(true);
    expect(junho.lucroIsentoCod20).toBe('5000.00');
    expect(r.resumoTexto).toContain('5.000,00'); // total isento no resumo
    expect(r.csv.split('\n').length).toBe(13); // header + 12 meses
  });
});

describe('linguagem simples — glossário e "é aviso" nas mensagens', () => {
  it('confirmação de venda isenta explica os termos em português simples', () => {
    const m = msgConfirmacaoRegistro({
      side: 'sell', ticker: 'BBDC4', quantity: 100, price: 18.02,
      isDayTrade: false, lucro: 15.1, isento: true, vendidoMes: 1802, margem: 18098,
    });
    expect(m).toContain('compra e venda em dias diferentes'); // explica swing
    expect(m).toContain('livre de imposto');
    expect(m).toContain('18.098,00'); // margem restante
  });

  it('day trade é avisado como tal', () => {
    const m = msgConfirmacaoRegistro({ side: 'sell', ticker: 'BBDC4', quantity: 100, price: 11, isDayTrade: true });
    expect(m).toContain('mesma ação no mesmo dia');
  });

  it('oportunidade deixa explícito que é só um aviso e mostra custo/benefício', () => {
    const m = msgOportunidade({
      ticker: 'ITSA4', quantidade: 100, precoAtual: 13.45, precoMedio: 13.11,
      ganhoLivre: 34, margemRestante: 18000, custoGiro: 0.81, beneficioPotencial: 5.1, poucoLiquida: false,
    });
    expect(m).toContain('quem decide e executa a venda é você');
    expect(m).toContain('preço médio');
    expect(m).toContain('Custo pra fazer isso');
    expect(m).toContain('pode te poupar');
  });

  it('oportunidade marca ação pouco negociada quando aplicável', () => {
    const m = msgOportunidade({
      ticker: 'SYNE3', quantidade: 100, precoAtual: 4.29, precoMedio: 4.0,
      ganhoLivre: 29, margemRestante: 18000, custoGiro: 0.26, beneficioPotencial: 4.35, poucoLiquida: true,
    });
    expect(m).toContain('pouco negociada');
  });

  it('oportunidade reforça nunca girar no mesmo dia (day trade)', () => {
    const m = msgOportunidade({
      ticker: 'ITUB3', quantidade: 446, precoAtual: 44.5, precoMedio: 37.81,
      ganhoLivre: 2990, margemRestante: 26, custoGiro: 11.9, beneficioPotencial: 448.5,
    });
    expect(m).toContain('próximo dia útil');
    expect(m).toContain('nunca no mesmo dia');
  });

  it('oportunidade com conflito manda adiar e cita a data-com exata', () => {
    const m = msgOportunidade({
      ticker: 'ITUB3', quantidade: 446, precoAtual: 44.5, precoMedio: 37.81,
      ganhoLivre: 2990, margemRestante: 26, custoGiro: 11.9, beneficioPotencial: 448.5,
      proventoProximo: { comDate: '2026-06-30', dataEx: '2026-07-01', eventType: 'JUROS SOBRE CAPITAL PRÓPRIO' },
      proventoConflito: true, recompraData: '2026-07-01',
    });
    expect(m).toContain('último dia pra manter o JCP');
    expect(m).toContain('30/06');
    expect(m).toContain('depois de 01/07');
  });

  it('oportunidade sem conflito exige recompra ATÉ a data-com (janela de um dia)', () => {
    const m = msgOportunidade({
      ticker: 'ITUB3', quantidade: 446, precoAtual: 44.5, precoMedio: 37.81,
      ganhoLivre: 2990, margemRestante: 26, custoGiro: 11.9, beneficioPotencial: 448.5,
      proventoProximo: { comDate: '2026-06-30', dataEx: '2026-07-01', eventType: 'JUROS SOBRE CAPITAL PRÓPRIO' },
      proventoConflito: false, recompraData: '2026-06-30',
    });
    expect(m).toContain('exatamente até 30/06');
    expect(m).toContain('a janela é esse dia');
    expect(m).not.toContain('próximo dia útil'); // não dá a falsa folga
  });

  it('aviso de day trade no registro explica e deixa cancelar', () => {
    const m = msgAvisoDayTrade('BBDC4', 'buy');
    expect(m).toContain('day trade');
    expect(m).toContain('20% de imposto');
    expect(m).toContain('cancelar');
  });

  it('fim de mês com estouro mostra imposto e DARF em linguagem simples', () => {
    const m = msgFimDeMes({ mesLabel: '06/2026', vendidoMes: 25000, isento: false, imposto: 1123.88, darfVencimento: '31/07', sugestoes: [], adiar: [], naoCompensa: [] });
    expect(m).toContain('passou do limite');
    expect(m).toContain('guia');
    expect(m).toContain('31/07');
  });

  it('fim de mês mostra seção de adiar e de não-compensa', () => {
    const m = msgFimDeMes({
      mesLabel: '06/2026', vendidoMes: 0, isento: true,
      sugestoes: [{ ticker: 'CYRE3', quantidade: 100, ganhoLivre: 500, custoGiro: 1.2 }],
      adiar: [{ ticker: 'ITUB3', dataEx: '2026-07-01', eventType: 'JUROS SOBRE CAPITAL PRÓPRIO' }],
      naoCompensa: [{ ticker: 'WEGE3', custoGiro: 11.94, beneficioPotencial: 8.96 }],
    });
    expect(m).toContain('só gire depois de 01/07');
    expect(m).toContain('girar não compensa');
    expect(m).toContain('WEGE3');
  });
});

describe('analisarFimDeMes — adiar por data-ex e não-compensa (pedido do revisor)', () => {
  const base = (over: Partial<FullState>): FullState => ({
    trades: [], events: [], assetClass: {}, precos: new Map(),
    carryforwardSwing: new Decimal(0), duePending: new Decimal(0),
    proventos: new Map(), volumeMedio: new Map(), ...over,
  });
  const prov = (dataEx: string, eventType = 'JUROS SOBRE CAPITAL PRÓPRIO'): ProventoProximo =>
    ({ comDate: '2026-06-30', dataEx, eventType });

  it('ADIA a ação com data-ex dentro da janela de giro (recompra cairia ex)', async () => {
    const st = base({
      trades: [buy('ITUB3', '2026-01-01', 490, 37.81, 0, 'swing')], // saldo de abertura via buy
      assetClass: { ITUB3: 'acao' },
      precos: new Map([['ITUB3', new Decimal(44.5)]]),
      proventos: new Map([['ITUB3', prov('2026-07-01')]]), // data-ex amanhã = dia da recompra
    });
    st.trades[0]!.isOpening = true;
    const r = await analisarFimDeMes(2026, 6, '2026-06-30', st);
    expect(r.adiar.length).toBe(1);
    expect(r.adiar[0]!.ticker).toBe('ITUB3');
    expect(r.adiar[0]!.dataEx).toBe('2026-07-01');
    expect(r.sugestoes.find((s) => s.ticker === 'ITUB3')).toBeUndefined(); // não sugere
  });

  it('NÃO sugere quando o custo do giro supera o imposto economizado', async () => {
    // ganho 199×0,30 = 59,70 (>R$50); valor 19.900 → custo 11,94; benefício 8,96 → não compensa
    const st = base({
      trades: [buy('XPTO3', '2026-01-01', 1000, 99.7, 0, 'swing')],
      assetClass: { XPTO3: 'acao' },
      precos: new Map([['XPTO3', new Decimal(100)]]),
    });
    st.trades[0]!.isOpening = true;
    const r = await analisarFimDeMes(2026, 6, '2026-06-30', st);
    expect(r.naoCompensa.length).toBe(1);
    expect(r.naoCompensa[0]!.ticker).toBe('XPTO3');
    expect(r.sugestoes.length).toBe(0);
  });

  it('sugere normalmente quando vale a pena e não há provento no caminho', async () => {
    const st = base({
      trades: [buy('CYRE3', '2026-01-01', 1280, 28.07, 0, 'swing')],
      assetClass: { CYRE3: 'acao' },
      precos: new Map([['CYRE3', new Decimal(35)]]),
    });
    st.trades[0]!.isOpening = true;
    const r = await analisarFimDeMes(2026, 6, '2026-06-30', st);
    expect(r.sugestoes.length).toBe(1);
    expect(r.sugestoes[0]!.ticker).toBe('CYRE3');
    expect(r.adiar.length).toBe(0);
    expect(r.naoCompensa.length).toBe(0);
  });
});

describe('janela de um dia: data-com no dia seguinte à venda (pedido do revisor)', () => {
  const base = (over: Partial<FullState>): FullState => ({
    trades: [], events: [], assetClass: {}, precos: new Map(),
    carryforwardSwing: new Decimal(0), duePending: new Decimal(0),
    proventos: new Map(), volumeMedio: new Map(), ...over,
  });

  it('vender hoje com data-com AMANHÃ: sem conflito, recompra obrigatória na data-com', async () => {
    // hoje 29/06 (seg), data-com 30/06 (ter, próximo dia útil) → recomprar em 30/06 mantém
    const st = base({
      trades: [{ ticker: 'ITUB3', side: 'buy', tradeDate: '2026-01-01', quantity: 490, priceBrl: 37.81, feesBrl: 0, nature: 'swing', isOpening: true }],
      assetClass: { ITUB3: 'acao' },
      precos: new Map([['ITUB3', new Decimal(44.5)]]),
      proventos: new Map([['ITUB3', { comDate: '2026-06-30', dataEx: '2026-07-01', eventType: 'JUROS SOBRE CAPITAL PRÓPRIO' }]]),
    });
    const ops = await detectarOportunidades(2026, 6, '2026-06-29', st);
    const o = ops.find((x) => x.ticker === 'ITUB3')!;
    expect(o.proventoConflito).toBe(false); // recompra em 30/06 (a própria data-com) mantém
    expect(o.recompraData).toBe('2026-06-30'); // recompra obrigatória nesse dia exato
  });

  it('vender NO dia da data-com força recompra ex: conflito', async () => {
    // hoje 30/06 (data-com); recompra seria 01/07 (data-ex) → perde
    const st = base({
      trades: [{ ticker: 'ITUB3', side: 'buy', tradeDate: '2026-01-01', quantity: 490, priceBrl: 37.81, feesBrl: 0, nature: 'swing', isOpening: true }],
      assetClass: { ITUB3: 'acao' },
      precos: new Map([['ITUB3', new Decimal(44.5)]]),
      proventos: new Map([['ITUB3', { comDate: '2026-06-30', dataEx: '2026-07-01', eventType: 'JUROS SOBRE CAPITAL PRÓPRIO' }]]),
    });
    const ops = await detectarOportunidades(2026, 6, '2026-06-30', st);
    const o = ops.find((x) => x.ticker === 'ITUB3')!;
    expect(o.proventoConflito).toBe(true);
  });
});

describe('arredondamento monetário (decimal, 2 casas)', () => {
  it('soma de muitos centavos não acumula erro de float', () => {
    const trades: Trade[] = [];
    for (let i = 0; i < 10; i++) trades.push(buy('BBDC4', '2026-05-01', 1, 0.1, 0));
    const { positions } = reconstructLedger(trades, [], ACAO);
    expect(positions.get('BBDC4')!.pm.toFixed(2)).toBe('0.10');
    expect(positions.get('BBDC4')!.quantity).toBe(10);
  });
});
