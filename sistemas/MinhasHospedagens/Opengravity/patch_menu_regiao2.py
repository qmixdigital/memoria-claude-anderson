# -*- coding: utf-8 -*-
"""Amplia a regiao de busca do injetor de menu, por LINHA.

⚠️ Casar um bloco inteiro por string exige acertar cada byte, inclusive as
contrabarras do regex, e o heredoc entre a minha maquina e o servidor ja comeu
contrabarra antes. Trocar por linha, ancorando em texto sem escape, e imune a
isso.
"""
import io
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
L = io.open(P, encoding='utf-8').read().split('\n')
if any('const fimBusca' in l for l in L):
    print('  ja corrigido')
    raise SystemExit()

i = next((k for k, l in enumerate(L) if 'function _menuSanfona' in l), -1)
if i < 0:
    print('  🔴 nao achei a funcao')
    raise SystemExit(1)

novo_topo = [
 "  // 🔴 a barra de editorias nem sempre esta dentro do <header>: em varias",
 "  // arquiteturas ela e uma faixa logo abaixo. A busca vai ate o <main>",
 "  const iMain = html.indexOf('<main');",
 "  const iCab = html.indexOf('</header>');",
 "  const fimBusca = iMain > 0 ? iMain : iCab;",
 "  if (fimBusca < 0) return html;",
 "  const cab = html.slice(0, fimBusca);",
 "  // arquitetura que ja resolveu o menu fica como esta, nos tres padroes:",
 "  // botao com aria-expanded, truque de checkbox sem JS, ou injecao anterior",
 "  if (/aria-expanded/.test(cab)) return html;",
 "  if (/<input[^>]+type=\"checkbox\"/i.test(cab) && /<label/i.test(cab)) return html;",
 "  if (/data-mh=/.test(cab)) return html;",
]
# as cinco linhas antigas do topo saem
alvo = []
for k in range(i + 1, i + 9):
    alvo.append(L[k])
    if 'if (/aria-expanded/.test(cab)) return html;' in L[k]:
        break
if 'aria-expanded' not in alvo[-1]:
    print('  🔴 nao achei o fim do topo antigo')
    raise SystemExit(1)
L[i + 1:i + 1 + len(alvo)] = novo_topo
print('  topo trocado: %d linhas viraram %d' % (len(alvo), len(novo_topo)))

# a montagem final passa a usar fimBusca
n = 0
for k, l in enumerate(L):
    if 'fimCab)' in l and 'est + js + html.slice' in l:
        L[k] = l.replace('fimCab)', 'fimBusca)')
        n += 1
    elif 'html.slice(m.index + tagNav.length, fimCab)' in l:
        L[k] = l.replace('fimCab)', 'fimBusca)')
        n += 1
print('  montagem final ajustada em %d linha(s)' % n)
t = '\n'.join(L)
if 'fimCab' in t.split('function _menuSanfona')[1].split('\n}')[0]:
    print('  ⚠️ ainda sobrou fimCab dentro da funcao')
if APLICA:
    shutil.copyfile(P, P + '.bak-menureg-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
    print('  gravado')
