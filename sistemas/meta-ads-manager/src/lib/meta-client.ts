// Wrapper base da Graph API da Meta.
// Centraliza versao, token, montagem de URL e tratamento de erro.

const TOKEN = process.env.META_ACCESS_TOKEN;
const VERSION = process.env.META_API_VERSION ?? "v23.0";
const BASE = `https://graph.facebook.com/${VERSION}`;

if (!TOKEN) {
  throw new Error("META_ACCESS_TOKEN nao definido no .env");
}

interface MetaError {
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    error_user_title?: string;
    error_user_msg?: string;
    fbtrace_id?: string;
  };
}

async function handle<T>(res: Response): Promise<T> {
  const json = (await res.json()) as T & MetaError;
  if (!res.ok || json.error) {
    const e = json.error;
    // error_user_msg costuma explicar o problema em linguagem clara
    const detalhe = e?.error_user_msg
      ? ` — ${e.error_user_title ?? ""}: ${e.error_user_msg}`
      : "";
    throw new Error(
      `Meta API erro ${e?.code ?? res.status}` +
        (e?.error_subcode ? `/${e.error_subcode}` : "") +
        `: ${e?.message ?? "desconhecido"}${detalhe}` +
        (e?.fbtrace_id ? ` (trace ${e.fbtrace_id})` : "")
    );
  }
  return json;
}

// POST de criacao. Path relativo, ex: "act_123/campaigns"
export async function metaPost<T>(
  path: string,
  params: Record<string, unknown>
): Promise<T> {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    body.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  body.append("access_token", TOKEN as string);

  const res = await fetch(`${BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return handle<T>(res);
}

// GET de leitura. fields e params extras viram query string.
export async function metaGet<T>(
  path: string,
  query: Record<string, string> = {}
): Promise<T> {
  const qs = new URLSearchParams({ ...query, access_token: TOKEN as string });
  const res = await fetch(`${BASE}/${path}?${qs.toString()}`);
  return handle<T>(res);
}

// Upload de arquivo (multipart). Usado para enviar imagem ao ad account.
// Diferente do metaPost porque imagem precisa ir como form-data binario.
export async function metaUpload<T>(
  path: string,
  form: FormData
): Promise<T> {
  form.append("access_token", TOKEN as string);
  const res = await fetch(`${BASE}/${path}`, { method: "POST", body: form });
  return handle<T>(res);
}

// Converte reais em centavos, que e a unidade que a Meta espera no budget.
export function reaisParaCentavos(reais: number): number {
  return Math.round(reais * 100);
}

export function centavosParaReais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
