import { describe, it, expect } from 'vitest';

describe('db client', () => {
  it('exports a Drizzle client with the qmix_invest schema', async () => {
    process.env.DATABASE_URL = '<<REMOVIDO>>';
    process.env.NODE_ENV = 'test';
    process.env.MODE = 'dry-run';
    process.env.LOG_LEVEL = 'error';
    const { db, qmixInvest } = await import('../../src/lib/db');
    expect(db).toBeDefined();
    expect(qmixInvest).toBeDefined();
    expect(typeof db.execute).toBe('function');
  });
});
