---
name: pm2-limite-memoria-fora-do-ecosystem
description: "Apps PM2 iniciados fora do ecosystem ficam sem max_memory_restart (desentupidora-pro chegou a 2,1 GB); como conferir e relancar com a -b como ponte; scripts bash -c bunx sem caminho absoluto quebram no reboot"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5b0e314b-e734-4943-99e2-3defe71f3ead
  modified: 2026-09-16T23:17:02.130Z
---

**Sintoma (clinicas-vps, 16/09/2026):** swap 100% e um app Next com 2,1 GB
(`desentupidora-pro`). O ecosystem dizia `max_memory_restart: "512M"`, mas o
processo em execucao nao tinha limite: foi iniciado por `pm2 start npm`/CLI, nao
pelo ecosystem. Outros 7 na mesma situacao (calistenia, marmorarias, pixelgap,
checkoutpixel-app, radarvolt, contadoria, garopaba).

**Conferir:** `pm2 jlist` -> `pm2_env.max_memory_restart` vazio = sem limite.
`pm2 describe` nao mostra a linha "max memory restart" quando nao ha limite.

**Corrigir sem sair do ar:** subir a `-b` (pelo ecosystem ou
`PORT=<p+1> pm2 start <cwd>/node_modules/next/dist/bin/next --name X-b --cwd <cwd>
--max-memory-restart 700M -- start`), esperar responder, `pm2 delete X`,
`pm2 start ecosystem --only X`, esperar, `pm2 stop X-b`, `pm2 save`. Script
usado: scratchpad relancar-com-limite.sh (copia em /root/relancar-com-limite.sh
na clinicas). Readiness = qualquer HTTP != 000 na porta (apps internos
respondem 404 em / sem Host).

**Armadilha irmã:** processos `bash -c bunx next start ...` sem caminho
absoluto (advdobrasil na srv1166087, contadoria e garopaba na clinicas) entram
em loop "bunx: command not found" (exit 127) quando o PM2 ressuscita apos
reboot, porque o PATH nao tem /root/.bun/bin. Recriar com
`/root/.bun/bin/bunx`.

**Postgres na srv1166087:** `idle_session_timeout = 15min` global; apps com
pool Prisma levam E57P05 (advdobrasil, 163x). Isentar por role:
`ALTER ROLE <r> SET idle_session_timeout = 0`.

**Why:** regra da rede exige max_memory_restart 700M; sem ele um app vaza ate
esgotar o swap da VPS inteira.
