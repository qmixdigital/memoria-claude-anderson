# -*- coding: utf-8 -*-
"""Reescreve o cabecalho e a secao da AV, que nasceu como copia da AU.

A marca do Saber de Fato e um **mascote de oculos e gravata-borboleta apontando**
dentro de um circulo laranja, ao lado de SABER DE FATO em grotesco pesado
marinho, com o "DE" em laranja.

O gesto que sai dai e o **selo**: o nome de cada editoria vem dentro de um bloco
laranja **levemente girado**, como carimbo. Nenhuma das 47 vizinhas usa rotacao
de bloco.

⚠️ O bloco girado precisa de `transform-origin` a esquerda: girado pelo centro,
ele avanca sobre o texto vizinho em telas estreitas.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AV.js'
s = io.open(P, encoding='utf-8').read()

# ---- o simbolo: o circulo do mascote com o gesto de apontar reduzido a um ponto
i = s.index('const AV_SIMB')
j = s.index(chr(10), i)
SIMB = ('const AV_SIMB = `<svg viewBox="0 0 26 26" role="img" aria-hidden="true" focusable="false">'
        '<circle cx="13" cy="13" r="12" fill="var(--marca-1,currentColor)"/>'
        '<path d="M7.5 16.5 L12 8.5 L16.5 16.5" fill="none" stroke="var(--marca-2,#fff)" '
        'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
        '<circle cx="19" cy="9" r="2.1" fill="var(--marca-2,#fff)"/>'
        '</svg>`;')
s = s[:i] + SIMB + s[j:]

# o selo nao e SVG: e um bloco de texto girado. A constante fica vazia e some do
# HTML, para nao sobrar simbolo sem uso
i = s.index('const AV_SELO')
j = s.index(chr(10), i)
s = s[:i] + "const AV_SELO = '';" + s[j:]

# ---- o cabecalho: marinho no topo, com o laranja no filete
velho = s[s.index("/* ---------- cabecalho"):s.index("/* ---------- chamada de abertura")]
novo = """/* ---------- cabecalho: papel claro com o filete laranja da marca ---------- */
${s('avtop')}{background:var(--paper);border-bottom:1px solid var(--line);
  box-shadow:inset 0 -6px 0 var(--viva)}
${s('avbar')}{display:flex;align-items:center;gap:18px;padding-block:17px 20px;flex-wrap:wrap}
${s('avmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:800;font-size:clamp(23px,3vw,32px);letter-spacing:-.015em;color:var(--pri);flex:none}
${s('avmarca')} svg{display:block;height:.92em;width:auto;flex:none;align-self:center}
/* ⚠️ o logotipo e imagem, e imagem sem medida derruba o CLS. A altura manda e a
   largura sai da proporcao do arquivo */
${s('avmarca')} img{display:block;height:48px;width:auto;flex:none}
@media(max-width:560px){${s('avmarca')} img{height:37px}}
${s('avfb')} img{display:block;height:42px;width:auto}
${s('avnav')}{display:flex;gap:16px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('avnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.04em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('avnav')} a:hover{color:var(--tinta)}
${s('avbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--pri);color:#fff;padding:10px 17px;border-radius:${canto};flex:none;
  margin-left:8px}
${s('avbusca')}:hover{background:var(--tinta)}
${s('avham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('avham')} i,${s('avham')} i::before,${s('avham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--pri);content:""}
${s('avham')} i{top:21px}
${s('avham')} i::before{top:-6px;left:0}
${s('avham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('avmarca')}{font-size:21px;gap:8px}
  ${s('avbar')}{gap:11px}
  ${s('avbusca')}{font-size:10.5px;padding:9px 13px;gap:6px}
}
@media(max-width:1100px){
  ${s('avham')}{display:block;order:2}
  ${s('avbusca')}{order:3;margin-left:0}
  ${s('avnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('avnav')}[data-aberto="1"]{display:flex}
  ${s('avnav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink);
    font-size:13.5px}
}

"""
s = s.replace(velho, novo, 1)

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AV: simbolo do mascote e cabecalho com filete laranja')
