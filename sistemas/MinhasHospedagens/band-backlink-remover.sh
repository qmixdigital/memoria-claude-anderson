#!/bin/bash
# Remove o backlink BAND do footer do diariopernambucano.com.br. Inserido 2026-07-21.
MP="wp-content/mu-plugins/zzz-footer-band.php"
ssh hostinger-anderson-gna "cd /home/u400588174/domains/diariopernambucano.com.br/public_html && rm -f $MP && wp eval 'do_action(\"litespeed_purge_all\");' >/dev/null 2>&1; rm -rf wp-content/litespeed/* 2>/dev/null; wp cache flush >/dev/null 2>&1; echo '  diariopernambucano.com.br: link BAND removido'"
