---
name: qmix-apostas-precos
description: Aba Apostas esportivas: regras de preço por dono do portal, produto espelho para o carrinho normal, e pendência de levar 1news/tvprime/horanews para a lista normal
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-18T09:21:43.754Z
---

Aba `/lista-de-backlinks/apostas` (tabela `apostas_portais`), regras dadas pelo Anderson em 18/09/2026:

- **Rede QMIX** (`fornecedor='qmix'`, 23 portais): R$ 180, custo 0. Identificados por `portais_conectados.tipo='qmix-api'`, `produtos.contato='QMIX'` ou `D:\SISTEMAS\MinhasHospedagens\rede-publicacao-allowlist.txt`.
- **Sites do próprio Jean** (`fornecedor='jean'`, os 36 de `jean.csv`): R$ 240, custo 150.
- **Yon e Diego** (`produtos.contato`): R$ 240, custo 50 (custo direto do cadastro de produtos), `fornecedor='yon'|'diego'`.
- **Demais do Jean** (terceiros via Jean): segue custo x 2 (`MULTIPLICADOR_APOSTAS`).
- **1news.com.br, tvprime.com.br, horanews.uai.com.br** (`fornecedor='outro'`, DA 93): em apostas só existe a publicação especial, R$ 1.600 (custo 950). A publicação normal desse fornecedor (custo 500) é para artigo comum, NÃO de apostas.

**Compra pelo carrinho normal (18/09/2026):** cada linha de `apostas_portais` tem um **produto espelho** (`produtos.apostas=true`, slug `apostas-<dominio>`, `status='inativo'` de propósito para ficar fora de listagem pública, sitemap, feed e `/[slug]`; `apostas_portais.produto_id` liga os dois). `sincronizarProdutoAposta()` em `src/lib/apostas.ts` roda a cada salvar/adicionar no admin. O checkout não olha status, mas recusa espelho cuja linha está `ativo=false` ou `aceita=false`. O admin de produtos esconde os espelhos. Nome do item no pedido: `dominio (apostas)`.

**Pendente:** inserir 1news, tvprime e horanews na lista normal de produtos (custo 500 na publicação comum). Anderson pediu para lembrar.

**Why:** os preços não seguem uma regra única; a coluna `fornecedor` é o que diz de quem é o portal. `reaplicarRegraDePreco()` no admin recalcula TUDO por custo x 2 e apagaria essas exceções; não usar sem reaplicar as regras acima.

**How to apply:** ao mexer em preço de apostas, olhar `fornecedor` primeiro. Ver [[qmix-produto-nome-e-dominio]] para casar domínio com `produtos.nome`.
