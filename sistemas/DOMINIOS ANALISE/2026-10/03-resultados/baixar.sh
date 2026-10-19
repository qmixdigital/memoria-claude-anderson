#!/bin/bash
cd "$(dirname "$0")"
U=https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-jul-aug-sep/domain/cc-main-2026-jul-aug-sep-domain-ranks.txt.gz
T=2515862336; C=104857600; n=0
for ((s=0; s<T; s+=C)); do
  e=$((s+C-1)); [ $e -ge $T ] && e=$((T-1)); want=$((e-s+1)); f=$(printf "partes/p%04d" $n)
  for t in 1 2 3 4 5 6; do
    [ "$(stat -c %s $f 2>/dev/null || echo 0)" -eq $want ] && break
    curl -s -L -m 300 -H "Range: bytes=$s-$e" -o $f "$U"
  done
  [ "$(stat -c %s $f)" -eq $want ] || { echo "falha parte $n"; exit 1; }
  n=$((n+1))
done
cat partes/p* > cc-ranks.txt.gz && gzip -t cc-ranks.txt.gz && gunzip -c cc-ranks.txt.gz | awk -F'\t' 'NR==1||$5 ~ /^br\./' > cc-ranks-br.tsv && echo OK > cc-ok.flag
