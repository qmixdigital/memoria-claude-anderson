// Cria a campanha de VIDEO da casa de Itacaiu (Reels/Stories/Feed).
// Sobe capa + video, espera processar, e monta campanha->conjunto->criativo->anuncio.
// Uso: bun run scripts/criar-video.ts

import { criarCampanha } from "../src/lib/campaigns.ts";
import { criarAdSet } from "../src/lib/adsets.ts";
import { enviarImagem } from "../src/lib/images.ts";
import { enviarVideo, aguardarVideoPronto } from "../src/lib/videos.ts";
import { criarCreativeVideo } from "../src/lib/creatives.ts";
import { criarAd } from "../src/lib/ads.ts";
import { getCliente } from "../src/config/clientes.ts";

const SLUG = "casa-itacaiu";
const VIDEO = "D:/SISTEMAS/meta-ads-manager/videos/casa-itacaiu-hook-peixe.mp4";
const THUMB = "D:/SISTEMAS/meta-ads-manager/videos/casa-itacaiu-hook-peixe-thumb.jpg";
const LINK = "https://qmiximoveis.com.br/casa-aluguel-itacaiu/";
const NOME_CAMPANHA = "Casa Itacaiu - Video Reels";

const cliente = getCliente(SLUG);
console.log(`Cliente: ${cliente.nome} (${cliente.adAccountId})\n`);

// 1. Capa (thumbnail) -> image_hash
const imageHash = await enviarImagem(SLUG, THUMB);
console.log(`1/6 Capa enviada (${imageHash.slice(0, 12)}...)`);

// 2. Video -> video_id
const videoId = await enviarVideo(SLUG, VIDEO);
console.log(`2/6 Video enviado (id: ${videoId})`);

// 3. Espera a Meta processar o video
console.log("3/6 Aguardando a Meta processar o video...");
await aguardarVideoPronto(videoId);
console.log("    video PRONTO.");

// 4. Campanha
const campaignId = await criarCampanha(cliente.adAccountId, {
  nome: NOME_CAMPANHA,
  objetivo: "OUTCOME_TRAFFIC",
});
console.log(`4/6 Campanha criada (PAUSED): ${campaignId}`);

// 5. Conjunto com placements de video vertical (Reels + Stories + Feed)
const adSetId = await criarAdSet(SLUG, {
  nome: `${NOME_CAMPANHA} - Reels/Stories`,
  campaignId,
  dailyBudgetReais: 30,
  optimizationGoal: "LINK_CLICKS",
  instagramPositions: ["reels", "story", "stream"],
});
console.log(`5/6 Conjunto criado (PAUSED): ${adSetId}`);

// 6. Criativo de video + anuncio
const creativeId = await criarCreativeVideo(SLUG, {
  nome: "Casa Itacaiu - Video (hook peixe) - creative",
  mensagem:
    "🎣 Do rio direto para a sua temporada em Itacaiú! " +
    "Casa completa a 700m do porto, com piscina, churrasqueira e espaço para até 15 pessoas. " +
    "A partir de R$ 990/diária. Veja tudo e garanta as suas datas. 👇",
  link: LINK,
  videoId,
  imageHash,
  chamada: "LEARN_MORE", // botao "Saiba mais" (bate com a fala do video)
  titulo: "Casa de Temporada em Itacaiú",
});
console.log(`6/6 Criativo de video criado: ${creativeId}`);

const adId = await criarAd(SLUG, {
  nome: "Casa Itacaiu - Video (hook peixe)",
  adSetId,
  creativeId,
});
console.log(`     Anuncio criado (PAUSED): ${adId}\n`);

console.log("Campanha de video montada. Tudo PAUSED.");
console.log(`campaignId=${campaignId}`);
console.log(`adSetId=${adSetId}`);
console.log(`adId=${adId}`);
