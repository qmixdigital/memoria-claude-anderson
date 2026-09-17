---
name: backup-do-motor-e-o-cofre
description: o que entra no backup do portal-engine, por que o HTML fica de fora, e onde a automação mora
metadata:
  type: project
---

Desde 24/08/2026 as três máquinas do motor fazem backup sozinhas, de madrugada, e
mandam para a **hostinger (`31.97.173.40`), que é o cofre** — é a que tem disco
sobrando (387 GB, 210 livres).

Entra o que **não se regenera**: `sites.json`, `src/` do motor, `data/` de cada
portal, `public/img/`, `public/paginas/` e os vhosts do nginx. Fica de fora o
**HTML gerado em `public/`**, que são 1,8 GB e se refazem inteiros com
`runuser -u portais -- node /tmp/reb.js <slug>`. Guardar HTML derivado dobraria o
pacote sem acrescentar nada.

Total: **2,04 GB** comprimidos, 97 portais, 41.577 artigos, 48.406 imagens.

- VPS: `/opt/portal-engine/backup_engine.sh`, por `/etc/cron.d/portal-backup`
  (03:00 hostinger, 03:20 opengravity, 03:40 clinicas), log em
  `/var/log/portal-backup.log`
- Local: `D:\PORTAIS\backup\puxar.ps1`, Tarefa Agendada `PortalEngine-Backup`,
  segunda 09:00. Rodízio de 7 diárias mais os domingos de 60 dias.

**Why:** duas armadilhas já custaram tempo e estão comentadas no script:
`ls /srv/portais/*/data/*.json | wc -l` estoura o limite de argumentos com 35
portais e devolve **zero sem erro nenhum**; e filtrar só `.bak` deixa entrar as
cópias `.bal-*` que um script antigo gravou.

**How to apply:** ao restaurar, o `chown -R portais:portais /srv/portais` não é
opcional — ver [[arquivo-com-dono-root-quebra-o-rebuild]]. O contrato do pacote
está em `D:\PORTAIS\backup\README.md`.
