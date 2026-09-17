---
name: conversao-exige-redirects
description: Converter WordPress para o portal-engine muda /slug/ para /categoria/slug/ e mata a URL histórica se o redirects.json não for gerado
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-18T23:07:45.118Z
---

O WordPress antigo dos portais servia em URL plana (`/slug/`). O portal-engine serve em
`/categoria/slug/` sempre que `flatUrl` é falso. A conversão preserva o slug, mas **não gera
sozinha o `redirects.json`**, e sem ele toda URL histórica passa a devolver 404.

Descoberto em 18/08/2026 nos 15 domínios da [[conversao-total]]: a página mais clicada de cada um
dos 10 domínios com sobreviventes estava em 404, incluindo a do `gazetadoconsumidor.com` que
ranqueia em **posição 1 para "inss"**. A [[poda-por-backlink-conferir-antes]] por clique tinha
preservado o conteúdo e perdido o endereço, que é onde mora a autoridade.

**Why:** preservar o texto sem preservar a URL anula o motivo da poda. O domínio vale pela idade e
pelos links que apontam para endereços específicos, não pelo conteúdo.

**How to apply:** ao converter, gerar `/srv/portais/<slug>/redirects.json` no formato
`{ "/slug/": "/categoria/slug/" }` a partir dos JSONs de `data/`, com dono `portais:portais`, e
**purgar a Cloudflare em seguida** (veja [[cloudflare-purge-token-de-conta]]): o 404 antigo fica
cacheado na borda e continua sendo servido mesmo com a origem já em 301.

O mecanismo já existia no motor e só não tinha sido usado neste lote: o vhost faz
`try_files ... @oldredir`, o `@oldredir` vai para o receptor na 8791, e `loadRedirects()` /
`handleOldRedirect()` em `receiver.js` devolvem o 301. Tolera barra final.

Ao testar, usar uma chave real do `redirects.json`. O Search Console trunca o caminho na exibição,
e URL remontada à mão dá 404 por motivo errado.
