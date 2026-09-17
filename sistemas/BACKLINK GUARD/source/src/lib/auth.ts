// Autenticação simples por senha compartilhada (ferramenta interna).
// Sessão = cookie httpOnly com um token HMAC. Funciona no Edge (middleware)
// e no Node (server actions) usando Web Crypto — sem dependências.

export const SESSION_COOKIE = "bg_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

function secret(): string {
  return process.env.APP_SESSION_SECRET || "<<REMOVIDO>>";
}

export function appPassword(): string {
  return process.env.APP_PASSWORD || "";
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(sig));
}

/** Comparação de strings em tempo constante (evita timing attack). */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface Sessao {
  userId: string;
  /** "admin" | "auxiliar" */
  role: string;
  name: string;
}

/**
 * Token de sessão assinado e com validade: `v3.<userId>.<role>.<nome>.<exp>.<hmac>`.
 *
 * Guarda QUEM é, não só "está autenticado" — o proxy roda no Edge e não pode
 * consultar o banco a cada requisição, então a identidade viaja no token. Como
 * ele é assinado com HMAC, o conteúdo não pode ser adulterado pelo navegador.
 *
 * Consequência a lembrar: trocar o papel de alguém só passa a valer no próximo
 * login. E trocar o APP_SESSION_SECRET derruba todas as sessões de uma vez.
 */
export async function issueToken(s: Sessao): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = [
    "v3",
    encodeURIComponent(s.userId),
    encodeURIComponent(s.role),
    encodeURIComponent(s.name),
    String(exp),
  ].join(".");
  return `${payload}.${await hmac(payload)}`;
}

/** Valida a assinatura e a validade; devolve a sessão ou null. */
export async function readToken(token: string | undefined): Promise<Sessao | null> {
  if (!token) return null;
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);

  const partes = payload.split(".");
  if (partes.length !== 5 || partes[0] !== "v3") return null; // rejeita v2/legado

  const exp = Number(partes[4]);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null; // expirado
  if (!timingSafeEqual(sig, await hmac(payload))) return null;

  return {
    userId: decodeURIComponent(partes[1]),
    role: decodeURIComponent(partes[2]),
    name: decodeURIComponent(partes[3]),
  };
}

export async function isValidToken(token: string | undefined): Promise<boolean> {
  return (await readToken(token)) !== null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
