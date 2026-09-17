# -*- coding: utf-8 -*-
"""Poe os dois ganchos DENTRO do `_renomClasses`, que e o funil de verdade.

Uso, no servidor:  python3 /tmp/corrige_ganchos.py [--aplica]

🔴 O ancoradouro que eu usei, `return _lcpEager(out);`, **nao e exclusivo do
`_renomClasses`**: na opengravity e na clinicas-vps ele aparece antes, no fim da
funcao que insere anuncio, e foi la que os dois ganchos caíram. Na clinicas o
`_renomClasses` nem termina assim, termina em `return out;`.

Consequencia: o corte do cabecalho e o menu sanfonado so rodavam nas paginas que
passam pela funcao de anuncio, e o artigo daquela maquina nao passa. Nada disso
da erro: a pagina sai inteira, so sem o que deveria ter sido acrescentado.

O conserto acha a funcao pelo NOME, anda ate o `return` dela e insere ali.
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

CORTE = """  // 🔴 arquitetura que chama instLinks TAMBEM no cabecalho fazia o botao de
  // fonte preferida sair ali, contra o que a documentacao pede. O que estiver
  // antes do fim do </header> sai
  const _fimCab = out.indexOf('</header>');
  if (_fimCab > 0) {
    const _cab = out.slice(0, _fimCab);
    const _limpo = _cab.replace(/<!--fp-->[\\s\\S]*?<!--\\/fp-->/g, '');
    if (_limpo !== _cab) out = _limpo + out.slice(_fimCab);
  }
"""
MENU = "  out = _menuSanfona(site, out);\n"

# 1. tira os ganchos de onde estiverem
antes_corte = t.count("const _fimCab = out.indexOf('</header>');")
antes_menu = t.count('out = _menuSanfona(site, out);')
t = t.replace(CORTE, '')
t = t.replace(MENU, '')
# a versao que ficou no meio da funcao de anuncio pode ter indentacao igual;
# tira tambem qualquer linha solta remanescente
t = re.sub(r'\n *out = _menuSanfona\(site, out\);', '', t)
depois = t.count('_menuSanfona(site, out)')
print('  ganchos removidos: corte %d, menu %d | sobraram %d'
      % (antes_corte, antes_menu, depois))

# 2. acha o `_renomClasses` e o `return` dele
i = t.find('function _renomClasses(site, html) {')
if i < 0:
    print('  🔴 nao achei o _renomClasses')
    raise SystemExit(1)
fim = t.find('\n}', i)
trecho = t[i:fim]
m = None
for cand in ('  return _lcpEager(out);', '  return out;'):
    k = trecho.rfind(cand)
    if k >= 0:
        m = (cand, i + k)
        break
if not m:
    print('  🔴 nao achei o return do _renomClasses')
    raise SystemExit(1)
cand, pos = m
t = t[:pos] + CORTE + MENU + t[pos:]
print('  os dois ganchos inseridos antes de %r, dentro do _renomClasses' % cand.strip())

if APLICA:
    shutil.copyfile(P, P + '.bak-ganchos-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
    print('  gravado')
else:
    io.open('/tmp/render-ganchos-preview.js', 'w', encoding='utf-8', newline='\n').write(t)
    print('  ensaio. previa em /tmp/render-ganchos-preview.js')
