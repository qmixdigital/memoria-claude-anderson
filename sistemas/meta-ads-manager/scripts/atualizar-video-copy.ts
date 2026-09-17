// Refaz o criativo/anuncio de video com o texto que enquadra o preco
// ("R$ 990 para ate 15 pessoas / menos de R$ 66 por pessoa"), sem re-subir o video.
// Uso: bun run scripts/atualizar-video-copy.ts

import { enviarImagem } from "../src/lib/images.ts";
import { criarCreativeVideo } from "../src/lib/creatives.ts";
import { criarAd } from "../src/lib/ads.ts";

const SLUG = "casa-itacaiu";
const THUMB = "D:/SISTEMAS/meta-ads-manager/videos/casa-itacaiu-hook-peixe-thumb.jpg";
const VIDEO_ID = "2215751905930770"; // video ja enviado
const ADSET = "120250136621770123";
const LINK = "https://qmiximoveis.com.br/casa-aluguel-itacaiu/";

const imageHash = await enviarImagem(SLUG, THUMB); // mesmo hash (Meta deduplica)
console.log(`Capa: ${imageHash.slice(0, 12)}...`);

const creativeId = await criarCreativeVideo(SLUG, {
  nome: "Casa Itacaiu - Video v2 (valor por pessoa) - creative",
  mensagem:
    "🎣 Do rio direto para a sua temporada em Itacaiú! A 700m do porto, com piscina e churrasqueira. " +
    "A casa INTEIRA para até 15 pessoas: R$ 990 a diária — dá menos de R$ 66 por pessoa! 👇 " +
    "Garanta as suas datas.",
  link: LINK,
  videoId: VIDEO_ID,
  imageHash,
  chamada: "LEARN_MORE",
  titulo: "Casa em Itacaiú — até 15 pessoas",
});
console.log(`Novo criativo: ${creativeId}`);

const adId = await criarAd(SLUG, {
  nome: "Casa Itacaiu - Video v2 (valor por pessoa)",
  adSetId: ADSET,
  creativeId,
});
console.log(`Novo anuncio (PAUSED): ${adId}`);
