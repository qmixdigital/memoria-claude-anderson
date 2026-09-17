// Verifica TODOS os backlinks (ou de um cliente) em background, gravando
// progresso num arquivo de status. Disparado pelo botão "Verificar todos".
//
// Uso: bun run scripts/check-all.ts [clientId] [--free]
//
//   --free   não consulta indexação paga (DataForSEO). Publicação e link do
//            cliente continuam sendo verificados, e a indexação já conhecida é
//            preservada (ver lib/checks/snapshot.ts). Custo: US$ 0,00.
//   --novos  só os backlinks que nunca foram verificados. É o que o botão
//            "verificar agora" da importação usa: confere só o que acabou de
//            entrar, sem reprocessar a carteira inteira.

import { prisma } from "@/lib/prisma";
import { runChecksForBacklinks } from "@/lib/checks/service";
import { adoptRun, releaseRun, writeStatus } from "@/lib/runlock";

const CHUNK = 25;
const args = process.argv.slice(2);
const gratis = args.includes("--free");
const apenasNovos = args.includes("--novos");
const clientId = args.find((a) => !a.startsWith("--"));

// Registra o PID no lock. Se outra rodada viva já é dona dele, sai sem fazer
// nada (evita duas rodadas pagas concorrentes).
if (!adoptRun("free")) {
  console.error("já existe uma verificação em andamento — abortando");
  process.exit(0);
}

const startedAt = new Date().toISOString();
let done = 0;
let total = 0;

try {
  const backlinks = await prisma.backlink.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(apenasNovos ? { lastCheckAt: null } : {}),
    },
    select: { id: true },
  });
  const ids = backlinks.map((b) => b.id);
  total = ids.length;

  writeStatus({ running: true, total, done, startedAt, finishedAt: null, mode: gratis ? "free" : "paid" });

  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    try {
      await runChecksForBacklinks(chunk, { allowPaidIndexation: !gratis });
    } catch (e) {
      console.error("chunk falhou:", e);
    }
    done += chunk.length;
    writeStatus({ running: true, total, done, startedAt, finishedAt: null, mode: gratis ? "free" : "paid" });
  }

  console.log(`check-all concluído: ${done}/${total}`);
} finally {
  // Marca parado e devolve o lock SEMPRE — inclusive se o script explodir.
  writeStatus({
    running: false,
    total,
    done,
    startedAt,
    finishedAt: new Date().toISOString(),
    mode: gratis ? "free" : "paid",
  });
  releaseRun();
  await prisma.$disconnect();
}
