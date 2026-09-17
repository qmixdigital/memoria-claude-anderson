# -*- coding: utf-8 -*-
"""Reescreve o cabecalho e a secao da AU, que nasceu como copia da AT.

A marca do Publisher Brasil e um **anel de crescente verde-limao** sobre preto,
com um segundo crescente cinza por dentro e a palavra Publisher em branco. O
favicon e uma **lampada acesa segurada por uma mao**.

Dois gestos saem dai:

  - o **anel** abre cada secao, com o nome da editoria ao lado
  - as miniaturas da lista sao **circulares, com um anel limao em volta**.
    Nenhuma das 46 vizinhas usa foto redonda

⚠️ O limao `#DFFB00` da 1,1:1 sobre branco: e cor de anel, filete e bloco, nunca
de texto. Chapeu e link usam o `--tinta`, uma azeitona escura.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AU.js'
s = io.open(P, encoding='utf-8').read()

# ---- o simbolo do cabecalho: o crescente da marca
i = s.index('const AU_SIMB')
j = s.index(chr(10), i)
SIMB = ('const AU_SIMB = `<svg viewBox="0 0 26 26" role="img" aria-hidden="true" '
        'focusable="false">'
        '<path d="M13 1a12 12 0 1 0 0 24 12 12 0 0 1 0-24z" '
        'fill="var(--marca-1,currentColor)"/>'
        '<circle cx="15.5" cy="13" r="8" fill="none" stroke="var(--marca-2,currentColor)" '
        'stroke-width="2.4"/>'
        '</svg>`;')
s = s[:i] + SIMB + s[j:]

# o anel maior, que abre cada secao
i = s.index('const AU_ANEL')
j = s.index(chr(10), i)
ANEL = ('const AU_ANEL = `<svg viewBox="0 0 34 34" aria-hidden="true" focusable="false">'
        '<circle cx="17" cy="17" r="14" fill="none" stroke="currentColor" stroke-width="5"/>'
        '<circle cx="17" cy="17" r="5" fill="currentColor"/></svg>`;')
s = s[:i] + ANEL + s[j:]

# ---- o cabecalho volta a ser claro, com filete limao grosso
velho = s[s.index("/* ---------- cabecalho"):s.index("/* ---------- chamada de abertura")]
novo = """/* ---------- cabecalho: papel claro com o filete limao da marca ---------- */
${s('autop')}{background:var(--paper);border-bottom:6px solid var(--viva)}
${s('aubar')}{display:flex;align-items:center;gap:18px;padding-block:18px 15px;flex-wrap:wrap}
${s('aumarca')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:700;font-size:clamp(22px,3vw,30px);letter-spacing:-.02em;color:var(--ink);flex:none}
${s('aumarca')} svg{display:block;height:1em;width:auto;flex:none;align-self:center}
/* ⚠️ o logotipo e imagem, e imagem sem medida derruba o CLS. A altura manda e a
   largura sai da proporcao do arquivo */
${s('aumarca')} img{display:block;height:42px;width:auto;flex:none}
@media(max-width:560px){${s('aumarca')} img{height:33px}}
${s('aufb')} img{display:block;height:38px;width:auto}
${s('aunav')}{display:flex;gap:15px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('aunav')} a{font-family:var(--fb);font-size:12px;font-weight:600;letter-spacing:.06em;
  text-transform:uppercase;color:var(--dek);padding-bottom:3px;
  border-bottom:2px solid transparent;transition:border-color .2s ease,color .2s ease}
${s('aunav')} a:hover{color:var(--ink);border-bottom-color:var(--viva)}
${s('aubusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  background:var(--ink);color:var(--paper);padding:10px 17px;border-radius:999px;flex:none;
  margin-left:8px}
${s('aubusca')}:hover{background:var(--tinta)}
${s('auham')}{display:none;width:46px;height:46px;border:2px solid var(--ink);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:999px}
${s('auham')} i,${s('auham')} i::before,${s('auham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--ink);content:""}
${s('auham')} i{top:21px}
${s('auham')} i::before{top:-6px;left:0}
${s('auham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('aumarca')}{font-size:20px;gap:8px}
  ${s('aubar')}{gap:11px}
  ${s('aubusca')}{font-size:10.5px;padding:9px 13px;gap:6px}
}
@media(max-width:1100px){
  ${s('auham')}{display:block;order:2}
  ${s('aubusca')}{order:3;margin-left:0}
  ${s('aunav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('aunav')}[data-aberto="1"]{display:flex}
  ${s('aunav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink);
    border-left:0;font-size:13px}
}

"""
s = s.replace(velho, novo, 1)

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AU: simbolo do anel e cabecalho claro com filete limao')
