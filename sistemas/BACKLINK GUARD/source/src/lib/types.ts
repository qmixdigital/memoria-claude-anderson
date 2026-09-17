/** Tipo de backlink — como o link chega no site do cliente. */
export const LINK_TYPES = ["DIRECT", "REDIRECT_301"] as const;
export type LinkType = (typeof LINK_TYPES)[number];

export function isLinkType(v: unknown): v is LinkType {
  return typeof v === "string" && (LINK_TYPES as readonly string[]).includes(v);
}

/** Resultado dos 3 checks de um backlink. null = não foi possível verificar. */
export interface CheckOutcome {
  articlePublished: boolean | null;
  linkPresent: boolean | null;
  indexed: boolean | null;
  httpStatus: number | null;
  finalUrl: string | null;
  foundAnchor: string | null;
  /// URL do cliente que o artigo realmente linkou, quando aponta para uma
  /// página diferente da contratada. null quando o link exato foi achado ou
  /// quando não há link nenhum para o domínio.
  foundTarget: string | null;
  /** `rel` do link do cliente ("" = dofollow). null = não avaliado. */
  linkRel: string | null;
  error: string | null;
  costCents: number;
}
