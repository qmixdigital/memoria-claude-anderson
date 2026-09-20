#!/bin/bash
# Consulta rapida a API GraphQL da Railway (workspace do Renato).
# Uso: ./railway-api.sh '{ project(id:"86cf414b-3afe-4a64-992b-ec7639370d4a") { name } }'
TOKEN=$(cat "/c/Users/User/Documents/APIs/railway-renato.txt" 2>/dev/null | tr -d '\r\n')
Q=$(printf '%s' "$1" | python3 -c 'import sys,json; print(json.dumps({"query":sys.stdin.read()}))')
curl -sS "https://backboard.railway.com/graphql/v2" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$Q"; echo
