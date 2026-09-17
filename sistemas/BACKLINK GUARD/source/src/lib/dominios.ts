import { getDomain } from "tldts";
import { statusDaLinha, type LinhaStatus } from "@/lib/checks/status";
import { passaAutoridade } from "@/lib/checks/valor";

// Reputação por DOMÍNIO de portal.
//
// A tabela de backlinks responde "este link está bom?". Esta visão responde
// outra pergunta, que é a que decide compra: "vale a pena publicar neste site
// de novo?". Um portal que apagou 6 de 6 artigos não merece o próximo pedido.
//
// Dois comportamentos ruins, contados separado porque são diferentes:
//   - conteúdo removido: o artigo saiu do ar (404/410 ou jogado pra home);
//   - link retirado: o artigo continua no ar, mas o link do cliente sumiu.
// O segundo é mais discreto e, na base da QMIX, mais frequente que o primeiro.

export type Risco = "alto" | "medio" | "baixo" | "amostra-pequena";
/**
 *  nao_recomendado -> não comprar mais lá
 *  confiavel       -> aprovado
 *  ignorado        -> fora do relatório sem julgar o portal (dado errado)
 *  sem_marca       -> só tem anotação
 */
export type MarcaManual =
  | "nao_recomendado"
  | "confiavel"
  | "ignorado"
  | "sem_marca"
  | null;

const MARCAS_VALIDAS = ["nao_recomendado", "confiavel", "ignorado", "sem_marca"];

/** Abaixo disso, a taxa é ruído: 1 remoção em 1 backlink não é 100% de risco. */
export const MINIMO_PARA_CLASSIFICAR = 3;

export interface BacklinkParaDominio extends LinhaStatus {
  articleUrl: string;
  lastLinkRel: string | null;
}

export interface EstatDominio {
  dominio: string;
  total: number;
  /** artigo saiu do ar */
  removidos: number;
  /** artigo no ar, link do cliente sumiu */
  linkRetirado: number;
  /** o portal bloqueia nosso robô (não dá pra verificar sozinho) */
  bloqueiam: number;
  /** link presente porém nofollow/sponsored/ugc */
  nofollow: number;
  /** (removidos + linkRetirado) / total */
  taxaProblema: number;
  risco: Risco;
  marca: MarcaManual;
  observacao: string | null;
}

/** Domínio registrável do artigo (blog.x.com e x.com contam como o mesmo dono). */
export function dominioDoArtigo(url: string): string | null {
  return getDomain(url);
}

function classifica(total: number, taxa: number): Risco {
  if (total < MINIMO_PARA_CLASSIFICAR) return "amostra-pequena";
  if (taxa >= 0.5) return "alto";
  if (taxa >= 0.25) return "medio";
  return "baixo";
}

export function agrupaPorDominio(
  backlinks: BacklinkParaDominio[],
  marcas: Map<string, { status: string; note: string | null }>,
): EstatDominio[] {
  const acc = new Map<string, EstatDominio>();

  for (const b of backlinks) {
    const dominio = dominioDoArtigo(b.articleUrl);
    if (!dominio) continue;

    let e = acc.get(dominio);
    if (!e) {
      e = {
        dominio,
        total: 0,
        removidos: 0,
        linkRetirado: 0,
        bloqueiam: 0,
        nofollow: 0,
        taxaProblema: 0,
        risco: "amostra-pequena",
        marca: null,
        observacao: null,
      };
      acc.set(dominio, e);
    }

    const s = statusDaLinha(b);
    e.total++;
    if (s.published.valor === false) e.removidos++;
    else if (s.published.valor === true && s.linkOk.valor === false) e.linkRetirado++;
    else if (s.published.valor === null) e.bloqueiam++;
    if (s.linkOk.valor === true && passaAutoridade(b.lastLinkRel) === false) e.nofollow++;
  }

  for (const e of acc.values()) {
    e.taxaProblema = e.total > 0 ? (e.removidos + e.linkRetirado) / e.total : 0;
    e.risco = classifica(e.total, e.taxaProblema);
    const m = marcas.get(e.dominio);
    e.marca =
      m && MARCAS_VALIDAS.includes(m.status) ? (m.status as MarcaManual) : null;
    e.observacao = m?.note ?? null;
  }

  // pior primeiro; entre iguais, quem tem mais histórico primeiro
  return [...acc.values()].sort(
    (a, b) =>
      Number(b.marca === "nao_recomendado") - Number(a.marca === "nao_recomendado") ||
      b.taxaProblema - a.taxaProblema ||
      b.total - a.total ||
      a.dominio.localeCompare(b.dominio),
  );
}

/**
 * Só os que merecem atenção — é o que abre a aba por padrão.
 * "ignorado" nunca aparece: foi você que tirou da lista.
 */
export function apenasProblematicos(lista: EstatDominio[]): EstatDominio[] {
  return lista.filter((e) => {
    if (e.marca === "ignorado") return false;
    if (e.marca === "nao_recomendado") return true;
    if (e.marca === "confiavel") return false;
    return e.risco === "alto" || e.risco === "medio";
  });
}
