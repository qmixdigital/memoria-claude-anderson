"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  importCsvAction,
  startClientCheckAction,
  type ImportResult,
} from "@/app/actions";

function BotaoImportar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-[#03101e] shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
    >
      {pending && (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {pending ? "Importando…" : "Importar"}
    </button>
  );
}

export function ImportForm({ clientId }: { clientId: string }) {
  const [resultado, formAction] = useActionState<ImportResult | null, FormData>(
    importCsvAction,
    null,
  );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="clientId" value={clientId} />
      <div>
        <label
          htmlFor="arquivo-csv"
          className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200"
        >
          Enviar arquivo CSV
        </label>
        <input
          id="arquivo-csv"
          type="file"
          name="file"
          accept=".csv,text/csv"
          className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#03101e] hover:file:bg-emerald-700 dark:text-neutral-200"
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" /> ou cole a lista{" "}
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
      </div>

      <div>
        <label htmlFor="lista-colada" className="sr-only">
          Cole a lista de backlinks
        </label>
        <textarea
          id="lista-colada"
          name="csv"
          rows={4}
          placeholder={
            "melhor IPTV\thttps://blogexemplo.com.br/artigo\nhttps://outrosite.com/post\tteste grátis"
          }
          className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/[0.08] dark:bg-white/[0.03]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BotaoImportar />
        {resultado && (
          <p
            role="status"
            aria-live="polite"
            className={`text-sm font-medium ${
              resultado.ok
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {resultado.ok ? "✓ " : "⚠ "}
            {resultado.mensagem}
          </p>
        )}
      </div>

      {resultado && resultado.novos > 0 && (
        <VerificarNovos clientId={resultado.clientId} quantos={resultado.novos} />
      )}
    </form>
  );
}

/**
 * Oferece verificar SÓ o que acabou de entrar. Sem isso, a única saída era o
 * "Verificar todos", que reprocessa a carteira inteira para conferir 20 links.
 * É a verificação grátis (no ar + link do cliente), então não custa nada.
 */
function VerificarNovos({ clientId, quantos }: { clientId: string; quantos: number }) {
  const [disparado, setDisparado] = useState(false);
  const [pendente, iniciarTransicao] = useTransition();

  function verificar() {
    iniciarTransicao(async () => {
      // roda em segundo plano; a barra de progresso do topo mostra o andamento
      await startClientCheckAction(clientId, false, true);
      setDisparado(true);
    });
  }

  if (disparado) {
    return (
      <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/[0.07] dark:text-emerald-300">
        ✓ Verificação iniciada. O progresso aparece no botão{" "}
        <strong>Verificar todos</strong>, no topo da página — pode fechar esta aba.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 dark:border-emerald-500/30 dark:bg-emerald-500/[0.07]">
      <span className="text-sm text-neutral-700 dark:text-neutral-200">
        Você importou{" "}
        <strong>
          {quantos} {quantos === 1 ? "link novo" : "links novos"}
        </strong>
        . Quer conferir agora se estão no ar e com o link do cliente?
      </span>
      <button
        type="button"
        disabled={pendente}
        onClick={verificar}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-[#03101e] transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pendente && (
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Verificar {quantos === 1 ? "o novo" : `os ${quantos}`} agora · grátis
      </button>
    </div>
  );
}
