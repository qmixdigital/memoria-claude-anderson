// Assistente em portugues para criar uma campanha SEM mexer em codigo.
// Faz perguntas simples, monta a "ficha" e (se voce quiser) ja cria na Meta.
//
// Uso: bun run nova-campanha

import { spawnSync } from "node:child_process";
import { CLIENTES } from "../src/config/clientes.ts";
import type {
  CampanhaBrief,
  Objetivo,
  OptimizationGoal,
  InstagramPosition,
} from "../src/config/types.ts";

// --- Helpers de pergunta ---------------------------------------------------

function perguntar(texto: string, padrao = ""): string {
  const dica = padrao ? ` [${padrao}]` : "";
  const r = prompt(`${texto}${dica}:`);
  const valor = (r ?? "").trim();
  return valor === "" ? padrao : valor;
}

function escolher<T>(
  texto: string,
  opcoes: { rotulo: string; valor: T }[]
): T {
  console.log(`\n${texto}`);
  opcoes.forEach((o, i) => console.log(`  ${i + 1}) ${o.rotulo}`));
  while (true) {
    const r = prompt("Digite o numero:");
    const n = parseInt((r ?? "").trim(), 10);
    if (n >= 1 && n <= opcoes.length) return opcoes[n - 1]!.valor;
    console.log("Opcao invalida, tente de novo.");
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- Inicio ----------------------------------------------------------------

console.log("=== Assistente de Campanha — Meta Ads ===\n");

// 1. Cliente (escolhe um ja cadastrado)
const slugs = Object.keys(CLIENTES);
if (slugs.length === 0) {
  console.error("Nenhum cliente cadastrado em src/config/clientes.ts ainda.");
  process.exit(1);
}
const clienteSlug = escolher(
  "Para qual cliente e a campanha?",
  slugs.map((s) => ({ rotulo: `${CLIENTES[s]!.nome} (${s})`, valor: s }))
);

// 2. Nome da campanha
const nomeCampanha = perguntar(
  "\nNome da campanha (ex: Alta Temporada, Promocao de Maio)"
);

// 3. Objetivo (em linguagem simples)
const obj = escolher("O que voce quer com essa campanha?", [
  {
    rotulo: "Levar pessoas para um site ou WhatsApp (recomendado)",
    valor: { objetivo: "OUTCOME_TRAFFIC", goal: "LINK_CLICKS" } as const,
  },
  {
    rotulo: "Conseguir mais visualizacoes / alcance",
    valor: { objetivo: "OUTCOME_AWARENESS", goal: "REACH" } as const,
  },
  {
    rotulo: "Mais curtidas e interacoes no perfil",
    valor: { objetivo: "OUTCOME_ENGAGEMENT", goal: "IMPRESSIONS" } as const,
  },
]);

// 4. Orcamento
const orcamentoStr = perguntar("\nQuanto gastar por dia, em reais", "30");
const orcamento = Math.max(5, parseInt(orcamentoStr, 10) || 30);

// 5. Destino
const link = perguntar(
  "\nPara onde o clique leva? (cole o link do site ou do WhatsApp, ex: https://wa.me/5562999999999)"
);

// 6. Imagem
const imagem = perguntar(
  "\nCaminho da foto no seu PC (ex: C:/Users/voce/Desktop/casa.jpg)"
);

// 7. Texto do anuncio
console.log(
  "\nTexto do anuncio. Pode deixar em branco agora e pedir para o assistente do VS Code escrever depois."
);
const mensagem = perguntar("Texto", "(rascunho — peca ajuda para escrever)");

// 8. Posicoes Instagram (padrao bom)
const posicoes: InstagramPosition[] = ["stream", "reels", "story"];

// CTA padrao conforme objetivo e destino
const cta =
  obj.objetivo === "OUTCOME_TRAFFIC"
    ? link.includes("wa.me")
      ? "WHATSAPP_MESSAGE"
      : "LEARN_MORE"
    : "LEARN_MORE";

const brief: CampanhaBrief = {
  cliente: clienteSlug,
  nomeCampanha,
  objetivo: obj.objetivo as Objetivo,
  optimizationGoal: obj.goal as OptimizationGoal,
  orcamentoDiarioReais: orcamento,
  instagramPositions: posicoes,
  anuncio: {
    nome: `${nomeCampanha} - Anuncio 1`,
    imagem,
    mensagem,
    link,
    chamada: cta,
  },
};

// Escreve a ficha em campanhas/<slug>.ts
const nomeArquivo = `campanhas/${slugify(nomeCampanha) || "campanha"}.ts`;
const conteudo = `// Ficha gerada pelo assistente (bun run nova-campanha).
import type { CampanhaBrief } from "../src/config/types.ts";

const brief: CampanhaBrief = ${JSON.stringify(brief, null, 2)};

export default brief;
`;
await Bun.write(nomeArquivo, conteudo);

console.log(`\nFicha salva em ${nomeArquivo}`);
console.log("Resumo:");
console.log(`  Cliente:   ${CLIENTES[clienteSlug]!.nome}`);
console.log(`  Campanha:  ${nomeCampanha}`);
console.log(`  Por dia:   R$ ${orcamento}`);
console.log(`  Destino:   ${link || "(vazio)"}`);
console.log(`  Imagem:    ${imagem || "(vazio)"}`);

// 9. Criar agora?
const agora = perguntar(
  "\nCriar essa campanha na Meta agora? (tudo nasce PAUSADO) s/n",
  "n"
);
if (agora.toLowerCase().startsWith("s")) {
  console.log("\nCriando...\n");
  const r = spawnSync("bun", ["run", "scripts/criar.ts", nomeArquivo], {
    stdio: "inherit",
  });
  process.exit(r.status ?? 0);
} else {
  console.log(`\nQuando quiser criar, rode:  bun run criar ${nomeArquivo}`);
}
