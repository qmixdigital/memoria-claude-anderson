---
name: faturamento-editores-asaas
description: Estado do sistema de cobranca dos editores pagantes e a chave do Asaas que esta invalida
metadata: 
  node_type: memory
  type: project
  originSessionId: 99cc4a53-1065-4724-9ce2-a6d6ed6fafd1
  modified: 2026-08-28T15:10:56.506Z
---

Sistema de faturamento dos editores (R$ 50,00 por post, usuario de teste Felipe,
lc_users id 9) em construcao desde 28/08/2026.

**Ja feito no servidor** (host `hostinger-vps-srv1166087`, o unico que tem `/home/boot`):
- `lc_users.tipo_cobranca` ENUM('parceiro','pagante') e `lc_users.valor_post` DECIMAL
- tabela `lc_cobrancas` e coluna `lc_articles.cobranca_id`
- Felipe criado como `pagante` / R$ 50,00, com os 42 dominios do Marcos Jean
- `/home/boot/.qmix-asaas.env` (chmod 600)

**Tudo ja subiu e foi verificado em 28/08/2026**: `includes/asaas.php`,
`pagamentos.php` e `webhook-asaas.php` no editor, `cobrancas-editores.php` no
acesso, mais os dois itens de menu. O passo a passo esta em `OPERACOES.md`.
Falta so a chave valida para gerar o primeiro PIX.

**Chave nova instalada em 01/09/2026** e autenticando (HTTP 200, QMIX DIGITAL
LTDA). Fica em `/opt/qmix/env/asaas.env`, **nao** em `/home/boot`: o
`open_basedir` do PHP web so libera o proprio site, `/tmp` e `/opt`, entao
credencial em `/home/boot` fica invisivel pela web e o webhook rejeita ate o
token correto. O mesmo vale para codigo compartilhado entre os dois apps, que
mora em `/opt/qmix/lib`.

**Exigencia do Asaas em producao:** cobranca so e emitida com **CPF ou CNPJ** do
cliente. Por isso existe `lc_users.cpf_cnpj` e a tela pede o documento antes da
primeira compra, validando os digitos com `/opt/qmix/lib/documento.php`.

**Tarifa real do contrato** (lida em `/v3/myAccount/fees`): PIX **R$ 1,99** por
recebimento, com **100 recebimentos por mes sem tarifa**. O desconto de R$ 0,99
venceu em 19/05/2026. Boleto R$ 1,99. Cartao 2,99% mais R$ 0,49.

**Webhook cadastrado** (id `1e407157-6647-461a-acc9-9efda0932dac`) apontando para
`https://editor.qmix.com.br/webhook-asaas.php`. A conta ja tinha 9 webhooks e o
limite e 10, entao nao sobra espaco para outro.
