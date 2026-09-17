import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

export interface PosicaoRobo {
  ticker: string;
  quantidade: number;
  precoMedio: number;
  cotacao: number | null;
  valorAtual: number;
  resultado: number;
  resultadoPct: number;
}

export interface OrdemRobo {
  id: number;
  ticker: string;
  side: 'buy' | 'sell';
  tipo: string;
  quantidade: number;
  status: string;
  razao: string | null;
  motivoRejeicao: string | null;
  criadoEm: Date;
  precoExec: number | null;
}

export interface DespertarRobo {
  slot: string;
  resumo: string;
  proximo: string | null;
  criadoEm: Date;
}

export interface RoboView {
  existe: boolean;
  ativo: boolean;
  contaId: number | null;
  caixaInicial: number;
  caixa: number;
  valorPosicoes: number;
  patrimonio: number;
  resultado: number;
  resultadoPct: number;
  posicoes: PosicaoRobo[];
  ordens: OrdemRobo[];
  despertares: DespertarRobo[];
  curva: Array<{ data: string; patrimonio: number; drawdownPct: number }>;
  diasOperando: number;
}

export async function getRobo(): Promise<RoboView> {
  const contaRows = (await db.execute(sql`
    select id, caixa::text, caixa_inicial::text
      from qmix_invest.paper_accounts
     where kind = 'live' and nome = 'robo-ia' and encerrada_em is null limit 1
  `)) as unknown as Array<Record<string, string>>;

  const vazio: RoboView = {
    existe: false, ativo: false, contaId: null, caixaInicial: 0, caixa: 0,
    valorPosicoes: 0, patrimonio: 0, resultado: 0, resultadoPct: 0,
    posicoes: [], ordens: [], despertares: [], curva: [], diasOperando: 0,
  };
  if (!contaRows[0]) return vazio;

  const contaId = Number(contaRows[0].id);
  const caixa = num(contaRows[0].caixa);
  const caixaInicial = num(contaRows[0].caixa_inicial);

  const [posRows, ordRows, hoffRows, eqRows] = await Promise.all([
    db.execute(sql`
      select p.ticker, p.quantidade, p.preco_medio::text, t.last_quote_brl::text as cotacao
        from qmix_invest.paper_positions p
        left join qmix_invest.tickers t on t.ticker = p.ticker
       where p.account_id = ${contaId} order by p.ticker
    `),
    db.execute(sql`
      select o.id, o.ticker, o.side, o.tipo, o.quantidade, o.status, o.razao,
             o.motivo_rejeicao, o.criado_em, f.preco_exec::text
        from qmix_invest.paper_orders o
        left join qmix_invest.paper_fills f on f.order_id = o.id
       where o.account_id = ${contaId}
       order by o.criado_em desc limit 40
    `),
    db.execute(sql`
      select slot, resumo, proximo_job, criado_em
        from qmix_invest.paper_handoffs
       where account_id = ${contaId} order by criado_em desc limit 12
    `),
    db.execute(sql`
      select data::text, patrimonio::text, drawdown_pct::text
        from qmix_invest.paper_equity where account_id = ${contaId} order by data
    `),
  ]);

  const posicoes: PosicaoRobo[] = (posRows as unknown as Array<Record<string, string>>).map((r) => {
    const pm = num(r.preco_medio);
    const cot = r.cotacao ? num(r.cotacao) : null;
    const qtd = Number(r.quantidade);
    const valor = (cot ?? pm) * qtd;
    const resultado = ((cot ?? pm) - pm) * qtd;
    return {
      ticker: r.ticker!,
      quantidade: qtd,
      precoMedio: pm,
      cotacao: cot,
      valorAtual: valor,
      resultado,
      resultadoPct: pm > 0 ? (((cot ?? pm) - pm) / pm) * 100 : 0,
    };
  });

  const valorPosicoes = posicoes.reduce((a, p) => a + p.valorAtual, 0);
  const patrimonio = caixa + valorPosicoes;
  const curva = (eqRows as unknown as Array<Record<string, string>>).map((r) => ({
    data: r.data!,
    patrimonio: num(r.patrimonio),
    drawdownPct: num(r.drawdown_pct),
  }));

  return {
    existe: true,
    ativo: true,
    contaId,
    caixaInicial,
    caixa,
    valorPosicoes,
    patrimonio,
    resultado: patrimonio - caixaInicial,
    resultadoPct: caixaInicial > 0 ? ((patrimonio - caixaInicial) / caixaInicial) * 100 : 0,
    posicoes,
    ordens: (ordRows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      ticker: String(r.ticker),
      side: r.side as 'buy' | 'sell',
      tipo: String(r.tipo),
      quantidade: Number(r.quantidade),
      status: String(r.status),
      razao: (r.razao as string | null) ?? null,
      motivoRejeicao: (r.motivo_rejeicao as string | null) ?? null,
      criadoEm: new Date(r.criado_em as string),
      precoExec: r.preco_exec ? num(r.preco_exec) : null,
    })),
    despertares: (hoffRows as unknown as Array<Record<string, unknown>>).map((r) => ({
      slot: String(r.slot),
      resumo: String(r.resumo),
      proximo: (r.proximo_job as string | null) ?? null,
      criadoEm: new Date(r.criado_em as string),
    })),
    curva,
    diasOperando: curva.length,
  };
}
