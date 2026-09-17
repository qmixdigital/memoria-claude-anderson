'use server';

import { revalidatePath } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userPortfolio, tickers } from '@qmix-invest/db/schema';
import { getBoss } from '@/lib/pg-boss-client';

export interface ActionResult {
  ok?: boolean;
  error?: string;
  message?: string;
}

function stubCnpjFor(ticker: string): string {
  return `STUB${ticker.padStart(10, '0')}`.slice(0, 14);
}

function normalizeTicker(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.toUpperCase().trim();
  if (!/^[A-Z]{4}\d{1,2}$/.test(t)) return null;
  return t;
}

function inferClass(ticker: string): 'ON' | 'PN' | 'UNT' | 'OTHER' {
  const suffix = ticker.slice(4);
  if (suffix === '3') return 'ON';
  if (suffix === '4' || suffix === '5' || suffix === '6') return 'PN';
  if (suffix === '11') return 'UNT';
  return 'OTHER';
}

function parsePrice(raw: unknown): number | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function ensureTickerExists(ticker: string): Promise<void> {
  const existing = await db
    .select({ ticker: tickers.ticker })
    .from(tickers)
    .where(eq(tickers.ticker, ticker))
    .limit(1);
  if (existing.length > 0) return;

  const stubCnpj = stubCnpjFor(ticker);
  await db.execute(sql`
    insert into qmix_invest.companies (cnpj, name, sector)
    values (${stubCnpj}, ${'Cadastro manual: ' + ticker}, 'Não classificado')
    on conflict (cnpj) do nothing
  `);

  await db.execute(sql`
    insert into qmix_invest.tickers (ticker, cnpj, class, active)
    values (${ticker}, ${stubCnpj}, ${inferClass(ticker)}::qmix_invest.ticker_class, true)
    on conflict (ticker) do nothing
  `);
}

export async function addToWatchlist(formData: FormData): Promise<ActionResult> {
  const ticker = normalizeTicker(formData.get('ticker'));
  if (!ticker) {
    return { error: 'Ticker inválido. Use o formato PETR4, VALE3, ABEV3, etc.' };
  }
  const notesRaw = formData.get('notes');
  const notes = typeof notesRaw === 'string' && notesRaw.trim().length > 0
    ? notesRaw.trim().slice(0, 500)
    : null;
  const purchasePrice = parsePrice(formData.get('purchasePrice'));

  await ensureTickerExists(ticker);

  await db
    .insert(userPortfolio)
    .values({ ticker, notes, purchasePriceBrl: purchasePrice?.toString() ?? null } as never)
    .onConflictDoUpdate({
      target: userPortfolio.ticker,
      set: {
        notes,
        purchasePriceBrl: purchasePrice?.toString() ?? null,
      } as never,
    });

  // Trigger immediate quote fetch for this ticker
  try {
    const boss = await getBoss();
    await boss.send('quote-watchlist', { tickers: [ticker] });
  } catch {
    /* non-fatal */
  }

  revalidatePath('/carteira');
  return { ok: true, message: `${ticker} adicionado à watchlist` };
}

export async function removeFromWatchlist(formData: FormData): Promise<ActionResult> {
  const ticker = normalizeTicker(formData.get('ticker'));
  if (!ticker) return { error: 'Ticker inválido' };

  await db.delete(userPortfolio).where(eq(userPortfolio.ticker, ticker));
  revalidatePath('/carteira');
  return { ok: true, message: `${ticker} removido` };
}

export async function refreshTicker(formData: FormData): Promise<ActionResult> {
  const ticker = normalizeTicker(formData.get('ticker'));
  if (!ticker) return { error: 'Ticker inválido' };

  try {
    const boss = await getBoss();
    await boss.send('quote-watchlist', { tickers: [ticker] });
    revalidatePath('/carteira');
    revalidatePath(`/ativo/${ticker}`);
    return {
      ok: true,
      message: `${ticker} enfileirado: cotação atualizando`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Atualiza cotações (Yahoo) de toda a carteira. GRATUITO.
 * Usado pelo botão "↻ Atualizar cotações".
 */
export async function refreshAllWatchlist(): Promise<ActionResult> {
  const items = (await db.select({ ticker: userPortfolio.ticker }).from(userPortfolio)) as Array<{
    ticker: string;
  }>;
  if (items.length === 0) return { error: 'Carteira vazia' };

  try {
    const boss = await getBoss();
    const list = items.map((i) => i.ticker);
    await boss.send('quote-watchlist', { tickers: list });
    revalidatePath('/carteira');
    return {
      ok: true,
      message: `${list.length} cotações atualizadas via Yahoo (~30s).`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

interface ImportPreviewRow {
  ticker: string;
  quantity: number | null;
  avgPrice: number | null;
  alreadyInWatchlist: boolean;
}

export interface ImportResult extends ActionResult {
  preview?: ImportPreviewRow[];
  inserted?: number;
  updated?: number;
}

const TICKER_HEADER_KEYS = [
  'codigo de negociacao', 'codigo negociacao', 'codigo', 'ticker',
  'codigo do ativo', 'simbolo', 'symbol',
];
const QTY_HEADER_KEYS = [
  'quantidade', 'qtd', 'quantidade disponivel', 'qty', 'quantity',
];
const PRICE_HEADER_KEYS = [
  'preco medio', 'preço médio', 'preco de fechamento', 'preço de fechamento',
  'cotacao', 'preco', 'avg price', 'preco unitario',
];

function normalizeKey(s: string): string {
  return s
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findHeaderIdx(header: unknown[], candidates: string[]): number {
  for (let i = 0; i < header.length; i++) {
    const key = normalizeKey(String(header[i] ?? ''));
    for (const cand of candidates) {
      if (key === cand || key.includes(cand)) return i;
    }
  }
  return -1;
}

interface ParsedRow {
  ticker: string;
  quantity: number | null;
  avgPrice: number | null;
}

async function parseSheetRows(sheetData: unknown[][]): Promise<ParsedRow[]> {
  const out: ParsedRow[] = [];

  // Find header row — scan first 10 rows for one matching ticker keys
  let headerIdx = -1;
  let header: unknown[] = [];
  for (let i = 0; i < Math.min(sheetData.length, 10); i++) {
    const candidate = sheetData[i] ?? [];
    if (findHeaderIdx(candidate, TICKER_HEADER_KEYS) >= 0) {
      headerIdx = i;
      header = candidate;
      break;
    }
  }
  if (headerIdx < 0) return [];

  const tickerCol = findHeaderIdx(header, TICKER_HEADER_KEYS);
  const qtyCol = findHeaderIdx(header, QTY_HEADER_KEYS);
  const priceCol = findHeaderIdx(header, PRICE_HEADER_KEYS);

  for (let i = headerIdx + 1; i < sheetData.length; i++) {
    const row = sheetData[i] ?? [];
    const tickerRaw = String(row[tickerCol] ?? '').trim().toUpperCase();
    if (!/^[A-Z]{4}\d{1,2}$/.test(tickerRaw)) continue;
    const qty = qtyCol >= 0 ? Number(String(row[qtyCol] ?? '').replace(/\./g, '').replace(',', '.')) : null;
    const price = priceCol >= 0 ? Number(String(row[priceCol] ?? '').replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) : null;
    out.push({
      ticker: tickerRaw,
      quantity: Number.isFinite(qty) && qty! > 0 ? qty : null,
      avgPrice: Number.isFinite(price) && price! > 0 ? price : null,
    });
  }
  return out;
}

async function parseTextRows(text: string): Promise<ParsedRow[]> {
  // Accept TSV or CSV or simple "TICKER" per line
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out: ParsedRow[] = [];
  // detect delimiter
  for (const line of lines) {
    const parts = line.split(/[\t;,]/).map((p) => p.trim());
    const ticker = (parts[0] ?? '').toUpperCase();
    if (!/^[A-Z]{4}\d{1,2}$/.test(ticker)) continue;
    const qty = parts[1] ? Number(parts[1].replace(/\./g, '').replace(',', '.')) : null;
    const price = parts[2] ? Number(parts[2].replace(/\./g, '').replace(',', '.')) : null;
    out.push({
      ticker,
      quantity: Number.isFinite(qty) && qty! > 0 ? qty : null,
      avgPrice: Number.isFinite(price) && price! > 0 ? price : null,
    });
  }
  return out;
}

export async function importWatchlist(formData: FormData): Promise<ImportResult> {
  const file = formData.get('file');
  const pasted = formData.get('pasted');
  const dryRun = formData.get('dryRun') === '1';

  let rows: ParsedRow[] = [];

  if (file instanceof File && file.size > 0) {
    const buf = Buffer.from(await file.arrayBuffer());
    const isXlsx = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
    if (isXlsx) {
      try {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(buf, { type: 'buffer' });
        // Try common sheet names first, fall back to all sheets
        const preferred = ['Acoes', 'Ações', 'Ações - Acões', 'Acoes - Acoes', 'Stocks'];
        const sheetNames = [
          ...preferred.filter((n) => wb.SheetNames.includes(n)),
          ...wb.SheetNames.filter((n) => !preferred.includes(n)),
        ];
        for (const name of sheetNames) {
          const ws = wb.Sheets[name];
          if (!ws) continue;
          const data = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as unknown[][];
          const parsed = await parseSheetRows(data);
          rows.push(...parsed);
        }
      } catch (err) {
        return { error: `Falha ao ler XLSX: ${err instanceof Error ? err.message : String(err)}` };
      }
    } else {
      rows = await parseTextRows(buf.toString('utf8'));
    }
  } else if (typeof pasted === 'string' && pasted.trim().length > 0) {
    rows = await parseTextRows(pasted);
  } else {
    return { error: 'Envie um arquivo ou cole o conteúdo da planilha' };
  }

  // Deduplicate by ticker (keep last occurrence — usually most accurate)
  const dedupeMap = new Map<string, ParsedRow>();
  for (const r of rows) {
    const existing = dedupeMap.get(r.ticker);
    if (!existing) {
      dedupeMap.set(r.ticker, r);
    } else {
      dedupeMap.set(r.ticker, {
        ticker: r.ticker,
        quantity: r.quantity ?? existing.quantity,
        avgPrice: r.avgPrice ?? existing.avgPrice,
      });
    }
  }
  const unique = Array.from(dedupeMap.values());
  if (unique.length === 0) {
    return { error: 'Nenhum ticker válido encontrado no arquivo' };
  }

  // Check which are already in watchlist
  const tickerList = unique.map((r) => r.ticker);
  const existing = await db.execute(sql`
    select ticker from qmix_invest.user_portfolio
    where ticker = any(${tickerList})
  `);
  const existingSet = new Set((existing as unknown as Array<{ ticker: string }>).map((r) => r.ticker));

  const preview: ImportPreviewRow[] = unique.map((r) => ({
    ticker: r.ticker,
    quantity: r.quantity,
    avgPrice: r.avgPrice,
    alreadyInWatchlist: existingSet.has(r.ticker),
  }));

  if (dryRun) {
    return { ok: true, preview, message: `${preview.length} ticker(s) detectados` };
  }

  // Real import: ensure stub + insert/update
  let inserted = 0;
  let updated = 0;
  for (const r of unique) {
    await ensureTickerExists(r.ticker);
    const existing = await db
      .select({ ticker: userPortfolio.ticker })
      .from(userPortfolio)
      .where(eq(userPortfolio.ticker, r.ticker))
      .limit(1);
    if (existing.length === 0) {
      await db
        .insert(userPortfolio)
        .values({
          ticker: r.ticker,
          notes: r.quantity ? `${r.quantity} cotas` : null,
          purchasePriceBrl: r.avgPrice?.toString() ?? null,
        } as never);
      inserted++;
    } else if (r.avgPrice !== null) {
      await db
        .update(userPortfolio)
        .set({
          purchasePriceBrl: r.avgPrice.toString(),
        } as never)
        .where(eq(userPortfolio.ticker, r.ticker));
      updated++;
    }
  }

  // Trigger quote refresh for the new ones
  try {
    const boss = await getBoss();
    await boss.send('quote-watchlist', { tickers: tickerList });
  } catch { /* non-fatal */ }

  revalidatePath('/carteira');
  return {
    ok: true,
    inserted,
    updated,
    preview,
    message: `${inserted} novo(s), ${updated} atualizado(s) — cotações sendo buscadas em segundo plano`,
  };
}

/**
 * Registra uma compra adicional, atualizando quantidade e preço médio ponderado.
 * Fórmula: novo_avg = (qtd_antiga × preço_antigo + qtd_nova × preço_nova) ÷ (qtd_antiga + qtd_nova)
 */
export async function addPurchase(formData: FormData): Promise<ActionResult> {
  const ticker = normalizeTicker(formData.get('ticker'));
  if (!ticker) return { error: 'Ticker inválido' };

  const qtyRaw = formData.get('quantity');
  const qty = typeof qtyRaw === 'string' ? Number.parseInt(qtyRaw.replace(/\D/g, ''), 10) : NaN;
  if (!Number.isFinite(qty) || qty <= 0) return { error: 'Quantidade inválida' };

  const price = parsePrice(formData.get('price'));
  if (price === null) return { error: 'Preço inválido' };

  // Carrega posição atual
  const current = await db
    .select({
      qty: userPortfolio.quantity,
      price: userPortfolio.purchasePriceBrl,
      notes: userPortfolio.notes,
    })
    .from(userPortfolio)
    .where(eq(userPortfolio.ticker, ticker))
    .limit(1);

  if (current.length === 0) {
    return { error: `${ticker} não está na watchlist. Adicione primeiro com 'Adicionar ticker'.` };
  }

  const oldQty = current[0]?.qty ?? 0;
  const oldPrice = current[0]?.price ? Number(current[0].price) : 0;

  const newQty = oldQty + qty;
  // Se não havia preço médio, usa o novo direto
  const newAvgPrice = oldPrice > 0 && oldQty > 0
    ? ((oldQty * oldPrice) + (qty * price)) / newQty
    : price;

  await db
    .update(userPortfolio)
    .set({
      quantity: newQty,
      purchasePriceBrl: newAvgPrice.toFixed(4),
    } as never)
    .where(eq(userPortfolio.ticker, ticker));

  revalidatePath('/carteira');
  return {
    ok: true,
    message: `+${qty} cotas a R$ ${price.toFixed(2)} → ${newQty} cotas, preço médio R$ ${newAvgPrice.toFixed(4)}`,
  };
}

export async function updatePurchasePrice(formData: FormData): Promise<ActionResult> {
  const ticker = normalizeTicker(formData.get('ticker'));
  if (!ticker) return { error: 'Ticker inválido' };
  const price = parsePrice(formData.get('purchasePrice'));

  await db
    .update(userPortfolio)
    .set({ purchasePriceBrl: price?.toString() ?? null } as never)
    .where(eq(userPortfolio.ticker, ticker));

  revalidatePath('/carteira');
  return {
    ok: true,
    message: price ? `Preço de compra atualizado: ${price.toFixed(2)}` : 'Preço removido',
  };
}
