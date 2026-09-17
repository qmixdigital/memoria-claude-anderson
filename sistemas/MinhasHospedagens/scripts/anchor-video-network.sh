#!/bin/bash
# Insere o link do vídeo na palavra "backlinks" em 1 artigo por domínio da rede.
#   ./anchor-video-network.sh dry      → só mostra o que faria
#   ./anchor-video-network.sh apply    → grava
#
# Escopo: allowlist qmix-video-backlinks-sites.txt MENOS domínios de saúde
# (o Anderson pediu para não varrer os de saúde — não têm conteúdo de backlinks).

set -e
MODE="${1:-dry}"
DRY=1
[ "$MODE" = "apply" ] && DRY=0

SCRIPTDIR="$(cd "$(dirname "$0")" && pwd)"
OUTDIR="$SCRIPTDIR/../link-audits"
mkdir -p "$OUTDIR"
DATE=$(date +%Y-%m-%d)
OUT="$OUTDIR/anchor-video-$MODE-$DATE.txt"

SAUDE='cirurgia|ortoped|saude|saudicas|medicinageriatrica|planomedico|clinica|geriatr'
LISTA=$(grep -viE "$SAUDE" "$SCRIPTDIR/qmix-video-backlinks-sites.txt" | grep -v '^$' | tr '\n' ' ')
B64=$(base64 -w0 "$SCRIPTDIR/qmix-anchor-video-backlinks.php")

: > "$OUT"

roda_hostinger () {   # $1=alias  $2=raiz dos domains
  local ALIAS="$1" RAIZ="$2"
  ssh "$ALIAS" "echo '$B64' | base64 -d > /tmp/qavb.php
    for d in $RAIZ/*/public_html; do
      [ -f \"\$d/wp-config.php\" ] || continue
      SITE=\$(basename \"\$(dirname \"\$d\")\")
      case ' $LISTA ' in *\" \$SITE \"*) ;; *) continue ;; esac
      QMIX_DRY=$DRY wp --path=\"\$d\" eval-file /tmp/qavb.php 2>/dev/null
    done
    rm -f /tmp/qavb.php" 2>&1 | grep -viE "post-quantum|attacks|See https" | tee -a "$OUT"
}

echo "### anderson-gna"   | tee -a "$OUT"; roda_hostinger hostinger-anderson-gna /home/u400588174/domains
echo "### qmix"           | tee -a "$OUT"; roda_hostinger hostinger-qmix         /home/u463007860/domains
echo "### vps1"           | tee -a "$OUT"; roda_hostinger hostinger-vps1         /home/u651115354/domains

echo "### hostverge"      | tee -a "$OUT"
cat > /tmp/_qavb_remote.sh <<REMOTE
#!/bin/bash
echo '$B64' | base64 -d > /tmp/qavb.php
cd /home/sites/18a/7/7672b9147f//public_html
for d in */; do
  SITE=\${d%/}
  [ -f "\$SITE/wp-config.php" ] || continue
  case ' $LISTA ' in *" \$SITE "*) ;; *) continue ;; esac
  QMIX_DRY=$DRY wp --path="\$SITE" --allow-root eval-file /tmp/qavb.php 2>/dev/null
done
rm -f /tmp/qavb.php
REMOTE
cat /tmp/_qavb_remote.sh | ssh opengravity "cat > /tmp/_qavb.sh && cat /tmp/_qavb.sh | ssh -i /root/.ssh/id_hostverge qmix.com.br@ssh.us.stackcp.com 'cat > /tmp/_qavb.sh && bash /tmp/_qavb.sh'" 2>&1 | grep -viE "post-quantum|attacks|See https" | tee -a "$OUT"

echo
echo "resultado em $OUT"
grep -cE '\|OK\|' "$OUT" 2>/dev/null | sed 's/^/gravados: /' || true
grep -cE '\|DRY\|' "$OUT" 2>/dev/null | sed 's/^/candidatos: /' || true
