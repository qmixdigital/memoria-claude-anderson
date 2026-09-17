#!/bin/bash
# Converte um par app/app-b do modelo "segunda instancia ligada 24h" para o
# modelo de instancia efemera, que so existe durante o deploy.
#
# A segunda instancia existia para cobrir os poucos minutos de deploy e cobrava
# RAM o ano inteiro. No opengravity os 6 pares seguravam 1,84 GB numa maquina de
# 7,8 GB que estava com 175 MB livres.
#
# O que muda no nginx: max_fails=0. Com max_fails=2/fail_timeout=10s o nginx
# marcaria a porta B como morta e, no meio de um deploy, poderia ficar sem
# backend elegivel e responder "no live upstreams" com 502. Sem ejecao, ele
# tenta uma porta e, no "connection refused" do loopback, cai na outra na hora.
# Como o request nem chegou a ser enviado, ate POST e repassado (o nginx so se
# recusa a repetir metodo nao idempotente que JA foi enviado) - isso importa
# para o skipark, que recebe pedido por POST.
#
# Por que o health check vai pelo Cloudflare e nao direto na origem: o
# middleware desses apps Next recusa (403) requisicao que nao venha do
# Cloudflare, entao bater na origem com --resolve daria falso negativo. Pelo CF
# com cache-buster ?nc= o cf-cache-status volta DYNAMIC, o que prova que a
# resposta veio da origem e nao do cache da borda.
#
# Uso: ./migrar_efemero.sh APP DIR PORTA_A PORTA_B DOMINIO
set -uo pipefail

APP=$1; DIR=$2; PA=$3; PB=$4; DOM=$5
APP_B="${APP}-b"
PM2=$(command -v pm2 || ls /root/.nvm/versions/node/*/bin/pm2 2>/dev/null | head -1)
DATA=$(date +%Y%m%d-%H%M%S)
UP=$(grep -rl "127.0.0.1:$PB" /etc/nginx/ 2>/dev/null | grep -v '\.bak' | head -1)

falha() { echo "  ERRO: $1"; exit 1; }

echo "=== $APP  (A=$PA  B=$PB)  $DOM"

# estado de partida, para poder comparar no fim
checar() { curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://$DOM/?nc=$RANDOM$RANDOM" 2>/dev/null; }
porta_a=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://127.0.0.1:$PA/" 2>/dev/null)
echo "  app na porta $PA: HTTP $porta_a"
antes=$(checar)
echo "  site antes: HTTP $antes"
[ "$antes" = "200" ] || falha "site nao estava 200 antes de mexer; abortando"

# ---------- 1. nginx: desliga a ejecao de backend ----------
[ -n "$UP" ] || falha "nao achei o upstream com a porta $PB"
cp -a "$UP" "$UP.bak-$DATA"
sed -i "s/max_fails=2 fail_timeout=10s/max_fails=0/g" "$UP"
grep -qE "server +127\.0\.0\.1:$PB max_fails=0" "$UP" || falha "sed nao aplicou em $UP"
nginx -t 2>/dev/null || { cp -a "$UP.bak-$DATA" "$UP"; falha "nginx -t reprovou; revertido"; }
systemctl reload nginx || { cp -a "$UP.bak-$DATA" "$UP"; systemctl reload nginx; falha "reload falhou; revertido"; }
echo "  nginx: max_fails=0 aplicado e recarregado"

# ---------- 2. deploy.sh com a instancia efemera ----------
cat > "$DIR/deploy.sh" <<EOF
#!/bin/bash
# Deploy zero-downtime SEM manter a segunda instancia ligada o tempo todo.
#
# A instancia B e EFEMERA: sobe com o codigo novo, segura o trafego enquanto a
# principal recarrega, e e desligada no fim. Fora do deploy roda um processo so.
#
# Ganho extra: o B sobe do zero e passa por health check ANTES de a principal
# ser tocada, entao build quebrado aparece antes de mexer no que esta no ar.
#
# Uso:
#   ./deploy.sh                 # atualiza, builda e reinicia
#   PULAR_BUILD=1 ./deploy.sh   # so o ciclo de reinicio
#   PULAR_NPM=1   ./deploy.sh   # atualiza codigo mas nao roda npm
set -euo pipefail

APP="\${APP:-$APP}"
APP_B="\${APP_B:-${APP}-b}"
PORTA_A="\${PORTA_A:-$PA}"
PORTA_B="\${PORTA_B:-$PB}"
DIR="\${DIR:-$DIR}"
DOMINIO="\${DOMINIO:-$DOM}"
PM2=$PM2

espera_porta() {
  local porta=\$1 nome=\$2 limite=\${3:-90} i=0
  echo "    aguardando \$nome (porta \$porta)..."
  until curl -sf -o /dev/null --max-time 3 "http://127.0.0.1:\$porta/"; do
    i=\$((i+1))
    [ "\$i" -lt "\$limite" ] || { echo "    ERRO: \$nome nao respondeu em \${limite}s"; return 1; }
    sleep 1
  done
  echo "    \$nome respondendo (\${i}s)"
}

limpa() {
  if \$PM2 describe "\$APP_B" >/dev/null 2>&1; then
    echo "==> Removendo instancia efemera \$APP_B"
    \$PM2 delete "\$APP_B" >/dev/null 2>&1 || true
    \$PM2 save >/dev/null 2>&1 || true
  fi
}
trap limpa EXIT

cd "\$DIR"

if [ "\${PULAR_BUILD:-0}" != "1" ]; then
  if [ -d .git ]; then
    echo "==> Atualizando codigo (git)"
    git pull --ff-only
  else
    echo "==> Sem repositorio git: usando o codigo ja presente no diretorio"
  fi
  if [ -f package.json ] && [ "\${PULAR_NPM:-0}" != "1" ]; then
    echo "==> Instalando dependencias"
    npm install --production=false
    echo "==> Build"
    npm run build
  fi
fi

echo "==> Subindo instancia efemera \$APP_B na porta \$PORTA_B"
\$PM2 start ecosystem.config.* --only "\$APP_B"
espera_porta "\$PORTA_B" "\$APP_B"

echo "==> Recarregando \$APP (o trafego vai para \$APP_B enquanto isso)"
\$PM2 reload "\$APP"
espera_porta "\$PORTA_A" "\$APP"

echo "==> Confirmando o site pelo nginx"
codigo=\$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "https://\$DOMINIO/?nc=\$RANDOM\$RANDOM")
if [ "\$codigo" != "200" ]; then
  echo "    ERRO: site respondeu \$codigo. A instancia efemera fica de pe para investigacao."
  trap - EXIT
  exit 1
fi
echo "    site respondendo 200"
echo "==> Deploy concluido. Desligando a instancia efemera."
EOF
chmod +x "$DIR/deploy.sh"
echo "  deploy.sh instalado em $DIR"

# ---------- 3. ENSAIO: prova que o ecosystem consegue subir o B ----------
# Sem este ensaio, um ecosystem errado so apareceria no meio de um deploy
# futuro, com a instancia principal ja parada. Aqui a falha e barata: o B atual
# ainda esta de pe e nada foi removido em definitivo.
echo "  ensaio: derrubando e re-subindo o B pelo ecosystem"
$PM2 delete "$APP_B" >/dev/null 2>&1
cd "$DIR" || falha "nao consegui entrar em $DIR"
$PM2 start ecosystem.config.* --only "$APP_B" >/dev/null 2>&1
i=0
until curl -sf -o /dev/null --max-time 3 "http://127.0.0.1:$PB/"; do
  i=$((i+1))
  if [ "$i" -ge 60 ]; then
    echo "  ERRO: o ecosystem NAO conseguiu subir $APP_B na porta $PB"
    cp -a "$UP.bak-$DATA" "$UP"; systemctl reload nginx
    falha "ecosystem nao serve para o deploy; nginx revertido e B deixado como estava"
  fi
  sleep 1
done
echo "  ensaio OK: $APP_B subiu pelo ecosystem em ${i}s"

# ---------- 4. desliga o B ----------
ram=$($PM2 jlist 2>/dev/null | python3 -c "
import sys,json
try:
  print(round(next(a['monit']['memory'] for a in json.load(sys.stdin) if a['name']=='$APP_B')/1048576))
except Exception: print(0)")
$PM2 delete "$APP_B" >/dev/null 2>&1 || echo "  (aviso: $APP_B ja nao existia)"
$PM2 save >/dev/null 2>&1

# ---------- 5. prova que o site aguenta com a porta B fechada ----------
sleep 2
ok=0; ruim=0
for i in $(seq 1 12); do
  c=$(checar)
  if [ "$c" = "200" ]; then ok=$((ok+1)); else ruim=$((ruim+1)); echo "    resposta ruim: $c"; fi
done
echo "  apos desligar o B: $ok/12 respostas 200 (liberados ${ram} MB)"

if [ "$ruim" -gt 0 ]; then
  echo "  REVERTENDO: religando $APP_B"
  cd "$DIR" && $PM2 start ecosystem.config.* --only "$APP_B" >/dev/null 2>&1
  $PM2 save >/dev/null 2>&1
  cp -a "$UP.bak-$DATA" "$UP"; systemctl reload nginx
  falha "site falhou com o B desligado; tudo revertido"
fi
echo "  OK: $APP migrado, ${ram} MB liberados"
