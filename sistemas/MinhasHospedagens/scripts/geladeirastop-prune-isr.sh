#!/bin/bash
# Poda o cache ISR do geladeirastop.com.
#
# POR QUE A VERSAO ANTERIOR NUNCA FUNCIONOU
# Ela media /var/www/geladeirastop.com/.next/cache, que tem 56MB e nunca chega
# perto do teto de 6GB. O cache que cresce e outro: as fichas de empresa ficam
# em .next/server/app/empresas, que em 01/09/2026 estava com 15,6GB. O cron
# rodava todo domingo, via 56MB, achava que estava tudo bem e nao fazia nada.
# Descoberto com o disco do opengravity em 88%.
#
# RITMO DE CRESCIMENTO: 13,4GB acumulados em 8 dias (build de 24/08), ~1,7GB por
# dia. Por isso a poda passou de semanal para diaria: em uma semana o diretorio
# cresce mais que o proprio teto.
#
# COMO FUNCIONA (mesma logica ja validada em /root/prune-isr-cache.sh na
# clinicas-vps): poda por TAMANHO, nao por idade. Podar por idade nao funciona
# nestes apps porque o ISR reescreve o arquivo a cada revalidacao e o Googlebot
# recicla as paginas, entao quase nenhum arquivo envelhece o suficiente.
#
# Cada ficha sao tres arquivos irmaos (.html .rsc .meta) e os tres saem juntos,
# senao o Next serve estado inconsistente. Com a ficha removida, a proxima
# visita regenera: nao se perde URL nem indexacao.
#
# NUNCA toca em .js/.json (build) nem em diretorio com [colchetes], que e o
# codigo da rota dinamica. Conferido em 01/09: dos 16GB, apenas 4MB eram build,
# e nenhum .js era mais novo que o BUILD_ID.
set -u

LOG=/var/log/geladeirastop-prune-isr.log
PRESSAO_PCT=80        # acima disto, tetos caem pela metade
BASE=/var/www/geladeirastop.com/.next/server/app

# caminho_relativo:teto_MB:alvo_MB
ROTAS=(
  "empresas:6000:4000"
)

reg() { echo "[$(date '+%F %T')] $*" >> "$LOG"; }

USO=$(df --output=pcent / | tail -1 | tr -dc '0-9')
reg "inicio | disco em ${USO}%"

FATOR=1
if [ "$USO" -ge "$PRESSAO_PCT" ]; then
  FATOR=2
  reg "disco acima de ${PRESSAO_PCT}%, tetos reduzidos a metade nesta rodada"
fi

for ITEM in "${ROTAS[@]}"; do
  REL=${ITEM%%:*}; RESTO=${ITEM#*:}
  TETO=$(( ${RESTO%%:*} / FATOR ))
  ALVO=$(( ${RESTO##*:} / FATOR ))
  D="$BASE/$REL"
  if [ ! -d "$D" ]; then
    reg "  AUSENTE $D (caminho mudou? regra sem efeito)"
    continue
  fi

  ATUAL=$(du -xsm "$D" 2>/dev/null | cut -f1)
  [ -z "$ATUAL" ] && continue
  if [ "$ATUAL" -le "$TETO" ]; then
    reg "  ok    ${ATUAL}MB (teto ${TETO}MB)  $REL"
    continue
  fi

  PRECISA_KB=$(( (ATUAL - ALVO) * 1024 ))
  reg "  podar ${ATUAL}MB -> alvo ${ALVO}MB (liberar ~$((PRECISA_KB/1024))MB)  $REL"

  LISTA=$(mktemp)
  find "$D" -type f -name '*.html' -printf '%T@\t%s\t%p\n' 2>/dev/null \
    | grep -v '\[' | sort -n > "$LISTA"

  # Quanto cada ficha realmente pesa, MEDIDO em vez de chutado: o diretorio
  # inteiro dividido pela soma dos .html. Neste app cada ficha e .html + .meta +
  # .rsc MAIS uma pasta base.segments/ com ~9 arquivos .segment.rsc - e dai que
  # vem a diferenca (435 mil .rsc para 48 mil .html). Medir evita que a conta
  # quebre se o Next mudar o formato.
  HTML_KB=$(awk '{ s += $2 } END { printf "%d", s/1024 }' "$LISTA")
  FATOR_PESO=$(awk -v tot="$((ATUAL*1024))" -v h="$HTML_KB"     'BEGIN { f = (h > 0 ? tot/h : 1); if (f < 1) f = 1; printf "%.2f", f }')
  reg "        cada ficha pesa ~${FATOR_PESO}x o .html (medido)"

  ALVOS=$(mktemp)
  awk -v precisa="$PRECISA_KB" -v peso="$FATOR_PESO" '
    { acumulado += ($2 * peso) / 1024; print $3; if (acumulado >= precisa) exit }
  ' "$LISTA" > "$ALVOS"

  N=$(wc -l < "$ALVOS")
  # Remocao EM LOTE. A versao anterior fazia um rm por arquivo dentro de um
  # laco: com 48 mil fichas isso levava quase uma hora e o cron diario nunca
  # terminaria em tempo. Aqui o awk monta a lista separada por NUL e o xargs
  # resolve em poucas chamadas.
  # O -rf existe por causa de base.segments, que e DIRETORIO. A versao anterior
  # usava rm -f e deixava essa pasta para tras, que era justamente o grosso do
  # espaco.
  awk '{ b = $0; sub(/\.html$/, "", b);
         printf "%s.html%c%s.meta%c%s.rsc%c%s.segments%c", b, 0, b, 0, b, 0, b, 0 }' "$ALVOS"     | xargs -0 -r rm -rf

  DEPOIS=$(du -xsm "$D" 2>/dev/null | cut -f1)
  reg "        removidas $N fichas | ${ATUAL}MB -> ${DEPOIS}MB"
  rm -f "$LISTA" "$ALVOS"
done

FIM_PCT=$(df --output=pcent / | tail -1 | tr -dc '0-9')
reg "fim    | disco em ${FIM_PCT}%"
[ "$FIM_PCT" -ge 85 ] && reg "ALERTA: disco ainda em ${FIM_PCT}% depois da poda, precisa de analise manual"
exit 0
