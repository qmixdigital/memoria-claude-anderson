'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

function volta(chave: 'ok' | 'erro', msg: string): never {
  redirect(`/simulador?${chave}=${encodeURIComponent(msg)}`);
}

function num(fd: FormData, campo: string, padrao: number): number {
  const raw = fd.get(campo);
  if (typeof raw !== 'string' || raw.trim() === '') return padrao;
  const v = Number(raw.replace(',', '.'));
  return Number.isFinite(v) ? v : padrao;
}

function data(fd: FormData, campo: string): string | null {
  const raw = fd.get(campo);
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

export async function rodarSimulacao(formData: FormData): Promise<void> {
  const tipo = String(formData.get('tipo') ?? 'swing');
  const tickers = String(formData.get('tickers') ?? '')
    .toUpperCase()
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tickers.length === 0) volta('erro', 'Informe ao menos um ticker.');
  if (tickers.length > 30) volta('erro', 'Máximo de 30 tickers por simulação.');
  if (tickers.some((t) => !/^[A-Z]{4}\d{1,2}$/.test(t))) {
    volta('erro', 'Algum ticker está com formato inválido. Use PETR4, VALE3, etc.');
  }

  const inicio = data(formData, 'inicio');
  const fim = data(formData, 'fim');
  if (!inicio || !fim) volta('erro', 'Datas inválidas.');
  if (inicio >= fim) volta('erro', 'A data inicial precisa ser anterior à final.');

  // Recusa ticker que o banco nao conhece antes de enfileirar: assim o erro
  // aparece na hora, e nao numa rodada que falha em silencio 30 segundos depois.
  const existentes = (await db.execute(sql`
    select ticker from qmix_invest.tickers
     where ticker = any(${sql.raw(`array[${tickers.map((t) => `'${t}'`).join(',')}]`)})
  `)) as unknown as Array<{ ticker: string }>;
  const conhecidos = new Set(existentes.map((r) => r.ticker));
  const faltando = tickers.filter((t) => !conhecidos.has(t));
  if (faltando.length > 0) {
    volta('erro', `Ticker não encontrado na base: ${faltando.join(', ')}`);
  }

  const pedido = {
    nome: String(formData.get('nome') ?? '').trim() || undefined,
    tipo,
    tickers,
    inicio,
    fim,
    caixaInicial: num(formData, 'caixaInicial', 100000),
    criterio: String(formData.get('criterio') ?? 'queda-do-topo'),
    alvo: num(formData, 'alvo', 15) / 100,
    stop: num(formData, 'stop', 8) / 100,
    prazoMaximo: num(formData, 'prazoMaximo', 60),
    maxPosicoes: num(formData, 'maxPosicoes', 5),
    fracaoCapital: num(formData, 'fracaoCapital', 20) / 100,
    orcamentoMensalVendas: num(formData, 'orcamentoMensalVendas', 0) || undefined,
    curta: num(formData, 'curta', 20),
    longa: num(formData, 'longa', 50),
    minutosFaixa: num(formData, 'minutosFaixa', 30),
    comBenchmark: formData.get('comBenchmark') !== null,
  };

  try {
    const { getBoss } = await import('@/lib/pg-boss-client');
    const boss = await getBoss();
    await boss.send('paper-backtest', pedido, { retryLimit: 0 });
  } catch (err) {
    volta('erro', `Não consegui enfileirar: ${err instanceof Error ? err.message : 'erro'}`);
  }

  revalidatePath('/simulador');
  volta('ok', 'Simulação enfileirada. O resultado aparece aqui em alguns segundos — atualize a página.');
}

export async function removerRodada(formData: FormData): Promise<void> {
  const raw = formData.get('id');
  const id = typeof raw === 'string' ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isInteger(id) || id <= 0) volta('erro', 'ID inválido.');

  await db.execute(sql`delete from qmix_invest.paper_accounts where id = ${id}`);
  revalidatePath('/simulador');
  volta('ok', 'Rodada removida.');
}
