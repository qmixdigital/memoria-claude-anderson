import { logger } from '../logger.js';
import { env } from '../env.js';

interface ProxyEntry {
  url: string;
  failures: number;
  cooldownUntil: number;
}

const POOL: ProxyEntry[] = env.PROXY_POOL
  ? env.PROXY_POOL.split(',').map((s) => s.trim()).filter(Boolean).map((url) => ({
      url, failures: 0, cooldownUntil: 0,
    }))
  : [];

let cursor = 0;

export function getProxy(): string | undefined {
  if (POOL.length === 0) return undefined;
  const now = Date.now();
  for (let i = 0; i < POOL.length; i++) {
    const entry = POOL[(cursor + i) % POOL.length];
    if (!entry || entry.cooldownUntil > now) continue;
    cursor = (cursor + i + 1) % POOL.length;
    return entry.url;
  }
  logger.warn({ poolSize: POOL.length }, 'all proxies in cooldown — using direct connection');
  return undefined;
}

export function reportProxyFailure(url: string): void {
  const entry = POOL.find((p) => p.url === url);
  if (!entry) return;
  entry.failures += 1;
  if (entry.failures >= 3) {
    entry.cooldownUntil = Date.now() + 60 * 60 * 1000;
    entry.failures = 0;
    logger.warn({ proxy: url }, 'proxy cooldown 1h after 3 failures');
  }
}
