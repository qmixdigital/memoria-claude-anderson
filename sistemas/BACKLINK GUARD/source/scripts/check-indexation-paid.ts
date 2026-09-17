// Verificação de indexação PAGA (DataForSEO) — SÓ nos backlinks hospedados em
// sites de terceiros (os seus usam Search Console grátis e não entram aqui).
// Disparado explicitamente pelo botão com aviso de custo.
// Uso: bun run scripts/check-indexation-paid.ts

import { getDomain } from "tldts";
import { prisma } from "@/lib/prisma";
import { runChecksForBacklinks } from "@/lib/checks/service";
import { getVerifiedDomains } from "@/lib/checks/indexation-gsc";
import { adoptRun, releaseRun, writeStatus } from "@/lib/runlock";

const CHUNK = 20;

if (!adoptRun("paid")) {
  console.error("já existe uma verificação em andamento — abortando");
  process.exit(0);
}

const startedAt = new Date().toISOString();
let done = 0;
let total = 0;

try {
  const verified = await getVerifiedDomains();
  const all = await prisma.backlink.findMany({
    select: { id: true, articleUrl: true, lastPublished: true, lastLinkOk: true },
  });
  const ids = all
    .filter((b) => {
      // trava de custo (ver checks/run.ts): artigo morto, ou sem o link do
      // cliente na página, não gera consulta paga
      if (b.lastPublished === false || b.lastLinkOk === false) return false;
      // só terceiros (host não verificado no GSC)
      const d = getDomain(b.articleUrl);
      return d ? !verified.has(d) : true;
    })
    .map((b) => b.id);
  total = ids.length;

  writeStatus({ running: true, total, done, startedAt, finishedAt: null, mode: "paid" });

  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    try {
      await runChecksForBacklinks(chunk, { allowPaidIndexation: true });
    } catch (e) {
      console.error("chunk falhou:", e);
    }
    done += chunk.length;
    writeStatus({ running: true, total, done, startedAt, finishedAt: null, mode: "paid" });
  }

  console.log(`indexação paga concluída: ${done}/${total}`);
} finally {
  writeStatus({
    running: false,
    total,
    done,
    startedAt,
    finishedAt: new Date().toISOString(),
    mode: "paid",
  });
  releaseRun();
  await prisma.$disconnect();
}
