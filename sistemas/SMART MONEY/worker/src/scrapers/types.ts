import type { Db } from '../db.js';

export type ScraperOutcome =
  | { status: 'success'; itemsFetched: number; itemsInserted: number; itemsSkipped: number; metadata?: Record<string, unknown> }
  | { status: 'partial'; itemsFetched: number; itemsInserted: number; itemsSkipped: number; errorMessage: string }
  | { status: 'failed'; errorMessage: string };

export interface ScraperContext {
  db: Db;
  logger: import('pino').Logger;
  signal?: AbortSignal;
}

export interface Scraper {
  source: string;
  run: (ctx: ScraperContext) => Promise<ScraperOutcome>;
}
