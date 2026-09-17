// Mensagens do módulo fiscal em LINGUAGEM SIMPLES, para quem está começando.
// Sempre que aparece um termo técnico, vem uma explicação curta entre parênteses,
// padronizada pelo GLOSSARIO. Os números e a precisão são exatamente os da apuração;
// aqui muda só o jeito de escrever.

import Decimal from 'decimal.js';
import { GLOSSARIO } from './config.js';

export function fmtBRL(v: Decimal.Value): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    new Decimal(v).toNumber(),
  );
}

// YYYY-MM-DD → DD/MM
function fmtDM(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

// Nome amigável do tipo de provento.
function nomeProvento(eventType: string): string {
  const t = eventType.toUpperCase();
  if (t.includes('JUROS') || t.includes('JCP')) return 'JCP (juros sobre capital próprio)';
  return 'dividendo';
}

// Rótulos amigáveis dos termos (pro glossário embutido no rodapé das mensagens).
const TERMO_LABEL: Record<keyof typeof GLOSSARIO, string> = {
  swing: 'Operação normal',
  dayTrade: 'Day trade',
  isento: 'Livre de imposto',
  teto: 'Limite do mês',
  precoMedio: 'Preço médio',
  darf: 'DARF',
  prejuizoCompensar: 'Prejuízo a compensar',
  dedoDuro: 'Dedo-duro',
};

// Monta um glossário embutido só com os termos que aparecem naquela mensagem.
function rodapeGlossario(chaves: Array<keyof typeof GLOSSARIO>): string {
  const linhas = ['📖 *Termos desta mensagem:*'];
  for (const k of chaves) linhas.push(`• *${TERMO_LABEL[k]}*: ${GLOSSARIO[k]}`);
  return linhas.join('\n');
}

// ── Confirmação de registro (compra/venda) ───────────────────────────────────

export interface ConfirmacaoInput {
  side: 'buy' | 'sell';
  ticker: string;
  quantity: number;
  price: Decimal.Value;
  isDayTrade: boolean;
  // compra:
  novoPm?: Decimal.Value;
  // venda:
  lucro?: Decimal.Value;
  isento?: boolean;
  vendidoMes?: Decimal.Value; // total vendido de ação no mês (após este registro)
  margem?: Decimal.Value; // quanto ainda cabe no teto
  imposto?: Decimal.Value; // imposto estimado do mês (só quando estourou)
  perto90?: boolean; // passou de 90% do teto (mas ainda isento)
}

export function msgConfirmacaoRegistro(i: ConfirmacaoInput): string {
  const acoes = `${i.quantity} ${i.quantity === 1 ? 'ação' : 'ações'} da ${i.ticker}`;

  if (i.isDayTrade) {
    return [
      `✅ Anotei: ${i.side === 'sell' ? 'venda' : 'compra'} de ${acoes} a ${fmtBRL(i.price)} cada.`,
      ``,
      `⚠️ Isso é *day trade* (${GLOSSARIO.dayTrade}). Esse tipo de operação fica fora do controle automático de imposto — o imposto dele é calculado à parte.`,
    ].join('\n');
  }

  if (i.side === 'buy') {
    const linhas = [
      `✅ Anotei: você comprou ${acoes} a ${fmtBRL(i.price)} cada (operação normal — ${GLOSSARIO.swing}).`,
    ];
    if (i.novoPm != null) {
      linhas.push('');
      linhas.push(
        `Seu preço médio (${GLOSSARIO.precoMedio}) de ${i.ticker} agora é ${fmtBRL(i.novoPm)}.`,
      );
    }
    return linhas.join('\n');
  }

  // venda
  const linhas = [
    `✅ Anotei: você vendeu ${acoes} a ${fmtBRL(i.price)} cada (operação normal — ${GLOSSARIO.swing}).`,
    ``,
    `Lucro dessa venda: ${fmtBRL(i.lucro ?? 0)} (a diferença entre o que você pagou e o que recebeu).`,
  ];

  if (i.isento) {
    linhas.push(`Esse lucro está *livre de imposto* (${GLOSSARIO.isento}).`);
    linhas.push('');
    linhas.push(
      `Você já vendeu ${fmtBRL(i.vendidoMes ?? 0)} em ações este mês, de um limite de R$ 19.900 (${GLOSSARIO.teto}).`,
    );
    linhas.push('');
    linhas.push(`Ainda dá pra vender mais ${fmtBRL(i.margem ?? 0)} este mês sem pagar imposto.`);
    if (i.perto90) {
      linhas.push('');
      linhas.push(
        `🔔 Atenção: você já está perto do limite do mês. Cuidado pra não passar de R$ 20 mil em vendas, senão o lucro do mês inteiro passa a pagar imposto.`,
      );
    }
  } else {
    linhas.push('');
    linhas.push(
      `⚠️ Atenção: com esta venda você já vendeu ${fmtBRL(i.vendidoMes ?? 0)} em ações no mês e passou do limite de R$ 19.900 (${GLOSSARIO.teto}). Quando passa desse limite, o lucro do mês inteiro paga 15% de imposto.`,
    );
    if (i.imposto != null) {
      linhas.push('');
      linhas.push(
        `Imposto estimado do mês até agora: ${fmtBRL(i.imposto)} (pago numa guia chamada DARF — ${GLOSSARIO.darf}).`,
      );
    }
  }
  return linhas.join('\n');
}

// ── Aviso ANTES de confirmar uma venda que estoura o teto (item 3) ────────────

export interface AvisoEstouroInput {
  ticker: string;
  quantidade: number;
  valorVenda: Decimal.Value;
  vendidoApos: Decimal.Value; // total do mês se confirmar
}

export function msgAvisoEstouro(i: AvisoEstouroInput): string {
  return [
    `🚨 *Atenção: esta venda faz o mês passar de R$ 20 mil.*`,
    ``,
    `Vender ${i.quantidade} ${i.quantidade === 1 ? 'ação' : 'ações'} da ${i.ticker} (${fmtBRL(i.valorVenda)}) leva o total vendido em ações no mês a ${fmtBRL(i.vendidoApos)}.`,
    ``,
    `Se confirmar, *todo o lucro em ações deste mês passa a pagar 15% de imposto* — você perde a isenção (${GLOSSARIO.isento}) do mês inteiro, não só do que passou de R$ 20 mil.`,
    ``,
    `Quer confirmar mesmo assim ou cancelar?`,
  ].join('\n');
}

// ── Aviso ANTES de confirmar um registro que vira day trade (item 2) ──────────

export function msgAvisoDayTrade(ticker: string, side: 'buy' | 'sell'): string {
  const acaoAtual = side === 'buy' ? 'compra' : 'venda';
  const acaoAnterior = side === 'buy' ? 'venda' : 'compra';
  return [
    `🚨 *Atenção: isso pode virar day trade.*`,
    ``,
    `Você está registrando uma ${acaoAtual} de ${ticker} no mesmo dia em que já houve uma ${acaoAnterior} desse papel.`,
    `Comprar e vender a mesma ação no mesmo dia é *day trade* (${GLOSSARIO.dayTrade}) — paga 20% de imposto e perde a isenção (${GLOSSARIO.isento}).`,
    ``,
    `Quer confirmar mesmo assim ou cancelar?`,
  ].join('\n');
}

// ── Alerta de oportunidade ao longo do mês (1 ação) ───────────────────────────

export interface OportunidadeInput {
  ticker: string;
  quantidade: number;
  precoAtual: Decimal.Value;
  precoMedio: Decimal.Value;
  ganhoLivre: Decimal.Value; // lucro que ficaria livre de imposto
  margemRestante: Decimal.Value; // margem que sobraria após esta venda
  custoGiro: Decimal.Value; // taxas pra vender + recomprar
  beneficioPotencial: Decimal.Value; // imposto que pode evitar no futuro (condicional)
  poucoLiquida?: boolean;
  proventoProximo?: { comDate: string; dataEx: string; eventType: string }; // dividendo/JCP a caminho
  proventoConflito?: boolean; // a recompra cairia depois da data-com (perde o provento)
  recompraData?: string; // YYYY-MM-DD — próximo dia útil (quando recompraria)
}

export function msgOportunidade(i: OportunidadeInput): string {
  const linhas = [
    `💡 *Oportunidade hoje: ${i.ticker}*`,
    ``,
    `A ${i.ticker} está valendo ${fmtBRL(i.precoAtual)} — acima do seu preço médio, que é ${fmtBRL(i.precoMedio)}.`,
    ``,
    `Se vender ${i.quantidade} ${i.quantidade === 1 ? 'ação' : 'ações'} e recomprar em seguida, você trava um lucro de *${fmtBRL(i.ganhoLivre)}* livre de imposto e sobe seu preço médio.`,
    ``,
    `💰 Custo pra fazer isso: cerca de ${fmtBRL(i.custoGiro)} (só as taxas da bolsa nas duas pontas — o C6 não cobra corretagem).`,
    ``,
    `🛡️ Pra que serve: se um dia você vender muita ação de uma vez (mais de R$ 20 mil num mesmo mês), isso pode te poupar até ${fmtBRL(i.beneficioPotencial)} de imposto lá na frente.`,
  ];
  if (i.poucoLiquida) {
    linhas.push('');
    linhas.push('⚠️ Atenção: esta ação é pouco negociada, então recomprar pode sair um pouco mais caro que o preço de tela.');
  }

  // Aviso de dividendo/JCP a caminho (item 1) — usa a DATA-COM exata como limite
  const temProvento = !!i.proventoProximo;
  if (i.proventoProximo) {
    const nome = nomeProvento(i.proventoProximo.eventType);
    const tipo = nome.startsWith('JCP') ? 'JCP' : 'dividendo';
    const com = fmtDM(i.proventoProximo.comDate);
    const ex = fmtDM(i.proventoProximo.dataEx);
    linhas.push('');
    if (i.proventoConflito) {
      // a recompra cairia depois da data-com → girar agora perde o provento
      linhas.push(
        `⚠️ Atenção: o último dia pra manter o ${tipo} é *${com}*${i.recompraData ? `, mas você só conseguiria recomprar em ${fmtDM(i.recompraData)} (já depois)` : ''}. Girar agora faz você ficar *sem o ${tipo}*. O ideal é adiar o giro pra depois de ${ex}.`,
      );
    } else {
      // dá pra manter, mas a janela é exata: recomprar ATÉ a data-com
      linhas.push(
        `⚠️ Atenção: esta ação paga ${nome} agora. Pra manter, você precisa recomprar *exatamente até ${com}* (último dia com direito). Se a recompra escapar pra ${ex} ou depois, você fica *sem o ${tipo}* — a janela é esse dia, não "amanhã ou depois".`,
      );
    }
  }

  // Reforço anti-day-trade. Quando há provento, a recompra tem data certa (acima);
  // sem provento, basta o próximo dia útil.
  linhas.push('');
  if (temProvento) {
    linhas.push(
      `📅 Importante: a recompra tem que ser no dia certo acima — e *nunca no mesmo dia da venda*, pra não virar day trade (${GLOSSARIO.dayTrade}), que paga 20% de imposto e perde a isenção.`,
    );
  } else {
    linhas.push(
      `📅 Importante: venda hoje e recompre só no *próximo dia útil* — nunca no mesmo dia, pra não virar day trade (${GLOSSARIO.dayTrade}), que paga 20% de imposto e perde a isenção.`,
    );
  }

  linhas.push('');
  linhas.push(`Ainda dá pra vender ${fmtBRL(i.margemRestante)} sem imposto este mês.`);
  linhas.push('');
  linhas.push(rodapeGlossario(['precoMedio', 'isento', 'teto', 'dayTrade']));
  linhas.push('');
  linhas.push('_Isto é só um aviso — quem decide e executa a venda é você._');
  return linhas.join('\n');
}

// ── Alerta de fim de mês ──────────────────────────────────────────────────────

export interface FimDeMesInput {
  mesLabel: string; // "06/2026"
  vendidoMes: Decimal.Value;
  isento: boolean;
  imposto?: Decimal.Value; // quando estourou
  darfVencimento?: string; // DD/MM
  sugestoes: Array<{ ticker: string; quantidade: number; ganhoLivre: Decimal.Value; custoGiro: Decimal.Value }>;
  adiar: Array<{ ticker: string; dataEx: string; eventType: string }>;
  naoCompensa: Array<{ ticker: string; custoGiro: Decimal.Value; beneficioPotencial: Decimal.Value }>;
}

export function msgFimDeMes(i: FimDeMesInput): string {
  const linhas = [
    `📅 *Resumo do mês ${i.mesLabel} — planejamento de imposto*`,
    ``,
    `Você vendeu ${fmtBRL(i.vendidoMes)} em ações este mês, de um limite de R$ 19.900 (${GLOSSARIO.teto}).`,
  ];

  if (i.isento) {
    linhas.push(`✅ Está tudo dentro do limite — o seu lucro deste mês está livre de imposto (${GLOSSARIO.isento}).`);
  } else {
    linhas.push(`⚠️ Você passou do limite. O lucro do mês paga 15% de imposto: ${fmtBRL(i.imposto ?? 0)}.`);
    if (i.darfVencimento) {
      linhas.push(`A guia pra pagar (DARF — ${GLOSSARIO.darf}) vence em ${i.darfVencimento}.`);
    }
  }

  // Sugestões que valem a pena agora
  if (i.sugestoes.length > 0) {
    linhas.push('');
    linhas.push('💡 Dá pra aproveitar a margem que sobrou pra subir seu preço médio sem pagar imposto:');
    for (const s of i.sugestoes) {
      linhas.push(
        `• ${s.ticker} — vender ${s.quantidade} (trava lucro livre de ${fmtBRL(s.ganhoLivre)}, custo cerca de ${fmtBRL(s.custoGiro)} de taxas)`,
      );
    }
    linhas.push('');
    linhas.push(
      `📅 Lembre: venda hoje e recompre só no próximo dia útil — nunca no mesmo dia (day trade, 20% de imposto).`,
    );
  }

  // Adiar por causa de dividendo/JCP a caminho
  if (i.adiar.length > 0) {
    linhas.push('');
    linhas.push('⏳ Nestas, é melhor esperar — elas pagam dividendo/JCP em breve:');
    for (const a of i.adiar) {
      const nome = nomeProvento(a.eventType);
      linhas.push(`• ${a.ticker} — só gire depois de ${fmtDM(a.dataEx)}, senão você fica de fora do ${nome.startsWith('JCP') ? 'JCP' : 'dividendo'}.`);
    }
  }

  // Transparência: as que não compensam
  if (i.naoCompensa.length > 0) {
    linhas.push('');
    linhas.push('🚫 Nestas, girar não compensa agora:');
    for (const n of i.naoCompensa) {
      linhas.push(
        `• ${n.ticker} — o custo das taxas (${fmtBRL(n.custoGiro)}) é maior que o imposto que você economizaria (${fmtBRL(n.beneficioPotencial)}).`,
      );
    }
  }

  if (i.sugestoes.length > 0 || i.adiar.length > 0 || i.naoCompensa.length > 0) {
    linhas.push('');
    linhas.push(rodapeGlossario(['precoMedio', 'isento', 'teto', 'dayTrade']));
    linhas.push('');
    linhas.push('_São avisos, não ordens — quem decide e executa é você._');
  }

  return linhas.join('\n');
}

// ── Lembrete de recompra (item 2) ─────────────────────────────────────────────

export function msgLembreteRecompra(ticker: string, quantidade: number): string {
  return [
    `🔔 *Lembrete: recompra pendente*`,
    ``,
    `Você vendeu ${quantidade} ${quantidade === 1 ? 'ação' : 'ações'} da ${ticker} pra subir o preço médio (${GLOSSARIO.precoMedio}), mas ainda não registrou a recompra.`,
    `Sem recomprar, você ficou de fora desse papel.`,
    ``,
    `_Se já recomprou, é só me mandar a operação que eu registro._`,
  ].join('\n');
}

// Aviso: a data-com do provento passou sem a recompra (item refino do revisor).
export function msgProventoPerdido(ticker: string, eventType: string): string {
  const nome = nomeProvento(eventType);
  const tipo = nome.startsWith('JCP') ? 'JCP' : 'dividendo';
  return [
    `🔔 *A data pra manter o ${tipo} da ${ticker} já passou.*`,
    ``,
    `Você vendeu ${ticker} pra subir o preço médio e ainda não registrou a recompra. Como a data com direito ao ${nome} já passou, se você recomprar agora vai ser *sem esse ${tipo}*.`,
    ``,
    `_Não dá pra desfazer; é só pra você saber. Da próxima, a recompra precisa ser até a data certa pra não perder o provento._`,
  ].join('\n');
}

// ── Lembrete de imposto a pagar / DARF (item 4) ───────────────────────────────

export function msgDarfAviso(valor: Decimal.Value, vencimento: string): string {
  return [
    `🧾 *Imposto a pagar este mês*`,
    ``,
    `Você tem ${fmtBRL(valor)} de imposto a pagar pela guia DARF (${GLOSSARIO.darf}), com vencimento em ${vencimento}.`,
  ].join('\n');
}

export function msgLembreteDarf(valor: Decimal.Value, vencimento: string): string {
  return [
    `⏰ *Lembrete: o imposto vence em breve*`,
    ``,
    `Você tem ${fmtBRL(valor)} pra pagar pela guia DARF (${GLOSSARIO.darf}) até ${vencimento}.`,
    `Não esqueça pra não tomar multa.`,
  ].join('\n');
}

// ── Resumo do export pra declaração ───────────────────────────────────────────

export interface ResumoExportInput {
  ano: number;
  totalIsento: Decimal.Value; // lucro livre no ano
  totalTributavel: Decimal.Value; // lucro que pagou imposto
  totalImpostoPago: Decimal.Value; // soma dos DARFs
  prejuizoAcumulado: Decimal.Value; // prejuízo a compensar restante
}

export function msgResumoExport(i: ResumoExportInput): string {
  return [
    `📄 *Resumo pra sua declaração de Imposto de Renda — ${i.ano}*`,
    ``,
    `Lucro livre de imposto no ano: ${fmtBRL(i.totalIsento)}`,
    `  (vai no campo "Rendimentos Isentos e Não Tributáveis", código 20)`,
    `Lucro que pagou imposto: ${fmtBRL(i.totalTributavel)}`,
    `Imposto pago no ano (somando as guias DARF — ${GLOSSARIO.darf}): ${fmtBRL(i.totalImpostoPago)}`,
    `Perdas guardadas pra abater de lucros futuros: ${fmtBRL(i.prejuizoAcumulado)}`,
    `  (${GLOSSARIO.prejuizoCompensar})`,
    ``,
    `O detalhamento mês a mês está no arquivo anexo.`,
  ].join('\n');
}
