/*
 * Servidor HTTP mínimo: recebe o webhook do Telegram e expõe /health.
 * Ao subir, registra o webhook na API do Telegram apontando para
 * PUBLIC_BASE_URL/webhook/WEBHOOK_SECRET.
 */
import { createServer } from "node:http";
import { webhookCallback } from "grammy";
import { createBot } from "./bot.js";

const port = Number(process.env.PORT ?? 3080);
const secret = process.env.WEBHOOK_SECRET;
const base = process.env.PUBLIC_BASE_URL?.replace(/\/$/, "");
if (!secret) throw new Error("WEBHOOK_SECRET não configurado");
if (!base) throw new Error("PUBLIC_BASE_URL não configurado");

const bot = createBot();
const webhookPath = `/webhook/${secret}`;
const handle = webhookCallback(bot, "http", { secretToken: secret });

const server = createServer((req, res) => {
  const path = (req.url ?? "/").split("?")[0].replace(/^\/agenda-bot/, ""); // tolera prefixo do nginx
  if (req.method === "GET" && path === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, uptime: process.uptime() }));
    return;
  }
  if (req.method === "POST" && path === webhookPath) {
    handle(req, res).catch((e) => {
      console.error("webhook:", e);
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(port, "127.0.0.1", async () => {
  console.log(`agenda-telegram na porta ${port}`);
  try {
    await bot.api.setWebhook(`${base}${webhookPath}`, {
      secret_token: secret,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: false,
    });
    console.log(`webhook registrado em ${base}${webhookPath}`);
  } catch (e) {
    console.error("setWebhook falhou:", e);
  }
});

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
