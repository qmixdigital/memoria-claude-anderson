'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

/** Aceita "1.295,63" e "1295.63". null quando nao da pra ler. */
function parseValor(raw: unknown, obrigatorio: boolean): number | null {
  if (typeof raw !== 'string' || raw.trim() === '') return obrigatorio ? null : 0;
  const limpo = raw.trim().replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  if (!limpo) return obrigatorio ? null : 0;
  const n = Number.parseFloat(limpo);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Aceita aaaa-mm-dd e dd/mm/aaaa. */
function parseData(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

function texto(raw: unknown, max: number): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  return t === '' ? null : t.slice(0, max);
}

function voltar(chave: 'ok' | 'erro', msg: string): never {
  redirect(`/imposto?${chave}=${encodeURIComponent(msg)}`);
}

export async function salvarDarf(formData: FormData): Promise<void> {
  const competencia = parseData(formData.get('competencia'));
  if (!competencia) voltar('erro', 'Competência inválida. Use dd/mm/aaaa.');

  const codigo = texto(formData.get('codigoReceita'), 8) ?? '6015';
  if (!/^\d{4,8}$/.test(codigo)) voltar('erro', 'Código de receita inválido.');

  const principal = parseValor(formData.get('valorPrincipal'), true);
  if (principal === null || principal <= 0) voltar('erro', 'Valor do principal inválido.');

  const multa = parseValor(formData.get('valorMulta'), false);
  const juros = parseValor(formData.get('valorJuros'), false);
  if (multa === null || juros === null) voltar('erro', 'Multa ou juros inválidos.');

  const total = principal + multa + juros;
  const pagamento = parseData(formData.get('dataPagamento'));
  const vencimento = parseData(formData.get('dataVencimento'));
  const cpf = texto(formData.get('cpfCnpj'), 20);
  const contribuinte = texto(formData.get('contribuinte'), 200);
  const obs = texto(formData.get('observacoes'), 1000);

  // Upsert por (competencia, codigo): reenviar a mesma DARF corrige em vez de duplicar.
  await db.execute(sql`
    insert into qmix_invest.darfs
      (competencia, codigo_receita, valor_principal, valor_multa, valor_juros,
       valor_total, data_pagamento, data_vencimento, cpf_cnpj, contribuinte, observacoes)
    values
      (${competencia}::date, ${codigo}, ${principal}, ${multa}, ${juros},
       ${total}, ${pagamento}::date, ${vencimento}::date, ${cpf}, ${contribuinte}, ${obs})
    on conflict (competencia, codigo_receita) do update set
      valor_principal = excluded.valor_principal,
      valor_multa     = excluded.valor_multa,
      valor_juros     = excluded.valor_juros,
      valor_total     = excluded.valor_total,
      data_pagamento  = excluded.data_pagamento,
      data_vencimento = excluded.data_vencimento,
      cpf_cnpj        = excluded.cpf_cnpj,
      contribuinte    = excluded.contribuinte,
      observacoes     = excluded.observacoes
  `);

  revalidatePath('/imposto');
  voltar('ok', `DARF de ${competencia} registrada.`);
}

export async function removerDarf(formData: FormData): Promise<void> {
  const raw = formData.get('id');
  const id = typeof raw === 'string' ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isInteger(id) || id <= 0) voltar('erro', 'ID inválido.');

  await db.execute(sql`delete from qmix_invest.darfs where id = ${id}`);
  revalidatePath('/imposto');
  voltar('ok', 'DARF removida.');
}
