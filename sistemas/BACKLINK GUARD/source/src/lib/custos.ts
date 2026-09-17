/**
 * Consolidação de custo das APIs externas.
 *
 * A ferramenta gastava dinheiro em dois lugares e não mostrava em lugar nenhum:
 * DataForSEO (verificar indexação, US$ 0,01 por consulta) e Rapid URL Indexer
 * (empurrar indexação, 1 crédito por URL). Custo invisível vira surpresa na
 * fatura, e sem saber quanto cada cliente consome não dá para decidir onde
 * cortar.
 *
 * O que NÃO custa também aparece de propósito: as consultas grátis (Search
 * Console) mostram quanto se economizou por não cair no fallback pago.
 */

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

/** Preço de um crédito do Rapid URL Indexer, em dólar. Pacotes vão de 0,04 a 0,05. */
export const USD_POR_CREDITO = Number(process.env.RAPIDURL_CREDIT_USD ?? "0.05");

export interface LinhaCliente {
  cliente: string;
  consultasPagas: number;
  consultasGratis: number;
  dfsUsd: number;
  creditos: number;
  rapidUsd: number;
  totalUsd: number;
}

export interface ResumoCustos {
  dfs: { consultas: number; usd: number; mesUsd: number; consultasMes: number };
  gratis: { consultas: number; economiaUsd: number };
  rapid: { envios: number; creditos: number; usd: number; mesCreditos: number };
  totalUsd: number;
  totalMesUsd: number;
  porCliente: LinhaCliente[];
}

const inicioDoMes = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export async function resumoDeCustos(): Promise<ResumoCustos> {
  const desde = inicioDoMes();

  const [dfsTudo, dfsMes, gratis, rapidTudo, rapidMes] = await Promise.all([
    // DataForSEO: cada Check com costCents > 0 é uma consulta paga.
    prisma.check.aggregate({
      _sum: { costCents: true },
      _count: true,
      where: { costCents: { gt: 0 } },
    }),
    prisma.check.aggregate({
      _sum: { costCents: true },
      _count: true,
      where: { costCents: { gt: 0 }, checkedAt: { gte: desde } },
    }),
    // Grátis: teve veredito de indexação e não custou nada (Search Console).
    prisma.check.count({ where: { costCents: 0, indexed: { not: null } } }),
    prisma.backlink.aggregate({
      _sum: { rapidCredits: true },
      _count: { rapidProjectId: true },
      where: { rapidProjectId: { not: null } },
    }),
    prisma.backlink.aggregate({
      _sum: { rapidCredits: true },
      where: { rapidSubmittedAt: { gte: desde } },
    }),
  ]);

  const dfsCents = dfsTudo._sum.costCents ?? 0;
  const dfsCentsMes = dfsMes._sum.costCents ?? 0;
  const creditos = rapidTudo._sum.rapidCredits ?? 0;
  const creditosMes = rapidMes._sum.rapidCredits ?? 0;

  // Rateio por cliente: junta as duas fontes na mesma linha.
  const [porClienteDfs, porClienteRapid] = await Promise.all([
    prisma.$queryRaw<
      Array<{ cliente: string; pagas: bigint; gratis: bigint; cents: bigint }>
    >`
      SELECT c.name AS cliente,
             count(*) FILTER (WHERE ch."costCents" > 0)                          AS pagas,
             count(*) FILTER (WHERE ch."costCents" = 0 AND ch.indexed IS NOT NULL) AS gratis,
             coalesce(sum(ch."costCents"), 0)                                    AS cents
      FROM "Check" ch
      JOIN "Backlink" b ON b.id = ch."backlinkId"
      JOIN "Client" c   ON c.id = b."clientId"
      GROUP BY c.name
    `,
    prisma.$queryRaw<Array<{ cliente: string; creditos: bigint }>>`
      SELECT c.name AS cliente, coalesce(sum(b."rapidCredits"), 0) AS creditos
      FROM "Backlink" b
      JOIN "Client" c ON c.id = b."clientId"
      WHERE b."rapidProjectId" IS NOT NULL
      GROUP BY c.name
    `,
  ]);

  const mapa = new Map<string, LinhaCliente>();
  for (const r of porClienteDfs) {
    mapa.set(r.cliente, {
      cliente: r.cliente,
      consultasPagas: Number(r.pagas),
      consultasGratis: Number(r.gratis),
      dfsUsd: Number(r.cents) / 100,
      creditos: 0,
      rapidUsd: 0,
      totalUsd: Number(r.cents) / 100,
    });
  }
  for (const r of porClienteRapid) {
    const cr = Number(r.creditos);
    const atual =
      mapa.get(r.cliente) ??
      {
        cliente: r.cliente,
        consultasPagas: 0,
        consultasGratis: 0,
        dfsUsd: 0,
        creditos: 0,
        rapidUsd: 0,
        totalUsd: 0,
      };
    atual.creditos = cr;
    atual.rapidUsd = cr * USD_POR_CREDITO;
    atual.totalUsd = atual.dfsUsd + atual.rapidUsd;
    mapa.set(r.cliente, atual);
  }

  const porCliente = [...mapa.values()]
    .filter((l) => l.totalUsd > 0 || l.consultasGratis > 0)
    .sort((a, b) => b.totalUsd - a.totalUsd);

  const rapidUsd = creditos * USD_POR_CREDITO;

  return {
    dfs: {
      consultas: dfsTudo._count,
      usd: dfsCents / 100,
      mesUsd: dfsCentsMes / 100,
      consultasMes: dfsMes._count,
    },
    // Cada consulta grátis é uma que não caiu no fallback de US$ 0,01.
    gratis: { consultas: gratis, economiaUsd: gratis * 0.01 },
    rapid: {
      envios: rapidTudo._count.rapidProjectId ?? 0,
      creditos,
      usd: rapidUsd,
      mesCreditos: creditosMes,
    },
    totalUsd: dfsCents / 100 + rapidUsd,
    totalMesUsd: dfsCentsMes / 100 + creditosMes * USD_POR_CREDITO,
    porCliente,
  };
}

/** Saldos ao vivo das duas contas. Falha de uma não derruba a outra. */
export async function saldosAoVivo(): Promise<{
  dfsUsd: number | null;
  dfsErro: string | null;
  rapidCreditos: number | null;
  rapidErro: string | null;
}> {
  const { getDataForSeoBalanceAction } = await import("@/app/actions");

  let rapidCreditos: number | null = null;
  let rapidErro: string | null = null;
  if (<<REMOVIDO>>) {
    try {
      const { saldoCreditos } = await import("@/lib/rapidurl/client");
      rapidCreditos = await saldoCreditos();
    } catch (e) {
      rapidErro = e instanceof Error ? e.message : "falha ao consultar";
    }
  } else {
    rapidErro = "não configurado";
  }

  const dfs = await getDataForSeoBalanceAction();

  return {
    dfsUsd: dfs.balance,
    dfsErro: dfs.error,
    rapidCreditos,
    rapidErro,
  };
}
