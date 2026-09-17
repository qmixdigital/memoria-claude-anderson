import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export interface ResumoRodada {
  retornoPct: number | null;
  cagrPct: number | null;
  maxDrawdownPct: number | null;
  volatilidadePct: number | null;
  sharpe: number | null;
  totalTrades: number;
  taxaAcertoPct: number | null;
  profitFactor: number | null;
  ganhoMedio: number | null;
  perdaMedia: number | null;
  custoTotal: number;
  impostoTotal: number;
  resultadoLiquido: number;
  mesesIsentos?: number;
  mesesTributaveis?: number;
  lucroIsento?: number;
  fechamentosForcados?: number;
  pregoes?: number;
  tipo?: string;
  erro?: string;
  falhou?: boolean;
}

export interface Rodada {
  id: number;
  nome: string;
  estrategia: string;
  inicio: string;
  fim: string;
  caixaInicial: number;
  caixaFinal: number;
  criadoEm: Date;
  resumo: ResumoRodada | null;
  params: Record<string, unknown> | null;
  ehBenchmark: boolean;
}

function json<T>(v: unknown): T | null {
  if (typeof v !== 'string' || v.trim() === '') return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

const n = (v: unknown): number | null =>
  v === null || v === undefined ? null : Number(v);

export async function listarRodadas(limite = 40): Promise<Rodada[]> {
  const rows = (await db.execute(sql`
    select id, nome, estrategia, data_inicio::text as inicio, data_fim::text as fim,
           caixa_inicial::text, caixa::text, criado_em, observacoes, params_json
      from qmix_invest.paper_accounts
     where kind = 'backtest'
     order by criado_em desc
     limit ${limite}
  `)) as unknown as Array<Record<string, unknown>>;

  return rows.map((r) => {
    const resumo = json<Record<string, unknown>>(r.observacoes);
    return {
      id: Number(r.id),
      nome: String(r.nome),
      estrategia: String(r.estrategia ?? ''),
      inicio: String(r.inicio),
      fim: String(r.fim),
      caixaInicial: Number(r.caixa_inicial),
      caixaFinal: Number(r.caixa),
      criadoEm: new Date(r.criado_em as string),
      params: json<Record<string, unknown>>(r.params_json),
      ehBenchmark: String(r.nome).includes('BENCHMARK'),
      resumo: resumo
        ? {
            retornoPct: n(resumo.retornoPct),
            cagrPct: n(resumo.cagrPct),
            maxDrawdownPct: n(resumo.maxDrawdownPct),
            volatilidadePct: n(resumo.volatilidadePct),
            sharpe: n(resumo.sharpe),
            totalTrades: Number(resumo.totalTrades ?? 0),
            taxaAcertoPct: n(resumo.taxaAcertoPct),
            profitFactor: n(resumo.profitFactor),
            ganhoMedio: n(resumo.ganhoMedio),
            perdaMedia: n(resumo.perdaMedia),
            custoTotal: Number(resumo.custoTotal ?? 0),
            impostoTotal: Number(resumo.impostoTotal ?? 0),
            resultadoLiquido: Number(resumo.resultadoLiquido ?? 0),
            mesesIsentos: resumo.mesesIsentos as number | undefined,
            mesesTributaveis: resumo.mesesTributaveis as number | undefined,
            lucroIsento: n(resumo.lucroIsento) ?? undefined,
            fechamentosForcados: resumo.fechamentosForcados as number | undefined,
            pregoes: resumo.pregoes as number | undefined,
            tipo: resumo.tipo as string | undefined,
            erro: resumo.erro as string | undefined,
            falhou: resumo.falhou as boolean | undefined,
          }
        : null,
    };
  });
}

/** Rodada com o benchmark ao lado e o veredito ja pronto. */
export interface RodadaComparada extends Rodada {
  benchmark: Rodada | null;
  /** Diferenca no LIQUIDO contra o comprar-e-segurar. */
  difLiquido: number | null;
  veredito: string;
  venceu: boolean | null;
}

/**
 * Emparelha cada estrategia com o benchmark dela e escreve o veredito em
 * portugues. Sem isto a tela obriga a pessoa a comparar dois cartoes de numeros
 * na mao pra descobrir se a ideia prestou — que e justamente o que ela nao sabe
 * fazer ainda.
 */
export function compararRodadas(rodadas: Rodada[]): RodadaComparada[] {
  const benchPorNome = new Map<string, Rodada>();
  for (const r of rodadas) {
    if (r.ehBenchmark) benchPorNome.set(r.nome.replace(' · BENCHMARK', ''), r);
  }

  return rodadas
    .filter((r) => !r.ehBenchmark)
    .map((r) => {
      const b = benchPorNome.get(r.nome) ?? null;
      const meu = r.resumo?.resultadoLiquido ?? null;
      const dele = b?.resumo?.resultadoLiquido ?? null;

      if (r.resumo?.falhou) {
        return { ...r, benchmark: b, difLiquido: null, venceu: null,
                 veredito: 'A simulação falhou. Veja o erro abaixo.' };
      }
      if (meu === null || dele === null) {
        return { ...r, benchmark: b, difLiquido: null, venceu: null,
                 veredito: 'Sem comparação: esta rodada não tem o comprar e segurar ao lado.' };
      }

      const dif = meu - dele;
      const fmt = (v: number) =>
        Math.abs(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      return {
        ...r,
        benchmark: b,
        difLiquido: dif,
        venceu: dif >= 0,
        veredito:
          dif >= 0
            ? `Rendeu ${fmt(dif)} A MAIS do que simplesmente comprar e segurar os mesmos papéis, já descontado o imposto.`
            : `Rendeu ${fmt(dif)} A MENOS do que simplesmente comprar e segurar os mesmos papéis. Nesse caso, não mexer teria dado mais dinheiro.`,
      };
    });
}

export interface PontoCurva {
  data: string;
  patrimonio: number;
  drawdownPct: number;
}

export async function curvaDaRodada(accountId: number): Promise<PontoCurva[]> {
  const rows = (await db.execute(sql`
    select data::text, patrimonio::text, drawdown_pct::text
      from qmix_invest.paper_equity
     where account_id = ${accountId}
     order by data
  `)) as unknown as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    data: String(r.data),
    patrimonio: Number(r.patrimonio),
    drawdownPct: Number(r.drawdown_pct),
  }));
}

/** Cobertura dos dados, para a tela avisar o que da pra simular. */
export interface CoberturaDados {
  diarioTickers: number;
  diarioDe: string | null;
  diarioAte: string | null;
  intradayTickers: number;
  intradayPregoes: number;
  intradayDe: string | null;
  intradayAte: string | null;
}

export async function coberturaDados(): Promise<CoberturaDados> {
  const [d, i] = await Promise.all([
    db.execute(sql`
      select count(distinct ticker)::int as tickers,
             min(date)::text as de, max(date)::text as ate
        from qmix_invest.prices_daily
    `),
    db.execute(sql`
      select count(distinct ticker)::int as tickers,
             count(distinct (ts at time zone 'America/Sao_Paulo')::date)::int as pregoes,
             min((ts at time zone 'America/Sao_Paulo')::date)::text as de,
             max((ts at time zone 'America/Sao_Paulo')::date)::text as ate
        from qmix_invest.prices_intraday
    `),
  ]);
  const dd = (d as unknown as Array<Record<string, unknown>>)[0] ?? {};
  const ii = (i as unknown as Array<Record<string, unknown>>)[0] ?? {};
  return {
    diarioTickers: Number(dd.tickers ?? 0),
    diarioDe: (dd.de as string) ?? null,
    diarioAte: (dd.ate as string) ?? null,
    intradayTickers: Number(ii.tickers ?? 0),
    intradayPregoes: Number(ii.pregoes ?? 0),
    intradayDe: (ii.de as string) ?? null,
    intradayAte: (ii.ate as string) ?? null,
  };
}
