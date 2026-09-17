import { normalizeForCompare } from "@/lib/utils/url";
import type { ParsedBacklink } from "./csv";

/** O que já está no banco para este cliente (o mínimo pra decidir). */
export interface BacklinkExistente {
  id: string;
  articleUrl: string;
  expectedAnchor: string | null;
}

export interface PlanoImportacao {
  /** linhas que viram backlink novo */
  criar: ParsedBacklink[];
  /** backlinks que já existiam e cuja âncora mudou */
  atualizar: Array<{ id: string; expectedAnchor: string }>;
  /** já existiam e nada mudou */
  inalterados: number;
  /** linhas repetidas dentro da própria lista colada */
  repetidosNaLista: number;
}

/**
 * Decide o que fazer com cada linha da lista, sem tocar no banco.
 *
 * Regras:
 *  - a identidade do backlink é a URL CANÔNICA (ver utils/url.ts), então
 *    barra final, "www.", http/https e "?utm" não criam duplicata;
 *  - se o artigo já existe e a âncora colada é DIFERENTE, a âncora é
 *    atualizada — reimportar passa a corrigir o texto âncora;
 *  - âncora vazia NÃO apaga a âncora que já existe. Igual à regra do snapshot:
 *    "não informado" é diferente de "não tem";
 *  - o TIPO (DIRECT / REDIRECT_301) nunca é atualizado. DIRECT é o valor padrão
 *    de quem não escreveu nada na coluna de comportamento, então não dá pra
 *    distinguir "é direto" de "não falei nada" — atualizar rebaixaria um
 *    REDIRECT_301 sem querer.
 */
export function planejarImportacao(
  parsed: ParsedBacklink[],
  existentes: BacklinkExistente[],
): PlanoImportacao {
  const porChave = new Map<string, BacklinkExistente>();
  for (const b of existentes) porChave.set(normalizeForCompare(b.articleUrl), b);

  const plano: PlanoImportacao = {
    criar: [],
    atualizar: [],
    inalterados: 0,
    repetidosNaLista: 0,
  };
  const vistos = new Set<string>();

  for (const p of parsed) {
    const chave = normalizeForCompare(p.articleUrl);
    if (vistos.has(chave)) {
      plano.repetidosNaLista++;
      continue;
    }
    vistos.add(chave);

    const ja = porChave.get(chave);
    if (!ja) {
      plano.criar.push(p);
      continue;
    }

    const nova = p.expectedAnchor?.trim() || null;
    if (nova !== null && nova !== (ja.expectedAnchor ?? null)) {
      plano.atualizar.push({ id: ja.id, expectedAnchor: nova });
    } else {
      plano.inalterados++;
    }
  }
  return plano;
}
