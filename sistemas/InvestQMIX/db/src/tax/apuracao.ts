// Apuração mensal de ganho de capital (foco: ações à vista, swing trade).
//
// Regras revisadas e implementadas aqui:
//  P1. Estouro: se vendas de AÇÃO no mês passam de R$20k, perde-se a isenção do
//      LUCRO DO MÊS INTEIRO (não só da parcela acima) → 15% sobre todo o lucro.
//  P2. Isenção vale SÓ para asset_class='acao'. FII (20%), ETF/BDR (15%) são
//      apurados à parte, NÃO contam pro teto e NÃO têm isenção.
//  P3. Fees: compra entra no PM (feito no ledger), venda abate da venda (feito no ledger).
//  P5. DARF mínimo R$10: imposto menor acumula em duePending até atingir o piso.
//  Prejuízo de mês isento NÃO entra no estoque (carryforward). Prejuízo de mês
//  tributável entra. Day trade está fora do escopo: é detectado e devolvido como aviso.

import Decimal from 'decimal.js';
import type { SaleResult } from './types.js';
import { TAX_CONFIG, type TaxConfig } from './config.js';
import { darfDueDate } from './calendario.js';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = new Decimal(0);
const money = (d: Decimal) => d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

export interface ApuracaoInput {
  year: number;
  month: number; // 1-12
  sales: SaleResult[]; // todas as vendas reconstruídas (a função filtra o mês)
  lossCarryforwardSwing?: Decimal.Value; // prejuízo (ações/swing) acumulado entrando
  duePending?: Decimal.Value; // imposto pendente < R$10 entrando
  config?: TaxConfig;
}

export interface ApuracaoResult {
  mes: string; // YYYY-MM
  acao: {
    vendidoBruto: Decimal; // soma das alienações de ação swing
    lucro: Decimal; // lucro líquido das vendas de ação swing
    isento: boolean; // vendidoBruto <= limite legal (20k)
    lucroIsento: Decimal; // vai p/ "Rendimentos Isentos" código 20 (só se isento e lucro>0)
    lucroTributavel: Decimal; // lucro do mês quando tributável (estouro)
    prejuizoUsado: Decimal; // prejuízo acumulado compensado neste mês
    base: Decimal; // base de cálculo (lucro − prejuízo compensado)
    imposto: Decimal; // 15% sobre a base
    dedoDuro: Decimal; // 0,005% retido na venda (antecipação)
    impostoLiquido: Decimal; // imposto − dedo-duro (≥ 0)
    novoPrejuizoAcumulado: Decimal; // estoque de prejuízo swing após o mês
  };
  fii: { vendidoBruto: Decimal; lucro: Decimal; imposto: Decimal };
  etfBdr: { vendidoBruto: Decimal; lucro: Decimal; imposto: Decimal };
  dayTradeDetectado: SaleResult[]; // aviso — fora do escopo de cálculo
  totalImpostoMes: Decimal; // soma dos impostos líquidos do mês (antes do piso)
  darf: { valor: Decimal; vencimento: string } | null;
  duePendingNovo: Decimal; // imposto que ficou abaixo do piso e acumula
  codigo20: Decimal; // lucro isento p/ declaração (Rendimentos Isentos, cód. 20)
}

export function apurarMes(input: ApuracaoInput): ApuracaoResult {
  const cfg = input.config ?? TAX_CONFIG;
  const prefix = `${input.year}-${String(input.month).padStart(2, '0')}`;
  const lossIn = D(input.lossCarryforwardSwing ?? 0);
  const dueIn = D(input.duePending ?? 0);

  const noMes = input.sales.filter((s) => s.date.startsWith(prefix));

  // Day trade detectado (fora do escopo de cálculo) — devolvido como aviso.
  const dayTradeDetectado = noMes.filter((s) => s.nature === 'day');

  // Apenas swing entra na apuração; segmentado por classe de ativo.
  const swing = noMes.filter((s) => s.nature === 'swing');
  const acaoSales = swing.filter((s) => s.assetClass === 'acao');
  const fiiSales = swing.filter((s) => s.assetClass === 'fii');
  const etfBdrSales = swing.filter((s) => s.assetClass === 'etf' || s.assetClass === 'bdr');

  const sum = (arr: SaleResult[], f: (s: SaleResult) => Decimal) =>
    arr.reduce((acc, s) => acc.plus(f(s)), ZERO);

  // ── Ações (com isenção / teto) ──────────────────────────────────────────
  const acaoVendidoBruto = sum(acaoSales, (s) => s.grossBrl);
  const acaoLucro = sum(acaoSales, (s) => s.profitBrl);
  const isento = acaoVendidoBruto.lte(cfg.LIMITE_LEGAL); // P1/P2: limite legal sobre vendas de AÇÃO

  let lucroIsento = ZERO;
  let lucroTributavel = ZERO;
  let prejuizoUsado = ZERO;
  let base = ZERO;
  let imposto = ZERO;
  let dedoDuro = ZERO;
  let impostoLiquidoAcao = ZERO;
  let novoPrejuizo = lossIn;

  if (isento) {
    // Lucro isento (código 20). Prejuízo de mês isento NÃO entra no estoque.
    lucroIsento = Decimal.max(ZERO, acaoLucro);
  } else {
    // P1 — estouro: tributa o LUCRO DO MÊS INTEIRO.
    lucroTributavel = acaoLucro;
    if (lucroTributavel.gt(0)) {
      prejuizoUsado = Decimal.min(lossIn, lucroTributavel);
      base = lucroTributavel.minus(prejuizoUsado);
      imposto = base.times(cfg.ALIQUOTA_SWING);
      dedoDuro = acaoVendidoBruto.times(cfg.DEDO_DURO_SWING); // antecipação abatível
      impostoLiquidoAcao = Decimal.max(ZERO, imposto.minus(dedoDuro));
      novoPrejuizo = lossIn.minus(prejuizoUsado);
    } else {
      // prejuízo em mês tributável → acumula no estoque
      novoPrejuizo = lossIn.plus(lucroTributavel.abs());
    }
  }

  // ── FII (20% sempre, sem isenção) ─────────────────────────────────────────
  const fiiVendidoBruto = sum(fiiSales, (s) => s.grossBrl);
  const fiiLucro = sum(fiiSales, (s) => s.profitBrl);
  const fiiImposto = Decimal.max(ZERO, fiiLucro).times(cfg.ALIQUOTA_FII);

  // ── ETF de ação / BDR (15% sem isenção) ───────────────────────────────────
  const etfBdrVendidoBruto = sum(etfBdrSales, (s) => s.grossBrl);
  const etfBdrLucro = sum(etfBdrSales, (s) => s.profitBrl);
  const etfBdrImposto = Decimal.max(ZERO, etfBdrLucro).times(cfg.ALIQUOTA_ETF_BDR);

  // ── DARF com piso de R$10 (P5) ─────────────────────────────────────────────
  const totalImpostoMes = impostoLiquidoAcao.plus(fiiImposto).plus(etfBdrImposto);
  const acumulado = dueIn.plus(totalImpostoMes);
  let darf: { valor: Decimal; vencimento: string } | null = null;
  let duePendingNovo = acumulado;
  if (acumulado.gte(cfg.DARF_MINIMO)) {
    darf = { valor: money(acumulado), vencimento: darfDueDate(input.year, input.month) };
    duePendingNovo = ZERO;
  }

  return {
    mes: prefix,
    acao: {
      vendidoBruto: money(acaoVendidoBruto),
      lucro: money(acaoLucro),
      isento,
      lucroIsento: money(lucroIsento),
      lucroTributavel: money(lucroTributavel),
      prejuizoUsado: money(prejuizoUsado),
      base: money(base),
      imposto: money(imposto),
      dedoDuro: money(dedoDuro),
      impostoLiquido: money(impostoLiquidoAcao),
      novoPrejuizoAcumulado: money(novoPrejuizo),
    },
    fii: { vendidoBruto: money(fiiVendidoBruto), lucro: money(fiiLucro), imposto: money(fiiImposto) },
    etfBdr: {
      vendidoBruto: money(etfBdrVendidoBruto),
      lucro: money(etfBdrLucro),
      imposto: money(etfBdrImposto),
    },
    dayTradeDetectado,
    totalImpostoMes: money(totalImpostoMes),
    darf: darf ? { valor: darf.valor, vencimento: darf.vencimento } : null,
    duePendingNovo: money(duePendingNovo),
    codigo20: money(lucroIsento),
  };
}
