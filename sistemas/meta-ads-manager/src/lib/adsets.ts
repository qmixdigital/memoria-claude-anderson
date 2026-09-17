import { metaPost, reaisParaCentavos } from "./meta-client.ts";
import type { CriarAdSetInput } from "../config/types.ts";
import { getCliente } from "../config/clientes.ts";

interface CriarResp {
  id: string;
}

// Cria ad set com placement de Instagram.
// O placement do IG vive aqui, nao na campanha.
export async function criarAdSet(
  clienteSlug: string,
  input: CriarAdSetInput
): Promise<string> {
  const cliente = getCliente(clienteSlug);
  const positions = input.instagramPositions ?? ["stream", "reels"];

  const resp = await metaPost<CriarResp>(`${cliente.adAccountId}/adsets`, {
    name: input.nome,
    campaign_id: input.campaignId,
    daily_budget: reaisParaCentavos(input.dailyBudgetReais),
    billing_event: "IMPRESSIONS",
    optimization_goal: input.optimizationGoal,
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    targeting: {
      geo_locations: { countries: cliente.defaults.pais },
      age_min: cliente.defaults.idadeMin,
      age_max: cliente.defaults.idadeMax,
      publisher_platforms: ["instagram"],
      instagram_positions: positions,
      // Exigido pela Meta: 0 = usa o publico exato definido acima
      // (1 = ativa expansao automatica "publico Advantage")
      targeting_automation: { advantage_audience: 0 },
    },
    status: "PAUSED",
  });
  return resp.id;
}
