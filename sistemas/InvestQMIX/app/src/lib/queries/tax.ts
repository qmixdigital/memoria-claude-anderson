import Decimal from 'decimal.js';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { reconstructLedger } from '@qmix-invest/db/tax/ledger';
import { apurarMes, type ApuracaoResult } from '@qmix-invest/db/tax/apuracao';
import { TAX_CONFIG } from '@qmix-invest/db/tax/config';
import type { Trade, CorporateEvent, AssetClassMap, AssetClass } from '@qmix-invest/db/tax/types';

/**
 * Camada de leitura fiscal do app.
 *
 * O calculo NAO e reimplementado aqui: o motor puro mora em @qmix-invest/db/tax
 * e e o mesmo que o worker usa para os alertas. Esta camada so busca o estado no
 * banco e chama o motor, pra tela e Telegram nunca divergirem no numero.
 */

type Row = Record<string, unknown>;

async function loadTrades(): Promise<Trade[]> {
  const rows = (await db.execute(sql`
    select ticker, side, trade_date::text as trade_date, quantity,
           price_brl::text as price_brl, fees_brl::text as fees_brl,
           nature, is_opening
      from qmix_invest.trades
     order by trade_date, id
  `)) as unknown as Row[];
  return rows.map((r) => ({
    ticker: r.ticker as string,
    side: r.side as 'buy' | 'sell',
    tradeDate: r.trade_date as string,
    quantity: Number(r.quantity),
    priceBrl: r.price_brl as string,
    feesBrl: r.fees_brl as string,
    nature: r.nature as 'swing' | 'day',
    isOpening: r.is_opening as boolean,
  }));
}

async function loadEvents(): Promise<CorporateEvent[]> {
  const rows = (await db.execute(sql`
    select ticker, event_date::text as event_date, event_type,
           factor::text as factor, new_quantity, new_pm_brl::text as new_pm_brl
      from qmix_invest.corporate_events
     order by event_date, id
  `)) as unknown as Row[];
  return rows.map((r) => ({
    ticker: r.ticker as string,
    eventDate: r.event_date as string,
    eventType: r.event_type as CorporateEvent['eventType'],
    factor: (r.factor as string | null) ?? null,
    newQuantity: r.new_quantity != null ? Number(r.new_quantity) : null,
    newPmBrl: (r.new_pm_brl as string | null) ?? null,
  }));
}

async function loadAssetClasses(): Promise<AssetClassMap> {
  const rows = (await db.execute(sql`
    select ticker, asset_class from qmix_invest.tickers where asset_class is not null
  `)) as unknown as Array<{ ticker: string; asset_class: string }>;
  const map: AssetClassMap = {};
  for (const r of rows) map[r.ticker] = r.asset_class as AssetClass;
  return map;
}

async function loadAmount(tabela: 'tax_loss_carryforward' | 'tax_due_pending'): Promise<Decimal> {
  const rows = (await db.execute(
    tabela === 'tax_loss_carryforward'
      ? sql`select amount_brl::text as a from qmix_invest.tax_loss_carryforward where nature = 'swing'`
      : sql`select amount_brl::text as a from qmix_invest.tax_due_pending where nature = 'swing'`
  )) as unknown as Array<{ a: string }>;
  return new Decimal(rows[0]?.a ?? '0');
}

export interface DarfRegistro {
  id: number;
  competencia: string;
  codigoReceita: string;
  valorTotal: number;
  dataPagamento: string | null;
  observacoes: string | null;
}

async function loadDarfs(): Promise<DarfRegistro[]> {
  const rows = (await db.execute(sql`
    select id, competencia::text as competencia, codigo_receita,
           valor_total::text as valor_total, data_pagamento::text as data_pagamento, observacoes
      from qmix_invest.darfs
     order by competencia desc
  `)) as unknown as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    competencia: r.competencia as string,
    codigoReceita: r.codigo_receita as string,
    valorTotal: Number(r.valor_total),
    dataPagamento: (r.data_pagamento as string | null) ?? null,
    observacoes: (r.observacoes as string | null) ?? null,
  }));
}

/** Numeros de um mes, ja convertidos de Decimal para number (Server Component). */
export interface MesApurado {
  mes: string;
  vendidoAcao: number;
  lucroAcao: number;
  isento: boolean;
  pctDoTeto: number;
  prejuizoUsado: number;
  impostoAcao: number;
  lucroFii: number;
  impostoFii: number;
  impostoTotal: number;
  darfValor: number | null;
  darfVencimento: string | null;
  prejuizoAcumuladoDepois: number;
  temDayTrade: boolean;
  darfPaga: DarfRegistro | null;
}

export interface TaxView {
  meses: MesApurado[];
  /** Estoque apurado encadeando os meses do ledger — o numero que vale. */
  prejuizoAcumulado: number;
  /** O que esta gravado em tax_loss_carryforward, para comparacao. */
  prejuizoAcumuladoGravado: number;
  divergenciaCarryforward: boolean;
  impostoPendente: number;
  limiteIsencao: number;
  mesCorrente: MesApurado | null;
  totalDarfPago: number;
  darfsNaoConciliadas: DarfRegistro[];
  semOperacoes: boolean;
}

const n = (d: Decimal) => d.toDecimalPlaces(2).toNumber();

function paraMes(a: ApuracaoResult, darf: DarfRegistro | null): MesApurado {
  return {
    mes: a.mes,
    vendidoAcao: n(a.acao.vendidoBruto),
    lucroAcao: n(a.acao.lucro),
    isento: a.acao.isento,
    pctDoTeto: a.acao.vendidoBruto.div(TAX_CONFIG.LIMITE_LEGAL).times(100).toNumber(),
    prejuizoUsado: n(a.acao.prejuizoUsado),
    impostoAcao: n(a.acao.impostoLiquido),
    lucroFii: n(a.fii.lucro),
    impostoFii: n(a.fii.imposto),
    impostoTotal: n(a.totalImpostoMes),
    darfValor: a.darf ? n(a.darf.valor) : null,
    darfVencimento: a.darf?.vencimento ?? null,
    prejuizoAcumuladoDepois: n(a.acao.novoPrejuizoAcumulado),
    temDayTrade: a.dayTradeDetectado.length > 0,
    darfPaga: darf,
  };
}

/**
 * Apura todos os meses que tem operacao, do primeiro trade ate o mes corrente.
 * A apuracao de cada mes parte do estoque de prejuizo e do imposto pendente
 * ATUAIS, do jeito que apurarMesDoBanco faz no worker.
 */
export async function getTaxView(): Promise<TaxView> {
  const [trades, events, assetClass, carryforward, duePending, darfs] = await Promise.all([
    loadTrades(),
    loadEvents(),
    loadAssetClasses(),
    loadAmount('tax_loss_carryforward'),
    loadAmount('tax_due_pending'),
    loadDarfs(),
  ]);

  if (trades.length === 0) {
    return {
      meses: [],
      prejuizoAcumulado: n(carryforward),
      prejuizoAcumuladoGravado: n(carryforward),
      divergenciaCarryforward: false,
      impostoPendente: n(duePending),
      limiteIsencao: TAX_CONFIG.LIMITE_LEGAL,
      mesCorrente: null,
      totalDarfPago: darfs.reduce((s, d) => s + (d.dataPagamento ? d.valorTotal : 0), 0),
      darfsNaoConciliadas: [],
      semOperacoes: true,
    };
  }

  const { sales } = reconstructLedger(trades, events, assetClass);

  // Meses com venda, mais o mes corrente (que pode ainda estar zerado).
  const hoje = new Date();
  const mesCorrenteStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const mesesComVenda = new Set(sales.map((s) => s.date.slice(0, 7)));
  mesesComVenda.add(mesCorrenteStr);

  const darfPorCompetencia = new Map<string, DarfRegistro>();
  for (const d of darfs) darfPorCompetencia.set(d.competencia.slice(0, 7), d);

  // Encadeia os meses em ordem CRONOLOGICA. Prejuizo so anda para frente: o
  // estoque que sobra de um mes entra no seguinte. Passar o carryforward atual
  // para cada mes isoladamente (que era o que esta funcao fazia) faz o prejuizo
  // de julho abater o lucro de janeiro, o que a lei nao permite e que zerava
  // indevidamente as DARFs de jan e fev na tela.
  //
  // O ponto de partida e o estoque anterior ao primeiro mes apurado. Enquanto
  // nao houver um campo para informa-lo, comeca em zero — correto aqui, porque
  // a primeira alienacao do historico foi em 26/01/2026.
  let carry = new Decimal(0);
  let due = new Decimal(0);

  const mesesAsc = [...mesesComVenda].sort().map((m) => {
    const [ano, mes] = m.split('-').map(Number);
    const apurado = apurarMes({
      year: ano!,
      month: mes!,
      sales,
      lossCarryforwardSwing: carry,
      duePending: due,
    });
    carry = apurado.acao.novoPrejuizoAcumulado;
    due = apurado.duePendingNovo;
    return paraMes(apurado, darfPorCompetencia.get(m) ?? null);
  });

  // Estoque ao fim do encadeamento — o numero que vale hoje.
  const carryforwardApurado = carry;
  const duePendingApurado = due;

  const meses = [...mesesAsc].reverse();

  const competenciasApuradas = new Set(meses.map((m) => m.mes));

  return {
    meses,
    // Vale o valor APURADO do encadeamento, nao o gravado na tabela: a tabela e
    // atualizada pela rotina de fim de mes do worker e pode estar atrasada,
    // enquanto o encadeamento sai direto do ledger. `divergencia` avisa quando
    // os dois discordam, que e sinal de rotina nao rodada ou lancamento novo.
    prejuizoAcumulado: n(carryforwardApurado),
    prejuizoAcumuladoGravado: n(carryforward),
    divergenciaCarryforward: !carryforwardApurado.equals(carryforward),
    impostoPendente: n(duePendingApurado),
    limiteIsencao: TAX_CONFIG.LIMITE_LEGAL,
    mesCorrente: meses.find((m) => m.mes === mesCorrenteStr) ?? null,
    totalDarfPago: darfs.reduce((s, d) => s + (d.dataPagamento ? d.valorTotal : 0), 0),
    // DARF paga cuja competencia o motor nao apurou — sinal de operacao faltando
    // no ledger, que e exatamente o caso quando a venda nao foi registrada.
    darfsNaoConciliadas: darfs.filter((d) => !competenciasApuradas.has(d.competencia.slice(0, 7))),
    semOperacoes: false,
  };
}
