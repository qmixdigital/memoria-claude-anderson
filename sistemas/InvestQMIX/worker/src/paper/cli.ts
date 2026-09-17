/**
 * CLI de backtest.
 *
 *   node worker/dist/paper/cli.js buy-and-hold PETR4,VALE3 2022-01-01 2026-09-03
 *   node worker/dist/paper/cli.js cruzamento PETR4 2022-01-01 2026-09-03 20 50
 *
 * Roda dentro do container do worker, que ja tem DATABASE_URL:
 *   docker compose run --rm worker node worker/dist/paper/cli.js ...
 */
import { queryClient } from '../db.js';
import { rodarBacktest, type ResultadoBacktest } from './backtest.js';
import { buyAndHold, cruzamentoMedias } from './estrategia.js';

function brl(v: unknown): string {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pct(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return `${Number(v).toFixed(2)}%`;
}

function imprimir(r: ResultadoBacktest, rotulo: string): void {
  const m = r.metricas;
  console.log(`\n${'='.repeat(64)}`);
  console.log(`${rotulo}  |  ${r.inicio} a ${r.fim}  |  ${r.pregoes} pregoes`);
  console.log('='.repeat(64));
  if (!m) {
    console.log('sem dados suficientes');
    return;
  }
  console.log(`Patrimonio     ${brl(m.patrimonioInicial)}  ->  ${brl(m.patrimonioFinal)}`);
  console.log(`Retorno        ${pct(m.retornoPct)}${m.cagrPct ? `   (CAGR ${pct(m.cagrPct)})` : ''}`);
  console.log(`Max drawdown   ${pct(m.maxDrawdownPct)}${m.maxDrawdownEm ? `   em ${m.maxDrawdownEm}` : ''}`);
  console.log(`Volatilidade   ${pct(m.volatilidadeAnualPct)} a.a.`);
  console.log(`Sharpe         ${m.sharpe ? Number(m.sharpe).toFixed(2) : '—'}   (vs Selic 10% a.a.)`);
  console.log(`Trades         ${m.totalTrades}   acerto ${pct(m.taxaAcertoPct)}`);
  if (m.ganhoMedio) console.log(`Ganho medio    ${brl(m.ganhoMedio)}`);
  if (m.perdaMedia) console.log(`Perda media    ${brl(m.perdaMedia)}`);
  if (m.profitFactor) console.log(`Profit factor  ${Number(m.profitFactor).toFixed(2)}`);
  console.log(`Custo total    ${brl(r.custoTotal)}   (${pct(r.custoSobrePatrimonioPct)} do patrimonio final)`);
  const rej = Object.entries(r.ordensRejeitadas);
  if (rej.length) {
    console.log(`Rejeicoes      ${rej.map(([k, v]) => `${k}=${v}`).join('  ')}`);
  }
}

async function main() {
  const [chave, tickersRaw, inicio, fim, a, b] = process.argv.slice(2);
  if (!chave || !tickersRaw || !inicio || !fim) {
    console.error('uso: cli.js <buy-and-hold|cruzamento> <TICKERS> <inicio> <fim> [curta] [longa]');
    process.exit(2);
  }
  const tickers = tickersRaw.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);

  const estrategia =
    chave === 'cruzamento'
      ? cruzamentoMedias(tickers, Number(a ?? 20), Number(b ?? 50))
      : buyAndHold(tickers);

  const resultado = await rodarBacktest({ estrategia, inicio, fim });
  imprimir(resultado, estrategia.descricao);

  // Benchmark obrigatorio: a estrategia ativa bate o comprar-e-segurar dos
  // MESMOS papeis? Se nao bater, ela nao esta agregando nada.
  if (chave !== 'buy-and-hold') {
    const bench = await rodarBacktest({ estrategia: buyAndHold(tickers), inicio, fim });
    imprimir(bench, 'BENCHMARK — comprar e segurar os mesmos papeis');

    const dif =
      Number(resultado.metricas?.retornoPct ?? 0) - Number(bench.metricas?.retornoPct ?? 0);
    console.log(`\n${'-'.repeat(64)}`);
    console.log(
      dif >= 0
        ? `A estrategia bateu o buy-and-hold em ${dif.toFixed(2)} pontos percentuais.`
        : `A estrategia PERDEU do buy-and-hold por ${Math.abs(dif).toFixed(2)} pontos percentuais.`
    );
    console.log('-'.repeat(64));
  }

  await queryClient.end();
}

main().catch(async (err) => {
  console.error('backtest falhou:', err instanceof Error ? err.message : err);
  await queryClient.end();
  process.exit(1);
});
