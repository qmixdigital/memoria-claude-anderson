// Teste de integracao: simula o claude.ai (DCR + PKCE + token) e chama uma ferramenta.
// Uso: bun run scripts/e2e-test.ts http://127.0.0.1:3100 anderson SENHA
import { createHash, randomBytes } from "node:crypto";

const BASE = process.argv[2] ?? "http://127.0.0.1:3100";
const USER = process.argv[3] ?? "anderson";
const PASS = process.argv[4] ?? "";
const REDIRECT = "http://localhost:9999/callback";

function b64url(b: Buffer) {
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const verifier = b64url(randomBytes(32));
const challenge = b64url(createHash("sha256").update(verifier).digest());

async function main() {
  // 1. DCR
  const reg = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "teste-e2e",
      redirect_uris: [REDIRECT],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }),
  });
  if (!reg.ok) throw new Error(`register falhou ${reg.status}: ${await reg.text()}`);
  const client = (await reg.json()) as { client_id: string };
  console.log("1. DCR OK, client_id =", client.client_id);

  // 2. authorize (deve devolver a pagina de login)
  const authUrl = new URL(`${BASE}/authorize`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", client.client_id);
  authUrl.searchParams.set("redirect_uri", REDIRECT);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", "estado123");
  authUrl.searchParams.set("resource", `${BASE}/mcp`);
  const authRes = await fetch(authUrl, { redirect: "manual" });
  console.log("2. authorize status =", authRes.status, "(espera 200, tela de login)");

  // 3. login -> redirect com code
  const form = new URLSearchParams({
    usuario: USER,
    senha: PASS,
    client_id: client.client_id,
    redirect_uri: REDIRECT,
    state: "estado123",
    code_challenge: challenge,
    scopes: "publicar",
    resource: `${BASE}/mcp`,
  });
  const loginRes = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    redirect: "manual",
  });
  const loc = loginRes.headers.get("location");
  console.log("3. login status =", loginRes.status, "location =", loc);
  if (!loc) throw new Error("login nao redirecionou (credenciais erradas?)");
  const code = new URL(loc).searchParams.get("code");
  if (!code) throw new Error("sem code no redirect");

  // 4. token
  const tokRes = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      client_id: client.client_id,
      redirect_uri: REDIRECT,
    }).toString(),
  });
  if (!tokRes.ok) throw new Error(`token falhou ${tokRes.status}: ${await tokRes.text()}`);
  const tokens = (await tokRes.json()) as { access_token: string; refresh_token: string };
  console.log("4. token OK, access_token =", tokens.access_token.slice(0, 12) + "...");

  // 5. MCP initialize
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${tokens.access_token}`,
  };
  const initRes = await fetch(`${BASE}/mcp`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "e2e", version: "1.0" },
      },
    }),
  });
  console.log("5. initialize status =", initRes.status);
  const initText = await initRes.text();
  console.log("   resposta:", initText.slice(0, 160).replace(/\n/g, " "));

  // 6. tools/call listar_sites
  const callRes = await fetch(`${BASE}/mcp`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "listar_sites", arguments: {} },
    }),
  });
  const callText = await callRes.text();
  console.log("6. tools/call listar_sites status =", callRes.status);
  console.log("   resposta:", callText.slice(0, 400).replace(/\n/g, " "));
  console.log("\nE2E CONCLUIDO.");
}

main().catch((e) => {
  console.error("FALHOU:", e instanceof Error ? e.message : e);
  process.exit(1);
});
