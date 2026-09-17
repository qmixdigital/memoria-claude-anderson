"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  startCheckAllAction,
  getCheckAllStatus,
  getPaidIndexationEstimateAction,
  type CheckAllStatus,
} from "@/app/actions";

interface Estimate {
  count: number;
  usd: number;
  perCheck: number;
  balance: number | null;
}

export function CheckAllGlobal({ total }: { total: number }) {
  const [status, setStatus] = useState<CheckAllStatus | null>(null);
  const [pending, start] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [est, setEst] = useState<Estimate | null>(null);

  const refresh = useCallback(async () => {
    setStatus(await getCheckAllStatus());
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  // estimativa de custo da indexação paga (terceiros) — carrega em background
  useEffect(() => {
    getPaidIndexationEstimateAction().then(setEst);
  }, []);

  const running = status?.running ?? false;
  const done = status?.done ?? 0;
  const st = status?.total ?? total;
  const pct = st > 0 ? Math.round((done / st) * 100) : 0;

  function confirmRun() {
    setConfirmOpen(false);
    start(async () => {
      await startCheckAllAction();
      setTimeout(refresh, 1200);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={pending || running}
        onClick={() => setConfirmOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 ring-1 ring-inset ring-white/10 transition hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-60"
      >
        {(pending || running) && <Spinner />}
        {running
          ? `Verificando ${done}/${st}…`
          : est && est.usd > 0
            ? `Verificar todos (${total}) · ~US$ ${est.usd.toLocaleString(
                "pt-BR",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 },
              )}`
            : `Verificar todos (${total})`}
      </button>

      {running && (
        <div className="w-56">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-0.5 text-right text-xs text-neutral-400 dark:text-neutral-500">
            {pct}% — pode fechar a página, roda no servidor
          </p>
        </div>
      )}

      {confirmOpen && (
        <ConfirmModal
          total={total}
          est={est}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={confirmRun}
        />
      )}
    </div>
  );
}

function ConfirmModal({
  total,
  est,
  onCancel,
  onConfirm,
}: {
  total: number;
  est: Estimate | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // fecha no ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);

  const usd = est?.usd ?? null;
  const fmtUsd = (n: number) =>
    `US$ ${n.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Verificar todos os {total} backlinks?
            </h3>
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-200">
              Roda os 3 checks (publicação, link e indexação) em segundo plano.
              Leva ~20–30 minutos e você pode fechar a página.
            </p>

            <div className="mt-3 space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-950/40">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-300">
                  Publicação + link do cliente
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  grátis
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-300">
                  Indexação nos seus sites
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  grátis
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-300">
                  Indexação nos sites de terceiros
                  {est ? ` (${est.count})` : ""}
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {usd === null
                    ? "calculando…"
                    : usd === 0
                      ? "grátis"
                      : `~${fmtUsd(usd)}`}
                </span>
              </div>
              {est?.balance != null && (
                <div className="flex items-center justify-between border-t border-neutral-200 pt-1.5 dark:border-neutral-800">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Saldo DataForSEO
                  </span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-200">
                    {fmtUsd(est.balance)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-[#03101e] shadow-sm transition hover:bg-emerald-700"
          >
            Sim, verificar todos
          </button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );
}
