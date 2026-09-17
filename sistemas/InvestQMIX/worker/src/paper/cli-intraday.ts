/**
 * CLI de backtest de day trade.
 *
 *   node worker/dist/paper/cli-intraday.js PETR4,VALE3 2026-06-15 2026-09-04
 *   node worker/dist/paper/cli-intraday.js PETR4 2026-06-15 2026-09-04 30 0.005 0.01
 */
import { queryClient } from '../db.js';
import { rodarBacktestIntraday } from './backtest-intraday.js';
import { rompimentoAbertura } from './estrategia-intraday.js';

const brl = (v: unknown) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (v: unknown) => (v === null || v === undefined ? '—' : `${Number(v).toFixed(2)}%`);

async function main() {
  const [tickersRaw, inicio, fim, faixa, stop, alvo] = process.argv.slice(2);
  if (!tickersRaw || !inicio || !fim) {
    console.error('uso: cli-intraday.js <TICKERS> <inicio> <fim> [minFaixa] [stop] [alvo]');
    process.exit(2);
  }
  const tickers = tickersRaw.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);

  const estrategia = rompimentoAbertura(tickers, {
    minutosFaixa: faixa ? Number(faixa) : 30,
    stopPct: stop ? Number(stop) : 0.005,
    alvoPct: alvo ? Number(alvo) : 0.01,
  });

  const r = await rodarBacktestIntraday({ estrategia, inicio, fim });
  const m = r.metricas;

  console.log(`\n${'='.repeat(66)}`);
  console.log(estrategia.descricao);
  console.log(`${r.inicio} a ${r.fim}  |  ${r.pregoes} pregoes  |  ${r.barras} barras de 5 min`);
  console.log('='.repeat(66));

  if (!m) {
    console.log('sem dados suficientes');
  } else {
    const bruto = Number(m.patrimonioFinal) - Number(m.patrimonioInicial);
    console.log(`Patrimonio      ${brl(m.patrimonioInicial)}  ->  ${brl(m.patrimonioFinal)}`);
    console.log(`Resultado bruto ${brl(bruto)}   (${pct(m.retornoPct)})`);
    console.log(`Max drawdown    ${pct(m.maxDrawdownPct)}`);
    console.log(`Trades          ${m.totalTrades}   acerto ${pct(m.taxaAcertoPct)}`);
    if (m.ganhoMedio) console.log(`Ganho medio     ${brl(m.ganhoMedio)}`);
    if (m.perdaMedia) console.log(`Perda media     ${brl(m.perdaMedia)}`);
    if (m.profitFactor) console.log(`Profit factor   ${Number(m.profitFactor).toFixed(2)}`);
    console.log(`Fechados na força  ${r.fechamentosForcados}   (posicoes zeradas no fim do pregao)`);

    console.log(`\n${'-'.repeat(66)}`);
    console.log('ONDE O DINHEIRO FOI');
    console.log('-'.repeat(66));
    console.log(`Resultado bruto      ${brl(bruto)}`);
    console.log(`Custo de transacao  -${brl(r.custoTotal)}   (ja embutido no bruto)`);
    console.log(`Imposto (20% DT)    -${brl(r.impostoTotal)}`);
    console.log(`RESULTADO LIQUIDO    ${brl(r.resultadoLiquido)}`);

    if (r.imposto.length > 0) {
      console.log(`\nApuracao mes a mes:`);
      for (const mes of r.imposto) {
        console.log(
          `  ${mes.mes}  resultado ${brl(mes.resultadoBruto).padStart(14)}` +
            `  IRRF ${brl(mes.irrfRetido).padStart(10)}` +
            `  a recolher ${brl(mes.impostoARecolher).padStart(12)}`
        );
      }
    }
  }

  const rej = Object.entries(r.rejeicoes);
  if (rej.length) console.log(`\nRejeicoes  ${rej.map(([k, v]) => `${k}=${v}`).join('  ')}`);

  await queryClient.end();
}

main().catch(async (err) => {
  console.error('backtest falhou:', err instanceof Error ? err.message : err);
  await queryClient.end();
  process.exit(1);
});
