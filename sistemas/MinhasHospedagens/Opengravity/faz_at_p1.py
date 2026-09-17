# -*- coding: utf-8 -*-
"""Reescreve o CSS do cabecalho e da secao da AT, que nasceu como copia da AS.

A marca do Folha R e a palavra FOLHA em grotesco pesado com extrusao, e um **R
atravessado por uma seta que sobe**. O favicon da origem e so esse R, branco
sobre preto.

Dois gestos saem dai:

  - 🔴 **o cabecalho e o rodape sao chumbo**, e a marca neles e a branca. Nao e
    escolha estetica: a versao "preta" da origem tem a palavra preta mas **o R
    continua branco**, e sobre papel branco o simbolo some. Nenhuma outra
    arquitetura da maquina tem barra escura
  - **a lista de cada secao vem numerada**, com o numeral grande em contorno
    prata a esquerda do titulo. E o "24 horas" da assinatura da marca: ordem de
    chegada

⚠️ O numeral e decoracao: entra por `::before` com `counter`, para nao virar
texto que leitor de tela anuncia no meio do titulo.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AT.js'
s = io.open(P, encoding='utf-8').read()

# ---- o simbolo do cabecalho: a seta que sobe, do R da marca
i = s.index('const AT_SIMB')
j = s.index(chr(10), i)
SIMB = ('const AT_SIMB = `<svg viewBox="0 0 30 24" role="img" aria-hidden="true" '
        'focusable="false" fill="none" stroke="var(--marca-1,currentColor)" '
        'stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M3 19 C10 19 19 14 26 5"/><path d="M19 4.5 L26.5 4 L26 11.5"/>'
        '</svg>`;')
s = s[:i] + SIMB + s[j:]

# o mesmo desenho, maior, para o rotulo de secao
i = s.index('const AT_SETA')
j = s.index(chr(10), i)
SETA = ('const AT_SETA = `<svg viewBox="0 0 40 30" aria-hidden="true" focusable="false" '
        'fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" '
        'stroke-linejoin="round">'
        '<path d="M4 25 C13 25 25 18 34 5"/><path d="M25 3.5 L35 3 L34.5 13"/>'
        '</svg>`;')
s = s[:i] + SETA + s[j:]

# ---- o cabecalho: barra chumbo
velho = s[s.index("/* ---------- cabecalho ---------- */"):
          s.index("/* ---------- chamada de abertura")]
novo = """/* ---------- cabecalho: barra chumbo, que e onde a marca da origem vive ---------- */
/* 🔴 a marca do portal e branca com o R branco: sobre papel ela some. A barra
   escura nao e enfeite, e o que deixa o simbolo aparecer */
${s('attop')}{background:var(--barbg);color:var(--bartx);
  border-bottom:4px solid var(--viva)}
${s('atbar')}{display:flex;align-items:center;gap:18px;padding-block:16px;flex-wrap:wrap}
${s('atmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:600;font-size:clamp(23px,3vw,31px);letter-spacing:.02em;
  text-transform:uppercase;color:var(--bartx);flex:none}
${s('atmarca')} svg{display:block;height:.7em;width:auto;flex:none;align-self:center}
/* ⚠️ o logotipo e imagem, e imagem sem medida derruba o CLS. A altura manda e a
   largura sai da proporcao do arquivo */
${s('atmarca')} img{display:block;height:40px;width:auto;flex:none}
@media(max-width:560px){${s('atmarca')} img{height:32px}}
${s('atfb')} img{display:block;height:36px;width:auto}
${s('atnav')}{display:flex;gap:16px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('atnav')} a{font-family:var(--fd);font-size:13.5px;font-weight:500;letter-spacing:.06em;
  text-transform:uppercase;color:var(--bartx);opacity:.82;transition:opacity .2s ease}
${s('atnav')} a:hover{opacity:1;text-decoration:underline;text-underline-offset:5px;
  text-decoration-color:var(--viva);text-decoration-thickness:2px}
${s('atbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fd);
  font-size:12.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  background:var(--viva);color:#fff;padding:10px 16px;border-radius:${canto};flex:none;
  margin-left:8px}
${s('atbusca')}:hover{filter:brightness(1.08)}
${s('atham')}{display:none;width:46px;height:46px;border:2px solid rgba(255,255,255,.5);
  background:none;cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('atham')} i,${s('atham')} i::before,${s('atham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--bartx);content:""}
${s('atham')} i{top:21px}
${s('atham')} i::before{top:-6px;left:0}
${s('atham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('atmarca')}{font-size:21px;gap:8px}
  ${s('atbar')}{gap:11px}
  ${s('atbusca')}{font-size:11px;padding:9px 12px;gap:6px}
}
@media(max-width:1100px){
  ${s('atham')}{display:block;order:2}
  ${s('atbusca')}{order:3;margin-left:0}
  ${s('atnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid rgba(255,255,255,.18);margin-top:14px}
  ${s('atnav')}[data-aberto="1"]{display:flex}
  ${s('atnav')} a{width:100%;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.14);
    opacity:1;font-size:14.5px}
}

"""
s = s.replace(velho, novo, 1)

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AT: simbolo da seta e cabecalho chumbo')
