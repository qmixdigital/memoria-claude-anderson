// Cliente HTTP para a REST API do WordPress, com Basic Auth (senha de aplicativo).
import type { Credencial } from "../vault/sites.ts";

// Alguns portais estao atras de Cloudflare e desafiam requisicoes sem
// User-Agent de navegador. Mandamos um UA realista em tudo.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export class WpError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "WpError";
  }
}

function authHeader(cred: Credencial): string {
  const raw = `${cred.usuario}:${cred.senha}`;
  return "Basic " + Buffer.from(raw, "utf8").toString("base64");
}

function base(cred: Credencial): string {
  return `${cred.url}/wp-json/wp/v2`;
}

async function parseErro(res: Response): Promise<never> {
  let code: string | undefined;
  let msg = "";
  let data: Record<string, unknown> | undefined;
  try {
    const j = (await res.json()) as { code?: string; message?: string; data?: Record<string, unknown> };
    code = j.code;
    msg = j.message ?? "";
    data = j.data;
  } catch {
    msg = (await res.text().catch(() => "")).slice(0, 200);
  }
  const dica =
    res.status === 401
      ? " Verifique o usuario e a senha de aplicativo do site."
      : res.status === 403
        ? " O usuario nao tem permissao para esta acao neste site."
        : "";
  throw new WpError(
    `Site respondeu ${res.status}${msg ? ": " + msg : ""}.${dica}`,
    res.status,
    code,
    data,
  );
}

export async function wpGet<T>(cred: Credencial, path: string): Promise<T> {
  const res = await fetch(`${base(cred)}${path}`, {
    headers: { Authorization: authHeader(cred), "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) return parseErro(res);
  return (await res.json()) as T;
}

export async function wpPostJson<T>(cred: Credencial, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${base(cred)}${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(cred),
      "User-Agent": UA,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return parseErro(res);
  return (await res.json()) as T;
}

export async function wpPostBinary<T>(
  cred: Credencial,
  path: string,
  bytes: Uint8Array,
  contentType: string,
  filename: string,
): Promise<T> {
  const res = await fetch(`${base(cred)}${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(cred),
      "User-Agent": UA,
      Accept: "application/json",
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
    body: bytes as unknown as BodyInit,
  });
  if (!res.ok) return parseErro(res);
  return (await res.json()) as T;
}

export { authHeader, base, UA };
