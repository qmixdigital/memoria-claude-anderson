/** Mostra a janela fiscal de agora, sem esperar o agendamento. */
import { queryClient } from '../db.js';
import { calcularJanelaAtual } from './alerta-janela.js';

const brl = (v: unknown) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

async function main() {
  const j = await calcularJanelaAtual();
  console.log(`\nJanela fiscal — ${j.mes}`);
  console.log('='.repeat(60));
  console.log(`Vendas do mes       ${brl(j.vendidoNoMes)} de ${brl(j.limiteLegal)}`);
  console.log(`Margem isenta       ${brl(j.margemIsenta)}`);
  console.log(`Mes ja tributavel   ${j.mesJaTributavel ? 'SIM' : 'nao'}`);
  console.log(`Credito de prejuizo ${brl(j.creditoDisponivel)}`);
  console.log(`Lucro nao realizado ${brl(j.lucroNaoRealizado)}`);
  console.log(`Prejuizo nao realiz ${brl(j.prejuizoNaoRealizado)}`);

  if (j.janelaIsenta.length) {
    console.log(`\nJanela isenta — lucro possivel ${brl(j.lucroIsentoPossivel)}`);
    for (const s of j.janelaIsenta) {
      console.log(`  ${s.ticker}: ${s.quantidade} acoes · venda ${brl(s.valorVenda)} · lucro ${brl(s.lucro)} · giro ${brl(s.custoGiro)}`);
    }
  }
  if (j.janelaCredito.length) {
    console.log(`\nJanela do credito — lucro coberto ${brl(j.lucroCobertoPeloCredito)}`);
    for (const s of j.janelaCredito) {
      console.log(`  ${s.ticker}: ${s.quantidade} acoes · venda ${brl(s.valorVenda)} · lucro ${brl(s.lucro)}`);
    }
  }
  const queimam = j.avisos.filter((a) => a.queimaSeSozinho);
  if (queimam.length) {
    console.log(`\nPrejuizo que se perde se o mes ficar isento:`);
    for (const a of queimam) {
      console.log(`  ${a.ticker}: venda ${brl(a.valorVenda)}, prejuizo ${brl(a.prejuizo)} — faltam ${brl(a.faltaParaTributavel)} de vendas`);
    }
  }
  console.log(`\n${j.veredito}\n`);
  await queryClient.end();
}

main().catch(async (err) => {
  console.error('falhou:', err instanceof Error ? err.message : err);
  await queryClient.end();
  process.exit(1);
});
