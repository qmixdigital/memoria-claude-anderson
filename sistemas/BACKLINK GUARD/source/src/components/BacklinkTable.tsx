"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { StatusDot } from "@/components/StatusDot";
import { RecheckButton, DeleteBacklinkButton, RapidUrlButton } from "@/components/ActionButtons";
import { ajustarAncoraAction, ajustarDestinoAction } from "@/app/actions";
import { alertasDeValor, relBloqueantes } from "@/lib/checks/valor";
import { statusDaLinha } from "@/lib/checks/status";
import { StatusEditavel } from "@/components/StatusEditavel";

export interface BacklinkRow {
  id: string;
  articleUrl: string;
  expectedTarget: string;
  expectedAnchor: string | null;
  type: string;
  lastPublished: boolean | null;
  lastLinkOk: boolean | null;
  lastIndexed: boolean | null;
  lastIndexCheckAt: string | null;
  rapidSubmittedAt: string | null;
  rapidStatus: string | null;
  manualPublished: boolean | null;
  manualLinkOk: boolean | null;
  manualIndexed: boolean | null;
  manualAt: string | null;
  lastLinkRel: string | null;
  lastFoundAnchor: string | null;
  lastFoundTarget: string | null;
  lastCheckAt: string | null;
  httpStatus: number | null;
  error: string | null;
}

interface Opt {
  value: string;
  label: string;
  dot?: string;
}

const CHECK_OPTS: Opt[] = [
  { value: "all", label: "Todos" },
  { value: "sim", label: "Sim", dot: "bg-emerald-500" },
  { value: "nao", label: "Não", dot: "bg-rose-500" },
  { value: "und", label: "Conferir", dot: "bg-amber-500" },
];
const TYPE_OPTS: Opt[] = [
  { value: "all", label: "Todos" },
  { value: "DIRECT", label: "Direto", dot: "bg-sky-500" },
  { value: "REDIRECT_301", label: "301 (redirect)", dot: "bg-violet-500" },
];
const VALOR_OPTS: Opt[] = [
  { value: "all", label: "Todos" },
  { value: "ok", label: "Sem problema", dot: "bg-emerald-500" },
  { value: "nofollow", label: "nofollow", dot: "bg-rose-500" },
  { value: "indice", label: "Fora do índice", dot: "bg-rose-500" },
  { value: "ancora", label: "Âncora trocada", dot: "bg-amber-500" },
];

/**
 * Alertas da linha usando os valores EFETIVOS (com a correção manual aplicada).
 * Se você marcou "Indexado: Não" à mão, o valor SEO tem que refletir isso.
 */
function alertasDaLinha(r: BacklinkRow) {
  const s = statusDaLinha(r);
  return alertasDeValor({
    linkOk: s.linkOk.valor,
    indexado: s.indexed.valor,
    rel: r.lastLinkRel,
    ancoraContratada: r.expectedAnchor,
    ancoraEncontrada: r.lastFoundAnchor,
  });
}

/** Filtro da coluna "Valor SEO". */
function matchesValor(r: BacklinkRow, f: string): boolean {
  if (f === "all") return true;
  const a = alertasDaLinha(r);
  if (f === "ok") return statusDaLinha(r).linkOk.valor === true && a.length === 0;
  if (f === "nofollow") return a.includes("nofollow");
  if (f === "indice") return a.includes("fora-do-indice");
  return a.includes("ancora-trocada");
}

function matchesCheck(value: boolean | null, f: string): boolean {
  if (f === "all") return true;
  if (f === "sim") return value === true;
  if (f === "nao") return value === false;
  return value === null;
}

/**
 * Classe do cabeçalho fixo.
 *
 * `sticky` e o fundo precisam estar em CADA <th>, não no <thead>: o navegador
 * não pinta background em elementos de agrupamento de tabela de forma
 * confiável, então as células ficavam transparentes e o conteúdo das linhas
 * aparecia por trás ao rolar. Fundo OPACO (sem /95 e sem backdrop-blur) pelo
 * mesmo motivo — translucidez aqui é vazamento visual, não estilo.
 */
const TH_FIXO =
  "sticky top-16 z-20 bg-neutral-100 px-3 py-3 font-semibold " +
  "border-b border-neutral-200 dark:border-white/[0.07] dark:bg-[#0f141c]";

export function BacklinkTable({
  rows,
  clientId,
  admin = true,
}: {
  rows: BacklinkRow[];
  clientId: string;
  /** auxiliar não remove backlinks (o servidor também barra, ver lib/sessao.ts) */
  admin?: boolean;
}) {
  const [pub, setPub] = useState("all");
  const [link, setLink] = useState("all");
  const [idx, setIdx] = useState("all");
  const [typeF, setTypeF] = useState("all");
  const [valor, setValor] = useState("all");

  const showType = rows.some((r) => r.type !== "DIRECT");

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          matchesCheck(statusDaLinha(r).published.valor, pub) &&
          matchesCheck(statusDaLinha(r).linkOk.valor, link) &&
          matchesCheck(statusDaLinha(r).indexed.valor, idx) &&
          (typeF === "all" || r.type === typeF) &&
          matchesValor(r, valor),
      ),
    [rows, pub, link, idx, typeF, valor],
  );

  const anyFilter =
    pub !== "all" ||
    link !== "all" ||
    idx !== "all" ||
    typeF !== "all" ||
    valor !== "all";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
        <span>
          <span className="font-display font-semibold text-neutral-800 dark:text-neutral-100">
            {filtered.length}
          </span>{" "}
          de {rows.length} backlinks
        </span>
        {anyFilter && (
          <button
            onClick={() => {
              setPub("all");
              setLink("all");
              setIdx("all");
              setTypeF("all");
              setValor("all");
            }}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
          >
            limpar filtros ✕
          </button>
        )}
      </div>

      {/* NENHUM overflow aqui. Havia um `max-h-[72vh] overflow-auto`, e o
          cabeçalho grudava neste container em vez da janela — ao rolar a
          PÁGINA ele ia embora junto. Cuidado: `overflow-x-auto` sozinho também
          não serve, porque quando um eixo deixa de ser `visible` o outro passa
          a `auto` e o contexto de rolagem volta a existir. A tabela cabe na
          largura (URLs são truncadas), então a janela é o único scroller. */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <tr className="whitespace-nowrap">
              <th className={`${TH_FIXO} px-4`}>Artigo (backlink)</th>
              {showType && (
                <ColumnFilter label="Tipo" value={typeF} options={TYPE_OPTS} onChange={setTypeF} />
              )}
              <ColumnFilter label="Publicado" value={pub} options={CHECK_OPTS} onChange={setPub} />
              <ColumnFilter label="Link" value={link} options={CHECK_OPTS} onChange={setLink} />
              <ColumnFilter label="Indexado" value={idx} options={CHECK_OPTS} onChange={setIdx} />
              <ColumnFilter label="Valor SEO" value={valor} options={VALOR_OPTS} onChange={setValor} />
              <th className={TH_FIXO}>Último check</th>
              <th className={TH_FIXO}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-white/[0.05]">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={showType ? 8 : 7}
                  className="px-4 py-12 text-center text-neutral-400 dark:text-neutral-500"
                >
                  Nenhum backlink com esse filtro.
                </td>
              </tr>
            )}
            {filtered.map((bl) => (
              <tr
                key={bl.id}
                className="align-top transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
              >
                <td className="max-w-[440px] px-4 py-3">
                  <a
                    href={bl.articleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                    title={bl.articleUrl}
                  >
                    {bl.articleUrl.replace(/^https?:\/\//, "")}
                  </a>
                  {bl.expectedTarget && (
                    <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-500">
                      → alvo:{" "}
                      <span className="font-mono text-neutral-600 dark:text-neutral-400">
                        {bl.expectedTarget.replace(/^https?:\/\//, "")}
                      </span>
                    </span>
                  )}
                  {bl.expectedAnchor && (
                    <span className="text-xs text-neutral-400 dark:text-neutral-600">
                      âncora: “{bl.expectedAnchor}”
                    </span>
                  )}
                  <MarcacaoDoLink bl={bl} />
                  <SituacaoInline bl={bl} />
                  <AlertasDeValor bl={bl} clientId={clientId} />
                  <ObservacaoDoRobo bl={bl} />
                </td>
                {showType && (
                  <td className="px-3 py-3">
                    <TypeBadge type={bl.type} />
                  </td>
                )}
                <td className="px-3 py-3">
                  <StatusEditavel
                    backlinkId={bl.id}
                    clientId={clientId}
                    campo="published"
                    valor={statusDaLinha(bl).published.valor}
                    origem={statusDaLinha(bl).published.origem}
                    label="Artigo publicado"
                  />
                </td>
                <td className="px-3 py-3">
                  <StatusEditavel
                    backlinkId={bl.id}
                    clientId={clientId}
                    campo="linkOk"
                    valor={statusDaLinha(bl).linkOk.valor}
                    origem={statusDaLinha(bl).linkOk.origem}
                    label="Link do cliente presente"
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <StatusEditavel
                      backlinkId={bl.id}
                      clientId={clientId}
                      campo="indexed"
                      valor={statusDaLinha(bl).indexed.valor}
                      origem={statusDaLinha(bl).indexed.origem}
                      inaplicavel={!statusDaLinha(bl).indexacaoAplicavel}
                      label="Indexado no Google"
                    />
                    <ConferirNoGoogle articleUrl={bl.articleUrl} />
                  </div>
                  <SeloIndexacao bl={bl} />
                </td>
                <td className="px-3 py-3">
                  <ValorSeo bl={bl} />
                </td>
                <td
                  className="whitespace-nowrap px-3 py-3 text-neutral-500 dark:text-neutral-400"
                  title={bl.lastCheckAt ? new Date(bl.lastCheckAt).toLocaleString("pt-BR") : undefined}
                >
                  {bl.lastCheckAt ? new Date(bl.lastCheckAt).toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <RecheckButton backlinkId={bl.id} clientId={clientId} />
                    {/* So oferece o envio pago onde ele faz sentido: artigo no
                        ar, link presente e ainda nao indexado. */}
                    <RapidUrlButton
                      backlinkId={bl.id}
                      clientId={clientId}
                      elegivel={
                        (bl.manualPublished ?? bl.lastPublished) === true &&
                        (bl.manualLinkOk ?? bl.lastLinkOk) === true &&
                        (bl.manualIndexed ?? bl.lastIndexed) === false
                      }
                    />
                    {admin && (
                      <DeleteBacklinkButton backlinkId={bl.id} clientId={clientId} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Avisos de "o link está lá, mas perdeu valor". Ficam junto da URL porque são
 * sobre o link em si, não sobre um dos 3 semáforos. Ver lib/checks/valor.ts.
 */
/**
 * Mostra a marcação `rel` do link em TODA linha que tem link — não só quando dá
 * problema. É a informação que decide se o backlink transfere autoridade, e
 * antes só aparecia no caso ruim; ver o "dofollow" explícito dá a confirmação
 * de que aquele link está entregando o que foi contratado.
 */
function MarcacaoDoLink({ bl }: { bl: BacklinkRow }) {
  if (statusDaLinha(bl).linkOk.valor !== true || bl.lastLinkRel === null) return null;
  const bloqueios = relBloqueantes(bl.lastLinkRel);
  const dofollow = bloqueios.length === 0;
  return (
    <span
      title={
        dofollow
          ? `rel="${bl.lastLinkRel || "(vazio)"}" — transfere autoridade`
          : `rel="${bl.lastLinkRel}" — o Google não transfere autoridade por este link`
      }
      className={`mt-0.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
        dofollow
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
      }`}
    >
      {dofollow ? "dofollow" : bloqueios.join(" + ")}
    </span>
  );
}

/**
 * Observação do último check automático.
 *
 * Some quando você corrigiu à mão o "publicado" ou o "link": todas as
 * observações que o robô escreve são sobre esses dois eixos (não conseguiu
 * acessar, artigo caiu na home, conteúdo via JavaScript, link aponta pra outro
 * lugar). Se você já conferiu com os próprios olhos, deixar a mensagem na tela
 * é a ferramenta te contradizendo. No lugar dela vai a marca da sua conferência.
 *
 * Corrigir só a indexação NÃO esconde a observação — é outro eixo.
 */
function ObservacaoDoRobo({ bl }: { bl: BacklinkRow }) {
  const voceDecidiu = bl.manualPublished !== null || bl.manualLinkOk !== null;

  if (voceDecidiu) {
    return (
      <span className="mt-1 block text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
        ✎ conferido por você
        {bl.manualAt
          ? ` em ${new Date(bl.manualAt).toLocaleDateString("pt-BR")}`
          : ""}
      </span>
    );
  }
  if (!bl.error) return null;
  return (
    <span className="mt-1 block rounded-md bg-amber-50 px-1.5 py-1 text-[11px] leading-snug text-amber-700 dark:bg-amber-500/10 dark:text-amber-300/90">
      {bl.error}
    </span>
  );
}

/**
 * Detalhe da situação HTTP, mostrado só quando NÃO é "No ar".
 *
 * A coluna "Situação" foi removida: ela era derivada do mesmo HTTP que gera o
 * "Publicado", então eram dois lugares dizendo a mesma coisa — e torná-la
 * editável à parte permitiria marcar "Publicado: Sim" com "Situação: Apagada".
 * O detalhe (404 vs bloqueado) continua útil, mas como nota, não como coluna.
 */
function SituacaoInline({ bl }: { bl: BacklinkRow }) {
  // você já decidiu sobre a página ou o link — não contradiz
  if (bl.manualPublished !== null || bl.manualLinkOk !== null) return null;
  const s = pageSituation(bl.httpStatus);
  if (s.text === "No ar") return null;
  return (
    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
      página: <strong className="font-semibold">{s.text}</strong>
      {bl.httpStatus ? ` (HTTP ${bl.httpStatus})` : ""}
    </span>
  );
}

/** Semáforo da coluna "Valor SEO": o link presente ainda entrega força? */
function ValorSeo({ bl }: { bl: BacklinkRow }) {
  const s = statusDaLinha(bl);
  // Sem link não há transferência nenhuma: o valor é ZERO, não "não avaliado".
  // Só fica em "—" quando nem sabemos se o link está lá (página bloqueada).
  if (s.linkOk.valor === false) {
    return (
      <span
        title={
          s.artigoRemovido
            ? "O artigo foi removido — este backlink não entrega nada."
            : "O link do cliente não está na página — nenhuma autoridade é transferida."
        }
        className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Não passa
      </span>
    );
  }
  if (s.linkOk.valor !== true) {
    return <span className="text-xs text-neutral-400 dark:text-neutral-600">—</span>;
  }
  const alertas = alertasDaLinha(bl);
  if (alertas.length === 0) {
    return (
      <span
        title="Link dofollow e com a âncora contratada — transfere autoridade."
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Passa força
      </span>
    );
  }
  const semIndice = alertas.includes("fora-do-indice");
  const grave = alertas.includes("nofollow") || semIndice;
  return (
    <span
      title={
        alertas.includes("nofollow")
          ? `rel="${relBloqueantes(bl.lastLinkRel).join(", ")}" — o Google não transfere autoridade.`
          : semIndice
            ? "A página não está no índice do Google — ele nunca leu este link, então nada é transferido."
            : `Âncora contratada: "${bl.expectedAnchor}" · encontrada: "${bl.lastFoundAnchor}"`
      }
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        grave
          ? "bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          : "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${grave ? "bg-rose-500" : "bg-amber-500"}`} />
      {grave ? "Não passa" : "Âncora trocada"}
    </span>
  );
}

/**
 * Adota a âncora publicada como sendo a contratada. Para quando a troca é
 * aceitável e você não quer conviver com o alerta para sempre.
 */
function BotaoAjustarAncora({
  backlinkId,
  clientId,
}: {
  backlinkId: string;
  clientId: string;
}) {
  const [pendente, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={pendente}
      title="Passar a considerar esta âncora como a contratada"
      onClick={() => iniciar(async () => ajustarAncoraAction(backlinkId, clientId))}
      className="rounded border border-amber-500/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition hover:bg-amber-500/20 disabled:opacity-50"
    >
      {pendente ? "…" : "aceitar"}
    </button>
  );
}

/**
 * Adota a página que o portal linkou como sendo a contratada. Para quando o
 * link foi parar em outra página do mesmo cliente e aquela página serve.
 */
function BotaoAjustarDestino({
  backlinkId,
  clientId,
}: {
  backlinkId: string;
  clientId: string;
}) {
  const [pendente, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={pendente}
      title="Passar a considerar esta página como o destino contratado"
      onClick={() =>
        iniciar(async () => {
          const r = await ajustarDestinoAction(backlinkId, clientId);
          if (!r.ok) alert(r.mensagem);
        })
      }
      className="rounded border border-sky-500/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition hover:bg-sky-500/20 disabled:opacity-50"
    >
      {pendente ? "…" : "aceitar"}
    </button>
  );
}

function AlertasDeValor({ bl, clientId }: { bl: BacklinkRow; clientId: string }) {
  const alertas = alertasDaLinha(bl);
  // O destino divergente não vem de alertasDaLinha (que olha só o valor SEO),
  // então precisa entrar na condição de renderizar o bloco.
  if (alertas.length === 0 && !bl.lastFoundTarget) return null;
  const bloqueios = relBloqueantes(bl.lastLinkRel).join(", ");
  return (
    <span className="mt-1 flex flex-wrap gap-1">
      {alertas.includes("nofollow") && (
        <span
          title={`O link tem rel="${bloqueios}" — o Google não transfere autoridade por ele.`}
          className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
        >
          {bloqueios} · não passa autoridade
        </span>
      )}
      {alertas.includes("fora-do-indice") && (
        <span
          title="A página não está no índice do Google — ele nunca leu este link, então não transfere autoridade."
          className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
        >
          página fora do índice · não passa autoridade
        </span>
      )}
      {bl.lastFoundTarget && (
        <span
          title={`Contratado: ${bl.expectedTarget || "(não informado)"} · Encontrado: ${bl.lastFoundTarget}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-1.5 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300"
        >
          aponta para outra página do cliente
          <BotaoAjustarDestino backlinkId={bl.id} clientId={clientId} />
        </span>
      )}
      {alertas.includes("ancora-trocada") && (
        <span
          title={`Contratada: "${bl.expectedAnchor}" · Encontrada: "${bl.lastFoundAnchor}"`}
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
        >
          âncora trocada: “{bl.lastFoundAnchor}”
          <BotaoAjustarAncora backlinkId={bl.id} clientId={clientId} />
        </span>
      )}
    </span>
  );
}

/**
 * Conferência MANUAL da indexação: abre o Google com o operador `site:` na URL
 * exata do artigo. É a mesma pergunta que a consulta paga faz, só que feita por
 * você, no navegador, de graça — útil para confirmar um caso duvidoso ou para
 * checar sem gastar crédito.
 *
 * Resultado na página do Google: apareceu = indexado; "não encontrou nenhum
 * documento" = fora do índice.
 */
function ConferirNoGoogle({ articleUrl }: { articleUrl: string }) {
  const busca = `https://www.google.com/search?q=site:${encodeURIComponent(articleUrl)}`;
  return (
    <a
      href={busca}
      target="_blank"
      rel="noreferrer noopener"
      title="Conferir a indexação no Google agora (grátis, abre em nova aba)"
      aria-label="Conferir manualmente a indexação desta página no Google"
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-400 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-white/[0.08] dark:text-neutral-500 dark:hover:border-emerald-500/50 dark:hover:text-emerald-400"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    </a>
  );
}

/** Cabeçalho com dropdown de filtro (portal + posição fixa, não é cortado). */
function ColumnFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Opt[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const active = value !== "all";
  const activeOpt = options.find((o) => o.value === value);

  function toggle() {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <th className={TH_FIXO}>
      <button
        ref={btnRef}
        onClick={toggle}
        className={`group -mx-1.5 inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 uppercase tracking-wider transition hover:bg-neutral-200/60 dark:hover:bg-white/[0.06] ${
          active ? "text-emerald-600 dark:text-emerald-400" : ""
        }`}
      >
        {label}
        {active && activeOpt?.dot && (
          <span className={`inline-block h-2 w-2 rounded-full ${activeOpt.dot}`} />
        )}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`h-3 w-3 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className="animate-pop fixed z-50 min-w-[190px] overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-2xl dark:border-white/10 dark:bg-[#11151c]"
              style={{ top: pos.top, left: pos.left }}
            >
              {options.map((o) => {
                const sel = o.value === value;
                return (
                  <button
                    key={o.value}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm normal-case tracking-normal transition ${
                      sel
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    {o.dot ? (
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${o.dot}`} />
                    ) : (
                      <span className="h-2.5 w-2.5 shrink-0" />
                    )}
                    <span className="flex-1">{o.label}</span>
                    {sel && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3.5 w-3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}
    </th>
  );
}

/** Traduz o status HTTP para linguagem que qualquer pessoa entende. */
function pageSituation(status: number | null): {
  text: string;
  cls: string;
  dot: string;
} {
  const neutral =
    "bg-neutral-100/70 text-neutral-500 dark:bg-white/[0.05] dark:text-neutral-400";
  const good =
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  const bad = "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
  const warn =
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";

  if (status === null || status === 0)
    return { text: "Sem resposta", cls: neutral, dot: "bg-neutral-400" };
  if (status >= 200 && status < 300)
    return { text: "No ar", cls: good, dot: "bg-emerald-500" };
  if (status === 404 || status === 410)
    return { text: "Apagada", cls: bad, dot: "bg-rose-500" };
  if (status === 403 || status === 429 || status === 401)
    return { text: "Bloqueado", cls: warn, dot: "bg-amber-500" };
  if (status >= 500)
    return { text: "Fora do ar", cls: warn, dot: "bg-amber-500" };
  if (status >= 300 && status < 400)
    return { text: "Redireciona", cls: warn, dot: "bg-amber-500" };
  return { text: `Erro ${status}`, cls: neutral, dot: "bg-neutral-400" };
}

function TypeBadge({ type }: { type: string }) {
  const is301 = type === "REDIRECT_301";
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
        is301
          ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
          : "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
      }`}
    >
      {is301 ? "301" : "direto"}
    </span>
  );
}

/**
 * Diz há quanto tempo a INDEXAÇÃO foi conferida, e se a URL já foi empurrada
 * para o Rapid URL Indexer.
 *
 * Existe porque a data da coluna "verificado" engana: a trava de custo pula a
 * consulta de indexação em muitas rodadas, então um backlink pode ter sido
 * verificado hoje e estar com o dado de indexação de dois meses atrás.
 */
function SeloIndexacao({ bl }: { bl: BacklinkRow }) {
  const partes: string[] = [];

  if (bl.lastIndexCheckAt) {
    const d = new Date(bl.lastIndexCheckAt);
    const dias = Math.floor((Date.now() - d.getTime()) / 86_400_000);
    const quando =
      dias <= 0 ? "hoje" : dias === 1 ? "ontem" : `há ${dias} dias`;
    partes.push(`conferido ${quando}`);
  } else {
    partes.push("nunca conferido");
  }

  if (bl.rapidSubmittedAt) {
    partes.push(
      `enviado ${new Date(bl.rapidSubmittedAt).toLocaleDateString("pt-BR")}`,
    );
  }

  const titulo = [
    bl.lastIndexCheckAt
      ? `Indexação conferida em ${new Date(bl.lastIndexCheckAt).toLocaleString("pt-BR")}`
      : "A indexação deste backlink nunca foi conferida",
    bl.rapidSubmittedAt
      ? `Enviado ao Rapid URL Indexer em ${new Date(bl.rapidSubmittedAt).toLocaleString("pt-BR")}${bl.rapidStatus ? ` (${bl.rapidStatus})` : ""}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <span
      title={titulo}
      className="mt-1 block text-[10px] leading-tight text-neutral-400 dark:text-neutral-500"
    >
      {partes.join(" · ")}
    </span>
  );
}
