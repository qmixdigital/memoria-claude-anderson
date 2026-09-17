# -*- coding: utf-8 -*-
"""O hover da variante "cor do tema" ficava ilegivel onde a cor viva e clara.

Uso, no servidor:  python3 /tmp/patch_fp_hover.py [--aplica]

🔴 O `:hover` usava `theme.vivid` de fundo com o mesmo `onPrimary` de texto. Em
portal cuja cor viva e clara isso da branco sobre claro: no pontonaturalbrasil
saia branco sobre `#00FF30`, **1,37:1**.

⚠️ O `getComputedStyle` le o estado em repouso, entao a medida no navegador nao
alcanca o hover. Ele so aparece lendo a regra e calculando.

O texto do hover passa a ser escolhido por contraste contra o proprio fundo do
hover: branco quando o fundo e escuro, quase-preto quando e claro.
"""
import io
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
t = io.open(P, encoding='utf-8').read()

if '_fpSobre' in t:
    print('  ja corrigido')
    raise SystemExit()

AJUDA = '''// Escolhe o texto legivel para um fundo qualquer: branco no escuro,
// quase-preto no claro. Usado no hover da variante que pinta com a cor do tema.
function _fpSobre(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return '#fff';
  const n = parseInt(m[1], 16);
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
  const claro = (1.05) / (L + 0.05);
  const escuro = (L + 0.05) / (0.0722);
  return claro >= escuro ? '#fff' : '#111111';
}
'''
anc = 'function _fpEstilo(site) {'
if anc not in t:
    print('  🔴 nao achei o _fpEstilo')
    raise SystemExit(1)
t = t.replace(anc, AJUDA + anc, 1)

velho = "c + ':hover{background:' + viva + ' !important;color:' + sob + ' !important;"
novo = "c + ':hover{background:' + viva + ' !important;color:' + _fpSobre(viva) + ' !important;"
if velho not in t:
    print('  🔴 nao achei o hover da variante do tema')
    raise SystemExit(1)
t = t.replace(velho, novo, 1)
print('  o texto do hover passa a ser escolhido por contraste')
if APLICA:
    shutil.copyfile(P, P + '.bak-fphover-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
    print('  gravado')
