---
name: serpapi-credentials
description: Chave da SerpApi (conta qmixdigital) usada para verificar se URLs estao indexadas no Google
metadata:
  type: reference
---

SerpApi — https://serpapi.com/ — conta `qmixdigital@gmail.com`, plano Developer (5.000 buscas/mes, renova dia 15).

- API key: `<<REMOVIDO>>`
- Saldo: `GET https://serpapi.com/account?api_key=<KEY>` → campo `total_searches_left`
- Busca: `GET https://serpapi.com/search.json?engine=google&q=<query>&api_key=<KEY>`
- Rate limit: 1.000 buscas/hora
- Uso nesta pasta: checar indexacao no Google com `q=site:URL` (1 busca = 1 credito por URL)

Complementa [[rapidurlindexer-api]] — SerpApi verifica, Rapid URL Indexer envia para indexar.
