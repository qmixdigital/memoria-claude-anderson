---
name: legacy-backlink-content-constraint
description: setorenergetico tem conteúdo legado de venda de backlinks que NÃO pode ser deletado nem noindexado
metadata: 
  node_type: memory
  type: project
  originSessionId: 6184db71-72ba-4425-85a3-80a3a1ef1a4d
---

O site setorenergetico.com.br tem ~90% do conteúdo editorial indexado (≈629 URLs no sitemap.xml em 2026-06-16) fora do nicho de energia (Yakult, colchão, criptomoedas, talheres, IPVA, assar bolos etc.) — restos da época em que era portal genérico/IPTV e **vendia backlinks**.

**Restrição (Guilherme, 2026-06-16):** essas páginas **não podem ser deletadas** porque têm backlinks vendidos apontando — precisam continuar **indexadas e dofollow** para o cliente manter o valor do link. Por isso `noindex` também está fora.

**Why:** deletar/desindexar quebra os backlinks pagos (perda de receita/credibilidade com clientes).

**How to apply:** para resolver a diluição de autoridade temática sem deletar, usar mitigação não-destrutiva — reclassificar o conteúdo legado nas `hiddenCategories` do `site.config` (já existe o mecanismo: some de home/listagens/RSS/newsletter/sitemap mas continua 200 e dofollow), removê-lo do grafo de links internos (nav, relacionados, "veja também"), e manter um sitemap legado dedicado para preservar o rastreamento/indexação. Assim energia+diretório passam a dominar os sinais internos. Não propor deleção/noindex desse conteúdo.
