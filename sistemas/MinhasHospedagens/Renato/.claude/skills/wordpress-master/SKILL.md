---
name: wordpress-master
description: Use when administering, troubleshooting or optimizing WordPress/WooCommerce sites running on Easypanel+Traefik VPS. Covers PHP-FPM tuning, fail2ban/security, plugin conflicts, WP-CRON, XMLRPC attacks, backups, database performance. Triggered by /wordpress-master or any WordPress administration question in this project.
---

# WordPress Master — Administração avançada (projeto Renato / seguidoresbrasil)

Especialista em WordPress + WooCommerce em produção, focado no stack específico deste cliente:
**VPS Ubuntu + Easypanel (Docker Swarm) + Traefik v3 + MariaDB + PHP-FPM 8.3**.

Todo contexto histórico, incidentes, credenciais e fixes aplicados estão documentados em [servidor-seguidoresbrasil.md](../../../servidor-seguidoresbrasil.md) — **sempre leia este arquivo antes de agir** no servidor.

## Contexto do ambiente

- **4 sites WordPress** gerenciados no mesmo servidor:
  - `seguidoresbrasil.com.br` (container `sites_seguidores`) — loja principal
  - `seguidoresdigital.com.br` (container `seguidoresdigital_seguidoresdigital`)
  - `comprarlikes.com.br` (container `comprarlikes_comprarlikes`)
  - `impulsionagram.com.br` (container `impulsionagram_impulsionagram`)
- Todos rodam **WooCommerce** + **Mercado Pago** + **Rank Math** + **UpdraftPlus** + plugin custom **Smmloja**
- Proxy: **Traefik** em `/etc/easypanel/traefik/config/` — `main.yaml` é gerenciado pelo Easypanel, **mexer apenas em `custom.yaml`**
- SSH: `plink -ssh <<REMOVIDO>>' root@216.238.114.80`
- Painel: https://eyabq7.easypanel.host/

## Princípios

1. **Nunca editar arquivos dentro do container sem persistência**: se editar via `docker exec`, o próximo deploy/rebuild do Easypanel apaga. Persistir via **Scripts do Easypanel** (cron idempotente) ou via **Mount bind** quando disponível.
2. **Sempre fazer backup antes de editar `wp-config.php`, pool PHP-FPM, ou qualquer arquivo crítico**: `cp -a arquivo arquivo.bak-$(date +%Y%m%d-%H%M%S)`.
3. **Reload graceful, nunca restart bruto**: PHP-FPM usa `kill -USR2 $(cat /run/php/php8.3-fpm.pid)`; Traefik recarrega automaticamente ao detectar mudança em `custom.yaml`; fail2ban usa `fail2ban-client reload`.
4. **Bloquear ataques na borda (Traefik), não no WordPress**: um middleware Traefik retornando 403 em 0ms é sempre melhor que um plugin que consome um worker PHP-FPM para devolver 403.
5. **Português brasileiro** em todo conteúdo voltado a usuário; inglês em código.
6. **Respeitar as regras globais do usuário** em `C:\Users\User\.claude\CLAUDE.md` (SEO, acentuação, linkagem cruzada, deploy zero-downtime).

## Fluxo de trabalho ao ser acionado

1. **Leia** `servidor-seguidoresbrasil.md` na raiz do projeto para contexto atual (histórico de incidentes, configs aplicadas, credenciais).
2. **Identifique** o escopo: qual site, qual sintoma, quais logs.
3. **Investigue** via SSH antes de propor solução: logs do Traefik (`docker logs --since Xh $(docker ps --filter name=^traefik\\. --format '{{.Names}}')`), logs do PHP-FPM (`docker exec <wp-container> tail /var/log/php8.3-fpm.log`), logs nginx do container, status do fail2ban/monit.
4. **Para mudanças de risco** (SSH port, Docker restart, migrações), apresente plano e peça confirmação.
5. **Aplique** em sequência segura: backup → edição → validação (test config) → reload graceful → verificação externa (`curl -sk -o /dev/null -w '%{http_code}' https://dominio/`).
6. **Documente** em `servidor-seguidoresbrasil.md` (nova entrada no histórico seção 17, nova seção de incidente se aplicável).

## Padrões de diagnóstico rápido

### Site lento ou 5xx
```bash
# Traefik: top IPs externos, status codes, endpoints com flood
T=$(docker ps --filter name=^traefik\\. --format '{{.Names}}' | head -1)
docker logs --since 1h $T 2>&1 | awk '{print $1}' | grep -vE '^(172\.|10\.|127\.|-|216\.238\.114\.80)' | sort | uniq -c | sort -rn | head -20
docker logs --since 1h $T 2>&1 | grep -oE 'HTTP/[0-9.]+" [0-9]{3}' | awk '{print $2}' | sort | uniq -c
docker logs --since 1h $T 2>&1 | grep POST | grep -oE '"POST [^ ]+' | sort | uniq -c | sort -rn | head -10

# PHP-FPM saturação
C=$(docker ps --filter name=^sites_seguidores\\. --format '{{.Names}}' | head -1)
docker exec $C tail -50 /var/log/php8.3-fpm.log | grep -i max_children
```

### Ataque brute-force
```bash
fail2ban-client status
fail2ban-client status sshd
fail2ban-client status traefik-wp-auth
fail2ban-client status traefik-admin-ajax-flood
iptables -L f2b-wpauth -n --line-numbers | head -20
```

### Banir IP manualmente
```bash
fail2ban-client set traefik-wp-auth banip <IP>
fail2ban-client set sshd banip <IP>
```

### wp-config.php hardening padrão
Adicionar antes do marker `/* That's all, stop editing! Happy publishing. */`:
```php
if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) define( 'DISALLOW_FILE_EDIT', true );
if ( ! defined( 'WP_POST_REVISIONS' ) )  define( 'WP_POST_REVISIONS', 5 );
if ( ! defined( 'EMPTY_TRASH_DAYS' ) )   define( 'EMPTY_TRASH_DAYS', 14 );
if ( ! defined( 'WP_AUTO_UPDATE_CORE' ) ) define( 'WP_AUTO_UPDATE_CORE', 'minor' );
if ( ! defined( 'DISABLE_WP_CRON' ) )    define( 'DISABLE_WP_CRON', true );
```
(DISABLE_WP_CRON requer cron do sistema em `/usr/local/sbin/wp-cron-all.sh` — já existe).

### PHP-FPM pool (valores-base para 4 sites WC em 12 GB RAM)
```
pm = dynamic
pm.max_children = 50
pm.start_servers = 8
pm.min_spare_servers = 5
pm.max_spare_servers = 15
pm.max_requests = 500
```
Aplicar via: script idempotente no módulo **Scripts do Easypanel** (cron `* * * * *`) que reescreve `/etc/php/8.3/fpm/pool.d/www.conf` e dá `kill -USR2`. Modelo está em `servidor-seguidoresbrasil.md` seção 4.7.

### Traefik — regras que devem ficar em `custom.yaml`
Middleware `block-all` (ipAllowList com 127.0.0.1 = 403 para tudo) + router `PathPrefix(/xmlrpc.php)` com `priority: 1000000` bloqueia XMLRPC em TODOS os sites a custo zero.

Para rate limit, middleware `wp-ratelimit` (`rateLimit: average=30 period=1m burst=60 sourceCriterion.ipStrategy.depth=1`) aplicado em rotas `PathPrefix(/wp-login.php)`.

> Se Cloudflare proxy for ativado na frente, trocar `ipStrategy.depth: 1` por `requestHeaderName: X-Forwarded-For` — senão rate limit limita o próprio Cloudflare.

## Armadilhas conhecidas (não repetir)

- **`docker_gwbridge` bloqueado pelo UFW** quebra o site quando há vários containers (regra em `DOCKER-USER`: `iptables -I DOCKER-USER 1 -i docker_gwbridge -j ACCEPT`, já persistida em `/usr/local/sbin/docker-user-rules.sh`).
- **monit com `set mailserver localhost`** não envia nada — deve apontar direto para `smtp.resend.com:587 using tlsv13`.
- **fail2ban datepattern `{^LN-BEG}`** não funciona com logs JSON do Docker — usar `%Y-%m-%dT%H:%M:%S` (ISO do wrapper JSON).
- **Easypanel WordPress template não tem aba Mounts** — persistência de configs só via módulo Scripts (cron idempotente).
- **Action Scheduler self-loop**: WordPress faz POST em `admin-ajax.php?action=as_async_request_queue_runner` para processar filas; se filas acumulam, satura PHP-FPM. Solução: `DISABLE_WP_CRON=true` + cron do sistema chamando wp-cron.php a cada minuto.
- **Não banir IPs do Cloudflare por engano** se o cliente ativar proxy CF — ajustar fail2ban para extrair IP real do `X-Forwarded-For`.
- **Não rebootar `sshd` sem testar nova porta em paralelo** — risco de perder acesso.
- **Nunca usar `pm2 restart`**, sempre `pm2 reload` (padrão global do usuário para zero-downtime).

## Checklist antes de considerar trabalho concluído

- [ ] Mudança aplicada em runtime (docker exec / systemctl / fail2ban-client)
- [ ] Mudança persistente (Script Easypanel, systemd unit, arquivo no host fora do container)
- [ ] Backup do arquivo original criado
- [ ] Site testado externamente: `curl -sk -o /dev/null -w '%{http_code} %{time_total}s\n' https://<dominio>/`
- [ ] Status dos serviços verificado: `monit summary`, `fail2ban-client status`, `docker ps`
- [ ] Entrada nova no histórico em `servidor-seguidoresbrasil.md`

## Referências do projeto

- [CLAUDE.md global](file:///C:/Users/User/.claude/CLAUDE.md) — regras de SEO, linkagem, acentuação, deploy
- [servidor-seguidoresbrasil.md](../../../servidor-seguidoresbrasil.md) — histórico completo, credenciais, configs
- Resend API key (sending): `<<REMOVIDO>>` (não expor em repo)
