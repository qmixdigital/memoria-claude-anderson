# -*- coding: utf-8 -*-
"""O botao "Aceitar todos" some quando a primaria do portal e quase preta.

🔴 O banner de LGPD tem fundo **fixo** em `#111` e pinta o botao de aceitar com
`theme.primary`. Em portal de paleta preta (o matogrossosaude usa `#111111`, que
e a cor do logotipo) o botao fica preto sobre preto: **existe, e clicavel, e
invisivel**. Nenhuma auditoria de HTML pega, porque o elemento esta la; so a
captura de tela mostra.

O conserto escolhe a cor por contraste com o proprio fundo do banner: usa a
primaria quando ela se destaca, cai para a cor viva quando nao, e por ultimo usa
branco com texto escuro. Vale para os 40 portais da maquina, e nao so para este.
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

VELHO = """  const t = (site && site.theme) || {};
  const cor = t.primary || '#111';
  const id = 'lgpd-' + String(site.slug || 'p');"""

NOVO = """  const t = (site && site.theme) || {};
  // 🔴 o fundo do banner e fixo em #111. Pintar o botao com a primaria deixa o
  // "Aceitar todos" PRETO SOBRE PRETO nos portais de paleta escura: ele existe,
  // e clicavel, e some da tela. So a captura mostra
  const _lum = (h) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '').trim());
    if (!m) return 1;
    const n = parseInt(m[1], 16);
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
  };
  const _contra = (h) => (Math.max(_lum(h), 0.0134) + 0.05) / (Math.min(_lum(h), 0.0134) + 0.05);
  let cor = t.primary || '#111', sob = '#fff';
  if (_contra(cor) < 2.2) cor = t.vivid || cor;
  if (_contra(cor) < 2.2) { cor = '#f5f5f5'; sob = '#111'; }
  const id = 'lgpd-' + String(site.slug || 'p');"""

if NOVO.split(chr(10))[1].strip() in t:
    print('  ja estava corrigido')
    raise SystemExit()
if VELHO not in t:
    print('  🔴 nao achei o trecho do banner')
    raise SystemExit(1)
t2 = t.replace(VELHO, NOVO, 1)
t2 = t2.replace("+ 'color:#fff;padding:9px 16px;cursor:pointer\">Aceitar todos</button>'",
                "+ 'color:' + sob + ';padding:9px 16px;cursor:pointer\">Aceitar todos</button>'", 1)
if t2 == t:
    print('  🔴 a troca da cor do texto nao pegou')
    raise SystemExit(1)
print('  banner: a cor do botao passa a ser escolhida por contraste com o fundo')
if APLICA:
    shutil.copyfile(P, P + '.bak-lgpd-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t2)
    print('  gravado')
else:
    print('  ensaio. rode com --aplica.')
