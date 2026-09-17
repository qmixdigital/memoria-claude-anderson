# -*- coding: utf-8 -*-
"""Cria a AT a partir da AS, trocando so o que e identificador.

⚠️ `as` -> `at` no arquivo inteiro estragaria palavra em portugues dentro de
comentario e texto de interface. A troca e por forma: nome de funcao, nome de
classe dentro de `s()` e `c()`, as constantes de SVG e o id do menu.

🔴 **O par de caminhos O/N sobrevive a copia deste script.** Copiado do
`cria_as.py` sem trocar os dois, ele leu a AR e **gravou por cima da AS**,
destruindo a arquitetura pronta. O que salvou foi a copia ja instalada no
`archs.js` do servidor, de onde a AS foi extraida de volta. Conferir os dois
caminhos antes de rodar, sempre.
"""
import io
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
O = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AS.js'
N = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AT.js'
s = io.open(O, encoding='utf-8').read()

s = re.sub(r'\bfunction as([A-Z])', lambda m: 'function at' + m.group(1), s)
s = re.sub(r'\bas([A-Z][A-Za-z]*)\(', lambda m: 'at' + m.group(1) + '(', s)
s = re.sub(r"([sc])\('as([a-z]+)'\)", lambda m: "%s('at%s')" % (m.group(1), m.group(2)), s)
s = s.replace('AS_SIMB', 'AT_SIMB').replace('AS_LUPA', 'AT_LUPA').replace('AS_ARCO', 'AT_SETA')
s = s.replace("'asnav-'", "'atnav-'").replace('data-asham', 'data-atham')

sobrou = re.findall(r"[sc]\('as[a-z]+'\)|function as[A-Z]", s)
if sobrou:
    print('  ⚠️ sobrou identificador da AS: %s' % sobrou[:6])
io.open(N, 'w', encoding='utf-8', newline='\n').write(s)
print('  AT.js criado a partir da AS (%d linhas)' % s.count(chr(10)))
