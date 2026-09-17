/**
 * Cliente da API do Rapid URL Indexer.
 *
 * Serve para EMPURRAR indexação, não para verificar: quem diz se a URL entrou
 * no índice continua sendo o nosso check (GSC grátis, DataForSEO no fallback).
 * O status que vem daqui é o que o fornecedor acha, e é tratado como pista.
 *
 * Base: https://rapidurlindexer.com/wp-json/api/v1
 * Auth: header X-API-Key. Limite de 100 requisições por minuto.
 *
 * ARMADILHA: o site deles roda atrás de LiteSpeed com WAF que devolve 403 para
 * requisição sem cara de navegador (curl sem UA, fetch padrão do Node). Não é
 * erro de autenticação, e o corpo vem em HTML, não em JSON. Por isso todo
 * pedido leva User-Agent e Accept explícitos.
 */

import { env } from "@/lib/env";

const BASE = "https://rapidurlindexer.com/wp-json/api/v1";

/** Custo em créditos por URL. Apex tenta 3 vezes e cobra 3, devolvendo 1 se falhar. */
export const CREDITOS_POR_URL = { normal: 1, apex: 3 } as const;

export interface RapidProjeto {
  id: number;
  name: string;
  status: string; // pending | submitted | completed | failed | refunded
  urls_submitted?: number;
  links_indexed?: number;
  created_at?: string;
}

export class RapidUrlError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "RapidUrlError";
  }
}

function exigirChave(): string {
  const chave = <<REMOVIDO>>;
  if (!chave) {
    throw new RapidUrlError("RAPIDURL_API_KEY não configurada no .env", 0);
  }
  return chave;
}

async function pedir<T>(
  caminho: string,
  init: RequestInit = {},
  timeoutMs = 25_000,
): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(BASE + caminho, {
      ...init,
      signal: ctrl.signal,
      cache: "no-store",
      headers: {
        "X-API-Key": exigirChave(),
        Accept: "application/json",
        "User-Agent": env.FETCH_USER_AGENT,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });

    const texto = await resp.text();

    if (!resp.ok) {
      // corpo em HTML = quase sempre o WAF, não a API
      const ehHtml = texto.trimStart().startsWith("<");
      const detalhe = ehHtml
        ? "resposta em HTML (bloqueio do WAF, não da API)"
        : texto.slice(0, 200);
      throw new RapidUrlError(`HTTP ${resp.status}: ${detalhe}`, resp.status);
    }

    try {
      return JSON.parse(texto) as T;
    } catch {
      throw new RapidUrlError("resposta não é JSON válido", resp.status);
    }
  } finally {
    clearTimeout(t);
  }
}

/** Saldo de créditos da conta. */
export async function saldoCreditos(): Promise<number> {
  const r = await pedir<{ credits: number }>("/credits/balance");
  return Number(r.credits ?? 0);
}

/**
 * Cria um projeto de indexação. Uma URL por projeto no uso da ferramenta:
 * o operador decide link a link, porque crédito é caro e a fila de não
 * indexados é grande.
 */
export async function criarProjeto(
  nome: string,
  urls: string[],
  opcoes: { apex?: boolean; notificar?: boolean } = {},
): Promise<{ id: number; creditos: number }> {
  if (urls.length === 0) throw new RapidUrlError("nenhuma URL informada", 0);
  if (urls.length > 9999) throw new RapidUrlError("máximo de 9999 URLs", 0);

  const apex = Boolean(opcoes.apex);
  const r = await pedir<{ success?: boolean; project_id?: number; id?: number }>(
    "/projects",
    {
      method: "POST",
      body: JSON.stringify({
        project_name: nome.slice(0, 255),
        urls,
        notify_on_status_change: Boolean(opcoes.notificar),
        apex_mode_enabled: apex,
      }),
    },
  );

  const id = Number(r.project_id ?? r.id ?? 0);
  if (!id) throw new RapidUrlError("a API não devolveu o id do projeto", 0);

  return {
    id,
    creditos: urls.length * (apex ? CREDITOS_POR_URL.apex : CREDITOS_POR_URL.normal),
  };
}

/** Status de um projeto. */
export async function statusProjeto(id: number): Promise<RapidProjeto> {
  const r = await pedir<{ project?: RapidProjeto } & RapidProjeto>(
    `/projects/${id}`,
  );
  return (r.project ?? r) as RapidProjeto;
}

/**
 * Relatório por URL. Só existe 96h depois de criado o projeto: antes disso a
 * API responde erro, e isso NÃO é falha nossa.
 */
export async function relatorioProjeto(id: number): Promise<unknown> {
  return pedir<unknown>(`/projects/${id}/report`, {
    headers: { Accept: "application/json" },
  });
}

/** true quando a integração está configurada. */
export const temRapidUrl = Boolean(<<REMOVIDO>>);
