---
name: drizzle-pool-sem-handler-derruba-node
description: drizzle(DATABASE_URL) cria Pool sem handler de error e o Postgres derrubando conexao ociosa mata o processo Node inteiro
metadata: 
  node_type: memory
  type: reference
  originSessionId: 63176e52-9a9d-4e57-aac7-20bb14f54992
  modified: 2026-08-11T14:22:03.706Z
---

`drizzle(process.env.DATABASE_URL!)` (forma curta de `drizzle-orm/node-postgres`) cria um `pg.Pool` interno ao qual **não dá para anexar handler de erro**.

Quando o Postgres derruba uma conexão **ociosa** (`pg_terminate_backend`, restart do servidor, reaper de idle), o node-postgres emite o erro no evento `error` do **Pool**, não na Promise de uma query — porque não há query em andamento. Evento `error` sem listener em EventEmitter vira `uncaughtException`, e `uncaughtException` mata o processo Node.

No bitcao.com.br isso rendeu **365 restarts do PM2 em 5 dias**, com o log registrando `uncaughtException: terminating connection due to administrator command` (SQLSTATE **57P01**). Não era só contador feio: cada ocorrência matava um dos dois backends do upstream, e duas quedas próximas derrubariam o site.

**Correção — Pool explícito com handler:**

```ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  idleTimeoutMillis: 30_000,      // fecha antes do servidor fechar
  connectionTimeoutMillis: 10_000,
})
pool.on("error", err => {
  console.error("[db] erro em conexao ociosa do pool (descartada):", err.message)
})
export const db = drizzle(pool, { schema })
```

`console.error` e não `throw`: o callback roda fora do ciclo de vida de qualquer requisição, e lançar ali reproduz o crash.

**Como provar que o fix funciona** (não basta olhar o contador cair):

```sql
SELECT count(pg_terminate_backend(pid)) FROM pg_stat_activity
 WHERE usename = current_user AND state = 'idle' AND pid <> pg_backend_pid();
```

Comparar `restart_time` do `pm2 jlist` antes e depois. No bitcao: 18 conexões derrubadas, 368 restarts antes e 368 depois, handler registrou as 18 linhas, site seguiu em 200.

**Vale checar em todo projeto Next + Drizzle da rede** que use a forma curta do `drizzle()`. Sintoma a procurar: contagem alta de restart no `pm2 list` sem causa aparente.
