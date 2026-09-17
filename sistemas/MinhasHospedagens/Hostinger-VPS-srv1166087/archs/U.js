function uCss(ctx) {
  const { s } = ctx;
  return `
${s('uwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 30px}
${s('umed')}{width:100%;max-width:720px}
${s('utopo')}{padding:30px 0 0}
${s('umast')}{text-align:center;padding-bottom:18px;border-bottom:1px solid var(--ink)}
${s('ubrand')}{display:inline-block;font-family:var(--fd);font-weight:800;font-size:clamp(30px,4.6vw,50px);letter-spacing:-.032em;line-height:1;color:var(--ink)}
${s('ubrand')} i{display:inline-block;width:.34em;height:.34em;background:var(--p);margin-left:.14em;font-style:normal;vertical-align:baseline}
${s('udata')}{margin-top:9px;font-family:var(--fb);font-size:11px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--muted)}
${s('unav')}{display:flex;justify-content:center;flex-wrap:wrap;gap:0;border-bottom:1px solid var(--line)}
${s('unav')} a{position:relative;font-family:var(--fb);font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--ink);padding:14px 20px}
${s('unav')} a::after{content:"";position:absolute;left:20px;right:20px;bottom:0;height:3px;background:var(--p);transform:scaleX(0);transform-origin:left;transition:transform .3s ease}
${s('unav')} a:hover::after{transform:scaleX(1)}
main{padding:0 0 10px}
${s('ucapa')}{display:grid;grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);gap:46px;align-items:center;padding:44px 0 40px;border-bottom:1px solid var(--line)}
${s('ucapa')} .utx{min-width:0}
${s('ucapa')} .k{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--p)}
${s('ucapa')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(30px,3.5vw,47px);line-height:1.04;letter-spacing:-.03em;margin:14px 0 0;color:var(--ink);text-wrap:balance}
${s('ucapa')}:hover h2{color:var(--p)}
${s('ucapa')} p{margin:16px 0 0;font-size:17.5px;line-height:1.62;color:var(--dek);max-width:50ch}
${s('ucapa')} .uass{display:inline-block;margin-top:20px;font-family:var(--fb);font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ink);border-bottom:2px solid var(--p);padding-bottom:4px}
${s('ucapa')} .uph{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad)}
${s('ucapa')} .uph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}
${s('ucapa')}:hover .uph img{transform:scale(1.035)}
${s('usech')}{display:flex;align-items:center;gap:16px;margin:46px 0 24px}
${s('usech')} h1,${s('usech')} h2{font-family:var(--fb);font-weight:700;font-size:11.5px;letter-spacing:.24em;text-transform:uppercase;margin:0;color:var(--p);white-space:nowrap}
${s('usech')} i{flex:1;height:1px;background:var(--ink);opacity:.35;font-style:normal}
${s('ugrade')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:38px 32px}
${s('ucard')}{display:block;min-width:0}
${s('ucard')} .t{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad)}
${s('ucard')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}
${s('ucard')}:hover .t img{transform:scale(1.05)}
${s('ucard')} .k{display:block;margin:15px 0 0;font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.19em;text-transform:uppercase;color:var(--p)}
${s('ucard')} h3{font-family:var(--fd);font-weight:700;font-size:20px;line-height:1.18;letter-spacing:-.018em;margin:8px 0 0;color:var(--ink);text-wrap:balance}
${s('ucard')}:hover h3{color:var(--p)}
${s('ucard')} p{margin:10px 0 0;font-size:15px;line-height:1.58;color:var(--dek)}
${s('ulista')}{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 48px}
${s('uit')}{display:grid;grid-template-columns:74px minmax(0,1fr);gap:18px;padding:20px 0;border-bottom:1px solid var(--line);align-items:start}
${s('uit')} .n{font-family:var(--fd);font-weight:800;font-size:30px;line-height:1;color:var(--p);opacity:.34}
${s('uit')}>span:last-child{min-width:0}
${s('uit')} .k{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
${s('uit')} h3{font-family:var(--fd);font-weight:700;font-size:17.5px;line-height:1.26;letter-spacing:-.014em;margin:6px 0 0;color:var(--ink)}
${s('uit')}:hover h3{color:var(--p)}
${s('uartg')}{display:grid;grid-template-columns:minmax(0,190px) minmax(0,720px);gap:56px;align-items:start;padding:34px 0 8px;justify-content:center}
${s('utrilho')}{position:sticky;top:26px;padding-top:6px}
${s('utrilho')} .k{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.19em;text-transform:uppercase;color:var(--p);padding-bottom:10px;border-bottom:2px solid var(--p)}
${s('utrilho')} dl{margin:16px 0 0}
${s('utrilho')} dt{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:var(--muted);margin-top:14px}
${s('utrilho')} dd{margin:4px 0 0;font-size:14.5px;line-height:1.4;color:var(--ink)}
${s('uart')}{min-width:0}
${s('uahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(29px,3.8vw,44px);line-height:1.06;letter-spacing:-.03em;margin:12px 0 0;color:var(--ink);text-wrap:balance}
${s('udek')}{font-size:19px;line-height:1.55;color:var(--dek);margin:18px 0 0;font-style:italic}
${s('ufig')}{margin:26px 0 30px}
${s('ufig')} img{width:100%;height:auto;display:block;border-radius:var(--rad)}
${s('ufig')} figcaption{font-size:13px;color:var(--muted);margin-top:9px;font-style:italic}
${s('ubody')}{font-size:calc(var(--fs) + 1.5px);line-height:1.8;color:var(--ink)}
${s('ubody')} p{margin:0 0 24px}
${s('ubody')}>p:first-of-type::first-letter{font-family:var(--fd);font-weight:800;float:left;font-size:3.6rem;line-height:.82;padding:8px 12px 0 0;color:var(--p)}
${s('ubody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
${s('ubody')} a:hover{text-decoration-thickness:2px}
${s('ubody')} h2{font-family:var(--fd);font-weight:800;font-size:26px;letter-spacing:-.022em;margin:40px 0 14px;color:var(--ink)}
${s('ubody')} h2::before{content:"";display:block;width:52px;height:3px;background:var(--p);margin-bottom:14px}
${s('ubody')} h3{font-family:var(--fd);font-weight:700;font-size:20px;letter-spacing:-.012em;margin:28px 0 10px;color:var(--ink)}
${s('ubody')} ul,${s('ubody')} ol{margin:0 0 24px;padding-left:22px}
${s('ubody')} li{margin:0 0 10px}
${s('ubody')} li::marker{color:var(--p)}
${s('ubody')} img{max-width:100%;height:auto}
${s('utab')}{overflow-x:auto;-webkit-overflow-scrolling:touch}
${s('ubody')} table{width:100%;border-collapse:collapse;margin:8px 0 28px;font-size:15.5px;background:var(--surface);border-radius:var(--rad);overflow:hidden}
${s('ubody')} th,${s('ubody')} td{border-bottom:1px solid var(--line);padding:13px 15px;text-align:left;vertical-align:top}
${s('ubody')} th{font-family:var(--fb);font-weight:700;font-size:11.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--p)}
${s('ubody')} tr:last-child td{border-bottom:0}
${s('ubody')} blockquote{margin:30px 0;padding:20px 24px;background:var(--surface);border-left:4px solid var(--p);border-radius:var(--rad);font-family:var(--fd);font-size:20px;line-height:1.45;color:var(--ink)}
${s('urel')}{margin-top:56px;padding-top:8px;border-top:1px solid var(--line)}
${s('ufoot')}{margin-top:64px;padding:44px 0 26px;background:var(--footer-bg);color:var(--footer-tx);font-size:14.5px}
${s('ucols')}{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:36px}
${s('ufoot')} .ufb{font-family:var(--fd);font-weight:800;font-size:24px;letter-spacing:-.03em;color:#fff}
${s('ufoot')} .ufb i{display:inline-block;width:.3em;height:.3em;background:var(--p);margin-left:.14em;font-style:normal}
${s('ufoot')} .ufd{margin:13px 0 0;line-height:1.65;max-width:42ch}
${s('ufoot')} .ufh{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.19em;text-transform:uppercase;color:#fff;margin-bottom:13px}
${s('ufoot')} .ulk{display:flex;flex-direction:column;gap:10px}
${s('ufoot')} a{color:var(--footer-tx)}
${s('ufoot')} a:hover{color:#fff}
${s('ufoot')} .ucp{margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,.16);font-size:12.5px}
@media(max-width:980px){
${s('ucapa')}{grid-template-columns:1fr;gap:24px;padding:30px 0}
${s('ucapa')} h2{font-size:clamp(27px,5.4vw,36px)}
${s('ugrade')}{grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 24px}
${s('ulista')}{grid-template-columns:1fr;gap:0}
${s('uartg')}{grid-template-columns:1fr;gap:26px}
${s('utrilho')}{position:static;display:flex;flex-wrap:wrap;gap:0 28px;align-items:baseline}
${s('utrilho')} dl{display:flex;gap:0 26px;flex-wrap:wrap;margin:10px 0 0}
${s('ucols')}{grid-template-columns:1fr 1fr;gap:28px}
}
@media(max-width:620px){
${s('uwrap')}{padding:0 20px}
${s('unav')} a{padding:12px 12px;font-size:11px;letter-spacing:.12em}
${s('ugrade')}{grid-template-columns:1fr;gap:28px}
${s('ucard')} .t{aspect-ratio:16/10}
${s('uit')}{grid-template-columns:56px minmax(0,1fr);gap:14px}
${s('uit')} .n{font-size:24px}
${s('usech')}{margin:34px 0 18px}
${s('ubody')} h2{font-size:23px}
${s('ucols')}{grid-template-columns:1fr;gap:24px}
}`;
}

function uCard(ctx, a, semK) {
  const { c, H } = ctx;
  return `<a class="${c('ucard')}" href="${H.url(a)}">
${a.image ? `<span class="t">${H.pic(a, false)}</span>` : ''}
${semK ? '' : `<span class="k">${H.cat(a)}</span>`}<h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 108))}</p>` : ''}</a>`;
}

function uIt(ctx, a, n, semK) {
  const { c, H } = ctx;
  return `<a class="${c('uit')}" href="${H.url(a)}">
<span class="n">${n < 10 ? '0' + n : n}</span>
<span>${semK ? '' : `<span class="k">${H.cat(a)}</span>`}<h3>${H.esc(a.title)}</h3></span></a>`;
}

function uSech(ctx, titulo, tag) {
  const { c, H } = ctx;
  const t = tag || 'h2';
  return `<div class="${c('usech')}"><${t}>${H.esc(titulo)}</${t}><i></i></div>`;
}

function uHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<header class="${c('utopo')}"><div class="${c('uwrap')}">
<div class="${c('umast')}">
<a class="${c('ubrand')}" href="/">${H.esc(site.shortName || site.name)}<i></i></a>
<div class="${c('udata')}">${H.dateFull()}</div>
</div>
</div>
<nav class="${c('unav')}">${links}</nav>
</header>`;
}

function uFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('ufoot')}"><div class="${c('uwrap')}">
<div class="${c('ucols')}">
<div><div class="ufb">${H.esc(site.name)}<i></i></div>
<p class="ufd">${H.esc(site.description || '')}</p></div>
<div><div class="ufh">Editorias</div><div class="ulk">${cats}</div></div>
<div><div class="ufh">Institucional</div><div class="ulk">${H.instLinks()}</div></div>
</div>
<div class="ucp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function uHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const abre = arts[0];
  const destaque = arts.slice(1, 4);
  const resto = arts.slice(4, site.postsOnHome || 60);
  // portal de uma editoria so: o chapeu repetiria a mesma palavra em tudo
  const semK = new Set(arts.map(a => H.cat(a))).size <= 1;
  const capa = abre ? `<a class="${c('ucapa')}" href="${H.url(abre)}">
<span class="utx">${semK ? '' : `<span class="k">${H.cat(abre)}</span>`}
<h2>${H.esc(abre.title)}</h2>
${abre.excerpt ? `<p>${H.esc(H.clip(abre.excerpt, 205))}</p>` : ''}
<span class="uass">Ler a matéria</span></span>
${abre.image ? `<span class="uph">${H.pic(abre, true)}</span>` : ''}</a>` : '';
  const dest = destaque.length
    ? `<section>${uSech(ctx, 'Em pauta')}<div class="${c('ugrade')}">${destaque.map(a => uCard(ctx, a, semK)).join('')}</div></section>`
    : '';
  const blocos = [];
  for (let i = 0; i < resto.length; i += 12) {
    const fatia = resto.slice(i, i + 12);
    const titulo = fatia[0] ? H.cat(fatia[0]) : 'Mais do acervo';
    blocos.push(`<section>${uSech(ctx, titulo)}
<div class="${c('ulista')}">${fatia.map((a, k) => uIt(ctx, a, i + k + 1, true)).join('')}</div></section>`);
  }
  return `${H.head(ctx, H.homeMeta(site))}
${uHeader(ctx, menu)}
<main><div class="${c('uwrap')}">
${H.h1(ctx)}
${capa}
${dest}
${blocos.join('')}
</div></main>
${uFooter(ctx, menu)}`;
}

function uArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('ufig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const corpo = String(art.content || '').replace(/<table/g, `<div class="${c('utab')}"><table`).replace(/<\/table>/g, '</table></div>');
  const rel = (related && related.length) ? `<section class="${c('urel')}">
${uSech(ctx, 'Leia também')}
<div class="${c('ugrade')}">${related.slice(0, 3).map(a => uCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${uHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('uwrap')}">
<div class="${c('uartg')}">
<aside class="${c('utrilho')}">
<a class="k" href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a>
<dl><dt>Por</dt><dd>${H.esc(art.author || '')}</dd>
<dt>Publicado</dt><dd>${H.esc(P.dstr)}</dd>
<dt>Leitura</dt><dd>${P.readMin} minutos</dd></dl>
</aside>
<article class="${c('uart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('uahead')}">
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('udek')}">${H.esc(art.dek)}</p>` : ''}
</div>
${fig}
<div class="${c('ubody')}">${corpo}</div>
${H.share(ctx, P)}
</article>
</div>
${rel}
</div></main>
${uFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function uList(ctx, opts) {
  const { c, H } = ctx;
  const itens = opts.items || [];
  const grade = itens.slice(0, 6);
  const fila = itens.slice(6);
  const cats = new Set(itens.map(a => H.cat(a)));
  const semK = cats.size <= 1;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${uHeader(ctx, opts.menu)}
<main><div class="${c('uwrap')}">
${uSech(ctx, opts.title, 'h1')}
${grade.length ? `<div class="${c('ugrade')}">${grade.map(a => uCard(ctx, a, semK)).join('')}</div>` : ''}
${fila.length ? `<div class="${c('ulista')}" style="margin-top:36px">${fila.map((a, k) => uIt(ctx, a, k + 7, semK)).join('')}</div>` : ''}
</div></main>
${uFooter(ctx, opts.menu)}`;
}
