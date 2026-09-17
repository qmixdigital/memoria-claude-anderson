// Jobs de alerta do módulo fiscal (Telegram, linguagem simples):
//  - runAlertaOportunidade: ao longo do mês, avisa quando uma ação vale a pena vender
//    (com lucro, cabe na margem isenta, lucro supera o custo do giro). 1x/dia/ticker.
//  - runAlertaFimDeMes: no penúltimo dia útil, resumo do mês + sugestões.
// Tudo é AVISO — quem decide e executa a venda é o usuário.

import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { logger } from '../logger.js';
import { sendTelegramMessage } from '../telegram.js';
import { detectarOportunidades, apurarMesDoBanco, analisarFimDeMes } from './service.js';
import { msgOportunidade, msgFimDeMes, msgLembreteRecompra, msgLembreteDarf, msgProventoPerdido } from '@qmix-invest/db/tax/mensagens';
import { nthLastBusinessDayOfMonth, businessDaysBetween, darfDueDate } from '@qmix-invest/db/tax/calendario';
import { TAX_CONFIG } from '@qmix-invest/db/tax/config';

// Mês/dia corrente no fuso de São Paulo (a apuração é mês-calendário BRT).
function hojeBRT(): { year: number; month: number; dateIso: string } {
  const iso = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }); // YYYY-MM-DD
  const [y, m] = iso.split('-').map(Number);
  return { year: y!, month: m!, dateIso: iso };
}

async function alreadySentToday(key: string): Promise<boolean> {
  const r = await db.execute(sql`
    select 1 from qmix_invest.watchlist_alerts_sent
    where ticker = ${key} and alert_type = 'tax' and sent_date = current_date limit 1
  `);
  return (r as unknown as unknown[]).length > 0;
}

async function recordSent(key: string): Promise<void> {
  await db.execute(sql`
    insert into qmix_invest.watchlist_alerts_sent (ticker, alert_type)
    values (${key}, 'tax')
    on conflict (ticker, alert_type, sent_date) do nothing
  `);
}

async function isPaused(): Promise<boolean> {
  const r = (await db.execute(sql`
    select paused_until from qmix_invest.user_preferences limit 1
  `)) as unknown as Array<{ paused_until: Date | null }>;
  const p = r[0]?.paused_until;
  return p != null && new Date(p) > new Date();
}

export async function runAlertaOportunidade(): Promise<{ enviados: number }> {
  const log = logger.child({ job: 'tax-oportunidade' });
  if (await isPaused()) return { enviados: 0 };

  const { year, month, dateIso } = hojeBRT();
  const ops = await detectarOportunidades(year, month, dateIso);
  let enviados = 0;

  for (const op of ops) {
    const key = `tax_op:${op.ticker}`;
    if (await alreadySentToday(key)) continue; // 1x por dia por ação
    try {
      await sendTelegramMessage(
        msgOportunidade({
          ticker: op.ticker,
          quantidade: op.quantidade,
          precoAtual: op.precoAtual,
          precoMedio: op.precoMedio,
          ganhoLivre: op.ganhoLivre,
          margemRestante: op.margemRestante,
          custoGiro: op.custoGiro,
          beneficioPotencial: op.beneficioPotencial,
          poucoLiquida: op.poucoLiquida,
          proventoProximo: op.proventoProximo
            ? { comDate: op.proventoProximo.comDate, dataEx: op.proventoProximo.dataEx, eventType: op.proventoProximo.eventType }
            : undefined,
          proventoConflito: op.proventoConflito,
          recompraData: op.recompraData,
        }),
      );
      await recordSent(key);
      enviados++;
    } catch (err) {
      log.error({ err, ticker: op.ticker }, 'falha ao enviar alerta de oportunidade');
    }
  }
  if (enviados > 0) log.info({ enviados }, 'oportunidades enviadas');
  return { enviados };
}

export async function runAlertaFimDeMes(): Promise<{ enviado: boolean }> {
  const log = logger.child({ job: 'tax-fim-de-mes' });
  const { year, month, dateIso } = hojeBRT();

  // Só dispara no penúltimo dia útil do mês (DIA_ALERTA). O cron roda nos últimos
  // dias e este guard garante o dia certo, considerando feriados B3.
  if (dateIso !== nthLastBusinessDayOfMonth(year, month, 2)) return { enviado: false };
  if (await isPaused()) return { enviado: false };

  const a = await analisarFimDeMes(year, month, dateIso);
  const mesLabel = `${String(month).padStart(2, '0')}/${year}`;
  const darfVenc = a.darf
    ? a.darf.vencimento.split('-').reverse().slice(0, 2).join('/') // YYYY-MM-DD → DD/MM
    : undefined;

  await sendTelegramMessage(
    msgFimDeMes({
      mesLabel,
      vendidoMes: a.vendidoMes,
      isento: a.isento,
      imposto: a.imposto,
      darfVencimento: darfVenc,
      sugestoes: a.sugestoes.map((s) => ({ ticker: s.ticker, quantidade: s.quantidade, ganhoLivre: s.ganhoLivre, custoGiro: s.custoGiro })),
      adiar: a.adiar.map((x) => ({ ticker: x.ticker, dataEx: x.dataEx, eventType: x.eventType })),
      naoCompensa: a.naoCompensa.map((x) => ({ ticker: x.ticker, custoGiro: x.custoGiro, beneficioPotencial: x.beneficioPotencial })),
    }),
  );
  log.info({ mes: mesLabel }, 'alerta de fim de mês enviado');
  return { enviado: true };
}

// Item 2: lembra de recomprar quando uma venda "pra subir o PM" passa de N dias
// úteis sem a recompra do mesmo papel. Um lembrete só por venda.
export async function runLembreteRecompra(): Promise<{ enviados: number }> {
  const log = logger.child({ job: 'tax-lembrete-recompra' });
  if (await isPaused()) return { enviados: 0 };
  const { dateIso } = hojeBRT();

  const vendas = (await db.execute(sql`
    select id, ticker, trade_date::text as trade_date, quantity
    from qmix_invest.trades
    where side = 'sell' and repurchase_intent = true and repurchase_reminded_at is null
      and is_opening = false
  `)) as unknown as Array<{ id: number; ticker: string; trade_date: string; quantity: number }>;

  let enviados = 0;
  const marcar = (id: number) =>
    db.execute(sql`update qmix_invest.trades set repurchase_reminded_at = now() where id = ${id}`);

  for (const v of vendas) {
    // já recomprou esse papel depois da venda? então encerra sem lembrar
    const recompra = (await db.execute(sql`
      select 1 from qmix_invest.trades
      where ticker = ${v.ticker} and side = 'buy' and is_opening = false
        and trade_date >= ${v.trade_date}
      limit 1
    `)) as unknown as unknown[];
    if (recompra.length > 0) {
      await marcar(v.id);
      continue;
    }

    // havia dividendo/JCP cuja data-com já PASSOU desde a venda, sem recompra a tempo?
    const provPerdido = (await db.execute(sql`
      select event_type from qmix_invest.proventos
      where ticker = ${v.ticker} and com_date >= ${v.trade_date}
        and com_date < ${dateIso} and com_date < date '9999-01-01'
      order by com_date desc limit 1
    `)) as unknown as Array<{ event_type: string }>;
    if (provPerdido.length > 0) {
      try {
        await sendTelegramMessage(msgProventoPerdido(v.ticker, provPerdido[0]!.event_type));
        await marcar(v.id);
        enviados++;
      } catch (err) {
        log.error({ err, ticker: v.ticker }, 'falha ao enviar aviso de provento perdido');
      }
      continue;
    }

    // lembrete genérico de recompra após N dias úteis
    if (businessDaysBetween(v.trade_date, dateIso) < TAX_CONFIG.DIAS_UTEIS_RECOMPRA) continue;
    try {
      await sendTelegramMessage(msgLembreteRecompra(v.ticker, v.quantity));
      await marcar(v.id);
      enviados++;
    } catch (err) {
      log.error({ err, ticker: v.ticker }, 'falha ao enviar lembrete de recompra');
    }
  }
  if (enviados > 0) log.info({ enviados }, 'lembretes de recompra/provento enviados');
  return { enviados };
}

// Item 4: lembra do DARF 3 dias úteis antes do vencimento (último dia útil do mês
// seguinte ao da apuração). Um lembrete por mês de apuração.
export async function runLembreteDarf(): Promise<{ enviado: boolean }> {
  const log = logger.child({ job: 'tax-lembrete-darf' });
  if (await isPaused()) return { enviado: false };
  const { year, month, dateIso } = hojeBRT();

  // O DARF do mês ANTERIOR vence no último dia útil DESTE mês. Lembrar N dias úteis antes.
  const vencimento = nthLastBusinessDayOfMonth(year, month, 1);
  const diaLembrete = nthLastBusinessDayOfMonth(year, month, 1 + TAX_CONFIG.DIAS_UTEIS_LEMBRETE_DARF);
  if (dateIso !== diaLembrete) return { enviado: false };

  // mês de apuração = mês anterior
  let ay = year;
  let am = month - 1;
  if (am < 1) { am = 12; ay -= 1; }
  const apur = await apurarMesDoBanco(ay, am);
  if (!apur.darf || apur.darf.valor.lte(0)) return { enviado: false };

  const key = `tax_darf:${ay}-${String(am).padStart(2, '0')}`;
  if (await alreadySentToday(key)) return { enviado: false };

  const vencBR = darfDueDate(ay, am).split('-').reverse().slice(0, 2).join('/'); // DD/MM
  void vencimento;
  await sendTelegramMessage(msgLembreteDarf(apur.darf.valor, vencBR));
  await recordSent(key);
  log.info({ mes: `${ay}-${am}` }, 'lembrete de DARF enviado');
  return { enviado: true };
}
