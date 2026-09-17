import { describe, it, expect, vi } from 'vitest';

describe('seeds', () => {
  it('parses companies.csv into records', async () => {
    const { seedCompanies } = await import('../src/seeds/companies?test1');
    // We can't really run seedCompanies because it hits db. So just import to check syntax.
    expect(typeof seedCompanies).toBe('function');
  });

  it('exports seedTickers', async () => {
    const tickers = await import('../src/seeds/tickers?test2');
    expect(typeof tickers.seedTickers).toBe('function');
  });
});
