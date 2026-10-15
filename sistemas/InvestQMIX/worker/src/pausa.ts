import { sql } from 'drizzle-orm';
import { db } from './db.js';

// Interruptor global dos alertas da carteira no Telegram. Usa a mesma coluna do
// comando /pause do bot (user_preferences.paused_until), entao /resume religa.
// Nao vale para o robo de simulacao (paper), que e independente da carteira.
export async function alertasPausados(): Promise<boolean> {
  const r = (await db.execute(sql`
    select paused_until from qmix_invest.user_preferences limit 1
  `)) as unknown as Array<{ paused_until: Date | null }>;
  const p = r[0]?.paused_until;
  return p != null && new Date(p) > new Date();
}
