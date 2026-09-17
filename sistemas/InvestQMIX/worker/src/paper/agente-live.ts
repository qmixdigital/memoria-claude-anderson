import Decimal from 'decimal.js';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { logger } from '../logger.js';
import { env } from '../env.js';
import { sendTelegramMessage } from '../telegram.js';
import { contaLive, criarContaLive, processarOrdensPendentes, fotografarPatrimonio } from './live.js';

const D = (v: Decimal.Value) => new Decimal(v);
const ZERO = D(0);
const brl = (v: Decimal | number) =>
  `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Robo de IA operando ao vivo na B3, com dinheiro ficticio.
 *
 * A IA acorda nos horarios-chave do pregao, le a carteira e as cotacoes do
 * momento, decide o que comprar e vender, e JUSTIFICA cada ordem. O worker
 * executa contra a cotacao real, cobrando emolumentos e slippage.
 *
 * A divisao de responsabilidade e rigida e proposital:
 *   a IA DECIDE, o motor EXECUTA e CALCULA.
 * O modelo nunca produz preco, quantidade financeira nem resultado. Ele escolhe
 * ticker, lado e quantidade em acoes; todo o resto sai do motor. Um modelo que
 * inventa o proprio P&L vira gerador de historia bonita, que e o oposto do que
 * serve pra estudar.
 *
 * Continuidade: cada despertar le o handoff anterior e grava o seu. Sem isso
 * seriam seis robos desmemoriados por dia, cada um recomecando do zero.
 */

const MODELO = 'claude-sonnet-5';
const CONTA = 'robo-ia';

/** Trava de risco. A IA opera dentro disto, nao decide isto. */
const LIMITES = {
  maxPctPorPosicao: 0.25,
  maxPosicoesAbertas: 6,
  maxOrdensPorDespertar: 4,
  /** Papel precisa girar isto por dia pra entrar. Evita micro cap ilíquida. */
  liquidezMinimaDiaria: 20_000_000,
};

export type Slot =
  | 'pre-abertura'
  | 'abertura'
  | 'meio-pregao'
  | 'revisao'
  | 'pre-fechamento'
  | 'pos-fechamento';

const MISSAO: Record<Slot, string> = {
  'pre-abertura':
    'Mercado ainda fechado. Avalie o que aconteceu desde ontem e escolha no que prestar atenção hoje. NÃO envie ordens agora: elas executariam na abertura, no preço que vier, sem você ter visto o pregão.',
  abertura:
    'Pregão recém-aberto. Os primeiros minutos costumam ser voláteis e enganosos. Só opere se houver motivo claro.',
  'meio-pregao': 'Meio do pregão. Avalie as posições abertas e oportunidades que apareceram.',
  revisao:
    'Tarde. Revise cada posição aberta: a tese que motivou a compra ainda vale? Se não vale mais, saia.',
  'pre-fechamento':
    'Perto do fechamento. Última janela para agir. Lembre que posição aberta atravessa a noite exposta a notícia.',
  'pos-fechamento':
    'Mercado fechado. NÃO envie ordens. Faça o balanço do dia: o que funcionou, o que não funcionou, o que observar amanhã.',
};

const SYSTEM = `Você é um operador de ações da B3 gerindo uma conta SIMULADA, com dinheiro fictício. O objetivo é aprender o que funciona, não impressionar ninguém.

COMO ISTO FUNCIONA
Você decide; o sistema executa e calcula. Você escolhe ticker, lado e quantidade em ações. Preço de execução, custos, imposto e resultado saem do motor, nunca de você. Nunca afirme um preço ou um lucro: você não tem como saber, e chutar corrompe o estudo.

REGRAS INVIOLÁVEIS
1. Só opere papéis da lista de permitidos que receber. Nada fora dela.
2. Não existe venda a descoberto. Só venda o que a carteira tem, e no máximo a quantidade que ela tem.
3. Compra precisa caber no caixa disponível, incluindo folga para custos.
4. Toda ordem precisa de uma razão específica e verificável nos dados que você recebeu. "Parece bom" não é razão. Se não souber justificar, não mande a ordem.
5. Não operar é uma decisão legítima e frequentemente a certa. Um dia sem ordens é melhor que uma ordem sem tese.
6. Custo existe: cada giro paga emolumento e sofre slippage. Girar por girar destrói capital devagar.
7. Imposto existe: vender no lucro acima de R$20 mil no mês tributa em 15%. Vender e recomprar o mesmo papel NO MESMO DIA é day trade, com 20% e sem isenção. Evite.
8. Português do Brasil, direto, sem entusiasmo de vendedor e sem jargão de guru.

Responda SEMPRE com um único bloco JSON, sem texto fora dele:
{"analise":"o que você está vendo, em até 3 frases","ordens":[{"ticker":"PETR4","side":"buy","tipo":"market","quantidade":100,"razao":"por que esta ordem, citando o dado"}],"proximo":"o que observar no próximo despertar"}

ordens pode ser lista vazia. tipo aceita "market" ou "limit"; em limit inclua "precoLimite".`;

interface OrdemIA {
  ticker: string;
  side: 'buy' | 'sell';
  tipo: 'market' | 'limit';
  quantidade: number;
  precoLimite?: number;
  razao: string;
}

interface RespostaIA {
  analise: string;
  ordens: OrdemIA[];
  proximo: string;
}

async function chamarClaude(userPrompt: string): Promise<string> {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': <<REMOVIDO>>,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!resp.ok) throw new Error(`Anthropic ${resp.status}: ${(await resp.text()).slice(0, 300)}`);
  const data = (await resp.json()) as {
    content: Array<{ type: string; text?: string }>;
    stop_reason?: string;
  };
  if (data.stop_reason === 'refusal') throw new Error('modelo recusou a requisição');
  return data.content.filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n');
}

function extrairJson(texto: string): RespostaIA | null {
  const cerca = /```(?:json)?\s*([\s\S]*?)```/.exec(texto);
  const bruto = cerca ? cerca[1]! : texto;
  const i = bruto.indexOf('{');
  const f = bruto.lastIndexOf('}');
  if (i < 0 || f <= i) return null;
  try {
    const o = JSON.parse(bruto.slice(i, f + 1)) as RespostaIA;
    if (!Array.isArray(o.ordens)) o.ordens = [];
    return o;
  } catch {
    return null;
  }
}

/** Universo permitido: liquidez alta, para a ordem executar de verdade. */
async function universo(): Promise<Array<{ ticker: string; preco: Decimal; variacao: number }>> {
  const rows = (await db.execute(sql`
    with liquidos as (
      select ticker from qmix_invest.prices_daily
       where date > current_date - interval '60 days'
       group by ticker
      having avg(financial_volume_brl) > ${LIMITES.liquidezMinimaDiaria}
    )
    select t.ticker, t.last_quote_brl::text as preco,
           coalesce(t.last_quote_change_pct, 0)::text as variacao
      from qmix_invest.tickers t
      join liquidos l on l.ticker = t.ticker
     where t.last_quote_brl is not null and coalesce(t.asset_class,'acao') = 'acao'
     order by t.ticker
     limit 40
  `)) as unknown as Array<Record<string, string>>;
  return rows.map((r) => ({
    ticker: r.ticker!,
    preco: D(r.preco!),
    variacao: Number(r.variacao),
  }));
}

async function contexto(accountId: number) {
  const [posRows, ordensRows, handoffRows, equityRows] = await Promise.all([
    db.execute(sql`
      select p.ticker, p.quantidade, p.preco_medio::text, t.last_quote_brl::text as cotacao,
             coalesce(t.last_quote_change_pct,0)::text as variacao
        from qmix_invest.paper_positions p
        left join qmix_invest.tickers t on t.ticker = p.ticker
       where p.account_id = ${accountId} order by p.ticker
    `),
    db.execute(sql`
      select ticker, side, tipo, quantidade, preco_limite::text, razao
        from qmix_invest.paper_orders
       where account_id = ${accountId} and status = 'pending' order by criado_em
    `),
    db.execute(sql`
      select slot, resumo, proximo_job, criado_em::text
        from qmix_invest.paper_handoffs
       where account_id = ${accountId} order by criado_em desc limit 3
    `),
    db.execute(sql`
      select data::text, patrimonio::text
        from qmix_invest.paper_equity
       where account_id = ${accountId} order by data desc limit 5
    `),
  ]);
  return {
    posicoes: posRows as unknown as Array<Record<string, string>>,
    pendentes: ordensRows as unknown as Array<Record<string, string>>,
    handoffs: handoffRows as unknown as Array<Record<string, string>>,
    equity: equityRows as unknown as Array<Record<string, string>>,
  };
}

/**
 * Valida cada ordem contra as travas ANTES de gravar. A IA pode alucinar
 * ticker, quantidade negativa ou compra maior que o caixa; nada disso pode
 * chegar ao motor. Ordem invalida e descartada com o motivo registrado.
 */
function validar(
  ordens: OrdemIA[],
  permitidos: Map<string, Decimal>,
  caixa: Decimal,
  posicoes: Map<string, number>,
  patrimonioTotal: Decimal
): { aceitas: OrdemIA[]; recusadas: Array<{ ordem: OrdemIA; motivo: string }> } {
  const aceitas: OrdemIA[] = [];
  const recusadas: Array<{ ordem: OrdemIA; motivo: string }> = [];
  let caixaLivre = caixa;

  for (const o of ordens.slice(0, LIMITES.maxOrdensPorDespertar)) {
    const ticker = String(o.ticker ?? '').toUpperCase();
    const preco = permitidos.get(ticker);

    if (!preco) {
      recusadas.push({ ordem: o, motivo: 'ticker fora da lista de permitidos' });
      continue;
    }
    if (!Number.isInteger(o.quantidade) || o.quantidade <= 0) {
      recusadas.push({ ordem: o, motivo: 'quantidade inválida' });
      continue;
    }
    if (o.side !== 'buy' && o.side !== 'sell') {
      recusadas.push({ ordem: o, motivo: 'lado inválido' });
      continue;
    }

    if (o.side === 'sell') {
      const tem = posicoes.get(ticker) ?? 0;
      if (tem < o.quantidade) {
        recusadas.push({ ordem: o, motivo: `não há ${o.quantidade} em carteira (tem ${tem})` });
        continue;
      }
    } else {
      const custo = preco.times(o.quantidade).times(1.01); // folga p/ custos
      if (custo.gt(caixaLivre)) {
        recusadas.push({ ordem: o, motivo: 'não cabe no caixa disponível' });
        continue;
      }
      const teto = patrimonioTotal.times(LIMITES.maxPctPorPosicao);
      if (preco.times(o.quantidade).gt(teto)) {
        recusadas.push({ ordem: o, motivo: `passa de ${LIMITES.maxPctPorPosicao * 100}% do patrimônio` });
        continue;
      }
      if (!posicoes.has(ticker) && posicoes.size >= LIMITES.maxPosicoesAbertas) {
        recusadas.push({ ordem: o, motivo: `já há ${LIMITES.maxPosicoesAbertas} posições abertas` });
        continue;
      }
      caixaLivre = caixaLivre.minus(custo);
    }

    aceitas.push({ ...o, ticker });
  }
  return { aceitas, recusadas };
}

export async function rodarDespertar(slot: Slot): Promise<{ ordens: number; conta: number | null }> {
  const log = logger.child({ job: 'robo-ia', slot });

  if (!env.ROBO_IA_ATIVO) {
    log.info('robô desligado (ROBO_IA_ATIVO=false)');
    return { ordens: 0, conta: null };
  }
  if (!<<REMOVIDO>>) {
    log.warn('ANTHROPIC_API_KEY ausente');
    return { ordens: 0, conta: null };
  }

  let conta = await contaLive(CONTA);
  if (!conta) {
    const id = await criarContaLive(CONTA, env.ROBO_IA_CAPITAL);
    log.info({ id, capital: env.ROBO_IA_CAPITAL }, 'conta do robô criada');
    conta = await contaLive(CONTA);
  }
  if (!conta) return { ordens: 0, conta: null };

  // Executa o que ficou pendente do despertar anterior, ANTES de decidir de
  // novo: decidir sem saber se a ordem de ontem executou seria operar às cegas.
  await processarOrdensPendentes(conta.id);
  conta = (await contaLive(CONTA))!;

  const [mercado, ctx] = await Promise.all([universo(), contexto(conta.id)]);
  const permitidos = new Map(mercado.map((m) => [m.ticker, m.preco]));
  const posicoes = new Map(ctx.posicoes.map((p) => [p.ticker!, Number(p.quantidade)]));

  const valorPosicoes = ctx.posicoes.reduce(
    (a, p) => a.plus(D(p.cotacao ?? p.preco_medio!).times(Number(p.quantidade))),
    ZERO
  );
  const total = conta.caixa.plus(valorPosicoes);

  const carteiraTxt = ctx.posicoes.length
    ? ctx.posicoes
        .map((p) => {
          const pm = D(p.preco_medio!);
          const cot = D(p.cotacao ?? p.preco_medio!);
          const res = cot.minus(pm).div(pm).times(100);
          return `  ${p.ticker} · ${p.quantidade} ações · preço médio ${brl(pm)} · agora ${brl(cot)} · ${res.toFixed(2)}%`;
        })
        .join('\n')
    : '  (nenhuma posição aberta)';

  const mercadoTxt = mercado
    .map((m) => `  ${m.ticker} ${brl(m.preco)} (${m.variacao >= 0 ? '+' : ''}${m.variacao.toFixed(2)}% hoje)`)
    .join('\n');

  const handoffTxt = ctx.handoffs.length
    ? ctx.handoffs
        .map((h) => `  [${h.criado_em?.slice(0, 16)} · ${h.slot}] ${h.resumo}${h.proximo_job ? ` → ${h.proximo_job}` : ''}`)
        .join('\n')
    : '  (primeiro despertar, sem histórico)';

  const equityTxt = ctx.equity.length
    ? ctx.equity.map((e) => `  ${e.data}: ${brl(D(e.patrimonio!))}`).join('\n')
    : '  (ainda sem histórico)';

  const prompt = `MOMENTO: ${slot}
${MISSAO[slot]}

SEU PATRIMÔNIO
  Caixa livre: ${brl(conta.caixa)}
  Em ações: ${brl(valorPosicoes)}
  Total: ${brl(total)}   (começou com ${brl(conta.caixaInicial)})

CARTEIRA
${carteiraTxt}

ORDENS AINDA PENDENTES
${ctx.pendentes.length ? ctx.pendentes.map((o) => `  ${o.side} ${o.quantidade} ${o.ticker} (${o.tipo})`).join('\n') : '  (nenhuma)'}

PATRIMÔNIO NOS ÚLTIMOS DIAS
${equityTxt}

O QUE VOCÊ ANOTOU NOS DESPERTARES ANTERIORES
${handoffTxt}

PAPÉIS PERMITIDOS E COTAÇÃO AGORA
${mercadoTxt}

TRAVAS DE RISCO (o sistema recusa ordem que violar)
  Máximo ${LIMITES.maxPctPorPosicao * 100}% do patrimônio em um único papel
  Máximo ${LIMITES.maxPosicoesAbertas} posições abertas ao mesmo tempo
  Máximo ${LIMITES.maxOrdensPorDespertar} ordens por despertar
  Sem venda a descoberto

Decida.`;

  let resposta: RespostaIA | null = null;
  try {
    resposta = extrairJson(await chamarClaude(prompt));
  } catch (err) {
    log.error({ err }, 'chamada à IA falhou');
    return { ordens: 0, conta: conta.id };
  }
  if (!resposta) {
    log.warn('não consegui ler a resposta da IA');
    return { ordens: 0, conta: conta.id };
  }

  // Nos slots sem mercado aberto, ordem e descartada por construcao.
  const podeOperar = slot !== 'pre-abertura' && slot !== 'pos-fechamento';
  const { aceitas, recusadas } = podeOperar
    ? validar(resposta.ordens, permitidos, conta.caixa, posicoes, total)
    : { aceitas: [], recusadas: resposta.ordens.map((o) => ({ ordem: o, motivo: 'mercado fechado neste horário' })) };

  for (const o of aceitas) {
    await db.execute(sql`
      insert into qmix_invest.paper_orders
        (account_id, ticker, side, tipo, quantidade, preco_limite, data_ordem, razao)
      values (${conta.id}, ${o.ticker}, ${o.side}, ${o.tipo}, ${o.quantidade},
              ${o.precoLimite ?? null}, current_date, ${o.razao ?? null})
    `);
  }

  if (aceitas.length > 0) await processarOrdensPendentes(conta.id);
  await fotografarPatrimonio(conta.id);

  const contaFinal = (await contaLive(CONTA))!;
  const resumo =
    `${resposta.analise}\n` +
    (aceitas.length
      ? aceitas.map((o) => `${o.side === 'buy' ? 'comprou' : 'vendeu'} ${o.quantidade} ${o.ticker}: ${o.razao}`).join('\n')
      : 'sem ordens neste despertar') +
    (recusadas.length ? `\nrecusadas: ${recusadas.map((r) => `${r.ordem.ticker} (${r.motivo})`).join(', ')}` : '');

  await db.execute(sql`
    insert into qmix_invest.paper_handoffs (account_id, slot, resumo, proximo_job, estado_json)
    values (${conta.id}, ${slot}, ${resumo}, ${resposta.proximo ?? null},
            ${JSON.stringify({ caixa: contaFinal.caixa.toString(), ordens: aceitas.length, modelo: MODELO })})
  `);

  const emoji = aceitas.length ? '🤖' : '💤';
  const linhas = [
    `${emoji} *Robô — ${slot}*`,
    '',
    resposta.analise,
    '',
  ];
  if (aceitas.length) {
    linhas.push('*Ordens*');
    for (const o of aceitas) {
      linhas.push(`• ${o.side === 'buy' ? 'Compra' : 'Venda'} ${o.quantidade} ${o.ticker} — ${o.razao}`);
    }
    linhas.push('');
  }
  if (recusadas.length) {
    linhas.push(`_Recusadas pelas travas: ${recusadas.map((r) => `${r.ordem.ticker} (${r.motivo})`).join(', ')}_`);
    linhas.push('');
  }
  const varTotal = contaFinal.caixaInicial.gt(0)
    ? total.minus(contaFinal.caixaInicial).div(contaFinal.caixaInicial).times(100)
    : ZERO;
  linhas.push(`Patrimônio: *${brl(total)}* (${varTotal.gte(0) ? '+' : ''}${varTotal.toFixed(2)}% desde o início)`);
  if (resposta.proximo) linhas.push(`\n_Próximo: ${resposta.proximo}_`);
  linhas.push('\n_https://qf.qmix.digital/robo_');

  try {
    await sendTelegramMessage(linhas.join('\n'), 'Markdown');
  } catch (err) {
    log.warn({ err }, 'falha ao enviar no Telegram');
  }

  log.info({ ordens: aceitas.length, recusadas: recusadas.length }, 'despertar concluído');
  return { ordens: aceitas.length, conta: conta.id };
}
