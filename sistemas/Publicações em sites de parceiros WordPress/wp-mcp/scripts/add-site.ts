// Cadastra ou atualiza um portal no cofre.
// Uso:
//   bun run scripts/add-site.ts --slug abadianoticia --nome "Abadia Noticia" \
//     --url https://abadianoticia.com.br --usuario qmix [--cat 1] [--nao-publicar] [--obs "..."]
// A senha de aplicativo e lida do stdin (nao fica no historico do shell):
//   echo 'xxxx xxxx xxxx' | bun run scripts/add-site.ts --slug ... --url ... --usuario ...
import { salvarSite, obterCredencial } from "../src/vault/sites.ts";
import { listarCategorias } from "../src/wp/taxonomies.ts";

function arg(nome: string): string | undefined {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function flag(nome: string): boolean {
  return process.argv.includes(`--${nome}`);
}

async function lerSenhaStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const c of Bun.stdin.stream()) chunks.push(c);
  const txt = Buffer.concat(chunks).toString("utf8").trim();
  return txt;
}

const slug = arg("slug");
const nome = arg("nome") ?? slug;
const url = arg("url");
const usuario = arg("usuario");
const cat = arg("cat");
const obs = arg("obs");
const naoPublicar = flag("nao-publicar");

if (!slug || !url || !usuario) {
  console.error("Faltam campos. Obrigatorios: --slug --url --usuario (--nome recomendado).");
  process.exit(1);
}

const senha = await lerSenhaStdin();
if (!senha) {
  console.error("Senha de aplicativo vazia. Passe pelo stdin: echo 'xxxx xxxx' | bun run ...");
  process.exit(1);
}

salvarSite({
  slug,
  nome: nome!,
  url,
  usuario,
  senha,
  categoria_padrao: cat ? Number(cat) : null,
  permite_publicar: !naoPublicar,
  observacoes: obs ?? null,
});

console.log(`Site "${slug}" salvo. Validando credenciais...`);
try {
  const cred = obterCredencial(slug)!;
  const cats = await listarCategorias(cred);
  console.log(`OK: conexao valida. ${cats.length} categorias encontradas.`);
  console.log(`Publicacao direta: ${naoPublicar ? "NAO (rascunho)" : "SIM"}`);
} catch (e) {
  console.error(`ATENCAO: salvo, mas a validacao falhou: ${e instanceof Error ? e.message : e}`);
  process.exit(2);
}
