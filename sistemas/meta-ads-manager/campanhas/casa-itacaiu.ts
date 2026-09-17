// Campanha: aluguel da casa de temporada em Itacaiu (beira do Rio Araguaia).
// Anuncio em CARROSSEL apontando para a pagina propria (qmiximoveis.com.br).
// Rode com: bun run criar campanhas/casa-itacaiu.ts

import type { CampanhaBrief } from "../src/config/types.ts";

const LINK = "https://qmiximoveis.com.br/casa-aluguel-itacaiu/";

const brief: CampanhaBrief = {
  cliente: "casa-itacaiu",
  nomeCampanha: "Casa Itacaiu - Rio Araguaia",
  objetivo: "OUTCOME_TRAFFIC",
  optimizationGoal: "LINK_CLICKS",
  orcamentoDiarioReais: 30,
  // Carrossel de fotos horizontais fica bonito no FEED e no EXPLORAR.
  // Stories/Reels sao verticais e deixariam tarja preta na foto horizontal.
  instagramPositions: ["stream", "explore"],
  anuncio: {
    nome: "Casa Itacaiu - Carrossel",
    mensagem:
      "🌊 Casa de temporada à beira do Rio Araguaia, em Itacaiú! " +
      "A 700m do Porto, acomoda até 15 pessoas com muito conforto. 🏡\n\n" +
      "São 4 quartos (2 suítes) com ar-condicionado, piscina, deck, ducha e um " +
      "quintal verde perfeito para a família. Tem até gerador de energia, e o seu " +
      "pet é bem-vindo! 🐾\n\nVeja as fotos e garanta as suas datas. 👇",
    link: LINK,
    chamada: "BOOK_NOW", // botao "Reservar"
    cartoes: [
      {
        imagem: "C:/Users/User/Pictures/itacaiu/itacaiu_2026 (11).jpeg",
        titulo: "Casa completa em Itacaiú",
        descricao: "A 700m do Porto • até 15 pessoas",
      },
      {
        imagem: "C:/Users/User/Pictures/itacaiu/itacaiu2024 (30).jpg",
        titulo: "Piscina e área de lazer",
        descricao: "Deck, ducha e quintal verde",
      },
      {
        imagem: "C:/Users/User/Pictures/itacaiu/itacaiu2024 (5).jpg",
        titulo: "Varanda à beira do Araguaia",
        descricao: "Espaço para a família relaxar",
      },
      {
        imagem: "C:/Users/User/Pictures/itacaiu/itacaiu (15).jpeg",
        titulo: "4 quartos, 2 suítes",
        descricao: "Ar-condicionado em todos",
      },
      {
        imagem: "C:/Users/User/Pictures/itacaiu/itacaiu_2026 (3).jpeg",
        titulo: "Reserve as suas datas",
        descricao: "Conforto e tranquilidade",
      },
    ],
  },
};

export default brief;
