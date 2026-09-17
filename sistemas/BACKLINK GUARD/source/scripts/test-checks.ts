// Suíte de testes dos checks. Roda com: bun run scripts/test-checks.ts
// Sem framework externo — só bun + um assert mínimo.

export {}; // marca como módulo (habilita top-level await no tsc)

process.env.DATABASE_URL ??= "<<REMOVIDO>>";
process.env.DATAFORSEO_LOGIN = "fake";
process.env.DATAFORSEO_PASSWORD = "fake";
delete process.env.GOOGLE_SA_JSON_PATH; // força o caminho pago nos testes

let fails = 0;
let group = "";
const suite = (n: string) => {
  group = n;
  console.log(`\n${n}`);
};
const ok = (name: string, cond: boolean, extra = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  <-- " + extra}`);
  if (!cond) fails++;
};

// ---------------------------------------------------------------------------
// Fixture: respostas reais da DataForSEO observadas em produção (2026-08-04).
// ---------------------------------------------------------------------------
function dfsBody(task: Record<string, unknown>) {
  return JSON.stringify({ status_code: 20000, status_message: "Ok.", tasks: [task] });
}

/** 20000 + 1 orgânico = a página ESTÁ no índice. */
const TASK_INDEXADO = {
  status_code: 20000,
  status_message: "Ok.",
  cost: 0.01,
  result: [
    {
      se_results_count: 1,
      items: [
        {
          type: "organic",
          url: "https://www.extraguarapuava.com.br/saude/sinais-de-que-sua-saude-ossea-e-articular-precisa-de-atencao/",
        },
      ],
    },
  ],
};

/** 40102 "No Search Results" = o Google respondeu e não tem nada. NÃO indexado. */
const TASK_SEM_RESULTADO = {
  status_code: 40102,
  status_message: "No Search Results.",
  cost: 0.01,
  result: null,
};

/** 40101 "Internal SE Server Error" = a consulta FALHOU. Não sabemos nada. */
const TASK_ERRO_SE = {
  status_code: 40101,
  status_message: "Internal SE Server Error.",
  cost: 0.01,
  result: null,
};

/** 20000 mas o Google omitiu a contagem — os itens é que valem. */
const TASK_SEM_CONTAGEM = {
  status_code: 20000,
  status_message: "Ok.",
  cost: 0.01,
  result: [
    {
      se_results_count: 0,
      items: [{ type: "organic", url: "https://exemplo.com.br/artigo" }],
    },
  ],
};

function stubDfs(task: Record<string, unknown>) {
  globalThis.fetch = (async () =>
    new Response(dfsBody(task), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;
}

const { checkIndexation } = await import("@/lib/checks/indexation");

suite("indexação — interpretação da resposta da DataForSEO");
{
  stubDfs(TASK_INDEXADO);
  const r = await checkIndexation("https://x.com.br/a", { allowPaid: true });
  ok("orgânico presente => indexed=true", r.indexed === true, `veio ${r.indexed}`);
  ok("cobra 1 centavo", r.costCents === 1, `veio ${r.costCents}`);

  stubDfs(TASK_SEM_RESULTADO);
  const r2 = await checkIndexation("https://x.com.br/a", { allowPaid: true });
  ok("40102 'No Search Results' => indexed=false", r2.indexed === false, `veio ${r2.indexed}`);
  ok("40102 registra o custo cobrado", r2.costCents === 1, `veio ${r2.costCents}`);

  stubDfs(TASK_ERRO_SE);
  const r3 = await checkIndexation("https://x.com.br/a", { allowPaid: true });
  ok(
    "40101 erro do buscador => indexed=null (NÃO 'não indexado')",
    r3.indexed === null,
    `veio ${r3.indexed} — é este bug que marca página indexada como não indexada`,
  );
  ok("40101 reporta o erro", Boolean(r3.error), "erro deveria ser preenchido");
  ok("40101 registra o custo (foi cobrado mesmo falhando)", r3.costCents === 1, `veio ${r3.costCents}`);

  stubDfs(TASK_SEM_CONTAGEM);
  const r4 = await checkIndexation("https://x.com.br/a", { allowPaid: true });
  ok(
    "se_results_count=0 mas com orgânico => indexed=true",
    r4.indexed === true,
    `veio ${r4.indexed}`,
  );

  const r5 = await checkIndexation("https://x.com.br/a", { allowPaid: false });
  ok("sem allowPaid => indexed=null e custo 0", r5.indexed === null && r5.costCents === 0);
}

// ---------------------------------------------------------------------------
const { runCheck } = await import("@/lib/checks/run");

suite("trava de custo — sem link do cliente, não consulta indexação");
{
  let consultasPagas = 0;
  const artigo = (status: number, html: string) => {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.includes("api.dataforseo.com")) {
        consultasPagas++;
        return new Response(dfsBody(TASK_INDEXADO), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(html, { status, headers: { "content-type": "text/html" } });
    }) as typeof fetch;
  };

  const base = {
    type: "DIRECT" as const,
    clientDomain: "cliente.com.br",
    targetDomain: "cliente.com.br",
    expectedTarget: "https://cliente.com.br/pagina",
    expectedAnchor: "minha âncora",
    allowPaidIndexation: true,
    articleUrl: "https://portal.com/artigo",
  };
  const corpo = (links: string) =>
    `<html><body><article>${"texto do artigo. ".repeat(25)}${links}
     <a href="/x">a</a><a href="/y">b</a><a href="/z">c</a></article></body></html>`;

  consultasPagas = 0;
  artigo(200, corpo('<a href="https://cliente.com.br/pagina">minha âncora</a>'));
  const comLink = await runCheck(base);
  ok("link presente => consulta a indexação", comLink.linkPresent === true && consultasPagas === 1);

  consultasPagas = 0;
  artigo(200, corpo('<a href="https://outrocliente.com.br/pagina">minha âncora</a>'));
  const outroDono = await runCheck(base);
  ok("link aponta pra OUTRO cliente => não consulta", outroDono.linkPresent === false && consultasPagas === 0);
  ok("  e explica pra onde foi", /outrocliente\.com\.br/.test(outroDono.error ?? ""));
  ok("  custo zero", outroDono.costCents === 0);

  consultasPagas = 0;
  artigo(200, corpo("<a href=\"https://naotemnada.com/x\">outro texto</a>"));
  const semLink = await runCheck(base);
  ok("link simplesmente sumiu => não consulta", semLink.linkPresent === false && consultasPagas === 0);

  consultasPagas = 0;
  artigo(404, "");
  const morto = await runCheck(base);
  ok("artigo 404 => não consulta", morto.articlePublished === false && consultasPagas === 0);

  consultasPagas = 0;
  artigo(403, "");
  const bloqueado = await runCheck(base);
  ok(
    "página bloqueada (null) => AINDA consulta, é o único sinal",
    bloqueado.linkPresent === null && consultasPagas === 1,
  );
}

// ---------------------------------------------------------------------------
const { mergeSnapshot } = await import("@/lib/checks/snapshot");

suite("snapshot — 'não verificado' nunca apaga um resultado conhecido");
{
  const conhecido = {
    lastPublished: true,
    lastLinkOk: true,
    lastIndexed: true,
    lastLinkRel: "",
    lastFoundAnchor: "âncora contratada", lastFoundTarget: null,
  };

  const desconhecido = mergeSnapshot(conhecido, {
    articlePublished: true,
    linkPresent: true,
    indexed: null, // rodada grátis: não consultou indexação
  });
  ok(
    "rodada grátis NÃO apaga o 'indexado' já confirmado",
    desconhecido.lastIndexed === true,
    `veio ${desconhecido.lastIndexed} — é isto que zera o painel inteiro`,
  );

  const desindexado = mergeSnapshot(conhecido, {
    articlePublished: true,
    linkPresent: true,
    indexed: false, // resposta de verdade: saiu do índice
  });
  ok("false de verdade SOBRESCREVE o true", desindexado.lastIndexed === false);

  const bloqueado = mergeSnapshot(conhecido, {
    articlePublished: null, // site bloqueou o robô
    linkPresent: null,
    indexed: null,
  });
  ok("bloqueio não apaga 'publicado'", bloqueado.lastPublished === true);
  ok("bloqueio não apaga 'link ok'", bloqueado.lastLinkOk === true);

  const primeiraVez = mergeSnapshot(
    { lastPublished: null, lastLinkOk: null, lastIndexed: null, lastLinkRel: null, lastFoundAnchor: null, lastFoundTarget: null },
    { articlePublished: true, linkPresent: false, indexed: null },
  );
  ok("primeira verificação grava o que descobriu", primeiraVez.lastPublished === true);
  ok("e mantém null no que não descobriu", primeiraVez.lastIndexed === null);

  const morreu = mergeSnapshot(conhecido, {
    articlePublished: false, // 404 de verdade
    linkPresent: null,
    indexed: null,
  });
  ok("404 de verdade sobrescreve 'publicado'", morreu.lastPublished === false);
}

// ---------------------------------------------------------------------------
const { parseBacklinkCsv } = await import("@/lib/import/csv");

suite("import — colar lista em qualquer formato e em qualquer ordem");
{
  const p = (t: string) => parseBacklinkCsv(t);
  const A = "https://blog.com/a";
  const B = "https://outro.com/b";

  // --- ordem das colunas: os dois sentidos têm que funcionar ---------------
  const ancoraPrimeiro = p("melhor IPTV\thttps://blog.com/a");
  ok("âncora e depois link", ancoraPrimeiro[0]?.articleUrl === A);
  ok("  âncora lida certo", ancoraPrimeiro[0]?.expectedAnchor === "melhor IPTV");

  const linkPrimeiro = p("https://blog.com/a\tmelhor IPTV");
  ok("link e depois âncora", linkPrimeiro[0]?.articleUrl === A);
  ok("  âncora lida certo", linkPrimeiro[0]?.expectedAnchor === "melhor IPTV");

  const misturado = p("melhor IPTV,https://blog.com/a\nhttps://outro.com/b,teste grátis");
  ok("ordens diferentes na MESMA lista", misturado.length === 2);
  ok("  linha 1 ok", misturado[0]?.articleUrl === A && misturado[0]?.expectedAnchor === "melhor IPTV");
  ok("  linha 2 ok", misturado[1]?.articleUrl === B && misturado[1]?.expectedAnchor === "teste grátis");

  // --- com e sem cabeçalho -------------------------------------------------
  ok("com cabeçalho (vírgula)", p("Texto Âncora,URL\nmelhor IPTV,https://blog.com/a").length === 1);
  ok("SEM cabeçalho (vírgula)", p("melhor IPTV,https://blog.com/a\nteste,https://outro.com/b").length === 2);
  ok("SEM cabeçalho (TAB, colado da planilha)", p("melhor IPTV\thttps://blog.com/a\nteste\thttps://outro.com/b").length === 2);
  ok("cabeçalho com outro nome de coluna", p("Ancora,Link\nmelhor IPTV,https://blog.com/a").length === 1);
  ok("cabeçalho não vira backlink", p("Texto Âncora,URL\nmelhor IPTV,https://blog.com/a")[0]?.articleUrl === A);

  // --- separadores ---------------------------------------------------------
  ok("ponto e vírgula (Excel pt-BR)", p("Texto Âncora;URL\nmelhor IPTV;https://blog.com/a").length === 1);
  ok("quebra de linha do Windows", p("Texto Âncora,URL\r\nmelhor IPTV,https://blog.com/a\r\n\r\nteste,https://outro.com/b\r\n").length === 2);

  // --- casos soltos --------------------------------------------------------
  const soUrl = p("https://blog.com/a\nhttps://outro.com/b");
  ok("só as URLs, uma por linha", soUrl.length === 2);
  ok("  âncora fica vazia", soUrl[0]?.expectedAnchor === null);

  const comAspas = p('Texto Âncora,URL\n"melhor IPTV" , "https://blog.com/a" ');
  ok("aspas e espaços sobrando", comAspas.length === 1 && comAspas[0]?.articleUrl === A);

  const url301 = p("ancora,https://blog.com/a,301");
  ok("coluna 301 marca REDIRECT_301", url301[0]?.type === "REDIRECT_301");
  ok("  e não confunde 301 com âncora", url301[0]?.expectedAnchor === "ancora");
  ok("301 em qualquer posição", p("301,https://blog.com/a,ancora")[0]?.type === "REDIRECT_301");
  ok("sem 301 continua DIRECT", p("ancora,https://blog.com/a")[0]?.type === "DIRECT");

  ok("www sem protocolo vira https", p("ancora,www.blog.com/a")[0]?.articleUrl === "https://www.blog.com/a");
  ok("linha sem URL nenhuma é ignorada", p("só um texto,outro texto").length === 0);
  ok("texto vazio não quebra", p("").length === 0 && p("   \n  ").length === 0);
}

// ---------------------------------------------------------------------------
const { normalizeForCompare } = await import("@/lib/utils/url");

suite("dedup — o mesmo artigo não pode entrar duas vezes (cada duplicata custa)");
{
  const mesma = (a: string, b: string) => normalizeForCompare(a) === normalizeForCompare(b);
  const base = "https://webcitizen.com.br/travamento-do-joelho-pode-ser-sinal-de-lesao/";

  ok("barra final a mais/a menos", mesma(base, base.replace(/\/$/, "")));
  ok("com e sem www", mesma(base, base.replace("https://", "https://www.")));
  ok("http vs https", mesma(base, base.replace("https://", "http://")));
  ok("com ?utm_source", mesma(base, base + "?utm_source=whatsapp"));
  ok("com #ancora", mesma(base, base + "#comentarios"));
  ok("host em maiúsculas", mesma(base, base.replace("webcitizen", "WebCitizen")));
  ok(
    "combinação de tudo",
    mesma(base, "http://WWW.WebCitizen.com.br/travamento-do-joelho-pode-ser-sinal-de-lesao?utm=1#x"),
  );

  ok("artigos DIFERENTES continuam diferentes", !mesma(base, "https://webcitizen.com.br/outro-artigo/"));
  ok("domínios diferentes continuam diferentes", !mesma(base, "https://outro.com.br/travamento-do-joelho-pode-ser-sinal-de-lesao/"));
  ok("subdomínio diferente continua diferente", !mesma(base, "https://blog.webcitizen.com.br/travamento-do-joelho-pode-ser-sinal-de-lesao/"));
}

// ---------------------------------------------------------------------------
const { planejarImportacao } = await import("@/lib/import/plan");

suite("reimportação — corrige a âncora sem duplicar o backlink");
{
  const A = "https://portal.com.br/artigo-um/";
  const B = "https://portal.com.br/artigo-dois/";
  const banco = [
    { id: "bl1", articleUrl: A, expectedAnchor: "âncora antiga" },
    { id: "bl2", articleUrl: B, expectedAnchor: "continua igual" },
  ];
  const linha = (url: string, anc: string | null) => ({
    articleUrl: url,
    expectedAnchor: anc,
    type: "DIRECT" as const,
  });

  const p1 = planejarImportacao(
    [linha(A, "âncora NOVA"), linha(B, "continua igual")],
    banco,
  );
  ok("âncora diferente => atualiza", p1.atualizar.length === 1);
  ok("  no backlink certo", p1.atualizar[0]?.id === "bl1");
  ok("  com o texto novo", p1.atualizar[0]?.expectedAnchor === "âncora NOVA");
  ok("âncora igual => não mexe", p1.inalterados === 1);
  ok("não cria duplicata", p1.criar.length === 0);

  // a variação de URL não pode escapar da identificação
  const p2 = planejarImportacao(
    [linha("http://www.portal.com.br/artigo-um?utm_source=x", "outra âncora")],
    banco,
  );
  ok("URL com www/http/utm ainda é o MESMO backlink", p2.criar.length === 0);
  ok("  e a âncora dele é atualizada", p2.atualizar[0]?.id === "bl1");

  const p3 = planejarImportacao([linha(A, null), linha(A, "  ")], banco);
  ok("âncora vazia NÃO apaga a existente", p3.atualizar.length === 0);
  ok("  e conta como repetida na lista", p3.repetidosNaLista === 1);

  const p4 = planejarImportacao(
    [linha("https://novo.com.br/x", "âncora"), linha(A, "âncora antiga")],
    banco,
  );
  ok("mistura de novo + existente", p4.criar.length === 1 && p4.inalterados === 1);
  ok("  o novo é o certo", p4.criar[0]?.articleUrl === "https://novo.com.br/x");

  const p5 = planejarImportacao([], banco);
  ok("lista vazia não faz nada", p5.criar.length === 0 && p5.atualizar.length === 0);
}

// ---------------------------------------------------------------------------
const {
  passaAutoridade,
  ancoraDivergente,
  alertasDeValor,
  relBloqueantes,
  transfereAutoridade,
} = await import("@/lib/checks/valor");

suite("valor do backlink — o link existe, mas ainda entrega SEO?");
{
  ok("sem rel => passa autoridade", passaAutoridade("") === true);
  ok("noopener => passa (é segurança, não SEO)", passaAutoridade("noopener") === true);
  ok("noreferrer noopener => passa", passaAutoridade("noreferrer noopener") === true);
  ok("nofollow => NÃO passa", passaAutoridade("nofollow") === false);
  ok("sponsored => NÃO passa", passaAutoridade("sponsored") === false);
  ok("ugc => NÃO passa", passaAutoridade("ugc") === false);
  ok("nofollow no meio de outros => NÃO passa", passaAutoridade("noopener nofollow") === false);
  ok("NOFOLLOW maiúsculo => NÃO passa", passaAutoridade("NOFOLLOW") === false);
  ok("separado por vírgula => NÃO passa", passaAutoridade("noopener,nofollow") === false);
  ok("null = não avaliado (check antigo)", passaAutoridade(null) === null);
  ok("lista o que bloqueia", relBloqueantes("noopener nofollow ugc").join(",") === "nofollow,ugc");

  ok("âncora igual => não diverge", !ancoraDivergente("dor no joelho", "dor no joelho"));
  ok("só acento diferente => não diverge", !ancoraDivergente("cirurgião", "cirurgiao"));
  ok("só caixa diferente => não diverge", !ancoraDivergente("Dor No Joelho", "dor no joelho"));
  ok("espaço sobrando => não diverge", !ancoraDivergente("dor no joelho", " dor  no joelho "));
  ok("trocada por 'clique aqui' => DIVERGE", ancoraDivergente("dor no joelho", "clique aqui"));

  // caso real: o portal embutiu o link numa frase, mantendo a keyword inteira
  const contratada = "médico especialista em tratamento da coluna em Goiânia";
  ok(
    "keyword inteira dentro de uma frase => NÃO diverge",
    !ancoraDivergente(contratada, `afirmou o ${contratada}`),
  );
  ok(
    "keyword no meio da frase => NÃO diverge",
    !ancoraDivergente(contratada, `segundo o ${contratada}, o tratamento`),
  );
  ok(
    "keyword com prefixo E acento diferente => NÃO diverge",
    !ancoraDivergente(contratada, "afirmou o medico especialista em tratamento da coluna em Goiania"),
  );
  ok(
    "âncora ENCURTADA perde keyword => DIVERGE",
    ancoraDivergente(contratada, "médico especialista"),
  );
  ok(
    "frase que NÃO contém a keyword => DIVERGE",
    ancoraDivergente(contratada, "veja mais sobre coluna"),
  );
  ok("sem âncora contratada => não afirma nada", !ancoraDivergente(null, "clique aqui"));
  ok("sem âncora encontrada => não afirma nada", !ancoraDivergente("dor no joelho", null));

  const base = {
    linkOk: true,
    indexado: true,
    rel: "noopener",
    ancoraContratada: "dor no joelho",
    ancoraEncontrada: "dor no joelho",
  };

  ok("link bom e indexado => nenhum alerta", alertasDeValor(base).length === 0);
  ok("  e transfere autoridade", transfereAutoridade(alertasDeValor(base)));

  // o caso que você encontrou: dofollow, mas a página não está no índice
  const foraDoIndice = alertasDeValor({ ...base, indexado: false });
  ok("página FORA do índice => alerta", foraDoIndice.includes("fora-do-indice"));
  ok("  e NÃO transfere autoridade", !transfereAutoridade(foraDoIndice));
  ok("  mesmo com rel dofollow", passaAutoridade("noopener") === true);

  const indexacaoDesconhecida = alertasDeValor({ ...base, indexado: null });
  ok(
    "indexação 'conferir' NÃO vira 'fora do índice'",
    !indexacaoDesconhecida.includes("fora-do-indice"),
  );
  ok("  e continua passando força", transfereAutoridade(indexacaoDesconhecida));

  const ruim = alertasDeValor({
    ...base,
    rel: "nofollow",
    indexado: false,
    ancoraEncontrada: "clique aqui",
  });
  ok("nofollow + fora do índice + âncora => 3 alertas", ruim.length === 3);
  ok("  aponta nofollow", ruim.includes("nofollow"));
  ok("  aponta fora do índice", ruim.includes("fora-do-indice"));
  ok("  aponta âncora trocada", ruim.includes("ancora-trocada"));

  const semLink = alertasDeValor({ ...base, linkOk: false, rel: "nofollow", indexado: false });
  ok("link ausente => sem alerta de valor (já está vermelho)", semLink.length === 0);

  const naoAvaliado = alertasDeValor({
    ...base,
    rel: null,
    indexado: null,
    ancoraEncontrada: null,
  });
  ok("check antigo (sem dados) => não inventa alerta", naoAvaliado.length === 0);
}

// ---------------------------------------------------------------------------
const { statusEfetivo, statusDaLinha, temCorrecaoManual, normalizaValorManual, isCampoManual } =
  await import("@/lib/checks/status");

suite("correção manual — o que você confere com os olhos prevalece");
{
  ok("sem correção => vale o automático", statusEfetivo(true, null).valor === true);
  ok("  e a origem é automática", statusEfetivo(true, null).origem === "auto");
  ok("correção 'sim' sobre 'não confirmado'", statusEfetivo(null, true).valor === true);
  ok("  origem vira manual", statusEfetivo(null, true).origem === "manual");
  ok("correção 'não' sobre um 'sim' automático", statusEfetivo(true, false).valor === false);
  ok("correção 'não' NÃO é confundida com ausência", statusEfetivo(null, false).valor === false);
  ok("  e conta como manual", statusEfetivo(null, false).origem === "manual");

  // o cenário do site que bloqueia o robô
  const bloqueado = {
    lastPublished: null,
    lastLinkOk: null,
    lastIndexed: null,
    manualPublished: true,
    manualLinkOk: true,
    manualIndexed: null,
  };
  const s = statusDaLinha(bloqueado);
  ok("página bloqueada + conferida à mão => publicado Sim", s.published.valor === true);
  ok("  link Sim", s.linkOk.valor === true);
  ok("  indexado continua 'conferir'", s.indexed.valor === null);
  ok("  indexado segue automático", s.indexed.origem === "auto");
  ok("linha marcada como tendo correção", temCorrecaoManual(bloqueado));

  const semCorrecao = {
    lastPublished: true,
    lastLinkOk: false,
    lastIndexed: null,
    manualPublished: null,
    manualLinkOk: null,
    manualIndexed: null,
  };
  ok("sem correção nenhuma => não marca", !temCorrecaoManual(semCorrecao));

  // artigo apagado: as consequências devem ser automáticas
  const apagado = {
    lastPublished: false,
    lastLinkOk: null,
    lastIndexed: null,
    manualPublished: null,
    manualLinkOk: null,
    manualIndexed: null,
  };
  const a = statusDaLinha(apagado);
  ok("artigo apagado => link derivado para Não", a.linkOk.valor === false);
  ok("  marcado como artigo removido", a.artigoRemovido);
  ok("  indexação NÃO vira 'não' (inventar seria errado)", a.indexed.valor === null);
  ok("  mas deixa de se aplicar", !a.indexacaoAplicavel);

  // sua correção manual vence a derivação
  const apagadoMasConferido = { ...apagado, manualLinkOk: true, manualIndexed: true };
  const b = statusDaLinha(apagadoMasConferido);
  ok("correção manual vence a derivação (link)", b.linkOk.valor === true);
  ok("  e a origem continua manual", b.linkOk.origem === "manual");
  ok("  indexação manual volta a se aplicar", b.indexacaoAplicavel);

  // página apenas bloqueada NÃO deriva nada
  const bloqueadoAuto = {
    lastPublished: null,
    lastLinkOk: null,
    lastIndexed: null,
    manualPublished: null,
    manualLinkOk: null,
    manualIndexed: null,
  };
  const c = statusDaLinha(bloqueadoAuto);
  ok("página bloqueada não deriva link para Não", c.linkOk.valor === null);
  ok("  e a indexação continua se aplicando", c.indexacaoAplicavel);

  ok("'sim' vira true", normalizaValorManual("sim") === true);
  ok("'nao' vira false", normalizaValorManual("nao") === false);
  ok("'auto' limpa a correção", normalizaValorManual("auto") === null);
  ok("lixo limpa a correção", normalizaValorManual("qualquer coisa") === null);
  ok("campo válido é aceito", isCampoManual("indexed"));
  ok("campo inventado é recusado", !isCampoManual("custoCents"));
}

// ---------------------------------------------------------------------------
const { hashSenha, conferirSenha, gerarSenha, normalizaUsuario, isPapel } =
  await import("@/lib/usuarios");
const { issueToken, readToken } = await import("@/lib/auth");

suite("usuários e sessão");
{
  const hash = await hashSenha("senhaCorreta123");
  ok("hash não guarda a senha em texto", !hash.includes("senhaCorreta123"));
  ok("formato scrypt$salt$hash", hash.split("$").length === 3 && hash.startsWith("scrypt$"));
  ok("senha certa confere", await conferirSenha("senhaCorreta123", hash));
  ok("senha errada não confere", !(await conferirSenha("senhaErrada", hash)));
  ok("senha vazia não confere", !(await conferirSenha("", hash)));
  ok("hash corrompido não confere", !(await conferirSenha("senhaCorreta123", "lixo")));

  const outro = await hashSenha("senhaCorreta123");
  ok("mesma senha gera hashes DIFERENTES (salt novo)", outro !== hash);
  ok("  e os dois conferem", await conferirSenha("senhaCorreta123", outro));

  ok("senha gerada tem o tamanho pedido", gerarSenha(14).length === 14);
  ok("senhas geradas são diferentes", gerarSenha() !== gerarSenha());
  ok("login é normalizado", normalizaUsuario("  Katia  ") === "katia");
  ok("papel válido é aceito", isPapel("admin") && isPapel("auxiliar"));
  ok("papel inventado é recusado", !isPapel("dono"));

  const token = await issueToken({ userId: "u1", role: "auxiliar", name: "Katia" });
  const lido = await readToken(token);
  ok("token devolve quem é", lido?.userId === "u1" && lido?.name === "Katia");
  ok("  com o papel", lido?.role === "auxiliar");
  ok(
    "assinatura adulterada é rejeitada",
    (await readToken(token.slice(0, -3) + "aaa")) === null,
  );
  ok(
    "trocar auxiliar->admin no token é rejeitado",
    (await readToken(token.replace("auxiliar", "admin"))) === null,
  );
  ok("token v2 antigo é rejeitado", (await readToken("v2.9999999999.abc")) === null);
  ok("token vazio é rejeitado", (await readToken(undefined)) === null);
}

console.log(fails === 0 ? "\n✓ TODOS OS TESTES PASSARAM" : `\n✗ ${fails} FALHA(S)`);
process.exit(fails === 0 ? 0 : 1);
