import { request, ProxyAgent, type Dispatcher } from 'undici';
import { setTimeout as sleep } from 'node:timers/promises';
import { logger } from '../logger.js';
import { getProxy, reportProxyFailure } from './proxy-pool.js';

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'HEAD';
  headers?: Record<string, string>;
  body?: string | Buffer;
  timeoutMs?: number;
  retries?: number;
  useProxy?: boolean;
  userAgent?: string;
}

const DEFAULT_USER_AGENT = 'QMIX Invest scraper - contato@qmix.com.br';

export async function fetchWithRetry(
  url: string,
  opts: FetchOptions = {}
): Promise<{ statusCode: number; body: Buffer; headers: Record<string, string | string[] | undefined> }> {
  const retries = opts.retries ?? 3;
  const timeoutMs = opts.timeoutMs ?? 30_000;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let proxyUrl: string | undefined;
    let dispatcher: Dispatcher | undefined;
    if (opts.useProxy) {
      proxyUrl = getProxy();
      if (proxyUrl) dispatcher = new ProxyAgent({ uri: proxyUrl });
    }

    try {
      const response = await request(url, {
        method: opts.method ?? 'GET',
        headers: {
          'User-Agent': opts.userAgent ?? DEFAULT_USER_AGENT,
          ...(opts.headers ?? {}),
        },
        body: opts.body,
        bodyTimeout: timeoutMs,
        headersTimeout: timeoutMs,
        dispatcher,
      });

      const chunks: Buffer[] = [];
      for await (const chunk of response.body) chunks.push(chunk as Buffer);
      const body = Buffer.concat(chunks);

      if (response.statusCode >= 500) {
        if (attempt < retries) {
          const delay = 1000 * Math.pow(2, attempt);
          logger.warn({ url, attempt, statusCode: response.statusCode }, 'server error, retrying');
          await sleep(delay);
          continue;
        }
        throw new Error(`server error ${response.statusCode} for ${url} after ${retries} retries`);
      }
      return { statusCode: response.statusCode, body, headers: response.headers };
    } catch (err) {
      if (proxyUrl) reportProxyFailure(proxyUrl);
      if (attempt >= retries) throw err;
      const delay = 1000 * Math.pow(2, attempt);
      logger.warn({ url, attempt, err }, 'request failed, retrying');
      await sleep(delay);
    }
  }
  throw new Error(`exhausted retries for ${url}`);
}
