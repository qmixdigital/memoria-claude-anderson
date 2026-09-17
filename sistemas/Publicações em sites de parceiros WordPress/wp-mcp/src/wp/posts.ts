// Criacao e atualizacao de posts.
import type { Credencial } from "../vault/sites.ts";
import { wpGet, wpPostJson } from "./client.ts";
import { resolverTags } from "./taxonomies.ts";

export type StatusPost = "draft" | "pending" | "publish" | "future";

export interface PostResultado {
  post_id: number;
  link: string;
  status: string;
  link_edicao: string;
}

export interface CriarPostEntrada {
  titulo: string;
  conteudo_html: string;
  resumo?: string;
  slug?: string;
  categorias?: number[];
  tags?: string[];
  imagem_destaque_id?: number;
  status?: StatusPost;
  agendar_para?: string; // ISO 8601 (fuso do publicador; convertemos para GMT)
}

interface PostResp {
  id: number;
  link: string;
  status: string;
}

function linkEdicao(cred: Credencial, id: number): string {
  return `${cred.url}/wp-admin/post.php?post=${id}&action=edit`;
}

async function montarCorpo(
  cred: Credencial,
  e: Partial<CriarPostEntrada>,
): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = {};
  if (e.titulo !== undefined) body.title = e.titulo;
  if (e.conteudo_html !== undefined) body.content = e.conteudo_html;
  if (e.resumo !== undefined) body.excerpt = e.resumo;
  if (e.slug !== undefined) body.slug = e.slug;
  if (e.categorias !== undefined) body.categories = e.categorias;
  if (e.imagem_destaque_id !== undefined) body.featured_media = e.imagem_destaque_id;

  // tags: [] limpa as tags do post (regra do Jean, 17/09/2026: os sites dele nao usam tag)
  if (e.tags !== undefined) {
    body.tags = e.tags.length > 0 ? await resolverTags(cred, e.tags) : [];
  }

  if (e.agendar_para) {
    // date_gmt evita erro de fuso entre portais.
    const d = new Date(e.agendar_para);
    if (Number.isNaN(d.getTime())) {
      throw new Error(`Data de agendamento invalida: ${e.agendar_para}`);
    }
    body.date_gmt = d.toISOString().replace(/\.\d{3}Z$/, "");
    body.status = "future";
  } else if (e.status !== undefined) {
    body.status = e.status;
  }

  return body;
}

export async function criarPost(cred: Credencial, e: CriarPostEntrada): Promise<PostResultado> {
  const body = await montarCorpo(cred, e);
  if (body.status === undefined) body.status = "draft";
  const r = await wpPostJson<PostResp>(cred, "/posts", body);
  return { post_id: r.id, link: r.link, status: r.status, link_edicao: linkEdicao(cred, r.id) };
}

export async function atualizarPost(
  cred: Credencial,
  postId: number,
  e: Partial<CriarPostEntrada>,
): Promise<PostResultado> {
  const body = await montarCorpo(cred, e);
  const r = await wpPostJson<PostResp>(cred, `/posts/${postId}`, body);
  return { post_id: r.id, link: r.link, status: r.status, link_edicao: linkEdicao(cred, r.id) };
}

// Verifica se um post ainda existe e em que status (util para relatorio de links).
export async function verificarPost(
  cred: Credencial,
  postId: number,
): Promise<{ existe: boolean; status?: string; link?: string }> {
  try {
    const r = await wpGet<PostResp>(cred, `/posts/${postId}?_fields=id,link,status`);
    return { existe: true, status: r.status, link: r.link };
  } catch {
    return { existe: false };
  }
}
