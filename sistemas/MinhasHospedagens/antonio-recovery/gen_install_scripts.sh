#!/bin/bash
# Gera 4 scripts de install (1 por hosting) consumindo o mapping + template

MAPPING=D:/tmp/antonio_mapping.txt
TEMPLATE=D:/tmp/antonio_receiver_template.php

# Base paths por hosting
declare -A BASE_PATHS=(
  [anderson]="/home/u400588174/domains"
  [qmix]="/home/u463007860/domains"
  [vps1]="/home/u651115354/domains"
  [hostverge]="/home/sites/18a/7/7672b9147f//public_html"
)

for HOST in anderson qmix vps1 hostverge; do
  OUT=D:/tmp/install_${HOST}.sh
  BASE="${BASE_PATHS[$HOST]}"
  {
    echo '#!/bin/bash'
    echo 'set +e'
    echo 'OK=0; FAIL=0'
    echo "BASE=\"$BASE\""
    echo ''

    grep "^$HOST|" "$MAPPING" | while IFS='|' read -r H DOM NS KEY; do
      [ -z "$DOM" ] && continue
      # Sanitize content for heredoc — escape backticks/dollar
      FULL_NS="${NS}/v1"
      if [ "$HOST" = "hostverge" ]; then
        SITE_DIR="\$BASE/${DOM}"
        WP_ARGS="--allow-root"
      else
        SITE_DIR="\$BASE/${DOM}/public_html"
        WP_ARGS=""
      fi

      # Gerar PHP customizado por site
      PHP_FILE=D:/tmp/qmix-receivers/qmix-receiver-${DOM}.php
      mkdir -p D:/tmp/qmix-receivers 2>/dev/null
      sed -e "s|__NS__|${FULL_NS}|g" -e "s|__APIKEY__|${KEY}|g" "$TEMPLATE" > "$PHP_FILE"

      echo "# === $DOM ($FULL_NS) ==="
      echo "DEST=\"$SITE_DIR/wp-content/mu-plugins/qmix-receiver.php\""
      echo "if [ -d \"$SITE_DIR/wp-content/mu-plugins\" ]; then"
      echo "  cat > \"\$DEST\" <<'QMIXEOF_${DOM}_$$'"
      cat "$PHP_FILE"
      echo ""
      echo "QMIXEOF_${DOM}_$$"
      echo "  wp --path=\"$SITE_DIR\" $WP_ARGS cache flush 2>/dev/null"
      echo "  CODE=\$(curl -sk -o /dev/null -w \"%{http_code}\" --max-time 10 -X POST \"https://${DOM}/wp-json/${FULL_NS}/artigos\")"
      echo "  if [ \"\$CODE\" = \"401\" ]; then OK=\$((OK+1)); echo \"OK: $DOM\"; else FAIL=\$((FAIL+1)); echo \"FAIL [\$CODE]: $DOM\"; fi"
      echo "else"
      echo "  FAIL=\$((FAIL+1)); echo \"SKIP (sem mu-plugins dir): $DOM\""
      echo "fi"
      echo ""
    done

    echo 'echo "---"'
    echo 'echo "OK: $OK | FAIL: $FAIL"'
  } > "$OUT"
  chmod +x "$OUT"
  COUNT=$(grep -c "^# ===" "$OUT")
  echo "$OUT — $COUNT sites"
done
