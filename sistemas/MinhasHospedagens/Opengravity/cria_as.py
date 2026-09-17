# -*- coding: utf-8 -*-
"""Cria a AS a partir da AR, trocando so o que e identificador.

⚠️ `ar` -> `as` no arquivo inteiro estragaria palavra em portugues dentro de
comentario e texto de interface. A troca e por forma: nome de funcao, nome de
classe dentro de `s()` e `c()`, as constantes de SVG e o id do menu.

⚠️ O id do menu da AR ainda dizia `aknav`, herdado da AK. Duas arquiteturas com
o mesmo id nao colidem porque cada portal serve uma so, mas o rastro confunde.
"""
import io
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
O = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AR.js'
N = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AS.js'
s = io.open(O, encoding='utf-8').read()

s = re.sub(r'\bfunction ar([A-Z])', lambda m: 'function as' + m.group(1), s)
s = re.sub(r'\bar([A-Z][A-Za-z]*)\(', lambda m: 'as' + m.group(1) + '(', s)
s = re.sub(r"([sc])\('ar([a-z]+)'\)", lambda m: "%s('as%s')" % (m.group(1), m.group(2)), s)
s = s.replace('AR_SIMB', 'AS_SIMB').replace('AR_LUPA', 'AS_LUPA')
s = s.replace("'aknav-'", "'asnav-'").replace('data-akham', 'data-asham')

sobrou = re.findall(r"[sc]\('ar[a-z]+'\)|function ar[A-Z]", s)
if sobrou:
    print('  ⚠️ sobrou identificador da AR: %s' % sobrou[:6])
io.open(N, 'w', encoding='utf-8', newline='\n').write(s)
print('  AS.js criado a partir da AR (%d linhas)' % s.count(chr(10)))
