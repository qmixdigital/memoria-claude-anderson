import { getDomain, parse } from "tldts";

/**
 * Extrai o domínio "registrável" (eTLD+1) de uma URL ou host.
 * ex: "https://www.coegoiania.com.br/artigo" -> "coegoiania.com.br"
 */
export function rootDomain(input: string): string | null {
  return getDomain(input);
}

/**
 * Dois hosts pertencem ao mesmo site do cliente?
 * Compara pelo domínio registrável, ignorando www/subdomínios.
 */
export function sameRegistrableDomain(a: string, b: string): boolean {
  const da = getDomain(a);
  const db = getDomain(b);
  return da !== null && da === db;
}

/** Normaliza uma URL para comparação (sem hash, sem trailing slash duplicado). */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

export { parse as parseHost };
