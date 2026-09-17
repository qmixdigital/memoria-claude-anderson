# -*- coding: utf-8 -*-
"""Reescreve o CSS da secao da AV: selo girado e grade de dois cartoes grandes."""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AV.js'
s = io.open(P, encoding='utf-8').read()

velho = s[s.index("/* ---------- a secao"):s.index("/* ---------- artigo ---------- */")]
novo = """/* ---------- a secao: o selo carimbado e a grade de dois ---------- */
${s('avsec')}{padding-block:42px;background:var(--paper)}
${s('avsec')}[data-par="1"]{background:var(--wash)}

${s('avcab')}{display:flex;align-items:center;gap:16px;margin-bottom:26px;flex-wrap:wrap}
/* ⚠️ o selo gira pela ESQUERDA: girado pelo centro ele avanca sobre o texto
   vizinho em tela estreita */
${s('avcab')} h1,${s('avcab')} h2{font-family:var(--fd);font-weight:800;
  font-size:clamp(19px,2.2vw,26px);letter-spacing:-.005em;text-transform:uppercase;
  color:var(--pri);margin:0;line-height:1.1;flex:none;
  background:var(--viva);padding:9px 18px 8px;border-radius:${canto};
  transform:rotate(-1.6deg);transform-origin:left center}
${s('avmais')}{margin-left:auto;font-family:var(--fb);font-size:11.5px;font-weight:700;
  letter-spacing:.09em;text-transform:uppercase;color:var(--tinta);flex:none;
  border-bottom:2px solid var(--viva);padding-bottom:3px}
${s('avmais')}:hover{color:var(--pri)}
${s('avdescr')}{margin:0 0 26px;font-size:15.5px;line-height:1.64;color:var(--dek);
  max-width:72ch;text-align:left}

/* a materia de abertura: foto larga em cima, texto embaixo */
${s('avdest')}{display:block}
${s('avdest')} ${s('avti')}{font-size:clamp(21px,2.6vw,30px);line-height:1.14;margin-top:12px;
  letter-spacing:-.012em}
${s('avkick')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--tinta)}
${s('avti')}{display:block;font-family:var(--fd);font-weight:700;font-size:19px;line-height:1.22;
  color:var(--ink);margin:0;transition:color .2s ease;letter-spacing:-.006em}
${s('avdd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:58ch;text-align:left}
${s('avdt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('avfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('avfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('avfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('avdest')}:hover ${s('avti')}{color:var(--tinta)}
${s('avdest')}:hover ${s('avfoto')} [data-f] img{transform:scale(1.03)}

/* a lista: DOIS cartoes grandes por linha, cada um com filete marinho no topo */
${s('avlista')}{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:34px}
${s('avrow')}{display:block;border-top:4px solid var(--pri);padding-top:16px}
${s('avmini')}{display:block;overflow:hidden;background:var(--ph);margin-bottom:13px;
  border-radius:${canto}}
${s('avmini')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '16/9'};overflow:hidden}
${s('avmini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('avrow')}:hover ${s('avmini')} [data-f] img{transform:scale(1.05)}
${s('avrow')}:hover ${s('avti')}{color:var(--tinta)}
${s('avrow')} ${s('avti')}{font-size:18px;line-height:1.24;margin-top:7px}
${s('avrow')} ${s('avdd')}{display:none}
@media(max-width:700px){
  ${s('avlista')}{grid-template-columns:1fr;gap:26px;margin-top:28px}
}

/* a listagem de editoria e os relacionados usam grade de tres cartoes */
${s('avgrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 28px}
${s('avgrade')} ${s('avti')}{font-size:19px;line-height:1.22;margin-top:11px}
${s('avgrade')} ${s('avdd')}{display:none}
@media(max-width:900px){${s('avgrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('avgrade')}{grid-template-columns:1fr}}

"""
s = s.replace(velho, novo, 1)
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AV: CSS da secao reescrito')
