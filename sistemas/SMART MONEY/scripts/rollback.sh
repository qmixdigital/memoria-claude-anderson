#!/usr/bin/env bash
# rollback.sh — Reverte deploy para a tag :previous (ou tag específica)
# Uso: ./rollback.sh [TAG]
# Se TAG omitida, usa :previous.

set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . .env
  set +a
fi

TARGET_TAG="${1:-previous}"

log() { echo "[$(date +%H:%M:%S)] $*"; }
notify() {
  local msg="$1"
  if [ -n "<<REMOVIDO>>" ] && [ -n "<<REMOVIDO>>" ]; then
    curl -sS --max-time 10 -X POST \
      "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_OWNER_CHAT_ID}" \
      -d "text=${msg}" >/dev/null || true
  fi
}

log "Rolling back to tag: $TARGET_TAG"

# Verifica que as tags existem
if ! docker image inspect "qmix-invest-app:$TARGET_TAG" >/dev/null 2>&1; then
  log "ERRO: imagem qmix-invest-app:$TARGET_TAG não existe"
  exit 1
fi

# Reverte tags
docker tag "qmix-invest-app:$TARGET_TAG" qmix-invest-app:latest
docker tag "qmix-invest-worker:$TARGET_TAG" qmix-invest-worker:latest

# Recria containers em ordem (app primeiro, worker depois)
for service in app app-b; do
  log "Recriando $service com $TARGET_TAG..."
  docker compose up -d --no-deps --force-recreate "$service"
  sleep 5
done

for service in worker worker-b; do
  log "Recriando $service com $TARGET_TAG..."
  docker compose up -d --no-deps --force-recreate "$service"
  sleep 3
done

# Reverte código local (se .deploy-prev-commit existir)
if [ -f .deploy-prev-commit ]; then
  PREV_COMMIT=$(cat .deploy-prev-commit)
  log "Revertendo git para $PREV_COMMIT"
  git reset --hard "$PREV_COMMIT" || log "(reset falhou, mas containers já foram revertidos)"
fi

log "✅ Rollback concluído para $TARGET_TAG"
notify "⚠️ Rollback executado. QMIX Invest revertido para $TARGET_TAG."
