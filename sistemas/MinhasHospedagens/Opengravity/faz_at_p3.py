# -*- coding: utf-8 -*-
"""Reescreve o HTML da secao da AT e as duas funcoes de cartao."""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AT.js'
s = io.open(P, encoding='utf-8').read()

# ---- o cabecalho da secao na home
A = """<div class="${c('atmod')}">
<div class="${c('atcab')}"><span class="${c('atarco')}">${AT_SETA}</span>
<h2>${H.esc(nome)}</h2>
<a class="${c('atmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
<div>${atDestaque(ctx, d, false)}
${resto.length ? `<div class="${c('atlista')}">${resto.slice(0, 3).map(a => atLinha(ctx, a)).join('')}</div>` : ''}</div>
</div>"""
assert A in s, 'nao achei o modulo da secao'
B = """<div class="${c('atcab')}"><span class="${c('atseta')}">${AT_SETA}</span>
<h2>${H.esc(nome)}</h2><span class="${c('atfio')}"></span>
<a class="${c('atmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${atDestaque(ctx, d, true)}
${resto.length ? `<div class="${c('atlista')}">${resto.slice(0, 6).map(a => atLinha(ctx, a)).join('')}</div>` : ''}"""
s = s.replace(A, B, 1)

# ---- o cabecalho da listagem de editoria
A = """<div class="${c('atcab')}"><span class="${c('atarco')}">${AT_SETA}</span>
<h1>${H.esc(opts.title)}</h1></div>"""
assert A in s, 'nao achei o cabecalho da listagem'
B = """<div class="${c('atcab')}"><span class="${c('atseta')}">${AT_SETA}</span>
<h1>${H.esc(opts.title)}</h1><span class="${c('atfio')}"></span></div>"""
s = s.replace(A, B, 1)

# ---- a manchete: imagem a ESQUERDA e texto a direita
INI = s.index('function atDestaque(ctx, a, eager, nivel) {')
FIM = s.index('function atLinha(ctx, a, nivel) {')
DEST = """function atDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // manchete horizontal: imagem a esquerda, texto a direita. Na grade da
  // listagem o CSS desmancha o grid e ela vira cartao de coluna
  return `<a class="${c('atdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('atfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span><span class="${c('atkick')}">${H.cat(a)}</span>
<h${n} class="${c('atti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('atdd')}">${H.esc(H.clip(a.dek, 175))}</span>` : ''}
<span class="${c('atdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

"""
s = s[:INI] + DEST + s[FIM:]

# ---- a linha numerada: sem miniatura, so numeral e titulo
INI = s.index('function atLinha(ctx, a, nivel) {')
FIM = s.index('function atHome(ctx, arts, menu) {')
LIN = """function atLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // sem miniatura de proposito: o numeral e a coluna da esquerda, e e ele que
  // da a leitura de lista de plantao
  return `<a class="${c('atrow')} ${c('reveal')}" href="${H.url(a)}">
<span><span class="${c('atkick')}">${H.cat(a)}</span>
<h${n} class="${c('atti')}">${H.esc(a.title)}</h${n}>
<span class="${c('atdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

"""
s = s[:INI] + LIN + s[FIM:]

# ---- a classe do bloco "Veja tambem" leva o prefixo deste portal
s = s.replace('.pnb-veja', '.flr-veja')

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AT: HTML da secao, manchete e linha numerada')
