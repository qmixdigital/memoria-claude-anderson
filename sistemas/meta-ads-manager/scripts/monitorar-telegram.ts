// Monitora a campanha da casa de Itacaiu e envia um relatorio ao Telegram.
// Compara os anuncios (A x B) e indica quem lidera no CTR.
// Uso: bun run monitorar [preset]   (preset padrao: maximum = desde o inicio)
//      presets: today, yesterday, last_7d, last_30d, maximum

import { metaGet } from "../src/lib/meta-client.ts";
import { enviarTelegram } from "../src/lib/telegram.ts";

const CAMPANHA = "120249638731300123"; // Casa Itacaiu - Rio Araguaia
const preset = process.argv[2] ?? "maximum";

interface AdRow {
  id: string;
  name: string;
}
interface InsightTot {
  impressions?: string;
  clicks?: string;
  spend?: string;
  ctr?: string;
  cpc?: string;
  reach?: string;
}

const n = (v?: string) => (v ? Number(v).toLocaleString("pt-BR") : "0");
const brl = (v?: string) =>
  v
    ? Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "R$ 0,00";
const pct = (v?: string) => (v ? Number(v).toFixed(2) + "%" : "0%");

// status da campanha
const camp = await metaGet<{ name: string; effective_status: string }>(CAMPANHA, {
  fields: "name,effective_status",
});

const ads = await metaGet<{ data: AdRow[] }>(`${CAMPANHA}/ads`, {
  fields: "name",
  limit: "20",
});

const blocos: string[] = [];
const resumo: { name: string; ctr: number; cliques: number; gasto: number }[] = [];

for (const ad of ads.data) {
  const ins = await metaGet<{ data: InsightTot[] }>(`${ad.id}/insights`, {
    fields: "impressions,clicks,spend,ctr,cpc,reach",
    date_preset: preset,
  });
  const d = ins.data[0] ?? {};
  resumo.push({
    name: ad.name,
    ctr: Number(d.ctr ?? 0),
    cliques: Number(d.clicks ?? 0),
    gasto: Number(d.spend ?? 0),
  });
  blocos.push(
    `\n📌 <b>${ad.name}</b>\n` +
      `👁 Alcance: ${n(d.reach)} | 👀 Impressões: ${n(d.impressions)}\n` +
      `🖱 Cliques: ${n(d.clicks)} | CTR: ${pct(d.ctr)} | CPC: ${brl(d.cpc)}\n` +
      `💸 Gasto: ${brl(d.spend)}`
  );
}

const gastoTotal = resumo.reduce((s, r) => s + r.gasto, 0);
const statusEmoji = camp.effective_status === "ACTIVE" ? "🟢" : "⏸️";

const cabecalho =
  `📊 <b>Casa Itacaiú — Relatório da Campanha</b>\n` +
  `${statusEmoji} Status: ${camp.effective_status} | Período: ${preset}\n` +
  `💰 Gasto total: ${gastoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;

let rodape: string;
const comDados = resumo.filter((r) => r.cliques > 0 || r.ctr > 0);
if (comDados.length >= 2) {
  const lider = [...resumo].sort((a, b) => b.ctr - a.ctr)[0]!;
  rodape = `\n\n🏆 Liderando (melhor CTR): <b>${lider.name}</b>`;
} else if (comDados.length === 1) {
  rodape = `\n\n📈 Começando a coletar — só um anúncio com dados até agora.`;
} else {
  rodape = `\n\n⏳ Ainda sem dados (a Meta precisa aprovar e começar a entregar).`;
}

await enviarTelegram(cabecalho + "\n" + blocos.join("\n") + rodape);
console.log("Relatório enviado ao Telegram com sucesso.");
