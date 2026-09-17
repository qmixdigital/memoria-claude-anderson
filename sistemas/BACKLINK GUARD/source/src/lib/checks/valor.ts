// Se o backlink ainda VALE, não só se ele existe.
//
// Os 3 checks (no ar, link presente, indexado) respondem "o link está lá?".
// Um link pode passar nos três e mesmo assim não entregar nada em SEO:
//
//   - com rel="nofollow"/"sponsored"/"ugc", o Google não transfere autoridade;
//   - se a PÁGINA não está no índice, o Google nunca leu aquele link — dofollow
//     ou não, não transfere nada;
//   - com a âncora trocada por "clique aqui", perde-se a palavra-chave, que é o
//     mecanismo de rankeamento.
//
// Só decisão pura, sem rede nem banco — por isso dá pra testar.

/** rel que anulam a transferência de autoridade. */
const REL_SEM_AUTORIDADE = ["nofollow", "sponsored", "ugc"];

/**
 * O link transfere autoridade pelo atributo `rel`?
 *   null  -> não avaliado (check antigo, ou link não encontrado)
 *   true  -> sim ("" , "noopener", "noreferrer noopener" …)
 *   false -> não (nofollow / sponsored / ugc)
 */
export function passaAutoridade(rel: string | null | undefined): boolean | null {
  if (rel === null || rel === undefined) return null;
  const partes = rel.toLowerCase().split(/[\s,]+/).filter(Boolean);
  return !partes.some((p) => REL_SEM_AUTORIDADE.includes(p));
}

/** Quais rel bloqueantes estão presentes (para mostrar na tela). */
export function relBloqueantes(rel: string | null | undefined): string[] {
  if (!rel) return [];
  const partes = rel.toLowerCase().split(/[\s,]+/).filter(Boolean);
  return REL_SEM_AUTORIDADE.filter((r) => partes.includes(r));
}

/** Normaliza âncora para comparação: sem acento, sem caixa, sem espaço extra. */
export function chaveAncora(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * A âncora encontrada perdeu a palavra-chave contratada?
 *
 * Só afirma quando temos os dois textos. NÃO conta como troca:
 *
 *   - diferença de acento, caixa ou espaço;
 *   - a âncora contratada aparecer INTEIRA dentro da encontrada. É o caso de
 *     "afirmou o médico especialista em coluna em Goiânia" contendo "médico
 *     especialista em coluna em Goiânia": o portal só embutiu o link numa
 *     frase, e a palavra-chave continua inteira. Isso é variação natural, que
 *     é justamente o que se recomenda em SEO — acusar aqui é falso positivo.
 *
 * Conta como troca quando a âncora encontrada não contém a contratada — aí a
 * palavra-chave foi encurtada ("médico") ou substituída ("clique aqui").
 */
export function ancoraDivergente(
  contratada: string | null | undefined,
  encontrada: string | null | undefined,
): boolean {
  if (!contratada?.trim() || !encontrada?.trim()) return false;
  const alvo = chaveAncora(contratada);
  const real = chaveAncora(encontrada);
  if (alvo === real) return false;
  return !real.includes(alvo); // keyword preservada dentro da frase = ok
}

export type Alerta = "nofollow" | "fora-do-indice" | "ancora-trocada";

export interface EntradaValor {
  /** link presente? valor EFETIVO (correção manual já aplicada) */
  linkOk: boolean | null;
  /** indexado? valor EFETIVO. null = não sabemos, então não acusamos nada */
  indexado: boolean | null;
  rel: string | null;
  ancoraContratada: string | null;
  ancoraEncontrada: string | null;
}

/** Alertas de perda de valor de um backlink cujo link ESTÁ presente. */
export function alertasDeValor(e: EntradaValor): Alerta[] {
  // Sem link presente não faz sentido falar de perda de valor — a linha já está
  // marcada em vermelho pelo check do link.
  if (e.linkOk !== true) return [];

  const alertas: Alerta[] = [];
  if (passaAutoridade(e.rel) === false) alertas.push("nofollow");
  // Página fora do índice: o Google não leu esta página, logo não leu o link.
  // `null` fica de fora de propósito — "não perguntamos" não é "não está".
  if (e.indexado === false) alertas.push("fora-do-indice");
  if (ancoraDivergente(e.ancoraContratada, e.ancoraEncontrada)) {
    alertas.push("ancora-trocada");
  }
  return alertas;
}

/** O link está, de fato, transferindo autoridade agora? */
export function transfereAutoridade(alertas: Alerta[]): boolean {
  return !alertas.includes("nofollow") && !alertas.includes("fora-do-indice");
}
