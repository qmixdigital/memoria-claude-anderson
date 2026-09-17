import crypto from "node:crypto";
import { readFileSync } from "node:fs";

// Autenticação da conta de serviço do Google (JWT bearer -> access token).
// A chave JSON vem de GOOGLE_SA_JSON (conteúdo) ou GOOGLE_SA_JSON_PATH (arquivo).

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
}

const SCOPES = [
  "https://www.googleapis.com/auth/webmasters",
  "https://www.googleapis.com/auth/siteverification",
].join(" ");

let saCache: ServiceAccount | null = null;
let tokenCache: { token: string; exp: number } | null = null;

export function hasGoogleSa(): boolean {
  return Boolean(process.env.GOOGLE_SA_JSON || process.env.GOOGLE_SA_JSON_PATH);
}

function loadSa(): ServiceAccount {
  if (saCache) return saCache;
  const raw = process.env.GOOGLE_SA_JSON
    ? process.env.GOOGLE_SA_JSON
    : readFileSync(process.env.GOOGLE_SA_JSON_PATH as string, "utf-8");
  saCache = JSON.parse(raw) as ServiceAccount;
  return saCache;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/** Access token OAuth2 da conta de serviço (com cache até ~1 min antes de expirar). */
export async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.exp - 60 > now) return tokenCache.token;

  const sa = loadSa();
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPES,
      aud: sa.token_uri,
      exp: now + 3600,
      iat: now,
    }),
  );
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${signer.sign(sa.private_key).toString("base64url")}`;

  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!json.access_token) {
    throw new Error(
      `Google token falhou: ${json.error ?? res.status} ${json.error_description ?? ""}`,
    );
  }
  tokenCache = { token: json.access_token, exp: now + (json.expires_in ?? 3600) };
  return json.access_token;
}
