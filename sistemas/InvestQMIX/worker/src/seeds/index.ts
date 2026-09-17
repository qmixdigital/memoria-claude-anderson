import { seedCompanies } from './companies.js';
import { seedTickers } from './tickers.js';
import { logger } from '../logger.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function runSeeds(): Promise<void> {
  logger.info('running seeds');
  await seedCompanies();
  await seedTickers();
  logger.info('seeds complete');
}

// Cross-platform module guard (same pattern as migrate.ts)
const argv1 = process.argv[1];
if (argv1 && fileURLToPath(import.meta.url) === path.resolve(argv1)) {
  const { queryClient } = await import('../db.js');
  runSeeds()
    .then(() => queryClient.end())
    .catch(async (err) => {
      logger.fatal({ err }, 'seed failed');
      await queryClient.end();
      process.exit(1);
    });
}
