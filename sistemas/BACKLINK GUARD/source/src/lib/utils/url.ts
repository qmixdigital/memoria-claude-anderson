/**
 * Chave canônica de uma URL, para comparar dois endereços que apontam para a
 * MESMA página escrita de formas diferentes.
 *
 * Ignora: protocolo, "www.", barra final, maiúsculas, query string e hash.
 *   "https://www.X.com/Página/?utm_source=x#topo"  ->  "x.com/página"
 *
 * Usada em dois lugares:
 *   - conferir se o artigo aponta para a URL contratada (checks/html.ts)
 *   - deduplicar a importação, para não cadastrar o mesmo artigo duas vezes
 *     só porque a barra final mudou (import/service.ts) — duplicata custa
 *     US$ 0,01 por verificação, para sempre.
 */
export function normalizeForCompare(url: string): string {
  try {
    const u = new URL(url);
    const host = u.host.replace(/^www\./i, "").toLowerCase();
    let path = u.pathname.replace(/\/+$/, "");
    try {
      path = decodeURIComponent(path);
    } catch {
      /* mantém como está se a decodificação falhar */
    }
    return host + path.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
