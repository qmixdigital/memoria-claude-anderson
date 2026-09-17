import { parse, type HTMLElement } from "node-html-parser";
import { env } from "@/lib/env";
import { rootDomain, sameRegistrableDomain } from "@/lib/utils/domain";
import { normalizeForCompare } from "@/lib/utils/url";
import { chaveAncora } from "./valor";

const MAX_REDIRECTS = 8;
const FETCH_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3; // 1 tentativa + 2 retries em falhas transitórias

export interface FetchTrace {
  finalUrl: string;
  finalStatus: number;
  redirectChain: number[]; // status codes dos redirects percorridos, na ordem
  html: string | null; // corpo só quando a resposta final é HTML
  error: string | null;
}

/** Cabeçalhos de um navegador real — reduz drasticamente 403/bloqueio de bot. */
function browserHeaders(): Record<string, string> {
  return {
    "User-Agent": env.FETCH_USER_AGENT,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "no-cache",
  };
}

/** Uma falha vale a pena repetir? (rede/timeout, 429 ou 5xx — nunca 404/403.) */
function isTransient(status: number): boolean {
  return status === 0 || status === 429 || (status >= 500 && status < 600);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch seguindo redirects manualmente, com RETRY em falhas transitórias.
 * Isto elimina a maior fonte de falso "fora do ar": um único timeout/blip de
 * rede ou 5xx passageiro não condena mais o backlink.
 */
export async function fetchWithTrace(url: string): Promise<FetchTrace> {
  let last: FetchTrace | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const trace = await fetchWithTraceOnce(url);
    if (!isTransient(trace.finalStatus)) return trace; // resultado definitivo
    last = trace;
    if (attempt < MAX_ATTEMPTS) await sleep(600 * attempt); // 600ms, 1200ms
  }
  return last!;
}

async function fetchWithTraceOnce(url: string): Promise<FetchTrace> {
  const chain: number[] = [];
  let current = url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: ctrl.signal,
        headers: browserHeaders(),
      });
    } catch (e) {
      clearTimeout(timer);
      return {
        finalUrl: current,
        finalStatus: 0,
        redirectChain: chain,
        html: null,
        error: e instanceof Error ? e.message : "fetch failed",
      };
    }
    clearTimeout(timer);

    // 3xx com Location -> continua a cadeia
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) {
        return {
          finalUrl: current,
          finalStatus: res.status,
          redirectChain: chain,
          html: null,
          error: "redirect sem Location",
        };
      }
      chain.push(res.status);
      current = new URL(loc, current).toString();
      continue;
    }

    // Resposta final (2xx, 4xx, 5xx)
    const contentType = res.headers.get("content-type") ?? "";
    const isHtml = contentType.includes("html") || contentType === "";
    let html: string | null = null;
    if (isHtml && res.ok) {
      try {
        html = await res.text();
      } catch {
        html = null;
      }
    }
    return {
      finalUrl: res.url || current,
      finalStatus: res.status,
      redirectChain: chain,
      html,
      error: null,
    };
  }

  return {
    finalUrl: current,
    finalStatus: 0,
    redirectChain: chain,
    html: null,
    error: `excedeu ${MAX_REDIRECTS} redirects`,
  };
}

export interface AnchorHit {
  href: string;
  anchorText: string;
  /** atributo `rel` normalizado ("" quando ausente) — decide se passa autoridade */
  rel: string;
}

// ---------------------------------------------------------------------------
// Parsing de HTML com um parser DE VERDADE (node-html-parser), não regex.
// Isto pega links que a regex antiga perdia: href com aspas simples, atributos
// em várias linhas, href não sendo o primeiro atributo, âncoras aninhadas, etc.
// ---------------------------------------------------------------------------

/** Extrai todos os <a href="http(s)://…"> absolutos da página, com seu texto. */
function extractAnchors(root: HTMLElement): AnchorHit[] {
  const hits: AnchorHit[] = [];
  for (const a of root.querySelectorAll("a")) {
    const href = a.getAttribute("href");
    if (!href || !/^https?:\/\//i.test(href)) continue; // ignora âncoras/relativos
    hits.push({
      href,
      anchorText: a.text.replace(/\s+/g, " ").trim(),
      rel: (a.getAttribute("rel") ?? "").replace(/\s+/g, " ").trim().toLowerCase(),
    });
  }
  return hits;
}

/**
 * Procura um link cuja URL bata EXATAMENTE com targetUrl (normalizado).
 * Aceita string HTML ou um root já parseado (evita reparsear a mesma página).
 */
export function findLinkToUrl(
  html: string | HTMLElement,
  targetUrl: string,
): AnchorHit | null {
  const root = typeof html === "string" ? parse(html) : html;
  const want = normalizeForCompare(targetUrl);
  for (const hit of extractAnchors(root)) {
    if (normalizeForCompare(hit.href) === want) return hit;
  }
  return null;
}

/** Procura o primeiro <a> que aponte para o domínio-alvo (registrável). */
export function findLinkToDomain(
  html: string | HTMLElement,
  targetDomainOrUrl: string,
): AnchorHit | null {
  const target = rootDomain(targetDomainOrUrl);
  if (!target) return null;
  const root = typeof html === "string" ? parse(html) : html;
  for (const hit of extractAnchors(root)) {
    if (sameRegistrableDomain(hit.href, target)) return hit;
  }
  return null;
}

/**
 * Acha o link pelo TEXTO da âncora contratada, seja qual for o destino.
 *
 * Serve para o diagnóstico "o link existe, mas aponta pra outro lugar": quando
 * o artigo não linka para o domínio do cliente, é a âncora que revela para onde
 * o link foi parar. Sem isso a tabela só mostrava "Não" em vermelho, sem dizer
 * se o link sumiu ou se apenas aponta para outro domínio.
 */
export function findLinkByAnchorText(
  html: string | HTMLElement,
  anchorText: string,
): AnchorHit | null {
  const alvo = chaveAncora(anchorText);
  if (!alvo) return null;
  const root = typeof html === "string" ? parse(html) : html;
  for (const hit of extractAnchors(root)) {
    if (chaveAncora(hit.anchorText) === alvo) return hit;
  }
  return null;
}

/**
 * A página monta o conteúdo via JavaScript (SPA/React/Vue/etc.)?
 * Nesses casos o HTML cru quase não tem texto nem links — então um link ausente
 * do HTML NÃO significa "link removido". Regra do seo-backlinks: marcar como
 * "não dá pra confirmar (JS)", nunca como removido.
 */
export function looksJsRendered(html: string): boolean {
  const root = parse(html);
  const body = root.querySelector("body");
  const bodyText = (body?.text ?? root.text ?? "").replace(/\s+/g, " ").trim();
  const anchorCount = root.querySelectorAll("a").length;

  // Sinais fortes de shell de SPA.
  const hasNoscriptWarning =
    /enable javascript|habilite o javascript|precisa de javascript|requires javascript/i.test(
      html,
    );
  const hasSpaRoot =
    /<div[^>]+id=["'](root|app|__next|__nuxt|q-app)["']/i.test(html) ||
    /__NEXT_DATA__|window\.__NUXT__|window\.__INITIAL_STATE__|ng-version=/i.test(
      html,
    );

  // Página "vazia" servida ao robô: pouquíssimo texto e quase nenhum link.
  const looksEmpty = bodyText.length < 600 && anchorCount < 5;

  return (hasNoscriptWarning || hasSpaRoot) && looksEmpty;
}

/** Parseia uma vez e devolve o root reutilizável (economiza CPU no runCheck). */
export function parseHtml(html: string): HTMLElement {
  return parse(html);
}

/** Há conteúdo legível de verdade? (evita afirmar sobre link em página vazia) */
export function hasReadableContent(root: HTMLElement): boolean {
  const body = root.querySelector("body");
  const text = (body?.text ?? root.text ?? "").replace(/\s+/g, " ").trim();
  return text.length >= 200 || root.querySelectorAll("a").length >= 3;
}

// A normalização de URL virou utilitário compartilhado (o import também precisa
// dela para deduplicar). Reexportado aqui para não quebrar quem já importava.
export { normalizeForCompare } from "@/lib/utils/url";
