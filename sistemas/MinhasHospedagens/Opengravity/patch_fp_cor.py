# -*- coding: utf-8 -*-
"""A cor do botao perdia para a regra de link da arquitetura.

Uso, no servidor:  python3 /tmp/patch_fp_cor.py [--aplica]

🔴 A arquitetura tem regras como `.xxbody a{color:var(--p)}` e
`.xxfoot a{color:var(--footer-tx)}`, com especificidade **(0,1,1)**. A minha era
`.classe{color:#fff}`, **(0,1,0)**, e perdia. O botao herdava a cor de link do
corpo ou do rodape: no advivo o texto saiu `rgb(18,58,92)` sobre fundo
`rgb(18,58,92)`, ou seja, **exatamente a mesma cor**, invisivel.

⚠️ Ler a regra que o motor gerou nao acusa nada: ela esta escrita e correta. So
perguntando a cor EFETIVA ao navegador, com `getComputedStyle`, o defeito
aparece. O auditor que le CSS deu 101 de 101 aprovados.

O conserto poe `!important` em `color` e `background` do botao, nos quatro
estilos e no `:hover`. O SVG usa `currentColor`, entao acompanha.
"""
import io
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
t = io.open(P, encoding='utf-8').read()

i = t.find('function _fpEstilo(site) {')
if i < 0:
    print('  🔴 nao achei o _fpEstilo')
    raise SystemExit(1)
j = t.find('\n}', i)
bloco = t[i:j + 2]
if 'color:' in bloco and '!important' in bloco:
    print('  ja corrigido')
    raise SystemExit()

n = 0


def forca(m):
    global n
    prop, val = m.group(1), m.group(2)
    if '!important' in val:
        return m.group(0)
    n += 1
    return "%s:' + %s + ' !important" % (prop, val.strip()) if False else m.group(0)


# troca textual, propriedade a propriedade, so dentro do _fpEstilo
novo = bloco
pares = [
    ("c + '{background:#1a73e8;color:#fff;", "c + '{background:#1a73e8 !important;color:#fff !important;"),
    ("c + ':hover{background:#188038;color:#fff;", "c + ':hover{background:#188038 !important;color:#fff !important;"),
    ("c + '{background:#fff;color:#1a73e8;", "c + '{background:#fff !important;color:#1a73e8 !important;"),
    ("c + ':hover{background:#1a73e8;color:#fff;", "c + ':hover{background:#1a73e8 !important;color:#fff !important;"),
    ("c + '{background:#202124;color:#fff;", "c + '{background:#202124 !important;color:#fff !important;"),
    ("c + ':hover{background:#1a73e8;color:#fff;", "c + ':hover{background:#1a73e8 !important;color:#fff !important;"),
    ("c + '{background:' + pri + ';color:' + sob + ';", "c + '{background:' + pri + ' !important;color:' + sob + ' !important;"),
    ("c + ':hover{background:' + viva + ';color:' + sob + ';", "c + ':hover{background:' + viva + ' !important;color:' + sob + ' !important;"),
]
for a, b in pares:
    if a in novo:
        novo = novo.replace(a, b)
        n += 1
print('  substituicoes: %d' % n)
if n < 6:
    print('  🔴 esperava pelo menos 6 substituicoes')
    raise SystemExit(1)
t = t[:i] + novo + t[j + 2:]
if APLICA:
    shutil.copyfile(P, P + '.bak-fpcor-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
    print('  gravado')
