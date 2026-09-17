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
  return `<header class="${c('ttop')}"><div class="${c('twrap')}">
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

