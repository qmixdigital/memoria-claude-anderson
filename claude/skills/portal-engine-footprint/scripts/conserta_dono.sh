#!/bin/bash
# Devolve ao usuario `portais` o que alguem criou como root dentro do portal.
# Chamado pelo motor antes de cada deploy (sudo sem senha, so este script) e
# aceita um slug ou nenhum (todos). Nao sai de /srv/portais.
set -u
RAIZ=/srv/portais
if [ $# -ge 1 ]; then
  case "$1" in *[!a-z0-9-]*|"") exit 0;; esac
  ALVOS="$RAIZ/$1"
else
  ALVOS=$(ls -d $RAIZ/*/ 2>/dev/null)
fi
for d in $ALVOS; do
  [ -d "$d" ] || continue
  for sub in public functions .wrangler data paginas fontes.json; do
    [ -e "$d/$sub" ] && find "$d/$sub" \( -not -user portais -o -not -group portais \) -exec chown portais:portais {} + 2>/dev/null
  done
done
exit 0
