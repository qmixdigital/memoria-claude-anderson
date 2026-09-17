---
name: reference_ratelimit_nginx_zona_chave
description: Rate limit do Nginx no srv1166087 estrangulou visitante real e o crawler do AdSense; e a armadilha de que trocar a chave de uma limit_req_zone exige renomear a zona (o reload é rejeitado embora nginx -t passe)
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-04T14:08:03.976Z
---

**Armadilha do Nginx (vale para qualquer servidor):** mudar a *chave* de uma `limit_req_zone` já existente (ex: `$binary_remote_addr` → `$rl_key`) **não entra por reload**. O `nginx -t` passa, o `systemctl reload` retorna sucesso, mas o master rejeita com `[emerg] limit_req "ZONA" uses the "$X" key while previously it used the "$Y" key` e mantém os workers antigos — a mudança fica silenciosamente inativa. Solução sem downtime: **renomear a zona** (`nextjs_ip` → `nextjs_rl`) no arquivo da zona e nos vhosts que a referenciam. Só restart do nginx resolveria mantendo o nome, e isso derruba conexão de todos os sites. Sempre conferir `ps -eo lstart -C nginx` depois do reload: worker antigo = config não aplicada.

**Incidente 04/08/2026 (srv1166087):** o hardening de 28/07 (ver [[reference_srv1166087_pm2_watchdog]] e a skill `vps-security-hardening`) aplicou `rate=5r/s burst=15` no `location /` de 20 vhosts Next.js — incluindo arquivos estáticos. Uma página Next dispara 25-30 requests em paralelo (prefetch `_rsc` + `/_next/static/`), então navegação normal estourava:
- 27.461 respostas 429; 1.139 IPs distintos, **1.132 com UA de navegador real** (876 deles com ≤20 hits = sessão comum)
- 71% dos 429 eram prefetch `_rsc=`
- **24 bloqueios do Mediapartners-Google** (crawler do AdSense) em setorenergetico
- jail `recidive` (`iptables-allports`, ban 7 dias) pegou visitante legítimo e **derrubou o SSH do operador** — SSH dando timeout de um IP que navegou nos sites é sintoma disso

Correção final: mapa de isenção (crawler legítimo + estático → chave vazia = sem limite) + `rate=20r/s`, zona renomeada para `nextjs_rl`; jails afrouxadas (`nginx-limit-req` 15→40 hits, ban 30→15min; `recidive` 3→5, 7d→24h). Config versionada em `D:\SISTEMAS\MinhasHospedagens\scripts\srv1166087-00-nextjs-ratelimit.conf`.

**Validar Googlebot pela origem, não por curl:** `curl -A Googlebot https://site` dando **403 é esperado e correto** — o Cloudflare barra bot falsificado (o IP não é do Google). A verificação honesta é `grep Googlebot` no access log da origem e conferir que os hits de `66.249.x.x` voltam 200/301/304. Foi assim que se descartou falso alarme em qmix.com.br.

**Onde existe rate limit na rede:** srv1166087 (corrigido) e clinicas-vps (`rate=10r/s`, já tinha o mapa de bots bons, 0 respostas 429 — sem problema). opengravity e renato-novo não têm `limit_req`.
