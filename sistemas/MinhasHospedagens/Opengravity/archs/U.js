/* ===================== ARCH U =====================
 * Criada em 19/08/2026 para o blogse.com.br, servidor opengravity.
 *
 * Arquetipo: CADERNO. Cabecalho de revista, com a marca em serifa grande e a
 * navegacao alinhada pela base, na mesma linha. A home abre com chamada
 * dividida, texto a esquerda e foto a direita, sobre um bloco de cor deslocado.
 * Depois vem uma faixa de tres cartoes numerados e, dai para baixo, uma secao
 * por editoria: a primeira materia em destaque horizontal e as demais em duas
 * colunas de titulo com data.
 *
 * O single tem um sumario "Neste texto" montado a partir dos h2 do proprio
 * corpo, com ancora injetada. E o unico arquetipo da rede com isso.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function uCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--u2:${p2}}
${s('uwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 26px}
${s('utira')}{border-bottom:1px solid var(--line);background:var(--surface)}
${s('utira')} ${s('uwrap')}{display:flex;align-items:center;justify-content:space-between;gap:16px;height:34px;font-family:var(--fb);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
${s('umast')}{border-bottom:3px solid var(--ink);background:var(--paper)}
${s('umast')} ${s('uwrap')}{display:flex;align-items:flex-end;justify-content:space-between;gap:30px;flex-wrap:wrap;padding-top:22px;padding-bottom:12px}
${s('ubrand')}{font-family:"Familjen Grotesk",var(--fb);font-weight:700;font-size:clamp(25px,4.1vw,42px);line-height:1;letter-spacing:.005em;text-transform:uppercase;color:var(--ink);white-space:nowrap}
${s('ubrand')} em{font-style:normal;color:var(--p)}
${s('unav')}{display:flex;gap:22px;flex-wrap:wrap;padding-bottom:5px}
${s('unav')} a{font-family:var(--fb);font-size:12.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);padding-bottom:4px;border-bottom:2px solid transparent}
${s('unav')} a:hover{color:var(--p);border-bottom-color:var(--p)}
${s('uham')}{display:none;width:46px;height:46px;align-items:center;justify-content:center;flex:0 0 auto;padding:0;margin-bottom:4px;border:1px solid var(--line);border-radius:10px;background:var(--surface);cursor:pointer}
${s('uham')} i{display:block;position:relative;width:20px;height:2px;background:var(--ink)}
${s('uham')} i::before,${s('uham')} i::after{content:"";position:absolute;left:0;width:20px;height:2px;background:var(--ink);transition:transform .25s ease,top .25s ease}
${s('uham')} i::before{top:-6px}
${s('uham')} i::after{top:6px}
${s('uham')}[aria-expanded="true"] i{background:transparent}
${s('uham')}[aria-expanded="true"] i::before{top:0;transform:rotate(45deg)}
${s('uham')}[aria-expanded="true"] i::after{top:0;transform:rotate(-45deg)}
main{padding:30px 0 8px}

${s('uabre')}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.04fr);gap:44px;align-items:center;padding-bottom:34px;border-bottom:1px solid var(--line);margin-bottom:34px}
${s('uabretx')}{min-width:0}
${s('uchapeu')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--p);border-bottom:2px solid var(--p);padding-bottom:4px}
${s('uabretx')} h2{font-family:var(--fd);font-weight:900;font-size:clamp(28px,3.7vw,46px);line-height:1.06;letter-spacing:-.028em;margin:16px 0 0;color:var(--ink);text-wrap:balance}
${s('uabre')}:hover h2{color:var(--p)}
${s('uabretx')} p{margin:15px 0 0;color:var(--dek);font-size:17px;line-height:1.58;max-width:50ch}
${s('uabretx')} .u-mais{display:inline-block;margin-top:18px;font-family:var(--fb);font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);border-bottom:2px solid var(--p);padding-bottom:3px}
${s('uabreph')}{position:relative;display:block}
${s('uabreph')}::before{content:"";position:absolute;left:16px;top:16px;right:-16px;bottom:-16px;background:var(--u2);opacity:.14;border-radius:var(--rad-lg)}
${s('uabreph')} span{position:relative;display:block;aspect-ratio:var(--hero-ar);overflow:hidden;border-radius:var(--rad-lg);background:var(--ph)}
${s('uabreph')} img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}
${s('uabre')}:hover ${s('uabreph')} img{transform:scale(1.04)}

${s('ufaixa')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px;padding-bottom:34px;border-bottom:3px double var(--ink);margin-bottom:8px}
${s('unum')}{display:block;min-width:0}
${s('unum')} .u-ord{font-family:var(--fd);font-weight:900;font-size:34px;line-height:1;color:var(--u2);opacity:.42;letter-spacing:-.03em}
${s('unum')} .u-ph{display:block;aspect-ratio:var(--card-ar);overflow:hidden;border-radius:var(--rad);background:var(--ph);margin:12px 0 13px}
${s('unum')} .u-ph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('unum')}:hover .u-ph img{transform:scale(1.05)}
${s('unum')} .u-k{display:block;font-family:var(--fb);font-size:10px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:var(--p)}
${s('unum')} h2,${s('unum')} h3{font-family:var(--fd);font-weight:800;font-size:19px;line-height:1.22;letter-spacing:-.014em;margin:7px 0 0;color:var(--ink)}
${s('unum')}:hover h2,${s('unum')}:hover h3{color:var(--p)}

${s('uult')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:26px 22px;margin-top:34px}
${s('ucard')}{display:block;min-width:0}
${s('ucard')} .u-ph{display:block;aspect-ratio:16/10;overflow:hidden;border-radius:var(--rad);background:var(--ph);margin-bottom:11px}
${s('ucard')} .u-ph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('ucard')}:hover .u-ph img{transform:scale(1.06)}
${s('ucard')} .u-k{display:block;font-family:var(--fb);font-size:9.5px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:var(--p)}
${s('ucard')} h3{font-family:var(--fd);font-weight:800;font-size:16.5px;line-height:1.24;letter-spacing:-.012em;margin:6px 0 0;color:var(--ink)}
${s('ucard')}:hover h3{color:var(--p)}
${s('ucard')} time{display:block;margin-top:6px;font-family:var(--fb);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
${s('ucomp')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px 22px}
${s('ucomp')} ${s('ucard')} .u-ph{aspect-ratio:4/3;margin-bottom:9px}
${s('ucomp')} ${s('ucard')} h3{font-size:15px}
${s('usec')}{margin-top:42px}
${s('usech')}{display:flex;align-items:baseline;gap:14px;margin:0 0 22px}
${s('usech')} h1,${s('usech')} h2{font-family:var(--fd);font-weight:900;font-size:24px;letter-spacing:-.02em;margin:0;color:var(--ink);white-space:nowrap}
${s('usech')} .u-ln{flex:1;height:5px;border-top:1px solid var(--ink);border-bottom:1px solid var(--ink)}
${s('udest')}{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1fr);gap:28px;align-items:center;padding-bottom:24px;border-bottom:1px solid var(--line);margin-bottom:22px}
${s('udest')} .u-ph{display:block;aspect-ratio:4/3;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('udest')} .u-ph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('udest')}:hover .u-ph img{transform:scale(1.05)}
${s('udest')} h3{font-family:var(--fd);font-weight:800;font-size:clamp(20px,2.3vw,27px);line-height:1.16;letter-spacing:-.02em;margin:0;color:var(--ink);text-wrap:balance}
${s('udest')}:hover h3{color:var(--p)}
${s('udest')} p{margin:11px 0 0;color:var(--dek);font-size:15.5px;line-height:1.55}
${s('ulista')}{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-flow:column;gap:0 34px}
${s('ulinha')}{display:block;padding:13px 0;border-top:1px solid var(--line)}
${s('ulinha')} h3,${s('ulinha')} h4{font-family:var(--fd);font-weight:700;font-size:16.5px;line-height:1.28;letter-spacing:-.01em;margin:0;color:var(--ink)}
${s('ulinha')}:hover h3,${s('ulinha')}:hover h4{color:var(--p)}
${s('ulinha')} time{display:block;margin-top:5px;font-family:var(--fb);font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted)}

${s('uart')}{max-width:68ch;margin:0 auto;padding:24px 0 8px}
${s('uahead')}{padding-bottom:20px;border-bottom:3px double var(--ink);margin-bottom:22px}
${s('uahead')} h1{font-family:var(--fd);font-weight:900;font-size:clamp(29px,4.3vw,45px);line-height:1.07;letter-spacing:-.028em;margin:14px 0 0;color:var(--ink)}
${s('udek')}{font-size:18.5px;line-height:1.55;color:var(--dek);margin:14px 0 0}
${s('usum')}{background:var(--surface);border-left:4px solid var(--p);border-radius:0 var(--rad) var(--rad) 0;padding:17px 20px;margin:0 0 26px}
${s('usum')} b{display:block;font-family:var(--fb);font-size:10.5px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:var(--muted);margin-bottom:9px}
${s('usum')} ol{margin:0;padding-left:19px}
${s('usum')} li{margin:0 0 6px;font-size:15px;line-height:1.45}
${s('usum')} a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--line)}
${s('usum')} a:hover{color:var(--p);border-bottom-color:var(--p)}
${s('ufig')}{margin:0 0 26px}
${s('ufig')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('ufig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:9px;font-style:italic}
${s('ubody')}{font-size:calc(var(--fs) + 1px);line-height:1.8;color:var(--ink)}
${s('ubody')} p{margin:0 0 21px}
${s('ubody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('ubody')} h2{font-family:var(--fd);font-weight:900;font-size:26px;letter-spacing:-.018em;margin:36px 0 13px;color:var(--ink);scroll-margin-top:24px}
${s('ubody')} h3{font-family:var(--fd);font-weight:800;font-size:20px;margin:26px 0 10px}
${s('ubody')} ul,${s('ubody')} ol{margin:0 0 21px;padding-left:22px}
${s('ubody')} li{margin:0 0 9px}
${s('ubody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('ubody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}
${s('ubody')} th,${s('ubody')} td{border:0;border-bottom:1px solid var(--line);padding:10px 8px;text-align:left;background:transparent}
${s('ubody')} caption{caption-side:top;text-align:left;font-size:13px;color:var(--muted);padding-bottom:8px}
${s('ubody')} th{font-family:var(--fb);font-weight:700;border-bottom:2px solid var(--ink)}
${s('ubody')} blockquote{margin:26px 0;padding:0 0 0 22px;border-left:4px solid var(--u2);font-family:var(--fd);font-size:21px;line-height:1.45;color:var(--ink)}
${s('urel')}{max-width:68ch;margin:44px auto 0;padding-top:10px;border-top:3px double var(--ink)}
${s('urel3')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px 18px;align-items:start}
${s('urel3')} ${s('unum')} h2,${s('urel3')} ${s('unum')} h3{font-size:15px;line-height:1.26}
${s('urel3')} ${s('unum')} .u-ord{display:none}
${s('urel3')} ${s('unum')} .u-ph{margin-top:0}

${s('ufoot')}{margin-top:56px;padding:34px 0 22px;border-top:3px solid var(--ink);background:var(--surface);font-size:14px;color:var(--muted)}
${s('ufoot')} ${s('ucols')}{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:32px}
${s('ufoot')} ${s('ufb')}{font-family:"Familjen Grotesk",var(--fb);font-weight:700;font-size:21px;letter-spacing:.01em;text-transform:uppercase;color:var(--ink)}
${s('ufoot')} ${s('ufh')}{font-family:var(--fb);font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--ink);margin-bottom:11px}
${s('ufoot')} a{display:block;color:var(--muted);padding:3px 0}
${s('ufoot')} a:hover{color:var(--p)}
${s('ufoot')} ${s('ucp')}{margin-top:26px;padding-top:15px;border-top:1px solid var(--line);font-size:12.5px}

@media(max-width:1100px){
${s('umast')} ${s('uwrap')}{flex-wrap:wrap;align-items:center;padding-bottom:16px}
${s('uham')}{display:flex}
${s('unav')}{display:none;order:3;width:100%;flex-direction:column;gap:0;padding:0;margin-top:14px;border-top:1px solid var(--line)}
${s('unav')}[data-aberto="1"]{display:flex}
${s('unav')} a{padding:15px 2px;border-bottom:1px solid var(--line);font-size:13.5px}
${s('unav')} a:hover{border-bottom-color:var(--p)}
}
@media(max-width:980px){
${s('uabre')}{grid-template-columns:1fr;gap:24px}
${s('uabreph')}::before{display:none}
${s('ufaixa')}{grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
${s('udest')}{grid-template-columns:1fr;gap:16px}
}
@media(max-width:980px){${s('uult')},${s('ucomp')}{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){
${s('ufaixa')}{grid-template-columns:1fr;gap:26px}
${s('ulista')}{grid-template-columns:1fr;grid-auto-flow:row;grid-template-rows:none !important;gap:0}
${s('ufoot')} ${s('ucols')}{grid-template-columns:1fr;gap:22px}
${s('umast')} ${s('uwrap')}{padding-bottom:14px}
}
@media(max-width:640px){
${s('ubody')} table{display:block;min-width:0;width:auto}
${s('ubody')} table caption{display:block;width:auto;padding-bottom:10px}
${s('ubody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${s('ubody')} table tbody,${s('ubody')} table tr,${s('ubody')} table th,${s('ubody')} table td{display:block;width:auto}
${s('ubody')} table tbody tr{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:2px 18px 16px;margin-bottom:14px}
${s('ubody')} table tbody th,${s('ubody')} table tbody td{border:0;background:transparent}
${s('ubody')} table tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:16px}
${s('ubody')} table tbody td{padding:14px 0 0;text-align:left;line-height:1.55}
${s('ubody')} table tbody td::before{content:attr(data-rotulo);display:block;font-family:var(--fb);font-weight:700;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
}
@media(max-width:600px){${s('urel3')}{grid-template-columns:1fr;gap:24px}${s('uult')},${s('ucomp')}{grid-template-columns:1fr;gap:24px}}
@media(max-width:520px){${s('utira')} ${s('uwrap')} span:last-child{display:none}}`;
}

function uHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const partes = nome.split(' ');
  const marca = partes.length > 1
    ? `${partes.slice(0, -1).join(' ')} <em>${partes[partes.length - 1]}</em>`
    : `${nome.slice(0, -2)}<em>${nome.slice(-2)}</em>`;
  const idMenu = c('unav') + '-p';
  return `<div class="${c('utira')}"><div class="${c('uwrap')}">
<span data-ud>${H.dateShort()}</span><span>${H.esc(site.tagline || site.description || '')}</span>
</div></div>
<header class="${c('umast')}"><div class="${c('uwrap')}">
<a class="${c('ubrand')}" href="/">${marca}</a>
<button class="${c('uham')}" type="button" data-uham aria-expanded="false" aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<nav class="${c('unav')}" id="${idMenu}" aria-label="Editorias">${links}</nav>
</div></header>
<script>(function(){var e=document.querySelector('[data-ud]');if(e)e.textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
var b=document.querySelector('[data-uham]'),n=document.getElementById('${idMenu}');if(!b||!n)return;
b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function uFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('ufoot')}"><div class="${c('uwrap')}">
<div class="${c('ucols')}">
<div><div class="${c('ufb')}">${H.esc(site.name)}</div><p style="margin:12px 0 0;max-width:40ch;line-height:1.6">${H.esc(site.description || '')}</p></div>
<div><div class="${c('ufh')}">Editorias</div>${cats}</div>
<div><div class="${c('ufh')}">Institucional</div>${H.instLinks()}</div>
</div>
<div class="${c('ucp')}">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function uNum(ctx, a, ordem, opt) {
  const { c, H } = ctx;
  const o = opt || {};
  const tag = o.h2 ? 'h2' : 'h3';
  return `<a class="${c('unum')} ${c('reveal')}" href="${H.url(a)}">
${ordem ? `<span class="u-ord">${ordem}</span>` : ''}
<span class="u-ph">${H.pic(a, !!o.eager)}</span>
<span class="u-k">${H.cat(a)}</span><${tag}>${H.esc(a.title)}</${tag}></a>`;
}

function uDest(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('udest')}" href="${H.url(a)}">
<span class="u-ph">${H.pic(a, false)}</span>
<span><h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 150))}</p>` : ''}</span></a>`;
}

function uLinha(ctx, a, h3) {
  const { c, H } = ctx;
  const tag = h3 ? 'h3' : 'h4';
  return `<a class="${c('ulinha')}" href="${H.url(a)}">
<${tag}>${H.esc(a.title)}</${tag}><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}

function uCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('ucard')} ${c('reveal')}" href="${H.url(a)}">
<span class="u-ph">${H.pic(a, false)}</span>
<span class="u-k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}

function uHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const abre = arts[0];
  const faixa = arts.slice(1, 4);
  const ultimas = arts.slice(4, 12);
  const teto = site.postsOnHome || 60;
  const resto = arts.slice(12, teto);

  const chamada = abre ? `<a class="${c('uabre')}" href="${H.url(abre)}">
<span class="${c('uabretx')}"><span class="${c('uchapeu')}">${H.cat(abre)}</span>
<h2>${H.esc(abre.title)}</h2>
${abre.excerpt ? `<p>${H.esc(H.clip(abre.excerpt, 200))}</p>` : ''}
<span class="u-mais">Continuar lendo</span></span>
<span class="${c('uabreph')}"><span>${H.pic(abre, true)}</span></span></a>` : '';

  const numerados = faixa.length
    ? `<div class="${c('ufaixa')}">${faixa.map((a, i) => uNum(ctx, a, '0' + (i + 1))).join('')}</div>`
    : '';

  // uma secao por editoria de verdade: fatia de N deixava secao com o nome de
  // uma editoria e materia de outra dentro
  const ordem = [], porCat = new Map();
  for (const a of resto) {
    const nome = H.cat(a);
    if (!porCat.has(nome)) { porCat.set(nome, []); ordem.push(nome); }
    porCat.get(nome).push(a);
  }
  const sobra = [], blocos = [];
  for (const nome of ordem) {
    const todos = porCat.get(nome);
    if (todos.length < 3) { sobra.push(...todos); continue; }
    const usa = todos.slice(0, 7);
    sobra.push(...todos.slice(7));
    const linhas = Math.ceil((usa.length - 1) / 2);
    blocos.push(`<section class="${c('usec')}">
<div class="${c('usech')}"><h2>${nome}</h2><span class="u-ln"></span></div>
${uDest(ctx, usa[0])}
<div class="${c('ulista')}" style="grid-template-rows:repeat(${linhas},auto)">${usa.slice(1).map(a => uLinha(ctx, a)).join('')}</div>
</section>`);
  }
  // grade de quatro colunas: linha pela metade fica com buraco do lado.
  // Em vez de descartar, puxa os proximos da lista para fechar a linha.
  const falta = sobra.length % 4;
  if (falta) sobra.push(...arts.slice(teto, teto + (4 - falta)));
  if (sobra.length) blocos.push(`<section class="${c('usec')}">
<div class="${c('usech')}"><h2>Mais no blog</h2><span class="u-ln"></span></div>
<div class="${c('ucomp')}">${sobra.map(a => uCard(ctx, a)).join('')}</div>
</section>`);

  return `${H.head(ctx, H.homeMeta(site))}
${uHeader(ctx, menu)}
<main><div class="${c('uwrap')}">
${H.h1(ctx)}
${chamada}
${numerados}
${ultimas.length ? `<section class="${c('usec')}" style="margin-top:34px">
<div class="${c('usech')}"><h2>Últimas publicações</h2><span class="u-ln"></span></div>
<div class="${c('uult')}">${ultimas.map(a => uCard(ctx, a)).join('')}</div>
</section>` : ''}
${blocos.join('')}
</div></main>
${uFooter(ctx, menu)}`;
}

// Sumario "Neste texto": os h2 do proprio corpo, com ancora injetada. Serve de
// indice para o leitor e de lista de links internos para o Google.
function uSumario(ctx, html) {
  const { c, H } = ctx;
  const itens = [];
  let n = 0;
  const corpo = String(html || '').replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (todo, attr, dentro) => {
    const texto = H.stripTags(dentro).trim().replace(/^\s*\d+[.)º°]?\s+/, '');
    if (!texto) return todo;
    n++;
    const id = 'sec-' + n;
    itens.push({ id, texto });
    const limpo = (attr || '').replace(/\sid=["'][^"']*["']/i, '');
    return `<h2 id="${id}"${limpo}>${dentro}</h2>`;
  });
  if (itens.length < 3) return { corpo: html, sumario: '' };
  const lista = itens.slice(0, 8).map(x => `<li><a href="#${x.id}">${H.esc(x.texto)}</a></li>`).join('');
  return { corpo, sumario: `<div class="${c('usum')}"><b>Neste texto</b><ol>${lista}</ol></div>` };
}

function uArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('ufig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const { corpo, sumario } = uSumario(ctx, art.content);
  const rel = (related && related.length) ? `<section class="${c('urel')}">
<div class="${c('usech')}"><h2>Leia também</h2><span class="u-ln"></span></div>
<div class="${c('urel3')}">${related.slice(0, 3).map(a => uNum(ctx, a, '')).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${uHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('uwrap')}">
<article class="${c('uart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('uahead')}">
<span class="${c('uchapeu')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('udek')}">${H.esc(art.dek)}</p>` : ''}
</div>
${H.metaRow(ctx, art, P)}
${fig}
${sumario}
<div class="${c('ubody')}">${corpo}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${uFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function uList(ctx, opts) {
  const { c, H } = ctx;
  const itens = opts.items || [];
  const topo = itens.slice(0, 3);
  const resto = itens.slice(3);
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${uHeader(ctx, opts.menu)}
<main><div class="${c('uwrap')}">
<div class="${c('usech')}" style="margin-top:28px"><h1>${H.esc(opts.title)}</h1><span class="u-ln"></span></div>
${topo.length ? `<div class="${c('ufaixa')}">${topo.map((a, i) => uNum(ctx, a, '0' + (i + 1), { h2: true, eager: i === 0 })).join('')}</div>` : ''}
${resto.length ? `<div class="${c('ulista')}" style="margin-top:26px;grid-template-rows:repeat(${Math.ceil(resto.length / 2)},auto)">${resto.map(a => uLinha(ctx, a, true)).join('')}</div>` : ''}
</div></main>
${uFooter(ctx, opts.menu)}`;
}

