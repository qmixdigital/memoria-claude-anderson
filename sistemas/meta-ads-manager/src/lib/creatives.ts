import { metaPost } from "./meta-client.ts";
import { getCliente } from "../config/clientes.ts";

interface CriarResp {
  id: string;
}

export interface CriarCreativeInput {
  nome: string;
  mensagem: string;
  link: string;
  imageHash: string; // hash de imagem ja enviada ao ad account
  chamada?: string; // call to action, ex: LEARN_MORE
}

// Cria o ad creative usando a pagina FB e a conta IG do cliente.
// A conexao instagram_user_id e o que faz o anuncio sair pelo perfil do IG.
export async function criarCreative(
  clienteSlug: string,
  input: CriarCreativeInput
): Promise<string> {
  const cliente = getCliente(clienteSlug);

  const resp = await metaPost<CriarResp>(`${cliente.adAccountId}/adcreatives`, {
    name: input.nome,
    object_story_spec: {
      page_id: cliente.pageId,
      instagram_user_id: cliente.instagramId,
      link_data: {
        message: input.mensagem,
        link: input.link,
        image_hash: input.imageHash,
        call_to_action: {
          type: input.chamada ?? "LEARN_MORE",
          value: { link: input.link },
        },
      },
    },
  });
  return resp.id;
}

export interface CartaoInput {
  imageHash: string; // hash de imagem ja enviada ao ad account
  titulo?: string;
  descricao?: string;
  link?: string; // destino proprio do card; usa o link geral se ausente
}

export interface CriarCreativeCarrosselInput {
  nome: string;
  mensagem: string;
  link: string;
  cartoes: CartaoInput[];
  chamada?: string;
}

export interface CriarCreativeVideoInput {
  nome: string;
  mensagem: string;
  link: string;
  videoId: string;
  imageHash: string; // capa (thumbnail) ja enviada ao ad account
  chamada?: string;
  titulo?: string;
}

// Cria um creative de VIDEO (Reels/Stories/Feed) pela pagina FB e perfil IG.
export async function criarCreativeVideo(
  clienteSlug: string,
  input: CriarCreativeVideoInput
): Promise<string> {
  const cliente = getCliente(clienteSlug);
  const resp = await metaPost<CriarResp>(`${cliente.adAccountId}/adcreatives`, {
    name: input.nome,
    object_story_spec: {
      page_id: cliente.pageId,
      instagram_user_id: cliente.instagramId,
      video_data: {
        video_id: input.videoId,
        image_hash: input.imageHash,
        message: input.mensagem,
        title: input.titulo,
        call_to_action: {
          type: input.chamada ?? "LEARN_MORE",
          value: { link: input.link },
        },
      },
    },
  });
  return resp.id;
}

// Cria um creative de CARROSSEL (varias fotos que deslizam no anuncio).
// Cada card vira um child_attachment com sua propria imagem e botao.
export async function criarCreativeCarrossel(
  clienteSlug: string,
  input: CriarCreativeCarrosselInput
): Promise<string> {
  const cliente = getCliente(clienteSlug);
  const cta = input.chamada ?? "LEARN_MORE";

  const resp = await metaPost<CriarResp>(`${cliente.adAccountId}/adcreatives`, {
    name: input.nome,
    object_story_spec: {
      page_id: cliente.pageId,
      instagram_user_id: cliente.instagramId,
      link_data: {
        message: input.mensagem,
        link: input.link,
        child_attachments: input.cartoes.map((c) => ({
          link: c.link ?? input.link,
          image_hash: c.imageHash,
          name: c.titulo,
          description: c.descricao,
          call_to_action: { type: cta, value: { link: c.link ?? input.link } },
        })),
        multi_share_end_card: false, // sem card final de perfil; so as fotos
        multi_share_optimized: true, // Meta ordena os cards por desempenho
      },
    },
  });
  return resp.id;
}
