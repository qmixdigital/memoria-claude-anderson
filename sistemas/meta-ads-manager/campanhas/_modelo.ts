// MODELO de ficha de campanha. Copie este arquivo, renomeie e preencha.
// Depois rode: bun run criar campanhas/seu-arquivo.ts

import type { CampanhaBrief } from "../src/config/types.ts";

const brief: CampanhaBrief = {
  cliente: "slug-do-cliente", // precisa existir em src/config/clientes.ts
  nomeCampanha: "Nome da Campanha",
  objetivo: "OUTCOME_TRAFFIC", // levar gente para um site/WhatsApp
  optimizationGoal: "LINK_CLICKS",
  orcamentoDiarioReais: 30, // quanto gastar por dia, em reais
  instagramPositions: ["stream", "reels"], // feed + reels
  anuncio: {
    nome: "Anuncio 1",
    imagem: "C:/caminho/para/sua-imagem.jpg",
    mensagem: "Texto que aparece no anuncio.",
    link: "https://seu-link-de-destino",
    chamada: "LEARN_MORE", // texto do botao
  },
};

export default brief;
