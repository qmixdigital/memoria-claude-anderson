import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
  executarOrdem,
  aplicarFill,
  patrimonio,
  precoComSlippage,
  custos,
} from '@qmix-invest/db/paper/execucao';
import { CUSTOS_PADRAO, type Bar, type EstadoConta } from '@qmix-invest/db/paper/types';

const D = (v: Decimal.Value) => new Decimal(v);

function barra(over: Partial<Bar> = {}): Bar {
  return {
    ticker: 'PETR4',
    date: '2026-09-03',
    open: D('48.46'),
    high: D('49.19'),
    low: D('47.45'),
    close: D('47.56'),
    volume: 51488400,
    financeiro: D('2000000000'),
    ...over,
  };
}

function conta(caixa = '100000', posicoes: Array<[string, number, string]> = []): EstadoConta {
  return {
    caixa: D(caixa),
    posicoes: new Map(
      posicoes.map(([t, q, pm]) => [t, { ticker: t, quantidade: q, precoMedio: D(pm) }])
    ),
  };
}

describe('slippage e custos', () => {
  it('compra sai mais cara e venda mais barata', () => {
    expect(precoComSlippage(D('100'), 'buy', 0.0015).toString()).toBe('100.15');
    expect(precoComSlippage(D('100'), 'sell', 0.0015).toString()).toBe('99.85');
  });

  it('emolumentos sao 0,03% do financeiro', () => {
    const { emolumentos } = custos(D('10000'), CUSTOS_PADRAO);
    expect(emolumentos.toString()).toBe('3');
  });
});

describe('ordem a mercado', () => {
  it('executa na abertura com slippage e desconta caixa com custos', () => {
    const { fill, rejeicao } = executarOrdem(
      { ticker: 'PETR4', side: 'buy', tipo: 'market', quantidade: 100 },
      barra(),
      conta()
    );
    expect(rejeicao).toBeNull();
    // 48.46 * 1.0015 = 48.5327
    expect(fill!.precoExec.toString()).toBe('48.5327');
    // financeiro 4853.27 + emolumentos 1.456 -> saida de caixa
    expect(fill!.caixaDelta.isNegative()).toBe(true);
    expect(fill!.caixaDelta.abs().gt(D('4853.27'))).toBe(true);
  });

  it('rejeita compra sem caixa', () => {
    const r = executarOrdem(
      { ticker: 'PETR4', side: 'buy', tipo: 'market', quantidade: 100 },
      barra(),
      conta('100')
    );
    expect(r.rejeicao).toBe('caixa_insuficiente');
    expect(r.fill).toBeNull();
  });

  it('rejeita venda sem posicao — nao ha venda a descoberto', () => {
    const r = executarOrdem(
      { ticker: 'PETR4', side: 'sell', tipo: 'market', quantidade: 100 },
      barra(),
      conta()
    );
    expect(r.rejeicao).toBe('posicao_insuficiente');
  });

  it('rejeita ordem grande demais para o volume do dia', () => {
    const r = executarOrdem(
      { ticker: 'PETR4', side: 'buy', tipo: 'market', quantidade: 100000 },
      barra({ financeiro: D('100000') }),
      conta('99999999')
    );
    expect(r.rejeicao).toBe('sem_liquidez');
  });

  it('rejeita quantidade zero ou fracionaria', () => {
    expect(
      executarOrdem(
        { ticker: 'PETR4', side: 'buy', tipo: 'market', quantidade: 0 },
        barra(),
        conta()
      ).rejeicao
    ).toBe('quantidade_invalida');
    expect(
      executarOrdem(
        { ticker: 'PETR4', side: 'buy', tipo: 'market', quantidade: 1.5 },
        barra(),
        conta()
      ).rejeicao
    ).toBe('quantidade_invalida');
  });

  it('rejeita quando nao ha barra — pregao sem negocio no papel', () => {
    const r = executarOrdem(
      { ticker: 'PETR4', side: 'buy', tipo: 'market', quantidade: 100 },
      null,
      conta()
    );
    expect(r.rejeicao).toBe('sem_barra');
  });
});

describe('ordem limite', () => {
  it('compra so executa se a minima tocou o limite', () => {
    const naoTocou = executarOrdem(
      { ticker: 'PETR4', side: 'buy', tipo: 'limit', quantidade: 100, precoLimite: D('47.00') },
      barra(), // low 47.45
      conta()
    );
    expect(naoTocou.rejeicao).toBe('limite_nao_atingido');

    const tocou = executarOrdem(
      { ticker: 'PETR4', side: 'buy', tipo: 'limit', quantidade: 100, precoLimite: D('47.50') },
      barra(),
      conta()
    );
    expect(tocou.rejeicao).toBeNull();
    // limite nao sofre slippage: executa no proprio preco
    expect(tocou.fill!.precoExec.toString()).toBe('47.5');
  });

  it('venda so executa se a maxima tocou o limite', () => {
    const est = conta('0', [['PETR4', 100, '40']]);
    expect(
      executarOrdem(
        { ticker: 'PETR4', side: 'sell', tipo: 'limit', quantidade: 100, precoLimite: D('50.00') },
        barra(), // high 49.19
        est
      ).rejeicao
    ).toBe('limite_nao_atingido');

    expect(
      executarOrdem(
        { ticker: 'PETR4', side: 'sell', tipo: 'limit', quantidade: 100, precoLimite: D('49.00') },
        barra(),
        est
      ).rejeicao
    ).toBeNull();
  });
});

describe('aplicacao no estado', () => {
  it('preco medio da compra INCLUI os custos', () => {
    const est = conta();
    const { fill } = executarOrdem(
      { ticker: 'PETR4', side: 'buy', tipo: 'market', quantidade: 100 },
      barra(),
      est
    );
    const novo = aplicarFill(est, fill!);
    const pos = novo.posicoes.get('PETR4')!;
    expect(pos.quantidade).toBe(100);
    // preco de execucao foi 48.5327; com emolumentos o PM fica acima disso
    expect(pos.precoMedio.gt(D('48.5327'))).toBe(true);
  });

  it('venda parcial mantem o preco medio e reduz a quantidade', () => {
    const est = conta('0', [['PETR4', 200, '40']]);
    const { fill } = executarOrdem(
      { ticker: 'PETR4', side: 'sell', tipo: 'market', quantidade: 50 },
      barra(),
      est
    );
    const novo = aplicarFill(est, fill!);
    const pos = novo.posicoes.get('PETR4')!;
    expect(pos.quantidade).toBe(150);
    expect(pos.precoMedio.toString()).toBe('40');
    expect(novo.caixa.gt(0)).toBe(true);
  });

  it('venda total remove a posicao', () => {
    const est = conta('0', [['PETR4', 100, '40']]);
    const { fill } = executarOrdem(
      { ticker: 'PETR4', side: 'sell', tipo: 'market', quantidade: 100 },
      barra(),
      est
    );
    expect(aplicarFill(est, fill!).posicoes.has('PETR4')).toBe(false);
  });

  it('nao muta o estado recebido', () => {
    const est = conta();
    const { fill } = executarOrdem(
      { ticker: 'PETR4', side: 'buy', tipo: 'market', quantidade: 100 },
      barra(),
      est
    );
    aplicarFill(est, fill!);
    expect(est.caixa.toString()).toBe('100000');
    expect(est.posicoes.size).toBe(0);
  });
});

describe('patrimonio', () => {
  it('soma caixa e posicoes marcadas a mercado', () => {
    const est = conta('1000', [['PETR4', 100, '40']]);
    const p = patrimonio(est, new Map([['PETR4', D('50')]]));
    expect(p.valorPosicoes.toString()).toBe('5000');
    expect(p.total.toString()).toBe('6000');
  });

  it('usa o preco medio quando falta cotacao, em vez de zerar a posicao', () => {
    const est = conta('1000', [['PETR4', 100, '40']]);
    expect(patrimonio(est, new Map()).total.toString()).toBe('5000');
  });
});

describe('custo real vs ingenuo', () => {
  it('girar posicao consome capital mesmo com preco parado', () => {
    // Compra e vende no mesmo preco de referencia: sem slippage e sem custo o
    // resultado seria zero. Com os dois, o giro destroi capital — e por isso
    // que estrategia de alta frequencia precisa de margem grande pra sobreviver.
    let est = conta('100000');
    const b = barra({ open: D('50'), low: D('49'), high: D('51'), financeiro: D('1e9') });

    const compra = executarOrdem(
      { ticker: 'PETR4', side: 'buy', tipo: 'market', quantidade: 1000 },
      b,
      est
    );
    est = aplicarFill(est, compra.fill!);

    const venda = executarOrdem(
      { ticker: 'PETR4', side: 'sell', tipo: 'market', quantidade: 1000 },
      b,
      est
    );
    est = aplicarFill(est, venda.fill!);

    expect(est.caixa.lt(D('100000'))).toBe(true);
    // ~0,3% do giro: 0,15% de slippage em cada ponta, mais emolumentos
    const perda = D('100000').minus(est.caixa);
    expect(perda.gt(D('130'))).toBe(true);
    expect(perda.lt(D('200'))).toBe(true);
  });
});
