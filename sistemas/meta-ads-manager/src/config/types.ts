// Tipos compartilhados do dominio Meta Marketing API

export type Objetivo =
  | "OUTCOME_TRAFFIC"
  | "OUTCOME_LEADS"
  | "OUTCOME_SALES"
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_AWARENESS"
  | "OUTCOME_APP_PROMOTION";

export type OptimizationGoal =
  | "LINK_CLICKS"
  | "LANDING_PAGE_VIEWS"
  | "OFFSITE_CONVERSIONS"
  | "REACH"
  | "IMPRESSIONS"
  | "LEAD_GENERATION";

export type Status = "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";

export type InstagramPosition =
  | "stream"
  | "story"
  | "reels"
  | "explore"
  | "ig_search";

export interface ClienteConfig {
  slug: string;
  nome: string;
  adAccountId: string; // formato act_123456789
  pageId: string;
  instagramId: string;
  // defaults aplicados quando o script nao especifica
  defaults: {
    pais: string[];
    idadeMin: number;
    idadeMax: number;
    dailyBudgetReais: number;
  };
}

export interface CriarCampanhaInput {
  nome: string;
  objetivo: Objetivo;
}

export interface CriarAdSetInput {
  nome: string;
  campaignId: string;
  dailyBudgetReais: number;
  optimizationGoal: OptimizationGoal;
  instagramPositions?: InstagramPosition[];
}

// "Ficha" de uma campanha completa: descreve tudo o que o sistema precisa
// para criar campanha + conjunto + criativo + anuncio de uma vez so.
// Voce preenche um arquivo destes e roda: bun run criar <arquivo>
export interface CampanhaBrief {
  cliente: string; // slug do cliente em clientes.ts
  nomeCampanha: string;
  objetivo: Objetivo;
  optimizationGoal: OptimizationGoal;
  orcamentoDiarioReais: number;
  instagramPositions?: InstagramPosition[];
  anuncio: {
    nome: string;
    // Foto unica: use "imagem". Carrossel: use "cartoes" (2+ fotos).
    imagem?: string; // caminho do arquivo de imagem no seu computador
    cartoes?: CartaoCarrossel[]; // carrossel: varias fotos que deslizam
    mensagem: string; // texto que aparece no anuncio
    link: string; // para onde o clique leva (site, reserva, WhatsApp)
    chamada?: string; // texto do botao (CTA). ex: LEARN_MORE, BOOK_NOW
  };
}

// Um card do carrossel (uma foto com titulo e descricao proprios).
export interface CartaoCarrossel {
  imagem: string; // caminho do arquivo no computador
  titulo?: string; // titulo curto do card
  descricao?: string; // descricao curta abaixo do titulo
  link?: string; // destino proprio do card (opcional; usa o link do anuncio)
}
