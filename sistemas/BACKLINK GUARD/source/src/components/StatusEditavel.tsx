"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { StatusDot } from "@/components/StatusDot";
import { setManualStatusAction } from "@/app/actions";

/**
 * Status clicável: abre as opções e grava a correção manual.
 *
 * Serve principalmente para os casos que o robô não consegue resolver — portal
 * com WAF devolvendo 403, página montada por JavaScript, etc. Você abre no
 * navegador, vê o que realmente está lá e registra aqui.
 *
 * A correção vai para colunas próprias no banco: a próxima verificação
 * automática não a apaga. "Voltar ao automático" desfaz.
 */
export function StatusEditavel({
  backlinkId,
  clientId,
  campo,
  valor,
  origem,
  label,
  inaplicavel,
}: {
  backlinkId: string;
  clientId: string;
  campo: "published" | "linkOk" | "indexed";
  valor: boolean | null;
  origem: "auto" | "manual";
  label: string;
  /** artigo removido: a pergunta não se aplica (mas ainda dá pra corrigir) */
  inaplicavel?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [pendente, iniciar] = useTransition();
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const foraDaCaixa = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", foraDaCaixa);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", foraDaCaixa);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  function definir(novo: "sim" | "nao" | "auto") {
    setAberto(false);
    iniciar(async () => {
      await setManualStatusAction(backlinkId, campo, novo, clientId);
    });
  }

  const opcoes = [
    { chave: "sim" as const, rotulo: "Sim", dot: "bg-emerald-500" },
    { chave: "nao" as const, rotulo: "Não", dot: "bg-rose-500" },
    { chave: "auto" as const, rotulo: "Voltar ao automático", dot: "bg-amber-500" },
  ];

  return (
    <div ref={caixa} className="relative inline-block">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        disabled={pendente}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={`${label}: alterar status`}
        className="rounded-full transition hover:opacity-80 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <StatusDot value={valor} label={label} origem={origem} inaplicavel={inaplicavel} />
      </button>

      {aberto && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
        >
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            {label}
          </p>
          {opcoes.map((o) => (
            <button
              key={o.chave}
              type="button"
              onClick={() => definir(o.chave)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/[0.06]"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${o.dot}`} />
              {o.rotulo}
            </button>
          ))}
          {origem === "manual" && (
            <p className="border-t border-neutral-100 px-3 py-1.5 text-[11px] text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
              Valor definido por você — nenhuma verificação sobrescreve.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
