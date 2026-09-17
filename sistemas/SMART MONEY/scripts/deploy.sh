#!/usr/bin/env bash
# deploy.sh — Deploy zero-downtime para QMIX Invest
# Executar na VPS srv1166087 dentro de /opt/qmix-invest

set -euo pipefail
cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"

# Carrega .env (sem export blanket — apenas se a variável de telegram existir)
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . .env
  set +a
fi

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

log() { echo "[$(date +%H:%M:%S)] $*"; }
notify() {
  local msg="$1"
  if [ -n "<<REMOVIDO>>" ] && [ -n "<<REMOVIDO>>" ]; then
    curl -sS --max-time 10 -X POST \
      "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_OWNER_CHAT_ID}" \
      -d "text=${msg}" >/dev/null || log "(falha ao notificar Telegram)"
  fi
}

run() {
  log "+ $*"
  if [ "$DRY_RUN" = "1" ]; then return 0; fi
  "$@"
}

# 0. Snapshot do estado atual
PREV_TAG=$(docker compose images app --format '{{.Tag}}' 2>/dev/null | head -n1 || echo "none")
PREV_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "none")
echo "$PREV_COMMIT" > "$PROJECT_ROOT/.deploy-prev-commit"
log "Snapshot: previous tag=$PREV_TAG, commit=$PREV_COMMIT"

# 1. Pull + build
run git fetch
run git pull --ff-only
NEW_TAG="v$(date -u +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
log "New tag: $NEW_TAG"
run docker compose build --pull \
  --build-arg APP_VERSION="$NEW_TAG" \
  app worker

run docker tag qmix-invest-app:latest "qmix-invest-app:$NEW_TAG"
run docker tag qmix-invest-worker:latest "qmix-invest-worker:$NEW_TAG"

# 2. Migrate (com lock distribuído — seguro de chamar múltiplas vezes)
run docker compose run --rm worker node worker/dist/migrate.js

# 3. Roll app (uma instância por vez)
for service in app app-b; do
  log "Deploying $service..."
  run docker compose up -d --no-deps --build "$service"

  # Healthcheck loop
  for i in $(seq 1 30); do
    if [ "$DRY_RUN" = "1" ]; then break; fi
    if docker compose exec -T "$service" wget -qO- http://localhost:3000/api/health 2>/dev/null | grep -q '"status":"ok"'; then
      log "  $service healthy"
      break
    fi
    sleep 2
    if [ "$i" = "30" ]; then
      log "FAIL: $service não passou healthcheck"
      notify "❌ Deploy QMIX Invest FAILED no $service. Iniciando rollback."
      "$PROJECT_ROOT/scripts/rollback.sh" "$PREV_TAG"
      exit 1
    fi
  done
  sleep 3  # janela para Nginx detectar
done

# 4. Roll worker
for service in worker worker-b; do
  log "Deploying $service..."
  run docker compose up -d --no-deps --build "$service"
  sleep 5
done

# 5. Verificação dos OUTROS sites/bots da VPS (CRÍTICO)
log "Verificando outros sites e bots do host..."
if [ "$DRY_RUN" = "0" ] && ! "$PROJECT_ROOT/scripts/verify-other-sites.sh"; then
  log "ALERTA: outros sites afetados. Iniciando rollback..."
  notify "🚨 Deploy QMIX Invest afetou outros sites. Rollback automático iniciado."
  "$PROJECT_ROOT/scripts/rollback.sh" "$PREV_TAG"
  exit 2
fi

# 6. Tag :previous para rollback rápido
run docker tag "qmix-invest-app:$NEW_TAG" qmix-invest-app:previous
run docker tag "qmix-invest-worker:$NEW_TAG" qmix-invest-worker:previous

# 7. Limpeza de imagens antigas (mantém últimas 5 versões)
run docker image prune -f --filter "label=app=qmix-invest" --filter "until=168h" || true

log "✅ Deploy $NEW_TAG concluído."
notify "✅ Deploy QMIX Invest $NEW_TAG concluído. Outros sites verificados OK."
