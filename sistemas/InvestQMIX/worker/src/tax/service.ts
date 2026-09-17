// Camada de I/O do módulo fiscal: carrega o ledger e cotações do banco,
// reconstrói posições e usa a lib pura (ledger/apuracao/recomendacao) para
// produzir a apuração do mês e as oportunidades de venda isenta.

import Decimal from 'decimal.js';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { reconstructLedger } from '@qmix-invest/db/tax/ledger';
import { apurarMes, type ApuracaoResult } from '@qmix-invest/db/tax/apuracao';
import { recomendarVendaIsenta } from '@qmix-invest/db/tax/recomendacao';
import { custoGiro, beneficioPotencial } from '@qmix-invest/db/tax/custos';
import { nextBusinessDay } from '@qmix-invest/db/tax/calendario';
import { TAX_CONFIG } from '@qmix-invest/db/tax/config';
import type { Trade, CorporateEvent, AssetClassMap, AssetClass } from '@qmix-invest/db/tax/types';

export interface ProventoProximo {
  comDate: string; // YYYY-MM-DD — último dia COM direito ao provento
  dataEx: string; // YYYY-MM-DD — 1º dia útil seguinte (negocia "ex")
  eventType: string; // DIVIDENDO | JUROS SOBRE CAPITAL PRÓPRIO | ...
}

// Provento (dividendo/JCP) futuro mais próximo por ticker, dentro da janela de aviso.
async function loadProventosProximos(): Promise<Map<string, ProventoProximo>> {
  const rows = (await db.execute(sql`
    select distinct on (ticker) ticker, event_type, com_date::text as com_date
    from qmix_invest.proventos
    where com_date >= current_date
      and com_date < date '9999-01-01'
      and com_date <= current_date + (${TAX_CONFIG.PROVENTO_AVISO_DIAS} * interval '1 day')
    order by ticker, com_date
  `)) as unknown as Array<{ ticker: string; event_type: string; com_date: string }>;
  const m = new Map<string, ProventoProximo>();
  for (const r of rows) {
    m.set(r.ticker, { comDate: r.com_date, dataEx: nextBusinessDay(r.com_date), eventType: r.event_type });
  }
  return m;
}

// Volume financeiro médio diário (últimos ~21 pregões) por ticker — p/ aviso de liquidez.
async function loadVolumeMedio(): Promise<Map<string, Decimal>> {
  const rows = (await db.execute(sql`
    select ticker, avg(financial_volume_brl)::numeric(18,2) as vol
    from (
      select ticker, financial_volume_brl,
        row_number() over (partition by ticker order by date desc) as rn
      from qmix_invest.prices_daily
    ) x
    where rn <= 21
    group by ticker
  `)) as unknown as Array<{ ticker: string; vol: string | null }>;
  const m = new Map<string, Decimal>();
  for (const r of rows) if (r.vol != null) m.set(r.ticker, new Decimal(r.vol));
  return m;
}

async function loadTrades(): Promise<Trade[]> {
  const rows = (await db.execute(sql`
    select ticker, side, trade_date::text as trade_date, quantity,
           price_brl::text as price_brl, fees_brl::text as fees_brl,
           nature, is_opening
    from qmix_invest.trades
    order by trade_date, id
  `)) as unknown as Array<Record<string, unknown>>;
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
  `)) as unknown as Array<Record<string, unknown>>;
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

async function loadPrecosAtuais(): Promise<Map<string, Decimal>> {
  const rows = (await db.execute(sql`
    select ticker, last_quote_brl::text as q from qmix_invest.tickers where last_quote_brl is not null
  `)) as unknown as Array<{ ticker: string; q: string }>;
  const m = new Map<string, Decimal>();
  for (const r of rows) m.set(r.ticker, new Decimal(r.q));
  return m;
}

async function loadCarryforwardSwing(): Promise<Decimal> {
  const rows = (await db.execute(sql`
    select amount_brl::text as a from qmix_invest.tax_loss_carryforward where nature = 'swing'
  `)) as unknown as Array<{ a: string }>;
  return new Decimal(rows[0]?.a ?? '0');
}

async function loadDuePending(): Promise<Decimal> {
  const rows = (await db.execute(sql`
    select amount_brl::text as a from qmix_invest.tax_due_pending where nature = 'swing'
  `)) as unknown as Array<{ a: string }>;
  return new Decimal(rows[0]?.a ?? '0');
}

export interface FullState {
  trades: Trade[];
  events: CorporateEvent[];
  assetClass: AssetClassMap;
  precos: Map<string, Decimal>;
  carryforwardSwing: Decimal;
  duePending: Decimal;
  proventos: Map<string, ProventoProximo>;
  volumeMedio: Map<string, Decimal>;
}

export async function loadFullState(): Promise<FullState> {
  const [trades, events, assetClass, precos, carryforwardSwing, duePending, proventos, volumeMedio] =
    await Promise.all([
      loadTrades(),
      loadEvents(),
      loadAssetClasses(),
      loadPrecosAtuais(),
      loadCarryforwardSwing(),
      loadDuePending(),
      loadProventosProximos(),
      loadVolumeMedio(),
    ]);
  return { trades, events, assetClass, precos, carryforwardSwing, duePending, proventos, volumeMedio };
}

// Apuração de um mês a partir do estado atual do banco.
export async function apurarMesDoBanco(year: number, month: number, st?: FullState): Promise<ApuracaoResult> {
  const s = st ?? (await loadFullState());
  const { sales } = reconstructLedger(s.trades, s.events, s.assetClass);
  return apurarMes({
    year,
    month,
    sales,
    lossCarryforwardSwing: s.carryforwardSwing,
    duePending: s.duePending,
  });
}

export interface Oportunidade {
  ticker: string;
  quantidade: number;
  precoAtual: Decimal;
  precoMedio: Decimal;
  ganhoLivre: Decimal;
  margemRestante: Decimal;
  custoGiro: Decimal; // taxas pra vender + recomprar
  beneficioPotencial: Decimal; // imposto que pode evitar no futuro (condicional)
  poucoLiquida: boolean; // ação pouco negociada (recompra pode sair mais cara)
  proventoProximo?: ProventoProximo; // dividendo/JCP a caminho
  proventoConflito: boolean; // true = a recompra cairia depois da data-com (perde o provento)
  recompraData: string; // YYYY-MM-DD — próximo dia útil (quando você recompraria)
}

// Detecta oportunidades de venda isenta no mês corrente, aplicando as 3 condições:
// (1) ação com lucro, (2) cabe na margem isenta, (3) lucro supera o custo do giro.
// Só retorna as que superam MIN_LUCRO_ALERTA.
export async function detectarOportunidades(
  year: number,
  month: number,
  hojeIso: string,
  st?: FullState,
): Promise<Oportunidade[]> {
  const s = st ?? (await loadFullState());
  const recompraDate = nextBusinessDay(hojeIso);
  const { sales, positions } = reconstructLedger(s.trades, s.events, s.assetClass);
  const apur = apurarMes({ year, month, sales, lossCarryforwardSwing: s.carryforwardSwing, duePending: s.duePending });

  const posInput = [...positions.values()]
    .filter((p) => p.quantity > 0 && (s.assetClass[p.ticker] ?? 'outro') === 'acao' && s.precos.has(p.ticker))
    .map((p) => ({
      ticker: p.ticker,
      quantity: p.quantity,
      pm: p.pm,
      precoAtual: s.precos.get(p.ticker)!,
      assetClass: 'acao' as AssetClass,
    }));

  const rec = recomendarVendaIsenta({
    positions: posInput,
    vendidoAcaoSwingBrutoMes: apur.acao.vendidoBruto,
    feeEstimadoPorOperacao: 0, // o custo do giro é calculado com TAXA_B3 abaixo
  });

  const volumeMedio = s.volumeMedio;
  const proventos = s.proventos;

  // margem que vai sobrando conforme as sugestões consomem o teto
  let margem = rec.margemDisponivel;
  const out: Oportunidade[] = [];
  for (const sug of rec.sugestoes) {
    margem = margem.minus(sug.valorVendaBrl);
    if (new Decimal(sug.ganhoBrl).lt(TAX_CONFIG.MIN_LUCRO_ALERTA)) continue; // ignora troco
    const pm = posInput.find((p) => p.ticker === sug.ticker)!.pm;
    const vol = volumeMedio.get(sug.ticker);
    const prov = proventos.get(sug.ticker);
    out.push({
      ticker: sug.ticker,
      quantidade: sug.quantidade,
      precoAtual: new Decimal(sug.novoPmBrl), // preço atual = recompra
      precoMedio: pm,
      ganhoLivre: new Decimal(sug.ganhoBrl),
      margemRestante: Decimal.max(0, margem),
      // recompra ao mesmo valor da venda
      custoGiro: custoGiro(sug.valorVendaBrl, sug.valorVendaBrl),
      beneficioPotencial: beneficioPotencial(sug.ganhoBrl),
      poucoLiquida: vol != null && vol.lt(TAX_CONFIG.LIQUIDEZ_MINIMA_BRL),
      proventoProximo: prov,
      // conflito = a recompra (próximo dia útil) cai DEPOIS da data-com → perde o provento
      proventoConflito: prov != null && prov.comDate < recompraDate,
      recompraData: recompraDate,
    });
  }
  return out;
}

// ── Análise de fim de mês: classifica cada giro possível ──────────────────────
// Prioriza ações sem conflito de data-ex; adia as que pagam provento dentro da
// janela de giro (vender hoje + recomprar no próximo dia útil); e mostra com
// transparência as que não compensam (custo do giro >= imposto economizado).

export interface GiroSugestao {
  ticker: string;
  quantidade: number;
  ganhoLivre: Decimal;
  custoGiro: Decimal;
  beneficioPotencial: Decimal;
  proventoProximo?: ProventoProximo;
}

export interface AnaliseFimDeMes {
  vendidoMes: Decimal;
  margemDisponivel: Decimal;
  isento: boolean;
  imposto: Decimal;
  darf: { valor: Decimal; vencimento: string } | null;
  sugestoes: GiroSugestao[];
  adiar: Array<{ ticker: string; dataEx: string; eventType: string; ganhoLivre: Decimal }>;
  naoCompensa: Array<{ ticker: string; custoGiro: Decimal; beneficioPotencial: Decimal }>;
}

export async function analisarFimDeMes(
  year: number,
  month: number,
  hojeIso: string,
  st?: FullState,
): Promise<AnaliseFimDeMes> {
  const s = st ?? (await loadFullState());
  const { sales, positions } = reconstructLedger(s.trades, s.events, s.assetClass);
  const apur = apurarMes({ year, month, sales, lossCarryforwardSwing: s.carryforwardSwing, duePending: s.duePending });
  const proventos = s.proventos;
  const recompraDate = nextBusinessDay(hojeIso);

  const margemTotal = Decimal.max(0, new Decimal(TAX_CONFIG.LIMITE_ISENCAO).minus(apur.acao.vendidoBruto));

  const candidatas = [...positions.values()]
    .filter((p) => p.quantity > 0 && (s.assetClass[p.ticker] ?? 'outro') === 'acao' && s.precos.has(p.ticker))
    .map((p) => {
      const preco = s.precos.get(p.ticker)!;
      const ganhoPct = p.pm.gt(0) ? preco.minus(p.pm).div(p.pm) : new Decimal(0);
      return { ticker: p.ticker, quantity: p.quantity, pm: p.pm, preco, ganhoPct };
    })
    .filter((c) => c.preco.gt(c.pm))
    .sort((a, b) => b.ganhoPct.comparedTo(a.ganhoPct));

  let margem = margemTotal;
  const sugestoes: GiroSugestao[] = [];
  const adiar: AnaliseFimDeMes['adiar'] = [];
  const naoCompensa: AnaliseFimDeMes['naoCompensa'] = [];

  for (const c of candidatas) {
    const qtd = Math.min(c.quantity, margem.div(c.preco).floor().toNumber());
    if (qtd <= 0) continue;
    const valorVenda = c.preco.times(qtd);
    const ganho = c.preco.minus(c.pm).times(qtd);
    if (ganho.lt(TAX_CONFIG.MIN_LUCRO_ALERTA)) continue; // troco
    const custo = custoGiro(valorVenda, valorVenda);
    const beneficio = beneficioPotencial(ganho);
    const prov = proventos.get(c.ticker);

    // conflito: a recompra (próximo dia útil) cai depois da data-com → girar agora perde o provento
    if (prov && prov.comDate < recompraDate) {
      adiar.push({ ticker: c.ticker, dataEx: prov.dataEx, eventType: prov.eventType, ganhoLivre: ganho });
      continue;
    }
    if (beneficio.lte(custo)) {
      naoCompensa.push({ ticker: c.ticker, custoGiro: custo, beneficioPotencial: beneficio });
      continue;
    }
    sugestoes.push({
      ticker: c.ticker,
      quantidade: qtd,
      ganhoLivre: ganho.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      custoGiro: custo,
      beneficioPotencial: beneficio,
      proventoProximo: prov,
    });
    margem = margem.minus(valorVenda);
  }

  return {
    vendidoMes: apur.acao.vendidoBruto,
    margemDisponivel: margemTotal,
    isento: apur.acao.isento,
    imposto: apur.acao.impostoLiquido,
    darf: apur.darf,
    sugestoes,
    adiar,
    naoCompensa,
  };
}
