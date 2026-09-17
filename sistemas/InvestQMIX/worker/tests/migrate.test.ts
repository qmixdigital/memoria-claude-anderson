import { describe, it, expect, vi } from 'vitest';

// Helper: extract SQL text from a Drizzle SQL object's string chunks
function sqlText(obj: unknown): string {
  if (typeof obj !== 'object' || obj === null) return String(obj);
  const chunks = (obj as { queryChunks?: Array<{ value?: unknown }> }).queryChunks;
  if (!Array.isArray(chunks)) return String(obj);
  return chunks
    .filter((c) => Array.isArray(c.value))
    .flatMap((c) => c.value as string[])
    .join('');
}

describe('migrate runner', () => {
  it('exports a runMigrations function', async () => {
    const mod = await import('../src/migrate');
    expect(typeof mod.runMigrations).toBe('function');
  });

  it('acquires advisory lock before running migrations', async () => {
    const fakeDb = {
      execute: vi.fn().mockResolvedValue([]),
    };
    const fakeMigrate = vi.fn().mockResolvedValue(undefined);

    const { runMigrationsWithDeps } = await import('../src/migrate');
    await runMigrationsWithDeps(fakeDb as never, fakeMigrate, '/tmp/migrations');

    expect(fakeDb.execute).toHaveBeenCalledTimes(2); // lock + unlock
    expect(fakeMigrate).toHaveBeenCalledTimes(1);

    const lockCall = fakeDb.execute.mock.calls[0]?.[0];
    const unlockCall = fakeDb.execute.mock.calls[1]?.[0];
    expect(sqlText(lockCall)).toContain('pg_advisory_lock');
    expect(sqlText(unlockCall)).toContain('pg_advisory_unlock');
  });

  it('releases lock even if migration fails', async () => {
    const fakeDb = {
      execute: vi.fn().mockResolvedValue([]),
    };
    const fakeMigrate = vi.fn().mockRejectedValue(new Error('migration failed'));

    const { runMigrationsWithDeps } = await import('../src/migrate');
    await expect(
      runMigrationsWithDeps(fakeDb as never, fakeMigrate, '/tmp/migrations')
    ).rejects.toThrow('migration failed');

    expect(fakeDb.execute).toHaveBeenCalledTimes(2); // lock + unlock mesmo com falha
  });
});
