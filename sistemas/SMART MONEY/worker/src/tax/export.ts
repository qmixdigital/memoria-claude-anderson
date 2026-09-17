// Export anual para a declaração de Imposto de Renda.
// Consolida mês a mês (o prejuízo a compensar e o imposto pendente evoluem entre
// os meses) e produz: resumo em linguagem simples + CSV detalhado + JSON.

import Decimal from 'decimal.js';
import { reconstructLedger } from './ledger.js';
import { apurarMes } from './apuracao.js';
import { msgResumoExport } from './mensagens.js';
import { loadFullState, type FullState } from './service.js';

export interface MesExport {
  mes: string;
  vendidoAcao: string;
  lucroAcao: string;
  isento: boolean;
  lucroIsentoCod20: string;
  lucroTributavel: string;
  impostoAcao: string;
  fiiLucro: string;
  fiiImposto: string;
  darf: string;
  darfVencimento: string;
  prejuizoAcumulado: string;
}

export interface ExportResult {
  ano: number;
  resumoTexto: string;
  meses: MesExport[];
  csv: string;
  json: string;
}

const f2 = (d: Decimal.Value) => new Decimal(d).toFixed(2);

export async function exportarAnual(year: number, st?: FullState): Promise<ExportResult> {
  const s = st ?? (await loadFullState());
  const { sales } = reconstructLedger(s.trades, s.events, s.assetClass);

  // O carryforward inicial do ano é o estado atual do estoque (0 se nunca houve prejuízo).
  let loss: Decimal.Value = s.carryforwardSwing;
  let due: Decimal.Value = 0;

  const meses: MesExport[] = [];
  let totalIsento = new Decimal(0);
  let totalTributavel = new Decimal(0);
  let totalImpostoPago = new Decimal(0);

  for (let m = 1; m <= 12; m++) {
    const r = apurarMes({ year, month: m, sales, lossCarryforwardSwing: loss, duePending: due });
    loss = r.acao.novoPrejuizoAcumulado;
    due = r.duePendingNovo;

    totalIsento = totalIsento.plus(r.codigo20);
    if (!r.acao.isento && r.acao.lucroTributavel.gt(0)) {
      totalTributavel = totalTributavel.plus(r.acao.lucroTributavel);
    }
    if (r.darf) totalImpostoPago = totalImpostoPago.plus(r.darf.valor);

    meses.push({
      mes: r.mes,
      vendidoAcao: f2(r.acao.vendidoBruto),
      lucroAcao: f2(r.acao.lucro),
      isento: r.acao.isento,
      lucroIsentoCod20: f2(r.codigo20),
      lucroTributavel: f2(r.acao.lucroTributavel),
      impostoAcao: f2(r.acao.impostoLiquido),
      fiiLucro: f2(r.fii.lucro),
      fiiImposto: f2(r.fii.imposto),
      darf: r.darf ? f2(r.darf.valor) : '',
      darfVencimento: r.darf ? r.darf.vencimento : '',
      prejuizoAcumulado: f2(r.acao.novoPrejuizoAcumulado),
    });
  }

  const header = [
    'mes', 'vendido_acao', 'lucro_acao', 'isento', 'lucro_isento_cod20',
    'lucro_tributavel', 'imposto_acao', 'fii_lucro', 'fii_imposto',
    'darf', 'darf_vencimento', 'prejuizo_acumulado',
  ].join(',');
  const linhas = meses.map((m) =>
    [m.mes, m.vendidoAcao, m.lucroAcao, m.isento ? 'sim' : 'nao', m.lucroIsentoCod20,
     m.lucroTributavel, m.impostoAcao, m.fiiLucro, m.fiiImposto, m.darf, m.darfVencimento,
     m.prejuizoAcumulado].join(','),
  );
  const csv = [header, ...linhas].join('\n');

  const resumoTexto = msgResumoExport({
    ano: year,
    totalIsento,
    totalTributavel,
    totalImpostoPago,
    prejuizoAcumulado: new Decimal(loss),
  });

  return { ano: year, resumoTexto, meses, csv, json: JSON.stringify(meses, null, 2) };
}
