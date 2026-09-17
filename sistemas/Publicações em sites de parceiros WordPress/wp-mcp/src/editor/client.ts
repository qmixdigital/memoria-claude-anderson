// Cliente da API do editor (editor.qmix.com.br/api). E por ela que um parceiro
// como o Jean manda artigos para a fila do sistema Antonio sem abrir o painel:
// a API grava o artigo como aprovado e a cron de transferencia publica no
// site, seja WordPress ou portal-engine. Cada usuario OAuth do conector que
// tiver chave em EDITOR_API_USERS enxerga estas ferramentas em vez das de
// WordPress direto.

const BASE = (process.env.EDITOR_API_URL ?? "https://editor.qmix.com.br/api").replace(/\/$/, "");

// Cloudflare desafia requisicoes sem User-Agent de navegador.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// EDITOR_API_USERS=jean:chave1,outro:chave2  (usuario OAuth -> chave da API)
export function chaveDoEditor(usuarioOAuth?: string): string | undefined {
  if (!usuarioOAuth) return undefined;
  for (const par of (process.env.EDITOR_API_USERS ?? "").split(",")) {
    const i = par.indexOf(":");
    if (i < 0) continue;
    if (par.slice(0, i).trim() === usuarioOAuth) return par.slice(i + 1).trim() || undefined;
  }
  return undefined;
}

export class EditorApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "EditorApiError";
  }
}

async function chamar<T>(chave: string, metodo: "GET" | "POST", rota: string, corpo?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${rota}`, {
    method: metodo,
    headers: {
      "X-Api-Key": chave,
      "User-Agent": UA,
      Accept: "application/json",
      ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    signal: AbortSignal.timeout(90_000),
  });
  const texto = await res.text();
  let j: any;
  try {
    j = JSON.parse(texto);
  } catch {
    // HTML do Cloudflare ou erro do PHP: devolve so o comeco, sem lixo.
    throw new EditorApiError(`Resposta inesperada da API (HTTP ${res.status}): ${texto.slice(0, 160)}`, res.status);
  }
  if (!res.ok || j?.ok === false) {
    throw new EditorApiError(j?.erro ?? `HTTP ${res.status}`, res.status);
  }
  return j as T;
}

export interface Dominio { dominio: string; url: string; autor: string }
export interface Categoria { id: number; nome: string }
export interface Artigo {
  id: number;
  situacao: "na_fila" | "publicando" | "publicado" | "agendado" | "falhou" | "rascunho" | "reprovado";
  titulo: string;
  dominio: string | null;
  url: string | null;
  criado_em: string;
  publicado_em: string | null;
  agendado_para: string | null;
  erro?: string;
}

export const editorApi = {
  quemSou: (chave: string) =>
    chamar<{ editor: { id: number; nome: string }; painel: string }>(chave, "GET", "/eu"),

  dominios: (chave: string) =>
    chamar<{ total: number; dominios: Dominio[] }>(chave, "GET", "/dominios"),

  categorias: (chave: string, dominio: string) =>
    chamar<{ dominio: string; categorias: Categoria[] }>(
      chave, "GET", `/categorias?dominio=${encodeURIComponent(dominio)}`),

  enviarImagem: (chave: string, p: { url?: string; base64?: string; nome?: string }) =>
    chamar<{ imagem_url: string; tamanho_kb: number }>(chave, "POST", "/imagens", p),

  enviarArtigo: (chave: string, p: {
    dominio: string; titulo: string; conteudo_html: string; linha_fina?: string;
    meta_description?: string; categoria_id?: number; imagem_url?: string; agendar_para?: string;
  }) =>
    chamar<{ id: number; situacao: string; dominio: string; previsao: string; consultar: string; painel: string; repetido?: boolean; aviso?: string }>(
      chave, "POST", "/artigos", p),

  artigo: (chave: string, id: number) =>
    chamar<{ artigo: Artigo }>(chave, "GET", `/artigos/${id}`),

  artigos: (chave: string, limite = 20) =>
    chamar<{ artigos: Artigo[] }>(chave, "GET", `/artigos?limite=${limite}`),
};
