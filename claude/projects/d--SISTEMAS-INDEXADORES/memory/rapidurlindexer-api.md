---
name: rapidurlindexer-api
description: Chave e detalhes da API do Rapid URL Indexer, incluindo o bloqueio de User-Agent do curl
metadata:
  type: reference
---

Rapid URL Indexer — envio de URLs para indexacao no Google. Conta usada em `d:\SISTEMAS\INDEXADORES`.

- API key: `<<REMOVIDO>>` (header `X-API-Key`)
- Base URL: `https://rapidurlindexer.com/wp-json/api/v1` (NAO existe subdominio `api.`)
- Endpoints: `/credits/balance`, `/projects/list`, `POST /projects`, `/projects/{id}`, `/projects/{id}/report`
- **Pegadinha**: o LiteSpeed do site devolve 403 para o User-Agent padrao do curl. Sempre passar `-A "Mozilla/5.0 ..."`, senao parece chave invalida.
- 1 credito = 1 URL; Apex Mode = 3 creditos/URL (~5 min de crawl). Creditos nao expiram e sao devolvidos se a URL nao indexar em 14 dias.

Usado junto com [[serpapi-credentials]] para verificar o resultado da indexacao.
