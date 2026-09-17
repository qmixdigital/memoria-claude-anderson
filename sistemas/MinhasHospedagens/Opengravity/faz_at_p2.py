# -*- coding: utf-8 -*-
"""Reescreve o CSS da secao da AT: cabecalho de manchete e lista numerada."""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AT.js'
s = io.open(P, encoding='utf-8').read()

velho = s[s.index("/* ---------- a secao"):s.index("/* ---------- artigo ---------- */")]
novo = """/* ---------- a secao: manchete larga e lista numerada ---------- */
${s('atsec')}{padding-block:38px;background:var(--paper)}
${s('atsec')}[data-par="1"]{background:var(--wash)}

/* o nome da editoria com a seta da marca e o filete que corre ate a borda */
${s('atcab')}{display:flex;align-items:center;gap:14px;margin-bottom:24px}
${s('atcab')} h1,${s('atcab')} h2{font-family:var(--fd);font-weight:600;
  font-size:clamp(19px,2.2vw,25px);letter-spacing:.06em;text-transform:uppercase;
  color:var(--ink);margin:0;line-height:1.2;flex:none}
${s('atseta')}{display:block;width:30px;height:23px;color:var(--viva);flex:none}
${s('atseta')} svg{display:block;width:100%;height:100%}
/* o filete come o espaco que sobra: e o que da a silhueta de manchete */
${s('atfio')}{flex:1 1 auto;height:3px;background:var(--viva);min-width:24px}
${s('atmais')}{font-family:var(--fd);font-size:12px;font-weight:600;letter-spacing:.1em;
  text-transform:uppercase;color:var(--tinta);flex:none}
${s('atmais')}:hover{text-decoration:underline;text-underline-offset:4px}
${s('atdescr')}{margin:0 0 24px;font-size:15.5px;line-height:1.64;color:var(--dek);
  max-width:72ch;text-align:left}

/* ⚠️ a manchete e horizontal: imagem a ESQUERDA e texto a direita */
${s('atdest')}{display:grid;grid-template-columns:1.15fr 1fr;gap:28px;align-items:center;
  padding-bottom:26px;border-bottom:1px solid var(--line)}
${s('atdest')} ${s('atti')}{font-size:clamp(22px,2.7vw,33px);line-height:1.1;margin-top:11px;
  letter-spacing:-.012em}
${s('atkick')}{display:inline-block;font-family:var(--fd);font-size:11.5px;font-weight:600;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--tinta)}
${s('atti')}{display:block;font-family:var(--fd);font-weight:600;font-size:18px;
  line-height:1.18;color:var(--ink);margin:0;transition:color .2s ease;
  letter-spacing:-.004em}
${s('atdd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.6;color:var(--dek);
  max-width:52ch;text-align:left}
${s('atdt')}{display:block;margin-top:10px;font-family:var(--fb);font-size:12px;color:var(--muted)}
${s('atfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('atfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('atfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('atdest')}:hover ${s('atti')}{color:var(--tinta)}
${s('atdest')}:hover ${s('atfoto')} [data-f] img{transform:scale(1.03)}
@media(max-width:820px){
  ${s('atdest')}{grid-template-columns:1fr;gap:16px;align-items:start}
}

/* a lista numerada: o "24 horas" da marca vira ordem de chegada */
${s('atlista')}{counter-reset:at;display:grid;grid-template-columns:1fr 1fr;gap:0 40px;
  margin-top:6px}
${s('atrow')}{counter-increment:at;display:grid;grid-template-columns:58px minmax(0,1fr);
  gap:14px;align-items:start;padding-block:18px;border-bottom:1px solid var(--line)}
/* ⚠️ o numeral e decoracao: sai de counter em ::before, e nao de texto no HTML,
   para o leitor de tela nao anunciar "zero dois" no meio do titulo */
${s('atrow')}::before{content:counter(at,decimal-leading-zero);font-family:var(--fd);
  font-size:34px;font-weight:600;line-height:.9;color:transparent;
  -webkit-text-stroke:1.5px var(--ph);letter-spacing:-.04em}
@supports not ((-webkit-text-stroke:1px red)){
  ${s('atrow')}::before{color:var(--ph);-webkit-text-stroke:0}
}
${s('atrow')}:hover::before{-webkit-text-stroke-color:var(--viva);color:transparent}
${s('atrow')}:hover ${s('atti')}{color:var(--tinta)}
${s('atrow')} ${s('atti')}{font-size:17px;line-height:1.24}
${s('atrow')} ${s('atkick')}{font-size:10.5px;margin-bottom:5px}
${s('atrow')} ${s('atdd')}{display:none}
@media(max-width:760px){
  ${s('atlista')}{grid-template-columns:1fr;gap:0}
  ${s('atrow')}{grid-template-columns:46px minmax(0,1fr);gap:12px}
  ${s('atrow')}::before{font-size:27px}
}

/* a listagem de editoria e os relacionados usam grade de tres cartoes */
${s('atgrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 28px}
${s('atgrade')} ${s('atdest')}{display:block;padding-bottom:0;border-bottom:0}
${s('atgrade')} ${s('atti')}{font-size:19px;line-height:1.2;margin-top:10px}
${s('atgrade')} ${s('atdd')}{display:none}
@media(max-width:900px){${s('atgrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('atgrade')}{grid-template-columns:1fr}}

"""
s = s.replace(velho, novo, 1)
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AT: CSS da secao reescrito')
