---
name: cliquex-alertas-telegram
description: "Sistema de alertas Telegram do CLIQUEX (bot cliquex_monitor_bot) — negócio + infraestrutura"
metadata:
  node_type: memory
  type: project
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-07-26T14:59:02.322Z
---

O CLIQUEX manda alertas no Telegram via bot **@cliquex_monitor_bot**. Config em **`/root/.cliquex-tg`** (`TG_TOKEN` + `TG_CHAT_ID`, chat 7139...). Envio: `/usr/local/bin/cliquex-tg-notify "<msg HTML>"`. Cron: `/etc/cron.d/cliquex-alerts`. Log: `/var/log/cliquex-tg.log`.

**MIGRADO em 2026-07-26**: os scripts rodavam no **servidor ANTIGO** (`ssh cliquex`) consultando o **banco local dele** — que ficou **congelado** desde a migração pro Hetzner (ver [[cliquex-deploy]]). Ou seja, os relatórios horários estavam mostrando dados velhos. Movidos pro servidor **novo** (`ssh cliquex-new`, que tem o banco vivo); o cron do antigo foi desativado (`/etc/cron.d/cliquex-alerts` → `/root/cliquex-alerts.disabled`). O servidor novo teve o **timezone setado pra America/Sao_Paulo** (`timedatectl set-timezone`) pra os horários do cron baterem (era Etc/UTC).

Scripts em `/usr/local/bin/` (rodam como root via cron; consultam `sudo -u postgres psql -d cliquex_db`):
- **cliquex-tg-hora** (0 15-23h): cliques/hora + por plataforma + acumulado + invasores bloqueados.
- **cliquex-tg-resumo-diario** (08:00): total do dia anterior.
- **cliquex-tg-queda** (*/30, 8-22h): alerta se 0 cliques em 30min (flag `/var/run/cliquex-queda-alerted`).
- **cliquex-tg-pico** (*/15): alerta se última hora > 3× média 24h.
- **cliquex-tg-semanal** (seg 09:00): heartbeat semanal.
- **cliquex-tg-infra** (*/2, NOVO 2026-07-26): saúde de infra, alerta só na MUDANÇA de estado (flags em `/var/run/cliquex-infra/`): origem fora do ar (curl `/health` local), sincronização edge→banco atrasada (MAX `ultimoCheck` dos links > 6min), destino em failover (`links.online=false`), memória > 92%.
- O **watchdog** (`/usr/local/bin/cliquex-watchdog.sh`, cron 1min) agora também **notifica no Telegram** quando reinicia o nginx.

**CUIDADO CRÍTICO**: qualquer curl de health-check que bata na origem `cliquex.click` **precisa de User-Agent de NAVEGADOR** — o vhost tem `if ($is_bot) return 444` e o regex barra `curl`, `monitor`, `uptime`, `bot`, etc. UA com essas palavras → 444 → HTTP 000 → **falso positivo** de "origem fora do ar" (aconteceu no 1º deploy do infra com UA "Mozilla/5.0 (monitor)"). Usar `-A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'`.

**PENDENTE**: o honeypot + **fail2ban jail `cliquex-honeypot` NÃO foi migrado** pro servidor novo (só existe o jail `sshd`). Por isso "invasores bloqueados / banidos ativos" nos relatórios mostram **0**. A proteção real hoje é firewall Hetzner (443 só CF) + rate-limit CF + edge (ver [[cliquex-ddos-hardening]]); se quiser o contador de volta, reconstruir o honeypot/fail2ban no novo. Ver [[cliquex-worker-rotador]].

**GOTCHA — CRON_TZ é IGNORADO pelo cron do Debian/Ubuntu (2026-08-16)**: os alertas Telegram estão em `/etc/cron.d/cliquex-alerts` no srv1166087 (servidor UTC). Tinha `CRON_TZ=America/Sao_Paulo` no topo, MAS o `cron 3.0pl1` do Debian/Ubuntu NÃO honra CRON_TZ (só cronie/Fedora honra) → disparava em UTC (confirmado no journalctl: rodava 15:00-23:00 UTC = SP 12h-20h, "terminava cedo"). O script `cliquex-tg-hora` em si já usa `TZ=America/Sao_Paulo` no label e no acumulado (SP correto). Fix: remover CRON_TZ e escrever os horários em UTC já convertidos p/ SP (SP=UTC-3). Novo agendamento: horário `0 0-2,15-23 * * *` (SP 12h-23h, termina na última hora do dia SP); resumo diário `0 11 * * *` (SP 08h); semanal `0 12 * * 1` (SP seg 09h). Intervalos (*/30,*/15,*/2) não dependem de TZ. Backup: `/etc/cron.d/cliquex-alerts.bak-20260816`. **Regra:** neste servidor, sempre expressar cron de horário fixo em UTC (nunca confiar em CRON_TZ).
