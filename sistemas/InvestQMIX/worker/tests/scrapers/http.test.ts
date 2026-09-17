import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher, type Dispatcher } from 'undici';

vi.mock('../../src/scrapers/proxy-pool', () => ({
  getProxy: () => undefined,
  reportProxyFailure: vi.fn(),
}));

let mockAgent: MockAgent;
let originalDispatcher: Dispatcher;

beforeEach(() => {
  originalDispatcher = getGlobalDispatcher();
  mockAgent = new MockAgent();
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);
});

afterEach(() => {
  setGlobalDispatcher(originalDispatcher);
});

describe('fetchWithRetry', () => {
  it('returns 200 response body on success', async () => {
    const mockPool = mockAgent.get('https://example.test');
    mockPool.intercept({ path: '/data', method: 'GET' }).reply(200, 'hello world');

    const { fetchWithRetry } = await import('../../src/scrapers/http?ok');
    const res = await fetchWithRetry('https://example.test/data');
    expect(res.statusCode).toBe(200);
    expect(res.body.toString('utf8')).toBe('hello world');
  });

  it('retries on 503 and eventually succeeds', async () => {
    let calls = 0;
    const mockPool = mockAgent.get('https://example.test');

    // Queue 2 x 503 then 1 x 200
    mockPool.intercept({ path: '/flaky', method: 'GET' }).reply(() => {
      calls += 1;
      return { statusCode: 503, data: '' };
    });
    mockPool.intercept({ path: '/flaky', method: 'GET' }).reply(() => {
      calls += 1;
      return { statusCode: 503, data: '' };
    });
    mockPool.intercept({ path: '/flaky', method: 'GET' }).reply(() => {
      calls += 1;
      return { statusCode: 200, data: 'ok' };
    });

    const { fetchWithRetry } = await import('../../src/scrapers/http?flaky');
    const res = await fetchWithRetry('https://example.test/flaky', { retries: 3, timeoutMs: 2000 });
    expect(res.statusCode).toBe(200);
    expect(calls).toBe(3);
  }, 30_000);

  it('throws after exhausting retries', async () => {
    const mockPool = mockAgent.get('https://example.test');

    // Queue enough 503s to exhaust retries=1 (attempt 0 + attempt 1 = 2 requests)
    mockPool.intercept({ path: '/dead', method: 'GET' }).reply(503, '');
    mockPool.intercept({ path: '/dead', method: 'GET' }).reply(503, '');

    const { fetchWithRetry } = await import('../../src/scrapers/http?dead');
    await expect(
      fetchWithRetry('https://example.test/dead', { retries: 1, timeoutMs: 1000 })
    ).rejects.toThrow();
  }, 30_000);
});
