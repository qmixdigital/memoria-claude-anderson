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

Ver [[repo-invest-defasado-vs-producao]].
