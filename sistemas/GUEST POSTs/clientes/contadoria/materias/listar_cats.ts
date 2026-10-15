import { obterCredencial } from "/opt/wp-mcp/src/vault/sites.ts";
import { listarCategorias } from "/opt/wp-mcp/src/wp/taxonomies.ts";

const SITES = ["teixeiraemfoco","alagoas200","itapecurunoticias","sp2040","canaljustica","alagoasdiario","xthor","afnewss","professortrabalhista","jornal.seg.br"];

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
