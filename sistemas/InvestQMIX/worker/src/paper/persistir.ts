import Decimal from 'decimal.js';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { curvaDrawdown } from '@qmix-invest/db/paper/metricas';
import type { ResultadoBacktest } from './backtest.js';
import type { ResultadoIntraday } from './backtest-intraday.js';

/**
 * Grava o resultado de um backtest para a tela poder ler depois.
 *
 * Sem isto cada rodada morre no terminal e nao da pra comparar duas ideias
 * lado a lado — que e justamente o trabalho de estudar estrategia.
 */
export interface EntradaPersistencia {
  nome: string;
  estrategia: string;
  params: Record<string, unknown>;
  inicio: string;
  fim: string;
  caixaInicial: number;
  serie: Array<{ data: string; patrimonio: Decimal }>;
  trades: Array<{ ticker: string; dataEntrada: string; dataSaida: string; lucro: Decimal }>;
  resumoJson: Record<string, unknown>;
}

async function gravar(e: EntradaPersistencia): Promise<number> {
  const final = e.serie.at(-1)?.patrimonio ?? new Decimal(e.caixaInicial);

  const rows = (await db.execute(sql`
    insert into qmix_invest.paper_accounts
      (nome, kind, caixa_inicial, caixa, data_inicio, data_fim, estrategia, params_json,
       encerrada_em, observacoes)
    values (${e.nome}, 'backtest', ${e.caixaInicial}, ${final.toFixed(2)},
            ${e.inicio}::date, ${e.fim}::date, ${e.estrategia},
            ${JSON.stringify(e.params)}, now(), ${JSON.stringify(e.resumoJson)})
    returning id
  `)) as unknown as Array<{ id: number }>;

  const accountId = rows[0]!.id;

  // Curva de capital, com o drawdown ja calculado para a tela nao recalcular.
  const dd = curvaDrawdown(e.serie);
  const LOTE = 500;
  for (let i = 0; i < e.serie.length; i += LOTE) {
    const fatia = e.serie.slice(i, i + LOTE);
    const values = fatia
      .map((p, j) => {
        const d = dd[i + j]!;
        return `(${accountId}, '${p.data}'::date, 0, ${p.patrimonio.toFixed(2)}, ` +
               `${p.patrimonio.toFixed(2)}, ${d.pico.toFixed(2)}, ${d.drawdownPct.toFixed(4)})`;
      })
      .join(',');
    await db.execute(
      sql.raw(`
        insert into qmix_invest.paper_equity
          (account_id, data, caixa, valor_posicoes, patrimonio, pico, drawdown_pct)
        values ${values}
        on conflict (account_id, data) do nothing
      `)
    );
  }

  return accountId;
}

export async function persistirBacktest(
  r: ResultadoBacktest,
  nome: string,
  params: Record<string, unknown>,
  caixaInicial = 100000
): Promise<number> {
  const m = r.metricas;
  return gravar({
    nome,
    estrategia: r.estrategia,
    params,
    inicio: r.inicio,
    fim: r.fim,
    caixaInicial,
    serie: r.serie,
    trades: r.trades,
    resumoJson: {
      tipo: 'swing',
      pregoes: r.pregoes,
      retornoPct: m?.retornoPct?.toString() ?? null,
      cagrPct: m?.cagrPct?.toString() ?? null,
      maxDrawdownPct: m?.maxDrawdownPct?.toString() ?? null,
      volatilidadePct: m?.volatilidadeAnualPct?.toString() ?? null,
      sharpe: m?.sharpe?.toString() ?? null,
      totalTrades: m?.totalTrades ?? 0,
      taxaAcertoPct: m?.taxaAcertoPct?.toString() ?? null,
      profitFactor: m?.profitFactor?.toString() ?? null,
      ganhoMedio: m?.ganhoMedio?.toString() ?? null,
      perdaMedia: m?.perdaMedia?.toString() ?? null,
      custoTotal: r.custoTotal.toString(),
      impostoTotal: r.imposto.impostoTotal.toString(),
      resultadoLiquido: r.resultadoLiquido.toString(),
      mesesIsentos: r.imposto.mesesIsentos,
      mesesTributaveis: r.imposto.mesesTributaveis,
      lucroIsento: r.imposto.lucroIsentoTotal.toString(),
      rejeicoes: r.ordensRejeitadas,
    },
  });
}

export async function persistirIntraday(
  r: ResultadoIntraday,
  nome: string,
  params: Record<string, unknown>,
  caixaInicial = 100000
): Promise<number> {
  const m = r.metricas;
  return gravar({
    nome,
    estrategia: r.estrategia,
    params,
    inicio: r.inicio,
    fim: r.fim,
    caixaInicial,
    serie: r.serie,
    trades: r.trades,
    resumoJson: {
      tipo: 'day-trade',
      pregoes: r.pregoes,
      barras: r.barras,
      retornoPct: m?.retornoPct?.toString() ?? null,
      maxDrawdownPct: m?.maxDrawdownPct?.toString() ?? null,
      sharpe: m?.sharpe?.toString() ?? null,
      totalTrades: m?.totalTrades ?? 0,
      taxaAcertoPct: m?.taxaAcertoPct?.toString() ?? null,
      profitFactor: m?.profitFactor?.toString() ?? null,
      ganhoMedio: m?.ganhoMedio?.toString() ?? null,
      perdaMedia: m?.perdaMedia?.toString() ?? null,
      custoTotal: r.custoTotal.toString(),
      impostoTotal: r.impostoTotal.toString(),
      resultadoLiquido: r.resultadoLiquido.toString(),
      fechamentosForcados: r.fechamentosForcados,
      rejeicoes: r.rejeicoes,
    },
  });
}
