# -*- coding: utf-8 -*-
"""O botao de fonte preferida nao pode sair no cabecalho.

Uso, no servidor:  python3 /tmp/patch_fp_header.py [--aplica]

🔴 **Nem toda arquitetura chama `instLinks()` so no rodape.** A arquitetura K da
hostinger chama tambem no CABECALHO, dentro do menu sanfonado: o botao saia duas
vezes na home e tres no artigo, e a documentacao e explicita em nao por o botao
no cabecalho nem na barra lateral, para nao competir com outros CTAs.

O conserto vai no funil unico por onde toda pagina passa, o `_renomClasses`:
o que estiver **antes do fim do `</header>`** e removido. E uma varredura de
string, sem depender de qual arquitetura gerou a pagina.

⚠️ O corte usa o marcador `data-fp-rodape`, e nao a classe: a classe muda de
portal para portal, e o `_renomClasses` ainda vai reescreve-la depois.
"""
import io
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
t = io.open(P, encoding='utf-8').read()

if 'data-fp-rodape' in t:
    print('  ja estava corrigido')
    raise SystemExit()

# 1. o wrapper do rodape ganha o marcador
velho = ('" + `<span class="${_fpDados(_SITE_ATUAL||{}).cls}-fim">` + '
         '_fpBotao(_SITE_ATUAL||{}) + \'</span>\'')
if velho not in t:
    # a forma exata depende de como o patch anterior montou a linha; procura o
    # trecho pelo nome da classe de fim
    i = t.find('-fim">`')
    if i < 0:
        print('  🔴 nao achei o wrapper do rodape')
        raise SystemExit(1)
    t = t.replace('-fim">`', '-fim" data-fp-rodape="1">`', 1)
else:
    t = t.replace('-fim">`', '-fim" data-fp-rodape="1">`', 1)
print('  marcador data-fp-rodape posto no wrapper')

# 2. o corte entra no funil unico
anc = '  return _lcpEager(out);'
if anc not in t:
    print('  🔴 nao achei o fim do _renomClasses')
    raise SystemExit(1)
corte = '''  // 🔴 arquitetura que chama instLinks TAMBEM no cabecalho fazia o botao de
  // fonte preferida sair ali, contra o que a documentacao pede. O que estiver
  // antes do fim do </header> sai
  const _fimCab = out.indexOf('</header>');
  if (_fimCab > 0) {
    const _cab = out.slice(0, _fimCab);
    const _limpo = _cab.replace(/<span[^>]*data-fp-rodape="1"[^>]*>[\\s\\S]*?<\\/span>\\s*<\\/span>/g, '')
                       .replace(/<span[^>]*data-fp-rodape="1"[^>]*>[\\s\\S]*?<\\/a><\\/span>/g, '');
    if (_limpo !== _cab) out = _limpo + out.slice(_fimCab);
  }
''' + anc
t = t.replace(anc, corte, 1)
print('  corte do cabecalho inserido no _renomClasses')

if APLICA:
    shutil.copyfile(P, P + '.bak-fpcab-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
    print('  gravado')
else:
    io.open('/tmp/render-fpcab-preview.js', 'w', encoding='utf-8', newline='\n').write(t)
    print('  ensaio. previa em /tmp/render-fpcab-preview.js')
