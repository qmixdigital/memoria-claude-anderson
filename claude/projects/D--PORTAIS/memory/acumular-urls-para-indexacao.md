---
name: acumular-urls-para-indexacao
description: "Durante o trabalho, ir juntando as URLs novas ou reescritas num arquivo do portal, para entregar no fim"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-19T22:31:58.440Z
---

Enquanto o trabalho num portal corre, acumular toda URL nova ou reescrita em
`D:\PORTAIS\<PORTAL>\URLS-PARA-INDEXACAO.md`, com uma linha por URL dizendo o
que mudou e o código HTTP conferido. No fim, o Anderson pede a lista para
encaminhar à indexação.

**Why:** ele pediu isso em 19/08/2026, durante o blogse. Se a lista só for
montada no fim, alguma URL escapa, principalmente as recuperadas de 410 e as
páginas institucionais criadas na migração, que não são artigo e por isso somem
da memória.

**How to apply:** o arquivo termina com um bloco de código com uma URL por
linha, pronto para colar. **Nunca enviar por iniciativa própria**: o envio é só
quando ele pedir, e sempre no modo barato, como está em
[[rapidurlindexer-api]]. Entregar também como [[entrega-sempre-url-clicavel]].
