import { prisma } from "@/lib/prisma";
import { isLinkType, type LinkType } from "@/lib/types";
import { pMap } from "@/lib/utils/concurrency";
import { runCheck } from "./run";
import { mergeSnapshot } from "./snapshot";

const CHECK_CONCURRENCY = Number(process.env.CHECK_CONCURRENCY ?? "6");

/**
 * Roda os 3 checks para os backlinks informados (ou todos de um cliente),
 * grava um Check por backlink e atualiza o snapshot desnormalizado.
 * Retorna o resumo do lote.
 */
export async function runChecksForBacklinks(
  backlinkIds: string[],
  opts: { allowPaidIndexation?: boolean } = {},
): Promise<{
  checked: number;
  published: number;
  linkOk: number;
  indexed: number;
  costCents: number;
}> {
  const backlinks = await prisma.backlink.findMany({
    where: { id: { in: backlinkIds } },
    include: { client: true },
  });

  const outcomes = await pMap(
    backlinks,
    async (bl) => {
      const type: LinkType = isLinkType(bl.type) ? bl.type : "DIRECT";
      const outcome = await runCheck({
        articleUrl: bl.articleUrl,
        type,
        clientDomain: bl.client.domain,
        targetDomain: bl.targetDomain,
        expectedTarget: bl.expectedTarget,
        expectedAnchor: bl.expectedAnchor,
        allowPaidIndexation: opts.allowPaidIndexation ?? false,
      });

      // O histórico grava o que REALMENTE aconteceu nesta execução (inclusive
      // os nulls). Já o snapshot é o "melhor conhecido até agora": um null
      // ("não deu pra verificar") não pode apagar um resultado já confirmado.
      const snapshot = mergeSnapshot(
        {
          lastPublished: bl.lastPublished,
          lastLinkOk: bl.lastLinkOk,
          lastIndexed: bl.lastIndexed,
          lastLinkRel: bl.lastLinkRel,
          lastFoundAnchor: bl.lastFoundAnchor,
          lastFoundTarget: bl.lastFoundTarget,
        },
        outcome,
      );

      await prisma.$transaction([
        prisma.check.create({
          data: {
            backlinkId: bl.id,
            articlePublished: outcome.articlePublished,
            linkPresent: outcome.linkPresent,
            indexed: outcome.indexed,
            httpStatus: outcome.httpStatus,
            finalUrl: outcome.finalUrl,
            foundAnchor: outcome.foundAnchor,
            linkRel: outcome.linkRel,
            error: outcome.error,
            costCents: outcome.costCents,
          },
        }),
        prisma.backlink.update({
          where: { id: bl.id },
          data: {
            lastCheckAt: new Date(),
            // Só carimba quando a indexação teve veredito. null = a consulta
            // foi pulada ou falhou, e nesse caso a data anterior continua
            // valendo: dizer "conferido agora" seria mentira.
            ...(outcome.indexed !== null ? { lastIndexCheckAt: new Date() } : {}),
            ...snapshot,
          },
        }),
      ]);

      return outcome;
    },
    CHECK_CONCURRENCY,
  );

  return {
    checked: outcomes.length,
    published: outcomes.filter((o) => o.articlePublished).length,
    linkOk: outcomes.filter((o) => o.linkPresent).length,
    indexed: outcomes.filter((o) => o.indexed).length,
    costCents: outcomes.reduce((sum, o) => sum + o.costCents, 0),
  };
}
