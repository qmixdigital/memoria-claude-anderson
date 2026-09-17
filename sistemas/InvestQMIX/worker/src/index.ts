import { logger } from './logger.js';
import { getBoss, stopBoss } from './pg-boss.js';
import { registerHandlers } from './handlers.js';
import { env } from './env.js';

async function main() {
  logger.info({ mode: env.MODE, env: env.NODE_ENV }, 'QMIX Invest worker starting');

  const boss = await getBoss();

  await registerHandlers(boss);
  logger.info('all scraper handlers registered');

  logger.info({ scrapers: 5 }, 'worker active — handlers registered, awaiting scheduled jobs');

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down');
    await stopBoss();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down');
    await stopBoss();
    process.exit(0);
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'worker failed to start');
  process.exit(1);
});
