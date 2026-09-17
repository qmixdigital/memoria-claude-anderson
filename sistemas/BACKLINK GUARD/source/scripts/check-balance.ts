// Alerta de saldo da API DataForSEO.
// Roda via cron (diário). Consulta o saldo e envia email quando cai abaixo dos
// limites. Só envia quando a "faixa" piora (evita spam); reenvia lembrete a
// cada ALERT_REMINDER_DAYS se continuar baixo. `--test` força um envio.
//
// Env (no .env do servidor):
//   DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD
//   RESEND_API_KEY
//   ALERT_EMAIL_FROM   (ex: "BacklinkGuard <nao-responder@smspix.com.br>")
//   ALERT_EMAIL_TO     (ex: "qmixdigital@gmail.com,marketing@qmix.com.br")
//   DFS_BALANCE_WARN     (default 2.00)
//   DFS_BALANCE_CRITICAL (default 0.20)

import { readFileSync, writeFileSync } from "node:fs";

const WARN = Number(process.env.DFS_BALANCE_WARN ?? "2");
const CRITICAL = Number(process.env.DFS_BALANCE_CRITICAL ?? "0.2");
const REMINDER_DAYS = Number(process.env.ALERT_REMINDER_DAYS ?? "7");
const COST_PER_CHECK = 0.01; // custo aprox. por consulta de indexação
const STATE_FILE =
  process.env.BALANCE_STATE_FILE ??
  "/var/www/backlinkguard-shared/.balance-alert-state.json";
const isTest = process.argv.includes("--test");

type Band = "ok" | "warn" | "critical" | "empty";

function bandFor(balance: number): Band {
  if (balance <= 0) return "empty";
  if (balance < CRITICAL) return "critical";
  if (balance < WARN) return "warn";
  return "ok";
}

const BAND_RANK: Record<Band, number> = { ok: 0, warn: 1, critical: 2, empty: 3 };

async function getBalance(): Promise<number> {
  const login = process.env.DATAFORSEO_LOGIN ?? "";
  const password = process.env.DATAFORSEO_PASSWORD ?? "";
  const auth = Buffer.from(`${login}:${password}`).toString("base64");
  const res = await fetch("https://api.dataforseo.com/v3/appendix/user_data", {
    method: "GET",
    headers: { Authorization: `Basic ${auth}` },
  });
  const json = (await res.json()) as {
    tasks?: Array<{ result?: Array<{ money?: { balance?: number } }> }>;
  };
  const balance = json.tasks?.[0]?.result?.[0]?.money?.balance;
  if (typeof balance !== "number") {
    throw new Error("não consegui ler o saldo da resposta do DataForSEO");
  }
  return balance;
}

function readState(): { band: Band; date: string } | null {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return null;
  }
}
function writeState(band: Band, date: string): void {
  try {
    writeFileSync(STATE_FILE, JSON.stringify({ band, date }), "utf-8");
  } catch (e) {
    console.error("aviso: não gravei o state:", e);
  }
}

async function sendEmail(balance: number, band: Band): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_EMAIL_FROM;
  const to = (process.env.ALERT_EMAIL_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!key || !from || to.length === 0) {
    throw new Error("RESEND_API_KEY / ALERT_EMAIL_FROM / ALERT_EMAIL_TO ausentes");
  }

  const checksLeft = Math.floor(balance / COST_PER_CHECK);
  const brl = (balance * 5.5).toFixed(2); // estimativa BRL só de referência
  const urgente = band === "critical" || band === "empty";
  const subject =
    band === "empty"
      ? "🔴 BacklinkGuard: créditos DataForSEO ACABARAM"
      : `${urgente ? "🔴" : "⚠️"} BacklinkGuard: créditos DataForSEO baixos (US$ ${balance.toFixed(2)})`;

  const html = `
  <div style="font-family:system-ui,Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
    <h2 style="color:${urgente ? "#dc2626" : "#d97706"};margin:0 0 8px">
      ${band === "empty" ? "Créditos acabaram" : "Créditos baixos"} — DataForSEO
    </h2>
    <p style="margin:0 0 12px;color:#444">
      A ferramenta <strong>BacklinkGuard</strong> usa a API DataForSEO para o
      check de indexação no Google. O saldo está acabando:
    </p>
    <table style="border-collapse:collapse;margin:8px 0 16px">
      <tr><td style="padding:4px 12px 4px 0;color:#666">Saldo atual</td>
          <td style="font-weight:700">US$ ${balance.toFixed(2)} <span style="color:#888;font-weight:400">(~R$ ${brl})</span></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Consultas restantes</td>
          <td style="font-weight:700">~${checksLeft} verificações de indexação</td></tr>
    </table>
    <p style="margin:0 0 16px;color:#444">
      Recarregue em <a href="https://app.dataforseo.com/api-dashboard" style="color:#059669">app.dataforseo.com</a>
      (pré-pago, sem mensalidade). Os checks de publicação e link continuam
      funcionando de graça mesmo sem saldo.
    </p>
    <p style="margin:0;font-size:12px;color:#999">
      Alerta automático · conta ${process.env.DATAFORSEO_LOGIN ?? ""} · limite de aviso US$ ${WARN.toFixed(2)}
    </p>
  </div>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!r.ok) {
    throw new Error(`Resend falhou: ${r.status} ${await r.text()}`);
  }
}

// --- main ---
const today = new Date().toISOString().slice(0, 10);
const balance = await getBalance();
const band = bandFor(balance);
const prev = readState();

console.log(`saldo=US$ ${balance.toFixed(2)} band=${band} prev=${prev?.band ?? "-"}`);

let shouldSend = isTest;
let reason = isTest ? "teste manual" : "";
if (!isTest && band !== "ok") {
  const worsened = !prev || BAND_RANK[band] > BAND_RANK[prev.band];
  const daysSince = prev
    ? (Date.parse(today) - Date.parse(prev.date)) / 86_400_000
    : Infinity;
  if (worsened) {
    shouldSend = true;
    reason = "faixa piorou";
  } else if (daysSince >= REMINDER_DAYS) {
    shouldSend = true;
    reason = `lembrete (${REMINDER_DAYS}d)`;
  }
}

if (shouldSend) {
  await sendEmail(balance, band === "ok" ? "warn" : band);
  console.log(`email enviado (${reason})`);
  if (!isTest) writeState(band, today);
} else {
  console.log("sem email");
  if (!isTest && band === "ok" && prev && prev.band !== "ok") writeState("ok", today);
}
