// Lista as Paginas do Facebook que o token acessa e o Instagram ligado a cada uma.
// Util para descobrir pageId e instagramId no setup.
// Uso: bun run listar-ativos

import { metaGet } from "../src/lib/meta-client.ts";

interface Pagina {
  id: string;
  name: string;
  instagram_business_account?: { id: string; username: string };
}

interface Resp {
  data: Pagina[];
}

const resp = await metaGet<Resp>("me/accounts", {
  fields: "id,name,instagram_business_account{id,username}",
});

if (resp.data.length === 0) {
  console.log("Nenhuma Pagina acessivel por esse token.");
} else {
  console.log("Paginas e Instagram acessiveis:\n");
  for (const p of resp.data) {
    console.log(`Pagina: ${p.name}`);
    console.log(`  pageId      = ${p.id}`);
    if (p.instagram_business_account) {
      console.log(
        `  instagramId = ${p.instagram_business_account.id} (@${p.instagram_business_account.username})`
      );
    } else {
      console.log("  instagramId = (nenhum Instagram ligado a esta pagina)");
    }
    console.log("");
  }
}
