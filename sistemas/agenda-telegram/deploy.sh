#!/usr/bin/env bash
# Deploy do agenda-telegram na opengravity. Rodar da mÃ¡quina local.
# O Telegram reenvia updates que falharem, entÃ£o um reload curto nÃ£o perde mensagem.
set -euo pipefail
HOST=opengravity
DIR=/var/www/agenda-telegram
cd "$(dirname "$0")"
npm run typecheck
npm run build
# tar em vez de rsync: a máquina local é Windows (Git Bash) e não tem rsync.
ssh "$HOST" "mkdir -p $DIR && cd $DIR && rm -rf dist src"
tar czf - --exclude=node_modules --exclude=.env --exclude=service-account.json --exclude=data --exclude=.git --exclude=test . | ssh "$HOST" "tar xzf - -C $DIR"
ssh "$HOST" "cd $DIR && npm ci --omit=dev --silent && mkdir -p data && (pm2 describe agenda-telegram >/dev/null 2>&1 && pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs) && pm2 save >/dev/null && sleep 2 && curl -sf http://127.0.0.1:3080/health && echo && pm2 logs agenda-telegram --lines 5 --nostream"
