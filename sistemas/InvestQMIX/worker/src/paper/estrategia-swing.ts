import Decimal from 'decimal.js';
import type { Ordem } from '@qmix-invest/db/paper/types';
import type { ContextoEstrategia, Estrategia } from './estrategia.js';

const D = (v: Decimal.Value) => new Decimal(v);

/** Indice de forca relativa (RSI) de Wilder. Abaixo de 30 = sobrevendido. */
export function rsi(fechamentos: Decimal[], periodo = 14): Decimal | null {
  if (fechamentos.length < periodo + 1) return null;
  let ganhos = D(0);
  let perdas = D(0);
  for (let i = fechamentos.length - periodo; i < fechamentos.length; i++) {
    const dif = fechamentos[i]!.minus(fechamentos[i - 1]!);
    if (dif.gt(0)) ganhos = ganhos.plus(dif);
    else perdas = perdas.plus(dif.abs());
  }
  if (perdas.isZero()) return D(100);
  const rs = ganhos.div(perdas);
  return D(100).minus(D(100).div(D(1).plus(rs)));
}

export type CriterioEntrada = 'queda-do-topo' | 'rsi' | 'abaixo-da-media';

export interface ParamsSwing {
  /** Como definir "descontado". */
  criterio?: CriterioEntrada;
  /** queda-do-topo: quanto caiu do topo dos ultimos N pregoes. Ex: 0.15 = 15%. */
  quedaMin?: number;
  janelaTopo?: number;
  /** rsi: compra quando o RSI fica abaixo disto. */
  rsiMax?: number;
  rsiPeriodo?: number;
  /** abaixo-da-media: quanto abaixo da media movel. Ex: 0.10 = 10%. */
  distanciaMedia?: number;
  janelaMedia?: number;

  /** Alvo de lucro. Ex: 0.15 = vende a +15% da entrada. */
  alvo?: number;
  /** Stop. Ex: 0.08 = sai a -8% da entrada. */
  stop?: number;
  /**
   * Prazo maximo em pregoes. Sem isto, posicao que nao bate alvo nem stop fica
   * presa para sempre e imobiliza capital que poderia estar em outra ideia.
   */
  prazoMaximo?: number;

  /** Fracao do caixa por posicao. */
  fracaoCapital?: number;
  /** Quantas posicoes simultaneas no maximo. */
  maxPosicoes?: number;
  /** Volume financeiro medio minimo para considerar o papel negociavel. */
  liquidezMinima?: number;

  /**
   * Teto de VENDAS por mes calendario, em BRL. Enquanto as alienacoes do mes
   * ficarem abaixo do limite legal de R$20 mil, o lucro e isento de IR.
   *
   * Quando ligado, a venda por ALVO e fatiada para caber no que sobrou do mes,
   * e adiada quando nao cabe nada. A venda por STOP ignora o teto de proposito:
   * planejamento tributario nao pode bloquear gestao de risco. Segurar um papel
   * caindo para economizar 15% de um lucro que ja virou prejuizo e trocar um
   * problema pequeno por um grande.
   */
  orcamentoMensalVendas?: number;
}

/**
 * Compra na queda, vende no alvo ou no stop.
 *
 * O ciclo e: detectar desconto no fechamento de ontem -> comprar na abertura de
 * hoje -> a cada pregao seguinte, verificar se a barra tocou o alvo ou o stop.
 *
 * REGRA DE DESEMPATE: quando a mesma barra toca alvo E stop, assume-se que o
 * STOP veio primeiro. Com barra diaria nao da pra saber a ordem dos dois dentro
 * do dia, e a escolha conservadora e a unica honesta — o contrario infla o
 * resultado de toda estrategia com alvo e stop apertados.
 */
export function compraNaQueda(tickers: string[], p: ParamsSwing = {}): Estrategia {
  const criterio = p.criterio ?? 'queda-do-topo';
  const quedaMin = D(p.quedaMin ?? 0.15);
  const janelaTopo = p.janelaTopo ?? 60;
  const rsiMax = D(p.rsiMax ?? 30);
  const rsiPeriodo = p.rsiPeriodo ?? 14;
  const distanciaMedia = D(p.distanciaMedia ?? 0.10);
  const janelaMedia = p.janelaMedia ?? 50;
  const alvo = D(p.alvo ?? 0.15);
  const stop = D(p.stop ?? 0.08);
  const prazoMaximo = p.prazoMaximo ?? 60;
  const fracao = D(p.fracaoCapital ?? 0.20);
  const maxPosicoes = p.maxPosicoes ?? 5;
  const liquidezMinima = D(p.liquidezMinima ?? 1_000_000);

  const orcamento = p.orcamentoMensalVendas ? D(p.orcamentoMensalVendas) : null;

  // Preco e pregao de entrada, para calcular alvo, stop e prazo.
  const entradas = new Map<string, { preco: Decimal; pregao: number }>();
  let pregao = 0;

  // Consumo do orcamento no mes corrente. A estrategia nao ve os fills, entao
  // mede a venda comparando as posicoes entre um pregao e o seguinte: o que
  // sumiu foi vendido. E aproximacao pelo fechamento anterior, nao pelo preco
  // exato de execucao, e serve porque o teto ja e conservador em relacao aos
  // R$20 mil da lei.
  let mesCorrente = '';
  let vendidoNoMes = D(0);
  let posicoesAnteriores = new Map<string, number>();

  const descricao =
    criterio === 'rsi'
      ? `Compra com RSI(${rsiPeriodo}) abaixo de ${rsiMax}`
      : criterio === 'abaixo-da-media'
        ? `Compra ${distanciaMedia.times(100)}% abaixo da media de ${janelaMedia}`
        : `Compra apos queda de ${quedaMin.times(100)}% do topo de ${janelaTopo} pregoes`;

  return {
    chave: `<<REMOVIDO>>`,
    descricao:
      `${descricao}. Vende no alvo de +${alvo.times(100)}% ou no stop de -${stop.times(100)}%, ` +
      `prazo maximo de ${prazoMaximo} pregoes. Ate ${maxPosicoes} posicoes de ${fracao.times(100)}% do caixa.`,
    universo: tickers,

    decidir(ctx: ContextoEstrategia): Ordem[] {
      pregao++;
      const ordens: Ordem[] = [];

      // ---- 0. Contabiliza o que foi vendido desde o pregao anterior ----
      if (orcamento) {
        const mes = ctx.data.slice(0, 7);
        if (mes !== mesCorrente) {
          mesCorrente = mes;
          vendidoNoMes = D(0); // vira o mes, zera o teto
        }
        for (const [ticker, qtdAntes] of posicoesAnteriores) {
          const agora = ctx.estado.posicoes.get(ticker)?.quantidade ?? 0;
          if (agora < qtdAntes) {
            const preco = ctx.precos.get(ticker) ?? ctx.barras.get(ticker)?.open ?? D(0);
            vendidoNoMes = vendidoNoMes.plus(preco.times(qtdAntes - agora));
          }
        }
        posicoesAnteriores = new Map(
          [...ctx.estado.posicoes.values()].map((p) => [p.ticker, p.quantidade])
        );
      }

      const sobraNoMes = orcamento ? Decimal.max(D(0), orcamento.minus(vendidoNoMes)) : null;

      // ---- 1. Gestao das posicoes abertas ----
      for (const posicao of [...ctx.estado.posicoes.values()]) {
        const entrada = entradas.get(posicao.ticker);
        if (!entrada) continue;
        const barra = ctx.barras.get(posicao.ticker);
        if (!barra) continue;

        const precoStop = entrada.preco.times(D(1).minus(stop));
        const precoAlvo = entrada.preco.times(D(1).plus(alvo));

        const tocouStop = barra.low.lte(precoStop);
        const tocouAlvo = barra.high.gte(precoAlvo);
        const venceuPrazo = pregao - entrada.pregao >= prazoMaximo;

        if (tocouStop) {
          // Stop SEMPRE integral e SEMPRE fora do orcamento. Gestao de risco
          // nao se subordina a planejamento tributario.
          ordens.push({
            ticker: posicao.ticker, side: 'sell', tipo: 'stop',
            quantidade: posicao.quantidade, precoLimite: precoStop,
            razao: `stop de ${stop.times(100)}% (entrada ${entrada.preco.toFixed(2)})`,
          });
          entradas.delete(posicao.ticker);
        } else if (tocouAlvo || venceuPrazo) {
          const tipo = tocouAlvo ? 'limit' : 'market';
          const preco = tocouAlvo ? precoAlvo : (ctx.barras.get(posicao.ticker)?.open ?? precoAlvo);

          let qtd = posicao.quantidade;
          if (sobraNoMes) {
            // Fatia a venda para caber no teto do mes. Se nao couber nem um
            // lote, adia: o alvo continua valendo no proximo pregao, e no mes
            // que vem o orcamento reabre.
            const cabe = sobraNoMes.div(preco).floor().toNumber();
            qtd = Math.min(qtd, Math.max(0, cabe));
            if (qtd <= 0) continue;
          }

          ordens.push({
            ticker: posicao.ticker, side: 'sell', tipo,
            quantidade: qtd,
            precoLimite: tocouAlvo ? precoAlvo : null,
            razao: tocouAlvo
              ? `alvo de +${alvo.times(100)}% (entrada ${entrada.preco.toFixed(2)})` +
                (qtd < posicao.quantidade ? ' — venda parcial pelo teto de isencao' : '')
              : `prazo de ${prazoMaximo} pregoes vencido sem alvo nem stop`,
          });
          // So esquece a entrada quando saiu tudo; venda parcial mantem o alvo.
          if (qtd >= posicao.quantidade) entradas.delete(posicao.ticker);
        }
      }

      // ---- 2. Novas entradas ----
      const abertas = ctx.estado.posicoes.size;
      const vagas = maxPosicoes - abertas;
      if (vagas <= 0) return ordens;

      const candidatos: Array<{ ticker: string; desconto: Decimal }> = [];

      for (const ticker of tickers) {
        if (ctx.estado.posicoes.has(ticker)) continue;
        const barra = ctx.barras.get(ticker);
        if (!barra || barra.open.lte(0)) continue;

        const hist = ctx.historico(ticker, Math.max(janelaTopo, janelaMedia, rsiPeriodo + 2));
        if (hist.length < 20) continue;

        // Liquidez: media do financeiro dos ultimos 20 pregoes.
        const liq = hist.slice(-20).reduce((a, b) => a.plus(b.financeiro), D(0)).div(20);
        if (liq.lt(liquidezMinima)) continue;

        const ultimoFech = hist.at(-1)!.close;
        let desconto: Decimal | null = null;

        if (criterio === 'queda-do-topo') {
          const janela = hist.slice(-janelaTopo);
          if (janela.length < janelaTopo) continue;
          const topo = janela.reduce((a, b) => (b.high.gt(a) ? b.high : a), janela[0]!.high);
          if (topo.lte(0)) continue;
          const queda = topo.minus(ultimoFech).div(topo);
          if (queda.gte(quedaMin)) desconto = queda;
        } else if (criterio === 'rsi') {
          const r = rsi(hist.map((b) => b.close), rsiPeriodo);
          if (r && r.lt(rsiMax)) desconto = rsiMax.minus(r);
        } else {
          const janela = hist.slice(-janelaMedia);
          if (janela.length < janelaMedia) continue;
          const media = janela.reduce((a, b) => a.plus(b.close), D(0)).div(janelaMedia);
          if (media.lte(0)) continue;
          const abaixo = media.minus(ultimoFech).div(media);
          if (abaixo.gte(distanciaMedia)) desconto = abaixo;
        }

        if (desconto) candidatos.push({ ticker, desconto });
      }

      // Mais descontado primeiro, ate preencher as vagas.
      candidatos.sort((a, b) => b.desconto.comparedTo(a.desconto));
      for (const c of candidatos.slice(0, vagas)) {
        const barra = ctx.barras.get(c.ticker)!;
        const capital = ctx.estado.caixa.times(fracao);
        const qtd = capital.div(barra.open).floor().toNumber();
        if (qtd <= 0) continue;
        ordens.push({
          ticker: c.ticker, side: 'buy', tipo: 'market', quantidade: qtd,
          razao: `${descricao.toLowerCase()} — desconto de ${c.desconto.times(100).toFixed(1)}%`,
        });
        // A entrada real sai na abertura; registra-se ela como referencia.
        entradas.set(c.ticker, { preco: barra.open, pregao });
      }

      return ordens;
    },
  };
}
