import { metaPost } from "./meta-client.ts";
import type { CriarCampanhaInput } from "../config/types.ts";

interface CriarResp {
  id: string;
}

// Cria campanha sempre PAUSED. Ativacao e passo manual deliberado.
export async function criarCampanha(
  adAccountId: string,
  input: CriarCampanhaInput
): Promise<string> {
  const resp = await metaPost<CriarResp>(`${adAccountId}/campaigns`, {
    name: input.nome,
    objective: input.objetivo,
    status: "PAUSED",
    special_ad_categories: [],
    // Exigido pela Meta quando o orcamento fica no conjunto (nao na campanha).
    // false = conjuntos nao compartilham orcamento entre si.
    is_adset_budget_sharing_enabled: false,
  });
  return resp.id;
}

export async function pausarCampanha(campaignId: string): Promise<void> {
  await metaPost(campaignId, { status: "PAUSED" });
}

export async function ativarCampanha(campaignId: string): Promise<void> {
  await metaPost(campaignId, { status: "ACTIVE" });
}
