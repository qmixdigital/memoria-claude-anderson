import Decimal from 'decimal.js';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { logger } from '../logger.js';
import { executarOrdem, aplicarFill, patrimonio } from '@qmix-invest/db/paper/execucao';
import {
  CUSTOS_PADRAO,
  type Bar,
  type EstadoConta,
  type Ordem,
} from '@qmix-invest/db/paper/types';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = D(0);

/**
 * Conta simulada AO VIVO: acompanha o mercado em tempo real, como se o dinheiro
 * fosse de verdade.
 *
 * A diferenca para o backtest nao e o motor, e o RELOGIO. O backtest percorre
 * barras que ja aconteceram; aqui cada cotacao que chega e um instante novo, e
 * a ordem que voce mandou ontem pode executar hoje ao preco de hoje. Nada e
 * conhecido de antemao — que e exatamente o ponto de simular.
 *
 * A execucao roda logo depois do quote-watchlist, que atualiza as cotacoes de
 * 5 em 5 minutos durante o pregao.
 */

/** Cotacao ao vivo virada em barra de um instante, para o motor entender. */
function barraDaCotacao(ticker: string, preco: Decimal, volumeDia: number): Bar {
  const hoje = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 10);
  return {
    ticker,
    date: hoje,
    // Num instante unico nao existe maxima nem minima: os quatro precos sao o
    // mesmo. E o motor de ordem limite compara com high/low, entao a ordem so
    // executa quando a cotacao DE FATO chegou no preco pedido — que e o
    // comportamento correto ao vivo.
    open: preco,
    high: preco,
    low: preco,
    close: preco,
    volume: volumeDia,
    financeiro: preco.times(volumeDia),
  };
}

export interface ContaLive {
  id: number;
  nome: string;
  caixa: Decimal;
  caixaInicial: Decimal;
}

export async function contaLive(nome = 'minha-simulacao'): Promise<ContaLive | null> {
  const rows = (await db.execute(sql`
    select id, nome, caixa::text, caixa_inicial::text
      from qmix_invest.paper_accounts
     where kind = 'live' and nome = ${nome} and encerrada_em is null
     limit 1
  `)) as unknown as Array<Record<string, string>>;
  const r = rows[0];
  if (!r) return null;
  return {
    id: Number(r.id),
    nome: r.nome!,
    caixa: D(r.caixa!),
    caixaInicial: D(r.caixa_inicial!),
  };
}

export async function criarContaLive(nome: string, caixaInicial: number): Promise<number> {
  const rows = (await db.execute(sql`
    insert into qmix_invest.paper_accounts (nome, kind, caixa_inicial, caixa, estrategia)
    values (${nome}, 'live', ${caixaInicial}, ${caixaInicial}, 'manual')
    returning id
  `)) as unknown as Array<{ id: number }>;
  return rows[0]!.id;
}

async function carregarEstado(accountId: number, caixa: Decimal): Promise<EstadoConta> {
  const rows = (await db.execute(sql`
    select ticker, quantidade, preco_medio::text
      from qmix_invest.paper_positions where account_id = ${accountId}
  `)) as unknown as Array<Record<string, string>>;

  return {
    caixa,
    posicoes: new Map(
      rows.map((r) => [
        r.ticker!,
        { ticker: r.ticker!, quantidade: Number(r.quantidade), precoMedio: D(r.preco_medio!) },
      ])
    ),
  };
}

async function salvarEstado(accountId: number, estado: EstadoConta): Promise<void> {
  await db.execute(sql`
    update qmix_invest.paper_accounts set caixa = ${estado.caixa.toFixed(2)} where id = ${accountId}
  `);
  await db.execute(sql`delete from qmix_invest.paper_positions where account_id = ${accountId}`);
  for (const p of estado.posicoes.values()) {
    await db.execute(sql`
      insert into qmix_invest.paper_positions (account_id, ticker, quantidade, preco_medio)
      values (${accountId}, ${p.ticker}, ${p.quantidade}, ${p.precoMedio.toFixed(4)})
    `);
  }
}

/** Cotacoes atuais dos papeis que interessam agora. */
async function cotacoes(tickers: string[]): Promise<Map<string, { preco: Decimal; volume: number }>> {
  if (tickers.length === 0) return new Map();
  const lista = tickers.map((t) => `'${t.replace(/'/g, "''")}'`).join(',');
  const rows = (await db.execute(sql.raw(`
    select ticker, last_quote_brl::text as preco, coalesce(last_quote_volume, 0)::text as volume
      from qmix_invest.tickers
     where ticker in (${lista}) and last_quote_brl is not null
  `))) as unknown as Array<Record<string, string>>;
  return new Map(rows.map((r) => [r.ticker!, { preco: D(r.preco!), volume: Number(r.volume) }]));
}

export interface ResultadoCiclo {
  executadas: number;
  rejeitadas: number;
  pendentes: number;
}

/**
 * Processa as ordens pendentes contra a cotacao do momento.
 *
 * Ordem a mercado executa na proxima cotacao que chegar — inclusive uma mandada
 * de madrugada, que fica esperando a abertura. Ordem limite so executa quando a
 * cotacao encosta no preco pedido, e pode ficar pendente por dias, como na vida
 * real.
 */
export async function processarOrdensPendentes(accountId?: number): Promise<ResultadoCiclo> {
  const log = logger.child({ job: 'paper-live' });

  const conta = accountId
    ? ((await db.execute(sql`
        select id, nome, caixa::text, caixa_inicial::text
          from qmix_invest.paper_accounts where id = ${accountId}
      `)) as unknown as Array<Record<string, string>>).map((r) => ({
        id: Number(r.id), nome: r.nome!, caixa: D(r.caixa!), caixaInicial: D(r.caixa_inicial!),
      }))[0]
    : await contaLive();

  if (!conta) return { executadas: 0, rejeitadas: 0, pendentes: 0 };

  const pendentes = (await db.execute(sql`
    select id, ticker, side, tipo, quantidade, preco_limite::text, razao
      from qmix_invest.paper_orders
     where account_id = ${conta.id} and status = 'pending'
     order by criado_em
  `)) as unknown as Array<Record<string, string>>;

  if (pendentes.length === 0) return { executadas: 0, rejeitadas: 0, pendentes: 0 };

  const precos = await cotacoes([...new Set(pendentes.map((o) => o.ticker!))]);
  let estado = await carregarEstado(conta.id, conta.caixa);
  let executadas = 0;
  let rejeitadas = 0;

  for (const o of pendentes) {
    const cot = precos.get(o.ticker!);
    if (!cot) continue; // sem cotacao ainda: a ordem espera

    const ordem: Ordem = {
      ticker: o.ticker!,
      side: o.side as 'buy' | 'sell',
      tipo: o.tipo as 'market' | 'limit' | 'stop',
      quantidade: Number(o.quantidade),
      precoLimite: o.preco_limite ? D(o.preco_limite) : null,
      razao: o.razao ?? null,
    };

    const barra = barraDaCotacao(o.ticker!, cot.preco, cot.volume);
    const { fill, rejeicao } = executarOrdem(ordem, barra, estado, CUSTOS_PADRAO);

    if (rejeicao) {
      // Limite nao atingido NAO e rejeicao definitiva: a ordem continua viva
      // esperando o preco chegar, como numa corretora de verdade.
      if (rejeicao === 'limite_nao_atingido') continue;

      await db.execute(sql`
        update qmix_invest.paper_orders
           set status = 'rejected', motivo_rejeicao = ${rejeicao}
         where id = ${Number(o.id)}
      `);
      rejeitadas++;
      continue;
    }
    if (!fill) continue;

    await db.execute(sql`
      insert into qmix_invest.paper_fills
        (order_id, account_id, ticker, side, data_fill, quantidade,
         preco_bruto, preco_exec, emolumentos, corretagem, caixa_delta)
      values (${Number(o.id)}, ${conta.id}, ${fill.ticker}, ${fill.side}, current_date,
              ${fill.quantidade}, ${fill.precoBruto.toFixed(4)}, ${fill.precoExec.toFixed(4)},
              ${fill.emolumentos.toFixed(4)}, ${fill.corretagem.toFixed(4)},
              ${fill.caixaDelta.toFixed(4)})
    `);
    await db.execute(sql`
      update qmix_invest.paper_orders set status = 'filled' where id = ${Number(o.id)}
    `);

    estado = aplicarFill(estado, fill);
    executadas++;
  }

  if (executadas > 0) await salvarEstado(conta.id, estado);

  const aindaPendentes = (await db.execute(sql`
    select count(*)::int as n from qmix_invest.paper_orders
     where account_id = ${conta.id} and status = 'pending'
  `)) as unknown as Array<{ n: number }>;

  if (executadas > 0 || rejeitadas > 0) {
    log.info({ executadas, rejeitadas }, 'ordens processadas ao vivo');
  }
  return { executadas, rejeitadas, pendentes: aindaPendentes[0]?.n ?? 0 };
}

/**
 * Grava a foto do patrimonio do dia. E o que desenha a curva ao longo do tempo:
 * sem isto a conta mostra so o saldo de agora e some com o caminho.
 */
export async function fotografarPatrimonio(accountId?: number): Promise<void> {
  const conta = accountId ? { id: accountId } : await contaLive();
  if (!conta) return;

  const rows = (await db.execute(sql`
    select p.ticker, p.quantidade, p.preco_medio::text, t.last_quote_brl::text as cotacao
      from qmix_invest.paper_positions p
      left join qmix_invest.tickers t on t.ticker = p.ticker
     where p.account_id = ${conta.id}
  `)) as unknown as Array<Record<string, string>>;

  const caixaRows = (await db.execute(sql`
    select caixa::text from qmix_invest.paper_accounts where id = ${conta.id}
  `)) as unknown as Array<{ caixa: string }>;
  const caixa = D(caixaRows[0]?.caixa ?? '0');

  const estado: EstadoConta = {
    caixa,
    posicoes: new Map(
      rows.map((r) => [
        r.ticker!,
        { ticker: r.ticker!, quantidade: Number(r.quantidade), precoMedio: D(r.preco_medio!) },
      ])
    ),
  };
  const precos = new Map(
    rows.filter((r) => r.cotacao).map((r) => [r.ticker!, D(r.cotacao!)])
  );

  const p = patrimonio(estado, precos);

  // Pico anterior, para o drawdown sair pronto na tela.
  const picoRows = (await db.execute(sql`
    select coalesce(max(pico), 0)::text as pico
      from qmix_invest.paper_equity where account_id = ${conta.id}
  `)) as unknown as Array<{ pico: string }>;
  const picoAnterior = D(picoRows[0]?.pico ?? '0');
  const pico = Decimal.max(picoAnterior, p.total);
  const dd = pico.gt(0) ? pico.minus(p.total).div(pico).times(100) : ZERO;

  await db.execute(sql`
    insert into qmix_invest.paper_equity
      (account_id, data, caixa, valor_posicoes, patrimonio, pico, drawdown_pct)
    values (${conta.id}, current_date, ${p.caixa.toFixed(2)}, ${p.valorPosicoes.toFixed(2)},
            ${p.total.toFixed(2)}, ${pico.toFixed(2)}, ${dd.toFixed(4)})
    on conflict (account_id, data) do update set
      caixa = excluded.caixa, valor_posicoes = excluded.valor_posicoes,
      patrimonio = excluded.patrimonio, pico = excluded.pico,
      drawdown_pct = excluded.drawdown_pct
  `);
}

/** Um ciclo completo: executa o que der e atualiza a foto do dia. */
export async function cicloLive(): Promise<ResultadoCiclo> {
  const r = await processarOrdensPendentes();
  await fotografarPatrimonio();
  return r;
}
