---
name: cirurgiacoracao-criterio-poda
description: "O que conta como backlink a preservar numa poda de conteúdo, na definição do Anderson"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 34f8fcac-98ef-4542-b226-fe9ed8bc2d91
  modified: 2026-08-19T11:15:22.802Z
---

Critério do Anderson para podar conteúdo (dado em 19/08/2026, no cirurgiacoracao.com.br):

> Apagar o que tem **zero cliques** no Search Console **e** nenhum backlink a preservar.

O que conta como backlink a preservar: **link externo contextual, com âncora ampla, dentro do corpo do texto**.

O que **não** conta, e portanto pode ser apagado junto:

- URL de referência ou fonte ("Fonte:", "Disponível em:", link no fim do artigo)
- âncora que é a própria URL
- âncora genérica: "aqui", "clique aqui", "leia mais", "link"
- âncora de uma palavra só
- link sozinho num parágrafo, ocupando quase todo o bloco

**Why:** o valor que justifica manter uma página sem tráfego é o link comercial que ela hospeda. Citação de fonte não é ativo, é referência editorial.

**How to apply:** ao podar qualquer site da rede, classificar cada link externo antes de decidir. O script que faz isso está em `classificar.py`, no scratchpad da sessão de 19/08/2026; a regra em si está aqui. Fazer backup em CSV com a coluna `content` antes de apagar, sempre.

Ver [[linkagem-interna-por-ultimo]].
