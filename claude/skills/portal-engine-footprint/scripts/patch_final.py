# -*- coding: utf-8 -*-
# Roda NA VPS: _renomClasses passa a terminar com V.passadaFinal (direitos do rodape
# e nomes das variaveis CSS por portal). Idempotente.
import io, re, sys, shutil, time
P = '/opt/portal-engine/src/render.js'
s = io.open(P, encoding='utf-8').read()
if 'V.passadaFinal(' in s:
    print('ja aplicado'); sys.exit(0)
m = re.search(r"(function _renomClasses\(site, html\) \{[\s\S]*?)(\n  return (?:out|_lcpEager\(out\));\n\})", s)
if not m: print('FALHOU: fim do _renomClasses nao achado'); sys.exit(1)
s = s[:m.start(2)] + "\n  out = V.passadaFinal(site, out);" + s[m.start(2):]
shutil.copy(P, P + '.bak-final-' + time.strftime('%Y%m%d%H%M'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('ok: passadaFinal')
