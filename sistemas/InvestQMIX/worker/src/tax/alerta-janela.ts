import Decimal from 'decimal.js';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { logger } from '../logger.js';
import { sendTelegramMessage } from '../telegram.js';
import { analisarJanela, type JanelaFiscal, type PosicaoJanela } from '@qmix-invest/db/tax/janela';
import type { AssetClass } from '@qmix-invest/db/tax/types';

const D = (v: Decimal.Value) => new Decimal(v);
const brl = (v: Decimal) =>
  `R$ ${v.toNumber().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function hojeBRT(): { mes: string; dia: string } {
  const agora = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  return { mes: agora.slice(0, 7), dia: agora.slice(0, 10) };
}

async function montarEntrada() {
  const { mes } = hojeBRT();

  const [posRows, vendidoRows, creditoRows] = await Promise.all([
    db.execute(sql`
      select p.ticker, p.quantity::text as qtd, p.purchase_price_brl::text as pm,
             t.last_quote_brl::text as cotacao, coalesce(t.asset_class, 'acao') as classe
        from qmix_invest.user_portfolio p
        join qmix_invest.tickers t on t.ticker = p.ticker
       where p.purchase_price_brl is not null and t.last_quote_brl is not null
    `),
    db.execute(sql`
      select coalesce(sum(quantity * price_brl), 0)::text as total
        from qmix_invest.trades
       where side = 'sell' and to_char(trade_date, 'YYYY-MM') = ${mes}
    `),
    db.execute(sql`
      select amount_brl::text as v from qmix_invest.tax_loss_carryforward where nature = 'swing'
    `),
  ]);

  const posicoes: PosicaoJanela[] = (posRows as unknown as Array<Record<string, string>>).map((r) => ({
    ticker: r.ticker!,
    quantidade: Number(r.qtd),
    precoMedio: D(r.pm!),
    cotacao: D(r.cotacao!),
    assetClass: r.classe as AssetClass,
  }));

  return {
    mes,
    posicoes,
    vendidoNoMes: (vendidoRows as unknown as Array<{ total: string }>)[0]?.total ?? '0',
    creditoSwing: (creditoRows as unknown as Array<{ v: string }>)[0]?.v ?? '0',
  };
}

export async function calcularJanelaAtual(): Promise<JanelaFiscal> {
  return analisarJanela(await montarEntrada());
}

function montarMensagem(j: JanelaFiscal): string {
  const l: string[] = [`📐 *Janela fiscal — ${j.mes}*`, ''];

  l.push(`Vendas do mês: *${brl(j.vendidoNoMes)}* de ${brl(j.limiteLegal)}`);
  l.push(`Crédito de prejuízo: *${brl(j.creditoDisponivel)}*`);
  if (j.lucroNaoRealizado.gt(0)) l.push(`Lucro não realizado: ${brl(j.lucroNaoRealizado)}`);
  l.push('');

  if (j.mesJaTributavel && j.janelaCredito.length > 0) {
    l.push('🔓 *Janela do crédito aberta*');
    l.push(
      `O mês já passou do teto, então está tributável de qualquer forma. ` +
        `Realizar até *${brl(j.lucroCobertoPeloCredito)}* de lucro sai sem imposto, coberto pelo crédito.`
    );
    l.push('');
    for (const s of j.janelaCredito.slice(0, 5)) {
      l.push(`• ${s.ticker}: ${s.quantidade} ações · venda ${brl(s.valorVenda)} · lucro ${brl(s.lucro)}`);
    }
  } else if (j.janelaIsenta.length > 0) {
    l.push('✅ *Janela isenta*');
    l.push(
      `Cabem ${brl(j.margemIsenta)} de vendas na isenção. Realizar ` +
        `*${brl(j.lucroIsentoPossivel)}* de lucro sai isento e o crédito fica intacto.`
    );
    l.push('');
    for (const s of j.janelaIsenta.slice(0, 5)) {
      l.push(
        `• ${s.ticker}: ${s.quantidade} ações · venda ${brl(s.valorVenda)} · ` +
          `lucro ${brl(s.lucro)} · custo do giro ${brl(s.custoGiro)}`
      );
    }
  }

  const queimam = j.avisos.filter((a) => a.queimaSeSozinho);
  if (queimam.length > 0) {
    l.push('');
    l.push('⚠️ *Cuidado ao vender no prejuízo*');
    l.push(
      'Prejuízo realizado em mês isento NÃO vira crédito. Estas vendas ficariam sob o teto e o prejuízo se perderia:'
    );
    for (const a of queimam.slice(0, 4)) {
      l.push(
        `• ${a.ticker}: venda ${brl(a.valorVenda)}, prejuízo ${brl(a.prejuizo)} — ` +
          `faltam ${brl(a.faltaParaTributavel)} de vendas no mês para ele contar`
      );
    }
  }

  l.push('');
  l.push(`_${j.veredito}_`);
  l.push('');
  l.push('_Recompra só no pregão seguinte: mesmo dia vira day trade (20%, sem isenção)._');
  l.push('_Detalhes em https://qf.qmix.digital/imposto_');

  return l.join('\n');
}

/**
 * Reserva o envio do dia. A tabela ja tem indice unico em
 * (ticker, alert_type, sent_date), entao o proprio banco garante um aviso por
 * dia — sem race entre worker e worker-b, que rodam em paralelo.
 * Devolve false quando o aviso de hoje ja foi dado.
 */
async function reservarAvisoDoDia(dia: string, resumo: string): Promise<boolean> {
  const rows = (await db.execute(sql`
    insert into qmix_invest.watchlist_alerts_sent (ticker, alert_type, sent_date, payload_json)
    values ('-', 'janela-fiscal', ${dia}::date,
            ${JSON.stringify({ resumo: resumo.slice(0, 500) })})
    on conflict (ticker, alert_type, sent_date) do nothing
    returning id
  `)) as unknown as unknown[];
  return rows.length > 0;
}

/**
 * Avisa quando existe janela para realizar lucro sem imposto, ou risco de
 * queimar prejuizo sem querer.
 *
 * So manda mensagem quando ha ACAO possivel. Alerta que chega toda semana
 * dizendo "nada a fazer" treina a pessoa a ignorar o alerta — e ai o dia em
 * que ele importa passa batido.
 */
export async function runAlertaJanelaFiscal(): Promise<{ enviado: boolean }> {
  const log = logger.child({ job: 'tax-janela-fiscal' });
  const { dia } = hojeBRT();
  const j = await calcularJanelaAtual();

  const temJanelaCredito = j.mesJaTributavel && j.janelaCredito.length > 0;
  const temJanelaIsenta = j.janelaIsenta.some((s) => s.liquido.gt(0));
  const temRiscoQueimar = j.avisos.some((a) => a.queimaSeSozinho && a.prejuizo.gt(2000));

  if (!temJanelaCredito && !temJanelaIsenta && !temRiscoQueimar) {
    log.info({ mes: j.mes }, 'sem janela acionável, nada a avisar');
    return { enviado: false };
  }

  // Reserva ANTES de enviar: se o Telegram falhar, o dia fica marcado e o
  // alerta nao repete em loop. Perder um aviso incomoda menos que receber seis.
  if (!(await reservarAvisoDoDia(dia, j.veredito))) {
    log.info({ dia }, 'aviso de hoje ja foi enviado');
    return { enviado: false };
  }

  await sendTelegramMessage(montarMensagem(j), 'Markdown');

  log.info(
    { mes: j.mes, credito: temJanelaCredito, isenta: temJanelaIsenta, risco: temRiscoQueimar },
    'alerta de janela fiscal enviado'
  );
  return { enviado: true };
}
