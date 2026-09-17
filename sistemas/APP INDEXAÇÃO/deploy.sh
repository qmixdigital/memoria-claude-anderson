#!/bin/bash
# Deploy do QMIX Indexation para a VPS opengravity
# Uso: ./deploy.sh

set -e

VPS_HOST="opengravity"
VPS_PATH="/var/www/qmix-indexation-api/public"
LOCAL_DIR="$(dirname "$0")"

cd "$LOCAL_DIR"

echo "→ Enviando arquivos para $VPS_HOST:$VPS_PATH"

# Arquivos de texto principais
for f in index.html app.js style.css sw.js manifest.json clear.html robots.txt domains.json engine-status.json; do
  if [ -f "$f" ]; then
    B64=$(base64 -w0 "$f")
    ssh "$VPS_HOST" "echo '$B64' | base64 -d > $VPS_PATH/$f"
    echo "  ✓ $f"
  fi
done

# Imagens
for img in imagens/*; do
  if [ -f "$img" ]; then
    B64=$(base64 -w0 "$img")
    fname=$(basename "$img")
    ssh "$VPS_HOST" "echo '$B64' | base64 -d > $VPS_PATH/imagens/$fname"
    echo "  ✓ $img"
  fi
done

# domains.json — também na raiz (lido pelo domains-sync.js)
if [ -f "domains.json" ]; then
  B64=$(base64 -w0 "domains.json")
  ssh "$VPS_HOST" "echo '$B64' | base64 -d > /var/www/qmix-indexation-api/domains.json"
  echo "  ✓ domains.json (raiz do projeto)"
fi

echo ""
echo "✅ Deploy concluído!"
echo "🌐 https://indexation.qmix.com.br"
