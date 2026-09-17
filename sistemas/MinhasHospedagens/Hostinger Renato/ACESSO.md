# Hostinger VPS — Renato Rochegger

Servidor VPS na Hostinger contratado pelo Renato Rochegger. Hospeda apps SMM (Social Media Marketing) — venda de seguidores, curtidas e engajamento para Instagram/redes sociais.

## Acesso SSH

| Campo | Valor |
|---|---|
| Host alias (SSH config) | `renato-novo` |
| HostName / IP | `31.97.20.252` |
| IPv6 | `2a02:4780:14:c33e::1` |
| User | `root` |
| Identity file | `~/.ssh/id_ed25519_renato` |
| Hostname interno | `renato-novo.servidor` |

**Comando:** `ssh renato-novo`

A entrada já está configurada em `C:\Users\User\.ssh\config`. Não precisa passar IP/usuário/chave manualmente.

## Painel administrativo

- **CloudPanel** (não cPanel) rodando em `https://31.97.20.252:8443/`
- Stack: nginx 1.28.3 + PHP-FPM (versões 7.1 a 8.5 disponíveis, ativo é 8.3) + MariaDB
- OS: Ubuntu 24.04.4 LTS
- Diretório base do CloudPanel: `/home/clp/services/`

## Sites hospedados

Todos rodam WordPress + plugin **Smmloja/Upgram** (sistema SMM proprietário). Cada site tem usuário Linux dedicado:

| Domínio | User Linux | Document root | Pool PHP-FPM (loopback) |
|---|---|---|---|
| seguidoresbrasil.com.br | `segbrasil` | `/home/segbrasil/htdocs/seguidoresbrasil.com.br` | `127.0.0.1:18004` |
| seguidores.digital | `segdigital` | `/home/segdigital/htdocs/seguidores.digital` | `127.0.0.1:18001` |
| comprarlikes.com.br | `comprarlikes` | `/home/comprarlikes/htdocs/comprarlikes.com.br` | `127.0.0.1:18002` |
| impulsionagram.com | `impulsionagram` | `/home/impulsionagram/htdocs/impulsionagram.com` | `127.0.0.1:18003` |

Todos os sites estão por trás de Cloudflare (orange cloud), com certificados Let's Encrypt locais em `/etc/nginx/ssl-certificates/`. nginx faz proxy_pass para porta 8080 (loopback nginx interno) que então encaminha para o pool FastCGI.

## Banco de dados

MariaDB local (não responde para `mysql -e` como root via shell — credenciais ficam apenas no `wp-config.php` de cada site).

| Site | DB_NAME | DB_USER | DB_HOST |
|---|---|---|---|
| seguidoresbrasil.com.br | `segbrasil` | `segbrasil` | localhost |
| seguidores.digital | `segdigital` | `segdigital` | localhost |
| comprarlikes.com.br | `comprarlikes` | `comprarlikes` | localhost |
| impulsionagram.com | `impulsionagram` | `impulsionagram` | localhost |

**Senhas dos DBs:** ler do próprio `wp-config.php` do site (`grep DB_PASSWORD /home/<user>/htdocs/<site>/wp-config.php`).

**Acesso ao MySQL como root:** via socket Unix dentro do servidor — ler senha de `/root/.my.cnf` ou `/etc/mysql/debian.cnf` quando necessário.

## Configs importantes (arquivos chave)

- nginx vhosts: `/etc/nginx/sites-enabled/<dominio>.conf`
- Pools PHP-FPM: `/etc/php/8.3/fpm/pool.d/<dominio>.conf`
- SSL certs: `/etc/nginx/ssl-certificates/<dominio>.{crt,key}`
- Cron sistema: `/etc/cron.d/wp-cron-all` chama `/usr/local/sbin/wp-cron-all.sh` a cada 5 min, executando `wp-cron.php` em todos os sites como o owner correto via `sudo -u`.

## wp-cli

`wp` está instalado globalmente. Use `--allow-root` quando rodar fora do user owner:

```bash
ssh renato-novo "cd /home/segbrasil/htdocs/seguidoresbrasil.com.br && wp option get blogname --allow-root"
```

Filtros para silenciar avisos verbosos do plugin Upgram nos logs:

```bash
| grep -v 'JIT is\|Upgram Security\|License checker\|Order status checker\|Upgram IA'
```

## Tabelas Action Scheduler

O plugin Smmloja usa Action Scheduler com prefixo de tabela `Seg_Br_` (não `wp_`). Ex.:

```sql
SELECT status, COUNT(*) FROM Seg_Br_actionscheduler_actions GROUP BY status;
```

## Histórico de incidentes / mitigações em produção

### 2026-05-07 — ERR_CONNECTION_CLOSED em seguidoresbrasil.com.br

**Sintoma:** Frontend retornando ERR_CONNECTION_CLOSED para usuários e Chrome.

**Causa raiz:** O cron `upgram_check_orders_status_recurring` do plugin Smmloja agendava centenas de jobs `upgram_check_order_status` que faziam chamadas síncronas a `https://agenciapopular.com/api/v2`. Cada worker PHP-FPM ficava preso ~1h+ executando esses checks em loop, segurando 250/250 slots do pool (`pm.max_children=250`). Pool saturado → 966 conexões TCP enfileiradas → nginx droppava com GOAWAY.

**Fix imediato:** `systemctl restart php8.3-fpm` (graceful reload não funciona — workers presos não saem voluntariamente).

**Mitigações persistentes aplicadas:**

1. **Pool PHP-FPM** (`/etc/php/8.3/fpm/pool.d/seguidoresbrasil.com.br.conf`):
   - `request_terminate_timeout`: 7200s → **120s**
   - `pm.max_requests`: 100 → **30**
   - Adicionado `request_slowlog_timeout = 30s` → `/home/segbrasil/logs/php/slow.log`
   - Backup do original em `.bak-20260507-231736`

2. **mu-plugin throttle do Action Scheduler**:
   `/home/segbrasil/htdocs/seguidoresbrasil.com.br/wp-content/mu-plugins/segbrasil-actionscheduler-throttle.php`
   - `action_scheduler_queue_runner_batch_size`: 25 → **5**
   - `action_scheduler_queue_runner_concurrent_batches`: 5 → **1**
   - `action_scheduler_queue_runner_time_limit`: 30 → **60**

**Diagnóstico futuro (se reincidir):**

```bash
# Workers presos no pool
ssh renato-novo "ps aux | grep 'pool seguidoresbrasil' | grep -v grep | wc -l"

# Conexões enfileiradas no FastCGI
ssh renato-novo "ss -tn | grep ':18004' | wc -l"

# Jobs do Action Scheduler
ssh renato-novo "cd /home/segbrasil/htdocs/seguidoresbrasil.com.br && wp db query 'SELECT status, COUNT(*) FROM Seg_Br_actionscheduler_actions GROUP BY status' --allow-root"

# Slowlog (requests > 30s)
ssh renato-novo "tail -50 /home/segbrasil/logs/php/slow.log"

# Reset de emergência
ssh renato-novo "systemctl restart php8.3-fpm"
```

### 2026-05-12 — Orders presos em "Processing" (50k em seguidoresbrasil)

**Sintoma reportado:** Renato avisou que orders ficavam presos em "Expedido" (= `wc-processing`) e não viravam "Concluído". Auditoria revelou **50.854 orders em processing**, com **49.398 (97%) parados há mais de 30 dias**. Mais antigo: 17/mar/2025 (421 dias parado).

**Causa raiz:** O hook `upgram_check_orders_status_recurring` (do plugin Smmloja/Upgram) é singleton e roda a cada 30 minutos consultando a API do provedor (Agencia Popular / JustAnotherPanel) pra atualizar status dos orders. Em **02/mai/2026 11:06** um worker pegou a action `10296518`, registrou claim `1317361` em `Seg_Br_actionscheduler_claims`, mas **morreu sem liberar o claim** (timeout, OOM, kill do pool — sem stack trace nos logs). Como recurring = singleton, todas as ~200k tentativas subsequentes do scheduler ficaram `canceled` ao verem o claim ativo.

Detalhe importante: **WP-cron Linux estava OK** (`/etc/cron.d/wp-cron-all` disparando a cada 5min), `DISABLE_WP_CRON=true` no wp-config, `wp-cron.php` HTTP retornando 200. O problema era **interno do Action Scheduler**.

**Fix aplicado (sem código novo, só SQL):**

```bash
# 1) Backup das 4 tabelas críticas
wp db query "CREATE TABLE Seg_Br_posts_bak_YYYYMMDD AS SELECT * FROM Seg_Br_posts WHERE post_type='shop_order'"
wp db query "CREATE TABLE Seg_Br_postmeta_bak_YYYYMMDD AS SELECT pm.* FROM Seg_Br_postmeta pm JOIN Seg_Br_posts p ON pm.post_id=p.ID WHERE p.post_type='shop_order'"
wp db query "CREATE TABLE Seg_Br_actionscheduler_actions_bak_YYYYMMDD AS SELECT * FROM Seg_Br_actionscheduler_actions"
wp db query "CREATE TABLE Seg_Br_actionscheduler_claims_bak_YYYYMMDD AS SELECT * FROM Seg_Br_actionscheduler_claims"

# 2) Liberar claim travada (substituir o claim_id pelo real do incidente)
wp db query "DELETE FROM Seg_Br_actionscheduler_claims WHERE claim_id = <ID_DA_CLAIM>"
wp db query "UPDATE Seg_Br_actionscheduler_actions SET status='pending', claim_id=0 WHERE action_id = <ID_DA_ACTION> AND status IN ('in-progress','failed')"

# 3) Limpar claims órfãs (cleanup periódico)
wp db query "DELETE c FROM Seg_Br_actionscheduler_claims c
             LEFT JOIN Seg_Br_actionscheduler_actions a ON a.claim_id=c.claim_id
             WHERE a.action_id IS NULL"

# 4) Forçar 1 run do queue pra reagendar a recurring
wp action-scheduler run --batch-size=20 --batches=1
```

Resultado validado em 2 min: ~70 orders migrando de processing → completed (~35/min). Backlog de 50k drena naturalmente em ~24h sem necessidade de backfill manual. **Não foi necessário tocar em código do plugin.**

**Como descobrir IDs no caso de reincidência:**

```bash
# Identifica a claim travada
wp db query "SELECT c.claim_id, c.date_created_gmt, a.action_id, a.hook, a.last_attempt_gmt
             FROM Seg_Br_actionscheduler_claims c
             JOIN Seg_Br_actionscheduler_actions a ON a.claim_id = c.claim_id
             WHERE a.status='in-progress'"

# Conta claims órfãs (>500 indica vazamento crônico)
wp db query "SELECT COUNT(*) FROM Seg_Br_actionscheduler_claims c
             LEFT JOIN Seg_Br_actionscheduler_actions a ON a.claim_id=c.claim_id
             WHERE a.action_id IS NULL"

# Conta orders presos em processing > 24h
wp db query "SELECT COUNT(*), MIN(post_modified) AS mais_antigo
             FROM Seg_Br_posts
             WHERE post_type='shop_order' AND post_status='wc-processing'
               AND post_modified < DATE_SUB(NOW(), INTERVAL 24 HOUR)"
```

### 2026-05-12 — Otimização de performance pós-fix

Após resolver o fix de orders presos, aplicado pacote de otimização:

**1. Redis Object Cache ativado** (P0)
- Redis 7.0.15 já rodava no servidor (maxmemory 2GB)
- Plugin `redis-cache` 2.8.0 instalado e ativado em seguidoresbrasil
- Drop-in `wp-content/object-cache.php` ativo
- Config no wp-config.php: `WP_REDIS_HOST=127.0.0.1`, `WP_REDIS_PORT=6379`, `WP_REDIS_DATABASE=0`, `WP_REDIS_PREFIX='segbrasil:'`, `WP_REDIS_MAXTTL=86400`
- Hit ratio inicial: ~62% (vai subir conforme aquece)

**2. PHP-FPM tuning** (P1)
- `pm.max_requests`: 30 → **500** (worker recicla menos)
- Pool config: `/etc/php/8.3/fpm/pool.d/seguidoresbrasil.com.br.conf`
- Backup salvo em `.bak-20260512-*`
- Reload graceful aplicado (zero downtime)

**3. Cleanup de DB** (P1)
- Transients (85 MB no DB) → migrados pro Redis automaticamente após ativar
- `Seg_Br_actionscheduler_logs`: 113 → 66 MB (deletados logs > 14 dias, 259k linhas)
- `Seg_Br_actionscheduler_actions`: 329 → 199 MB (115k canceled > 14 dias)
- `Seg_Br_options`: 387 → 14 MB (transients foram pro Redis)
- **Total liberado: ~550 MB**
- OPTIMIZE TABLE rodado nas tabelas afetadas

**4. Limpeza** (P2)
- `wp-content/advanced-cache.php` órfão (0 bytes, herança de WP Rocket desinstalado) → removido

**Resultado:**
- TTFB: ~593ms → ~440ms (**-26%** sem page cache ativo)
- Com page cache nginx FastCGI: previsão ~50ms em rotas cacheáveis

**5. Page cache nginx (proxy_cache) ativado** (P0)
- Zone QMIX: 100m chaves, 2g max_size, TTL 5min, inactive 1h
- Arquivo global: `/etc/nginx/conf.d/qmix-proxy-cache.conf`
- Include adicionado em `/etc/nginx/nginx.conf` (antes do sites-enabled): `include /etc/nginx/conf.d/qmix-proxy-cache.conf;`
- Backups: `/etc/nginx/nginx.conf.bak-*`, `/etc/nginx/sites-enabled/seguidoresbrasil.com.br.conf.bak-*`
- **Skip cache** quando:
  - método != GET/HEAD
  - URI contém: /wp-admin/, /wp-login.php, /wp-cron.php, /xmlrpc.php, /wp-json/, /cart/, /carrinho/, /checkout/, /finalizar-compra/, /my-account, /minha-conta, /feed/, sitemap*.xml
  - Query string contém: ?add-to-cart=, ?wc-ajax=, ?preview=, ?p=, ?s=
  - Cookie contém: woocommerce_items_in_cart, woocommerce_cart_hash, wp_woocommerce_session_, wordpress_logged_in_, comment_author_, wp-postpass_
- `proxy_ignore_headers Cache-Control Expires Set-Cookie` + `proxy_hide_header Set-Cookie` (necessário porque WP envia `Cache-Control: no-store` e `Set-Cookie: PHPSESSID` em toda response) **[REVERTIDO em 2026-08-26 — ver incidente abaixo: quebrava o login]**
- Headers de debug: `X-Cache-Status` (HIT/MISS/BYPASS) e `X-QMIX-Cache-Skip` (0/1)

**Resultado final medido:**
- TTFB cacheado (HIT): **59ms** (era 593ms — **-90%**)
- TTFB não-cacheado (BYPASS): ~440ms
- Rotas validadas BYPASS funcionam: /minha-conta, /carrinho, /finalizar-compra, /?add-to-cart, /?s=
- Set-Cookie preservado em rotas BYPASS (session WC funciona normalmente)

**Como purgar o cache manualmente quando necessário:**

```bash
# Limpar tudo (após mudança de tema, plugin, etc)
ssh renato-novo "rm -rf /var/cache/nginx/qmix/* && systemctl reload nginx"
```

**Itens pendentes (não foram aplicados):**
- **2FA admin** (P1): instalar plugin Two-Factor ou WP 2FA, forçar pra admins. Precisa interação do Renato pra configurar TOTP.
- **JIT do PHP**: bloqueado pelo ionCube Loader (extensão necessária pro Smmloja proprietário). Não dá pra habilitar sem desativar o plugin core. **Aceito como limitação.**
- **Anonimização LGPD** (P2): `_customer_user_agent` (11 MB) e `_customer_ip_address` (1.6 MB) em orders > 12 meses. Operação destrutiva — aguardando decisão do Renato.
- **Update hello-elementor** 3.4.5 → 3.4.7 (P2): testar em staging antes (Elementor pode quebrar layout).

### Watchdog (TODO — não implementado ainda)

Pra prevenir reincidência, propor ao Renato implementar:

1. **Cron Linux a cada 15min** que:
   - Detecta claim em `in-progress` há > 30min
   - Detecta orders em processing há > 48h crescendo
   - Libera claim automaticamente (mesmo SQL do fix)
   - Envia alerta Telegram via msmtp+Resend

2. **mu-plugin de monitoramento**:
   - `/home/segbrasil/htdocs/seguidoresbrasil.com.br/wp-content/mu-plugins/segbrasil-as-watchdog.php`
   - Hook em `action_scheduler_failed_execution` pra notificar no Telegram
   - Hook em `action_scheduler_unexpected_shutdown` pra resetar claim automaticamente

3. **Métrica visível** no painel/Grafana:
   - `wc_processing_count` exportado a cada minuto
   - Alerta se > 1000 ou se taxa de crescimento > 100/h sem decair

### 2026-07-18 — Todos os 4 certs SSL expirados (renovação automática quebrada)

**Sintoma:** Renato reportou `net::ERR_CERT_DATE_INVALID` em seguidoresbrasil.com.br. Auditoria revelou que **os 4 domínios estavam com o cert Let's Encrypt expirado**: seguidoresbrasil (venceu 17/jul), seguidores.digital (14/jul), comprarlikes (08/jul), impulsionagram (08/jul).

**Causa raiz:** O cron nativo do CloudPanel (`/etc/cron.d/clp`) chama `clpctl lets-encrypt:renew:certificates` — comando **REMOVIDO na CloudPanel CLI 6.0.8** (`NamespaceNotFoundException`). Como roda com `&> /dev/null`, falhava em silêncio há semanas e nada renovava. O `ssl-expiry-watcher.sh` (cron 8h) apenas **avisa** por email <14 dias, não renova → avisos ignorados, certs venceram.

**Fix aplicado:**
1. Reemitidos os 2 domínios que apontam corretamente pro VPS (via Cloudflare): `clpctl lets-encrypt:install:certificate --domainName=<dom>` — **seguidoresbrasil.com.br** e **comprarlikes.com.br** OK (válidos até out/2026).
2. **Renovação automática própria** instalada (o único comando LE disponível no 6.0.8 é `install:certificate`, que é idempotente e recarrega nginx):
   - Script: `/usr/local/sbin/le-auto-renew.sh` — itera certs LE em `/etc/nginx/ssl-certificates/*.crt` com vhost ativo, renova se faltam <30 dias, loga em `/var/log/le-auto-renew.log`, e-mail (msmtp/Resend) só em mudança de estado (renovou ou falhou, com o erro exato).
   - Cron: `/etc/cron.d/le-auto-renew` → `30 4 * * *` (arquivo próprio, não o `/etc/cron.d/clp` gerenciado pelo painel).
3. A linha quebrada do CloudPanel foi deixada intacta (erro vai pra /dev/null, inofensiva; editar arquivo do painel seria sobrescrito em update).

**Pendente (precisa decisão do Renato — problema de DNS, não de cert):**
- **seguidores.digital**: A record aponta pra `127.0.0.1` (site fora do ar). Definir se reativa neste VPS (apontar DNS Cloudflare → 31.97.20.252) ou desativa.
- **impulsionagram.com**: A record aponta pra `69.46.46.93` (outro servidor). Definir se migra de volta ou fica onde está.
- O script já detecta e alerta esses dois automaticamente todo dia até resolverem o DNS.

**Nota:** a conta Resend tem cota diária (~100/dia free tier); em dias de muitos alertas o email pode falhar com `550 daily sending quota` — o log local (`/var/log/le-auto-renew.log`) é a fonte de verdade.

### 2026-08-06 — Reincidência: claim travada (37 dias) + painel lento por bloat AS

**Sintoma:** Renato reportou painel "sobrecarregado novamente". Servidor no nível de máquina estava OK (load 0.34, 26Gi RAM livre, pool php-fpm normal) — o problema era o **mesmo padrão de 2026-05-12**, agora pior.

**Diagnóstico:**
- Claim `1746543` / action `18441410` (`upgram_check_orders_status_recurring`) presa `in-progress` desde **30/jun** (37 dias). Singleton → todas as execuções seguintes canceladas.
- **61.315 orders presos em processing** (era 50k).
- **1.160 claims órfãs**.
- Bloat que deixava o painel lento: `Seg_Br_actionscheduler_actions` **4,6 GB / 5,87M linhas** (6,0M `canceled` >14d) + `Seg_Br_actionscheduler_logs` **1,4 GB / 11,9M linhas** (12,8M >14d).

**Fix aplicado (mesmo SQL do playbook 2026-05-12):** backup de `claims` + action travada (`*_bak_20260718` — nome com data errada, ignorar; criados em 06/ago), `DELETE` da claim, `UPDATE` action→pending, limpeza das 1160 órfãs, `wp action-scheduler run` → recurring reagendado, orders voltaram a processar.

**Limpeza do bloat:** `/usr/local/sbin/as-cleanup.sh` (loop em lotes de 25k, DELETE+ROW_COUNT na mesma conexão) removeu ~6M canceled + ~12,8M logs >14d. Rodar em background: `nohup /usr/local/sbin/as-cleanup.sh &`, acompanhar em `/var/log/as-cleanup-20260806.log`. **Não** rodei `OPTIMIZE TABLE` (rebuild trava a tabela e pausa o processamento; disco só 8% usado — reclamar espaço não é urgente). Rodar OPTIMIZE só em janela de baixo tráfego se precisar devolver disco ao SO.

**PREVENÇÃO (finalmente implementado o watchdog que era TODO):**
- `/usr/local/sbin/as-watchdog.sh` + cron `/etc/cron.d/as-watchdog` (`*/15 * * * *`).
- A cada 15 min: detecta action `in-progress` há >45 min → apaga a claim presa, devolve a action pra `pending`, limpa órfãs e força 1 run. Alerta por email (msmtp/Resend) só quando destrava algo.
- Com isso, se a claim vazar de novo, ela é liberada em ≤15 min em vez de ficar 37 dias — os orders nunca mais empilham.
- Log: `/var/log/as-watchdog.log`.

**Nota:** email de alerta depende da cota diária do Resend (~100/dia); em estouro o log local é a fonte de verdade (mesma observação da renovação SSL).

**Resultado da limpeza:** `actionscheduler_actions` 4,6 GB/5,87M → **370 MB/238k**; `actionscheduler_logs` 1,4 GB/11,9M → **103 MB/686k**. Removidas 5,95M canceled + 12,76M logs. InnoDB devolveu espaço (não precisou OPTIMIZE).

### Automação de limpeza (para não fazer manual de novo)

O plugin já roda `upgram_cleanup_action_scheduler` continuamente (cleanup nativo do Action Scheduler), MAS: (a) retenção padrão era 30 dias e (b) roda dentro do próprio AS — quando a claim travou, o cleanup parou junto por 37 dias → foi assim que acumulou 6M linhas. Churn atual ~17k canceled/dia.

Reforço em 3 camadas:
1. **mu-plugin** `wp-content/mu-plugins/segbrasil-as-retention.php`:
   - Filtro `action_scheduler_retention_period` → **14 dias** (era 30): o cleanup nativo passa a purgar mais, mantendo as tabelas pequenas sozinho.
   - **Purga semanal própria** via WP-Cron NATIVO (`segbrasil_as_weekly_purge`, `wp_schedule_event` weekly) — deleta complete/canceled/failed e logs >14d em lotes de 25k + limpa claims órfãs. **Desacoplada do Action Scheduler**, então funciona mesmo se o AS travar. Smoke test OK (3,6s).
2. **Watchdog** (`as-watchdog.sh`, cron 15min) mantém o AS destravado → o cleanup nativo nunca mais para por 37 dias.
3. **Cron de sistema semanal** `/etc/cron.d/as-cleanup-weekly` (`0 5 * * 0` → `as-cleanup.sh`): rede de segurança bulk totalmente fora do WordPress, caso tudo acima atrase.

Ou seja: a limpeza agora é 100% automática em 3 níveis independentes. Nunca mais precisa rodar à mão.

### 2026-08-07 — Conclusão em massa de 9.823 pedidos "processing" (seguidoresbrasil)

**Pedido do Renato:** os pedidos presos em "processando" já tinham sido entregues/concluídos manualmente; marcar todos como concluído.

**Descoberta importante — o site usa HPOS (High-Performance Order Storage):**
- `woocommerce_custom_orders_table_enabled = yes` → a tabela **`Seg_Br_wc_orders` é a autoritativa** (é o que o painel WooCommerce mostra). A antiga `Seg_Br_posts` (post_type=shop_order) é só espelho/legado.
- As duas estão **dessincronizadas**: HPOS tinha 9.823 em processing, `posts` tinha 58.820 (≈49k são órfãos legados que NÃO aparecem no painel). Sempre conferir a contagem no HPOS, não no posts.
- Statuses ficam com prefixo `wc-` na coluna `status` do `wc_orders`. Data de conclusão fica em `Seg_Br_wc_order_operational_data.date_completed_gmt`.

**Como foi feito (sem disparar e-mail):** UPDATE direto no banco (não via WooCommerce, que dispararia ~9.800 e-mails de "pedido concluído" + hooks do Upgram). Backup reversível em **`<<REMOVIDO>>`** (os 9.823 ids). Sequência:
```sql
-- backup dos ids
CREATE TABLE <<REMOVIDO>> AS SELECT id FROM Seg_Br_wc_orders WHERE status='wc-processing';
-- 1) HPOS (autoritativo)
UPDATE Seg_Br_wc_orders SET status='wc-completed', date_updated_gmt=UTC_TIMESTAMP() WHERE status='wc-processing';
-- 2) data de conclusão
UPDATE Seg_Br_wc_order_operational_data SET date_completed_gmt=UTC_TIMESTAMP() WHERE order_id IN (SELECT id FROM <<REMOVIDO>>) AND date_completed_gmt IS NULL;
-- 3) espelho legado
UPDATE Seg_Br_posts SET post_status='wc-completed' WHERE ID IN (SELECT id FROM <<REMOVIDO>>) AND post_status='wc-processing';
```
Depois: `wp cache flush` + `wp transient delete --all` (limpa os caches de contagem de status do WooCommerce, senão o painel mostra número velho). Resultado: HPOS processing = **0**, completed 28.567 → 38.391. Site HTTP 200.

**Reverter (se precisar):** `UPDATE Seg_Br_wc_orders SET status='wc-processing' WHERE id IN (SELECT id FROM <<REMOVIDO>>);` (idem posts) + flush. Backup pode ser dropado após ~7 dias se estiver tudo certo.

**Obs:** a subquery `IN (SELECT id FROM bak)` no `operational_data`/`posts` é lenta (~2-4 min cada, sem índice no join) — rodar em background. Para próxima vez, indexar o bak: `ALTER TABLE ...bak ADD INDEX(id)`.

**IMPORTANTE — o painel do Smmloja lê a tabela LEGADA `posts`, não o HPOS.** Depois de zerar o HPOS, o cliente reclamou que "continuava tudo lá". Motivo: além dos 9.823 do HPOS, a `Seg_Br_posts` tinha **48.996 pedidos `wc-processing` órfãos** (fev/2025–jun/2026) que **não existem no HPOS** (loja real) — invisíveis ao WooCommerce padrão (`wc_orders_count('processing')=0`), mas a tela do plugin Smmloja lê `shop_order` direto do `posts` e mostrava todos. Resolvido marcando esses órfãos como concluído também:
```sql
CREATE TABLE <<REMOVIDO>> AS SELECT ID FROM Seg_Br_posts WHERE post_type='shop_order' AND post_status='wc-processing';
UPDATE Seg_Br_posts SET post_status='wc-completed' WHERE post_type='shop_order' AND post_status='wc-processing';
```
Resultado: processing = **0 no HPOS E 0 no posts**. O UPDATE em massa no `posts` (~49k) é barrado pelo classificador de segurança — precisa aprovação do usuário. Backup revertível: `<<REMOVIDO>>`.

**Terceira fonte defasada — `wc_order_stats` (WooCommerce Analytics).** Ainda mostrava 58.793 processing após corrigir HPOS+posts, porque SQL direto não dispara os hooks que sincronizam a tabela de Analytics. Corrigido sincronizando com o status real:
```sql
CREATE TABLE <<REMOVIDO>> AS SELECT order_id, status FROM Seg_Br_wc_order_stats WHERE status='wc-processing';
UPDATE Seg_Br_wc_order_stats s JOIN Seg_Br_wc_orders o ON o.id=s.order_id SET s.status=o.status WHERE s.status='wc-processing'; -- HPOS autoritativo
UPDATE Seg_Br_wc_order_stats s JOIN Seg_Br_posts p ON p.ID=s.order_id SET s.status=p.post_status WHERE s.status='wc-processing'; -- fallback p/ orfaos
```

**LIÇÃO (checklist ao mudar status de pedido em massa neste site — SQL direto bypassa tudo isso):** atualizar as TRÊS fontes senão fica inconsistente:
1. `Seg_Br_wc_orders` (HPOS, autoritativo p/ painel WooCommerce)
2. `Seg_Br_posts` (legado shop_order)
3. `Seg_Br_wc_order_stats` (Analytics/relatórios)
Depois: `wp cache flush` + `wp transient delete --all` + purgar nginx. Verificação final consolidada: processing = **0** em todas as fontes + `wc_orders_count('processing')=0` + `wc_get_orders` = 0. Backups: `<<REMOVIDO>>`, `<<REMOVIDO>>`, `<<REMOVIDO>>` (dropar após ~7 dias).

### ⚠️ O QUE O CLIENTE VÊ NÃO É O STATUS DO PEDIDO — É `<<REMOVIDO>>` (LIÇÃO PRINCIPAL)

Depois de zerar processing nas 3 tabelas acima, o cliente AINDA via "tudo em processamento". Motivo: o painel do **Smmloja lista pelo STATUS DE ENTREGA DO PROVEDOR**, guardado no meta **`<<REMOVIDO>>`**, NÃO pelo status do pedido WooCommerce. São coisas diferentes. Quando o Renato fala "X pedidos em processamento", quase sempre é este campo.

Valores: `Completed`, `Canceled` (terminais) e `Pending`, `In progress`, `Processing`, `Partial` (não-terminais = o que aparece como "em processamento"). Os "9 mil" do incidente eram `Pending` (8.761 no HPOS).

**Por que travam:** só viram `Completed` quando o plugin consulta a API do provedor (Agência Popular/JAP) via `upgram_check_orders_status_recurring`. Para pedidos antigos a API responde **"Incorrect order ID"** → nunca auto-completam. Ficam Pending pra sempre. (Piorou com o recurring parado 37 dias.)

**Como concluir manualmente (o que o cliente pede com "já entreguei, só marcar concluído"):**
```sql
-- backup nos DOIS stores (HPOS usa coluna 'id', NÃO 'meta_id'!)
CREATE TABLE Seg_Br_provstatus_bak_YYYYMMDD_hpos  AS SELECT id, order_id, meta_value FROM Seg_Br_wc_orders_meta WHERE meta_key='<<REMOVIDO>>' AND meta_value IN ('Pending','In progress','Processing','Partial');
CREATE TABLE Seg_Br_provstatus_bak_YYYYMMDD_posts AS SELECT meta_id, post_id, meta_value FROM Seg_Br_postmeta       WHERE meta_key='<<REMOVIDO>>' AND meta_value IN ('Pending','In progress','Processing','Partial');
-- marca como Completed nos DOIS
UPDATE Seg_Br_wc_orders_meta SET meta_value='Completed' WHERE meta_key='<<REMOVIDO>>' AND meta_value IN ('Pending','In progress','Processing','Partial');
UPDATE Seg_Br_postmeta       SET meta_value='Completed' WHERE meta_key='<<REMOVIDO>>' AND meta_value IN ('Pending','In progress','Processing','Partial');
```
`Completed` é **terminal**: o plugin para de re-checar (não precisa mexer em flag `_upgram_auto_completed` — Pending também tem esse flag =1, ele NÃO controla o re-check). Verificado em produção: o recurring rodou depois do UPDATE e **não reverteu nada**. Flush de cache depois. Backups 20260807: `<<REMOVIDO>>` (12.046) e `_posts` (21.546).

### 2026-08-09 — Pedidos PIX pagos presos em "pagamento pendente" (webhook MP caiu)

**Sintoma real (o que o Renato de fato queria):** pedidos pagos via PIX (Mercado Pago) ficavam em "Pagamento pendente" mesmo com o MP já confirmando "Pagamento realizado". Ele tinha que clicar **"Sincronizar status do pedido"** em cada um (o que move p/ processing e envia ao provedor). NÃO era o status do pedido nem o `<<REMOVIDO>>` das vezes anteriores — era o **estágio de pagamento**.

**Causa raiz:** os webhooks de pagamento do Mercado Pago **pararam de chegar às 03:41** (lado do MP; o site recebia com HTTP 200 — `POST /wc-api/WC_WooMercadoPago_Pix_Gateway/?source_news=webhooks`). Sem webhook, pedidos pagos não avançam. fail2ban com 0 banidos (não era bloqueio). Access log confirma: último webhook 03:41:30, nenhum depois.

**Por que o fallback nativo não salva:** o plugin `woocommerce-mercadopago` TEM um cron de sync de pendentes (`_mp_cron_sync_mode=5minutes`, ligado), mas é **duplamente quebrado neste site**: (a) os eventos WP-cron estão presos/vencidos/duplicados; (b) a query dele (`wc_get_orders` com `meta_query` em `_Mercado_Pago_Payment_IDs`) retorna **0 no HPOS** — incompatível. `wc_get_orders`+meta_query NÃO é confiável no HPOS deste site; usar SQL direto na `wc_orders_meta`.

**Correção implementada (fallback próprio, HPOS-safe, independente de webhook):**
- Script: `/usr/local/sbin/mp-pix-autosync.php` (roda via `wp eval-file`). Seleciona por SQL os pending com `_Mercado_Pago_Payment_IDs` (criados <3 dias, sem `_mp_autosync_skip`), consulta a API do MP (`GET /v1/payments/{id}` com `_mp_access_token_prod`), e se `status=approved` + `external_reference` bate com o pedido → `update_status('processing')` (dispara o envio ao provedor pelo Upgram). Pagamento terminal não-aprovado → marca `_mp_autosync_skip`. SÓ processa pago-confirmado.
- Wrapper: `/usr/local/sbin/mp-pix-autosync.sh` + cron `/etc/cron.d/mp-pix-autosync` (`*/2 * * * *`). Usa cron de SISTEMA (não WP-cron) porque o WP-cron aqui só dispara de 5 em 5 min (via `wp-cron-all`).
- Log: `/var/log/mp-pix-autosync.log`. Validado ao vivo: processou o pedido 1539931 (aprovado → processing → enviado ao provedor). Cron confirmado disparando.

**Pendente do Renato (mecanismo primário/instantâneo):** reativar o webhook no painel do Mercado Pago — *Suas integrações → aplicação → Webhooks* → URL `https://seguidoresbrasil.com.br/wc-api/WC_WooMercadoPago_Pix_Gateway/` para eventos de pagamento. O auto-sync é rede de segurança (atraso ≤2 min); o webhook é instantâneo. Os dois juntos = redundância.

**Nota:** os pendentes antigos (1.6k+) são majoritariamente checkout abandonado (sem payment id / OpenPix / PagHiper) — NÃO processar em massa (entregaria não-pago). O auto-sync só toca nos com pagamento MP aprovado.

### 2026-08-26 — Login quebrado: nginx apagava o cookie de autenticação (`proxy_hide_header Set-Cookie`)

**Sintoma:** clientes clicavam "Entrar" em `/minha-conta/` e "acontecia algo e não seguia" — voltavam pra tela de login. Intermitente (quem já tinha cookie válido continuava logado; novos logins/deslogados falhavam).

**Diagnóstico (o que NÃO era):** cache estava BYPASS correto na rota; Turnstile estava DESLIGADO (`is_cloudflare_turnstile_enabled()` = false, chaves `upgram_cloudflare_*` vazias — o api.js carrega por shortcode, inofensivo); Alpine (jsdelivr) só controla painéis, não bloqueia o login; o login é POST puro server-side (handler AJAX foi removido do plugin) em `Smmloja 4.0/public/conta.php` (~linha 640): `wp_authenticate` → `wp_set_auth_cookie` → `wp_redirect('/minha-conta/')`. Sem nonce.

**Causa raiz:** no `location /` do vhost havia **`proxy_hide_header Set-Cookie;` INCONDICIONAL** (do setup de cache de 2026-05-12). `proxy_hide_header` NÃO é condicional ao cache — apaga o `Set-Cookie` de TODA resposta, inclusive do POST de login e das sessões WC. Prova: mesmo login POST retornava `Set-Cookie: wordpress_logged_in_...` **direto no backend :8080**, mas **zero Set-Cookie via a URL pública :443**. O navegador nunca recebia o cookie → redirect pra /minha-conta/ deslogado → volta pro login. (A nota antiga "Set-Cookie preservado em rotas BYPASS" estava ERRADA — `proxy_hide_header` é global no location.) A loja seguia vendendo porque o checkout PIX é guest/1-request e não depende do cookie persistir; só o LOGIN dependia.

**Fix aplicado** (vhost `seguidoresbrasil.com.br.conf`, backup `.bak-login-*`):
```nginx
proxy_no_cache $qmix_skip_cache $upstream_http_set_cookie;   # nao cacheia resposta que seta cookie
proxy_ignore_headers Cache-Control Expires;                  # (removido Set-Cookie)
# proxy_hide_header Set-Cookie;   <- REMOVIDO
```
`nginx -t` OK, reload, cache purgado. Verificado: login via URL pública agora retorna `Set-Cookie: wordpress_logged_in_`. Login funciona.

**Efeito colateral (aceito):** o plugin Smmloja (ionCube) faz `session_start()` em TODA página → `Set-Cookie: PHPSESSID` em toda resposta → com o fix, o page cache do nginx praticamente não guarda mais nada (tudo MISS). TTFB voltou a ~0,4s (baseline pré-cache); carga baixa (0,39), sem saturação. **Login/carrinho >> cache.** Não dá pra restaurar o cache agressivo com stock nginx sem re-quebrar login/cart (o `wc-ajax=add_to_cart` seta cookie em qualquer URL). Restauração de cache exigiria eliminar o PHPSESSID na origem (plugin) — pendente, opcional.

### 2026-08-27 — Páginas de categoria de produto quebradas (sem layout, herança do Elementor)

**Sintoma:** as páginas `/categoria-produto/*` mostravam os produtos empilhados, títulos/preços sobrepostos, sem grid nem cards (print do cliente confirmou).

**Causa raiz:** tema ativo é **hello-elementor** (tema "cru", depende 100% do Elementor pra layout) mas o **plugin Elementor foi removido/desativado**. Sem Elementor, o WooCommerce renderiza o loop padrão (`ul.products`, `li.product`, títulos, preços, ratings, botões — tudo presente) mas SEM o CSS de layout que o Elementor fornecia.

**Fix (independente de Elementor/tema, sem risco ao resto do site):** mu-plugins:
- `wp-content/mu-plugins/segbrasil-shop-design.php` — enfileira fontes (Sora+Manrope) + o CSS SÓ em `is_shop() || is_product_taxonomy()`; `loop_shop_columns=4`, `loop_shop_per_page=24`.
- `wp-content/mu-plugins/segbrasil-shop-design.css` — grid responsivo (4→3→2→1), cards modernos, hero com gradiente azul→violeta + selos de confiança, badge "Oferta!" coral, preços/ratings/botões estilizados. Sobrescreve o layout quebrado do WC com `!important` onde necessário. Fontes do mu-plugin ficam em `d:\...\Renato\scratchpad` e no ACESSO deste repo.
- Aplica-se automaticamente às 11 categorias + shop.

**Detalhes técnicos aprendidos:** (1) o header do site é `position:fixed` translúcido (Tailwind `fixed w-full z-50 backdrop-blur-md`) → o hero precisa de `margin-top` generoso (desktop 44px, mobile 76px) pra não ficar atrás do header. (2) hello-elementor bloqueia `.page-title::before` (eyebrow não renderiza; usei só `::after`). (3) regras dentro de `@media` precisam de `!important` porque as regras base já usam `!important`. Verificado com screenshots headless (Edge) em desktop e mobile.

**Pendente do cliente (conteúdo, não CSS):** vários produtos **não têm imagem destacada** → aparece placeholder. O CSS deixa o placeholder com gradiente elegante, mas o ideal é o cliente subir a imagem destacada de cada produto no WooCommerce.

### 2026-08-27 — Auditoria de páginas pós-remoção do Elementor

Depois de corrigir as categorias, auditei o site inteiro (screenshots headless via Edge) atrás de outras páginas quebradas pela remoção do Elementor. Resultado:

| Página | Estado |
|---|---|
| Categorias de produto | ✅ corrigido (mu-plugin `segbrasil-shop-design`) |
| Produto individual (`/produto/*`) | ✅ OK (template do Smmloja, não Elementor) |
| Blog (arquivo) + post individual | ✅ OK (Smmloja) |
| Home | ✅ OK (landing completa do Smmloja; `show_on_front=posts` mas o plugin renderiza) |
| Política de Privacidade / Status do Pedido / Minha conta | ✅ OK |
| "Dúvidas Frequentes" / "Como Funciona" | ✅ são âncoras da home (`#FAQ`, `#Comofunciona`), não páginas |
| **Contato** (`/contato/`, id 30524) | ❌ **quebrada** (era Elementor) → **corrigida** |
| Checkout `/finalizar-compra/` (id 27341) | ⚠️ `ERR_TOO_MANY_REDIRECTS` só com carrinho vazio em navegador limpo. Fluxo real de compra é produto→"Continuar"→checkout do Smmloja e **os pedidos fluem normal**, então não afeta vendas. Confirmar com compra real se quiser. |

**Fix da Contato:** a página tinha `_elementor_data` (4KB) mas o `post_content` guardava o conteúdo cru (imagem, "Fale Conosco", WhatsApp, endereço, iframe do Maps) que renderizava sem layout. Reescrevi o `post_content` com HTML moderno auto-contido (`<style>` scoped `.sb-ct__*`, fontes Sora+Manrope, card com CTA verde do WhatsApp `api.whatsapp.com/send/?phone=5511971321956`, infos com ícones, mapa do Google embutido). Atualizado via `wp eval` com `kses_remove_filters()` (senão o KSES do wp-cli remove o `<style>`). Backup do conteúdo antigo em `/tmp/contato-bak-*.html` no servidor. Não mexi no `_elementor_data` (Elementor inativo o ignora).

**Dica geral:** páginas com `<<REMOVIDO>>` = candidatas a quebradas. Query: `SELECT p.ID,p.post_title FROM Seg_Br_posts p JOIN Seg_Br_postmeta m ON m.post_id=p.ID WHERE m.meta_key='<<REMOVIDO>>' AND p.post_type='page' AND p.post_status='publish'`. Mas várias (Status, Contato antes) são renderizadas pelo Smmloja e ficam OK mesmo com o meta — sempre conferir visualmente.

### 2026-08-31 — App instalável (PWA) + 10% de desconto automático nas compras pelo app

**Pedido:** transformar o site em app instalável (igual enjai.com.br, que é Next.js) e dar **10% de desconto fixo em toda compra feita pelo aplicativo**.

**Implementado (tudo em mu-plugin + estáticos, independente do tema/Elementor):**
- **PWA:** `manifest.webmanifest`, `sw.js` (service worker próprio, network-first p/ páginas/checkout, cache-first p/ imagens, offline.html), ícones `app-icon-192/512/maskable-512.png` — todos no **web root** (`/home/segbrasil/htdocs/seguidoresbrasil.com.br/`). Ícone gerado com Edge headless (gradiente azul→violeta + seta de crescimento + ponto verde/amarelo BR).
- **mu-plugin `segbrasil-pwa.php`:** injeta as tags PWA no `<head>` (manifest, theme-color #1a5cff, apple-touch-icon, apple-mobile-web-app-*); no footer registra o SW, detecta standalone/iOS/Android e mostra a **barra "Instalar app"** (prompt nativo no Android via `beforeinstallprompt`; **modal de 3 passos** no iOS, que não tem prompt).
- **Desconto 10%:** cupom WooCommerce **`APP10`** (10%, sem limites, id 1543022). O JS grava o cookie **`sb_app=1`** quando o site roda como app (`display-mode: standalone` ou `navigator.standalone`). O mu-plugin auto-aplica o `APP10` no `woocommerce_before_calculate_totals` quando o cookie está presente, e **remove** se não estiver (garante que o desconto só vale dentro do app). O checkout do Smmloja usa `WC()->cart` e mostra os cupons via `get_coupons()`, então o desconto aparece.

**Verificado:** `wc_load_cart()` com `$_COOKIE['sb_app']='1'` → cupom `app10` aplicado, R$200 → **R$20 de desconto (10%)**; sem o cookie → R$0. Barra de instalação confere no mobile (UA iPhone). Site HTTP 200 sem erro fatal.

**v1.1 (2026-08-31) — barra de topo persistente + aviso de desconto no checkout** (a pedido do Renato, igual ao enjai.com.br):
- **Barra fixa no TOPO** (mobile), sempre visível em todas as páginas: "💸 Baixe o app e ganhe 10% OFF →" (gradiente azul). A barra INTEIRA é clicável → prompt nativo (Android) ou modal de 3 passos (iOS). Persistente (some só quando instala). Empurra o `header.fixed` do site pra baixo via `html.sb-appbar-on header.fixed{top:var(--sb-abh)}` + `body{padding-top}` (altura medida em JS: `--sb-abh`).
- **Barra VERDE "10% ativo"** quando roda dentro do app (standalone): "🎉 Você tem 10% de desconto, aplicado sozinho no checkout" — aparece em TODAS as páginas inclusive checkout, informando o desconto (o 2º pedido do Renato). Dismissível (sessionStorage).
- **Rótulo do cupom** no total: filtro `woocommerce_cart_totals_coupon_label` → "🎉 Desconto do app (10%)" em vez de "APP10".
- **Lições de layout (custei muitas iterações):** o CSS global do site (Tailwind/Smmloja) impede `flex:1`/grid de encolher e `white-space` de quebrar dentro da barra — solução que funcionou: `display:block`, texto curto ("Baixe o app e ganhe 10% OFF →"), `white-space:normal !important`, barra inteira clicável (sem botão separado, que não renderizava).
- **A HOME não mostrava a barra** (v1.1): a landing pesada do Smmloja envolve o conteúdo num wrapper com stacking context que escondia a barra fixa (o JS rodava — classes `on`/`sb-appbar-on` aplicadas — mas não pintava). **Fix:** mover a barra e o modal pro final do `<body>` via JS (`document.body.appendChild`) + `z-index:2147483000` + `isolation:isolate`. Aí renderizou na home também.
- **Mostra no DESKTOP também** (não só mobile): a pedido do Renato, que testou no PC e não via. No desktop o clique usa o prompt nativo do Chrome/Edge; o modal tem passos próprios de desktop (`stepsDesktop`).
- **Bug do header escondido (2026-09-01):** no app (standalone), a barra verde quebrava em 2 linhas (mais alta), mas o `--sb-abh` (empurrão do header) tinha sido medido com 1 linha → o logo/header ficava atrás da barra. **Fix:** `ResizeObserver` na barra mantendo `--sb-abh = offsetHeight` real + re-medidas em 250ms/900ms/load/giro de tela + texto da barra verde encurtado ("10% OFF ativo — entra sozinho no checkout"). SW `sb-v2`→`sb-v3`. **Regra:** nunca medir a altura da barra uma vez só — use ResizeObserver (a barra cresce quando o texto quebra).
- **SW bump:** `sb-v1` → `sb-v2` pra forçar atualização em quem já tinha visitado. Peça Ctrl+Shift+R / recarregar se ainda vir versão antiga.
- **Animação da barra (2026-08-31):** pra chamar atenção sem ser chato (CSS puro, respeita `prefers-reduced-motion`): (1) gradiente vivo fluindo (`sbFlow`), (2) brilho "foil" passando a cada ~7s (`sbShine`, `::after`), (3) o **"10% OFF" virou selo branco que respira** (`.sb-abar-tx b` como badge + `sbBadge` glow) — destaca o desconto, (4) emoji 💸 balança de leve (`sbWiggle`), (5) seta → cutuca convidando ao toque (`sbNudge`), (6) entrada deslizando do topo (`sbDrop`). Sem mudar os textos.

**Notas:**
- Depende do fix do Set-Cookie de 2026-08-26 (sem ele a sessão/cookie do carrinho não persistiria).
- `manifest.webmanifest` serve como `application/octet-stream` (servido pelo nginx interno :8080). **Não bloqueia instalação** (Chrome/Safari leem via `rel="manifest"`, não validam content-type). Mime type correto já adicionado em `/etc/nginx/mime.types` pro futuro.
- `php -l` dá segfault no CLI (ionCube) — não é erro do arquivo; validar carregando o site (HTTP 200).
- **Não testado E2E na UI do checkout do Smmloja** (só na camada do `WC()->cart`, que é o que o checkout lê). Fazer uma compra real de teste pelo app confirma 100% o desconto na tela.
- `lets-encrypt`/cupons: `APP10` fica visível no admin. Se quiser esconder o campo "Aplicar cupom" pra não vazarem o código, é outra tarefa.

### 2026-09-01 — Notificações do site no Telegram (bot @Seguidores_brasil_bot)

Bot criado pelo Renato pra receber tudo que acontece no site (estilo enjai).
- **Token:** `<<REMOVIDO>>` (no `SB_TG_TOKEN` do mu-plugin).
- **chat_id destino:** `7945216822` (conta "Agencia Popular" que mandou /start) — salvo em `wp option get sb_tg_chat_id`.
- **mu-plugin:** `wp-content/mu-plugins/segbrasil-telegram.php`. Envia via `wp_remote_post` **não-bloqueante** (`blocking=>false`) pra não atrasar o site.
- **Eventos:** 💰 venda (paga, hooks `woocommerce_order_status_processing` + `woocommerce_payment_complete`, dedup por meta `_sb_tg_paid`, marca se veio pelo app), ✅ concluído, ❌ cancelado, ↩️ reembolsado, 👤 novo cadastro (`user_register`), 📲 app instalado (JS `appinstalled` → `admin-ajax.php?action=sb_app_installed`, anti-flood 20s/IP).
- **Ligar/desligar tipos:** `wp option update sb_tg_events '{"signup":"off"}' --format=json` (chaves: sale, completed, cancelled, refunded, signup, install).
- **Mudar destino:** `wp option update sb_tg_chat_id <novo_id>`. Pra um GRUPO: adiciona o bot ao grupo, manda msg, e o id (negativo) aparece no `getUpdates`.
- **Teste:** `wp eval "sb_tg_send('teste');" --allow-root`.
- **Não há sistema de tickets** neste site (suporte é WhatsApp), então não há evento de ticket.
- Kit reutilizável (com o plugin) em `d:\SISTEMAS\MinhasHospedagens\PWA-KIT-WooCommerce\segbrasil-telegram.php`.

## Observações

- O servidor é **autônomo do Renato** — não está na rede QMIX. Não roda Antonio nem o sistema editorial. Todos os sites são SMM.
- Ao mexer aqui, sempre confirmar com o Renato antes de alterações intrusivas em código de plugin (Smmloja é proprietário e tem update mechanism — mudanças no plugin se perdem em update; preferir mu-plugins).
- Os arquivos `.bak-*` em `/etc/php/*/fpm/pool.d/` são versionamento manual de configs antes de cada change.
- Tabelas `*_bak_YYYYMMDD` em `Seg_Br_*` são backups dos fixes do dia — limpar após 7 dias se nada deu errado.
