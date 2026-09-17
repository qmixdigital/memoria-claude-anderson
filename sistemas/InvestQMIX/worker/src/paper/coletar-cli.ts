/**
 * CLI de coleta intradiaria.
 *   node worker/dist/paper/coletar-cli.js            # universo configurado
 *   node worker/dist/paper/coletar-cli.js PETR4,VALE3
 */
import { queryClient } from '../db.js';
import { coletarIntraday } from '../scrapers/yahoo-intraday.js';

async function main() {
  const arg = process.argv[2];
  const tickers = arg ? arg.split(',').map((t) => t.trim().toUpperCase()) : undefined;
  const r = await coletarIntraday(tickers);
  console.log(`tickers=${r.tickers}  barras=${r.barras}  falhas=${r.falhas}`);
  await queryClient.end();
}

main().catch(async (err) => {
  console.error('coleta falhou:', err instanceof Error ? err.message : err);
  await queryClient.end();
  process.exit(1);
});
