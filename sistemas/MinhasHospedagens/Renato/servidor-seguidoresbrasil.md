# Servidor — seguidoresbrasil.com.br (cliente Renato)

> Documentação completa da auditoria e otimizações aplicadas em **2026-04-08** e **2026-04-12**.
> Todas as informações abaixo são para referência futura em manutenções/otimizações.

---

## 1. Acesso

| Item | Valor |
|---|---|
| Host | `216.238.114.80` |
| Hostname | `seguidoresbrasil` |
| OS | Ubuntu (kernel 6.8.0-107) |
| RAM | 12 GB |
| Disco | 244 GB (29 GB usados, 13%) |
| Usuário SSH | `root` |
| Senha SSH | `6V=fv+JENkFMi_2W` |
| Conexão (Windows/PuTTY) | `plink -ssh <<REMOVIDO>>' root@216.238.114.80` |
| Host key fingerprint | `SHA256:<<REMOVIDO>>` |

> ⚠️ **Sensível** — não versionar este arquivo em repositório público.

---

## 2. Stack do servidor

Servidor gerenciado pelo **Easypanel** (Docker Swarm), com:

| Container | Imagem | Função |
|---|---|---|
| `traefik.1.*` | `traefik:3.6.7` | Reverse proxy + Let's Encrypt + roteamento |
| `easypanel.1.*` | `easypanel/easypanel:latest` | Painel de controle (porta 3000 interna) |
| `sites_seguidores.1.*` | `easypanel/sites/seguidores` (custom) | WordPress + WooCommerce + plugin custom Smmloja |
| `sites_seguidoresbrasil-db.1.*` | `mariadb:11` | Banco de dados |
| `sites_seguidoresbrasil-db_phpmyadmin.1.*` | `phpmyadmin:5.2.1` | phpMyAdmin |
| `seguidoresdigital_seguidoresdigital.1.*` | custom | WordPress — seguidoresdigital (adicionado ~2026-04-09) |
| `seguidoresdigital_seguidoresdigital-db.1.*` | DB | Banco seguidoresdigital |
| `comprarlikes_comprarlikes.1.*` | custom | WordPress — comprarlikes (adicionado ~2026-04-09) |
| `comprarlikes_comprarlikes-db.1.*` | DB | Banco comprarlikes |
| `comprarlikes_comprarlikes-db_phpmyadmin.1.*` | `phpmyadmin` | phpMyAdmin comprarlikes |
| `impulsionagram_impulsionagram.1.*` | custom | WordPress — impulsionagram (adicionado ~2026-04-09) |
| `impulsionagram_impulsionagram-db.1.*` | DB | Banco impulsionagram |
| `impulsionagram_impulsionagram-db_phpmyadmin.1.*` | `phpmyadmin` | phpMyAdmin impulsionagram |

**Domínios servidos pelo Traefik:**
- `seguidoresbrasil.com.br` → WordPress (público)
- `eyabq7.easypanel.host` → painel Easypanel (autenticado)
- `traefik.eyabq7.easypanel.host` → dashboard Traefik (autenticado)
- `sites-seguidoresbrasil-db-phpmyadmin.eyabq7.easypanel.host` → phpMyAdmin (autenticado)
- `sites-seguidores.eyabq7.easypanel.host` → site WP via subdomínio do painel
- `sites-seguidores-ide.eyabq7.easypanel.host` → IDE web (autenticado)

**Painel Easypanel:** https://eyabq7.easypanel.host/

---

## 3. Diagnóstico inicial (problema reportado)

**Sintoma**: cliente reclamava de "erro 512" e instabilidade constante.

**Causa raiz identificada**:
- HTTP 512 não existe — era **502 Bad Gateway** que o cliente confundiu
- Origem real: **PHP-FPM com `pm.max_children = 5`** dentro do container WP (default da imagem Easypanel)
- Em ~12h foram registradas **28 ocorrências** de `WARNING: server reached pm.max_children setting (5)` no log do FPM
- Quando o pool saturava, novas requisições enfileiravam ou viravam 502 no Traefik
- O servidor tem 12 GB de RAM e usava só 1.3 GB — totalmente subdimensionado em PHP-FPM

**Outros problemas encontrados**:
- Sem `fail2ban` instalado, com brute-force ativo no `wp-login.php` (`83.229.86.225` e outros)
- Painel Easypanel exposto publicamente em `0.0.0.0:3000`
- Sem rate limiting no Traefik para rotas sensíveis
- 1 GB de imagens Docker recicláveis + 1 container morto (`Exited 143`)
- UFW só permitia porta 22 (Docker bypassava via iptables `DOCKER` chain — funcional mas frágil)
- Sem `unattended-upgrades`
- Sem alertas/monitoramento

---

## 4. Correções aplicadas

### 4.1 Limpeza Docker
- `docker system prune -f` → removido container `Exited 143` e imagens dangling

### 4.2 fail2ban
- Instalado e ativo, com 2 jails:

| Jail | Filtro | maxretry | findtime | bantime | Action |
|---|---|---|---|---|---|
| `sshd` | nativo | 5 | 10m | 1d | iptables-multiport + email |
| `traefik-wp-auth` | custom (regex sobre logs JSON do Traefik) | 8 | 10m | 6h | docker-user (DOCKER-USER chain) + email |

**Filtro custom** (`/etc/fail2ban/filter.d/traefik-wp-auth.conf`) lê os logs do container Traefik (`/var/lib/docker/containers/*/*-json.log`) e detecta POSTs em `/wp-login.php` e `/xmlrpc.php`.

**Action custom** (`/etc/fail2ban/action.d/docker-user.conf`) bloqueia IPs via `iptables -I DOCKER-USER` (necessário porque Docker bypassa o filtro UFW/INPUT padrão). Cria a chain `f2b-wpauth` dentro de DOCKER-USER.

**Action de email** (`/etc/fail2ban/action.d/sendmail-alert.conf`) chama `/usr/local/sbin/send-alert.sh` em todo ban/unban/start/stop.

### 4.3 unattended-upgrades
- Instalado, configurado e habilitado para patches de segurança automáticos.

### 4.4 Hardening WordPress (`wp-config.php`)
Path: `/etc/easypanel/projects/sites/seguidores/code/wp-config.php`
Backup: `wp-config.php.bak-YYYYMMDD-HHMMSS`

Adicionado:
```php
if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) define( 'DISALLOW_FILE_EDIT', true );
if ( ! defined( 'WP_POST_REVISIONS' ) )  define( 'WP_POST_REVISIONS', 5 );
if ( ! defined( 'EMPTY_TRASH_DAYS' ) )   define( 'EMPTY_TRASH_DAYS', 14 );
if ( ! defined( 'WP_AUTO_UPDATE_CORE' ) ) define( 'WP_AUTO_UPDATE_CORE', 'minor' );
```

### 4.5 Rate limit no Traefik
Arquivo separado para não conflitar com os arquivos gerenciados pelo Easypanel:
`/etc/easypanel/traefik/config/custom.yaml`

Cria 2 routers com `priority: 100` que sobrepõem só para `/wp-login.php` e `/xmlrpc.php`, aplicando middleware `wp-ratelimit` (`30 req/min`, burst 60). O fail2ban faz o trabalho pesado de banimento.

> Atenção: se ativarem proxy obrigatório do Cloudflare, ajustar `sourceCriterion` para usar `requestHeaderName: X-Forwarded-For` em vez de `ipStrategy.depth`.

### 4.6 Fechamento da porta 3000 (Easypanel)

Como Docker bypassa UFW e INPUT, a única forma confiável foi inserir regras no chain `DOCKER-USER`:

```bash
iptables -I DOCKER-USER 1 -i lo -j ACCEPT
iptables -I DOCKER-USER 2 -s 127.0.0.1 -p tcp --dport 3000 -j ACCEPT
iptables -I DOCKER-USER 3 -p tcp --dport 3000 -j DROP
```

Persistência via systemd unit `docker-user-rules.service`:
- Unit: `/etc/systemd/system/docker-user-rules.service`
- Script: `/usr/local/sbin/docker-user-rules.sh` (idempotente, usa `iptables -C` antes de inserir)
- Roda após `docker.service`

**Acesso ao painel agora apenas via `https://eyabq7.easypanel.host/`** (não mais via IP:3000).

### 4.7 PHP-FPM tuning (a correção principal)

**Live fix** (dentro do container):
Path: `/etc/php/8.3/fpm/pool.d/www.conf`

| Setting | Default | v1 (2026-04-08) | v2 (2026-04-12) |
|---|---|---|---|
| `pm` | dynamic | dynamic | dynamic |
| `pm.max_children` | **5** | 30 | **50** |
| `pm.start_servers` | 2 | 5 | **8** |
| `pm.min_spare_servers` | 1 | 3 | **5** |
| `pm.max_spare_servers` | 3 | 10 | **15** |
| `pm.max_requests` | (não existia) | 500 | 500 |

> **Por que subiu de 30→50 (2026-04-12)**: cliente deployou 3 novos apps (seguidoresdigital, comprarlikes, impulsionagram). Tráfego aumentou e `max_children=30` foi atingido novamente com log `WARNING: server reached pm.max_children setting (30)` em 10:29 UTC.

Reload graceful via `kill -USR2 $(cat /run/php/php8.3-fpm.pid)` — sem downtime.

**Persistência via Easypanel Scripts** (cron a cada 1 minuto, idempotente):

App `seguidores` → módulo **Scripts** → script ativo chamado `fix-php-fpm-pool`, agendado `* * * * *`, conteúdo:

```bash
#!/bin/bash
F=/etc/php/8.3/fpm/pool.d/www.conf
if grep -q '^pm.max_children = 5$' "$F"; then
  sed -i -E 's/^pm\.max_children\s*=.*/pm.max_children = 50/' "$F"
  sed -i -E 's/^pm\.start_servers\s*=.*/pm.start_servers = 8/' "$F"
  sed -i -E 's/^pm\.min_spare_servers\s*=.*/pm.min_spare_servers = 5/' "$F"
  sed -i -E 's/^pm\.max_spare_servers\s*=.*/pm.max_spare_servers = 15/' "$F"
  grep -q '^pm.max_requests' "$F" || echo 'pm.max_requests = 500' >> "$F"
  kill -USR2 "$(cat /run/php/php8.3-fpm.pid)" 2>/dev/null
  echo "PHP-FPM pool ajustado e recarregado"
else
  echo "PHP-FPM pool ja esta tunado, nada a fazer"
fi
```

**Por que via Scripts?** Easypanel WordPress template não tem aba "Mounts" como apps genéricos. Tentamos via módulo PHP (só expõe `php.ini`, não pool config). Scripts é o caminho oficial — executa no container, sobrevive a rebuild, custo desprezível (cron 1min idempotente).

> **Para ajustar valores no futuro**: editar o conteúdo do script no painel Easypanel, não no SSH. Próximo `kill -USR2` reaplica automaticamente.

---

## 5. Sistema de alertas por email

### 5.1 SMTP — Resend
- Provider: **Resend** (https://resend.com)
- API Key (sending only): `<<REMOVIDO>>`
- Domínio verificado: `seguidoresbrasil.com.br` (DNS via Cloudflare)
- Remetente: `Alertas VPS <alertas@seguidoresbrasil.com.br>`
- Destinatário: `contato@seguidoresbrasil.com.br`
- Limite free: 100/dia, 3000/mês

### 5.2 msmtp (relay SMTP)
- Config: `/etc/msmtprc` (chmod 600)
- Log: `/var/log/msmtp.log`
- Helper: `/usr/local/sbin/send-alert.sh "subject" [body]` — adiciona automaticamente hostname/IP/data

### 5.3 monit (daemon de checks)
- Config principal: `/etc/monit/monitrc`
- Checks: `/etc/monit/conf.d/`
- HTTPD interno: `127.0.0.1:2812` (não exposto)
- Acesso remoto via SSH tunnel: `ssh -L 2812:127.0.0.1:2812 root@216.238.114.80` → `http://localhost:2812`

| Arquivo | Verifica |
|---|---|
| `00-system` | Load (5min>6, 15min>4), CPU>90% 10ciclos, RAM>90%, swap>25% |
| `10-filesystem` | Disco>80% e 90%, inodes>80% |
| `20-services` | Processos: docker, sshd, fail2ban |
| `30-http` | HTTP 443 em `seguidoresbrasil.com.br` e `eyabq7.easypanel.host` (status<400, timeout 15s) |
| `40-ssl` | Cert SSL com <14 dias para expirar (script `check-ssl-expiry.sh`) |
| `50-docker-containers` | Os 5 containers essenciais rodando (script `check-docker-containers.sh`) |
| `60-phpfpm` | PHP-FPM saturando (script `check-phpfpm-saturation.sh` lê o log do FPM dentro do container) |

### 5.4 Watchers em tempo real (systemd services)

| Service | Arquivo | Função |
|---|---|---|
| `docker-events-watcher.service` | `/usr/local/sbin/docker-events-watcher.sh` | Escuta `docker events` e envia email em `die`/`kill`/`oom`/`unhealthy` |
| `oom-watcher.service` | `/usr/local/sbin/oom-watcher.sh` | Tail no `journalctl -k -f`, envia email se aparecer "out of memory" / "killed process" |

### 5.5 SSH login alert
- Script: `/usr/local/sbin/ssh-login-alert.sh`
- Hook PAM: linha em `/etc/pam.d/sshd` → `session optional pam_exec.so seteuid /usr/local/sbin/ssh-login-alert.sh`
- Dispara em todo `PAM_TYPE=open_session` (toda sessão SSH bem-sucedida)

### 5.6 Cobertura de alertas

| # | Alerta | Origem |
|---|---|---|
| 1 | CPU/RAM/swap/load alto | monit |
| 2 | Disco/inodes >80% | monit |
| 3 | docker/sshd/fail2ban parados | monit |
| 4 | Site fora do ar (HTTP fail) | monit |
| 5 | SSL expira em <14d | monit |
| 6 | Container essencial faltando | monit |
| 7 | PHP-FPM saturando pool | monit (custom) |
| 8 | Container die/kill/oom/unhealthy | docker-events-watcher |
| 9 | OOM kernel | oom-watcher |
| 10 | Brute-force SSH (ban) | fail2ban |
| 11 | Brute-force WP-login (ban) | fail2ban |
| 12 | Login SSH bem-sucedido | PAM |

---

## 6. Mapa de arquivos importantes (no servidor)

```
/etc/msmtprc                                          # SMTP Resend (chmod 600)
/var/log/msmtp.log                                    # log de envios

/usr/local/sbin/send-alert.sh                         # helper de envio
/usr/local/sbin/check-ssl-expiry.sh                   # check SSL
/usr/local/sbin/check-docker-containers.sh            # check containers
/usr/local/sbin/check-phpfpm-saturation.sh            # check FPM
/usr/local/sbin/docker-events-watcher.sh              # watcher Docker
/usr/local/sbin/oom-watcher.sh                        # watcher OOM
/usr/local/sbin/ssh-login-alert.sh                    # alerta login SSH
/usr/local/sbin/docker-user-rules.sh                  # regras iptables persistentes

/etc/monit/monitrc                                    # config principal monit
/etc/monit/conf.d/{00,10,20,30,40,50,60}-*            # checks individuais

/etc/fail2ban/jail.d/custom.conf                      # jails sshd + traefik-wp-auth
/etc/fail2ban/filter.d/traefik-wp-auth.conf           # regex de detecção WP
/etc/fail2ban/action.d/docker-user.conf               # action ban via DOCKER-USER
/etc/fail2ban/action.d/sendmail-alert.conf            # action de email

/etc/easypanel/traefik/config/main.yaml               # gerenciado pelo Easypanel — não editar
/etc/easypanel/traefik/config/custom.yaml             # rate limit (criado por nós)
/etc/easypanel/traefik/acme.json                      # certs Let's Encrypt
/etc/easypanel/projects/sites/seguidores/code/        # raiz do WordPress
/etc/easypanel/projects/sites/seguidores/code/wp-config.php
/etc/easypanel/projects/sites/seguidores/www.conf.tuned  # backup do pool tunado

/etc/systemd/system/docker-events-watcher.service
/etc/systemd/system/oom-watcher.service
/etc/systemd/system/docker-user-rules.service

/etc/pam.d/sshd                                       # contém pam_exec do alerta de login
```

---

## 7. Mapa de arquivos dentro do container WordPress

```
/etc/php/8.3/fpm/pool.d/www.conf                      # pool config (TUNADO - 30 workers)
/etc/php/8.3/fpm/pool.d/www.conf.bak-*                # backup do default
/var/log/php8.3-fpm.log                               # log do FPM (onde aparece saturação)
/run/php/php8.3-fpm.pid                               # PID do master FPM
/app/                                                 # raiz do WordPress (= /etc/easypanel/projects/sites/seguidores/code/ no host)
/app/wp-config.php
/app/wp-content/
```

---

## 8. Comandos úteis para diagnóstico futuro

### Conectar
```bash
plink -ssh <<REMOVIDO>>' root@216.238.114.80
```

### Status geral
```bash
docker service ls
docker ps
monit summary
fail2ban-client status
fail2ban-client status traefik-wp-auth
fail2ban-client status sshd
free -h && df -h /
```

### Logs do Traefik (acesso HTTP)
```bash
T=$(docker ps --filter name=^traefik\\. --format '{{.Names}}')
docker logs --since 1h $T 2>&1 | grep -E 'HTTP/[0-9.]+\" 5[0-9]{2}'  # 5xx
docker logs --since 1h $T 2>&1 | tail -50
```

### Logs do PHP-FPM (saturação)
```bash
C=$(docker ps --filter name=^sites_seguidores\\. --format '{{.Names}}')
docker exec $C tail -100 /var/log/php8.3-fpm.log | grep -i max_children
```

### Verificar config do pool
```bash
C=$(docker ps --filter name=^sites_seguidores\\. --format '{{.Names}}')
docker exec $C grep -nE '^pm\.' /etc/php/8.3/fpm/pool.d/www.conf
```

### Forçar reaplicação manual do tuning (caso o script não tenha rodado)
```bash
C=$(docker ps --filter name=^sites_seguidores\\. --format '{{.Names}}')
docker exec $C kill -USR2 "$(docker exec $C cat /run/php/php8.3-fpm.pid)"
```

### Testar envio de email
```bash
/usr/local/sbin/send-alert.sh '[teste] manual' 'Mensagem de teste'
tail /var/log/msmtp.log
```

### Banir/desbanir IP manualmente
```bash
fail2ban-client set traefik-wp-auth banip 1.2.3.4
fail2ban-client set traefik-wp-auth unbanip 1.2.3.4
fail2ban-client set sshd unbanip 1.2.3.4
```

### Listar bans atuais
```bash
fail2ban-client banned
iptables -L f2b-wpauth -n
```

### Ver requisições do site em tempo real
```bash
T=$(docker ps --filter name=^traefik\\. --format '{{.Names}}')
docker logs -f --tail 0 $T 2>&1 | grep seguidores
```

### Reload Traefik / fail2ban / monit
```bash
systemctl reload fail2ban  # ou: fail2ban-client reload
systemctl restart monit
# Traefik recarrega sozinho ao detectar mudança em /etc/easypanel/traefik/config/*.yaml
```

---

## 9. Pontos de atenção / sugestões futuras

1. **Cloudflare proxy**: alguns logs mostram IPs de CF (`104.28.x.x`). Se um dia ativarem o proxy CF totalmente:
   - Ajustar `sourceCriterion` do middleware `wp-ratelimit` no Traefik para `requestHeaderName: X-Forwarded-For`
   - Confirmar que o filtro do fail2ban captura o IP real (depende de onde o XFF entra na string do log)
   - Senão, fail2ban pode acabar banindo IPs do Cloudflare → site fica fora pra parte do tráfego

2. **Backup**: não há backup automatizado configurado no host. O cliente alegou ter feito backup manual antes da auditoria. Vale propor:
   - Backup MariaDB → S3/B2 via cron + `mysqldump`
   - Backup `/etc/easypanel/projects/sites/seguidores/code/wp-content/uploads/` → mesmo destino
   - Plugin **UpdraftPlus** já está instalado no WP — verificar se está agendado

3. **POSTs suspeitos** em `/wp-admin/admin-ajax.php` a cada 30s do IP `38.10.155.73` (status 200, 89 bytes) — pode ser bot legítimo de preço/estoque. Se cliente confirmar que não é, adicionar ao bloqueio.

4. **Login SSH alert**: dispara email a cada conexão SSH (inclusive nossas). Se ficar barulhento, dá pra filtrar IPs confiáveis dentro do `ssh-login-alert.sh` antes de chamar `send-alert.sh`.

5. **Limite Resend free**: 100/dia. ~~Se um surto de bans gerar muitos emails seguidos pode estourar~~ **RESOLVIDO em 2026-04-09**: fail2ban ban/unban emails silenciados, substituídos por resumo diário (cron `0 11 * * *`).

6. **Persistência do tuning PHP-FPM**: hoje depende do cron Easypanel rodar a cada 1 min. Se um dia o cron parar ou o Easypanel tiver bug, o script não rodará. Monitor `phpfpm-saturation` do monit detecta isso indiretamente (vai disparar alerta se voltar a saturar).

7. **MariaDB tuning**: não foi mexido. Se voltar a haver lentidão e PHP-FPM estiver folgado, próximo suspeito é o banco — analisar slow query log e ajustar `innodb_buffer_pool_size`.

8. **Easypanel atualização**: o Easypanel tem updates frequentes. Se o cliente atualizar, vale revisar se mudou estrutura de paths/configs.

---

## 10. Histórico

| Data | Ação |
|---|---|
| 2026-04-08 | Auditoria inicial, achados de segurança |
| 2026-04-08 | docker prune, fail2ban (sshd + WP), unattended-upgrades |
| 2026-04-08 | Rate limit Traefik, fechamento porta 3000, hardening wp-config |
| 2026-04-08 | Sistema completo de alertas (msmtp+Resend, monit, watchers, fail2ban-email, ssh-login-alert) |
| 2026-04-08 | **Identificado problema raiz**: `pm.max_children=5` no PHP-FPM saturando 28x em 12h |
| 2026-04-08 | PHP-FPM tunado live (30 workers), persistência via Easypanel Scripts (cron 1min) |
| 2026-04-09 | fail2ban emails silenciados (ban/unban geravam 170+/dia), substituídos por **resumo diário** às 8h BRT |
| 2026-04-12 | **Incidente**: site fora 16min (04:24-04:42 BRT) — causa: UFW bloqueando `docker_gwbridge` no FORWARD chain |
| 2026-04-12 | Fix: regra `ACCEPT docker_gwbridge` em `DOCKER-USER` + `ufw allow in on docker_gwbridge` + `ufw allow from 172.16.0.0/12` |
| 2026-04-12 | Fix: monit email trocado de `localhost:25` (falhava) para `smtp.resend.com:587` direto |
| 2026-04-12 | PHP-FPM subido de 30→**50** workers (3 novos apps deployados pelo cliente saturaram o pool) |
| 2026-04-12 | Persistência atualizada em `docker-user-rules.sh` + script Easypanel precisa ser editado pelo cliente |

---

## 11. Incidente 2026-04-12: Queda de 16 minutos

### Sintoma
- Site `seguidoresbrasil.com.br` inacessível das 04:24 às 04:42 BRT (07:24-07:42 UTC)
- Monitor externo reportou "Connection Timeout" de Ohio, Dallas e Ashburn (EUA)
- Monit local também detectou (`failed protocol test [HTTP] -- Connection timed out`)

### Causa raiz
**UFW bloqueando tráfego interno do Docker Swarm** na `FORWARD` chain:

```
[UFW BLOCK] IN=docker_gwbridge SRC=172.18.0.8 DST=216.238.114.80 DPT=443
```

Containers no Docker Swarm precisam acessar a porta 443 do host (Traefik ingress) via `docker_gwbridge`. O tráfego passa pela chain `FORWARD` (não `INPUT`), e o UFW rejeitava porque não tinha regras para FORWARD.

### Por que aconteceu agora e não antes?
O cliente deployou **3 novos apps** entre 2026-04-08 e 2026-04-12: `seguidoresdigital`, `comprarlikes`, `impulsionagram`. Isso triplicou o tráfego inter-container via `docker_gwbridge`. Antes com 1 app, os bloqueios eram raros e auto-recuperáveis; com 4 apps, a taxa de bloqueio ficou alta o suficiente para causar timeout sustentado.

### Correções aplicadas

1. **DOCKER-USER chain** (FORWARD, avaliada ANTES do UFW):
   ```bash
   iptables -I DOCKER-USER 1 -i docker_gwbridge -j ACCEPT
   ```
   Persistido em `/usr/local/sbin/docker-user-rules.sh` (systemd unit `docker-user-rules.service`).

2. **UFW rules** (proteção adicional na INPUT chain):
   ```bash
   ufw allow in on docker_gwbridge  # Docker Swarm internal
   ufw allow from 172.16.0.0/12     # Docker private networks
   ```

3. **Monit email** trocado de `set mailserver localhost` para:
   ```
   set mailserver smtp.resend.com port 587 username "resend" password "..." using tlsv13
   ```
   (Monit tentava enviar alertas de queda mas falhava porque não havia MTA em `localhost:25`)

4. **PHP-FPM bumped** de 30→50 workers (saturou com 30 no mesmo dia)

### Verificação pós-fix
- Zero bloqueios UFW em `docker_gwbridge` após o fix
- Site respondendo 200 OK em ~0.49s
- Monit status: todos os checks OK
- Load descendo (5.24→2.31 em 5 minutos)

### Lições aprendidas
- **Docker Swarm + UFW é uma combinação traiçoeira**: Docker cria regras em PREROUTING/FORWARD que bypassam UFW, mas NEM TODO tráfego interno segue esse caminho. O `docker_gwbridge` especificamente entra pela FORWARD chain onde UFW atua. Sempre que UFW estiver ativo com Docker Swarm, liberar `docker_gwbridge` e redes privadas 172.16.0.0/12.
- **Novos apps = revisão de capacidade**: cada app novo multiplicou tráfego interno. PHP-FPM do `sites_seguidores` precisou ser rebumpado. Os outros 3 apps (`seguidoresdigital`, `comprarlikes`, `impulsionagram`) provavelmente também estão com `pm.max_children=5` default e precisarão do mesmo tuning eventualmente.

## 12. Configuração atual do `docker-user-rules.sh`

```bash
#!/bin/bash
set -e
# Accept all traffic from docker_gwbridge (swarm internal) - MUST be first
iptables -C DOCKER-USER -i docker_gwbridge -j ACCEPT 2>/dev/null || iptables -I DOCKER-USER 1 -i docker_gwbridge -j ACCEPT
# Accept loopback
iptables -C DOCKER-USER -i lo -j ACCEPT 2>/dev/null || iptables -I DOCKER-USER 1 -i lo -j ACCEPT
# Close port 3000 (easypanel) to public
iptables -C DOCKER-USER -s 127.0.0.1 -p tcp --dport 3000 -j ACCEPT 2>/dev/null || iptables -I DOCKER-USER -s 127.0.0.1 -p tcp --dport 3000 -j ACCEPT
iptables -C DOCKER-USER -p tcp --dport 3000 -j DROP 2>/dev/null || iptables -A DOCKER-USER -p tcp --dport 3000 -j DROP
```

## 13. Configuração atual dos alertas por email

### Fail2ban
- **Silenciado** para ban/unban individual (gerava 170+ emails/dia)
- `/etc/fail2ban/action.d/sendmail-alert.conf` tem `actionban =` e `actionunban =` vazios
- fail2ban continua banindo normalmente, só não envia email unitário

### Resumo diário (cron)
- Cron: `0 11 * * *` (8h BRT) → `/usr/local/sbin/fail2ban-daily-report.sh`
- Conteúdo: status fail2ban, top IPs atacantes, monit summary, recursos, PHP-FPM saturações, emails/dia
- 1 email/dia em vez de 170+

### Monit
- Envia direto via `smtp.resend.com:587` (TLSv1.3) — sem dependência de MTA local
- Config em `/etc/monit/monitrc`: `set mailserver smtp.resend.com port 587 username "resend" password "..." using tlsv13`

---

## 14. Incidente 2026-04-15: Queda de 18 minutos + ataques combinados

### Sintoma
- Site `seguidoresbrasil.com.br` inacessível das 07:27 às 07:45 BRT (10:27-10:45 UTC)
- Monitor externo: `Connection Timeout` / `HTTP: Error receiving data`

### Causa raiz (3 problemas combinados)

| Problema | IP atacante | Impacto |
|---|---|---|
| **XMLRPC brute-force** em `comprarlikes.com.br` (1144 POSTs em 21min, ~1/s sustentado) | `103.59.161.127` | Saturou PHP-FPM do container `comprarlikes` |
| **Flood em admin-ajax.php** em `seguidoresbrasil.com.br` (10+ POSTs simultâneos demorando 5-20s cada) | `189.34.57.239` | Ocupou todos os 50 workers do `sites_seguidores`, 629 requisições com status 499 |
| **Fail2ban bug**: `datepattern = {^LN-BEG}` não extraía data dos logs JSON do Docker → detectava os 4713 matches mas **não banava ninguém** | — | Atacantes livres apesar do fail2ban "instalado" em 08/04 |

### Correções aplicadas

1. **Fail2ban datepattern corrigido**:
   ```
   datepattern = %%Y-%%m-%%dT%%H:%%M:%%S
   ```
   (usa o campo `"time":"2026-04-15T..."` do wrapper JSON do Docker). Agora `fail2ban-regex` mostra **29500 date hits + 4713 matches**.

2. **Jail mais agressiva para wp-auth**: `<<REMOVIDO>>`, `maxretry=5`, `bantime=12h`.

3. **Nova jail `traefik-admin-ajax-flood`**:
   - Detecta POSTs em `admin-ajax.php` com tempo >1s (padrão de abuso)
   - `findtime=2min`, `maxretry=10`, `bantime=6h`
   - Filtro em `/etc/fail2ban/filter.d/traefik-admin-ajax-flood.conf`

4. **XMLRPC bloqueado globalmente no Traefik** (mata ataque na borda, antes de chegar ao PHP-FPM):
   - Middleware `block-all` com `ipAllowList: [127.0.0.1/32]` → 403 para tudo externo
   - Router `PathPrefix(/xmlrpc.php)` com `priority: 1000000` (sobrepõe qualquer outro router)
   - Aplica a TODOS os 4 sites automaticamente
   - Custo: **0ms de CPU** (resposta direta do Traefik, sem hit no PHP)
   - Verificado: `curl https://seguidoresbrasil.com.br/xmlrpc.php -X POST` → 403

5. **Rate limit dedicado em `/wp-login.php`**: 30 req/min, burst 60 (middleware `wp-ratelimit`)

6. **Script de resumo diário corrigido** (2 bugs antigos):
   - `journalctl _SYSTEMD_UNIT=sshd.service` → `journalctl -t sshd` (SSH não loga por unit name)
   - `date '+%b %d'` → `date '+%b %e' | sed 's/  / /'` (formato do msmtp log usa space padding)
   - Acrescentado: Top 10 IPs HTTP externos, Top 10 SSH, contagem de 5xx, saturações PHP-FPM por container

### Análise de plugins WordPress (2026-04-15)

Os 4 sites são WooCommerce stores com plugins similares:
- **Todos**: WooCommerce + Action Scheduler + WooCommerce Mercado Pago + Rank Math + UpdraftPlus + Customer Reviews
- **3 dos 4**: Elementor Pro + Seraphinite Accelerator + Smmloja (plugin custom)

**Origem do tráfego admin-ajax.php**:
- **Legítimo**: Action Scheduler (`as_async_request_queue_runner`) — WordPress faz self-POST para processar filas em background. Volume normal: ~15-36 self-POSTs/6h por site
- **Legítimo**: Clientes interagindo com páginas de produto (preview, contadores, reviews)
- **Abusivo**: IPs fazendo flood simultâneo (detectado pela nova jail `traefik-admin-ajax-flood`)

Nenhum plugin foi identificado como vetor suspeito. O problema era exclusivamente de **saturação** por ataques externos + self-loop do Action Scheduler.

### Estado pós-fix (verificado 2026-04-15 12:03 UTC)

- Site: 200 OK, 0.36s
- XMLRPC bloqueado em todos os hosts (49 requisições recentes = 403 em 0ms)
- Atacante `103.59.161.127` parou (combo ban fail2ban + 403 Traefik)
- PHP-FPM seguidores: 50 workers
- Fail2ban funcional (2 bans manuais + jails ativas lendo logs corretamente)

## 15. Resumo das camadas de proteção (arquitetura final)

A proteção do servidor agora funciona em camadas, cada uma bloqueando o ataque o mais cedo possível:

```
Internet
   ↓
[1] Traefik (porta 80/443) ← custo mínimo, nunca hit PHP
   ├─ XMLRPC → 403 direto (middleware block-all)
   ├─ wp-login.php → rate limit 30/min
   └─ Requisições válidas → upstream WP
        ↓
[2] fail2ban (lê logs do Traefik em tempo real)
   ├─ Jail sshd: 5 falhas em 10min = 1d ban (iptables INPUT)
   ├─ Jail traefik-wp-auth: 5 POSTs wp-login/xmlrpc em 5min = 12h ban (DOCKER-USER)
   └─ Jail traefik-admin-ajax-flood: 10 POSTs >1s em 2min = 6h ban
        ↓
[3] UFW (INPUT chain)
   ├─ Porta 22 aberta
   ├─ docker_gwbridge liberado
   └─ Resto bloqueado
        ↓
[4] Docker Swarm (overlay network)
        ↓
[5] Container WP + PHP-FPM (50 workers max, pm.max_requests=500 reciclagem)
        ↓
[6] MariaDB
```

## 16. Recomendações para solução definitiva

### Implementado ✅
- Bloqueio XMLRPC no Traefik (protege todos os sites)
- Rate limit em wp-login.php
- Fail2ban funcional (SSH + WP brute-force + admin-ajax flood)
- PHP-FPM tuning (50 workers)
- Monit + alertas

### Recomendado (precisa confirmação do cliente)

1. **Cloudflare Proxy em todos os 4 domínios** (mais eficaz)
   - Ativar CF proxy (nuvem laranja) para todos os domínios dos sites
   - Ganha: WAF gratuito, DDoS protection, cache de assets, bloqueio por país, rate limit nativo
   - Requer: ajustar `sourceCriterion` do rate-limit do Traefik para ler `X-Forwarded-For` (senão todos os IPs virão de Cloudflare)
   - Cliente precisa: ativar no painel Cloudflare para cada domínio

2. **Mudar porta SSH de 22 para não-padrão** (ex: 2222)
   - Elimina ~99% do ataque SSH automatizado (5085 tentativas em 24h hoje)
   - Requer: atualizar UFW, testar login antes de reiniciar sshd
   - **Risco**: se falhar, perde acesso. Fazer com janela de teste

3. **Desabilitar wp-cron interno e rodar via system cron** (reduz carga)
   - Em cada `wp-config.php`: `define('DISABLE_WP_CRON', true);`
   - Adicionar system cron: `* * * * * curl -s https://dominio/wp-cron.php?doing_wp_cron`
   - Ganha: elimina self-POSTs do WordPress a cada page load, PHP-FPM menos pressionado

4. **Instalar Redis + object cache plugin** (melhoria de performance, não segurança)
   - Container Redis no Easypanel
   - Plugin `redis-cache` em cada WordPress
   - Ganha: 50-70% menos queries no MariaDB, admin-ajax mais rápido (reduz janela de ataque)

5. **Tunar os outros 3 sites** (seguidoresdigital, comprarlikes, impulsionagram)
   - PHP-FPM atualmente em 30 workers — subir para 50 se saturarem
   - Criar scripts Easypanel equivalentes ao do `sites_seguidores`

6. **CrowdSec** (alternativa mais moderna ao fail2ban)
   - Inteligência colaborativa: recebe lista de IPs maliciosos de toda a rede global
   - Plugin Traefik nativo
   - **Trade-off**: mais complexidade, overlap com fail2ban

### Pergunta do cliente: "é necessário plugin ou dá pra otimizar internamente?"

**Resposta**: O bloqueio XMLRPC está feito **no Traefik (proxy)**, não é plugin. Isso é **superior a plugin interno**:

| Estratégia | Custo por request | Proteção |
|---|---|---|
| Plugin WP "Disable XML-RPC" | ~30-100ms (PHP carrega + plugin decide 403) | OK |
| Bloqueio Traefik ✅ **(atual)** | ~0ms (Traefik responde sem tocar o PHP) | Melhor — protege o PHP-FPM de saturação |

Plugin teria mantido o problema: cada request ainda consome um worker PHP-FPM. Com ataque de 1 req/s sustentado, o PHP-FPM satura mesmo retornando 403 rapidamente. A borda (Traefik) é sempre mais eficiente.

## 17. Histórico completo atualizado

| Data | Ação |
|---|---|
| 2026-04-08 | Auditoria inicial, achados de segurança |
| 2026-04-08 | docker prune, fail2ban (sshd + WP), unattended-upgrades |
| 2026-04-08 | Rate limit Traefik, fechamento porta 3000, hardening wp-config |
| 2026-04-08 | Sistema completo de alertas (msmtp+Resend, monit, watchers, fail2ban-email, ssh-login-alert) |
| 2026-04-08 | Problema raiz: `pm.max_children=5` → bumped para 30 |
| 2026-04-09 | Fail2ban emails silenciados, substituídos por resumo diário |
| 2026-04-12 | Incidente UFW/docker_gwbridge; monit email corrigido; PHP-FPM 30→50 |
| 2026-04-15 | Incidente combinado (XMLRPC brute-force + admin-ajax flood + fail2ban com datepattern quebrado) |
| 2026-04-15 | Fail2ban datepattern corrigido (29500 date hits); nova jail admin-ajax-flood |
| 2026-04-15 | XMLRPC bloqueado globalmente no Traefik (priority 1000000, 403 em 0ms) |
| 2026-04-15 | Script de resumo diário corrigido (bugs: journalctl source + formato de data msmtp) |
| 2026-04-15 | DISABLE_WP_CRON=true adicionado em 4 wp-config.php + system cron 1/min chamando wp-cron.php de cada site (`/usr/local/sbin/wp-cron-all.sh`) — elimina Action Scheduler self-loop |
| 2026-04-15 | PHP-FPM dos outros 3 sites tunado (seguidoresdigital, comprarlikes, impulsionagram) de 30→**50** workers, reload graceful |
| 2026-04-15 | Skill local `wordpress-master` criado em `.claude/skills/wordpress-master/SKILL.md` — documenta procedimentos deste servidor e arma o `/wordpress-master` |

---

## 18. Script `/usr/local/sbin/wp-cron-all.sh` (2026-04-15)

Dispara wp-cron de cada site via HTTPS a cada minuto, substituindo o self-POST do WordPress:

```bash
#!/bin/bash
SITES=(
  "https://seguidoresbrasil.com.br/wp-cron.php?doing_wp_cron"
  "https://seguidoresdigital.com.br/wp-cron.php?doing_wp_cron"
  "https://comprarlikes.com.br/wp-cron.php?doing_wp_cron"
  "https://impulsionagram.com.br/wp-cron.php?doing_wp_cron"
)
for url in "${SITES[@]}"; do
  curl -sk -o /dev/null --max-time 30 "$url" &
done
wait
```

Crontab:
```
* * * * * /usr/local/sbin/wp-cron-all.sh >/dev/null 2>&1
```

> **Atenção:** se um domínio não resolver (ex: ainda não apontado pro IP), o curl dá timeout mas não afeta os outros (roda em paralelo com `&`). Se um domínio for removido, editar o script.

## 19. Persistência pendente (cliente)

Para que o tuning PHP-FPM dos 3 sites novos sobreviva a rebuild do Easypanel, o cliente precisa criar o script `fix-php-fpm-pool` no módulo Scripts de **cada um** dos apps:
- `seguidoresdigital`
- `comprarlikes`
- `impulsionagram`

Conteúdo igual ao já aplicado em `seguidores`, com os valores 50/8/5/15/500. Script completo na seção 4.7.

Até a criação desses scripts, **qualquer rebuild desses 3 apps reverte PHP-FPM para `max_children=5`** (default da imagem).
