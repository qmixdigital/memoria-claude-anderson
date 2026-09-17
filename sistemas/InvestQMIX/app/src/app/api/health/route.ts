import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { getQueueHealth } from '@/lib/pg-boss-client';
import { sql } from 'drizzle-orm';

const startedAt = Date.now();
const VERSION = process.env.APP_VERSION ?? 'dev';

export async function GET() {
  const checks: Record<string, unknown> = {};

  const dbStart = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = { ok: true, latency_ms: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      ok: false,
      latency_ms: Date.now() - dbStart,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  checks.queue = await getQueueHealth();

  const allOk = Object.values(checks).every(
    (c) => typeof c === 'object' && c !== null && (c as { ok: boolean }).ok
  );

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      version: VERSION,
      mode: env.MODE,
      uptime_seconds: Math.floor((Date.now() - startedAt) / 1000),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
