import Decimal from 'decimal.js';
import type { Bar, EstadoConta, Ordem } from '@qmix-invest/db/paper/types';

/**
 * O que a estrategia enxerga num pregao.
 *
 * `historico` devolve as barras ANTERIORES ao dia corrente, nunca a do proprio
 * dia nem as futuras. Essa fronteira e o que impede lookahead bias — olhar
 * dado que nao existia no momento da decisao, o erro que faz qualquer backtest
 * parecer genial.
 */
export interface ContextoEstrategia {
  data: string;
  /** Barra de hoje, por ticker. Use com cuidado: a ordem executa na ABERTURA. */
  barras: Map<string, Bar>;
  /** As `n` barras anteriores a hoje, da mais antiga para a mais recente. */
  historico(ticker: string, n: number): Bar[];
  estado: EstadoConta;
  /** Fechamento de ontem, que e o ultimo preco conhecido ao decidir. */
  precos: Map<string, Decimal>;
  universo: string[];
}

export interface Estrategia {
  chave: string;
  descricao: string;
  /** Papeis que a estrategia acompanha. Vazio = todo o universo. */
  universo?: string[];
  decidir(ctx: ContextoEstrategia): Ordem[];
}

const D = (v: Decimal.Value) => new Decimal(v);

/** Media simples dos fechamentos das ultimas `n` barras. */
export function mediaMovel(barras: Bar[], n: number): Decimal | null {
  if (barras.length < n) return null;
  const janela = barras.slice(-n);
  return janela.reduce((a, b) => a.plus(b.close), D(0)).div(n);
}

// ---------------------------------------------------------------------------
// Estrategias de referencia
// ---------------------------------------------------------------------------

/**
 * Comprar e segurar, dividido igualmente. E o benchmark obrigatorio: qualquer
 * estrategia ativa precisa bater isto DEPOIS de custo e imposto, senao ela e
 * so uma forma cara de ficar comprado.
 */
export function buyAndHold(tickers: string[]): Estrategia {
  return {
    chave: 'buy-and-hold',
    descricao: `Compra ${tickers.join(', ')} no primeiro pregao em pesos iguais e nao mexe mais.`,
    universo: tickers,
    decidir(ctx) {
      if (ctx.estado.posicoes.size > 0) return [];
      const fatia = ctx.estado.caixa.div(tickers.length).times('0.98'); // folga p/ custos
      const ordens: Ordem[] = [];
      for (const t of tickers) {
        const barra = ctx.barras.get(t);
        if (!barra || barra.open.lte(0)) continue;
        const qtd = fatia.div(barra.open).floor().toNumber();
        if (qtd > 0) {
          ordens.push({ ticker: t, side: 'buy', tipo: 'market', quantidade: qtd, razao: 'alocacao inicial' });
        }
      }
      return ordens;
    },
  };
}

/**
 * Cruzamento de medias moveis: compra quando a curta cruza acima da longa,
 * vende quando cruza abaixo. E o exemplo didatico classico — util justamente
 * para mostrar quanto do resultado bruto some depois de custo e imposto.
 */
export function cruzamentoMedias(
  tickers: string[],
  curta = 20,
  longa = 50
): Estrategia {
  return {
    chave: `<<REMOVIDO>>`,
    descricao: `Compra quando a media de ${curta} cruza acima da de ${longa}; vende no cruzamento inverso.`,
    universo: tickers,
    decidir(ctx) {
      const ordens: Ordem[] = [];
      const fatia = ctx.estado.caixa.div(Math.max(1, tickers.length));

      for (const t of tickers) {
        const hist = ctx.historico(t, longa + 2);
        if (hist.length < longa + 1) continue;

        const mCurtaHoje = mediaMovel(hist, curta);
        const mLongaHoje = mediaMovel(hist, longa);
        const mCurtaOntem = mediaMovel(hist.slice(0, -1), curta);
        const mLongaOntem = mediaMovel(hist.slice(0, -1), longa);
        if (!mCurtaHoje || !mLongaHoje || !mCurtaOntem || !mLongaOntem) continue;

        const cruzouCima = mCurtaOntem.lte(mLongaOntem) && mCurtaHoje.gt(mLongaHoje);
        const cruzouBaixo = mCurtaOntem.gte(mLongaOntem) && mCurtaHoje.lt(mLongaHoje);
        const posicao = ctx.estado.posicoes.get(t);
        const barra = ctx.barras.get(t);
        if (!barra || barra.open.lte(0)) continue;

        if (cruzouCima && !posicao) {
          const qtd = fatia.div(barra.open).floor().toNumber();
          if (qtd > 0) {
            ordens.push({
              ticker: t, side: 'buy', tipo: 'market', quantidade: qtd,
              razao: `media ${curta} cruzou acima da ${longa}`,
            });
          }
        } else if (cruzouBaixo && posicao) {
          ordens.push({
            ticker: t, side: 'sell', tipo: 'market', quantidade: posicao.quantidade,
            razao: `media ${curta} cruzou abaixo da ${longa}`,
          });
        }
      }
      return ordens;
    },
  };
}
