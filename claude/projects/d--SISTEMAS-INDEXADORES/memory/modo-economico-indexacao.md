---
name: modo-economico-indexacao
description: "Todo envio ao Rapid URL Indexer deve usar modo economico (1 credito/URL), nunca Apex Mode"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 6597f5f1-d99d-47cf-8d36-57bf5d390207
  modified: 2026-08-18T20:37:07.082Z
---

Enviar URLs ao Rapid URL Indexer **sempre no modo economico**: `apex_mode_enabled: false` (1 credito por URL). Nunca usar Apex Mode por conta propria, nem sugerir como padrao.

**Why:** Apex Mode custa 3 creditos por URL para ganhar velocidade de crawl (~5 min). O volume da rede e alto e o ganho nao compensa o gasto 3x — o modo normal indexa igual em ate 14 dias e ainda devolve o credito se nao indexar.

**How to apply:** No script `scripts/submit_index.py` (em `d:\SISTEMAS\INDEXADORES`), rodar sem a flag `--apex`. So usar Apex se o Anderson pedir explicitamente para aquele lote.

Ver [[rapidurlindexer-api]] para a chave e os endpoints.
