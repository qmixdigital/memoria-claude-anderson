function mCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--m2:${p2}}
${s('mwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 24px}
${s('mtop')}{position:sticky;top:0;z-index:45;background:var(--paper);border-bottom:1px solid var(--line)}
${s('mtop')} ${s('mwrap')}{display:flex;align-items:center;gap:26px;min-height:64px;flex-wrap:wrap}
${s('mbrand')}{flex:0 0 auto;font-family:var(--fd);font-weight:800;font-size:clamp(20px,2.6vw,27px);line-height:1;letter-spacing:.13em;color:var(--ink);white-space:nowrap}
${s('mbrand')} b{color:var(--p)}
${s('mnav')}{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:20px;overflow-x:auto;scrollbar-width:none}
${s('mnav')}::-webkit-scrollbar{display:none}
${s('mnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.11em;color:var(--muted);white-space:nowrap;padding:6px 0;border-bottom:2px solid transparent}
${s('mnav')} a:hover{color:var(--ink);border-bottom-color:var(--p)}
${s('mdate')}{flex:0 0 auto;font-family:var(--fb);font-size:11.5px;letter-spacing:.14em;color:var(--muted);white-space:nowrap}
main{padding:26px 0 8px}
${s('mlead')}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.06fr);gap:40px;align-items:center;padding-bottom:32px;border-bottom:1px solid var(--line);margin-bottom:30px}
${s('mleadtx')}{min-width:0}
${s('mleadtx')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.15em;color:#fff;background:var(--p);padding:4px 9px;border-radius:2px}
${s('mleadtx')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(27px,3.4vw,43px);line-height:1.08;letter-spacing:-.02em;margin:15px 0 0;color:var(--ink);text-wrap:balance}
${s('mlead')}:hover ${s('mleadtx')} h2{color:var(--p)}
${s('mleadtx')} p{margin:14px 0 0;color:var(--dek);font-size:16.5px;line-height:1.55;max-width:52ch}
${s('mleadph')}{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;border-radius:var(--rad-lg);background:var(--ph)}
${s('mleadph')} img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('mlead')}:hover ${s('mleadph')} img{transform:scale(1.04)}
${s('mdest')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:26px var(--col);margin-bottom:var(--block)}
${s('mdest')} ${s('mcard')} p{display:none}
${s('mdest')} ${s('mcard')} h3{font-size:17.5px}
${s('msec')}{margin:var(--block) 0 0}
${s('msech')}{display:flex;align-items:center;gap:14px;margin:0 0 20px}
${s('msech')} h1,${s('msech')} h2{font-family:var(--fd);font-weight:800;font-size:23px;letter-spacing:.02em;margin:0;color:var(--ink)}
${s('msech')} .mrule{flex:1;height:1px;background:var(--line)}
${s('msech')} .mdot{width:9px;height:9px;border-radius:50%;background:var(--m2);flex:0 0 auto}
${s('mgrid')}{display:grid;grid-template-columns:repeat(3,1fr);gap:30px var(--col)}
${s('mcard')}{display:block}
${s('mcard')} .mph{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad);margin-bottom:12px}
${s('mcard')} .mph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('mcard')}:hover .mph img{transform:scale(1.05)}
${s('mcard')} .k{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.15em;color:var(--p)}
${s('mcard')} h3{font-family:var(--fd);font-weight:700;font-size:19px;line-height:1.22;letter-spacing:-.01em;margin:6px 0 0;color:var(--ink)}
${s('mcard')}:hover h3{color:var(--p)}
${s('mcard')} p{margin:7px 0 0;color:var(--dek);font-size:14.5px;line-height:1.5}
${s('mart')}{max-width:1120px;margin:0 auto;padding:30px 24px 8px}
${s('mcol')}{max-width:none;display:grid;grid-template-columns:minmax(0,68ch);justify-content:center}
${s('mhead')} .k{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.16em;color:var(--p);margin-bottom:10px}
${s('mhead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(29px,4.4vw,47px);line-height:1.08;letter-spacing:-.022em;margin:0 0 14px;color:var(--ink)}
${s('mdek')}{font-size:19px;line-height:1.5;color:var(--dek);margin:0 0 18px;max-width:62ch}
${s('mfig')}{margin:24px -46px 30px}
${s('mfig')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('mfig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:9px;padding:0 46px;font-style:italic}
${s('mbody')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('mbody')} p{margin:0 0 21px}
${s('mbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('mbody')} h2{font-family:var(--fd);font-weight:800;font-size:26px;letter-spacing:-.01em;margin:36px 0 13px;padding-left:14px;border-left:4px solid var(--p)}
${s('mbody')} h3{font-family:var(--fd);font-weight:700;font-size:20px;margin:26px 0 11px}
${s('mbody')} ul,${s('mbody')} ol{margin:0 0 21px;padding-left:22px}
${s('mbody')} li{margin:0 0 9px}
${s('mbody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('mbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:15px}
${s('mbody')} th,${s('mbody')} td{border:1px solid var(--line);padding:9px 12px;text-align:left}
${s('mbody')} th{background:var(--surface);font-family:var(--fb);font-weight:700}
${s('mbody')} blockquote{margin:26px 0;padding:16px 20px;background:var(--surface);border-radius:var(--rad);font-family:var(--fd);font-size:20px;line-height:1.45}
${s('mrel')}{margin-top:44px;padding-top:10px;border-top:1px solid var(--line)}
${s('mfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:58px;padding:36px 0 22px}
${s('mfoot')} .mcols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:34px}
${s('mfoot')} .mfb{font-family:var(--fd);font-weight:800;font-size:23px;letter-spacing:.1em;color:#fff}
${s('mfoot')} .mfh{font-family:var(--fb);font-size:11.5px;font-weight:700;letter-spacing:.15em;color:#fff;margin-bottom:12px}
${s('mfoot')} a{display:block;color:var(--footer-tx);font-size:14px;padding:4px 0}
${s('mfoot')} a:hover{color:#fff}
${s('mfoot')} .mcp{margin-top:26px;padding-top:16px;border-top:1px solid rgba(255,255,255,.12);font-size:12.5px;opacity:.82}
@media(max-width:1000px){${s('mlead')}{grid-template-columns:1fr;gap:22px}${s('mdest')}{grid-template-columns:repeat(2,minmax(0,1fr))}${s('mgrid')}{grid-template-columns:repeat(2,1fr)}${s('mfig')}{margin-left:0;margin-right:0}${s('mfig')} figcaption{padding:0}}
@media(max-width:620px){${s('mdest')}{grid-template-columns:1fr;gap:26px}${s('mgrid')}{grid-template-columns:1fr;gap:26px}${s('mfoot')} .mcols{grid-template-columns:1fr;gap:24px}${s('mdate')}{display:none}}`;
}

function mHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const corte = Math.ceil(nome.length / 2);
  const marca = `${nome.slice(0, corte)}<b>${nome.slice(corte)}</b>`;
  return `<header class="${c('mtop')}"><div class="${c('mwrap')}">
<a class="${c('mbrand')}" href="/">${marca}</a>
<nav class="${c('mnav')}">${links}</nav>
<span class="${c('mdate')}" data-md>${H.dateShort()}</span>
</div></header>
<script>(function(){var e=document.querySelector('[data-md]');if(e)e.textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})})();</script>`;
}

function mFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('mfoot')}"><div class="${c('mwrap')}">
<div class="mcols">
<div><div class="mfb">${H.esc(site.name)}</div><p style="margin:12px 0 0;max-width:38ch;font-size:14px;line-height:1.55;opacity:.85">${H.esc(site.description || '')}</p></div>
<div><div class="mfh">Editorias</div>${cats}</div>
<div><div class="mfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="mcp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function mLead(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('mlead')}" href="${H.url(a)}">
<span class="${c('mleadtx')}"><span class="k">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 195))}</p>` : ''}</span>
<span class="${c('mleadph')}">${H.pic(a, true)}</span></a>`;
}

function mCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('mcard')} ${c('reveal')}" href="${H.url(a)}">
<span class="mph">${H.pic(a, false)}</span>
<span class="k">${H.cat(a)}</span>
<h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 116))}</p>` : ''}</a>`;
}

function mHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const abre = arts[0];
  const destaque = arts.slice(1, 5);
  const resto = arts.slice(5, site.postsOnHome || 60);
  const tiles = `${abre ? mLead(ctx, abre) : ''}
<div class="${c('mdest')}">${destaque.map(a => mCard(ctx, a)).join('')}</div>`;
  // agrupa por editoria de verdade: fatiar de nove em nove dava secao chamada
  // "Televisao" recheada de materia de Geral
  const ordem = [], porCat = new Map();
  for (const a of resto) {
    const nome = H.cat(a);
    if (!porCat.has(nome)) { porCat.set(nome, []); ordem.push(nome); }
    porCat.get(nome).push(a);
  }
  const sobra = [];
  const blocos = [];
  for (const nome of ordem) {
    const todos = porCat.get(nome);
    // multiplo de tres: a grade tem tres colunas e linha pela metade fica torta
    const cabe = Math.min(9, Math.floor(todos.length / 3) * 3) || todos.length;
    const fatia = todos.slice(0, cabe);
    sobra.push(...todos.slice(cabe));
    blocos.push(`<section class="${c('msec')}">
<div class="${c('msech')}"><span class="mdot"></span><h2>${nome}</h2><span class="mrule"></span></div>
<div class="${c('mgrid')}">${fatia.map(a => mCard(ctx, a)).join('')}</div>
</section>`);
  }
  if (sobra.length) blocos.push(`<section class="${c('msec')}">
<div class="${c('msech')}"><span class="mdot"></span><h2>Mais notícias</h2><span class="mrule"></span></div>
<div class="${c('mgrid')}">${sobra.map(a => mCard(ctx, a)).join('')}</div>
</section>`);
  return `${H.head(ctx, H.homeMeta(site))}
${mHeader(ctx, menu)}
<main><div class="${c('mwrap')}">
${H.h1(ctx)}
${tiles}
${blocos.join('')}
</div></main>
${mFooter(ctx, menu)}`;
}

function mArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('mfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('mrel')}">
<div class="${c('msech')}"><span class="mdot"></span><h2>Leia também</h2><span class="mrule"></span></div>
<div class="${c('mgrid')}">${related.map(a => mCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${mHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('mart')}"><div class="${c('mcol')}"><article>
${H.crumbs(ctx, art, P)}
<div class="${c('mhead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<p class="${c('mdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('mbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></div></main>
${mFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function mList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${mHeader(ctx, opts.menu)}
<main><div class="${c('mwrap')}">
<div class="${c('msech')}" style="margin-top:26px"><span class="mdot"></span><h1>${H.esc(opts.title)}</h1><span class="mrule"></span></div>
<div class="${c('mgrid')}">${opts.items.map(a => mCard(ctx, a)).join('')}</div>
</div></main>
${mFooter(ctx, opts.menu)}`;
}

