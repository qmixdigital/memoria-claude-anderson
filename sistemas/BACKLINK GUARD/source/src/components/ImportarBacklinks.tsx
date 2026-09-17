"use client";

import { useEffect, useState } from "react";
import { ImportForm } from "@/components/ImportForm";

/**
 * Importação em painel lateral, não mais empilhada abaixo da tabela.
 *
 * Antes o bloco de importar ficava no fim da página e somava ~700px de altura.
 * Para conferir um backlink e depois importar outro lote era preciso rolar até
 * o fim e voltar ao topo o tempo todo. Como a importação é uma ação pontual e a
 * conferência é o trabalho contínuo, ela sai do caminho: fica atrás de um botão
 * e abre sobre a tela, sem tirar a tabela do lugar.
 */
export function ImportarBacklinks({
  clientId,
  clientDomain,
}: {
  clientId: string;
  clientDomain: string;
}) {
  const [aberto, setAberto] = useState(false);

  // trava o scroll do fundo e fecha no ESC
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("keydown", esc);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M12 21V9" />
          <path d="m7 14 5-5 5 5" />
          <path d="M5 3h14" />
        </svg>
        Importar
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
          onClick={() => setAberto(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Importar backlinks"
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-xl overflow-y-auto border-l border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold">Importar backlinks</h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Envie um arquivo <span className="font-mono">.csv</span> ou cole
                  a lista deste cliente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/[0.06] dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <details className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <summary className="cursor-pointer text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Como montar a planilha
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
                <li>
                  Uma coluna com o <strong>endereço da página</strong> e outra com o{" "}
                  <strong>texto âncora</strong>. <strong>A ordem não importa.</strong>
                </li>
                <li>
                  <strong>Não precisa de cabeçalho.</strong> Vírgula, ponto e vírgula
                  e tabulação funcionam.
                </li>
                <li>Se só tiver as URLs, cole só elas — uma por linha.</li>
                <li>
                  (Opcional) Uma coluna com <span className="font-mono">301</span>{" "}
                  marca o link como redirecionamento.
                </li>
                <li>
                  O site do cliente já é{" "}
                  <span className="font-mono">{clientDomain}</span> — não precisa
                  informar.
                </li>
              </ul>
              <a
                href="/modelo-backlinks.csv"
                download
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                ↓ Baixar modelo (.csv)
              </a>
            </details>

            <ImportForm clientId={clientId} />
          </div>
        </div>
      )}
    </>
  );
}
