# -*- coding: utf-8 -*-
"""O rotulo do botao saia como "Abrir o menu de menu".

A variante de rotulo entra numa frase que ja diz "menu": com a variante "Menu"
sai a repeticao. O rotulo passa a ser montado por variante, e nao encaixado numa
frase unica.
"""
import io
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
t = io.open(P, encoding='utf-8').read()

if '_MH_ABRIR' in t:
    print('  ja corrigido')
    raise SystemExit()

velho = "const _MH_ROTULOS = ['Editorias', 'Seções', 'Menu', 'Navegação'];"
novo = ("const _MH_ROTULOS = ['Editorias', 'Seções', 'Menu', 'Navegação'];\n"
        "// ⚠️ o rotulo entra numa frase que ja diz \"menu\": com a variante \"Menu\"\n"
        "// saia \"Abrir o menu de menu\". Cada variante traz a frase inteira\n"
        "const _MH_ABRIR = ['Abrir o menu de editorias', 'Abrir o menu de seções',\n"
        "                   'Abrir o menu', 'Abrir a navegação'];\n"
        "const _MH_FECHAR = ['Fechar o menu de editorias', 'Fechar o menu de seções',\n"
        "                    'Fechar o menu', 'Fechar a navegação'];")
if velho not in t:
    print('  🔴 nao achei a lista de rotulos')
    raise SystemExit(1)
t = t.replace(velho, novo, 1)

t = t.replace("           rot: _MH_ROTULOS[h % _MH_ROTULOS.length],",
              "           rot: _MH_ROTULOS[h % _MH_ROTULOS.length],\n"
              "           abrir: _MH_ABRIR[h % _MH_ABRIR.length],\n"
              "           fechar: _MH_FECHAR[h % _MH_FECHAR.length],", 1)
t = t.replace("+ ' aria-label=\"Abrir o menu de ' + esc(d.rot.toLowerCase()) + '\"><i></i></button>';",
              "+ ' aria-label=\"' + esc(d.abrir) + '\"><i></i></button>';", 1)
t = t.replace("+ 'b.setAttribute(\"aria-label\",(a?\"Abrir\":\"Fechar\")+\" o menu de '\n"
              "    + esc(d.rot.toLowerCase()) + '\");});})();<\/script>';",
              "+ 'b.setAttribute(\"aria-label\",a?' + JSON.stringify(d.abrir) + ':'\n"
              "    + JSON.stringify(d.fechar) + ');});})();<\/script>';", 1)
if 'aria-label=\"Abrir o menu de ' in t:
    print('  🔴 o rotulo do botao nao foi trocado')
    raise SystemExit(1)
print('  rotulo do botao e do script passam a vir por variante inteira')
if APLICA:
    shutil.copyfile(P, P + '.bak-rotulo-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
    print('  gravado')
