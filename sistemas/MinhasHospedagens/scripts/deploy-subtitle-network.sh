#!/bin/bash
# Distribui o suporte aos campos novos do Antônio (subtitle / meta_description)
# para todas as instalações WordPress que têm o receptor qmix-receiver.php.
#
#   ./deploy-subtitle-network.sh
#
# Em cada site: aplica o remendo no receptor (idempotente, com backup) e instala
# o mu-plugin qmix-subtitulo.php. Sem os campos no payload, nada muda.

set -e
SCRIPTDIR="$(cd "$(dirname "$0")" && pwd)"
OUTDIR="$SCRIPTDIR/../link-audits"
mkdir -p "$OUTDIR"
OUT="$OUTDIR/deploy-subtitle-$(date +%Y-%m-%d).txt"
: > "$OUT"

PATCHER="$SCRIPTDIR/patch-qmix-receiver-subtitle.php"
PLUGIN="$SCRIPTDIR/qmix-subtitulo.php"

roda_hostinger () {   # $1=alias  $2=raiz dos domains
  local ALIAS="$1" RAIZ="$2"
  scp -q "$PATCHER" "$PLUGIN" "$ALIAS":/tmp/ 2>/dev/null
  ssh "$ALIAS" "for mu in $RAIZ/*/public_html/wp-content/mu-plugins/qmix-receiver.php; do
      [ -f \"\$mu\" ] || continue
      DIR=\$(dirname \"\$mu\")
      SITE=\$(echo \"\$mu\" | sed -E 's#.*/domains/([^/]+)/.*#\1#')
      [ -f \"\$DIR/qmix-receiver.php.bak-subtitle-20260814\" ] || cp \"\$mu\" \"\$DIR/qmix-receiver.php.bak-subtitle-20260814\"
      R=\$(php /tmp/patch-qmix-receiver-subtitle.php \"\$mu\" 2>&1 | tail -1)
      cp /tmp/qmix-subtitulo.php \"\$DIR/qmix-subtitulo.php\"
      echo \"\$SITE|\$R\"
    done
    rm -f /tmp/patch-qmix-receiver-subtitle.php /tmp/qmix-subtitulo.php" 2>&1 |
    grep -viE "post-quantum|attacks|See https" | tee -a "$OUT"
}

echo "### anderson-gna" | tee -a "$OUT"; roda_hostinger hostinger-anderson-gna /home/u400588174/domains
echo "### qmix"         | tee -a "$OUT"; roda_hostinger hostinger-qmix         /home/u463007860/domains
echo "### vps1"         | tee -a "$OUT"; roda_hostinger hostinger-vps1         /home/u651115354/domains

echo "### hostverge" | tee -a "$OUT"
B64P=$(base64 -w0 "$PATCHER")
B64G=$(base64 -w0 "$PLUGIN")
cat > /tmp/_sub_remote.sh <<REMOTE
#!/bin/bash
echo '$B64P' | base64 -d > /tmp/patch-qmix.php
echo '$B64G' | base64 -d > /tmp/qmix-subtitulo.php
cd /home/sites/18a/7/7672b9147f//public_html
for mu in */wp-content/mu-plugins/qmix-receiver.php; do
  [ -f "\$mu" ] || continue
  DIR=\$(dirname "\$mu")
  SITE=\$(echo "\$mu" | cut -d/ -f1)
  [ -f "\$DIR/qmix-receiver.php.bak-subtitle-20260814" ] || cp "\$mu" "\$DIR/qmix-receiver.php.bak-subtitle-20260814"
  R=\$(php /tmp/patch-qmix.php "\$mu" 2>&1 | tail -1)
  cp /tmp/qmix-subtitulo.php "\$DIR/qmix-subtitulo.php"
  echo "\$SITE|\$R"
done
rm -f /tmp/patch-qmix.php /tmp/qmix-subtitulo.php
REMOTE
cat /tmp/_sub_remote.sh | ssh opengravity "cat > /tmp/_sub.sh && cat /tmp/_sub.sh | ssh -i /root/.ssh/id_hostverge qmix.com.br@ssh.us.stackcp.com 'cat > /tmp/_sub.sh && bash /tmp/_sub.sh'" 2>&1 |
  grep -viE "post-quantum|attacks|See https" | tee -a "$OUT"

echo
echo "resultado em $OUT"
echo "OK:          $(grep -c '|OK' "$OUT" || true)"
echo "ja aplicado: $(grep -c 'JA_APLICADO' "$OUT" || true)"
echo "erros:       $(grep -c '|ERRO' "$OUT" || true)"
