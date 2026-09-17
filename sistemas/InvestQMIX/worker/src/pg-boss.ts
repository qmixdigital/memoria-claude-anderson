import PgBoss from 'pg-boss';
import { env } from './env.js';
import { logger } from './logger.js';

let bossInstance: PgBoss | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (bossInstance) return bossInstance;

  bossInstance = new PgBoss({
    connectionString: env.DATABASE_URL,
    schema: 'pgboss',
    retryLimit: 5,
    retryDelay: 30,
    retryBackoff: true,
    expireInHours: 23,
    archiveCompletedAfterSeconds: 60 * 60 * 24 * 7,
    deleteAfterDays: 30,
  });

  bossInstance.on('error', (err) => {
    logger.error({ err }, 'pg-boss error');
  });

  await bossInstance.start();
  logger.info('pg-boss started');

  return bossInstance;
}

export async function stopBoss(): Promise<void> {
  if (!bossInstance) return;
  await bossInstance.stop({ graceful: true, wait: true });
  bossInstance = null;
  logger.info('pg-boss stopped');
}
