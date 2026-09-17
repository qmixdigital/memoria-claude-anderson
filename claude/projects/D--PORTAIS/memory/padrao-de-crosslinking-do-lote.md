---
name: padrao-de-crosslinking-do-lote
description: "O padrão de linkagem interna que o Anderson espera em cada lote de 10 artigos, depois de reprovar a malha do portalnoticiasbh"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-17T22:49:04.047Z
---

Em 17/08/2026 o Anderson reprovou a malha interna de um lote entregue com apenas
**2 links por artigo** e 20 links no cluster inteiro. A malha passava na conferência
automática (nenhuma órfã, âncoras variadas), mas era fraca demais para o objetivo.

**Why:** o teto do CLAUDE.md é 10 links internos por página, e usar 2 desperdiça 80%
da transferência de autoridade dentro do próprio cluster, que é justamente o que faz
a rede de backlinks funcionar. Passar na regra mínima não é o alvo.

**How to apply:** montar todo lote como **pilar e clusters**, não como anel plano.

- Escolher a página mais abrangente como pilar e fazê-la linkar para **todas** as
  outras 9.
- Toda cluster linka **de volta ao pilar**, sem exceção.
- Cada artigo fecha com uma seção **"Veja também"** de 4 links, somada a 2 links
  contextuais no corpo. Resultado: 6 links por artigo, 9 no pilar.
- Alvo do lote: **~63 links, mínimo de 4 recebidos por página**, contra os 20 de antes.
- Toda âncora distinta, com a keyword do destino e variação natural, nenhuma genérica,
  e nenhum destino repetido na mesma página.

O script `malha_bh.py` no scratchpad valida tudo isso antes de aplicar: âncora
repetida, destino já linkado no corpo, link para si mesmo e destino inexistente.

Para corrigir lote já publicado, editar o campo `content` direto no
`/srv/portais/<slug>/data/<slug>.json`, rodar `rebuildIndexes` e purgar. Republicar
pela API não é necessário.

Relacionado: [[linkagem-interna-automatica]], [[breadcrumb-ancora-generica]],
[[registro-de-lotes-por-portal]].
