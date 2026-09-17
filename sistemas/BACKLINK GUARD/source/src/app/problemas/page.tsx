import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProblemsPage() {
  const backlinks = await prisma.backlink.findMany({
    where: {
      lastCheckAt: { not: null },
      OR: [{ lastPublished: false }, { lastLinkOk: false }],
    },
    include: {
      client: { select: { id: true, name: true } },
      checks: { orderBy: { checkedAt: "desc" }, take: 1 },
    },
    orderBy: [{ lastPublished: "asc" }, { clientId: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:gap-1.5 dark:text-emerald-400"
        >
          <span aria-hidden>←</span> Clientes
        </Link>
        <h1 className="font-display mt-3 flex items-center gap-2.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Precisam de ação
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-base font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
            {backlinks.length}
          </span>
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Tudo que precisa de conserto: artigo fora do ar ou link do cliente
          removido/na página errada.
        </p>
      </div>

      {backlinks.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center text-sm font-medium text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/[0.07] dark:text-emerald-300">
          🎉 Nenhum problema nos backlinks já verificados.
        </div>
      ) : (
        <div className="max-h-[74vh] overflow-auto rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-neutral-50/95 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 backdrop-blur dark:bg-[#0d1119]/95 dark:text-neutral-400">
              <tr className="[&>th]:border-b [&>th]:border-neutral-200 dark:[&>th]:border-white/[0.07]">
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold">Problema</th>
                <th className="px-3 py-3 font-semibold">Artigo</th>
                <th className="px-3 py-3 font-semibold">Alvo esperado</th>
                <th className="px-3 py-3 font-semibold">Último check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/[0.05]">
              {backlinks.map((bl) => {
                const last = bl.checks[0];
                const notPublished = bl.lastPublished === false;
                const wrongPage = last?.error?.includes("outra página");
                return (
                  <tr
                    key={bl.id}
                    className="align-top transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${bl.client.id}`}
                        className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        {bl.client.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {notPublished ? (
                        <Badge tone="red">Artigo fora do ar</Badge>
                      ) : wrongPage ? (
                        <Badge tone="amber">Página errada</Badge>
                      ) : (
                        <Badge tone="amber">Link removido</Badge>
                      )}
                      {last?.httpStatus ? (
                        <span className="ml-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                          HTTP {last.httpStatus}
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-xs px-3 py-3">
                      <a
                        href={bl.articleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-neutral-700 hover:underline dark:text-neutral-300"
                        title={bl.articleUrl}
                      >
                        {bl.articleUrl.replace(/^https?:\/\//, "")}
                      </a>
                    </td>
                    <td className="max-w-xs px-3 py-3">
                      <span className="block truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
                        {bl.expectedTarget.replace(/^https?:\/\//, "")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-neutral-500 dark:text-neutral-400">
                      {bl.lastCheckAt
                        ? new Date(bl.lastCheckAt).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Badge({ tone, children }: { tone: "red" | "amber"; children: React.ReactNode }) {
  const cls =
    tone === "red"
      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
      : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}
