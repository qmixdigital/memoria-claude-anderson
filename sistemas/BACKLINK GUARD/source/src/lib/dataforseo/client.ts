import { env, hasDataForSeo } from "@/lib/env";

const BASE = "https://api.dataforseo.com";

export interface DfsTask<T> {
  status_code: number;
  status_message: string;
  cost: number;
  result: T[] | null;
}

/**
 * POST genérico para a DataForSEO (Basic Auth). Retorna a primeira task.
 * Lança se as credenciais não estão configuradas — chame só quando hasDataForSeo.
 */
export async function dfsPost<T>(
  path: string,
  tasks: unknown[],
): Promise<DfsTask<T>> {
  if (!hasDataForSeo) {
    throw new Error("DataForSEO não configurado (DATAFORSEO_LOGIN/PASSWORD)");
  }
  const auth = Buffer.from(
    `${env.DATAFORSEO_LOGIN}:${env.DATAFORSEO_PASSWORD}`,
  ).toString("base64");

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tasks),
  });
  if (!res.ok) {
    throw new Error(`DataForSEO ${path} HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    status_code: number;
    tasks: DfsTask<T>[];
  };
  if (json.status_code !== 20000) {
    throw new Error(`DataForSEO status ${json.status_code}`);
  }
  const task = json.tasks[0];
  if (!task) throw new Error("DataForSEO: resposta sem tasks");
  return task;
}
