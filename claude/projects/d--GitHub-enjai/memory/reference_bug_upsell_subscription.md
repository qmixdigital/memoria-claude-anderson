---
name: reference_bug_upsell_subscription
description: Bug corrigido 2026-08-15 — upsell adicionava produto de assinatura (posts futuros) sem os dados obrigatórios; checkout cobrava e falhava no painel
metadata: 
  node_type: memory
  type: reference
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-08-15T11:43:17.434Z
---

**Bug (corrigido 2026-08-15):** produtos `tipoServico=subscription` (ex: "Instagram Curtidas Brasileiras Post Futuros", service 72 — curtidas automáticas em posts futuros) exigem `usernameAlvo` + `subMin` + `subMax` + `subPosts`. A **página do produto** coleta certo (via `SubscriptionCalculadora`), MAS o **upsell** ("Adicionar ao pedido") no `QuantidadeCalculadora` adicionava o produto extra só com `{produtoId, quantidade, linkAlvo}` — **sem os campos de assinatura**. O checkout tinha brecha: só validava assinatura *se* `usernameAlvo` já viesse preenchido. Resultado: cliente pagava, item ia pro painel sem dados e falhava com `"Subscription sem dados obrigatorios (usernameAlvo, subMin, subMax)"`. **Afetou ~28 pedidos portuga + 9 enjai** (item de assinatura não entregue; pedido às vezes CONCLUIDO porque o OUTRO item — seguidores — foi entregue). Todos vinham de pedidos multi-item (upsell), nenhum da página do produto.

**Correção (portuga + enjai + truenet):** (1) upsell de produto subscription agora mostra inputs (@usuário + curtidas mín/máx por post + nº posts 1-30), calcula preço = `rate × round(((min+max)/2) × posts)` e manda os campos; valida antes do checkout com alerta "Faltam dados...". (2) **Guard no checkout** (`app/api/checkout/route.ts`, dentro de `if (produto.tipoServico === "subscription")`) rejeita 400 "Faltam dados para finalizar o pedido" se faltar username/subMin/subMax/subPosts. **skipark NÃO tem o bug** — lá a assinatura já está desativada (checkout bloqueia todo subscription com "em configuracao"); calculador foi revertido, sem mudança. Dono vai resolver os pedidos afetados com os clientes (sem reembolso). Arquivos: `QuantidadeCalculadora.tsx` (upsell), `produtos/[slug]/page.tsx` (passa `tipoServico` ao upsell), `SubscriptionCalculadora.tsx` (referência da fórmula). ⚠️ Sites divergiram entre si — patches por string exata falham; usar âncoras pequenas.
