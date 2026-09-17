# -*- coding: utf-8 -*-
"""Segunda metade do faz_as: o HTML da secao, a linha do trio e o cabecalho.

Separado em dois arquivos porque o transporte por heredoc corta o script longo
pelo meio, e o corte nao da erro: o Python roda a metade que chegou.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AS.js'
s = io.open(P, encoding='utf-8').read()

# ---- o cabecalho da secao e o modulo, no HTML
A = """<div class="${c('ascab')}"><h2>${H.esc(nome)}</h2>
<a class="${c('asmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
<div class="${c('asmod')}">${asDestaque(ctx, d, false)}
${resto.length ? `<div class="${c('aslista')}">${resto.slice(0, 3).map(a => asLinha(ctx, a)).join('')}</div>` : ''}</div>"""
assert A in s, 'nao achei o modulo da secao'
B = """<div class="${c('asmod')}">
<div class="${c('ascab')}"><span class="${c('asarco')}">${AS_ARCO}</span>
<h2>${H.esc(nome)}</h2>
<a class="${c('asmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
<div>${asDestaque(ctx, d, false)}
${resto.length ? `<div class="${c('aslista')}">${resto.slice(0, 3).map(a => asLinha(ctx, a)).join('')}</div>` : ''}</div>
</div>"""
s = s.replace(A, B, 1)

# ---- a linha do trio: miniatura EM CIMA, e nao ao lado
INI = s.index('function asLinha(ctx, a, nivel) {')
FIM = s.index('function asHome(ctx, arts, menu) {')
LIN = """function asLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // miniatura em cima e texto embaixo: e uma das tres colunas do trio
  return `<a class="${c('asrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('asmini')}"><span data-f>${H.pic(a, false)}</span></span>
<span class="${c('askick')}">${H.cat(a)}</span>
<h${n} class="${c('asti')}">${H.esc(a.title)}</h${n}>
<span class="${c('asdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

"""
s = s[:INI] + LIN + s[FIM:]

# ---- a classe do bloco "Veja tambem" e literal, e trazia o prefixo do vizinho
if '.uni-veja' not in s:
    print('  nao achei .uni-veja')
s = s.replace('.uni-veja', '.pnb-veja')

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  HTML da secao e linha do trio reescritos')
