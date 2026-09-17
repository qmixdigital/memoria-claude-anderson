---
name: geladeirastop-migrado-srv1166087
description: "geladeirastop.com saiu da opengravity para a srv1166087 (hostinger-vps-srv1166087) em 14/09/2026 - portas 3220/3221, Node 20 via nvm, crons em /root/scripts-geladeirastop, copia antiga parada na opengravity"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5b0e314b-e734-4943-99e2-3defe71f3ead
  modified: 2026-09-14T14:54:16.823Z
---

**Onde roda desde 14/09/2026 14:32 UTC:** `hostinger-vps-srv1166087` (31.97.173.40),
`/var/www/geladeirastop.com`, PM2 `geladeiras-top` (porta 3220; `-b` efemera 3221),
`interpreter` = `/root/.nvm/versions/node/v20.20.2/bin/node` (Next 16 exige Node
>= 20.9 e o node do sistema la e 18). Gerenciador: **pnpm**. Postgres local
`geladeirastop` (senha no `.env.production`). nginx: `/etc/nginx/conf.d/geladeirastop.conf`
(cert Origin CA copiado da opengravity, valido ate 2041; robots oficial servido de
`/var/www/geladeirastop.com/robots-static.txt` porque o app tem `robots.ts`).
Cabecalho `x-origem: srv1166087` identifica a origem nova.

**Crons no destino** (`/root/scripts-geladeirastop/`): so o backup diario 03:00
ativo. **Anderson mandou deixar o site "quase estatico" em 14/09/2026 (sem
trafego, sem resultado):** RFB mensal, noticias automaticas (DeepSeek), newsletter
e prune ISR estao comentados no crontab com "DESLIGADO 14/09/2026". Nao religar
sem ele pedir. Segredos lidos do `.env.production`, nao de arquivos em /root.

**Na opengravity ficou:** o smoke test (`/root/smoke-test-geladeirastop.sh`,
health agora pelo dominio), a pasta antiga em `/var/www/geladeirastop.com`
(sem PM2, apagar depois de 21/09/2026), crons comentados com "MIGRADO", vhost
Hestia inativo. Uploads orfaos do WordPress (16.706 arquivos, 1,4 GB) estao em
`srv1166087:/srv/backup-engine/geladeirastop-uploads-orfaos-20260914.tar`.

**Pendencia:** o RFB mensal (`update-rfb-mensal.sh`) usa venv Python em
`scripts-locais/` que veio por rsync da opengravity; conferir na 1a execucao
(05/10/2026) se roda no destino.

**Why:** opengravity (2 vCPU) foi limitada pela Hostinger em 14/09; geladeirastop
era o maior consumidor. Ver [[hostinger-cpu-cap-2026-09-14]].
