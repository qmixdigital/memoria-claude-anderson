---
name: pm2-needrestart-dump-race
description: Queda geral de 11/09/2026 na VPS opengravity - apt automatico + needrestart reiniciaram pm2-root e o dump do PM2 saiu com 1 app de 18; como restaurar e o que foi blindado
metadata: 
  node_type: memory
  type: project
  originSessionId: 5b0e314b-e734-4943-99e2-3defe71f3ead
  modified: 2026-09-11T07:39:23.679Z
---

Em 11/09/2026 06:55 o `apt-daily-upgrade` atualizou o systemd; `needrestart`
reiniciou TODOS os servicos as 06:59:59, incluindo `pm2-root.service`
(ExecStop = `pm2 kill`). O revistamsaude resistiu 10s ao SIGINT e, nesse
intervalo, o daemon recebeu sinal e rodou `gracefullExit` -> `dumpProcessList`
com so o que ainda estava na lista (1 app). O `pm2 resurrect` do ExecStart
subiu so ele. 17 apps ficaram fora por ~35 min (geladeirastop, arcondicionadotop,
consultarimovel, skipark, opengravity...).

**Como restaurar se acontecer de novo:** `/root/.pm2/dump.pm2.bak` guarda a
lista anterior. Filtrar (tirar o que ja roda e os `-b`), gravar em `dump.pm2`,
`pm2 resurrect`, `pm2 save`. Ver [[pm2-watchdog-resurrect]] (o watchdog nao
ajuda aqui: ele so ressuscita app *stopped*, nao app *deletado*).

**Blindagem aplicada (11/09/2026):**
- `/etc/needrestart/conf.d/pm2.conf`: `override_rc` para `pm2-root.service` = 0
  (needrestart nunca mais reinicia o PM2).
- `/etc/systemd/system/pm2-root.service.d/dump-seguro.conf`: ExecStop faz
  `pm2 save --force`, copia `dump.pm2` -> `dump.pm2.prestop`, `pm2 kill`, e
  devolve a copia. `TimeoutStopSec=90`.

**Why:** o `pm2 kill` nao e seguro para a lista de apps quando algum processo
demora a morrer; e o apt automatico chama isso sem ninguem olhando.

**How to apply:** ao ver varios apps sumirem do `pm2 list` de uma vez, olhar
`/root/.pm2/pm2.log` por "New PM2 Daemon started" e `journalctl` por
`apt-daily-upgrade` / "Stopping pm2-root". Nao rodar `pm2 kill`/`pm2 update`
na mao (regra ja existente).
