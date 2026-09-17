---
name: smspix-creditos-fornecedores-acompanhamento-proprio
description: "No smspix.com.br, Anderson acompanha o saldo dos fornecedores por conta própria — não alertar sobre isso"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5402e0cf-9414-4874-8799-be322a244d4a
  modified: 2026-08-01T15:24:33.772Z
---

No smspix.com.br, não incluir o saldo dos fornecedores (5sim, Grizzly/handler_api) como pendência ou alerta nos resumos de trabalho. Em 01/08/2026 Anderson disse "pode esquecer, depois eu mesmo acompanho isso".

**Why:** o site é novo e o tráfego ainda é muito pequeno, então saldo baixo não representa risco real de venda perdida agora. Repetir o alerta a cada entrega vira ruído.

**How to apply:** o relatório diário automático no Telegram já cobre o acompanhamento. Só mencionar saldo se ele perguntar, ou se uma compra real falhar por falta de crédito.
