"use client";

import { useEffect, useState } from "react";
import { getDataForSeoBalanceAction } from "@/app/actions";

export interface Kpis {
  total: number;
  checked: number;
  published: number;
  linkOk: number;
  indexed: number;
  problems: number;
  semForca: number;
  ancoraTrocada: number;
  unreachable: number;
}

export function DashboardKpis({ kpis }: { kpis: Kpis }) {
  const pct = (n: number) =>
    kpis.checked > 0 ? Math.round((n / kpis.checked) * 100) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Painel de saúde — ocupa 2 colunas */}
      <div className="animate-fade-up rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.025] lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Backlinks monitorados
            </p>
            <p className="font-display mt-1 text-4xl font-extrabold tabular-nums">
              {kpis.total.toLocaleString("pt-BR")}
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {kpis.checked.toLocaleString("pt-BR")} já verificados
              {kpis.total > 0 && (
                <span className="text-neutral-400 dark:text-neutral-600">
                  {" "}
                  · {Math.round((kpis.checked / kpis.total) * 100)}% da base
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3.5">
          <MetricBar label="Publicados" value={kpis.published} pct={pct(kpis.published)} />
          <MetricBar label="Com link do cliente" value={kpis.linkOk} pct={pct(kpis.linkOk)} />
          <MetricBar label="Indexados no Google" value={kpis.indexed} pct={pct(kpis.indexed)} />
        </div>
      </div>

      {/* Coluna de status */}
      <div className="grid gap-4">
        <ProblemTile problems={kpis.problems} />
        {kpis.semForca > 0 && (
          <AlertaValor
            valor={kpis.semForca}
            rotulo="Não passam força"
            ajuda="Link presente, mas com rel nofollow/sponsored/ugc — o Google não transfere autoridade."
            tom="rose"
          />
        )}
        {kpis.ancoraTrocada > 0 && (
          <AlertaValor
            valor={kpis.ancoraTrocada}
            rotulo="Âncora trocada"
            ajuda="O portal publicou o link com um texto âncora diferente do contratado."
            tom="amber"
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <UnreachableTile value={kpis.unreachable} />
          <BalanceTile />
        </div>
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  pct,
}: {
  label: string;
  value: number;
  pct: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-neutral-600 dark:text-neutral-300">{label}</span>
        <span className="tabular-nums text-neutral-400 dark:text-neutral-500">
          <span className="font-display font-semibold text-neutral-800 dark:text-neutral-100">
            {value.toLocaleString("pt-BR")}
          </span>{" "}
          · {pct}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Alerta de perda de VALOR do link (não de existência). Ver lib/checks/valor.ts. */
function AlertaValor({
  valor,
  rotulo,
  ajuda,
  tom,
}: {
  valor: number;
  rotulo: string;
  ajuda: string;
  tom: "rose" | "amber";
}) {
  const cor =
    tom === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/[0.07] dark:text-rose-300"
      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/[0.07] dark:text-amber-300";
  return (
    <div className={`rounded-xl border px-4 py-3 ${cor}`} title={ajuda}>
      <div className="font-display text-2xl font-extrabold leading-none">{valor}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-80">
        {rotulo}
      </div>
    </div>
  );
}

function ProblemTile({ problems }: { problems: number }) {
  const bad = problems > 0;
  return (
    <div
      className={`animate-fade-up rounded-2xl border p-5 shadow-sm ${
        bad
          ? "border-rose-300/70 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/[0.07]"
          : "border-neutral-200 bg-white dark:border-white/[0.07] dark:bg-white/[0.025]"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        Precisam de ação
      </p>
      <p
        className={`font-display mt-1 text-4xl font-extrabold tabular-nums ${
          bad ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
        }`}
      >
        {problems}
      </p>
      {bad ? (
        <a
          href="/problemas"
          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:gap-1.5 dark:text-rose-400"
        >
          ver o que consertar
          <span aria-hidden>→</span>
        </a>
      ) : (
        <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
          tudo certo 🎉
        </p>
      )}
    </div>
  );
}

function UnreachableTile({ value }: { value: number }) {
  return (
    <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 shadow-sm dark:border-amber-500/25 dark:bg-amber-500/[0.06]">
      <p className="text-[11px] font-medium uppercase tracking-wider text-amber-700/80 dark:text-amber-400/80">
        Inacessíveis
      </p>
      <p className="font-display mt-1 text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-amber-600/70 dark:text-amber-400/60">
        bloqueio/timeout
      </p>
    </div>
  );
}

function BalanceTile() {
  const [state, setState] = useState<{
    balance: number | null;
    error: string | null;
  } | null>(null);
  useEffect(() => {
    getDataForSeoBalanceAction().then(setState);
  }, []);
  const low = state?.balance != null && state.balance < 1;
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        low
          ? "border-amber-300/60 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/[0.06]"
          : "border-neutral-200 bg-white dark:border-white/[0.07] dark:bg-white/[0.025]"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        Saldo API
      </p>
      <p className="font-display mt-1 text-2xl font-bold tabular-nums">
        {state === null ? (
          <span className="inline-block h-6 w-14 rounded skeleton align-middle" />
        ) : state.balance !== null ? (
          `US$ ${state.balance.toFixed(2)}`
        ) : (
          "—"
        )}
      </p>
      <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">
        {low ? "recarregar em breve" : "indexação terceiros"}
      </p>
    </div>
  );
}
