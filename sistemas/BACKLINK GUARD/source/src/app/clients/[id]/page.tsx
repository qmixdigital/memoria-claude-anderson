import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasDataForSeo } from "@/lib/env";
import { hasGoogleSa } from "@/lib/google/auth";
import { ImportarBacklinks } from "@/components/ImportarBacklinks";
import { ehAdmin } from "@/lib/sessao";
import { ExportarCsv } from "@/components/ExportarCsv";
import { CheckAllButton, DeleteClientButton } from "@/components/ActionButtons";
import { BacklinkTable } from "@/components/BacklinkTable";

export const dynamic = "force-dynamic";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await ehAdmin();

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      backlinks: {
        orderBy: { createdAt: "asc" },
        include: { checks: { orderBy: { checkedAt: "desc" }, take: 1 } },
      },
    },
  });

  if (!client) notFound();

  const backlinks = client.backlinks;
  const rows = backlinks.map((bl) => ({
    id: bl.id,
    articleUrl: bl.articleUrl,
    expectedTarget: bl.expectedTarget,
    expectedAnchor: bl.expectedAnchor,
    type: bl.type,
    lastPublished: bl.lastPublished,
    lastLinkOk: bl.lastLinkOk,
    lastIndexed: bl.lastIndexed,
    manualPublished: bl.manualPublished,
    manualLinkOk: bl.manualLinkOk,
    manualIndexed: bl.manualIndexed,
    manualAt: bl.manualAt ? bl.manualAt.toISOString() : null,
    lastLinkRel: bl.lastLinkRel,
    lastFoundAnchor: bl.lastFoundAnchor,
    lastFoundTarget: bl.lastFoundTarget,
    lastCheckAt: bl.lastCheckAt ? bl.lastCheckAt.toISOString() : null,
    lastIndexCheckAt: bl.lastIndexCheckAt ? bl.lastIndexCheckAt.toISOString() : null,
    rapidSubmittedAt: bl.rapidSubmittedAt ? bl.rapidSubmittedAt.toISOString() : null,
    rapidStatus: bl.rapidStatus,
    httpStatus: bl.checks[0]?.httpStatus ?? null,
    error: bl.checks[0]?.error ?? null,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:gap-1.5 dark:text-emerald-400"
        >
          <span aria-hidden>←</span> Clientes
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              {client.name}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Domínio alvo:{" "}
              <span className="font-mono text-neutral-700 dark:text-neutral-300">
                {client.domain}
              </span>{" "}
              ·{" "}
              <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                {backlinks.length}
              </span>{" "}
              backlinks
            </p>
          </div>
          <div className="flex items-center gap-2">
            {admin && (
              <DeleteClientButton clientId={client.id} clientName={client.name} />
            )}
            <ImportarBacklinks clientId={client.id} clientDomain={client.domain} />
            <ExportarCsv href={`/export?clientId=${client.id}`} rotulo="Exportar CSV" />
            <CheckAllButton clientId={client.id} count={backlinks.length} />
          </div>
        </div>
      </div>

      {!hasDataForSeo && !hasGoogleSa() && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/[0.07] dark:text-amber-300">
          Nenhuma fonte de indexação configurada — os checks de{" "}
          <strong>publicação</strong> e <strong>link</strong> funcionam, mas{" "}
          <strong>indexação</strong> fica como “—”. Configure o Google Search
          Console (grátis) ou o DataForSEO.
        </div>
      )}

      <BacklinkTable rows={rows} clientId={client.id} admin={admin} />

    </div>
  );
}
