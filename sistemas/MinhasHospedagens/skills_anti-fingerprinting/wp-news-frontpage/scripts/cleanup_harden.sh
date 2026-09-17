#!/bin/bash
# Cleanup-and-harden idempotente — recebe WP_PATH + PARENT + CHILD como args.
# Uso: cleanup_harden.sh <WP_PATH> <PARENT> <CHILD>
set -e
WP="$1"
PARENT="$2"
CHILD="$3"
CONFIG="$WP/wp-config.php"

echo "=== $(basename $WP) ==="

# 1. Backup wp-config (idempotent: 1 backup só)
if [ ! -f "$CONFIG.bak-skill" ]; then
  cp "$CONFIG" "$CONFIG.bak-skill"
  echo "  backup created"
fi

# 2. WP_AUTO_UPDATE_CORE true -> 'minor'
sed -i "s|define('WP_AUTO_UPDATE_CORE', true);|define('WP_AUTO_UPDATE_CORE', 'minor');|" "$CONFIG"
sed -i "s|define( 'WP_AUTO_UPDATE_CORE', true );|define( 'WP_AUTO_UPDATE_CORE', 'minor' );|" "$CONFIG"

# 3. Insert ADON_HARDENING block (idempotent via marker)
if ! grep -q ADON_HARDENING "$CONFIG"; then
  # Insere bloco ANTES da linha "/* That's all, stop editing!" usando awk puro
  awk '/^\/\* That.s all, stop editing/ && !done {
    print "/* ===== ADON_HARDENING (wordpress-master) ===== */"
    print "if ( ! defined( '"'"'DISALLOW_FILE_EDIT'"'"' ) )    define( '"'"'DISALLOW_FILE_EDIT'"'"', true );"
    print "if ( ! defined( '"'"'FORCE_SSL_ADMIN'"'"' ) )       define( '"'"'FORCE_SSL_ADMIN'"'"', true );"
    print "if ( ! defined( '"'"'EMPTY_TRASH_DAYS'"'"' ) )      define( '"'"'EMPTY_TRASH_DAYS'"'"', 7 );"
    print "if ( ! defined( '"'"'AUTOSAVE_INTERVAL'"'"' ) )     define( '"'"'AUTOSAVE_INTERVAL'"'"', 120 );"
    print "if ( ! defined( '"'"'WP_DEBUG_DISPLAY'"'"' ) )      define( '"'"'WP_DEBUG_DISPLAY'"'"', false );"
    print "if ( ! defined( '"'"'CONCATENATE_SCRIPTS'"'"' ) )   define( '"'"'CONCATENATE_SCRIPTS'"'"', false );"
    print ""
    done = 1
  } { print }' "$CONFIG" > "$CONFIG.tmp" && mv "$CONFIG.tmp" "$CONFIG"
  if grep -q ADON_HARDENING "$CONFIG"; then
    echo "  hardening block inserted"
  else
    echo "  WARNING: marker not found; manual intervention needed"
  fi
else
  echo "  hardening already present (skip)"
fi

# 4. Auto-update on em todos plugins + parent theme; child OFF
echo "  enabling auto-updates..."
wp --path="$WP" plugin auto-updates enable --all 2>&1 | grep -E "Success|Error" | tail -1
wp --path="$WP" theme auto-updates enable "$PARENT" 2>&1 | tail -1
wp --path="$WP" theme auto-updates disable "$CHILD" 2>&1 | tail -1

# 5. Delete inactive themes (preserva PARENT + CHILD)
INACT=$(wp --path="$WP" theme list --status=inactive --field=name 2>&1 \
  | grep -v -E '^(Warning|Error)' \
  | grep -v -E "^($CHILD|$PARENT)\$" \
  | tr '\n' ' ')
if [ -n "$INACT" ] && [ "$(echo $INACT | tr -d ' ')" != "" ]; then
  echo "  deleting inactive themes: $INACT"
  wp --path="$WP" theme delete $INACT 2>&1 | tail -2
fi

# 5.5. Remove legacy plugins blacklist (skill regra 16). Antonio sanity-checked.
# Blacklist canônica QMIX: plugins de temas legacy (SmartMag/Sphere/Bunyad/Cinderfolio)
# que não são usados pelos child themes da skill. NUNCA remove plugins da whitelist
# essencial (litespeed-cache, seo-by-rank-math, wordfence, wp-cli-login-server,
# hostinger, all-in-one-wp-migration*) nem mu-plugins QMIX (Antonio).
LEGACY_BLACKLIST="bunyad-demo-import bunyad-amp debloat elementor simple-local-avatars smartmag-core sphere-core starbox xanderpress-contact xml-sitemap-feed cinderfolio-contact"
echo "  --- legacy plugins cleanup ---"
ANT_BEFORE=$(wp --path="$WP" eval '$srv=rest_get_server(); foreach($srv->get_namespaces() as $ns) if(preg_match("/c5cf|fad0|r6a5|t225|8014|d0af|a29889|b1421e|b3727|e68af|qmix|artigo|engine|stats-/",$ns)) echo $ns."|";' 2>/dev/null)
for p in $LEGACY_BLACKLIST; do
  if wp --path="$WP" plugin is-installed "$p" 2>/dev/null; then
    wp --path="$WP" plugin deactivate "$p" 2>&1 | tail -1
    wp --path="$WP" plugin delete "$p" 2>&1 | tail -1
  fi
done
ANT_AFTER=$(wp --path="$WP" eval '$srv=rest_get_server(); foreach($srv->get_namespaces() as $ns) if(preg_match("/c5cf|fad0|r6a5|t225|8014|d0af|a29889|b1421e|b3727|e68af|qmix|artigo|engine|stats-/",$ns)) echo $ns."|";' 2>/dev/null)
if [ "$ANT_BEFORE" != "$ANT_AFTER" ]; then
  echo "  ABORT: Antonio namespaces changed during plugin removal!"
  echo "  BEFORE: $ANT_BEFORE"
  echo "  AFTER:  $ANT_AFTER"
  exit 1
fi
echo "  Antonio sanity preserved: [$ANT_AFTER]"

# 6. Pastas residuais
rm -rf "$WP/wp-content/upgrade"/* 2>/dev/null
rm -rf "$WP/wp-content/cache" 2>/dev/null
rm -rf "$WP/wp-content/uploads/imagify-backup" 2>/dev/null
rm -rf "$WP/wp-content/uploads/backup" 2>/dev/null

# 7. DB cleanup
TRASH_IDS=$(wp --path="$WP" post list --post_status=trash --format=ids 2>/dev/null)
[ -n "$TRASH_IDS" ] && wp --path="$WP" post delete $TRASH_IDS --force 2>&1 | tail -1
DRAFT_IDS=$(wp --path="$WP" post list --post_status=auto-draft --format=ids 2>/dev/null)
[ -n "$DRAFT_IDS" ] && wp --path="$WP" post delete $DRAFT_IDS --force 2>&1 | tail -1
wp --path="$WP" transient delete --expired 2>&1 | tail -1

# 8. Verificação final
echo "  --- final state ---"
CORE_VAL=$(grep WP_AUTO_UPDATE_CORE "$CONFIG" | head -1)
echo "  $CORE_VAL"
echo "  ADON_HARDENING_lines=$(grep -c ADON_HARDENING $CONFIG)"
echo "  themes_count=$(wp --path=$WP theme list --field=name 2>/dev/null | wc -l)"
PLUGAU=$(wp --path="$WP" option get auto_update_plugins --format=count 2>/dev/null)
echo "  plugins_auto_update_count=$PLUGAU"
echo "[OK]"
