# -*- coding: utf-8 -*-
"""Reescreve o HTML da secao da AV e as duas funcoes de cartao."""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AV.js'
s = io.open(P, encoding='utf-8').read()

# ---- o cabecalho da secao: o selo e o proprio h2, sem SVG
A = """<div class="${c('avcab')}"><span class="${c('avanel')}">${AV_SELO}</span>
<h2>${H.esc(nome)}</h2>
<a class="${c('avmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>"""
assert A in s, 'nao achei o cabecalho da secao'
B = """<div class="${c('avcab')}"><h2>${H.esc(nome)}</h2>
<a class="${c('avmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>"""
s = s.replace(A, B, 1)

A = """<div class="${c('avcab')}"><span class="${c('avanel')}">${AV_SELO}</span>
<h1>${H.esc(opts.title)}</h1></div>"""
assert A in s, 'nao achei o cabecalho da listagem'
B = """<div class="${c('avcab')}"><h1>${H.esc(opts.title)}</h1></div>"""
s = s.replace(A, B, 1)

# ---- a linha vira cartao grande com filete no topo
INI = s.index('function avLinha(ctx, a, nivel) {')
FIM = s.index('function avHome(ctx, arts, menu) {')
LIN = """function avLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // cartao grande com filete marinho no topo: dois por linha
  return `<a class="${c('avrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('avmini')}"><span data-f>${H.pic(a, false)}</span></span>
<span class="${c('avkick')}">${H.cat(a)}</span>
<h${n} class="${c('avti')}">${H.esc(a.title)}</h${n}>
<span class="${c('avdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

"""
s = s[:INI] + LIN + s[FIM:]

# ---- a secao mostra 4 cartoes, e nao 6
s = s.replace("resto.slice(0, 6).map(a => avLinha(ctx, a))",
              "resto.slice(0, 4).map(a => avLinha(ctx, a))")

# ---- a classe do bloco "Veja tambem" leva o prefixo deste portal
s = s.replace('.pub-veja', '.sab-veja')

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AV: HTML da secao e cartao com filete')
