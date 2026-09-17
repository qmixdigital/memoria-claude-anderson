#!/bin/bash
cd /home/sites/18a/7/7672b9147f//public_html || exit 1
for stem in exquisito pontonaturalbrasil revistadeducao sabedoriaglobal viajenodetalhe wtw19; do
  for d in ${stem}*/; do
    d="${d%/}"
    [ -f "$d/wp-config.php" ] || continue
    L=$(wp --path="$d" --allow-root oie audit-links --domain=enjai.com.br 2>/dev/null | head -1 | grep -oP 'Links: \K[0-9]+')
    echo "$d|hostverge|${L:-0}"
  done
done
