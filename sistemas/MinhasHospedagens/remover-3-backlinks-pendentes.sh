#!/usr/bin/env bash
# Remove os 3 backlinks temporarios (aesupar / band / criexp) dos 11 sites
# que ficaram pendentes porque anderson-gna + qmix estavam com origem fora (522)
# em 2026-07-23. euvo (vps1) ja foi removido nesse dia.
# Uso: bash remover-3-backlinks-pendentes.sh
set +e

echo "### ANDERSON-GNA (9 sites) ###"
ssh hostinger-anderson-gna '
for D in incast.com.br advivo.com.br ebookcult.com.br adonline.com.br diariopernambucano.com.br jornaldobairroalto.com.br opopularjornal.com.br saberdefato.com.br universoneo.com.br; do
  P=/home/u400588174/domains/$D/public_html
  [ -d "$P" ] || { echo "  $D: sem pasta"; continue; }
  cd "$P"
  rm -f wp-content/mu-plugins/zzz-footer-aesupar.php wp-content/mu-plugins/zzz-footer-band.php wp-content/mu-plugins/zzz-footer-criexp.php
  wp eval "do_action(\"litespeed_purge_all\");" >/dev/null 2>&1
  rm -rf wp-content/litespeed/* 2>/dev/null
  wp cache flush >/dev/null 2>&1
  echo "  $D: limpo"
done' 2>&1 | grep -v post-quantum

echo "### QMIX (2 sites) ###"
ssh hostinger-qmix '
for D in barranews.com.br oiempreendedores.com.br; do
  P=/home/u463007860/domains/$D/public_html
  [ -d "$P" ] || { echo "  $D: sem pasta"; continue; }
  cd "$P"
  rm -f wp-content/mu-plugins/zzz-footer-aesupar.php wp-content/mu-plugins/zzz-footer-band.php wp-content/mu-plugins/zzz-footer-criexp.php
  wp eval "do_action(\"litespeed_purge_all\");" >/dev/null 2>&1
  rm -rf wp-content/litespeed/* 2>/dev/null
  wp cache flush >/dev/null 2>&1
  echo "  $D: limpo"
done' 2>&1 | grep -v post-quantum

echo "### euvo (vps1) ja foi removido em 23/07 ###"
echo "PRONTO."
