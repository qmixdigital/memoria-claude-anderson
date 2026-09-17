#!/usr/bin/env bash
# verify-other-sites.sh
# Verifica que os 4 sites + 4 bots PM2 da VPS srv1166087 continuam saudáveis
# após qualquer ação no QMIX Invest. Sai com exit-code != 0 se algum estiver
# afetado, sinalizando ao deploy.sh para iniciar rollback.

set -euo pipefail

OTHER_SITES=(
  "https://acesso.qmix.com.br"
  "https://acesso2.qmix.com.br"
  "https://chatbotbrx.com.br"
  "https://editor.qmix.com.br"
)

OTHER_PM2_BOTS=(
  "bot-rest-1"
  "bot-sae-1"
  "bot-sae-1b"
  "bot-afiliado-1"
)

failures=0

echo "==> Verificando sites HTTPS..."
for url in "${OTHER_SITES[@]}"; do
  code=$(curl -ksI -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")
  if [[ "$code" =~ ^(200|301|302|401|403)$ ]]; then
    echo "    OK  $url ($code)"
  else
    echo "    FAIL $url ($code)"
    ((failures++))
  fi
done

echo "==> Verificando bots PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  echo "    AVISO pm2 não encontrado neste ambiente (script rodando fora da VPS?)"
else
  pm2_status=$(pm2 jlist 2>/dev/null || echo "[]")
  for bot in "${OTHER_PM2_BOTS[@]}"; do
    status=$(echo "$pm2_status" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for app in data:
    if app.get('name') == '$bot':
        print(app.get('pm2_env', {}).get('status', 'unknown'))
        sys.exit(0)
print('not_found')
" 2>/dev/null || echo "parse_error")
    if [ "$status" = "online" ]; then
      echo "    OK  $bot ($status)"
    else
      echo "    FAIL $bot ($status)"
      ((failures++))
    fi
  done
fi

if [ "$failures" -gt 0 ]; then
  echo ""
  echo "==> $failures verificação(ões) falharam — outros serviços do host podem ter sido afetados."
  exit 1
fi

echo ""
echo "==> Todos os outros sites e bots da VPS estão saudáveis."
exit 0
