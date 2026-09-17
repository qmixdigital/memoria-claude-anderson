#!/usr/bin/env bash
# bootstrap-historical-data.sh
# Roda seeds + enfileira jobs de bootstrap. Executar UMA VEZ no primeiro deploy.

set -euo pipefail
cd "$(dirname "$0")/.."

log() { echo "[$(date +%H:%M:%S)] $*"; }

log "==> Aplicando migrations..."
docker compose exec -T worker node worker/dist/migrate.js

log "==> Rodando seeds (companies, tickers, tier-1 funds)..."
docker compose exec -T worker node worker/dist/seeds/index.js

log "==> Enfileirando jobs de bootstrap (prioridade -10)..."
docker compose exec -T worker node worker/dist/bootstrap.js

log ""
log "✅ Bootstrap iniciado. Os scrapers vão rodar em background."
log ""
log "Para acompanhar:"
log "  docker compose exec postgres psql -U qmix_invest -d qmix_invest -c \\"
log "    'SELECT source, status, items_inserted, finished_at FROM qmix_invest.scraper_runs ORDER BY started_at DESC LIMIT 50;'"
log ""
log "Ou via container:"
log "  docker compose logs -f worker | grep -E 'scraper|cvm|b3'"
