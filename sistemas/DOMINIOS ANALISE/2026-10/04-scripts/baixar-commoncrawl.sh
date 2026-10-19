#!/bin/bash
# Baixa o ranking de dominios do Common Crawl em partes de 100 MB (o curl -C - corrompe o arquivo) e extrai so os .br.
# Uso: ./baixar-commoncrawl.sh <release> <pasta-de-trabalho>
#   release: veja https://commoncrawl.org/web-graphs (ex.: cc-main-2026-jul-aug-sep). Pegue o mais recente.
# Saida: <pasta>/cc-ranks-br.tsv  (a pasta partes/ e o .gz podem ser apagados depois: 2,5 GB cada)
REL=$1; DIR=$2
if [ -z "$REL" ] || [ -z "$DIR" ]; then echo "uso: $0 release pasta"; exit 1; fi
U=https://data.commoncrawl.org/projects/hyperlinkgraph/$REL/domain/$REL-domain-ranks.txt.gz
mkdir -p "$DIR/partes"; cd "$DIR" || exit 1
T=$(curl -sIL "$U" | grep -i '^content-length' | tail -1 | tr -dc 0-9)
C=104857600; n=0
for ((s=0; s<T; s+=C)); do
  e=$((s+C-1)); [ $e -ge $T ] && e=$((T-1)); want=$((e-s+1)); f=$(printf "partes/p%04d" $n)
  for t in 1 2 3 4 5 6; do
    [ "$(stat -c %s $f 2>/dev/null || echo 0)" -eq $want ] && break
    curl -s -L -m 300 -H "Range: bytes=$s-$e" -o $f "$U"
  done
  [ "$(stat -c %s $f)" -eq $want ] || { echo "falha na parte $n"; exit 1; }
  n=$((n+1))
done
cat partes/p* > cc-ranks.txt.gz && gzip -t cc-ranks.txt.gz && gunzip -c cc-ranks.txt.gz | awk -F'\t' 'NR==1||$5 ~ /^br\./' > cc-ranks-br.tsv && echo "OK: $(wc -l < cc-ranks-br.tsv) linhas .br"
