#!/bin/bash
# Traz os bancos dos 17 WordPress aposentados do hostverge.
#
# POR QUE: os dominios ja sao servidos pelo portal-engine, mas as URLs antigas
# devolvem 404/410 - ou seja, ~9 mil artigos existem SO nesses bancos. Antes de
# cogitar apagar os 14,7 GB de arquivos da conta (que esta superlotada), o texto
# precisa estar guardado em outro lugar.
#
# O dump e transmitido por streaming e nao encosta no disco do hostverge, que ja
# esta apertado.
set -uo pipefail
DEST="C:/Users/User/AppData/Local/Temp/claude/d--SISTEMAS-MinhasHospedagens/e75ba1b3-e01c-45ff-978b-5a2475149792/scratchpad/hvdb"
H="/home/sites/18a/7/7672b9147f/public_html"
SITES="sabedoriaglobal planomedicosaude.com.br pontonaturalbrasil revistadeducao saudeacessivel.com.br exquisito saudeemalta institutoortopedico.com.br qmixdigital saudevitalidade cirurgiadacatarata.com.br df8.com.br medicinageriatrica revistatopsaude.com.br viajenodetalhe saudicas.com.br cirurgiadecancer.com.br"
ok=0; ruim=0
for s in $SITES; do
  arq="$DEST/wp_${s}_$(date +%Y-%m-%d).sql.gz"
  if ssh -o ConnectTimeout=30 hostverge "wp db export - --path=$H/$s --skip-plugins --skip-themes --single-transaction --quick 2>/dev/null | gzip -6" > "$arq" 2>/dev/null; then
    # tamanho nao valida: a prova e a marca que o mysqldump escreve no fim
    if zcat "$arq" 2>/dev/null | tail -20 | grep -q "Dump completed"; then
      printf "  ok     %-30s %s\n" "$s" "$(du -h "$arq" | cut -f1)"; ok=$((ok+1))
    else
      printf "  FALHA  %-30s dump truncado ou vazio\n" "$s"; rm -f "$arq"; ruim=$((ruim+1))
    fi
  else
    printf "  FALHA  %-30s erro no ssh/dump\n" "$s"; rm -f "$arq"; ruim=$((ruim+1))
  fi
done
echo
echo "  concluidos: $ok   falhas: $ruim"
du -sh "$DEST" | sed 's/^/  total: /'
