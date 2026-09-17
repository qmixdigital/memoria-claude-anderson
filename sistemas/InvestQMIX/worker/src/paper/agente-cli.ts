/** Roda um ciclo de pesquisa na hora, sem esperar o agendamento de sábado. */
import { queryClient } from '../db.js';
import { rodarAgentePesquisa } from './agente.js';

async function main() {
  const r = await rodarAgentePesquisa();
  console.log(`hipoteses executadas: ${r.hipoteses}`);
  await queryClient.end();
}

main().catch(async (err) => {
  console.error('agente falhou:', err instanceof Error ? err.message : err);
  await queryClient.end();
  process.exit(1);
});
