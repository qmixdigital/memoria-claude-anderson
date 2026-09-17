#!/bin/bash
# Para cada site no CSV, testa POST com API key real. Espera 201 success ou 400 (title obrigatório).
CSV="D:/SISTEMAS/MinhasHospedagens/antonio_COMPLETO.csv"

tail -n +2 "$CSV" | while IFS=, read -r DOM SITEURL NS ENDPOINT KEY LOADER; do
    DOM=$(echo "$DOM" | tr -d '\r' | tr -d ' ')
    NS=$(echo "$NS" | tr -d '\r' | tr -d ' ')
    KEY=$(echo "$KEY" | tr -d '\r' | tr -d ' ')
    [ -z "$DOM" ] && continue
    [ -z "$NS" ] && continue

    URL="https://${DOM}/wp-json/${NS}/v1/artigos"
    RESP=$(curl -skL -X POST --max-time 12 "$URL" \
      -H "Content-Type: application/json" \
      -H "X-API-KEY: $KEY" \
      -d '{"title":"validacao antonio","content":"<p>v</p>","status":"draft"}' 2>/dev/null)
    CODE=$(curl -skL -o /dev/null -w "%{http_code}" -X POST --max-time 12 "$URL" \
      -H "Content-Type: application/json" \
      -H "X-API-KEY: $KEY" \
      -d '{"title":"validacao antonio","content":"<p>v</p>","status":"draft"}' 2>/dev/null)

    if [ "$CODE" = "201" ]; then
        STATUS="OK"
    elif [ "$CODE" = "400" ] && echo "$RESP" | grep -q "obrigat"; then
        STATUS="OK_400"
    else
        STATUS="FAIL"
    fi
    echo "[$STATUS][$CODE] $DOM | $RESP"
done
