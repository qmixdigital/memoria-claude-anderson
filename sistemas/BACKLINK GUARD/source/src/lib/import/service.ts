import { getDomain } from "tldts";
import { prisma } from "@/lib/prisma";
import { parseBacklinkCsv } from "./csv";
import { planejarImportacao } from "./plan";

export interface ResultadoImportacao {
  /** domínios marcados como "não recomendado" que apareceram na lista */
  naoRecomendados: string[];
  /** linhas com URL válida lidas da lista */
  parsed: number;
  /** backlinks novos criados */
  created: number;
  /** já existiam e tiveram o texto âncora corrigido */
  updated: number;
  /** já existiam e nada mudou */
  unchanged: number;
  /** linhas repetidas dentro da própria lista colada */
  duplicatesInList: number;
}

/**
 * Importa backlinks de uma lista colada ou de um CSV.
 *
 * Identidade = URL canônica (ver utils/url.ts), então o mesmo artigo não entra
 * duas vezes por causa de barra final, "www.", http/https ou "?utm". Reimportar
 * a mesma lista com âncoras novas ATUALIZA as âncoras — ver import/plan.ts para
 * as regras completas.
 */
export async function importBacklinksCsv(
  clientId: string,
  csvText: string,
): Promise<ResultadoImportacao> {
  const vazio: ResultadoImportacao = {
    naoRecomendados: [],
    parsed: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    duplicatesInList: 0,
  };

  const parsed = parseBacklinkCsv(csvText);
  if (parsed.length === 0) return vazio;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { domain: true },
  });
  const targetDomain = client?.domain ?? "";

  const existentes = await prisma.backlink.findMany({
    where: { clientId },
    select: { id: true, articleUrl: true, expectedAnchor: true },
  });

  const plano = planejarImportacao(parsed, existentes);

  let created = 0;
  if (plano.criar.length > 0) {
    const res = await prisma.backlink.createMany({
      data: plano.criar.map((p) => ({
        clientId,
        articleUrl: p.articleUrl,
        expectedAnchor: p.expectedAnchor,
        type: p.type,
        targetDomain,
        source: "csv",
      })),
    });
    created = res.count;
  }

  if (plano.atualizar.length > 0) {
    await prisma.$transaction(
      plano.atualizar.map((u) =>
        prisma.backlink.update({
          where: { id: u.id },
          data: { expectedAnchor: u.expectedAnchor },
        }),
      ),
    );
  }

  // avisa se você acabou de colar link de um portal que já marcou como ruim
  const marcados = await prisma.domainNote.findMany({
    where: { status: "nao_recomendado" },
    select: { domain: true },
  });
  const bloqueados = new Set(marcados.map((m) => m.domain));
  const naoRecomendados = [
    ...new Set(
      parsed
        .map((p) => getDomain(p.articleUrl))
        .filter((d): d is string => d !== null && bloqueados.has(d)),
    ),
  ];

  return {
    naoRecomendados,
    parsed: parsed.length,
    created,
    updated: plano.atualizar.length,
    unchanged: plano.inalterados,
    duplicatesInList: plano.repetidosNaLista,
  };
}
