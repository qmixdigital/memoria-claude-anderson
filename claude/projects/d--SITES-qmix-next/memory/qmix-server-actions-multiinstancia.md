---
name: qmix-server-actions-multiinstancia
description: qmix-next roda 2 instâncias PM2 — server actions exigem chave de criptografia compartilhada; pool postgres precisa de max
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
  modified: 2026-07-28T13:51:34.322Z
---

O qmix.com.br (Next 16, `/var/www/qmix-next` na srv1166087) roda **2 instâncias PM2** (qmix-next:3020 + qmix-next-b:3021) atrás de Nginx com load balancing. Isso tem duas implicações que causaram bugs reais em 2026-07-28:

1. **Server Actions precisam de chave compartilhada.** Sem `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, cada instância gera uma chave própria; o Nginx alterna os POSTs de action entre elas e ~metade falha com **"Failed to find Server Action. This request might be from an older or newer deployment."** Afetava TODO o admin (tickets, etc.), de forma intermitente. **Fix:** `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` (base64 de 32 bytes) no `.env` do servidor — as 2 instâncias compartilham a mesma chave. Precisa estar presente no build E no runtime.

2. **Pool postgres precisa de `max`.** [[qmix-inp-comprar-backlinks]] O `next build` abre vários workers, cada um com um pool postgres.js (default max 10); sem limite, isso + as 2 instâncias estouravam o `max_connections=100` do Postgres (container Docker qmix-postgres), falhando o prerender de `/api/produtos` com erro `InitProcess` (too many clients). **Fix:** `src/db/index.ts` → `postgres(conn, { prepare: false, max: 5, idle_timeout: 20 })`.

**Why:** ambos são segredos/config de servidor não versionados (o `.env` é gitignored), então não aparecem no código e podem se perder num redeploy do zero. **How to apply:** ao recriar o servidor ou depurar "Failed to find Server Action"/erros de conexão no build, garantir `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` no `.env` e o `max` do pool. Também no `.env`: `SERPAPI_KEY` (ferramenta de indexação) e `MOZ_API_TOKEN` (autoridade Moz v2, base64).
