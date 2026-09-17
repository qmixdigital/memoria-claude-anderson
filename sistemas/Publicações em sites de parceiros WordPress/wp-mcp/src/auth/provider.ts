// Implementacao minima de OAuth 2.1 (DCR + PKCE) para o claude.ai aceitar o conector.
// Guarda clients, codes e tokens no SQLite. Login por usuario/senha do .env.
import type { Response } from "express";
import { randomBytes, randomUUID } from "node:crypto";
import type { OAuthServerProvider, AuthorizationParams } from
  "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { OAuthRegisteredClientsStore } from
  "@modelcontextprotocol/sdk/server/auth/clients.js";
import type { OAuthClientInformationFull, OAuthTokens } from
  "@modelcontextprotocol/sdk/shared/auth.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { db } from "../db.ts";
import { config } from "../config.ts";

const CODE_TTL_MS = 5 * 60 * 1000; // 5 min
const ACCESS_TTL_S = 30 * 24 * 60 * 60; // 30 dias
const agora = () => Math.floor(Date.now() / 1000);

function novoToken(): string {
  return randomBytes(32).toString("base64url");
}

// ---- validacao de usuario ----
export function validarUsuario(user: string, senha: string): boolean {
  const esperada = config.oauthUsers.get(user);
  if (!esperada) return false;
  // Comparacao em tempo (nao critico aqui, mas evita atalho obvio).
  if (esperada.length !== senha.length) return false;
  let ok = 0;
  for (let i = 0; i < esperada.length; i++) ok |= esperada.charCodeAt(i) ^ senha.charCodeAt(i);
  return ok === 0;
}

// ---- criacao de codigo apos login ----
export function criarCodigoAutorizacao(input: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  userId: string;
  scopes: string[];
  resource?: string;
}): string {
  const code = novoToken();
  db.query(
    `INSERT INTO oauth_codes (code, client_id, redirect_uri, code_challenge, user_id, scopes, resource, expira_em)
     VALUES ($c,$cl,$r,$ch,$u,$s,$res,$e)`,
  ).run({
    $c: code,
    $cl: input.clientId,
    $r: input.redirectUri,
    $ch: input.codeChallenge,
    $u: input.userId,
    $s: input.scopes.join(" "),
    $res: input.resource ?? null,
    $e: Date.now() + CODE_TTL_MS,
  });
  return code;
}

interface CodeRow {
  code: string;
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  user_id: string;
  scopes: string;
  resource: string | null;
  expira_em: number;
}

interface ClientRow {
  client_id: string;
  client_secret: string | null;
  data_json: string;
  criado_em: number;
}

interface TokenRow {
  token: string;
  tipo: string;
  client_id: string;
  user_id: string;
  scopes: string;
  expira_em: number | null;
  criado_em: number;
}

// ---- store de clients (DCR) ----
const clientsStore: OAuthRegisteredClientsStore = {
  getClient(clientId: string): OAuthClientInformationFull | undefined {
    const row = db.query(`SELECT * FROM oauth_clients WHERE client_id = ?`).get(clientId) as
      | ClientRow
      | null;
    if (!row) return undefined;
    return JSON.parse(row.data_json) as OAuthClientInformationFull;
  },
  registerClient(client): OAuthClientInformationFull {
    const clientId = randomUUID();
    const full: OAuthClientInformationFull = {
      ...client,
      client_id: clientId,
      client_id_issued_at: agora(),
    };
    db.query(
      `INSERT INTO oauth_clients (client_id, client_secret, data_json, criado_em)
       VALUES ($id,$sec,$data,$c)`,
    ).run({
      $id: clientId,
      $sec: full.client_secret ?? null,
      $data: JSON.stringify(full),
      $c: agora(),
    });
    return full;
  },
};

function emitirTokens(clientId: string, userId: string, scopes: string): OAuthTokens {
  const access = novoToken();
  const refresh = novoToken();
  const exp = agora() + ACCESS_TTL_S;
  db.query(
    `INSERT INTO oauth_tokens (token, tipo, client_id, user_id, scopes, expira_em, criado_em)
     VALUES ($t,'access',$cl,$u,$s,$e,$c)`,
  ).run({ $t: access, $cl: clientId, $u: userId, $s: scopes, $e: exp, $c: agora() });
  db.query(
    `INSERT INTO oauth_tokens (token, tipo, client_id, user_id, scopes, expira_em, criado_em)
     VALUES ($t,'refresh',$cl,$u,$s,NULL,$c)`,
  ).run({ $t: refresh, $cl: clientId, $u: userId, $s: scopes, $c: agora() });
  return {
    access_token: access,
    token_type: "bearer",
    expires_in: ACCESS_TTL_S,
    refresh_token: refresh,
    scope: scopes || undefined,
  };
}

export const provider: OAuthServerProvider = {
  get clientsStore() {
    return clientsStore;
  },

  // Renderiza a tela de login. O form POSTa para /login com os parametros embutidos.
  async authorize(
    client: OAuthClientInformationFull,
    params: AuthorizationParams,
    res: Response,
  ): Promise<void> {
    const campos = {
      client_id: client.client_id,
      redirect_uri: params.redirectUri,
      state: params.state ?? "",
      code_challenge: params.codeChallenge,
      scopes: (params.scopes ?? []).join(" "),
      resource: params.resource ? params.resource.toString() : "",
    };
    res.set("Content-Type", "text/html; charset=utf-8").send(paginaLogin(campos, false));
  },

  async challengeForAuthorizationCode(
    _client: OAuthClientInformationFull,
    authorizationCode: string,
  ): Promise<string> {
    const row = db.query(`SELECT * FROM oauth_codes WHERE code = ?`).get(authorizationCode) as
      | CodeRow
      | null;
    if (!row) throw new Error("Codigo de autorizacao invalido");
    return row.code_challenge;
  },

  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
    _codeVerifier?: string,
    redirectUri?: string,
  ): Promise<OAuthTokens> {
    const row = db.query(`SELECT * FROM oauth_codes WHERE code = ?`).get(authorizationCode) as
      | CodeRow
      | null;
    if (!row) throw new Error("Codigo de autorizacao invalido");
    db.query(`DELETE FROM oauth_codes WHERE code = ?`).run(authorizationCode);
    if (row.expira_em < Date.now()) throw new Error("Codigo de autorizacao expirado");
    if (row.client_id !== client.client_id) throw new Error("Codigo nao pertence a este cliente");
    if (redirectUri && redirectUri !== row.redirect_uri) {
      throw new Error("redirect_uri nao confere");
    }
    return emitirTokens(row.client_id, row.user_id, row.scopes);
  },

  async exchangeRefreshToken(
    client: OAuthClientInformationFull,
    refreshToken: string,
    scopes?: string[],
  ): Promise<OAuthTokens> {
    const row = db
      .query(`SELECT * FROM oauth_tokens WHERE token = ? AND tipo = 'refresh'`)
      .get(refreshToken) as TokenRow | null;
    if (!row) throw new Error("Refresh token invalido");
    if (row.client_id !== client.client_id) throw new Error("Refresh token nao pertence a este cliente");
    const escopo = scopes && scopes.length ? scopes.join(" ") : row.scopes;
    return emitirTokens(row.client_id, row.user_id, escopo);
  },

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const row = db
      .query(`SELECT * FROM oauth_tokens WHERE token = ? AND tipo = 'access'`)
      .get(token) as TokenRow | null;
    if (!row) throw new Error("Token invalido");
    if (row.expira_em && row.expira_em < agora()) throw new Error("Token expirado");
    return {
      token,
      clientId: row.client_id,
      scopes: row.scopes ? row.scopes.split(" ").filter(Boolean) : [],
      expiresAt: row.expira_em ?? undefined,
      extra: { usuario: row.user_id },
    };
  },

  async revokeToken(_client, request): Promise<void> {
    db.query(`DELETE FROM oauth_tokens WHERE token = ?`).run(request.token);
  },
};

// ---- HTML da tela de login ----
export function paginaLogin(
  campos: {
    client_id: string;
    redirect_uri: string;
    state: string;
    code_challenge: string;
    scopes: string;
    resource: string;
  },
  comErro: boolean,
): string {
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
  const hidden = Object.entries(campos)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`)
    .join("\n      ");
  const alerta = comErro
    ? `<p style="color:#c0392b;margin:0 0 16px">Usuario ou senha incorretos.</p>`
    : "";
  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Entrar - Publicacoes QMIX</title>
<style>
  :root{--primary:#1f6feb}
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0d1117;color:#e6edf3;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{background:#161b22;border:1px solid #30363d;border-radius:14px;padding:32px;width:100%;max-width:360px}
  h1{font-size:20px;margin:0 0 4px}
  p.sub{color:#8b949e;font-size:14px;margin:0 0 24px}
  label{display:block;font-size:13px;margin:14px 0 6px;color:#c9d1d9}
  input[type=text],input[type=password]{width:100%;padding:11px 12px;border-radius:8px;border:1px solid #30363d;background:#0d1117;color:#e6edf3;font-size:15px}
  input:focus{outline:2px solid var(--primary);border-color:var(--primary)}
  button{margin-top:24px;width:100%;padding:12px;border:0;border-radius:8px;background:var(--primary);color:#fff;font-size:15px;font-weight:600;cursor:pointer}
  button:hover{background:#388bfd}
</style></head>
<body>
  <form class="card" method="POST" action="/login">
    <h1>Publicacoes QMIX</h1>
    <p class="sub">Entre para conectar o publicador de portais.</p>
    ${alerta}
    <label for="u">Usuario</label>
    <input id="u" type="text" name="usuario" autocomplete="username" autofocus required>
    <label for="p">Senha</label>
    <input id="p" type="password" name="senha" autocomplete="current-password" required>
    ${hidden}
    <button type="submit">Entrar</button>
  </form>
</body></html>`;
}
