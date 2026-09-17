// Servidor HTTP: OAuth (para o claude.ai) + endpoint /mcp protegido por Bearer.
import express from "express";
import { StreamableHTTPServerTransport } from
  "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcpAuthRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { requireBearerAuth } from
  "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { config } from "./config.ts";
import { criarMcpServer } from "./mcp/server.ts";
import {
  provider,
  validarUsuario,
  criarCodigoAutorizacao,
  paginaLogin,
} from "./auth/provider.ts";

const app = express();
// Confia apenas no primeiro proxy (Nginx no loopback), senao o rate-limit do
// SDK reclama de trust proxy permissivo.
app.set("trust proxy", 1);
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));

const issuer = new URL(config.publicUrl);

// Endpoints OAuth padrao do MCP: metadata, /register (DCR), /authorize, /token, /revoke.
app.use(
  mcpAuthRouter({
    provider,
    issuerUrl: issuer,
    resourceServerUrl: new URL(`${config.publicUrl}/mcp`),
    scopesSupported: ["publicar"],
    resourceName: "Publicacoes QMIX (WordPress)",
  }),
);

// Processa o formulario de login e devolve o code para o redirect_uri do cliente.
app.post("/login", (req, res) => {
  const b = req.body ?? {};
  const usuario = String(b.usuario ?? "");
  const senha = String(b.senha ?? "");
  const campos = {
    client_id: String(b.client_id ?? ""),
    redirect_uri: String(b.redirect_uri ?? ""),
    state: String(b.state ?? ""),
    code_challenge: String(b.code_challenge ?? ""),
    scopes: String(b.scopes ?? ""),
    resource: String(b.resource ?? ""),
  };

  if (!validarUsuario(usuario, senha)) {
    res.status(401).set("Content-Type", "text/html; charset=utf-8").send(paginaLogin(campos, true));
    return;
  }
  if (!campos.redirect_uri || !campos.code_challenge || !campos.client_id) {
    res.status(400).send("Requisicao de autorizacao invalida.");
    return;
  }

  const code = criarCodigoAutorizacao({
    clientId: campos.client_id,
    redirectUri: campos.redirect_uri,
    codeChallenge: campos.code_challenge,
    userId: usuario,
    scopes: campos.scopes ? campos.scopes.split(" ").filter(Boolean) : [],
    resource: campos.resource || undefined,
  });

  const url = new URL(campos.redirect_uri);
  url.searchParams.set("code", code);
  if (campos.state) url.searchParams.set("state", campos.state);
  res.redirect(url.toString());
});

// Endpoint MCP, protegido por Bearer token. Modo stateless: um server por requisicao.
const bearer = requireBearerAuth({
  verifier: provider,
  resourceMetadataUrl: `${config.publicUrl}/.well-known/oauth-protected-resource/mcp`,
});

app.post("/mcp", bearer, async (req, res) => {
  const usuario =
    (req.auth?.extra?.usuario as string | undefined) ?? req.auth?.clientId ?? undefined;
  const server = criarMcpServer(usuario);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true, // responde JSON puro; mais robusto atras do Cloudflare que SSE
  });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Erro interno do servidor" },
        id: null,
      });
    }
    console.error("Erro no /mcp:", e);
  }
});

// Em modo stateless nao ha GET/DELETE de sessao.
const semSessao = (_req: express.Request, res: express.Response) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method Not Allowed" },
    id: null,
  });
};
app.get("/mcp", semSessao);
app.delete("/mcp", semSessao);

// Health check simples (o deploy usa isto).
app.get("/health", (_req, res) => {
  res.json({ ok: true, servico: "wp-mcp-qmix" });
});

app.listen(config.port, () => {
  console.log(`wp-mcp ouvindo em http://127.0.0.1:${config.port}  (publico: ${config.publicUrl})`);
  console.log(`Usuarios OAuth: ${[...config.oauthUsers.keys()].join(", ") || "(nenhum!)"}`);
});
