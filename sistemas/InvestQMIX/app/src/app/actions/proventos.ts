'use server';

import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

interface ParsedProvento {
  ticker: string;
  productType: string | null;
  eventType: string;
  referenceDate: string | null;
  comDate: string | null;
  paymentDate: string | null;
  grossPerShareBrl: number | null;
  closePriceBrl: number | null;
  dyEventPct: number | null;
  inPortfolio: boolean;
  sourceUrl: string | null;
}

function parseDateBR(s: unknown): string | null {
  if (typeof s !== 'string') return null;
  const m = s.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function parseNumberBR(s: unknown): number | null {
  if (s === null || s === undefined) return null;
  const str = String(s).trim().replace(/\./g, '').replace(',', '.');
  if (!str || str === '-') return null;
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

function extractTicker(produto: string): string | null {
  const t = produto.trim().split('-')[0]?.trim().toUpperCase() ?? '';
  if (/^[A-Z]{4}\d{1,2}[A-Z]?$/.test(t)) return t;
  return null;
}

function hashRow(p: ParsedProvento): string {
  return createHash('sha256')
    .update([
      p.ticker,
      p.eventType,
      p.referenceDate ?? '',
      p.comDate ?? '',
      p.paymentDate ?? '',
      String(p.grossPerShareBrl ?? ''),
    ].join('|'))
    .digest('hex');
}

export interface ProventosImportResult {
  ok?: boolean;
  error?: string;
  preview?: ParsedProvento[];
  inserted?: number;
  skipped?: number;
}

export async function importProventos(formData: FormData): Promise<ProventosImportResult> {
  const file = formData.get('file');
  const dryRun = formData.get('dryRun') === '1';
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Envie o arquivo XLSX do calendário de proventos da B3' };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const XLSX = await import('xlsx');
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase().includes('proventos') || n.toLowerCase().includes('eventos')) ?? wb.SheetNames[0];
  if (!sheetName) return { error: 'Nenhuma aba encontrada no arquivo' };

  const ws = wb.Sheets[sheetName];
  if (!ws) return { error: 'Aba inválida' };
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as unknown[][];
  if (rows.length < 2) return { error: 'Arquivo vazio' };

  const parsed: ParsedProvento[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    const ticker = extractTicker(String(r[1] ?? ''));
    const eventType = String(r[3] ?? '').trim();
    if (!ticker || !eventType) continue;

    parsed.push({
      ticker,
      productType: (r[2] ? String(r[2]).trim() : null),
      eventType,
      referenceDate: parseDateBR(r[0]),
      comDate: parseDateBR(r[4]),
      paymentDate: parseDateBR(r[5]),
      grossPerShareBrl: parseNumberBR(r[6]),
      closePriceBrl: parseNumberBR(r[7]),
      dyEventPct: parseNumberBR(r[8]),
      inPortfolio: String(r[9] ?? '').trim().toLowerCase().startsWith('sim'),
      sourceUrl: r[10] ? String(r[10]).trim() : null,
    });
  }

  if (parsed.length === 0) return { error: 'Nenhum provento válido encontrado' };

  if (dryRun) {
    return { ok: true, preview: parsed.slice(0, 50), inserted: 0, skipped: parsed.length };
  }

  let inserted = 0;
  let skipped = 0;
  for (const p of parsed) {
    const sourceHash = hashRow(p);
    try {
      const result = await db.execute(sql`
        insert into qmix_invest.proventos (
          ticker, product_type, event_type, reference_date, com_date, payment_date,
          gross_per_share_brl, close_price_brl, dy_event_pct, in_portfolio, source_url, source_hash
        ) values (
          ${p.ticker}, ${p.productType}, ${p.eventType}, ${p.referenceDate}, ${p.comDate},
          ${p.paymentDate}, ${p.grossPerShareBrl}, ${p.closePriceBrl}, ${p.dyEventPct},
          ${p.inPortfolio}, ${p.sourceUrl}, ${sourceHash}
        )
        on conflict (source_hash) do nothing
        returning id
      `);
      if ((result as unknown as unknown[]).length > 0) inserted++;
      else skipped++;
    } catch {
      skipped++;
    }
  }

  revalidatePath('/proventos');
  return { ok: true, inserted, skipped };
}

export async function importProventosAReceber(formData: FormData): Promise<{ ok?: boolean; error?: string; inserted?: number; total?: number }> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Envie o XLSX "Proventos a Receber" da B3' };
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const XLSX = await import('xlsx');
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.SheetNames.find((n) => n.toLowerCase().includes('receber')) ?? wb.SheetNames[0];
  if (!sheet) return { error: 'Nenhuma aba encontrada' };
  const ws = wb.Sheets[sheet];
  if (!ws) return { error: 'Aba inválida' };
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as unknown[][];

  let inserted = 0;
  let total = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    const ticker = String(r[0] ?? '').split('-')[0]?.trim().toUpperCase() ?? '';
    if (!/^[A-Z]{4}\d{1,2}$/.test(ticker)) continue;
    const eventType = String(r[2] ?? '').trim();
    if (!eventType) continue;
    const dateRaw = String(r[3] ?? '').trim();
    const m = dateRaw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const paymentDate = m ? `${m[3]}-${m[2]}-${m[1]}` : null;
    const qty = Number(String(r[6] ?? '0').replace(',', '.'));
    const gross = Number(String(r[7] ?? '0').replace(',', '.'));
    const net = Number(String(r[8] ?? '0').replace(',', '.'));
    if (!qty || !net) continue;
    total += net;
    const sourceHash = createHash('sha256')
      .update([ticker, eventType, paymentDate ?? '', String(qty), String(gross), String(net), String(i)].join('|'))
      .digest('hex');
    const result = await db.execute(sql`
      insert into qmix_invest.proventos_a_receber (ticker, event_type, payment_date, quantity, gross_per_share_brl, net_value_brl, source_hash)
      values (${ticker}, ${eventType}, ${paymentDate}, ${qty}, ${gross || null}, ${net}, ${sourceHash})
      on conflict (source_hash) do nothing
      returning id
    `);
    if ((result as unknown as unknown[]).length > 0) inserted++;
  }
  revalidatePath('/proventos');
  return { ok: true, inserted, total: Math.round(total * 100) / 100 };
}
