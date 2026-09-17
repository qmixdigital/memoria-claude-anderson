# -*- coding: utf-8 -*-
"""Reescreve o HTML da secao da AU e as duas funcoes de cartao."""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AU.js'
s = io.open(P, encoding='utf-8').read()

# ---- o cabecalho da secao na home
A = """<div class="${c('aucab')}"><span class="${c('auseta')}">${AU_ANEL}</span>
<h2>${H.esc(nome)}</h2><span class="${c('aufio')}"></span>
<a class="${c('aumais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${auDestaque(ctx, d, true)}
${resto.length ? `<div class="${c('aulista')}">${resto.slice(0, 6).map(a => auLinha(ctx, a)).join('')}</div>` : ''}"""
assert A in s, 'nao achei o cabecalho da secao'
B = """<div class="${c('aucab')}"><span class="${c('auanel')}">${AU_ANEL}</span>
<h2>${H.esc(nome)}</h2>
<a class="${c('aumais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${auDestaque(ctx, d, true)}
${resto.length ? `<div class="${c('aulista')}">${resto.slice(0, 6).map(a => auLinha(ctx, a)).join('')}</div>` : ''}"""
s = s.replace(A, B, 1)

# ---- o cabecalho da listagem
A = """<div class="${c('aucab')}"><span class="${c('auseta')}">${AU_ANEL}</span>
<h1>${H.esc(opts.title)}</h1><span class="${c('aufio')}"></span></div>"""
assert A in s, 'nao achei o cabecalho da listagem'
B = """<div class="${c('aucab')}"><span class="${c('auanel')}">${AU_ANEL}</span>
<h1>${H.esc(opts.title)}</h1></div>"""
s = s.replace(A, B, 1)

# ---- a materia de abertura: foto em cima, texto embaixo
INI = s.index('function auDestaque(ctx, a, eager, nivel) {')
FIM = s.index('function auLinha(ctx, a, nivel) {')
DEST = """function auDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // foto larga em cima e texto embaixo. Na grade da listagem o CSS so tira o
  // filete de baixo, e o mesmo cartao serve nos dois lugares
  return `<a class="${c('audest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('aufoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span class="${c('aukick')}">${H.cat(a)}</span>
<h${n} class="${c('auti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('audd')}">${H.esc(H.clip(a.dek, 180))}</span>` : ''}
<span class="${c('audt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

"""
s = s[:INI] + DEST + s[FIM:]

# ---- a linha: miniatura REDONDA a esquerda
INI = s.index('function auLinha(ctx, a, nivel) {')
FIM = s.index('function auHome(ctx, arts, menu) {')
LIN = """function auLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // miniatura redonda com anel limao: e o gesto da marca, e nenhuma vizinha usa
  // foto circular
  return `<a class="${c('aurow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('aumini')}"><span data-f>${H.pic(a, false)}</span></span>
<span><span class="${c('aukick')}">${H.cat(a)}</span>
<h${n} class="${c('auti')}">${H.esc(a.title)}</h${n}>
<span class="${c('audt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

"""
s = s[:INI] + LIN + s[FIM:]

# ---- a classe do bloco "Veja tambem" leva o prefixo deste portal
s = s.replace('.flr-veja', '.pub-veja')

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AU: HTML da secao, materia de abertura e linha circular')
