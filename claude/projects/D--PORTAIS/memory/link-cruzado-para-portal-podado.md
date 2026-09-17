---
name: link-cruzado-para-portal-podado
description: quando um portal poda o acervo, os vizinhos ficam linkando para 410 e nenhuma das duas auditorias enxerga
metadata:
  node_type: memory
  type: project
---

Os portais da rede linkam uns para os outros. Quando um deles poda o acervo, os
vizinhos que apontavam para os artigos apagados passam a apontar para **410**, e
esse defeito cai num ponto cego:

- a auditoria de **linkagem interna** só olha o próprio domínio
- a varredura de **link externo** trata qualquer domínio de fora como "não é
  problema nosso", justamente para não mexer em âncora de backlink de cliente

Em 22/08/2026 eram **29 links em 6 portais** da opengravity, apontando para
páginas mortas de advivo, azulmagazine, cameracotidiana, diariopernambucano,
medicodasmaos e setorenergetico.

**Why:** link para portal da rede **pode** ser desembrulhado sem medo, porque não
é backlink vendido, é link interno da rede. Link de **cliente** morto é outra
conversa e não se toca: ele é o produto, e o que fazer é decisão do Anderson.

**How to apply:** a varredura precisa da lista autoritativa de domínios da rede
(ver [[citacao-contada-como-backlink]]), pegar todo `<a href="https://...">` cujo
host esteja nela, medir ao vivo e desembrulhar o que responder 404, 410 ou 000.
Rodar sempre **depois** de qualquer poda, e nos vizinhos, não só no portal podado.
