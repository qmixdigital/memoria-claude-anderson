// Lista os sites do cofre.
import { listarSites } from "../src/vault/sites.ts";
const sites = listarSites(true);
if (sites.length === 0) {
  console.log("Nenhum site cadastrado. Use add-site.ts.");
} else {
  for (const s of sites) {
    console.log(
      `${s.ativo ? "[ativo]" : "[inativo]"} ${s.slug}  ${s.nome}  ${s.url}  ` +
        `publica=${s.permite_publicar ? "sim" : "nao"}`,
    );
  }
}
