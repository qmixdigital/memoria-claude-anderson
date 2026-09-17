---
name: Mudanca de schema Prisma no srv1166087 (Prisma 7 + Node 18) — gerar LOCAL + copiar client + psql
description: Como aplicar mudança de schema.prisma no enjai/portuga (srv1166087) — prisma CLI CRASHA no VPS; gerar client local, copiar .prisma/client, aplicar coluna via psql direto
metadata:
  node_type: memory
  type: feedback
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-07-20T22:29:07.937Z
---
> ⚠️ REESCRITO 2026-07-20. A versão antiga (git pull + `npx prisma generate` no VPS) NÃO funciona mais: no srv1166087 o Prisma CLI **crasha** (`ERR_REQUIRE_ESM: require() of ES Module .../zeptomatch/... from @prisma/dev` — Prisma **7.5.0** + **Node 18**). `npx prisma generate`, `prisma db execute`, `prisma migrate/db push` TODOS crasham no VPS. Também não é mais git (ver [[project_migracao_enjai_srv1166087]]).

**Fato-chave:** o Prisma Client é **WASM** (`node_modules/.prisma/client/query_compiler_fast_bg.wasm`), SEM engine binário nativo → **platform-independent**. Então o client gerado no Windows funciona igual no Linux. Por isso o fluxo real é *gerar local → copiar pro VPS*.

**Fluxo p/ mudança de schema (enjai/portuga no `hostinger-vps-srv1166087`):**
1. Editar `prisma/schema.prisma` local + o código que usa o campo novo.
2. **Gerar o client LOCAL** (onde funciona): `cd d:/GitHub/enjai && npx prisma generate` → depois `npx tsc --noEmit` (valida tipos).
3. Transferir os arquivos de código + `prisma/schema.prisma` pro `/var/www/<site>` (base64→ssh).
4. **Copiar o client gerado local → VPS** (é o passo que substitui o `prisma generate` quebrado):
   `cd d:/GitHub/enjai/node_modules/.prisma/client && tar czf - . | base64 -w0 | ssh HOST 'base64 -d | tar xzf - -C /var/www/<site>/node_modules/.prisma/client'`
   (inclui `index.js`, `index.d.ts`, `edge.js`, e o `schema.prisma` embutido que o compiler WASM lê em runtime — todos precisam ter o campo novo).
5. **Aplicar a mudança no banco via psql DIRETO** (psql está em `/usr/bin/psql`; DATABASE_URL no `.env.local`; DBs são docker: `enjai-postgres` postgres:16 em `127.0.0.1:5436`, `portuga-postgres` idem):
   `DBURL=$(grep -oE 'DATABASE_URL="?[^"]+' .env.local | sed 's/DATABASE_URL=//;s/"//g'); psql "$DBURL" -c 'ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "campo" ... ;'` (usar `IF NOT EXISTS` p/ idempotência; backfill com UPDATE se precisar).
6. Rodar `bash /root/deploy-<site>.sh`. O `npx prisma generate` interno do script vai falhar ("aviso: prisma generate retornou erro (seguindo)") — **tudo bem**, o client já foi copiado correto; o `next build` usa ele e compila.
7. **Teste de runtime** (Prisma 7 exige driver adapter — `new PrismaClient()` cru dá `PrismaClientInitializationError`): usar `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`, script `.mjs` DENTRO de `/var/www/<site>` (senão não acha node_modules) com `export DATABASE_URL=...`.

Confirmar no VPS que o campo entrou: `grep -c campo node_modules/.prisma/client/index.d.ts` (>0) e `grep -c campo node_modules/.prisma/client/schema.prisma` (=1).
