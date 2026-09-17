import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { logger } from '../logger.js';
import { rodarBacktest } from './backtest.js';
import { rodarBacktestIntraday } from './backtest-intraday.js';
import { buyAndHold, cruzamentoMedias } from './estrategia.js';
import { compraNaQueda, type CriterioEntrada } from './estrategia-swing.js';
import { rompimentoAbertura } from './estrategia-intraday.js';
import { persistirBacktest, persistirIntraday } from './persistir.js';

/** Payload que a tela envia pela fila. */
export interface PedidoBacktest {
  nome?: string;
  tipo: 'swing' | 'day-trade' | 'buy-and-hold' | 'cruzamento';
  tickers: string[];
  inicio: string;
  fim: string;
  caixaInicial?: number;
  // swing
  criterio?: CriterioEntrada;
  alvo?: number;
  stop?: number;
  prazoMaximo?: number;
  maxPosicoes?: number;
  fracaoCapital?: number;
  orcamentoMensalVendas?: number;
  // cruzamento
  curta?: number;
  longa?: number;
  // day trade
  minutosFaixa?: number;
  // comparar com comprar-e-segurar na mesma rodada
  comBenchmark?: boolean;
}

function rotulo(p: PedidoBacktest): string {
  const papeis = p.tickers.slice(0, 3).join(',') + (p.tickers.length > 3 ? `+${p.tickers.length - 3}` : '');
  if (p.tipo === 'swing') {
    return `${papeis} · queda→alvo ${((p.alvo ?? 0.15) * 100).toFixed(0)}%/stop ${((p.stop ?? 0.08) * 100).toFixed(0)}%` +
      (p.orcamentoMensalVendas ? ` · teto R$${p.orcamentoMensalVendas}` : '');
  }
  if (p.tipo === 'day-trade') return `${papeis} · rompimento ${p.minutosFaixa ?? 30}min`;
  if (p.tipo === 'cruzamento') return `${papeis} · médias ${p.curta ?? 20}/${p.longa ?? 50}`;
  return `${papeis} · comprar e segurar`;
}

/**
 * Executa um pedido de backtest e grava o resultado.
 *
 * Roda no worker, e nao numa server action, porque um backtest de 5 anos sobre
 * dezenas de papeis leva mais que o timeout confortavel de uma requisicao — e
 * porque assim o resultado fica gravado e comparavel com as rodadas anteriores.
 */
export async function executarPedido(p: PedidoBacktest): Promise<number[]> {
  const log = logger.child({ job: 'paper-backtest', tipo: p.tipo });
  const nome = p.nome?.trim() || rotulo(p);
  const caixa = p.caixaInicial ?? 100000;
  const ids: number[] = [];

  if (p.tipo === 'day-trade') {
    const estrategia = rompimentoAbertura(p.tickers, {
      minutosFaixa: p.minutosFaixa ?? 30,
      stopPct: p.stop ?? 0.005,
      alvoPct: p.alvo ?? 0.01,
      fracaoCapital: p.fracaoCapital ?? 0.25,
    });
    const r = await rodarBacktestIntraday({
      estrategia, inicio: p.inicio, fim: p.fim, caixaInicial: caixa,
    });
    ids.push(await persistirIntraday(r, nome, p as unknown as Record<string, unknown>, caixa));
  } else {
    const estrategia =
      p.tipo === 'swing'
        ? compraNaQueda(p.tickers, {
            criterio: p.criterio ?? 'queda-do-topo',
            alvo: p.alvo ?? 0.15,
            stop: p.stop ?? 0.08,
            prazoMaximo: p.prazoMaximo ?? 60,
            maxPosicoes: p.maxPosicoes ?? 5,
            fracaoCapital: p.fracaoCapital ?? 0.20,
            orcamentoMensalVendas: p.orcamentoMensalVendas,
          })
        : p.tipo === 'cruzamento'
          ? cruzamentoMedias(p.tickers, p.curta ?? 20, p.longa ?? 50)
          : buyAndHold(p.tickers);

    const r = await rodarBacktest({
      estrategia, inicio: p.inicio, fim: p.fim, caixaInicial: caixa,
    });
    ids.push(await persistirBacktest(r, nome, p as unknown as Record<string, unknown>, caixa));
  }

  // Benchmark na mesma rodada: retorno sem comparacao nao diz nada.
  if (p.comBenchmark !== false && p.tipo !== 'buy-and-hold' && p.tipo !== 'day-trade') {
    const b = await rodarBacktest({
      estrategia: buyAndHold(p.tickers),
      inicio: p.inicio, fim: p.fim, caixaInicial: caixa,
    });
    ids.push(
      await persistirBacktest(b, `${nome} · BENCHMARK`, { benchmarkDe: nome }, caixa)
    );
  }

  log.info({ ids, nome }, 'backtest persistido');
  return ids;
}

/** Marca uma rodada como falha, para a tela nao ficar esperando eternamente. */
export async function registrarFalha(p: PedidoBacktest, erro: string): Promise<void> {
  await db.execute(sql`
    insert into qmix_invest.paper_accounts
      (nome, kind, caixa_inicial, caixa, data_inicio, data_fim, estrategia,
       params_json, encerrada_em, observacoes)
    values (${rotulo(p)}, 'backtest', ${p.caixaInicial ?? 100000}, 0,
            ${p.inicio}::date, ${p.fim}::date, ${p.tipo},
            ${JSON.stringify(p)}, now(),
            ${JSON.stringify({ erro, falhou: true })})
  `);
}
