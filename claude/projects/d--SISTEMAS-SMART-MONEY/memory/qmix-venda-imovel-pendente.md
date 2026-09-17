---
name: qmix-venda-imovel-pendente
description: "PENDÊNCIA — 6 vendas de ações (jun/2026) pra comprar imóvel, preços a registrar antes de fechar o mês"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5d12783c-7348-4eef-ac92-10bc8fe1d654
  modified: 2026-07-21T20:21:15.096Z
---

Em ~2026-06-29 o user vendeu 6 ações DE VERDADE (saída definitiva) pra investir num imóvel: **ITSA4 (6.210), BBDC4 (4.983), ITUB3 (490), ITUB4 (650), BPAC11 (190), BBSE3 (140)**. Já foram dadas baixa em `user_portfolio` e os price_alerts delas desativados (não mandam mais nada no bot).

**PENDENTE:** o user vai passar os PREÇOS de venda de cada uma "depois, antes de fechar o mês". Quando passar: registrar as 6 vendas no ledger (`trades`, side=sell, nature=swing, **repurchase_intent=false** — é saída definitiva, não giro), apurar o imposto e entregar o DARF (valor + vencimento).

**Why (crítico):** as vendas somam ~R$ 240 mil, MUITO acima do teto de R$ 20 mil/mês → estouro → todo o lucro de ações de junho paga **15%**. Estimativa (preços de mercado): lucro ~R$ 8.500 → imposto **~R$ 1.280**, DARF vencendo no **último dia útil de julho/2026**. Se não apurar/pagar, multa. Como as vendas NÃO estão no ledger ainda, o lembrete automático de DARF (`runLembreteDarf`) NÃO dispara — cobrar manualmente.

**How to apply:** ao receber os preços, inserir os 6 trades de venda com trade_date da venda (jun/2026), rodar a apuração do mês (deve dar isento=false, imposto≈15% do lucro), gerar o DARF. Ver [[qmix-modulo-fiscal]] pro fluxo de registro e apuração.
