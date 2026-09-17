// Reconstrução do preço médio a partir do ledger (fonte de verdade fiscal).
// Processa trades + eventos corporativos em ordem cronológica, mantendo
// quantidade e PM por ticker, e emite o resultado de cada venda.
//
// Regras-chave (revisadas):
// - Compra: a corretagem ENTRA no custo → sobe o PM (preço + fees) / qtd.
// - Venda: a corretagem ABATE da venda (gross − fees); lucro = netSale − PM×qtd.
// - Step-up: vender e recomprar reposiciona o PM pela recompra (sem wash sale no Brasil).
// - Day trade (compra+venda do mesmo ticker no mesmo dia) é DETECTADO e marcado como
//   trava de segurança (nature='day', natureInferred=true). A apuração avisa e não
//   aplica isenção sobre ele. A apuração de 20% está fora do escopo atual.

import Decimal from 'decimal.js';
import type { Trade, CorporateEvent, AssetClassMap, Position, SaleResult } from './types.js';

function applyEvent(p: Position, e: CorporateEvent): void {
  switch (e.eventType) {
    case 'split': {
      // desdobramento 1:factor — qtd × factor, pm ÷ factor
      const f = new Decimal(e.factor ?? 1);
      if (f.gt(0)) {
        p.quantity = Math.round(p.quantity * f.toNumber());
        p.pm = p.pm.div(f);
      }
      break;
    }
    case 'reverse_split': {
      // grupamento factor:1 — qtd ÷ factor, pm × factor
      const f = new Decimal(e.factor ?? 1);
      if (f.gt(0)) {
        p.quantity = Math.round(p.quantity / f.toNumber());
        p.pm = p.pm.times(f);
      }
      break;
    }
    case 'bonus':
    case 'subscription':
    case 'adjust': {
      // ajuste absoluto: define qtd e/ou PM resultantes
      if (e.newQuantity != null) p.quantity = e.newQuantity;
      if (e.newPmBrl != null) p.pm = new Decimal(e.newPmBrl);
      break;
    }
  }
}

export interface ReconstructResult {
  sales: SaleResult[];
  positions: Map<string, Position>;
}

export function reconstructLedger(
  trades: Trade[],
  events: CorporateEvent[],
  assetClass: AssetClassMap,
): ReconstructResult {
  // Detecta day trade: pares (ticker, data) que têm compra E venda no mesmo dia.
  // O saldo de abertura (is_opening) NÃO dispara a inferência — senão uma venda no
  // dia da ativação do módulo seria marcada como day trade por engano.
  const buyDays = new Set<string>();
  const sellDays = new Set<string>();
  for (const t of trades) {
    if (t.isOpening) continue;
    const k = `${t.ticker}|${t.tradeDate}`;
    if (t.side === 'buy') buyDays.add(k);
    else sellDays.add(k);
  }
  const dayTradeKeys = new Set<string>();
  for (const k of sellDays) if (buyDays.has(k)) dayTradeKeys.add(k);

  // Timeline única ordenada por data; no mesmo dia: eventos → compras → vendas.
  type Item =
    | { date: string; order: number; kind: 'event'; event: CorporateEvent }
    | { date: string; order: number; kind: 'buy' | 'sell'; trade: Trade };
  const items: Item[] = [];
  for (const e of events) items.push({ date: e.eventDate, order: 0, kind: 'event', event: e });
  for (const t of trades) {
    items.push({ date: t.tradeDate, order: t.side === 'buy' ? 1 : 2, kind: t.side, trade: t });
  }
  items.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.order - b.order));

  const positions = new Map<string, Position>();
  const getPos = (ticker: string): Position => {
    let p = positions.get(ticker);
    if (!p) {
      p = { ticker, quantity: 0, pm: new Decimal(0) };
      positions.set(ticker, p);
    }
    return p;
  };

  const sales: SaleResult[] = [];

  for (const it of items) {
    if (it.kind === 'event') {
      applyEvent(getPos(it.event.ticker), it.event);
      continue;
    }
    const t = it.trade;
    const p = getPos(t.ticker);
    const qty = t.quantity;

    if (it.kind === 'buy') {
      // fee de compra entra no custo → PM ponderado
      const cost = new Decimal(t.priceBrl).times(qty).plus(t.feesBrl);
      const totalCost = p.pm.times(p.quantity).plus(cost);
      const newQty = p.quantity + qty;
      p.pm = newQty > 0 ? totalCost.div(newQty) : new Decimal(0);
      p.quantity = newQty;
    } else {
      // venda: fee abate; lucro = (gross − fee) − PM×qtd
      const gross = new Decimal(t.priceBrl).times(qty);
      const fees = new Decimal(t.feesBrl);
      const netSale = gross.minus(fees);
      const cost = p.pm.times(qty);
      const profit = netSale.minus(cost);
      const key = `${t.ticker}|${t.tradeDate}`;
      const isDay = dayTradeKeys.has(key);
      sales.push({
        ticker: t.ticker,
        date: t.tradeDate,
        quantity: qty,
        assetClass: assetClass[t.ticker] ?? 'outro',
        nature: isDay ? 'day' : t.nature,
        natureInferred: isDay && t.nature !== 'day',
        grossBrl: gross,
        feesBrl: fees,
        netSaleBrl: netSale,
        costBrl: cost,
        profitBrl: profit,
      });
      p.quantity = Math.max(0, p.quantity - qty); // PM mantém na venda parcial
    }
  }

  return { sales, positions };
}
