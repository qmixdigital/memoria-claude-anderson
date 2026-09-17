function wCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--w2:${p2}}
${s('wwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 28px}
${s('wmed')}{width:100%;max-width:768px}
${s('wtarja')}{background:var(--p);color:var(--onp)}
${s('wtarja')} ${s('wwrap')}{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:36px;font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
${s('wtopo')}{padding:24px 0 18px;border-bottom:1px solid var(--line)}
${s('wtopo')} ${s('wwrap')}{display:flex;align-items:center;justify-content:space-between;gap:26px;flex-wrap:wrap}
${s('wbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(25px,3vw,36px);letter-spacing:-.028em;color:var(--ink);white-space:nowrap;line-height:1}
${s('wbrand')} u{text-decoration:none;border-bottom:4px solid var(--p);padding-bottom:4px}
${s('wnav')}{display:flex;gap:24px;flex-wrap:wrap}
${s('wnav')} a{position:relative;font-family:var(--fb);font-size:12.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);padding:7px 0}
${s('wnav')} a::after{content:"";position:absolute;left:0;right:100%;bottom:0;height:2px;background:var(--p);transition:right .3s ease}
${s('wnav')} a:hover{color:var(--ink)}
${s('wnav')} a:hover::after{right:0}
main{padding:0 0 8px}
${s('wcapa')}{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:44px;align-items:center;padding:40px 0 38px;border-bottom:1px solid var(--line)}
${s('wcapa')} .wtx{min-width:0}
${s('wcapa')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--onp);background:var(--p);padding:4px 10px}
${s('wcapa')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(30px,3.5vw,46px);line-height:1.06;letter-spacing:-.028em;margin:16px 0 0;color:var(--ink);text-wrap:balance}
${s('wcapa')}:hover h2{color:var(--p)}
${s('wcapa')} p{margin:16px 0 0;font-size:17px;line-height:1.6;color:var(--dek);max-width:52ch}
${s('wcapa')} .wass{margin:18px 0 0;font-family:var(--fb);font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
${s('wcapa')} .wph{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph)}
${s('wcapa')} .wph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('wcapa')}:hover .wph img{transform:scale(1.03)}
${s('wsech')}{display:flex;align-items:center;gap:18px;margin:44px 0 22px}
${s('wsech')} h1,${s('wsech')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(20px,2.1vw,27px);letter-spacing:-.022em;margin:0;color:var(--ink);white-space:nowrap}
${s('wsech')} i{flex:1;height:2px;background:var(--line);font-style:normal}
${s('wgrid')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:34px 30px}
${s('wcard')}{display:block;min-width:0}
${s('wcard')} .t{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph)}
${s('wcard')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('wcard')}:hover .t img{transform:scale(1.05)}
${s('wcard')} .k{display:block;margin:14px 0 0;font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:var(--p)}
${s('wcard')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;line-height:1.2;letter-spacing:-.016em;margin:7px 0 0;color:var(--ink);text-wrap:balance}
${s('wcard')}:hover h3{color:var(--p)}
${s('wcard')} p{margin:9px 0 0;font-size:14.5px;line-height:1.55;color:var(--dek)}
${s('wlista')}{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 44px}
${s('wfila')}{display:grid;grid-template-columns:minmax(0,1fr) 128px;gap:20px;padding:20px 0;border-bottom:1px solid var(--line);align-items:start}
${s('wfila')} .t{display:block;aspect-ratio:4/3;overflow:hidden;background:var(--ph)}
${s('wfila')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('wfila')}:hover .t img{transform:scale(1.06)}
${s('wfila')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
${s('wfila')}>span{display:block;min-width:0}
${s('wfila')} h3{font-family:var(--fd);font-weight:700;font-size:17.5px;line-height:1.25;letter-spacing:-.014em;margin:6px 0 0;color:var(--ink)}
${s('wfila')}:hover h3{color:var(--p)}
${s('wfila')} p{margin:7px 0 0;font-size:14px;line-height:1.5;color:var(--dek)}
${s('wsemfoto')}{grid-template-columns:1fr}
${s('wartg')}{display:grid;grid-template-columns:minmax(0,768px) minmax(0,300px);gap:60px;align-items:start;padding:30px 0 8px}
${s('wart')}{min-width:0}
${s('wrail')}{position:sticky;top:24px;border-top:3px solid var(--p);padding-top:16px}
${s('wrail')} .wrh{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:var(--p);margin-bottom:14px}
${s('wrail')} a{display:block;padding:14px 0;border-bottom:1px solid var(--line)}
${s('wrail')} a:last-child{border-bottom:0}
${s('wrail')} .k{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
${s('wrail')} h3{font-family:var(--fd);font-weight:700;font-size:16px;line-height:1.26;letter-spacing:-.012em;margin:6px 0 0;color:var(--ink)}
${s('wrail')} a:hover h3{color:var(--p)}
${s('wahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:var(--onp);background:var(--p);padding:5px 11px;margin-bottom:14px}
${s('wahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,3.6vw,42px);line-height:1.08;letter-spacing:-.026em;margin:0 0 14px;color:var(--ink);text-wrap:balance}
${s('wdek')}{font-size:18px;line-height:1.55;color:var(--dek);margin:0 0 18px}
${s('wfig')}{margin:22px 0 30px}
${s('wfig')} img{width:100%;height:auto;display:block}
${s('wfig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:9px;font-style:italic}
${s('wbody')}{font-size:calc(var(--fs) + 1px);line-height:1.8;color:var(--ink)}
${s('wbody')} p{margin:0 0 22px}
${s('wbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
${s('wbody')} a:hover{text-decoration-thickness:2px}
${s('wbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.018em;margin:38px 0 14px;color:var(--ink);padding-bottom:8px;border-bottom:2px solid var(--p)}
${s('wbody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;letter-spacing:-.01em;margin:26px 0 10px;color:var(--ink)}
${s('wbody')} ul,${s('wbody')} ol{margin:0 0 22px;padding-left:22px}
${s('wbody')} li{margin:0 0 10px}
${s('wbody')} li::marker{color:var(--p)}
${s('wbody')} img{max-width:100%;height:auto}
${s('wbody')} table{width:100%;border-collapse:collapse;margin:6px 0 26px;font-size:15px;background:var(--surface)}
${s('wbody')} th,${s('wbody')} td{border-bottom:1px solid var(--line);padding:12px 14px;text-align:left;vertical-align:top}
${s('wbody')} th{font-family:var(--fb);font-weight:700;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--p);border-bottom:2px solid var(--p);background:transparent}
${s('wbody')} tr:last-child td{border-bottom:0}
${s('wtab')}{overflow-x:auto;-webkit-overflow-scrolling:touch}
${s('wbody')} blockquote{margin:28px 0;padding:16px 0 16px 22px;border-left:4px solid var(--p);font-family:var(--fd);font-size:20px;line-height:1.45;color:var(--ink)}
${s('wrel')}{margin-top:52px}
${s('wfoot')}{margin-top:60px;padding:40px 0 24px;border-top:3px solid var(--p);background:var(--footer-bg);color:var(--footer-tx);font-size:14px}
${s('wfcol')}{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:36px}
${s('wfoot')} .wfb{font-family:var(--fd);font-weight:800;font-size:23px;letter-spacing:-.026em;color:var(--ink)}
${s('wfoot')} .wfb u{text-decoration:none;border-bottom:3px solid var(--p);padding-bottom:3px}
${s('wfoot')} .wfd{margin:12px 0 0;line-height:1.65;max-width:44ch}
${s('wfoot')} .wfh{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:var(--ink);margin-bottom:12px}
${s('wfoot')} .wlk{display:flex;flex-direction:column;gap:9px}
${s('wfoot')} a{color:var(--footer-tx)}
${s('wfoot')} a:hover{color:var(--p)}
${s('wfoot')} .wcp{margin-top:30px;padding-top:15px;border-top:1px solid var(--line);font-size:12.5px}
@media(max-width:980px){
${s('wcapa')}{grid-template-columns:1fr;gap:24px;padding:30px 0}
${s('wartg')}{grid-template-columns:1fr;gap:34px}
${s('wrail')}{position:static}
${s('wcapa')} h2{font-size:clamp(27px,5.4vw,36px)}
${s('wgrid')}{grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 24px}
${s('wlista')}{grid-template-columns:1fr;gap:0}
${s('wfcol')}{grid-template-columns:1fr 1fr;gap:28px}
}
@media(max-width:620px){
${s('wwrap')}{padding:0 20px}
${s('wtopo')} ${s('wwrap')}{gap:14px}
${s('wnav')}{gap:16px}
${s('wnav')} a{font-size:11.5px;letter-spacing:.1em}
${s('wgrid')}{grid-template-columns:1fr;gap:26px}
${s('wcard')} .t{aspect-ratio:16/10}
${s('wfila')}{grid-template-columns:minmax(0,1fr) 96px;gap:14px}
${s('wsech')}{margin:32px 0 16px;gap:12px}
${s('wbody')} h2{font-size:22px}
${s('wfcol')}{grid-template-columns:1fr;gap:24px}
${s('wtarja')} ${s('wwrap')}{font-size:10px;letter-spacing:.1em}
}`;
}

function wFila(ctx, a, semK) {
  const { c, H } = ctx;
  const temFoto = !!a.image;
  return `<a class="${c('wfila')}${temFoto ? '' : ' ' + c('wsemfoto')}" href="${H.url(a)}">
<span>${semK ? '' : `<span class="k">${H.cat(a)}</span>`}<h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 104))}</p>` : ''}</span>
${temFoto ? `<span class="t">${H.pic(a, false)}</span>` : ''}</a>`;
}

function wCard(ctx, a, semK) {
  const { c, H } = ctx;
  return `<a class="${c('wcard')}" href="${H.url(a)}">
${a.image ? `<span class="t">${H.pic(a, false)}</span>` : ''}
${semK ? '' : `<span class="k">${H.cat(a)}</span>`}<h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 112))}</p>` : ''}</a>`;
}

function wSech(ctx, titulo, tag) {
  const { c, H } = ctx;
  const t = tag || 'h2';
  return `<div class="${c('wsech')}"><${t}>${H.esc(titulo)}</${t}><i></i></div>`;
}

function wHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const marca = nome.replace(/^(\S+)/, '<u>$1</u>');
  return `<div class="${c('wtarja')}"><div class="${c('wwrap')}">
<span>${H.dateFull()}</span><span>Boletim</span>
</div></div>
<header class="${c('wtopo')}"><div class="${c('wwrap')}">
<a class="${c('wbrand')}" href="/">${marca}</a>
<nav class="${c('wnav')}">${links}</nav>
</div></header>`;
}

function wFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.name);
  const marca = nome.replace(/^(\S+)/, '<u>$1</u>');
  return `<footer class="${c('wfoot')}"><div class="${c('wwrap')}">
<div class="${c('wfcol')}">
<div><div class="wfb">${marca}</div>
<p class="wfd">${H.esc(site.description || '')}</p></div>
<div><div class="wfh">Editorias</div><div class="wlk">${cats}</div></div>
<div><div class="wfh">Institucional</div><div class="wlk">${H.instLinks()}</div></div>
</div>
<div class="wcp">&copy; ${H.year()} ${nome}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function wHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const abre = arts[0];
  const destaques = arts.slice(1, 4);
  const resto = arts.slice(4, site.postsOnHome || 60);
  const capa = abre ? `<a class="${c('wcapa')}" href="${H.url(abre)}">
<span class="wtx"><span class="k">${H.cat(abre)}</span>
<h2>${H.esc(abre.title)}</h2>
${abre.excerpt ? `<p>${H.esc(H.clip(abre.excerpt, 210))}</p>` : ''}
<span class="wass">Leia a reportagem</span></span>
${abre.image ? `<span class="wph">${H.pic(abre, true)}</span>` : ''}</a>` : '';
  const destHtml = destaques.length
    ? `<section>${wSech(ctx, 'Em destaque')}<div class="${c('wgrid')}">${destaques.map(a => wCard(ctx, a)).join('')}</div></section>`
    : '';
  const blocos = [];
  for (let i = 0; i < resto.length; i += 12) {
    const fatia = resto.slice(i, i + 12);
    const titulo = fatia[0] ? H.cat(fatia[0]) : 'Mais notícias';
    blocos.push(`<section>${wSech(ctx, titulo)}
<div class="${c('wlista')}">${fatia.map(a => wFila(ctx, a)).join('')}</div></section>`);
  }
  return `${H.head(ctx, H.homeMeta(site))}
${wHeader(ctx, menu)}
<main><div class="${c('wwrap')}">
${H.h1(ctx)}
${capa}
${destHtml}
${blocos.join('')}
</div></main>
${wFooter(ctx, menu)}`;
}

function wArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('wfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const corpo = String(art.content || '').replace(/<table/g, `<div class="${c('wtab')}"><table`).replace(/<\/table>/g, '</table></div>');
  const trilho = (related && related.length) ? `<aside class="${c('wrail')}">
<div class="wrh">Leia também</div>
${related.slice(0, 5).map(a => `<a href="${H.url(a)}"><span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3></a>`).join('')}
</aside>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${wHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('wwrap')}">
<div class="${c('wartg')}">
<article class="${c('wart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('wahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/" style="color:inherit">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<p class="${c('wdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('wbody')}">${corpo}</div>
${H.share(ctx, P)}
</article>
${trilho}
</div>
</div></main>
${wFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function wList(ctx, opts) {
  const { c, H } = ctx;
  const itens = opts.items || [];
  const grade = itens.slice(0, 6);
  const fila = itens.slice(6);
  // numa pagina de editoria o chapeu de cada cartao repetiria o titulo da
  // pagina em todos eles, entao ele so aparece quando ha mais de uma editoria
  const cats = new Set(itens.map(a => H.cat(a)));
  const semK = cats.size <= 1;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${wHeader(ctx, opts.menu)}
<main><div class="${c('wwrap')}">
${wSech(ctx, opts.title, 'h1')}
${grade.length ? `<div class="${c('wgrid')}">${grade.map(a => wCard(ctx, a, semK)).join('')}</div>` : ''}
${fila.length ? `<div class="${c('wlista')}" style="margin-top:34px">${fila.map(a => wFila(ctx, a, semK)).join('')}</div>` : ''}
</div></main>
${wFooter(ctx, opts.menu)}`;
}
