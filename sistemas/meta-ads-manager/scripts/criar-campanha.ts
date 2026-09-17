// Cria uma estrutura completa de campanha para um cliente.
// Uso: bun run scripts/criar-campanha.ts <slug-cliente> "<nome>"
//
// Cria campaign, ad set e persiste os IDs no banco.
// Tudo nasce PAUSED. Voce revisa no Ads Manager e ativa quando quiser.

import { getCliente } from "../src/config/clientes.ts";
import { criarCampanha } from "../src/lib/campaigns.ts";
import { criarAdSet } from "../src/lib/adsets.ts";
import { db } from "../src/db/client.ts";

const slug = process.argv[2];
const nome = process.argv[3];

if (!slug || !nome) {
  console.error('Uso: bun run scripts/criar-campanha.ts <slug-cliente> "<nome>"');
  process.exit(1);
}

const cliente = getCliente(slug);
console.log(`Cliente: ${cliente.nome} (${cliente.adAccountId})`);

// 1. Campanha
const campaignId = await criarCampanha(cliente.adAccountId, {
  nome,
  objetivo: "OUTCOME_TRAFFIC",
});
console.log(`Campanha criada (PAUSED): ${campaignId}`);

// 2. Ad set com Instagram feed + reels
const adSetId = await criarAdSet(slug, {
  nome: `${nome} - IG Feed/Reels`,
  campaignId,
  dailyBudgetReais: cliente.defaults.dailyBudgetReais,
  optimizationGoal: "LINK_CLICKS",
  instagramPositions: ["stream", "reels"],
});
console.log(`Ad set criado (PAUSED): ${adSetId}`);

// 3. Persiste no banco para gestao por projeto
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
    nome,
    objetivo: "OUTCOME_TRAFFIC",
    clienteId: registroCliente.id,
  },
});

await db.adSet.create({
  data: {
    metaId: adSetId,
    nome: `${nome} - IG Feed/Reels`,
    dailyBudget: cliente.defaults.dailyBudgetReais * 100,
    campanhaId: campanha.id,
  },
});

console.log("\nEstrutura salva no banco.");
console.log("Proximo passo: enviar a imagem, criar o creative e o ad.");
console.log("Revise no Ads Manager antes de ativar.");

await db.$disconnect();
