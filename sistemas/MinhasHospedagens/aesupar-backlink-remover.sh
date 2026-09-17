#!/bin/bash
# Remove o backlink aesupar.com.br do footer dos 6 sites. Inserido 2026-07-21.
# Uso: bash aesupar-backlink-remover.sh
MP="wp-content/mu-plugins/zzz-footer-aesupar.php"
echo "Removendo backlink aesupar dos 6 sites..."
# euvo (vps1)
ssh hostinger-vps1 "cd /home/u651115354/domains/euvo.com.br/public_html && rm -f $MP && wp eval 'do_action(\"litespeed_purge_all\");' >/dev/null 2>&1; rm -rf wp-content/litespeed/* 2>/dev/null; wp cache flush >/dev/null 2>&1; echo '  euvo.com.br: removido'"
# barranews (qmix)
ssh hostinger-qmix "cd /home/u463007860/domains/barranews.com.br/public_html && rm -f $MP && wp eval 'do_action(\"litespeed_purge_all\");' >/dev/null 2>&1; rm -rf wp-content/litespeed/* 2>/dev/null; wp cache flush >/dev/null 2>&1; echo '  barranews.com.br: removido'"
# anderson-gna (4)
for D in incast.com.br advivo.com.br ebookcult.com.br adonline.com.br; do
  ssh hostinger-anderson-gna "cd /home/u400588174/domains/$D/public_html && rm -f $MP && wp eval 'do_action(\"litespeed_purge_all\");' >/dev/null 2>&1; rm -rf wp-content/litespeed/* 2>/dev/null; wp cache flush >/dev/null 2>&1; echo '  $D: removido'"
done
echo "Concluido. Verifique que o link sumiu."
