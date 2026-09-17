// Monitor autossuficiente (Node 18+, sem dependencias) para rodar no VPS.
// Le um .env no mesmo diretorio, puxa os insights da campanha e envia ao Telegram.
// Cron sugerido: 0 6-23 * * *  (de hora em hora, das 06h as 23h)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// --- carrega .env do mesmo diretorio ---
const __dir = dirname(fileURLToPath(import.meta.url));
try {
  for (const line of readFileSync(join(__dir, ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const TOKEN = process.env.META_ACCESS_TOKEN;
const VER = process.env.META_API_VERSION || "v23.0";
const TG = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;
const CAMP = process.env.CAMPANHA_ID;
const PRESET = process.env.PRESET || "maximum";
const BASE = `https://graph.facebook.com/${VER}`;

if (!TOKEN || !TG || !CHAT || !CAMP) {
  console.error("Faltam variaveis no .env (META_ACCESS_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, CAMPANHA_ID)");
  process.exit(1);
}

async function g(path, query = {}) {
  const qs = new URLSearchParams({ ...query, access_token: TOKEN });
  const res = await fetch(`${BASE}/${path}?${qs}`);
  const j = await res.json();
  if (j.error) throw new Error(`Meta ${j.error.code}: ${j.error.message}`);
  return j;
}
const n = (v) => (v ? Number(v).toLocaleString("pt-BR") : "0");
const brl = (v) =>
  v ? Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00";
const pct = (v) => (v ? Number(v).toFixed(2) + "%" : "0%");

const camp = await g(CAMP, { fields: "name,effective_status" });
const ads = await g(`${CAMP}/ads`, { fields: "name", limit: "20" });

const blocos = [];
const resumo = [];
for (const ad of ads.data) {
  const ins = await g(`${ad.id}/insights`, {
    fields: "impressions,clicks,spend,ctr,cpc,reach",
    date_preset: PRESET,
  });
  const d = (ins.data && ins.data[0]) || {};
  resumo.push({
    name: ad.name,
    ctr: Number(d.ctr || 0),
    cliques: Number(d.clicks || 0),
    gasto: Number(d.spend || 0),
  });
  blocos.push(
    `\n📌 <b>${ad.name}</b>\n` +
      `👁 Alcance: ${n(d.reach)} | 👀 Impressões: ${n(d.impressions)}\n` +
      `🖱 Cliques: ${n(d.clicks)} | CTR: ${pct(d.ctr)} | CPC: ${brl(d.cpc)}\n` +
      `💸 Gasto: ${brl(d.spend)}`
  );
}

const gastoTotal = resumo.reduce((s, r) => s + r.gasto, 0);
const emoji = camp.effective_status === "ACTIVE" ? "🟢" : "⏸️";
const cab =
  `📊 <b>Casa Itacaiú — Relatório da Campanha</b>\n` +
  `${emoji} Status: ${camp.effective_status} | Período: ${PRESET}\n` +
  `💰 Gasto total: ${gastoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;

const comDados = resumo.filter((r) => r.cliques > 0 || r.ctr > 0);
let rod;
if (comDados.length >= 2) {
  const l = [...resumo].sort((a, b) => b.ctr - a.ctr)[0];
  rod = `\n\n🏆 Liderando (melhor CTR): <b>${l.name}</b>`;
} else if (comDados.length === 1) {
  rod = `\n\n📈 Começando a coletar dados.`;
} else {
  rod = `\n\n⏳ Ainda sem dados (a Meta precisa aprovar e entregar).`;
}

const msg = cab + "\n" + blocos.join("\n") + rod;
const r = await fetch(`https://api.telegram.org/bot${TG}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: CHAT, text: msg, parse_mode: "HTML", disable_web_page_preview: true }),
});
const jr = await r.json();
if (!jr.ok) {
  console.error("Telegram erro:", jr.description);
  process.exit(1);
}
console.log(new Date().toISOString(), "relatorio enviado");
