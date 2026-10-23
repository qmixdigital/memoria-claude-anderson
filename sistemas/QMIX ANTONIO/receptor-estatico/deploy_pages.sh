#!/bin/bash
# Publica a pasta site/ de um dos sites estaticos no Cloudflare Pages (producao).
# Uso: deploy_pages.sh <dominio> <projeto>
S="C:/Users/User/AppData/Local/Temp/claude/d--SISTEMAS-QMIX-ANTONIO/2e490a51-e337-455a-8df0-8aacc672ed79/scratchpad"
cd "d:/SITES/$1" || exit 1
export CLOUDFLARE_API_TOKEN=$(python3 -c "import json;print(next(c['token'] for c in json.load(open('d:/SISTEMAS/cloudflare/contas.json',encoding='utf-8')) if c['nome']=='master'))")
export CLOUDFLARE_ACCOUNT_ID=$(python3 -c "import json;print(json.load(open('$S/cf/projetos.json'))['$2']['account_id'])")
npx wrangler@4 pages deploy site --project-name "$2" --branch main --commit-dirty=true 2>&1 | grep -i "success\|deployment complete\|error\|compiled" | tail -4
