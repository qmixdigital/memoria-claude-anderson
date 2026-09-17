#!/bin/bash
# Backup diario dos bancos da clinicas-vps para outra maquina.
#
# POR QUE ISTO EXISTE: em 01/09/2026 esta maquina nao tinha NENHUM backup fora
# dela. Os dois scripts que rodavam gravavam so no disco local - e um deles,
# /home/qmix/backup-db.sh, vinha gerando um arquivo de 20 BYTES todo dia porque
# o banco clinicas_db que ele tenta copiar nao existe mais. Um backup vazio que
# parece um backup e pior que backup nenhum, porque cria confianca falsa.
#
# Este script copia TODOS os bancos, entao nao depende de alguem lembrar de
# acrescentar um banco novo na lista, e valida cada dump pela marca de conclusao
# que o proprio dump escreve no fim - nunca pelo tamanho.
#
# Por que so os bancos, e nao os arquivos: banco perdido nao se recupera de
# lugar nenhum. Arquivo de upload ainda pode ser reconstruido do Cloudflare, do
# Google cache ou de copia local; linha de banco, nao. Os uploads entram numa
# segunda fase, por rsync incremental.
#
# Destino: 92.113.35.186 (hostinger compartilhada), em ~/backups-qmix, que fica
# FORA de qualquer public_html e portanto nao e acessivel pela web.
#
# Rotacao: 7 diarios + 4 semanais (domingo). O que passa disso e apagado.
#
# Falha em qualquer etapa avisa no Telegram e sai com codigo != 0.

set -uo pipefail

DEST_HOST="u651115354@92.113.35.186"
DEST_PORTA=65002
DEST_DIR="backups-clinicasvps"
CHAVE=/root/.ssh/id_ed25519_backup
TMP=/var/backups/clinicasvps
ENV_TG=/etc/qmix-disk-alert.env
HOJE=$(date +%Y-%m-%d)
DIA_SEMANA=$(date +%u)      # 7 = domingo
LOG=/var/log/clinicasvps-backup.log

exec >> "$LOG" 2>&1
echo "===== $(date '+%Y-%m-%d %H:%M:%S') iniciando"

avisar() {
  local msg="$1"
  echo "AVISO: $msg"
  if [ -f "$ENV_TG" ]; then
    # shellcheck disable=SC1090
    . "$ENV_TG"
    local tok="${TELEGRAM_BOT_TOKEN:-${BOT_TOKEN:-}}"
    local chat="${TELEGRAM_CHAT_ID:-${CHAT_ID:-}}"
    if [ -n "$tok" ] && [ -n "$chat" ]; then
      curl -sS --max-time 20 -o /dev/null \
        "https://api.telegram.org/bot${tok}/sendMessage" \
        --data-urlencode "chat_id=${chat}" \
        --data-urlencode "text=[backup clinicas-vps] $msg" || true
    fi
  fi
}

falhar() { avisar "FALHOU: $1"; exit 1; }

mkdir -p "$TMP" || falhar "nao criou $TMP"
rm -f "$TMP"/*.gz 2>/dev/null

# ---------- MySQL ----------
BANCOS_MY=$(mysql -N -e "SHOW DATABASES;" 2>/dev/null \
  | grep -vE "^(information_schema|performance_schema|sys)$") \
  || falhar "nao listou bancos MySQL"
for b in $BANCOS_MY; do
  arq="$TMP/mysql_${b}_${HOJE}.sql.gz"
  if ! mysqldump --single-transaction --quick --routines --triggers --events \
       --databases "$b" 2>/dev/null | gzip -6 > "$arq"; then
    falhar "mysqldump do banco $b"
  fi
  # Tamanho nao serve de criterio: banco sem tabela gera dump legitimo de ~600
  # bytes. O que prova que o dump nao foi truncado e a marca de conclusao que o
  # mysqldump escreve na ultima linha.
  if ! zcat "$arq" | tail -20 | grep -q "Dump completed"; then
    falhar "dump do MySQL $b truncado (sem marca de conclusao)"
  fi
done
echo "MySQL: $(echo "$BANCOS_MY" | wc -w) bancos"

# ---------- PostgreSQL ----------
BANCOS_PG=$(su - postgres -c "psql -tAc \"select datname from pg_database where datistemplate=false and datname<>'postgres';\"" 2>/dev/null) \
  || falhar "nao listou bancos PostgreSQL"
for b in $BANCOS_PG; do
  arq="$TMP/pg_${b}_${HOJE}.sql.gz"
  if ! su - postgres -c "pg_dump --no-owner --no-privileges '$b'" 2>/dev/null | gzip -6 > "$arq"; then
    falhar "pg_dump do banco $b"
  fi
  # tail -20 e nao -3: o pg_dump recente escreve uma linha de unrestrict DEPOIS
  # da marca de conclusao, entao a marca nao e a ultima linha do arquivo.
  if ! zcat "$arq" | tail -20 | grep -q "PostgreSQL database dump complete"; then
    falhar "dump do Postgres $b truncado (sem marca de conclusao)"
  fi
done
echo "PostgreSQL: $(echo "$BANCOS_PG" | wc -w) bancos"

# ---------- integridade ----------
for f in "$TMP"/*.gz; do
  gzip -t "$f" || falhar "arquivo corrompido: $(basename "$f")"
done
TOTAL=$(du -sh "$TMP" | cut -f1)
echo "dumps gerados: $(ls -1 "$TMP"/*.gz | wc -l) arquivos, $TOTAL"

# ---------- envio ----------
COMUM="-i $CHAVE -o ConnectTimeout=20 -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
# Atencao: ssh usa -p para porta, scp usa -P maiusculo. Passar -p para o scp
# faz ele tratar o numero da porta como arquivo de origem.
SSH_OPTS="$COMUM -p $DEST_PORTA"
SCP_OPTS="$COMUM -P $DEST_PORTA"
PASTA="$DEST_DIR/diario/$HOJE"
ssh $SSH_OPTS "$DEST_HOST" "mkdir -p $PASTA" || falhar "nao criou pasta no destino"
if ! scp $SCP_OPTS -q "$TMP"/*.gz "$DEST_HOST:$PASTA/"; then
  falhar "envio para o destino"
fi

# confere que chegou tudo
ENVIADOS=$(ssh $SSH_OPTS "$DEST_HOST" "ls -1 $PASTA/*.gz 2>/dev/null | wc -l")
LOCAIS=$(ls -1 "$TMP"/*.gz | wc -l)
[ "$ENVIADOS" = "$LOCAIS" ] || falhar "chegaram $ENVIADOS de $LOCAIS arquivos"

# copia semanal aos domingos
if [ "$DIA_SEMANA" = "7" ]; then
  ssh $SSH_OPTS "$DEST_HOST" "mkdir -p $DEST_DIR/semanal && cp -r $PASTA $DEST_DIR/semanal/$HOJE" || true
fi

# ---------- rotacao ----------
ssh $SSH_OPTS "$DEST_HOST" "
  cd $DEST_DIR/diario 2>/dev/null && ls -1d 20* 2>/dev/null | sort | head -n -7 | xargs -r rm -rf
  cd ~/$DEST_DIR/semanal 2>/dev/null && ls -1d 20* 2>/dev/null | sort | head -n -4 | xargs -r rm -rf
  true" || true

rm -f "$TMP"/*.gz
echo "OK: backup de $HOJE concluido ($TOTAL)"
exit 0
