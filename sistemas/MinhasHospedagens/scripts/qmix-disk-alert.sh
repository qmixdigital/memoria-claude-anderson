#!/bin/bash
# Alerta de disco no Telegram (@qmixdigital_bot).
#
# POR QUE ISTO EXISTE
# Em 26/08/2026 a clinicas-vps chegou a 100% de disco. O PM2 morreu com ENOSPC
# e os 7 sites cairam com 502. O aviso da Hostinger chegou depois da queda e
# falava so em "pode ficar lento". Este agente avisa antes, com folga para agir.
#
# COMO FUNCIONA
# Roda em CADA VPS, de meia em meia hora. Nao depende de um servidor central:
# se o opengravity cair, as outras continuam avisando. Tres faixas:
#
#   ATENCAO  >= 80%   da tempo de planejar
#   ALERTA   >= 90%   agir hoje
#   CRITICO  >= 95%   agir agora, e ja lista o que ocupa
#
# ANTI-RUIDO: so manda quando a faixa MUDA, ou quando repete a mesma faixa
# depois de REPETIR_H horas. Alerta que chega todo dia igual vira ruido e em
# duas semanas ninguem le. Quando o disco volta ao normal, manda um aviso de
# normalizacao e zera o estado.
set -uo pipefail

ENV_FILE=/etc/qmix-disk-alert.env
ESTADO=/var/lib/qmix-disk-alert.state
REPETIR_H=12

[ -r "$ENV_FILE" ] || { echo "sem $ENV_FILE"; exit 1; }
# shellcheck disable=SC1090
. "$ENV_FILE"
: "${TELEGRAM_BOT_TOKEN:?}" "${TELEGRAM_CHAT_ID:?}"
NOME=${QMIX_VPS_NOME:-$(hostname -s)}

USO=$(df --output=pcent / | tail -1 | tr -dc '0-9')
LIVRE=$(df -h --output=avail / | tail -1 | tr -d ' ')
TAM=$(df -h --output=size / | tail -1 | tr -d ' ')

if   [ "$USO" -ge 95 ]; then FAIXA=CRITICO; ICONE="🔴"
elif [ "$USO" -ge 90 ]; then FAIXA=ALERTA;  ICONE="🟠"
elif [ "$USO" -ge 80 ]; then FAIXA=ATENCAO; ICONE="🟡"
else                         FAIXA=OK;      ICONE="🟢"
fi

ANTES_FAIXA=OK; ANTES_TS=0
if [ -r "$ESTADO" ]; then
  ANTES_FAIXA=$(cut -d' ' -f1 "$ESTADO" 2>/dev/null || echo OK)
  ANTES_TS=$(cut -d' ' -f2 "$ESTADO" 2>/dev/null || echo 0)
fi
AGORA=$(date +%s)

manda() {
  curl -s -o /dev/null --max-time 25 \
    -d "chat_id=${TELEGRAM_CHAT_ID}" \
    --data-urlencode "text=$1" \
    "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"
}

# Volta ao normal: avisa uma vez e limpa o estado.
if [ "$FAIXA" = OK ]; then
  if [ "$ANTES_FAIXA" != OK ]; then
    manda "🟢 ${NOME}: disco normalizado, ${USO}% em uso (${LIVRE} livres de ${TAM})."
    rm -f "$ESTADO"
  fi
  exit 0
fi

# Mesma faixa e ainda dentro da janela de silencio: nao repete.
DECORRIDO=$(( (AGORA - ANTES_TS) / 3600 ))
if [ "$FAIXA" = "$ANTES_FAIXA" ] && [ "$DECORRIDO" -lt "$REPETIR_H" ]; then
  exit 0
fi

MSG="${ICONE} ${FAIXA} de disco em ${NOME}
Uso: ${USO}%  |  livres: ${LIVRE} de ${TAM}"

# No critico, ja manda o diagnostico junto para nao precisar entrar no servidor.
if [ "$FAIXA" = CRITICO ] || [ "$FAIXA" = ALERTA ]; then
  TOP=$(du -xsh /home/* /var/* /root /opt 2>/dev/null | sort -rh | head -5 \
        | awk '{printf "  %s  %s\n", $1, $2}')
  [ -n "$TOP" ] && MSG="${MSG}

Maiores diretorios:
${TOP}"
  if [ -x /root/prune-isr-cache.sh ]; then
    MSG="${MSG}

Nesta VPS existe /root/prune-isr-cache.sh (poda cache ISR)."
  fi
fi

manda "$MSG"
echo "$FAIXA $AGORA" > "$ESTADO"
