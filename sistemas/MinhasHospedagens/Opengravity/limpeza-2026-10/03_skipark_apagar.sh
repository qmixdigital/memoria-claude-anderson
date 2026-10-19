#!/bin/bash
# Roda NA opengravity (root). Apaga o skipark por completo (ordem do operador em 18/10/2026).
# O dominio skipark.com.br esta "inactive" no Registro.br desde 05/10 (sem DNS).
# ANTES de rodar: baixar o ultimo dump para a maquina local (passo no RUNBOOK).
# Uso: bash 03_skipark_apagar.sh [--apply]
set -uo pipefail
export PATH=$PATH:/usr/local/hestia/bin
APPLY=0; [ "${1:-}" = "--apply" ] && APPLY=1
run() { echo "+ $*"; [ $APPLY = 1 ] && eval "$@"; }

run "pm2 delete skipark; pm2 save"
run "v-delete-web-domain qmix skipark.com.br yes"
run "rm -f /etc/nginx/conf.d/skipark-upstream.conf /etc/nginx/conf.d/domains/skipark.com.br*.bak*"
run "rm -rf /var/www/skipark /var/www/skipark-build /var/backups/skipark"
run "rm -f /root/backup-skipark.sh /var/log/skipark-backup.log*"
run "crontab -l | grep -v 'skipark' | crontab -"
run "sed -i 's# /var/log/skipark-backup.log##' /etc/logrotate.d/qmix-hardening"
run "sudo -u postgres dropdb --if-exists skipark"
run "nginx -t && systemctl reload nginx"
# conferencia: nada pode sobrar
grep -rl skipark /etc/nginx /var/spool/cron/crontabs 2>/dev/null; pm2 ls | grep skipark; echo "fim"
