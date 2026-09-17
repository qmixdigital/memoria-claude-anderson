import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db.js';
import { companies } from '@qmix-invest/db/schema';
import { logger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV = path.resolve(__dirname, 'data/companies.csv');

export async function seedCompanies(): Promise<number> {
  const text = await readFile(CSV, 'utf-8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return 0;
  const records = lines.slice(1).map((line) => {
    const [cnpj, name, sector, subsector, cvmCode] = line.split(';');
    return {
      cnpj: cnpj!.replace(/\D/g, ''),
      name: name!.trim(),
      sector: sector?.trim() || null,
      subsector: subsector?.trim() || null,
      cvmCode: cvmCode?.trim() || null,
    };
  });
  const result = await db.insert(companies).values(records as never).onConflictDoNothing();
  const inserted = (result as { rowCount?: number }).rowCount ?? records.length;
  logger.info({ records: records.length, inserted }, 'seeded companies');
  return inserted;
}
