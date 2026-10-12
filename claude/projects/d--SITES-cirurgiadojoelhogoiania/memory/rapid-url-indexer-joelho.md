---
name: rapid-url-indexer-joelho
description: "Envios do site joelho ao Rapid URL Indexer (modo Apex, a pedido do Anderson em 10/10/2026); como conferir o que ja foi enviado"
metadata:
  node_type: memory
  type: project
  originSessionId: 7ff5efae-8b50-4a69-8837-609c7ccb4168
  modified: 2026-10-10T09:57:36.714Z
---

Chave, endpoints e a armadilha do 403 estao em [[rapidurlindexer-api]] (memoria do projeto PORTAIS).
Lista de projetos nao traz URLs: e preciso `GET /projects/{id}` (campo `urls`) para saber o que foi
enviado. Projetos com "Ulbiramar"/"joelho" no nome ate 09/10/2026 eram so backlinks em portais,
nenhuma URL do proprio dominio.

| Data | Projeto | URLs | Modo | Custo | Saldo depois |
|---|---|---|---|---|---|
| 10/10/2026 | 1244885 "cirurgiadojoelhogoiania 30 artigos novos 10-10 APEX" | 30 artigos novos do blog | Apex (3/URL) | 90 | 1756 |

**Why:** o Anderson pediu explicitamente "indexacao apex" para os 30 artigos novos, apesar da regra
antiga de usar sempre o modo barato. Ele vem nomeando projetos com "APEX" desde 03/10/2026.

**How to apply:** antes de enviar, filtrar projetos por data >= data de publicacao e ler as URLs de
cada um para nao gastar credito em URL ja enviada. Lista das 30 URLs em
`d:\GitHub\joelho-gh\_migracao\rui-envio-2026-10-10.json`.
