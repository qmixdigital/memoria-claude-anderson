---
name: indexacao-rapid-url-indexer
description: "API de indexacao escolhida, custo real por URL nos dois modos e onde ficam as credenciais"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 99cc4a53-1065-4724-9ce2-a6d6ed6fafd1
  modified: 2026-09-01T16:19:30.087Z
---

O indexador da QMIX e o **Rapid URL Indexer**, decidido em 01/09/2026. O SerpApi
que estava no mesmo README **nao sera usado**.

Credenciais e exemplos: `D:\SISTEMAS\INDEXADORES\README.md`.
Base `https://rapidurlindexer.com/wp-json/api/v1`, header `X-API-Key`.
O LiteSpeed do site bloqueia o User-Agent padrao do curl com 403: mandar sempre
`-A "Mozilla/5.0 ..."`.

**Custo real** (pacote de 1.500 creditos por US$ 68, ou US$ 0,04533 o credito;
a R$ 5,14 o dolar da R$ 0,2332 por credito):

| | Standard | Apex |
|---|---|---|
| creditos por URL | 1 | 3 |
| devolucao se nao indexar em 14 dias | 100% | 1 de 3 |
| custo por URL **indexada** | R$ 0,23 | R$ 0,75 |
| tempo tipico | 6 a 24 h | ~5 min |

A diferenca entre os dois e **so velocidade**, e o Apex custa 3,2 vezes mais.
Taxa media de indexacao divulgada pelo fornecedor: 91%.

**Pegadinha do relatorio:** `/projects/{id}/report` devolve **HTTP 425** por
4 dias ("report_not_ready"). O primeiro relatorio verificado sai no 4o dia e o
monitoramento fecha no 14o. Status de projeto observados: `submitted`,
`completed`, `refunded`. Ou seja, "indexou?" nunca e resposta imediata, e a
tela do editor precisa refletir isso.

**Why:** o custo por URL e baixo demais para justificar Apex como padrao. Artigo
de editor nao e urgente; 6 a 24 h serve.

**How to apply:** vender Standard como padrao e Apex como upgrade opcional.
Ver [[faturamento-editores-asaas]], que ja tem o encanamento de PIX e webhook
para reaproveitar na venda de creditos.
