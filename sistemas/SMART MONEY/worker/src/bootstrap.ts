// Bootstrap one-shot — enqueueia jobs históricos com prioridade baixa.
// Roda uma vez após o primeiro deploy bem-sucedido + seeds.
// Os jobs ficam na fila pg-boss e são consumidos pelos workers no ritmo
// que conseguirem (sem afetar os schedules regulares).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBoss, stopBoss } from './pg-boss.js';
import { logger } from './logger.js';

interface BootstrapJob {
  queue: string;
  data: Record<string, unknown>;
}

const JOBS: BootstrapJob[] = [
  // Inserção pontual (não histórica) — apenas dispara o scraper de preços uma vez
  // para validar que está funcionando contra dados reais.
  { queue: 'scrape:b3-prices', data: { mode: 'bootstrap' } },
];

export async function enqueueBootstrap(): Promise<void> {
  const boss = await getBoss();
  for (const job of JOBS) {
    const id = await boss.send(job.queue, job.data, { priority: -10, retryLimit: 2 });
    logger.info({ queue: job.queue, jobId: id }, 'bootstrap job enqueued');
  }
  logger.info({ count: JOBS.length }, 'all bootstrap jobs enqueued (priority -10)');
}

const argv1 = process.argv[1];
if (argv1 && fileURLToPath(import.meta.url) === path.resolve(argv1)) {
  enqueueBootstrap()
    .then(() => stopBoss())
    .then(() => process.exit(0))
    .catch(async (err) => {
      logger.fatal({ err }, 'bootstrap failed');
      await stopBoss();
      process.exit(1);
    });
}
