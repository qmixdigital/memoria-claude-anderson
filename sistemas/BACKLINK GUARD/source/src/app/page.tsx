import { prisma } from "@/lib/prisma";
import { createClientAction } from "./actions";
import { ClientList, type ClientCard } from "@/components/ClientList";
import { CheckAllGlobal } from "@/components/CheckAllGlobal";
import { DashboardKpis } from "@/components/DashboardKpis";
import { ExportarCsv } from "@/components/ExportarCsv";
import { alertasDeValor } from "@/lib/checks/valor";
import { statusDaLinha, type LinhaStatus } from "@/lib/checks/status";

/** Alertas de valor com a correção manual já aplicada. */
function alertasDo(
  b: LinhaStatus & {
    lastLinkRel: string | null;
    expectedAnchor: string | null;
    lastFoundAnchor: string | null;
  },
) {
  const s = statusDaLinha(b);
  return alertasDeValor({
    linkOk: s.linkOk.valor,
    indexado: s.indexed.valor,
    rel: b.lastLinkRel,
    ancoraContratada: b.expectedAnchor,
    ancoraEncontrada: b.lastFoundAnchor,
  });
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      backlinks: {
        select: {
          lastCheckAt: true,
          lastPublished: true,
          lastLinkOk: true,
          lastIndexed: true,
          lastLinkRel: true,
          lastFoundAnchor: true,
          expectedAnchor: true,
          manualPublished: true,
          manualLinkOk: true,
          manualIndexed: true,
        },
      },
    },
  });

  const totalBacklinks = clients.reduce((n, c) => n + c.backlinks.length, 0);

  const isProblem = (b: {
    lastCheckAt: Date | null;
    lastPublished: boolean | null;
    lastLinkOk: boolean | null;
  }) => Boolean(b.lastCheckAt) && (b.lastPublished === false || b.lastLinkOk === false);

  const cards: ClientCard[] = clients.map((c) => ({
    id: c.id,
    name: c.name,
    domain: c.domain,
    total: c.backlinks.length,
    checked: c.backlinks.filter((b) => b.lastCheckAt).length,
    published: c.backlinks.filter((b) => b.lastPublished).length,
    linkOk: c.backlinks.filter((b) => b.lastLinkOk).length,
    indexed: c.backlinks.filter((b) => b.lastIndexed).length,
    problems: c.backlinks.filter(isProblem).length,
    semForca: c.backlinks.filter((b) => {
      const a = alertasDo(b);
      return a.includes("nofollow") || a.includes("fora-do-indice");
    }).length,
    ancoraTrocada: c.backlinks.filter((b) =>
      alertasDo(b).includes("ancora-trocada"),
    ).length,
  }));

  const unreachable = clients.reduce(
    (n, c) =>
      n +
      c.backlinks.filter((b) => b.lastCheckAt && b.lastPublished === null)
        .length,
    0,
  );

  const kpis = {
    total: totalBacklinks,
    checked: cards.reduce((n, c) => n + c.checked, 0),
    published: cards.reduce((n, c) => n + c.published, 0),
    linkOk: cards.reduce((n, c) => n + c.linkOk, 0),
    indexed: cards.reduce((n, c) => n + c.indexed, 0),
    problems: cards.reduce((n, c) => n + c.problems, 0),
    semForca: cards.reduce((n, c) => n + c.semForca, 0),
    ancoraTrocada: cards.reduce((n, c) => n + c.ancoraTrocada, 0),
    unreachable,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Painel de backlinks
          </h1>
          <p className="mt-1 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
            {clients.length} clientes monitorados em 3 checks: artigo{" "}
            <strong className="font-semibold text-neutral-700 dark:text-neutral-200">
              publicado
            </strong>
            , link do cliente na{" "}
            <strong className="font-semibold text-neutral-700 dark:text-neutral-200">
              URL exata
            </strong>{" "}
            e{" "}
            <strong className="font-semibold text-neutral-700 dark:text-neutral-200">
              indexação
            </strong>{" "}
            no Google.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportarCsv href="/export" rotulo="Exportar tudo" />
          <CheckAllGlobal total={totalBacklinks} />
        </div>
      </div>

      {clients.length > 0 && <DashboardKpis kpis={kpis} />}

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/50 p-10 text-center text-sm text-neutral-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-neutral-400">
          Nenhum site ainda. Crie o primeiro abaixo.
        </div>
      ) : (
        <ClientList clients={cards} />
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.025]">
        <h2 className="font-display font-bold">Novo site</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Cadastre um cliente pelo domínio-alvo dos links dele.
        </p>
        <form
          action={createClientAction}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <label className="flex flex-col text-sm">
            <span className="mb-1.5 font-medium text-neutral-600 dark:text-neutral-300">
              Nome
            </span>
            <input
              name="name"
              required
              placeholder="Ex: Cinemus"
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/[0.08] dark:bg-white/[0.03]"
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="mb-1.5 font-medium text-neutral-600 dark:text-neutral-300">
              Domínio do cliente
            </span>
            <input
              name="domain"
              required
              placeholder="Ex: cinemus.com.br"
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 font-mono outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/[0.08] dark:bg-white/[0.03]"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-[#03101e] shadow-sm transition hover:bg-emerald-700"
          >
            Criar cliente
          </button>
        </form>
      </section>
    </div>
  );
}
