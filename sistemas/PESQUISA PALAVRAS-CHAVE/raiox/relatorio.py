"""Gera o relatório HTML (uma página, tema claro e escuro, JSON embutido) a partir do dados.json."""
from __future__ import annotations

import json
from html import escape

CSS = r"""
:root{
  --bg:#f6f7f9; --surface:#ffffff; --ink:#14212b; --muted:#5b6b78; --line:#dde3e8;
  --accent:#0b6e6e; --accent-soft:#d8eeec; --warm:#c2410c; --warm-soft:#fde8dc; --bar:#0b6e6e; --bar2:#94a3b0;
  --display:"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif;
  --body:"Source Sans 3", "Segoe UI", system-ui, sans-serif;
  --mono:"JetBrains Mono", ui-monospace, "Cascadia Mono", monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#0f161c; --surface:#16212a; --ink:#e6edf2; --muted:#9aacba; --line:#26343f;
  --accent:#4cc2b8; --accent-soft:#163a39; --warm:#fb8a4f; --warm-soft:#3a2216; --bar:#4cc2b8; --bar2:#5a6b78; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#0f161c; --surface:#16212a; --ink:#e6edf2; --muted:#9aacba; --line:#26343f;
  --accent:#4cc2b8; --accent-soft:#163a39; --warm:#fb8a4f; --warm-soft:#3a2216; --bar:#4cc2b8; --bar2:#5a6b78; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.55;margin:0}
.wrap{max-width:1060px;margin:0 auto;padding-left:max(16px, env(safe-area-inset-left, 0px));padding-right:max(16px, env(safe-area-inset-right, 0px));padding-block:32px 64px;display:grid;grid-template-columns:minmax(0,1fr);gap:40px}
.wrap>*{min-width:0}
h1,h2,h3{font-family:var(--display);text-wrap:balance;margin:0;line-height:1.15}
h1{font-size:clamp(28px,4.4vw,44px);font-weight:700;letter-spacing:-.01em}
h2{font-size:clamp(21px,2.6vw,27px);font-weight:700}
h3{font-size:17px;font-weight:700}
p{margin:0;max-width:68ch}
.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.muted{color:var(--muted)}
header{display:grid;gap:14px;padding-bottom:8px;border-bottom:1px solid var(--line)}
header .meta{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:14px;color:var(--muted)}
.topbar{display:flex;justify-content:space-between;align-items:center;gap:12px}
.theme{font:600 13px var(--body);border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:6px 12px;border-radius:999px;cursor:pointer}
section{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
section[hidden]{display:none}
section>*{min-width:0}
.sec-head{display:grid;gap:6px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px 16px;display:grid;gap:2px;min-width:0}
.tile b{font-family:var(--mono);font-size:24px;font-weight:600;font-variant-numeric:tabular-nums}
.tile span{font-size:13px;color:var(--muted)}
.tabs{display:flex;gap:6px;flex-wrap:wrap}
.tabs button{font:600 14px var(--body);border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:7px 14px;border-radius:999px;cursor:pointer}
.tabs button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--surface)}
.tabs button:focus-visible,summary:focus-visible,.theme:focus-visible{outline:2px solid var(--warm);outline-offset:2px}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:16px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:16px;display:grid;gap:10px;min-width:0;align-content:start}
.scroll{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:14px}
th{font-weight:600;text-align:left;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--line);padding:6px 8px}
td{padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
td.n,th.n{text-align:right;font-family:var(--mono);font-variant-numeric:tabular-nums;white-space:nowrap}
tr:last-child td{border-bottom:0}
.bars{display:grid;gap:7px}
.bar{display:grid;grid-template-columns:minmax(120px,190px) 1fr auto;gap:10px;align-items:center;font-size:14px}
.bar .lbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar .trk{height:10px;background:var(--line);border-radius:5px;overflow:hidden}
.bar .fill{height:100%;background:var(--bar);border-radius:5px}
.bar .fill.alt{background:var(--warm)}
.bar .val{font-family:var(--mono);font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{font-size:12.5px;padding:2px 8px;border-radius:999px;background:var(--accent-soft);color:var(--ink);border:1px solid transparent}
.chip.w{background:var(--warm-soft)}
.chip.o{background:transparent;border-color:var(--line);color:var(--muted)}
.heat td.h{text-align:center;font-family:var(--mono);font-size:13px}
details{background:var(--surface);border:1px solid var(--line);border-radius:10px}
details+details{margin-top:8px}
summary{cursor:pointer;padding:12px 16px;font-weight:600;list-style:none;display:flex;gap:10px;align-items:baseline;justify-content:space-between}
summary::-webkit-details-marker{display:none}
summary .tag{font:400 12px var(--mono);color:var(--muted);white-space:nowrap}
.resp{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:10px;padding:0 16px 16px}
.resp .pl{border-top:3px solid var(--accent);background:var(--bg);border-radius:8px;padding:10px 12px;display:grid;gap:6px;min-width:0;align-content:start}
.resp .pl h4{margin:0;font:700 14px var(--body)}
.resp .pl p{font-size:13px;color:var(--muted)}
.lab{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.callout{border-left:4px solid var(--warm);background:var(--surface);border-radius:0 10px 10px 0;padding:14px 16px;display:grid;gap:6px}
ol.plays{margin:0;padding-left:22px;display:grid;gap:10px}
ol.plays li{max-width:75ch}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;font-size:14px}
.pair div{min-width:0}
@media (max-width:560px){.bar{grid-template-columns:110px 1fr auto}.pair{grid-template-columns:1fr}}
footer{font-size:13px;color:var(--muted);border-top:1px solid var(--line);padding-top:16px;display:grid;gap:6px}
code{font-family:var(--mono);font-size:12.5px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
@media print{.theme{display:none}details{break-inside:avoid}}
"""

JS = r"""
const D = JSON.parse(document.getElementById('dados').textContent);
const T = D.temas;
const K = Object.keys(T);
const nf = n => (n==null?'–':Number(n).toLocaleString('pt-BR'));
const usd = n => (n==null?'–':'US$ '+Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}));
const esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const INT = {commercial:'comercial (comparar)', informational:'informativa', navigational:'navegacional (marca)', transactional:'transacional (comprar)', 'sem dado':'sem dado'};
const ORDEM_PL = ['ChatGPT (app)','ChatGPT','Gemini (app)','Gemini','Claude','Perplexity'];
const PL = ORDEM_PL.filter(p => Object.values(D.respostas||{}).some(v => v[p]));
const vazio = o => !o || (Array.isArray(o) ? o.length===0 : Object.keys(o).length===0);
const $ = id => document.getElementById(id);
const hide = id => { const s=$(id); if(s) s.hidden=true; };

function bars(el, rows, max, alt){
  if(!el) return;
  const m = max || Math.max(1, ...rows.map(r=>r[1]));
  el.innerHTML = rows.length ? rows.map(([l,v,s])=>`<div class="bar"><span class="lbl" title="${esc(l)}">${esc(l)}</span><span class="trk"><span class="fill${alt?' alt':''}" style="width:${(100*v/m).toFixed(1)}%"></span></span><span class="val">${s??nf(v)}</span></div>`).join('') : '<p class="muted">sem dado</p>';
}
function tabs(el, onPick){
  let cur=K[0];
  const draw=()=>{el.innerHTML=K.map(k=>`<button type="button" aria-pressed="${k===cur}" data-k="${k}">${esc(T[k])}</button>`).join('');};
  el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cur=b.dataset.k;draw();onPick(cur);});
  draw(); onPick(cur);
}

/* tema claro/escuro */
(function(){
  const btn=$('theme'); const root=document.documentElement;
  let pref=null; try{pref=localStorage.getItem('raiox-tema');}catch(e){}
  if(pref) root.dataset.theme=pref;
  const lbl=()=>{btn.textContent = (root.dataset.theme==='dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches)) ? 'Tema claro' : 'Tema escuro';};
  btn.addEventListener('click',()=>{const dark = root.dataset.theme==='dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); root.dataset.theme = dark?'light':'dark'; try{localStorage.setItem('raiox-tema',root.dataset.theme);}catch(e){} lbl();});
  lbl();
})();

/* cabeçalho e números */
const respTot = Object.values(D.respostas||{}).reduce((a,v)=>a+Object.keys(v).length,0);
$('meta').innerHTML = [
  `Coletado em ${D.dia.split('-').reverse().join('/')}`, `${nf(D.pedidos)} consultas à API`, `Custo dos dados: ${usd(D.gasto_usd)}`,
  `${D.pais.nome}, ${D.pais.idioma}${D.chatgpt_en_perguntas && Object.keys(D.chatgpt_en_perguntas).length ? ' (exceto a seção 6)' : ''}`].map(x=>`<span>${esc(x)}</span>`).join('');
const PS = K.map(k=>D.palavras[k]).filter(Boolean);
const serpN = Object.keys(D.serp||{}).length;
const tiles = [];
if(PS.length){
  tiles.push([nf(PS.reduce((a,p)=>a+p.n,0)),'palavras-chave com volume']);
  tiles.push([nf(PS.reduce((a,p)=>a+p.volume_total,0)),'buscas por mês, somadas']);
  const cpcs = PS.flatMap(p=>p.cpc_mais_alto.map(x=>x.cpc)).filter(x=>x!=null);
  if(cpcs.length) tiles.push([usd(Math.max(...cpcs)),'clique mais caro encontrado']);
}
if(serpN) tiles.push([`${Object.values(D.serp).filter(s=>s.tem_aio).length} de ${serpN}`,'buscas com resumo de IA no Google']);
if(respTot) tiles.push([nf(respTot),'respostas de IA analisadas']);
tiles.push([usd(D.gasto_usd),'custo de todos os dados']);
$('tiles').innerHTML = tiles.map(([b,s])=>`<div class="tile"><b>${b}</b><span>${s}</span></div>`).join('');

/* 1 demanda */
if(!PS.length){ hide('sec1'); hide('sec2'); } else {
tabs($('tabs1'), k=>{
  const P=D.palavras[k];
  $('tTop').innerHTML = '<tr><th>Busca</th><th class="n">Por mês</th><th class="n">CPC</th><th class="n">Dific.</th><th class="n">Tend. ano</th></tr>'+
    P.top.slice(0,15).map(x=>`<tr><td>${esc(x.kw)}</td><td class="n">${nf(x.vol)}</td><td class="n">${x.cpc!=null?x.cpc.toFixed(2):'–'}</td><td class="n">${x.kd??'–'}</td><td class="n">${x.tend_ano==null?'–':(x.tend_ano>0?'+':'')+x.tend_ano+'%'}</td></tr>`).join('');
  $('tPerg').innerHTML = '<tr><th>Pergunta</th><th class="n">Por mês</th></tr>'+
    (P.perguntas.slice(0,8).map(x=>`<tr><td>${esc(x.kw)}</td><td class="n">${nf(x.vol)}</td></tr>`).join('') || '<tr><td colspan="2" class="muted">nenhuma pergunta com volume</td></tr>')+
    `<tr><td class="muted" colspan="2">${nf(P.n_perguntas)} perguntas no total</td></tr>`;
  $('tOpp').innerHTML = '<tr><th>Busca</th><th class="n">Por mês</th><th class="n">Dific.</th></tr>'+
    (P.oportunidades.slice(0,8).map(x=>`<tr><td>${esc(x.kw)}</td><td class="n">${nf(x.vol)}</td><td class="n">${x.kd}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">nenhuma com 1.000+ e dificuldade até 20</td></tr>')+
    `<tr><td class="muted" colspan="3">${nf(P.n_oportunidades)} buscas com 1.000+ por mês e dificuldade até 20</td></tr>`;
  bars($('bCpc'), P.cpc_mais_alto.slice(0,8).map(x=>[x.kw,x.cpc,usd(x.cpc)]), null, true);
  const it=Object.entries(P.intencao); const tot=it.reduce((a,[,v])=>a+v,0)||1;
  bars($('bInt'), it.map(([k2,v])=>[INT[k2]||k2,v,Math.round(100*v/tot)+'%']), tot);
  $('intNote').textContent = `Das ${nf(P.n)} buscas de ${T[k].toLowerCase()}, ${Math.round(100*(P.intencao.commercial||0)/tot)}% são de quem está comparando antes de contratar. CPC médio ponderado: ${usd(P.cpc_medio)}.`;
});

/* 2 busca em IA */
if(!PS.some(p=>p.vol_ia_total)){ hide('sec2'); } else {
$('iaNota').textContent = `Índice de "volume em IA" das ${nf(D.config.n_ia)} principais palavras de cada tema. Ele vem principalmente das perguntas do tipo "As pessoas também perguntam" e serve para comparar temas, não como contagem exata de conversas.`;
$('iaCards').innerHTML = K.map(k=>{
  const P=D.palavras[k]; const pct=(100*P.vol_ia_total/Math.max(1,P.vol_google_com_ia)).toFixed(1);
  return `<div class="card"><h3>${esc(T[k])}</h3><p><b style="font-family:var(--mono)">${nf(P.vol_ia_total)}</b> no índice de IA, contra ${nf(P.vol_google_com_ia)} buscas no Google para as mesmas palavras: <b>${pct}%</b>.</p><div class="bars" id="ia_${k}"></div></div>`;
}).join('');
K.forEach(k=>{
  const seen=new Set(); const rows=[];
  for(const x of D.palavras[k].top_ia){ if(rows.length>=7) break; if(seen.has(x.vol_ia)) continue; seen.add(x.vol_ia); rows.push([x.kw,x.vol_ia]); }
  bars($('ia_'+k), rows);
});
}}

/* 3 AI Overview (base pronta) */
if(vazio(D.aio_dominios)){ hide('sec3'); } else {
$('aioNota').textContent = `Base de respostas do resumo de IA do Google (${D.pais.nome}, ${D.pais.idioma}): domínios mais usados como fonte quando a pergunta contém o tema.`;
$('aioCards').innerHTML = Object.keys(D.aio_dominios).map((a,i)=>`<div class="card"><h3>Perguntas com “${esc(a)}”</h3><div class="bars" id="aio_${i}"></div></div>`).join('');
Object.values(D.aio_dominios).forEach((L,i)=>bars($('aio_'+i), L.slice(0,10).map(x=>[x.dominio,x.mencoes]), null));
if(!vazio(D.aio_perguntas)){
  $('aioPerg').innerHTML = Object.entries(D.aio_perguntas).map(([a,L])=>`<div class="card"><h3>Perguntas reais com “${esc(a)}”</h3><div class="scroll"><table><tr><th>Pergunta</th><th class="n">Vol. IA</th><th>Fontes</th></tr>${L.slice(0,10).map(x=>`<tr><td>${esc(x.pergunta)}</td><td class="n">${nf(x.volume_ia)}</td><td class="muted">${[...new Set(x.fontes)].slice(0,3).map(esc).join(', ')||'–'}</td></tr>`).join('')}</table></div></div>`).join('');
}
$('aioNote').innerHTML = D.notas.aio ? `<h3>O que chama atenção</h3><p>${esc(D.notas.aio)}</p>` : '';
}

/* 4 respostas */
const perg = Object.keys(D.respostas||{});
if(!perg.length){ hide('sec4'); } else {
$('respTitulo').textContent = `O que ${PL.map(p=>p.replace(' (app)','')).join(', ').replace(/, ([^,]*)$/, ' e $1')} respondem`;
$('respIntro').textContent = `${perg.length} perguntas de quem quer contratar, feitas em ${D.pais.idioma} a cada IA, com busca na web ligada e país ${D.pais.nome}. Total de ${nf(respTot)} respostas. Cada resposta muda de uma vez para outra: isto é uma fotografia do dia.`;
function heat(k){
  const marcas = (D.marcas[k]||[]).slice(0,10).map(x=>x[0]);
  const mp = D.marcas_por_plataforma[k]||{};
  const val=(pl,m)=>((mp[pl]||[]).find(x=>x[0]===m)||[0,0])[1];
  const max=Math.max(1,...marcas.flatMap(m=>PL.map(pl=>val(pl,m))));
  $('tHeat').innerHTML = marcas.length ? `<tr><th>Marca</th>${PL.map(p=>`<th class="n">${esc(p.replace(' (app)',''))}</th>`).join('')}</tr>`+
    marcas.map(m=>`<tr><td>${esc(m)}</td>${PL.map(pl=>{const v=val(pl,m);return `<td class="h" style="background:color-mix(in srgb, var(--accent) ${Math.round(60*v/max)}%, transparent)">${v||'·'}</td>`;}).join('')}</tr>`).join('')
    : '<tr><td class="muted">nenhuma marca identificada. Informe marcas com --marcas para contar por nome.</td></tr>';
  bars($('bFontes'), (D.fontes_ia[k]||[]).slice(0,12), null);
  $('perguntas').innerHTML = `<h3 style="margin:8px 0">Resposta por resposta</h3>`+perg.filter(p=>(D.pergunta_tema[p]||K[0])===k).map(p=>{
    const v=D.respostas[p]; const nm=new Set(PL.flatMap(pl=>(v[pl]||{}).marcas||[]));
    return `<details><summary><span>${esc(p)}</span><span class="tag">${Object.keys(v).length} IAs · ${nm.size} marcas</span></summary><div class="resp">${PL.filter(pl=>v[pl]).map(pl=>{const r=v[pl];
      return `<div class="pl"><h4>${esc(pl)}${r.modelo?` <span class="tag">${esc(r.modelo)}</span>`:''}</h4><div class="lab">Marcas</div><div class="chips">${r.marcas.length?r.marcas.map(m=>`<span class="chip">${esc(m)}</span>`).join(''):'<span class="chip o">nenhuma</span>'}</div><div class="lab">Fontes</div><div class="chips">${r.fontes.length?r.fontes.slice(0,6).map(f=>`<span class="chip w">${esc(f)}</span>`).join(''):'<span class="chip o">sem fonte</span>'}</div><p>${esc(r.trecho)}…</p></div>`;}).join('')}</div></details>`;
  }).join('') || '<p class="muted">sem perguntas neste tema</p>';
}
tabs($('tabs2'), heat);
$('fonteNote').innerHTML = D.notas.fontes ? `<h3>O que chama atenção</h3><p>${esc(D.notas.fontes)}</p>` : '';
}

/* 5 SERP x AIO */
if(!serpN){ hide('sec5'); } else {
$('serpNota').textContent = `Para ${serpN} buscas, o top 10 orgânico ao lado das fontes do resumo de IA da mesma página.` + (vazio(D.modo_ia)?'':` E, para ${Object.keys(D.modo_ia).length} delas, as fontes do Modo IA.`);
const serpRows = Object.entries(D.serp).map(([q,s])=>{
  const org=new Set(s.organicos.slice(0,10)); const ao=[...new Set(s.aio_fontes)];
  const dentro=ao.filter(d=>org.has(d)).length;
  return {q,s,ao,dentro};
});
$('tSerp').innerHTML = '<tr><th>Busca</th><th>Top 5 orgânico</th><th>Fontes do resumo de IA</th><th class="n">Fontes que estão no top 10</th></tr>'+
  serpRows.map(r=>`<tr><td><b>${esc(r.q)}</b></td><td>${r.s.organicos.slice(0,5).map(esc).join('<br>')||'–'}</td><td>${r.ao.slice(0,5).map(esc).join('<br>')||(r.s.tem_aio?'–':'<span class="muted">sem resumo de IA</span>')}</td><td class="n">${r.ao.length?`${r.dentro} de ${r.ao.length}`:'–'}</td></tr>`).join('');
const tAo=serpRows.reduce((a,r)=>a+r.ao.length,0), tIn=serpRows.reduce((a,r)=>a+r.dentro,0);
$('modoCards').innerHTML = (tAo?`<div class="callout" style="grid-column:1/-1"><p>Somando as ${serpN} buscas, <b>${tIn} de ${tAo}</b> sites citados no resumo de IA (${Math.round(100*tIn/Math.max(1,tAo))}%) também estão no top 10 da mesma página.${tIn/Math.max(1,tAo)<0.5?' A IA busca fontes fora da primeira página.':''}</p></div>`:'')+
  Object.entries(D.modo_ia||{}).map(([q,m])=>`<div class="card"><h3>Modo IA: “${esc(q)}”</h3><div class="lab">Marcas na resposta</div><div class="chips">${(m.marcas||[]).map(x=>`<span class="chip">${esc(x)}</span>`).join('')||'<span class="chip o">nenhuma</span>'}</div><div class="lab">Fontes</div><div class="chips">${[...new Set(m.fontes)].slice(0,8).map(x=>`<span class="chip w">${esc(x)}</span>`).join('')||'<span class="chip o">sem fonte</span>'}</div></div>`).join('');
}

/* 6 EUA */
if(vazio(D.chatgpt_en_perguntas)){ hide('sec6'); } else {
$('enCards').innerHTML = Object.entries(D.chatgpt_en_perguntas).map(([a,L])=>`<div class="card"><h3>ChatGPT nos EUA: “${esc(a)}”</h3><div class="scroll"><table><tr><th>Pergunta real</th><th class="n">Vol. IA</th></tr>${L.slice(0,8).map(x=>`<tr><td>${esc(x.pergunta)}</td><td class="n">${nf(x.volume_ia)}</td></tr>`).join('')}</table></div><div class="lab">Sites que o ChatGPT mais cita</div><div class="chips">${(D.chatgpt_en_dominios[a]||[]).slice(0,8).map(x=>`<span class="chip w">${esc(x.dominio)}</span>`).join('')||'<span class="chip o">sem dado</span>'}</div></div>`).join('');
if(vazio(D.pares)){ $('paresCard').hidden=true; } else {
  $('pairs').innerHTML = '<div class="lab">Pergunta real nos EUA</div><div class="lab">Nossa versão</div>'+D.pares.map(([a,b])=>`<div class="muted">${esc(a)}</div><div>${esc(b)}</div>`).join('');
}}

/* 7 como usar */
if(vazio(D.licoes)){ hide('sec7'); } else { $('plays').innerHTML = D.licoes.map(p=>`<li>${p}</li>`).join(''); }

/* rodapé */
$('foot').innerHTML = `<p><b>Como foi feito.</b> ${esc(D.metodo)}</p><p>Volumes e CPC são estimativas da ferramenta. CPC em dólar. ${nf(D.pedidos)} consultas, ${usd(D.gasto_usd)} no total.${D.erros&&D.erros.length?' Falhas registradas: '+esc(D.erros.join(' | ')):''}</p>`;
"""

HTML = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>__TITULO__</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Source+Sans+3:<<REMOVIDO>>;600;700&family=JetBrains+Mono:<<REMOVIDO>>;600&display=swap">
<style>__CSS__</style>
</head>
<body>
<div class="wrap">
<header>
  <div class="topbar"><div class="eyebrow">Raio-X de mercado · __PAIS__ · __DATA__</div><button class="theme" id="theme" type="button">Tema escuro</button></div>
  <h1>__H1__</h1>
  <p class="muted">__INTRO__</p>
  <div class="meta" id="meta"></div>
</header>

<section><div class="tiles" id="tiles"></div></section>

<section id="sec1">
  <div class="sec-head"><div class="eyebrow">1 · Demanda</div><h2>O que as pessoas buscam no Google</h2>
  <p class="muted">Volume mensal em __PAIS__, custo do clique em anúncios (CPC, em dólar), dificuldade de ranquear (0 a 100), tendência anual e intenção de busca.</p></div>
  <div class="tabs" role="group" aria-label="Tema" id="tabs1"></div>
  <div class="grid2">
    <div class="card"><h3>As 15 buscas com mais volume</h3><div class="scroll"><table id="tTop"></table></div></div>
    <div class="card"><h3>Perguntas que as pessoas fazem</h3><div class="scroll"><table id="tPerg"></table></div>
      <h3>Boa busca, pouca concorrência <span class="muted" style="font-weight:400">(dificuldade até 20)</span></h3><div class="scroll"><table id="tOpp"></table></div></div>
  </div>
  <div class="grid2">
    <div class="card"><h3>Onde o clique vale mais</h3><p class="muted" style="font-size:14px">CPC alto quer dizer anunciante disputando: é a parte do tema que mais vale dinheiro.</p><div class="bars" id="bCpc"></div></div>
    <div class="card"><h3>Intenção das buscas</h3><div class="bars" id="bInt"></div><p class="muted" style="font-size:14px" id="intNote"></p></div>
  </div>
</section>

<section id="sec2">
  <div class="sec-head"><div class="eyebrow">2 · Busca em IA</div><h2>Quanto desse assunto já é perguntado às IAs</h2><p class="muted" id="iaNota"></p></div>
  <div class="grid2" id="iaCards"></div>
</section>

<section id="sec3">
  <div class="sec-head"><div class="eyebrow">3 · Resumo de IA do Google</div><h2>Quem o Google cita no resumo de IA</h2><p class="muted" id="aioNota"></p></div>
  <div class="grid2" id="aioCards"></div>
  <div class="grid2" id="aioPerg"></div>
  <div class="callout" id="aioNote"></div>
</section>

<section id="sec4">
  <div class="sec-head"><div class="eyebrow">4 · Respostas das IAs</div><h2 id="respTitulo">O que as IAs respondem</h2><p class="muted" id="respIntro"></p></div>
  <div class="tabs" role="group" aria-label="Tema" id="tabs2"></div>
  <div class="grid2">
    <div class="card"><h3>Marcas citadas por cada IA</h3><p class="muted" style="font-size:14px">Em quantas respostas a marca aparece (soma das perguntas do tema).</p><div class="scroll"><table class="heat" id="tHeat"></table></div></div>
    <div class="card"><h3>Sites usados como fonte</h3><p class="muted" style="font-size:14px">Em quantas respostas o site aparece como fonte citada, somando as IAs.</p><div class="bars" id="bFontes"></div></div>
  </div>
  <div class="callout" id="fonteNote"></div>
  <div id="perguntas"></div>
</section>

<section id="sec5">
  <div class="sec-head"><div class="eyebrow">5 · Google por dentro</div><h2>Ranquear no Google não garante citação no resumo de IA</h2><p class="muted" id="serpNota"></p></div>
  <div class="scroll card"><table id="tSerp"></table></div>
  <div class="grid2" id="modoCards"></div>
</section>

<section id="sec6">
  <div class="sec-head"><div class="eyebrow">6 · Referência dos EUA</div><h2>O que se pergunta ao ChatGPT em inglês, e o que isso ensina</h2>
  <p class="muted">A base pronta de conversas do ChatGPT existe só para os EUA, em inglês. Ela mostra o formato das perguntas reais: preço por mês, qual evitar, o mais barato na cidade, cobre tal coisa.</p></div>
  <div class="grid2" id="enCards"></div>
  <div class="card" id="paresCard"><h3>Do inglês para o nosso idioma</h3><div class="pair" id="pairs"></div></div>
</section>

<section id="sec7">
  <div class="sec-head"><div class="eyebrow">7 · Como usar</div><h2>O que os dados dizem sobre aparecer nas respostas de IA</h2></div>
  <ol class="plays" id="plays"></ol>
</section>

<footer id="foot"></footer>
</div>
<script id="dados" type="application/json">__DADOS__</script>
<script>__JS__</script>
</body>
</html>
"""


def _h1(temas: dict[str, str]) -> str:
    nomes = list(temas.values())
    if len(nomes) == 1:
        lista = nomes[0]
    else:
        lista = ", ".join(nomes[:-1]) + " e " + nomes[-1].lower()
    return f"{lista}: o que se busca no Google e quem as IAs citam"


def _intro(d: dict) -> str:
    partes = ["palavras-chave e preço do clique"]
    if d.get("palavras") and any(p.get("vol_ia_total") for p in d["palavras"].values()):
        partes.append("índice de busca em IA")
    if d.get("serp"):
        partes.append("resultado do Google com o resumo de IA" + (" e o Modo IA" if d.get("modo_ia") else ""))
    if d.get("respostas"):
        pls = sorted({p.replace(" (app)", "") for v in d["respostas"].values() for p in v})
        partes.append("as respostas reais de " + ", ".join(pls))
    return "Tudo neste relatório veio da API da DataForSEO, consultada em poucas horas: " + "; ".join(partes) + "."


def gerar_html(d: dict) -> str:
    titulo = d.get("titulo") or ("Raio-X " + " e ".join(d["temas"].values()))
    dados = json.dumps(d, ensure_ascii=False).replace("</", "<\\/")
    dia = d.get("dia", "")
    data_br = "/".join(reversed(dia.split("-"))) if dia else ""
    html = (HTML
            .replace("__TITULO__", escape(titulo))
            .replace("__CSS__", CSS)
            .replace("__JS__", JS)
            .replace("__PAIS__", escape(d["pais"]["nome"]))
            .replace("__DATA__", escape(data_br))
            .replace("__H1__", escape(_h1(d["temas"])))
            .replace("__INTRO__", escape(_intro(d)))
            .replace("__DADOS__", dados))
    return html
