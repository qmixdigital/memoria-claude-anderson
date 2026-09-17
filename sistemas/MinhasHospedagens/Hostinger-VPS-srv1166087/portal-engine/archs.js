'use strict';
/**
 * archs.js — arquetipos estruturais dos portais (A..E).
 *
 * Cada portal usa UM arquetipo. Os nomes de classe sao prefixados por portal
 * (ctx.c/ctx.s) e os valores de design vem de tokens CSS (var(--rad-lg), --gap,
 * --hero-ar, etc.), de modo que dois portais do MESMO arquetipo ainda divergem
 * em nomes de classe, raio, sombra, espacamento, proporcao e tipografia.
 *
 * Contrato de cada arquetipo: { css, header, footer, home, article, list }.
 * Recebem `ctx` = { site, fp, T, c, s, H } onde:
 *   c(k) -> "prefixo-k"   s(k) -> ".prefixo-k"   (classes unicas por portal)
 *   T    -> tokens resolvidos (radius/shadow/spacing/container/baseFs/ratios)
 *   H    -> helpers compartilhados (esc, stripTags, pic, head, progressScript,
 *           share, crumbs, schema*)
 *   site -> registro do site
 *
 * 'A' editorial classico | 'B' magazine split | 'C' cyber newsroom |
 * 'D' broadsheet/wire (rail lateral) | 'E' minimal/zine (tipografico).
 */

// ============================================================ ARQUETIPO A
// editorial classico: topbar + masthead central + nav + lead/grid + single .body (drop-cap)
function aCss(ctx) {
  const { s } = ctx;
  return `
${s('topbar')}{background:var(--bar-bg);color:var(--bar-tx)}
${s('topbar')} ${s('wrap')}{display:flex;justify-content:space-between;align-items:center;height:34px;font-size:12px;letter-spacing:.08em;}
${s('topbar')} .d{opacity:.72}
${s('mast')}{padding:22px 0 14px;text-align:center;border-bottom:1px solid var(--line)}
${s('brand')}{font-family:var(--fd);font-weight:900;font-size:clamp(30px,6vw,58px);letter-spacing:-.02em;line-height:1;color:var(--ink);display:inline-block}
${s('brand')} b{color:var(--p)}
${s('tagline')}{margin-top:8px;font-size:12px;letter-spacing:.22em;color:var(--muted)}
${s('nav')}{border-bottom:2px solid var(--ink)}
${s('nav')} ${s('wrap')}{display:flex;gap:26px;justify-content:center;flex-wrap:wrap;height:46px;align-items:center}
${s('nav')} a{font-size:13px;font-weight:600;letter-spacing:.1em;color:var(--ink);padding:4px 0}
${s('nav')} a:hover{color:var(--p)}
main{padding:var(--block) 0 10px}
${s('lead')}{display:grid;grid-template-columns:1.15fr .85fr;gap:38px;align-items:center;padding-bottom:var(--sec);border-bottom:1px solid var(--line);margin-bottom:var(--sec)}
${s('lead')} .ph{aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad-lg)}
${s('lead')} .ph img{width:100%;height:100%;object-fit:cover;display:block}
${s('lead')} h2{font-family:var(--fd);font-weight:900;font-size:clamp(28px,4.4vw,50px);line-height:1.04;letter-spacing:-.02em;margin:.45rem 0 .5rem}
${s('lead')}:hover h2{color:var(--p)}
${s('grid')}{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sec) var(--col)}
${s('card')} .ph{aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);margin-bottom:12px;border-radius:var(--rad-lg)}
${s('card')} .ph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('card')}:hover .ph img{transform:scale(1.04)}
${s('card')} h3{font-family:var(--fd);font-weight:600;font-size:21px;line-height:1.18;letter-spacing:-.01em;margin:.35rem 0 0}
${s('card')}:hover h3{color:var(--p)}
${s('sechead')}{display:flex;align-items:baseline;gap:14px;margin:var(--block) 0 22px}
${s('sechead')} h1,${s('sechead')} h2{font-family:var(--fd);font-weight:900;font-size:24px;letter-spacing:-.01em;margin:0}
${s('sechead')} .bar{flex:1;height:2px;background:var(--ink)}
${s('art')}{max-width:740px;margin:0 auto;padding:var(--block) 0 10px}
${s('art')} h1{font-family:var(--fd);font-weight:900;font-size:clamp(30px,4.6vw,48px);line-height:1.08;letter-spacing:-.022em;margin:0 0 16px}
${s('art')} figure{margin:0 0 28px}
${s('art')} figure img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('art')} figcaption{font-size:13px;color:var(--muted);margin-top:8px;font-style:italic}
${s('body')}{font-size:calc(var(--fs) + 1px);line-height:1.75}
${s('body')} p{margin:0 0 22px}
${s('body')}>p:first-of-type::first-letter{font-family:var(--fd);font-weight:900;float:left;font-size:4.1rem;line-height:.82;padding:6px 12px 0 0;color:var(--p)}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:2px}
${s('body')} h2{font-family:var(--fd);font-weight:700;font-size:28px;letter-spacing:-.01em;margin:36px 0 14px}
${s('body')} h3{font-family:var(--fd);font-weight:600;font-size:22px;margin:28px 0 12px}
${s('body')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('body')} blockquote{margin:26px 0;padding:6px 0 6px 22px;border-left:3px solid var(--p);font-family:var(--fd);font-size:22px;font-style:italic;color:var(--ink)}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('rel')}{max-width:var(--maxw);margin:54px auto 0;border-top:2px solid var(--ink);padding-top:26px}
${s('foot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:var(--block);padding:48px 0 30px;font-size:15px}
${s('foot')} .cols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:34px;padding-bottom:30px;border-bottom:1px solid rgba(255,255,255,.12)}
${s('foot')} .fb{font-family:var(--fd);font-weight:900;font-size:30px;color:#fff}
${s('foot')} .fh{font-size:12px;letter-spacing:.16em;color:#fff;margin:0 0 12px;opacity:.75;font-weight:700}
${s('foot')} a{display:block;color:var(--footer-tx);padding:5px 0}
${s('foot')} a:hover{color:#fff}
${s('foot')} .cp{padding-top:20px;font-size:13px;opacity:.7}
@media(max-width:900px){${s('lead')}{grid-template-columns:1fr;gap:18px}${s('grid')}{grid-template-columns:1fr 1fr;gap:28px 22px}${s('foot')} .cols{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('grid')}{grid-template-columns:1fr}${s('nav')} ${s('wrap')}{gap:16px;justify-content:flex-start;overflow-x:auto;white-space:nowrap}${s('foot')} .cols{grid-template-columns:1fr}${s('body')}>p:first-of-type::first-letter{font-size:3.2rem}}`;
}
function aHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const dstr = H.dateFull();
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<div class="${c('topbar')}"><div class="${c('wrap')}"><span class="d">${H.esc(dstr)}</span><span>${H.esc(site.tagline || 'Notícias em tempo real')}</span></div></div>
<header class="${c('mast')}"><div class="${c('wrap')}">
<a class="${c('brand')}" href="/" rel="home">${brand}</a>
<div class="${c('tagline')}">${H.esc(site.description || '')}</div>
</div></header>
<nav class="${c('nav')}" aria-label="Editorias"><div class="${c('wrap')}">${links}</div></nav>`;
}
function aFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('foot')}"><div class="${c('wrap')}">
<div class="cols">
<div><div class="fb">${H.esc(site.name)}</div><p style="margin:12px 0 0;max-width:36ch;color:#b8b1a6">${H.esc(site.description || '')}</p></div>
<div><div class="fh">Editorias</div>${cats || '<a href="/">Início</a>'}</div>
<div><div class="fh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}
function aHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const lead = arts[0];
  const rest = arts.slice(1, site.postsOnHome || 12);
  const leadHtml = lead ? `<a class="${c('lead')}" href="${H.url(lead)}"><div class="ph">${H.pic(lead, true)}</div>
<div><span class="${c('kicker')}">${H.cat(lead)}</span><h2>${H.esc(lead.title)}</h2>${lead.excerpt ? `<p class="${c('dek')}">${H.esc(H.clip(lead.excerpt, 160))}</p>` : ''}</div></a>` : '';
  return `${H.head(ctx, H.homeMeta(site))}
${aHeader(ctx, menu)}
<main><div class="${c('wrap')}">
${H.h1(ctx)}
${leadHtml}
<div class="${c('grid')}">${rest.map(a => aCard(ctx, a)).join('')}</div>
</div></main>
${aFooter(ctx, menu)}`;
}
function aCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('card')} ${c('reveal')}" href="${H.url(a)}">
<div class="ph">${H.pic(a, false)}</div><span class="${c('kicker')}">${H.cat(a)}</span>
<h3>${H.esc(a.title)}</h3></a>`;
}
function aArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure>${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('rel')}"><div class="${c('sechead')}"><h2>Leia também</h2><span class="bar"></span></div>
<div class="${c('grid')}">${related.map(a => aCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${aHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><article class="${c('art')}">
${H.crumbs(ctx, art, P)}
<span class="${c('kicker')}"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</main>
${aFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function aList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${aHeader(ctx, opts.menu)}
<main><div class="${c('wrap')}">
<div class="${c('sechead')}"><h1>${H.esc(opts.title)}</h1><span class="bar"></span></div>
<div class="${c('grid')}">${opts.items.map(a => aCard(ctx, a)).join('')}</div>
</div></main>
${aFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO B
// magazine split: header split + fhero + feed/sidebar + single post-head/prose
function bCss(ctx) {
  const { s } = ctx;
  return `
${s('hd')}{position:sticky;top:0;z-index:40;background:var(--paper);border-bottom:1px solid var(--line)}
${s('hd')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:66px;padding-top:10px;padding-bottom:10px;flex-wrap:wrap}
${s('brand')}{font-family:var(--fd);font-weight:800;font-size:28px;letter-spacing:-.02em;color:var(--ink)}
${s('hdnav')}{display:flex;gap:22px;flex-wrap:wrap}
${s('hdnav')} a{font-size:13px;font-weight:600;letter-spacing:.08em;color:var(--muted)}
${s('hdnav')} a:hover{color:var(--p)}
main{padding:34px 0 10px}
${s('hero')}{display:grid;grid-template-columns:1.25fr .9fr;gap:34px;align-items:center;margin-bottom:36px;padding-bottom:var(--sec);border-bottom:1px solid var(--line)}
${s('hero')} .m{aspect-ratio:var(--hero-ar);overflow:hidden;border-radius:var(--rad-lg);background:var(--ph)}
${s('hero')} .m img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('hero')}:hover .m img{transform:scale(1.04)}
${s('hero')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(28px,4.2vw,46px);line-height:1.06;letter-spacing:-.02em;margin:.5rem 0}
${s('hero')}:hover h2{color:var(--p)}
${s('hero')} .hd{font-size:18px;color:var(--dek);margin:0}
${s('feed')}{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:46px;align-items:start}
${s('feedh')}{font-family:var(--fd);font-weight:800;font-size:15px;letter-spacing:.12em;color:var(--ink);margin:0 0 14px;padding-bottom:10px;border-bottom:2px solid var(--p)}
${s('item')}{display:grid;grid-template-columns:152px minmax(0,1fr);gap:18px;padding:18px 0;border-bottom:1px solid var(--line)}
${s('item')} .t{aspect-ratio:var(--card-ar);overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('item')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('item')}:hover .t img{transform:scale(1.05)}
${s('item')} .h{font-family:var(--fd);font-weight:700;font-size:20px;line-height:1.2;letter-spacing:-.01em;margin:.3rem 0;display:block}
${s('item')}:hover .h{color:var(--p)}
${s('item')} .k{color:var(--dek);font-size:14.5px;margin:0;display:block}
${s('side')}{position:sticky;top:90px}
${s('sideitem')}{display:block;padding:12px 0;border-bottom:1px solid var(--line)}
${s('sideitem')} .t{font-family:var(--fd);font-weight:600;font-size:16px;line-height:1.25;color:var(--ink);display:block}
${s('sideitem')}:hover .t{color:var(--p)}
${s('wrapn')}{max-width:760px;margin:0 auto;padding:0 24px}
${s('phead')}{padding:40px 0 22px;text-align:left}
${s('phead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(30px,4.8vw,50px);line-height:1.06;letter-spacing:-.022em;margin:0 0 16px}
${s('phero')}{max-width:1080px;margin:6px auto 30px;padding:0 24px}
${s('phero')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('phero')} figcaption{font-size:13px;color:var(--muted);margin-top:8px;font-style:italic;padding:0 4px}
${s('body')}{font-size:calc(var(--fs) + 1px);line-height:1.8}
${s('body')} p{margin:0 0 22px}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:2px}
${s('body')} h2{font-family:var(--fd);font-weight:700;font-size:27px;letter-spacing:-.01em;margin:38px 0 14px}
${s('body')} h3{font-family:var(--fd);font-weight:600;font-size:21px;margin:28px 0 12px}
${s('body')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('body')} blockquote{margin:26px 0;padding:14px 22px;border-left:3px solid var(--p);background:var(--surface);border-radius:0 var(--rad) var(--rad) 0;font-family:var(--fd);font-size:21px;font-style:italic}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('rel')}{margin-top:42px;border-top:1px solid var(--line);padding-top:8px}
${s('foot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:56px;padding:30px 0;font-size:14px}
${s('foot')} .r{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.12)}
${s('foot')} .fb{font-family:var(--fd);font-weight:800;font-size:24px;color:#fff}
${s('foot')} .n{display:flex;gap:18px;flex-wrap:wrap}
${s('foot')} .n a{color:var(--footer-tx)}${s('foot')} .n a:hover{color:#fff}
${s('foot')} .cp{padding-top:14px;font-size:12.5px;opacity:.85}
@media(max-width:860px){${s('hero')}{grid-template-columns:1fr;gap:18px}${s('feed')}{grid-template-columns:1fr;gap:32px}${s('side')}{position:static}}
@media(max-width:560px){${s('item')}{grid-template-columns:104px minmax(0,1fr);gap:12px}${s('foot')} .r{flex-direction:column;align-items:flex-start}${s('hd')} ${s('wrap')}{min-height:auto}}`;
}
function bHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('hd')}"><div class="${c('wrap')}">
<a class="${c('brand')}" href="/" rel="home">${H.esc(site.name)}</a>
<nav class="${c('hdnav')}" aria-label="Editorias">${links}</nav>
</div></header>`;
}
function bFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('foot')}"><div class="${c('wrap')}">
<div class="r">
<a class="fb" href="/" rel="home">${H.esc(site.name)}</a>
<nav class="n" aria-label="Rodapé">${cats}${H.instLinks()}</nav>
</div>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}
function bHero(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  return `<a class="${c('hero')}" href="${H.url(a)}"><div class="m">${H.pic(a, true)}</div>
<div><span class="${c('kicker')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>${a.excerpt ? `<p class="hd">${H.esc(H.clip(a.excerpt, 170))}</p>` : ''}</div></a>`;
}
function bItem(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('item')} ${c('reveal')}" href="${H.url(a)}"><div class="t">${H.pic(a, false)}</div>
<div><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span>${a.excerpt ? `<span class="k">${H.esc(H.clip(a.excerpt, 120))}</span>` : ''}</div></a>`;
}
function bHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const hero = arts[0];
  const main = arts.slice(1, site.postsOnHome || 12);
  const side = arts.slice(0, 7).map(a => `<a class="${c('sideitem')}" href="${H.url(a)}"><span class="${c('kicker')}">${H.cat(a)}</span><span class="t">${H.esc(a.title)}</span></a>`).join('');
  return `${H.head(ctx, H.homeMeta(site))}
${bHeader(ctx, menu)}
<main><div class="${c('wrap')}">
${H.h1(ctx)}
${bHero(ctx, hero)}
<div class="${c('feed')}">
<div><div class="${c('feedh')}">Últimas</div>${main.map(a => bItem(ctx, a)).join('')}</div>
<aside class="${c('side')}"><div class="${c('feedh')}">Mais recentes</div>${side}</aside>
</div>
</div></main>
${bFooter(ctx, menu)}`;
}
function bArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('phero')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('rel')}"><div class="${c('wrapn')}"><div class="${c('feedh')}">Leia também</div>${related.map(a => bItem(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${bHeader(ctx, menu)}
${H.progressBar(ctx)}
<main>
<header class="${c('phead')}"><div class="${c('wrapn')}">
${H.crumbs(ctx, art, P)}
<span class="${c('kicker')}"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div></header>
${fig}
<div class="${c('wrapn')}"><div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}</div>
${rel}
</main>
${bFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function bList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${bHeader(ctx, opts.menu)}
<main><div class="${c('wrap')}">
<h1 class="${c('feedh')}">${H.esc(opts.title)}</h1>
<div>${opts.items.map(a => bItem(ctx, a)).join('')}</div>
</div></main>
${bFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO C
// cyber newsroom: ticker AO VIVO + brand central + nav sticky + hero+rail + blocos por editoria + single 2-col
function cCss(ctx) {
  const { s, fp } = ctx;
  const glow = fp.paletteMode === 'dark' ? 'text-shadow:0 0 22px rgba(255,255,255,.10)' : '';
  return `
main{padding:0 0 10px}
${s('ticker')}{background:var(--bar-bg);color:var(--bar-tx);font-family:var(--fb);font-size:12px;border-bottom:1px solid var(--line)}
${s('ticker')} ${s('wrap')}{display:flex;align-items:center;gap:14px;height:36px;letter-spacing:.02em}
${s('live')}{display:inline-flex;align-items:center;gap:7px;color:var(--p);font-weight:800;font-family:var(--fd);letter-spacing:.12em;font-size:11px}
${s('live')}::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--p);animation:tgpulse 1.8s infinite}
@keyframes tgpulse{0%{box-shadow:0 0 0 0 var(--p)}70%{box-shadow:0 0 0 7px transparent}100%{box-shadow:0 0 0 0 transparent}}
${s('date')}{opacity:.75;text-transform:capitalize}
${s('ttag')}{margin-left:auto;opacity:.6;letter-spacing:.14em;font-size:11px}
${s('brandbar')}{background:var(--paper);border-bottom:1px solid var(--line)}
${s('brandbar')} ${s('wrap')}{display:flex;align-items:center;justify-content:center;padding:20px 24px}
${s('brand')}{font-family:var(--fd);font-weight:700;font-size:clamp(26px,5vw,44px);letter-spacing:.02em;color:var(--ink);${glow}}
${s('brand')} b{color:var(--p)}
${s('nav')}{position:sticky;top:0;z-index:40;background:var(--bar-bg);border-bottom:2px solid var(--p)}
${s('nav')} ${s('wrap')}{display:flex;align-items:stretch;position:relative}
${s('navtog')}{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
${s('burger')}{display:none}
${s('links')}{display:flex;gap:4px;flex-wrap:wrap;align-items:stretch;flex:1;min-width:0;overflow-x:auto}
${s('nav')} a{font-family:var(--fd);font-size:13px;font-weight:600;letter-spacing:.06em;color:var(--bar-tx);padding:13px 14px;border-bottom:3px solid transparent;white-space:nowrap}
${s('nav')} a:hover{color:var(--p);border-bottom-color:var(--p)}
${s('tag')}{display:inline-block;font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--p)}
${s('tag')} a{color:var(--p)}
${s('hero')}{display:grid;grid-template-columns:1.6fr 1fr;gap:30px;padding:30px 0 8px;border-bottom:1px solid var(--line);margin-bottom:30px}
${s('lede')}{display:block;min-width:0}
${s('lede')} .i{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad);margin-bottom:14px}
${s('lede')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('lede')}:hover .i img{transform:scale(1.03)}
${s('lede')} h2{font-family:var(--fd);font-weight:700;font-size:clamp(24px,3.4vw,40px);line-height:1.08;letter-spacing:-.01em;margin:.4rem 0;color:var(--ink)}
${s('lede')}:hover h2{color:var(--p)}
${s('lede')} .d{font-size:17px;color:var(--dek);margin:0}
${s('railh')}{font-family:var(--fd);font-weight:700;font-size:14px;letter-spacing:.14em;color:var(--ink);margin:0 0 6px;padding-bottom:10px;border-bottom:2px solid var(--p)}
${s('railitem')}{display:grid;grid-template-columns:30px 1fr;gap:12px;align-items:start;padding:13px 0;border-bottom:1px solid var(--line)}
${s('railitem')} .n{font-family:var(--fd);font-weight:700;font-size:20px;color:var(--p);line-height:1;opacity:.85}
${s('railitem')} .h{font-family:var(--fd);font-weight:600;font-size:15.5px;line-height:1.25;color:var(--ink)}
${s('railitem')}:hover .h{color:var(--p)}
${s('sec')}{margin:34px 0}
${s('sech')}{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 18px;border-left:4px solid var(--p);padding-left:12px}
${s('sech')} h1,${s('sech')} h2{font-family:var(--fd);font-weight:700;font-size:20px;letter-spacing:.04em;color:var(--ink);margin:0}
${s('secmore')}{font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--muted)}
${s('secmore')}:hover{color:var(--p)}
${s('grid')}{display:grid;grid-template-columns:repeat(4,1fr);gap:24px 20px}
${s('card')}{display:block;background:var(--surface);border:1px solid var(--line);border-radius:var(--rad);overflow:hidden;box-shadow:var(--shadow);transition:border-color .2s,transform .2s}
${s('card')}:hover{border-color:var(--p);transform:translateY(-3px)}
${s('card')} .i{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph)}
${s('card')} .i img{width:100%;height:100%;object-fit:cover;display:block}
${s('card')} .b{display:block;padding:13px 14px 16px}
${s('card')} .h{display:block;font-family:var(--fd);font-weight:600;font-size:16px;line-height:1.22;letter-spacing:-.005em;color:var(--ink);margin-top:7px}
${s('card')}:hover .h{color:var(--p)}
${s('art')}{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:42px;align-items:start;padding:30px 0 10px}
${s('story')}{min-width:0}
${s('story')} h1{font-family:var(--fd);font-weight:700;font-size:clamp(27px,4vw,42px);line-height:1.1;letter-spacing:-.01em;margin:0 0 14px;color:var(--ink)}
${s('fig')}{margin:0 0 26px}
${s('fig')} img{width:100%;height:auto;display:block;border-radius:var(--rad)}
${s('fig')} figcaption{font-size:13px;color:var(--muted);margin-top:8px;font-style:italic}
${s('body')}{font-size:var(--fs);line-height:1.78;color:var(--ink)}
${s('body')} p{margin:0 0 20px}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:2px}
${s('body')} h2{font-family:var(--fd);font-weight:700;font-size:25px;margin:34px 0 13px}
${s('body')} h3{font-family:var(--fd);font-weight:600;font-size:20px;margin:26px 0 11px}
${s('body')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('body')} blockquote{margin:24px 0;padding:12px 20px;border-left:4px solid var(--p);background:var(--surface);font-family:var(--fd);font-size:19px;color:var(--ink)}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('aside')}{position:sticky;top:64px;background:var(--surface);border:1px solid var(--line);border-radius:var(--rad);padding:18px 18px 8px}
${s('asideh')}{font-family:var(--fd);font-weight:700;font-size:13px;letter-spacing:.12em;color:var(--ink);margin:0 0 6px;padding-bottom:10px;border-bottom:2px solid var(--p)}
${s('foot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:50px;padding:42px 0 26px;font-family:var(--fb);font-size:14px;border-top:2px solid var(--p)}
${s('foot')} .g{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:30px;padding-bottom:26px;border-bottom:1px solid rgba(255,255,255,.1)}
${s('foot')} .l{font-family:var(--fd);font-weight:700;font-size:24px;color:#fff}
${s('foot')} .h{font-family:var(--fd);font-size:12px;letter-spacing:.14em;color:#fff;margin:0 0 12px;opacity:.8}
${s('foot')} a{display:block;color:var(--footer-tx);padding:5px 0}
${s('foot')} a:hover{color:var(--p)}
${s('foot')} .cp{padding-top:18px;font-size:12.5px;opacity:.7}
@media(max-width:920px){${s('hero')}{grid-template-columns:1fr;gap:22px}${s('art')}{grid-template-columns:1fr;gap:30px}${s('aside')}{position:static}${s('grid')}{grid-template-columns:repeat(2,1fr)}${s('foot')} .g{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('grid')}{grid-template-columns:1fr}${s('ttag')}{display:none}${s('foot')} .g{grid-template-columns:1fr}${s('brandbar')} ${s('wrap')}{padding:14px 16px}${s('hero')}{padding-top:22px;gap:20px}${s('railitem')}{padding:14px 0}${s('burger')}{display:inline-flex;align-items:center;gap:12px;min-height:50px;padding:0 2px;color:var(--bar-tx);font-family:var(--fd);font-weight:700;font-size:13px;letter-spacing:.14em;cursor:pointer}${s('burger')} span{position:relative;display:block;width:22px;height:2px;background:currentColor;transition:.25s}${s('burger')} span::before,${s('burger')} span::after{content:"";position:absolute;left:0;width:22px;height:2px;background:currentColor;transition:.25s}${s('burger')} span::before{top:-7px}${s('burger')} span::after{top:7px}${s('links')}{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;gap:0;flex-wrap:nowrap;background:var(--bar-bg);border-bottom:2px solid var(--p);box-shadow:0 14px 26px -12px rgba(0,0,0,.55);padding:2px 0;overflow:visible}${s('navtog')}:checked ~ ${s('links')}{display:flex}${s('links')} a{padding:15px 18px;border-bottom:1px solid var(--line);border-top:0;white-space:normal}${s('links')} a:last-child{border-bottom:0}${s('navtog')}:checked ~ ${s('burger')} span{background:transparent}${s('navtog')}:checked ~ ${s('burger')} span::before{transform:rotate(45deg);top:0}${s('navtog')}:checked ~ ${s('burger')} span::after{transform:rotate(-45deg);top:0}}
@media(max-width:560px){
${s('links')} a{min-height:48px;display:flex;align-items:center}
${s('secmore')}{padding:6px 0}
${s('card')}:active{border-color:var(--p);transform:scale(.985)}
${s('card')}:active .h{color:var(--p)}
${s('lede')}:active h2{color:var(--p)}
${s('railitem')}:active .h{color:var(--p)}
${s('railitem')}:active{background:rgba(127,127,127,.06)}
${s('nav')} a:active,${s('links')} a:active{background:rgba(127,127,127,.16);color:var(--p)}
${s('secmore')}:active{color:var(--p)}}`;
}
function cHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const dstr = H.dateFull();
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<div class="${c('ticker')}"><div class="${c('wrap')}"><span class="${c('live')}">Ao vivo</span><span class="${c('date')}">${H.esc(dstr)}</span><span class="${c('ttag')}">${H.esc(site.tagline || 'Notícias')}</span></div></div>
<header class="${c('brandbar')}"><div class="${c('wrap')}"><a class="${c('brand')}" href="/" rel="home">${brand}</a></div></header>
<nav class="${c('nav')}" aria-label="Editorias"><div class="${c('wrap')}"><input type="checkbox" id="${c('navtog')}" class="${c('navtog')}"><label for="${c('navtog')}" class="${c('burger')}" aria-label="Abrir menu de editorias"><span></span><i>Menu</i></label><div class="${c('links')}">${links}</div></div></nav>`;
}
function cFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('foot')}"><div class="${c('wrap')}">
<div class="g">
<div><div class="l">${H.esc(site.name)}</div><p style="margin:12px 0 0;max-width:42ch">${H.esc(site.description || '')}</p></div>
<div><div class="h">Editorias</div>${cats || '<a href="/">Início</a>'}</div>
<div><div class="h">Institucional</div>${H.instLinks()}</div>
</div>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}
function cLede(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  return `<a class="${c('lede')}" href="${H.url(a)}"><span class="i">${H.pic(a, true)}</span><span class="${c('tag')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>${a.excerpt ? `<p class="d">${H.esc(H.clip(a.excerpt, 180))}</p>` : ''}</a>`;
}
function cCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('card')} ${c('reveal')}" href="${H.url(a)}"><span class="i">${H.pic(a, false)}</span><span class="b"><span class="${c('tag')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></span></a>`;
}
function cRail(ctx, a, n) {
  const { c, H } = ctx;
  return `<a class="${c('railitem')}" href="${H.url(a)}"><span class="n">${n}</span><span class="h">${H.esc(a.title)}</span></a>`;
}
function cHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const hero = arts[0];
  const rail = arts.slice(1, 6).map((a, i) => cRail(ctx, a, i + 2)).join('');
  const byCat = new Map();
  for (const a of arts) { const cs = a.category ? a.category.slug : 'noticias'; if (!byCat.has(cs)) byCat.set(cs, { name: a.category ? a.category.name : 'Notícias', items: [] }); byCat.get(cs).items.push(a); }
  const blocks = [...byCat.entries()].filter(([, v]) => v.items.length).map(([cs, v]) =>
    `<section class="${c('sec')}"><div class="${c('sech')}"><h2>${H.esc(v.name)}</h2><a class="${c('secmore')}" href="/${H.esc(cs)}/">ver tudo</a></div>
<div class="${c('grid')}">${v.items.slice(0, 4).map(a => cCard(ctx, a)).join('')}</div></section>`).join('\n');
  return `${H.head(ctx, H.homeMeta(ctx.site))}
${cHeader(ctx, menu)}
<main><div class="${c('wrap')}">
${H.h1(ctx)}
<section class="${c('hero')}">
<div>${cLede(ctx, hero)}</div>
<div><div class="${c('railh')}">Manchetes</div>${rail}</div>
</section>
${blocks}
</div></main>
${cFooter(ctx, menu)}`;
}
function cArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('fig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rail = (related && related.length)
    ? `<aside class="${c('aside')}"><div class="${c('asideh')}">Relacionadas</div>${related.map((a, i) => cRail(ctx, a, i + 1)).join('')}</aside>`
    : `<aside class="${c('aside')}"><div class="${c('asideh')}">Editorias</div>${(menu || []).map((x, i) => `<a class="${c('railitem')}" href="/${H.esc(x.slug)}/"><span class="n">${i + 1}</span><span class="h">${H.esc(x.name)}</span></a>`).join('')}</aside>`;
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${cHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('wrap')}"><div class="${c('art')}">
<article class="${c('story')}">
${H.crumbs(ctx, art, P)}
<span class="${c('tag')}"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rail}
</div></div></main>
${cFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function cList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${cHeader(ctx, opts.menu)}
<main><div class="${c('wrap')}">
<div class="${c('sech')}" style="margin-top:30px"><h1>${H.esc(opts.title)}</h1></div>
<div class="${c('grid')}" style="margin-top:18px">${opts.items.map(a => cCard(ctx, a)).join('')}</div>
</div></main>
${cFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO D
// broadsheet/wire: utility bar + header logo-esquerda + nav inline + home com destaque grande + rail "ultimas" + 2 blocos + single largo com aside notas
function dCss(ctx) {
  const { s } = ctx;
  return `
${s('util')}{background:var(--bar-bg);color:var(--bar-tx);font-size:12px;letter-spacing:.04em}
${s('util')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;height:32px;}
${s('util')} .d{opacity:.7}
${s('hd')}{background:var(--paper);border-bottom:3px double var(--ink)}
${s('hd')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 24px;flex-wrap:wrap}
${s('brand')}{font-family:var(--fd);font-weight:900;font-size:clamp(26px,4.6vw,42px);letter-spacing:-.02em;color:var(--ink)}
${s('brand')} b{color:var(--p)}
${s('nav')}{display:flex;gap:18px;flex-wrap:wrap}
${s('nav')} a{font-family:var(--fd);font-size:13px;font-weight:700;letter-spacing:.04em;color:var(--ink);padding:6px 0;border-bottom:2px solid transparent}
${s('nav')} a:hover{color:var(--p);border-bottom-color:var(--p)}
${s('navtog')}{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
${s('burger')}{display:none}
main{padding:32px 0 10px}
${s('top')}{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:var(--col);align-items:start;padding-bottom:var(--sec);border-bottom:2px solid var(--ink);margin-bottom:var(--sec)}
${s('feat')}{display:block}
${s('feat')} .i{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad-lg);margin-bottom:14px}
${s('feat')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('feat')}:hover .i img{transform:scale(1.03)}
${s('feat')} h2{font-family:var(--fd);font-weight:900;font-size:clamp(26px,3.8vw,44px);line-height:1.05;letter-spacing:-.02em;margin:.3rem 0;color:var(--ink)}
${s('feat')}:hover h2{color:var(--p)}
${s('feat')} .d{font-size:18px;color:var(--dek);margin:0;max-width:60ch}
${s('rail')}{border-left:1px solid var(--line);padding-left:var(--col)}
${s('railh')}{font-family:var(--fd);font-weight:900;font-size:13px;letter-spacing:.16em;color:var(--p);margin:0 0 4px;padding-bottom:10px;border-bottom:1px solid var(--line)}
${s('railitem')}{display:block;padding:12px 0;border-bottom:1px solid var(--line)}
${s('railitem')} .h{font-family:var(--fd);font-weight:600;font-size:16px;line-height:1.24;color:var(--ink)}
${s('railitem')}:hover .h{color:var(--p)}
${s('railitem')} time{display:block;font-size:11px;letter-spacing:.06em;color:var(--muted);margin-top:4px}
${s('sec')}{margin:var(--block) 0 0}
${s('sech')}{font-family:var(--fd);font-weight:900;font-size:22px;letter-spacing:-.01em;color:var(--ink);margin:0 0 18px;padding-bottom:8px;border-bottom:2px solid var(--ink);display:flex;justify-content:space-between;align-items:baseline}
${s('sech')} a{font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--muted)}
${s('sech')} a:hover{color:var(--p)}
${s('grid')}{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sec) var(--col)}
${s('card')} .i{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad);margin-bottom:12px}
${s('card')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('card')}:hover .i img{transform:scale(1.04)}
${s('card')} .h{font-family:var(--fd);font-weight:700;font-size:19px;line-height:1.2;letter-spacing:-.01em;color:var(--ink);margin:.3rem 0 0;display:block}
${s('card')}:hover .h{color:var(--p)}
${s('art')}{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:var(--col);align-items:start;max-width:1040px;margin:0 auto;padding:36px 0 10px}
${s('story')}{min-width:0}
${s('story')} h1{font-family:var(--fd);font-weight:900;font-size:clamp(30px,4.6vw,50px);line-height:1.06;letter-spacing:-.022em;margin:0 0 16px;color:var(--ink)}
${s('story')} figure{margin:0 0 26px}
${s('story')} figure img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('story')} figcaption{font-size:13px;color:var(--muted);margin-top:8px;font-style:italic}
${s('body')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('body')} p{margin:0 0 22px}
${s('body')}>p:first-of-type{font-size:1.12em;color:var(--ink)}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:2px}
${s('body')} h2{font-family:var(--fd);font-weight:800;font-size:27px;margin:36px 0 13px}
${s('body')} h3{font-family:var(--fd);font-weight:700;font-size:21px;margin:28px 0 11px}
${s('body')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('body')} blockquote{margin:28px 0;padding:4px 0 4px 24px;border-left:4px solid var(--p);font-family:var(--fd);font-size:23px;font-style:italic;color:var(--ink)}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('aside')}{position:sticky;top:30px}
${s('asideh')}{font-family:var(--fd);font-weight:900;font-size:12px;letter-spacing:.16em;color:var(--p);margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid var(--line)}
${s('aside')} a{display:block;padding:10px 0;border-bottom:1px solid var(--line);font-family:var(--fd);font-weight:600;font-size:15px;line-height:1.24;color:var(--ink)}
${s('aside')} a:hover{color:var(--p)}
${s('foot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:var(--block);padding:46px 0 28px;font-size:14px;border-top:3px double var(--p)}
${s('foot')} .g{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:30px;padding-bottom:26px;border-bottom:1px solid rgba(255,255,255,.1)}
${s('foot')} .l{font-family:var(--fd);font-weight:900;font-size:26px;color:#fff}
${s('foot')} .h{font-family:var(--fd);font-size:12px;letter-spacing:.14em;color:#fff;margin:0 0 12px;opacity:.8}
${s('foot')} a{display:block;color:var(--footer-tx);padding:5px 0}
${s('foot')} a:hover{color:var(--p)}
${s('foot')} .cp{padding-top:18px;font-size:12.5px;opacity:.7}
@media(max-width:900px){${s('top')}{grid-template-columns:1fr;gap:30px}${s('rail')}{border-left:0;padding-left:0;border-top:1px solid var(--line);padding-top:18px}${s('grid')}{grid-template-columns:1fr 1fr}${s('art')}{grid-template-columns:1fr;gap:30px}${s('aside')}{position:static}${s('foot')} .g{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('grid')}{grid-template-columns:1fr}${s('foot')} .g{grid-template-columns:1fr}
${s('hd')} ${s('wrap')}{padding:12px 16px;gap:6px;flex-direction:column;align-items:flex-start}
${s('brand')}{font-size:clamp(24px,7vw,32px)}
${s('nav')}{flex-wrap:nowrap;overflow-x:auto;width:100%;gap:0;border-top:1px solid var(--line);padding-top:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
${s('nav')}::-webkit-scrollbar{display:none}
${s('nav')} a{flex:0 0 auto;padding:12px 0;margin-right:20px;white-space:nowrap;border-bottom:0;min-height:46px;display:inline-flex;align-items:center}
${s('nav')} a:active{color:var(--p)}
${s('feat')}:active h2{color:var(--p)}
${s('card')}:active .h{color:var(--p)}
${s('railitem')}:active .h{color:var(--p)}}`;
}
function dHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const dstr = H.dateFull();
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<div class="${c('util')}"><div class="${c('wrap')}"><span class="d">${H.esc(dstr)}</span><span>${H.esc(site.tagline || 'Notícias em tempo real')}</span></div></div>
<header class="${c('hd')}"><div class="${c('wrap')}">
<a class="${c('brand')}" href="/" rel="home"${site.logoSvg ? ' style="display:inline-flex;align-items:center;gap:11px;text-decoration:none"' : ''}>${site.logoSvg ? site.logoSvg + '<span>' + brand + '</span>' : brand}</a>
<nav class="${c('nav')}" aria-label="Editorias">${links}</nav>
</div></header>`;
}
function dFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('foot')}"><div class="${c('wrap')}">
<div class="g">
<div><div class="l">${H.esc(site.name)}</div><p style="margin:12px 0 0;max-width:42ch">${H.esc(site.description || '')}</p></div>
<div><div class="h">Editorias</div>${cats || '<a href="/">Início</a>'}</div>
<div><div class="h">Institucional</div>${H.instLinks()}</div>
</div>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}
function dFeat(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  return `<a class="${c('feat')}" href="${H.url(a)}"><span class="i">${H.pic(a, true)}</span><span class="${c('kicker')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>${a.excerpt ? `<p class="d">${H.esc(H.clip(a.excerpt, 190))}</p>` : ''}</a>`;
}
function dCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('card')} ${c('reveal')}" href="${H.url(a)}"><span class="i">${H.pic(a, false)}</span><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></a>`;
}
function dRail(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('railitem')}" href="${H.url(a)}"><span class="h">${H.esc(a.title)}</span><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}
function dHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const feat = arts[0];
  const rail = arts.slice(1, 7).map(a => dRail(ctx, a)).join('');
  const rest = arts.slice(7);
  const byCat = new Map();
  for (const a of rest) { const cs = a.category ? a.category.slug : 'noticias'; if (!byCat.has(cs)) byCat.set(cs, { name: a.category ? a.category.name : 'Notícias', items: [] }); byCat.get(cs).items.push(a); }
  const blocks = [...byCat.entries()].filter(([, v]) => v.items.length >= 2).slice(0, 6).map(([cs, v]) =>
    `<section class="${c('sec')}"><div class="${c('sech')}">${H.esc(v.name)}<a href="/${H.esc(cs)}/">ver tudo</a></div>
<div class="${c('grid')}">${v.items.slice(0, 3).map(a => dCard(ctx, a)).join('')}</div></section>`).join('\n');
  return `${H.head(ctx, H.homeMeta(ctx.site))}
${dHeader(ctx, menu)}
<main><div class="${c('wrap')}">
${H.h1(ctx)}
<div class="${c('top')}">
<div>${dFeat(ctx, feat)}</div>
<div class="${c('rail')}"><div class="${c('railh')}">${H.esc(ctx.site.latestLabel || 'Últimas')}</div>${rail}</div>
</div>
${blocks}
</div></main>
${dFooter(ctx, menu)}`;
}
function dArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure>${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const aside = (related && related.length)
    ? `<aside class="${c('aside')}"><div class="${c('asideh')}">Leia também</div>${related.map(a => `<a href="${H.url(a)}">${H.esc(a.title)}</a>`).join('')}</aside>`
    : `<aside class="${c('aside')}"><div class="${c('asideh')}">Editorias</div>${(menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('')}</aside>`;
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${dHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('wrap')}"><div class="${c('art')}">
<article class="${c('story')}">
${H.crumbs(ctx, art, P)}
<span class="${c('kicker')}"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${aside}
</div></div></main>
${dFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function dList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${dHeader(ctx, opts.menu)}
<main><div class="${c('wrap')}">
<div class="${c('sech')}" style="margin-top:30px">${H.esc(opts.title)}</div>
<div class="${c('grid')}">${opts.items.map(a => dCard(ctx, a)).join('')}</div>
</div></main>
${dFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO E
// editorial moderno: faixa de data + header sticky com nav sublinhada + capa
// (matéria de destaque com cartão sobreposto à imagem + coluna "Em destaque") +
// grade de cards "Mais recentes" + single estreito com capitular e citações com filetes.
function eCss(ctx) {
  const { s } = ctx;
  return `
${s('top')}{background:var(--paper);border-top:3px solid var(--p);border-bottom:1px solid var(--line)}
${s('top')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;height:36px;font-size:11px;letter-spacing:.16em;color:var(--muted)}
${s('top')} .tl{color:var(--p);font-weight:600}
${s('hd')}{position:sticky;top:0;z-index:40;background:color-mix(in srgb,var(--paper) 90%,transparent);backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid var(--line)}
${s('hd')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;gap:16px;height:66px}
${s('brand')}{font-family:var(--fd);font-weight:800;font-size:26px;letter-spacing:-.01em;color:var(--ink)}
${s('brand')} b{color:var(--p)}
${s('nav')}{display:flex;gap:22px;flex-wrap:wrap}
${s('nav')} a{position:relative;font-size:13px;font-weight:600;letter-spacing:.02em;color:var(--ink);padding:5px 0}
${s('nav')} a::after{content:"";position:absolute;left:0;bottom:0;width:0;height:2px;background:var(--p);transition:width .25s ease}
${s('nav')} a:hover{color:var(--p)}${s('nav')} a:hover::after{width:100%}
main{padding:var(--block) 0 10px}
${s('cover')}{display:grid;grid-template-columns:1.55fr 1fr;gap:44px;align-items:start;padding-bottom:var(--sec);margin-bottom:var(--block);border-bottom:1px solid var(--line)}
${s('lead')}{display:block;position:relative}
${s('lead')} .im{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;border-radius:var(--rad-lg);background:var(--ph)}
${s('lead')} .im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
${s('lead')}:hover .im img{transform:scale(1.04)}
${s('lead')} .cap{position:relative;z-index:2;margin:-82px 36px 0;background:var(--surface);border:1px solid var(--line);border-radius:var(--rad-lg);padding:26px 32px 28px;box-shadow:0 26px 54px -30px rgba(16,38,58,.55)}
${s('lead')} .cap h2{font-family:var(--fd);font-weight:800;font-size:clamp(28px,3.3vw,44px);line-height:1.03;letter-spacing:-.02em;margin:.5rem 0 .55rem;color:var(--ink)}
${s('lead')}:hover .cap h2{color:var(--p)}
${s('lead')} .cap .d{font-size:17px;line-height:1.5;color:var(--dek);margin:0;max-width:54ch}
${s('eyebrow')}{font-family:var(--fd);font-weight:800;font-size:12px;letter-spacing:.2em;color:var(--p);margin:0 0 2px;padding-bottom:12px;border-bottom:2px solid var(--p)}
${s('rail')}{display:flex;flex-direction:column}
${s('feat')}{display:grid;grid-template-columns:minmax(0,1fr) 94px;gap:16px;align-items:center;padding:18px 0;border-bottom:1px solid var(--line)}
${s('feat')} .im{display:block;aspect-ratio:1/1;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('feat')} .im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('feat')}:hover .im img{transform:scale(1.05)}
${s('feat')} .h{font-family:var(--fd);font-weight:700;font-size:17px;line-height:1.22;letter-spacing:-.01em;color:var(--ink);margin:.3rem 0 0;display:block}
${s('feat')}:hover .h{color:var(--p)}
${s('feat')} .k{display:block;margin-bottom:3px}
${s('shead')}{display:flex;align-items:center;gap:20px;margin:0 0 26px}
${s('shead')} .t{font-family:var(--fd);font-weight:800;font-size:clamp(20px,2.4vw,28px);letter-spacing:-.01em;color:var(--ink);margin:0;white-space:nowrap}
${s('shead')} .ln{flex:1;height:1px;background:var(--line)}
${s('grid')}{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--block) var(--col)}
${s('card')}{display:block}
${s('card')} .im{display:block;aspect-ratio:var(--card-ar);overflow:hidden;border-radius:var(--rad-lg);background:var(--ph);margin-bottom:14px}
${s('card')} .im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('card')}:hover .im img{transform:scale(1.04)}
${s('card')} .h{font-family:var(--fd);font-weight:700;font-size:20px;line-height:1.2;letter-spacing:-.01em;color:var(--ink);margin:.45rem 0 0;display:block}
${s('card')}:hover .h{color:var(--p)}
${s('card')} .k{display:block;margin-bottom:2px}
${s('art')}{max-width:720px;margin:0 auto;padding:var(--block) 0 10px}
${s('art')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(32px,5vw,54px);line-height:1.04;letter-spacing:-.025em;margin:0 0 18px;color:var(--ink)}
${s('art')} figure{margin:28px 0}
${s('art')} figure img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('art')} figcaption{font-size:13px;color:var(--muted);margin-top:8px;font-style:italic}
${s('body')}{font-size:calc(var(--fs) + 2px);line-height:1.82}
${s('body')} p{margin:0 0 24px}
${s('body')}>p:first-of-type::first-letter{font-family:var(--fd);font-weight:800;float:left;font-size:4rem;line-height:.78;padding:8px 14px 0 0;color:var(--p)}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('body')} h2{font-family:var(--fd);font-weight:700;font-size:27px;letter-spacing:-.01em;margin:40px 0 14px}
${s('body')} h3{font-family:var(--fd);font-weight:600;font-size:21px;margin:28px 0 12px}
${s('body')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('body')} blockquote{margin:34px 0;padding:14px 0;border-top:2px solid var(--p);border-bottom:2px solid var(--p);font-family:var(--fd);font-weight:600;font-size:25px;line-height:1.32;letter-spacing:-.01em;color:var(--ink);text-align:center}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('rel')}{max-width:var(--maxw);margin:56px auto 0;border-top:2px solid var(--ink);padding-top:26px}
${s('foot')}{margin-top:var(--block);padding:50px 0 30px;border-top:1px solid var(--line);background:var(--paper)}
${s('foot')} .top{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;justify-content:space-between;padding-bottom:26px;border-bottom:1px solid var(--line)}
${s('foot')} .l{font-family:var(--fd);font-weight:800;font-size:24px;color:var(--ink)}
${s('foot')} .l b{color:var(--p)}
${s('foot')} .ds{color:var(--muted);font-size:14px;line-height:1.5;max-width:44ch;margin:8px 0 0}
${s('foot')} .n{display:flex;gap:18px;flex-wrap:wrap}
${s('foot')} .n a{font-size:13px;color:var(--muted)}${s('foot')} .n a:hover{color:var(--p)}
${s('foot')} .cp{padding-top:20px;font-size:12.5px;color:var(--muted)}
@media(max-width:920px){${s('cover')}{grid-template-columns:1fr;gap:30px}${s('grid')}{grid-template-columns:1fr 1fr}${s('top')} .tl{display:none}}
@media(max-width:720px){${s('hd')} ${s('wrap')}{height:auto;flex-wrap:wrap;gap:6px 16px;padding:10px 0}${s('brand')}{font-size:23px}${s('nav')}{width:100%;flex-wrap:nowrap;overflow-x:auto;gap:20px;padding-bottom:2px;-webkit-overflow-scrolling:touch}${s('nav')} a{white-space:nowrap}}
@media(max-width:560px){${s('lead')} .cap{margin:-52px 14px 0;padding:20px}${s('grid')}{grid-template-columns:1fr}${s('feat')}{grid-template-columns:minmax(0,1fr) 78px}}`;
}
function eHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const dstr = H.dateFull();
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<div class="${c('top')}"><div class="${c('wrap')}"><span class="dt">${H.esc(dstr)}</span><span class="tl">${H.esc(site.tagline || 'Edição diária')}</span></div></div>
<header class="${c('hd')}"><div class="${c('wrap')}">
<a class="${c('brand')}" href="/" rel="home">${brand}</a>
<nav class="${c('nav')}" aria-label="Editorias">${links}</nav>
</div></header>`;
}
function eFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<footer class="${c('foot')}"><div class="${c('wrap')}">
<div class="top">
<div><div class="l">${brand}</div><p class="ds">${H.esc(site.description || '')}</p></div>
<nav class="n" aria-label="Rodapé">${cats}${H.instLinks()}</nav>
</div>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}
function eLead(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  return `<a class="${c('lead')}" href="${H.url(a)}"><span class="im">${H.pic(a, true)}</span><span class="cap"><span class="${c('kicker')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>${a.excerpt ? `<span class="d">${H.esc(H.clip(a.excerpt, 170))}</span>` : ''}</span></a>`;
}
function eFeat(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('feat')} ${c('reveal')}" href="${H.url(a)}"><span><span class="${c('kicker')} k">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></span><span class="im">${H.pic(a, false)}</span></a>`;
}
function eCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('card')} ${c('reveal')}" href="${H.url(a)}"><span class="im">${H.pic(a, false)}</span><span class="${c('kicker')} k">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></a>`;
}
function eHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const lead = arts[0];
  const railArts = arts.slice(1, 4);
  const rest = arts.slice(4, (ctx.site.postsOnHome || 12) + 4);
  const rail = railArts.length ? `<div class="${c('rail')}"><div class="${c('eyebrow')}">Em destaque</div>${railArts.map(a => eFeat(ctx, a)).join('')}</div>` : '';
  const cover = lead ? `<section class="${c('cover')}"><div>${eLead(ctx, lead)}</div>${rail}</section>` : '';
  const grid = rest.length ? `<section><div class="${c('shead')}"><span class="t">Mais recentes</span><span class="ln"></span></div>
<div class="${c('grid')}">${rest.map(a => eCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.homeMeta(ctx.site))}
${eHeader(ctx, menu)}
<main><div class="${c('wrap')}">
${H.h1(ctx)}
${cover}
${grid}
</div></main>
${eFooter(ctx, menu)}`;
}
function eArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure>${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<div class="${c('wrap')}"><section class="${c('rel')}"><div class="${c('shead')}"><span class="t">Leia também</span><span class="ln"></span></div>
<div class="${c('grid')}">${related.map(a => eCard(ctx, a)).join('')}</div></section></div>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${eHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><article class="${c('art')}">
${H.crumbs(ctx, art, P)}
<span class="${c('kicker')}"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</main>
${eFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function eList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${eHeader(ctx, opts.menu)}
<main><div class="${c('wrap')}">
<div class="${c('shead')}" style="margin-top:28px"><span class="t">${H.esc(opts.title)}</span><span class="ln"></span></div>
<div class="${c('grid')}">${opts.items.map(a => eCard(ctx, a)).join('')}</div>
</div></main>
${eFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO F
// editorial premium (diário moderno): faixa utilitária + masthead serif central
// com filetes + nav sticky escura (sublinhado animado + hambúrguer) + HERO IMERSIVO
// (manchete sobre a imagem do lead com scrim) ao lado de coluna "Mais recentes" +
// blocos por editoria com cartões de chip sobreposto + single estreito (capitular,
// citações com filete) + rodapé escuro rico.
function fCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)'; // acento secundário opcional (ex.: ouro)
  return `
:root{--p2:${p2}}
${s('bar')}{background:var(--paper);border-bottom:1px solid var(--line)}
${s('bar')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;height:38px;font-family:var(--fb);font-size:11px;letter-spacing:.18em;color:var(--muted)}
${s('bar')} .ed{color:var(--p2);font-weight:700}
${s('mast')}{background:var(--paper)}
${s('mast')} ${s('wrap')}{display:flex;align-items:center;gap:22px;justify-content:center;padding:26px 24px 22px}
${s('rule')}{flex:1;height:1px;background:var(--p2);opacity:.55;max-width:150px}
${s('brand')}{font-family:var(--fd);font-weight:600;font-size:clamp(30px,6vw,56px);letter-spacing:-.012em;line-height:1;color:var(--ink);text-align:center;white-space:nowrap}
${s('brand')} b{color:var(--p);font-style:italic;font-weight:600}
${s('nav')}{position:sticky;top:0;z-index:40;background:var(--ink);border-bottom:3px solid var(--p2)}
${s('nav')} ${s('wrap')}{display:flex;align-items:stretch;justify-content:center;position:relative}
${s('navtog')}{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
${s('burger')}{display:none}
${s('links')}{display:flex;flex-wrap:wrap;justify-content:center}
${s('nav')} a{position:relative;font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.1em;color:var(--bar-tx);padding:15px 17px;white-space:nowrap}
${s('nav')} a::after{content:"";position:absolute;left:17px;right:17px;bottom:8px;height:2px;background:var(--p);transform:scaleX(0);transform-origin:0 50%;transition:transform .25s ease}
${s('nav')} a:hover{color:#fff}
${s('nav')} a:hover::after{transform:scaleX(1)}
main{padding:var(--block) 0 10px}
${s('chip')}{display:inline-block;background:var(--p);color:var(--onp);font-family:var(--fb);font-weight:700;font-size:11px;letter-spacing:.1em;padding:5px 10px;border-radius:2px;line-height:1.05}
${s('hero')}{display:grid;grid-template-columns:1.62fr 1fr;gap:40px;align-items:start;padding-bottom:var(--sec);margin-bottom:var(--block);border-bottom:1px solid var(--line)}
${s('lead')}{position:relative;display:block;border-radius:var(--rad-lg);overflow:hidden;aspect-ratio:var(--hero-ar);background:var(--ph)}
${s('lead')} .im{position:absolute;inset:0}
${s('lead')} .im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .9s cubic-bezier(.2,.7,.2,1)}
${s('lead')}:hover .im img{transform:scale(1.05)}
${s('lead')} .ov{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:34px;background:linear-gradient(to top,rgba(18,14,10,.94),rgba(18,14,10,.5) 42%,rgba(18,14,10,0) 74%)}
${s('lead')} h2{font-family:var(--fd);font-weight:600;font-size:clamp(27px,3.7vw,48px);line-height:1.04;letter-spacing:-.012em;color:#fff;margin:13px 0 0;max-width:19ch}
${s('lead')} .d{color:rgba(255,255,255,.82);font-size:16px;line-height:1.5;margin:11px 0 0;max-width:54ch}
${s('leadx')}{display:block;border-left:4px solid var(--p);background:var(--surface);padding:24px 28px;border-radius:0 var(--rad) var(--rad) 0}
${s('leadx')} h2{font-family:var(--fd);font-weight:600;font-size:clamp(26px,3.4vw,42px);line-height:1.06;letter-spacing:-.01em;color:var(--ink);margin:12px 0 0}
${s('leadx')}:hover h2{color:var(--p)}
${s('leadx')} .d{color:var(--dek);font-size:17px;margin:10px 0 0}
${s('rail')}{display:flex;flex-direction:column}
${s('railh')}{font-family:var(--fb);font-weight:800;font-size:12px;letter-spacing:.16em;color:var(--ink);margin:0 0 4px;padding-bottom:12px;border-bottom:2px solid var(--p)}
${s('ri')}{display:block;padding:16px 0;border-bottom:1px solid var(--line)}
${s('ri')} .k{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--p);display:block;margin-bottom:5px}
${s('ri')} .h{font-family:var(--fd);font-weight:600;font-size:18px;line-height:1.22;letter-spacing:-.005em;color:var(--ink);display:block}
${s('ri')}:hover .h{color:var(--p)}
${s('sec')}{margin:var(--block) 0 0;content-visibility:auto;contain-intrinsic-size:auto 700px}
${s('sech')}{display:flex;align-items:center;gap:16px;margin:0 0 22px}
${s('sech')} .t{font-family:var(--fb);font-weight:800;font-size:14px;letter-spacing:.14em;color:var(--ink);margin:0;padding-left:13px;border-left:4px solid var(--p)}
${s('sech')} .ln{flex:1;height:1px;background:var(--line)}
${s('sech')} .more{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--muted);display:inline-flex;align-items:center;min-height:44px;padding-left:10px}
${s('sech')} .more:hover{color:var(--p)}
${s('grid')}{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sec) var(--col)}
${s('card')}{display:block}
${s('card')} .im{position:relative;display:block;aspect-ratio:var(--card-ar);overflow:hidden;border-radius:var(--rad);background:var(--ph);margin-bottom:14px}
${s('card')} .im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('card')}:hover .im img{transform:scale(1.05)}
${s('card')} .ck{position:absolute;top:11px;left:11px}
${s('card')} .b ${s('chip')}{margin-bottom:9px}
${s('card')} .h{font-family:var(--fd);font-weight:600;font-size:21px;line-height:1.18;letter-spacing:-.01em;color:var(--ink);margin:0;display:block}
${s('card')}:hover .h{color:var(--p)}
${s('card')} time{display:block;font-family:var(--fb);font-size:12px;letter-spacing:.02em;color:var(--muted);margin-top:8px}
${s('art')}{max-width:768px;margin:0 auto;padding:var(--block) 24px 10px}
${s('art')} h1{font-family:var(--fd);font-weight:700;font-size:clamp(31px,4.7vw,52px);line-height:1.05;letter-spacing:-.018em;margin:14px 0 16px;color:var(--ink)}
${s('art')} figure{margin:26px 0}
${s('art')} figure img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('art')} figcaption{font-family:var(--fb);font-size:13px;color:var(--muted);margin-top:9px;font-style:italic;text-align:center}
${s('body')}{font-size:calc(var(--fs) + 1px);line-height:1.8}
${s('body')} p{margin:0 0 23px}
${s('body')}>p:first-of-type::first-letter{font-family:var(--fd);font-weight:700;float:left;font-size:4.2rem;line-height:.74;padding:8px 13px 0 0;color:var(--p)}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('body')} h2{font-family:var(--fd);font-weight:700;font-size:28px;letter-spacing:-.01em;margin:38px 0 14px}
${s('body')} h3{font-family:var(--fd);font-weight:600;font-size:22px;margin:28px 0 12px}
${s('body')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('body')} blockquote{margin:32px 0;padding:6px 0 6px 26px;border-left:3px solid var(--p);font-family:var(--fd);font-weight:500;font-style:italic;font-size:24px;line-height:1.4;color:var(--ink)}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('rel')}{max-width:var(--maxw);margin:58px auto 0;border-top:2px solid var(--ink);padding-top:30px}
${s('foot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:var(--block);padding:54px 0 30px;font-family:var(--fb);font-size:14px}
${s('foot')} .g{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:36px;padding-bottom:30px;border-bottom:1px solid rgba(255,255,255,.12)}
${s('foot')} .l{font-family:var(--fd);font-weight:600;font-size:30px;color:#fff;line-height:1}
${s('foot')} .l b{color:var(--p);font-style:italic}
${s('foot')} .ds{margin:14px 0 0;max-width:40ch;line-height:1.6;color:var(--footer-tx)}
${s('foot')} .h{font-family:var(--fb);font-size:12px;letter-spacing:.16em;color:#fff;margin:0 0 13px;opacity:.85;font-weight:700}
${s('foot')} a{display:block;color:var(--footer-tx);padding:6px 0}
${s('foot')} a:hover{color:#fff}
${s('foot')} .cp{padding-top:22px;font-size:12.5px;opacity:.7}
@media(max-width:920px){${s('hero')}{grid-template-columns:1fr;gap:30px}${s('grid')}{grid-template-columns:1fr 1fr}${s('foot')} .g{grid-template-columns:1fr 1fr}}
@media(max-width:560px){
${s('grid')}{grid-template-columns:1fr}${s('foot')} .g{grid-template-columns:1fr}
${s('mast')} ${s('wrap')}{padding:18px 14px 14px;gap:0}${s('rule')}{display:none}
${s('lead')}{aspect-ratio:4/5}${s('lead')} h2{font-size:25px;margin-top:9px}${s('lead')} .d{display:none}
${s('lead')} .ov{padding:18px;background:linear-gradient(to top,rgba(18,14,10,.96),rgba(18,14,10,.5) 52%,rgba(18,14,10,0) 86%)}${s('art')}{padding-left:16px;padding-right:16px}
${s('body')}>p:first-of-type::first-letter{font-size:3.3rem}
${s('nav')} ${s('wrap')}{justify-content:flex-start}
${s('burger')}{display:inline-flex;align-items:center;gap:11px;min-height:50px;padding:0 2px;color:var(--bar-tx);font-family:var(--fb);font-weight:700;font-size:12.5px;letter-spacing:.14em;cursor:pointer}
${s('burger')} span{position:relative;display:block;width:22px;height:2px;background:currentColor;transition:.25s}
${s('burger')} span::before,${s('burger')} span::after{content:"";position:absolute;left:0;width:22px;height:2px;background:currentColor;transition:.25s}
${s('burger')} span::before{top:-7px}${s('burger')} span::after{top:7px}
${s('links')}{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;background:var(--ink);border-bottom:3px solid var(--p2);box-shadow:0 16px 30px -14px rgba(0,0,0,.6);padding:2px 0}
${s('navtog')}:checked ~ ${s('links')}{display:flex}
${s('links')} a{padding:15px 18px;border-bottom:1px solid rgba(255,255,255,.08);white-space:normal}
${s('links')} a::after{display:none}
${s('navtog')}:checked ~ ${s('burger')} span{background:transparent}
${s('navtog')}:checked ~ ${s('burger')} span::before{transform:rotate(45deg);top:0}
${s('navtog')}:checked ~ ${s('burger')} span::after{transform:rotate(-45deg);top:0}
}`;
}
function fHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const dstr = H.dateFull();
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<div class="${c('bar')}"><div class="${c('wrap')}"><span class="dt">${H.esc(dstr)}</span><span class="ed">${H.esc(site.tagline || 'Edição Digital')}</span></div></div>
<header class="${c('mast')}"><div class="${c('wrap')}"><span class="${c('rule')}"></span><a class="${c('brand')}" href="/" rel="home">${brand}</a><span class="${c('rule')}"></span></div></header>
<nav class="${c('nav')}" aria-label="Editorias"><div class="${c('wrap')}"><input type="checkbox" id="${c('navtog')}" class="${c('navtog')}"><label for="${c('navtog')}" class="${c('burger')}" aria-label="Abrir menu de editorias"><span></span><i>Menu</i></label><div class="${c('links')}">${links}</div></div></nav>`;
}
function fFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<footer class="${c('foot')}"><div class="${c('wrap')}">
<div class="g">
<div><div class="l">${brand}</div><p class="ds">${H.esc(site.description || '')}</p></div>
<div><div class="h">Editorias</div>${cats || '<a href="/">Início</a>'}</div>
<div><div class="h">Institucional</div>${H.instLinks()}</div>
</div>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}
function fLead(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  if (a.image) {
    return `<a class="${c('lead')}" href="${H.url(a)}"><span class="im">${H.pic(a, true)}</span><span class="ov"><span class="${c('chip')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>${a.excerpt ? `<span class="d">${H.esc(H.clip(a.excerpt, 170))}</span>` : ''}</span></a>`;
  }
  return `<a class="${c('leadx')}" href="${H.url(a)}"><span class="${c('chip')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>${a.excerpt ? `<span class="d">${H.esc(H.clip(a.excerpt, 180))}</span>` : ''}</a>`;
}
function fRi(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('ri')}" href="${H.url(a)}"><span class="k">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></a>`;
}
function fCard(ctx, a) {
  const { c, H } = ctx;
  const hasImg = !!a.image;
  return `<a class="${c('card')} ${c('reveal')}" href="${H.url(a)}">${hasImg ? `<span class="im">${H.pic(a, false)}<span class="ck ${c('chip')}">${H.cat(a)}</span></span>` : ''}<span class="b">${hasImg ? '' : `<span class="${c('chip')}">${H.cat(a)}</span>`}<span class="h">${H.esc(a.title)}</span><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></span></a>`;
}
function fHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const hero = arts[0];
  const railArts = arts.slice(1, 6);
  const rest = arts.slice(6);
  const rail = railArts.length ? `<aside class="${c('rail')}"><div class="${c('railh')}">Mais recentes</div>${railArts.map(a => fRi(ctx, a)).join('')}</aside>` : '';
  const byCat = new Map();
  for (const a of rest) { const cs = a.category ? a.category.slug : 'noticias'; if (!byCat.has(cs)) byCat.set(cs, { name: a.category ? a.category.name : 'Notícias', items: [] }); byCat.get(cs).items.push(a); }
  const blocks = [...byCat.entries()].filter(([, v]) => v.items.length >= 3).slice(0, 5).map(([cs, v]) =>
    `<section class="${c('sec')}"><div class="${c('sech')}"><span class="t">${H.esc(v.name)}</span><span class="ln"></span><a class="more" href="/${H.esc(cs)}/">ver tudo</a></div>
<div class="${c('grid')}">${v.items.slice(0, 6).map(a => fCard(ctx, a)).join('')}</div></section>`).join('\n');
  return `${H.head(ctx, H.homeMeta(ctx.site))}
${fHeader(ctx, menu)}
<main><div class="${c('wrap')}">
${H.h1(ctx)}
<section class="${c('hero')}"><div>${fLead(ctx, hero)}</div>${rail}</section>
${blocks}
</div></main>
${fFooter(ctx, menu)}`;
}
function fArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure>${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<div class="${c('wrap')}"><section class="${c('rel')}"><div class="${c('sech')}"><span class="t">Leia também</span><span class="ln"></span></div>
<div class="${c('grid')}">${related.map(a => fCard(ctx, a)).join('')}</div></section></div>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${fHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><article class="${c('art')}">
${H.crumbs(ctx, art, P)}
<span class="${c('chip')}"><a href="/${H.esc(P.catSlug)}/" style="color:var(--onp)">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</main>
${fFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function fList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${fHeader(ctx, opts.menu)}
<main><div class="${c('wrap')}">
<div class="${c('sech')}" style="margin-top:30px"><span class="t">${H.esc(opts.title)}</span><span class="ln"></span></div>
<div class="${c('grid')}" style="margin-top:20px">${opts.items.map(a => fCard(ctx, a)).join('')}</div>
</div></main>
${fFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO G
// portal/agência (diário regional denso): faixa utilitária + masthead com logo à
// ESQUERDA + BARRA DE NAV EM COR SÓLIDA (assinatura do arch) + destaque com manchete
// ABAIXO da imagem + 2 sub-cartões + coluna "Mais lidas" com numerais dourados +
// blocos por editoria com RÓTULO CHEIO colorido e grade densa de 4 cartões com borda +
// single largo e rodapé escuro. Acento secundário opcional via theme.accent2 (--p2).
function gCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--p2:${p2}}
${s('util')}{background:var(--bar-bg);color:var(--bar-tx)}
${s('util')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;height:34px;font-family:var(--fb);font-size:11.5px;letter-spacing:.12em;}
${s('util')} .d{opacity:.78}
${s('util')} .e{color:var(--p2);font-weight:700}
${s('hd')}{background:var(--paper);border-bottom:1px solid var(--line)}
${s('hd')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 24px}
${s('brand')}{font-family:var(--fd);font-weight:800;font-size:clamp(26px,5vw,44px);letter-spacing:-.03em;line-height:.9;color:var(--ink);display:inline-flex;align-items:center}
${s('brand')} b{color:var(--p)}
${s('tag')}{font-family:var(--fb);font-size:12px;letter-spacing:.03em;color:var(--muted);text-align:right;max-width:34ch;line-height:1.35}
${s('nav')}{position:sticky;top:0;z-index:40;background:var(--p);box-shadow:0 2px 0 rgba(0,0,0,.14)}
${s('nav')} ${s('wrap')}{display:flex;align-items:stretch;justify-content:flex-start;position:relative}
${s('navtog')}{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
${s('burger')}{display:none}
${s('links')}{display:flex;flex-wrap:wrap;align-items:stretch}
${s('nav')} a{font-family:var(--fd);font-size:13px;font-weight:700;letter-spacing:.04em;color:var(--onp);padding:13px 15px;white-space:nowrap;border-bottom:3px solid transparent;transition:background .15s}
${s('nav')} a:hover{background:rgba(0,0,0,.18);border-bottom-color:var(--p2)}
main{padding:var(--block) 0 10px}
${s('top')}{display:grid;grid-template-columns:minmax(0,1.62fr) minmax(0,1fr);gap:var(--col);padding-bottom:var(--sec);margin-bottom:var(--sec);border-bottom:2px solid var(--ink)}
${s('lead')}{display:block}
${s('lead')} .i{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad)}
${s('lead')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('lead')}:hover .i img{transform:scale(1.03)}
${s('lead')} ${s('kicker')}{display:inline-block;margin-top:15px}
${s('lead')} .ttl{display:block;font-family:var(--fd);font-weight:800;font-size:clamp(26px,3.8vw,46px);line-height:1.04;letter-spacing:-.02em;color:var(--ink);margin:.4rem 0 .35rem}
${s('lead')}:hover .ttl{color:var(--p)}
${s('lead')} .d{display:block;font-size:17px;line-height:1.5;color:var(--dek);margin:0;max-width:60ch}
${s('subs')}{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:22px;padding-top:22px;border-top:1px solid var(--line)}
${s('sub')}{display:grid;grid-template-columns:94px minmax(0,1fr);gap:13px;align-items:start}
${s('sub')} .i{aspect-ratio:1/1;overflow:hidden;border-radius:var(--rad-sm);background:var(--ph)}
${s('sub')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('sub')}:hover .i img{transform:scale(1.05)}
${s('sub')} ${s('kicker')}{display:block;margin-bottom:3px}
${s('sub')} .h{display:block;font-family:var(--fd);font-weight:700;font-size:16px;line-height:1.2;letter-spacing:-.01em;color:var(--ink)}
${s('sub')}:hover .h{color:var(--p)}
${s('rank')}{align-self:start}
${s('rankh')}{display:flex;align-items:center;gap:9px;font-family:var(--fd);font-weight:800;font-size:14px;letter-spacing:.1em;color:var(--ink);margin:0 0 4px;padding-bottom:12px;border-bottom:2px solid var(--p)}
${s('rankh')}::before{content:"";width:9px;height:9px;border-radius:50%;background:var(--p2);animation:gpulse 1.9s infinite}
@keyframes gpulse{0%{box-shadow:0 0 0 0 var(--p2)}70%{box-shadow:0 0 0 6px transparent}100%{box-shadow:0 0 0 0 transparent}}
${s('rankitem')}{display:grid;grid-template-columns:34px minmax(0,1fr);gap:12px;align-items:center;padding:13px 0;border-bottom:1px solid var(--line)}
${s('rankitem')} .n{font-family:var(--fd);font-weight:800;font-size:26px;line-height:1;color:var(--p2);text-align:center}
${s('rankitem')} .h{font-family:var(--fd);font-weight:600;font-size:15.5px;line-height:1.24;color:var(--ink)}
${s('rankitem')}:hover .h{color:var(--p)}
${s('rfeed')}{margin-top:28px}
${s('rfeedh')}{font-family:var(--fd);font-weight:800;font-size:14px;letter-spacing:.1em;color:var(--ink);margin:0 0 4px;padding-bottom:12px;border-bottom:2px solid var(--p2)}
${s('rfi')}{display:grid;grid-template-columns:76px minmax(0,1fr);gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line)}
${s('rfi')} .i{aspect-ratio:1/1;overflow:hidden;border-radius:var(--rad-sm);background:var(--ph)}
${s('rfi')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('rfi')}:hover .i img{transform:scale(1.05)}
${s('rfi')} ${s('kicker')}{display:block;margin-bottom:3px}
${s('rfi')} .h{display:block;font-family:var(--fd);font-weight:600;font-size:14.5px;line-height:1.22;letter-spacing:-.005em;color:var(--ink)}
${s('rfi')}:hover .h{color:var(--p)}
${s('sec')}{margin:var(--block) 0 0;content-visibility:auto;contain-intrinsic-size:auto 620px}
${s('sech')}{display:flex;align-items:center;gap:14px;margin:0 0 20px}
${s('sech')} .t{font-family:var(--fd);font-weight:800;font-size:14px;letter-spacing:.08em;color:var(--onp);background:var(--p);padding:7px 14px;border-radius:var(--rad-sm)}
${s('sech')} .ln{flex:1;height:2px;background:var(--line)}
${s('sech')} .more{font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--muted);min-height:44px;display:inline-flex;align-items:center}
${s('sech')} .more:hover{color:var(--p)}
${s('grid')}{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--sec) var(--col)}
${s('card')}{display:block;background:var(--surface);border:1px solid var(--line);border-radius:var(--rad);overflow:hidden;box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s,border-color .2s}
${s('card')}:hover{transform:translateY(-3px);box-shadow:var(--shadow-soft);border-color:var(--p)}
${s('card')} .i{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph)}
${s('card')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('card')}:hover .i img{transform:scale(1.04)}
${s('card')} .b{display:block;padding:12px 14px 15px}
${s('card')} .k{font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--p);display:block;margin-bottom:6px}
${s('card')} .h{font-family:var(--fd);font-weight:700;font-size:16.5px;line-height:1.2;letter-spacing:-.01em;color:var(--ink);display:block}
${s('card')}:hover .h{color:var(--p)}
${s('card')} time{display:block;font-family:var(--fb);font-size:11.5px;color:var(--muted);margin-top:8px}
${s('art')}{max-width:760px;margin:0 auto;padding:var(--block) 24px 10px}
${s('tab')}{display:inline-block;font-family:var(--fd);font-weight:700;font-size:11.5px;letter-spacing:.08em;color:var(--onp);background:var(--p);padding:5px 11px;border-radius:var(--rad-sm)}
${s('tab')} a{color:var(--onp)}
${s('art')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(29px,4.4vw,46px);line-height:1.07;letter-spacing:-.02em;margin:13px 0 14px;color:var(--ink)}
${s('art')} figure{margin:0 0 26px}
${s('art')} figure img{width:100%;height:auto;display:block;border-radius:var(--rad)}
${s('art')} figcaption{font-size:13px;color:var(--muted);margin-top:8px;font-style:italic}
${s('body')}{font-size:calc(var(--fs) + 1px);line-height:1.75}
${s('body')} p{margin:0 0 21px}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:2px}
${s('body')} h2{font-family:var(--fd);font-weight:800;font-size:26px;letter-spacing:-.01em;margin:34px 0 13px}
${s('body')} h3{font-family:var(--fd);font-weight:700;font-size:21px;margin:26px 0 11px}
${s('body')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('body')} blockquote{margin:26px 0;padding:8px 0 8px 20px;border-left:4px solid var(--p2);font-family:var(--fd);font-weight:600;font-size:21px;line-height:1.4;color:var(--ink)}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('rel')}{max-width:var(--maxw);margin:50px auto 0;border-top:2px solid var(--ink);padding-top:26px}
${s('foot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:var(--block);padding:46px 0 28px;font-family:var(--fb);font-size:14px;border-top:4px solid var(--p)}
${s('foot')} .g{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:32px;padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,.1)}
${s('foot')} .l{font-family:var(--fd);font-weight:800;font-size:26px;letter-spacing:-.02em;color:#fff}
${s('foot')} .l b{color:var(--p2)}
${s('foot')} .ds{margin:12px 0 0;max-width:42ch;line-height:1.6}
${s('foot')} .h{font-family:var(--fd);font-size:12px;letter-spacing:.12em;color:#fff;margin:0 0 12px;opacity:.85;font-weight:700}
${s('foot')} a{display:block;color:var(--footer-tx);padding:5px 0}
${s('foot')} a:hover{color:#fff}
${s('foot')} .cp{padding-top:20px;font-size:12.5px;opacity:.7}
@media(max-width:980px){${s('grid')}{grid-template-columns:repeat(2,1fr)}${s('top')}{grid-template-columns:1fr;gap:30px}${s('foot')} .g{grid-template-columns:1fr 1fr}}
@media(max-width:560px){
${s('grid')}{grid-template-columns:1fr}${s('foot')} .g{grid-template-columns:1fr}${s('subs')}{grid-template-columns:1fr}
${s('hd')} ${s('wrap')}{padding:14px 16px}${s('tag')}{display:none}
${s('art')}{padding-left:16px;padding-right:16px}
${s('util')} .e{display:none}
${s('util')} ${s('wrap')}{height:32px}
${s('util')} .d{font-size:11px;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:none}
${s('top')}{padding-bottom:26px;margin-bottom:26px}
${s('lead')} .ttl{font-size:24px;margin-top:.5rem}
${s('lead')} .d{font-size:15.5px}
${s('rfi')}:active .h{color:var(--p)}
${s('sech')} .more:active{color:var(--p)}
${s('burger')}{display:inline-flex;align-items:center;gap:11px;min-height:50px;padding:0 8px;color:var(--onp);font-family:var(--fd);font-weight:700;font-size:13px;letter-spacing:.1em;cursor:pointer}
${s('burger')} span{position:relative;display:block;width:22px;height:2px;background:currentColor;transition:.25s}
${s('burger')} span::before,${s('burger')} span::after{content:"";position:absolute;left:0;width:22px;height:2px;background:currentColor;transition:.25s}
${s('burger')} span::before{top:-7px}${s('burger')} span::after{top:7px}
${s('links')}{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;background:var(--p);box-shadow:0 16px 30px -14px rgba(0,0,0,.5);padding:2px 0;z-index:60}
${s('navtog')}:checked ~ ${s('links')}{display:flex}
${s('links')} a{padding:15px 18px;border-bottom:1px solid rgba(255,255,255,.16);white-space:normal}
${s('links')} a:hover{border-bottom-color:rgba(255,255,255,.16)}
${s('navtog')}:checked ~ ${s('burger')} span{background:transparent}
${s('navtog')}:checked ~ ${s('burger')} span::before{transform:rotate(45deg);top:0}
${s('navtog')}:checked ~ ${s('burger')} span::after{transform:rotate(-45deg);top:0}
${s('card')}:active{border-color:var(--p);transform:scale(.99)}
${s('lead')}:active .ttl{color:var(--p)}
${s('sub')}:active .h{color:var(--p)}
${s('rankitem')}:active .h{color:var(--p)}
${s('nav')} a:active,${s('links')} a:active{background:rgba(0,0,0,.24)}
}`;
}
function gHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const dstr = H.dateFull();
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<div class="${c('util')}"><div class="${c('wrap')}"><span class="d">${H.esc(dstr)}</span><span class="e">${H.esc(site.tagline || 'Notícias em tempo real')}</span></div></div>
<header class="${c('hd')}"><div class="${c('wrap')}">
<a class="${c('brand')}" href="/" rel="home">${brand}</a>
<span class="${c('tag')}">${H.esc(site.description || '')}</span>
</div></header>
<nav class="${c('nav')}" aria-label="Editorias"><div class="${c('wrap')}"><input type="checkbox" id="${c('navtog')}" class="${c('navtog')}"><label for="${c('navtog')}" class="${c('burger')}" aria-label="Abrir menu de editorias"><span></span><i>Menu</i></label><div class="${c('links')}">${links}</div></div></nav>`;
}
function gFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<footer class="${c('foot')}"><div class="${c('wrap')}">
<div class="g">
<div><div class="l">${brand}</div><p class="ds">${H.esc(site.description || '')}</p></div>
<div><div class="h">Editorias</div>${cats || '<a href="/">Início</a>'}</div>
<div><div class="h">Institucional</div>${H.instLinks()}</div>
</div>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}
function gLead(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  return `<a class="${c('lead')}" href="${H.url(a)}"><span class="i">${H.pic(a, true)}</span><span class="${c('kicker')}">${H.cat(a)}</span><span class="ttl">${H.esc(a.title)}</span>${a.excerpt ? `<span class="d">${H.esc(H.clip(a.excerpt, 180))}</span>` : ''}</a>`;
}
function gSub(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('sub')} ${c('reveal')}" href="${H.url(a)}"><span class="i">${H.pic(a, false)}</span><span><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></span></a>`;
}
function gRank(ctx, a, n) {
  const { c, H } = ctx;
  return `<a class="${c('rankitem')}" href="${H.url(a)}"><span class="n">${n}</span><span class="h">${H.esc(a.title)}</span></a>`;
}
function gRfi(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('rfi')} ${c('reveal')}" href="${H.url(a)}"><span class="i">${H.pic(a, false)}</span><span><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></span></a>`;
}
function gCard(ctx, a) {
  const { c, H } = ctx;
  const hasImg = !!a.image;
  return `<a class="${c('card')} ${c('reveal')}" href="${H.url(a)}">${hasImg ? `<span class="i">${H.pic(a, false)}</span>` : ''}<span class="b"><span class="k">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></span></a>`;
}
function gHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const lead = arts[0];
  const subs = arts.slice(1, 3);
  const rank = arts.slice(3, 8);
  const feed = arts.slice(8, 12);
  const rest = arts.slice(12);
  const subsHtml = subs.length ? `<div class="${c('subs')}">${subs.map(a => gSub(ctx, a)).join('')}</div>` : '';
  const rankHtml = rank.length ? `<aside class="${c('rank')}"><div class="${c('rankh')}">Mais lidas</div>${rank.map((a, i) => gRank(ctx, a, i + 1)).join('')}${feed.length ? `<div class="${c('rfeed')}"><div class="${c('rfeedh')}">Últimas</div>${feed.map(a => gRfi(ctx, a)).join('')}</div>` : ''}</aside>` : '';
  const byCat = new Map();
  for (const a of rest) { const cs = a.category ? a.category.slug : 'noticias'; if (!byCat.has(cs)) byCat.set(cs, { name: a.category ? a.category.name : 'Notícias', items: [] }); byCat.get(cs).items.push(a); }
  const blocks = [...byCat.entries()].filter(([, v]) => v.items.length >= 4).slice(0, 5).map(([cs, v]) =>
    `<section class="${c('sec')}"><div class="${c('sech')}"><span class="t">${H.esc(v.name)}</span><span class="ln"></span><a class="more" href="/${H.esc(cs)}/">ver tudo</a></div>
<div class="${c('grid')}">${v.items.slice(0, 4).map(a => gCard(ctx, a)).join('')}</div></section>`).join('\n');
  return `${H.head(ctx, H.homeMeta(ctx.site))}
${gHeader(ctx, menu)}
<main><div class="${c('wrap')}">
${H.h1(ctx)}
<div class="${c('top')}">
<div>${gLead(ctx, lead)}${subsHtml}</div>
${rankHtml}
</div>
${blocks}
</div></main>
${gFooter(ctx, menu)}`;
}
function gArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure>${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<div class="${c('wrap')}"><section class="${c('rel')}"><div class="${c('sech')}"><span class="t">Leia também</span><span class="ln"></span></div>
<div class="${c('grid')}">${related.map(a => gCard(ctx, a)).join('')}</div></section></div>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${gHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><article class="${c('art')}">
${H.crumbs(ctx, art, P)}
<span class="${c('tab')}"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</main>
${gFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function gList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${gHeader(ctx, opts.menu)}
<main><div class="${c('wrap')}">
<div class="${c('sech')}" style="margin-top:30px"><span class="t">${H.esc(opts.title)}</span><span class="ln"></span></div>
<div class="${c('grid')}" style="margin-top:20px">${opts.items.map(a => gCard(ctx, a)).join('')}</div>
</div></main>
${gFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO H
// revista digital DARK de entretenimento/notícias: topbar com "ao vivo" + masthead
// com WORDMARK GIGANTE condensado + nav sticky de filete duplo + HERO "CAPA"
// (imagem do lead com manchete condensada GIGANTE em caixa-alta sobreposta) ao lado
// de coluna "Em destaque" numerada + blocos por editoria com selo quadrado + cards
// image-top com tag sobreposta + single de manchete condensada + rodapé com logotipo
// enorme. Tipografia condensada (display) o tempo todo; acento único forte sobre quase-preto.
function hCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--p2:${p2}}
${s('tb')}{background:var(--bar-bg);color:var(--bar-tx);border-bottom:1px solid var(--line)}
${s('tb')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;height:36px;font-family:var(--fb);font-size:11px;letter-spacing:.2em;}
${s('tb')} .live{display:inline-flex;align-items:center;gap:8px;color:var(--p);font-weight:600}
${s('tb')} .live::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--p);animation:hpulse 1.8s infinite}
@keyframes hpulse{0%{box-shadow:0 0 0 0 var(--p)}70%{box-shadow:0 0 0 6px transparent}100%{box-shadow:0 0 0 0 transparent}}
${s('tb')} .dt{opacity:.72}
${s('mast')}{background:var(--paper)}
${s('mast')} ${s('wrap')}{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:24px 24px 16px}
${s('brand')}{font-family:var(--fd);font-weight:800;font-size:clamp(42px,8.4vw,92px);line-height:.8;letter-spacing:-.01em;color:var(--ink)}
${s('brand')} b{color:var(--p)}
${s('mtag')}{font-family:var(--fb);font-size:12px;line-height:1.45;letter-spacing:.04em;color:var(--muted);text-align:right;max-width:32ch;text-wrap:balance;padding-bottom:10px}
${s('nav')}{position:sticky;top:0;z-index:40;background:var(--paper);border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}
${s('nav')} ${s('wrap')}{display:flex;align-items:stretch;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
${s('nav')} ${s('wrap')}::-webkit-scrollbar{display:none}
${s('nav')} a{position:relative;flex:0 0 auto;font-family:var(--fd);font-weight:700;font-size:16px;letter-spacing:.04em;color:var(--ink);padding:11px 15px;white-space:nowrap}
${s('nav')} a:hover{color:var(--p)}
${s('nav')} a::after{content:"";position:absolute;left:15px;right:15px;bottom:0;height:3px;background:var(--p);transform:scaleX(0);transform-origin:0 50%;transition:transform .2s ease}
${s('nav')} a:hover::after{transform:scaleX(1)}
main{padding:var(--block) 0 10px}
${s('tag')}{display:inline-block;font-family:var(--fd);font-weight:700;font-size:13px;letter-spacing:.1em;color:var(--onp);background:var(--p);padding:3px 10px;line-height:1.3}
${s('tag')} a{color:var(--onp)}
${s('cover')}{display:grid;grid-template-columns:1.7fr 1fr;gap:34px;align-items:stretch;padding-bottom:var(--sec);margin-bottom:var(--sec);border-bottom:2px solid var(--ink)}
${s('lead')}{position:relative;display:block;overflow:hidden;background:var(--ph);min-height:470px}
${s('lead')} img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.9);transition:transform .9s cubic-bezier(.2,.7,.2,1)}
${s('lead')}:hover img{transform:scale(1.045)}
${s('lead')} .ov{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:30px;background:linear-gradient(to top,rgba(8,6,11,.97) 0%,rgba(8,6,11,.84) 26%,rgba(8,6,11,.45) 56%,rgba(8,6,11,.1) 82%,transparent 100%)}
${s('lead')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(26px,3.3vw,44px);line-height:.97;letter-spacing:-.01em;color:#fff;margin:12px 0 0;max-width:22ch;text-wrap:balance;text-shadow:0 2px 16px rgba(0,0,0,.5)}
${s('lead')} .d{font-family:var(--fb);font-size:15.5px;line-height:1.5;color:rgba(255,255,255,.86);margin:12px 0 0;max-width:52ch}
${s('big')}{display:flex;flex-direction:column}
${s('bigh')}{font-family:var(--fd);font-weight:800;font-size:21px;letter-spacing:.05em;color:var(--ink);margin:0 0 6px;padding-bottom:12px;border-bottom:3px solid var(--p)}
${s('bitem')}{display:grid;grid-template-columns:32px 1fr;gap:13px;align-items:start;padding:15px 0;border-bottom:1px solid var(--line)}
${s('bitem')} .n{font-family:var(--fd);font-weight:800;font-size:24px;color:var(--p);line-height:.9}
${s('bitem')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.14em;color:var(--muted);display:block;margin-bottom:4px}
${s('bitem')} .h{font-family:var(--fd);font-weight:600;font-size:19px;line-height:1.04;letter-spacing:.005em;color:var(--ink);display:block}
${s('bitem')}:hover .h{color:var(--p)}
${s('sec')}{margin:var(--block) 0 0;content-visibility:auto;contain-intrinsic-size:auto 660px}
${s('sech')}{display:flex;align-items:center;gap:16px;margin:0 0 22px}
${s('sech')} .t{display:inline-flex;align-items:center;font-family:var(--fd);font-weight:800;font-size:clamp(24px,3vw,34px);line-height:1;letter-spacing:-.01em;color:var(--ink);margin:0}
${s('sech')} .t::before{content:"";width:15px;height:15px;background:var(--p);margin-right:13px}
${s('sech')} .ln{flex:1;height:2px;background:var(--line)}
${s('sech')} .more{font-family:var(--fd);font-weight:700;font-size:13px;letter-spacing:.08em;color:var(--muted);min-height:44px;display:inline-flex;align-items:center}
${s('sech')} .more:hover{color:var(--p)}
${s('grid')}{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--sec) var(--col)}
${s('card')}{display:block}
${s('card')} .i{position:relative;display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);margin-bottom:13px}
${s('card')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('card')}:hover .i img{transform:scale(1.05)}
${s('card')} .i .ct{position:absolute;left:0;bottom:0}
${s('card')} .h{font-family:var(--fd);font-weight:700;font-size:20px;line-height:1.02;letter-spacing:.005em;color:var(--ink);margin:0}
${s('card')}:hover .h{color:var(--p)}
${s('card')} time{display:block;font-family:var(--fb);font-size:11.5px;letter-spacing:.04em;color:var(--muted);margin-top:8px}
${s('art')}{max-width:780px;margin:0 auto;padding:var(--block) 24px 10px}
${s('art')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(34px,5.4vw,60px);line-height:.94;letter-spacing:-.005em;color:var(--ink);margin:13px 0 16px}
${s('art')} figure{margin:26px 0}
${s('art')} figure img{width:100%;height:auto;display:block}
${s('art')} figcaption{font-family:var(--fb);font-size:13px;color:var(--muted);margin-top:9px;font-style:italic}
${s('body')}{font-family:var(--fb);font-size:calc(var(--fs) + 1px);line-height:1.8}
${s('body')} p{margin:0 0 22px}
${s('body')}>p:first-of-type{font-size:1.16em;line-height:1.58;color:var(--ink)}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('body')} h2{font-family:var(--fd);font-weight:700;font-size:31px;letter-spacing:0;margin:38px 0 14px;color:var(--ink)}
${s('body')} h3{font-family:var(--fd);font-weight:700;font-size:24px;margin:28px 0 11px;color:var(--ink)}
${s('body')} img{max-width:100%;height:auto}
${s('body')} blockquote{margin:30px 0;padding:6px 0 6px 24px;border-left:4px solid var(--p);font-family:var(--fd);font-weight:600;font-size:27px;line-height:1.1;letter-spacing:.005em;color:var(--ink)}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('rel')}{max-width:var(--maxw);margin:56px auto 0;border-top:2px solid var(--ink);padding-top:28px}
${s('foot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:var(--block);padding:50px 0 28px;border-top:3px solid var(--p);font-family:var(--fb);font-size:14px}
${s('foot')} .g{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:34px;padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,.1)}
${s('foot')} .l{font-family:var(--fd);font-weight:800;font-size:48px;line-height:.82;color:#fff}
${s('foot')} .l b{color:var(--p)}
${s('foot')} .ds{margin:14px 0 0;max-width:38ch;line-height:1.6;color:var(--footer-tx)}
${s('foot')} .h{font-family:var(--fd);font-size:16px;letter-spacing:.05em;color:#fff;margin:0 0 10px;font-weight:700}
${s('foot')} a{display:block;color:var(--footer-tx);padding:6px 0}
${s('foot')} a:hover{color:var(--p)}
${s('foot')} .cp{padding-top:20px;font-size:12.5px;opacity:.7}
@media(max-width:920px){${s('cover')}{grid-template-columns:1fr;gap:26px}${s('lead')}{min-height:370px}${s('grid')}{grid-template-columns:1fr 1fr}${s('foot')} .g{grid-template-columns:1fr 1fr}}
@media(max-width:560px){
${s('tb')} ${s('wrap')}{justify-content:center;letter-spacing:.12em;font-size:10.5px}${s('tb')} .dt{display:none}
${s('mast')} ${s('wrap')}{padding:14px 16px 10px}${s('mtag')}{display:none}
${s('brand')}{font-size:clamp(32px,10vw,46px)}
${s('grid')}{grid-template-columns:1fr}${s('foot')} .g{grid-template-columns:1fr}${s('foot')} .l{font-size:38px}
${s('lead')}{min-height:300px}${s('lead')} .ov{padding:16px;background:linear-gradient(to top,rgba(8,6,11,.97) 0%,rgba(8,6,11,.8) 38%,rgba(8,6,11,.25) 72%,transparent 100%)}
${s('lead')} h2{font-size:23px;line-height:1;margin-top:9px}${s('lead')} .d{display:none}
${s('bigh')}{font-size:19px}
${s('sech')} .t{font-size:22px}${s('sech')} .t::before{width:12px;height:12px;margin-right:10px}
${s('art')}{padding-left:16px;padding-right:16px}${s('art')} h1{font-size:clamp(27px,9vw,38px);line-height:.98}
${s('nav')} a{min-height:48px;display:inline-flex;align-items:center}${s('nav')} a:active{color:var(--p)}
${s('lead')}:active h2,${s('card')}:active .h,${s('bitem')}:active .h{color:var(--p)}
}`;
}
function hHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<div class="${c('tb')}"><div class="${c('wrap')}"><span class="live">${H.esc(site.tagline || 'Ao vivo')}</span><span class="dt">${H.esc(H.dateFull())}</span></div></div>
<header class="${c('mast')}"><div class="${c('wrap')}">
<a class="${c('brand')}" href="/" rel="home">${brand}</a>
<div class="${c('mtag')}">${H.esc(site.description || '')}</div>
</div></header>
<nav class="${c('nav')}" aria-label="Editorias"><div class="${c('wrap')}">${links}</div></nav>`;
}
function hFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<footer class="${c('foot')}"><div class="${c('wrap')}">
<div class="g">
<div><div class="l">${brand}</div><p class="ds">${H.esc(site.description || '')}</p></div>
<div><div class="h">Editorias</div>${cats || '<a href="/">Início</a>'}</div>
<div><div class="h">Institucional</div>${H.instLinks()}</div>
</div>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}
function hLead(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  if (a.image) {
    return `<a class="${c('lead')}" href="${H.url(a)}">${H.pic(a, true)}<span class="ov"><span class="${c('tag')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>${a.excerpt ? `<span class="d">${H.esc(H.clip(a.excerpt, 160))}</span>` : ''}</span></a>`;
  }
  return `<a class="${c('lead')}" href="${H.url(a)}" style="background:var(--bar-bg);min-height:300px"><span class="ov" style="background:none"><span class="${c('tag')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2></span></a>`;
}
function hBig(ctx, a, n) {
  const { c, H } = ctx;
  return `<a class="${c('bitem')}" href="${H.url(a)}"><span class="n">${n}</span><span><span class="k">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></span></a>`;
}
function hCard(ctx, a) {
  const { c, H } = ctx;
  const hasImg = !!a.image;
  return `<a class="${c('card')} ${c('reveal')}" href="${H.url(a)}">${hasImg ? `<span class="i">${H.pic(a, false)}<span class="ct ${c('tag')}">${H.cat(a)}</span></span>` : ''}<span class="b">${hasImg ? '' : `<span class="${c('tag')}">${H.cat(a)}</span>`}<span class="h">${H.esc(a.title)}</span><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></span></a>`;
}
function hHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const lead = arts[0];
  const big = arts.slice(1, 6);
  const rest = arts.slice(6);
  const cover = lead ? `<section class="${c('cover')}"><div>${hLead(ctx, lead)}</div><aside class="${c('big')}"><div class="${c('bigh')}">Em destaque</div>${big.map((a, i) => hBig(ctx, a, i + 1)).join('')}</aside></section>` : '';
  const byCat = new Map();
  for (const a of rest) { const cs = a.category ? a.category.slug : 'noticias'; if (!byCat.has(cs)) byCat.set(cs, { name: a.category ? a.category.name : 'Notícias', items: [] }); byCat.get(cs).items.push(a); }
  const blocks = [...byCat.entries()].filter(([, v]) => v.items.length >= 4).slice(0, 5).map(([cs, v]) =>
    `<section class="${c('sec')}"><div class="${c('sech')}"><span class="t">${H.esc(v.name)}</span><span class="ln"></span><a class="more" href="/${H.esc(cs)}/">ver tudo</a></div>
<div class="${c('grid')}">${v.items.slice(0, 4).map(a => hCard(ctx, a)).join('')}</div></section>`).join('\n');
  return `${H.head(ctx, H.homeMeta(ctx.site))}
${hHeader(ctx, menu)}
<main><div class="${c('wrap')}">
${H.h1(ctx)}
${cover}
${blocks}
</div></main>
${hFooter(ctx, menu)}`;
}
function hArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure>${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('rel')}"><div class="${c('sech')}"><span class="t">Leia também</span><span class="ln"></span></div>
<div class="${c('grid')}">${related.map(a => hCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${hHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><article class="${c('art')}">
${H.crumbs(ctx, art, P)}
<span class="${c('tag')}"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</main>
${hFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function hList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${hHeader(ctx, opts.menu)}
<main><div class="${c('wrap')}">
<div class="${c('sech')}" style="margin-top:30px"><span class="t">${H.esc(opts.title)}</span><span class="ln"></span></div>
<div class="${c('grid')}" style="margin-top:20px">${opts.items.map(a => hCard(ctx, a)).join('')}</div>
</div></main>
${hFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO I
// mosaico/bento (magazine visual): faixa utilitária fina + masthead com logo à
// esquerda e filete de acento + nav sticky com hover em caixa + HOME EM MOSAICO
// ASSIMÉTRICO (tiles de tamanhos diferentes com manchete sobreposta sobre a imagem,
// lead 2x2 + tiles largos + tiles pequenos) + blocos por editoria em grade de cards
// image-top + single editorial estreito + rodapé rico. Estrutura de grade mosaico
// que NENHUM outro arquétipo usa (anti-fingerprint por DOM).
function iCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--p2:${p2}}
${s('ut')}{background:var(--paper);border-bottom:1px solid var(--line)}
${s('ut')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;height:34px;font-family:var(--fb);font-size:11px;letter-spacing:.16em;color:var(--muted)}
${s('ut')} .ed{color:var(--p2);font-weight:700}
${s('hd')}{background:var(--paper)}
${s('hd')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:20px 24px 14px}
${s('brand')}{font-family:var(--fd);font-weight:800;font-size:clamp(28px,5vw,48px);letter-spacing:-.02em;line-height:.92;color:var(--ink)}
${s('brand')} b{color:var(--p)}
${s('slo')}{font-family:var(--fb);font-size:12px;color:var(--muted);text-align:right;max-width:32ch;line-height:1.35}
${s('nav')}{position:sticky;top:0;z-index:40;background:var(--paper);border-top:2px solid var(--p);border-bottom:1px solid var(--line)}
${s('nav')} ${s('wrap')}{display:flex;align-items:stretch;position:relative;flex-wrap:wrap}
${s('navtog')}{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
${s('burger')}{display:none}
${s('links')}{display:flex;flex-wrap:wrap}
${s('nav')} a{font-family:var(--fd);font-size:13px;font-weight:700;letter-spacing:.05em;color:var(--ink);padding:12px 14px;white-space:nowrap;transition:background .15s,color .15s}
${s('nav')} a:hover{background:var(--p);color:var(--onp)}
main{padding:var(--block) 0 10px}
${s('chip')}{display:inline-block;font-family:var(--fb);font-weight:700;font-size:11px;letter-spacing:.1em;color:var(--onp);background:var(--p);padding:4px 9px;border-radius:2px;line-height:1.05}
${s('mos')}{display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:190px;gap:14px;margin-bottom:var(--block)}
${s('tile')}{position:relative;display:block;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('tile')} img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
${s('tile')}:hover img{transform:scale(1.06)}
${s('tile')} .ov{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;padding:17px;background:linear-gradient(to top,rgba(16,12,8,.93),rgba(16,12,8,.34) 56%,transparent 88%)}
${s('tile')} h2{font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.12;letter-spacing:-.01em;color:#fff;margin:0;text-shadow:0 1px 10px rgba(0,0,0,.4);text-wrap:balance}
${s('tile')} .ck{align-self:flex-start}
${s('mos')} ${s('tile')}:nth-child(1){grid-column:span 3;grid-row:span 2}
${s('mos')} ${s('tile')}:nth-child(1) h2{font-size:clamp(24px,2.8vw,38px);max-width:18ch}
${s('mos')} ${s('tile')}:nth-child(2){grid-column:span 3}
${s('mos')} ${s('tile')}:nth-child(2) h2{font-size:22px}
${s('mos')} ${s('tile')}:nth-child(3){grid-column:span 3}
${s('mos')} ${s('tile')}:nth-child(3) h2{font-size:22px}
${s('mos')} ${s('tile')}:nth-child(4),${s('mos')} ${s('tile')}:nth-child(5),${s('mos')} ${s('tile')}:nth-child(6){grid-column:span 2}
${s('sec')}{margin:var(--block) 0 0;content-visibility:auto;contain-intrinsic-size:auto 620px}
${s('sech')}{display:flex;align-items:center;gap:14px;margin:0 0 20px}
${s('sech')} .t{font-family:var(--fd);font-weight:800;font-size:clamp(20px,2.4vw,28px);letter-spacing:-.01em;color:var(--ink);margin:0;padding-left:14px;border-left:5px solid var(--p)}
${s('sech')} .ln{flex:1;height:1px;background:var(--line)}
${s('sech')} .more{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--muted);min-height:44px;display:inline-flex;align-items:center}
${s('sech')} .more:hover{color:var(--p)}
${s('grid')}{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--sec) var(--col)}
${s('card')}{display:block}
${s('card')} .i{display:block;aspect-ratio:var(--card-ar);overflow:hidden;border-radius:var(--rad);background:var(--ph);margin-bottom:12px}
${s('card')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('card')}:hover .i img{transform:scale(1.05)}
${s('card')} .k{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--p);display:block;margin-bottom:5px}
${s('card')} .h{font-family:var(--fd);font-weight:700;font-size:19px;line-height:1.16;letter-spacing:-.01em;color:var(--ink);display:block}
${s('card')}:hover .h{color:var(--p)}
${s('card')} time{display:block;font-family:var(--fb);font-size:11.5px;color:var(--muted);margin-top:7px}
${s('art')}{max-width:752px;margin:0 auto;padding:var(--block) 24px 10px}
${s('art')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(30px,4.6vw,50px);line-height:1.05;letter-spacing:-.02em;margin:13px 0 14px;color:var(--ink)}
${s('art')} figure{margin:0 0 26px}
${s('art')} figure img{width:100%;height:auto;display:block;border-radius:var(--rad)}
${s('art')} figcaption{font-family:var(--fb);font-size:13px;color:var(--muted);margin-top:8px;font-style:italic}
${s('body')}{font-size:calc(var(--fs) + 1px);line-height:1.78}
${s('body')} p{margin:0 0 22px}
${s('body')}>p:first-of-type::first-letter{font-family:var(--fd);font-weight:800;float:left;font-size:3.9rem;line-height:.8;padding:7px 12px 0 0;color:var(--p)}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('body')} h2{font-family:var(--fd);font-weight:800;font-size:27px;letter-spacing:-.01em;margin:36px 0 13px}
${s('body')} h3{font-family:var(--fd);font-weight:700;font-size:21px;margin:28px 0 11px}
${s('body')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('body')} blockquote{margin:28px 0;padding:8px 0 8px 22px;border-left:4px solid var(--p2);font-family:var(--fd);font-weight:600;font-style:italic;font-size:23px;line-height:1.34;color:var(--ink)}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('rel')}{max-width:var(--maxw);margin:52px auto 0;border-top:2px solid var(--ink);padding-top:26px}
${s('foot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:var(--block);padding:48px 0 28px;font-family:var(--fb);font-size:14px;border-top:4px solid var(--p)}
${s('foot')} .g{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:32px;padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,.1)}
${s('foot')} .l{font-family:var(--fd);font-weight:800;font-size:27px;letter-spacing:-.02em;color:#fff}
${s('foot')} .l b{color:var(--p2)}
${s('foot')} .ds{margin:12px 0 0;max-width:42ch;line-height:1.6}
${s('foot')} .h{font-family:var(--fd);font-size:12px;letter-spacing:.12em;color:#fff;margin:0 0 12px;opacity:.85;font-weight:700}
${s('foot')} a{display:block;color:var(--footer-tx);padding:5px 0}
${s('foot')} a:hover{color:#fff}
${s('foot')} .cp{padding-top:20px;font-size:12.5px;opacity:.7}
@media(max-width:920px){${s('mos')}{grid-auto-rows:170px}${s('grid')}{grid-template-columns:repeat(2,1fr)}${s('foot')} .g{grid-template-columns:1fr 1fr}}
@media(max-width:680px){
${s('mos')}{grid-template-columns:1fr 1fr;grid-auto-rows:150px}
${s('mos')} ${s('tile')}:nth-child(1){grid-column:span 2;grid-row:span 2}
${s('mos')} ${s('tile')}:nth-child(n){grid-column:span 1}
${s('mos')} ${s('tile')}:nth-child(1){grid-column:span 2}
}
@media(max-width:560px){
${s('grid')}{grid-template-columns:1fr}${s('foot')} .g{grid-template-columns:1fr}
${s('mos')}{grid-template-columns:1fr;grid-auto-rows:200px}
${s('mos')} ${s('tile')}:nth-child(n){grid-column:span 1!important;grid-row:span 1!important}
${s('hd')} ${s('wrap')}{padding:14px 16px}${s('slo')}{display:none}
${s('art')}{padding-left:16px;padding-right:16px}${s('body')}>p:first-of-type::first-letter{font-size:3.1rem}
${s('nav')} ${s('wrap')}{flex-wrap:nowrap;justify-content:flex-start}
${s('burger')}{display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:0 6px;color:var(--ink);font-family:var(--fd);font-weight:700;font-size:13px;letter-spacing:.1em;cursor:pointer}
${s('burger')} span{position:relative;display:block;width:22px;height:2px;background:currentColor;transition:.25s}
${s('burger')} span::before,${s('burger')} span::after{content:"";position:absolute;left:0;width:22px;height:2px;background:currentColor;transition:.25s}
${s('burger')} span::before{top:-7px}${s('burger')} span::after{top:7px}
${s('links')}{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;background:var(--paper);border-bottom:2px solid var(--p);box-shadow:0 16px 30px -14px rgba(0,0,0,.25);padding:2px 0;z-index:60}
${s('navtog')}:checked ~ ${s('links')}{display:flex}
${s('links')} a{padding:14px 18px;border-bottom:1px solid var(--line)}
${s('navtog')}:checked ~ ${s('burger')} span{background:transparent}
${s('navtog')}:checked ~ ${s('burger')} span::before{transform:rotate(45deg);top:0}
${s('navtog')}:checked ~ ${s('burger')} span::after{transform:rotate(-45deg);top:0}
${s('tile')}:active h2,${s('card')}:active .h{color:var(--p2)}
}`;
}
function iHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<div class="${c('ut')}"><div class="${c('wrap')}"><span class="dt">${H.esc(H.dateFull())}</span><span class="ed">${H.esc(site.tagline || 'Edição Digital')}</span></div></div>
<header class="${c('hd')}"><div class="${c('wrap')}">
<a class="${c('brand')}" href="/" rel="home">${brand}</a>
<span class="${c('slo')}">${H.esc(site.description || '')}</span>
</div></header>
<nav class="${c('nav')}" aria-label="Editorias"><div class="${c('wrap')}"><input type="checkbox" id="${c('navtog')}" class="${c('navtog')}"><label for="${c('navtog')}" class="${c('burger')}" aria-label="Abrir menu de editorias"><span></span><i>Menu</i></label><div class="${c('links')}">${links}</div></div></nav>`;
}
function iFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<footer class="${c('foot')}"><div class="${c('wrap')}">
<div class="g">
<div><div class="l">${brand}</div><p class="ds">${H.esc(site.description || '')}</p></div>
<div><div class="h">Editorias</div>${cats || '<a href="/">Início</a>'}</div>
<div><div class="h">Institucional</div>${H.instLinks()}</div>
</div>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}
function iTile(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  const img = a.image ? H.pic(a, true) : '';
  const bg = a.image ? '' : ' style="background:var(--ink)"';
  return `<a class="${c('tile')}" href="${H.url(a)}"${bg}>${img}<span class="ov"><span class="ck ${c('chip')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2></span></a>`;
}
function iCard(ctx, a) {
  const { c, H } = ctx;
  const hasImg = !!a.image;
  return `<a class="${c('card')} ${c('reveal')}" href="${H.url(a)}">${hasImg ? `<span class="i">${H.pic(a, false)}</span>` : ''}<span class="b"><span class="k">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></span></a>`;
}
function iHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const mosaic = arts.slice(0, 6);
  const rest = arts.slice(6);
  const mos = mosaic.length ? `<section class="${c('mos')}">${mosaic.map(a => iTile(ctx, a)).join('')}</section>` : '';
  const byCat = new Map();
  for (const a of rest) { const cs = a.category ? a.category.slug : 'noticias'; if (!byCat.has(cs)) byCat.set(cs, { name: a.category ? a.category.name : 'Notícias', items: [] }); byCat.get(cs).items.push(a); }
  const blocks = [...byCat.entries()].filter(([, v]) => v.items.length >= 4).slice(0, 5).map(([cs, v]) =>
    `<section class="${c('sec')}"><div class="${c('sech')}"><span class="t">${H.esc(v.name)}</span><span class="ln"></span><a class="more" href="/${H.esc(cs)}/">ver tudo</a></div>
<div class="${c('grid')}">${v.items.slice(0, 4).map(a => iCard(ctx, a)).join('')}</div></section>`).join('\n');
  return `${H.head(ctx, H.homeMeta(ctx.site))}
${iHeader(ctx, menu)}
<main><div class="${c('wrap')}">
${H.h1(ctx)}
${mos}
${blocks}
</div></main>
${iFooter(ctx, menu)}`;
}
function iArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure>${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<div class="${c('wrap')}"><section class="${c('rel')}"><div class="${c('sech')}"><span class="t">Leia também</span><span class="ln"></span></div>
<div class="${c('grid')}">${related.map(a => iCard(ctx, a)).join('')}</div></section></div>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${iHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><article class="${c('art')}">
${H.crumbs(ctx, art, P)}
<span class="${c('chip')}"><a href="/${H.esc(P.catSlug)}/" style="color:var(--onp)">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</main>
${iFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function iList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${iHeader(ctx, opts.menu)}
<main><div class="${c('wrap')}">
<div class="${c('sech')}" style="margin-top:30px"><span class="t">${H.esc(opts.title)}</span><span class="ln"></span></div>
<div class="${c('grid')}" style="margin-top:20px">${opts.items.map(a => iCard(ctx, a)).join('')}</div>
</div></main>
${iFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO J
// jornalão clássico (broadsheet): faixa de edição (data) + nameplate CENTRAL grande
// com filetes + nav serifada com filetes verticais + FRONTE 3 COLUNAS (manchete c/
// imagem | coluna de chamadas empilhadas com filetes | rail "Plantão" c/ horário) +
// blocos por editoria em grade com filetes verticais entre colunas + single estreito
// com capitular + rodapé de jornal. Tipografia serif (notícia) o tempo todo, filetes
// (rules) como assinatura visual. Estruturalmente distinto de A-I.
function jCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--p2:${p2}}
${s('ed')}{background:var(--paper);border-bottom:1px solid var(--ink)}
${s('ed')} ${s('wrap')}{display:flex;align-items:center;justify-content:space-between;height:32px;font-family:var(--fb);font-size:11px;letter-spacing:.1em;color:var(--muted)}
${s('ed')} .e{color:var(--p);font-weight:700}
${s('mast')}{background:var(--paper);text-align:center;padding:14px 24px 0}
${s('brand')}{font-family:var(--fd);font-weight:800;font-size:clamp(38px,8vw,80px);line-height:1;letter-spacing:-.02em;color:var(--ink);padding:6px 0;display:inline-block}
${s('brand')} b{color:var(--p)}
${s('motto')}{font-family:var(--fb);font-size:11px;letter-spacing:.24em;color:var(--muted);padding:4px 0 14px}
${s('nav')}{background:var(--paper);border-top:2px solid var(--ink);border-bottom:2px solid var(--ink);position:sticky;top:0;z-index:40}
${s('nav')} ${s('wrap')}{display:flex;align-items:stretch;justify-content:center;position:relative}
${s('navtog')}{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
${s('burger')}{display:none}
${s('links')}{display:flex;flex-wrap:wrap;justify-content:center}
${s('nav')} a{font-family:var(--fd);font-weight:700;font-size:13px;letter-spacing:.06em;color:var(--ink);padding:11px 15px;white-space:nowrap;border-right:1px solid var(--line)}
${s('nav')} a:first-of-type{border-left:1px solid var(--line)}
${s('nav')} a:hover{color:var(--p);background:rgba(0,0,0,.03)}
main{padding:var(--block) 0 10px}
${s('front')}{display:grid;grid-template-columns:1.7fr 1fr .9fr;gap:0;border-bottom:3px double var(--ink);padding-bottom:var(--sec);margin-bottom:var(--sec)}
${s('front')}>*{padding:0 26px}
${s('front')}>*+*{border-left:1px solid var(--line)}
${s('front')}>*:first-child{padding-left:0}
${s('front')}>*:last-child{padding-right:0}
${s('lead')}{display:block}
${s('lead')} ${s('kicker')}{display:block;margin-bottom:8px}
${s('lead')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(29px,4.2vw,50px);line-height:1.03;letter-spacing:-.02em;color:var(--ink);margin:0 0 12px}
${s('lead')}:hover h2{color:var(--p)}
${s('lead')} .im{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph);margin:0 0 14px}
${s('lead')} .im img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.96)}
${s('lead')} .d{font-family:var(--fb);font-size:16px;line-height:1.6;color:var(--dek);margin:0}
${s('sub')}{display:block;padding:14px 0;border-bottom:1px solid var(--line)}
${s('sub')}:first-child{padding-top:0}
${s('sub')} ${s('kicker')}{display:block;margin-bottom:4px}
${s('sub')} .h{font-family:var(--fd);font-weight:700;font-size:20px;line-height:1.12;letter-spacing:-.01em;color:var(--ink);display:block}
${s('sub')}:hover .h{color:var(--p)}
${s('sub')} .x{font-family:var(--fb);font-size:14px;line-height:1.5;color:var(--dek);margin:5px 0 0;display:block}
${s('railh')}{font-family:var(--fd);font-weight:800;font-size:13px;letter-spacing:.14em;color:var(--onp);background:var(--p);padding:6px 10px;margin:0 0 10px;display:block;text-align:center}
${s('pi')}{display:block;padding:11px 0;border-bottom:1px solid var(--line)}
${s('pi')} time{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--p);display:block;margin-bottom:3px}
${s('pi')} .h{font-family:var(--fd);font-weight:600;font-size:15px;line-height:1.22;color:var(--ink);display:block}
${s('pi')}:hover .h{color:var(--p)}
${s('sec')}{margin:var(--block) 0 0;content-visibility:auto;contain-intrinsic-size:auto 600px}
${s('sech')}{display:flex;align-items:center;gap:14px;margin:0 0 18px;border-bottom:2px solid var(--ink);padding-bottom:6px}
${s('sech')} .t{font-family:var(--fd);font-weight:800;font-size:22px;letter-spacing:-.01em;color:var(--ink);margin:0}
${s('sech')} .more{margin-left:auto;font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--p);min-height:44px;display:inline-flex;align-items:center}
${s('grid')}{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
${s('grid')}>*{padding:0 20px}
${s('grid')}>*+*{border-left:1px solid var(--line)}
${s('grid')}>*:first-child{padding-left:0}
${s('grid')}>*:last-child{padding-right:0}
${s('card')}{display:block}
${s('card')} .im{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);margin-bottom:11px}
${s('card')} .im img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.96);transition:transform .5s ease}
${s('card')}:hover .im img{transform:scale(1.04)}
${s('card')} ${s('kicker')}{display:block;margin-bottom:4px}
${s('card')} .h{font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.14;letter-spacing:-.01em;color:var(--ink);display:block}
${s('card')}:hover .h{color:var(--p)}
${s('card')} time{font-family:var(--fb);font-size:11.5px;color:var(--muted);margin-top:7px;display:block}
${s('secbody')}{display:grid;grid-template-columns:1.5fr 1fr;gap:0}
${s('secbody')}>*{padding:0 26px}
${s('secbody')}>*:first-child{padding-left:0}
${s('secbody')}>*:last-child{padding-right:0;border-left:1px solid var(--line)}
${s('sfeat')}{display:block}
${s('sfeat')} .im{display:block;aspect-ratio:16/10;overflow:hidden;background:var(--ph);margin-bottom:13px}
${s('sfeat')} .im img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.96);transition:transform .5s ease}
${s('sfeat')}:hover .im img{transform:scale(1.04)}
${s('sfeat')} ${s('kicker')}{display:block;margin-bottom:5px}
${s('sfeat')} .h{font-family:var(--fd);font-weight:800;font-size:clamp(22px,2.6vw,31px);line-height:1.06;letter-spacing:-.015em;color:var(--ink);display:block}
${s('sfeat')}:hover .h{color:var(--p)}
${s('sfeat')} .d{font-family:var(--fb);font-size:15px;line-height:1.55;color:var(--dek);margin:8px 0 0;display:block}
${s('si')}{display:grid;grid-template-columns:62px minmax(0,1fr);gap:13px;align-items:start;padding:12px 0;border-bottom:1px solid var(--line)}
${s('si')}:first-child{padding-top:0}
${s('si')} .im{aspect-ratio:1/1;overflow:hidden;background:var(--ph)}
${s('si')} .im img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.96)}
${s('si')} ${s('kicker')}{display:block;margin-bottom:2px;font-size:10px}
${s('si')} .h{font-family:var(--fd);font-weight:700;font-size:15.5px;line-height:1.18;letter-spacing:-.01em;color:var(--ink);display:block}
${s('si')}:hover .h{color:var(--p)}
${s('digest')}{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
${s('digest')}>*{padding:0 26px}
${s('digest')}>*+*{border-left:1px solid var(--line)}
${s('digest')}>*:first-child{padding-left:0}
${s('digest')}>*:last-child{padding-right:0}
${s('di')}{display:block;padding:13px 0;border-bottom:1px solid var(--line)}
${s('di')}:first-child{padding-top:0}
${s('di')} ${s('kicker')}{display:block;margin-bottom:3px;font-size:10px}
${s('di')} .h{font-family:var(--fd);font-weight:700;font-size:17px;line-height:1.16;letter-spacing:-.01em;color:var(--ink);display:block}
${s('di')}:hover .h{color:var(--p)}
${s('artwrap')}{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:0;max-width:1080px;margin:0 auto}
${s('art')}{min-width:0;padding:var(--block) 38px 10px 0;border-right:1px solid var(--line)}
${s('artaside')}{padding:calc(var(--block) + 4px) 0 10px 30px;align-self:start;position:sticky;top:74px}
${s('artaside')} ${s('railh')}{margin-bottom:12px}
${s('aitem')}{display:block;padding:11px 0;border-bottom:1px solid var(--line)}
${s('aitem')} ${s('kicker')}{display:block;margin-bottom:3px;font-size:10px}
${s('aitem')} .h{font-family:var(--fd);font-weight:600;font-size:15px;line-height:1.22;color:var(--ink);display:block}
${s('aitem')}:hover .h{color:var(--p)}
${s('asec')}{font-family:var(--fd);font-weight:700;font-size:14px;letter-spacing:.04em;color:var(--ink);display:block;padding:9px 0;border-bottom:1px solid var(--line)}
${s('asec')}:hover{color:var(--p)}
${s('asech')}{margin-top:26px}
${s('art')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(30px,4.8vw,52px);line-height:1.04;letter-spacing:-.02em;color:var(--ink);margin:12px 0 14px}
${s('art')} figure{margin:0 0 24px}
${s('art')} figure img{width:100%;height:auto;display:block;filter:saturate(.96)}
${s('art')} figcaption{font-family:var(--fb);font-size:13px;color:var(--muted);margin-top:8px;font-style:italic;border-bottom:1px solid var(--line);padding-bottom:10px}
${s('body')}{font-family:var(--fb);font-size:calc(var(--fs) + 1px);line-height:1.75}
${s('body')} p{margin:0 0 21px}
${s('body')}>p:first-of-type::first-letter{font-family:var(--fd);font-weight:800;float:left;font-size:4rem;line-height:.72;padding:8px 12px 0 0;color:var(--p)}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:2px}
${s('body')} h2{font-family:var(--fd);font-weight:800;font-size:26px;margin:34px 0 12px;color:var(--ink)}
${s('body')} h3{font-family:var(--fd);font-weight:700;font-size:21px;margin:26px 0 11px}
${s('body')} img{max-width:100%;height:auto}
${s('body')} blockquote{margin:26px 0;padding:6px 0 6px 22px;border-left:3px solid var(--p);font-family:var(--fd);font-weight:700;font-style:italic;font-size:23px;line-height:1.3;color:var(--ink)}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('rel')}{max-width:var(--maxw);margin:48px auto 0;border-top:3px double var(--ink);padding-top:24px}
${s('foot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:var(--block);padding:44px 0 26px;font-family:var(--fb);font-size:14px;border-top:3px double var(--p)}
${s('foot')} .g{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:32px;padding-bottom:26px;border-bottom:1px solid rgba(255,255,255,.12)}
${s('foot')} .l{font-family:var(--fd);font-weight:800;font-size:30px;color:#fff;letter-spacing:-.02em}
${s('foot')} .l b{color:var(--p2)}
${s('foot')} .ds{margin:12px 0 0;max-width:42ch;line-height:1.6}
${s('foot')} .h{font-family:var(--fd);font-size:13px;letter-spacing:.1em;color:#fff;margin:0 0 11px;font-weight:700}
${s('foot')} a{display:block;color:var(--footer-tx);padding:5px 0}
${s('foot')} a:hover{color:#fff}
${s('foot')} .cp{padding-top:18px;font-size:12.5px;opacity:.7}
@media(max-width:980px){
${s('front')}{grid-template-columns:1fr 1fr}
${s('front')}>*:nth-child(3){grid-column:1 / -1;border-left:0;border-top:1px solid var(--line);padding:18px 0 0;margin-top:8px}
${s('grid')}{grid-template-columns:1fr 1fr}
${s('grid')}>*:nth-child(2n+1){padding-left:0;border-left:0}
${s('grid')}>*:nth-child(2n){padding-right:0}
${s('secbody')}{grid-template-columns:1fr}
${s('secbody')}>*:first-child{padding-right:0}
${s('secbody')}>*:last-child{border-left:0;padding-left:0;padding-right:0;border-top:1px solid var(--line);margin-top:16px;padding-top:16px}
${s('artwrap')}{grid-template-columns:1fr}
${s('art')}{padding:var(--block) 0 10px;border-right:0}
${s('artaside')}{position:static;padding:24px 0 0;border-top:3px double var(--ink);margin-top:8px}
${s('digest')}{grid-template-columns:1fr 1fr}
${s('digest')}>*:nth-child(odd){padding-left:0;border-left:0}
${s('digest')}>*:nth-child(even){padding-right:0}
${s('digest')}>*:nth-child(3){border-top:1px solid var(--line);padding-top:10px}
${s('foot')} .g{grid-template-columns:1fr 1fr}
}
@media(max-width:620px){
${s('front')}{grid-template-columns:1fr}
${s('front')}>*{padding:0!important;border-left:0!important}
${s('front')}>*+*{border-top:1px solid var(--line);padding-top:18px!important;margin-top:18px}
${s('grid')}{grid-template-columns:1fr}
${s('grid')}>*{padding:0!important;border-left:0!important}
${s('grid')}>*+*{border-top:1px solid var(--line);padding-top:16px!important;margin-top:4px}
${s('foot')} .g{grid-template-columns:1fr}
${s('art')}{padding-left:0;padding-right:0}
${s('si')}{grid-template-columns:54px minmax(0,1fr)}
${s('digest')}{grid-template-columns:1fr}
${s('digest')}>*{padding:0!important;border-left:0!important}
${s('digest')}>*:nth-child(n+2){border-top:1px solid var(--line);padding-top:6px}
${s('mast')}{padding:12px 12px 0}${s('motto')}{display:none}
${s('brand')}{font-size:clamp(22px,6.4vw,40px);letter-spacing:-.03em}
${s('ed')} .dt{display:none}
${s('nav')} ${s('wrap')}{justify-content:flex-start}
${s('burger')}{display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:0 6px;color:var(--ink);font-family:var(--fd);font-weight:700;font-size:13px;letter-spacing:.08em;cursor:pointer}
${s('burger')} span{position:relative;display:block;width:22px;height:2px;background:currentColor;transition:.25s}
${s('burger')} span::before,${s('burger')} span::after{content:"";position:absolute;left:0;width:22px;height:2px;background:currentColor;transition:.25s}
${s('burger')} span::before{top:-7px}${s('burger')} span::after{top:7px}
${s('links')}{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;background:var(--paper);border-bottom:2px solid var(--ink);box-shadow:0 14px 26px -12px rgba(0,0,0,.3);padding:0;z-index:60}
${s('navtog')}:checked ~ ${s('links')}{display:flex}
${s('links')} a{padding:14px 18px;border:0;border-bottom:1px solid var(--line)}
${s('navtog')}:checked ~ ${s('burger')} span{background:transparent}
${s('navtog')}:checked ~ ${s('burger')} span::before{transform:rotate(45deg);top:0}
${s('navtog')}:checked ~ ${s('burger')} span::after{transform:rotate(-45deg);top:0}
${s('lead')} h2{font-size:30px}
${s('sub')}:active .h,${s('card')}:active .h,${s('pi')}:active .h,${s('lead')}:active h2{color:var(--p)}
}`;
}
function jHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<div class="${c('ed')}"><div class="${c('wrap')}"><span class="dt">${H.esc(H.dateFull())}</span><span class="e">${H.esc(site.tagline || 'Edição Digital')}</span></div></div>
<header class="${c('mast')}"><div class="${c('wrap')}"><a class="${c('brand')}" href="/" rel="home">${brand}</a><div class="${c('motto')}">${H.esc(site.description || '')}</div></div></header>
<nav class="${c('nav')}" aria-label="Editorias"><div class="${c('wrap')}"><input type="checkbox" id="${c('navtog')}" class="${c('navtog')}"><label for="${c('navtog')}" class="${c('burger')}" aria-label="Abrir menu de editorias"><span></span><i>Menu</i></label><div class="${c('links')}">${links}</div></div></nav>`;
}
function jFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<footer class="${c('foot')}"><div class="${c('wrap')}">
<div class="g">
<div><div class="l">${brand}</div><p class="ds">${H.esc(site.description || '')}</p></div>
<div><div class="h">Editorias</div>${cats || '<a href="/">Início</a>'}</div>
<div><div class="h">Institucional</div>${H.instLinks()}</div>
</div>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}
function jLead(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  return `<a class="${c('lead')}" href="${H.url(a)}"><span class="${c('kicker')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>${a.image ? `<span class="im">${H.pic(a, true)}</span>` : ''}${a.excerpt ? `<span class="d">${H.esc(H.clip(a.excerpt, 260))}</span>` : ''}</a>`;
}
function jSub(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('sub')} ${c('reveal')}" href="${H.url(a)}"><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span>${a.excerpt ? `<span class="x">${H.esc(H.clip(a.excerpt, 110))}</span>` : ''}</a>`;
}
function jPi(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('pi')}" href="${H.url(a)}"><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time><span class="h">${H.esc(a.title)}</span></a>`;
}
function jCard(ctx, a) {
  const { c, H } = ctx;
  const hasImg = !!a.image;
  return `<a class="${c('card')} ${c('reveal')}" href="${H.url(a)}">${hasImg ? `<span class="im">${H.pic(a, false)}</span>` : ''}<span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}
// bloco de editoria estilo jornal: 1 destaque (foto + manchete + linha) + lista de chamadas com filetes
function jSecBlock(ctx, name, cs, items) {
  const { c, H } = ctx;
  const feat = items[0];
  const list = items.slice(1, 6);
  const featHtml = feat ? `<a class="${c('sfeat')} ${c('reveal')}" href="${H.url(feat)}">${feat.image ? `<span class="im">${H.pic(feat, false)}</span>` : ''}<span class="${c('kicker')}">${H.cat(feat)}</span><span class="h">${H.esc(feat.title)}</span>${feat.excerpt ? `<span class="d">${H.esc(H.clip(feat.excerpt, 150))}</span>` : ''}</a>` : '';
  const listHtml = list.map(a => `<a class="${c('si')}" href="${H.url(a)}">${a.image ? `<span class="im">${H.pic(a, false)}</span>` : '<span></span>'}<span><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></span></a>`).join('');
  return `<section class="${c('sec')}"><div class="${c('sech')}"><span class="t">${H.esc(name)}</span><a class="more" href="/${H.esc(cs)}/">ver tudo &rarr;</a></div>
<div class="${c('secbody')}"><div>${featHtml}</div><div>${listHtml}</div></div></section>`;
}
// layout B: faixa de cards (foto em cima) com filetes verticais
function jSecCards(ctx, name, cs, items) {
  const { c, H } = ctx;
  return `<section class="${c('sec')}"><div class="${c('sech')}"><span class="t">${H.esc(name)}</span><a class="more" href="/${H.esc(cs)}/">ver tudo &rarr;</a></div>
<div class="${c('grid')}">${items.slice(0, 4).map(a => jCard(ctx, a)).join('')}</div></section>`;
}
// layout C: "giro rápido" — digest denso de manchetes em 3 colunas de texto (sem foto)
function jSecDigest(ctx, name, cs, items) {
  const { c, H } = ctx;
  const list = items.slice(0, 9);
  const per = Math.ceil(list.length / 3) || 1;
  const cols = [list.slice(0, per), list.slice(per, per * 2), list.slice(per * 2)];
  const col = (arr) => `<div>${arr.map(a => `<a class="${c('di')}" href="${H.url(a)}"><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></a>`).join('')}</div>`;
  return `<section class="${c('sec')}"><div class="${c('sech')}"><span class="t">${H.esc(name)}</span><a class="more" href="/${H.esc(cs)}/">ver tudo &rarr;</a></div>
<div class="${c('digest')}">${col(cols[0])}${col(cols[1])}${col(cols[2])}</div></section>`;
}
function jHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const lead = arts[0];
  const subs = arts.slice(1, 6);
  const plantao = arts.slice(6, 13);
  const rest = arts.slice(13);
  const front = `<div class="${c('front')}">
<div>${jLead(ctx, lead)}</div>
<div>${subs.map(a => jSub(ctx, a)).join('')}</div>
<div><span class="${c('railh')}">Plantão</span>${plantao.map(a => jPi(ctx, a)).join('')}</div>
</div>`;
  const byCat = new Map();
  for (const a of rest) { const cs = a.category ? a.category.slug : 'noticias'; if (!byCat.has(cs)) byCat.set(cs, { name: a.category ? a.category.name : 'Notícias', items: [] }); byCat.get(cs).items.push(a); }
  // alterna 3 layouts de seção pra dar ritmo de jornal (destaque+lista / cards / giro digest)
  const secLayouts = [jSecBlock, jSecCards, jSecDigest];
  const blocks = [...byCat.entries()].filter(([, v]) => v.items.length >= 4).slice(0, 6).map(([cs, v], i) => secLayouts[i % secLayouts.length](ctx, v.name, cs, v.items)).join('\n');
  return `${H.head(ctx, H.homeMeta(ctx.site))}
${jHeader(ctx, menu)}
<main><div class="${c('wrap')}">
${H.h1(ctx)}
${front}
${blocks}
</div></main>
${jFooter(ctx, menu)}`;
}
function jArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure>${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const relList = (related && related.length) ? `<span class="${c('railh')}">Leia também</span>${related.map(a => `<a class="${c('aitem')}" href="${H.url(a)}"><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></a>`).join('')}` : '';
  const secList = `<span class="${c('railh')} ${c('asech')}">Seções</span>${(menu || []).map(x => `<a class="${c('asec')}" href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('')}`;
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${jHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('wrap')}"><div class="${c('artwrap')}">
<article class="${c('art')}">
${H.crumbs(ctx, art, P)}
<span class="${c('kicker')}"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}
</article>
<aside class="${c('artaside')}">${relList}${secList}</aside>
</div></div></main>
${jFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function jList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${jHeader(ctx, opts.menu)}
<main><div class="${c('wrap')}">
<div class="${c('sech')}" style="margin-top:28px"><span class="t">${H.esc(opts.title)}</span></div>
<div class="${c('grid')}" style="margin-top:18px">${opts.items.map(a => jCard(ctx, a)).join('')}</div>
</div></main>
${jFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO K
// painel/sidebar (hub de notícias moderno): BARRA LATERAL FIXA ESCURA à esquerda
// (wordmark + nav VERTICAL + widget "ao vivo"/data + links institucionais no rodapé
// da barra) + área de conteúdo clara à direita com HERO SPLIT (lead com manchete
// sobreposta + 2 secundárias empilhadas) + faixa "Em alta" numerada + blocos por
// editoria em grade de 3 cards. No mobile a sidebar vira barra horizontal rolável.
// Estrutura de PÁGINA (grid sidebar+main) que nenhum outro arch usa.
function kCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--p2:${p2}}
${s('navtog')}{position:fixed;width:1px;height:1px;opacity:0;pointer-events:none}
${s('shell')}{display:grid;grid-template-columns:var(--sidew,256px) minmax(0,1fr);min-height:100vh}
${s('side')}{position:sticky;top:0;height:100vh;overflow-y:auto;display:flex;flex-direction:column;padding:30px 24px 22px;background:var(--bar-bg);color:var(--bar-tx);box-shadow:inset -1px 0 0 rgba(255,255,255,.06)}
${s('side')}::before{content:"";position:absolute;top:0;left:0;right:0;height:220px;background:radial-gradient(130% 80% at 28% 0,color-mix(in srgb,var(--p) 17%,transparent),transparent 70%);pointer-events:none}
${s('brand')}{position:relative;font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.025em;line-height:1;color:#fff;display:block}
${s('brand')} b{color:var(--p)}
${s('stag')}{position:relative;font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.2em;color:var(--p);margin:9px 0 30px}
${s('snav')}{display:flex;flex-direction:column;gap:1px}
${s('snav')} a{position:relative;font-family:var(--fd);font-size:14px;font-weight:600;letter-spacing:-.005em;color:rgba(255,255,255,.74);padding:11px 14px;border-radius:var(--rad);transition:color .15s,background .15s}
${s('snav')} a::before{content:"";position:absolute;left:0;top:50%;height:18px;width:3px;border-radius:0 2px 2px 0;background:var(--p);transform:translateY(-50%) scaleY(0);transition:transform .2s ease}
${s('snav')} a:hover{color:#fff;background:rgba(255,255,255,.055)}
${s('snav')} a:hover::before{transform:translateY(-50%) scaleY(1)}
${s('swidget')}{margin-top:auto;padding-top:26px}
${s('swidget')} .lv{display:inline-flex;align-items:center;gap:8px;font-family:var(--fd);font-weight:700;letter-spacing:.1em;font-size:10.5px;color:var(--p);background:color-mix(in srgb,var(--p) 15%,transparent);padding:6px 11px;border-radius:999px}
${s('swidget')} .lv::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--p);animation:kpulse 1.8s infinite}
@keyframes kpulse{0%{box-shadow:0 0 0 0 var(--p)}70%{box-shadow:0 0 0 5px transparent}100%{box-shadow:0 0 0 0 transparent}}
${s('swidget')} .dt{display:block;font-family:var(--fb);font-size:12px;color:rgba(255,255,255,.55);margin-top:11px;line-height:1.45;text-transform:capitalize;max-width:18ch}
${s('sinst')}{margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;gap:2px}
${s('sinst')} a{font-family:var(--fb);font-size:12px;color:rgba(255,255,255,.45);padding:3px 0;transition:color .15s}
${s('sinst')} a:hover{color:#fff}
${s('scrim')}{display:none}
${s('mainw')}{min-width:0;display:flex;flex-direction:column;align-items:center;background:var(--paper)}
${s('topbar')}{display:none}
main{padding:34px 50px 12px;flex:1;width:100%;max-width:1560px}
${s('chip')}{display:inline-block;font-family:var(--fb);font-weight:700;font-size:10px;letter-spacing:.1em;color:var(--onp);background:var(--p);padding:4px 10px;border-radius:999px;line-height:1.1}
${s('hero')}{display:grid;grid-template-columns:1.62fr 1fr;gap:28px;margin-bottom:6px}
${s('lead')}{position:relative;display:block;border-radius:var(--rad-lg);overflow:hidden;min-height:340px;background:var(--ph)}
${s('lead')} img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.2,.7,.2,1)}
${s('lead')}:hover img{transform:scale(1.04)}
${s('lead')} .ov{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:13px;padding:30px;background:linear-gradient(to top,rgba(12,14,20,.93),rgba(12,14,20,.42) 46%,transparent 80%)}
${s('lead')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(23px,2.5vw,35px);line-height:1.08;letter-spacing:-.022em;color:#fff;margin:0;max-width:18ch;text-wrap:balance}
${s('hside')}{display:flex;flex-direction:column;justify-content:flex-start;align-self:start}
${s('hs')}{display:grid;grid-template-columns:minmax(0,1fr) 84px;gap:15px;align-items:center;padding:14px 0;border-bottom:1px solid var(--line)}
${s('hs')}:first-child{padding-top:0}
${s('hs')}:last-child{border-bottom:0;padding-bottom:0}
${s('hs')} .im{aspect-ratio:1/1;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('hs')} .im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('hs')}:hover .im img{transform:scale(1.06)}
${s('hs')} ${s('kicker')}{display:block;margin-bottom:5px}
${s('hs')} .h{font-family:var(--fd);font-weight:700;font-size:15.5px;line-height:1.24;letter-spacing:-.01em;color:var(--ink);display:block}
${s('hs')}:hover .h{color:var(--p)}
${s('altah')}{display:flex;align-items:center;gap:10px;font-family:var(--fd);font-weight:800;font-size:12px;letter-spacing:.14em;color:var(--ink);margin:34px 0 0}
${s('altah')}::before{content:"";width:20px;height:3px;background:var(--p);border-radius:2px}
${s('alta')}{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid var(--ink);margin:13px 0 0}
${s('ai')}{display:grid;grid-template-columns:auto minmax(0,1fr);gap:13px;align-items:start;padding:19px 24px 19px 0;border-right:1px solid var(--line)}
${s('ai')}:last-child{border-right:0;padding-right:0}
${s('ai')} .n{font-family:var(--fd);font-weight:800;font-size:27px;line-height:.82;color:var(--p)}
${s('ai')} .h{font-family:var(--fd);font-weight:600;font-size:14.5px;line-height:1.24;letter-spacing:-.005em;color:var(--ink)}
${s('ai')}:hover .h{color:var(--p)}
${s('sec')}{margin:var(--block) 0 0;content-visibility:auto;contain-intrinsic-size:auto 560px}
${s('sech')}{display:flex;align-items:baseline;gap:16px;margin:0 0 22px}
${s('sech')} .t{position:relative;font-family:var(--fd);font-weight:800;font-size:17px;letter-spacing:.04em;color:var(--ink);margin:0;padding-left:15px}
${s('sech')} .t::before{content:"";position:absolute;left:0;top:1px;bottom:1px;width:4px;background:var(--p);border-radius:2px}
${s('sech')} .ln{flex:1;height:1px;background:var(--line)}
${s('sech')} .more{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--muted);min-height:44px;display:inline-flex;align-items:center;gap:6px}
${s('sech')} .more::after{content:"\\2192";color:var(--p);font-size:13px}
${s('sech')} .more:hover{color:var(--ink)}
${s('grid')}{display:grid;grid-template-columns:repeat(auto-fill,minmax(298px,1fr));gap:26px 24px}
${s('card')}{display:block;background:var(--surface);border:1px solid var(--line);border-radius:var(--rad-lg);overflow:hidden;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
${s('card')}:hover{transform:translateY(-4px);box-shadow:0 18px 38px -22px rgba(20,25,40,.45);border-color:color-mix(in srgb,var(--p) 32%,var(--line))}
${s('card')} .im{display:block;aspect-ratio:16/10;overflow:hidden;background:var(--ph)}
${s('card')} .im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .55s ease}
${s('card')}:hover .im img{transform:scale(1.05)}
${s('card')} .b{display:block;padding:15px 16px 17px}
${s('card')} ${s('kicker')}{display:block;margin-bottom:6px}
${s('card')} .h{font-family:var(--fd);font-weight:700;font-size:17px;line-height:1.24;letter-spacing:-.01em;color:var(--ink);display:block}
${s('card')}:hover .h{color:var(--p)}
${s('card')} time{font-family:var(--fb);font-size:11.5px;color:var(--muted);margin-top:9px;display:block}
${s('artwrap')}{width:100%;max-width:1140px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:54px;align-items:start}
${s('art')}{min-width:0;max-width:760px;padding:8px 0 10px}
${s('aside')}{position:relative;min-width:0}
${s('asticky')}{position:sticky;top:22px}
${s('asideh')}{display:flex;align-items:center;gap:9px;font-family:var(--fd);font-weight:800;font-size:13px;letter-spacing:.12em;color:var(--ink);padding-bottom:13px;border-bottom:2px solid var(--ink);margin:0 0 2px}
${s('asideh')}::before{content:"";width:18px;height:3px;background:var(--p);border-radius:2px}
${s('alist')} a{display:grid;grid-template-columns:76px minmax(0,1fr);gap:14px;align-items:center;padding:15px 0;border-bottom:1px solid var(--line)}
${s('alist')} a:last-child{border-bottom:0}
${s('alist')} .im{aspect-ratio:1/1;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('alist')} .im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('alist')} a:hover .im img{transform:scale(1.06)}
${s('alist')} ${s('kicker')}{display:block;margin-bottom:4px}
${s('alist')} .h{font-family:var(--fd);font-weight:700;font-size:14.5px;line-height:1.26;letter-spacing:-.01em;color:var(--ink);display:block}
${s('alist')} a:hover .h{color:var(--p)}
${s('aback')}{display:inline-flex;align-items:center;gap:6px;margin-top:20px;font-family:var(--fb);font-weight:700;font-size:12px;letter-spacing:.05em;color:var(--p)}
${s('aback')}::after{content:"\\2192"}
${s('art')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,3.6vw,44px);line-height:1.07;letter-spacing:-.02em;color:var(--ink);margin:12px 0 14px}
${s('art')} figure{margin:0 0 24px}
${s('art')} figure img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('art')} figcaption{font-family:var(--fb);font-size:13px;color:var(--muted);margin-top:8px;font-style:italic}
${s('body')}{font-size:calc(var(--fs) + 1px);line-height:1.78}
${s('body')} p{margin:0 0 21px}
${s('body')} a{color:var(--p);text-decoration:underline;text-underline-offset:2px}
${s('body')} h2{font-family:var(--fd);font-weight:800;font-size:25px;margin:32px 0 12px;color:var(--ink)}
${s('body')} h3{font-family:var(--fd);font-weight:700;font-size:20px;margin:26px 0 11px}
${s('body')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('body')} blockquote{margin:26px 0;padding:10px 20px;border-left:4px solid var(--p);background:var(--surface);font-family:var(--fd);font-weight:600;font-size:20px;line-height:1.4;color:var(--ink)}

/* tabela: as arquiteturas antigas nao estilizavam, e o padrao do navegador
   nao combina com nenhum destes desenhos */
${s('body')} .tabwrap{width:100%;overflow-x:auto}
${s('body')} table{width:100%;border-collapse:collapse;margin:22px 0;font-size:15px}
${s('body')} table caption{text-align:left;font-size:13px;opacity:.7;padding-bottom:8px}
${s('body')} table th,${s('body')} table td{border:0;border-bottom:1px solid rgba(0,0,0,.12);
  padding:11px 13px;text-align:left;vertical-align:top}
${s('body')} table thead th{background:transparent;font-weight:700;
  border-bottom:2px solid rgba(0,0,0,.5)}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('body')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('body')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('body')} table caption{display:none}
  ${s('body')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('body')} table tbody,${s('body')} table tr,
  ${s('body')} table th,${s('body')} table td{display:block;width:auto}
  ${s('body')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('body')} table tbody th,${s('body')} table tbody td{border:0;background:transparent;padding:0}
  ${s('body')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('body')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('body')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('rel')}{margin:48px 0 0;border-top:2px solid var(--ink);padding-top:26px}
${s('foot')}{width:100%;background:var(--footer-bg);color:var(--footer-tx);margin-top:var(--block);padding:34px 40px 26px;font-family:var(--fb);font-size:13px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:18px;align-items:center}
${s('foot')} .l{font-family:var(--fd);font-weight:800;font-size:20px;color:#fff;letter-spacing:-.02em}
${s('foot')} .l b{color:var(--p)}
${s('foot')} .n{display:flex;gap:16px;flex-wrap:wrap}
${s('foot')} .n a{color:var(--footer-tx)}${s('foot')} .n a:hover{color:#fff}
${s('foot')} .cp{width:100%;opacity:.6;font-size:12px;border-top:1px solid rgba(255,255,255,.1);padding-top:14px}
@media(max-width:1080px){
${s('hero')}{grid-template-columns:1fr;gap:18px}${s('lead')}{aspect-ratio:16/9;min-height:0}${s('hside')}{align-self:stretch}
${s('artwrap')}{grid-template-columns:1fr;max-width:760px;gap:34px}
${s('asticky')}{position:static}
${s('alist')}{display:grid;grid-template-columns:1fr 1fr;gap:0 26px}${s('alist')} a:nth-last-child(2):nth-child(odd){border-bottom:0}
${s('grid')}{grid-template-columns:1fr 1fr}
${s('alta')}{grid-template-columns:1fr 1fr}
${s('ai')}{padding:16px 20px}${s('ai')}:nth-child(2n){border-right:0;padding-right:0}${s('ai')}:nth-child(n+3){border-top:1px solid var(--line)}
main{padding:30px 32px 12px}
}
@media(max-width:900px){
:root{--sidew:0px}
${s('shell')}{grid-template-columns:minmax(0,1fr)}
${s('mainw')}{overflow-x:hidden}
${s('side')}{position:fixed;top:0;left:0;width:286px;max-width:84vw;height:100vh;transform:translateX(-101%);transition:transform .3s cubic-bezier(.2,.7,.2,1);z-index:80}
${s('navtog')}:checked ~ ${s('shell')} ${s('side')}{transform:none;box-shadow:0 0 60px rgba(0,0,0,.55)}
${s('scrim')}{display:block;position:fixed;inset:0;background:rgba(8,10,15,.5);opacity:0;pointer-events:none;transition:opacity .3s;z-index:75}
${s('navtog')}:checked ~ ${s('shell')} ${s('scrim')}{opacity:1;pointer-events:auto}
${s('topbar')}{display:flex;align-items:center;justify-content:center;position:sticky;top:0;z-index:50;width:100%;background:var(--bar-bg);color:#fff;padding:14px 16px;box-shadow:0 1px 0 rgba(255,255,255,.06)}
${s('burger')}{position:absolute;left:15px;top:50%;margin-top:-15px;display:inline-flex;flex-direction:column;justify-content:center;gap:5px;width:30px;height:30px;cursor:pointer;flex:none}
${s('burger')} span{display:block;height:2px;width:22px;background:#fff;border-radius:2px;transition:.25s}
${s('navtog')}:checked ~ ${s('shell')} ${s('burger')} span:nth-child(1){transform:translateY(7px) rotate(45deg)}
${s('navtog')}:checked ~ ${s('shell')} ${s('burger')} span:nth-child(2){opacity:0}
${s('navtog')}:checked ~ ${s('shell')} ${s('burger')} span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
${s('tbrand')}{font-family:var(--fd);font-weight:800;font-size:19px;letter-spacing:-.025em;color:#fff}
${s('tbrand')} b{color:var(--p)}
${s('side')} ${s('snav')} a{font-size:15px;padding:12px 14px}
main{padding:22px 18px 14px;max-width:none}
${s('foot')}{padding:28px 18px 24px}
}
@media(max-width:560px){${s('grid')}{grid-template-columns:1fr}${s('alta')}{grid-template-columns:1fr}${s('alta')} ${s('ai')}{border-right:0!important;border-top:1px solid var(--line);padding:16px 0!important}${s('alta')} ${s('ai')}:first-child{border-top:0}
${s('hs')}{grid-template-columns:minmax(0,1fr) 76px}
${s('alist')}{grid-template-columns:1fr}${s('alist')} a{border-bottom:1px solid var(--line)}
${s('lead')} h2{font-size:22px}${s('lead')} .ov{padding:20px}
${s('card')}:active .h,${s('hs')}:active .h,${s('ai')}:active .h,${s('lead')}:active h2{color:var(--p)}}`;
}
function kHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<input type="checkbox" id="${c('navtog')}" class="${c('navtog')}" aria-hidden="true">
<div class="${c('shell')}">
<aside class="${c('side')}">
<a class="${c('brand')}" href="/" rel="home">${brand}</a>
<div class="${c('stag')}">${H.esc(site.tagline || 'Edição Digital')}</div>
<nav class="${c('snav')}" aria-label="Editorias">${links}</nav>
<div class="${c('swidget')}"><span class="lv">Ao vivo</span><span class="dt">${H.esc(H.dateFull())}</span></div>
<div class="${c('sinst')}">${H.instLinks()}</div>
</aside>
<label for="${c('navtog')}" class="${c('scrim')}" aria-hidden="true"></label>
<div class="${c('mainw')}">
<header class="${c('topbar')}"><label for="${c('navtog')}" class="${c('burger')}" aria-label="Abrir menu"><span></span><span></span><span></span></label><a class="${c('tbrand')}" href="/" rel="home">${brand}</a></header>`;
}
function kFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<footer class="${c('foot')}">
<a class="l" href="/" rel="home">${brand}</a>
<nav class="n" aria-label="Rodapé">${cats}${H.instLinks()}</nav>
<div class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</footer>
</div></div>
${H.bodyEnd()}`;
}
function kLead(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  return `<a class="${c('lead')}" href="${H.url(a)}">${a.image ? H.pic(a, true) : ''}<span class="ov"><span class="${c('chip')}">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2></span></a>`;
}
function kHs(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('hs')}" href="${H.url(a)}"><span><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></span><span class="im">${H.pic(a, false)}</span></a>`;
}
function kCard(ctx, a) {
  const { c, H } = ctx;
  const hasImg = !!a.image;
  return `<a class="${c('card')} ${c('reveal')}" href="${H.url(a)}">${hasImg ? `<span class="im">${H.pic(a, false)}</span>` : ''}<span class="b"><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></span></a>`;
}
function kHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const lead = arts[0];
  const hside = arts.slice(1, 4);
  const alta = arts.slice(4, 8);
  const rest = arts.slice(8);
  const hero = lead ? `<section class="${c('hero')}"><div>${kLead(ctx, lead)}</div><div class="${c('hside')}">${hside.map(a => kHs(ctx, a)).join('')}</div></section>` : '';
  const altaHtml = alta.length ? `<div class="${c('altah')}">Em alta</div><div class="${c('alta')}">${alta.map((a, i) => `<a class="${c('ai')}" href="${H.url(a)}"><span class="n">${i + 1}</span><span class="h">${H.esc(a.title)}</span></a>`).join('')}</div>` : '';
  const byCat = new Map();
  for (const a of rest) { const cs = a.category ? a.category.slug : 'noticias'; if (!byCat.has(cs)) byCat.set(cs, { name: a.category ? a.category.name : 'Notícias', items: [] }); byCat.get(cs).items.push(a); }
  const blocks = [...byCat.entries()].filter(([, v]) => v.items.length >= 3).slice(0, 5).map(([cs, v]) =>
    `<section class="${c('sec')}"><div class="${c('sech')}"><span class="t">${H.esc(v.name)}</span><span class="ln"></span><a class="more" href="/${H.esc(cs)}/">ver tudo</a></div>
<div class="${c('grid')}">${v.items.slice(0, 4).map(a => kCard(ctx, a)).join('')}</div></section>`).join('\n');
  return `${H.head(ctx, H.homeMeta(ctx.site))}
${kHeader(ctx, menu)}
<main>
${H.h1(ctx)}
${hero}
${altaHtml}
${blocks}
</main>
${kFooter(ctx, menu)}`;
}
function kAsideItem(ctx, a) {
  const { c, H } = ctx;
  return `<a href="${H.url(a)}"><span class="im">${H.pic(a, false)}</span><span><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></span></a>`;
}
function kArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure>${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const aside = `<aside class="${c('aside')}"><div class="${c('asticky')}">${(related && related.length) ? `<div class="${c('asideh')}">Leia também</div><div class="${c('alist')}">${related.map(a => kAsideItem(ctx, a)).join('')}</div>` : ''}<a class="${c('aback')}" href="/${H.esc(P.catSlug)}/">Mais em ${H.esc(P.catName)}</a></div></aside>`;
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${kHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('artwrap')}"><article class="${c('art')}">
${H.crumbs(ctx, art, P)}
<span class="${c('chip')}"><a href="/${H.esc(P.catSlug)}/" style="color:var(--onp)">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('dek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('body')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${aside}
</div>
</main>
${kFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function kList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${kHeader(ctx, opts.menu)}
<main>
<div class="${c('sech')}" style="margin-top:8px"><span class="t">${H.esc(opts.title)}</span><span class="ln"></span></div>
<div class="${c('grid')}" style="margin-top:18px">${opts.items.map(a => kCard(ctx, a)).join('')}</div>
</main>
${kFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH L =====================
 * Escrita para o entrenoticia.com sair de cima da H, que fica so com o
 * diariodatv.com. Mesma instancia antiga do motor, mesmos helpers da H.
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function lCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--p2:${p2}}
${s('lrail')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 26px}
${s('lbar')}{position:sticky;top:0;z-index:45;background:var(--paper);border-bottom:1px solid var(--line)}
${s('lbar')}::after{content:"";display:block;height:3px;background:linear-gradient(90deg,var(--p) 0,var(--p2) 46%,transparent 46%)}
${s('lbar')} ${s('lrail')}{display:flex;align-items:center;gap:24px;padding-top:13px;padding-bottom:13px}
${s('lid')}{flex:0 0 auto;min-width:0}
${s('lmark')}{position:relative;display:block;font-family:var(--fd);font-weight:800;font-size:clamp(23px,3.2vw,33px);line-height:.98;letter-spacing:.004em;color:var(--ink);padding-left:15px}
${s('lmark')}::before{content:"";position:absolute;left:0;top:3px;bottom:3px;width:6px;background:var(--p)}
${s('lmark')} b{color:var(--p)}
${s('lpitch')}{display:block;font-family:var(--fb);font-size:10.5px;font-weight:600;letter-spacing:.18em;color:var(--muted);margin-top:6px;padding-left:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${s('lmenu')}{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
${s('lmenu')}::-webkit-scrollbar{display:none}
${s('lmenu')} a{flex:0 0 auto;font-family:var(--fd);font-weight:600;font-size:15.5px;letter-spacing:.01em;color:var(--ink);padding:9px 13px;white-space:nowrap;border-radius:var(--rad-sm);transition:color .18s ease,background .18s ease}
${s('lmenu')} a:hover{color:var(--p);background:color-mix(in srgb,var(--p) 13%,transparent)}
${s('lstamp')}{flex:0 0 auto;font-family:var(--fb);font-size:11px;letter-spacing:.14em;color:var(--muted);line-height:1.4;max-width:22ch}
main{padding:30px 0 12px}
${s('lchip')}{display:inline-block;font-family:var(--fb);font-weight:700;font-size:10.5px;letter-spacing:.16em;color:var(--p);border:1px solid color-mix(in srgb,var(--p) 48%,transparent);padding:4px 10px;border-radius:var(--rad-sm);line-height:1.15}
${s('lchip')} a{color:var(--p)}
${s('lfront')}{display:grid;grid-template-columns:minmax(0,.88fr) minmax(0,2.1fr) minmax(0,1.04fr);gap:36px;align-items:start;padding-bottom:34px;border-bottom:1px solid var(--line)}
${s('lopen')}{grid-column:2;grid-row:1;display:block}
${s('lopen')} ${s('kicker')}{display:inline-block}
${s('lopen')} .t{display:block;font-family:var(--fd);font-weight:800;font-size:clamp(30px,4vw,50px);line-height:1.01;letter-spacing:.002em;color:var(--ink);margin:12px 0 0;max-width:21ch;text-wrap:balance}
${s('lopen')}:hover .t{color:var(--p)}
${s('lopen')} .d{display:block;font-family:var(--fb);font-size:17px;line-height:1.55;color:var(--dek);margin:14px 0 0;max-width:58ch}
${s('lopen')} .i{display:block;margin-top:20px;aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad)}
${s('lopen')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
${s('lopen')}:hover .i img{transform:scale(1.035)}
${s('lwire')}{grid-column:1;grid-row:1;border-top:3px solid var(--p)}
${s('lmost')}{grid-column:3;grid-row:1;border-top:3px solid var(--ink)}
${s('lwireh')},${s('lmosth')}{font-family:var(--fd);font-weight:800;font-size:13px;letter-spacing:.18em;color:var(--ink);margin:0;padding:12px 0 2px}
${s('lping')}{display:block;padding:13px 0 13px 14px;border-bottom:1px solid var(--line);border-left:2px solid transparent;transition:border-color .18s ease}
${s('lping')}:last-child{border-bottom:0}
${s('lping')}:hover{border-left-color:var(--p)}
${s('lping')} time{display:block;font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--p);margin-bottom:5px}
${s('lping')} .h{display:block;font-family:var(--fd);font-weight:600;font-size:16.5px;line-height:1.2;color:var(--ink)}
${s('lping')}:hover .h{color:var(--p)}
${s('lbrief')}{display:grid;grid-template-columns:96px minmax(0,1fr);gap:14px;align-items:center;padding:13px 0;border-bottom:1px solid var(--line)}
${s('lbrief')}.noi{grid-template-columns:minmax(0,1fr)}
${s('lbrief')}:last-child{border-bottom:0}
${s('lbrief')} .i{aspect-ratio:4/3;overflow:hidden;border-radius:var(--rad-sm);background:var(--ph)}
${s('lbrief')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('lbrief')}:hover .i img{transform:scale(1.05)}
${s('lbrief')} ${s('kicker')}{display:block;margin-bottom:4px}
${s('lbrief')} .h{display:block;font-family:var(--fd);font-weight:600;font-size:15.5px;line-height:1.24;color:var(--ink)}
${s('lbrief')}:hover .h{color:var(--p)}
${s('lband')}{margin:var(--block) 0 0;content-visibility:auto;contain-intrinsic-size:auto 640px}
${s('lbandh')}{display:flex;align-items:baseline;justify-content:space-between;gap:20px;border-top:3px solid var(--ink);padding-top:13px;margin:0 0 20px}
${s('lbandh')} .t{font-family:var(--fd);font-weight:800;font-size:clamp(21px,2.5vw,29px);line-height:1.02;letter-spacing:.008em;color:var(--ink)}
${s('lbandh')} .more{font-family:var(--fb);font-weight:700;font-size:11px;letter-spacing:.14em;color:var(--muted);min-height:44px;display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
${s('lbandh')} .more::after{content:"+";font-family:var(--fd);font-size:16px;line-height:1;color:var(--p)}
${s('lbandh')} .more:hover{color:var(--p)}
${s('lgrid')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:34px var(--col)}
${s('lstack')}{display:block}
${s('lstack')}.noi{border-top:2px solid var(--line);padding-top:15px}
${s('lstack')} .i{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad);margin-bottom:14px}
${s('lstack')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .55s ease}
${s('lstack')}:hover .i img{transform:scale(1.04)}
${s('lstack')} ${s('kicker')}{display:block;margin-bottom:7px}
${s('lstack')} .h{display:block;font-family:var(--fd);font-weight:700;font-size:20.5px;line-height:1.16;letter-spacing:.004em;color:var(--ink)}
${s('lstack')}:hover .h{color:var(--p)}
${s('lstack')} time{display:block;font-family:var(--fb);font-size:11.5px;color:var(--muted);margin-top:9px}
${s('lroll')}{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px var(--col);margin-top:22px}
${s('lrow')}{display:grid;grid-template-columns:200px minmax(0,1fr);gap:20px;align-items:start;padding-bottom:24px;border-bottom:1px solid var(--line)}
${s('lrow')}.noi{grid-template-columns:minmax(0,1fr)}
${s('lrow')} .i{aspect-ratio:4/3;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('lrow')} .i img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .55s ease}
${s('lrow')}:hover .i img{transform:scale(1.04)}
${s('lrow')} ${s('kicker')}{display:block;margin-bottom:6px}
${s('lrow')} .h{display:block;font-family:var(--fd);font-weight:700;font-size:19.5px;line-height:1.18;color:var(--ink)}
${s('lrow')}:hover .h{color:var(--p)}
${s('lrow')} .d{display:block;font-family:var(--fb);font-size:14px;line-height:1.5;color:var(--dek);margin-top:8px;max-width:46ch}
${s('lrow')} time{display:block;font-family:var(--fb);font-size:11.5px;color:var(--muted);margin-top:9px}
${s('lshot')}{max-width:1000px;margin:0 auto 28px}
${s('lshot')} img{width:100%;height:auto;display:block;border-radius:var(--rad)}
${s('lshot')} figcaption{font-family:var(--fb);font-size:13px;color:var(--muted);margin-top:9px;font-style:italic;max-width:64ch}
${s('lpage')}{max-width:66ch;margin:0 auto;padding:6px 0 10px}
${s('lpage')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(31px,4.6vw,52px);line-height:1.02;letter-spacing:.002em;color:var(--ink);margin:14px 0 14px}
${s('lsumario')}{font-family:var(--fb);font-size:18px;line-height:1.55;color:var(--dek);margin:0 0 16px;max-width:60ch}
${s('lprose')}{font-family:var(--fb);font-size:calc(var(--fs) + 1px);line-height:1.78;max-width:64ch}
${s('lprose')}>p:first-of-type{font-size:1.08em;line-height:1.66}
${s('lprose')} p{margin:0 0 21px}
${s('lprose')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('lprose')} h2{font-family:var(--fd);font-weight:800;font-size:29px;line-height:1.1;letter-spacing:.002em;color:var(--ink);margin:38px 0 15px}
${s('lprose')} h2::after{content:"";display:block;width:58px;height:3px;background:var(--p);border-radius:2px;margin-top:12px}
${s('lprose')} h3{font-family:var(--fd);font-weight:700;font-size:22px;line-height:1.18;color:var(--ink);margin:28px 0 11px}
${s('lprose')} ul,${s('lprose')} ol{margin:0 0 21px;padding-left:22px}
${s('lprose')} li{margin:0 0 9px}
${s('lprose')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('lprose')} blockquote{margin:30px 0;padding:20px 22px;background:var(--surface);border-radius:var(--rad);font-family:var(--fd);font-weight:600;font-size:22px;line-height:1.36;color:var(--ink)}
${s('lprose')} blockquote::before{content:"\\201C";display:block;font-family:var(--fd);font-size:42px;line-height:.62;color:var(--p);margin-bottom:9px}
${s('lprose')} blockquote p:last-child{margin-bottom:0}
${s('lprose')} pre{max-width:100%;overflow-x:auto;background:var(--surface);padding:15px;border-radius:var(--rad);font-size:14px;line-height:1.5}
${s('lprose')} table{display:block;width:100%;max-width:100%;overflow-x:auto;border-collapse:collapse;font-size:15px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('lprose')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('lprose')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('lprose')} table caption{display:none}
  ${s('lprose')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('lprose')} table tbody,${s('lprose')} table tr,
  ${s('lprose')} table th,${s('lprose')} table td{display:block;width:auto}
  ${s('lprose')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('lprose')} table tbody th,${s('lprose')} table tbody td{border:0;background:transparent;padding:0}
  ${s('lprose')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('lprose')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('lprose')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('lprose')} th,${s('lprose')} td{border:1px solid var(--line);padding:9px 11px;text-align:left}
${s('lmore')}{margin:54px 0 0;border-top:1px solid var(--line);padding-top:30px}
${s('lbase')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:var(--block);padding:44px 0 24px;font-family:var(--fb);font-size:14px;border-top:3px solid var(--p)}
${s('lbase')} .g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px;padding-bottom:28px}
${s('lbase')} .h{font-family:var(--fd);font-weight:700;font-size:12px;letter-spacing:.18em;color:#fff;margin:0 0 12px}
${s('lbase')} .ds{margin:0;line-height:1.65;max-width:42ch;color:var(--footer-tx)}
${s('lbase')} a{display:block;color:var(--footer-tx);padding:6px 0}
${s('lbase')} a:hover{color:var(--p)}
${s('lbase')} .e{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;border-top:1px solid rgba(255,255,255,.12);padding-top:20px}
${s('lbase')} .l{font-family:var(--fd);font-weight:800;font-size:23px;letter-spacing:.01em;color:#fff;padding:0}
${s('lbase')} .l b{color:var(--p)}
${s('lbase')} .l:hover{color:#fff}
${s('lbase')} .cp{font-size:12.5px;opacity:.68;max-width:60ch}
@media(max-width:1080px){
${s('lfront')}{grid-template-columns:minmax(0,1.95fr) minmax(0,1fr);gap:30px}
${s('lopen')}{grid-column:1;grid-row:1}
${s('lmost')}{grid-column:2;grid-row:1}
${s('lwire')}{grid-column:1 / -1;grid-row:2;margin-top:28px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 32px}
${s('lwireh')}{grid-column:1 / -1}
${s('lgrid')}{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:760px){
${s('lbar')} ${s('lrail')}{flex-wrap:wrap;gap:10px 18px;padding-bottom:0}
${s('lstamp')}{display:none}
${s('lmenu')}{order:3;flex:1 0 100%;border-top:1px solid var(--line);gap:0}
${s('lmenu')} a{min-height:48px;display:inline-flex;align-items:center;border-radius:0;font-size:15px}
${s('lfront')}{grid-template-columns:minmax(0,1fr);gap:28px;padding-bottom:28px}
${s('lopen')},${s('lmost')},${s('lwire')}{grid-column:auto;grid-row:auto}
${s('lwire')}{display:block;margin-top:0}
${s('lopen')} .t{font-size:clamp(26px,6.4vw,34px);max-width:26ch}
${s('lbrief')}{grid-template-columns:132px minmax(0,1fr)}
${s('lroll')}{grid-template-columns:minmax(0,1fr);gap:22px}
${s('lshot')}{margin-bottom:22px}
${s('lpage')}{padding-top:2px}
${s('lbase')} .g{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:520px){
${s('lrail')}{padding-left:16px;padding-right:16px}
${s('lpitch')}{display:none}
${s('lgrid')}{grid-template-columns:minmax(0,1fr);gap:28px}
${s('lrow')}{grid-template-columns:120px minmax(0,1fr);gap:14px}
${s('lrow')} .h{font-size:17px}
${s('lrow')} .d{display:none}
${s('lbrief')}{grid-template-columns:112px minmax(0,1fr)}
${s('lbrief')} .h{font-size:16px}
${s('lopen')} .d{font-size:15.5px}
${s('lprose')} h2{font-size:25px}
${s('lprose')} blockquote{font-size:19px;padding:16px 17px}
${s('lpage')} h1{font-size:clamp(27px,8.4vw,37px)}
${s('lbandh')}{flex-wrap:wrap;gap:6px 14px}
${s('lbase')} .g{grid-template-columns:minmax(0,1fr)}
${s('lopen')}:active .t,${s('lping')}:active .h,${s('lbrief')}:active .h,${s('lstack')}:active .h,${s('lrow')}:active .h{color:var(--p)}
${s('lmenu')} a:active{color:var(--p)}
}`;
}
function lHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<body>
<header class="${c('lbar')}"><div class="${c('lrail')}">
<span class="${c('lid')}"><a class="${c('lmark')}" href="/" rel="home">${brand}</a><span class="${c('lpitch')}">${H.esc(site.tagline || 'Notícias o dia todo')}</span></span>
<nav class="${c('lmenu')}" aria-label="Editorias">${links}</nav>
<span class="${c('lstamp')}">${H.esc(H.dateFull())}</span>
</div></header>`;
}
function lFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const brand = H.esc(site.name).replace(/\s(\S+)$/, ' <b>$1</b>');
  return `<footer class="${c('lbase')}"><div class="${c('lrail')}">
<div class="g">
<div><div class="h">Sobre</div><p class="ds">${H.esc(site.description || '')}</p></div>
<div><div class="h">Editorias</div>${cats || '<a href="/">Página inicial</a>'}</div>
<div><div class="h">Institucional</div>${H.instLinks()}</div>
</div>
<div class="e">
<a class="l" href="/" rel="home">${brand}</a>
<span class="cp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</span>
</div>
</div></footer>
${H.bodyEnd()}`;
}
function lOpen(ctx, a) {
  const { c, H } = ctx;
  if (!a) return '';
  const dek = a.excerpt ? `<span class="d">${H.esc(H.clip(a.excerpt, 190))}</span>` : '';
  const img = a.image ? `<span class="i">${H.pic(a, true)}</span>` : '';
  return `<a class="${c('lopen')}" href="${H.url(a)}"><span class="${c('kicker')}">${H.cat(a)}</span><span class="t">${H.esc(a.title)}</span>${dek}${img}</a>`;
}
function lPing(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('lping')}" href="${H.url(a)}"><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time><span class="h">${H.esc(a.title)}</span></a>`;
}
function lBrief(ctx, a) {
  const { c, H } = ctx;
  const hasImg = !!a.image;
  return `<a class="${c('lbrief')} ${c('reveal')}${hasImg ? '' : ' noi'}" href="${H.url(a)}">${hasImg ? `<span class="i">${H.pic(a, false)}</span>` : ''}<span><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span></span></a>`;
}
function lStack(ctx, a) {
  const { c, H } = ctx;
  const hasImg = !!a.image;
  return `<a class="${c('lstack')} ${c('reveal')}${hasImg ? '' : ' noi'}" href="${H.url(a)}">${hasImg ? `<span class="i">${H.pic(a, false)}</span>` : ''}<span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span><time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}
function lRow(ctx, a) {
  const { c, H } = ctx;
  const hasImg = !!a.image;
  const dek = a.excerpt ? `<span class="d">${H.esc(H.clip(a.excerpt, 150))}</span>` : '';
  return `<a class="${c('lrow')} ${c('reveal')}${hasImg ? '' : ' noi'}" href="${H.url(a)}">${hasImg ? `<span class="i">${H.pic(a, false)}</span>` : ''}<span><span class="${c('kicker')}">${H.cat(a)}</span><span class="h">${H.esc(a.title)}</span>${dek}<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></span></a>`;
}
function lHome(ctx, arts, menu) {
  const { c, H } = ctx;
  // a chamada principal mostra a foto depois do titulo, entao vale escolher o
  // primeiro dos quatro mais recentes que tenha imagem. Um terco do acervo nao tem.
  let li = arts.findIndex(a => a && a.image);
  if (li < 0 || li > 3) li = 0;
  const lead = arts[li];
  const pool = arts.filter((a, i) => i !== li);
  const most = pool.slice(0, 5);
  const wire = pool.slice(5, 11);
  const rest = pool.slice(11);
  const mostHtml = most.length ? `<aside class="${c('lmost')}"><div class="${c('lmosth')}">Mais lidas</div>${most.map(a => lBrief(ctx, a)).join('')}</aside>` : '';
  const wireHtml = wire.length ? `<aside class="${c('lwire')}"><div class="${c('lwireh')}">Giro do dia</div>${wire.map(a => lPing(ctx, a)).join('')}</aside>` : '';
  const front = lead ? `<section class="${c('lfront')}">${lOpen(ctx, lead)}${mostHtml}${wireHtml}</section>` : '';
  const byCat = new Map();
  for (const a of rest) { const cs = a.category ? a.category.slug : 'noticias'; if (!byCat.has(cs)) byCat.set(cs, { name: a.category ? a.category.name : 'Notícias', items: [] }); byCat.get(cs).items.push(a); }
  const blocks = [...byCat.entries()].filter(([, v]) => v.items.length >= 3).slice(0, 5).map(([cs, v]) =>
    `<section class="${c('lband')}"><div class="${c('lbandh')}"><span class="t">${H.esc(v.name)}</span><a class="more" href="/${H.esc(cs)}/">ver tudo</a></div>
<div class="${c('lgrid')}">${v.items.slice(0, 3).map(a => lStack(ctx, a)).join('')}</div></section>`).join('\n');
  return `${H.head(ctx, H.homeMeta(ctx.site))}
${lHeader(ctx, menu)}
<main><div class="${c('lrail')}">
${H.h1(ctx)}
${front}
${blocks}
</div></main>
${lFooter(ctx, menu)}`;
}
function lArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const shot = art.image ? `<figure class="${c('lshot')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('lmore')}"><div class="${c('lbandh')}"><span class="t">Leia também</span><a class="more" href="/${H.esc(P.catSlug)}/">mais de ${H.esc(P.catName)}</a></div>
<div class="${c('lgrid')}">${related.map(a => lStack(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${lHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('lrail')}">
${shot}
<article class="${c('lpage')}">
${H.crumbs(ctx, art, P)}
<span class="${c('lchip')}"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('lsumario')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
<div class="${c('lprose')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${lFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}
function lList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${lHeader(ctx, opts.menu)}
<main><div class="${c('lrail')}">
<div class="${c('lbandh')}" style="margin-top:26px"><span class="t">${H.esc(opts.title)}</span></div>
<div class="${c('lroll')}">${opts.items.map(a => lRow(ctx, a)).join('')}</div>
</div></main>
${lFooter(ctx, opts.menu)}`;
}

// ============================================================ ARQUETIPO L
// jornal de tres colunas, claro na estrutura e escuro na paleta: barra unica
// grudada no topo (marca, editorias e data na MESMA linha, sem masthead e sem
// faixa utilitaria), FRENTE EM TRES COLUNAS (giro cronologico a esquerda,
// chamada principal ao centro com a foto DEPOIS do titulo e do resumo, mais
// lidas a direita com miniatura), blocos de editoria em grade de tres com filete
// grosso acima do titulo, single de foto larga sobre coluna de leitura de 64ch
// com h2 sublinhado por barra de acento, listagem em fileiras de miniatura a
// esquerda e rodape com marca embaixo. Manchete em caixa mista, caixa alta so
// nos rotulos pequenos.


/* ===================== ARCH M =====================
 * Primeira das quinze arquiteturas do lote de 18/08/2026, servidor
 * hostinger-vps-srv1166087, que ja usava A ate L.
 *
 * Arquetipo: MOSAICO ASSIMETRICO. A home nao tem hero classico: e um mosaico
 * de blocos de tamanhos diferentes numa grade de quatro colunas, com a chamada
 * principal ocupando 2x2 e as demais alternando 2x1 e 1x1. O texto de cada
 * bloco fica sobre a foto, no rodape, com vinheta. Header em barra unica com
 * a marca em caixa alta espacada. Single com foto sangrando para fora da
 * coluna de leitura. Listagem em grade regular de tres.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
/* ===================== ARCH M =====================
 * Primeira das quinze arquiteturas do lote de 18/08/2026, servidor
 * hostinger-vps-srv1166087, que ja usava A ate L.
 *
 * Arquetipo: MOSAICO ASSIMETRICO. A home nao tem hero classico: e um mosaico
 * de blocos de tamanhos diferentes numa grade de quatro colunas, com a chamada
 * principal ocupando 2x2 e as demais alternando 2x1 e 1x1. O texto de cada
 * bloco fica sobre a foto, no rodape, com vinheta. Header em barra unica com
 * a marca em caixa alta espacada. Single com foto sangrando para fora da
 * coluna de leitura. Listagem em grade regular de tres.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
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

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('mbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('mbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('mbody')} table caption{display:none}
  ${s('mbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('mbody')} table tbody,${s('mbody')} table tr,
  ${s('mbody')} table th,${s('mbody')} table td{display:block;width:auto}
  ${s('mbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('mbody')} table tbody th,${s('mbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('mbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('mbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('mbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
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
  return `<body>
<header class="${c('mtop')}"><div class="${c('mwrap')}">
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
    // multiplo de tres: a grade tem tres colunas e linha pela metade fica torta.
    // Editoria que nao completa uma linha nao ganha secao propria
    const cabe = Math.min(9, Math.floor(todos.length / 3) * 3);
    if (!cabe) { sobra.push(...todos); continue; }
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

/* ===================== ARCH N =====================
 * Segunda das quinze do lote de 18/08/2026, servidor hostinger-vps-srv1166087.
 *
 * Arquetipo: TRILHO LATERAL FIXO. Nao ha barra no topo: a marca, a navegacao e
 * a data ficam numa coluna estreita grudada a esquerda, e o conteudo corre a
 * direita. A home abre com uma chamada horizontal larga (foto a esquerda, texto
 * a direita) e segue em fileiras de dois. Single com sumario preso no alto e
 * corpo em coluna de 66ch. Listagem em fileiras horizontais.
 *
 * No mobile o trilho vira barra comum no topo, com a navegacao rolando na
 * horizontal, porque coluna fixa em tela estreita come metade do viewport.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function nCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--n2:${p2};--nrail:232px}
${s('nshell')}{display:grid;grid-template-columns:var(--nrail) minmax(0,1fr);min-height:100vh;align-items:start}
${s('nrail')}{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:30px 22px;border-right:1px solid var(--line);background:var(--surface)}
${s('nbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(22px,2.3vw,29px);line-height:1.02;letter-spacing:-.015em;color:var(--ink);display:block}
${s('nbrand')} b{display:block;color:var(--p)}
${s('npitch')}{margin-top:12px;font-family:var(--fb);font-size:11.5px;line-height:1.5;letter-spacing:.06em;color:var(--muted)}
${s('nmenu')}{margin-top:30px;display:flex;flex-direction:column;gap:2px;flex:1 1 auto;overflow-y:auto;scrollbar-width:none}
${s('nmenu')}::-webkit-scrollbar{display:none}
${s('nmenu')} a{position:relative;font-family:var(--fb);font-size:14px;font-weight:600;color:var(--muted);padding:7px 0 7px 15px;border-left:2px solid transparent}
${s('nmenu')} a:hover{color:var(--ink);border-left-color:var(--p);background:linear-gradient(90deg,rgba(0,0,0,.03),transparent)}
${s('nfootrail')}{margin-top:22px;padding-top:16px;border-top:1px solid var(--line);font-family:var(--fb);font-size:11px;letter-spacing:.12em;color:var(--muted)}
${s('nmain')}{min-width:0;padding:34px 40px 8px}
${s('nlead')}{display:grid;grid-template-columns:minmax(0,.96fr) minmax(0,1.04fr);gap:36px;align-items:center;padding-bottom:30px;border-bottom:2px solid var(--ink);margin-bottom:32px}
${s('nlead')} .nph{aspect-ratio:var(--hero-ar);overflow:hidden;border-radius:var(--rad-lg);background:var(--ph)}
${s('nlead')} .nph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('nlead')}:hover .nph img{transform:scale(1.04)}
${s('nkick')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--n2);border-bottom:2px solid var(--n2);padding-bottom:3px}
${s('nlead')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(26px,3.6vw,42px);line-height:1.08;letter-spacing:-.02em;margin:14px 0 10px;color:var(--ink)}
${s('nlead')}:hover h2{color:var(--p)}
${s('nlead')} p{margin:0;color:var(--dek);font-size:16.5px;line-height:1.55;max-width:54ch}
${s('nsec')}{margin-top:38px}
${s('nsech')}{display:flex;align-items:center;gap:12px;margin:0 0 18px}
${s('nsech')} h1,${s('nsech')} h2{font-family:var(--fd);font-weight:800;font-size:20px;letter-spacing:.01em;margin:0;color:var(--ink);white-space:nowrap}
${s('nsech')} .nln{flex:1;height:1px;background:var(--line)}
${s('nrows')}{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 30px}
${s('nrow')}{display:grid;grid-template-columns:126px minmax(0,1fr);gap:16px;align-items:start}
${s('nrow')} .t{aspect-ratio:1/1;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('nrow')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('nrow')}:hover .t img{transform:scale(1.06)}
${s('nrow')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--p)}
${s('nrow')} h3{font-family:var(--fd);font-weight:700;font-size:17.5px;line-height:1.24;letter-spacing:-.008em;margin:5px 0 0;color:var(--ink)}
${s('nrow')}:hover h3{color:var(--p)}
${s('nrow')} p{margin:6px 0 0;color:var(--dek);font-size:13.5px;line-height:1.45}
${s('nart')}{max-width:66ch;margin:0;padding:6px 0 8px}
${s('nahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,3.9vw,44px);line-height:1.09;letter-spacing:-.022em;margin:12px 0 14px;color:var(--ink)}
${s('ndek')}{font-size:18.5px;line-height:1.52;color:var(--dek);margin:0 0 18px;padding-left:16px;border-left:3px solid var(--n2)}
${s('nfig')}{margin:22px 0 28px}
${s('nfig')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('nfig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px;font-style:italic}
${s('nbody')}{font-size:calc(var(--fs) + 1px);line-height:1.8;color:var(--ink)}
${s('nbody')} p{margin:0 0 21px}
${s('nbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('nbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.01em;margin:34px 0 12px}
${s('nbody')} h2::after{content:"";display:block;width:44px;height:3px;background:var(--n2);margin-top:9px}
${s('nbody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;margin:26px 0 10px}
${s('nbody')} ul,${s('nbody')} ol{margin:0 0 21px;padding-left:20px}
${s('nbody')} li{margin:0 0 8px}
${s('nbody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('nbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('nbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('nbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('nbody')} table caption{display:none}
  ${s('nbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('nbody')} table tbody,${s('nbody')} table tr,
  ${s('nbody')} table th,${s('nbody')} table td{display:block;width:auto}
  ${s('nbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('nbody')} table tbody th,${s('nbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('nbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('nbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('nbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('nbody')} th,${s('nbody')} td{border-bottom:1px solid var(--line);padding:10px 8px;text-align:left}
${s('nbody')} th{font-family:var(--fb);font-weight:700;border-bottom:2px solid var(--ink)}
${s('nbody')} blockquote{margin:24px 0;padding:0 0 0 20px;border-left:3px solid var(--p);font-family:var(--fd);font-size:20px;line-height:1.45;color:var(--ink)}
${s('nrel')}{margin-top:42px;padding-top:8px;border-top:1px solid var(--line);max-width:66ch}
${s('nrel')} ${s('nrows')}{grid-template-columns:1fr;gap:20px}
${s('nfoot')}{margin-top:52px;padding:28px 0 20px;border-top:2px solid var(--ink);font-size:14px;color:var(--muted)}
${s('nfoot')} .ncols{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:28px}
${s('nfoot')} .nfh{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:var(--ink);margin-bottom:10px}
${s('nfoot')} a{display:block;color:var(--muted);padding:3px 0}
${s('nfoot')} a:hover{color:var(--p)}
${s('nfoot')} .ncp{margin-top:22px;padding-top:14px;border-top:1px solid var(--line);font-size:12.5px}
@media(max-width:1080px){${s('nrows')}{grid-template-columns:1fr}}
@media(max-width:900px) and (min-width:701px){${s('nrows')}{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:900px){
${s('nshell')}{grid-template-columns:1fr}
${s('nrail')}{position:sticky;top:0;z-index:45;height:auto;flex-direction:row;align-items:center;gap:18px;padding:12px 20px;border-right:0;border-bottom:1px solid var(--line);background:var(--paper)}
${s('nbrand')}{font-size:21px;white-space:nowrap}
${s('nbrand')} b{display:inline;margin-left:.3em}
${s('npitch')},${s('nfootrail')}{display:none}
${s('nmenu')}{margin-top:0;flex-direction:row;gap:16px;overflow-x:auto}
${s('nmenu')} a{border-left:0;border-bottom:2px solid transparent;padding:4px 0}
${s('nmenu')} a:hover{border-left:0;border-bottom-color:var(--p);background:none}
${s('nmain')}{padding:24px 20px 8px}
${s('nlead')}{grid-template-columns:1fr;gap:16px}
${s('nfoot')} .ncols{grid-template-columns:1fr;gap:22px}
}
@media(max-width:560px){${s('nrow')}{grid-template-columns:92px minmax(0,1fr);gap:12px}}`;
}

function nRail(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const partes = nome.split(' ');
  const marca = partes.length > 1
    ? `${partes[0]}<b>${partes.slice(1).join(' ')}</b>`
    : `${nome.slice(0, Math.ceil(nome.length / 2))}<b>${nome.slice(Math.ceil(nome.length / 2))}</b>`;
  return `<body>
<aside class="${c('nrail')}">
<a class="${c('nbrand')}" href="/">${marca}</a>
${site.tagline ? `<span class="${c('npitch')}">${H.esc(site.tagline)}</span>` : ''}
<nav class="${c('nmenu')}">${links}</nav>
<span class="${c('nfootrail')}">${H.dateShort()}</span>
</aside>`;
}

function nHeader(ctx, menu) { return nRail(ctx, menu); }

function nFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('nfoot')}">
<div class="ncols">
<div><div class="nfh">${H.esc(site.name)}</div><p style="margin:0;max-width:40ch;line-height:1.55">${H.esc(site.description || '')}</p></div>
<div><div class="nfh">Editorias</div>${cats}</div>
<div><div class="nfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="ncp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</footer>
${H.bodyEnd()}`;
}

function nRow(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('nrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="t">${H.pic(a, false)}</span>
<span><span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 92))}</p>` : ''}</span></a>`;
}

function nHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const lead = arts[0];
  const resto = arts.slice(1, site.postsOnHome || 60);
  const chamada = lead ? `<a class="${c('nlead')}" href="${H.url(lead)}">
<span><span class="${c('nkick')}">${H.cat(lead)}</span><h2>${H.esc(lead.title)}</h2>
${lead.excerpt ? `<p>${H.esc(H.clip(lead.excerpt, 190))}</p>` : ''}</span>
<span class="nph">${H.pic(lead, true)}</span></a>` : '';
  // fatiar de oito em oito dava duas secoes seguidas chamadas "Casa", a segunda
  // recheada de materia de outra editoria
  const ordem = [], porCat = new Map();
  for (const a of resto) {
    const nome = H.cat(a);
    if (!porCat.has(nome)) { porCat.set(nome, []); ordem.push(nome); }
    porCat.get(nome).push(a);
  }
  const sobra = [], blocos = [];
  for (const nome of ordem) {
    const todos = porCat.get(nome);
    // multiplo de dois: a grade tem duas colunas e meia linha fica torta.
    // Editoria que nao completa uma linha nao ganha secao propria
    const cabe = Math.min(8, Math.floor(todos.length / 2) * 2);
    if (!cabe) { sobra.push(...todos); continue; }
    sobra.push(...todos.slice(cabe));
    blocos.push(`<section class="${c('nsec')}">
<div class="${c('nsech')}"><h2>${nome}</h2><span class="nln"></span></div>
<div class="${c('nrows')}">${todos.slice(0, cabe).map(a => nRow(ctx, a)).join('')}</div>
</section>`);
  }
  if (sobra.length) blocos.push(`<section class="${c('nsec')}">
<div class="${c('nsech')}"><h2>Mais notícias</h2><span class="nln"></span></div>
<div class="${c('nrows')}">${sobra.map(a => nRow(ctx, a)).join('')}</div>
</section>`);
  return `${H.head(ctx, H.homeMeta(site))}
<div class="${c('nshell')}">
${nRail(ctx, menu)}
<main class="${c('nmain')}">
${H.h1(ctx)}
${chamada}
${blocos.join('')}
${nFooter(ctx, menu)}
</main>
</div>`;
}

function nArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('nfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('nrel')}">
<div class="${c('nsech')}"><h2>Leia também</h2><span class="nln"></span></div>
<div class="${c('nrows')}">${related.map(a => nRow(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
<div class="${c('nshell')}">
${nRail(ctx, menu)}
<main class="${c('nmain')}">
${H.progressBar(ctx)}
<article class="${c('nart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('nahead')}">
<span class="${c('nkick')}"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<p class="${c('ndek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('nbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
${nFooter(ctx, menu)}
</main>
</div>
${H.progressScript(ctx)}`;
}

function nList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
<div class="${c('nshell')}">
${nRail(ctx, opts.menu)}
<main class="${c('nmain')}">
<div class="${c('nsech')}"><h1>${H.esc(opts.title)}</h1><span class="nln"></span></div>
<div class="${c('nrows')}">${opts.items.map(a => nRow(ctx, a)).join('')}</div>
${nFooter(ctx, opts.menu)}
</main>
</div>`;
}

/* ===================== ARCH O =====================
 * Terceira das quinze do lote de 18/08/2026, servidor hostinger-vps-srv1166087.
 *
 * Arquetipo: LINHA DO TEMPO. A home nao usa grade nem hero: e uma coluna unica
 * de acontecimentos, com um filete vertical a esquerda e um marcador redondo em
 * cada entrada, no formato de cobertura ao vivo. A primeira entrada e aberta,
 * com foto larga; as demais alternam entre entrada com miniatura a direita e
 * entrada so de texto, para o ritmo nao ficar mecanico. Single de coluna unica
 * com sumario em caixa de fundo. Listagem na mesma linha do tempo.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function oCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--o2:${p2}}
${s('owrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 24px}
${s('otop')}{position:sticky;top:0;z-index:45;background:var(--paper);border-bottom:2px solid var(--ink)}
${s('otop')} ${s('owrap')}{display:flex;align-items:baseline;gap:22px;min-height:60px;flex-wrap:wrap}
${s('obrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(21px,2.6vw,28px);letter-spacing:-.02em;color:var(--ink);white-space:nowrap}
${s('obrand')} i{font-style:normal;color:var(--p)}
${s('olive')}{display:inline-flex;align-items:center;gap:6px;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.15em;color:var(--o2)}
${s('olive')}::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--o2);animation:opulse 2.2s ease-in-out infinite}
@keyframes opulse{0%,100%{opacity:1}50%{opacity:.25}}
${s('onav')}{flex:1 1 auto;min-width:0;display:flex;gap:18px;overflow-x:auto;scrollbar-width:none}
${s('onav')}::-webkit-scrollbar{display:none}
${s('onav')} a{font-family:var(--fb);font-size:13px;font-weight:600;color:var(--muted);white-space:nowrap;padding:4px 0}
${s('onav')} a:hover{color:var(--p)}
main{padding:28px 0 8px}
${s('opag')}{display:grid;grid-template-columns:minmax(0,1fr) 316px;gap:44px;align-items:start}
${s('otrilho')}{position:sticky;top:80px;border-top:2px solid var(--ink);padding-top:16px}
${s('otrilho')} .oth{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;color:var(--p);margin-bottom:14px}
${s('otrilho')} a{display:block;padding:13px 0;border-bottom:1px solid var(--line)}
${s('otrilho')} a:last-child{border-bottom:0}
${s('otrilho')} .k{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.15em;color:var(--muted)}
${s('otrilho')} h3{font-family:var(--fd);font-weight:700;font-size:16px;line-height:1.26;letter-spacing:-.012em;margin:6px 0 0;color:var(--ink)}
${s('otrilho')} a:hover h3{color:var(--p)}
${s('otrilho')} .obl{margin-top:30px;padding-top:18px;border-top:2px solid var(--ink)}
${s('oed')}{display:flex;flex-wrap:wrap;gap:8px}
${s('oed')} a{display:inline-block;padding:7px 13px;border:1px solid var(--line);border-radius:var(--rad);font-family:var(--fb);font-size:12.5px;font-weight:600;color:var(--ink);background:var(--surface)}
${s('oed')} a:hover{border-color:var(--p);color:var(--p)}
${s('otrilho')} .osobre{margin:14px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek)}
${s('oline')}{position:relative;max-width:none;margin:0;padding-left:34px}
${s('oline')}::before{content:"";position:absolute;left:8px;top:6px;bottom:0;width:2px;background:var(--line)}
${s('oitem')}{position:relative;display:block;padding:0 0 30px}
${s('oitem')}::before{content:"";position:absolute;left:-30px;top:7px;width:11px;height:11px;border-radius:50%;background:var(--paper);border:2px solid var(--p);z-index:2}
${s('oitem')}:hover::before{background:var(--p)}
${s('ostamp')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:var(--muted)}
${s('ostamp')} b{color:var(--p);font-weight:700}
${s('oitem')} h2,${s('oitem')} h3{font-family:var(--fd);letter-spacing:-.014em;line-height:1.16;margin:7px 0 0;color:var(--ink)}
${s('oitem')} h2{font-weight:800;font-size:clamp(24px,3.2vw,36px)}
${s('oitem')} h3{font-weight:700;font-size:19px}
${s('oitem')}:hover h2,${s('oitem')}:hover h3{color:var(--p)}
${s('oitem')} p{margin:9px 0 0;color:var(--dek);font-size:15.5px;line-height:1.55;max-width:60ch}
${s('oabre')} .oph{display:block;margin-top:16px;height:clamp(220px,26vw,380px);overflow:hidden;border-radius:var(--rad-lg);background:var(--ph)}
${s('oabre')} .oph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('oabre')}:hover .oph img{transform:scale(1.04)}
${s('ocom')}{display:grid;grid-template-columns:minmax(0,1fr) 148px;gap:24px;align-items:start}
${s('ocom')} .t{display:block;aspect-ratio:4/3;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('ocom')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('ocom')}:hover .t img{transform:scale(1.06)}
${s('odiv')}{position:relative;margin:6px 0 26px;padding-left:0}
${s('odiv')} span{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:#fff;background:var(--ink);padding:4px 11px;border-radius:2px}
${s('oart')}{max-width:70ch;margin:0 auto;padding:26px 0 8px}
${s('oahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:#fff;background:var(--p);padding:4px 10px;border-radius:2px;margin-bottom:12px}
${s('oahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,4.2vw,46px);line-height:1.08;letter-spacing:-.022em;margin:0 0 14px;color:var(--ink)}
${s('odek')}{font-size:18px;line-height:1.55;color:var(--ink);margin:0 0 20px;padding:14px 18px;background:var(--surface);border-radius:var(--rad);border-left:4px solid var(--o2)}
${s('ofig')}{margin:22px 0 28px}
${s('ofig')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('ofig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px;font-style:italic}
${s('obody')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('obody')} p{margin:0 0 20px}
${s('obody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('obody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.01em;margin:34px 0 12px;color:var(--ink)}
${s('obody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;margin:26px 0 10px}
${s('obody')} ul,${s('obody')} ol{margin:0 0 20px;padding-left:22px}
${s('obody')} li{margin:0 0 8px}
${s('obody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('obody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('obody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('obody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('obody')} table caption{display:none}
  ${s('obody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('obody')} table tbody,${s('obody')} table tr,
  ${s('obody')} table th,${s('obody')} table td{display:block;width:auto}
  ${s('obody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('obody')} table tbody th,${s('obody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('obody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('obody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('obody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('obody')} th,${s('obody')} td{border:1px solid var(--line);padding:9px 11px;text-align:left}
${s('obody')} th{background:var(--surface);font-family:var(--fb);font-weight:700}
${s('obody')} blockquote{margin:24px 0;padding:14px 18px;background:var(--surface);border-radius:var(--rad);font-family:var(--fd);font-size:20px;line-height:1.45}
${s('orel')}{max-width:800px;margin:42px auto 0;padding-top:12px;border-top:2px solid var(--ink)}
${s('osech')}{display:flex;align-items:center;gap:12px;margin:0 0 20px}
${s('osech')} h1,${s('osech')} h2{font-family:var(--fd);font-weight:800;font-size:20px;margin:0;color:var(--ink);white-space:nowrap}
${s('osech')} .oln{flex:1;height:2px;background:var(--line)}
${s('ofoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:54px;padding:32px 0 20px}
${s('ofoot')} .ocols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:30px}
${s('ofoot')} .ofb{font-family:var(--fd);font-weight:800;font-size:22px;color:#fff}
${s('ofoot')} .ofh{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:#fff;margin-bottom:10px}
${s('ofoot')} a{display:block;color:var(--footer-tx);font-size:14px;padding:3px 0}
${s('ofoot')} a:hover{color:#fff}
${s('ofoot')} .ocp{margin-top:24px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:12.5px;opacity:.82}
@media(max-width:640px){
${s('oline')}{padding-left:26px}
${s('oline')}::before{left:5px}
${s('oitem')}::before{left:-25px}
${s('ocom')}{grid-template-columns:minmax(0,1fr) 96px;gap:14px}
${s('opag')}{grid-template-columns:1fr;gap:34px}
${s('otrilho')}{position:static}
${s('ofoot')} .ocols{grid-template-columns:1fr;gap:22px}
}`;
}

function oHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const marca = nome.replace(/^(\S+)/, '<i>$1</i>');
  return `<body>
<header class="${c('otop')}"><div class="${c('owrap')}">
<a class="${c('obrand')}" href="/">${marca}</a>
<span class="${c('olive')}">Ao vivo</span>
<nav class="${c('onav')}">${links}</nav>
</div></header>`;
}

function oFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('ofoot')}"><div class="${c('owrap')}">
<div class="ocols">
<div><div class="ofb">${H.esc(site.name)}</div><p style="margin:10px 0 0;max-width:38ch;font-size:14px;line-height:1.55;opacity:.85">${H.esc(site.description || '')}</p></div>
<div><div class="ofh">Editorias</div>${cats}</div>
<div><div class="ofh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="ocp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function oItem(ctx, a, modo) {
  const { c, H } = ctx;
  const carimbo = `<span class="${c('ostamp')}"><b>${H.cat(a)}</b></span>`;
  if (modo === 'abre') {
    return `<a class="${c('oitem')} ${c('oabre')}" href="${H.url(a)}">
${carimbo}<h2>${H.esc(a.title)}</h2>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 180))}</p>` : ''}
<span class="oph">${H.pic(a, true)}</span></a>`;
  }
  if (modo === 'foto') {
    return `<a class="${c('oitem')} ${c('ocom')} ${c('reveal')}" href="${H.url(a)}">
<span>${carimbo}<h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 108))}</p>` : ''}</span>
<span class="t">${H.pic(a, false)}</span></a>`;
  }
  return `<a class="${c('oitem')} ${c('reveal')}" href="${H.url(a)}">
${carimbo}<h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 130))}</p>` : ''}</a>`;
}

function oHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const lista = arts.slice(0, site.postsOnHome || 60);
  const linhas = lista.map((a, i) => {
    if (i === 0) return oItem(ctx, a, 'abre');
    const modo = a.image ? 'foto' : 'texto';
    const divisor = (i % 9 === 0)
      ? `<div class="${c('odiv')}"><span>Mais cedo · ${H.dateShort(a.date)}</span></div>` : '';
    return divisor + oItem(ctx, a, modo);
  }).join('');
  const cap = lista[0] ? H.cat(lista[0]) : '';
  const outras = lista.filter(a => H.cat(a) !== cap).slice(0, 6);
  const _sm = H.sitemapSlug ? H.sitemapSlug(site) : null;
  const trilho = `<aside class="${c('otrilho')}">
${outras.length ? `<div class="oth">De outras editorias</div>
${outras.map(a => `<a href="${H.url(a)}"><span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3></a>`).join('')}` : ''}
<div class="obl"><div class="oth">Editorias</div>
<div class="${c('oed')}">${(menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('')}</div></div>
<div class="obl"><div class="oth">Sobre o ${H.esc(site.shortName || site.name)}</div>
<p class="osobre">${H.esc(site.description || '')}</p></div>
</aside>`;
  return `${H.head(ctx, H.homeMeta(site))}
${oHeader(ctx, menu)}
<main><div class="${c('owrap')}">
${H.h1(ctx)}
<div class="${c('opag')}">
<div class="${c('oline')}">${linhas}</div>
${trilho}
</div>
</div></main>
${oFooter(ctx, menu)}`;
}

function oArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('ofig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('orel')}">
<div class="${c('osech')}"><h2>Leia também</h2><span class="oln"></span></div>
<div class="${c('oline')}" style="padding-left:34px">${related.map(a => oItem(ctx, a, 'foto')).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${oHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('owrap')}">
<article class="${c('oart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('oahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/" style="color:#fff">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<p class="${c('odek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('obody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${oFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function oList(ctx, opts) {
  const { c, H } = ctx;
  const linhas = opts.items.map((a, i) => oItem(ctx, a, i % 3 === 1 ? 'foto' : 'texto')).join('');
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${oHeader(ctx, opts.menu)}
<main><div class="${c('owrap')}">
<div class="${c('osech')}" style="max-width:800px;margin:24px auto 20px"><h1>${H.esc(opts.title)}</h1><span class="oln"></span></div>
<div class="${c('oline')}">${linhas}</div>
</div></main>
${oFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH P =====================
 * Quarta das quinze do lote de 18/08/2026, servidor hostinger-vps-srv1166087.
 *
 * Arquetipo: CAPA DE JORNAL IMPRESSO. Masthead centralizado com filete duplo,
 * data e edicao nas pontas. A home imita a primeira pagina: manchete larga em
 * duas colunas de texto corrido (column-count), chamada de apoio ao lado com
 * foto, e abaixo uma faixa de tres colunas separadas por filete vertical. Sem
 * cartao com sombra e sem canto arredondado em lugar nenhum: a linguagem e de
 * papel, resolvida por filete e espaco.
 *
 * Single com titulo centralizado, linha de apoio e corpo em coluna estreita.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
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
${s('pseg')} .k{display:block;font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.16em;color:var(--p)}
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

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('pbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('pbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('pbody')} table caption{display:none}
  ${s('pbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('pbody')} table tbody,${s('pbody')} table tr,
  ${s('pbody')} table th,${s('pbody')} table td{display:block;width:auto}
  ${s('pbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('pbody')} table tbody th,${s('pbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('pbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('pbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('pbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
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
  return `<body>
<div class="${c('putil')}"><div class="${c('pwrap')}">
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

function pList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${pHeader(ctx, opts.menu)}
<main><div class="${c('pwrap')}">
<div class="${c('psech')}"><h1>${H.esc(opts.title)}</h1><span class="pln"></span></div>
<div class="${c('pgrid')}">${opts.items.map(a => pCard(ctx, a)).join('')}</div>
</div></main>
${pFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH Q =====================
 * Quinta das quinze do lote de 18/08/2026, servidor hostinger-vps-srv1166087.
 *
 * Arquetipo: MESA DE AGENCIA. Densidade alta e pouca foto, no espirito de
 * terminal de noticias. Barra superior escura com marca curta e relogio. A home
 * abre com uma faixa de tres destaques do mesmo tamanho e segue num painel de
 * duas colunas: a esquerda o giro cronologico em lista numerada e compacta, a
 * direita blocos de editoria empilhados. Tipografia menor que a media, filete
 * fino, zero sombra e canto reto.
 *
 * Single com trilha de leitura estreita e destaque para a linha de credito.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function qCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--q2:${p2}}
${s('qwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 22px}
${s('qbar')}{position:sticky;top:0;z-index:45;background:var(--bar-bg);color:var(--bar-tx);border-bottom:1px solid var(--line)}
${s('qbar')} ${s('qwrap')}{display:flex;align-items:center;gap:20px;min-height:52px;flex-wrap:wrap}
${s('qbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(19px,2.2vw,25px);letter-spacing:-.01em;color:var(--ink);white-space:nowrap}
${s('qbrand')} em{font-style:normal;color:var(--p)}
${s('qnav')}{flex:1 1 auto;min-width:0;display:flex;gap:2px;overflow-x:auto;scrollbar-width:none}
${s('qnav')}::-webkit-scrollbar{display:none}
${s('qnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.1em;color:var(--bar-tx);white-space:nowrap;padding:7px 11px;border-radius:var(--rad-sm)}
${s('qnav')} a:hover{color:var(--p);background:var(--surface)}
${s('qclock')}{font-family:var(--fb);font-size:11px;letter-spacing:.13em;color:var(--muted);white-space:nowrap}
main{padding:20px 0 8px}
${s('qtop')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);margin-bottom:22px}
${s('qdest')}{display:block;background:var(--paper);padding:0 0 14px}
${s('qdest')} .qph{display:block;aspect-ratio:16/9;overflow:hidden;background:var(--ph)}
${s('qdest')} .qph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('qdest')}:hover .qph img{transform:scale(1.05)}
${s('qdest')} .qin{padding:11px 14px 0}
${s('qdest')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--p)}
${s('qdest')} h2{font-family:var(--fd);font-weight:700;font-size:18.5px;line-height:1.2;letter-spacing:-.01em;margin:5px 0 0;color:var(--ink)}
${s('qdest')}:hover h2{color:var(--p)}
${s('qdest')} p{margin:6px 0 0;color:var(--dek);font-size:13px;line-height:1.45}
${s('qpainel')}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:38px;align-items:start}
${s('qsolo')}{grid-template-columns:1fr}
${s('qgiro')}{position:sticky;top:70px;border-top:2px solid var(--p);padding-top:12px}
${s('qgh')}{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
${s('qgh')} h2{font-family:var(--fd);font-weight:800;font-size:15px;letter-spacing:.1em;margin:0;color:var(--ink)}
${s('qgh')} span{font-family:var(--fb);font-size:10px;letter-spacing:.13em;color:var(--muted)}
${s('qfio')}{counter-reset:qn}
${s('qlinha')}{display:grid;grid-template-columns:26px minmax(0,1fr);gap:10px;padding:9px 0;border-bottom:1px solid var(--line);align-items:baseline}
${s('qlinha')}::before{counter-increment:qn;content:counter(qn,decimal-leading-zero);font-family:var(--fb);font-size:11px;font-weight:700;color:var(--q2);letter-spacing:.04em}
${s('qlinha')} h3{font-family:var(--fd);font-weight:600;font-size:15.5px;line-height:1.3;margin:0;color:var(--ink)}
${s('qlinha')}:hover h3{color:var(--p)}
${s('qlinha')} .h{display:block;font-family:var(--fb);font-size:10px;letter-spacing:.1em;color:var(--muted);margin-top:3px}
${s('qbloco')}{margin-bottom:26px}
${s('qbh')}{display:flex;align-items:center;gap:10px;margin:0 0 12px;padding-bottom:7px;border-bottom:2px solid var(--p)}
${s('qbh')} h1,${s('qbh')} h2{font-family:var(--fd);font-weight:800;font-size:16px;letter-spacing:.05em;margin:0;color:var(--ink)}
${s('qbh')} .qcnt{font-family:var(--fb);font-size:10px;letter-spacing:.12em;color:var(--muted);margin-left:auto}
${s('qitens')}{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
${s('qit')}{display:block}
${s('qit')} .t{display:block;aspect-ratio:3/2;overflow:hidden;background:var(--ph);margin-bottom:10px}
${s('qit')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('qit')}:hover .t img{transform:scale(1.05)}
${s('qit')} h3{font-family:var(--fd);font-weight:600;font-size:15.5px;line-height:1.26;margin:0;color:var(--ink)}
${s('qit')}:hover h3{color:var(--p)}
${s('qit')} .k{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.14em;color:var(--muted);display:block;margin-bottom:4px}
${s('qart')}{max-width:720px;margin:0 auto;padding:30px 0 8px}
${s('qahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--p);padding-bottom:4px;border-bottom:2px solid var(--p);margin-bottom:12px}
${s('qahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(26px,3.8vw,42px);line-height:1.1;letter-spacing:-.02em;margin:0 0 12px;color:var(--ink)}
${s('qdek')}{font-size:17.5px;line-height:1.55;color:var(--dek);margin:0 0 16px}
${s('qcred')}{display:flex;flex-wrap:wrap;gap:8px 16px;padding:9px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);font-family:var(--fb);font-size:11px;letter-spacing:.09em;color:var(--muted);margin-bottom:20px}
${s('qfig')}{margin:0 -60px 28px}
${s('qfig')} img{width:100%;height:auto;display:block;border-radius:var(--rad)}
${s('qfig')} figcaption{font-size:12.5px;color:var(--muted);margin:9px 60px 0;font-style:italic}
${s('qbody')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('qbody')} p{margin:0 0 19px}
${s('qbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:2px}
${s('qbody')} h2{font-family:var(--fd);font-weight:800;font-size:24px;letter-spacing:-.012em;margin:36px 0 13px;color:var(--ink);padding-top:14px;border-top:1px solid var(--line)}
${s('qbody')} h3{font-family:var(--fd);font-weight:700;font-size:18px;margin:22px 0 9px}
${s('qbody')} ul,${s('qbody')} ol{margin:0 0 19px;padding-left:20px}
${s('qbody')} li{margin:0 0 9px}
${s('qbody')} li::marker{color:var(--p)}
${s('qbody')} img{max-width:100%;height:auto}
${s('qbody')} table{width:100%;border-collapse:collapse;margin:0 0 22px;font-size:14px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('qbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('qbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('qbody')} table caption{display:none}
  ${s('qbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('qbody')} table tbody,${s('qbody')} table tr,
  ${s('qbody')} table th,${s('qbody')} table td{display:block;width:auto}
  ${s('qbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('qbody')} table tbody th,${s('qbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('qbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('qbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('qbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('qbody')} th,${s('qbody')} td{border:1px solid var(--line);padding:8px 10px;text-align:left}
${s('qbody')} th{background:var(--surface);font-family:var(--fb);font-weight:700;font-size:12.5px;letter-spacing:.06em}
${s('qbody')} blockquote{margin:22px 0;padding:12px 16px;border-left:3px solid var(--q2);background:var(--surface);font-size:17px;line-height:1.5}
${s('qrel')}{max-width:720px;margin:44px auto 0;padding-top:12px;border-top:2px solid var(--p)}
${s('qrel3')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px 18px;align-items:start}
${s('qrel3')} ${s('qit')} h3{font-size:15px;line-height:1.28}
${s('qrel3')} ${s('qit')} .t{margin-bottom:9px}
${s('qfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:46px;padding:34px 0 20px;font-size:13.5px}
${s('qfoot')} .qcols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:26px}
${s('qfoot')} .qfb{font-family:var(--fd);font-weight:800;font-size:21px;color:var(--ink)}
${s('qfoot')} .qfh{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;color:var(--ink);margin-bottom:10px}
${s('qfoot')} a{display:block;color:var(--footer-tx);padding:4px 0}
${s('qfoot')} a:hover{color:var(--p)}
${s('qfoot')} .qcp{margin-top:24px;padding-top:14px;border-top:1px solid var(--line);font-size:12px}
@media(max-width:940px){${s('qpainel')}{grid-template-columns:1fr;gap:26px}${s('qtop')}{grid-template-columns:1fr}${s('qgiro')}{position:static}}
@media(max-width:860px){${s('qfig')}{margin:0 0 24px}${s('qfig')} figcaption{margin:9px 0 0}${s('qart')},${s('qrel')}{max-width:none}}
@media(max-width:940px){${s('qclock')}{display:none}}
@media(max-width:700px){${s('qrel3')}{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){${s('qitens')}{grid-template-columns:1fr}${s('qfoot')} .qcols{grid-template-columns:1fr;gap:20px}}
@media(max-width:440px){${s('qrel3')}{grid-template-columns:1fr}}`;
}

function qHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const marca = nome.replace(/^(\S)/, '<em>$1</em>');
  return `<body>
<header class="${c('qbar')}"><div class="${c('qwrap')}">
<a class="${c('qbrand')}" href="/">${marca}</a>
<nav class="${c('qnav')}">${links}</nav>
<span class="${c('qclock')}">${H.dateFull()}</span>
</div></header>`;
}

function qFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('qfoot')}"><div class="${c('qwrap')}">
<div class="qcols">
<div><div class="qfb">${H.esc(site.name)}</div><p style="margin:10px 0 0;max-width:38ch;line-height:1.55">${H.esc(site.description || '')}</p></div>
<div><div class="qfh">Editorias</div>${cats}</div>
<div><div class="qfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="qcp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function qDest(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('qdest')}" href="${H.url(a)}">
<span class="qph">${H.pic(a, true)}</span>
<span class="qin"><span class="k">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 96))}</p>` : ''}</span></a>`;
}

function qLinha(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('qlinha')}" href="${H.url(a)}">
<span><h3>${H.esc(a.title)}</h3><span class="h">${H.cat(a)}</span></span></a>`;
}

function qItem(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('qit')} ${c('reveal')}" href="${H.url(a)}">
<span class="t">${H.pic(a, false)}</span>
<span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3></a>`;
}

function qHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const topo = arts.slice(0, 3);
  const corpo = arts.slice(3, site.postsOnHome || 60);
  // com poucos artigos o corte fixo em 14 levava tudo para o giro e deixava a
  // coluna da direita vazia, ou seja, metade da tela preta
  const corte = corpo.length > 20 ? 14 : Math.ceil(corpo.length * 0.65);
  const giro = corpo.slice(0, corte);
  const blocos = corpo.slice(corte);
  const grupos = [];
  for (let i = 0; i < blocos.length; i += 6) {
    const fatia = blocos.slice(i, i + 6);
    const titulo = fatia[0] ? H.cat(fatia[0]) : 'Mais notícias';
    grupos.push(`<section class="${c('qbloco')}">
<div class="${c('qbh')}"><h2>${titulo}</h2><span class="qcnt">${fatia.length} itens</span></div>
<div class="${c('qitens')}">${fatia.map(a => qItem(ctx, a)).join('')}</div></section>`);
  }
  return `${H.head(ctx, H.homeMeta(site))}
${qHeader(ctx, menu)}
<main><div class="${c('qwrap')}">
${H.h1(ctx)}
<div class="${c('qtop')}">${topo.map(a => qDest(ctx, a)).join('')}</div>
<div class="${c('qpainel')}${blocos.length ? '' : ' ' + c('qsolo')}">
<aside class="${c('qgiro')}">
<div class="${c('qgh')}"><h2>Giro de notícias</h2><span>Atualizado</span></div>
<div class="${c('qfio')}">${giro.map(a => qLinha(ctx, a)).join('')}</div>
</aside>
<div>${grupos.join('')}</div>
</div>
</div></main>
${qFooter(ctx, menu)}`;
}

function qArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('qfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('qrel')}">
<div class="${c('qbh')}"><h2>Leia também</h2></div>
<div class="${c('qrel3')}">${related.slice(0, 3).map(a => qItem(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${qHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('qwrap')}">
<article class="${c('qart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('qahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<p class="${c('qdek')}">${H.esc(art.dek)}</p>` : ''}
<div class="${c('qcred')}">${H.metaRow(ctx, art, P)}</div>
${fig}
<div class="${c('qbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${qFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function qList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${qHeader(ctx, opts.menu)}
<main><div class="${c('qwrap')}">
<div class="${c('qbh')}" style="margin-top:22px"><h1>${H.esc(opts.title)}</h1><span class="qcnt">${opts.items.length} itens</span></div>
<div class="${c('qitens')}">${opts.items.map(a => qItem(ctx, a)).join('')}</div>
</div></main>
${qFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH R =====================
 * Sexta das quinze do lote de 18/08/2026, servidor hostinger-vps-srv1166087.
 *
 * Arquetipo: CAPA DE REVISTA. A home abre com uma foto que sangra de ponta a
 * ponta da tela, com o titulo assentado no rodape dela sobre gradiente, e o
 * cabecalho flutua por cima em transparencia. Depois vem uma faixa de tres
 * chamadas que sobem sobre a capa em cartao claro, e o restante em fileiras
 * largas de foto grande a esquerda alternando com a direita.
 *
 * Cuidado registrado no runbook: nada de sobreposicao com sombra solida, que
 * pintou por cima do texto no piloto. Aqui o contraste vem de gradiente e de
 * sombra de texto, e o acento sobre fundo escuro usa variante clara.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function rCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--r2:${p2}}
${s('rwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 24px}
${s('rtop')}{position:absolute;top:0;left:0;right:0;z-index:44}
${s('rtop')} ${s('rwrap')}{display:flex;align-items:center;gap:22px;min-height:70px;flex-wrap:wrap}
${s('rbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(21px,2.7vw,30px);letter-spacing:.02em;color:#fff;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,.45)}
${s('rnav')}{flex:1 1 auto;min-width:0;display:flex;gap:20px;overflow-x:auto;scrollbar-width:none}
${s('rnav')}::-webkit-scrollbar{display:none}
${s('rnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.11em;color:rgba(255,255,255,.88);white-space:nowrap;padding:4px 0;text-shadow:0 1px 3px rgba(0,0,0,.4)}
${s('rnav')} a:hover{color:#fff;border-bottom:2px solid #fff}
${s('rtopfixo')}{position:sticky;top:0;z-index:44;background:var(--paper);border-bottom:1px solid var(--line)}
${s('rtopfixo')} ${s('rwrap')}{display:flex;align-items:center;gap:22px;min-height:62px;flex-wrap:wrap}
${s('rtopfixo')} ${s('rbrand')}{color:var(--ink);text-shadow:none}
${s('rtopfixo')} ${s('rnav')} a{color:var(--muted);text-shadow:none}
${s('rtopfixo')} ${s('rnav')} a:hover{color:var(--p);border-bottom-color:var(--p)}
${s('rcapa')}{position:relative;min-height:clamp(420px,66vh,640px);display:flex;align-items:flex-end;overflow:hidden;background:var(--ph)}
${s('rcapa')} .rbg{position:absolute;inset:0}
${s('rcapa')} .rbg img{width:100%;height:100%;object-fit:cover;display:block}
${s('rcapa')}::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,12,.52) 0,rgba(10,10,12,0) 32%,rgba(10,10,12,.12) 52%,rgba(10,10,12,.86) 100%)}
${s('rcapatx')}{position:relative;z-index:3;width:100%;max-width:var(--maxw);margin:0 auto;padding:0 24px 40px}
${s('rcapatx')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.18em;color:#fff;background:var(--p);padding:5px 11px;border-radius:2px;margin-bottom:14px}
${s('rcapatx')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(28px,5.2vw,58px);line-height:1.03;letter-spacing:-.026em;margin:0;color:#fff;max-width:20ch;text-shadow:0 2px 12px rgba(0,0,0,.45)}
${s('rcapa')}:hover h2{color:#fff;opacity:.94}
${s('rcapatx')} p{margin:14px 0 0;color:rgba(255,255,255,.9);font-size:17px;line-height:1.5;max-width:56ch;text-shadow:0 1px 6px rgba(0,0,0,.5)}
${s('rsobe')}{position:relative;z-index:5;margin-top:-46px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
${s('rcartao')}{display:block;background:var(--paper);border:1px solid var(--line);border-radius:var(--rad-lg);padding:16px 18px 18px}
${s('rcartao')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--r2)}
${s('rcartao')} h3{font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.22;letter-spacing:-.01em;margin:7px 0 0;color:var(--ink)}
${s('rcartao')}:hover h3{color:var(--p)}
${s('rcartao')} p{margin:7px 0 0;color:var(--dek);font-size:13.5px;line-height:1.48}
${s('rsech')}{display:flex;align-items:center;gap:14px;margin:var(--block) 0 22px}
${s('rsech')} h1,${s('rsech')} h2{font-family:var(--fd);font-weight:800;font-size:22px;letter-spacing:-.01em;margin:0;color:var(--ink);white-space:nowrap}
${s('rsech')} .rln{flex:1;height:1px;background:var(--line)}
${s('rfila')}{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:28px;align-items:center;padding:22px 0;border-bottom:1px solid var(--line)}
${s('rfila')}:nth-child(even){direction:rtl}
${s('rfila')}:nth-child(even)>*{direction:ltr}
${s('rfila')} .rph{aspect-ratio:16/10;overflow:hidden;border-radius:var(--rad-lg);background:var(--ph)}
${s('rfila')} .rph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('rfila')}:hover .rph img{transform:scale(1.04)}
${s('rfila')} .k{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.15em;color:var(--p)}
${s('rfila')} h3{font-family:var(--fd);font-weight:700;font-size:clamp(20px,2.4vw,27px);line-height:1.18;letter-spacing:-.015em;margin:8px 0 0;color:var(--ink)}
${s('rfila')}:hover h3{color:var(--p)}
${s('rfila')} p{margin:9px 0 0;color:var(--dek);font-size:15px;line-height:1.55;max-width:52ch}
${s('rgrid')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px}
${s('rcard')} .rph{aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad);margin-bottom:11px}
${s('rcard')} .rph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('rcard')}:hover .rph img{transform:scale(1.05)}
${s('rcard')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--p)}
${s('rcard')} h3{font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.22;margin:5px 0 0;color:var(--ink)}
${s('rcard')}:hover h3{color:var(--p)}
${s('rart')}{max-width:1080px;margin:0 auto;padding:0 24px}
${s('rahero')}{position:relative;min-height:clamp(320px,48vh,480px);display:flex;align-items:flex-end;overflow:hidden;background:var(--ph);margin-bottom:26px}
${s('rahero')} .rbg{position:absolute;inset:0}
${s('rahero')} .rbg img{width:100%;height:100%;object-fit:cover;display:block}
${s('rahero')}::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,12,.5) 0,rgba(10,10,12,0) 36%,rgba(10,10,12,.84) 100%)}
${s('raherotx')}{position:relative;z-index:3;width:100%;max-width:820px;margin:0 auto;padding:0 24px 34px}
${s('raherotx')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;color:#fff;background:var(--p);padding:4px 10px;border-radius:2px;margin-bottom:12px}
${s('raherotx')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(27px,4.4vw,48px);line-height:1.07;letter-spacing:-.024em;margin:0;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.45)}
${s('rsemfoto')}{max-width:760px;margin:0 auto;padding:30px 24px 0}
${s('rsemfoto')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(27px,4.2vw,45px);line-height:1.07;letter-spacing:-.024em;margin:10px 0 0;color:var(--ink)}
${s('rcol')}{max-width:68ch;margin:0 auto;padding:0 0 8px}
${s('rdek')}{font-size:18.5px;line-height:1.55;color:var(--dek);margin:0 0 18px}
${s('rcap')}{font-size:12.5px;color:var(--muted);margin:-14px 0 22px;font-style:italic}
${s('rbody')}{font-size:calc(var(--fs) + 1px);line-height:1.8;color:var(--ink)}
${s('rbody')} p{margin:0 0 21px}
${s('rbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('rbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.01em;margin:34px 0 12px;color:var(--ink)}
${s('rbody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;margin:26px 0 10px}
${s('rbody')} ul,${s('rbody')} ol{margin:0 0 21px;padding-left:22px}
${s('rbody')} li{margin:0 0 8px}
${s('rbody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('rbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('rbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('rbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('rbody')} table caption{display:none}
  ${s('rbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('rbody')} table tbody,${s('rbody')} table tr,
  ${s('rbody')} table th,${s('rbody')} table td{display:block;width:auto}
  ${s('rbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('rbody')} table tbody th,${s('rbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('rbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('rbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('rbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('rbody')} th,${s('rbody')} td{border:1px solid var(--line);padding:9px 11px;text-align:left}
${s('rbody')} th{background:var(--surface);font-family:var(--fb);font-weight:700}
${s('rbody')} blockquote{margin:26px 0;padding:18px 22px;background:var(--surface);border-radius:var(--rad-lg);font-family:var(--fd);font-size:20px;line-height:1.45}
${s('rrel')}{margin-top:44px;padding-top:8px;border-top:1px solid var(--line)}
${s('rfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:56px;padding:34px 0 20px}
${s('rfoot')} .rcols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:32px}
${s('rfoot')} .rfb{font-family:var(--fd);font-weight:800;font-size:23px;letter-spacing:.02em;color:#fff}
${s('rfoot')} .rfh{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:#fff;margin-bottom:10px}
${s('rfoot')} a{display:block;color:var(--footer-tx);font-size:14px;padding:3px 0}
${s('rfoot')} a:hover{color:#fff}
${s('rfoot')} .rcp{margin-top:24px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:12.5px;opacity:.82}
@media(max-width:940px){${s('rsobe')}{grid-template-columns:1fr;margin-top:-26px}${s('rgrid')}{grid-template-columns:repeat(2,minmax(0,1fr))}${s('rfila')}{grid-template-columns:1fr;gap:14px}${s('rfila')}:nth-child(even){direction:ltr}}
@media(max-width:560px){${s('rgrid')}{grid-template-columns:1fr}${s('rcapa')}{min-height:400px}${s('rfoot')} .rcols{grid-template-columns:1fr;gap:22px}}`;
}

function rNav(ctx, menu, fixo) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const cls = fixo ? c('rtopfixo') : c('rtop');
  return `<body>
<header class="${cls}"><div class="${c('rwrap')}">
<a class="${c('rbrand')}" href="/">${H.esc(site.shortName || site.name)}</a>
<nav class="${c('rnav')}">${links}</nav>
</div></header>`;
}

function rHeader(ctx, menu) { return rNav(ctx, menu, true); }

function rFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('rfoot')}"><div class="${c('rwrap')}">
<div class="rcols">
<div><div class="rfb">${H.esc(site.name)}</div><p style="margin:11px 0 0;max-width:38ch;font-size:14px;line-height:1.55;opacity:.85">${H.esc(site.description || '')}</p></div>
<div><div class="rfh">Editorias</div>${cats}</div>
<div><div class="rfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="rcp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function rCartao(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('rcartao')}" href="${H.url(a)}">
<span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 92))}</p>` : ''}</a>`;
}

function rFila(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('rfila')} ${c('reveal')}" href="${H.url(a)}">
<span class="rph">${H.pic(a, false)}</span>
<span><span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 150))}</p>` : ''}</span></a>`;
}

function rCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('rcard')} ${c('reveal')}" href="${H.url(a)}">
<span class="rph">${H.pic(a, false)}</span>
<span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3></a>`;
}

function rHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const capa = arts[0];
  const tres = arts.slice(1, 4);
  const filas = arts.slice(4, 10);
  const resto = arts.slice(10, site.postsOnHome || 60);
  const capaHtml = capa ? `<a class="${c('rcapa')}" href="${H.url(capa)}">
<span class="rbg">${H.pic(capa, true)}</span>
<span class="${c('rcapatx')}"><span class="k">${H.cat(capa)}</span><h2>${H.esc(capa.title)}</h2>
${capa.excerpt ? `<p>${H.esc(H.clip(capa.excerpt, 168))}</p>` : ''}</span></a>` : '';
  const blocos = [];
  for (let i = 0; i < resto.length; i += 9) {
    const fatia = resto.slice(i, i + 9);
    const titulo = fatia[0] ? H.cat(fatia[0]) : 'Mais notícias';
    blocos.push(`<section><div class="${c('rsech')}"><h2>${titulo}</h2><span class="rln"></span></div>
<div class="${c('rgrid')}">${fatia.map(a => rCard(ctx, a)).join('')}</div></section>`);
  }
  return `${H.head(ctx, H.homeMeta(site))}
<div style="position:relative">
${rNav(ctx, menu, false)}
${capaHtml}
</div>
<main><div class="${c('rwrap')}">
${H.h1(ctx)}
${tres.length ? `<div class="${c('rsobe')}">${tres.map(a => rCartao(ctx, a)).join('')}</div>` : ''}
${filas.length ? `<section><div class="${c('rsech')}"><h2>Em destaque</h2><span class="rln"></span></div>
${filas.map(a => rFila(ctx, a)).join('')}</section>` : ''}
${blocos.join('')}
</div></main>
${rFooter(ctx, menu)}`;
}

function rArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const temFoto = !!art.image;
  const topo = temFoto
    ? `<div style="position:relative">${rNav(ctx, menu, false)}
<div class="${c('rahero')}"><span class="rbg">${H.pic(art, true)}</span>
<div class="${c('raherotx')}"><span class="k"><a href="/${H.esc(P.catSlug)}/" style="color:#fff">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1></div></div></div>
${art.image.caption ? `<div class="${c('rcol')}"><p class="${c('rcap')}" style="margin-top:14px">${H.esc(art.image.caption)}</p></div>` : ''}`
    : `${rNav(ctx, menu, true)}
<div class="${c('rsemfoto')}"><span class="k" style="font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;color:var(--p)"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1></div>`;
  const rel = (related && related.length) ? `<section class="${c('rrel')}">
<div class="${c('rsech')}"><h2>Leia também</h2><span class="rln"></span></div>
<div class="${c('rgrid')}">${related.map(a => rCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${topo}
${H.progressBar(ctx)}
<main><div class="${c('rart')}"><article class="${c('rcol')}">
${H.crumbs(ctx, art, P)}
${art.dek ? `<p class="${c('rdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
<div class="${c('rbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${rFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function rList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${rNav(ctx, opts.menu, true)}
<main><div class="${c('rwrap')}">
<div class="${c('rsech')}" style="margin-top:26px"><h1>${H.esc(opts.title)}</h1><span class="rln"></span></div>
<div class="${c('rgrid')}">${opts.items.map(a => rCard(ctx, a)).join('')}</div>
</div></main>
${rFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH S =====================
 * Setima das quinze do lote de 18/08/2026, servidor hostinger-vps-srv1166087.
 *
 * Arquetipo: RANKING NUMERADO. A home e uma lista ordenada de leitura, com o
 * numero da posicao em corpo grande e translucido atras do texto, no espirito
 * de "as mais lidas de hoje". A primeira posicao ganha foto larga; as demais
 * ficam em fileiras alternadas de fundo, sem foto ate a decima, e depois volta
 * uma grade normal para o acervo. Cabecalho em duas alturas: marca em cima,
 * navegacao embaixo, separadas por filete.
 *
 * Single de coluna unica com numero de leitura no topo e corpo largo.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function sCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--s2:${p2}}
${s('swrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 24px}
${s('stopo')}{position:sticky;top:0;z-index:45;background:var(--paper)}
${s('slinha1')}{border-bottom:1px solid var(--line)}
${s('slinha1')} ${s('swrap')}{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:58px;flex-wrap:wrap}
${s('sbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(22px,3vw,32px);letter-spacing:-.022em;color:var(--ink);white-space:nowrap}
${s('sbrand')} span{color:var(--p)}
${s('stag')}{font-family:var(--fb);font-size:11px;letter-spacing:.16em;color:var(--muted);white-space:nowrap}
${s('slinha2')}{border-bottom:2px solid var(--ink)}
${s('slinha2')} ${s('swrap')}{display:flex;gap:22px;align-items:center;min-height:40px;overflow-x:auto;scrollbar-width:none}
${s('slinha2')} ${s('swrap')}::-webkit-scrollbar{display:none}
${s('slinha2')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.1em;color:var(--muted);white-space:nowrap;padding:5px 0;border-bottom:2px solid transparent}
${s('slinha2')} a:hover{color:var(--ink);border-bottom-color:var(--p)}
main{padding:26px 0 8px}
${s('srank')}{counter-reset:sr;max-width:880px;margin:0 auto}
${s('spos')}{position:relative;display:grid;grid-template-columns:72px minmax(0,1fr) 132px;gap:0 20px;align-items:center;padding:18px 22px 18px 0;border-bottom:1px solid var(--line);overflow:hidden}
${s('spos')} .st{display:block;aspect-ratio:4/3;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('spos')} .st img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('spos')}:hover .st img{transform:scale(1.06)}
${s('spos')} .stx{min-width:0}
${s('spos')}::before{counter-increment:sr;content:counter(sr);font-family:var(--fd);font-weight:900;font-size:54px;line-height:1;letter-spacing:-.05em;color:var(--p);opacity:.28;text-align:center}
${s('spos')}:nth-child(even){background:var(--surface)}
${s('spos')}:hover::before{color:var(--p);opacity:.24}
${s('spos')}>*{position:relative;z-index:1}
${s('spos')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--s2)}
${s('spos')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;line-height:1.22;letter-spacing:-.012em;margin:5px 0 0;color:var(--ink)}
${s('spos')}:hover h3{color:var(--p)}
${s('spos')} p{margin:7px 0 0;color:var(--dek);font-size:14px;line-height:1.5;max-width:58ch}
${s('sprim')}{display:block;padding:26px 0 28px;border-bottom:2px solid var(--ink)}
${s('sprim')}::before{display:block;font-size:72px;opacity:.2;text-align:left;margin-bottom:-14px}
${s('sprim')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(25px,3.6vw,40px);line-height:1.08;letter-spacing:-.022em;margin:6px 0 0;color:var(--ink)}
${s('sprim')}:hover h2{color:var(--p)}
${s('sprim')} .sph{display:block;margin-top:18px;aspect-ratio:var(--hero-ar);overflow:hidden;border-radius:var(--rad-lg);background:var(--ph)}
${s('sprim')} .sph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('sprim')}:hover .sph img{transform:scale(1.04)}
${s('ssech')}{display:flex;align-items:center;gap:12px;margin:var(--block) 0 20px}
${s('ssech')} h1,${s('ssech')} h2{font-family:var(--fd);font-weight:800;font-size:21px;letter-spacing:-.01em;margin:0;color:var(--ink);white-space:nowrap}
${s('ssech')} .sln{flex:1;height:2px;background:var(--ink)}
${s('sgrid')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}
${s('scard')} .sph{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad);margin-bottom:12px}
${s('scard')} .sph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('scard')}:hover .sph img{transform:scale(1.05)}
${s('scard')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--p)}
${s('scard')} h3{font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.22;margin:5px 0 0;color:var(--ink)}
${s('scard')}:hover h3{color:var(--p)}
${s('sart')}{max-width:70ch;margin:0 auto;padding:26px 0 8px}
${s('sahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--p);margin-bottom:11px}
${s('sahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,4.2vw,46px);line-height:1.07;letter-spacing:-.024em;margin:0 0 14px;color:var(--ink)}
${s('sdek')}{font-size:18.5px;line-height:1.55;color:var(--dek);margin:0 0 18px}
${s('sfig')}{margin:22px 0 28px}
${s('sfig')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('sfig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px;font-style:italic}
${s('sbody')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('sbody')} p{margin:0 0 21px}
${s('sbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('sbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.01em;margin:34px 0 12px;color:var(--ink)}
${s('sbody')} h2::before{content:"";display:inline-block;width:10px;height:10px;background:var(--p);margin-right:11px;vertical-align:middle}
${s('sbody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;margin:26px 0 10px}
${s('sbody')} ul,${s('sbody')} ol{margin:0 0 21px;padding-left:22px}
${s('sbody')} li{margin:0 0 8px}
${s('sbody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('sbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('sbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('sbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('sbody')} table caption{display:none}
  ${s('sbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('sbody')} table tbody,${s('sbody')} table tr,
  ${s('sbody')} table th,${s('sbody')} table td{display:block;width:auto}
  ${s('sbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('sbody')} table tbody th,${s('sbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('sbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('sbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('sbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('sbody')} th,${s('sbody')} td{border:1px solid var(--line);padding:9px 11px;text-align:left}
${s('sbody')} th{background:var(--surface);font-family:var(--fb);font-weight:700}
${s('sbody')} blockquote{margin:26px 0;padding:16px 20px;border-left:4px solid var(--s2);background:var(--surface);font-family:var(--fd);font-size:20px;line-height:1.45}
${s('srel')}{margin-top:44px;padding-top:8px;border-top:2px solid var(--ink)}
${s('sfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:54px;padding:32px 0 20px}
${s('sfoot')} .scols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:30px}
${s('sfoot')} .sfb{font-family:var(--fd);font-weight:800;font-size:22px;letter-spacing:-.02em;color:#fff}
${s('sfoot')} .sfh{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:#fff;margin-bottom:10px}
${s('sfoot')} a{display:block;color:var(--footer-tx);font-size:14px;padding:3px 0}
${s('sfoot')} a:hover{color:#fff}
${s('sfoot')} .scp{margin-top:24px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:12.5px;opacity:.82}
@media(max-width:940px){${s('sgrid')}{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:720px){${s('spos')}{grid-template-columns:54px minmax(0,1fr) 94px;gap:0 14px}${s('spos')}::before{font-size:38px}}
@media(max-width:600px){
${s('spos')}{grid-template-columns:40px minmax(0,1fr) 78px;gap:0 12px;padding:15px 12px 15px 0}
${s('spos')}::before{font-size:30px}
${s('spos')} p{display:none}
${s('sprim')}::before{font-size:52px}
${s('sgrid')}{grid-template-columns:1fr}
${s('stag')}{display:none}
${s('sfoot')} .scols{grid-template-columns:1fr;gap:22px}
}`;
}

function sHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const partes = nome.split(' ');
  const marca = partes.length > 1 ? `${partes.slice(0, -1).join(' ')} <span>${partes[partes.length - 1]}</span>` : `<span>${nome}</span>`;
  return `<body>
<header class="${c('stopo')}">
<div class="${c('slinha1')}"><div class="${c('swrap')}">
<a class="${c('sbrand')}" href="/">${marca}</a>
<span class="${c('stag')}">${H.dateFull()}</span>
</div></div>
<nav class="${c('slinha2')}"><div class="${c('swrap')}">${links}</div></nav>
</header>`;
}

function sFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('sfoot')}"><div class="${c('swrap')}">
<div class="scols">
<div><div class="sfb">${H.esc(site.name)}</div><p style="margin:11px 0 0;max-width:38ch;font-size:14px;line-height:1.55;opacity:.85">${H.esc(site.description || '')}</p></div>
<div><div class="sfh">Editorias</div>${cats}</div>
<div><div class="sfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="scp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function sPos(ctx, a, primeira) {
  const { c, H } = ctx;
  if (primeira) {
    return `<a class="${c('spos')} ${c('sprim')}" href="${H.url(a)}">
<span class="k">${H.cat(a)}</span><h2>${H.esc(a.title)}</h2>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 175))}</p>` : ''}
<span class="sph">${H.pic(a, true)}</span></a>`;
  }
  return `<a class="${c('spos')}" href="${H.url(a)}">
<span class="stx"><span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 120))}</p>` : ''}</span>
${a.image ? `<span class="st">${H.pic(a, false)}</span>` : '<span></span>'}</a>`;
}

function sCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('scard')} ${c('reveal')}" href="${H.url(a)}">
<span class="sph">${H.pic(a, false)}</span>
<span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3></a>`;
}

function sHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const rank = arts.slice(0, 10);
  const resto = arts.slice(10, site.postsOnHome || 60);
  const blocos = [];
  for (let i = 0; i < resto.length; i += 9) {
    const fatia = resto.slice(i, i + 9);
    const titulo = fatia[0] ? H.cat(fatia[0]) : 'Mais notícias';
    blocos.push(`<section><div class="${c('ssech')}"><h2>${titulo}</h2><span class="sln"></span></div>
<div class="${c('sgrid')}">${fatia.map(a => sCard(ctx, a)).join('')}</div></section>`);
  }
  return `${H.head(ctx, H.homeMeta(site))}
${sHeader(ctx, menu)}
<main><div class="${c('swrap')}">
${H.h1(ctx)}
<div class="${c('srank')}">${rank.map((a, i) => sPos(ctx, a, i === 0)).join('')}</div>
${blocos.join('')}
</div></main>
${sFooter(ctx, menu)}`;
}

function sArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('sfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('srel')}">
<div class="${c('ssech')}"><h2>Leia também</h2><span class="sln"></span></div>
<div class="${c('sgrid')}">${related.map(a => sCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${sHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('swrap')}">
<article class="${c('sart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('sahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<p class="${c('sdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('sbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${sFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function sList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${sHeader(ctx, opts.menu)}
<main><div class="${c('swrap')}">
<div class="${c('ssech')}" style="margin-top:24px"><h1>${H.esc(opts.title)}</h1><span class="sln"></span></div>
<div class="${c('sgrid')}">${opts.items.map(a => sCard(ctx, a)).join('')}</div>
</div></main>
${sFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH T =====================
 * Oitava das quinze do lote de 18/08/2026, servidor hostinger-vps-srv1166087.
 *
 * Arquetipo: PLACAR EDITORIAL. A home e dividida ao meio por um filete
 * vertical: a esquerda as manchetes, em fileiras de titulo grande sem foto, e
 * a direita as ultimas, em cartoes pequenos com miniatura quadrada. Nenhum dos
 * dois lados tem hero; a hierarquia vem do tamanho da tipografia. Cabecalho
 * com a marca deslocada para a esquerda e um sublinhado grosso de acento.
 *
 * Single com sumario em duas colunas antes do corpo, para quebrar o bloco.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function tCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--t2:${p2}}
${s('twrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 24px}
${s('ttop')}{position:sticky;top:0;z-index:45;background:var(--paper);border-bottom:1px solid var(--line)}
${s('ttop')} ${s('twrap')}{display:flex;align-items:flex-end;gap:26px;min-height:66px;padding-bottom:0;flex-wrap:wrap}
${s('tbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(22px,3vw,31px);line-height:1;letter-spacing:-.02em;color:var(--ink);white-space:nowrap;padding-bottom:12px;border-bottom:4px solid var(--p);margin-bottom:-1px}
${s('tnav')}{flex:1 1 auto;min-width:0;display:flex;gap:20px;overflow-x:auto;scrollbar-width:none;padding-bottom:14px}
${s('tnav')}::-webkit-scrollbar{display:none}
${s('tnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.1em;color:var(--muted);white-space:nowrap}
${s('tnav')} a:hover{color:var(--p)}
${s('tdata')}{font-family:var(--fb);font-size:11px;letter-spacing:.14em;color:var(--muted);white-space:nowrap;padding-bottom:16px}
main{padding:24px 0 8px}
${s('tplacar')}{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:0}
${s('tesq')}{padding-right:36px}
${s('tdir')}{padding-left:36px;border-left:1px solid var(--line)}
${s('tsel')}{display:flex;align-items:center;gap:10px;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid var(--ink)}
${s('tsel')} h2{font-family:var(--fd);font-weight:800;font-size:15px;letter-spacing:.11em;margin:0;color:var(--ink)}
${s('tsel')} .tpt{width:8px;height:8px;background:var(--t2)}
${s('tman')}{display:block;padding:18px 0;border-bottom:1px solid var(--line)}
${s('tman')}:first-of-type{padding-top:4px}
${s('tman')} .tph{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad);margin-bottom:15px}
${s('tman')} .tph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('tman')}:hover .tph img{transform:scale(1.04)}
${s('tman')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.16em;color:var(--p)}
${s('tman')} h3{font-family:var(--fd);font-weight:800;line-height:1.12;letter-spacing:-.02em;margin:7px 0 0;color:var(--ink);font-size:clamp(21px,2.7vw,31px)}
${s('tman')}:hover h3{color:var(--p)}
${s('tman')} p{margin:9px 0 0;color:var(--dek);font-size:15px;line-height:1.55;max-width:56ch}
${s('tman')}:nth-of-type(n+3) h3{font-size:clamp(18px,2.1vw,23px);font-weight:700}
${s('tman')}:nth-of-type(n+3) p{display:none}
${s('tult')}{display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;padding:12px 0;border-bottom:1px solid var(--line);align-items:start}
${s('tult')} .t{aspect-ratio:1/1;overflow:hidden;background:var(--ph);border-radius:2px}
${s('tult')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('tult')}:hover .t img{transform:scale(1.07)}
${s('tult')} h4{font-family:var(--fd);font-weight:600;font-size:15px;line-height:1.26;margin:0;color:var(--ink)}
${s('tult')}:hover h4{color:var(--p)}
${s('tult')} .h{display:block;font-family:var(--fb);font-size:9.5px;letter-spacing:.13em;color:var(--muted);margin-top:4px}
${s('tedit')}{margin-top:8px}
${s('tedit')} a{display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding:11px 0;border-bottom:1px solid var(--line)}
${s('tedit')} b{font-family:var(--fd);font-weight:700;font-size:16px;color:var(--ink)}
${s('tedit')} span{font-family:var(--fb);font-size:10.5px;letter-spacing:.1em;color:var(--muted);white-space:nowrap}
${s('tedit')} a:hover b{color:var(--p)}
${s('tsech')}{display:flex;align-items:center;gap:12px;margin:var(--block) 0 20px}
${s('tsech')} h1,${s('tsech')} h2{font-family:var(--fd);font-weight:800;font-size:21px;letter-spacing:-.01em;margin:0;color:var(--ink);white-space:nowrap}
${s('tsech')} .tln{flex:1;height:1px;background:var(--line)}
${s('tgrid')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
${s('tcard')}{display:block}
${s('tcard')} .tph{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad);margin-bottom:10px}
${s('tcard')} .tph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('tcard')}:hover .tph img{transform:scale(1.05)}
${s('tcard')} .k{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.15em;color:var(--p)}
${s('tcard')} h3{font-family:var(--fd);font-weight:700;font-size:16.5px;line-height:1.24;margin:5px 0 0;color:var(--ink)}
${s('tcard')}:hover h3{color:var(--p)}
${s('tart')}{max-width:68ch;margin:0 auto;padding:26px 0 8px}
${s('tahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--p);margin-bottom:11px}
${s('tahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,4.2vw,46px);line-height:1.07;letter-spacing:-.024em;margin:0 0 14px;color:var(--ink)}
${s('tdek')}{column-count:2;column-gap:26px;column-rule:1px solid var(--line);font-size:16px;line-height:1.6;color:var(--dek);margin:0 0 20px;padding-bottom:18px;border-bottom:1px solid var(--line)}
${s('tfig')}{margin:0 0 26px}
${s('tfig')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('tfig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px;font-style:italic}
${s('tbody')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('tbody')} p{margin:0 0 21px}
${s('tbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('tbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.012em;margin:34px 0 12px;color:var(--ink)}
${s('tbody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;margin:26px 0 10px}
${s('tbody')} ul,${s('tbody')} ol{margin:0 0 21px;padding-left:22px}
${s('tbody')} li{margin:0 0 8px}
${s('tbody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('tbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('tbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('tbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('tbody')} table caption{display:none}
  ${s('tbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('tbody')} table tbody,${s('tbody')} table tr,
  ${s('tbody')} table th,${s('tbody')} table td{display:block;width:auto}
  ${s('tbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('tbody')} table tbody th,${s('tbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('tbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('tbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('tbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('tbody')} th,${s('tbody')} td{border-bottom:1px solid var(--line);padding:10px 8px;text-align:left}
${s('tbody')} th{font-family:var(--fb);font-weight:700;border-bottom:2px solid var(--ink)}
${s('tbody')} blockquote{margin:26px 0;padding:0 0 0 22px;border-left:4px solid var(--t2);font-family:var(--fd);font-size:21px;line-height:1.44;color:var(--ink)}
${s('trel')}{max-width:68ch;margin:44px auto 0;padding-top:8px;border-top:1px solid var(--line)}
${s('trel3')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px 18px;align-items:start}
${s('trel3')} ${s('tcard')} h3{font-size:15px;line-height:1.26}
@media(max-width:600px){${s('trel3')}{grid-template-columns:1fr;gap:24px}}
${s('tfoot')}{margin-top:52px;padding:30px 0 20px;border-top:4px solid var(--p);background:var(--surface);font-size:13.5px;color:var(--muted)}
${s('tfoot')} .tcols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:30px}
${s('tfoot')} .tfb{font-family:var(--fd);font-weight:800;font-size:22px;letter-spacing:-.02em;color:var(--ink)}
${s('tfoot')} .tfh{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:var(--ink);margin-bottom:10px}
${s('tfoot')} a{display:block;color:var(--muted);padding:3px 0}
${s('tfoot')} a:hover{color:var(--p)}
${s('tfoot')} .tcp{margin-top:24px;padding-top:14px;border-top:1px solid var(--line);font-size:12.5px}
@media(max-width:1000px){${s('tgrid')}{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:860px){
${s('tplacar')}{grid-template-columns:1fr;gap:30px}
${s('tesq')}{padding-right:0}
${s('tdir')}{padding-left:0;border-left:0;border-top:1px solid var(--line);padding-top:24px}
${s('tdek')}{column-count:1}
${s('tfoot')} .tcols{grid-template-columns:1fr;gap:22px}
}
@media(max-width:520px){${s('tgrid')}{grid-template-columns:1fr}${s('tdata')}{display:none}}`;
}

function tHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('ttop')}"><div class="${c('twrap')}">
<a class="${c('tbrand')}" href="/">${H.esc(site.shortName || site.name)}</a>
<nav class="${c('tnav')}">${links}</nav>
<span class="${c('tdata')}">${H.dateShort()}</span>
</div></header>`;
}

function tFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('tfoot')}"><div class="${c('twrap')}">
<div class="tcols">
<div><div class="tfb">${H.esc(site.name)}</div><p style="margin:11px 0 0;max-width:40ch;line-height:1.55">${H.esc(site.description || '')}</p></div>
<div><div class="tfh">Editorias</div>${cats}</div>
<div><div class="tfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="tcp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function tMan(ctx, a, comFoto) {
  const { c, H } = ctx;
  return `<a class="${c('tman')}" href="${H.url(a)}">
${(comFoto && a.image) ? `<span class="tph">${H.pic(a, true)}</span>` : ''}
<span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 165))}</p>` : ''}</a>`;
}

function tUlt(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('tult')}" href="${H.url(a)}">
<span class="t">${H.pic(a, false)}</span>
<span><h4>${H.esc(a.title)}</h4><span class="h">${H.cat(a)}</span></span></a>`;
}

function tCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('tcard')} ${c('reveal')}" href="${H.url(a)}">
<span class="tph">${H.pic(a, false)}</span>
<span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3></a>`;
}

function quadroEditorias(ctx, arts, menu) {
  const { c, H } = ctx;
  const conta = new Map();
  for (const a of arts) {
    const slug = a.category ? a.category.slug : 'noticias';
    conta.set(slug, (conta.get(slug) || 0) + 1);
  }
  const itens = (menu || []).map(x => {
    const q = conta.get(x.slug) || 0;
    return `<a href="/${H.esc(x.slug)}/"><b>${H.esc(x.name)}</b><span>${q} ${q === 1 ? 'matéria' : 'matérias'}</span></a>`;
  }).join('');
  if (!itens) return '';
  return `<div class="${c('tsel')}" style="margin-top:34px"><span class="tpt"></span><h2>Editorias</h2></div>
<div class="${c('tedit')}">${itens}</div>`;
}

function tHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  // divisao proporcional: com sete fixas a esquerda, um portal novo deixava a
  // coluna da direita terminando na metade da altura da outra
  // um terco na esquerda: a coluna de titulo grande cresce muito mais rapido
  // que a de miniatura, e meio a meio deixava uma coluna com o dobro da outra
  const quantasMan = Math.max(3, Math.min(7, Math.round(arts.length / 3)));
  const manchetes = arts.slice(0, quantasMan);
  const ultimas = arts.slice(quantasMan, quantasMan + 12);
  const resto = arts.slice(quantasMan + 12, site.postsOnHome || 60);
  // secoes por editoria de verdade: fatiar de oito em oito dava secao com o
  // nome de uma editoria e materia de outra dentro
  const ordem = [], porCat = new Map();
  for (const a of resto) {
    const nome = H.cat(a);
    if (!porCat.has(nome)) { porCat.set(nome, []); ordem.push(nome); }
    porCat.get(nome).push(a);
  }
  const sobra = [], blocos = [];
  for (const nome of ordem) {
    const todos = porCat.get(nome);
    // multiplo de quatro, que e o numero de colunas da grade
    const cabe = Math.min(8, Math.floor(todos.length / 4) * 4);
    if (!cabe) { sobra.push(...todos); continue; }
    sobra.push(...todos.slice(cabe));
    blocos.push(`<section><div class="${c('tsech')}"><h2>${nome}</h2><span class="tln"></span></div>
<div class="${c('tgrid')}">${todos.slice(0, cabe).map(a => tCard(ctx, a)).join('')}</div></section>`);
  }
  if (sobra.length) blocos.push(`<section><div class="${c('tsech')}"><h2>Mais notícias</h2><span class="tln"></span></div>
<div class="${c('tgrid')}">${sobra.map(a => tCard(ctx, a)).join('')}</div></section>`);
  return `${H.head(ctx, H.homeMeta(site))}
${tHeader(ctx, menu)}
<main><div class="${c('twrap')}">
${H.h1(ctx)}
<div class="${c('tplacar')}">
<div class="${c('tesq')}">
<div class="${c('tsel')}"><span class="tpt"></span><h2>Manchetes</h2></div>
${manchetes.map((a, i) => tMan(ctx, a, i === 0)).join('')}
</div>
<aside class="${c('tdir')}">
<div class="${c('tsel')}"><span class="tpt"></span><h2>Últimas</h2></div>
${ultimas.map(a => tUlt(ctx, a)).join('')}
${quadroEditorias(ctx, arts, menu)}
</aside>
</div>
${blocos.join('')}
</div></main>
${tFooter(ctx, menu)}`;
}

function tArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('tfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('trel')}">
<div class="${c('tsech')}"><h2>Leia também</h2><span class="tln"></span></div>
<div class="${c('trel3')}">${related.slice(0, 3).map(a => tCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${tHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('twrap')}">
<article class="${c('tart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('tahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<div class="${c('tdek')}">${H.esc(art.dek)}</div>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('tbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${tFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function tList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${tHeader(ctx, opts.menu)}
<main><div class="${c('twrap')}">
<div class="${c('tsech')}" style="margin-top:24px"><h1>${H.esc(opts.title)}</h1><span class="tln"></span></div>
<div class="${c('tgrid')}">${opts.items.map(a => tCard(ctx, a)).join('')}</div>
</div></main>
${tFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH U =====================
 * Nona das quinze do lote de 18/08/2026, servidor hostinger-vps-srv1166087.
 * (Nao confundir com a arch U da clinicas-vps: a letra so precisa ser unica
 * dentro de cada servidor, e este arquivo e outra coisa.)
 *
 * Arquetipo: ZINE TIPOGRAFICO. Quase sem foto na home. A hierarquia vem so de
 * corpo, peso e espaco: a chamada principal ocupa a largura toda em tipo
 * enorme, e o restante desce em blocos de texto separados por muito respiro,
 * com a foto aparecendo apenas em uma a cada quatro entradas. Cabecalho
 * minimo, apenas a marca e um menu discreto alinhado a direita.
 *
 * Serve bem para portal de texto, onde a imagem e escassa ou de baixa
 * qualidade, que e o caso de boa parte do acervo migrado.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function uCss(ctx) {
  const { s } = ctx;
  return `
${s('uwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 30px}
${s('umed')}{width:100%;max-width:720px}
${s('utopo')}{padding:30px 0 0}
${s('umast')}{text-align:center;padding-bottom:18px;border-bottom:1px solid var(--ink)}
${s('ubrand')}{display:inline-block;font-family:var(--fd);font-weight:800;font-size:clamp(30px,4.6vw,50px);letter-spacing:-.032em;line-height:1;color:var(--ink)}
${s('ubrand')} i{display:inline-block;width:.34em;height:.34em;background:var(--p);margin-left:.14em;font-style:normal;vertical-align:baseline}
${s('udata')}{margin-top:9px;font-family:var(--fb);font-size:11px;font-weight:600;letter-spacing:.24em;color:var(--muted)}
${s('unav')}{display:flex;justify-content:center;flex-wrap:wrap;gap:0;border-bottom:1px solid var(--line)}
${s('unav')} a{position:relative;font-family:var(--fb);font-size:12px;font-weight:600;letter-spacing:.18em;color:var(--ink);padding:14px 20px}
${s('unav')} a::after{content:"";position:absolute;left:20px;right:20px;bottom:0;height:3px;background:var(--p);transform:scaleX(0);transform-origin:left;transition:transform .3s ease}
${s('unav')} a:hover::after{transform:scaleX(1)}
main{padding:0 0 10px}
${s('ucapa')}{display:grid;grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);gap:46px;align-items:center;padding:44px 0 40px;border-bottom:1px solid var(--line)}
${s('ucapa')} .utx{min-width:0}
${s('ucapa')} .k{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.2em;color:var(--p)}
${s('ucapa')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(30px,3.5vw,47px);line-height:1.04;letter-spacing:-.03em;margin:14px 0 0;color:var(--ink);text-wrap:balance}
${s('ucapa')}:hover h2{color:var(--p)}
${s('ucapa')} p{margin:16px 0 0;font-size:17.5px;line-height:1.62;color:var(--dek);max-width:50ch}
${s('ucapa')} .uass{display:inline-block;margin-top:20px;font-family:var(--fb);font-size:11.5px;font-weight:700;letter-spacing:.16em;color:var(--ink);border-bottom:2px solid var(--p);padding-bottom:4px}
${s('ucapa')} .uph{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad)}
${s('ucapa')} .uph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}
${s('ucapa')}:hover .uph img{transform:scale(1.035)}
${s('usech')}{display:flex;align-items:center;gap:16px;margin:46px 0 24px}
${s('usech')} h1,${s('usech')} h2{font-family:var(--fb);font-weight:700;font-size:11.5px;letter-spacing:.24em;margin:0;color:var(--p);white-space:nowrap}
${s('usech')} i{flex:1;height:1px;background:var(--ink);opacity:.35;font-style:normal}
${s('ugrade')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:38px 32px}
${s('ucard')}{display:block;min-width:0}
${s('ucard')} .t{display:block;aspect-ratio:var(--card-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad)}
${s('ucard')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}
${s('ucard')}:hover .t img{transform:scale(1.05)}
${s('ucard')} .k{display:block;margin:15px 0 0;font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.19em;color:var(--p)}
${s('ucard')} h3{font-family:var(--fd);font-weight:700;font-size:20px;line-height:1.18;letter-spacing:-.018em;margin:8px 0 0;color:var(--ink);text-wrap:balance}
${s('ucard')}:hover h3{color:var(--p)}
${s('ucard')} p{margin:10px 0 0;font-size:15px;line-height:1.58;color:var(--dek)}
${s('ulista')}{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 48px}
${s('uit')}{display:grid;grid-template-columns:74px minmax(0,1fr);gap:18px;padding:20px 0;border-bottom:1px solid var(--line);align-items:start}
${s('uit')} .n{font-family:var(--fd);font-weight:800;font-size:30px;line-height:1;color:var(--p);opacity:.34}
${s('uit')}>span:last-child{min-width:0}
${s('uit')} .k{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.18em;color:var(--muted)}
${s('uit')} h3{font-family:var(--fd);font-weight:700;font-size:17.5px;line-height:1.26;letter-spacing:-.014em;margin:6px 0 0;color:var(--ink)}
${s('uit')}:hover h3{color:var(--p)}
${s('uartg')}{display:grid;grid-template-columns:minmax(0,190px) minmax(0,720px);gap:56px;align-items:start;padding:34px 0 8px;justify-content:center}
${s('utrilho')}{position:sticky;top:26px;padding-top:6px}
${s('utrilho')} .k{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.19em;color:var(--p);padding-bottom:10px;border-bottom:2px solid var(--p)}
${s('utrilho')} dl{margin:16px 0 0}
${s('utrilho')} dt{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.17em;color:var(--muted);margin-top:14px}
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

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('ubody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('ubody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('ubody')} table caption{display:none}
  ${s('ubody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('ubody')} table tbody,${s('ubody')} table tr,
  ${s('ubody')} table th,${s('ubody')} table td{display:block;width:auto}
  ${s('ubody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('ubody')} table tbody th,${s('ubody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('ubody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('ubody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('ubody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('ubody')} th,${s('ubody')} td{border-bottom:1px solid var(--line);padding:13px 15px;text-align:left;vertical-align:top}
${s('ubody')} th{font-family:var(--fb);font-weight:700;font-size:11.5px;letter-spacing:.13em;color:var(--p)}
${s('ubody')} tr:last-child td{border-bottom:0}
${s('ubody')} blockquote{margin:30px 0;padding:20px 24px;background:var(--surface);border-left:4px solid var(--p);border-radius:var(--rad);font-family:var(--fd);font-size:20px;line-height:1.45;color:var(--ink)}
${s('urel')}{margin-top:56px;padding-top:8px;border-top:1px solid var(--line)}
${s('ufoot')}{margin-top:64px;padding:44px 0 26px;background:var(--footer-bg);color:var(--footer-tx);font-size:14.5px}
${s('ucols')}{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:36px}
${s('ufoot')} .ufb{font-family:var(--fd);font-weight:800;font-size:24px;letter-spacing:-.03em;color:#fff}
${s('ufoot')} .ufb i{display:inline-block;width:.3em;height:.3em;background:var(--p);margin-left:.14em;font-style:normal}
${s('ufoot')} .ufd{margin:13px 0 0;line-height:1.65;max-width:42ch}
${s('ufoot')} .ufh{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.19em;color:#fff;margin-bottom:13px}
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

function uSech(ctx, titulo, tag) {
  const { c, H } = ctx;
  const t = tag || 'h2';
  return `<div class="${c('usech')}"><${t}>${H.esc(titulo)}</${t}><i></i></div>`;
}

function uHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('utopo')}"><div class="${c('uwrap')}">
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

function uEnt(ctx, a, comFoto) {
  const { c, H } = ctx;
  const texto = `<span><span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, comFoto ? 118 : 168))}</p>` : ''}</span>`;
  if (comFoto) {
    return `<a class="${c('uent')} ${c('ucomfoto')} ${c('reveal')}" href="${H.url(a)}">
${texto}<span class="uph">${H.pic(a, false)}</span></a>`;
  }
  return `<a class="${c('uent')} ${c('reveal')}" href="${H.url(a)}">${texto}</a>`;
}

function uIt(ctx, a, n, semK) {
  const { c, H } = ctx;
  return `<a class="${c('uit')}" href="${H.url(a)}">
<span class="n">${n < 10 ? '0' + n : n}</span>
<span>${semK ? '' : `<span class="k">${H.cat(a)}</span>`}<h3>${H.esc(a.title)}</h3></span></a>`;
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
/* ===================== ARCH V =====================
 * Decima das quinze do lote de 18/08/2026, servidor hostinger-vps-srv1166087.
 *
 * Arquetipo: GALERIA. A foto manda em tudo. A home e uma grade de retratos em
 * proporcao 4x5, quase sem espaco entre eles, com o texto aparecendo so no
 * hover no desktop e sempre visivel no toque. A primeira imagem ocupa a
 * largura inteira em faixa panoramica. Cabecalho estreito e transparente sobre
 * a faixa, virando solido no resto do site.
 *
 * O oposto da U: serve para o dominio que sair da poda com o melhor acervo de
 * imagem.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function vCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--v2:${p2}}
${s('vwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 20px}
${s('vtopo')}{position:sticky;top:0;z-index:45;background:var(--paper);border-bottom:1px solid var(--line)}
${s('vtopo')} ${s('vwrap')}{display:flex;align-items:center;gap:30px;min-height:76px;flex-wrap:wrap}
${s('vbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(23px,2.9vw,33px);letter-spacing:.03em;color:var(--ink);white-space:nowrap}
${s('vbrand')} i{font-style:normal;display:inline-block;width:8px;height:26px;background:var(--p);margin-right:11px;vertical-align:-4px}
${s('vnav')}{flex:1 1 auto;min-width:0;display:flex;gap:20px;overflow-x:auto;scrollbar-width:none}
${s('vnav')}::-webkit-scrollbar{display:none}
${s('vnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:700;letter-spacing:.15em;color:var(--muted);white-space:nowrap;padding:6px 0}
${s('vnav')} a:hover{color:var(--p)}
main{padding:0 0 8px}
${s('vfaixa')}{position:relative;display:block;width:100%;height:clamp(260px,46vw,500px);overflow:hidden;background:var(--ph);margin-bottom:0}
${s('vfaixa')} img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s ease}
${s('vfaixa')}:hover img{transform:scale(1.03)}
${s('vfx')}{display:block;padding:26px 0 34px;border-bottom:1px solid var(--line)}
${s('vfx')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.18em;color:#fff;background:var(--p);padding:5px 11px;margin-bottom:14px}
${s('vfx')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(28px,4.2vw,50px);line-height:1.05;letter-spacing:-.026em;margin:0;color:var(--ink);max-width:24ch;text-wrap:balance}
${s('vfx')}:hover h2{color:var(--p)}
${s('vfx')} p{margin:15px 0 0;font-size:17.5px;line-height:1.6;color:var(--dek);max-width:62ch}
${s('vgal')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:34px 26px}
${s('vq')}{display:block;min-width:0}
${s('vq')} .vim{display:block;aspect-ratio:4/3;overflow:hidden;background:var(--ph);border-radius:var(--rad)}
${s('vq')} img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('vq')}:hover img{transform:scale(1.05)}
${s('vqx')}{display:block;padding:14px 0 0}
${s('vqx')} .k{display:block;font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.17em;color:var(--p)}
${s('vqx')} h3{font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.22;letter-spacing:-.012em;margin:7px 0 0;color:var(--ink);text-wrap:balance}
${s('vq')}:hover ${s('vqx')} h3{color:var(--p)}
${s('vqx')} p{margin:8px 0 0;font-size:14.5px;line-height:1.5;color:var(--dek)}
${s('vsech')}{display:flex;align-items:center;gap:14px;margin:38px 0 16px}
${s('vsech')} h1,${s('vsech')} h2{font-family:var(--fd);font-weight:800;font-size:20px;letter-spacing:.03em;margin:0;color:var(--ink);white-space:nowrap}
${s('vsech')} .vln{flex:1;height:2px;background:var(--v2)}
${s('vart')}{max-width:1140px;margin:0 auto;padding:0 20px}
${s('vahero')}{position:relative;width:100%;height:clamp(240px,42vw,520px);overflow:hidden;background:var(--ph);margin-bottom:0;border-bottom:4px solid var(--p)}
${s('vahero')} img{width:100%;height:100%;object-fit:cover;display:block}
${s('vcol')}{max-width:66ch;margin:0 auto;padding:30px 0 8px}
${s('vahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;color:var(--p);margin-bottom:11px}
${s('vahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,4.2vw,46px);line-height:1.07;letter-spacing:-.024em;margin:0 0 14px;color:var(--ink)}
${s('vdek')}{font-size:18.5px;line-height:1.55;color:var(--dek);margin:0 0 18px}
${s('vcap')}{font-size:12.5px;color:var(--muted);margin:10px 0 0;font-style:italic}
${s('vbody')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('vbody')} p{margin:0 0 21px}
${s('vbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('vbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.012em;margin:34px 0 12px;color:var(--ink)}
${s('vbody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;margin:26px 0 10px}
${s('vbody')} ul,${s('vbody')} ol{margin:0 0 21px;padding-left:22px}
${s('vbody')} li{margin:0 0 8px}
${s('vbody')} img{max-width:100%;height:auto}
${s('vbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('vbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('vbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('vbody')} table caption{display:none}
  ${s('vbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('vbody')} table tbody,${s('vbody')} table tr,
  ${s('vbody')} table th,${s('vbody')} table td{display:block;width:auto}
  ${s('vbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('vbody')} table tbody th,${s('vbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('vbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('vbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('vbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('vbody')} th,${s('vbody')} td{border:1px solid var(--line);padding:9px 11px;text-align:left}
${s('vbody')} th{background:var(--surface);font-family:var(--fb);font-weight:700}
${s('vbody')} blockquote{margin:26px 0;padding:16px 20px;background:var(--surface);font-family:var(--fd);font-size:20px;line-height:1.45}
${s('vrel')}{margin-top:44px}
${s('vfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:50px;padding:32px 0 20px}
${s('vfoot')} .vcols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:30px}
${s('vfoot')} .vfb{font-family:var(--fd);font-weight:800;font-size:22px;letter-spacing:.04em;color:#fff}
${s('vfoot')} .vfh{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:#fff;margin-bottom:10px}
${s('vfoot')} a{display:block;color:var(--footer-tx);font-size:14px;padding:3px 0}
${s('vfoot')} a:hover{color:#fff}
${s('vfoot')} .vcp{margin-top:24px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:12.5px;opacity:.82}
@media(max-width:980px){${s('vgal')}{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:700px){${s('vgal')}{grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 18px}${s('vfaixa')}{height:clamp(200px,58vw,320px)}${s('vfx')}{padding:20px 0 26px}}
@media(max-width:460px){${s('vgal')}{grid-template-columns:1fr}${s('vfoot')} .vcols{grid-template-columns:1fr;gap:22px}}`;
}

function vHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('vtopo')}"><div class="${c('vwrap')}">
<a class="${c('vbrand')}" href="/"><i></i>${H.esc(site.shortName || site.name)}</a>
<nav class="${c('vnav')}">${links}</nav>
</div></header>`;
}

function vFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('vfoot')}"><div class="${c('vwrap')}">
<div class="vcols">
<div><div class="vfb">${H.esc(site.name)}</div><p style="margin:11px 0 0;max-width:38ch;font-size:14px;line-height:1.55;opacity:.85">${H.esc(site.description || '')}</p></div>
<div><div class="vfh">Editorias</div>${cats}</div>
<div><div class="vfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="vcp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function vQ(ctx, a, semK) {
  const { c, H } = ctx;
  return `<a class="${c('vq')} ${c('reveal')}" href="${H.url(a)}">
<span class="vim">${H.pic(a, false)}</span>
<span class="${c('vqx')}">${semK ? '' : `<span class="k">${H.cat(a)}</span>`}<h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 96))}</p>` : ''}</span></a>`;
}

function vHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const faixa = arts[0];
  const resto = arts.slice(1, site.postsOnHome || 60);
  const semK = new Set(arts.map(a => H.cat(a))).size <= 1;
  const faixaHtml = faixa ? `<a class="${c('vfaixa')}" href="${H.url(faixa)}">${H.pic(faixa, true)}</a>
<div class="${c('vwrap')}"><a class="${c('vfx')}" href="${H.url(faixa)}">
${semK ? '' : `<span class="k">${H.cat(faixa)}</span>`}<h2>${H.esc(faixa.title)}</h2>
${faixa.excerpt ? `<p>${H.esc(H.clip(faixa.excerpt, 215))}</p>` : ''}</a></div>` : '';
  const blocos = [];
  for (let i = 0; i < resto.length; i += 12) {
    const fatia = resto.slice(i, i + 12);
    const titulo = fatia[0] ? H.cat(fatia[0]) : 'Mais notícias';
    blocos.push(`<section><div class="${c('vwrap')}"><div class="${c('vsech')}"><h2>${titulo}</h2><span class="vln"></span></div></div>
<div class="${c('vwrap')}"><div class="${c('vgal')}">${fatia.map(a => vQ(ctx, a, semK)).join('')}</div></div></section>`);
  }
  return `${H.head(ctx, H.homeMeta(site))}
${vHeader(ctx, menu)}
<main>
<div class="${c('vwrap')}">${H.h1(ctx)}</div>
${faixaHtml}
${blocos.join('')}
</main>
${vFooter(ctx, menu)}`;
}

function vArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const hero = art.image ? `<div class="${c('vahero')}">${H.pic(art, true)}</div>` : '';
  const cap = (art.image && art.image.caption) ? `<p class="${c('vcap')}">${H.esc(art.image.caption)}</p>` : '';
  const rel = (related && related.length) ? `<section class="${c('vrel')}">
<div class="${c('vwrap')}"><div class="${c('vsech')}"><h2>Leia também</h2><span class="vln"></span></div></div>
<div class="${c('vwrap')}"><div class="${c('vgal')}">${related.map(a => vQ(ctx, a, true)).join('')}</div></div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${vHeader(ctx, menu)}
${H.progressBar(ctx)}
${hero}
<main><div class="${c('vart')}"><article class="${c('vcol')}">
${H.crumbs(ctx, art, P)}
<div class="${c('vahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${cap}
${art.dek ? `<p class="${c('vdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
<div class="${c('vbody')}">${art.content}</div>
${H.share(ctx, P)}
</article></div>
${rel}
</main>
${vFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function vList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${vHeader(ctx, opts.menu)}
<main>
<div class="${c('vwrap')}"><div class="${c('vsech')}"><h1>${H.esc(opts.title)}</h1><span class="vln"></span></div></div>
<div class="${c('vwrap')}"><div class="${c('vgal')}">${opts.items.map(a => vQ(ctx, a, new Set(opts.items.map(x => H.cat(x))).size <= 1)).join('')}</div></div>
</main>
${vFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH W =====================
 * Decima primeira das quinze do lote de 18/08/2026, servidor
 * hostinger-vps-srv1166087.
 *
 * Arquetipo: BOLETIM. Coluna unica e estreita do comeco ao fim, como uma
 * newsletter aberta no navegador. Cada entrada e uma fileira de texto a
 * esquerda e miniatura pequena a direita, separadas por filete pontilhado. O
 * topo traz uma tarja de acento com a data por extenso. Sem grade, sem cartao
 * e sem foto grande em lugar nenhum da home.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function wCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--w2:${p2}}
${s('wwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 28px}
${s('wmed')}{width:100%;max-width:768px}
${s('wtarja')}{background:var(--p);color:var(--onp)}
${s('wtarja')} ${s('wwrap')}{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:36px;font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;}
${s('wtopo')}{padding:24px 0 18px;border-bottom:1px solid var(--line)}
${s('wtopo')} ${s('wwrap')}{display:flex;align-items:center;justify-content:space-between;gap:26px;flex-wrap:wrap}
${s('wbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(25px,3vw,36px);letter-spacing:-.028em;color:var(--ink);white-space:nowrap;line-height:1}
${s('wbrand')} u{text-decoration:none;border-bottom:4px solid var(--p);padding-bottom:4px}
${s('wnav')}{display:flex;gap:24px;flex-wrap:wrap}
${s('wnav')} a{position:relative;font-family:var(--fb);font-size:12.5px;font-weight:700;letter-spacing:.13em;color:var(--muted);padding:7px 0}
${s('wnav')} a::after{content:"";position:absolute;left:0;right:100%;bottom:0;height:2px;background:var(--p);transition:right .3s ease}
${s('wnav')} a:hover{color:var(--ink)}
${s('wnav')} a:hover::after{right:0}
main{padding:0 0 8px}
${s('wcapa')}{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:44px;align-items:center;padding:40px 0 38px;border-bottom:1px solid var(--line)}
${s('wcapa')} .wtx{min-width:0}
${s('wcapa')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.18em;color:var(--onp);background:var(--p);padding:4px 10px}
${s('wcapa')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(30px,3.5vw,46px);line-height:1.06;letter-spacing:-.028em;margin:16px 0 0;color:var(--ink);text-wrap:balance}
${s('wcapa')}:hover h2{color:var(--p)}
${s('wcapa')} p{margin:16px 0 0;font-size:17px;line-height:1.6;color:var(--dek);max-width:52ch}
${s('wcapa')} .wass{margin:18px 0 0;font-family:var(--fb);font-size:11.5px;font-weight:700;letter-spacing:.14em;color:var(--muted)}
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
${s('wcard')} .k{display:block;margin:14px 0 0;font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.17em;color:var(--p)}
${s('wcard')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;line-height:1.2;letter-spacing:-.016em;margin:7px 0 0;color:var(--ink);text-wrap:balance}
${s('wcard')}:hover h3{color:var(--p)}
${s('wcard')} p{margin:9px 0 0;font-size:14.5px;line-height:1.55;color:var(--dek)}
${s('wlista')}{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 44px}
${s('wfila')}{display:grid;grid-template-columns:minmax(0,1fr) 128px;gap:20px;padding:20px 0;border-bottom:1px solid var(--line);align-items:start}
${s('wfila')} .t{display:block;aspect-ratio:4/3;overflow:hidden;background:var(--ph)}
${s('wfila')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('wfila')}:hover .t img{transform:scale(1.06)}
${s('wfila')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.16em;color:var(--muted)}
${s('wfila')}>span{display:block;min-width:0}
${s('wfila')} h3{font-family:var(--fd);font-weight:700;font-size:17.5px;line-height:1.25;letter-spacing:-.014em;margin:6px 0 0;color:var(--ink)}
${s('wfila')}:hover h3{color:var(--p)}
${s('wfila')} p{margin:7px 0 0;font-size:14px;line-height:1.5;color:var(--dek)}
${s('wsemfoto')}{grid-template-columns:1fr}
${s('wartg')}{display:grid;grid-template-columns:minmax(0,768px) minmax(0,300px);gap:60px;align-items:start;padding:30px 0 8px}
${s('wart')}{min-width:0}
${s('wrail')}{position:sticky;top:24px;border-top:3px solid var(--p);padding-top:16px}
${s('wrail')} .wrh{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;color:var(--p);margin-bottom:14px}
${s('wrail')} a{display:block;padding:14px 0;border-bottom:1px solid var(--line)}
${s('wrail')} a:last-child{border-bottom:0}
${s('wrail')} .k{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.16em;color:var(--muted)}
${s('wrail')} h3{font-family:var(--fd);font-weight:700;font-size:16px;line-height:1.26;letter-spacing:-.012em;margin:6px 0 0;color:var(--ink)}
${s('wrail')} a:hover h3{color:var(--p)}
${s('wahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;color:var(--onp);background:var(--p);padding:5px 11px;margin-bottom:14px}
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

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('wbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('wbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('wbody')} table caption{display:none}
  ${s('wbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('wbody')} table tbody,${s('wbody')} table tr,
  ${s('wbody')} table th,${s('wbody')} table td{display:block;width:auto}
  ${s('wbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('wbody')} table tbody th,${s('wbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('wbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('wbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('wbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('wbody')} th,${s('wbody')} td{border-bottom:1px solid var(--line);padding:12px 14px;text-align:left;vertical-align:top}
${s('wbody')} th{font-family:var(--fb);font-weight:700;font-size:11.5px;letter-spacing:.12em;color:var(--p);border-bottom:2px solid var(--p);background:transparent}
${s('wbody')} tr:last-child td{border-bottom:0}
${s('wtab')}{overflow-x:auto;-webkit-overflow-scrolling:touch}
${s('wbody')} blockquote{margin:28px 0;padding:16px 0 16px 22px;border-left:4px solid var(--p);font-family:var(--fd);font-size:20px;line-height:1.45;color:var(--ink)}
${s('wrel')}{margin-top:52px}
${s('wfoot')}{margin-top:60px;padding:40px 0 24px;border-top:3px solid var(--p);background:var(--footer-bg);color:var(--footer-tx);font-size:14px}
${s('wfcol')}{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:36px}
${s('wfoot')} .wfb{font-family:var(--fd);font-weight:800;font-size:23px;letter-spacing:-.026em;color:var(--ink)}
${s('wfoot')} .wfb u{text-decoration:none;border-bottom:3px solid var(--p);padding-bottom:3px}
${s('wfoot')} .wfd{margin:12px 0 0;line-height:1.65;max-width:44ch}
${s('wfoot')} .wfh{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;color:var(--ink);margin-bottom:12px}
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

function wHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const marca = nome.replace(/^(\S+)/, '<u>$1</u>');
  return `<body>
<div class="${c('wtarja')}"><div class="${c('wwrap')}">
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
/* ===================== ARCH X =====================
 * Decima segunda das quinze do lote de 18/08/2026, servidor
 * hostinger-vps-srv1166087.
 *
 * Arquetipo: FAIXAS POR EDITORIA. A home nao mistura assuntos: cada editoria
 * ganha uma faixa de largura total, com fundo alternado entre claro e o tom de
 * superficie, titulo da editoria em vertical na lateral esquerda da faixa e os
 * artigos correndo na horizontal ao lado, com rolagem lateral em telas
 * estreitas. Cabecalho colado no topo com filete de acento embaixo.
 *
 * O titulo em vertical resolve um problema pratico: com muitas editorias, o
 * cabecalho de secao horizontal come altura demais e a home fica longa.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function xCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--x2:${p2}}
${s('xwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 24px}
${s('xtopo')}{position:sticky;top:0;z-index:45;background:var(--paper);box-shadow:0 1px 0 var(--line)}
${s('xtopo')}::after{content:"";display:block;height:3px;background:linear-gradient(90deg,var(--p) 0,var(--x2) 100%)}
${s('xtopo')} ${s('xwrap')}{display:flex;align-items:center;gap:24px;min-height:60px;flex-wrap:wrap}
${s('xbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(21px,2.7vw,29px);letter-spacing:-.018em;color:var(--ink);white-space:nowrap}
${s('xbrand')} b{color:var(--x2)}
${s('xnav')}{flex:1 1 auto;min-width:0;display:flex;gap:18px;overflow-x:auto;scrollbar-width:none}
${s('xnav')}::-webkit-scrollbar{display:none}
${s('xnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.1em;color:var(--muted);white-space:nowrap}
${s('xnav')} a:hover{color:var(--p)}
main{padding:0 0 8px}
${s('xabre')}{padding:30px 0 34px;border-bottom:1px solid var(--line)}
${s('xabre')} ${s('xwrap')}{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:32px;align-items:center}
${s('xabre')} .xph{display:block;aspect-ratio:var(--hero-ar);overflow:hidden;border-radius:var(--rad-lg);background:var(--ph)}
${s('xabre')} .xph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('xabre')}:hover .xph img{transform:scale(1.04)}
${s('xabre')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;color:#fff;background:var(--p);padding:4px 10px;border-radius:2px}
${s('xabre')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(26px,4vw,44px);line-height:1.06;letter-spacing:-.024em;margin:13px 0 0;color:var(--ink)}
${s('xabre')}:hover h2{color:var(--p)}
${s('xabre')} p{margin:12px 0 0;font-size:16.5px;line-height:1.55;color:var(--dek);max-width:52ch}
${s('xfaixa')}{padding:38px 0}
${s('xfaixa')}:nth-of-type(even){background:var(--surface)}
${s('xfaixa')} ${s('xwrap')}{display:grid;grid-template-columns:64px minmax(0,1fr);gap:30px;align-items:start}
${s('xrotulo')}{position:relative;height:100%;min-height:120px}
${s('xrotulo')} span{position:absolute;top:0;left:50%;transform:translateX(-50%) rotate(180deg);writing-mode:vertical-rl;font-family:var(--fd);font-weight:800;font-size:15px;letter-spacing:.16em;color:var(--ink);white-space:nowrap}
${s('xrotulo')}::before{content:"";position:absolute;left:50%;bottom:0;top:0;width:3px;background:var(--p);transform:translateX(16px)}
${s('xtrilho')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:30px 24px;align-items:start}
${s('xcard')}{display:block;min-width:0}
${s('xcard')} .xph{display:block;aspect-ratio:4/3;overflow:hidden;background:var(--ph);border-radius:var(--rad);margin-bottom:12px}
${s('xcard')} .xph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('xcard')}:hover .xph img{transform:scale(1.06)}
${s('xcard')} h3{font-family:var(--fd);font-weight:700;font-size:17.5px;line-height:1.26;letter-spacing:-.012em;margin:6px 0 0;color:var(--ink);text-wrap:balance}
${s('xcard')}:hover h3{color:var(--p)}
${s('xcard')} .h{display:block;font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.16em;color:var(--p);margin:0}
${s('xgrid')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
${s('xsech')}{display:flex;align-items:center;gap:12px;margin:32px 0 18px}
${s('xsech')} h1,${s('xsech')} h2{font-family:var(--fd);font-weight:800;font-size:21px;letter-spacing:-.01em;margin:0;color:var(--ink);white-space:nowrap}
${s('xsech')} .xln{flex:1;height:3px;background:linear-gradient(90deg,var(--p),transparent)}
${s('xart')}{max-width:68ch;margin:0 auto;padding:28px 0 8px}
${s('xahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.17em;color:#fff;background:var(--p);padding:4px 10px;border-radius:2px;margin-bottom:12px}
${s('xahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,4.2vw,46px);line-height:1.07;letter-spacing:-.024em;margin:0 0 14px;color:var(--ink)}
${s('xdek')}{font-size:18.5px;line-height:1.55;color:var(--dek);margin:0 0 18px}
${s('xfig')}{margin:22px 0 28px}
${s('xfig')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('xfig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px;font-style:italic}
${s('xbody')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('xbody')} p{margin:0 0 21px}
${s('xbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('xbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.012em;margin:34px 0 12px;color:var(--ink)}
${s('xbody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;margin:26px 0 10px}
${s('xbody')} ul,${s('xbody')} ol{margin:0 0 21px;padding-left:22px}
${s('xbody')} li{margin:0 0 8px}
${s('xbody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('xbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('xbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('xbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('xbody')} table caption{display:none}
  ${s('xbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('xbody')} table tbody,${s('xbody')} table tr,
  ${s('xbody')} table th,${s('xbody')} table td{display:block;width:auto}
  ${s('xbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('xbody')} table tbody th,${s('xbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('xbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('xbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('xbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('xbody')} th,${s('xbody')} td{border:1px solid var(--line);padding:9px 11px;text-align:left}
${s('xbody')} th{background:var(--surface);font-family:var(--fb);font-weight:700}
${s('xbody')} blockquote{margin:26px 0;padding:16px 20px;background:var(--surface);border-left:4px solid var(--x2);border-radius:0 var(--rad) var(--rad) 0;font-family:var(--fd);font-size:20px;line-height:1.45}
${s('xrel')}{margin-top:44px;padding-top:8px;border-top:1px solid var(--line)}
${s('xfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:52px;padding:32px 0 20px}
${s('xfoot')} .xcols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:30px}
${s('xfoot')} .xfb{font-family:var(--fd);font-weight:800;font-size:22px;letter-spacing:-.018em;color:#fff}
${s('xfoot')} .xfh{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:#fff;margin-bottom:10px}
${s('xfoot')} a{display:block;color:var(--footer-tx);font-size:14px;padding:3px 0}
${s('xfoot')} a:hover{color:#fff}
${s('xfoot')} .xcp{margin-top:24px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:12.5px;opacity:.82}
@media(max-width:1000px){${s('xgrid')}{grid-template-columns:repeat(2,minmax(0,1fr))}${s('xtrilho')}{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:820px){${s('xtrilho')}{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 18px}}
@media(max-width:820px){
${s('xabre')} ${s('xwrap')}{grid-template-columns:1fr;gap:16px}
${s('xfaixa')} ${s('xwrap')}{grid-template-columns:1fr;gap:12px}
${s('xrotulo')}{min-height:0;height:auto}
${s('xrotulo')} span{position:static;transform:none;writing-mode:horizontal-tb;display:block;padding-left:13px;border-left:3px solid var(--p)}
${s('xrotulo')}::before{display:none}
${s('xfoot')} .xcols{grid-template-columns:1fr;gap:22px}
}
@media(max-width:620px){
${s('xtrilho')}{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:76%;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;scrollbar-width:none}
${s('xtrilho')}::-webkit-scrollbar{display:none}
${s('xcard')}{scroll-snap-align:start}
${s('xfaixa')}{padding:28px 0}
}
@media(max-width:520px){${s('xgrid')}{grid-template-columns:1fr}}`;
}

function xHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const partes = nome.split(' ');
  const marca = partes.length > 1 ? `${partes[0]} <b>${partes.slice(1).join(' ')}</b>` : nome;
  return `<body>
<header class="${c('xtopo')}"><div class="${c('xwrap')}">
<a class="${c('xbrand')}" href="/">${marca}</a>
<nav class="${c('xnav')}">${links}</nav>
</div></header>`;
}

function xFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('xfoot')}"><div class="${c('xwrap')}">
<div class="xcols">
<div><div class="xfb">${H.esc(site.name)}</div><p style="margin:11px 0 0;max-width:38ch;font-size:14px;line-height:1.55;opacity:.85">${H.esc(site.description || '')}</p></div>
<div><div class="xfh">Editorias</div>${cats}</div>
<div><div class="xfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="xcp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function xCard(ctx, a, semK) {
  const { c, H } = ctx;
  return `<a class="${c('xcard')}" href="${H.url(a)}">
<span class="xph">${H.pic(a, false)}</span>
${semK ? '' : `<span class="h">${H.cat(a)}</span>`}<h3>${H.esc(a.title)}</h3></a>`;
}

function xHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const abre = arts[0];
  const resto = arts.slice(1, site.postsOnHome || 60);
  // agrupa por editoria, mantendo a ordem de aparicao
  const porCat = new Map();
  resto.forEach(a => {
    const nome = H.cat(a);
    if (!porCat.has(nome)) porCat.set(nome, []);
    porCat.get(nome).push(a);
  });
  const abreHtml = abre ? `<section class="${c('xabre')}"><div class="${c('xwrap')}">
<a href="${H.url(abre)}" style="display:contents">
<span><span class="k">${H.cat(abre)}</span><h2>${H.esc(abre.title)}</h2>
${abre.excerpt ? `<p>${H.esc(H.clip(abre.excerpt, 190))}</p>` : ''}</span>
<span class="xph">${H.pic(abre, true)}</span></a>
</div></section>` : '';
  const faixas = [];
  porCat.forEach((itens, nome) => {
    faixas.push(`<section class="${c('xfaixa')}"><div class="${c('xwrap')}">
<div class="${c('xrotulo')}"><span>${H.esc(nome)}</span></div>
<div class="${c('xtrilho')}">${itens.slice(0, 8).map(a => xCard(ctx, a, true)).join('')}</div>
</div></section>`);
  });
  return `${H.head(ctx, H.homeMeta(site))}
${xHeader(ctx, menu)}
<main>
<div class="${c('xwrap')}">${H.h1(ctx)}</div>
${abreHtml}
${faixas.join('')}
</main>
${xFooter(ctx, menu)}`;
}

function xArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('xfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('xrel')}">
<div class="${c('xsech')}"><h2>Leia também</h2><span class="xln"></span></div>
<div class="${c('xgrid')}">${related.map(a => xCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${xHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('xwrap')}">
<article class="${c('xart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('xahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/" style="color:#fff">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<p class="${c('xdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('xbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${xFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function xList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${xHeader(ctx, opts.menu)}
<main><div class="${c('xwrap')}">
<div class="${c('xsech')}" style="margin-top:26px"><h1>${H.esc(opts.title)}</h1><span class="xln"></span></div>
<div class="${c('xgrid')}">${opts.items.map(a => xCard(ctx, a)).join('')}</div>
</div></main>
${xFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH Y =====================
 * Decima terceira das quinze do lote de 18/08/2026, servidor
 * hostinger-vps-srv1166087.
 *
 * Arquetipo: PAINEL MODULAR. A home e um quadro de modulos de alturas iguais e
 * larguras diferentes, encaixados numa grade de doze colunas: um modulo de
 * abertura ocupando sete colunas, um modulo de leitura rapida em cinco, e
 * abaixo modulos de quatro colunas por editoria. Cada modulo tem cabecalho
 * proprio com filete de acento, e o conteudo dentro dele e sempre uma lista,
 * nunca cartao solto. Serve para portal com muitas editorias e pouco material
 * por editoria, que e o caso de acervo recem-podado.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function yCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--y2:${p2}}
${s('ywrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 22px}
${s('ytopo')}{position:sticky;top:0;z-index:45;background:var(--paper);border-bottom:1px solid var(--line)}
${s('ytopo')} ${s('ywrap')}{display:flex;align-items:center;gap:22px;min-height:60px;flex-wrap:wrap}
${s('ybrand')}{display:flex;align-items:center;gap:10px;font-family:var(--fd);font-weight:800;font-size:clamp(20px,2.5vw,27px);letter-spacing:-.016em;color:var(--ink);white-space:nowrap}
${s('ybrand')} i{font-style:normal;display:grid;place-items:center;width:30px;height:30px;background:var(--p);color:#fff;font-size:15px;border-radius:6px}
${s('ynav')}{flex:1 1 auto;min-width:0;display:flex;gap:16px;overflow-x:auto;scrollbar-width:none}
${s('ynav')}::-webkit-scrollbar{display:none}
${s('ynav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.08em;color:var(--muted);white-space:nowrap}
${s('ynav')} a:hover{color:var(--p)}
main{padding:22px 0 8px}
${s('ypainel')}{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:20px}
${s('ymod')}{border:1px solid var(--line);border-radius:var(--rad-lg);padding:16px 18px 14px;background:var(--paper);min-width:0}
${s('ymh')}{display:flex;align-items:center;gap:10px;margin:0 0 12px;padding-bottom:9px;border-bottom:1px solid var(--line)}
${s('ymh')} h2,${s('ymh')} h1{font-family:var(--fd);font-weight:800;font-size:14px;letter-spacing:.1em;margin:0;color:var(--ink);white-space:nowrap}
${s('ymh')}::before{content:"";width:4px;height:16px;background:var(--p);border-radius:2px;flex:0 0 auto}
${s('ymh')} .n{margin-left:auto;font-family:var(--fb);font-size:10px;letter-spacing:.12em;color:var(--muted)}
${s('ycol7')}{grid-column:span 7}
${s('ycol5')}{grid-column:span 5}
${s('ycol4')}{grid-column:span 4}
${s('ycol6')}{grid-column:span 6}
${s('yabre')}{display:block}
${s('yabre')} .yph{aspect-ratio:16/9;overflow:hidden;border-radius:var(--rad);background:var(--ph);margin-bottom:13px}
${s('yabre')} .yph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('yabre')}:hover .yph img{transform:scale(1.04)}
${s('yabre')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--y2)}
${s('yabre')} h3{font-family:var(--fd);font-weight:800;font-size:clamp(21px,2.7vw,30px);line-height:1.12;letter-spacing:-.02em;margin:6px 0 0;color:var(--ink)}
${s('yabre')}:hover h3{color:var(--p)}
${s('yabre')} p{margin:9px 0 0;color:var(--dek);font-size:14.5px;line-height:1.5}
${s('ylista')}{display:flex;flex-direction:column}
${s('yli')}{display:grid;grid-template-columns:22px minmax(0,1fr);gap:10px;padding:9px 0;border-bottom:1px dashed var(--line);align-items:baseline}
${s('yli')}:last-child{border-bottom:0}
${s('yli')} .d{width:6px;height:6px;border-radius:50%;background:var(--line);margin-top:7px}
${s('yli')}:hover .d{background:var(--p)}
${s('yli')} h4{font-family:var(--fd);font-weight:600;font-size:15px;line-height:1.28;margin:0;color:var(--ink)}
${s('yli')}:hover h4{color:var(--p)}
${s('yli')} .h{display:block;font-family:var(--fb);font-size:9.5px;letter-spacing:.12em;color:var(--muted);margin-top:3px}
${s('yfoto')}{display:grid;grid-template-columns:minmax(0,1fr) 74px;gap:12px;padding:10px 0;border-bottom:1px dashed var(--line);align-items:start}
${s('yfoto')}:last-child{border-bottom:0}
${s('yfoto')} .t{aspect-ratio:1/1;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('yfoto')} .t img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('yfoto')}:hover .t img{transform:scale(1.07)}
${s('yfoto')} h4{font-family:var(--fd);font-weight:600;font-size:15px;line-height:1.26;margin:0;color:var(--ink)}
${s('yfoto')}:hover h4{color:var(--p)}
${s('yfoto')} .h{display:block;font-family:var(--fb);font-size:9.5px;letter-spacing:.12em;color:var(--muted);margin-top:4px}
${s('yart')}{max-width:68ch;margin:0 auto;padding:26px 0 8px}
${s('yahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--p);padding:4px 9px;border:1px solid var(--p);border-radius:4px;margin-bottom:12px}
${s('yahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,4.2vw,45px);line-height:1.08;letter-spacing:-.024em;margin:0 0 14px;color:var(--ink)}
${s('ydek')}{font-size:18.5px;line-height:1.55;color:var(--dek);margin:0 0 18px}
${s('yfig')}{margin:22px 0 28px}
${s('yfig')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg)}
${s('yfig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px;font-style:italic}
${s('ybody')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('ybody')} p{margin:0 0 21px}
${s('ybody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('ybody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.012em;margin:34px 0 12px;color:var(--ink)}
${s('ybody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;margin:26px 0 10px}
${s('ybody')} ul,${s('ybody')} ol{margin:0 0 21px;padding-left:22px}
${s('ybody')} li{margin:0 0 8px}
${s('ybody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('ybody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('ybody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('ybody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('ybody')} table caption{display:none}
  ${s('ybody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('ybody')} table tbody,${s('ybody')} table tr,
  ${s('ybody')} table th,${s('ybody')} table td{display:block;width:auto}
  ${s('ybody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('ybody')} table tbody th,${s('ybody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('ybody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('ybody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('ybody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('ybody')} th,${s('ybody')} td{border:1px solid var(--line);padding:9px 11px;text-align:left}
${s('ybody')} th{background:var(--surface);font-family:var(--fb);font-weight:700}
${s('ybody')} blockquote{margin:26px 0;padding:16px 20px;border:1px solid var(--line);border-left:4px solid var(--y2);border-radius:var(--rad);font-family:var(--fd);font-size:20px;line-height:1.45}
${s('yrel')}{margin-top:42px}
${s('yfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:50px;padding:32px 0 20px}
${s('yfoot')} .ycols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:30px}
${s('yfoot')} .yfb{font-family:var(--fd);font-weight:800;font-size:22px;color:#fff}
${s('yfoot')} .yfh{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:#fff;margin-bottom:10px}
${s('yfoot')} a{display:block;color:var(--footer-tx);font-size:14px;padding:3px 0}
${s('yfoot')} a:hover{color:#fff}
${s('yfoot')} .ycp{margin-top:24px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:12.5px;opacity:.82}
@media(max-width:1000px){${s('ycol7')},${s('ycol5')},${s('ycol6')}{grid-column:span 12}${s('ycol4')}{grid-column:span 6}}
@media(max-width:640px){${s('ycol4')}{grid-column:span 12}${s('yfoot')} .ycols{grid-template-columns:1fr;gap:22px}}`;
}

function yHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  return `<body>
<header class="${c('ytopo')}"><div class="${c('ywrap')}">
<a class="${c('ybrand')}" href="/"><i>${nome.slice(0, 1)}</i>${nome}</a>
<nav class="${c('ynav')}">${links}</nav>
</div></header>`;
}

function yFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('yfoot')}"><div class="${c('ywrap')}">
<div class="ycols">
<div><div class="yfb">${H.esc(site.name)}</div><p style="margin:11px 0 0;max-width:38ch;font-size:14px;line-height:1.55;opacity:.85">${H.esc(site.description || '')}</p></div>
<div><div class="yfh">Editorias</div>${cats}</div>
<div><div class="yfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="ycp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function yLi(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('yli')}" href="${H.url(a)}">
<span class="d"></span><span><h4>${H.esc(a.title)}</h4><span class="h">${H.cat(a)}</span></span></a>`;
}

function yFoto(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('yfoto')}" href="${H.url(a)}">
<span><h4>${H.esc(a.title)}</h4><span class="h">${H.cat(a)}</span></span>
<span class="t">${H.pic(a, false)}</span></a>`;
}

function yMod(ctx, titulo, corpo, colClasse, n) {
  const { c, H } = ctx;
  return `<section class="${c('ymod')} ${colClasse}">
<div class="${c('ymh')}"><h2>${H.esc(titulo)}</h2>${n ? `<span class="n">${n}</span>` : ''}</div>
${corpo}</section>`;
}

function yHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const abre = arts[0];
  const rapida = arts.slice(1, 8);
  const resto = arts.slice(8, site.postsOnHome || 60);
  const abreHtml = abre ? `<a class="${c('yabre')}" href="${H.url(abre)}">
${abre.image ? `<span class="yph">${H.pic(abre, true)}</span>` : ''}
<span class="k">${H.cat(abre)}</span><h3>${H.esc(abre.title)}</h3>
${abre.excerpt ? `<p>${H.esc(H.clip(abre.excerpt, 176))}</p>` : ''}</a>` : '';
  const porCat = new Map();
  resto.forEach(a => {
    const nome = H.cat(a);
    if (!porCat.has(nome)) porCat.set(nome, []);
    porCat.get(nome).push(a);
  });
  const mods = [];
  porCat.forEach((itens, nome) => {
    const corpo = `<div class="${c('ylista')}">${itens.slice(0, 6).map((a, i) => i === 0 && a.image ? yFoto(ctx, a) : yLi(ctx, a)).join('')}</div>`;
    mods.push(yMod(ctx, nome, corpo, c('ycol4'), itens.length + ' itens'));
  });
  return `${H.head(ctx, H.homeMeta(site))}
${yHeader(ctx, menu)}
<main><div class="${c('ywrap')}">
${H.h1(ctx)}
<div class="${c('ypainel')}">
${abre ? yMod(ctx, 'Abertura', abreHtml, c('ycol7'), '') : ''}
${rapida.length ? yMod(ctx, 'Leitura rápida', `<div class="${c('ylista')}">${rapida.map(a => yLi(ctx, a)).join('')}</div>`, c('ycol5'), rapida.length + ' itens') : ''}
${mods.join('')}
</div>
</div></main>
${yFooter(ctx, menu)}`;
}

function yArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('yfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('yrel')}">
<div class="${c('ypainel')}">${yMod(ctx, 'Leia também', `<div class="${c('ylista')}">${related.map(a => yFoto(ctx, a)).join('')}</div>`, c('ycol6'), '')}
${yMod(ctx, 'Do acervo', `<div class="${c('ylista')}">${related.slice().reverse().map(a => yLi(ctx, a)).join('')}</div>`, c('ycol6'), '')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${yHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('ywrap')}">
<article class="${c('yart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('yahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<p class="${c('ydek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('ybody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${yFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function yList(ctx, opts) {
  const { c, H } = ctx;
  const corpo = `<div class="${c('ylista')}">${opts.items.map((a, i) => (i % 3 === 0 && a.image) ? yFoto(ctx, a) : yLi(ctx, a)).join('')}</div>`;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${yHeader(ctx, opts.menu)}
<main><div class="${c('ywrap')}">
<div class="${c('ypainel')}" style="margin-top:22px">
<section class="${c('ymod')}" style="grid-column:span 12">
<div class="${c('ymh')}"><h1>${H.esc(opts.title)}</h1><span class="n">${opts.items.length} itens</span></div>
${corpo}</section>
</div>
</div></main>
${yFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH Z =====================
 * Decima quarta das quinze do lote de 18/08/2026, servidor
 * hostinger-vps-srv1166087.
 *
 * Arquetipo: CADERNO. Duas colunas assimetricas o tempo todo, como caderno de
 * jornal: a coluna larga a esquerda com as materias, a estreita a direita com
 * um bloco fixo de "mais lidas" que acompanha a rolagem. Cada materia da
 * coluna larga tem a foto a esquerda em formato retrato e o texto a direita,
 * invertendo a orientacao habitual de card. Cabecalho com marca alinhada a
 * esquerda e data em caixa do lado oposto.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function zCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--z2:${p2}}
${s('zwrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 24px}
${s('ztopo')}{position:sticky;top:0;z-index:45;background:var(--paper);border-bottom:1px solid var(--line)}
${s('ztopo')} ${s('zwrap')}{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:62px;flex-wrap:wrap}
${s('zbrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(21px,2.8vw,30px);letter-spacing:-.02em;color:var(--ink);white-space:nowrap}
${s('zbrand')} s{text-decoration:none;color:var(--z2)}
${s('zcaixa')}{font-family:var(--fb);font-size:10.5px;font-weight:600;letter-spacing:.13em;color:var(--muted);border:1px solid var(--line);padding:5px 10px;border-radius:3px;white-space:nowrap}
${s('znavbar')}{border-bottom:1px solid var(--line);background:var(--surface)}
${s('znavbar')} ${s('zwrap')}{display:flex;gap:20px;align-items:center;min-height:38px;overflow-x:auto;scrollbar-width:none}
${s('znavbar')} ${s('zwrap')}::-webkit-scrollbar{display:none}
${s('znavbar')} a{font-family:var(--fb);font-size:12px;font-weight:600;letter-spacing:.1em;color:var(--muted);white-space:nowrap}
${s('znavbar')} a:hover{color:var(--p)}
main{padding:26px 0 8px}
${s('zcaderno')}{display:grid;grid-template-columns:minmax(0,1fr) 268px;gap:38px;align-items:start}
${s('zabre')}{display:block;padding-bottom:24px;border-bottom:2px solid var(--ink);margin-bottom:8px}
${s('zabre')} .zph{aspect-ratio:var(--hero-ar);overflow:hidden;background:var(--ph);border-radius:var(--rad);margin-bottom:14px}
${s('zabre')} .zph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('zabre')}:hover .zph img{transform:scale(1.04)}
${s('zabre')} .k{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--p)}
${s('zabre')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(25px,3.8vw,42px);line-height:1.07;letter-spacing:-.024em;margin:8px 0 0;color:var(--ink)}
${s('zabre')}:hover h2{color:var(--p)}
${s('zabre')} p{margin:11px 0 0;color:var(--dek);font-size:16.5px;line-height:1.55;max-width:56ch}
${s('zmat')}{display:grid;grid-template-columns:150px minmax(0,1fr);gap:20px;padding:20px 0;border-bottom:1px solid var(--line);align-items:start}
${s('zmat')} .zph{aspect-ratio:3/4;overflow:hidden;background:var(--ph);border-radius:var(--rad)}
${s('zmat')} .zph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('zmat')}:hover .zph img{transform:scale(1.05)}
${s('zmat')} .k{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--z2)}
${s('zmat')} h3{font-family:var(--fd);font-weight:700;font-size:20px;line-height:1.2;letter-spacing:-.014em;margin:6px 0 0;color:var(--ink)}
${s('zmat')}:hover h3{color:var(--p)}
${s('zmat')} p{margin:8px 0 0;color:var(--dek);font-size:14.5px;line-height:1.52}
${s('zsemfoto')}{grid-template-columns:1fr}
${s('zlado')}{position:sticky;top:112px}
${s('zbox')}{border:1px solid var(--line);border-radius:var(--rad-lg);padding:16px 16px 10px;margin-bottom:20px}
${s('zboxh')}{font-family:var(--fd);font-weight:800;font-size:13.5px;letter-spacing:.11em;color:var(--ink);margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid var(--p)}
${s('zli')}{display:grid;grid-template-columns:20px minmax(0,1fr);gap:9px;padding:9px 0;border-bottom:1px solid var(--line);align-items:baseline}
${s('zli')}:last-child{border-bottom:0}
${s('zli')} .n{font-family:var(--fd);font-weight:800;font-size:14px;color:var(--z2)}
${s('zli')} h4{font-family:var(--fd);font-weight:600;font-size:14.5px;line-height:1.28;margin:0;color:var(--ink)}
${s('zli')}:hover h4{color:var(--p)}
${s('zsech')}{display:flex;align-items:center;gap:12px;margin:32px 0 4px}
${s('zsech')} h1,${s('zsech')} h2{font-family:var(--fd);font-weight:800;font-size:19px;letter-spacing:.02em;margin:0;color:var(--ink);white-space:nowrap}
${s('zsech')} .zln{flex:1;height:1px;background:var(--ink)}
${s('zart')}{display:grid;grid-template-columns:minmax(0,1fr) 268px;gap:38px;align-items:start}
${s('zcol')}{max-width:66ch;min-width:0}
${s('zahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--p);margin-bottom:11px}
${s('zahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(27px,4vw,44px);line-height:1.08;letter-spacing:-.024em;margin:0 0 14px;color:var(--ink)}
${s('zdek')}{font-size:18px;line-height:1.55;color:var(--dek);margin:0 0 18px}
${s('zfig')}{margin:20px 0 26px}
${s('zfig')} img{width:100%;height:auto;display:block;border-radius:var(--rad)}
${s('zfig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px;font-style:italic}
${s('zbody')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('zbody')} p{margin:0 0 21px}
${s('zbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('zbody')} h2{font-family:var(--fd);font-weight:800;font-size:24px;letter-spacing:-.012em;margin:32px 0 12px;color:var(--ink)}
${s('zbody')} h3{font-family:var(--fd);font-weight:700;font-size:19px;margin:24px 0 10px}
${s('zbody')} ul,${s('zbody')} ol{margin:0 0 21px;padding-left:22px}
${s('zbody')} li{margin:0 0 8px}
${s('zbody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('zbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('zbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('zbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('zbody')} table caption{display:none}
  ${s('zbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('zbody')} table tbody,${s('zbody')} table tr,
  ${s('zbody')} table th,${s('zbody')} table td{display:block;width:auto}
  ${s('zbody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('zbody')} table tbody th,${s('zbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('zbody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('zbody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('zbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('zbody')} th,${s('zbody')} td{border:1px solid var(--line);padding:9px 11px;text-align:left}
${s('zbody')} th{background:var(--surface);font-family:var(--fb);font-weight:700}
${s('zbody')} blockquote{margin:24px 0;padding:0 0 0 20px;border-left:4px solid var(--z2);font-family:var(--fd);font-size:20px;line-height:1.45}
${s('zrel')}{margin-top:40px;padding-top:6px;border-top:2px solid var(--ink)}
${s('zfoot')}{margin-top:50px;padding:30px 0 20px;border-top:1px solid var(--line);background:var(--surface);font-size:13.5px;color:var(--muted)}
${s('zfoot')} .zcols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:30px}
${s('zfoot')} .zfb{font-family:var(--fd);font-weight:800;font-size:21px;letter-spacing:-.02em;color:var(--ink)}
${s('zfoot')} .zfh{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:var(--ink);margin-bottom:10px}
${s('zfoot')} a{display:block;color:var(--muted);padding:3px 0}
${s('zfoot')} a:hover{color:var(--p)}
${s('zfoot')} .zcp{margin-top:22px;padding-top:14px;border-top:1px solid var(--line);font-size:12.5px}
@media(max-width:900px){
${s('zcaderno')},${s('zart')}{grid-template-columns:1fr;gap:28px}
${s('zlado')}{position:static}
${s('zfoot')} .zcols{grid-template-columns:1fr;gap:22px}
}
@media(max-width:520px){${s('zmat')}{grid-template-columns:104px minmax(0,1fr);gap:14px}${s('zcaixa')}{display:none}}`;
}

function zHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  const nome = H.esc(site.shortName || site.name);
  const marca = nome.replace(/(\S+)$/, '<s>$1</s>');
  return `<body>
<header class="${c('ztopo')}"><div class="${c('zwrap')}">
<a class="${c('zbrand')}" href="/">${marca}</a>
<span class="${c('zcaixa')}">${H.dateFull()}</span>
</div></header>
<nav class="${c('znavbar')}"><div class="${c('zwrap')}">${links}</div></nav>`;
}

function zFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('zfoot')}"><div class="${c('zwrap')}">
<div class="zcols">
<div><div class="zfb">${H.esc(site.name)}</div><p style="margin:11px 0 0;max-width:40ch;line-height:1.55">${H.esc(site.description || '')}</p></div>
<div><div class="zfh">Editorias</div>${cats}</div>
<div><div class="zfh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="zcp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function zMat(ctx, a) {
  const { c, H } = ctx;
  const temFoto = !!a.image;
  return `<a class="${c('zmat')}${temFoto ? '' : ' ' + c('zsemfoto')} ${c('reveal')}" href="${H.url(a)}">
${temFoto ? `<span class="zph">${H.pic(a, false)}</span>` : ''}
<span><span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 140))}</p>` : ''}</span></a>`;
}

function zLado(ctx, itens) {
  const { c, H } = ctx;
  if (!itens.length) return '';
  return `<aside class="${c('zlado')}">
<div class="${c('zbox')}">
<div class="${c('zboxh')}">Mais lidas</div>
${itens.map((a, i) => `<a class="${c('zli')}" href="${H.url(a)}">
<span class="n">${i + 1}</span><span><h4>${H.esc(a.title)}</h4></span></a>`).join('')}
</div></aside>`;
}

function zHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const abre = arts[0];
  const corpo = arts.slice(1, site.postsOnHome || 60);
  const lado = arts.slice(1, 8);
  const abreHtml = abre ? `<a class="${c('zabre')}" href="${H.url(abre)}">
${abre.image ? `<span class="zph">${H.pic(abre, true)}</span>` : ''}
<span class="k">${H.cat(abre)}</span><h2>${H.esc(abre.title)}</h2>
${abre.excerpt ? `<p>${H.esc(H.clip(abre.excerpt, 190))}</p>` : ''}</a>` : '';
  const blocos = [];
  for (let i = 0; i < corpo.length; i += 8) {
    const fatia = corpo.slice(i, i + 8);
    const titulo = fatia[0] ? H.cat(fatia[0]) : 'Mais notícias';
    blocos.push(`<div class="${c('zsech')}"><h2>${titulo}</h2><span class="zln"></span></div>
${fatia.map(a => zMat(ctx, a)).join('')}`);
  }
  return `${H.head(ctx, H.homeMeta(site))}
${zHeader(ctx, menu)}
<main><div class="${c('zwrap')}">
${H.h1(ctx)}
<div class="${c('zcaderno')}">
<div>${abreHtml}${blocos.join('')}</div>
${zLado(ctx, lado)}
</div>
</div></main>
${zFooter(ctx, menu)}`;
}

function zArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('zfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('zrel')}">
<div class="${c('zsech')}"><h2>Leia também</h2><span class="zln"></span></div>
${related.map(a => zMat(ctx, a)).join('')}</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${zHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('zwrap')}">
<div class="${c('zart')}">
<article class="${c('zcol')}">
${H.crumbs(ctx, art, P)}
<div class="${c('zahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<p class="${c('zdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('zbody')}">${art.content}</div>
${H.share(ctx, P)}
${rel}
</article>
${zLado(ctx, related || [])}
</div>
</div></main>
${zFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function zList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${zHeader(ctx, opts.menu)}
<main><div class="${c('zwrap')}">
<div class="${c('zcaderno')}">
<div>
<div class="${c('zsech')}" style="margin-top:22px"><h1>${H.esc(opts.title)}</h1><span class="zln"></span></div>
${opts.items.map(a => zMat(ctx, a)).join('')}
</div>
${zLado(ctx, opts.items.slice(0, 7))}
</div>
</div></main>
${zFooter(ctx, opts.menu)}`;
}

/* ===================== ARCH AA =====================
 * Decima quinta e ultima do lote de 18/08/2026, servidor
 * hostinger-vps-srv1166087. Fecha o conjunto M..AA.
 *
 * Arquetipo: FICHARIO. Cada materia e uma ficha com faixa de cor no topo e
 * borda fina, e as fichas se organizam num mosaico de altura variavel em
 * colunas de massa (CSS multi-column), do jeito que um mural de recortes se
 * comporta. A ficha de abertura atravessa a largura toda antes do mural. Sem
 * foto obrigatoria: a ficha sem imagem fica so com a faixa e o texto, e nao
 * abre buraco no mural.
 *
 * O uso de column-count no lugar de grid e proposital: com fichas de alturas
 * diferentes, o grid deixa vao embaixo das mais curtas, e a coluna de massa
 * encaixa sozinha.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function aaCss(ctx) {
  const { s } = ctx;
  const p2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--aa2:${p2}}
${s('aawrap')}{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 24px}
${s('aatopo')}{position:sticky;top:0;z-index:45;background:var(--paper);border-bottom:1px solid var(--line)}
${s('aatopo')} ${s('aawrap')}{display:flex;align-items:center;gap:22px;min-height:62px;flex-wrap:wrap}
${s('aabrand')}{font-family:var(--fd);font-weight:800;font-size:clamp(21px,2.7vw,29px);letter-spacing:-.014em;color:var(--ink);white-space:nowrap;position:relative;padding-bottom:3px}
${s('aabrand')}::after{content:"";position:absolute;left:0;right:0;bottom:0;height:4px;background:linear-gradient(90deg,var(--p) 0,var(--p) 55%,var(--aa2) 55%,var(--aa2) 100%)}
${s('aanav')}{flex:1 1 auto;min-width:0;display:flex;gap:18px;overflow-x:auto;scrollbar-width:none}
${s('aanav')}::-webkit-scrollbar{display:none}
${s('aanav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.09em;color:var(--muted);white-space:nowrap}
${s('aanav')} a:hover{color:var(--p)}
main{padding:24px 0 8px}
${s('aaabre')}{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:30px;align-items:center;border:1px solid var(--line);border-top:5px solid var(--p);border-radius:var(--rad-lg);padding:22px;margin-bottom:26px}
${s('aaabre')} .aaph{aspect-ratio:16/10;overflow:hidden;border-radius:var(--rad);background:var(--ph)}
${s('aaabre')} .aaph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
${s('aaabre')}:hover .aaph img{transform:scale(1.04)}
${s('aaabre')} .k{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--p)}
${s('aaabre')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(24px,3.5vw,40px);line-height:1.08;letter-spacing:-.024em;margin:9px 0 0;color:var(--ink)}
${s('aaabre')}:hover h2{color:var(--p)}
${s('aaabre')} p{margin:11px 0 0;color:var(--dek);font-size:16px;line-height:1.55}
${s('aamural')}{column-count:3;column-gap:20px}
${s('aaficha')}{display:block;break-inside:avoid;border:1px solid var(--line);border-top:4px solid var(--aa2);border-radius:var(--rad);padding:14px 15px 15px;margin:0 0 20px;background:var(--paper)}
${s('aaficha')}:hover{border-color:var(--p);border-top-color:var(--p)}
${s('aaficha')} .aaph{aspect-ratio:16/10;overflow:hidden;border-radius:3px;background:var(--ph);margin-bottom:11px}
${s('aaficha')} .aaph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
${s('aaficha')}:hover .aaph img{transform:scale(1.05)}
${s('aaficha')} .k{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.15em;color:var(--muted)}
${s('aaficha')} h3{font-family:var(--fd);font-weight:700;font-size:17.5px;line-height:1.22;letter-spacing:-.01em;margin:6px 0 0;color:var(--ink)}
${s('aaficha')}:hover h3{color:var(--p)}
${s('aaficha')} p{margin:8px 0 0;color:var(--dek);font-size:13.5px;line-height:1.5}
${s('aasech')}{display:flex;align-items:center;gap:12px;margin:30px 0 18px}
${s('aasech')} h1,${s('aasech')} h2{font-family:var(--fd);font-weight:800;font-size:20px;letter-spacing:-.008em;margin:0;color:var(--ink);white-space:nowrap}
${s('aasech')} .aaln{flex:1;height:4px;background:linear-gradient(90deg,var(--p) 0,var(--p) 40%,var(--aa2) 40%,var(--aa2) 70%,var(--line) 70%)}
${s('aaart')}{max-width:68ch;margin:0 auto;padding:26px 0 8px}
${s('aaahead')}{border-top:5px solid var(--p);padding-top:18px}
${s('aaahead')} .k{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--p);margin-bottom:11px}
${s('aaahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,4.2vw,45px);line-height:1.08;letter-spacing:-.024em;margin:0 0 14px;color:var(--ink)}
${s('aadek')}{font-size:18.5px;line-height:1.55;color:var(--dek);margin:0 0 18px}
${s('aafig')}{margin:22px 0 28px}
${s('aafig')} img{width:100%;height:auto;display:block;border-radius:var(--rad)}
${s('aafig')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px;font-style:italic}
${s('aabody')}{font-size:calc(var(--fs) + 1px);line-height:1.78;color:var(--ink)}
${s('aabody')} p{margin:0 0 21px}
${s('aabody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('aabody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.012em;margin:34px 0 12px;color:var(--ink);padding-top:10px;border-top:3px solid var(--aa2)}
${s('aabody')} h3{font-family:var(--fd);font-weight:700;font-size:19.5px;margin:26px 0 10px}
${s('aabody')} ul,${s('aabody')} ol{margin:0 0 21px;padding-left:22px}
${s('aabody')} li{margin:0 0 8px}
${s('aabody')} img{max-width:100%;height:auto;border-radius:var(--rad)}
${s('aabody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('aabody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('aabody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('aabody')} table caption{display:none}
  ${s('aabody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('aabody')} table tbody,${s('aabody')} table tr,
  ${s('aabody')} table th,${s('aabody')} table td{display:block;width:auto}
  ${s('aabody')} table tbody tr{background:rgba(255,255,255,.6);border:1px solid rgba(0,0,0,.12);
    border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('aabody')} table tbody th,${s('aabody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('aabody')} table tbody th{border-bottom:1px solid rgba(0,0,0,.12);padding:13px 0 11px;
    font-weight:700;text-align:left}
  ${s('aabody')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
  ${s('aabody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.62;margin-bottom:2px}
}
${s('aabody')} th,${s('aabody')} td{border:1px solid var(--line);padding:9px 11px;text-align:left}
${s('aabody')} th{background:var(--surface);font-family:var(--fb);font-weight:700}
${s('aabody')} blockquote{margin:26px 0;padding:16px 20px;border:1px solid var(--line);border-top:4px solid var(--aa2);border-radius:var(--rad);font-family:var(--fd);font-size:20px;line-height:1.45}
${s('aarel')}{margin-top:42px}
${s('aafoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:52px;padding:32px 0 20px}
${s('aafoot')} .aacols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:30px}
${s('aafoot')} .aafb{font-family:var(--fd);font-weight:800;font-size:22px;letter-spacing:-.014em;color:#fff}
${s('aafoot')} .aafh{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;color:#fff;margin-bottom:10px}
${s('aafoot')} a{display:block;color:var(--footer-tx);font-size:14px;padding:3px 0}
${s('aafoot')} a:hover{color:#fff}
${s('aafoot')} .aacp{margin-top:24px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:12.5px;opacity:.82}
@media(max-width:960px){${s('aamural')}{column-count:2}${s('aaabre')}{grid-template-columns:1fr;gap:16px}}
@media(max-width:600px){${s('aamural')}{column-count:1}${s('aafoot')} .aacols{grid-template-columns:1fr;gap:22px}}`;
}

function aaHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const links = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('aatopo')}"><div class="${c('aawrap')}">
<a class="${c('aabrand')}" href="/">${H.esc(site.shortName || site.name)}</a>
<nav class="${c('aanav')}">${links}</nav>
</div></header>`;
}

function aaFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="/${H.esc(x.slug)}/">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('aafoot')}"><div class="${c('aawrap')}">
<div class="aacols">
<div><div class="aafb">${H.esc(site.name)}</div><p style="margin:11px 0 0;max-width:38ch;font-size:14px;line-height:1.55;opacity:.85">${H.esc(site.description || '')}</p></div>
<div><div class="aafh">Editorias</div>${cats}</div>
<div><div class="aafh">Institucional</div>${H.instLinks()}</div>
</div>
<div class="aacp">&copy; ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>
${H.bodyEnd()}`;
}

function aaFicha(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('aaficha')} ${c('reveal')}" href="${H.url(a)}">
${a.image ? `<span class="aaph">${H.pic(a, false)}</span>` : ''}
<span class="k">${H.cat(a)}</span><h3>${H.esc(a.title)}</h3>
${a.excerpt ? `<p>${H.esc(H.clip(a.excerpt, 112))}</p>` : ''}</a>`;
}

function aaHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const abre = arts[0];
  const resto = arts.slice(1, site.postsOnHome || 60);
  const abreHtml = abre ? `<a class="${c('aaabre')}" href="${H.url(abre)}">
<span><span class="k">${H.cat(abre)}</span><h2>${H.esc(abre.title)}</h2>
${abre.excerpt ? `<p>${H.esc(H.clip(abre.excerpt, 180))}</p>` : ''}</span>
${abre.image ? `<span class="aaph">${H.pic(abre, true)}</span>` : ''}</a>` : '';
  const blocos = [];
  for (let i = 0; i < resto.length; i += 12) {
    const fatia = resto.slice(i, i + 12);
    const titulo = fatia[0] ? H.cat(fatia[0]) : 'Mais notícias';
    blocos.push(`<section><div class="${c('aasech')}"><h2>${titulo}</h2><span class="aaln"></span></div>
<div class="${c('aamural')}">${fatia.map(a => aaFicha(ctx, a)).join('')}</div></section>`);
  }
  return `${H.head(ctx, H.homeMeta(site))}
${aaHeader(ctx, menu)}
<main><div class="${c('aawrap')}">
${H.h1(ctx)}
${abreHtml}
${blocos.join('')}
</div></main>
${aaFooter(ctx, menu)}`;
}

function aaArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('aafig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('aarel')}">
<div class="${c('aasech')}"><h2>Leia também</h2><span class="aaln"></span></div>
<div class="${c('aamural')}">${related.map(a => aaFicha(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${aaHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('aawrap')}">
<article class="${c('aaart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('aaahead')}">
<span class="k"><a href="/${H.esc(P.catSlug)}/">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
</div>
${art.dek ? `<p class="${c('aadek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('aabody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${aaFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

function aaList(ctx, opts) {
  const { c, H } = ctx;
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${aaHeader(ctx, opts.menu)}
<main><div class="${c('aawrap')}">
<div class="${c('aasech')}" style="margin-top:24px"><h1>${H.esc(opts.title)}</h1><span class="aaln"></span></div>
<div class="${c('aamural')}">${opts.items.map(a => aaFicha(ctx, a)).join('')}</div>
</div></main>
${aaFooter(ctx, opts.menu)}`;
}

const ARCHS = {
  AA: { letter: 'AA', css: aaCss, header: aaHeader, footer: aaFooter, home: aaHome, article: aaArticle, list: aaList },
  Z: { letter: 'Z', css: zCss, header: zHeader, footer: zFooter, home: zHome, article: zArticle, list: zList },
  Y: { letter: 'Y', css: yCss, header: yHeader, footer: yFooter, home: yHome, article: yArticle, list: yList },
  X: { letter: 'X', css: xCss, header: xHeader, footer: xFooter, home: xHome, article: xArticle, list: xList },
  W: { letter: 'W', css: wCss, header: wHeader, footer: wFooter, home: wHome, article: wArticle, list: wList },
  V: { letter: 'V', css: vCss, header: vHeader, footer: vFooter, home: vHome, article: vArticle, list: vList },
  U: { letter: 'U', css: uCss, header: uHeader, footer: uFooter, home: uHome, article: uArticle, list: uList },
  T: { letter: 'T', css: tCss, header: tHeader, footer: tFooter, home: tHome, article: tArticle, list: tList },
  S: { letter: 'S', css: sCss, header: sHeader, footer: sFooter, home: sHome, article: sArticle, list: sList },
  R: { letter: 'R', css: rCss, header: rHeader, footer: rFooter, home: rHome, article: rArticle, list: rList },
  Q: { letter: 'Q', css: qCss, header: qHeader, footer: qFooter, home: qHome, article: qArticle, list: qList },
  P: { letter: 'P', css: pCss, header: pHeader, footer: pFooter, home: pHome, article: pArticle, list: pList },
  O: { letter: 'O', css: oCss, header: oHeader, footer: oFooter, home: oHome, article: oArticle, list: oList },
  N: { letter: 'N', css: nCss, header: nHeader, footer: nFooter, home: nHome, article: nArticle, list: nList },
  M: { letter: 'M', css: mCss, header: mHeader, footer: mFooter, home: mHome, article: mArticle, list: mList },
  A: { letter: 'A', css: aCss, header: aHeader, footer: aFooter, home: aHome, article: aArticle, list: aList },
  B: { letter: 'B', css: bCss, header: bHeader, footer: bFooter, home: bHome, article: bArticle, list: bList },
  C: { letter: 'C', css: cCss, header: cHeader, footer: cFooter, home: cHome, article: cArticle, list: cList },
  D: { letter: 'D', css: dCss, header: dHeader, footer: dFooter, home: dHome, article: dArticle, list: dList },
  E: { letter: 'E', css: eCss, header: eHeader, footer: eFooter, home: eHome, article: eArticle, list: eList },
  F: { letter: 'F', css: fCss, header: fHeader, footer: fFooter, home: fHome, article: fArticle, list: fList },
  G: { letter: 'G', css: gCss, header: gHeader, footer: gFooter, home: gHome, article: gArticle, list: gList },
  H: { letter: 'H', css: hCss, header: hHeader, footer: hFooter, home: hHome, article: hArticle, list: hList },
  I: { letter: 'I', css: iCss, header: iHeader, footer: iFooter, home: iHome, article: iArticle, list: iList },
  J: { letter: 'J', css: jCss, header: jHeader, footer: jFooter, home: jHome, article: jArticle, list: jList },
  L: { letter: 'L', css: lCss, header: lHeader, footer: lFooter, home: lHome, article: lArticle, list: lList },
  K: { letter: 'K', css: kCss, header: kHeader, footer: kFooter, home: kHome, article: kArticle, list: kList },
};
function getArch(letter) { return ARCHS[letter] || ARCHS.A; }

module.exports = { ARCHS, getArch };
