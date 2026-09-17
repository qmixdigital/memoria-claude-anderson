// Valida as credenciais de um site do cofre.
// Uso: bun run scripts/test-site.ts --slug abadianoticia
import { obterCredencial } from "../src/vault/sites.ts";
import { listarCategorias } from "../src/wp/taxonomies.ts";
import { wpGet } from "../src/wp/client.ts";

const i = process.argv.indexOf("--slug");
const slug = i >= 0 ? process.argv[i + 1] : undefined;
if (!slug) {
  console.error("Uso: bun run scripts/test-site.ts --slug SLUG");
  process.exit(1);
}
const cred = obterCredencial(slug);
if (!cred) {
  console.error(`Site "${slug}" nao encontrado no cofre.`);
  process.exit(1);
}

try {
  const me = await wpGet<{ id: number; name: string; slug: string }>(cred, "/users/me?_fields=id,name,slug");
  console.log(`users/me OK: id=${me.id} nome=${me.name}`);
} catch (e) {
  console.log(`users/me falhou (${e instanceof Error ? e.message : e}). Isso pode ser Cloudflare bloqueando GET de usuarios; testando categorias...`);
}

try {
  const cats = await listarCategorias(cred);
  console.log(`categories OK: ${cats.length} categorias.`);
  console.log("Amostra:", cats.slice(0, 5).map((c) => `${c.id}:${c.name}`).join(", "));
  console.log(`RESULTADO: ${slug} pronto para publicar.`);
} catch (e) {
  console.error(`categories FALHOU: ${e instanceof Error ? e.message : e}`);
  process.exit(2);
}
