// Importa em lote os clientes + backlinks a partir de um JSON:
//   [{ id, name, domain, csv }]
// Uso no servidor: IMPORT_JSON=/tmp/import-sites.json bun run scripts/import-sites.ts
// Idempotente: upsert do cliente por id; backlinks duplicados são ignorados.

import { readFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import { importBacklinksCsv } from "@/lib/import/service";

const path = process.env.IMPORT_JSON;
if (!path) {
  console.error("defina IMPORT_JSON");
  process.exit(1);
}

const sites: Array<{ id: string; name: string; domain: string; csv: string }> =
  JSON.parse(readFileSync(path, "utf-8"));

const account = await prisma.account.upsert({
  where: { id: "acc_qmix" },
  update: {},
  create: { id: "acc_qmix", name: "QMIX Digital" },
});

let totalCreated = 0;
for (const s of sites) {
  await prisma.client.upsert({
    where: { id: s.id },
    update: { name: s.name, domain: s.domain },
    create: { id: s.id, accountId: account.id, name: s.name, domain: s.domain },
  });
  const r = await importBacklinksCsv(s.id, s.csv);
  totalCreated += r.created;
  console.log(`${s.name}: ${r.created}/${r.parsed} backlinks novos`);
}
console.log(`\nTotal: ${sites.length} clientes, ${totalCreated} backlinks importados`);
await prisma.$disconnect();
