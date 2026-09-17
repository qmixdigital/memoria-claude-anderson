"use server";

import { spawn } from "node:child_process";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/sessao";
import {
  claimRun,
  readStatus,
  releaseRun,
  type RunMode,
  type RunStatus,
} from "@/lib/runlock";

export type CheckAllStatus = RunStatus;

let balanceCache: { balance: number | null; at: number } | null = null;
const BALANCE_TTL = 5 * 60 * 1000; // 5 min

export async function getDataForSeoBalanceAction(): Promise<{
  balance: number | null;
  error: string | null;
}> {
  if (balanceCache && Date.now() - balanceCache.at < BALANCE_TTL) {
    return { balance: balanceCache.balance, error: null };
  }
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return { balance: null, error: "não configurado" };
  try {
    const auth = Buffer.from(`${login}:${password}`).toString("base64");
    const res = await fetch(
      "https://api.dataforseo.com/v3/appendix/user_data",
      { method: "GET", headers: { Authorization: `Basic ${auth}` } },
    );
    const json = (await res.json()) as {
      tasks?: Array<{ result?: Array<{ money?: { balance?: number } }> }>;
    };
    const balance = json.tasks?.[0]?.result?.[0]?.money?.balance;
    const val = typeof balance === "number" ? balance : null;
    balanceCache = { balance: val, at: Date.now() };
    return { balance: val, error: null };
  } catch (e) {
    return { balance: null, error: e instanceof Error ? e.message : "falha" };
  }
}

/** Progresso da rodada — já reconciliado com o lock (worker morto = parado). */
export async function getCheckAllStatus(): Promise<CheckAllStatus> {
  return readStatus();
}

const BUN_BIN = process.env.BUN_BIN ?? "/root/.bun/bin/bun";

function spawnWorker(script: string, args: string[] = []): void {
  try {
    const child = spawn(BUN_BIN, ["run", script, ...args], {
      cwd: process.cwd(),
      detached: true,
      stdio: "ignore",
      env: process.env,
    });
    // spawn reporta "bun não encontrado" por evento, não por exceção. Sem este
    // listener o erro subiria como exceção não tratada e o lock ficaria preso.
    child.on("error", () => releaseRun());
    child.unref();
  } catch {
    releaseRun();
  }
}

/**
 * Reserva a rodada e dispara o worker. O lock é atômico no filesystem, então
 * dois cliques simultâneos em instâncias PM2 diferentes não geram duas rodadas.
 */
function startWorker(mode: RunMode, script: string, args: string[] = []): void {
  if (!claimRun(mode)) return; // já há uma rodada viva
  balanceCache = null; // pode gastar — invalida o cache do saldo
  spawnWorker(script, args);
}

/** Dispara a verificação de TODOS os backlinks (publicação + link + indexação). */
export async function startCheckAllAction(): Promise<void> {
  await exigirAdmin("disparar a verificação paga de toda a base");
  startWorker("paid", "scripts/check-all.ts");
}

/**
 * Verificação de um cliente só, em background (mesma mecânica do botão global:
 * dá pra fechar a página). `allowPaid=false` é o padrão e custa US$ 0,00 —
 * publicação e link são conferidos e a indexação já conhecida é preservada.
 */
export async function startClientCheckAction(
  clientId: string,
  allowPaid: boolean,
  apenasNovos = false,
): Promise<void> {
  if (!clientId) return;
  // a verificação grátis é liberada; só a paga exige admin
  if (allowPaid) await exigirAdmin("disparar a verificação paga deste cliente");
  const args = [clientId];
  if (!allowPaid) args.push("--free");
  if (apenasNovos) args.push("--novos");
  startWorker(allowPaid ? "paid" : "free", "scripts/check-all.ts", args);
}

const FALLBACK_COST_USD = 0.01; // custo por consulta DataForSEO (SERP live)

/** Custo real por consulta, medido do histórico (checks pagos já feitos). */
async function realCostPerCheckUsd(): Promise<number> {
  const agg = await prisma.check.aggregate({
    _avg: { costCents: true },
    where: { costCents: { gt: 0 } },
  });
  const cents = agg._avg.costCents;
  return cents && cents > 0 ? cents / 100 : FALLBACK_COST_USD;
}

/**
 * Estimativa de custo p/ checar indexação dos backlinks de terceiros (pago).
 * Sem `clientId`, estima a base inteira.
 */
export async function getPaidIndexationEstimateAction(clientId?: string): Promise<{
  count: number;
  usd: number;
  perCheck: number;
  balance: number | null;
}> {
  const { getVerifiedDomains } = await import("@/lib/checks/indexation-gsc");
  const { getDomain } = await import("tldts");
  const verified = await getVerifiedDomains();
  const all = await prisma.backlink.findMany({
    where: clientId ? { clientId } : undefined,
    select: { articleUrl: true, lastPublished: true, lastLinkOk: true },
  });
  const count = all.filter((b) => {
    // mesma trava do checks/run.ts: artigo morto ou sem o link do cliente
    // não gera consulta paga nenhuma
    if (b.lastPublished === false || b.lastLinkOk === false) return false;
    const d = getDomain(b.articleUrl);
    return d ? !verified.has(d) : true;
  }).length;
  const perCheck = await realCostPerCheckUsd();
  const { balance } = await getDataForSeoBalanceAction();
  return {
    count,
    perCheck,
    usd: Number((count * perCheck).toFixed(2)),
    balance,
  };
}

/** Dispara a indexação PAGA (DataForSEO) só nos terceiros. Requer confirmação na UI. */
export async function startPaidIndexationAction(): Promise<void> {
  await exigirAdmin("disparar a indexação paga");
  startWorker("paid", "scripts/check-indexation-paid.ts");
}
import { seedDemo } from "@/lib/seed";
import { importBacklinksCsv } from "@/lib/import/service";
import { runChecksForBacklinks } from "@/lib/checks/service";

async function ensureDefaultAccount(): Promise<string> {
  const acc = await prisma.account.upsert({
    where: { id: "acc_qmix" },
    update: {},
    create: { id: "acc_qmix", name: "QMIX Digital" },
  });
  return acc.id;
}

export async function seedDemoAction(): Promise<void> {
  await seedDemo();
  revalidatePath("/");
}

export async function createClientAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim();
  if (!name || !domain) return;
  const accountId = await ensureDefaultAccount();
  await prisma.client.create({ data: { accountId, name, domain } });
  revalidatePath("/");
}

export interface ImportResult {
  ok: boolean;
  mensagem: string;
  /** quantos backlinks novos entraram — habilita o "verificar agora" */
  novos: number;
  clientId: string;
}

/**
 * Importa a lista colada ou o arquivo CSV. Devolve um resumo — antes era
 * `void`, então uma importação que não trouxe nada era indistinguível de uma
 * que deu certo: a tela ficava igual nos dois casos.
 */
export async function importCsvAction(
  _prev: ImportResult | null,
  formData: FormData,
): Promise<ImportResult> {
  const clientId = String(formData.get("clientId") ?? "");
  if (!clientId) {
    return { ok: false, mensagem: "Cliente não identificado.", novos: 0, clientId: "" };
  }

  // Aceita arquivo enviado (input file) OU texto colado (textarea).
  let csv = "";
  const file = formData.get("file");
  if (file && typeof file === "object" && "text" in file && file.size > 0) {
    csv = await (file as File).text();
  } else {
    csv = String(formData.get("csv") ?? "");
  }

  if (!csv.trim()) {
    return {
      ok: false,
      mensagem: "Envie um arquivo .csv ou cole a lista no campo abaixo.",
      novos: 0,
      clientId,
    };
  }

  const r = await importBacklinksCsv(clientId, csv);

  if (r.parsed === 0) {
    return {
      ok: false,
      mensagem:
        "Nenhum link reconhecido. Cada linha precisa ter um endereço começando com http:// ou https:// — o texto âncora pode vir antes ou depois.",
      novos: 0,
      clientId,
    };
  }
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");

  // Cada situação vira uma frase própria, para ficar claro o que a lista fez.
  const partes: string[] = [];
  if (r.created > 0) {
    partes.push(`${r.created} ${plural(r.created, "backlink novo", "backlinks novos")}`);
  }
  if (r.updated > 0) {
    partes.push(
      `${r.updated} ${plural(r.updated, "teve a âncora atualizada", "tiveram a âncora atualizada")}`,
    );
  }
  if (r.unchanged > 0) {
    partes.push(`${r.unchanged} já ${plural(r.unchanged, "existia", "existiam")} sem mudança`);
  }
  if (r.duplicatesInList > 0) {
    partes.push(
      `${r.duplicatesInList} ${plural(
        r.duplicatesInList,
        "linha repetida na própria lista",
        "linhas repetidas na própria lista",
      )}`,
    );
  }

  const aviso =
    r.naoRecomendados.length > 0
      ? ` ⚠ Atenção: ${r.naoRecomendados.join(", ")} ${
          r.naoRecomendados.length === 1 ? "está marcado" : "estão marcados"
        } como NÃO RECOMENDADO no relatório de domínios.`
      : "";

  const mudouAlgo = r.created > 0 || r.updated > 0;
  return {
    ok: mudouAlgo && !aviso,
    mensagem:
      (mudouAlgo
        ? `${partes.join(" · ")}.`
        : `${r.parsed} ${plural(r.parsed, "link lido", "links lidos")}: ${partes.join(
            " · ",
          )}. Nada mudou.`) + aviso,
    novos: r.created,
    clientId,
  };
}

const plural = (n: number, um: string, varios: string) => (n === 1 ? um : varios);

export async function runChecksAction(
  backlinkIds: string[],
  clientId: string,
): Promise<void> {
  if (backlinkIds.length === 0) return;
  // Verificação individual (botão "Verificar" da linha): faz o check COMPLETO,
  // incluindo indexação paga (~US$ 0,01/backlink) — é o que o usuário espera ao
  // clicar num backlink específico.
  await runChecksForBacklinks(backlinkIds, { allowPaidIndexation: true });
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");
}

export async function deleteClientAction(clientId: string): Promise<void> {
  await exigirAdmin("remover um cliente");
  if (!clientId) return;
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/");
  redirect("/");
}

/**
 * Corrige à mão um dos 3 status (útil quando o site bloqueia o robô e só dá
 * pra conferir com os próprios olhos). Grava em coluna separada, então a
 * próxima verificação automática NÃO apaga a correção. Passar `valor` fora de
 * sim/não limpa a correção e devolve o controle ao automático.
 */
export async function setManualStatusAction(
  backlinkId: string,
  campo: string,
  valor: unknown,
  clientId: string,
): Promise<void> {
  const { isCampoManual, normalizaValorManual, COLUNA_MANUAL } = await import(
    "@/lib/checks/status"
  );
  if (!backlinkId || !isCampoManual(campo)) return;

  const novo = normalizaValorManual(valor);
  const coluna = COLUNA_MANUAL[campo];

  const atual = await prisma.backlink.findUnique({
    where: { id: backlinkId },
    select: { manualPublished: true, manualLinkOk: true, manualIndexed: true },
  });
  if (!atual) return;

  const depois = { ...atual, [coluna]: novo };
  const aindaTemCorrecao =
    depois.manualPublished !== null ||
    depois.manualLinkOk !== null ||
    depois.manualIndexed !== null;

  // Correção manual do status de indexação também é uma conferência: alguém
  // olhou o Google e decidiu. Sem carimbar aqui, a linha continuaria dizendo
  // "conferido há 30 dias" logo depois de você marcar na mão.
  //
  // LIMPAR a correção (voltar para null) NÃO carimba: aí você não conferiu
  // nada, apenas devolveu a palavra final ao check automático, cujo dado é da
  // data antiga. Dizer "conferido agora" nesse caso seria mentira.
  const carimbaIndexacao = campo === "indexed" && novo !== null;

  await prisma.backlink.update({
    where: { id: backlinkId },
    data: {
      [coluna]: novo,
      manualAt: aindaTemCorrecao ? new Date() : null,
      ...(carimbaIndexacao ? { lastIndexCheckAt: new Date() } : {}),
    },
  });

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");
}

/**
 * Adota a âncora que o portal realmente publicou como sendo a contratada.
 *
 * Para quando a troca é legítima e você aceita o texto novo: em vez de conviver
 * com um alerta permanente, a âncora esperada passa a ser a encontrada e a
 * linha fica limpa. Não mexe na página do portal — só no que a ferramenta
 * considera "o combinado".
 */
export async function ajustarAncoraAction(
  backlinkId: string,
  clientId: string,
): Promise<void> {
  if (!backlinkId) return;
  const bl = await prisma.backlink.findUnique({
    where: { id: backlinkId },
    select: { lastFoundAnchor: true },
  });
  const nova = bl?.lastFoundAnchor?.trim();
  if (!nova) return; // sem âncora encontrada não há o que adotar

  await prisma.backlink.update({
    where: { id: backlinkId },
    data: { expectedAnchor: nova },
  });
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");
}

/**
 * Julgamento manual sobre um domínio de portal.
 *
 *   nao_recomendado -> não comprar mais lá; a importação passa a avisar
 *   confiavel       -> aprovado, some da lista de problemas
 *   ignorado        -> tira do relatório sem julgar o portal. É o caso do dado
 *                      errado: se os links daquele domínio foram cadastrados
 *                      apontando pro lugar errado, a estatística dele não diz
 *                      nada sobre o portal e só polui a lista.
 *   limpar          -> volta ao automático
 */
/**
 * Adota a página que o portal REALMENTE linkou como sendo a contratada.
 *
 * Caso típico: o combinado era apontar para /pagina-a, o portal publicou
 * apontando para /pagina-b do mesmo cliente. O link existe, é do domínio certo
 * e passa autoridade, mas a ferramenta marca "link presente: não" porque
 * compara a URL exata. Quando a página que veio serve, isto encerra o alerta
 * em vez de deixá-lo para sempre.
 *
 * Gêmea de ajustarAncoraAction: não mexe no portal, só no que a ferramenta
 * considera "o combinado".
 */
export async function ajustarDestinoAction(
  backlinkId: string,
  clientId: string,
): Promise<{ ok: boolean; mensagem: string }> {
  if (!backlinkId) return { ok: false, mensagem: "backlink inválido" };

  const bl = await prisma.backlink.findUnique({
    where: { id: backlinkId },
    select: { articleUrl: true, expectedTarget: true, lastFoundTarget: true },
  });
  const nova = bl?.lastFoundTarget?.trim();
  if (!bl || !nova) {
    return { ok: false, mensagem: "Nenhuma página alternativa foi encontrada neste artigo." };
  }
  if (nova === bl.expectedTarget) {
    return { ok: false, mensagem: "O destino já é esse." };
  }

  // A tabela tem chave única (cliente, artigo, destino): se já existir um
  // backlink cadastrado com esse mesmo destino neste mesmo artigo, trocar aqui
  // criaria duplicata e o banco recusaria. Avisar é melhor que estourar erro.
  const conflito = await prisma.backlink.findFirst({
    where: {
      clientId,
      articleUrl: bl.articleUrl,
      expectedTarget: nova,
      NOT: { id: backlinkId },
    },
    select: { id: true },
  });
  if (conflito) {
    return {
      ok: false,
      mensagem: "Já existe outro backlink cadastrado com esse destino neste artigo.",
    };
  }

  await prisma.backlink.update({
    where: { id: backlinkId },
    data: {
      expectedTarget: nova,
      // O link passa a ser o contratado: o estado vira "presente" na hora, sem
      // esperar a próxima rodada. lastFoundTarget zera porque deixou de ser
      // divergência.
      lastLinkOk: true,
      lastFoundTarget: null,
    },
  });

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");
  return { ok: true, mensagem: "Destino atualizado." };
}

export async function marcarDominioAction(
  dominio: string,
  status: "nao_recomendado" | "confiavel" | "ignorado" | "limpar",
): Promise<void> {
  const alvo = dominio.trim().toLowerCase();
  if (!alvo) return;

  if (status === "limpar") {
    await prisma.domainNote.deleteMany({ where: { domain: alvo } });
  } else {
    await prisma.domainNote.upsert({
      where: { domain: alvo },
      update: { status },
      create: { domain: alvo, status },
    });
  }
  revalidatePath("/dominios");
}

/** Anotação livre sobre o domínio, para lembrar o contexto depois. */
export async function salvarNotaDominioAction(
  dominio: string,
  nota: string,
): Promise<void> {
  const alvo = dominio.trim().toLowerCase();
  if (!alvo) return;
  const texto = nota.trim().slice(0, 500) || null;

  const existente = await prisma.domainNote.findUnique({ where: { domain: alvo } });
  if (!existente && !texto) return; // nada a guardar

  await prisma.domainNote.upsert({
    where: { domain: alvo },
    // "sem_marca" = só anotação, sem julgamento sobre comprar ou não
    update: { note: texto },
    create: { domain: alvo, status: "sem_marca", note: texto },
  });
  revalidatePath("/dominios");
}

export async function deleteBacklinkAction(
  backlinkId: string,
  clientId: string,
): Promise<void> {
  await exigirAdmin("remover um backlink");
  if (!backlinkId) return;
  await prisma.backlink.delete({ where: { id: backlinkId } });
  revalidatePath(`/clients/${clientId}`);
}

/** Custo de reverificar UM backlink (botão "Verificar" da linha). */
export async function getSingleCheckCostAction(
  backlinkId: string,
): Promise<{ usd: number }> {
  const { getVerifiedDomains } = await import("@/lib/checks/indexation-gsc");
  const { getDomain } = await import("tldts");
  const bl = await prisma.backlink.findUnique({
    where: { id: backlinkId },
    select: { articleUrl: true, lastPublished: true, lastLinkOk: true },
  });
  // mesma trava do checks/run.ts
  if (!bl || bl.lastPublished === false || bl.lastLinkOk === false) return { usd: 0 };
  const d = getDomain(bl.articleUrl);
  const verified = await getVerifiedDomains();
  // domínio verificado no Search Console = indexação grátis
  if (d && verified.has(d)) return { usd: 0 };
  return { usd: await realCostPerCheckUsd() };
}

/* ============================================================
   Rapid URL Indexer — empurrar indexação, link a link
   ============================================================
   Fica separado do check de indexação de propósito: um EMPURRA, o outro
   VERIFICA. O resultado do fornecedor nunca escreve em lastIndexed; quem
   decide se a URL entrou no índice continua sendo o nosso check.
*/

export async function getRapidUrlInfoAction(backlinkId: string): Promise<{
  disponivel: boolean;
  saldo: number | null;
  custo: number;
  jaEnviado: boolean;
  enviadoEm: string | null;
  status: string | null;
  erro: string | null;
}> {
  const { hasRapidUrl, env } = await import("@/lib/env");
  const vazio = {
    disponivel: false,
    saldo: null,
    custo: 0,
    jaEnviado: false,
    enviadoEm: null,
    status: null,
    erro: null as string | null,
  };
  if (!hasRapidUrl) return vazio;

  const bl = await prisma.backlink.findUnique({
    where: { id: backlinkId },
    select: { rapidProjectId: true, rapidSubmittedAt: true, rapidStatus: true },
  });
  if (!bl) return vazio;

  const { saldoCreditos, CREDITOS_POR_URL } = await import("@/lib/rapidurl/client");
  let saldo: number | null = null;
  let erro: string | null = null;
  try {
    saldo = await saldoCreditos();
  } catch (e) {
    erro = e instanceof Error ? e.message : "falha ao consultar saldo";
  }

  return {
    disponivel: true,
    saldo,
    custo: env.RAPIDURL_APEX ? CREDITOS_POR_URL.apex : CREDITOS_POR_URL.normal,
    jaEnviado: Boolean(bl.rapidProjectId),
    enviadoEm: bl.rapidSubmittedAt ? bl.rapidSubmittedAt.toISOString() : null,
    status: bl.rapidStatus,
    erro,
  };
}

export async function enviarRapidUrlAction(
  backlinkId: string,
  clientId: string,
): Promise<{ ok: boolean; mensagem: string }> {
  const { hasRapidUrl, env } = await import("@/lib/env");
  if (!hasRapidUrl) return { ok: false, mensagem: "Rapid URL Indexer não configurado." };

  const bl = await prisma.backlink.findUnique({
    where: { id: backlinkId },
    select: {
      articleUrl: true,
      rapidSubmitCount: true,
      client: { select: { name: true } },
    },
  });
  if (!bl) return { ok: false, mensagem: "Backlink não encontrado." };

  const { criarProjeto } = await import("@/lib/rapidurl/client");
  try {
    // Nome do projeto identifica cliente e data: é o que aparece no painel deles.
    const nome = `${bl.client?.name ?? "backlink"} ${new Date().toISOString().slice(0, 10)}`;
    const { id, creditos } = await criarProjeto(nome, [bl.articleUrl], {
      apex: env.RAPIDURL_APEX,
    });

    await prisma.backlink.update({
      where: { id: backlinkId },
      data: {
        rapidProjectId: id,
        rapidStatus: "submitted",
        rapidSubmittedAt: new Date(),
        rapidCredits: creditos,
        rapidSubmitCount: (bl.rapidSubmitCount ?? 0) + 1,
        rapidSyncedAt: new Date(),
      },
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/");
    return { ok: true, mensagem: `Enviado. Projeto #${id}, ${creditos} crédito(s).` };
  } catch (e) {
    return {
      ok: false,
      mensagem: e instanceof Error ? e.message : "falha ao enviar para indexação",
    };
  }
}

export async function sincronizarRapidUrlAction(
  backlinkId: string,
  clientId: string,
): Promise<{ ok: boolean; mensagem: string }> {
  const bl = await prisma.backlink.findUnique({
    where: { id: backlinkId },
    select: { rapidProjectId: true },
  });
  if (!bl?.rapidProjectId) return { ok: false, mensagem: "Este backlink não foi enviado." };

  const { statusProjeto } = await import("@/lib/rapidurl/client");
  try {
    const p = await statusProjeto(bl.rapidProjectId);
    await prisma.backlink.update({
      where: { id: backlinkId },
      data: { rapidStatus: p.status ?? null, rapidSyncedAt: new Date() },
    });
    revalidatePath(`/clients/${clientId}`);
    return { ok: true, mensagem: `Status: ${p.status ?? "desconhecido"}.` };
  } catch (e) {
    return {
      ok: false,
      mensagem: e instanceof Error ? e.message : "falha ao consultar status",
    };
  }
}
