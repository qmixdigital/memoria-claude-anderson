import Decimal from 'decimal.js';
import type { Ordem } from '@qmix-invest/db/paper/types';
import type { ContextoIntraday, EstrategiaIntraday } from './backtest-intraday.js';

const D = (v: Decimal.Value) => new Decimal(v);

/**
 * Rompimento da faixa de abertura (opening range breakout).
 *
 * A estrategia de day trade mais ensinada que existe: mede a maxima e a minima
 * dos primeiros N minutos e compra quando o preco rompe a maxima, com stop e
 * alvo em multiplos da propria faixa.
 *
 * Aqui ela existe como REFERENCIA HONESTA, nao como recomendacao. E o teste
 * mais direto da tese do video: uma estrategia intradiaria classica, com custo,
 * slippage e imposto de verdade, sobrevive?
 *
 * Sem venda a descoberto: o simulador so opera comprado, entao rompimento de
 * baixa e ignorado. Isso favorece a estrategia num mercado de alta, e vale
 * lembrar disso ao ler o resultado.
 */
export function rompimentoAbertura(
  universo: string[],
  opts: {
    minutosFaixa?: number;
    stopPct?: number;
    alvoPct?: number;
    fracaoCapital?: number;
  } = {}
): EstrategiaIntraday {
  const minutosFaixa = opts.minutosFaixa ?? 30;
  const stopPct = D(opts.stopPct ?? 0.005);
  const alvoPct = D(opts.alvoPct ?? 0.010);
  const fracao = D(opts.fracaoCapital ?? 0.25);

  // Preco de entrada por ticker no dia, para calcular stop e alvo.
  const entradas = new Map<string, { dia: string; preco: Decimal }>();

  return {
    chave: `<<REMOVIDO>>`,
    descricao:
      `Rompimento da faixa dos primeiros ${minutosFaixa} min. ` +
      `Stop ${stopPct.times(100)}%, alvo ${alvoPct.times(100)}%, ` +
      `${fracao.times(100)}% do capital por posicao. Sem operar vendido.`,
    universo,

    decidir(ctx: ContextoIntraday): Ordem[] {
      const ordens: Ordem[] = [];
      const barrasFaixa = Math.ceil(minutosFaixa / 5);

      for (const ticker of universo) {
        const barra = ctx.barras.get(ticker);
        if (!barra) continue;
        const anteriores = ctx.hoje(ticker);

        const posicao = ctx.estado.posicoes.get(ticker);

        // ---- Gestao de posicao aberta: stop e alvo ----
        if (posicao) {
          const entrada = entradas.get(ticker);
          if (entrada && entrada.dia === ctx.dia) {
            const stop = entrada.preco.times(D(1).minus(stopPct));
            const alvo = entrada.preco.times(D(1).plus(alvoPct));
            // Usa a barra corrente: o stop dispara quando o preco JA tocou.
            if (barra.low.lte(stop) || barra.high.gte(alvo)) {
              ordens.push({
                ticker, side: 'sell', tipo: 'market', quantidade: posicao.quantidade,
                razao: barra.low.lte(stop) ? 'stop atingido' : 'alvo atingido',
              });
              entradas.delete(ticker);
            }
          }
          continue; // uma posicao por papel
        }

        // ---- Entrada: so depois da faixa formada ----
        if (anteriores.length < barrasFaixa) continue;
        // Nao abre posicao nova perto do fechamento: nao ha tempo para o trade
        // se desenvolver e o fechamento compulsorio zera no preco que estiver.
        if (ctx.minutosAteFechar < 30) continue;

        const faixa = anteriores.slice(0, barrasFaixa);
        const maxima = faixa.reduce((a, b) => (b.high.gt(a) ? b.high : a), faixa[0]!.high);

        // Rompimento confirmado quando a barra corrente supera a maxima da faixa.
        if (barra.high.gt(maxima) && barra.close.gt(maxima)) {
          const capital = ctx.estado.caixa.times(fracao);
          const qtd = capital.div(barra.close).floor().toNumber();
          if (qtd > 0) {
            ordens.push({
              ticker, side: 'buy', tipo: 'market', quantidade: qtd,
              razao: `rompeu a maxima de ${maxima.toFixed(2)} da faixa de ${minutosFaixa} min`,
            });
            entradas.set(ticker, { dia: ctx.dia, preco: barra.close });
          }
        }
      }
      return ordens;
    },
  };
}
