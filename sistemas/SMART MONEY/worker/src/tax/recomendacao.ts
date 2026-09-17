// Recomendação de venda isenta ("fazer patrimônio"): dentro da margem do mês,
// realizar o maior lucro possível de forma isenta e recomprar para subir o PM.
//
// - Usa o LIMITE_ISENCAO (teto de segurança, 19.900) e o quanto já foi vendido de
//   AÇÃO swing no mês.
// - Prioriza maior ganho não realizado (%) primeiro — cada real vendido captura o
//   máximo de ganho isento.
// - Para cada sugestão simula a recompra: novo PM = preço atual (step-up) e o
//   imposto futuro economizado = 15% do ganho realizado.
// - Não sugere giro cujo custo (vender + recomprar) supere o imposto economizado.

import Decimal from 'decimal.js';
import type { AssetClass } from './types.js';
import { TAX_CONFIG, type TaxConfig } from './config.js';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = new Decimal(0);
const money = (d: Decimal) => d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

export interface RecomendacaoPosition {
  ticker: string;
  quantity: number;
  pm: Decimal.Value; // preço médio atual
  precoAtual: Decimal.Value;
  assetClass: AssetClass;
}

export interface SugestaoVenda {
  ticker: string;
  quantidade: number;
  valorVendaBrl: Decimal;
  ganhoBrl: Decimal;
  ganhoPct: Decimal;
  novoPmBrl: Decimal; // = preço atual (recompra)
  impostoFuturoEconomizadoBrl: Decimal;
}

export interface RecomendacaoResult {
  margemDisponivel: Decimal;
  sugestoes: SugestaoVenda[];
  totalSugeridoBrl: Decimal;
  ignoradasPorCusto: Array<{ ticker: string; motivo: string }>;
}

export interface RecomendacaoInput {
  positions: RecomendacaoPosition[];
  vendidoAcaoSwingBrutoMes: Decimal.Value; // já vendido de ação swing no mês
  feeEstimadoPorOperacao?: Decimal.Value; // custo estimado de 1 ordem (corretagem+emol.)
  config?: TaxConfig;
}

export function recomendarVendaIsenta(input: RecomendacaoInput): RecomendacaoResult {
  const cfg = input.config ?? TAX_CONFIG;
  const feePorOp = D(input.feeEstimadoPorOperacao ?? 0);
  let margem = D(cfg.LIMITE_ISENCAO).minus(input.vendidoAcaoSwingBrutoMes);

  const sugestoes: SugestaoVenda[] = [];
  const ignoradasPorCusto: Array<{ ticker: string; motivo: string }> = [];

  if (margem.lte(0)) {
    return { margemDisponivel: ZERO, sugestoes, totalSugeridoBrl: ZERO, ignoradasPorCusto };
  }

  // Candidatas: ações, com posição e ganho não realizado positivo. Maior ganho % primeiro.
  const candidatas = input.positions
    .filter((p) => p.assetClass === 'acao' && p.quantity > 0)
    .map((p) => {
      const pm = D(p.pm);
      const preco = D(p.precoAtual);
      const ganhoPct = pm.gt(0) ? preco.minus(pm).div(pm).times(100) : ZERO;
      return { ...p, pmD: pm, precoD: preco, ganhoPct };
    })
    .filter((p) => p.precoD.gt(p.pmD)) // só com lucro embutido
    .sort((a, b) => b.ganhoPct.comparedTo(a.ganhoPct));

  let totalSugerido = ZERO;

  for (const c of candidatas) {
    if (margem.lte(0)) break;
    // quantas cotas cabem na margem restante (inteiro)
    const qtdMax = margem.div(c.precoD).floor().toNumber();
    const qtd = Math.min(c.quantity, qtdMax);
    if (qtd <= 0) continue;

    const valorVenda = c.precoD.times(qtd);
    const ganho = c.precoD.minus(c.pmD).times(qtd);
    const impostoEconomizado = ganho.times(cfg.ALIQUOTA_SWING);
    const custoGiro = feePorOp.times(2); // vender + recomprar

    if (impostoEconomizado.lte(custoGiro)) {
      ignoradasPorCusto.push({
        ticker: c.ticker,
        motivo: `giro custaria R$ ${money(custoGiro).toFixed(2)} e economizaria só R$ ${money(impostoEconomizado).toFixed(2)} de imposto futuro`,
      });
      continue;
    }

    sugestoes.push({
      ticker: c.ticker,
      quantidade: qtd,
      valorVendaBrl: money(valorVenda),
      ganhoBrl: money(ganho),
      ganhoPct: c.ganhoPct.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      novoPmBrl: money(c.precoD),
      impostoFuturoEconomizadoBrl: money(impostoEconomizado),
    });
    totalSugerido = totalSugerido.plus(valorVenda);
    margem = margem.minus(valorVenda);
  }

  return {
    margemDisponivel: money(D(cfg.LIMITE_ISENCAO).minus(input.vendidoAcaoSwingBrutoMes)),
    sugestoes,
    totalSugeridoBrl: money(totalSugerido),
    ignoradasPorCusto,
  };
}
