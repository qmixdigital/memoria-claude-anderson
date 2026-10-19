---
name: asaas-webhook-conta-inteira
description: Webhook Asaas é da conta QMIX inteira; payment_events de cada diretório Next mistura todos os produtos (não é receita do diretório)
metadata:
  node_type: memory
  type: reference
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-18T16:32:01.435Z
---

A conta Asaas é uma só, a da QMIX DIGITAL LTDA (CNPJ 37.181.964/0001-93). Todo app com webhook cadastrado recebe os eventos de TODOS os produtos (pedidos QMIX, Concar, consultarimovel, destaques, Recibos, Calistenia...) e grava na própria `payment_events`, quase sempre sem `company_id`. Somar essa tabela como faturamento do app é ERRO. Em 18/10/2026 eu reportei "R$ 31 mil no arcondicionadotop", e eram eventos da conta inteira, com dupla contagem CONFIRMED+RECEIVED.

Para números reais, consultar a API (`/payments?paymentDate[ge]=..`, `/financialTransactions`, `/transfers`) pela chave do `/var/www/consultarimovel-shared/.env` na opengravity. Essa é a que funciona, e o `\$` do arquivo vira `$`. As chaves do arcondicionadotop e do peritodicas estão revogadas. A API dá 429 se consultar cobrança por cobrança, então usar listagem paginada. Saques vão por PIX para a conta Cora da própria QMIX.

Webhooks cadastrados (10): editor.qmix, qmix.com.br (processa pedidos), cirurgiadacatarata, cirurgiacoracao, bitcao (FILA INTERROMPIDA em 18/10), arcondicionadotop (via domínio staging-arcondicionado), geladeirastop, peritodicas, desentupidora, setorenergetico. Ao desligar um app, apagar o webhook dele.
