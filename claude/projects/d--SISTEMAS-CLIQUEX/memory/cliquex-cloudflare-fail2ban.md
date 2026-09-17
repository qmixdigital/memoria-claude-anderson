---
name: cliquex-cloudflare-fail2ban
description: CLIQUEX está atrás da Cloudflare; fail2ban NÃO pode banir faixas Cloudflare (causa ERR_TIMED_OUT global)
metadata: 
  node_type: memory
  type: project
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
---

cliquex.click está atrás da Cloudflare (proxied). Todo tráfego legítimo chega na origem (VPS `ssh cliquex`) vindo de IPs de edge da Cloudflare.

CILADA que já derrubou o site (ERR_TIMED_OUT intermitente): o jail `cliquex-honeypot` do fail2ban (`/etc/fail2ban/jail.d/cliquex-honeypot.conf`, action `iptables-allports`, lê os pm2 error logs) estava banindo as edges da Cloudflare, porque o Nginx não tinha `real_ip` e enxergava o IP da edge como cliente. Banir uma edge = todos os usuários daquela edge tomam timeout.

Correção aplicada em 2026-07-17 (deve permanecer):
1. `ignoreip` do jail inclui TODAS as faixas Cloudflare (v4+v6, de https://www.cloudflare.com/ips/). Nunca remover.
2. Nginx `real_ip` da Cloudflare em `/etc/nginx/conf.d/cloudflare-realip.conf` (`set_real_ip_from` faixas CF + `real_ip_header CF-Connecting-IP`).

Se o site der ERR_TIMED_OUT de novo mas o app responder 302 no localhost (`curl 127.0.0.1:3005/`) e o ponteiro subir: NÃO é o app. Cheque `fail2ban-client status cliquex-honeypot` por IPs Cloudflare banidos e desbanie. Ver [[cliquex-deploy]].
