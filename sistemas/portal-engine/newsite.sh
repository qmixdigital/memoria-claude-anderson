#!/usr/bin/env bash
#
# newsite.sh — provisiona um novo portal (HTML estatico + endpoint Antonio).
# Uso:  sudo bash newsite.sh <slug> <dominio> "<Nome do Portal>"
# Ex.:  sudo bash newsite.sh exemplo exemplo.com.br "Portal Exemplo"
#
# BLINDAGEM: tudo aditivo. So recarrega o Nginx se `nginx -t` passar;
# se falhar, remove o vhost recem-criado e aborta (config rodando intacta).
# Nao toca em nenhum outro vhost, nem no default_server, nem nos apps existentes.
set -euo pipefail

SLUG="${1:?slug obrigatorio (ex: exemplo)}"
DOMAIN="${2:?dominio obrigatorio (ex: exemplo.com.br)}"
NAME="${3:-$DOMAIN}"

IP="31.97.173.40"
ENGINE="/opt/portal-engine"
SITES_ROOT="/srv/portais"
NS="${SLUG}-api/v1"
KEY="$(openssl rand -hex 32)"
INKEY="$(openssl rand -hex 16)"
VHOST="/etc/nginx/conf.d/portal-${SLUG}.conf"

[[ "$SLUG" =~ ^[a-z0-9-]+$ ]] || { echo "slug invalido (use a-z 0-9 -)"; exit 1; }
[[ -f "$ENGINE/sites.json" ]] || { echo "sites.json nao encontrado"; exit 1; }
[[ -f "$VHOST" ]] && { echo "vhost ja existe: $VHOST"; exit 1; }

echo "==> 1/5 pastas isoladas"
mkdir -p "$SITES_ROOT/$SLUG"/{data,public}
chown -R portais:portais "$SITES_ROOT/$SLUG"

echo "==> 2/5 registrando no sites.json (API key propria + fingerprint anti-PBN: arch+paleta+fontes+classes+tokens divergentes dos vizinhos)"
SLUG="$SLUG" DOMAIN="$DOMAIN" NAME="$NAME" KEY="$KEY" NS="$NS" INKEY="$INKEY" node -e '
const fs=require("fs"),p="/opt/portal-engine/sites.json";
const { rollFingerprint } = require("/opt/portal-engine/src/tokens.js");
const c=JSON.parse(fs.readFileSync(p,"utf8"));
if(c.sites.find(s=>s.slug===process.env.SLUG)){console.error("slug ja existe no sites.json");process.exit(1);}
// vizinhos (assinaturas ja em uso) -> o roll escolhe valores que divergem
const neighbors=c.sites.filter(s=>s.slug!=="teste").map(s=> s.fp
  ? {arch:s.fp.arch,paletteName:s.fp.paletteName,fontName:s.fp.fontName,prefix:s.fp.prefix}
  : {arch:(s.layout&&s.layout.arch)||"A"});
const r=rollFingerprint(process.env.SLUG, neighbors);
const fp={arch:r.arch,prefix:r.prefix,paletteMode:r.paletteMode,paletteName:r.paletteName,fontName:r.fontName,
  radius:r.radius,shadow:r.shadow,spacing:r.spacing,container:r.container,baseFs:r.baseFs,
  heroAr:r.heroAr,cardAr:r.cardAr,kickerLs:r.kickerLs,headOrder:r.headOrder,schemaVariant:r.schemaVariant};
c.sites.push({
  slug:process.env.SLUG, name:process.env.NAME, domain:process.env.DOMAIN,
  baseUrl:"https://"+process.env.DOMAIN, apikey:process.env.KEY, ns:process.env.NS,
  lang:"pt-BR", description:process.env.NAME, tagline:"Noticias em tempo real",
  indexnowKey:process.env.INKEY, defaultCategory:"Notícias", categoryMap:{"1":"Notícias"},
  contactTo:"fatimawatanabe36@gmail.com",
  postsOnHome:12,
  layout:{arch:r.arch}, theme:r.theme, fp:fp
});
fs.writeFileSync(p, JSON.stringify(c,null,2));
console.log("    identidade: arch "+r.arch+" | paleta "+r.paletteName+" | fontes "+r.fontName+" | classes "+r.prefix+"-* | radius "+r.radius+"/shadow "+r.shadow+"/espaco "+r.spacing);
'
chown portais:portais "$ENGINE/sites.json"

echo "==> 3/5 criando vhost Nginx"
CERT_DIR="/etc/ssl/portais/${DOMAIN}"
# bloco reutilizavel: corpo do site (root + endpoint Antonio + cache + urls limpas)
read -r -d '' SITE_BODY <<BODY || true
    root ${SITES_ROOT}/${SLUG}/public;
    index index.html;
    access_log /var/log/nginx/portal-${SLUG}.access.log;
    error_log  /var/log/nginx/portal-${SLUG}.error.log warn;
    client_max_body_size 10m;

    # headers de seguranca
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # pagina 404 branded
    error_page 404 /404.html;

    # Endpoint do Sistema Antonio (qualquer <ns>/v1/artigos) -> receptor Node local (rate-limited)
    location ~ /[a-z0-9_-]+/v1/artigos\$ {
        limit_req zone=portal_api burst=30 nodelay;
        proxy_pass http://127.0.0.1:8791;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 30s;
    }
    # formulario de contato -> receptor (envia via Resend)
    location = /api/contato {
        limit_req zone=portal_api burst=10 nodelay;
        proxy_pass http://127.0.0.1:8791;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    location ~* \.(webp|jpg|jpeg|png|gif|svg|ico|css|js|woff2)\$ { expires 30d; add_header Cache-Control "public"; }
    location = /site.webmanifest { default_type application/manifest+json; expires 7d; }
    location / { try_files \$uri \$uri/ \$uri/index.html =404; }
BODY

if [[ -f "$CERT_DIR/origin.pem" && -f "$CERT_DIR/origin.key" ]]; then
  echo "    Origin Cert encontrado -> vhost Full(strict) 80->443"
  cat > "$VHOST" <<NGINX
# Portal: ${NAME} (${DOMAIN}) — gerado por newsite.sh (Full strict / Cloudflare Origin Cert)
server {
    listen ${IP}:80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$host\$request_uri;
}
server {
    listen ${IP}:443 ssl;
    http2 on;
    server_name ${DOMAIN} www.${DOMAIN};

    ssl_certificate     ${CERT_DIR}/origin.pem;
    ssl_certificate_key ${CERT_DIR}/origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

${SITE_BODY}
}
NGINX
else
  echo "    (sem Origin Cert ainda) -> vhost HTTP:80 temporario (funciona com Cloudflare Flexible)"
  cat > "$VHOST" <<NGINX
# Portal: ${NAME} (${DOMAIN}) — gerado por newsite.sh (HTTP/80; aguardando Origin Cert p/ Full strict)
server {
    listen ${IP}:80;
    server_name ${DOMAIN} www.${DOMAIN};
${SITE_BODY}
}
NGINX
fi

echo "==> 4/5 validando Nginx (guarda de seguranca)"
if nginx -t >/tmp/nginxtest.log 2>&1; then
    systemctl reload nginx
    echo "    nginx -t OK -> recarregado (graceful)"
else
    echo "    !! nginx -t FALHOU — removendo vhost e abortando (nada foi aplicado):"
    sed 's/^/      /' /tmp/nginxtest.log
    rm -f "$VHOST"
    exit 1
fi

echo "==> 5/5 receptor recarrega sites.json sozinho (fs.watch); aguardando..."
sleep 3

echo ""
echo "================ PORTAL CRIADO ================"
echo " Site:        ${NAME}"
echo " Dominio:     ${DOMAIN}"
echo " Raiz HTML:   ${SITES_ROOT}/${SLUG}/public"
echo " Endpoint:    https://${DOMAIN}/${NS}/artigos"
echo " X-API-KEY:   ${KEY}"
echo "----------------------------------------------"
echo " FALTA (no Cloudflare):"
echo "  1. DNS A  ${DOMAIN} -> ${IP}  (proxy LARANJA / on)"
echo "  2. DNS A  www       -> ${IP}  (proxy laranja)"
echo "  3. SSL/TLS mode: Flexible (ja funciona) OU Full(strict) c/ Origin Cert"
echo " Depois: cadastrar o endpoint + X-API-KEY acima no Sistema Antonio."
echo "=============================================="
