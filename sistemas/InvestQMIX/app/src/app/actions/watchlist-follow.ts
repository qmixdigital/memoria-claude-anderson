'use server';

import { revalidatePath } from 'next/cache';
import { sql, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userWatchlist, tickers } from '@qmix-invest/db/schema';

export async function followTicker(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const tickerRaw = (formData.get('ticker') as string | null)?.trim().toUpperCase();
  if (!tickerRaw || !/^[A-Z]{4}\d{1,2}$/.test(tickerRaw)) {
    return { ok: false, error: 'Ticker inválido' };
  }

  const exists = await db
    .select({ ticker: tickers.ticker })
    .from(tickers)
    .where(eq(tickers.ticker, tickerRaw))
    .limit(1);
  if (exists.length === 0) {
    return { ok: false, error: `Ticker ${tickerRaw} não está cadastrado` };
  }

  await db.insert(userWatchlist).values({ ticker: tickerRaw }).onConflictDoNothing();
  revalidatePath('/watchlist');
  revalidatePath(`/ativo/${tickerRaw}`);
  return { ok: true };
}

export async function unfollowTicker(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const tickerRaw = (formData.get('ticker') as string | null)?.trim().toUpperCase();
  if (!tickerRaw) return { ok: false, error: 'Ticker inválido' };

  await db.delete(userWatchlist).where(eq(userWatchlist.ticker, tickerRaw));
  revalidatePath('/watchlist');
  revalidatePath(`/ativo/${tickerRaw}`);
  return { ok: true };
}

export async function isFollowing(ticker: string): Promise<boolean> {
  const t = ticker.trim().toUpperCase();
  const result = await db.execute(
    sql`select 1 from qmix_invest.user_watchlist where ticker = ${t} limit 1`
  );
  return (result as unknown as Array<unknown>).length > 0;
}
