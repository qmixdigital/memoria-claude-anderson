import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db.js';
import { tickers } from '@qmix-invest/db/schema';
import { logger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV = path.resolve(__dirname, 'data/tickers.csv');

export async function seedTickers(): Promise<number> {
  const text = await readFile(CSV, 'utf-8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return 0;
  const records = lines.slice(1).map((line) => {
    const [ticker, cnpj, classRaw, isSmallCap] = line.split(';');
    return {
      ticker: ticker!.trim().toUpperCase(),
      cnpj: cnpj!.replace(/\D/g, ''),
      class: (classRaw!.trim() as 'ON' | 'PN' | 'UNT' | 'OTHER'),
      isSmallCap: isSmallCap?.trim() === 'true',
      active: true,
    };
  });
  const result = await db.insert(tickers).values(records as never).onConflictDoNothing();
  const inserted = (result as { rowCount?: number }).rowCount ?? records.length;
  logger.info({ records: records.length, inserted }, 'seeded tickers');
  return inserted;
}
