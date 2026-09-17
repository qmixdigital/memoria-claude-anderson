import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { importBacklinksCsv } from "@/lib/import/service";

/**
 * Popula o banco com dados de demonstração a partir de CSVs reais da QMIX
 * (empacotados em prisma/samples). Idempotente: usa o Account "QMIX" e faz
 * upsert dos clientes; backlinks já existentes são ignorados no import.
 */
export async function seedDemo(): Promise<{ account: string; clients: number }> {
  const account = await prisma.account.upsert({
    where: { id: "acc_qmix" },
    update: {},
    create: { id: "acc_qmix", name: "QMIX Digital" },
  });

  const samples: Array<{ id: string; name: string; domain: string; file: string }> = [
    {
      id: "cli_cinemus",
      name: "Cinemus",
      domain: "cinemus.com.br",
      file: "cinemus-backlinks.csv",
    },
    {
      id: "cli_otec",
      name: "OTEC",
      domain: "otec.net.br",
      file: "otec-feth-backlinks.csv",
    },
  ];

  for (const s of samples) {
    await prisma.client.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, accountId: account.id, name: s.name, domain: s.domain },
    });
    const csv = await readFile(
      path.join(process.cwd(), "prisma", "samples", s.file),
      "utf-8",
    );
    await importBacklinksCsv(s.id, csv);
  }

  return { account: account.name, clients: samples.length };
}
