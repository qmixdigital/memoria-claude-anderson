# -*- coding: utf-8 -*-
"""Tira o artigo repetido da listagem de editoria da AR e da AS.

A listagem abre com a materia mais recente em destaque e, logo abaixo, a grade
com **todos** os itens, inclusive o que acabou de aparecer em cima. O leitor ve a
mesma foto e o mesmo titulo duas vezes seguidas, e o Google ve dois links iguais
para a mesma URL na mesma pagina.

⚠️ A AN parece ter o mesmo defeito e **nao tem**: ali nao existe destaque
separado, o mosaico e a pagina inteira, entao `itens.map` esta certo. Trocar por
`resto.map` la faria a materia mais recente sumir da propria editoria.

A AS ganha mais duas correcoes que so ela precisa:

  - **o `h1` encostava na linha de baixo.** A Darker Grotesque tem ascendente
    alto, e `line-height:1.07` faz o texto transbordar a caixa: no artigo a
    assinatura ficava por cima do titulo. Nao aparece em nenhuma arquitetura que
    use outra fonte, e por isso a medida vive aqui
  - **o arco tambem abre a listagem**, e nao so a secao da home: e o gesto da
    arquitetura, e a listagem ficava sem ele
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
D = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs' + '\\'

for letra, pre in (('AR', 'ar'), ('AS', 'as')):
    P = D + letra + '.js'
    s = io.open(P, encoding='utf-8').read()
    a = "${itens.length ? `<div class=\"${c('%sgrade')}\">${itens.map(a => %sDestaque(ctx, a, false, 2)).join('')}</div>` : ''}" % (pre, pre)
    b = "${resto.length ? `<div class=\"${c('%sgrade')}\">${resto.map(a => %sDestaque(ctx, a, false, 2)).join('')}</div>` : ''}" % (pre, pre)
    if a not in s:
        print('  ⚠️ %s: nao achei a grade da listagem' % letra)
        continue
    s = s.replace(a, b, 1)
    io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
    print('  %s: a grade da listagem agora pula o destaque' % letra)

# --- as duas correcoes que so a AS precisa
P = D + 'AS.js'
s = io.open(P, encoding='utf-8').read()

a = """${s('ascab')} h1,${s('ascab')} h2{font-family:var(--fd);font-weight:800;
  font-size:clamp(25px,2.8vw,35px);line-height:1.02;letter-spacing:-.026em;
  color:var(--pri);margin:0}"""
b = """/* ⚠️ a Darker Grotesque tem ascendente alto: com line-height abaixo de 1,1 o
   texto transborda a caixa e encosta na linha seguinte */
${s('ascab')} h1,${s('ascab')} h2{font-family:var(--fd);font-weight:800;
  font-size:clamp(25px,2.8vw,35px);line-height:1.12;letter-spacing:-.026em;
  color:var(--pri);margin:0 0 2px}"""
assert a in s, 'nao achei o h2 do cabecalho de secao'
s = s.replace(a, b, 1)

a = """${s('asart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.07;margin:13px 0 0;
  letter-spacing:-.02em}"""
b = """${s('asart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.12;margin:13px 0 6px;
  letter-spacing:-.02em}"""
assert a in s, 'nao achei o h1 do artigo'
s = s.replace(a, b, 1)

a = """<div class="${c('ascab')}"><h1>${H.esc(opts.title)}</h1></div>"""
b = """<div class="${c('ascab')}"><span class="${c('asarco')}">${AS_ARCO}</span>
<h1>${H.esc(opts.title)}</h1></div>"""
assert a in s, 'nao achei o cabecalho da listagem'
s = s.replace(a, b, 1)

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AS: h1 com respiro embaixo e arco tambem na listagem')
