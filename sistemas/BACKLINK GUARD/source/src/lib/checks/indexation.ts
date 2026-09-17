import { dfsPost, type DfsTask } from "@/lib/dataforseo/client";
import { env, hasDataForSeo } from "@/lib/env";
import { checkIndexationGsc } from "./indexation-gsc";

interface SerpItem {
  type: string;
  url?: string;
}
interface SerpResult {
  items: SerpItem[] | null;
  se_results_count?: number;
}

// Status devolvidos pela DataForSEO no nível da TAREFA (não confundir com o
// status_code do envelope da resposta, que é 20000 mesmo quando a tarefa falha).
const DFS_OK = 20000;
const DFS_NO_SEARCH_RESULTS = 40102;

export interface IndexationResult {
  indexed: boolean | null; // null = não foi possível verificar
  costCents: number;
  error: string | null;
  source: "gsc" | "dataforseo" | "none"; // de onde veio a resposta
}

/** Monta o alvo do operador site: — host + caminho, sem protocolo nem barra final. */
function indexQuery(url: string): string {
  try {
    const u = new URL(url);
    const host = u.host.replace(/^www\./i, "");
    const path = u.pathname.replace(/\/+$/, "");
    return host + path;
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }
}

/**
 * Verifica se uma URL está indexada no Google.
 *
 * Estratégia (barata primeiro):
 *   1. Google Search Console (URL Inspection) — GRÁTIS e autoritativo, se o
 *      domínio for uma propriedade verificada (sites da própria rede).
 *   2. DataForSEO (`site:<url>`) — pago, fallback para domínios de terceiros.
 *   3. Nenhum configurado -> indexed=null (desconhecido).
 */
export async function checkIndexation(
  articleUrl: string,
  opts: { allowPaid?: boolean } = {},
): Promise<IndexationResult> {
  // 1. Search Console (seus sites) — grátis e autoritativo (verdict PASS = indexado)
  const gsc = await checkIndexationGsc(articleUrl);
  if (gsc.handled) {
    return { indexed: gsc.indexed, costCents: 0, error: gsc.error, source: "gsc" };
  }

  // Daqui pra baixo é PAGO (DataForSEO). Só roda se explicitamente permitido.
  if (!opts.allowPaid) {
    return { indexed: null, costCents: 0, error: null, source: "none" };
  }

  // 2. DataForSEO (pago — apenas quando allowPaid)
  if (!hasDataForSeo) {
    return { indexed: null, costCents: 0, error: null, source: "none" };
  }

  try {
    const task = await dfsPost<SerpResult>(
      "/v3/serp/google/organic/live/advanced",
      [
        {
          // site: com a URL exata (host+path, sem protocolo) — o operador ignora
          // o esquema e casa melhor a página específica.
          keyword: `site:${indexQuery(articleUrl)}`,
          location_code: env.DEFAULT_LOCATION_CODE,
          language_code: env.DEFAULT_LANGUAGE_CODE,
          depth: 10,
          device: "desktop",
        },
      ],
    );
    // O crédito é debitado mesmo quando a tarefa falha — sempre registramos.
    const costCents = Math.round((task.cost ?? 0) * 100);

    // A DataForSEO responde em DUAS camadas de status e só a de cima era
    // conferida (em dataforseo/client.ts). O status da TAREFA é o que decide:
    //
    //   20000 -> a consulta rodou; o veredito está nos itens
    //   40102 -> "No Search Results": o Google respondeu e não achou nada.
    //            Isso é um "NÃO indexado" legítimo.
    //   outro -> a consulta FALHOU (ex.: 40101 "Internal SE Server Error").
    //            Não dá pra concluir nada. Antes isso virava "não indexado",
    //            que é o que marcava página indexada como fora do índice.
    if (task.status_code === DFS_NO_SEARCH_RESULTS) {
      return { indexed: false, costCents, error: null, source: "dataforseo" };
    }
    if (task.status_code !== DFS_OK) {
      return {
        indexed: null,
        costCents,
        error: `DataForSEO ${task.status_code}: ${task.status_message}`,
        source: "dataforseo",
      };
    }
    return {
      indexed: serpHasResult(task),
      costCents,
      error: null,
      source: "dataforseo",
    };
  } catch (e) {
    return {
      indexed: null,
      costCents: 0,
      error: e instanceof Error ? e.message : "falha na consulta de indexação",
      source: "dataforseo",
    };
  }
}

/**
 * Veredito de uma tarefa que rodou com sucesso (status 20000).
 *
 * Os ITENS mandam sobre a contagem: em consulta `site:` de uma URL só, o Google
 * às vezes devolve o resultado orgânico mas omite o total (se_results_count=0).
 * Conferir a contagem primeiro, como era antes, transformava esse caso em
 * "não indexado".
 */
function serpHasResult(task: DfsTask<SerpResult>): boolean {
  const result = task.result?.[0];
  if (!result) return false;
  const items = result.items ?? [];
  if (items.some((i) => i.type === "organic" && Boolean(i.url))) return true;
  return (result.se_results_count ?? 0) > 0;
}
