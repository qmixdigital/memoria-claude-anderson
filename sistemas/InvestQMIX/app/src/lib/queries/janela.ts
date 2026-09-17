import Decimal from 'decimal.js';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { analisarJanela, type PosicaoJanela } from '@qmix-invest/db/tax/janela';
import type { AssetClass } from '@qmix-invest/db/tax/types';

const D = (v: Decimal.Value) => new Decimal(v);
const n = (d: Decimal) => d.toDecimalPlaces(2).toNumber();

/** Mesma analise do alerta, em numeros simples para o Server Component. */
export interface JanelaFiscalView {
  mes: string;
  vendidoNoMes: number;
  limiteLegal: number;
  margemIsenta: number;
  mesJaTributavel: boolean;
  creditoDisponivel: number;
  lucroNaoRealizado: number;
  prejuizoNaoRealizado: number;
  janelaIsenta: Array<{
    ticker: string;
    quantidade: number;
    valorVenda: number;
    lucro: number;
    custoGiro: number;
  }>;
  lucroIsentoPossivel: number;
  janelaCredito: Array<{
    ticker: string;
    quantidade: number;
    valorVenda: number;
    lucro: number;
    custoGiro: number;
  }>;
  lucroCobertoPeloCredito: number;
  avisos: Array<{
    ticker: string;
    valorVenda: number;
    prejuizo: number;
    queimaSeSozinho: boolean;
    faltaParaTributavel: number;
  }>;
  veredito: string;
}

export async function getJanelaFiscal(): Promise<JanelaFiscalView> {
  const mes = new Date()
    .toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' })
    .slice(0, 7);

  const [posRows, vendidoRows, creditoRows] = await Promise.all([
    db.execute(sql`
      select p.ticker, p.quantity::text as qtd, p.purchase_price_brl::text as pm,
             t.last_quote_brl::text as cotacao, coalesce(t.asset_class, 'acao') as classe
        from qmix_invest.user_portfolio p
        join qmix_invest.tickers t on t.ticker = p.ticker
       where p.purchase_price_brl is not null and t.last_quote_brl is not null
    `),
    db.execute(sql`
      select coalesce(sum(quantity * price_brl), 0)::text as total
        from qmix_invest.trades
       where side = 'sell' and to_char(trade_date, 'YYYY-MM') = ${mes}
    `),
    db.execute(sql`
      select amount_brl::text as v from qmix_invest.tax_loss_carryforward where nature = 'swing'
    `),
  ]);

  const posicoes: PosicaoJanela[] = (posRows as unknown as Array<Record<string, string>>).map((r) => ({
    ticker: r.ticker!,
    quantidade: Number(r.qtd),
    precoMedio: D(r.pm!),
    cotacao: D(r.cotacao!),
    assetClass: r.classe as AssetClass,
  }));

  const j = analisarJanela({
    mes,
    posicoes,
    vendidoNoMes: (vendidoRows as unknown as Array<{ total: string }>)[0]?.total ?? '0',
    creditoSwing: (creditoRows as unknown as Array<{ v: string }>)[0]?.v ?? '0',
  });

  const mapSug = (s: (typeof j.janelaIsenta)[number]) => ({
    ticker: s.ticker,
    quantidade: s.quantidade,
    valorVenda: n(s.valorVenda),
    lucro: n(s.lucro),
    custoGiro: n(s.custoGiro),
  });

  return {
    mes: j.mes,
    vendidoNoMes: n(j.vendidoNoMes),
    limiteLegal: n(j.limiteLegal),
    margemIsenta: n(j.margemIsenta),
    mesJaTributavel: j.mesJaTributavel,
    creditoDisponivel: n(j.creditoDisponivel),
    lucroNaoRealizado: n(j.lucroNaoRealizado),
    prejuizoNaoRealizado: n(j.prejuizoNaoRealizado),
    janelaIsenta: j.janelaIsenta.map(mapSug),
    lucroIsentoPossivel: n(j.lucroIsentoPossivel),
    janelaCredito: j.janelaCredito.map(mapSug),
    lucroCobertoPeloCredito: n(j.lucroCobertoPeloCredito),
    avisos: j.avisos.map((a) => ({
      ticker: a.ticker,
      valorVenda: n(a.valorVenda),
      prejuizo: n(a.prejuizo),
      queimaSeSozinho: a.queimaSeSozinho,
      faltaParaTributavel: n(a.faltaParaTributavel),
    })),
    veredito: j.veredito,
  };
}
