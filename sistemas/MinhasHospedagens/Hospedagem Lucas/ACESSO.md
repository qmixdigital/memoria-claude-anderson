# Hospedagem Lucas — Hostinger (terceiro)

> ⚠️ **NÃO é hospedagem do QMIX.** Pertence ao **Lucas**. Trabalhar APENAS no projeto contratado (concar.com.br) e com autorização. **NÃO** aplicar operações da rede QMIX aqui (sem content-pruning, sem link-audit, sem deploy de portais, sem mexer nos outros domínios do Lucas). Confirmar antes de qualquer mudança que afete produção.

## Projeto contratado

- **Site:** https://www.concar.com.br/
- **O que é:** consulta veicular oficial pela placa do carro (consulta de dados de veículo).
- **Stack:** **Next.js** (header `x-powered-by: Next.js`, `generator: Next.js`), atrás de **Cloudflare** (orange cloud).
- **Deploy:** via **Coolify** (PaaS open-source em Docker) rodando na VPS abaixo.

## Acesso — API Hostinger (MCP)

O acesso a esta conta é via **API da Hostinger** (MCP `hostinger-api-mcp`), não por painel/SSH direto (ainda).

| Campo | Valor |
|---|---|
| API Token | `<<REMOVIDO>>` |
| Base da API | `https://developers.hostinger.com/api` |
| Auth | header `Authorization: Bearer <token>` |
| MCP server | `npx hostinger-api-mcp@latest` (config em `mcp.json` nesta pasta) |

Exemplos REST (read-only):
```bash
TK=<<REMOVIDO>>
curl -s -H "Authorization: Bearer $TK" https://developers.hostinger.com/api/vps/v1/virtual-machines
curl -s -H "Authorization: Bearer $TK" https://developers.hostinger.com/api/domains/v1/portfolio
```

## VPS (onde roda o Coolify + concar)

| Campo | Valor |
|---|---|
| VPS ID | `1607429` |
| Hostname | `srv1607429.hstgr.cloud` |
| Plano | KVM 8 (8 vCPU, 32 GB RAM, 400 GB disco) |
| OS / template | Ubuntu 24.04 **with Coolify** |
| IPv4 | `2.24.220.46` |
| IPv6 | `2a02:4780:75:77af::1` |
| Senha root (SSH) | `W'5&amlWdMKtt8PU&O)q` (definida/rotacionada 2026-06-09) |
| Estado | running |
| Data center | id 24 |
| Criada em | 2026-04-21 |

**SSH — RESOLVIDO (key-auth):** alias **`concar-lucas`** → `root@2.24.220.46`, chave `<<REMOVIDO>>` (instalada no `authorized_keys` em 2026-06-06; comment `concar-lucas`). Comando: **`ssh concar-lucas`**. (Login primário é por **chave**; a senha de root está registrada na tabela acima como fallback, rotacionada em 2026-06-09.)

**Chave pública "coolify"** (fornecida pelo Lucas; provavelmente já no authorized_keys, é a do Coolify — a privada vive dentro do Coolify, não serve pra meu login):
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF1Z7JPqIX0XYDOClWXZHCuz/TFXT4qnKLk4niA+zSE+ coolify
```

**Coolify:** painel costuma ficar em `http://<IP>:8000` ou subdomínio próprio. Login do Coolify ainda não fornecido (alternativa ao SSH pra deployar/editar o app concar).

## Outros domínios na conta do Lucas (NÃO mexer sem pedido)

| Domínio | Status | Observação |
|---|---|---|
| concar.com.br | — | projeto contratado (não está no portfolio Hostinger; DNS provavelmente no Cloudflare apontando pra VPS) |
| refordiesel.com | active | outro projeto do Lucas |
| bellarico.com.br | active | outro projeto do Lucas |

## App concar no Coolify (mapeado)

| Item | Valor |
|---|---|
| App Coolify (resourceName) | **concar-app** |
| UUID / container | `htumn5rot4sxyhj26zani4e7` (container `htumn5rot4sxyhj26zani4e7-211814898822`) |
| Stack | Next.js, porta interna **3000** (exposto via traefik/Coolify proxy → concar.com.br) |
| Banco | **PostgreSQL 16** — container `v10le9z3d0uap4bvy77cguu8` |
| Dir no servidor | `/data/coolify/applications/htumn5rot4sxyhj26zani4e7/` (`.env`, `docker-compose.yaml`) |
| Deploy | **git-based via Coolify** (imagem buildada do commit `4fb9536…`). Repo fica no painel do Coolify (DB), não no dir do app. |

**Como trabalhar:** editar no repositório Git → push → Coolify rebuilda/deploya; OU redeploy manual pelo painel Coolify. Para inspeção rápida: `ssh concar-lucas` + `docker logs htumn5rot4sxyhj26zani4e7-211814898822`. O `.env` do app tem segredos (não versionar/expor).

**Coolify (host):** containers `coolify`, `coolify-proxy` (traefik v3.6), `coolify-db`, etc. rodando na VPS. URL do painel: pedir ao Lucas (ou descobrir via `docker inspect coolify-proxy` labels). SSH já basta pra operar.

> ⚠️ A VPS hospeda **vários outros apps do Lucas** (múltiplos Postgres/Redis + apps). Mexer **somente** nos recursos `concar-app` e no Postgres do concar.

## 🛡️ BLINDAGEM — regras de operação (NÃO derrubar nenhum site, nem o concar)

**Isolamento (verificado):** cada app é um **projeto docker compose separado**. concar = projeto `htumn5rot4sxyhj26zani4e7` (app) + `v10le9z3d0uap4bvy77cguu8` (Postgres `concar`). Operar por-projeto/por-container é isolado. O que é **compartilhado por TODOS** (mexeu, caiu geral): a rede `coolify`, o `coolify-proxy` (traefik) e o core Coolify.

**Containers de OUTROS apps do Lucas — NUNCA TOCAR:** `drrmr2du012k0ikps92s72ap*` (web/admin/workers/postgres/redis), `c14okyxzsetqsn9roamgjuq0*`, `u1jlv8vbhdmlqkbnlzylv75j*`, `lce6vvld57xc004bm5ofegcr*`, `h8quwn3ppkqqglyxsnjt13uu`, `adew2nx55zjeqczr53ktkugi`, `d9jmyo9godymvgx1sk8tz97y`, `m13a4skzepslw8aqrnkovcsw`, e todo o core `coolify*` (`coolify`, `coolify-proxy`, `coolify-db`, `coolify-redis`, `coolify-realtime`, `coolify-sentinel`).

### ✅ PERMITIDO (escopo concar)
- `docker logs/exec/inspect/stats` **só** em `htumn5rot4sxyhj26zani4e7-211814898822` e `v10le9z3d0uap4bvy77cguu8`.
- Editar o **repositório Git** do concar → push → **redeploy do `concar-app` no painel Coolify** (deploy isolado, com health-check: Coolify só troca o container quando o novo sobe saudável → **zero downtime** do próprio concar).
- Operar o DB **concar** (psql/pg_dump no container `v10le9z3d0uap4bvy77cguu8`, DB `concar`).
- Rodar **`bash /root/concar-backup.sh`** (backup escopado) ANTES de qualquer mudança.
- Editar `/data/coolify/applications/htumn5rot4sxyhj26zani4e7/{.env,docker-compose.yaml}` (config do concar) — e redeploy pelo Coolify.

### 🚫 PROIBIDO (derruba TUDO ou outros apps)
- `docker system prune`, `docker image/volume/network prune`, `docker builder prune` → apagam recursos de todos os apps. **NUNCA.**
- `docker network rm/disconnect coolify` ou mexer na rede `coolify`.
- `restart/stop/rm/down` em `coolify-proxy` (traefik), `coolify`, `coolify-db`, qualquer `coolify*`, ou containers de outros projetos.
- `docker stop/rm $(docker ps -q)` ou qualquer comando em massa.
- `systemctl restart docker`, `reboot`, mudança de firewall/UFW, alterar portas.
- No painel Coolify: **"Redeploy all" / restart do Server / ações no nível do servidor**. Só ações do recurso **concar-app**.
- Encher o disco (dumps/imagens gigantes sem limpar) — manter backups enxutos em `/root/concar-backups/`.

### Antes de mexer / Rollback (tudo escopado ao concar)
1. **Sempre antes:** `ssh concar-lucas 'bash /root/concar-backup.sh'` (dump DB + .env + compose + retag imagem `concar-rollback:latest`).
2. **Rollback do app:** preferir o **Rollback do Coolify** (histórico de deploy do concar-app). Manual: subir a imagem `concar-rollback:latest` no compose do concar e redeploy só desse recurso.
3. **Rollback do DB concar:** `gunzip -c /root/concar-backups/<TS>/concar-db.sql.gz | docker exec -i v10le9z3d0uap4bvy77cguu8 sh -c 'PGPASSWORD=$POSTGRES_PASSWORD psql -U $POSTGRES_USER -d $POSTGRES_DB'` (afeta só o DB concar).
4. **Rede de segurança extra (VPS inteira):** snapshot via API Hostinger — mas **restaurar snapshot reverte TODOS os apps**, então é último recurso; priorizar rollback por-app acima.

**Baseline atual:** `/root/concar-backups/20260606-142609` + imagem `concar-rollback:latest` (commit `4fb9536…`).
