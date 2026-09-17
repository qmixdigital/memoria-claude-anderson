# -*- coding: utf-8 -*-
# Roda NA VPS: o bloco de fontes do <head> passa a vir de V.fontes (local se houver
# fontes.json do portal, Google se nao). Idempotente.
import io, re, sys, shutil, time
P = '/opt/portal-engine/src/render.js'
s = io.open(P, encoding='utf-8').read()
if 'V.fontes(' in s:
    print('ja aplicado'); sys.exit(0)
rx = re.compile(r"  const fonts = \[\n    `<link rel=\"preconnect\" href=\"https://fonts\.googleapis\.com\">`,\n(?:.*\n){4}  \]\.join\('\\n'\);\n")
m = rx.search(s)
if not m: print('FALHOU: bloco de fontes nao achado'); sys.exit(1)
raiz = "(cfg && cfg.sitesRoot) || _RAIZ" if 'let _RAIZ' in s or '_RAIZ =' in s else "'/srv/portais'"
novo = "  const fonts = V.fontes(site, t.googleUrl, esc, (typeof _RAIZ !== 'undefined' && _RAIZ) || '/srv/portais');\n"
s = s[:m.start()] + novo + s[m.end():]
shutil.copy(P, P + '.bak-fontes-' + time.strftime('%Y%m%d%H%M'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('ok: fontes')
