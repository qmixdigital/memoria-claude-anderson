"use client";

import { useMemo, useState, useTransition } from "react";
import { marcarDominioAction, salvarNotaDominioAction } from "@/app/actions";
import type { EstatDominio, Risco } from "@/lib/dominios";

const RISCO_LABEL: Record<Risco, { texto: string; cls: string; dot: string }> = {
  alto: {
    texto: "Alto",
    cls: "bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  medio: {
    texto: "Médio",
    cls: "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  baixo: {
    texto: "Baixo",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  "amostra-pequena": {
    texto: "Poucos dados",
    cls: "bg-neutral-100/70 text-neutral-500 ring-neutral-400/20 dark:bg-white/[0.04] dark:text-neutral-400",
    dot: "bg-neutral-400",
  },
};

export function TabelaDominios({ dominios }: { dominios: EstatDominio[] }) {
  const [filtro, setFiltro] = useState<
    "problemas" | "todos" | "marcados" | "ignorados"
  >("problemas");
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => {
    let l = dominios;
    if (filtro === "problemas") {
      l = l.filter((d) => {
        if (d.marca === "ignorado") return false; // você tirou da lista
        if (d.marca === "nao_recomendado") return true;
        if (d.marca === "confiavel") return false;
        return d.risco === "alto" || d.risco === "medio";
      });
    } else if (filtro === "marcados") {
      l = l.filter((d) => d.marca !== null && d.marca !== "sem_marca");
    } else if (filtro === "ignorados") {
      l = l.filter((d) => d.marca === "ignorado");
    }
    const q = busca.trim().toLowerCase();
    return q ? l.filter((d) => d.dominio.includes(q)) : l;
  }, [dominios, filtro, busca]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["problemas", "Com problema"],
            ["marcados", "Marcados por mim"],
            ["ignorados", "Excluídos do relatório"],
            ["todos", "Todos"],
          ] as const
        ).map(([chave, rotulo]) => (
          <button
            key={chave}
            onClick={() => setFiltro(chave)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filtro === chave
                ? "bg-emerald-600 text-[#03101e]"
                : "border border-neutral-200 text-neutral-600 hover:border-emerald-400 dark:border-white/[0.08] dark:text-neutral-300"
            }`}
          >
            {rotulo}
          </button>
        ))}
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="filtrar domínio…"
          aria-label="Filtrar por domínio"
          className="ml-auto w-56 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-white/[0.03]"
        />
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {lista.length} domínios
        </span>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-neutral-50/95 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 backdrop-blur dark:bg-[#0d1119]/95 dark:text-neutral-400">
            <tr className="whitespace-nowrap [&>th]:border-b [&>th]:border-neutral-200 [&>th]:px-3 [&>th]:py-3 dark:[&>th]:border-white/[0.07]">
              <th>Domínio</th>
              <th>Backlinks</th>
              <th title="Artigo saiu do ar (404 ou jogado pra home)">Conteúdo removido</th>
              <th title="Artigo continua no ar, mas o link do cliente sumiu">Link retirado</th>
              <th title="Link presente porém nofollow/sponsored/ugc">nofollow</th>
              <th title="O portal bloqueia nosso robô">Bloqueia robô</th>
              <th>Risco</th>
              <th>Decisão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-white/[0.05]">
            {lista.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-neutral-400">
                  Nenhum domínio aqui — sinal de que a carteira está saudável.
                </td>
              </tr>
            )}
            {lista.map((d) => (
              <Linha key={d.dominio} d={d} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Linha({ d }: { d: EstatDominio }) {
  const [pendente, iniciar] = useTransition();
  const r = RISCO_LABEL[d.risco];
  const pct = Math.round(d.taxaProblema * 100);

  function marcar(status: "nao_recomendado" | "confiavel" | "ignorado" | "limpar") {
    iniciar(async () => {
      await marcarDominioAction(d.dominio, status);
    });
  }

  return (
    <tr
      className={`transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.03] ${
        d.marca === "nao_recomendado" ? "bg-rose-50/40 dark:bg-rose-500/[0.04]" : ""
      }`}
    >
      <td className="px-3 py-3 font-medium">
        <a
          href={`https://${d.dominio}`}
          target="_blank"
          rel="noreferrer noopener"
          className="text-emerald-700 hover:underline dark:text-emerald-400"
        >
          {d.dominio}
        </a>
        {d.marca === "nao_recomendado" && (
          <span className="ml-2 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
            não comprar
          </span>
        )}
      </td>
      <td className="px-3 py-3 text-neutral-600 dark:text-neutral-300">{d.total}</td>
      <td className="px-3 py-3">
        <Num valor={d.removidos} total={d.total} ruim />
      </td>
      <td className="px-3 py-3">
        <Num valor={d.linkRetirado} total={d.total} ruim />
      </td>
      <td className="px-3 py-3">
        <Num valor={d.nofollow} total={d.total} ruim />
      </td>
      <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400">
        {d.bloqueiam || "—"}
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${r.cls}`}
          title={`${pct}% dos backlinks deste domínio deram problema`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} />
          {r.texto}
          {d.risco !== "amostra-pequena" && ` · ${pct}%`}
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <BotaoDecisao
            ativo={d.marca === "nao_recomendado"}
            pendente={pendente}
            onClick={() => marcar(d.marca === "nao_recomendado" ? "limpar" : "nao_recomendado")}
            titulo="Não comprar mais neste domínio — a importação vai avisar"
            classeAtiva="border-rose-500 bg-rose-600 text-white"
          >
            Não comprar
          </BotaoDecisao>
          <BotaoDecisao
            ativo={d.marca === "confiavel"}
            pendente={pendente}
            onClick={() => marcar(d.marca === "confiavel" ? "limpar" : "confiavel")}
            titulo="Domínio aprovado — some da lista de problemas"
            classeAtiva="border-emerald-500 bg-emerald-600 text-[#03101e]"
          >
            Confiável
          </BotaoDecisao>
          <BotaoDecisao
            ativo={d.marca === "ignorado"}
            pendente={pendente}
            onClick={() => marcar(d.marca === "ignorado" ? "limpar" : "ignorado")}
            titulo="Tirar do relatório sem julgar o portal — use quando os dados deste domínio estiverem errados"
            classeAtiva="border-neutral-500 bg-neutral-600 text-white"
          >
            Excluir ✕
          </BotaoDecisao>
        </div>
        <Anotacao dominio={d.dominio} inicial={d.observacao} />
      </td>
    </tr>
  );
}

/** Anotação livre por domínio: o porquê da decisão, para lembrar depois. */
function Anotacao({ dominio, inicial }: { dominio: string; inicial: string | null }) {
  const [texto, setTexto] = useState(inicial ?? "");
  const [salvo, setSalvo] = useState(false);
  const [pendente, iniciar] = useTransition();
  const mudou = texto.trim() !== (inicial ?? "").trim();

  function salvar() {
    iniciar(async () => {
      await salvarNotaDominioAction(dominio, texto);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    });
  }

  return (
    <div className="mt-1.5 flex items-start gap-1.5">
      <label className="sr-only" htmlFor={`nota-${dominio}`}>
        Anotação sobre {dominio}
      </label>
      <textarea
        id={`nota-${dominio}`}
        rows={1}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="anotação…"
        maxLength={500}
        className="w-52 resize-y rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-white/[0.03]"
      />
      {(mudou || salvo) && (
        <button
          type="button"
          onClick={salvar}
          disabled={pendente || !mudou}
          className="rounded-md border border-emerald-500/50 px-1.5 py-1 text-[10px] font-bold uppercase text-emerald-700 transition hover:bg-emerald-500/10 disabled:opacity-60 dark:text-emerald-400"
        >
          {pendente ? "…" : salvo && !mudou ? "✓" : "salvar"}
        </button>
      )}
    </div>
  );
}

function BotaoDecisao({
  ativo,
  pendente,
  onClick,
  titulo,
  classeAtiva,
  children,
}: {
  ativo: boolean;
  pendente: boolean;
  onClick: () => void;
  titulo: string;
  classeAtiva: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pendente}
      title={titulo}
      aria-pressed={ativo}
      className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
        ativo
          ? classeAtiva
          : "border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-white/[0.1] dark:text-neutral-400"
      }`}
    >
      {children}
    </button>
  );
}

function Num({ valor, total, ruim }: { valor: number; total: number; ruim?: boolean }) {
  if (valor === 0) return <span className="text-neutral-400 dark:text-neutral-600">—</span>;
  const pct = Math.round((valor / total) * 100);
  return (
    <span className={ruim ? "font-semibold text-rose-700 dark:text-rose-300" : ""}>
      {valor}{" "}
      <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
        ({pct}%)
      </span>
    </span>
  );
}
