# -*- coding: utf-8 -*-
"""O corte do cabecalho tem que levar o estilo e o script junto.

🔴 A primeira versao do corte removia so o `<span>` do botao, e o `<style>` e o
`<script>` emitidos logo depois continuavam saindo dentro do `<header>`. O
auditor acusava "estilo duplicado" e estava certo.

O bloco inteiro passa a vir entre marcadores de comentario, e o corte remove
tudo que estiver entre eles. Comentario sobrevive ao `_renomClasses`, que so
reescreve nome de classe.
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

if '<!--fp-->' in t:
    print('  ja estava com marcador')
    raise SystemExit()

i = t.find('data-fp-rodape="1">`')
if i < 0:
    print('  🔴 nao achei o wrapper')
    raise SystemExit(1)
# abre o marcador antes do span
t = t.replace('` + `<span class="${_fpDados(_SITE_ATUAL||{}).cls}-fim" data-fp-rodape="1">`',
              '` + `<!--fp--><span class="${_fpDados(_SITE_ATUAL||{}).cls}-fim" data-fp-rodape="1">`', 1)
if '<!--fp-->' not in t:
    # a linha pode ter sido montada de outra forma: abre pelo marcador de rodape
    t = t.replace('data-fp-rodape="1">`', 'data-fp-rodape="1">`', 1)
    t = re.sub(r'(\+ `)(<span class="\$\{_fpDados\(_SITE_ATUAL\|\|\{\}\)\.cls\}-fim")',
               r'\1<!--fp-->\2', t, count=1)
# fecha o marcador depois do script
t = t.replace("_fpEstilo(_SITE_ATUAL||{}) + _fpScript(),",
              "_fpEstilo(_SITE_ATUAL||{}) + _fpScript() + '<!--/fp-->',", 1)
if '<!--fp-->' not in t or '<!--/fp-->' not in t:
    print('  🔴 nao consegui por os dois marcadores')
    raise SystemExit(1)
print('  marcadores <!--fp--> e <!--/fp--> postos no bloco do rodape')

# o corte passa a remover tudo entre os marcadores
velho = """    const _limpo = _cab.replace(/<span[^>]*data-fp-rodape="1"[^>]*>[\s\S]*?<\/span>\s*<\/span>/g, '')
                       .replace(/<span[^>]*data-fp-rodape="1"[^>]*>[\s\S]*?<\/a><\/span>/g, '');"""
novo = """    const _limpo = _cab.replace(/<!--fp-->[\s\S]*?<!--\/fp-->/g, '');"""
if velho not in t:
    print('  🔴 nao achei o corte antigo')
    raise SystemExit(1)
t = t.replace(velho, novo, 1)
print('  corte do cabecalho passa a remover o bloco inteiro')

if APLICA:
    shutil.copyfile(P, P + '.bak-fpmarc-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
    print('  gravado')
else:
    print('  ensaio.')
