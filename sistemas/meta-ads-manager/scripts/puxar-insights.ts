// Puxa metricas das campanhas de um cliente e salva snapshot no banco.
// Uso: bun run scripts/puxar-insights.ts <slug-cliente> [preset]
// preset padrao: last_7d

import { getCliente } from "../src/config/clientes.ts";
import { puxarInsights } from "../src/lib/insights.ts";
import { centavosParaReais } from "../src/lib/meta-client.ts";
import { db } from "../src/db/client.ts";

const slug = process.argv[2];
const preset = process.argv[3] ?? "last_7d";

if (!slug) {
  console.error("Uso: bun run scripts/puxar-insights.ts <slug-cliente> [preset]");
  process.exit(1);
}

getCliente(slug); // valida que existe

const cliente = await db.cliente.findUnique({
  where: { slug },
  include: { campanhas: true },
});

if (!cliente || cliente.campanhas.length === 0) {
  console.error(`Nenhuma campanha no banco para "${slug}". Crie uma primeiro.`);
  process.exit(1);
}

for (const campanha of cliente.campanhas) {
  console.log(`\n== ${campanha.nome} (${preset}) ==`);
  const linhas = await puxarInsights(campanha.metaId, preset);

  for (const l of linhas) {
    console.log(
      `${l.data} | imp ${l.impressoes} | cliques ${l.cliques} | ` +
        `gasto ${centavosParaReais(l.gastoCentavos)} | ` +
        `CPC ${centavosParaReais(l.cpcCentavos)} | alcance ${l.alcance}`
    );

    // upsert por (campanha, data) para nao duplicar snapshots
    await db.insight.upsert({
      where: { campanhaId_data: { campanhaId: campanha.id, data: l.data } },
      update: {
        impressoes: l.impressoes,
        cliques: l.cliques,
        gastoCentavos: l.gastoCentavos,
        cpcCentavos: l.cpcCentavos,
        cpmCentavos: l.cpmCentavos,
        alcance: l.alcance,
      },
      create: {
        campanhaId: campanha.id,
        data: l.data,
        impressoes: l.impressoes,
        cliques: l.cliques,
        gastoCentavos: l.gastoCentavos,
        cpcCentavos: l.cpcCentavos,
        cpmCentavos: l.cpmCentavos,
        alcance: l.alcance,
      },
    });
  }
}

console.log("\nInsights salvos no banco.");
await db.$disconnect();
