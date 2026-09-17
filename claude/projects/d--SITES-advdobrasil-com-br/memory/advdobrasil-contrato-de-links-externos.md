---
name: advdobrasil-contrato-de-links-externos
description: "Nos artigos do advdobrasil, links externos sao backlinks vendidos a clientes e a ancora nao pode mudar"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7147f3e8-6d89-49d6-9498-79e887619e94
  modified: 2026-08-28T14:14:29.608Z
---

Boa parte dos links externos dos 68 artigos do advdobrasil sao **backlinks
vendidos a clientes da QMIX Digital**. Em 14 artigos eles sao o motivo de o
artigo existir.

Regra do Anderson: **a URL, o texto da ancora e os atributos do link nao
podem mudar de jeito nenhum**. Todo o resto do artigo pode ser reescrito
por inteiro, inclusive titulo, meta, descricao e estrutura.

**Why:** e receita contratada. Alterar ancora ou URL quebra a entrega ao
cliente que pagou pelo link, e isso nao aparece em nenhum teste de site
funcionando: a pagina continua 200 e o link continua clicavel.

**How to apply:** antes de commitar qualquer edicao em `src/blog/`, comparar
as ancoras de cliente contra o `git HEAD` e exigir igualdade byte a byte.
`migracao/scripts/verificar.mjs` ja checa o contrato em
`migracao/dados/links-externos.csv` a cada build, mas ele so garante que o
link continua presente; a **ancora** e a parte que exige a comparacao
manual. Excluir artigo exige tirar os links dele do contrato de proposito,
via `migracao/scripts/excluir.py`.

Ver tambem [[deploy-direto-e-backup-sob-autorizacao]].
