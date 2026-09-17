/* ===================== ARCH V =====================
 * Criada em 20/08/2026 para o euvo.com.br, servidor opengravity.
 *
 * Arquetipo: PAINEL. Barra escura no topo, com a marca em grotesca condensada e
 * a navegacao na mesma linha. A home abre com chamada dividida, texto a esquerda
 * e foto a direita dentro de uma moldura deslocada. Abaixo, a faixa "Em alta",
 * com quatro cartoes marcados por um filete vertical de acento, e dai em diante
 * uma secao por editoria, em grade de tres.
 *
 * Menu sanfonado abaixo de 1100px, tabela que vira cartao abaixo de 640px, e
 * todo link de editoria saindo de H.curl, que e o que respeita o categoryBase.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function vCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--v2:${p2}}
${s('vwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 26px}
${s('vtopo')}{background:var(--bar-bg);color:var(--bar-tx);position:sticky;top:0;z-index:45}
${s('vtopo')} ${s('vwrap')}{display:flex;align-items:center;justify-content:space-between;gap:26px;min-height:70px;flex-wrap:wrap}
${s('vbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(23px,3.1vw,34px);line-height:1;letter-spacing:.01em;text-transform:uppercase;color:var(--bar-tx);white-space:nowrap}
${s('vbrand')} i{font-style:normal;color:var(--v2)}
${s('vnav')}{display:flex;gap:20px;flex-wrap:wrap;align-items:center}
${s('vnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--bar-tx);opacity:.82;padding:5px 0;border-bottom:2px solid transparent}
${s('vnav')} a:hover{opacity:1;border-bottom-color:var(--v2)}
${s('vham')}{display:none;width:46px;height:46px;align-items:center;justify-content:center;flex:0 0 auto;padding:0;border:1px solid rgba(255,255,255,.28);border-radius:10px;background:transparent;cursor:pointer}
${s('vham')} i{display:block;position:relative;width:20px;height:2px;background:var(--bar-tx)}
${s('vham')} i::before,${s('vham')} i::after{content:"";position:absolute;left:0;width:20px;height:2px;background:var(--bar-tx);transition:transform .25s ease,top .25s ease}
${s('vham')} i::before{top:-6px}
${s('vham')} i::after{top:6px}
${s('vham')}[aria-expanded="true"] i{background:transparent}
${s('vham')}[aria-expanded="true"] i::before{top:0;transform:rotate(45deg)}
${s('vham')}[aria-expanded="true"] i::after{top:0;transform:rotate(-45deg)}
${s('vdata')}{background:var(--surface);border-bottom:1px solid var(--line)}
${s('vdata')} ${s('vwrap')}{display:flex;align-items:center;justify-content:space-between;gap:14px;height:34px;font-family:var(--fb);font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
main{padding:32px 0 8px}

${s('vlead')}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.02fr);gap:46px;align-items:center;padding-bottom:34px;border-bottom:1px solid var(--line);margin-bottom:32px}
${s('vtx')}{min-width:0}
${s('vchip')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--onp);background:var(--p);padding:5px 11px;border-radius:3px}
${s('vtx')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(28px,3.6vw,45px);line-height:1.07;letter-spacing:-.026em;margin:16px 0 0;color:var(--ink);text-wrap:balance}
${s('vlead')}:hover ${s('vtx')} h2{color:var(--p)}
${s('vtx')} p{margin:14px 0 0;color:var(--dek);font-size:17px;line-height:1.57;max-width:52ch}
${s('vmold')}{position:relative;display:block;padding:0 14px 14px 0}
${s('vmold')}::after{content:"";position:absolute;right:0;bottom:0;width:72%;height:72%;border:3px solid var(--v2);border-radius:var(--rad);z-index:0}
${s('vmold')} span{position:relative;z-index:1;display:block;aspect-ratio:var(--hero-ar);overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('vmold')} img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}
${s('vlead')}:hover ${s('vmold')} img{transform:scale(1.04)}

${s('valta')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;padding-bottom:32px;border-bottom:2px solid var(--ink);margin-bottom:6px}
${s('vmini')}{display:block;min-width:0;padding-left:15px;border-left:3px solid var(--v2)}
${s('vmini')} .vph{display:block;aspect-ratio:16/10;overflow:hidden;border-radius:var(--rad-sm);background:var(--ph);margin-bottom:11px}
${s('vmini')} .vph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('vmini')}:hover .vph img{transform:scale(1.06)}
${s('vmini')} .vk{display:block;font-family:var(--fb);font-size:9.5px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:var(--p)}
${s('vmini')} h2,${s('vmini')} h3{font-family:var(--fd);font-weight:700;font-size:16.5px;line-height:1.24;letter-spacing:-.012em;margin:6px 0 0;color:var(--ink)}
${s('vmini')}:hover h2,${s('vmini')}:hover h3{color:var(--p)}
${s('vmini')} time{display:block;margin-top:6px;font-family:var(--fb);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}

${s('vsec')}{margin-top:40px}
${s('vsech')}{display:flex;align-items:center;gap:13px;margin:0 0 22px}
${s('vsech')} h1,${s('vsech')} h2{font-family:var(--fd);font-weight:800;font-size:23px;letter-spacing:-.012em;margin:0;color:var(--ink);white-space:nowrap}
${s('vsech')} .vq{width:13px;height:13px;background:var(--p);flex:0 0 auto}
${s('vsech')} .vln{flex:1;height:1px;background:var(--line)}
${s('vgrid')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px var(--col)}
${s('vcard')}{display:block;min-width:0}
${s('vcard')} .vph{display:block;aspect-ratio:var(--card-ar);overflow:hidden;border-radius:var(--rad);background:var(--ph);margin-bottom:13px}
${s('vcard')} .vph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('vcard')}:hover .vph img{transform:scale(1.05)}
${s('vcard')} .vk{font-family:var(--fb);font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--p)}
${s('vcard')} h2,${s('vcard')} h3{font-family:var(--fd);font-weight:700;font-size:18.5px;line-height:1.24;letter-spacing:-.012em;margin:6px 0 0;color:var(--ink)}
${s('vcard')}:hover h2,${s('vcard')}:hover h3{color:var(--p)}
${s('vcard')} p{margin:8px 0 0;color:var(--dek);font-size:14.5px;line-height:1.5}
${s('vcomp')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:26px 22px}
${s('vcomp')} ${s('vcard')} .vph{aspect-ratio:4/3;margin-bottom:10px}
${s('vcomp')} ${s('vcard')} h2,${s('vcomp')} ${s('vcard')} h3{font-size:15.5px}
${s('vcomp')} ${s('vcard')} p{display:none}

${s('vart')}{max-width:68ch;margin:0 auto;padding:26px 0 8px}
${s('vahead')}{padding-bottom:20px;border-bottom:2px solid var(--ink);margin-bottom:24px}
${s('vahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(29px,4.2vw,45px);line-height:1.07;letter-spacing:-.026em;margin:14px 0 0;color:var(--ink)}
${s('vdek')}{font-size:18.5px;line-height:1.55;color:var(--dek);margin:14px 0 0}
${s('vfig')}{margin:0 0 26px}
${s('vfig')} img{width:100%;height:auto;display:block;border-radius:var(--rad)}
${s('vfig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:9px;font-style:italic}
${s('vbody')}{font-size:calc(var(--fs) + 1px);line-height:1.79;color:var(--ink)}
${s('vbody')} p{margin:0 0 21px}
${s('vbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('vbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.016em;margin:36px 0 13px;color:var(--ink);padding-left:14px;border-left:5px solid var(--p);scroll-margin-top:80px}
${s('vbody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;margin:26px 0 10px}
${s('vbody')} ul,${s('vbody')} ol{margin:0 0 21px;padding-left:22px}
${s('vbody')} li{margin:0 0 9px}
${s('vbody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('vbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}
${s('vbody')} th,${s('vbody')} td{border:0;border-bottom:1px solid var(--line);padding:10px 8px;text-align:left;background:transparent}
${s('vbody')} th{font-family:var(--fb);font-weight:700;border-bottom:2px solid var(--ink)}
${s('vbody')} caption{caption-side:top;text-align:left;font-size:13px;color:var(--muted);padding-bottom:8px}
${s('vbody')} blockquote{margin:26px 0;padding:16px 20px;background:var(--surface);border-left:5px solid var(--v2);font-family:var(--fd);font-size:20px;line-height:1.45;color:var(--ink)}
${s('vrel')}{max-width:68ch;margin:44px auto 0;padding-top:10px;border-top:2px solid var(--ink)}
${s('vrel3')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px 18px;align-items:start}
${s('vrel3')} ${s('vcard')} h2,${s('vrel3')} ${s('vcard')} h3{font-size:15px;line-height:1.26}
${s('vrel3')} ${s('vcard')} p{display:none}

${s('vfoot')}{margin-top:56px;padding:34px 0 22px;background:var(--footer-bg);color:var(--footer-tx);font-size:14px}
${s('vfoot')} ${s('vcols')}{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:32px}
${s('vfoot')} ${s('vfb')}{font-family:var(--fd);font-weight:800;font-size:22px;letter-spacing:.01em;text-transform:uppercase;color:#fff}
${s('vfoot')} ${s('vfh')}{font-family:var(--fb);font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#fff;margin-bottom:11px}
${s('vfoot')} a{display:block;color:var(--footer-tx);padding:3px 0}
${s('vfoot')} a:hover{color:#fff}
${s('vfoot')} ${s('vcp')}{margin-top:26px;padding-top:15px;border-top:1px solid rgba(255,255,255,.14);font-size:12.5px;opacity:.85}

@media(max-width:1100px){
${s('vham')}{display:flex}
${s('vnav')}{display:none;order:3;width:100%;flex-direction:column;gap:0;padding:0 0 12px;margin-top:6px;border-top:1px solid rgba(255,255,255,.16)}
${s('vnav')}[data-aberto="1"]{display:flex}
${s('vnav')} a{padding:15px 2px;border-bottom:1px solid rgba(255,255,255,.14);font-size:13.5px;opacity:1}
}
@media(max-width:980px){
${s('vlead')}{grid-template-columns:1fr;gap:24px}
${s('vmold')}{padding:0}
${s('vmold')}::after{display:none}
${s('valta')}{grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 20px}
${s('vgrid')}{grid-template-columns:repeat(2,minmax(0,1fr))}
${s('vcomp')}{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:640px){
${s('vbody')} table{display:block;min-width:0;width:auto}
${s('vbody')} table caption{display:block;width:auto;padding-bottom:10px}
${s('vbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${s('vbody')} table tbody,${s('vbody')} table tr,${s('vbody')} table th,${s('vbody')} table td{display:block;width:auto}
${s('vbody')} table tbody tr{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:2px 18px 16px;margin-bottom:14px}
${s('vbody')} table tbody th,${s('vbody')} table tbody td{border:0;background:transparent}
${s('vbody')} table tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:16px}
${s('vbody')} table tbody td{padding:14px 0 0;text-align:left;line-height:1.55}
${s('vbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-family:var(--fb);font-weight:700;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
}
/* Cartao de assinatura na pagina de equipe. O motor entrega uma grade de duas
   colunas, e aqui sao tres frentes: com duas colunas a terceira fica sozinha na
   linha de baixo. O texto tambem precisa vir agrupado, senao cada paragrafo cai
   numa celula diferente da grade do cartao. */
.eq-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.eq-card{display:block;padding:20px;border-radius:14px}
.eq-card img{width:64px;height:64px;margin:0 0 12px}
.eq-card .eq-ed{font-family:var(--fb);font-weight:700;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--p);margin:0 0 4px}
.eq-card .eq-res{font-family:var(--fd);font-weight:700;font-size:17px;line-height:1.2;margin:0 0 8px}
.eq-card .eq-res a{color:var(--ink);text-decoration:none}
.eq-card:hover .eq-res a{color:var(--p)}
.eq-card p:last-child{margin:0;font-size:14.5px;line-height:1.55;color:var(--muted)}

@media(max-width:900px){
.eq-grid{grid-template-columns:1fr}
}
@media(max-width:600px){
${s('valta')},${s('vgrid')},${s('vcomp')},${s('vrel3')}{grid-template-columns:1fr;gap:26px}
${s('vfoot')} ${s('vcols')}{grid-template-columns:1fr;gap:22px}
${s('vdata')} ${s('vwrap')} span:last-child{display:none}
}`;
}

function vHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const partes = nome.split(' ');
  const marca = partes.length > 1
    ? `${partes.slice(0, -1).join(' ')} <i>${partes[partes.length - 1]}</i>`
    : `${nome.slice(0, -2)}<i>${nome.slice(-2)}</i>`;
  const idMenu = c('vnav') + '-p';
  return `<div class="${c('vdata')}"><div class="${c('vwrap')}">
<span data-vd>${H.dateShort()}</span><span>${H.esc(site.tagline || site.description || '')}</span>
</div></div>
<header class="${c('vtopo')}"><div class="${c('vwrap')}">
<a class="${c('vbrand')}" href="/">${marca}</a>
<button class="${c('vham')}" type="button" data-vham aria-expanded="false" aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<nav class="${c('vnav')}" id="${idMenu}" aria-label="Editorias">${links}</nav>
</div></header>
<script>(function(){var e=document.querySelector('[data-vd]');if(e)e.textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
var b=document.querySelector('[data-vham]'),n=document.getElementById('${idMenu}');if(!b||!n)return;
b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function vFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('vfoot')}"><div class="${c('vwrap')}">
<div class="${c('vcols')}">
<div><div class="${c('vfb')}">${H.esc(site.name)}</div><p style="margin:12px 0 0;max-width:40ch;line-height:1.6;opacity:.88">${H.esc(site.description || '')}</p></div>
<div><div class="${c('vfh')}">Editorias</div>${cats}</div>
<div><div class="${c('vfh')}">Institucional</div>${H.instLinks()}</div>
</div>
<div class="${c('vcp')}">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function vMini(ctx, a, opt) {
  const { c, H } = ctx;
  const o = opt || {};
  const tag = o.h2 ? 'h2' : 'h3';
  return `<a class="${c('vmini')} ${c('reveal')}" href="${H.url(a)}">
<span class="vph">${H.pic(a, !!o.eager)}</span>
<span class="vk">${H.cat(a)}</span><${tag}>${H.esc(a.title)}</${tag}>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}

function vCard(ctx, a, opt) {
  const { c, H } = ctx;
  const o = opt || {};
  const tag = o.h2 ? 'h2' : 'h3';
  return `<a class="${c('vcard')} ${c('reveal')}" href="${H.url(a)}">
<span class="vph">${H.pic(a, !!o.eager)}</span>
<span class="vk">${H.cat(a)}</span><${tag}>${H.esc(a.title)}</${tag}>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 120))}</p>` : ''}</a>`;
}

function vHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const abre = arts[0];
  const alta = arts.slice(1, 5);
  const teto = site.postsOnHome || 60;
  const resto = arts.slice(5, teto);

  const chamada = abre ? `<a class="${c('vlead')}" href="${H.url(abre)}">
<span class="${c('vtx')}"><span class="${c('vchip')}">${H.cat(abre)}</span>
<h2>${H.esc(abre.title)}</h2>
${abre.excerpt ? `<p>${H.esc(H.clip(abre.excerpt, 200))}</p>` : ''}</span>
<span class="${c('vmold')}"><span>${H.pic(abre, true)}</span></span></a>` : '';

  const emAlta = alta.length ? `<div class="${c('valta')}">${alta.map(a => vMini(ctx, a)).join('')}</div>` : '';

  // secoes por editoria de verdade, em multiplo de tres, que e a grade
  const ordem = [], porCat = new Map();
  for (const a of resto) {
    const nome = H.cat(a);
    if (!porCat.has(nome)) { porCat.set(nome, []); ordem.push(nome); }
    porCat.get(nome).push(a);
  }
  const sobra = [], blocos = [];
  for (const nome of ordem) {
    const todos = porCat.get(nome);
    const cabe = Math.min(9, Math.floor(todos.length / 3) * 3);
    if (!cabe) { sobra.push(...todos); continue; }
    sobra.push(...todos.slice(cabe));
    blocos.push(`<section class="${c('vsec')}">
<div class="${c('vsech')}"><span class="vq"></span><h2>${nome}</h2><span class="vln"></span></div>
<div class="${c('vgrid')}">${todos.slice(0, cabe).map(a => vCard(ctx, a)).join('')}</div>
</section>`);
  }
  // a grade final tem quatro colunas: linha pela metade fica com buraco do lado
  const falta = sobra.length % 4;
  if (falta) sobra.push(...arts.slice(teto, teto + (4 - falta)));
  if (sobra.length) blocos.push(`<section class="${c('vsec')}">
<div class="${c('vsech')}"><span class="vq"></span><h2>Mais no ${H.esc(site.shortName || site.name)}</h2><span class="vln"></span></div>
<div class="${c('vcomp')}">${sobra.map(a => vCard(ctx, a)).join('')}</div>
</section>`);

  return `${H.head(ctx, H.homeMeta(site))}
${vHeader(ctx, menu)}
<main><div class="${c('vwrap')}">
${H.h1(ctx)}
${chamada}
${emAlta}
${blocos.join('')}
</div></main>
${vFooter(ctx, menu)}`;
}

function vArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('vfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('vrel')}">
<div class="${c('vsech')}"><span class="vq"></span><h2>Leia também</h2><span class="vln"></span></div>
<div class="${c('vrel3')}">${related.slice(0, 3).map(a => vCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${vHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('vwrap')}">
<article class="${c('vart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('vahead')}">
<span class="${c('vchip')}"><a href="${H.curl(P.catSlug)}" style="color:inherit">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('vdek')}">${H.esc(art.dek)}</p>` : ''}
</div>
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('vbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${vFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function vList(ctx, opts) {
  const { c, H } = ctx;
  const itens = opts.items || [];
  const topo = itens.slice(0, 4);
  const resto = itens.slice(4);
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${vHeader(ctx, opts.menu)}
<main><div class="${c('vwrap')}">
<div class="${c('vsech')}" style="margin-top:30px"><span class="vq"></span><h1>${H.esc(opts.title)}</h1><span class="vln"></span></div>
${topo.length ? `<div class="${c('valta')}">${topo.map((a, i) => vMini(ctx, a, { h2: true, eager: i === 0 })).join('')}</div>` : ''}
${resto.length ? `<div class="${c('vcomp')}" style="margin-top:28px">${resto.map(a => vCard(ctx, a, { h2: true })).join('')}</div>` : ''}
</div></main>
${vFooter(ctx, opts.menu)}`;
}

