---
name: reference_incidente_pm2_boot_srv1166087
description: "2026-10-16: srv1166087 reiniciou e TODOS os apps ficaram num loop de mata-e-sobe por causa da unidade systemd pm2-root (Type=forking + PIDFile que o PM2 7 não cria). Corrigido para oneshot. Como diagnosticar e o que é normal ficar 'stopped'"
metadata:
  type: reference
---

**Sintoma (2026-10-16, 12:30 a 13:25 UTC):** VPS srv1166087 (31.97.173.40) ficou sem ping/SSH por ~50 min (reboot; kernel subiu de 6.8.0-134 para -147, instalado pelo unattended-upgrades em 14/10; houve 2 boots, 12:52 e 13:15). Ao voltar, enjai.social dava 502 e os apps ficavam com uptime de ~2 min: **o `pm2-root.service` entrava em loop**.

**Causa raiz:** a unidade era `Type=forking` + `PIDFile=/root/.pm2/pm2.pid` + `Restart=on-failure` + `ExecStop=pm2 kill`. O daemon que sobe é o **PM2 7.0.1** (nvm, `/root/.nvm/versions/node/v20.20.2/bin/pm2`) enquanto a unidade chama o **PM2 6.0.14** (`/usr/local/lib/node_modules/pm2`); o PM2 7 não grava `pm2.pid`, o systemd dá timeout (90 s), marca falha, roda `pm2 kill` (derruba TODOS os ~60 apps) e recomeça. Isso também reescreveu `/root/.pm2/dump.pm2` no meio do caos: **truenet e cliquex sumiram do dump** e apareceram só depois de start manual / watchdogs.

**Correção aplicada:** `/etc/systemd/system/pm2-root.service` -> `Type=oneshot`, `RemainAfterExit=yes`, `TimeoutStartSec=600`, sem `PIDFile`, sem `Restart=`; `daemon-reload` + `restart`. Backup `/root/pm2-root.service.bak-20261016`. Depois `pm2 start ecosystem --only truenet` e `truenet-b` (manuais) e `pm2 save` com 76 apps. Validado: enjai.social 200 pela Cloudflare; portas 3022/3024/3042/3043 = 200.

**Como ler o estado desse servidor sem se enganar:**
- Usar o CLI do nvm (`/root/.nvm/versions/node/v20.20.2/bin/pm2`) para `jlist`; o `/usr/local/bin/pm2` (6.0.14) imprime o aviso "In-memory PM2 is out-of-date" e quebra o JSON.
- É NORMAL ficar `stopped`: todas as `-b` (efêmeras, só sobem no deploy), `radar-scrape-*`/`radar-job-*` (cron_restart, rodam e saem), `danfe-web`/`danfe-web-b` (sem tráfego, DNS não aponta para cá).
- Há watchdogs em cron que sobem apps sozinhos: `/root/uptime-radar.sh` (hora em hora), `/root/uptime-cortes.sh` (10 min), `/opt/pm2-b-sweeper.sh` (5 min). Por isso a lista pode crescer sozinha minutos depois de um incidente.
- Muitos `*.conf` do nginx apontam para portas sem app (casasderecuperacao, masterjuris, bitcao-*, facoqr, personalverificado, advdobrasil, cartorio, goiania...): sites que moraram aqui e saíram; sem log de 200 recente. Não são falha.
- Teste de "site vivo hoje" = `grep` de `" 200 "` com a data de hoje no `access_log` do conf.

**Pendência correlata (separada):** os 4 domínios .com.br seguem `inactive` no Registro.br desde 2026-10-05 (ver [[project_migracao_dominio_enjai_social]]). Portuga e TrueNet só respondem por IP até isso ser resolvido.
