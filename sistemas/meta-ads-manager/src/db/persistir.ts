// Salva a estrutura criada no banco (opcional).
// So e chamado quando existe DATABASE_URL no .env. Sem banco, o sistema
// ainda cria as campanhas na Meta normalmente; so nao guarda historico local.

import { db } from "./client.ts";
import type { CampanhaBrief, ClienteConfig } from "../config/types.ts";

export async function salvarCampanha(params: {
  cliente: ClienteConfig;
  brief: CampanhaBrief;
  nomeAdSet: string;
  campaignId: string;
  adSetId: string;
  creativeId: string;
  adId: string;
}): Promise<void> {
  const { cliente, brief, nomeAdSet, campaignId, adSetId, creativeId, adId } =
    params;

  const registroCliente = await db.cliente.upsert({
    where: { slug: cliente.slug },
    update: {},
    create: {
      slug: cliente.slug,
      nome: cliente.nome,
      adAccountId: cliente.adAccountId,
      pageId: cliente.pageId,
      instagramId: cliente.instagramId,
    },
  });

  const campanha = await db.campanha.create({
    data: {
      metaId: campaignId,
      nome: brief.nomeCampanha,
      objetivo: brief.objetivo,
      clienteId: registroCliente.id,
    },
  });

  const adSet = await db.adSet.create({
    data: {
      metaId: adSetId,
      nome: nomeAdSet,
      dailyBudget: brief.orcamentoDiarioReais * 100,
      campanhaId: campanha.id,
    },
  });

  const creative = await db.creative.create({
    data: {
      metaId: creativeId,
      nome: `${brief.anuncio.nome} - creative`,
      clienteId: registroCliente.id,
    },
  });

  await db.ad.create({
    data: {
      metaId: adId,
      nome: brief.anuncio.nome,
      adSetId: adSet.id,
      creativeId: creative.id,
    },
  });

  await db.$disconnect();
}
