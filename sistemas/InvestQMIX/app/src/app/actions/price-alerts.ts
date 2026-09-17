'use server';

import { revalidatePath } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { priceAlerts, tickers } from '@qmix-invest/db/schema';

export interface AlertResult {
  ok?: boolean;
  error?: string;
  message?: string;
}

function parsePrice(raw: unknown): number | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeTicker(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.toUpperCase().trim();
  if (!/^[A-Z]{4}\d{1,2}$/.test(t)) return null;
  return t;
}

export async function createPriceAlert(formData: FormData): Promise<AlertResult> {
  const ticker = normalizeTicker(formData.get('ticker'));
  const kind = formData.get('kind');
  const target = parsePrice(formData.get('targetPrice'));
  const notesRaw = formData.get('notes');
  const notes = typeof notesRaw === 'string' && notesRaw.trim().length > 0 ? notesRaw.trim().slice(0, 200) : null;

  if (!ticker) return { error: 'Ticker inválido' };
  if (kind !== 'target_high' && kind !== 'stop_loss') return { error: 'Tipo inválido' };
  if (target === null) return { error: 'Preço alvo inválido' };

  // Confirma que o ticker existe
  const exists = await db.select({ ticker: tickers.ticker }).from(tickers).where(eq(tickers.ticker, ticker)).limit(1);
  if (exists.length === 0) return { error: `${ticker} não encontrado na base. Adicione na watchlist primeiro.` };

  await db.insert(priceAlerts).values({
    ticker,
    kind,
    targetPrice: target.toString(),
    notes,
    active: true,
  } as never);

  revalidatePath('/alertas');
  revalidatePath('/carteira');
  return { ok: true, message: `Alerta criado: ${ticker} ${kind === 'target_high' ? '≥' : '≤'} R$ ${target.toFixed(2)}` };
}

export async function deletePriceAlert(formData: FormData): Promise<AlertResult> {
  const idRaw = formData.get('id');
  const id = typeof idRaw === 'string' ? Number.parseInt(idRaw, 10) : NaN;
  if (!Number.isFinite(id)) return { error: 'ID inválido' };

  await db.delete(priceAlerts).where(eq(priceAlerts.id, id));
  revalidatePath('/alertas');
  revalidatePath('/carteira');
  return { ok: true };
}

export async function toggleAlertActive(formData: FormData): Promise<AlertResult> {
  const idRaw = formData.get('id');
  const id = typeof idRaw === 'string' ? Number.parseInt(idRaw, 10) : NaN;
  if (!Number.isFinite(id)) return { error: 'ID inválido' };

  await db.execute(sql`
    update qmix_invest.price_alerts
    set active = NOT active,
        triggered_at = NULL,
        triggered_price = NULL,
        notified_at = NULL
    where id = ${id}
  `);
  revalidatePath('/alertas');
  return { ok: true };
}
