import Decimal from 'decimal.js';

export type Side = 'buy' | 'sell';
/**
 * market: executa na abertura da barra, com slippage.
 * limit:  executa no preco do limite, se a barra o tocou. Sem slippage.
 * stop:   dispara quando a barra fura o preco (venda: minima <= stop). Executa
 *         COM slippage, porque stop e ordem a mercado depois de disparado — e
 *         costuma pegar o pior momento do movimento.
 */
export type OrderType = 'market' | 'limit' | 'stop';

/** Barra diaria vinda de prices_daily. */
export interface Bar {
  ticker: string;
  date: string; // YYYY-MM-DD
  open: Decimal;
  high: Decimal;
  low: Decimal;
  close: Decimal;
  volume: number;
  financeiro: Decimal; // volume financeiro do dia, em BRL
}

export interface Ordem {
  id?: number;
  ticker: string;
  side: Side;
  tipo: OrderType;
  quantidade: number;
  /** Preco do limite (tipo 'limit') ou do disparo (tipo 'stop'). */
  precoLimite?: Decimal | null;
  razao?: string | null;
}

export interface Fill {
  ticker: string;
  side: Side;
  quantidade: number;
  precoBruto: Decimal;
  precoExec: Decimal;
  emolumentos: Decimal;
  corretagem: Decimal;
  /** Negativo na compra, positivo na venda, ja liquido de custos. */
  caixaDelta: Decimal;
}

export type MotivoRejeicao =
  | 'sem_barra'
  | 'caixa_insuficiente'
  | 'posicao_insuficiente'
  | 'limite_nao_atingido'
  | 'sem_liquidez'
  | 'quantidade_invalida';

export interface ResultadoExecucao {
  fill: Fill | null;
  rejeicao: MotivoRejeicao | null;
}

export interface Posicao {
  ticker: string;
  quantidade: number;
  precoMedio: Decimal;
}

/** Estado da conta que o motor le e devolve alterado. */
export interface EstadoConta {
  caixa: Decimal;
  posicoes: Map<string, Posicao>;
}

export interface CustosConfig {
  /** Emolumentos + liquidacao da B3, fracao do financeiro. Ex: 0.0003 = 0,03%. */
  taxaB3: number;
  /** Corretagem fixa por ordem, em BRL. */
  corretagemFixa: number;
  /**
   * Slippage aplicado a ordem a mercado, fracao do preco. Compra executa mais
   * caro, venda mais barato. Backtest sem slippage e a forma mais comum de
   * produzir um resultado bonito e irreal.
   */
  slippage: number;
  /**
   * Teto de participacao no volume financeiro do dia. Uma ordem maior que isso
   * moveria o mercado e nao seria executada ao preco da barra.
   */
  maxParticipacaoVolume: number;
}

export const CUSTOS_PADRAO: CustosConfig = {
  taxaB3: 0.0003,
  corretagemFixa: 0,
  slippage: 0.0015,
  maxParticipacaoVolume: 0.01,
};
