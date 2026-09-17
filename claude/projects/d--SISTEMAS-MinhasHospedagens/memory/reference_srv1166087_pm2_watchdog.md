---
name: reference_srv1166087_pm2_watchdog
description: "Apps Next no srv1166087 saíam do ar por dias porque deploy deixava o app PM2 'stopped' e nada recuperava; watchdog /opt/pm2-watchdog.sh (cron 2min) auto-restarta apps não-online."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8d9dd106-0331-4431-8d43-88e3c9feee05
---

O **srv1166087** (`hostinger-vps-srv1166087`, HestiaCP, root) hospeda vários apps Next.js migrados em PM2 (pares zero-downtime a/b): **setorenergetico** (3015/3016), **enjai** (3024/3025), além do portal-engine e da plataforma PHP acesso.qmix. Ver [[reference_setorenergetico_next]] e [[reference_acesso_qmix_etc_hosts]].

**INCIDENTE 2026-06-17/18 — setorenergetico.com.br (~8 dias) e enjai.com.br (~3 dias) em HTTP 502.** Causa raiz (diagnóstico definitivo):
- **NÃO foi o servidor**: sem reboot (up 6+ semanas), sem OOM do kernel (dmesg limpo), 25GB RAM livre, disco 23%, `pm2 startup` habilitado, `max_memory_restart=900M`.
- Os apps estavam **`stopped` no PM2**. O `pm2.log` (`/root/.pm2/pm2.log`) mostrava "Stopping app:X ... via signal [SIGINT/SIGKILL]" = **comando `pm2 stop`/`restart` (deploy), não crash espontâneo**. Em algum deploy o app foi parado e **não voltou**.
- **enjai** ainda subiu quebrado: `Error: Cannot find module '.prisma/client/default'` (MODULE_NOT_FOUND) = **deploy sem `prisma generate`** → crashou → ficou stopped. (O `.prisma/client` foi regenerado depois, mas o app continuou parado.)
- **Agravante crítico:** nada recupera um app PM2 parado. O healthcheck (bot Telegram, ver [[reference_site_healthcheck]]) só ALERTA; ninguém AGE → segundos de stop viram dias fora.

**CORREÇÃO DEFINITIVA aplicada (3 camadas):**
1. **Watchdog `/opt/pm2-watchdog.sh`** (cron `*/2 * * * *`): `pm2 jlist` → qualquer app com status ≠ online/launching → `pm2 restart` + `pm2 save`; loga em `/var/log/pm2-watchdog.log`. Auto-recupera QUALQUER causa futura (deploy ruim, crash, stop esquecido). ATENÇÃO: ele reinicia tudo que não está online — se um dia quiser manter um app parado de propósito, excluir do script.
2. **Fix build enjai**: `package.json` → `"build": "prisma generate && next build"` (antes era só `next build`) — evita o MODULE_NOT_FOUND em deploys futuros.
3. **Higiene de deploy (regra)**: deploy deve usar `pm2 reload` (graceful, zero-downtime), NUNCA `pm2 stop`/`restart`/`delete` (regra da rede no CLAUDE.md). Quem faz deploy em "outro computador/chat" precisa seguir isso.

**REPLICADO nos 3 servidores PM2 da rede:** mesmo `/opt/pm2-watchdog.sh` + cron `*/2 * * * *` em **srv1166087**, **opengravity** e **clinicas-vps**. (clinicas-vps: `pm2 jlist` do root mostra 0 apps — apps podem rodar sob outro usuário; verificar se um dia houver alerta de lá.)

⚠️ **BUG CRÍTICO da 1ª versão do watchdog (corrigido 2026-06-18) — ele ficava CEGO no srv1166087.** O `pm2 jlist` nesse servidor imprime um **banner não-JSON antes do array** (`>>>> In-memory PM2 is out-of-date... In memory PM2 7.0.1 vs Local 6.0.14` — daemon em memória diverge do binário). A v1 do parser fazia `pm2 jlist | python json.load` → o banner quebrava o `json.load` → `except: d=[]` → o watchdog achava que NADA estava down → **no-op silencioso, log vazio**. Resultado: setorenergetico caiu de novo (deploy deu `pm2 stop` às 22:41) e o watchdog não recuperou. **FIX:** o parser agora extrai o JSON a partir do primeiro `[` (`raw=stdin.read(); i=raw.find("["); json.loads(raw[i:])`) — robusto a qualquer banner. Ao consertar, o watchdog achou **6 apps parados que ninguém sabia** (setorenergetico/-b, **qmix-next/-b**, **portuga/-b** = portugaldigital) + 2 errados (bot-api-1/bot-rest-1 com erro real de código). Lição: SEMPRE testar que o watchdog realmente loga/recupera, não só instalar. (Opcional: `pm2 update` no srv1166087 limpa o banner e o mismatch de versão, mas recarrega TODOS os apps — fazer em janela calma.)

**O STOPPER recorrente:** um **deploy** (provavelmente do "outro computador/chat") emite `pm2 stop setorenergetico setorenergetico-b` (SIGINT no pm2.log) e não reinicia. Não é cron (crontab limpo). O servidor tem deploy ativo (apps bot-sae-* criados recentemente). O watchdog corrigido é a rede de segurança (recupera em ≤2min); o fix de raiz é o deploy usar `pm2 reload` e nunca deixar app stopped.

**Restart manual de emergência:** `ssh hostinger-vps-srv1166087 "pm2 start <app> <app>-b && pm2 save"` (apps param em `/var/www/<app>`, ecosystem.config.cjs).
