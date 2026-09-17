import Decimal from 'decimal.js';
import { TAX_CONFIG, type TaxConfig } from './config.js';
import { custoGiro } from './custos.js';
import type { AssetClass } from './types.js';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = D(0);
const money = (d: Decimal) => d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

/**
 * Janela fiscal do mes: quanto da pra realizar de lucro sem pagar imposto, e
 * qual o risco de queimar prejuizo sem querer.
 *
 * Existem DUAS janelas, e confundir uma com a outra e o erro caro:
 *
 * 1. JANELA ISENTA — enquanto as vendas do mes ficarem sob R$20 mil, o lucro de
 *    acao e isento. Nao paga imposto E nao consome o estoque de prejuizo. E a
 *    janela boa: ela se renova todo mes e nao custa nada.
 *
 * 2. JANELA DO CREDITO — quando o mes JA passou dos R$20 mil por outro motivo,
 *    o lucro adicional ate o saldo de prejuizo tambem sai sem imposto, mas
 *    CONSOME o credito. So faz sentido quando o mes ja virou tributavel de
 *    qualquer jeito.
 *
 * E existe a ARMADILHA, que e o outro lado da mesma regra: prejuizo realizado
 * em mes ISENTO nao vira credito. Quem vende no vermelho achando que esta
 * "guardando prejuizo" e fica sob os R$20 mil simplesmente perde o prejuizo.
 */

export interface PosicaoJanela {
  ticker: string;
  quantidade: number;
  precoMedio: Decimal;
  cotacao: Decimal;
  assetClass: AssetClass;
}

export interface SugestaoRealizacao {
  ticker: string;
  quantidade: number;
  valorVenda: Decimal;
  lucro: Decimal;
  custoGiro: Decimal;
  /** Lucro menos o custo de vender e recomprar. Negativo = nao compensa. */
  liquido: Decimal;
}

export interface AvisoPrejuizo {
  ticker: string;
  quantidade: number;
  valorVenda: Decimal;
  prejuizo: Decimal;
  /** true = vender isto sozinho deixa o mes isento e QUEIMA o prejuizo. */
  queimaSeSozinho: boolean;
  /** Quanto falta vender no mes para o prejuizo virar credito. */
  faltaParaTributavel: Decimal;
}

export interface JanelaFiscal {
  mes: string;
  vendidoNoMes: Decimal;
  limiteLegal: Decimal;
  margemIsenta: Decimal;
  mesJaTributavel: boolean;

  creditoDisponivel: Decimal;
  lucroNaoRealizado: Decimal;
  prejuizoNaoRealizado: Decimal;

  /** Lucro que cabe na margem isenta deste mes, sem tocar no credito. */
  janelaIsenta: SugestaoRealizacao[];
  lucroIsentoPossivel: Decimal;

  /** So preenchido quando o mes ja e tributavel. Consome credito. */
  janelaCredito: SugestaoRealizacao[];
  lucroCobertoPeloCredito: Decimal;

  /** Posicoes no vermelho cujo prejuizo se perde se o mes ficar isento. */
  avisos: AvisoPrejuizo[];

  /** Resumo em uma frase do que fazer, ou de que nao ha nada a fazer. */
  veredito: string;
}

export interface EntradaJanela {
  mes: string; // YYYY-MM
  posicoes: PosicaoJanela[];
  vendidoNoMes: Decimal.Value;
  creditoSwing: Decimal.Value;
  config?: TaxConfig;
}

/**
 * Monta as sugestoes preenchendo um teto de VENDAS, da posicao com melhor
 * relacao lucro/valor para a pior — realizar lucro caro em valor de venda
 * gasta a margem depressa e entrega pouco.
 */
function preencherTeto(
  posicoes: PosicaoJanela[],
  tetoVendas: Decimal,
  tetoLucro: Decimal | null,
  cfg: TaxConfig
): { sugestoes: SugestaoRealizacao[]; lucroTotal: Decimal } {
  const comLucro = posicoes
    .filter((p) => p.assetClass === 'acao' && p.cotacao.gt(p.precoMedio) && p.quantidade > 0)
    // densidade de lucro: quanto de ganho por real vendido
    .sort((a, b) => {
      const da = b.cotacao.minus(b.precoMedio).div(b.cotacao);
      const db = a.cotacao.minus(a.precoMedio).div(a.cotacao);
      return da.comparedTo(db);
    });

  const sugestoes: SugestaoRealizacao[] = [];
  let margem = tetoVendas;
  let lucroRestante = tetoLucro;
  let lucroTotal = ZERO;

  for (const p of comLucro) {
    if (margem.lte(0)) break;
    if (lucroRestante !== null && lucroRestante.lte(0)) break;

    const ganhoPorAcao = p.cotacao.minus(p.precoMedio);

    let qtd = Decimal.min(D(p.quantidade), margem.div(p.cotacao).floor()).toNumber();
    if (lucroRestante !== null && ganhoPorAcao.gt(0)) {
      qtd = Math.min(qtd, lucroRestante.div(ganhoPorAcao).floor().toNumber());
    }
    if (qtd <= 0) continue;

    const valorVenda = money(p.cotacao.times(qtd));
    const lucro = money(ganhoPorAcao.times(qtd));
    const custo = custoGiro(valorVenda, valorVenda, cfg);

    sugestoes.push({
      ticker: p.ticker,
      quantidade: qtd,
      valorVenda,
      lucro,
      custoGiro: custo,
      liquido: money(lucro.minus(custo)),
    });

    margem = margem.minus(valorVenda);
    lucroTotal = lucroTotal.plus(lucro);
    if (lucroRestante !== null) lucroRestante = lucroRestante.minus(lucro);
  }

  return { sugestoes, lucroTotal: money(lucroTotal) };
}

export function analisarJanela(e: EntradaJanela): JanelaFiscal {
  const cfg = e.config ?? TAX_CONFIG;
  const limite = D(cfg.LIMITE_LEGAL);
  const vendido = D(e.vendidoNoMes);
  const credito = D(e.creditoSwing);
  const margem = Decimal.max(ZERO, limite.minus(vendido));
  const jaTributavel = vendido.gt(limite);

  const acoes = e.posicoes.filter((p) => p.assetClass === 'acao');
  const lucroNaoRealizado = money(
    acoes.reduce(
      (a, p) => (p.cotacao.gt(p.precoMedio) ? a.plus(p.cotacao.minus(p.precoMedio).times(p.quantidade)) : a),
      ZERO
    )
  );
  const prejuizoNaoRealizado = money(
    acoes.reduce(
      (a, p) => (p.cotacao.lt(p.precoMedio) ? a.plus(p.precoMedio.minus(p.cotacao).times(p.quantidade)) : a),
      ZERO
    )
  );

  // Janela isenta: cabe na margem do mes, nao consome credito.
  const isenta = margem.gt(0)
    ? preencherTeto(acoes, margem, null, cfg)
    : { sugestoes: [], lucroTotal: ZERO };

  // Janela do credito: so quando o mes JA e tributavel. Antes disso, realizar
  // lucro consumindo credito seria trocar um recurso por nada — o lucro seria
  // isento de qualquer forma.
  const doCredito =
    jaTributavel && credito.gt(0)
      ? preencherTeto(acoes, D(Number.MAX_SAFE_INTEGER), credito, cfg)
      : { sugestoes: [], lucroTotal: ZERO };

  // Avisos de prejuizo que se perde em mes isento.
  const avisos: AvisoPrejuizo[] = acoes
    .filter((p) => p.cotacao.lt(p.precoMedio) && p.quantidade > 0)
    .map((p) => {
      const valorVenda = money(p.cotacao.times(p.quantidade));
      const totalSeVender = vendido.plus(valorVenda);
      return {
        ticker: p.ticker,
        quantidade: p.quantidade,
        valorVenda,
        prejuizo: money(p.precoMedio.minus(p.cotacao).times(p.quantidade)),
        queimaSeSozinho: totalSeVender.lte(limite),
        faltaParaTributavel: Decimal.max(ZERO, money(limite.minus(totalSeVender))),
      };
    })
    .filter((a) => a.prejuizo.gt(100)) // ruido abaixo disto nao merece alerta
    .sort((a, b) => b.prejuizo.comparedTo(a.prejuizo));

  // ---- Veredito ----
  let veredito: string;
  const isentaLiquida = isenta.sugestoes.reduce((a, s) => a.plus(s.liquido), ZERO);

  if (jaTributavel && doCredito.lucroTotal.gt(0)) {
    veredito =
      `O mês já passou dos R$ ${limite.toFixed(0)}, então está tributável de qualquer forma. ` +
      `Realizar até R$ ${doCredito.lucroTotal.toFixed(2)} de lucro sai sem imposto, ` +
      `coberto pelo crédito de prejuízo. É a hora de usar o crédito.`;
  } else if (isentaLiquida.gt(0) && isenta.lucroTotal.gt(0)) {
    veredito =
      `Cabem R$ ${margem.toFixed(2)} de vendas na isenção deste mês. ` +
      `Realizar R$ ${isenta.lucroTotal.toFixed(2)} de lucro sai isento SEM consumir o crédito ` +
      `de R$ ${credito.toFixed(2)}, que fica guardado para um mês tributável.`;
  } else if (lucroNaoRealizado.lte(0)) {
    veredito = 'Nenhuma posição no lucro. Não há o que realizar.';
  } else {
    veredito =
      'O giro não se paga agora: o custo de vender e recomprar supera o benefício fiscal. ' +
      'O crédito não vence, então esperar não custa nada.';
  }

  return {
    mes: e.mes,
    vendidoNoMes: money(vendido),
    limiteLegal: limite,
    margemIsenta: money(margem),
    mesJaTributavel: jaTributavel,
    creditoDisponivel: money(credito),
    lucroNaoRealizado,
    prejuizoNaoRealizado,
    janelaIsenta: isenta.sugestoes,
    lucroIsentoPossivel: isenta.lucroTotal,
    janelaCredito: doCredito.sugestoes,
    lucroCobertoPeloCredito: doCredito.lucroTotal,
    avisos,
    veredito,
  };
}
