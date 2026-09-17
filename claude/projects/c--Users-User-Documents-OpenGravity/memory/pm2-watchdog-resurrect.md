---
name: pm2-watchdog-resurrect
description: VPS opengravity tem /opt/pm2-watchdog.sh no cron que ressuscita apps pm2 parados a cada 2 min
metadata: 
  node_type: memory
  type: reference
  originSessionId: 9e3d727b-f10a-4e01-a65f-ff67464848d4
  modified: 2026-07-24T15:21:37.221Z
---

Na VPS opengravity (77.37.69.175), o cron do root roda `*/2 * * * * /opt/pm2-watchdog.sh`. O script dá `pm2 restart <app>` em qualquer app cujo status não seja "online"/"launching" (log em /var/log/pm2-watchdog.log).

Consequência: `pm2 stop <app>` NÃO mantém o app parado — o watchdog o traz de volta em até 2 min. Para parar de verdade (ex: debugar o bot), comentar a linha do cron primeiro:
`crontab -l | sed 's|^\*/2 .*pm2-watchdog.*|#&|' | crontab -`
e religar depois com o sed inverso. Ou usar `pm2 delete` (o watchdog só reinicia o que está no dump, não recria apps deletados).

Relacionado: [[ghost-bot-instance-409]].
