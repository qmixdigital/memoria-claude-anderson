---
name: serpapi-chave
description: Chave da SerpAPI e a regra de uso - só pode ser usada quando o Anderson pedir
metadata: 
  node_type: memory
  type: reference
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T20:56:58.031Z
---

**SerpAPI** (https://serpapi.com/)

Chave: `<<REMOVIDO>>`

## Regra de uso

**Não é a API de indexação.** Em 15/08/2026 o Anderson enviou esta chave achando
que era a de indexação e corrigiu em seguida: quem indexa é a
[[rapidurlindexer-api]]. A SerpAPI fica guardada para leitura de SERP.

**Só usar quando ele pedir.** Não chamar por iniciativa própria em auditoria,
verificação de posição ou rotina automática. Cada chamada consome cota paga.

Conta: qmixdigital@gmail.com, Developer Plan, 5.000 buscas por mês.
Exige `User-Agent` de navegador, senão toma bloqueio.

## Nota técnica a considerar quando ele pedir

A SerpAPI **lê** resultados de busca, ela não submete URL para indexação. Quem
submete é o IndexNow (já configurado nos portais, com chave própria por site) e o
sitemap enviado ao Search Console.

O que a SerpAPI resolve bem no fluxo da rede:

- conferir se uma URL **já foi indexada**, com consulta `site:dominio/caminho`
- acompanhar a **posição** de uma palavra-chave sem esperar o Search Console
- ver quem ocupa o topo para uma palavra-chave antes de escrever

Endpoint base: `https://serpapi.com/search.json?engine=google&google_domain=google.com.br&gl=br&hl=pt-br&q=<consulta>&api_key=<chave>`

A cota da conta ainda não foi verificada, porque a regra é não chamar sem pedido.
Existe o endpoint `https://serpapi.com/account?api_key=<chave>`, que informa plano
e saldo e não consome busca.

Ver [[conversao-total]] e [[palavras-chave-e-entrega]].
