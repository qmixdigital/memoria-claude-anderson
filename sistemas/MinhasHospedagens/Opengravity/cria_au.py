# -*- coding: utf-8 -*-
"""Cria a AU a partir da AT, trocando so o que e identificador.

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
O = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AT.js'
N = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AU.js'
s = io.open(O, encoding='utf-8').read()

s = re.sub(r'\bfunction at([A-Z])', lambda m: 'function au' + m.group(1), s)
s = re.sub(r'\bat([A-Z][A-Za-z]*)\(', lambda m: 'au' + m.group(1) + '(', s)
s = re.sub(r"([sc])\('at([a-z]+)'\)", lambda m: "%s('au%s')" % (m.group(1), m.group(2)), s)
s = s.replace('AT_SIMB', 'AU_SIMB').replace('AT_LUPA', 'AU_LUPA').replace('AT_SETA', 'AU_ANEL')
s = s.replace("'atnav-'", "'aunav-'").replace('data-atham', 'data-auham')

sobrou = re.findall(r"[sc]\('at[a-z]+'\)|function at[A-Z]", s)
if sobrou:
    print('  ⚠️ sobrou identificador da AT: %s' % sobrou[:6])
io.open(N, 'w', encoding='utf-8', newline='\n').write(s)
print('  AU.js criado a partir da AT (%d linhas)' % s.count(chr(10)))
