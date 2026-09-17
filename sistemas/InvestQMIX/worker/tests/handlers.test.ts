import { describe, it, expect, vi } from 'vitest';

describe('registerHandlers', () => {
  it('registers the scraper queue and scheduled jobs', async () => {
    const fakeBoss = {
      createQueue: vi.fn().mockResolvedValue(undefined),
      work: vi.fn().mockResolvedValue(undefined),
      schedule: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
    };
    const { registerHandlers, REGISTERED_SCRAPERS } = await import('../src/handlers');
    await registerHandlers(fakeBoss as never);

    // b3-prices + quote-watchlist + watchlist-realtime-alerts + b3-tickers-bootstrap
    // + watchlist-daily-report + tax-fim-de-mes + tax-lembrete-recompra
    // + tax-lembrete-darf = 8 boss.work calls
    expect(fakeBoss.work).toHaveBeenCalledTimes(8);
    // schedules: tudo acima menos watchlist-realtime-alerts (on-demand) = 7
    expect(fakeBoss.schedule).toHaveBeenCalledTimes(7);
    expect(REGISTERED_SCRAPERS.length).toBe(1);
  });

  it('registers the expected queue names', async () => {
    const queueNames: string[] = [];
    const fakeBoss = {
      createQueue: vi.fn().mockResolvedValue(undefined),
      work: vi.fn(async (name: string) => { queueNames.push(name); }),
      schedule: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
    };
    const { registerHandlers } = await import('../src/handlers?names');
    await registerHandlers(fakeBoss as never);

    expect(queueNames).toContain('scrape:b3-prices');
    expect(queueNames).toContain('quote-watchlist');
    expect(queueNames).toContain('watchlist-realtime-alerts');
    expect(queueNames).toContain('b3-tickers-bootstrap');
    expect(queueNames).toContain('watchlist-daily-report');
    expect(queueNames).toContain('tax-fim-de-mes');
  });
});
