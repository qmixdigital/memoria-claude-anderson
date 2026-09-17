---
name: qmix-alertas-preco
description: QMIX Invest — convenção de alertas de preço (compra vs venda) e como criá-los
metadata: 
  node_type: memory
  type: project
  originSessionId: 5d12783c-7348-4eef-ac92-10bc8fe1d654
---

No QMIX Invest, os alertas de preço (tabela `qmix_invest.price_alerts`, kind `target_high`|`stop_loss`) têm esta semântica definida pelo user (que é leigo):

- **target_high** = preço de **VENDA**: ele TEM a ação e vende quando **subir** até o teto. Dispara quando cotação ≥ alvo. Usar quando **alvo > cotação atual**.
- **stop_loss** = preço de **COMPRA**: ele quer **comprar** quando a ação **cair** até o preço. Dispara quando cotação ≤ alvo. Usar quando **alvo < cotação atual**.

**Why:** o user não usa stop de proteção — pra ele "cair até X" sempre significa oportunidade de compra. A regra de criação é automática: comparar o alvo com a cotação atual decide o kind (alvo acima = venda; alvo abaixo = compra).

**How to apply:** ao criar um alerta, primeiro `select last_quote_brl from qmix_invest.tickers where ticker=X`; se alvo > cotação → `target_high`, senão → `stop_loss`. Inserir via `docker exec -i qmix-invest-postgres psql ... insert into qmix_invest.price_alerts (ticker, kind, target_price, notes, active) values (...)`. O alerta dispara 1x e se auto-desativa (`active=false`). A mensagem do Telegram já diz "preço de COMPRA"/"preço de VENDA" conforme o kind. Cotação de ações fora da carteira é mantida fresca porque o `quote-watchlist` cota carteira ∪ watchlist ∪ alertas ativos. Ver [[qmix-invest-deploy]] pro fluxo de deploy.
