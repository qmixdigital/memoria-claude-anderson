#!/usr/bin/env bash
# Ativa os diretorios em subdominio (18/09/2026). Pre-requisitos, criados fora
# deste script: registro A proxied de contadores.revistadeducao.com.br e
# diretorio.desassossegada.com.br -> 77.37.69.175, e Origin Cert de cada um em
# /etc/ssl/portais/<host>/origin.{pem,key} na opengravity.
# Rodar do Windows (Git Bash): bash scripts/ativar_subdominios_diretorios.sh
set -e
Q='grep -v post-quantum'
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36"
for h in contadores.revistadeducao.com.br diretorio.desassossegada.com.br; do
  ip=$(ssh opengravity "dig +short @1.1.1.1 $h" 2>/dev/null | grep -v post-quantum | head -1); [ -n "$ip" ] || { echo "FALTA DNS: $h"; exit 1; }
  ssh opengravity "test -s /etc/ssl/portais/$h/origin.pem" 2>/dev/null || { echo "FALTA CERT: $h"; exit 1; }
done
echo "1/5 nginx opengravity"
ssh opengravity 'cd /etc/nginx/conf.d && mv -n pendente/app-*.conf . 2>/dev/null; nginx -t && systemctl reload nginx && echo nginx ok' 2>&1 | $Q
echo "2/5 contadores: troca de release (basePath removido)"
ssh hostinger-vps-srv1166087 'cd /var/www/contadores && test -f .next-novo/BUILD_ID && export PATH=/root/.nvm/versions/node/v20.20.2/bin:/root/.bun/bin:$PATH && rm -rf .next-bak-old && ([ -d .next-bak ] && mv .next-bak .next-bak-old || true) && mv .next .next-bak && mv .next-novo .next && pm2 reload contadores >/dev/null && for i in $(seq 1 60); do c=$(curl -s -o /dev/null -w "%{http_code}" -m 8 http://127.0.0.1:3210/); [ "$c" = 200 ] && break; sleep 3; done; echo "3210 -> $c"; pm2 reload contadores-b >/dev/null 2>&1 || true; pm2 save >/dev/null' 2>&1 | $Q
echo "3/5 desassossegada-dir: deploy com SITE_URL novo"
ssh hostinger-vps-srv1166087 'E=/var/www/desassossegada-dir-shared/.env; grep -q "^NEXT_PUBLIC_SITE_URL=" $E && sed -i "s#^NEXT_PUBLIC_SITE_URL=.*#NEXT_PUBLIC_SITE_URL=https://diretorio.desassossegada.com.br#" $E || echo "NEXT_PUBLIC_SITE_URL=https://diretorio.desassossegada.com.br" >> $E; cd /var/www/desassossegada-dir && tar --exclude=node_modules --exclude=.next --exclude=.env -czf /tmp/desassossegada-dir.tar.gz . && bash scripts/deploy.sh /tmp/desassossegada-dir.tar.gz 2>&1 | tail -4' 2>&1 | $Q
echo "4/5 portais: config + rebuild"
scp -q "$(dirname "$0")/config_portais_subdominio.py" opengravity:/tmp/ 2>&1 | $Q
ssh opengravity 'python3 /tmp/config_portais_subdominio.py && cd /opt/portal-engine && for s in revistadeducao desassossegada; do sudo -u portais HOME=/opt/portal-engine node pages_pack.js $s 2>&1 | grep -E "^'$s': |Deployment complete|AVISO|ERRO" | head -3; done' 2>&1 | $Q
echo "5/5 conferencia"
for u in https://contadores.revistadeducao.com.br/ https://contadores.revistadeducao.com.br/sitemap.xml https://diretorio.desassossegada.com.br/saloes/ https://diretorio.desassossegada.com.br/sitemap-diretorio.xml https://diretorio.desassossegada.com.br/ https://revistadeducao.com.br/contadores/go/goiania/ https://desassossegada.com.br/saloes/ https://desassossegada.com.br/barbearia/x/; do
  printf "%-62s %s\n" "$u" "$(curl -s -o /dev/null -A "$UA" -w '%{http_code} -> %{redirect_url}' "$u?nc=$RANDOM")"
done
