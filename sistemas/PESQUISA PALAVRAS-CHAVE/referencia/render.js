
const D = JSON.parse(document.getElementById('dados').textContent);
const T = {seguro:'Seguro auto', saude:'Plano de saúde'};
const nf = n => (n==null?'–':Number(n).toLocaleString('pt-BR'));
const usd = n => (n==null?'–':'US$ '+Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}));
const esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const INT = {commercial:'comercial (comparar)', informational:'informativa', navigational:'navegacional (marca)', transactional:'transacional (comprar)', 'sem dado':'sem dado'};
const PL = ['ChatGPT (app)','Gemini (app)','Claude','Perplexity'];
const temaDe = p => /plano|saúde|saude|operadora|mounjaro|ozempic|diabetes|corretor/i.test(p) ? 'saude' : 'seguro';

function bars(el, rows, max, alt){
  const m = max || Math.max(1, ...rows.map(r=>r[1]));
  el.innerHTML = rows.map(([l,v,s])=>`<div class="bar"><span class="lbl" title="${esc(l)}">${esc(l)}</span><span class="trk"><span class="fill${alt?' alt':''}" style="width:${(100*v/m).toFixed(1)}%"></span></span><span class="val">${s??nf(v)}</span></div>`).join('');
}
function tabs(el, onPick){
  let cur='seguro';
  const draw=()=>{el.innerHTML=Object.entries(T).map(([k,v])=>`<button type="button" aria-pressed="${k===cur}" data-k="${k}">${v}</button>`).join('');};
  el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cur=b.dataset.k;draw();onPick(cur);});
  draw(); onPick(cur);
}

/* cabecalho e numeros */
const respTot = Object.values(D.respostas).reduce((a,v)=>a+Object.keys(v).length,0);
document.getElementById('meta').innerHTML = [
  `Coletado em ${D.dia.split('-').reverse().join('/')}`, `${nf(D.pedidos)} consultas à API`, `Custo total dos dados: ${usd(D.gasto_usd)}`,
  `Brasil, português (exceto a seção 6)`].map(x=>`<span>${x}</span>`).join('');
document.querySelectorAll('[data-custo]').forEach(e=>{e.textContent=usd(D.gasto_usd);});
const ps=D.palavras.seguro, pa=D.palavras.saude;
document.getElementById('tiles').innerHTML = [
  [nf(ps.n+pa.n),'palavras-chave com volume'],
  [nf(ps.volume_total+pa.volume_total),'buscas por mês, somadas'],
  [usd(Math.max(...[...ps.cpc_mais_alto,...pa.cpc_mais_alto].map(x=>x.cpc))),'clique mais caro encontrado'],
  [`${Object.values(D.serp).filter(s=>s.tem_aio).length} de ${Object.keys(D.serp).length}`,'buscas com resumo de IA no Google'],
  [nf(respTot),'respostas de IA analisadas'],
  [usd(D.gasto_usd),'custo de todos os dados'],
].map(([b,s])=>`<div class="tile"><b>${b}</b><span>${s}</span></div>`).join('');

/* 1 demanda */
tabs(document.getElementById('tabs1'), k=>{
  const P=D.palavras[k];
  document.getElementById('tTop').innerHTML = '<tr><th>Busca</th><th class="n">Por mês</th><th class="n">CPC</th><th class="n">Dific.</th></tr>'+
    P.top.slice(0,15).map(x=>`<tr><td>${esc(x.kw)}</td><td class="n">${nf(x.vol)}</td><td class="n">${x.cpc!=null?x.cpc.toFixed(2):'–'}</td><td class="n">${x.kd??'–'}</td></tr>`).join('');
  document.getElementById('tPerg').innerHTML = '<tr><th>Pergunta</th><th class="n">Por mês</th></tr>'+
    P.perguntas.slice(0,8).map(x=>`<tr><td>${esc(x.kw)}</td><td class="n">${nf(x.vol)}</td></tr>`).join('')+
    `<tr><td class="muted" colspan="2">${nf(P.n_perguntas)} perguntas no total</td></tr>`;
  document.getElementById('tOpp').innerHTML = '<tr><th>Busca</th><th class="n">Por mês</th><th class="n">Dific.</th></tr>'+
    P.oportunidades.slice(0,8).map(x=>`<tr><td>${esc(x.kw)}</td><td class="n">${nf(x.vol)}</td><td class="n">${x.kd}</td></tr>`).join('')+
    `<tr><td class="muted" colspan="3">${nf(P.n_oportunidades)} buscas com 1.000+ por mês e dificuldade até 20</td></tr>`;
  bars(document.getElementById('bCpc'), P.cpc_mais_alto.slice(0,8).map(x=>[x.kw,x.cpc,usd(x.cpc)]), null, true);
  const it=Object.entries(P.intencao); const tot=it.reduce((a,[,v])=>a+v,0);
  bars(document.getElementById('bInt'), it.map(([k2,v])=>[INT[k2]||k2,v,Math.round(100*v/tot)+'%']), tot);
  document.getElementById('intNote').textContent = `Das ${nf(P.n)} buscas de ${T[k].toLowerCase()}, ${Math.round(100*(P.intencao.commercial||0)/tot)}% são de quem está comparando antes de contratar.`;
});

/* 2 busca em IA */
document.getElementById('iaCards').innerHTML = Object.keys(T).map(k=>{
  const P=D.palavras[k]; const pct=(100*P.vol_ia_total/Math.max(1,P.vol_google_com_ia)).toFixed(1);
  return `<div class="card"><h3>${T[k]}</h3><p><b style="font-family:var(--mono)">${nf(P.vol_ia_total)}</b> no índice de IA, contra ${nf(P.vol_google_com_ia)} buscas no Google para as mesmas palavras: <b>${pct}%</b>.</p><div class="bars" id="ia_${k}"></div></div>`;
}).join('');
Object.keys(T).forEach(k=>{
  const seen=new Set(); const rows=[];
  for(const x of D.palavras[k].top_ia){ if(rows.length>=7) break; if(seen.has(x.vol_ia)) continue; seen.add(x.vol_ia); rows.push([x.kw,x.vol_ia]); }
  bars(document.getElementById('ia_'+k), rows);
});

/* 3 AI Overview */
const AIO_K = {'seguro auto':'seguro','seguro de carro':'seguro','plano de saúde':'saude'};
document.getElementById('aioCards').innerHTML = Object.keys(D.aio_dominios).map(a=>`<div class="card"><h3>Perguntas com “${esc(a)}”</h3><div class="bars" id="aio_${a.replace(/\W+/g,'_')}"></div></div>`).join('');
Object.entries(D.aio_dominios).forEach(([a,L])=>bars(document.getElementById('aio_'+a.replace(/\W+/g,'_')), L.slice(0,10).map(x=>[x.dominio,x.mencoes]), null));
document.getElementById('aioNote').innerHTML = `<h3>O que chama atenção</h3><p>O <b>YouTube é a fonte número 1</b> do resumo de IA do Google nos dois temas. Depois vêm as próprias seguradoras e operadoras, mas também <b>comparadores e corretoras</b> (Minuto Seguros, Smartia, seguroauto.org, Company Hero, Tabela Saúde). Vídeo e páginas de comparação entram nas respostas.</p>`;

/* 4 respostas */
const perg = Object.keys(D.respostas);
document.getElementById('respIntro').textContent = `${perg.length} perguntas de quem quer contratar, feitas em português a cada IA, com busca na web ligada e país Brasil. Total de ${nf(respTot)} respostas.`;
function heat(k){
  const marcas = (D.marcas[k]||[]).slice(0,10).map(x=>x[0]);
  const mp = D.marcas_por_plataforma[k]||{};
  const val=(pl,m)=>((mp[pl]||[]).find(x=>x[0]===m)||[0,0])[1];
  const max=Math.max(1,...marcas.flatMap(m=>PL.map(pl=>val(pl,m))));
  document.getElementById('tHeat').innerHTML = `<tr><th>Marca</th>${PL.map(p=>`<th class="n">${p.replace(' (app)','')}</th>`).join('')}</tr>`+
    marcas.map(m=>`<tr><td>${esc(m)}</td>${PL.map(pl=>{const v=val(pl,m);return `<td class="h" style="background:color-mix(in srgb, var(--accent) ${Math.round(60*v/max)}%, transparent)">${v||'·'}</td>`;}).join('')}</tr>`).join('');
  bars(document.getElementById('bFontes'), (D.fontes_ia[k]||[]).slice(0,12), null);
  document.getElementById('perguntas').innerHTML = `<h3 style="margin:8px 0">Resposta por resposta</h3>`+perg.filter(p=>temaDe(p)===k).map(p=>{
    const v=D.respostas[p]; const nm=new Set(PL.flatMap(pl=>(v[pl]||{}).marcas||[]));
    return `<details><summary><span>${esc(p)}</span><span class="tag">${Object.keys(v).length} IAs · ${nm.size} marcas</span></summary><div class="resp">${PL.filter(pl=>v[pl]).map(pl=>{const r=v[pl];
      return `<div class="pl"><h4>${pl}</h4><div class="lab">Marcas</div><div class="chips">${r.marcas.length?r.marcas.map(m=>`<span class="chip">${esc(m)}</span>`).join(''):'<span class="chip o">nenhuma</span>'}</div><div class="lab">Fontes</div><div class="chips">${r.fontes.length?r.fontes.slice(0,6).map(f=>`<span class="chip w">${esc(f)}</span>`).join(''):'<span class="chip o">sem fonte</span>'}</div><p>${esc(r.trecho)}…</p></div>`;}).join('')}</div></details>`;
  }).join('');
}
tabs(document.getElementById('tabs2'), heat);
document.getElementById('fonteNote').innerHTML = `<h3>O que chama atenção</h3><p>As IAs quase não repetem a mesma fonte para a mesma pergunta: cada uma monta a resposta com sites diferentes. E os sites mais citados <b>não são os grandes</b>: são comparadores, corretoras e blogs especializados (como idinheiro, meuseguromaisbarato, seguroauto.org, tabelasaude e companyhero). Em plano de saúde, a pergunta sobre Mounjaro e Ozempic é respondida quase só com <b>sites de advogados e jurisprudência</b>.</p>`;

/* 5 SERP x AIO */
const serpRows = Object.entries(D.serp).map(([q,s])=>{
  const org=new Set(s.organicos.slice(0,10)); const ao=[...new Set(s.aio_fontes)];
  const dentro=ao.filter(d=>org.has(d)).length;
  return {q,s,ao,dentro};
});
document.getElementById('tSerp').innerHTML = '<tr><th>Busca</th><th>Top 5 orgânico</th><th>Fontes do resumo de IA</th><th class="n">Fontes que estão no top 10</th></tr>'+
  serpRows.map(r=>`<tr><td><b>${esc(r.q)}</b></td><td>${r.s.organicos.slice(0,5).map(esc).join('<br>')}</td><td>${r.ao.slice(0,5).map(esc).join('<br>')||'–'}</td><td class="n">${r.dentro} de ${r.ao.length}</td></tr>`).join('');
const tAo=serpRows.reduce((a,r)=>a+r.ao.length,0), tIn=serpRows.reduce((a,r)=>a+r.dentro,0);
document.getElementById('modoCards').innerHTML = `<div class="callout" style="grid-column:1/-1"><p>Somando as 12 buscas, só <b>${tIn} de ${tAo}</b> sites citados no resumo de IA (${Math.round(100*tIn/Math.max(1,tAo))}%) também estão no top 10 da mesma página. A IA busca fontes fora da primeira página.</p></div>`+
  Object.entries(D.modo_ia).map(([q,m])=>`<div class="card"><h3>Modo IA: “${esc(q)}”</h3><div class="lab">Marcas na resposta</div><div class="chips">${m.marcas.map(x=>`<span class="chip">${esc(x)}</span>`).join('')||'<span class="chip o">nenhuma</span>'}</div><div class="lab">Fontes</div><div class="chips">${[...new Set(m.fontes)].slice(0,8).map(x=>`<span class="chip w">${esc(x)}</span>`).join('')}</div></div>`).join('');

/* 6 EUA */
document.getElementById('enCards').innerHTML = Object.entries(D.chatgpt_en_perguntas).map(([a,L])=>`<div class="card"><h3>ChatGPT nos EUA: “${esc(a)}”</h3><div class="scroll"><table><tr><th>Pergunta real</th><th class="n">Vol. IA</th></tr>${L.slice(0,8).map(x=>`<tr><td>${esc(x.pergunta)}</td><td class="n">${nf(x.volume_ia)}</td></tr>`).join('')}</table></div><div class="lab">Sites que o ChatGPT mais cita</div><div class="chips">${(D.chatgpt_en_dominios[a]||[]).slice(0,8).map(x=>`<span class="chip w">${esc(x.dominio)}</span>`).join('')}</div></div>`).join('');
const pares=[["is $300 a month a lot for car insurance?","R$ 300 por mês é caro para seguro de carro?"],["what car insurance company to stay away from?","qual seguradora de carro devo evitar?"],["who is the cheapest car insurance in texas?","qual a seguradora de carro mais barata em São Paulo?"],["can my girlfriend drive my car if she's not on my insurance?","meu filho pode dirigir meu carro se não estiver no seguro?"],["will my car insurance go up if i use safelite?","o seguro do carro aumenta se eu usar a assistência de vidros?"],["is $500 a month normal for health insurance?","R$ 500 por mês é normal para plano de saúde?"],["what health insurance covers zepbound?","plano de saúde cobre Mounjaro ou Ozempic?"],["can a diabetic get health insurance?","quem tem diabetes consegue contratar plano de saúde?"],["which health insurance company has the most complaints?","qual operadora de plano de saúde tem mais reclamações?"],["is it cheaper to get health insurance through a broker?","é mais barato contratar plano de saúde com corretor?"]];
document.getElementById('pairs').innerHTML = '<div class="lab">Pergunta real nos EUA</div><div class="lab">Nossa versão em português</div>'+pares.map(([a,b])=>`<div class="muted">${esc(a)}</div><div>${esc(b)}</div>`).join('');

/* 7 como usar */
const plays=[
 `<b>Escreva para a pergunta, não para a palavra.</b> As IAs recebem perguntas inteiras ("R$ 300 por mês é caro?", "qual devo evitar?"). Páginas que respondem a pergunta logo na primeira frase, com número, são as que viram fonte.`,
 `<b>Tabela de preço atualizada é o que mais se cita.</b> Comparadores com faixas de preço por perfil e cidade (Tabela Saúde, meuseguromaisbarato, seguroauto.org) aparecem em quase todas as IAs. Título com o ano (2026) e data visível ajudam.`,
 `<b>Faça vídeo.</b> O YouTube é a fonte nº 1 do resumo de IA do Google nos dois temas.`,
 `<b>Cite a fonte oficial.</b> O ChatGPT usa gov.br (ANS, Susep, consumidor.gov.br) em quase toda resposta. Página que cita e linka o regulador fica do mesmo lado da resposta.`,
 `<b>Não basta estar no top 10.</b> A maior parte das fontes do resumo de IA está fora da primeira página do Google. Há espaço para site menor e especializado.`,
 `<b>Cada IA usa fontes diferentes.</b> Para aparecer, o conteúdo precisa estar em vários lugares (site próprio, portais, vídeo, Reclame Aqui), não em um só.`,
 `<b>Assuntos jurídicos abrem porta.</b> "Plano cobre Mounjaro?" é respondido com advogados e decisões judiciais: escritórios e sites jurídicos são citados.`,
];
document.getElementById('plays').innerHTML = plays.map(p=>`<li>${p}</li>`).join('');

document.getElementById('foot').innerHTML = `<p><b>Como foi feito.</b> Palavras e CPC: base de palavras do Google no Brasil (DataForSEO Labs). Volume em IA: índice de AI Keyword Data. Resumo de IA do Google: base LLM Mentions (Brasil, português) e a página real do Google com o resumo. Modo IA: aba Modo IA do Google. Respostas: ChatGPT e Gemini pelos aplicativos, Claude e Perplexity pela API, todos com busca na web e país Brasil; cada resposta varia de uma vez para outra, então isto é uma fotografia do dia. Marcas contadas por nome no texto.</p><p>Volumes e CPC são estimativas da ferramenta. CPC em dólar. ${nf(D.pedidos)} consultas, ${usd(D.gasto_usd)} no total.</p>`;
