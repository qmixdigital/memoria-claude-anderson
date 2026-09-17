import Papa from "papaparse";
import { type LinkType } from "@/lib/types";

export interface ParsedBacklink {
  expectedAnchor: string | null;
  articleUrl: string;
  type: LinkType;
}

/**
 * Lê a lista de backlinks colada ou enviada como CSV.
 *
 * A regra é por CONTEÚDO, não por cabeçalho: em cada linha, a célula que É uma
 * URL vira o artigo e a outra vira a âncora. Com isso tanto faz a ordem das
 * colunas ("âncora, link" ou "link, âncora"), ter ou não linha de cabeçalho, e
 * qual separador a planilha usou.
 *
 * A versão anterior exigia cabeçalho e uma coluna com "url" no nome — colar
 * direto do Excel/Sheets (TAB, sem cabeçalho) importava zero linha em silêncio.
 *
 * Aceita:
 *   Texto Âncora,URL          |  URL;Texto Âncora        |  só a URL por linha
 *   ancora <TAB> https://…    |  https://… <TAB> ancora  |  com ou sem aspas
 *
 * Uma 3ª coluna contendo "301" (ou "redirect") marca o link como REDIRECT_301.
 */
export function parseBacklinkCsv(text: string): ParsedBacklink[] {
  // header:false — a linha de cabeçalho, se existir, é descartada naturalmente
  // por não conter nenhuma URL. O separador (vírgula, ponto e vírgula ou TAB)
  // é detectado pelo Papa.
  const { data } = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: "greedy",
  });

  const out: ParsedBacklink[] = [];
  for (const row of Array.isArray(data) ? data : []) {
    if (!Array.isArray(row)) continue;

    const celulas = row.map(limpar).filter((c) => c !== "");
    const iUrl = celulas.findIndex(ehUrl);
    if (iUrl < 0) continue; // cabeçalho, linha vazia ou lixo — ignora

    const resto = celulas.filter((_, i) => i !== iUrl);
    const type: LinkType = resto.some(ehComportamento) ? "REDIRECT_301" : "DIRECT";
    // a âncora é a primeira sobra que não seja a marcação de comportamento
    const anchor = resto.find((c) => !ehComportamento(c)) ?? "";

    out.push({
      expectedAnchor: anchor || null,
      articleUrl: normalizarUrl(celulas[iUrl]),
      type,
    });
  }
  return out;
}

/** Tira espaços e aspas que sobram de colagem de planilha. */
function limpar(valor: unknown): string {
  let s = String(valor ?? "").trim();
  if (s.length >= 2 && /^["']/.test(s) && /["']$/.test(s)) s = s.slice(1, -1);
  return s.trim();
}

/** A célula é o endereço do artigo? Aceita "www." sem protocolo. */
function ehUrl(c: string): boolean {
  return /^https?:\/\/\S+$/i.test(c) || /^www\.\S+\.\S+$/i.test(c);
}

function normalizarUrl(c: string): string {
  return /^https?:\/\//i.test(c) ? c : `https://${c}`;
}

/** A célula é a coluna "Comportamento" marcando redirecionamento? */
function ehComportamento(c: string): boolean {
  return /^\s*(301|redirect\w*|redirecion\w*)\s*$/i.test(c);
}
