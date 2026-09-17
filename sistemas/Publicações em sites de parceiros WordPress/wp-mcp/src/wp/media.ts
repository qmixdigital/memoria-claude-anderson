// Upload de imagem para a biblioteca de midia do portal.
import type { Credencial } from "../vault/sites.ts";
import { wpPostBinary, wpPostJson, UA, WpError } from "./client.ts";
import { config } from "../config.ts";

const TIPOS_OK: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export interface MidiaResultado {
  media_id: number;
  url_final: string;
}

function extPorTipo(ct: string): string {
  return TIPOS_OK[ct.toLowerCase()] ?? "jpg";
}

function slugArquivo(nome: string, ext: string): string {
  const base = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const stem = base || "imagem";
  return `${stem}.${ext}`;
}

// Baixa a imagem de uma URL publica, valida tipo e tamanho.
export async function baixarImagem(
  url: string,
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    throw new WpError(`Nao consegui baixar a imagem (${res.status}) de ${url}`, res.status);
  }
  const ct = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!TIPOS_OK[ct]) {
    throw new WpError(
      `Tipo de imagem nao suportado: ${ct || "desconhecido"}. Use JPG, PNG, WebP ou GIF.`,
      415,
    );
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  const maxBytes = config.imageMaxMb * 1024 * 1024;
  if (buf.byteLength > maxBytes) {
    throw new WpError(
      `Imagem grande demais: ${(buf.byteLength / 1024 / 1024).toFixed(1)} MB (limite ${config.imageMaxMb} MB).`,
      413,
    );
  }
  return { bytes: buf, contentType: ct };
}

interface MediaResp {
  id: number;
  source_url: string;
}

export async function subirImagem(
  cred: Credencial,
  opts: {
    url_imagem: string;
    nome_arquivo?: string;
    alt?: string;
    legenda?: string;
  },
): Promise<MidiaResultado> {
  const { bytes, contentType } = await baixarImagem(opts.url_imagem);
  const ext = extPorTipo(contentType);
  const filename = slugArquivo(opts.nome_arquivo ?? "imagem", ext);

  const media = await wpPostBinary<MediaResp>(cred, "/media", bytes, contentType, filename);

  // Define alt e legenda em uma segunda chamada (o upload binario nao aceita esses campos).
  if (opts.alt || opts.legenda) {
    await wpPostJson<MediaResp>(cred, `/media/${media.id}`, {
      alt_text: opts.alt ?? "",
      caption: opts.legenda ?? "",
    });
  }

  return { media_id: media.id, url_final: media.source_url };
}
