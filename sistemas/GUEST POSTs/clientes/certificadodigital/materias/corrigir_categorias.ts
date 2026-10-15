import { readFileSync } from "fs";
import { obterCredencial } from "/opt/wp-mcp/src/vault/sites.ts";
import { listarCategorias } from "/opt/wp-mcp/src/wp/taxonomies.ts";
import { atualizarPost } from "/opt/wp-mcp/src/wp/posts.ts";

const resultado: Record<string, any> = JSON.parse(readFileSync("/tmp/certdig/resultado.json", "utf8"));

const CATEGORIA_DESEJADA: Record<string, string> = {
  "01": "Negócios",
  "02": "Negócios",
  "03": "Negócios",
  "04": "Negócios",
  "05": "Direito Civil",
  "06": "Direito Digital e LGPD",
  "07": "Direito Trabalhista",
  "08": "Tecnologia",
  "09": "Negócios",
  "10": "Negócios",
};

for (const n of Object.keys(resultado)) {
  const r = resultado[n];
  const cred = obterCredencial(r.site);
  if (!cred) { console.log(n, "sem credencial"); continue; }
  const cats: any[] = await listarCategorias(cred);
  const alvo = cats.find((c: any) => c.name === CATEGORIA_DESEJADA[n]);
  if (!alvo) { console.log(n, r.site, "categoria nao encontrada:", CATEGORIA_DESEJADA[n]); continue; }
  await atualizarPost(cred, r.post_id, { categorias: [alvo.id] });
  console.log(n, r.site, "->", alvo.name, "(id", alvo.id + ")");
}
