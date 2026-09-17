// Custo do giro (vender + recomprar) e checagem do limite mensal de isenção.
// Tudo em decimal, 2 casas. O dedo-duro NÃO entra no custo (é antecipação de
// imposto recuperável); pode ser mencionado à parte como crédito.

import Decimal from 'decimal.js';
import { TAX_CONFIG, type TaxConfig } from './config.js';

const money = (d: Decimal) => d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

// Custo de fazer o giro completo: taxa da B3 nas duas pontas + corretagem (0 no C6).
// valorRecompra ≈ valorVenda (recompra logo em seguida ao mesmo preço).
export function custoGiro(
  valorVenda: Decimal.Value,
  valorRecompra: Decimal.Value,
  cfg: TaxConfig = TAX_CONFIG,
): Decimal {
  const venda = new Decimal(valorVenda);
  const recompra = new Decimal(valorRecompra);
  const taxas = venda.times(cfg.TAXA_B3).plus(recompra.times(cfg.TAXA_B3));
  const corretagem = new Decimal(cfg.CUSTO_CORRETAGEM).times(2); // duas ordens
  return money(taxas.plus(corretagem));
}

// Imposto que o giro PODE evitar no futuro (condicional a vender > R$20k num mês):
// 15% do lucro travado isento agora.
export function beneficioPotencial(lucroTravado: Decimal.Value, cfg: TaxConfig = TAX_CONFIG): Decimal {
  return money(new Decimal(lucroTravado).times(cfg.ALIQUOTA_SWING));
}

// Verifica se um novo trade (ticker, side, data) cairia como day trade — ou seja,
// se já existe uma operação do MESMO papel no MESMO dia com o lado oposto.
// O saldo de abertura (is_opening) é ignorado. Usado pra avisar ANTES de confirmar.
export function seriaDayTrade(
  ticker: string,
  side: 'buy' | 'sell',
  date: string,
  tradesExistentes: Array<{ ticker: string; side: string; tradeDate: string; isOpening?: boolean }>,
): boolean {
  return tradesExistentes.some(
    (t) => !t.isOpening && t.ticker === ticker && t.tradeDate === date && t.side !== side,
  );
}

export interface LimiteMes {
  vendidoApos: Decimal; // total vendido de ação no mês após a venda avaliada
  margemRestante: Decimal; // quanto ainda cabe no teto operacional (19.900)
  perto90: boolean; // passou de 90% do teto
  vaiEstourar: boolean; // ultrapassa o limite legal de 20.000
}

// Avalia o efeito de uma venda no limite do mês. Passe valorNovaVenda = 0 pra só
// consultar o estado atual.
export function checarLimiteMes(
  vendidoAtual: Decimal.Value,
  valorNovaVenda: Decimal.Value = 0,
  cfg: TaxConfig = TAX_CONFIG,
): LimiteMes {
  const vendidoApos = new Decimal(vendidoAtual).plus(valorNovaVenda);
  const margemRestante = new Decimal(cfg.LIMITE_ISENCAO).minus(vendidoApos);
  const limiteAlerta = new Decimal(cfg.LIMITE_ISENCAO).times(cfg.LIMITE_ALERTA_PCT);
  return {
    vendidoApos: money(vendidoApos),
    margemRestante: money(margemRestante),
    perto90: vendidoApos.gte(limiteAlerta),
    vaiEstourar: vendidoApos.gt(cfg.LIMITE_LEGAL),
  };
}
