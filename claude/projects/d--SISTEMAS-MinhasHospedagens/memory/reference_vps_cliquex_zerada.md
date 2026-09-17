---
name: reference_vps_cliquex_zerada
description: "VPS cliquex (45.142.141.184) foi zerada em 11/08/2026; hardware fraco e lento, evitar projetos Next nela"
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-11T15:26:54.655Z
---

A VPS `cliquex` (alias SSH `cliquex`, user `deploy`, 45.142.141.184) foi **zerada
em 11/08/2026** a pedido do Anderson: sem sites, sem apps, sem banco. Ficou só
nginx com o `default`, PostgreSQL vazio, PM2 com o logrotate e o bun instalado.
Disco 3,8 GB de 28 GB.

**O que existia lá e para onde foi:** 29 sites HTML estáticos + o rotador
`cliquex.click`. Os 29 já estavam servidos pelo **Cloudflare Pages** (assinatura
`Access-Control-Allow-Origin: *` + sem servidor de origem) e o app do rotador já
rodava no **srv1166087** (`/var/www/cliquex`, pm2 `cliquex-a`/`cliquex-b`). O
banco do srv1166087 recomeçou do zero — o histórico antigo de cliques só existe
no dump do backup.

**Backup completo em** `D:\SISTEMAS\MinhasHospedagens\cliquex-vps\backup-20260811\`
(dump do `cliquex_db`, tar dos 29 sites, nginx, app).

**Por que ela estava morta:** nginx caiu por **OOM em 25/07/2026 22:02** durante
um flood L7 no `jornalcidademg.com.br` (querystrings aleatórias `/?q=XXXX` de
centenas de IPs v4 e v6, 3,8 GB de access log em poucas horas). Ninguém percebeu
por 17 dias porque os domínios já estavam no Pages.

**Hardware — o motivo de não valer projeto de produção:** Xeon E5-2650L v2
@1,70 GHz (2013), virtualização **LXC** (não KVM), 3 GB de RAM, 28 GB de disco
Ceph. Benchmark RSA2048: **430 sign/s contra ~3.000 do EPYC 9354P** do
opengravity/srv1166087 e 1.220 da clinicas-vps — 7x mais lenta por core. Com
3 GB, build de Next.js arrisca OOM.

Ver [[reference_srv1166087_pm2_watchdog]] e
[[reference_clinicas_vps_desentupidora]] para os destinos alternativos.
