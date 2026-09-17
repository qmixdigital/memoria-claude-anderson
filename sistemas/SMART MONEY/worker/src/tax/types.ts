import Decimal from 'decimal.js';

export type Side = 'buy' | 'sell';
export type Nature = 'swing' | 'day';
export type AssetClass = 'acao' | 'fii' | 'etf' | 'bdr' | 'outro';
export type EventType = 'split' | 'reverse_split' | 'bonus' | 'subscription' | 'adjust';

// ── Entradas ────────────────────────────────────────────────────────────────

export interface Trade {
  ticker: string;
  side: Side;
  tradeDate: string; // YYYY-MM-DD
  quantity: number;
  priceBrl: string | number; // preço unitário
  feesBrl: string | number; // corretagem + emolumentos do trade
  nature: Nature;
  isOpening?: boolean;
}

export interface CorporateEvent {
  ticker: string;
  eventDate: string; // YYYY-MM-DD
  eventType: EventType;
  factor?: string | number | null; // split (2 = 1:2) / reverse_split
  newQuantity?: number | null; // adjust/bonus/subscription (qtd resultante)
  newPmBrl?: string | number | null; // adjust/bonus/subscription (PM resultante)
}

export type AssetClassMap = Record<string, AssetClass>;

// ── Resultados ──────────────────────────────────────────────────────────────

// Posição reconstruída de um ticker num dado momento.
export interface Position {
  ticker: string;
  quantity: number;
  pm: Decimal; // preço médio (custo unitário, já com corretagem de compra embutida)
}

// Resultado de uma venda individual (já com fee da venda abatido).
export interface SaleResult {
  ticker: string;
  date: string;
  quantity: number;
  assetClass: AssetClass;
  nature: Nature;
  natureInferred: boolean; // day trade inferido (compra+venda mesmo dia/ticker)
  grossBrl: Decimal; // preço × qtd (valor de alienação bruto)
  feesBrl: Decimal; // corretagem da venda
  netSaleBrl: Decimal; // gross − fees
  costBrl: Decimal; // pm × qtd (custo de aquisição)
  profitBrl: Decimal; // netSale − cost (lucro líquido da venda)
}
