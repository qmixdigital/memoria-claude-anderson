// Cadastro em lote a partir de um JSON [{slug,nome,url,usuario,senha,observacoes,permite_publicar?}].
// Uso: bun run scripts/add-sites-batch.ts /caminho/sites.json
import { salvarSite, obterCredencial } from "../src/vault/sites.ts";
import { listarCategorias } from "../src/wp/taxonomies.ts";

interface Entrada {
  slug: string;
  nome: string;
  url: string;
  usuario: string;
  senha: string;
  observacoes?: string;
  permite_publicar?: boolean;
}

const caminho = process.argv[2];
if (!caminho) {
  console.error("Uso: bun run scripts/add-sites-batch.ts /caminho/sites.json");
  process.exit(1);
}

const lista = JSON.parse(await Bun.file(caminho).text()) as Entrada[];
console.log(`Cadastrando ${lista.length} sites...\n`);

let ok = 0;
const falhas: string[] = [];

for (const s of lista) {
  try {
    salvarSite({
      slug: s.slug,
      nome: s.nome,
      url: s.url,
      usuario: s.usuario,
      senha: s.senha,
      permite_publicar: s.permite_publicar !== false,
      observacoes: s.observacoes ?? null,
    });
    // Valida a credencial listando categorias.
    const cred = obterCredencial(s.slug)!;
    const cats = await listarCategorias(cred);
    console.log(`  OK   ${s.slug.padEnd(24)} ${String(cats.length).padStart(3)} categorias`);
    ok++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  FALHA ${s.slug.padEnd(23)} ${msg.slice(0, 90)}`);
    falhas.push(`${s.slug}: ${msg.slice(0, 120)}`);
  }
}

console.log(`\nResumo: ${ok} OK, ${falhas.length} com falha de validacao.`);
if (falhas.length) {
  console.log("\nFalhas (cadastradas, mas validacao nao passou - verificar credencial/plugin):");
  for (const f of falhas) console.log("  - " + f);
}
