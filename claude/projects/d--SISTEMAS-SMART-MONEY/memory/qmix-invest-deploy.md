---
name: qmix-invest-deploy
description: "QMIX Invest (Smart Money B3) — infra de hospedagem, acesso SSH e fluxo de deploy preferido"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5d12783c-7348-4eef-ac92-10bc8fe1d654
---

QMIX Invest roda numa VPS Hostinger: `ssh hostinger-vps-srv1166087` (IP 31.97.173.40, host srv1166087.hstgr.cloud, chave `<<REMOVIDO>>`). Projeto em `/opt/qmix-invest`, domínio https://qf.qmix.digital. Runtime = Docker Compose com 2× app (portas 3010/3011, healthy), 2× worker e postgres (`qmix-invest-postgres`).

**Atenção:** `/opt/qmix-invest` NÃO é repo git — o deploy foi feito copiando arquivos (rsync/scp), mesmo que `scripts/deploy.sh` assuma `git pull`. O `.env` de produção fica em `/opt/qmix-invest/.env` (root-only).

**Why:** Editar direto na VPS sai do controle de versão e arrisca divergência com o repo local `d:\SISTEMAS\SMART MONEY`.

**How to apply:** Fluxo escolhido pelo user = **local primeiro, depois deploy**: editar no repo local → commit no git → enviar pra VPS → `docker compose build` → recriar containers (zero-downtime: workers primeiro, depois `up -d --no-deps --force-recreate app`, esperar 3010 healthy, então app-b).

**Detalhes de deploy aprendidos (2026-06-24):** `rsync` NÃO existe no Git Bash local — usar `git archive --format=tar.gz -o <scratchpad>/deploy.tar.gz HEAD`, enviar com `cat deploy.tar.gz | ssh hostinger-vps-srv1166087 'cat > /tmp/deploy.tar.gz'` (scp deu "Connection closed"), e extrair com `cd /opt/qmix-invest && rm -rf app/src worker/src db/src db/migrations && tar xzf /tmp/deploy.tar.gz` (`.env` e `backups/` ficam fora do git archive, preservados). Migrations são **SQL puro à mão aplicadas manualmente** (`docker exec -i qmix-invest-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < arquivo.sql`) — o journal Drizzle está congelado em 0005 e NÃO deve ser tocado. Schedules pg-boss órfãos: `delete from pgboss.schedule where name in (...)`. Credenciais do banco vêm de `set -a; . .env; set +a` no diretório do projeto.
