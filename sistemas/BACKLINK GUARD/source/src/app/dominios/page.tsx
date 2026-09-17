import { prisma } from "@/lib/prisma";
import { agrupaPorDominio, MINIMO_PARA_CLASSIFICAR } from "@/lib/dominios";
import { TabelaDominios } from "@/components/TabelaDominios";
import { ExportarCsv } from "@/components/ExportarCsv";

export const dynamic = "force-dynamic";

export default async function DominiosPage() {
  const [backlinks, marcasDb] = await Promise.all([
    prisma.backlink.findMany({
      select: {
        articleUrl: true,
        lastPublished: true,
        lastLinkOk: true,
        lastIndexed: true,
        manualPublished: true,
        manualLinkOk: true,
        manualIndexed: true,
        lastLinkRel: true,
      },
    }),
    prisma.domainNote.findMany(),
  ]);

  const marcas = new Map(
    marcasDb.map((m) => [m.domain, { status: m.status, note: m.note }]),
  );
  const dominios = agrupaPorDominio(backlinks, marcas);

  const totalRemovidos = dominios.reduce((n, d) => n + d.removidos, 0);
  const totalLinkRetirado = dominios.reduce((n, d) => n + d.linkRetirado, 0);
  const naoRecomendados = dominios.filter((d) => d.marca === "nao_recomendado").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Reputação dos domínios
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
            Onde vale a pena publicar de novo. Um portal que apaga o artigo — ou
            que mantém o texto e tira só o seu link — é dinheiro perdido na
            próxima compra. Marque como{" "}
            <strong className="text-neutral-700 dark:text-neutral-200">
              não recomendado
            </strong>{" "}
            e a importação passa a avisar quando você colar um link de lá.
          </p>
        </div>
        <ExportarCsv href="/export" rotulo="Exportar tudo" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile valor={dominios.length} rotulo="Domínios" />
        <Tile valor={totalRemovidos} rotulo="Conteúdos removidos" tom="rose" />
        <Tile valor={totalLinkRetirado} rotulo="Links retirados" tom="rose" />
        <Tile valor={naoRecomendados} rotulo="Não recomendados" tom="amber" />
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Domínios com menos de {MINIMO_PARA_CLASSIFICAR} backlinks não recebem
        classificação de risco — uma remoção em um único link não é padrão, é
        coincidência.
      </p>

      <TabelaDominios dominios={dominios} />
    </div>
  );
}

function Tile({
  valor,
  rotulo,
  tom,
}: {
  valor: number;
  rotulo: string;
  tom?: "rose" | "amber";
}) {
  const cor =
    tom === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/[0.07] dark:text-rose-300"
      : tom === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/[0.07] dark:text-amber-300"
        : "border-neutral-200 bg-white text-neutral-700 dark:border-white/[0.07] dark:bg-white/[0.025] dark:text-neutral-200";
  return (
    <div className={`rounded-xl border px-4 py-3 ${cor}`}>
      <div className="font-display text-2xl font-extrabold leading-none">{valor}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-80">
        {rotulo}
      </div>
    </div>
  );
}
