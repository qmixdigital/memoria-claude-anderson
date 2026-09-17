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
  return `<aside class="${c('nrail')}">
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

