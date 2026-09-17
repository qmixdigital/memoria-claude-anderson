import PgBoss from 'pg-boss';
import { env } from './env';

let boss: PgBoss | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (boss) return boss;
  boss = new PgBoss({
    connectionString: env.DATABASE_URL,
    schema: 'pgboss',
    // app não consome jobs, apenas enfileira — desabilitar scheduling e supervisão
    schedule: false,
    supervise: false,
  });
  await boss.start();
  return boss;
}

export async function getQueueHealth(): Promise<{
  ok: boolean;
  pending?: number;
  failed_24h?: number;
  error?: string;
}> {
  try {
    // Não usamos a API interna do pg-boss para contar jobs (instável entre versões).
    // Em vez disso, query direta no schema pgboss via Drizzle.
    // Se o schema/tabela não existir ainda, capturamos erro abaixo.
    const { db } = await import('./db');
    const { sql } = await import('drizzle-orm');
    const result = await db.execute(sql`
      SELECT
        COALESCE(COUNT(*) FILTER (WHERE state IN ('created', 'retry', 'active')), 0)::int AS pending,
        COALESCE(COUNT(*) FILTER (WHERE state = 'failed' AND completed_on > now() - interval '24 hours'), 0)::int AS failed_24h
      FROM pgboss.job
    `);
    const row = result[0] as { pending: number; failed_24h: number } | undefined;
    return {
      ok: true,
      pending: row?.pending ?? 0,
      failed_24h: row?.failed_24h ?? 0,
    };
  } catch (err) {
    // Se pgboss schema ainda não foi criado (boss.start() nunca rodou no worker),
    // este endpoint reporta degraded. É o estado esperado em deploy fresh — vai
    // virar ok assim que o worker iniciar e criar o schema.
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
