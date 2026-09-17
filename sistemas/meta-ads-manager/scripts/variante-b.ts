// Adiciona uma VARIANTE B (anuncio de imagem unica) ao conjunto que ja existe,
// para testar contra o carrossel (Variante A). Mesmo texto, link e publico.
// Uso: bun run scripts/variante-b.ts

import brief from "../campanhas/casa-itacaiu.ts";
import { enviarImagem } from "../src/lib/images.ts";
import { criarCreative } from "../src/lib/creatives.ts";
import { criarAd } from "../src/lib/ads.ts";

const SLUG = "casa-itacaiu";
const ADSET = "120249638732410123"; // conjunto da campanha Casa Itacaiu
const IMAGEM = "C:/Users/User/Pictures/itacaiu/itacaiu2024 (10).jpg";

const hash = await enviarImagem(SLUG, IMAGEM);
console.log(`Imagem da Variante B enviada (${hash.slice(0, 12)}...)`);

const creativeId = await criarCreative(SLUG, {
  nome: "Casa Itacaiu - Variante B - creative",
  mensagem: brief.anuncio.mensagem,
  link: brief.anuncio.link,
  imageHash: hash,
  chamada: brief.anuncio.chamada,
});
console.log(`Criativo B criado: ${creativeId}`);

const adId = await criarAd(SLUG, {
  nome: "Casa Itacaiu - Variante B (imagem unica)",
  adSetId: ADSET,
  creativeId,
});
console.log(`Anuncio B criado (PAUSED): ${adId}`);
