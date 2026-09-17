#!/usr/bin/env bash
# setup-vps.sh — One-time setup para QMIX Invest na VPS srv1166087.
# Executar como root. NÃO toca em nenhum serviço existente.

set -euo pipefail

log() { echo "[$(date +%H:%M:%S)] $*"; }

# 1. Verifica que estamos rodando como root
if [ "$(id -u)" != "0" ]; then
  log "ERRO: este script precisa ser executado como root"
  exit 1
fi

# 2. Verifica que estamos em uma VPS Linux com Nginx instalado (não na máquina dev)
if ! command -v nginx >/dev/null 2>&1; then
  log "ERRO: Nginx não está instalado — este script é para a VPS srv1166087"
  exit 1
fi

# 3. Instala Docker se não estiver instalado
if ! command -v docker >/dev/null 2>&1; then
  log "Docker não encontrado — instalando..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

# 4. Verifica que docker compose v2 funciona
if ! docker compose version >/dev/null 2>&1; then
  log "ERRO: docker compose v2 não está disponível"
  exit 1
fi

# 5. Cria diretório do projeto se não existir
PROJECT_DIR="/opt/qmix-invest"
if [ ! -d "$PROJECT_DIR" ]; then
  log "Criando $PROJECT_DIR..."
  mkdir -p "$PROJECT_DIR"
  chown root:root "$PROJECT_DIR"
  chmod 755 "$PROJECT_DIR"
fi

# 6. Cria diretório de backups
mkdir -p "$PROJECT_DIR/backups"
chmod 700 "$PROJECT_DIR/backups"

# 7. Verifica conflito de portas (3010, 3011 NÃO podem estar ocupadas por outros serviços)
for port in 3010 3011; do
  if ss -ltn "sport = :$port" | grep -q LISTEN; then
    log "ERRO: porta $port já está em uso. Veja com: ss -ltnp 'sport = :$port'"
    exit 1
  fi
done

# 8. Verifica conflito de portas Postgres no host (5432) NÃO importa, pois Postgres vai
#    rodar dentro da rede Docker privada (não exposto no host em produção).

# 9. Verifica que Nginx vhost ainda não existe (idempotência)
NGINX_CONF="/etc/nginx/conf.d/qmix-invest.conf"
if [ -f "$NGINX_CONF" ]; then
  log "Nginx vhost já existe em $NGINX_CONF — pulando criação"
else
  log "Aplicando Nginx vhost..."
  if [ -f "$PROJECT_DIR/nginx/qmix-invest.conf" ]; then
    cp "$PROJECT_DIR/nginx/qmix-invest.conf" "$NGINX_CONF"
    if nginx -t; then
      systemctl reload nginx
      log "  vhost aplicado e Nginx recarregado"
    else
      log "ERRO: nginx -t falhou. Removendo vhost..."
      rm "$NGINX_CONF"
      exit 1
    fi
  else
    log "  AVISO: $PROJECT_DIR/nginx/qmix-invest.conf não existe ainda. Pule este passo até clonar o repo."
  fi
fi

# 10. Verifica DNS de qf.qmix.digital
log "Verificando DNS de qf.qmix.digital..."
DNS_IP=$(dig +short qf.qmix.digital A | head -n1 || echo "")
HOST_IP="31.97.173.40"
if [ "$DNS_IP" = "$HOST_IP" ]; then
  log "  DNS OK ($DNS_IP)"
elif [ -z "$DNS_IP" ]; then
  log "  AVISO: DNS de qf.qmix.digital não resolve — configure no Cloudflare apontando para $HOST_IP"
else
  log "  AVISO: DNS aponta para $DNS_IP, esperado $HOST_IP"
fi

log ""
log "✅ Setup concluído. Próximos passos (em ordem):"
log "  1. cd $PROJECT_DIR && git clone https://github.com/qmixdigital/smart.git ."
log "  2. cp .env.example .env && edit .env (POSTGRES_PASSWORD forte, AI_API_KEY, TELEGRAM_*)"
log ""
log "  3. SSL: gerar Cloudflare Origin Certificate em https://dash.cloudflare.com"
log "     (SSL/TLS → Origin Server → Create Certificate, hostname: qf.qmix.digital)"
log "     Setar SSL/TLS mode = 'Full (strict)'."
log "     mkdir -p /etc/ssl/qmix-invest && chmod 750 /etc/ssl/qmix-invest"
log "     Colar Origin Cert em /etc/ssl/qmix-invest/origin.pem (chmod 644)"
log "     Colar Private Key em /etc/ssl/qmix-invest/origin.key (chmod 600)"
log ""
log "  4. Basic Auth: apt install -y apache2-utils"
log "     htpasswd -c /etc/nginx/.htpasswd-qmix-invest <usuario>"
log "     chown www-data:www-data /etc/nginx/.htpasswd-qmix-invest && chmod 640 /etc/nginx/.htpasswd-qmix-invest"
log ""
log "  5. cp $PROJECT_DIR/nginx/qmix-invest.conf /etc/nginx/conf.d/"
log "     nginx -t && systemctl reload nginx"
log ""
log "  6. ./scripts/deploy.sh    (sobe os 5 containers Docker)"
log ""
log "  7. Verificar: curl -i https://qf.qmix.digital/ (deve dar 401 sem credenciais)"
log "                curl -i https://qf.qmix.digital/api/health (deve dar 200/ok)"
