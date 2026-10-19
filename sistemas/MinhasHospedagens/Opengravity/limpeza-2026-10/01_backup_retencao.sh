#!/bin/bash
# Roda NA opengravity (root). Reduz o backup LOCAL do portal-engine para 2 copias.
# O cofre (srv1166087) continua com 7 diarias: a poda remota usa DIARIAS, que nao muda.
# Ganho esperado: ~17 GB em /srv/backup-engine.
set -euo pipefail
F=/opt/portal-engine/backup_engine.sh
cp -a "$F" "$F.bak-20261018"

python3 - "$F" <<'PY'
import sys, re
p = sys.argv[1]
s = open(p).read()
if "LOCAIS=" in s:
    print("ja aplicado"); sys.exit(0)
s = s.replace("DIARIAS=7\n",
  "DIARIAS=7\n# 18/10/2026: aqui ficam so 2 (o cofre guarda 7); o disco da opengravity e o gargalo\nLOCAIS=2\n", 1)
old_start = s.index("podar() {")
old_end = s.index("podar /srv/backup-engine")
novo = '''podar() {
  local alvo="$1"
  ls -1t "$alvo"/portal-engine-"$NOME"-*.tar.gz 2>/dev/null | tail -n +$((LOCAIS + 1)) | xargs -r rm -f
}
'''
s = s[:old_start] + novo + s[old_end:]
open(p, "w").write(s)
print("ok")
PY

bash -n "$F" && echo "sintaxe OK"
# aplica a poda ja, sem esperar a madrugada (so os arquivos desta maquina)
ls -1t /srv/backup-engine/portal-engine-srv1000825-*.tar.gz | tail -n +3 | xargs -r rm -f
ls -la /srv/backup-engine
df -h /
