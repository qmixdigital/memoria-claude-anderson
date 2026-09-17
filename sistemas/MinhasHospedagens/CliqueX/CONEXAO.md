# Conexão — VPS CliqueX

VPS dedicada do projeto **CliqueX** (Painel Rotador de Links).

---

## Acesso rápido

| Campo | Valor |
|-------|-------|
| **Host (IPv4)** | `45.142.141.184` |
| **Host (IPv6)** | `2a0a:3840:8078:141::2d8e:8db8:1337` |
| **FQDN** | `2d8e8db8.host.example.net` |
| **Porta SSH** | `22` |
| **Usuário** | `deploy` (root login está DESABILITADO) |
| **Sudo** | `sudo -n` (NOPASSWD) |
| **Chave privada** | `<<REMOVIDO>>` |
| **Fingerprint** | `SHA256:Ahcg0b+d4ld5eqSeFytq5wJwuQk2iWTv3kE/yIowMkE` |
| **OS** | Debian 13 |

---

## Comando de conexão

```bash
ssh cliquex
```

(equivale a `ssh -i ~/.ssh/id_ed25519_cliquex deploy@45.142.141.184`)

Para virar root no servidor depois de logar:

```bash
sudo -i
```

---

## Aliases já configurados em `~/.ssh/config`

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

> `ssh cliquex-root` falha hoje porque `PermitRootLogin no` está ativo. O alias fica registrado pra se um dia precisar reabilitar root.

---

## Banco PostgreSQL (somente localhost no servidor)

| Campo | Valor |
|-------|-------|
| **Banco** | `cliquex_db` |
| **Usuário** | `cliquex_app` |
| **Senha** | `<<REMOVIDO>>` |
| **Conexão local (no servidor)** | `psql -U cliquex_app -h localhost cliquex_db` |
| **Conexão remota** | DESABILITADA (listen `localhost`) |

### Tunnel SSH para acessar Postgres do notebook

```bash
ssh -L 5432:localhost:5432 cliquex
# em outro terminal: psql -U cliquex_app -h localhost cliquex_db
```

### Connection string (uso pela app)

```
<<REMOVIDO>>
```

---

## Comandos úteis no servidor

```bash
# Status geral
systemctl is-active postgresql nginx fail2ban ufw pm2-deploy

# Logs do PM2 (quando app estiver rodando)
pm2 list
pm2 logs

# Backup manual do Postgres
sudo /usr/local/bin/pg-backup.sh

# Lista de backups
ls -lh /var/backups/postgres/

# Ver banimentos atuais
sudo fail2ban-client status sshd

# Status do firewall
sudo ufw status verbose

# Histórico de updates automáticos
sudo cat /var/log/unattended-upgrades/unattended-upgrades.log
```

---

## Reset / Recuperação

Se perder acesso SSH (sshd quebrado, UFW lockou, etc):

1. Acessar painel web do provedor → VPS → CliqueX.
2. Usar o **console KVM web** (acesso direto ao tty, fora do SSH).
3. Logar como `deploy` (root login está bloqueado também via console se a config aceitar). Se precisar de root: `sudo -i`.
4. Se a chave também falhar, usar **Reconstrução** do painel (apaga tudo, reinstala Debian limpo).
   - **Antes**: baixar o backup mais recente de `/var/backups/postgres/` se ainda for possível.
   - **Depois**: refazer o setup deste README + restaurar o banco com `pg_restore`.

---

## Atenção: renovação manual

- **Pago até:** 24/06/2026
- **Renovação automática:** DESATIVADA
- Renovar manualmente todo mês via painel.

---

## App em produção

| Campo | Valor |
|---|---|
| **URL pública** | https://cliquex.click |
| **Painel admin** | https://cliquex.click/clk |
| **Senha admin** | `J0vl5EU3HvyhR0QYtEMzXrG` |
| **Endpoint de redirect (botão)** | https://cliquex.click |
| **Diretório** | `/home/deploy/cliquex` |
| **Processos PM2** | `cliquex-a` (porta 3005) e `cliquex-b` (porta 3006) |

Botão do site do cliente aponta para: `https://cliquex.click/r`

## Comandos úteis

```bash
ssh cliquex                       # entra como deploy
ssh cliquex 'pm2 list'            # status
ssh cliquex 'pm2 logs'            # logs
ssh cliquex 'pm2 reload cliquex-a && sleep 2 && pm2 reload cliquex-b'   # deploy zero-downtime
sudo /usr/local/bin/pg-backup.sh  # backup manual (rodar dentro do ssh)
```

---

## Documentação completa

Ver `README.md` deste diretório.
