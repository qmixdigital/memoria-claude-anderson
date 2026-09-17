---
name: qmix-produto-nome-e-dominio
description: "Desde 2026-09-10 o `nome` do produto É o domínio (sem https/www/barra); nome fantasia antigo em `nome_original`; nunca voltar a exibir nomes"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-10T20:37:05.710Z
---

Em 2026-09-10 Anderson decidiu: "não vou mais usar nomes". `produtos.nome` passou a
ser o domínio limpo (`azulmagazine.com.br`, `cartaodevisita.r7.com`), gravado
direto no banco para os 531 produtos, com o nome antigo em `produtos.nome_original`.
`entregas.nome_produto` e `pedidos_itens.nome_produto` foram atualizados junto.

**Why:** cliente via "Azul Magazine" no painel e não sabia que site era; o domínio é
o que ele compra e o que aparece no link publicado. Fazer no banco cobriu painel,
marketplace, checkout, e-mails, Telegram e admin de uma vez, sem tocar 35 telas.

**How to apply:** produto novo entra com `nome` = domínio. Nunca mostrar `nome` e
`urlPortal` lado a lado (fica duplicado); onde precisar, o domínio vira link para o
site. A lista do admin (`/admin/produtos`) ordena por DA desc, mostra só ativos
(inativos aparecem na busca) e tem colunas Saldo e Saldo c/ afiliado.
Relacionado: [[qmix-publicacao-automatica]].
