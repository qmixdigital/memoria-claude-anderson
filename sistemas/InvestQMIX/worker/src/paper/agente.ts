import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { logger } from '../logger.js';
import { env } from '../env.js';
import { sendTelegramMessage } from '../telegram.js';
import { executarPedido, type PedidoBacktest } from './job.js';

/**
 * Agente de pesquisa de estrategia.
 *
 * A ideia do video e mandar a IA OPERAR. Aqui ela PESQUISA, e a diferenca nao e
 * de timidez: operar exige acertar o futuro, pesquisar exige ler o passado —
 * e ler o passado e o que um modelo de linguagem realmente faz bem. Alem
 * disso, roda em segundos contra 4,7 anos em vez de esperar uma semana de
 * pregao para colher sete dias de ruido.
 *
 * O ciclo de cada despertar:
 *   1. le o handoff anterior e as rodadas ja executadas;
 *   2. propoe as proximas hipoteses, em JSON;
 *   3. o worker executa os backtests de verdade — o modelo NAO inventa numero;
 *   4. o modelo le os resultados reais e escreve o que aprendeu;
 *   5. grava o handoff e manda o resumo no Telegram.
 *
 * O modelo nunca produz metrica. Ele so escolhe o que testar e interpreta o que
 * voltou. Metrica sai do motor de backtest.
 */

const MODELO = 'claude-sonnet-5';
const MAX_HIPOTESES = 4;

const SYSTEM = `Você é um pesquisador quantitativo estudando estratégias na bolsa brasileira (B3).

Seu trabalho é propor hipóteses testáveis e interpretar resultados de backtest. Você NÃO opera dinheiro e NÃO inventa números: todo resultado vem do motor de backtest, que já cobra emolumentos de 0,03%, slippage de 0,15%, e o imposto de renda correto (15% no swing com isenção de R$20 mil por mês; 20% no day trade sem isenção).

REGRAS INVIOLÁVEIS:
1. Nunca afirme um resultado que não veio do motor. Se não testou, diga que não testou.
2. Toda estratégia é comparada com comprar e segurar os mesmos papéis. Retorno sem comparação não diz nada.
3. Olhe o resultado LÍQUIDO de imposto e o drawdown máximo, não só o retorno bruto. Uma estratégia que rende mais com o dobro da queda pode ser pior na prática, porque a pessoa abandona no meio.
4. Taxa de acerto isolada não significa nada. Sempre leia junto com profit factor e a razão entre ganho médio e perda médio.
5. Desconfie de resultado bom demais. Se algo render muito acima do benchmark, o primeiro palpite deve ser erro de método, não descoberta.
6. Português do Brasil, direto, sem entusiasmo de vendedor.`;

interface Hipotese {
  nome: string;
  tipo: 'swing' | 'cruzamento' | 'buy-and-hold';
  tickers: string[];
  criterio?: 'queda-do-topo' | 'rsi' | 'abaixo-da-media';
  alvo?: number;
  stop?: number;
  maxPosicoes?: number;
  orcamentoMensalVendas?: number;
  curta?: number;
  longa?: number;
  porque: string;
}

async function chamarClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4000
): Promise<string> {
  if (!<<REMOVIDO>>) throw new Error('ANTHROPIC_API_KEY não configurada');

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': <<REMOVIDO>>,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!resp.ok) {
    throw new Error(`Anthropic ${resp.status}: ${(await resp.text()).slice(0, 300)}`);
  }
  const data = (await resp.json()) as {
    content: Array<{ type: string; text?: string }>;
    stop_reason?: string;
  };
  if (data.stop_reason === 'refusal') throw new Error('modelo recusou a requisição');
  return data.content.filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n');
}

/** Extrai o primeiro bloco JSON da resposta, com ou sem cerca de markdown. */
function extrairJson<T>(texto: string): T | null {
  const cerca = /```(?:json)?\s*([\s\S]*?)```/.exec(texto);
  const bruto = cerca ? cerca[1]! : texto;
  const ini = bruto.search(/[[{]/);
  if (ini < 0) return null;
  const fim = Math.max(bruto.lastIndexOf(']'), bruto.lastIndexOf('}'));
  if (fim <= ini) return null;
  try {
    return JSON.parse(bruto.slice(ini, fim + 1)) as T;
  } catch {
    return null;
  }
}

async function contaDoAgente(): Promise<number> {
  const existe = (await db.execute(sql`
    select id from qmix_invest.paper_accounts
     where kind = 'live' and nome = 'agente-pesquisa' limit 1
  `)) as unknown as Array<{ id: number }>;
  if (existe[0]) return existe[0].id;

  const criada = (await db.execute(sql`
    insert into qmix_invest.paper_accounts (nome, kind, caixa_inicial, caixa, estrategia)
    values ('agente-pesquisa', 'live', 0, 0, 'pesquisa')
    returning id
  `)) as unknown as Array<{ id: number }>;
  return criada[0]!.id;
}

async function ultimoHandoff(accountId: number): Promise<string> {
  const rows = (await db.execute(sql`
    select resumo, proximo_job, criado_em::text
      from qmix_invest.paper_handoffs
     where account_id = ${accountId}
     order by criado_em desc limit 1
  `)) as unknown as Array<Record<string, unknown>>;
  const h = rows[0];
  if (!h) return 'Primeira execução: não há handoff anterior.';
  return `Handoff de ${h.criado_em}:\n${h.resumo}\n\nPróximo passo sugerido: ${h.proximo_job ?? '(nenhum)'}`;
}

async function rodadasRecentes(limite = 25): Promise<string> {
  const rows = (await db.execute(sql`
    select nome, data_inicio::text as inicio, data_fim::text as fim, observacoes
      from qmix_invest.paper_accounts
     where kind = 'backtest'
     order by criado_em desc limit ${limite}
  `)) as unknown as Array<Record<string, unknown>>;
  if (rows.length === 0) return 'Nenhum backtest executado ainda.';

  return rows
    .map((r) => {
      let s: Record<string, unknown> = {};
      try {
        s = JSON.parse(String(r.observacoes ?? '{}')) as Record<string, unknown>;
      } catch { /* resumo ilegivel, segue com o que da */ }
      if (s.falhou) return `- ${r.nome}: FALHOU (${s.erro})`;
      return (
        `- ${r.nome} [${r.inicio}..${r.fim}]: ` +
        `bruto ${s.retornoPct ?? '?'}%, líquido R$ ${s.resultadoLiquido ?? '?'}, ` +
        `queda máx ${s.maxDrawdownPct ?? '?'}%, ${s.totalTrades ?? 0} trades, ` +
        `acerto ${s.taxaAcertoPct ?? '?'}%, PF ${s.profitFactor ?? '?'}, ` +
        `imposto R$ ${s.impostoTotal ?? '?'}`
      );
    })
    .join('\n');
}

async function universoLiquido(n = 20): Promise<string[]> {
  const rows = (await db.execute(sql`
    select ticker from qmix_invest.prices_daily
     where date > current_date - interval '90 days'
     group by ticker
     having avg(financial_volume_brl) > 20000000
     order by avg(financial_volume_brl) desc
     limit ${n}
  `)) as unknown as Array<{ ticker: string }>;
  return rows.map((r) => r.ticker);
}

export async function rodarAgentePesquisa(): Promise<{ hipoteses: number }> {
  const log = logger.child({ job: 'agente-pesquisa' });

  if (!env.AGENTE_PESQUISA_ATIVO) {
    log.info('agente desligado (AGENTE_PESQUISA_ATIVO=false), nada a fazer');
    return { hipoteses: 0 };
  }
  if (!<<REMOVIDO>>) {
    log.warn('ANTHROPIC_API_KEY ausente, agente nao roda');
    return { hipoteses: 0 };
  }

  const accountId = await contaDoAgente();

  const [handoff, historico, universo] = await Promise.all([
    ultimoHandoff(accountId),
    rodadasRecentes(),
    universoLiquido(),
  ]);

  // ---- Passo 1: propor hipoteses ----
  const promptPropor = `Papéis líquidos disponíveis (volume médio acima de R$20 mi/dia):
${universo.join(', ')}

Dados: pregões diários de 2022-01-03 até hoje para toda a B3.

${handoff}

Backtests já executados:
${historico}

Proponha até ${MAX_HIPOTESES} hipóteses NOVAS para testar agora. Não repita configuração já testada; varie o que ainda não foi explorado e explique o raciocínio.

Responda SOMENTE com um array JSON, sem texto fora dele:
[{"nome":"...","tipo":"swing|cruzamento|buy-and-hold","tickers":["PETR4"],"criterio":"queda-do-topo|rsi|abaixo-da-media","alvo":0.15,"stop":0.08,"maxPosicoes":5,"orcamentoMensalVendas":0,"curta":20,"longa":50,"porque":"..."}]

alvo e stop são frações (0.15 = 15%). orcamentoMensalVendas 0 = sem teto.`;

  const respostaPropor = await chamarClaude(SYSTEM, promptPropor, 2500);
  const hipoteses = extrairJson<Hipotese[]>(respostaPropor);

  if (!hipoteses || !Array.isArray(hipoteses) || hipoteses.length === 0) {
    log.warn({ resposta: respostaPropor.slice(0, 400) }, 'não consegui ler hipóteses');
    return { hipoteses: 0 };
  }

  // ---- Passo 2: o worker executa. O modelo nao produz numero. ----
  const executadas: string[] = [];
  for (const h of hipoteses.slice(0, MAX_HIPOTESES)) {
    if (!Array.isArray(h.tickers) || h.tickers.length === 0) continue;
    const pedido: PedidoBacktest = {
      nome: `IA · ${h.nome}`,
      tipo: h.tipo === 'cruzamento' ? 'cruzamento' : h.tipo === 'buy-and-hold' ? 'buy-and-hold' : 'swing',
      tickers: h.tickers.map((t) => String(t).toUpperCase()).slice(0, 15),
      inicio: '2022-01-03',
      fim: new Date().toISOString().slice(0, 10),
      criterio: h.criterio,
      alvo: h.alvo,
      stop: h.stop,
      maxPosicoes: h.maxPosicoes,
      orcamentoMensalVendas: h.orcamentoMensalVendas || undefined,
      curta: h.curta,
      longa: h.longa,
      comBenchmark: true,
    };
    try {
      await executarPedido(pedido);
      executadas.push(`${h.nome} — ${h.porque}`);
    } catch (err) {
      log.error({ err, hipotese: h.nome }, 'hipótese falhou');
    }
  }

  if (executadas.length === 0) {
    log.warn('nenhuma hipótese executou');
    return { hipoteses: 0 };
  }

  // ---- Passo 3: o modelo le os resultados REAIS e interpreta ----
  const resultados = await rodadasRecentes(executadas.length * 2 + 4);
  const promptInterpretar = `Você propôs e o motor executou estas hipóteses:
${executadas.map((e) => `- ${e}`).join('\n')}

Resultados reais (cada estratégia tem um BENCHMARK de comprar e segurar logo em seguida):
${resultados}

Escreva um relatório curto, no máximo 200 palavras, em português do Brasil:
1. O que funcionou e o que não funcionou, comparando SEMPRE com o benchmark no líquido.
2. Qual a hipótese mais promissora para a próxima rodada, e por quê.
3. Se algum resultado parece bom demais, aponte a suspeita de erro de método.

Depois do relatório, em uma linha separada, escreva:
PROXIMO: <o que testar no próximo despertar, em uma frase>`;

  const relatorio = await chamarClaude(SYSTEM, promptInterpretar, 1500);
  const proximo = /PROXIMO:\s*(.+)$/im.exec(relatorio)?.[1]?.trim() ?? null;
  const corpo = relatorio.replace(/PROXIMO:.*$/im, '').trim();

  await db.execute(sql`
    insert into qmix_invest.paper_handoffs (account_id, slot, resumo, proximo_job, estado_json)
    values (${accountId}, 'pesquisa', ${corpo}, ${proximo},
            ${JSON.stringify({ hipoteses: executadas, modelo: MODELO })})
  `);

  try {
    await sendTelegramMessage(
      `🧪 *Pesquisa de estratégia*\n\n${corpo.slice(0, 3200)}` +
        (proximo ? `\n\n_Próximo: ${proximo}_` : '') +
        `\n\nDetalhes em https://qf.qmix.digital/simulador`,
      'Markdown'
    );
  } catch (err) {
    log.warn({ err }, 'falha ao enviar resumo no Telegram');
  }

  log.info({ hipoteses: executadas.length }, 'ciclo de pesquisa concluído');
  return { hipoteses: executadas.length };
}
