#!/bin/bash
# Network-wide link audit/removal across QMIX 4 hostings
# Usage:
#   ./link-audit-network.sh audit "dominio1.com,dominio2.com"
#   ./link-audit-network.sh remove "dominio1.com,dominio2.com"
#
# Outputs to pruning-audits/link-{action}-{host}.txt per hosting

set -e
MODE="${1:-audit}"
DOMAINS="${2:-}"

if [ -z "$DOMAINS" ]; then
    echo "Usage: $0 [audit|remove] \"dom1.com,dom2.com\""
    exit 1
fi

FLAG=""
if [ "$MODE" = "remove" ]; then
    FLAG="--remove"
fi

OUTDIR="$(dirname "$0")/../pruning-audits"
mkdir -p "$OUTDIR"
DATE=$(date +%Y-%m-%d)

# Anderson
ssh hostinger-anderson-gna "cd /home/u400588174/domains
for d in */public_html; do
    [ ! -f \"\$d/wp-config.php\" ] && continue
    SITE=\$(basename \"\$(dirname \"\$d\")\")
    OUT=\$(wp --path=\"\$d\" oie audit-links --domain=\"$DOMAINS\" $FLAG 2>/dev/null)
    POSTS=\$(echo \"\$OUT\" | head -1 | grep -oP 'Posts: \K\d+')
    LINKS=\$(echo \"\$OUT\" | head -1 | grep -oP 'Links: \K\d+')
    if [ -n \"\$POSTS\" ] && [ \"\$POSTS\" != \"0\" ]; then
        echo \"\$SITE|posts=\$POSTS|links=\$LINKS\"
        [ \"$MODE\" = \"remove\" ] && wp --path=\"\$d\" eval 'do_action(\"litespeed_purge_all\");' >/dev/null 2>&1
    fi
done" 2>&1 | grep -v "post-quantum\|attacks\|See https" > "$OUTDIR/link-$MODE-anderson-$DATE.txt"
echo "anderson done: $(wc -l < $OUTDIR/link-$MODE-anderson-$DATE.txt) sites"

# QMIX
ssh hostinger-qmix "cd /home/u463007860/domains
for d in */public_html; do
    [ ! -f \"\$d/wp-config.php\" ] && continue
    SITE=\$(basename \"\$(dirname \"\$d\")\")
    OUT=\$(wp --path=\"\$d\" oie audit-links --domain=\"$DOMAINS\" $FLAG 2>/dev/null)
    POSTS=\$(echo \"\$OUT\" | head -1 | grep -oP 'Posts: \K\d+')
    LINKS=\$(echo \"\$OUT\" | head -1 | grep -oP 'Links: \K\d+')
    if [ -n \"\$POSTS\" ] && [ \"\$POSTS\" != \"0\" ]; then
        echo \"\$SITE|posts=\$POSTS|links=\$LINKS\"
        [ \"$MODE\" = \"remove\" ] && wp --path=\"\$d\" eval 'do_action(\"litespeed_purge_all\");' >/dev/null 2>&1
    fi
done" 2>&1 | grep -v "post-quantum\|attacks\|See https" > "$OUTDIR/link-$MODE-qmix-$DATE.txt"
echo "qmix done: $(wc -l < $OUTDIR/link-$MODE-qmix-$DATE.txt) sites"

# VPS1
ssh hostinger-vps1 "cd /home/u651115354/domains
for d in */public_html; do
    [ ! -f \"\$d/wp-config.php\" ] && continue
    SITE=\$(basename \"\$(dirname \"\$d\")\")
    OUT=\$(wp --path=\"\$d\" oie audit-links --domain=\"$DOMAINS\" $FLAG 2>/dev/null)
    POSTS=\$(echo \"\$OUT\" | head -1 | grep -oP 'Posts: \K\d+')
    LINKS=\$(echo \"\$OUT\" | head -1 | grep -oP 'Links: \K\d+')
    if [ -n \"\$POSTS\" ] && [ \"\$POSTS\" != \"0\" ]; then
        echo \"\$SITE|posts=\$POSTS|links=\$LINKS\"
        [ \"$MODE\" = \"remove\" ] && wp --path=\"\$d\" eval 'do_action(\"litespeed_purge_all\");' >/dev/null 2>&1
    fi
done" 2>&1 | grep -v "post-quantum\|attacks\|See https" > "$OUTDIR/link-$MODE-vps1-$DATE.txt"
echo "vps1 done: $(wc -l < $OUTDIR/link-$MODE-vps1-$DATE.txt) sites"

# Hostverge via jump
cat << HOSTVERGE_SCRIPT > /tmp/_link_action.sh
#!/bin/bash
cd /home/sites/18a/7/7672b9147f//public_html
for d in */; do
    SITE=\${d%/}
    [ ! -f "\$SITE/wp-config.php" ] && continue
    OUT=\$(wp --path="\$SITE" --allow-root oie audit-links --domain="$DOMAINS" $FLAG 2>/dev/null)
    POSTS=\$(echo "\$OUT" | head -1 | grep -oP 'Posts: \K\d+')
    LINKS=\$(echo "\$OUT" | head -1 | grep -oP 'Links: \K\d+')
    if [ -n "\$POSTS" ] && [ "\$POSTS" != "0" ]; then
        echo "\$SITE|posts=\$POSTS|links=\$LINKS"
        [ "$MODE" = "remove" ] && wp --path="\$SITE" --allow-root eval 'do_action("litespeed_purge_all");' >/dev/null 2>&1
    fi
done
HOSTVERGE_SCRIPT
cat /tmp/_link_action.sh | ssh opengravity "cat > /tmp/_link_action.sh && cat /tmp/_link_action.sh | ssh -i /root/.ssh/id_hostverge qmix.com.br@ssh.us.stackcp.com 'cat > /tmp/_link_action.sh && bash /tmp/_link_action.sh'" 2>&1 | grep -v "post-quantum\|attacks\|See https" > "$OUTDIR/link-$MODE-hostverge-$DATE.txt"
echo "hostverge done: $(wc -l < $OUTDIR/link-$MODE-hostverge-$DATE.txt) sites"

# ---------------------------------------------------------------------------
# PONTOS CEGOS: sites que o loop padrao pula (ver LINK_REMOVAL.md "PONTOS CEGOS")
# ---------------------------------------------------------------------------
SCRIPTDIR="$(dirname "$0")"
DRYENV=""
[ "$MODE" = "audit" ] && DRYENV="1"

# (A) WP com comando `oie audit-links` quebrado -> remover via wp eval-file
# formato: alias|/caminho/public_html|nome
WP_BROKEN=(
  "hostinger-anderson-gna|/home/u400588174/domains/blogse.com.br/public_html|blogse.com.br"
  "hostinger-anderson-gna|/home/u400588174/domains/qmixdigital.com.br/public_html|qmixdigital.com.br"
  "hostinger-qmix|/home/u463007860/domains/desassossegada.com.br/public_html|desassossegada.com.br"
)
if [ -f "$SCRIPTDIR/oie_remove_eval.php" ]; then
  B64=$(base64 -w0 "$SCRIPTDIR/oie_remove_eval.php")
  : > "$OUTDIR/link-$MODE-wpbroken-$DATE.txt"
  for row in "${WP_BROKEN[@]}"; do
    ALIAS="${row%%|*}"; rest="${row#*|}"; PHPATH="${rest%%|*}"; NAME="${rest##*|}"
    R=$(ssh "$ALIAS" "echo '$B64' | base64 -d > /tmp/oie_remove_eval.php
      OIE_DOMAINS='$DOMAINS' OIE_DRY='$DRYENV' wp --path='$PHPATH' eval-file /tmp/oie_remove_eval.php 2>/dev/null
      [ '$MODE' = 'remove' ] && wp --path='$PHPATH' eval 'do_action(\"litespeed_purge_all\");' >/dev/null 2>&1
      rm -f /tmp/oie_remove_eval.php" 2>&1 | grep -v "post-quantum\|attacks\|See https" | tail -1)
    echo "$NAME -> $R" | tee -a "$OUTDIR/link-$MODE-wpbroken-$DATE.txt"
  done
  echo "wpbroken done"
fi

# (B) Portais portal-engine (estaticos, nao-WP) no srv1166087 -> JSON + rebuild como user portais
if [ -f "$SCRIPTDIR/oie_portal_remove.js" ]; then
  B64=$(base64 -w0 "$SCRIPTDIR/oie_portal_remove.js")
  ssh hostinger-vps-srv1166087 "echo '$B64' | base64 -d > /tmp/oie_portal_remove.js && chmod 644 /tmp/oie_portal_remove.js
    for slug in \$(ls /srv/portais 2>/dev/null); do
      [ \"\$slug\" = \"teste\" ] && continue
      OIE_DOMAINS='$DOMAINS' OIE_DRY='$DRYENV' runuser -u portais -- node /tmp/oie_portal_remove.js \$slug 2>/dev/null
    done
    rm -f /tmp/oie_portal_remove.js" 2>&1 | grep -v "post-quantum\|attacks\|See https" > "$OUTDIR/link-$MODE-portalengine-$DATE.txt"
  echo "portalengine done: $(grep -c 'arquivos:' "$OUTDIR/link-$MODE-portalengine-$DATE.txt") portais"
fi

# Total summary
echo
echo "=== TOTAL ==="
python3 -c "
import re, glob
total_sites = 0; total_posts = 0; total_links = 0
for f in glob.glob('$OUTDIR/link-$MODE-*-$DATE.txt'):
    with open(f, encoding='utf-8') as fh:
        for line in fh:
            m = re.search(r'(.+?)\|posts=(\d+)\|links=(\d+)', line.strip())
            if m:
                total_sites += 1
                total_posts += int(m.group(2))
                total_links += int(m.group(3))
print(f'Sites: {total_sites} | Posts: {total_posts} | Links: {total_links}')
"
