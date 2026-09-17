import { prisma } from "@/lib/prisma";
import {
  alertasDeValor,
  ancoraDivergente,
  transfereAutoridade,
} from "@/lib/checks/valor";
import { statusDaLinha, temCorrecaoManual } from "@/lib/checks/status";

// Exportação da carteira em CSV, para relatório de cliente e conferência fora
// da ferramenta. Com `?clientId=` sai só um cliente; sem, sai a base inteira.
//
// Rota (e não Server Action) porque o navegador precisa receber o arquivo com
// Content-Disposition para disparar o download. O proxy de sessão já protege
// este caminho — sem cookie válido, cai no /login.

export const dynamic = "force-dynamic";

/** Escapa uma célula. Separador é ";" (o padrão do Excel em português). */
function celula(valor: unknown): string {
  const s = valor == null ? "" : String(valor);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const simNao = (v: boolean | null): string =>
  v === true ? "Sim" : v === false ? "Não" : "Conferir";

function situacao(status: number | null): string {
  if (status === null) return "Sem resposta";
  if (status >= 200 && status < 300) return "No ar";
  if (status === 404 || status === 410) return "Removida";
  if (status === 403 || status === 401) return "Bloqueou o robô";
  if (status >= 500) return "Erro no servidor";
  return `HTTP ${status}`;
}

const dataBR = (d: Date | null): string =>
  d ? d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "";

const COLUNAS = [
  "Cliente",
  "Domínio do cliente",
  "URL do artigo",
  "Texto âncora contratado",
  "Texto âncora encontrado",
  "Âncora trocada",
  "Passa autoridade",
  "rel do link",
  "Tipo",
  "Artigo no ar",
  "Link do cliente presente",
  "Indexado no Google",
  "Situação da página",
  "Observação",
  "Conferido manualmente",
  "Última verificação",
];

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId") ?? undefined;

  const backlinks = await prisma.backlink.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: [{ clientId: "asc" }, { createdAt: "asc" }],
    include: {
      client: { select: { name: true, domain: true } },
      checks: { orderBy: { checkedAt: "desc" }, take: 1 },
    },
  });

  const linhas = backlinks.map((b) => {
    const ultimo = b.checks[0];
    return [
      b.client.name,
      b.client.domain,
      b.articleUrl,
      b.expectedAnchor ?? "",
      b.lastFoundAnchor ?? "",
      statusDaLinha(b).linkOk.valor === true
        ? ancoraDivergente(b.expectedAnchor, b.lastFoundAnchor) ? "Sim" : "Não"
        : "",
      statusDaLinha(b).linkOk.valor === true
        ? transfereAutoridade(
            alertasDeValor({
              linkOk: statusDaLinha(b).linkOk.valor,
              indexado: statusDaLinha(b).indexed.valor,
              rel: b.lastLinkRel,
              ancoraContratada: b.expectedAnchor,
              ancoraEncontrada: b.lastFoundAnchor,
            }),
          )
            ? "Sim"
            : "Não"
        : "",
      b.lastLinkRel ?? "",
      b.type === "REDIRECT_301" ? "Redirecionamento 301" : "Direto",
      simNao(statusDaLinha(b).published.valor),
      simNao(statusDaLinha(b).linkOk.valor),
      statusDaLinha(b).indexacaoAplicavel
        ? simNao(statusDaLinha(b).indexed.valor)
        : "Não se aplica (artigo removido)",
      b.manualPublished !== null
        ? b.manualPublished ? "No ar" : "Apagada"
        : situacao(ultimo?.httpStatus ?? null),
      b.manualPublished !== null || b.manualLinkOk !== null
        ? "" // conferido à mão: a observação do robô não vale mais
        : (ultimo?.error ?? ""),
      temCorrecaoManual(b) ? `Sim (${dataBR(b.manualAt)})` : "Não",
      dataBR(b.lastCheckAt),
    ]
      .map(celula)
      .join(";");
  });

  // BOM na frente: sem ele o Excel abre os acentos como "Ã§Ã£o".
  const csv = "﻿" + [COLUNAS.join(";"), ...linhas].join("\r\n") + "\r\n";

  const nome = clientId
    ? `backlinks-${(backlinks[0]?.client.domain ?? clientId).replace(/[^a-z0-9.-]/gi, "-")}`
    : "backlinks-todos";
  const hoje = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}-${hoje}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
