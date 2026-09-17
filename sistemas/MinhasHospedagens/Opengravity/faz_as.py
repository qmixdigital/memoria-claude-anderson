# -*- coding: utf-8 -*-
"""Reescreve a camada visual da AS, que nasceu como copia da AR.

A marca do PN Brasil e uma palavra em grotesco geometrico pesado com **tres arcos
concentricos e um ponto** a esquerda, o desenho de sinal irradiando. O favicon da
origem e so esse simbolo, em verde vivo.

O gesto da arquitetura sai dai: cada secao tem um **rotulo lateral estreito que
acompanha a rolagem**, com os arcos por cima do nome da editoria, e a coluna de
materias corre a direita. O sinal fica parado enquanto o conteudo passa.

Nenhuma das 44 vizinhas da opengravity faz isso: a AL gira o texto na vertical, a
AK usa faixa cheia, a AM caixas, a AN mosaico, a AO linha do tempo, a AP moldura
de tela, a AQ cabecalho de revista e a AR modulo assimetrico. Rotulo horizontal
fixo na lateral e so aqui.

⚠️ Abaixo de 900px o rotulo perde o `sticky` e vira linha: o nome ao lado dos
arcos e o "ver tudo" empurrado para a direita.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AS.js'
s = io.open(P, encoding='utf-8').read()

# ---- o simbolo do cabecalho: os arcos da marca
i = s.index('const AS_SIMB')
j = s.index(chr(10), i)
SIMB = ("const AS_SIMB = `<svg viewBox=\"0 0 28 28\" role=\"img\" aria-hidden=\"true\" "
        "focusable=\"false\" fill=\"none\" stroke=\"var(--marca-1,currentColor)\" "
        "stroke-width=\"3\" stroke-linecap=\"round\">"
        "<path d=\"M7 21a14 14 0 0 1 14-14\"/><path d=\"M7 15a8 8 0 0 1 8 8\" "
        "transform=\"translate(0 -2) rotate(-90 11 19)\"/>"
        "<circle cx=\"6.5\" cy=\"21.5\" r=\"2.4\"/>"
        "</svg>`;")
s = s[:i] + SIMB + s[j:]

# o mesmo desenho, maior, para o rotulo de secao. Aqui os tres arcos aparecem
# inteiros, que e a leitura que o simbolo do cabecalho nao tem espaco para dar
ARCO = ("\nconst AS_ARCO = `<svg viewBox=\"0 0 40 40\" aria-hidden=\"true\" focusable=\"false\" "
        "fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.4\" stroke-linecap=\"round\">"
        "<path d=\"M9 31A22 22 0 0 1 31 9\"/><path d=\"M9 23A14 14 0 0 1 23 9\"/>"
        "<path d=\"M9 15A6 6 0 0 1 15 9\" transform=\"translate(0 0)\"/>"
        "<circle cx=\"8\" cy=\"32\" r=\"2.6\"/></svg>`;\n")
k = s.index('const AS_LUPA')
s = s[:k] + ARCO.lstrip('\n') + '\n' + s[k:]

# ---- a secao
velho = s[s.index("/* ---------- a secao"):s.index("/* ---------- artigo ---------- */")]
novo = """/* ---------- a secao: o rotulo lateral que acompanha a rolagem ---------- */
${s('assec')}{padding-block:44px;background:var(--paper);border-top:1px solid var(--line)}
${s('assec')}[data-par="1"]{background:var(--wash)}

/* ⚠️ o modulo: rotulo estreito a esquerda, coluna de materias a direita */
${s('asmod')}{display:grid;grid-template-columns:212px minmax(0,1fr);gap:46px;align-items:start}
@media(max-width:900px){${s('asmod')}{grid-template-columns:1fr;gap:20px}}

${s('ascab')}{position:sticky;top:20px;display:block}
${s('ascab')} h1,${s('ascab')} h2{font-family:var(--fd);font-weight:800;
  font-size:clamp(25px,2.8vw,35px);line-height:1.02;letter-spacing:-.026em;
  color:var(--pri);margin:0}
/* os arcos da marca viram o marcador de editoria */
${s('asarco')}{display:block;width:40px;height:40px;margin-bottom:15px;color:var(--viva)}
${s('asarco')} svg{display:block;width:100%;height:100%}
${s('asmais')}{display:inline-block;margin-top:15px;font-family:var(--fb);font-size:10.5px;
  font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--tinta);
  border-bottom:2px solid var(--viva);padding-bottom:3px}
${s('asmais')}:hover{color:var(--pri)}
@media(max-width:900px){
  ${s('ascab')}{position:static;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  ${s('asarco')}{width:27px;height:27px;margin-bottom:0}
  ${s('asmais')}{margin-top:0;margin-left:auto}
}
${s('asdescr')}{margin:0 0 22px;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:70ch;text-align:left}

/* a materia de abertura da secao: foto larga em cima, texto embaixo */
${s('asdest')}{display:block}
${s('asdest')} ${s('asti')}{font-size:clamp(21px,2.5vw,30px);line-height:1.12;margin-top:13px}
${s('askick')}{display:inline-block;font-family:var(--fb);font-size:9.5px;font-weight:800;
  letter-spacing:${fp.kickerLs || '.15em'};text-transform:uppercase;color:var(--tinta)}
${s('asti')}{display:block;font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.2;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('asdd')}{display:block;margin:12px 0 0;font-size:15.5px;line-height:1.6;color:var(--dek);
  max-width:58ch;text-align:left}
${s('asdt')}{display:block;margin-top:10px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('asfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('asfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('asfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('asdest')}:hover ${s('asti')}{color:var(--pri)}
${s('asdest')}:hover ${s('asfoto')} [data-f] img{transform:scale(1.03)}

/* o trio de baixo: tres colunas separadas por filete vertical */
${s('aslista')}{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:32px;
  padding-top:24px;border-top:1px solid var(--line)}
${s('asrow')}{display:block;padding:0 22px;border-left:1px solid var(--line)}
${s('aslista')}>${s('asrow')}:first-child{border-left:0;padding-left:0}
${s('aslista')}>${s('asrow')}:last-child{padding-right:0}
${s('asmini')}{display:block;overflow:hidden;background:var(--ph);margin-bottom:12px;
  border-radius:${canto}}
${s('asmini')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '3/2'};overflow:hidden}
${s('asmini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('asrow')}:hover ${s('asmini')} [data-f] img{transform:scale(1.05)}
${s('asrow')}:hover ${s('asti')}{color:var(--pri)}
${s('asrow')} ${s('asti')}{font-size:16.5px;margin-top:7px}
${s('asrow')} ${s('asdd')}{display:none}
@media(max-width:760px){
  ${s('aslista')}{grid-template-columns:1fr 1fr}
  ${s('asrow')}{padding:0 16px}
  ${s('aslista')}>${s('asrow')}:nth-child(3){border-left:0;padding-left:0;margin-top:22px}
}
@media(max-width:520px){
  ${s('aslista')}{grid-template-columns:1fr;gap:22px}
  ${s('asrow')}{padding:0;border-left:0}
  ${s('aslista')}>${s('asrow')}:nth-child(3){margin-top:0}
}

/* a listagem de editoria e os relacionados usam grade de tres cartoes */
${s('asgrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 28px}
${s('asgrade')} ${s('asti')}{font-size:19px;line-height:1.22}
${s('asgrade')} ${s('asdd')}{display:none}
@media(max-width:900px){${s('asgrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('asgrade')}{grid-template-columns:1fr}}

"""
s = s.replace(velho, novo, 1)
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  CSS da secao da AS reescrito')
