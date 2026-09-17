import type { ClienteConfig } from "./types.ts";

// Registro de clientes da agencia.
// Os IDs vem do Business Manager. O slug e usado nos scripts da CLI.
export const CLIENTES: Record<string, ClienteConfig> = {
  ebookcult: {
    slug: "ebookcult",
    nome: "Ebook Cult",
    adAccountId: "act_000000000000000",
    pageId: "000000000000000",
    instagramId: "00000000000000000",
    defaults: {
      pais: ["BR"],
      idadeMin: 25,
      idadeMax: 55,
      dailyBudgetReais: 50,
    },
  },
  "casa-itacaiu": {
    slug: "casa-itacaiu",
    nome: "Casa de Temporada Itacaiu",
    adAccountId: "act_999118979251387", // conta criada no Business (Giselle Wagner)
    pageId: "106055645693895", // Pagina FB: Dicas da Giselle Wagner
    instagramId: "17841456611015569", // Instagram: @gisellewagnerofc
    defaults: {
      pais: ["BR"],
      idadeMin: 28,
      idadeMax: 60,
      dailyBudgetReais: 30,
    },
  },
  // adicione novos clientes aqui
};

export function getCliente(slug: string): ClienteConfig {
  const cliente = CLIENTES[slug];
  if (!cliente) {
    const disponiveis = Object.keys(CLIENTES).join(", ");
    throw new Error(`Cliente "${slug}" nao encontrado. Disponiveis: ${disponiveis}`);
  }
  return cliente;
}
