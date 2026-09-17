#!/bin/bash
# Backup dos uploads do srv1166087 (fase 2 do backup; a fase 1 sao os bancos,
# em qmix-backup-bancos.sh).
#
# POR QUE TAR E NAO RSYNC DE ARQUIVO SOLTO:
# o destino e uma hospedagem compartilhada que ja tem 161 mil arquivos e um
# limite de inodes do plano. Jogar 58 mil arquivos soltos la dentro arrisca
# estourar o limite e derrubar os SITES QUE MORAM NESSE MESMO PLANO. Com tar,
# cada site vira 1 arquivo por dia, e o custo em inode fica na casa das
# centenas.
#
# ESTRATEGIA: domingo faz o full e zera o snapshot; nos outros dias faz o
# incremental sobre esse full (so o que mudou, tipicamente poucos MB de imagem
# nova do Antonio). Guarda 2 geracoes semanais.
#
# RESTAURACAO: extrair o full e depois cada incremental EM ORDEM DE DATA,
# sempre com -g /dev/null:
#   tar -xzf SITE_full.tar.gz -g /dev/null -C /destino
#   tar -xzf SITE_inc-2026-09-01.tar.gz -g /dev/null -C /destino
#   tar -xzf SITE_inc-2026-09-02.tar.gz -g /dev/null -C /destino
#
# COMPRESSAO -1 de proposito: uploads sao quase todos JPG/WebP/PNG, ja
# comprimidos. Nivel alto so queima CPU sem ganhar espaco.

set -uo pipefail

DEST_HOST="u651115354@92.113.35.186"
DEST_PORTA=65002
DEST_DIR="backups-clinicasvps/uploads"
CHAVE=/root/.ssh/id_ed25519_backup
TMP=/var/backups/clinicasvps-uploads
SNAP=/var/backups/clinicasvps-snapshots
ENV_TG=/etc/qmix-disk-alert.env
HOJE=$(date +%Y-%m-%d)
DIA_SEMANA=$(date +%u)          # 7 = domingo
LOG=/var/log/clinicasvps-backup-uploads.log
MIN_LIVRE_GB=15                 # nao roda se o disco local estiver apertado

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
        --data-urlencode "text=[uploads clinicas-vps] $msg" || true
    fi
  fi
}
falhar() { avisar "FALHOU: $1"; exit 1; }

LIVRE_GB=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
[ "${LIVRE_GB:-0}" -ge "$MIN_LIVRE_GB" ] || falhar "disco local com so ${LIVRE_GB}G livres, abortando"

mkdir -p "$TMP" "$SNAP" || falhar "nao criou diretorios de trabalho"
rm -f "$TMP"/*.tar.gz 2>/dev/null

# Domingo reseta a cadeia: apaga os snapshots para o tar gerar full.
if [ "$DIA_SEMANA" = "7" ]; then
  MODO=full
  GERACAO="semana-$HOJE"
  rm -f "$SNAP"/*.snar
  echo "$GERACAO" > "$SNAP/geracao_atual"
else
  MODO=incremental
  GERACAO=$(cat "$SNAP/geracao_atual" 2>/dev/null || echo "")
  # Sem full anterior (primeira execucao, ou snapshot perdido): faz full agora,
  # senao o incremental nasceria orfao e nao daria para restaurar.
  if [ -z "$GERACAO" ] || [ -z "$(ls -A "$SNAP"/*.snar 2>/dev/null)" ]; then
    MODO=full
    GERACAO="semana-$HOJE"
    rm -f "$SNAP"/*.snar
    echo "$GERACAO" > "$SNAP/geracao_atual"
    echo "sem full anterior: promovendo esta execucao a full"
  fi
fi
echo "modo=$MODO geracao=$GERACAO"

# ---------- que diretorios entram ----------
# Regra: tudo que guarda arquivo enviado, EXCETO os *-prev, que sao copias do
# deploy anterior no mesmo disco (conferido: inodes diferentes, sao duplicatas
# reais, nao link). Copia no mesmo disco nao e backup e so dobraria o volume.
ALVOS=$(
  ls -d /var/www/*/public/uploads \
        /var/www/*/uploads \
        /var/www/*/public/images \
        /home/boot/web/*/public_html/wp-content/uploads 2>/dev/null \
    | grep -v -- "-prev/"
)
[ -n "$ALVOS" ] || falhar "nenhum diretorio de upload encontrado"

# ---------- gera os tars ----------
FEITOS=0
for dir in $ALVOS; do
  [ -d "$dir" ] || continue
  # nome do site + sufixo do tipo de pasta, para nao colidir uploads com images
  nome=$(echo "$dir" | cut -d/ -f5)_$(basename "$dir")
  nome=$(echo "$nome" | tr -c 'A-Za-z0-9._-' '_')
  snar="$SNAP/${nome}.snar"
  if [ "$MODO" = full ]; then
    arq="$TMP/${nome}_full.tar.gz"
  else
    arq="$TMP/${nome}_inc-${HOJE}.tar.gz"
  fi

  # --warning=no-file-changed: arquivo sendo escrito durante o tar gera aviso e
  # codigo 1, que aqui nao e falha real. Codigo 2 sim (erro fatal).
  tar --listed-incremental="$snar" \
      --warning=no-file-changed --warning=no-file-removed \
      -czf "$arq" -C "$(dirname "$dir")" "$(basename "$dir")" 2>/dev/null
  rc=$?
  [ $rc -le 1 ] || falhar "tar do $dir (codigo $rc)"

  # tar vazio de incremental (nada mudou) nao precisa viajar
  qtd=$(tar -tzf "$arq" 2>/dev/null | grep -vc '/$' || true)
  if [ "$MODO" = incremental ] && [ "${qtd:-0}" -eq 0 ]; then
    rm -f "$arq"
    continue
  fi
  # prova que o tar nao saiu truncado: tem que ser lido do inicio ao fim
  tar -tzf "$arq" > /dev/null 2>&1 || falhar "tar corrompido: $(basename "$arq")"
  FEITOS=$((FEITOS+1))
done

if [ "$FEITOS" -eq 0 ]; then
  echo "nada mudou hoje, nenhum arquivo a enviar"
  echo "OK: $HOJE sem alteracoes"
  exit 0
fi

TOTAL=$(du -shc "$TMP"/*.tar.gz 2>/dev/null | tail -1 | cut -f1)
echo "tars gerados: $FEITOS arquivos, $TOTAL"

# ---------- envio ----------
COMUM="-i $CHAVE -o ConnectTimeout=20 -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
# ssh usa -p minusculo para porta, scp usa -P maiusculo.
SSH_OPTS="$COMUM -p $DEST_PORTA"
SCP_OPTS="$COMUM -P $DEST_PORTA"
PASTA="$DEST_DIR/$GERACAO"
ssh $SSH_OPTS "$DEST_HOST" "mkdir -p $PASTA" || falhar "nao criou pasta no destino"
scp $SCP_OPTS -q "$TMP"/*.tar.gz "$DEST_HOST:$PASTA/" || falhar "envio para o destino"

# confere que chegou o que saiu (compara nomes, nao so a contagem)
for f in "$TMP"/*.tar.gz; do
  b=$(basename "$f")
  ssh $SSH_OPTS "$DEST_HOST" "test -s $PASTA/$b" || falhar "nao chegou: $b"
done

# guarda o snapshot junto do backup: sem ele nao da para continuar a cadeia
tar -czf "$TMP/_snapshots.tar.gz" -C "$SNAP" . 2>/dev/null \
  && scp $SCP_OPTS -q "$TMP/_snapshots.tar.gz" "$DEST_HOST:$PASTA/" || true

# ---------- rotacao: 2 geracoes semanais ----------
ssh $SSH_OPTS "$DEST_HOST" "
  cd $DEST_DIR 2>/dev/null && ls -1d semana-* 2>/dev/null | sort | head -n -2 | xargs -r rm -rf
  true" || true

rm -f "$TMP"/*.tar.gz
echo "OK: uploads $MODO de $HOJE concluido ($TOTAL, $FEITOS arquivos)"
exit 0
