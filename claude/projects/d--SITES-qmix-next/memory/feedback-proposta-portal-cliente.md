---
name: feedback-proposta-portal-cliente
description: "Formato aprovado (15/09/2026) para a mensagem de proposta de portal enviada a cliente mensalista/recorrente (curta, WhatsApp, 4 linhas)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-15T10:07:13.337Z
---

Quando Anderson pedir "texto para enviar ao cliente sugerindo um portal", usar este formato, curto e direto
(o cliente não gosta de ler): 4 linhas, sem saudação longa, sem lista de garantias.

Modelo aprovado (Casa da Toalha, cartaodevisita.r7.com):

> Sugestão de portal para esta semana: **dominio** (portal do X).
> DA NN, N mil visitas/mês, link dofollow permanente como primeiro link da matéria.
> Formato: matéria em lista, tipo "as melhores lojas do Brasil para comprar [produto]", com [cliente] em 1º lugar.
> É o formato que o ChatGPT e o Google usam para responder quem pergunta onde comprar, então ajuda a marca a
> aparecer nas respostas de IA.
> Tabela R$ X, fecho com você por **R$ Y**.
> Confirma que já coloco em produção?

**Why:** a primeira versão (7 bullets, parágrafos) foi reprovada: "ele não gosta de ficar lendo".
**How to apply:** dados = DA, tráfego e preço, nada mais; formato "lista para IA" (ranking de lojas) quando o
cliente vende produto; preço de tabela e o preço fechado; termina com pergunta de confirmação. Dados do portal
vêm de `produtos` (domain_authority, trafego, preco) e a checagem "nunca teve link" de `backlinks_clientes`.
Ver [[qmix-faturamento-mensalistas]].
