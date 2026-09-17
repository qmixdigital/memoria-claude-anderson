---
name: project_dm_backlinks_lote2_agendado
description: "dm.com.br lote 2 (10 guest posts) escrito em 16/09/2026 e AGENDADO por cron único nos 3 hosts para sábado 19/09/2026 09:00 Brasília (12:00 UTC); depois do disparo falta conferir no ar, planilha e o log do Apex automático"
metadata: 
  node_type: memory
  type: project
  originSessionId: 11d63bfc-1400-4f76-816e-cd634e1dbc24
  modified: 2026-09-16T22:55:07.897Z
---

Lote 2 de backlinks do dm.com.br (mesma URL do lote 1: /dicas/10-melhores-plataformas-de-streaming-gratuitas-no-brasil-em-2026/), 10 guest posts na rede própria, escritos e validados (gate local 0 erros) em 16/09/2026 e **agendados para sábado 19/09/2026 às 09:00 de Brasília (12:00 UTC)**.

Como está agendado: em cada host (opengravity: 8 portais; srv1166087: projetob; clinicas-vps: olharmoderno) existe `/root/agenda/dm2/` com `stage/` (payload/*.json, pub_dm.js, entrada.py, rebuild.js, plano.json) e `run.sh`; a linha `0 12 19 9 * /bin/bash /root/agenda/dm2/run.sh` está no crontab do root e o run.sh se remove do cron ao terminar. Logs: `/root/agenda/dm2/run.log` e `cron.log`; resultado em `/root/agenda/dm2/publicados.json`. Os hosts estão em UTC. O IndexNow do motor dispara sozinho na publicação.

Pipeline local: `D:/tmp/dm2/` (art/*.py, lote_ar.json, lote_b1..3.json, payload_b1..3, verif.py, seo_full.py). Lista para Apex: `D:/SISTEMAS/INDEXADORES/urls/dm-lote2.txt`. Planilha `D:/PORTAIS/BACKLINKS/dm.com.br.xlsx` já tem as 10 linhas do lote 2 marcadas "19/09/2026 (agendado)", HTTP/canonical vazios.

**Pendente depois do disparo (sábado ou segunda):** (1) `cd D:/tmp/dm2 && python verif.py` e `auditar.py ar lote_ar.json`; conferir `publicados.json` nos 3 hosts; (2) preencher HTTP/canonical na planilha; (3) Apex: **AUTORIZADO e automático** no opengravity: `run.sh` dispara `apex.sh` em background, que espera as 10 URLs (3 hosts) responderem 200 (até 13 tentativas de 5 min), faz o POST em /projects com apex_mode_enabled e grava `apex.done`; log em `/root/agenda/dm2/apex.log`. Conferir o project_id e o saldo (4284 antes) no log; NÃO reenviar se `apex.done` existir; (4) fechar esta memória.

**Why:** operador pediu conteúdo agendado para sábado de manhã; o portal-engine não tem agendamento nativo, então foi usado cron de disparo único por host (opção que não mexe no motor).

**How to apply:** se o cron não disparar, rodar manualmente `bash /root/agenda/dm2/run.sh` em cada host como root. Portais deste lote e do lote 1 não se repetem para o dm.com.br. Ver [[project_dm_backlinks_lote1]].
