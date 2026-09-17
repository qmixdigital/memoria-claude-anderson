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
#
# `docker compose images app --format {{.Tag}}` devolvia "none" nesta VPS, e o
# rollback entao abortava com "imagem qmix-invest-app:none nao existe" — ou seja,
# a rede de seguranca nunca funcionou. A tag boa e o APP_VERSION que o .env
# tinha ANTES deste deploy (o .env ja foi carregado no topo do script); a imagem
# do container em execucao serve de segunda opcao.
PREV_TAG="${APP_VERSION:-}"
if [ -z "$PREV_TAG" ] || ! docker image inspect "qmix-invest-app:$PREV_TAG" >/dev/null 2>&1; then
  PREV_TAG=$(docker inspect --format '{{.Config.Image}}' qmix-invest-app 2>/dev/null | sed 's/.*://' || echo "")
fi
[ -z "$PREV_TAG" ] && PREV_TAG="previous"
PREV_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "none")
echo "$PREV_COMMIT" > "$PROJECT_ROOT/.deploy-prev-commit"
log "Snapshot: previous tag=$PREV_TAG, commit=$PREV_COMMIT"

# 1. Pull + build
run git fetch
run git pull --ff-only
NEW_TAG="v$(date -u +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
log "New tag: $NEW_TAG"

# CRÍTICO: exportar ANTES de qualquer comando do compose.
#
# O `image:` do compose é qmix-invest-app:${APP_VERSION:-latest}, e o Compose lê
# o .env do diretório sozinho. Sem esta linha, TODO comando abaixo resolvia para
# a tag gravada no .env pelo deploy anterior: o build marcava a imagem com a tag
# velha, o `docker tag ...:latest` promovia uma imagem que ninguém acabou de
# construir, e o `compose run` do migrate rodava num container antigo — que diz
# "migrations applied" sem aplicar nada, porque o journal dele é de outra época.
# Em 07/09/2026 o .env estava preso em APP_VERSION=phase-0-initial e o compose
# vinha resolvendo para imagens de junho.
export APP_VERSION="$NEW_TAG"

run docker compose build --pull \
  --build-arg APP_VERSION="$NEW_TAG" \
  app worker

# As imagens já nascem com $NEW_TAG (o compose usa APP_VERSION exportado acima);
# aqui só movemos o :latest para elas, e não o contrário.
run docker tag "qmix-invest-app:$NEW_TAG" qmix-invest-app:latest
run docker tag "qmix-invest-worker:$NEW_TAG" qmix-invest-worker:latest

# 2. Migrate (advisory lock em conexão dedicada — seguro chamar várias vezes).
# Roda na imagem recém-construída, por causa do export lá em cima.
run docker compose run --rm worker node worker/dist/migrate.js

# 3. Roll app (uma instância por vez)
for service in app app-b; do
  log "Deploying $service..."
  run docker compose up -d --no-deps --build "$service"

  # Healthcheck loop
  for i in $(seq 1 30); do
    if [ "$DRY_RUN" = "1" ]; then break; fi
    # 127.0.0.1, NUNCA localhost. O Next sobe com HOSTNAME=0.0.0.0, que escuta
    # so em IPv4; dentro do container alpine o `localhost` resolve ::1 primeiro
    # e o wget leva "connection refused". Com localhost este health check FALHAVA
    # SEMPRE, mesmo num deploy sadio, e disparava rollback em todo deploy.
    # O healthcheck do proprio docker-compose.yml ja usa 127.0.0.1 — era so aqui
    # que divergia.
    if docker compose exec -T "$service" wget -qO- http://127.0.0.1:3000/api/health 2>/dev/null | grep -q '"status":"ok"'; then
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

# 6b. Persiste a tag no .env.
#
# Sem isto o export do passo 1 morre junto com o script, e um `docker compose up`
# rodado à mão depois volta a resolver pela tag antiga do .env — ou seja,
# reverteria o site sem ninguém pedir. Só grava depois do health check passar.
if [ "$DRY_RUN" = "0" ] && [ -f "$PROJECT_ROOT/.env" ]; then
  if grep -q '^APP_VERSION=' "$PROJECT_ROOT/.env"; then
    sed -i "s|^APP_VERSION=.*|APP_VERSION=$NEW_TAG|" "$PROJECT_ROOT/.env"
  else
    echo "APP_VERSION=$NEW_TAG" >> "$PROJECT_ROOT/.env"
  fi
  log "APP_VERSION do .env atualizado para $NEW_TAG"
fi

# 7. Limpeza de imagens antigas (mantém últimas 5 versões)
run docker image prune -f --filter "label=app=qmix-invest" --filter "until=168h" || true

log "✅ Deploy $NEW_TAG concluído."
notify "✅ Deploy QMIX Invest $NEW_TAG concluído. Outros sites verificados OK."
