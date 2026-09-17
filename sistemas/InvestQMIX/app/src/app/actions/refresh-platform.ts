'use server';

import { revalidatePath } from 'next/cache';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { getBoss } from '@/lib/pg-boss-client';

export interface RefreshResult {
  ok?: boolean;
  error?: string;
  message?: string;
  details?: {
    quotedTickers: number;
    indexesRefreshed: boolean;
  };
}

/**
 * Atualiza as cotações intraday (Yahoo Finance) de toda a carteira + watchlist
 * e dos ativos com cotação defasada, e invalida o cache do dashboard.
 */
export async function refreshPlatform(): Promise<RefreshResult> {
  try {
    // 1. Tickers da carteira
    const wlRows = (await db.execute(sql`
      select ticker from qmix_invest.user_portfolio
    `)) as unknown as Array<{ ticker: string }>;
    const watchlistTickers = wlRows.map((r) => r.ticker);

    // 2. Tickers ativos com cotação stale (> 1h ou nula)
    const staleRows = (await db.execute(sql`
      select ticker from qmix_invest.tickers
      where active = true
        and (last_quote_at is null or last_quote_at < now() - interval '1 hour')
      limit 100
    `)) as unknown as Array<{ ticker: string }>;
    const allToQuote = Array.from(new Set([...watchlistTickers, ...staleRows.map((r) => r.ticker)]));

    const boss = await getBoss();

    // 3. Enfileira cotações
    if (allToQuote.length > 0) {
      await boss.send('quote-watchlist', { tickers: allToQuote });
    }

    revalidatePath('/');
    revalidatePath('/carteira');
    revalidatePath('/watchlist');
    revalidatePath('/proventos');

    return {
      ok: true,
      message: `Atualização enfileirada: ${allToQuote.length} cotações (~30s pra ficar pronto).`,
      details: {
        quotedTickers: allToQuote.length,
        indexesRefreshed: true,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
