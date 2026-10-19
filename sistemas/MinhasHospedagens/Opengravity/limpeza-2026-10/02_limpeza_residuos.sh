#!/bin/bash
# Roda NA opengravity (root). Remove residuos sem uso levantados em 18/10/2026.
# Uso:  bash 02_limpeza_residuos.sh          -> so mostra (dry run)
#       bash 02_limpeza_residuos.sh --apply  -> executa
set -uo pipefail
export PATH=$PATH:/usr/local/hestia/bin
APPLY=0; [ "${1:-}" = "--apply" ] && APPLY=1
run() { echo "+ $*"; [ $APPLY = 1 ] && eval "$@"; }

echo "== 1. geladeirastop (migrado p/ srv1166087 em 14/09; aqui da 502)"
# trava: so apaga se o site publico continuar 200 (servido pela srv1166087)
code=$(curl -s -o /dev/null -m 20 -w '%{http_code}' https://geladeirastop.com/)
if [ "$code" != "200" ]; then echo "ABORTADO: geladeirastop.com publico = $code"; exit 1; fi
run "v-delete-web-domain qmix geladeirastop.com yes"
run "rm -rf /var/www/geladeirastop.com"
run "rm -f /etc/nginx/conf.d/geladeirastop-upstream.conf /etc/logrotate.d/geladeirastop-prune"
run "sudo -u postgres dropdb --if-exists geladeirastop"
run "crontab -l | grep -v 'geladeirastop' | crontab -"

echo "== 2. dominios Hestia mortos (502 ou sem DNS)"
for d in staging.peritodicas.com blog.qmix.com.br investqmix.qmix.com.br blog.clinicasrecuperacaosaopaulo.com; do
  run "v-delete-web-domain qmix $d yes"
done
run "rm -f /var/log/nginx/domains/cinemateca.com.br*.log /var/log/nginx/domains/webmail.dreduardocembranelli.com*.log"

echo "== 3. bancos sem uso"
for db in notebookx_wp peritodicas_v2; do
  if grep -rqs "$db" /var/www/*/.env* /var/www/*-shared/.env* /home/qmix/web/*/public_html/wp-config.php 2>/dev/null; then
    echo "PULADO: $db ainda referenciado"; continue
  fi
  run "mysqldump $db | gzip > /root/db-backups/$db-final-20261018.sql.gz"
  run "mysql -e 'DROP DATABASE \`$db\`'"
done
for db in $(sudo -u postgres psql -Atc "select datname from pg_database where datname like 'prisma_migrate_shadow_db_%'"); do
  run "sudo -u postgres dropdb '$db'"
done

echo "== 4. sobras em /root e rollbacks antigos"
run "rm -rf /root/ibama /root/ebookcult-motor /root/backup-nutricionista-20260830 /root/rded-imp /root/exq-imp /root/des-imp /root/curioso-imp /root/sab-imp /root/ebook-imp /root/ebook-restaura /root/backup-int-20260828-202319 /root/backups-qmix-pre-delete-20260616 /root/backup-data-capas-20260903-*"
run "rm -rf /root/.cache/* /root/.npm/_cacache"
run "rm -rf /var/www/certificadodigital-prev /var/www/ebookcult-dir-prev"
run "pm2 delete euvo-agenda-crawler && pm2 save"
run "apt-get clean"

echo "== 5. recarregar nginx"
run "nginx -t && systemctl reload nginx"
df -h /
