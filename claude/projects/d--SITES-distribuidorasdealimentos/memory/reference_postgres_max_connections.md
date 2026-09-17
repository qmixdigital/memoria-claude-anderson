---
name: postgres-max-connections
description: max_connections do Postgres no VPS srv1166087 foi elevado de 100 para 300 para permitir builds Next.js SSG sem esgotar slots
metadata: 
  node_type: memory
  type: reference
  originSessionId: bf5f6c7b-623b-4092-bc48-366d1a308f25
---

O Postgres do VPS `hostinger-vps-srv1166087` (compartilhado por vários portais: distribuidoras, clinicas, radar-leiloes, palpitemestre) está com `max_connections = 300` desde 07/07/2026.

**Por quê:** builds `next build` do site distribuidoras (288 páginas SSG) spawnam 7 workers, cada um com pool próprio, e junto com as 2 instâncias PM2 já rodando (`distribuidoras` + `distribuidoras-b`) mais os outros portais no mesmo Postgres, o total spikeva além dos 100 slots default e falhava com `remaining connection slots are reserved for roles with the SUPERUSER attribute`.

**Como aplicar:** Se um build de qualquer portal falhar com esse erro no futuro, verificar se o valor caiu (algum restart pode ter revertido). Comando: `ssh hostinger-vps-srv1166087 "sudo -u postgres psql -c 'SHOW max_connections;'"`. Se preciso restaurar: `ALTER SYSTEM SET max_connections = 300;` + `systemctl restart postgresql`.

Aplicado via `ALTER SYSTEM` (persiste em `postgresql.auto.conf`), não em `postgresql.conf`. Sobreviverá a restarts.
