# -*- coding: utf-8 -*-
"""O botao caia numa linha abaixo da marca, desalinhado dela.

🔴 Varias arquiteturas empilham o cabecalho no celular
(`flex-direction:column;align-items:flex-start`). O botao injetado entrava nessa
pilha e ia parar numa linha propria, embaixo e a direita: a marca no alto, o
menu embaixo, sem alinhamento nenhum entre os dois. Foi o que o Anderson viu no
barranews.

O conserto devolve a **linha** ao contentor do botao, abaixo de 1100px, com
`:has(> #id)`. Duas razoes para essa forma:

  - ela nao depende de saber o nome da classe do contentor, que muda nas 135
    arquiteturas
  - seletor com id tem especificidade (1,0,0) e **ganha** da regra de coluna da
    arquitetura, que e de classe

⚠️ A `<nav>` continua com `flex-basis:100%`, entao ao abrir ela desce para a
linha de baixo inteira, e nao espreme a marca.
"""
import io
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
t = io.open(P, encoding='utf-8').read()

if 'has(> #' in t:
    print('  ja corrigido')
    raise SystemExit()

velho = ("    + '@media(max-width:1100px){'\n"
         "    + '.' + d.id + '-b{display:block}'")
novo = ("    + '@media(max-width:1100px){'\n"
        "    // 🔴 arquitetura que empilha o cabecalho no celular jogava o botao para\n"
        "    // uma linha propria, embaixo da marca. O contentor do botao volta a ser\n"
        "    // linha, e o id ganha da regra de coluna, que e de classe\n"
        "    + ':has(> #' + d.id + '){display:flex;flex-direction:row;align-items:center;'\n"
        "    + 'flex-wrap:wrap;gap:12px}'\n"
        "    + '.' + d.id + '-b{display:block}'")
if velho not in t:
    print('  🔴 nao achei o inicio da media query')
    raise SystemExit(1)
t = t.replace(velho, novo, 1)
print('  regra de linha acrescentada na media query de 1100px')
if APLICA:
    shutil.copyfile(P, P + '.bak-menulinha-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
    print('  gravado')
