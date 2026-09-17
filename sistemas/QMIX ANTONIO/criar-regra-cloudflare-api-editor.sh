#!/usr/bin/env bash
# Cria a regra de skip do Super Bot Fight Mode para editor.qmix.com.br/api/*
# (igual a "ALLOW conector MCP"). Rodar no Git Bash: bash criar-regra-cloudflare-api-editor.sh
set -e
TOKEN=$(grep -oE "^CF_USER_TOKEN=.*" "d:/SISTEMAS/Cloudflare/.env" | head -1 | cut -d= -f2- | tr -d '"'"'"' \r')
Z=f5f7d6c9deebedfb89f5f3b6b0884a23        # zona qmix.com.br
RS=961b80a328a84d23b79c619ce15b40af       # ruleset http_request_firewall_custom
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$Z/rulesets/$RS/rules" -d '{
 "action":"skip",
 "action_parameters":{"phases":["http_ratelimit","http_request_firewall_managed","http_request_sbfm"],"ruleset":"current"},
 "expression":"(http.host eq \"editor.qmix.com.br\" and starts_with(http.request.uri.path, \"/api/\"))",
 "description":"ALLOW API do editor (chave propria, chamada por MCP e scripts)",
 "enabled":true
}' | python -c "
import sys,json; d=json.load(sys.stdin); print('success:', d['success'])
[print('  erro:', e) for e in d.get('errors',[])]
[print('  -', x['id'][:8], x['action'], '|', x.get('description')) for x in d.get('result',{}).get('rules',[])]"
