---
name: cliquex-rotator-sync-fk
description: "Bug recorrente: deletar link/campanha trava a sincronização de cliques do Worker (FK violation)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-07-29T23:25:31.388Z
---

**BUG (corrigido 2026-07-29)**: `/api/rotator-sync` (em `/var/www/cliquex/app/api/rotator-sync/route.ts`) grava tudo numa **transação atômica única** (`prisma.$transaction(ops)`). Se um `linkId`/`campanhaId` que o Durable Object tem em buffer foi **deletado** do banco, o INSERT em `cliques_hora`/`cliques_hora_campanha` viola a foreign key (Postgres code 23503) e faz **rollback da transação inteira** → NENHUM clique persiste. E como o Worker reenvia o mesmo buffer a cada 30s (alarm), trava **permanentemente**. Sintoma: relatório "Cliques na última hora: 0" mas o rodízio funciona (home dá 302); `max(hora)` de `cliques_hora` congela; log `pm2 logs cliquex-a` mostra `[rotator-sync] ... violates foreign key constraint`. Os cliques NÃO se perdem (ficam no buffer do DO) — voltam todos de uma vez quando o sync destrava.

**FIX aplicado**: os INSERTs de `cliques_hora` e `cliques_hora_campanha` agora usam `INSERT ... SELECT ... WHERE EXISTS (SELECT 1 FROM links/campanhas WHERE id = ${id}) ... ON CONFLICT ...` — pulam silenciosamente pais deletados sem derrubar a transação. Backup do original em `route.ts.bak-fk`. Ao editar esse arquivo, MANTER o `WHERE EXISTS`.

**Diagnóstico rápido**: `ssh hostinger-vps-srv1166087`; tabelas são snake_case (`links`, `cliques_hora`, `campanhas`, `cliques_hora_campanha`, `cliques_dimensao`) com colunas camelCase entre aspas (`"cliquesTotal"`, `"linkId"`). `sudo -u postgres psql cliquex_db`. Comparar `max(hora)` de cliques_hora com `now()` — se defasado horas, sync travado.

**Mudança no relatório (mesmo dia)**: `cliquex-tg-hora` agora mostra **"Acumulado do dia"** (soma de `cliques_hora` no dia, fuso America/Sao_Paulo, reseta meia-noite) em vez do total histórico `SUM("cliquesTotal")`. Backup `.bak-dia`. Ver [[cliquex-worker-rotador]], [[cliquex-alertas-telegram]], [[cliquex-deploy]].
