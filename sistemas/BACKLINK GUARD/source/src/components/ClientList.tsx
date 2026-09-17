"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface ClientCard {
  id: string;
  name: string;
  domain: string;
  total: number;
  checked: number;
  published: number;
  linkOk: number;
  indexed: number;
  problems: number;
  /** link presente mas com rel nofollow/sponsored/ugc — não transfere autoridade */
  semForca: number;
  /** link presente mas com o texto âncora trocado pelo portal */
  ancoraTrocada: number;
}

type SortKey = "problems" | "name" | "size";

export function ClientList({ clients }: { clients: ClientCard[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("problems");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const base = t
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(t) ||
            c.domain.toLowerCase().includes(t),
        )
      : clients;
    const sorted = [...base];
    if (sort === "problems") {
      sorted.sort(
        (a, b) => b.problems - a.problems || a.name.localeCompare(b.name),
      );
    } else if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => b.total - a.total);
    }
    return sorted;
  }, [q, clients, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar cliente por nome ou domínio…"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:placeholder:text-neutral-500"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 text-xs dark:border-white/[0.08] dark:bg-white/[0.03]">
          {(
            [
              ["problems", "Problemas"],
              ["name", "Nome"],
              ["size", "Tamanho"],
            ] as [SortKey, string][]
          ).map(([key, lbl]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition ${
                sort === key
                  ? "bg-emerald-600 text-[#03101e] shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/[0.06]"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <span className="text-sm text-neutral-400 dark:text-neutral-500">
          {filtered.length} de {clients.length}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <ClientCardView key={c.id} c={c} i={i} />
        ))}
      </div>
    </div>
  );
}

function ClientCardView({ c, i }: { c: ClientCard; i: number }) {
  const hasProblem = c.problems > 0;
  const pct = (n: number) => (c.total > 0 ? Math.round((n / c.total) * 100) : 0);
  return (
    <Link
      href={`/clients/${c.id}`}
      style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
      className={`group animate-fade-up relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.025] ${
        hasProblem
          ? "border-rose-300/70 hover:border-rose-400 dark:border-rose-500/25 dark:hover:border-rose-500/50"
          : "border-neutral-200 hover:border-emerald-400/70 dark:border-white/[0.07] dark:hover:border-emerald-500/40"
      }`}
    >
      {/* brilho no hover */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/0 blur-2xl transition group-hover:bg-emerald-500/10" />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate font-display font-bold tracking-tight">
            {c.name}
          </h2>
          <p className="mt-0.5 truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
            {c.domain}
          </p>
        </div>
        {hasProblem ? (
          <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
            {c.problems} ⚠
          </span>
        ) : c.checked > 0 ? (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            ok
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-400 dark:bg-white/[0.05] dark:text-neutral-500">
            novo
          </span>
        )}
      </div>

      {/* barra de saúde tri-segmento */}
      <div className="mt-4 flex gap-1.5">
        <HealthSeg label="Pub" pct={pct(c.published)} />
        <HealthSeg label="Link" pct={pct(c.linkOk)} />
        <HealthSeg label="Idx" pct={pct(c.indexed)} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          <span className="font-display font-semibold text-neutral-800 dark:text-neutral-100">
            {c.total}
          </span>{" "}
          backlinks
        </span>
        {c.checked < c.total ? (
          <span className="text-neutral-400 dark:text-neutral-500">
            {c.checked}/{c.total} verificados
          </span>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400">
            100% verificados
          </span>
        )}
      </div>
    </Link>
  );
}

function HealthSeg({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </p>
    </div>
  );
}
