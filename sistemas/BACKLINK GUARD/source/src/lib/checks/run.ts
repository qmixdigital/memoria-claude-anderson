import type { CheckOutcome, LinkType } from "@/lib/types";
import {
  fetchWithTrace,
  findLinkByAnchorText,
  findLinkToDomain,
  findLinkToUrl,
  hasReadableContent,
  looksJsRendered,
  parseHtml,
} from "./html";
import { checkIndexation } from "./indexation";
import { sameRegistrableDomain } from "@/lib/utils/domain";

export interface CheckInput {
  articleUrl: string;
  type: LinkType;
  /** domínio do site do cliente (fallback do alvo) */
  clientDomain: string;
  /** domínio de destino do backlink (preferido); default = clientDomain */
  targetDomain?: string | null;
  /** destino esperado explícito (usado em REDIRECT_301) */
  expectedTarget: string | null;
  /** âncora contratada — usada para diagnosticar link apontando pro lugar errado */
  expectedAnchor?: string | null;
  /** permite indexação PAGA (DataForSEO) p/ sites de terceiros. Default: false */
  allowPaidIndexation?: boolean;
}

/**
 * Roda os 3 checks de um backlink:
 *   1. artigo publicado  (HTTP 2xx na URL do artigo)
 *   2. link do cliente presente (varia por tipo: link no HTML vs. destino do 301)
 *   3. indexado no Google (DataForSEO site:, se configurado)
 */
/** Host de uma URL, sem "www." — para mensagens de diagnóstico. */
function hostDe(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

/** Caminho normalizado de uma URL (sem barra final), "" em caso de erro. */
function safePath(url: string): string {
  try {
    return new URL(url).pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

export async function runCheck(input: CheckInput): Promise<CheckOutcome> {
  const target = input.targetDomain || input.expectedTarget || input.clientDomain;

  const trace = await fetchWithTrace(input.articleUrl);

  const status = trace.finalStatus;

  // Detecta redirecionamento para a HOME (artigo removido, mas responde 200 na
  // home). Só vale para DIRECT — em REDIRECT_301 o redirect é esperado.
  const reqPath = safePath(input.articleUrl);
  const finalPath = safePath(trace.finalUrl);
  const redirectedToHome =
    input.type !== "REDIRECT_301" &&
    trace.redirectChain.length > 0 &&
    reqPath.length > 1 && // o artigo tinha um caminho de verdade
    (finalPath === "" || finalPath === "/"); // e caiu na raiz/home

  // 3 estados: online (2xx) | deletado (404/410 ou redirect p/ home) | inacessível
  const online = status >= 200 && status < 300 && !redirectedToHome;
  const gone = status === 404 || status === 410 || redirectedToHome;
  const articlePublished: boolean | null = online ? true : gone ? false : null;

  // Link: "não" quando a página está online e o link não aparece, e também
  // quando o artigo foi APAGADO (sem página não há link). Só fica "desconhecido"
  // quando não conseguimos ler a página (bloqueio, timeout) — aí realmente não
  // dá pra afirmar nada.
  let linkPresent: boolean | null = online || gone ? false : null;
  let foundAnchor: string | null = null;
  let foundTarget: string | null = null;
  let linkRel: string | null = null;
  let note: string | null = null;

  if (redirectedToHome) {
    note = "O artigo foi removido — a página agora joga pra home do site.";
  } else if (!online && !gone) {
    note = "Não conseguimos acessar a página (o site bloqueou ou estava fora do ar).";
  }

  if (online) {
    if (input.type === "REDIRECT_301") {
      // A URL do backlink é um redirecionador: o link "está ok" se a cadeia
      // teve um redirect e o destino final bate com o domínio-alvo do cliente.
      const redirected = trace.redirectChain.length > 0;
      linkPresent =
        redirected && sameRegistrableDomain(trace.finalUrl, target);
    } else {
      // DIRECT: o link deve apontar para a URL EXATA contratada (expectedTarget).
      const html = trace.html ?? "";
      const root = html ? parseHtml(html) : null;

      if (!root || !hasReadableContent(root)) {
        // 200 mas conteúdo carrega via JavaScript / página vazia servida ao robô:
        // um link ausente do HTML cru NÃO significa "removido". Não afirmamos nada.
        linkPresent = null;
        note = looksJsRendered(html)
          ? "A página monta o conteúdo via JavaScript — não dá pra confirmar o link automaticamente."
          : "A página respondeu, mas veio quase vazia (possível bloqueio ou cache).";
      } else {
        const wantUrl = input.expectedTarget || `https://${target}/`;
        const exact = findLinkToUrl(root, wantUrl);
        if (exact) {
          linkPresent = true;
          foundAnchor = exact.anchorText || null;
          linkRel = exact.rel; // "" = dofollow; ver checks/valor.ts
        } else {
          // não achou a URL exata: o link existe para outra página do cliente?
          const domainHit = findLinkToDomain(root, target);
          if (domainHit) {
            linkPresent = false;
            foundAnchor = domainHit.anchorText || null;
            linkRel = domainHit.rel;
            foundTarget = domainHit.href;
            note = `O link existe, mas aponta pra outra página do cliente (${domainHit.href}).`;
          } else {
            // Nenhum link para o domínio do cliente. Antes parava aqui e a
            // tabela mostrava só "Não", sem dizer se o link sumiu ou se está
            // apontando para outro domínio. A âncora contratada resolve isso.
            linkPresent = false;
            const porAncora = input.expectedAnchor
              ? findLinkByAnchorText(root, input.expectedAnchor)
              : null;
            if (porAncora) {
              foundAnchor = porAncora.anchorText || null;
              note = `O link com esta âncora existe, mas aponta para ${hostDe(
                porAncora.href,
              )} — e não para ${target}. Confira se o domínio do cliente está certo.`;
            }
          }
        }
      }
    }
  }

  // TRAVA DE CUSTO — quando NÃO consultar a indexação (cada consulta é US$ 0,01):
  //
  //   articlePublished === false  artigo 404/410 ou jogado pra home. Backlink
  //                               perdido; saber se ainda está no índice não
  //                               muda nenhuma decisão.
  //   linkPresent === false       o link do cliente não está na página (sumiu ou
  //                               aponta pra outro domínio). Sem link, o backlink
  //                               não existe — perguntar ao Google se o artigo
  //                               está indexado é gastar à toa.
  //
  // O `null` NÃO entra na trava: null é "não deu pra confirmar" (página bloqueou,
  // conteúdo via JavaScript). Nesses casos a indexação é o único sinal que
  // sobra, então continuamos consultando.
  const semLinkDoCliente = linkPresent === false;
  const artigoMorto = articlePublished === false;
  const naoValeConsultar = artigoMorto || semLinkDoCliente;

  const indexation = naoValeConsultar
    ? { indexed: null as boolean | null, costCents: 0 }
    : await checkIndexation(input.articleUrl, {
        allowPaid: input.allowPaidIndexation ?? false,
      });

  // Mostramos só a observação amigável em português (o erro cru de fetch em
  // inglês fica de fora — a coluna "Situação da página" já explica o estado).
  return {
    articlePublished,
    linkPresent,
    indexed: indexation.indexed, // boolean | null (null = desconhecido)
    httpStatus: trace.finalStatus || null,
    finalUrl: trace.finalUrl || null,
    foundAnchor,
    foundTarget,
    linkRel,
    error: note,
    costCents: indexation.costCents,
  };
}
