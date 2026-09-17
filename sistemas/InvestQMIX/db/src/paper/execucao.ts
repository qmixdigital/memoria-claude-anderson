import Decimal from 'decimal.js';
import {
  CUSTOS_PADRAO,
  type Bar,
  type CustosConfig,
  type EstadoConta,
  type Fill,
  type Ordem,
  type Posicao,
  type ResultadoExecucao,
} from './types.js';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = new Decimal(0);
const dinheiro = (d: Decimal) => d.toDecimalPlaces(4, Decimal.ROUND_HALF_UP);

/**
 * Preco de execucao de uma ordem a mercado, com slippage contra o operador:
 * compra sai mais cara, venda sai mais barata. Backtest que executa no preco
 * exato da barra e otimista e ensina a coisa errada.
 */
export function precoComSlippage(
  referencia: Decimal,
  side: 'buy' | 'sell',
  slippage: number
): Decimal {
  const fator = side === 'buy' ? 1 + slippage : 1 - slippage;
  return dinheiro(referencia.times(fator));
}

/** Emolumentos + liquidacao da B3 sobre o financeiro, mais corretagem fixa. */
export function custos(
  financeiro: Decimal,
  cfg: CustosConfig
): { emolumentos: Decimal; corretagem: Decimal } {
  return {
    emolumentos: dinheiro(financeiro.times(cfg.taxaB3)),
    corretagem: dinheiro(D(cfg.corretagemFixa)),
  };
}

/**
 * Executa UMA ordem contra UMA barra e devolve o fill ou o motivo da rejeicao.
 *
 * Funcao pura: nao toca banco e nao altera o estado recebido. Quem persiste e
 * quem aplica o resultado sao as camadas de cima — e e isso que permite o mesmo
 * codigo servir ao backtest e ao paper ao vivo.
 *
 * Regras de preenchimento:
 *  - market: executa na abertura da barra, com slippage.
 *  - limit de compra: so executa se a minima da barra tocou o limite.
 *  - limit de venda: so executa se a maxima da barra tocou o limite.
 *    Em ordem limite nao se aplica slippage: o preco e o proprio limite.
 */
export function executarOrdem(
  ordem: Ordem,
  barra: Bar | null,
  estado: EstadoConta,
  cfg: CustosConfig = CUSTOS_PADRAO
): ResultadoExecucao {
  if (!Number.isInteger(ordem.quantidade) || ordem.quantidade <= 0) {
    return { fill: null, rejeicao: 'quantidade_invalida' };
  }
  if (!barra) return { fill: null, rejeicao: 'sem_barra' };

  const qtd = D(ordem.quantidade);

  // Preco de referencia e de execucao
  let precoBruto: Decimal;
  let precoExec: Decimal;

  if (ordem.tipo === 'limit') {
    const limite = ordem.precoLimite;
    if (!limite) return { fill: null, rejeicao: 'limite_nao_atingido' };
    const tocou =
      ordem.side === 'buy' ? barra.low.lte(limite) : barra.high.gte(limite);
    if (!tocou) return { fill: null, rejeicao: 'limite_nao_atingido' };
    precoBruto = limite;
    precoExec = limite;
  } else if (ordem.tipo === 'stop') {
    const disparo = ordem.precoLimite;
    if (!disparo) return { fill: null, rejeicao: 'limite_nao_atingido' };
    // Venda dispara quando a minima fura pra baixo; compra, quando a maxima
    // rompe pra cima.
    const disparou =
      ordem.side === 'sell' ? barra.low.lte(disparo) : barra.high.gte(disparo);
    if (!disparou) return { fill: null, rejeicao: 'limite_nao_atingido' };

    // Gap contra o operador: se a barra ABRIU pior que o stop, a execucao sai
    // na abertura, nao no preco do stop. Assumir que todo stop executa no preco
    // exato e a mentira mais comum de backtest — no gap de baixa nao existe
    // comprador no seu preco.
    const piorQueStop =
      ordem.side === 'sell' ? barra.open.lt(disparo) : barra.open.gt(disparo);
    precoBruto = piorQueStop ? barra.open : disparo;
    precoExec = precoComSlippage(precoBruto, ordem.side, cfg.slippage);
  } else {
    precoBruto = barra.open;
    precoExec = precoComSlippage(barra.open, ordem.side, cfg.slippage);
  }

  const financeiro = dinheiro(precoExec.times(qtd));

  // Liquidez: ordem grande demais nao sai ao preco da barra.
  const teto = barra.financeiro.times(cfg.maxParticipacaoVolume);
  if (barra.financeiro.gt(0) && financeiro.gt(teto)) {
    return { fill: null, rejeicao: 'sem_liquidez' };
  }

  const { emolumentos, corretagem } = custos(financeiro, cfg);
  const custoTotal = emolumentos.plus(corretagem);

  if (ordem.side === 'buy') {
    const desembolso = financeiro.plus(custoTotal);
    if (desembolso.gt(estado.caixa)) {
      return { fill: null, rejeicao: 'caixa_insuficiente' };
    }
    return {
      fill: {
        ticker: ordem.ticker,
        side: 'buy',
        quantidade: ordem.quantidade,
        precoBruto,
        precoExec,
        emolumentos,
        corretagem,
        caixaDelta: desembolso.negated(),
      },
      rejeicao: null,
    };
  }

  // venda: nao ha venda a descoberto neste simulador
  const posicao = estado.posicoes.get(ordem.ticker);
  if (!posicao || posicao.quantidade < ordem.quantidade) {
    return { fill: null, rejeicao: 'posicao_insuficiente' };
  }

  return {
    fill: {
      ticker: ordem.ticker,
      side: 'sell',
      quantidade: ordem.quantidade,
      precoBruto,
      precoExec,
      emolumentos,
      corretagem,
      caixaDelta: financeiro.minus(custoTotal),
    },
    rejeicao: null,
  };
}

/**
 * Aplica um fill ao estado, devolvendo um estado NOVO.
 *
 * Na compra os custos entram no preco medio, como manda a apuracao de ganho de
 * capital. Na venda o preco medio nao muda: so a quantidade cai.
 */
export function aplicarFill(estado: EstadoConta, fill: Fill): EstadoConta {
  const posicoes = new Map(estado.posicoes);
  const atual: Posicao = posicoes.get(fill.ticker) ?? {
    ticker: fill.ticker,
    quantidade: 0,
    precoMedio: ZERO,
  };

  if (fill.side === 'buy') {
    const custoAntigo = D(atual.quantidade).times(atual.precoMedio);
    const custoNovo = fill.caixaDelta.abs(); // ja inclui emolumentos
    const qtdNova = atual.quantidade + fill.quantidade;
    posicoes.set(fill.ticker, {
      ticker: fill.ticker,
      quantidade: qtdNova,
      precoMedio: dinheiro(custoAntigo.plus(custoNovo).div(qtdNova)),
    });
  } else {
    const qtdNova = atual.quantidade - fill.quantidade;
    if (qtdNova <= 0) posicoes.delete(fill.ticker);
    else posicoes.set(fill.ticker, { ...atual, quantidade: qtdNova });
  }

  return { caixa: dinheiro(estado.caixa.plus(fill.caixaDelta)), posicoes };
}

/** Resultado realizado de uma venda, para apuracao de imposto. */
export function resultadoVenda(
  estado: EstadoConta,
  fill: Fill
): { bruto: Decimal; custo: Decimal; lucro: Decimal } | null {
  if (fill.side !== 'sell') return null;
  const posicao = estado.posicoes.get(fill.ticker);
  if (!posicao) return null;
  const bruto = fill.caixaDelta; // liquido de custos de venda
  const custo = posicao.precoMedio.times(fill.quantidade);
  return { bruto, custo, lucro: dinheiro(bruto.minus(custo)) };
}

/** Patrimonio = caixa + posicoes marcadas a mercado. */
export function patrimonio(
  estado: EstadoConta,
  precos: Map<string, Decimal>
): { caixa: Decimal; valorPosicoes: Decimal; total: Decimal } {
  let valorPosicoes = ZERO;
  for (const p of estado.posicoes.values()) {
    const preco = precos.get(p.ticker) ?? p.precoMedio;
    valorPosicoes = valorPosicoes.plus(preco.times(p.quantidade));
  }
  return {
    caixa: estado.caixa,
    valorPosicoes: dinheiro(valorPosicoes),
    total: dinheiro(estado.caixa.plus(valorPosicoes)),
  };
}
