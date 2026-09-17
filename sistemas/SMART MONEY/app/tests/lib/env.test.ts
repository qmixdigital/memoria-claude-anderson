import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('env validation', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('parses valid env vars', async () => {
    process.env.DATABASE_URL = '<<REMOVIDO>>';
    process.env.NODE_ENV = 'production';
    process.env.MODE = 'dry-run';
    process.env.LOG_LEVEL = 'info';
    const { env } = await import('../../src/lib/env?valid');
    expect(env.DATABASE_URL).toBe('<<REMOVIDO>>');
    expect(env.MODE).toBe('dry-run');
  });

  it('throws on invalid MODE', async () => {
    process.env.DATABASE_URL = '<<REMOVIDO>>';
    process.env.NODE_ENV = 'production';
    process.env.MODE = 'invalid-mode';
    process.env.LOG_LEVEL = 'info';
    await expect(import('../../src/lib/env?invalid')).rejects.toThrow();
  });

  it('defaults LOG_LEVEL to info when missing', async () => {
    process.env.DATABASE_URL = '<<REMOVIDO>>';
    process.env.NODE_ENV = 'production';
    process.env.MODE = 'dry-run';
    delete process.env.LOG_LEVEL;
    const { env } = await import('../../src/lib/env?defaults');
    expect(env.LOG_LEVEL).toBe('info');
  });
});
