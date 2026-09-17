// Check de indexação via Google Custom Search JSON API (oficial).
// 100 consultas/dia grátis; depois ~US$5/1000 (pago pela conta Google Cloud,
// sem mínimo). Usa key + cx (mecanismo "Pesquisar em toda a Web").

import { normalizeUrl } from "@/lib/utils/domain";

export function hasCse(): boolean {
  return Boolean(process.env.CSE_API_KEY && process.env.CSE_CX);
}

export interface CseIndexResult {
  handled: boolean; // true se o CSE está configurado e a consulta rodou
  indexed: boolean | null;
  error: string | null;
}

export async function checkIndexationCse(url: string): Promise<CseIndexResult> {
  if (!hasCse()) {
    return { handled: false, indexed: null, error: null };
  }
  const key = process.env.CSE_API_KEY as string;
  const cx = process.env.CSE_CX as string;
  const q = `site:${normalizeUrl(url)}`;

  try {
    const endpoint = new URL("https://www.googleapis.com/customsearch/v1");
    endpoint.searchParams.set("key", key);
    endpoint.searchParams.set("cx", cx);
    endpoint.searchParams.set("q", q);
    endpoint.searchParams.set("num", "1");

    const res = await fetch(endpoint.toString());
    if (res.status === 429) {
      return { handled: true, indexed: null, error: "cota diária do Custom Search esgotada" };
    }
    if (!res.ok) {
      return { handled: true, indexed: null, error: `Custom Search HTTP ${res.status}` };
    }
    const json = (await res.json()) as {
      searchInformation?: { totalResults?: string };
      items?: unknown[];
    };
    const total = Number(json.searchInformation?.totalResults ?? "0");
    const indexed = total > 0 || Boolean(json.items?.length);
    return { handled: true, indexed, error: null };
  } catch (e) {
    return {
      handled: true,
      indexed: null,
      error: e instanceof Error ? e.message : "falha Custom Search",
    };
  }
}
