"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  seedDemoAction,
  runChecksAction,
  startClientCheckAction,
  getCheckAllStatus,
  getPaidIndexationEstimateAction,
  getSingleCheckCostAction,
  deleteClientAction,
  deleteBacklinkAction,
  getRapidUrlInfoAction,
  enviarRapidUrlAction,
  sincronizarRapidUrlAction,
  type CheckAllStatus,
} from "@/app/actions";

function btn(variant: "primary" | "ghost" = "primary") {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  return variant === "primary"
    ? `${base} bg-emerald-600 text-[#03101e] shadow-sm hover:bg-emerald-700`
    : `${base} border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]`;
}

function Spinner() {
  return (
    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

export function SeedButton() {
  const [pending, start] = useTransition();
  return (
    <button
      className={btn("ghost")}
      disabled={pending}
      onClick={() => start(() => seedDemoAction())}
    >
      {pending && <Spinner />}
      Popular com dados de demonstração
    </button>
  );
}

export function RecheckButton({
  backlinkId,
  clientId,
}: {
  backlinkId: string;
  clientId: string;
}) {
  const [pending, start] = useTransition();

  // Este botão faz o check COMPLETO, e a indexação em site de terceiro é paga.
  // Antes cobrava sem avisar — agora só confirma quando há custo de verdade.
  function aoClicar() {
    start(async () => {
      const { usd } = await getSingleCheckCostAction(backlinkId);
      if (usd > 0) {
        const ok = confirm(
          `Verificar este backlink consulta a indexação no Google e custa cerca de US$ ${usd.toFixed(
            2,
          )}. Continuar?`,
        );
        if (!ok) return;
      }
      await runChecksAction([backlinkId], clientId);
    });
  }

  return (
    <button
      title="Refazer os 3 checks deste backlink agora"
      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300"
      disabled={pending}
      onClick={aoClicar}
    >
      {pending ? (
        <Spinner />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="h-3.5 w-3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      )}
      {pending ? "Verificando…" : "Verificar"}
    </button>
  );
}

export function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800/60 dark:bg-neutral-900 dark:hover:bg-red-950/40 disabled:opacity-50"
      disabled={pending}
      onClick={() => {
        if (
          confirm(
            `Remover o cliente "${clientName}" e todos os seus backlinks? Esta ação não pode ser desfeita.`,
          )
        ) {
          start(() => deleteClientAction(clientId));
        }
      }}
    >
      {pending && <Spinner />}
      Remover cliente
    </button>
  );
}

export function DeleteBacklinkButton({
  backlinkId,
  clientId,
}: {
  backlinkId: string;
  clientId: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      title="Remover este backlink"
      aria-label="Remover backlink"
      className="rounded p-1 text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-neutral-200"
      disabled={pending}
      onClick={() => {
        if (confirm("Remover este backlink?")) {
          start(() => deleteBacklinkAction(backlinkId, clientId));
        }
      }}
    >
      {pending ? <Spinner /> : "✕"}
    </button>
  );
}

/**
 * Verificação de todos os backlinks do cliente. Roda em background (dá pra
 * fechar a página) e abre um diálogo pedindo a escolha entre:
 *   - grátis  (padrão): publicação + link. Não mexe na indexação já conhecida.
 *   - com indexação: consulta paga nos sites de terceiros, com o custo à vista.
 */
export function CheckAllButton({
  clientId,
  count,
}: {
  clientId: string;
  count: number;
}) {
  const [pending, start] = useTransition();
  const [aberto, setAberto] = useState(false);
  const [status, setStatus] = useState<CheckAllStatus | null>(null);
  const [est, setEst] = useState<{ count: number; usd: number; balance: number | null } | null>(null);

  const refresh = useCallback(async () => setStatus(await getCheckAllStatus()), []);
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    if (aberto && !est) {
      getPaidIndexationEstimateAction(clientId).then((e) =>
        setEst({ count: e.count, usd: e.usd, balance: e.balance }),
      );
    }
  }, [aberto, est, clientId]);

  const rodando = status?.running ?? false;
  const done = status?.done ?? 0;
  const total = status?.total ?? count;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  function disparar(comIndexacao: boolean) {
    setAberto(false);
    start(async () => {
      await startClientCheckAction(clientId, comIndexacao);
      setTimeout(refresh, 1200);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        className={btn("primary")}
        disabled={pending || rodando || count === 0}
        onClick={() => setAberto(true)}
      >
        {(pending || rodando) && <Spinner />}
        {rodando ? `Verificando ${done}/${total}…` : `Verificar todos (${count})`}
      </button>

      {rodando && (
        <div className="w-52">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-0.5 text-right text-xs text-neutral-400 dark:text-neutral-500">
            {pct}% — pode fechar a página
          </p>
        </div>
      )}

      {aberto && (
        <EscolhaVerificacao
          count={count}
          est={est}
          onCancelar={() => setAberto(false)}
          onEscolher={disparar}
        />
      )}
    </div>
  );
}

function EscolhaVerificacao({
  count,
  est,
  onCancelar,
  onEscolher,
}: {
  count: number;
  est: { count: number; usd: number; balance: number | null } | null;
  onCancelar: () => void;
  onEscolher: (comIndexacao: boolean) => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onCancelar();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancelar]);

  const fmt = (n: number) =>
    `US$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const semSaldo = est != null && est.balance != null && est.balance < est.usd;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Como verificar os backlinks"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Verificar {count} backlinks
        </h3>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-300">
          Roda em segundo plano — você pode fechar a página.
        </p>

        <div className="mt-4 space-y-3">
          <button
            onClick={() => onEscolher(false)}
            autoFocus
            className="w-full rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-left transition hover:border-emerald-500 dark:border-emerald-500/30 dark:bg-emerald-500/[0.07] dark:hover:border-emerald-500/60"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Verificação grátis
              </span>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                US$ 0,00
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
              Confere se o artigo está no ar e se o link do cliente continua lá. A
              indexação já confirmada é mantida como está.
            </p>
          </button>

          <button
            onClick={() => onEscolher(true)}
            disabled={est == null || semSaldo}
            className="w-full rounded-xl border border-neutral-200 p-4 text-left transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:border-amber-500/60"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Incluir indexação no Google
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {est == null ? "calculando…" : est.usd === 0 ? "US$ 0,00" : `~${fmt(est.usd)}`}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
              Faz tudo acima e ainda consulta o índice do Google.{" "}
              {est != null && `${est.count} estão em sites de terceiros, que são pagos.`}
              {est?.balance != null && ` Saldo: ${fmt(est.balance)}.`}
            </p>
            {semSaldo && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                Saldo insuficiente na DataForSEO.
              </p>
            )}
          </button>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onCancelar}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Forca a indexacao de UMA URL no Rapid URL Indexer.
 *
 * De propósito é link a link: crédito é caro e a fila de não indexados passa de
 * 600 URLs. O botão consulta o saldo antes e mostra o custo na confirmação, no
 * mesmo espírito do aviso de custo que o botão "Verificar" já faz.
 *
 * Só aparece quando faz sentido gastar: artigo no ar, link presente e ainda não
 * indexado. Depois de enviado, vira um selo com o status e permite ressincronizar.
 */
export function RapidUrlButton({
  backlinkId,
  clientId,
  elegivel,
}: {
  backlinkId: string;
  clientId: string;
  elegivel: boolean;
}) {
  const [pending, start] = useTransition();
  const [enviado, setEnviado] = useState<string | null>(null);

  function aoClicar() {
    start(async () => {
      const info = await getRapidUrlInfoAction(backlinkId);

      if (!info.disponivel) {
        alert("Rapid URL Indexer não está configurado (falta RAPIDURL_API_KEY).");
        return;
      }

      if (info.jaEnviado) {
        const quando = info.enviadoEm
          ? new Date(info.enviadoEm).toLocaleDateString("pt-BR")
          : "antes";
        const re = confirm(
          `Esta URL já foi enviada em ${quando} (status: ${info.status ?? "desconhecido"}).

` +
            `Enviar de novo gasta mais ${info.custo} crédito(s). Prefere só atualizar o status?

` +
            `OK = atualizar status · Cancelar = enviar de novo`,
        );
        const r = re
          ? await sincronizarRapidUrlAction(backlinkId, clientId)
          : await enviarRapidUrlAction(backlinkId, clientId);
        setEnviado(r.mensagem);
        if (!r.ok) alert(r.mensagem);
        return;
      }

      const saldoTxt =
        info.saldo === null
          ? "não foi possível ler o saldo"
          : `saldo atual: ${info.saldo} crédito(s)`;
      const ok = confirm(
        `Enviar esta URL para indexação no Rapid URL Indexer?

` +
          `Custo: ${info.custo} crédito(s) · ${saldoTxt}

` +
          `O crédito volta se a URL não indexar em 14 dias.`,
      );
      if (!ok) return;

      const r = await enviarRapidUrlAction(backlinkId, clientId);
      setEnviado(r.mensagem);
      if (!r.ok) alert(r.mensagem);
    });
  }

  if (!elegivel) return null;

  return (
    <button
      type="button"
      title="Forçar indexação desta URL no Rapid URL Indexer (consome crédito)"
      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-500/40 dark:bg-white/[0.04] dark:text-indigo-300 dark:hover:bg-indigo-500/10"
      disabled={pending}
      onClick={aoClicar}
    >
      {pending ? (
        <Spinner />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="h-3.5 w-3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
      )}
      {pending ? "Enviando…" : enviado ? "Enviado" : "RapidURL"}
    </button>
  );
}
