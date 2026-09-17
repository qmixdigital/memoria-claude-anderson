#!/bin/bash
# Deploy ZERO-DOWNTIME do BacklinkGuard (roda NO servidor).
# Recebe o tarball em /tmp/backlinkguard-deploy.tar.gz e:
#  1. builda numa pasta separada (-build) enquanto o site atual segue servindo
#  2. troca atômica (mv) — os processos rodando seguram o inode antigo, não caem
#  3. restart em rolagem (um backend por vez, esperando 200)
# Uso: ssh <server> 'bash -s' < scripts/deploy-server.sh   (ou copiar e rodar)
set -e
export PATH=/root/.nvm/versions/node/v20.20.2/bin:/root/.bun/bin:$PATH

BASE=/var/www/backlinkguard
BUILD=$BASE-build
PREV=$BASE-prev
SHARED=$BASE-shared
TARBALL=/tmp/backlinkguard-deploy.tar.gz

echo "[1/5] extraindo release nova em $BUILD"
rm -rf "$BUILD"
mkdir -p "$BUILD"
tar -xzf "$TARBALL" -C "$BUILD" --strip-components=1
ln -sf "$SHARED/.env" "$BUILD/.env"

echo "[2/5] install + prisma + build (site atual segue no ar)"
cd "$BUILD"
bun install 2>&1 | tail -1
./node_modules/.bin/prisma generate 2>&1 | tail -1
bun run build 2>&1 | tail -3

echo "[3/5] troca atômica"
rm -rf "$PREV"
mv "$BASE" "$PREV"
mv "$BUILD" "$BASE"
ln -sf "$SHARED/.env" "$BASE/.env"

echo "[4/5] restart em rolagem: web (3090)"
pm2 restart backlinkguard-web --update-env >/dev/null
for i in $(seq 1 25); do
  if curl -sf -m 3 -o /dev/null http://127.0.0.1:3090/; then echo "  3090 no ar"; break; fi
  sleep 1
done

echo "[5/5] restart em rolagem: web-b (3091)"
pm2 restart backlinkguard-web-b --update-env >/dev/null
for i in $(seq 1 25); do
  if curl -sf -m 3 -o /dev/null http://127.0.0.1:3091/; then echo "  3091 no ar"; break; fi
  sleep 1
done

echo "OK — deploy zero-downtime concluído. Rollback: mv $PREV $BASE"
