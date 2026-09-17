/**
 * CLI de backtest de swing trade — compra na queda, vende no alvo ou no stop.
 *
 *   node worker/dist/paper/cli-swing.js PETR4,VALE3,ITUB4 2022-01-03 2026-09-03
 *   node worker/dist/paper/cli-swing.js PETR4,VALE3 2022-01-03 2026-09-03 rsi 0.20 0.10
 *
 * Argumentos: <TICKERS> <inicio> <fim> [criterio] [alvo] [stop] [orcamentoMensal]
 *   orcamentoMensal: teto de vendas por mes em BRL. 0 ou omitido = sem teto.
 *   criterio: queda-do-topo (padrao) | rsi | abaixo-da-media
 */
import { queryClient } from '../db.js';
import { rodarBacktest, type ResultadoBacktest } from './backtest.js';
import { buyAndHold } from './estrategia.js';
import { compraNaQueda, type CriterioEntrada } from './estrategia-swing.js';

const brl = (v: unknown) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (v: unknown) => (v === null || v === undefined ? '—' : `${Number(v).toFixed(2)}%`);

function imprimir(r: ResultadoBacktest, rotulo: string): void {
  const m = r.metricas;
  console.log(`\n${'='.repeat(70)}`);
  console.log(rotulo);
  console.log(`${r.inicio} a ${r.fim}  |  ${r.pregoes} pregoes`);
  console.log('='.repeat(70));
  if (!m) {
    console.log('sem dados suficientes');
    return;
  }
  console.log(`Patrimonio       ${brl(m.patrimonioInicial)}  ->  ${brl(m.patrimonioFinal)}`);
  console.log(`Retorno bruto    ${pct(m.retornoPct)}${m.cagrPct ? `   (CAGR ${pct(m.cagrPct)})` : ''}`);
  console.log(`Max drawdown     ${pct(m.maxDrawdownPct)}${m.maxDrawdownEm ? `  em ${m.maxDrawdownEm}` : ''}`);
  console.log(`Volatilidade     ${pct(m.volatilidadeAnualPct)} a.a.`);
  console.log(`Sharpe           ${m.sharpe ? Number(m.sharpe).toFixed(2) : '—'}  (vs Selic 10% a.a.)`);
  console.log(`Trades           ${m.totalTrades}   acerto ${pct(m.taxaAcertoPct)}`);
  if (m.ganhoMedio) console.log(`Ganho medio      ${brl(m.ganhoMedio)}`);
  if (m.perdaMedia) console.log(`Perda media      ${brl(m.perdaMedia)}`);
  if (m.profitFactor) console.log(`Profit factor    ${Number(m.profitFactor).toFixed(2)}`);

  const bruto = Number(m.patrimonioFinal) - Number(m.patrimonioInicial);
  const imp = r.imposto;
  console.log(`\n  Onde o dinheiro foi`);
  console.log(`  Resultado bruto    ${brl(bruto)}`);
  console.log(`  Custo de transacao -${brl(r.custoTotal)}  (ja embutido no bruto)`);
  console.log(`  Imposto de renda   -${brl(imp.impostoTotal)}`);
  console.log(`  RESULTADO LIQUIDO   ${brl(r.resultadoLiquido)}`);
  if (imp.meses.length > 0) {
    console.log(
      `  Meses com venda: ${imp.meses.length}  |  isentos (ate R$20k): ${imp.mesesIsentos}` +
        `  |  tributaveis: ${imp.mesesTributaveis}`
    );
    console.log(`  Lucro que ficou isento: ${brl(imp.lucroIsentoTotal)}`);
    if (Number(imp.prejuizoFinal) > 0) {
      console.log(`  Prejuizo a compensar no fim: ${brl(imp.prejuizoFinal)}`);
    }
  }

  const rej = Object.entries(r.ordensRejeitadas);
  if (rej.length) console.log(`\n  Rejeicoes  ${rej.map(([k, v]) => `${k}=${v}`).join('  ')}`);
}

async function main() {
  const [tickersRaw, inicio, fim, criterio, alvo, stop, orcamento] = process.argv.slice(2);
  if (!tickersRaw || !inicio || !fim) {
    console.error('uso: cli-swing.js <TICKERS> <inicio> <fim> [criterio] [alvo] [stop]');
    process.exit(2);
  }
  const tickers = tickersRaw.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);

  const estrategia = compraNaQueda(tickers, {
    criterio: (criterio as CriterioEntrada) ?? 'queda-do-topo',
    alvo: alvo ? Number(alvo) : 0.15,
    stop: stop ? Number(stop) : 0.08,
    orcamentoMensalVendas: orcamento && Number(orcamento) > 0 ? Number(orcamento) : undefined,
  });

  const r = await rodarBacktest({ estrategia, inicio, fim });
  imprimir(r, estrategia.descricao);

  const bench = await rodarBacktest({ estrategia: buyAndHold(tickers), inicio, fim });
  imprimir(bench, 'BENCHMARK — comprar e segurar os mesmos papeis');

  const difLiquido = Number(r.resultadoLiquido) - Number(bench.resultadoLiquido);
  console.log(`\n${'-'.repeat(70)}`);
  console.log(
    difLiquido >= 0
      ? `A estrategia bateu o buy-and-hold em ${brl(difLiquido)} LIQUIDOS de imposto.`
      : `A estrategia PERDEU do buy-and-hold por ${brl(Math.abs(difLiquido))} liquidos.`
  );
  console.log('-'.repeat(70));

  await queryClient.end();
}

main().catch(async (err) => {
  console.error('backtest falhou:', err instanceof Error ? err.message : err);
  await queryClient.end();
  process.exit(1);
});
