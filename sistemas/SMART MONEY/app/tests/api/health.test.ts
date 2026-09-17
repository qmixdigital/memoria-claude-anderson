import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  db: { execute: vi.fn() },
  qmixInvest: {},
}));

vi.mock('@/lib/pg-boss-client', () => ({
  getQueueHealth: vi.fn(),
  getBoss: vi.fn(),
}));

vi.mock('@/lib/env', () => ({
  env: { DATABASE_URL: '<<REMOVIDO>>', NODE_ENV: 'test', MODE: 'dry-run', LOG_LEVEL: 'error' },
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ok when DB and queue are healthy', async () => {
    const dbModule = await import('@/lib/db');
    const queueModule = await import('@/lib/pg-boss-client');
    vi.mocked(dbModule.db.execute).mockResolvedValue([{ '?column?': 1 }] as never);
    vi.mocked(queueModule.getQueueHealth).mockResolvedValue({ ok: true, pending: 0, failed_24h: 0 });

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.checks.database.ok).toBe(true);
    expect(body.checks.queue.ok).toBe(true);
  });

  it('returns degraded when DB fails', async () => {
    const dbModule = await import('@/lib/db');
    const queueModule = await import('@/lib/pg-boss-client');
    vi.mocked(dbModule.db.execute).mockRejectedValue(new Error('connection refused'));
    vi.mocked(queueModule.getQueueHealth).mockResolvedValue({ ok: true });

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.checks.database.ok).toBe(false);
  });

  it('returns degraded when queue fails', async () => {
    const dbModule = await import('@/lib/db');
    const queueModule = await import('@/lib/pg-boss-client');
    vi.mocked(dbModule.db.execute).mockResolvedValue([{ '?column?': 1 }] as never);
    vi.mocked(queueModule.getQueueHealth).mockResolvedValue({ ok: false, error: 'pgboss schema missing' });

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.checks.queue.ok).toBe(false);
  });
});
