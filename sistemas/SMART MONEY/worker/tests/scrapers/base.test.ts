import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertReturning = vi.fn();
const updateWhere = vi.fn();

const fakeDb = {
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: insertReturning,
    })),
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: updateWhere,
    })),
  })),
};

const fakeLogger = {
  info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(),
  child: vi.fn().mockReturnThis(),
} as unknown as import('pino').Logger;

describe('runScraper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertReturning.mockResolvedValue([{ id: 42 }]);
    updateWhere.mockResolvedValue(undefined);
  });

  it('opens scraper_runs row, runs scraper, marks success', async () => {
    const { runScraper } = await import('../../src/scrapers/base?success');
    const scraper = {
      source: 'test-source',
      run: vi.fn().mockResolvedValue({
        status: 'success' as const,
        itemsFetched: 10, itemsInserted: 9, itemsSkipped: 1,
      }),
    };

    const result = await runScraper(scraper, { db: fakeDb as never, logger: fakeLogger });

    expect(scraper.run).toHaveBeenCalled();
    expect(fakeDb.insert).toHaveBeenCalled();
    expect(fakeDb.update).toHaveBeenCalled();
    expect(result.status).toBe('success');
  });

  it('catches thrown errors and marks scraper_runs as failed', async () => {
    const { runScraper } = await import('../../src/scrapers/base?failed');
    const scraper = {
      source: 'failing-source',
      run: vi.fn().mockRejectedValue(new Error('network timeout')),
    };

    const result = await runScraper(scraper, { db: fakeDb as never, logger: fakeLogger });

    expect(result.status).toBe('failed');
    if (result.status === 'failed') {
      expect(result.errorMessage).toContain('network timeout');
    }
    expect(fakeDb.update).toHaveBeenCalled();
  });

  it('marks status partial when scraper returns partial', async () => {
    const { runScraper } = await import('../../src/scrapers/base?partial');
    const scraper = {
      source: 'partial-source',
      run: vi.fn().mockResolvedValue({
        status: 'partial' as const,
        itemsFetched: 100, itemsInserted: 80, itemsSkipped: 0,
        errorMessage: '20 items had bad data',
      }),
    };

    const result = await runScraper(scraper, { db: fakeDb as never, logger: fakeLogger });
    expect(result.status).toBe('partial');
  });
});
