// Remove do painel os sites que são apenas REDIRECT/parkado.
// Testa cada domínio: se https://dominio/ redireciona para OUTRO domínio,
// é redirect -> remove (apenas os SEM backlinks, para nunca apagar dados reais).
// Uso: bun run scripts/prune-redirects.ts [--dry]

import { prisma } from "@/lib/prisma";
import { getDomain } from "tldts";
import { pMap } from "@/lib/utils/concurrency";

const DRY = process.argv.includes("--dry");

async function isOffsiteRedirect(domain: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(`https://${domain}/`, {
      method: "GET",
      redirect: "manual",
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BacklinkGuard/1.0; +https://backlinkguard.qmix.com.br)",
      },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return false;
      const target = getDomain(new URL(loc, `https://${domain}/`).toString());
      const self = getDomain(domain);
      // redireciona para um domínio registrável diferente => redirect/parkado
      return Boolean(target && self && target !== self);
    }
    return false; // 2xx/4xx/5xx: trata como site de conteúdo (mantém)
  } catch {
    return false; // erro/timeout: mantém (não remove por dúvida)
  } finally {
    clearTimeout(timer);
  }
}

const candidates = await prisma.client.findMany({
  where: { backlinks: { none: {} } }, // só sites sem backlinks
  select: { id: true, domain: true, name: true },
});
console.log(`avaliando ${candidates.length} sites sem backlinks…`);

const flags = await pMap(
  candidates,
  async (c) => ({ c, redirect: await isOffsiteRedirect(c.domain) }),
  20,
);
const toDelete = flags.filter((f) => f.redirect).map((f) => f.c);

console.log(`${toDelete.length} identificados como redirect/parkado`);
for (const c of toDelete.slice(0, 20)) console.log("  - " + c.domain);
if (toDelete.length > 20) console.log(`  … +${toDelete.length - 20}`);

if (!DRY && toDelete.length) {
  const r = await prisma.client.deleteMany({
    where: { id: { in: toDelete.map((c) => c.id) } },
  });
  console.log(`removidos: ${r.count}`);
} else if (DRY) {
  console.log("(dry-run: nada removido)");
}
console.log("total de sites restante:", await prisma.client.count());
await prisma.$disconnect();
