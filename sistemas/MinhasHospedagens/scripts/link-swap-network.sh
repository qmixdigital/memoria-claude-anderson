#!/bin/bash
# Troca (swap) de uma URL exata por outra nos posts WP da rede QMIX (4 hostings).
# wp search-replace = string->string, raw no DB -> NAO altera post_modified.
# Prefixo de tabela detectado por site (hostverge usa prefixo custom).
# Uso:
#   ./link-swap-network.sh "<URL_ANTIGA>" "<URL_NOVA>" dry     (dry-run, default)
#   ./link-swap-network.sh "<URL_ANTIGA>" "<URL_NOVA>" apply   (aplica + purge cache)
OLD="${1:?url antiga obrigatoria}"
NEW="${2:?url nova obrigatoria}"
MODE="${3:-dry}"
DRY="--dry-run"; [ "$MODE" = "apply" ] && DRY=""
OUTDIR="$(dirname "$0")/../pruning-audits"; mkdir -p "$OUTDIR"
DATE=$(date +%Y-%m-%d)

# corpo do loop p/ hostings Hostinger (dirs */public_html, sem --allow-root)
gen_hostinger() {
cat <<RB
for d in */public_html; do
    [ ! -f "\$d/wp-config.php" ] && continue
    SITE=\$(basename "\$(dirname "\$d")")
    PFX=\$(wp --path="\$d" config get table_prefix 2>/dev/null)
    [ -z "\$PFX" ] && PFX="wp_"
    OUT=\$(wp --path="\$d" search-replace "$OLD" "$NEW" "\${PFX}posts" --precise --skip-columns=guid $DRY 2>/dev/null)
    N=\$(echo "\$OUT" | grep -oiE '[0-9]+ replacement' | grep -oE '[0-9]+' | head -1)
    if [ -n "\$N" ] && [ "\$N" != "0" ]; then
        echo "\$SITE|\$N"
        [ "$MODE" = "apply" ] && wp --path="\$d" eval 'do_action("litespeed_purge_all");' >/dev/null 2>&1
    fi
done
RB
}

ssh hostinger-anderson-gna "cd /home/u400588174/domains; $(gen_hostinger)" 2>&1 | grep -v "post-quantum\|attacks\|See https" > "$OUTDIR/swap-anderson-$DATE.txt" || true
echo "anderson: $(grep -c '|' "$OUTDIR/swap-anderson-$DATE.txt" 2>/dev/null) sites"
ssh hostinger-qmix "cd /home/u463007860/domains; $(gen_hostinger)" 2>&1 | grep -v "post-quantum\|attacks\|See https" > "$OUTDIR/swap-qmix-$DATE.txt" || true
echo "qmix: $(grep -c '|' "$OUTDIR/swap-qmix-$DATE.txt" 2>/dev/null) sites"
ssh hostinger-vps1 "cd /home/u651115354/domains; $(gen_hostinger)" 2>&1 | grep -v "post-quantum\|attacks\|See https" > "$OUTDIR/swap-vps1-$DATE.txt" || true
echo "vps1: $(grep -c '|' "$OUTDIR/swap-vps1-$DATE.txt" 2>/dev/null) sites"

# Hostverge via jump (dirs */, --allow-root, prefixo custom)
HV=$(cat <<HVS
cd /home/sites/18a/7/7672b9147f//public_html
for d in */; do
    SITE=\${d%/}
    [ ! -f "\$SITE/wp-config.php" ] && continue
    PFX=\$(wp --path="\$SITE" --allow-root config get table_prefix 2>/dev/null)
    [ -z "\$PFX" ] && PFX="wp_"
    OUT=\$(wp --path="\$SITE" --allow-root search-replace "$OLD" "$NEW" "\${PFX}posts" --precise --skip-columns=guid $DRY 2>/dev/null)
    N=\$(echo "\$OUT" | grep -oiE '[0-9]+ replacement' | grep -oE '[0-9]+' | head -1)
    if [ -n "\$N" ] && [ "\$N" != "0" ]; then
        echo "\$SITE|\$N"
        [ "$MODE" = "apply" ] && wp --path="\$SITE" --allow-root eval 'do_action("litespeed_purge_all");' >/dev/null 2>&1
    fi
done
HVS
)
echo "$HV" | base64 -w0 | ssh opengravity "ssh -i /root/.ssh/id_hostverge qmix.com.br@ssh.us.stackcp.com 'base64 -d | bash'" 2>&1 | grep -v "post-quantum\|attacks\|See https" > "$OUTDIR/swap-hostverge-$DATE.txt" || true
echo "hostverge: $(grep -c '|' "$OUTDIR/swap-hostverge-$DATE.txt" 2>/dev/null) sites"

echo ""; echo "=== TOTAL (modo: $MODE) ==="
awk -F'|' '/\|/{s+=$2; n++} END{print "  sites:", n+0, "| replacements:", s+0}' "$OUTDIR"/swap-*-$DATE.txt
