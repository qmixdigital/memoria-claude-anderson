#!/bin/bash
# Remove o backlink criexp (ancora "teste PTV") do footer dos 5 sites. Inserido 2026-07-21.
MP="wp-content/mu-plugins/zzz-footer-criexp.php"
for D in jornaldobairroalto.com.br opopularjornal.com.br saberdefato.com.br universoneo.com.br; do
  ssh hostinger-anderson-gna "cd /home/u400588174/domains/$D/public_html && rm -f $MP && wp eval 'do_action(\"litespeed_purge_all\");' >/dev/null 2>&1; rm -rf wp-content/litespeed/* 2>/dev/null; wp cache flush >/dev/null 2>&1; echo '  $D: removido'"
done
ssh hostinger-qmix "cd /home/u463007860/domains/oiempreendedores.com.br/public_html && rm -f $MP && wp eval 'do_action(\"litespeed_purge_all\");' >/dev/null 2>&1; rm -rf wp-content/litespeed/* 2>/dev/null; wp cache flush >/dev/null 2>&1; echo '  oiempreendedores.com.br: removido'"
