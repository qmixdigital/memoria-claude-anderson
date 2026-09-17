# VPS CliqueX

VPS dedicada e isolada para o projeto **CliqueX** (Painel Rotador de Links).
Hospeda o painel administrativo + endpoint de redirect que distribui cliques entre múltiplos destinos parceiros em rodízio round-robin global.

Plano de desenvolvimento do projeto: `d:\SISTEMAS\CLIQUEX\PLANO_ROTADOR.md`

---

## Resumo

| Campo | Valor |
|-------|-------|
| **Plano** | VPS 30 |
| **Custo** | EUR 30,00 / mês |
| **Pago até** | 24/06/2026 |
| **Renovação automática** | **DESATIVADA** (renovar manualmente) |
| **Provisionado em** | 24/05/2026 |
| **Setup inicial concluído em** | 24/05/2026 |
| **Localização** | Europa |
| **Distro** | Debian 13 (Trixie), kernel 6.12 |
| **vCPUs** | 2 |
| **RAM** | 3,0 GB |
| **Disco** | 30 GB (rbd, Ceph backend) |
| **Tráfego incluso** | 3,0 TB / mês |
| **Swap** | **Não disponível** (bloqueado pelo provedor via cgroup `memory.swap.max=0`) |
| **Timezone** | `America/Sao_Paulo` |

---

## Rede

| Tipo | Endereço |
|------|----------|
| **IPv4** | `45.142.141.184` |
| **IPv6** | `2a0a:3840:8078:141::2d8e:8db8:1337` |
| **FQDN (rDNS)** | `2d8e8db8.host.example.net` |

---

## Acesso SSH

Root login está **DESABILITADO**. Acesso é via usuário `deploy` com sudo NOPASSWD.

| Campo | Valor |
|-------|-------|
| **Usuário** | `deploy` |
| **Porta** | `22` |
| **Autenticação** | Somente chave SSH |
| **Chave pública** | `ssh-ed25519 <<REMOVIDO>>+vplX0iRgXPun8m97DhsEbIg4FhFzUnCJ0/KVoX5 cliquex-vps-20260524` |
| **Chave privada** | `<<REMOVIDO>>` (sem passphrase) |
| **Fingerprint SHA256** | `Ahcg0b+d4ld5eqSeFytq5wJwuQk2iWTv3kE/yIowMkE` |
| **Sudo** | NOPASSWD (regra em `/etc/sudoers.d/deploy-nopasswd`) |

### Aliases SSH (já configurados em `C:\Users\User\.ssh\config`)

```
Host cliquex
    HostName 45.142.141.184
    User deploy
    IdentityFile ~/.ssh/id_ed25519_cliquex
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3

Host cliquex-root
    HostName 45.142.141.184
    User root
    IdentityFile ~/.ssh/id_ed25519_cliquex
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

- `ssh cliquex` → entra como `deploy` (uso normal)
- `ssh cliquex-root` → **bloqueado** no servidor (`PermitRootLogin no`), só serve para o dia em que reabilitar root

Para sair temporariamente de deploy pra root no servidor: `sudo -i`.

---

## Painel do provedor

| Recurso | Acesso |
|---------|--------|
| **Painel web** | login na conta do provedor |
| **Reiniciar / Reconstruir** | Painel → VPS → CliqueX |
| **Atualizar plano** | Painel → VPS → CliqueX → Atualização |
| **Console KVM** | Painel → VPS (única forma de recuperar acesso se sshd cair) |

---

## Atenção: renovação manual

A renovação automática **está desativada**. A VPS expira em **24/06/2026**. Renovar manualmente via painel antes da data.

---

## Domínio

| Campo | Valor |
|-------|-------|
| **Domínio** | `cliquex.click` |
| **Registrado em** | 24/05/2026 |
| **Válido até** | 24/05/2027 |
| **Renovação automática** | DESATIVADA |
| **Nameservers** | do próprio registrador (sem Cloudflare nem custom NS) |

Registros DNS configurados:

| Tipo | Nome | Valor |
|---|---|---|
| A | `@` | `45.142.141.184` |
| AAAA | `@` | `2a0a:3840:8078:141::2d8e:8db8:1337` |
| A | `www` | `45.142.141.184` |
| AAAA | `www` | `2a0a:3840:8078:141::2d8e:8db8:1337` |

> Decisão: **não usar Cloudflare**. O endpoint de redirect precisa do IP real do clique pra antifraude, e proxy Cloudflare mascara isso. DNS direto do registrador é simples e suficiente.

---

## Política: 100% na VPS

Decisão do dono: **tudo roda na própria VPS**. Sem serviços externos, sem repositório remoto.

Implicações:
- **Sem repositório GitHub/GitLab**. Versionamento via `git init` local em `/home/deploy/cliquex` para histórico (commits diários), mas nunca `git push` para remoto.
- **Sem backup externo** (B2/R2/S3). Backups ficam só em `/var/backups/postgres/` com 7 dias de retenção. Risco aceito.
- **Sem CI/CD externo**. Build, lint e teste rodam na própria VPS.
- **Sem analytics externos** (Plausible/GA self-hosted opcional mais tarde, mas tudo dentro da VPS).
- **Sem CDN**. Nginx serve assets estáticos diretamente.
- **Sem serviços de log externos** (Logflare/Datadog). `journalctl`, PM2 logs e `/var/log/nginx/` no servidor.

Workflow de desenvolvimento recomendado:
1. **VS Code Remote-SSH** do notebook conectando como `deploy` no alias `cliquex`. Edição direto nos arquivos do servidor, terminal integrado.
2. `git init` em `/home/deploy/cliquex` pra ter histórico de mudanças (commits locais, sem push).
3. Tar.gz semanal manual do `/home/deploy/cliquex` em `/var/backups/code/` (caso queira proteger o código além do banco).

---

## Stack instalado

| Componente | Versão | Notas |
|------------|--------|-------|
| **Debian** | 13 (Trixie) | kernel 6.12.86 |
| **Node.js** | 22.22.2 LTS | via NodeSource |
| **npm** | 10.9.7 | |
| **Bun** | 1.3.14 | em `/home/deploy/.bun/bin/bun`, symlink em `/usr/local/bin/bun` |
| **PostgreSQL** | 17.10 | via PGDG, listen `localhost` apenas |
| **Nginx** | 1.26.3 | Debian repo |
| **certbot** | 4.0.0 | + plugin `python3-certbot-nginx` |
| **PM2** | 7.0.1 | global, systemd unit `pm2-deploy` (rodando como deploy) |
| **fail2ban** | (Debian default) | jail `sshd` ativo |
| **UFW** | (Debian default) | regras: 22, 80, 443 |
| **unattended-upgrades** | (Debian default) | só patches Debian-Security |

---

## PostgreSQL — banco do CliqueX

| Campo | Valor |
|-------|-------|
| **Host** | `localhost` (não exposto na internet) |
| **Porta** | `5432` |
| **Banco** | `cliquex_db` |
| **Usuário app** | `cliquex_app` |
| **Senha** | `<<REMOVIDO>>` |
| **Encoding** | UTF8 + LC `en_US.UTF-8` |
| **Auth** | <<REMOVIDO>> |
| **Arquivo segredo no servidor** | `/root/.cliquex_secrets` (modo 600) |

### Connection string

```
<<REMOVIDO>>
```

### Tuning aplicado (3 GB RAM, 2 cores, SSD)

Arquivo: `/etc/postgresql/17/main/conf.d/99-cliquex-tuning.conf`

| Parâmetro | Valor |
|-----------|-------|
| `shared_buffers` | 768MB (25% RAM) |
| `effective_cache_size` | 2GB |
| `maintenance_work_mem` | 192MB |
| `work_mem` | 16MB |
| `max_connections` | 50 |
| `random_page_cost` | 1.1 (SSD) |
| `effective_io_concurrency` | 200 (SSD) |
| `max_worker_processes` | 2 (= cores) |
| `max_parallel_workers_per_gather` | 1 |
| `wal_buffers` | 16MB |
| `max_wal_size` | 1GB |
| `checkpoint_completion_target` | 0.9 |
| `log_min_duration_statement` | 1000 (loga queries acima de 1s) |

---

## Backup do PostgreSQL

| Campo | Valor |
|-------|-------|
| **Script** | `/usr/local/bin/pg-backup.sh` |
| **Diretório** | `/var/backups/postgres/` (modo 750, dono postgres) |
| **Formato** | `pg_dump --format=custom` + gzip |
| **Retenção** | 7 dias (`find ... -mtime +7 -delete`) |
| **Frequência** | Diária às 03:00 (`/etc/cron.d/cliquex-pg-backup`) |
| **Log** | `/var/log/pg-backup.log` |

### Backup externo: não aplicável

Decisão do dono: **100% na VPS, sem serviços externos**. Backup externo (B2/R2/S3) está **fora de escopo** por ora. Risco do disco falhar é mitigado pelo storage backend ser Ceph RBD (redundância de bloco), mas o risco residual de perda total existe e é aceito.

Se quiser proteção extra **sem sair da VPS**: programar `scp`/`rsync` periódico do `/var/backups/postgres/` pra outra VPS do parque (opengravity, por exemplo) via SSH. Não é "externo" no sentido de serviço de terceiros, é um host próprio.

---

## Segurança aplicada

- SSH:
  - `PermitRootLogin no`
  - `PasswordAuthentication no`
  - `PubkeyAuthentication yes`
  - Backup do config original em `/etc/ssh/sshd_config.bak-20260524`
- UFW: default deny inbound, allow 22/80/443 tcp (v4 + v6)
- fail2ban: jail `sshd` mode aggressive, ban 1h após 5 falhas em 10 min
- unattended-upgrades: ativo, só `Debian-Security`, sem reboot automático
- PostgreSQL: listen apenas `localhost`, <<REMOVIDO>>
- sudo: `deploy` tem NOPASSWD (necessário para automações de deploy)

---

## Vhost Nginx (provisório)

Arquivo: `/etc/nginx/sites-available/cliquex.click`

- Listen 80 (HTTP). HTTPS é adicionado pelo certbot depois.
- `upstream cliquex_backend` apontando para `127.0.0.1:3005` e `127.0.0.1:3006` (duas instâncias PM2, regra de zero-downtime).
- `proxy_next_upstream error timeout http_502 http_503 http_504` (failover).
- Headers `X-Real-IP` e `X-Forwarded-For` propagados (para a app ler IP real do cliente).
- Enquanto o backend não subiu, o vhost serve uma página HTML "Sistema em preparação".
- Endpoint `/health` retorna `ok` (útil pra monitoramento).
- Diretório ACME (`/var/www/html/.well-known/acme-challenge/`) configurado para o certbot.

---

## Próximos passos (deploy da app)

1. **Esperar DNS propagar** (`nslookup cliquex.click 8.8.8.8` deve mostrar `45.142.141.184`).
2. **Emitir SSL** com `certbot --nginx -d cliquex.click -d www.cliquex.click`.
3. **Bootstrap do projeto** direto na VPS (workflow VS Code Remote-SSH):
   ```bash
   cd /home/deploy
   bun create next-app cliquex --typescript --app --no-tailwind --no-eslint --no-src-dir --import-alias '@/*'
   cd cliquex
   git init && git add -A && git commit -m "bootstrap"
   bun add prisma @prisma/client
   bunx prisma init --datasource-provider postgresql
   ```
4. **Configurar `.env`** com a connection string do `cliquex_db`.
5. **Schema Prisma** (`links`, `rotador_estado`, `cliques_hora`) + `bunx prisma migrate dev`.
6. **Seed**: `INSERT INTO rotador_estado (id, ponteiro) VALUES (1, 0);`.
7. **Endpoint `/r/[id]`** com `UPDATE ... RETURNING` atômico e redirect 302.
8. **Teste de concorrência** (`pgbench` simulando 50 conexões) antes de seguir.
9. **CRUD do painel** + autenticação simples (next-auth credentials ou cookie próprio).
10. **Relatórios**.
11. **Bot Telegram** + cron jobs em `/etc/cron.d/cliquex-alerts`.
12. **Deploy**:
    - `bun install --production` (após dev terminar)
    - `bun run build`
    - `ecosystem.config.cjs` com PM2 (duas instâncias, portas 3005 e 3006, `max_memory_restart: '700M'`)
    - `pm2 start ecosystem.config.cjs && pm2 save`
    - Nginx já tá pronto (upstream `cliquex_backend` aponta pras portas certas)
13. **Configurar `max_memory_restart`** no PM2 (`'700M'`) — sem swap, evita OOM kill geral.

---

## Atenção: sem swap

O provedor bloqueou swap via cgroup. Implicações:

- `next build` pode estourar a RAM se rodar junto com Postgres + PM2 + Nginx. Mitigações:
  - Build em CI/local e envio do `.next` pronto via `rsync`.
  - Ou parar uma instância PM2 durante o build (mas quebra zero-downtime — usar a outra opção).
- OOM kill é imediato. Configurar `max_memory_restart` no PM2 e alerts no Telegram para watch de RAM.
- `vm.overcommit_memory=1` pode aliviar (permite alocação otimista), mas aumenta risco de OOM. Não aplicado por enquanto.

---

## App em produção

| Campo | Valor |
|-------|-------|
| **URL pública** | https://cliquex.click |
| **Painel admin** | https://cliquex.click/clk |
| **Senha admin** | `J0vl5EU3HvyhR0QYtEMzXrG` |
| **Endpoint de redirect (botão do cliente)** | https://cliquex.click (302) |
| **Diretório da app** | `/home/deploy/cliquex` |
| **Stack** | Next.js 16.2.6 (App Router) + Prisma 7.8 + Tailwind v4 |
| **Runtime** | Bun (package manager) + Node 22 (PM2 runs `next start`) |
| **Auth** | senha única via cookie HMAC-SHA256 (segredo em `/root/.cliquex_secrets`) |

### PM2

| Instância | Porta | Comando |
|---|---|---|
| cliquex-a | 3005 | `next start -p 3005` |
| cliquex-b | 3006 | `next start -p 3006` |

Nginx faz upstream com `proxy_next_upstream` (failover automático se uma cair).
Deploy zero-downtime: `pm2 reload cliquex-a && sleep 2 && pm2 reload cliquex-b`.

### Links iniciais cadastrados (14, sequência conforme briefing)

Distribuição: nexo/zap/play = 4 cliques cada por ciclo; playbrasil = 2 cliques por ciclo (peso menor).

| # | Label | URL |
|---|---|---|
| 1 | Nexoplay | https://nexoplay.top/ |
| 2 | Zapplus | https://zapplus.top/ |
| 3 | Playplus | https://playplus.mov/ |
| 4 | Nexoplay | https://nexoplay.top/ |
| 5 | Zapplus | https://zapplus.top/ |
| 6 | Playplus | https://playplus.mov/ |
| 7 | Playbrasil | https://playbrasil.top/ |
| 8 | Nexoplay | https://nexoplay.top/ |
| 9 | Zapplus | https://zapplus.top/ |
| 10 | Playplus | https://playplus.mov/ |
| 11 | Nexoplay | https://nexoplay.top/ |
| 12 | Zapplus | https://zapplus.top/ |
| 13 | Playplus | https://playplus.mov/ |
| 14 | Playbrasil | https://playbrasil.top/ |

### Comandos úteis de operação

```bash
# Status das instâncias
ssh cliquex 'pm2 list'
ssh cliquex 'pm2 logs --lines 50'

# Reload zero-downtime após editar código
ssh cliquex 'cd /home/deploy/cliquex && bun run build && pm2 reload cliquex-a && sleep 2 && pm2 reload cliquex-b'

# Inspecionar banco
ssh cliquex 'sudo -u postgres psql cliquex_db'

# Stats rápidas
ssh cliquex 'sudo -u postgres psql cliquex_db -c "SELECT label, SUM(\"cliquesTotal\") FROM links GROUP BY label ORDER BY 2 DESC;"'

# Backup manual
ssh cliquex 'sudo /usr/local/bin/pg-backup.sh'

# Reset do ponteiro (cuidado, zera distribuição)
ssh cliquex 'sudo -u postgres psql cliquex_db -c "UPDATE rotador_estado SET ponteiro = 0;"'
```

---

## Histórico

| Data | Evento |
|------|--------|
| 24/05/2026 | VPS contratada e provisionada |
| 24/05/2026 | Chave SSH `id_ed25519_cliquex` gerada e cadastrada no painel |
| 24/05/2026 | Setup inicial concluído: hardening, stack completo, banco criado, backups agendados |
| 24/05/2026 | Domínio `cliquex.click` registrado (vence 24/05/2027, auto-renew OFF) |
| 24/05/2026 | DNS apontado (A + AAAA para `@` e `www`) e propagado |
| 24/05/2026 | Vhost Nginx criado + SSL Let's Encrypt emitido (cliquex.click + www), HTTP→HTTPS 301 ativo, auto-renew via `certbot.timer` |
| 24/05/2026 | **App v1 deployed**: Next.js + Prisma + 14 links seeded, PM2 com 2 instâncias, painel admin operacional |
| 24/05/2026 | **v2**: painel movido pra `/clk`, raiz `/` virou o endpoint de redirect (botão usa `https://cliquex.click` sem path), dark theme, drag-and-drop, relatórios por plataforma com 12 períodos (30m..todos), mobile responsivo, PWA installable, bot blocking no Nginx (444 close connection pra crawlers/AI/SEO) + headers X-Robots-Tag |
