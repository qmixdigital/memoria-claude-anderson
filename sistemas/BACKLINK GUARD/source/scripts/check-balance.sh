#!/bin/bash
# Wrapper do alerta de saldo DataForSEO (chamado pelo cron diário).
# Carrega o .env e roda o check com log.
cd /var/www/backlinkguard || exit 1
export PATH=/root/.bun/bin:$PATH
set -a; . ./.env; set +a
bun run scripts/check-balance.ts >> /var/log/backlinkguard-balance.log 2>&1
