# -*- coding: utf-8 -*-
"""Cria a AV a partir da AU, trocando so o que e identificador.

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
O = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AU.js'
N = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AV.js'
s = io.open(O, encoding='utf-8').read()

s = re.sub(r'\bfunction au([A-Z])', lambda m: 'function av' + m.group(1), s)
s = re.sub(r'\bau([A-Z][A-Za-z]*)\(', lambda m: 'av' + m.group(1) + '(', s)
s = re.sub(r"([sc])\('au([a-z]+)'\)", lambda m: "%s('av%s')" % (m.group(1), m.group(2)), s)
s = s.replace('AU_SIMB', 'AV_SIMB').replace('AU_LUPA', 'AV_LUPA').replace('AU_ANEL', 'AV_SELO')
s = s.replace("'aunav-'", "'avnav-'").replace('data-auham', 'data-avham')

sobrou = re.findall(r"[sc]\('au[a-z]+'\)|function au[A-Z]", s)
if sobrou:
    print('  ⚠️ sobrou identificador da AU: %s' % sobrou[:6])
io.open(N, 'w', encoding='utf-8', newline='\n').write(s)
print('  AV.js criado a partir da AU (%d linhas)' % s.count(chr(10)))
