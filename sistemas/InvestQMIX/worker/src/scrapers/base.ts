import { scraperRuns } from '@qmix-invest/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { Scraper, ScraperContext, ScraperOutcome } from './types.js';

export async function runScraper(
  scraper: Scraper,
  ctx: ScraperContext
): Promise<ScraperOutcome> {
  const log = ctx.logger.child({ scraper: scraper.source });
  log.info('starting scraper run');

  const inserted = await ctx.db
    .insert(scraperRuns)
    .values({ source: scraper.source, status: 'running' })
    .returning({ id: scraperRuns.id });
  const runId = (inserted as Array<{ id: number }>)[0]?.id;
  if (runId === undefined) {
    log.error('failed to open scraper_runs row');
    return { status: 'failed', errorMessage: 'could not open scraper_runs row' };
  }

  let outcome: ScraperOutcome;
  try {
    outcome = await scraper.run(ctx);
    log.info({ outcome }, 'scraper completed');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log.error({ err }, 'scraper threw');
    outcome = { status: 'failed', errorMessage };
  }

  await ctx.db
    .update(scraperRuns)
    .set({
      finishedAt: sql`now()`,
      status: outcome.status,
      itemsFetched: outcome.status === 'failed' ? 0 : outcome.itemsFetched,
      itemsInserted: outcome.status === 'failed' ? 0 : outcome.itemsInserted,
      itemsSkipped: outcome.status === 'failed' ? 0 : outcome.itemsSkipped,
      errorMessage:
        outcome.status === 'partial' || outcome.status === 'failed'
          ? outcome.errorMessage
          : null,
      metadataJson:
        outcome.status === 'success' && outcome.metadata
          ? JSON.stringify(outcome.metadata)
          : null,
    })
    .where(eq(scraperRuns.id, runId));

  return outcome;
}
