// Lista as contas de anuncio que o token tem acesso.
// Util para descobrir os adAccountId no primeiro setup.
// Uso: bun run scripts/listar-contas.ts

import { metaGet } from "../src/lib/meta-client.ts";

interface Conta {
  id: string;
  name: string;
  account_status: number;
  currency: string;
}

interface Resp {
  data: Conta[];
}

const resp = await metaGet<Resp>("me/adaccounts", {
  fields: "id,name,account_status,currency",
});

if (resp.data.length === 0) {
  console.log("Nenhuma conta de anuncio acessivel por esse token.");
} else {
  console.log("Contas de anuncio acessiveis:\n");
  for (const c of resp.data) {
    const status = c.account_status === 1 ? "ativa" : "inativa";
    console.log(`${c.id} | ${c.name} | ${c.currency} | ${status}`);
  }
}
