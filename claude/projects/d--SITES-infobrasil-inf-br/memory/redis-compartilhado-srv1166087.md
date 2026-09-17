---
name: redis-compartilhado-srv1166087
description: Na VPS srv1166087 o Redis 6379 e object cache de WordPress com allkeys-lru; fila BullMQ precisa de instancia propria
metadata: 
  node_type: memory
  type: project
  originSessionId: 8f6de13c-0ddd-4ee5-b99d-75b102eb9220
  modified: 2026-08-16T07:27:44.433Z
---

Na VPS `hostinger-vps-srv1166087`, o Redis da porta 6379 serve **object cache de
WordPress de 5+ sites medicos** (db0, db1, db2, db3, db5) e roda com
`maxmemory-policy allkeys-lru`, que esses caches precisam. Qualquer fila BullMQ
de app Next.js apontada para essa instancia esta em risco.

**Why:** `maxmemory-policy` e global por instancia, nao por database. BullMQ
exige `noeviction` (senao perde job em silencio quando a memoria aperta), e o
object cache do WordPress exige `allkeys-lru`. Nao existe valor que sirva aos
dois. Descoberto em 16/08/2026 no Cortes IA (infobrasil.inf.br), cuja fila
morava no `db2` junto com 5.643 chaves de cache do
cirurgiadecolunagoiania.com.br. Trocar a policy global para `noeviction` teria
feito o cache dos sites WordPress dar erro de escrita ao encher.

**How to apply:** Ao subir app com BullMQ nessa VPS, criar instancia Redis
dedicada em outra porta (`/etc/redis/redis-<app>.conf` + unit systemd), com
`noeviction`, `maxmemory` modesto e `appendonly yes`. Nunca apontar fila para
6379. O modelo pronto esta em `d:\SITES\infobrasil.inf.br\infra\redis-cortes.conf`
e `redis-cortes.service` (porta 6380). Conferir com
`redis-cli -p <porta> config get maxmemory-policy`.

Ver tambem [[ffmpeg-static-segfault-rede]].
