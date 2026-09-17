# -*- coding: utf-8 -*-
"""A comparacao da legenda passa a tolerar o sufixo do slug.

O `legenda_slug.py` ja fez a legenda sumir quando o `alt` reproduz o slug. Faltou
um caso, e e justo o que motivou a correcao: no **segundo de um par de titulo
repetido** o slug termina em `-2`, e o `alt` (o titulo velho) nao tem esse
sufixo. A comparacao exata falha e a legenda continua repetindo a manchete.

Aqui a comparacao passa a aceitar **um ser prefixo do outro**, com pelo menos 25
caracteres de sobreposicao.
"""
import io
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/archs.js'
s = io.open(P, encoding='utf-8').read()

VELHO = "  const igual = _chato(alt) === _chato(t) || _chato(alt) === _chato(art.slug);"
NOVO = (
    "  const _slug = _chato(art.slug), _alt = _chato(alt);\n"
    "  // ⚠️ o slug do segundo de um par repetido termina em \"-2\": a comparacao\n"
    "  // tem que tolerar a sobra, senao a legenda volta justo onde o titulo foi trocado\n"
    "  const _pref = _alt.length >= 25 && (_slug.indexOf(_alt) === 0 || _alt.indexOf(_slug) === 0);\n"
    "  const igual = _chato(alt) === _chato(t) || _alt === _slug || _pref;"
)

n = s.count(VELHO)
print('  funcoes *Legenda a ajustar: %d' % n)
if n == 0:
    print('  nada a fazer')
    raise SystemExit(1)

s2 = s.replace(VELHO, NOVO)
a = len(re.findall(r'function \w+Legenda\(', s))
b = len(re.findall(r'function \w+Legenda\(', s2))
if a != b:
    print('  contagem mudou de %d para %d. NAO gravei.' % (a, b))
    raise SystemExit(1)

if not APLICA:
    print('  ensaio. rode com --aplica.')
    raise SystemExit()

shutil.copyfile(P, P + '.bak-legsuf-' + time.strftime('%Y%m%d-%H%M%S'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(s2)
print('  gravado nas %d funcoes. reiniciar o motor e reconstruir.' % n)
