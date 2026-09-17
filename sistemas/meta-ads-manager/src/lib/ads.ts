import { metaPost } from "./meta-client.ts";
import { getCliente } from "../config/clientes.ts";

interface CriarResp {
  id: string;
}

export interface CriarAdInput {
  nome: string;
  adSetId: string;
  creativeId: string;
}

// Liga o ad set ao creative. Continua PAUSED ate revisao.
export async function criarAd(
  clienteSlug: string,
  input: CriarAdInput
): Promise<string> {
  const cliente = getCliente(clienteSlug);
  const resp = await metaPost<CriarResp>(`${cliente.adAccountId}/ads`, {
    name: input.nome,
    adset_id: input.adSetId,
    creative: { creative_id: input.creativeId },
    status: "PAUSED",
  });
  return resp.id;
}
