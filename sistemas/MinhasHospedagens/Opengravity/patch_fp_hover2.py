# -*- coding: utf-8 -*-
"""Ha cor viva que nao alcanca 4,5:1 nem com branco nem com quase-preto.

Uso, no servidor:  python3 /tmp/patch_fp_hover2.py [--aplica]

O `#D8452B` do advivo da 4,32:1 com branco e 4,33:1 com `#111111`: os dois
extremos falham. Escolher "o melhor dos dois" nao resolve, porque nenhum dos
dois presta.

Nesse caso o que muda e o FUNDO: a cor viva e escurecida, mantendo o matiz da
marca, ate o branco passar da regua. E o mesmo gesto do `ajusta_contraste.py`
que ja se usa nos temas da rede.
"""
import io
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
t = io.open(P, encoding='utf-8').read()

if '_fpFundoHover' in t:
    print('  ja corrigido')
    raise SystemExit()

AJUDA = '''// Escurece a cor ate o branco alcancar 4,5:1, preservando o matiz. Usado
// quando a cor viva nao passa nem com branco nem com quase-preto: ai quem cede
// e o fundo, e nao o texto.
function _fpFundoHover(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return hex;
  let n = parseInt(m[1], 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const contra = () => 1.05 / (0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) + 0.05);
  let voltas = 0;
  while (contra() < 4.6 && voltas < 40) {
    r = Math.round(r * 0.93); g = Math.round(g * 0.93); b = Math.round(b * 0.93);
    voltas++;
  }
  const h2 = (x) => ('0' + x.toString(16)).slice(-2);
  return '#' + h2(r) + h2(g) + h2(b);
}
'''
anc = 'function _fpEstilo(site) {'
t = t.replace(anc, AJUDA + anc, 1)

velho = "c + ':hover{background:' + viva + ' !important;color:' + _fpSobre(viva) + ' !important;"
novo = ("c + ':hover{background:' + (_fpSobre(viva) === '#fff' && _fpContra(viva) < 4.5 "
        "? _fpFundoHover(viva) : viva) + ' !important;color:' + "
        "(_fpSobre(viva) === '#fff' && _fpContra(viva) < 4.5 ? '#fff' : _fpSobre(viva)) "
        "+ ' !important;")
if velho not in t:
    print('  🔴 nao achei o hover')
    raise SystemExit(1)
t = t.replace(velho, novo, 1)

# a razao do melhor dos dois extremos, para decidir se o fundo precisa ceder
AJUDA2 = '''// A melhor razao que a cor alcanca, entre branco e quase-preto.
function _fpContra(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return 21;
  const n = parseInt(m[1], 16);
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
  return Math.max(1.05 / (L + 0.05), (L + 0.05) / 0.05605);
}
'''
t = t.replace(anc, AJUDA2 + anc, 1)
print('  o fundo do hover cede quando nenhum texto alcanca a regua')
if APLICA:
    shutil.copyfile(P, P + '.bak-fphover2-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
    print('  gravado')
