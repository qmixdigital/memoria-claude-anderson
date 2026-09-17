function pCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--p2:${p2}}
${s('pwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 26px}
${s('putil')}{border-bottom:1px solid var(--line);font-family:var(--fb);font-size:11px;letter-spacing:.13em;color:var(--muted)}
${s('putil')} ${s('pwrap')}{display:flex;justify-content:space-between;align-items:center;height:32px;gap:14px}
${s('pmast')}{padding:20px 0 14px;text-align:center;border-bottom:3px double var(--ink)}
${s('pbrand')}{font-family:var(--fd);font-weight:900;font-size:clamp(32px,7vw,66px);line-height:.96;letter-spacing:-.028em;color:var(--ink);display:inline-block}
${s('pbrand')} u{text-decoration:none;color:var(--p)}
${s('psub')}{margin-top:9px;font-family:var(--fb);font-size:11px;letter-spacing:.26em;color:var(--muted)}
${s('pnav')}{border-bottom:1px solid var(--ink)}
${s('pnav')} ${s('pwrap')}{display:flex;gap:24px;justify-content:center;flex-wrap:wrap;min-height:42px;align-items:center}
${s('pnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:700;letter-spacing:.12em;color:var(--ink);padding:4px 0;border-bottom:2px solid transparent}
${s('pnav')} a:hover{border-bottom-color:var(--p);color:var(--p)}
main{padding:26px 0 8px}
${s('pcapa')}{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:34px;padding-bottom:26px;border-bottom:1px solid var(--ink);margin-bottom:26px}
${s('pmanchete')} .k{display:block;font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--p);margin-bottom:9px}
${s('pmanchete')} h2{font-family:var(--fd);font-weight:900;font-size:clamp(30px,5vw,56px);line-height:1.02;letter-spacing:-.028em;margin:0 0 12px;color:var(--ink)}
${s('pmanchete')}:hover h2{color:var(--p)}
${s('pmanchete')} .plide{font-size:16.5px;line-height:1.6;color:var(--dek);margin:0;max-width:56ch}
${s('pmanchete')} .pph{display:block;margin-top:18px;aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph)}
${s('pmanchete')} .pph img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.94)}
${s('papoio')}{border-left:1px solid var(--line);padding-left:26px}
${s('papoio')} .t{display:block;aspect-ratio:4/3;overflow:hidden;background:var(--ph);margin-bottom:13px}
${s('papoio')} .t img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.94)}
${s('papoio')} h3{font-family:var(--fd);font-weight:700;font-size:20px;line-height:1.2;letter-spacing:-.012em;margin:0 0 8px;color:var(--ink)}
${s('papoio')}:hover h3{color:var(--p)}
${s('papoio')} p{margin:0;color:var(--dek);font-size:14.5px;line-height:1.5}
${s('pseg')}{margin-top:22px;padding-left:26px;border-left:1px solid var(--line)}
${s('pseg')} a{display:block;padding:14px 0;border-top:1px solid var(--line)}
${s('pseg')} .k{display:block;font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--p)}
${s('pseg')} h4{font-family:var(--fd);font-weight:700;font-size:16px;line-height:1.24;letter-spacing:-.012em;margin:6px 0 0;color:var(--ink)}
${s('pseg')} a:hover h4{color:var(--p)}
${s('pfaixa')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;align-items:start;border-bottom:1px solid var(--ink);padding-bottom:22px;margin-bottom:28px}
${s('pcol')}{padding:0 22px;border-left:1px solid var(--line)}
${s('pcol')}:first-child{padding-left:0;border-left:0}
${s('pcol')}:last-child{padding-right:0}
${s('pnota')}{display:block;padding:0 0 16px;margin-bottom:16px;border-bottom:1px dotted var(--line)}
${s('pnota')}:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}
${s('pnota')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.16em;color:var(--p2)}
${s('pnota')} h4{font-family:var(--fd);font-weight:700;font-size:17px;line-height:1.22;letter-spacing:-.008em;margin:5px 0 0;color:var(--ink)}
${s('pnota')}:hover h4{color:var(--p)}
${s('pnota')} p{margin:6px 0 0;color:var(--dek);font-size:13.5px;line-height:1.48}
${s('psech')}{display:flex;align-items:center;gap:12px;margin:30px 0 18px}
${s('psech')} h1,${s('psech')} h2{font-family:var(--fd);font-weight:900;font-size:21px;letter-spacing:.02em;margin:0;color:var(--ink);white-space:nowrap}
${s('psech')} .pln{flex:1;height:3px;border-top:1px solid var(--ink);border-bottom:1px solid var(--ink)}
${s('pgrid')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
${s('pcard')} .pph{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);margin-bottom:12px}
${s('pcard')} .pph img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.94)}
${s('pcard')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--p)}
${s('pcard')} h3{font-family:var(--fd);font-weight:700;font-size:16.5px;line-height:1.24;margin:5px 0 0;color:var(--ink)}
${s('pcard')}:hover h3{color:var(--p)}
${s('part')}{max-width:660px;margin:0 auto;padding:28px 0 8px}
${s('pahead')}{text-align:center;padding-bottom:18px;border-bottom:1px solid var(--line);margin-bottom:22px}
${s('pahead')} .k{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--p);margin-bottom:11px}
${s('pahead')} h1{font-family:var(--fd);font-weight:900;font-size:clamp(28px,4.4vw,46px);line-height:1.06;letter-spacing:-.026em;margin:0;color:var(--ink)}
${s('pdek')}{font-family:var(--fd);font-size:19px;font-style:italic;line-height:1.5;color:var(--dek);margin:12px 0 0;text-align:center}
${s('pfig')}{margin:0 0 26px}
${s('pfig')} img{width:100%;height:auto;display:block;filter:saturate(.94)}
${s('pfig')} figcaption{font-size:12px;color:var(--muted);margin-top:7px;font-style:italic;padding-top:6px;border-top:1px solid var(--line)}
${s('pbody')}{font-size:calc(var(--fs) + 1px);line-height:1.76;color:var(--ink)}
${s('pbody')} p{margin:0 0 20px}
${s('pbody')}>p:first-of-type::first-letter{font-family:var(--fd);font-weight:900;float:left;font-size:3.9rem;line-height:.8;padding:7px 11px 0 0;color:var(--ink)}
${s('pbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('pbody')} h2{font-family:var(--fd);font-weight:900;font-size:24px;letter-spacing:-.01em;margin:32px 0 12px;padding-bottom:7px;border-bottom:1px solid var(--ink)}
${s('pbody')} h3{font-family:var(--fd);font-weight:700;font-size:19px;margin:24px 0 10px}
${s('pbody')} ul,${s('pbody')} ol{margin:0 0 20px;padding-left:22px}
${s('pbody')} li{margin:0 0 8px}
${s('pbody')} img{max-width:100%;height:auto}
${s('pbody')} table{width:100%;border-collapse:collapse;margin:0 0 22px;font-size:14.5px}
${s('pbody')} th,${s('pbody')} td{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:9px 8px;text-align:left}
${s('pbody')} th{font-family:var(--fb);font-weight:700;border-bottom:2px solid var(--ink)}
${s('pbody')} blockquote{margin:24px 0;padding:0 30px;text-align:center;font-family:var(--fd);font-size:21px;font-style:italic;line-height:1.42;color:var(--ink);border-top:1px solid var(--ink);border-bottom:1px solid var(--ink);padding-top:16px;padding-bottom:16px}
${s('prel')}{max-width:660px;margin:44px auto 0;padding-top:12px;border-top:3px double var(--ink)}
${s('prel3')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px 18px;align-items:start}
${s('prel3')} ${s('pcard')} h3{font-size:14.5px;line-height:1.26}
${s('pfoot')}{margin-top:50px;padding:26px 0 18px;border-top:3px double var(--ink);font-size:13.5px;color:var(--muted)}
${s('pfoot')} .pcols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:28px}
${s('pfoot')} .pfb{font-family:var(--fd);font-weight:900;font-size:21px;letter-spacing:-.02em;color:var(--ink)}
${s('pfoot')} .pfh{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.15em;color:var(--ink);margin-bottom:9px}
${s('pfoot')} a{display:block;color:var(--muted);padding:3px 0}
${s('pfoot')} a:hover{color:var(--p)}
${s('pfoot')} .pcp{margin-top:22px;padding-top:13px;border-top:1px solid var(--line);font-size:12px}
@media(max-width:1000px){${s('pgrid')}{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:860px){
${s('pcapa')}{grid-template-columns:1fr;gap:24px}
${s('papoio')}{border-left:0;padding-left:0;border-top:1px solid var(--line);padding-top:20px}
${s('pseg')}{padding-left:0;border-left:0;margin-top:8px}
${s('pfaixa')}{grid-template-columns:1fr}
${s('pcol')}{padding:18px 0;border-left:0;border-top:1px solid var(--line)}
${s('pcol')}:first-child{border-top:0;padding-top:0}
${s('pfoot')} .pcols{grid-template-columns:1fr;gap:20px}
}
@media(max-width:520px){${s('pgrid')}{grid-template-columns:1fr}${s('putil')} ${s('pwrap')}{font-size:10px}}
@media(max-width:600px){${s('prel3')}{grid-template-columns:1fr;gap:26px}}`;
}

function pHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const marca = nome.replace(/(\S+)$/, '<u>$1</u>');
  return `<div class="${c('putil')}"><div class="${c('pwrap')}">
<span>${H.dateFull()}</span><span>Edição digital</span>
</div></div>
<header class="${c('pmast')}"><div class="${c('pwrap')}">
<a class="${c('pbrand')}" href="/">${marca}</a>
${site.tagline ? `<div class="${c('psub')}">${H.esc(site.tagline)}</div>` : ''}
</div></header>
<nav class="${c('pnav')}"><div class="${c('pwrap')}">${links}</div></nav>`;
}

function pFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('pfoot')}"><div class="${c('pwrap')}">
<div class="pcols">
<div><div class="pfb">${H.esc(site.name)}</div><p style="margin:10px 0 0;max-width:40ch;line-height:1.55">${H.esc(site.description || '')}</p></div>
<div><div class="pfh">Editorias</div>${cats}</div>
<div><div class="pfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="pcp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function pNota(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('pnota')}" href="${H.url(a)}">
<span class="k">${H.cat(a)}</span><h4>${H.esc(a.title)}</h4>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 86))}</p>` : ''}</a>`;
}

function pCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('pcard')} ${c('reveal')}" href="${H.url(a)}">
<span class="pph">${H.pic(a, false)}</span>
<span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3></a>`;
}

function pHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const manchete = arts[0];
  const apoio = arts[1];
  const seguidas = arts.slice(2, 5);
  const faixa = arts.slice(5, 14);
  const resto = arts.slice(14, site.postsOnHome || 60);
  const mHtml = manchete ? `<a class="${c('pmanchete')}" href="${H.url(manchete)}">
<span class="k">${H.cat(manchete)}</span><h2>${H.esc(manchete.title)}</h2>
${manchete.excerpt ? `<p class="plide">${H.esc(H.clip(manchete.excerpt, 320))}</p>` : ''}
<span class="pph">${H.pic(manchete, true)}</span></a>` : '';
  const aHtml = apoio ? `<a class="${c('papoio')}" href="${H.url(apoio)}">
<span class="t">${H.pic(apoio, false)}</span>
<h3>${H.esc(apoio.title)}</h3>
${apoio.excerpt ? `<p>${H.esc(H.clip(apoio.excerpt, 150))}</p>` : ''}</a>` : '';
  const sHtml = seguidas.length ? `<div class="${c('pseg')}">
${seguidas.map(a => `<a href="${H.url(a)}"><span class="k">${H.cat(a)}</span><h4>${H.esc(a.title)}</h4></a>`).join('')}
</div>` : '';
  const colunas = [0, 1, 2].map(i =>
    `<div class="${c('pcol')}">${faixa.slice(i * 3, i * 3 + 3).map(a => pNota(ctx, a)).join('')}</div>`).join('');
  const blocos = [];
  for (let i = 0; i < resto.length; i += 8) {
    const fatia = resto.slice(i, i + 8);
    const titulo = fatia[0] ? H.cat(fatia[0]) : 'Mais notícias';
    blocos.push(`<section><div class="${c('psech')}"><h2>${titulo}</h2><span class="pln"></span></div>
<div class="${c('pgrid')}">${fatia.map(a => pCard(ctx, a)).join('')}</div></section>`);
  }
  return `${H.head(ctx, H.homeMeta(site))}
${pHeader(ctx, menu)}
<main><div class="${c('pwrap')}">
${H.h1(ctx)}
<div class="${c('pcapa')}">${mHtml}<div>${aHtml}${sHtml}</div></div>
${faixa.length ? `<div class="${c('pfaixa')}">${colunas}</div>` : ''}
${blocos.join('')}
</div></main>
${pFooter(ctx, menu)}`;
}

function pArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('pfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('prel')}">
<div class="${c('psech')}"><h2>Leia também</h2><span class="pln"></span></div>
<div class="${c('prel3')}">${related.slice(0, 3).map(a => pCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${pHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('pwrap')}">
<article class="${c('part')}">
${H.crumbs(ctx, art, P)}
<div class="${c('pahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('pdek')}">${H.esc(art.dek)}</p>` : ''}
</div>
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('pbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${pFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
