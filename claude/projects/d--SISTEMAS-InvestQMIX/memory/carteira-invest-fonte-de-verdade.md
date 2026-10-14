---
name: carteira-invest-fonte-de-verdade
description: Como atualizar a carteira do QMIX Invest a partir da posicao da B3 sem estragar o preco medio
metadata: 
  node_type: memory
  type: project
  originSessionId: 6adc9304-3162-4d2d-b146-9fa9af335091
  modified: 2026-09-07T18:13:12.886Z
---

Anderson atualiza a carteira mandando o **extrato de posicao da B3** em xlsx
(`posicao-AAAA-MM-DD-*.xlsx`, abas Acoes / Fundo de Investimento / Renda Fixa).
A carteira vive em `qmix_invest.user_portfolio`, no banco de producao.

**A planilha da B3 NAO tem preco de compra.** A coluna "Preco de Fechamento" e a
cotacao do dia. Gravar ela em `purchase_price_brl` destroi a base de calculo e
todo o resultado da carteira, alem de contaminar a apuracao de imposto. A
planilha serve para **quantidade**; o preco medio tem que vir do Anderson ou ser
reconstruido do saldo de abertura em `qmix_invest.trades` (que tem os trades
sinteticos `is_opening = true` de 29/06/2026).

Fluxo que funcionou em 07/09/2026:

1. Comparar os tickers da planilha com `user_portfolio`.
2. Ticker que sumiu da planilha foi vendido: remover, e **desativar os
   `price_alerts` dele**, senao ficam alertas orfaos disparando.
3. Ticker novo: inserir com a quantidade, `purchase_price_brl` NULL, e perguntar
   o preco medio. A UI aguenta NULL.
4. Quantidade que mudou: se `trades` tiver saldo de abertura com a MESMA
   quantidade da planilha, o preco de la e uma reconstrucao confiavel.
5. Venda gera imposto. Toda remocao de ticker precisa virar lancamento em
   `trades`, senao a tela `/imposto` acusa DARF sem operacao correspondente e o
   prejuizo a compensar fica errado dali pra frente.

FII com codigo terminado em 13 (ex: HGLG13) e **recibo de subscricao**, nao cota.
Nao existe em `tickers` e converte na cota normal depois. Nao vale cadastrar.

**Extrato de movimentacao (13/10/2026, periodo 31/10/2025 a 09/10/2026):**
devolucao de emprestimo de acoes (doador) aparece como "Transferencia -
Liquidacao" credito COM preco, igual a compra. O sinal e a linha de
"Emprestimo" credito + "Transferencia" deb/cred sem preco dias antes, com a
MESMA quantidade. Em 13/10/2026 as cinco compras fantasmas (BBAS3 2239, BBDC4
833, SYNE3 600, ITSA4 510, RECV3 100) foram removidas de `trades` (copia em
`qmix_invest.trades_removidos_20261013`) e o ledger passou a bater com
`user_portfolio`. Isso mudou a apuracao: prejuizo de julho/2026 caiu de
9.145,04 para 7.593,39 e as DARF em aberto de jan e fev/2026 foram reapuradas
(97,89 e 418,82). Backup da carteira anterior em
`qmix_invest.user_portfolio_bak_20261013`.

Subscricao entra em `corporate_events` com `new_quantity` e `new_pm_brl`
absolutos (o ledger nao soma, substitui). Feito em 13/10 para HGLG11 (31 @
156,70) e BBDC3 (2848 @ 16,33). Pendente: KNCR11 +8 cotas (pedido em
09/10/2026, preco do exercicio ainda nao saiu no extrato).

Ver [[repo-invest-defasado-vs-producao]].
