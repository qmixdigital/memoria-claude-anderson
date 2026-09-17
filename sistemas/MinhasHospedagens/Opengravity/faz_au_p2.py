# -*- coding: utf-8 -*-
"""Reescreve o CSS da secao da AU: anel de editoria e miniatura circular."""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AU.js'
s = io.open(P, encoding='utf-8').read()

velho = s[s.index("/* ---------- a secao"):s.index("/* ---------- artigo ---------- */")]
novo = """/* ---------- a secao: o anel da marca abre, a lista vem em circulos ---------- */
${s('ausec')}{padding-block:40px;background:var(--paper)}
${s('ausec')}[data-par="1"]{background:var(--wash)}

${s('aucab')}{display:flex;align-items:center;gap:13px;margin-bottom:26px;flex-wrap:wrap}
${s('auanel')}{display:block;width:34px;height:34px;color:var(--viva);flex:none}
${s('auanel')} svg{display:block;width:100%;height:100%}
${s('aucab')} h1,${s('aucab')} h2{font-family:var(--fd);font-weight:700;
  font-size:clamp(21px,2.4vw,28px);letter-spacing:-.018em;color:var(--ink);margin:0;
  line-height:1.18;flex:none}
${s('aumais')}{margin-left:auto;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:var(--tinta);flex:none;
  background:var(--viva);padding:7px 14px;border-radius:999px}
${s('aumais')}:hover{filter:brightness(.94)}
${s('audescr')}{margin:0 0 24px;font-size:15.5px;line-height:1.64;color:var(--dek);
  max-width:72ch;text-align:left}

/* a materia de abertura: foto larga em cima, texto embaixo */
${s('audest')}{display:block;padding-bottom:28px;border-bottom:1px solid var(--line)}
${s('audest')} ${s('auti')}{font-size:clamp(22px,2.7vw,32px);line-height:1.12;margin-top:13px;
  letter-spacing:-.014em}
${s('aukick')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.13em'};text-transform:uppercase;color:var(--tinta)}
${s('auti')}{display:block;font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.2;
  color:var(--ink);margin:0;transition:color .2s ease;letter-spacing:-.008em}
${s('audd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:60ch;text-align:left}
${s('audt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('aufoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('aufoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('aufoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('audest')}:hover ${s('auti')}{color:var(--tinta)}
${s('audest')}:hover ${s('aufoto')} [data-f] img{transform:scale(1.03)}

/* a lista: duas colunas, miniatura REDONDA com anel limao */
${s('aulista')}{display:grid;grid-template-columns:1fr 1fr;gap:0 40px;margin-top:8px}
${s('aurow')}{display:grid;grid-template-columns:88px minmax(0,1fr);gap:16px;align-items:center;
  padding-block:18px;border-bottom:1px solid var(--line)}
${s('aumini')}{display:block;width:88px;height:88px;overflow:hidden;background:var(--ph);
  border-radius:50%;box-shadow:0 0 0 3px var(--viva);flex:none}
${s('aumini')} [data-f]{display:block;aspect-ratio:1/1;overflow:hidden;border-radius:50%}
${s('aumini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('aurow')}:hover ${s('aumini')} [data-f] img{transform:scale(1.08)}
${s('aurow')}:hover ${s('auti')}{color:var(--tinta)}
${s('aurow')} ${s('auti')}{font-size:16.5px;line-height:1.26;margin-top:5px}
${s('aurow')} ${s('audd')}{display:none}
@media(max-width:760px){
  ${s('aulista')}{grid-template-columns:1fr;gap:0}
  ${s('aurow')}{grid-template-columns:72px minmax(0,1fr);gap:14px}
  ${s('aumini')}{width:72px;height:72px}
}

/* a listagem de editoria e os relacionados usam grade de tres cartoes */
${s('augrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 28px}
${s('augrade')} ${s('audest')}{padding-bottom:0;border-bottom:0}
${s('augrade')} ${s('auti')}{font-size:19px;line-height:1.22;margin-top:11px}
${s('augrade')} ${s('audd')}{display:none}
@media(max-width:900px){${s('augrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('augrade')}{grid-template-columns:1fr}}

"""
s = s.replace(velho, novo, 1)
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AU: CSS da secao reescrito')
