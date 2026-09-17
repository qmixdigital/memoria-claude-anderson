import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, queryClient } from './db.js';
import { logger } from './logger.js';

const LOCK_KEY = <<REMOVIDO>>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_MIGRATIONS = path.resolve(__dirname, '../../db/migrations');

type DbLike = { execute: (q: unknown) => Promise<unknown> };
type MigrateFn = (db: unknown, opts: { migrationsFolder: string }) => Promise<void>;

export async function runMigrationsWithDeps(
  database: DbLike,
  migrateFn: MigrateFn,
  migrationsFolder: string
): Promise<void> {
  await database.execute(sql`SELECT pg_advisory_lock(${LOCK_KEY})`);
  try {
    await migrateFn(database, { migrationsFolder });
  } finally {
    await database.execute(sql`SELECT pg_advisory_unlock(${LOCK_KEY})`);
  }
}

export async function runMigrations(): Promise<void> {
  logger.info({ folder: DEFAULT_MIGRATIONS }, 'running migrations');
  await runMigrationsWithDeps(db as unknown as DbLike, migrate as MigrateFn, DEFAULT_MIGRATIONS);
  logger.info('migrations applied');
}

// Cross-platform module guard: works on Windows and POSIX paths.
// Comparing import.meta.url (file:/// URL) with `file://${process.argv[1]}`
// fails on Windows because argv uses backslashes while file URLs use forward
// slashes. fileURLToPath + path.resolve normalizes both sides.
const argv1 = process.argv[1];
if (argv1 && fileURLToPath(import.meta.url) === path.resolve(argv1)) {
  runMigrations()
    .then(() => queryClient.end())
    .catch(async (err) => {
      logger.fatal({ err }, 'migrate failed');
      await queryClient.end();
      process.exit(1);
    });
}
