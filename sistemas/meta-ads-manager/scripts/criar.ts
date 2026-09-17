// Cria uma campanha COMPLETA a partir de uma "ficha" (brief).
// Faz, em ordem: campanha -> conjunto de anuncios -> upload da imagem ->
// criativo -> anuncio. Tudo nasce PAUSED. Salva todos os IDs no banco.
//
// Uso: bun run criar campanhas/<arquivo>.ts
//
// O arquivo da ficha deve exportar default um CampanhaBrief.
// Veja o modelo em campanhas/_modelo.ts

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getCliente } from "../src/config/clientes.ts";
import { criarCampanha } from "../src/lib/campaigns.ts";
import { criarAdSet } from "../src/lib/adsets.ts";
import { enviarImagem } from "../src/lib/images.ts";
import { criarCreative, criarCreativeCarrossel } from "../src/lib/creatives.ts";
import { criarAd } from "../src/lib/ads.ts";
import type { CampanhaBrief } from "../src/config/types.ts";

const arquivo = process.argv[2];
if (!arquivo) {
  console.error("Uso: bun run criar campanhas/<arquivo>.ts");
  process.exit(1);
}

// importa a ficha que o usuario escreveu
const mod = await import(pathToFileURL(resolve(arquivo)).href);
const brief: CampanhaBrief = mod.default;
if (!brief?.cliente || !brief.anuncio) {
  console.error(`Ficha invalida em ${arquivo}. Falta "cliente" ou "anuncio".`);
  process.exit(1);
}

const cliente = getCliente(brief.cliente);
console.log(`Cliente: ${cliente.nome} (${cliente.adAccountId})`);
console.log(`Campanha: ${brief.nomeCampanha}\n`);

// 1. Campanha
const campaignId = await criarCampanha(cliente.adAccountId, {
  nome: brief.nomeCampanha,
  objetivo: brief.objetivo,
});
console.log(`1/5 Campanha criada (PAUSED): ${campaignId}`);

// 2. Conjunto de anuncios (placement Instagram)
const nomeAdSet = `${brief.nomeCampanha} - IG`;
const adSetId = await criarAdSet(brief.cliente, {
  nome: nomeAdSet,
  campaignId,
  dailyBudgetReais: brief.orcamentoDiarioReais,
  optimizationGoal: brief.optimizationGoal,
  instagramPositions: brief.instagramPositions,
});
console.log(`2/5 Conjunto criado (PAUSED): ${adSetId}`);

// 3 e 4. Upload da(s) imagem(ns) e criacao do criativo.
// Se a ficha tem "cartoes" (2+), monta carrossel; senao, foto unica.
const cartoes = brief.anuncio.cartoes ?? [];
let creativeId: string;

if (cartoes.length >= 2) {
  const cards = [];
  for (let i = 0; i < cartoes.length; i++) {
    const c = cartoes[i]!;
    const hash = await enviarImagem(brief.cliente, c.imagem);
    console.log(`3/5 Foto ${i + 1}/${cartoes.length} enviada (${hash.slice(0, 12)}...)`);
    cards.push({ imageHash: hash, titulo: c.titulo, descricao: c.descricao, link: c.link });
  }
  creativeId = await criarCreativeCarrossel(brief.cliente, {
    nome: `${brief.anuncio.nome} - creative`,
    mensagem: brief.anuncio.mensagem,
    link: brief.anuncio.link,
    cartoes: cards,
    chamada: brief.anuncio.chamada,
  });
  console.log(`4/5 Criativo (carrossel, ${cards.length} fotos) criado: ${creativeId}`);
} else if (brief.anuncio.imagem) {
  const imageHash = await enviarImagem(brief.cliente, brief.anuncio.imagem);
  console.log(`3/5 Imagem enviada (hash: ${imageHash.slice(0, 12)}...)`);
  creativeId = await criarCreative(brief.cliente, {
    nome: `${brief.anuncio.nome} - creative`,
    mensagem: brief.anuncio.mensagem,
    link: brief.anuncio.link,
    imageHash,
    chamada: brief.anuncio.chamada,
  });
  console.log(`4/5 Criativo criado: ${creativeId}`);
} else {
  throw new Error('A ficha precisa de "imagem" (foto unica) ou "cartoes" (carrossel).');
}

// 5. Anuncio (liga conjunto + criativo)
const adId = await criarAd(brief.cliente, {
  nome: brief.anuncio.nome,
  adSetId,
  creativeId,
});
console.log(`5/5 Anuncio criado (PAUSED): ${adId}\n`);

// --- Persiste no banco SO se houver DATABASE_URL (passo opcional) ---
if (process.env.DATABASE_URL) {
  const { salvarCampanha } = await import("../src/db/persistir.ts");
  await salvarCampanha({
    cliente,
    brief,
    nomeAdSet,
    campaignId,
    adSetId,
    creativeId,
    adId,
  });
  console.log("Estrutura completa salva no banco.");
} else {
  console.log("Sem DATABASE_URL no .env: pulei salvar no banco (opcional).");
}

console.log("Tudo esta PAUSED. Revise no Gerenciador de Anuncios e ative quando quiser.");
