---
name: vps-reboot-pm2-dump-stale
description: "Reinício da VPS srv1166087 (16/10/2026): o dump do PM2 estava velho e metade dos sites não voltou; checklist pós-reboot e causa raiz"
metadata:
  node_type: memory
  type: project
  originSessionId: 87bf0b54-5114-498b-8472-92aefb2139f1
  modified: 2026-10-16T13:32:00.357Z
---

Em 16/10/2026 a Hostinger reiniciou a VPS srv1166087 (patch de kernel, manutenção de emergência).
Depois do boot o qmix.com.br e mais ~10 sites ficaram em 502 por dois motivos:

1. **`/root/.pm2/dump.pm2` estava desatualizado**: não tinha `qmix-next`, `casasrec`, `masterjuris`,
   `goiania-web`, `personalverificado`, `cartorio-web`, `bitcao-web`, `cirurgiadacatarata-web`,
   `cirurgiadecancer-web`, `medicinageriatrica-web`, `backlinkguard-web`, `facoqr-*`, `cliquex-a`,
   `advdobrasil`, `ptdf`, `qmiximoveis`, `geladeiras-top`, `cortes-*`, `contadores`,
   `desassossegada-dir`, `sms-worker`, `bgutil-pot`. Ninguém rodava `pm2 save` depois dos deploys.
2. **`/etc/systemd/system/pm2-root.service` apontava para o PM2 v6 de `/usr/local/lib/node_modules`**,
   enquanto o daemon real é o PM2 v7 do nvm (`/root/.nvm/versions/node/v20.20.2`). A unidade ficava em
   loop ("Can't open PID file /root/.pm2/pm2.pid") rodando `pm2 resurrect` a cada 5 s. Corrigido no dia:
   caminhos trocados para o PM2 do nvm (backup `pm2-root.service.bak-20261016`), pid gravado à mão.

Fonte de verdade usada para recompor: `/root/.pm2/dump.pm2.antes-b-off-20260914` (lista completa com
portas e cwd). Regra desde 14/09: só a instância principal fica online; as `-b` ficam paradas e servem
ao deploy. Apps deixados parados de propósito: `radar-*`, `danfe-web`, `masterjuris-checklinks`, `editoras-web`
(sem diretório). `pm2 save` foi rodado ao final com a lista completa.

**Why:** reboot da hospedagem é raro e, sem dump atualizado, a volta depende de alguém lembrar de cada app.

**How to apply:**
- Depois de QUALQUER `pm2 start/delete` ou deploy que recrie app: `pm2 save`.
- Pós-reboot: `ss -ltn` × portas dos `proxy_pass` em `/etc/nginx/sites-enabled` mostra o que falta;
  `systemctl status pm2-root` precisa estar `active`, não `activating`.
- Se o pid sumir de novo: `pgrep -f "God Daemon" > /root/.pm2/pm2.pid` e `systemctl daemon-reload`.
- Disco estava em 350/400 GB (88%) nesse dia; limpar antes que trave outro boot.
- Ver também [[qmix-deploy-atomico]] e [[ssh-cofre-e-fail2ban]].
