// Como um status é exibido: automático, ou corrigido à mão pelo usuário.
//
// Existe porque nem tudo é verificável por robô. Portal com WAF/Cloudflare
// devolve 403 e o check honesto fica em "não confirmado" — mas a pessoa abre a
// página no navegador e vê que o artigo está no ar e o link está lá. Essa
// informação é boa e precisa caber na ferramenta.
//
// Regra: o manual PREVALECE sobre o automático, e vive em colunas separadas no
// banco. Nenhuma rodada de verificação escreve nelas, então a correção não é
// perdida na próxima execução — e dá pra voltar ao automático a qualquer hora.

export type Origem = "auto" | "manual";

export interface StatusEfetivo {
  valor: boolean | null;
  origem: Origem;
}

/** O que mostrar na tela: a correção manual quando existe, senão o automático. */
export function statusEfetivo(
  automatico: boolean | null,
  manual: boolean | null | undefined,
): StatusEfetivo {
  if (manual === true || manual === false) return { valor: manual, origem: "manual" };
  return { valor: automatico, origem: "auto" };
}

/** Campos que aceitam correção manual. */
export const CAMPOS_MANUAIS = ["published", "linkOk", "indexed"] as const;
export type CampoManual = (typeof CAMPOS_MANUAIS)[number];

export function isCampoManual(v: unknown): v is CampoManual {
  return typeof v === "string" && (CAMPOS_MANUAIS as readonly string[]).includes(v);
}

/** Valores aceitos na correção: sim, não, ou "voltar ao automático" (null). */
export function normalizaValorManual(v: unknown): boolean | null {
  if (v === true || v === "sim" || v === "true") return true;
  if (v === false || v === "nao" || v === "false") return false;
  return null; // qualquer outra coisa = limpar a correção
}

/** Coluna do Prisma correspondente ao campo. */
export const COLUNA_MANUAL: Record<CampoManual, "manualPublished" | "manualLinkOk" | "manualIndexed"> =
  {
    published: "manualPublished",
    linkOk: "manualLinkOk",
    indexed: "manualIndexed",
  };

export interface LinhaStatus {
  lastPublished: boolean | null;
  lastLinkOk: boolean | null;
  lastIndexed: boolean | null;
  manualPublished: boolean | null;
  manualLinkOk: boolean | null;
  manualIndexed: boolean | null;
}

/**
 * Os 3 status já resolvidos: correção manual sobre o automático, e as
 * consequências de um artigo removido.
 *
 * Quando o artigo foi comprovadamente apagado (404/410 ou jogado pra home), não
 * existe página — logo não existe link. Deixar "Conferir" nessa coluna é pedir
 * que você confira uma coisa que não tem como existir. Então o link é derivado
 * para "Não".
 *
 * A indexação NÃO é derivada para "Não": uma página apagada pode continuar no
 * índice do Google por semanas até ele recrawlear, então afirmar "não indexado"
 * seria inventar. Ela vira "não se aplica" — o backlink morreu, a pergunta
 * perdeu o sentido. É a diferença entre "sabemos que não" e "não interessa
 * mais".
 *
 * Correção manual sempre vence: se você afirmou algo naquele campo, a derivação
 * não passa por cima.
 */
export function statusDaLinha(l: LinhaStatus) {
  const published = statusEfetivo(l.lastPublished, l.manualPublished);
  let linkOk = statusEfetivo(l.lastLinkOk, l.manualLinkOk);
  let indexed = statusEfetivo(l.lastIndexed, l.manualIndexed);

  const artigoRemovido = published.valor === false;
  if (artigoRemovido) {
    if (l.manualLinkOk === null) linkOk = { valor: false, origem: "auto" };
    if (l.manualIndexed === null) indexed = { valor: null, origem: "auto" };
  }

  return {
    published,
    linkOk,
    indexed,
    artigoRemovido,
    /** a pergunta "está indexado?" ainda faz sentido nesta linha? */
    indexacaoAplicavel: !artigoRemovido || l.manualIndexed !== null,
  };
}

/** Tem alguma correção manual nesta linha? */
export function temCorrecaoManual(l: LinhaStatus): boolean {
  return (
    l.manualPublished !== null || l.manualLinkOk !== null || l.manualIndexed !== null
  );
}
