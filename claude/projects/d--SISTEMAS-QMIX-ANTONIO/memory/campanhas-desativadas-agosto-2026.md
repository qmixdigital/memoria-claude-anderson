---
name: campanhas-desativadas-agosto-2026
description: "Todas as 197 campanhas do QMIX Antônio foram desativadas em 17/08/2026 a pedido do Anderson, com lista de reversão salva"
metadata: 
  node_type: memory
  type: project
  originSessionId: 99cc4a53-1065-4724-9ce2-a6d6ed6fafd1
  modified: 2026-08-17T18:51:01.373Z
---

Em 17/08/2026 desativei as 197 campanhas ativas de `news_sources`
(`UPDATE news_sources SET status='inactive'`). Depois disso as 228 campanhas do
sistema estão inativas e o Antônio não coleta, não gera nem publica nada.

A lista dos IDs que estavam ativos naquele momento está em
`d:\SISTEMAS\QMIX ANTONIO\campanhas-ativas-em-2026-08-17.txt`. Sem ela não há
como distinguir as que foram desligadas agora das que já estavam inativas antes.

**Why:** o Anderson pediu para desativar tudo e disse que voltaria depois para
reativar algumas e cadastrar novas comigo.

**How to apply:** para reativar exatamente as de antes,
`UPDATE news_sources SET status='active' WHERE id IN (<conteúdo do arquivo>)`.
Para reativar só algumas, filtrar por `name` (que é o domínio de destino).
Ver [[operacoes-painel-antonio]].
