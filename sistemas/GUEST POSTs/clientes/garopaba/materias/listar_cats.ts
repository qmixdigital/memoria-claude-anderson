import { obterCredencial } from "/opt/wp-mcp/src/vault/sites.ts";
import { listarCategorias } from "/opt/wp-mcp/src/wp/taxonomies.ts";

const SITES = ["alagoas200","teixeiraemfoco","xthor","sp2040","jornal","afnewss","webcitizen","portalgc","jornalbahia","agenciadivulgar"];

for (const site of SITES) {
  const cred = obterCredencial(site);
  if (!cred) { console.log(site, "SEM CREDENCIAL"); continue; }
  try {
    const cats: any[] = await listarCategorias(cred);
    console.log(site, "=>", cats.map((c: any) => c.name).join(" | "));
  } catch (e: any) {
    console.log(site, "ERRO", e?.message || String(e));
  }
}
