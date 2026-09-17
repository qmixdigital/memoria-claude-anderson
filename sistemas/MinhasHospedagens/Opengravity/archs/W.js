/* ===================== ARCH W =====================
 * Criada em 20/08/2026 para a Revista QMIX (qmixdigital.com.br), opengravity.
 *
 * Arquetipo: REVISTA. Cabecalho claro com filete pesado, marca em Syne com a
 * segunda palavra em carmim. A abertura e capa de revista: materia grande a
 * esquerda, com a foto por cima do titulo, e uma coluna numerada a direita, sem
 * imagem, que e o que a separa da vizinha V.
 *
 * Logo abaixo vem a FAIXA DE FERRAMENTAS, que neste portal nao e enfeite: as 38
 * paginas de /ferramentas/ respondem por 98,6% do trafego medido no Search
 * Console. Ela sai das proprias extraPages, sem campo novo de configuracao.
 *
 * Duas escolhas deliberadas, contra o que as outras arquiteturas fazem:
 *   - **sem `text-transform` em lugar nenhum**, exceto a marca. Editoria sai
 *     como o WordPress gravou, em caixa alta e baixa
 *   - secoes em quatro colunas e bloco final em tres, invertendo a V
 *
 * `flatUrl` e false aqui: o artigo mora em /<categoria>/<slug>/. Todo link de
 * editoria sai de H.curl, nunca montado na mao.
 *
 * Editar AQUI e mandar para o servidor, nunca o contrario.
 */
function wCss(ctx) {
  const { s } = ctx;
  const a2 = (ctx.site.theme && ctx.site.theme.accent2) || 'var(--p)';
  return `
:root{--w2:${a2};--wmax:1240px}
${s('wwrap')}{width:100%;max-width:var(--wmax);margin:0 auto;padding:0 28px}

/* ---------- cabecalho ---------- */
${s('wtopo')}{background:var(--paper);border-bottom:3px solid var(--p)}
${s('wtopo')} ${s('wwrap')}{display:flex;align-items:center;gap:22px;min-height:76px;flex-wrap:wrap}
${s('wmarca')}{display:block;margin-right:auto;text-decoration:none;
  --marca-1:var(--ink);--marca-2:var(--w2)}
${s('wmarca')} svg{display:block;height:clamp(21px,2.5vw,29px);width:auto}
${s('wnav')}{display:flex;gap:20px;flex-wrap:wrap}
${s('wnav')} a{font-family:var(--fb);font-size:14px;font-weight:600;color:var(--dek);text-decoration:none;padding:6px 0;
  border-bottom:2px solid transparent}
${s('wnav')} a:hover{color:var(--p);border-bottom-color:var(--p)}
${s('wham')}{display:none;width:46px;height:46px;align-items:center;justify-content:center;background:none;
  border:1px solid var(--line);cursor:pointer;color:var(--ink)}
${s('wham')} i{display:block;width:19px;height:2px;background:currentColor;position:relative}
${s('wham')} i::before,${s('wham')} i::after{content:"";position:absolute;left:0;width:19px;height:2px;background:currentColor}
${s('wham')} i::before{top:-6px}${s('wham')} i::after{top:6px}

/* ---------- abertura, capa de revista ---------- */
${s('wcapa')}{display:grid;grid-template-columns:minmax(0,1.62fr) minmax(0,1fr);gap:40px;
  margin:34px 0 0;padding-bottom:34px;border-bottom:1px solid var(--line)}
${s('wabre')}{display:block;text-decoration:none;color:inherit}
${s('wabre')} span[data-f]{display:block;position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:var(--ph)}
${s('wabre')} span[data-f] img{width:100%;height:100%;object-fit:cover;display:block}
${s('wkick')}{display:inline-block;font-family:var(--fd);font-weight:700;font-size:11.5px;letter-spacing:.1em;
  color:var(--w2);margin:17px 0 9px}
${s('wabre')} h2{font-family:var(--fd);font-weight:800;font-size:clamp(27px,3.7vw,41px);line-height:1.06;
  letter-spacing:-.028em;margin:0;color:var(--ink)}
${s('wabre')}:hover h2{color:var(--p)}
${s('wabre')} p{font-family:var(--fb);font-size:16px;line-height:1.62;color:var(--dek);margin:13px 0 0;max-width:62ch}

/* coluna numerada, sem foto: e o que distingue esta abertura da vizinha */
${s('wnum')}{border-top:3px solid var(--ink);padding-top:15px}
${s('wnum')} > b{display:block;font-family:var(--fd);font-weight:800;font-size:14px;letter-spacing:-.01em;
  color:var(--ink);margin-bottom:4px}
${s('wnum')} a{display:grid;grid-template-columns:34px minmax(0,1fr);gap:0 13px;align-items:start;
  padding:16px 0;border-bottom:1px solid var(--line);text-decoration:none;color:inherit}
${s('wnum')} a:last-child{border-bottom:0}
${s('wnum')} em{font-style:normal;font-family:var(--fd);font-weight:700;font-size:25px;line-height:.9;
  color:var(--p);opacity:.32;transition:opacity .18s}
${s('wnum')} a:hover em{opacity:1}
${s('wnum')} h3{font-family:var(--fd);font-weight:700;font-size:16px;line-height:1.26;letter-spacing:-.012em;
  margin:0;color:var(--ink)}
${s('wnum')} a:hover h3{color:var(--p)}
${s('wnum')} time{display:block;font-family:var(--fb);font-size:12px;color:var(--muted);margin-top:6px}

/* ---------- faixa de ferramentas ---------- */
${s('wferr')}{background:var(--footer-bg);color:var(--footer-tx);margin:34px 0 0;padding:26px 0 28px}
${s('wferr')} ${s('wwrap')}{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}
${s('wferr')} > ${s('wwrap')} > div:first-child{flex:0 0 214px}
${s('wferr')} strong{display:block;font-family:var(--fd);font-weight:800;font-size:19px;line-height:1.15;color:#fff}
${s('wferr')} small{display:block;font-family:var(--fb);font-size:13px;line-height:1.5;margin-top:7px;opacity:.82}
${s('wpills')}{flex:1 1 380px;display:flex;flex-wrap:wrap;gap:9px}
${s('wpills')} a{font-family:var(--fb);font-size:13.5px;font-weight:500;color:var(--footer-tx);text-decoration:none;
  padding:8px 14px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.04)}
${s('wpills')} a:hover{background:var(--w2);border-color:var(--w2);color:#fff}
${s('wpills')} a[data-todas]{border-color:var(--w2);color:#fff;font-weight:600}

/* ---------- secoes ---------- */
${s('wsec')}{margin:40px 0 0}
${s('wsech')}{display:flex;align-items:flex-end;gap:16px;margin:0 0 22px;
  padding-top:14px;border-top:1px solid var(--line);position:relative}
${s('wsech')}::before{content:"";position:absolute;top:-1px;left:0;width:56px;height:3px;background:var(--p)}
${s('wsech')} h2,${s('wsech')} h1{font-family:var(--fd);font-weight:700;font-size:clamp(21px,2.6vw,29px);
  line-height:1.06;letter-spacing:-.028em;margin:0;color:var(--ink)}
${s('wsech')} b{flex:1}
${s('wsech')} a{font-family:var(--fb);font-size:13px;font-weight:600;color:var(--muted);text-decoration:none;
  white-space:nowrap;padding-bottom:3px;border-bottom:1px solid transparent;transition:color .18s,border-color .18s}
${s('wsech')} a:hover{color:var(--p);border-bottom-color:var(--p)}
${s('wgrid')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:26px 22px}
${s('wtres')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px 22px}

/* ---------- cartao ---------- */
${s('wcard')}{display:block;text-decoration:none;color:inherit}
${s('wcard')} span[data-f]{display:block;position:relative;width:100%;aspect-ratio:3/2;overflow:hidden;background:var(--ph)}
${s('wcard')} span[data-f] img{width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .5s cubic-bezier(.2,.7,.3,1)}
${s('wcard')}:hover span[data-f] img{transform:scale(1.045)}
${s('wcard')} ${s('wkick')}{margin:13px 0 6px;font-size:11px}
${s('wcard')} h2,${s('wcard')} h3{font-family:var(--fd);font-weight:600;font-size:16.5px;line-height:1.26;
  letter-spacing:-.016em;margin:0;color:var(--ink);transition:color .18s}
${s('wcard')}:hover h2,${s('wcard')}:hover h3{color:var(--p)}
${s('wcard')} time{display:block;font-family:var(--fb);font-size:12px;color:var(--muted);margin-top:9px}

/* o primeiro da editoria ocupa duas colunas: e o que da hierarquia a secao */
${s('wdest')}{grid-column:span 2;grid-row:span 2;display:flex;flex-direction:column}
${s('wdest')} span[data-f]{aspect-ratio:16/10;flex:none}
${s('wdest')} h2,${s('wdest')} h3{font-size:clamp(19px,2.1vw,25px);line-height:1.12;letter-spacing:-.025em;margin-top:2px}
${s('wdest')} p{font-family:var(--fb);font-size:15px;line-height:1.6;color:var(--dek);margin:10px 0 0;max-width:54ch}

/* ---------- artigo ---------- */
${s('wart')}{max-width:760px;margin:32px 0 0}
${s('wahead')} h1{font-family:var(--fd);font-weight:800;font-size:clamp(28px,4vw,43px);line-height:1.05;
  letter-spacing:-.03em;margin:9px 0 0;color:var(--ink)}
${s('wdek')}{font-family:var(--fb);font-size:18px;line-height:1.58;color:var(--dek);margin:15px 0 0;max-width:64ch}
${s('wfig')}{margin:26px 0 0}
${s('wfig')} img{width:100%;height:auto;display:block}
${s('wfig')} figcaption{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin-top:9px}
${s('wbody')}{font-family:var(--fb);font-size:17.5px;line-height:1.78;color:var(--ink);margin:26px 0 0}
${s('wbody')} p{margin:0 0 21px}
${s('wbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;line-height:1.18;letter-spacing:-.02em;
  margin:36px 0 14px;padding-left:14px;border-left:4px solid var(--p)}
${s('wbody')} h3{font-family:var(--fd);font-weight:700;font-size:20px;line-height:1.24;margin:28px 0 11px}
${s('wbody')} a{color:var(--p);text-decoration:underline;text-underline-offset:3px}
${s('wbody')} a:hover{color:var(--w2)}
${s('wbody')} img{max-width:100%;height:auto;display:block;margin:22px 0}
${s('wbody')} ul,${s('wbody')} ol{margin:0 0 21px;padding-left:23px}
${s('wbody')} li{margin:0 0 9px}
${s('wbody')} blockquote{margin:26px 0;padding:4px 0 4px 20px;border-left:4px solid var(--w2);
  font-family:var(--fd);font-size:20px;line-height:1.44;color:var(--ink)}
${s('wbody')} table{width:100%;border-collapse:collapse;margin:24px 0;font-size:15.5px}
${s('wbody')} table caption{text-align:left;font-family:var(--fb);font-size:13px;color:var(--muted);padding-bottom:9px}
${s('wbody')} table th,${s('wbody')} table td{border:0;border-bottom:1px solid var(--line);padding:11px 13px;text-align:left;vertical-align:top}
${s('wbody')} table thead th{background:transparent;font-family:var(--fd);font-weight:700;border-bottom:2px solid var(--ink)}

/* ---------- blocos do conteudo: aviso de valores e "veja tambem" ---------- */
${s('wbody')} .qmix-aviso{margin:22px 0;padding:14px 17px;border-left:3px solid var(--w2);
  background:rgba(0,0,0,.028);font-size:15px;line-height:1.55}
${s('wbody')} .qmix-veja{list-style:none;margin:0 0 21px;padding:0;
  display:grid;gap:9px}
${s('wbody')} .qmix-veja li{margin:0;padding-left:16px;position:relative}
${s('wbody')} .qmix-veja li::before{content:"";position:absolute;left:0;top:.62em;
  width:6px;height:6px;background:var(--w2);border-radius:50%}

/* ---------- tabela vira cartao no celular ---------- */
/* sem isto a tabela de faixas de preco sai da tela e ninguem descobre o gesto de
   arrastar. o thead continua no DOM, fora da tela, para o leitor de tela achar */
@media(max-width:640px){
  ${s('wbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('wbody')} table{min-width:0;margin:20px 0;font-size:15px}
  ${s('wbody')} table caption{display:none}
  ${s('wbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('wbody')} table,${s('wbody')} table tbody,${s('wbody')} table tr,
  ${s('wbody')} table th,${s('wbody')} table td{display:block;width:auto}
  ${s('wbody')} table tbody tr{background:#fff;border:1px solid var(--line);border-radius:13px;
    padding:2px 18px 16px;margin-bottom:13px}
  /* o passo que se esquece: zerar borda e fundo herdados da regra de cima,
     senao sobra risco vertical cortando o cartao */
  ${s('wbody')} table tbody th,${s('wbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('wbody')} table tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;
    font-family:var(--fd);font-weight:700;font-size:16px}
  ${s('wbody')} table tbody td{padding:13px 0 0;text-align:left;line-height:1.5}
  ${s('wbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);
    margin-bottom:2px}
}
${s('wrel')}{margin:44px 0 0;padding-top:30px;border-top:3px solid var(--ink);max-width:760px}

/* ---------- rodape ---------- */
${s('wfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:52px;padding:42px 0 28px;
  font-family:var(--fb);font-size:14px}
${s('wcols')}{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:34px}
${s('wfb')}{--marca-1:#fff;--marca-2:${a2}}
${s('wfb')} svg{display:block;height:24px;width:auto}
${s('wfh')}{font-family:var(--fd);font-size:13px;font-weight:700;letter-spacing:-.01em;color:#fff;margin-bottom:11px}
${s('wfoot')} a{display:block;color:var(--footer-tx);text-decoration:none;padding:3px 0}
${s('wfoot')} a:hover{color:#fff}
${s('wcp')}{margin-top:28px;padding-top:16px;border-top:1px solid rgba(255,255,255,.14);font-size:12.5px;opacity:.85}

/* revelacao contida: so o que esta abaixo da dobra, e nunca com movimento
   grande, que atrapalha a leitura em vez de ajudar */
@media(prefers-reduced-motion:no-preference){
${s('reveal')}{opacity:0;transform:translateY(12px);animation:wsobe .5s cubic-bezier(.2,.7,.3,1) forwards}
${s('wsec')}:nth-of-type(1) ${s('reveal')}{animation-delay:.02s}
${s('wsec')}:nth-of-type(2) ${s('reveal')}{animation-delay:.05s}
@keyframes wsobe{to{opacity:1;transform:none}}
}

@media(max-width:1100px){
${s('wham')}{display:flex}
${s('wnav')}{display:none;order:3;width:100%;flex-direction:column;gap:0;padding:0 0 10px;margin-top:4px;
  border-top:1px solid var(--line)}
${s('wnav')}[data-aberto="1"]{display:flex}
${s('wnav')} a{padding:14px 2px;border-bottom:1px solid var(--line);border-top:0}
${s('wgrid')}{grid-template-columns:repeat(3,minmax(0,1fr))}
${s('wdest')}{grid-column:span 3;grid-row:span 1}
${s('wdest')} span[data-f]{aspect-ratio:21/9}
}
@media(max-width:900px){
${s('wcapa')}{grid-template-columns:1fr;gap:30px}
${s('wgrid')},${s('wtres')}{grid-template-columns:repeat(2,minmax(0,1fr))}
${s('wdest')}{grid-column:span 2;grid-row:span 1}
${s('wcols')}{grid-template-columns:1fr 1fr}
}
@media(max-width:640px){
${s('wbody')} table{display:block;min-width:0;width:auto}
${s('wbody')} table caption{display:block;width:auto;padding-bottom:10px}
${s('wbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${s('wbody')} table tbody,${s('wbody')} table tr,${s('wbody')} table th,${s('wbody')} table td{display:block;width:auto}
${s('wbody')} table tbody tr{background:var(--surface);border:1px solid var(--line);padding:2px 18px 16px;margin-bottom:14px}
${s('wbody')} table tbody th,${s('wbody')} table tbody td{border:0;background:transparent}
${s('wbody')} table tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:16px}
${s('wbody')} table tbody td{padding:14px 0 0;text-align:left;line-height:1.55}
${s('wbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-family:var(--fb);font-weight:700;
  font-size:11px;letter-spacing:.05em;color:var(--muted);margin-bottom:3px}
}
@media(max-width:560px){
${s('wgrid')},${s('wtres')}{grid-template-columns:1fr;gap:28px}
${s('wdest')}{grid-column:span 1;grid-row:span 1}
${s('wdest')} span[data-f]{aspect-ratio:3/2}
${s('wcols')}{grid-template-columns:1fr;gap:22px}
${s('wferr')} > ${s('wwrap')} > div:first-child{flex:1 1 100%}
}`;
}

function wHeader(ctx, menu) {
  const { site, c, H } = ctx;
  // link de editoria SEMPRE por H.curl: com categoryBase, montar na mao devolve 404
  const links = (menu || []).map(x => `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  const nome = site.shortName || site.name;
  // logomarca em curvas: sem fonte, sem requisicao, identica em todo navegador
  const marca = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6942 874" role="img" aria-label="Revista QMIX"><g transform="translate(0 770) scale(1 -1)"><g fill="var(--marca-1, currentColor)"><path transform="translate(0 0)" d="M25 700V0H232V195H318L427 0H657L522 241C593 286 635 361 635 448C635 520 609 580 556 628C504 676 439 700 361 700ZM361 510C394 510 420 483 420 448C420 412 394 385 361 385H232V510Z"/><path transform="translate(667 0)" d="M25 700V0H566V190H232V257H499V447H232V510H561V700Z"/><path transform="translate(1248 0)" d="M453 0 734 700H518L368 301L216 700H0L281 0Z"/><path transform="translate(1982 0)" d="M232 0V700H25V0Z"/><path transform="translate(2239 0)" d="M538 532C527 585 496 627 447 660C398 693 341 710 276 710C203 710 144 689 99 648C54 607 32 554 32 487C32 419 57 366 101 331C146 296 182 280 238 260L276 248C293 243 306 238 313 235L339 225C359 217 365 209 365 200C365 184 339 172 307 172C264 172 229 194 221 223L10 187C25 128 59 80 113 44C168 8 232 -10 306 -10C385 -10 449 11 498 52C547 94 572 150 572 220C572 287 548 341 505 374C462 409 424 426 371 443C350 450 310 461 293 466L265 476C246 484 239 493 239 504C239 519 256 529 280 529C305 529 328 517 333 498Z"/><path transform="translate(2796 0)" d="M197 510V0H404V510H587V700H15V510Z"/><path transform="translate(3308 0)" d="M424 270H321L373 402ZM744 0 458 700H286L0 0H216L251 90H493L528 0Z"/></g><g fill="var(--marca-2, #be123c)"><path transform="translate(4302 0)" d="M392 -10C453 -10 510 3 564 28L636 -44L766 86L704 148C744 208 764 275 764 350C764 452 728 537 657 606C586 675 498 710 392 710C287 710 198 675 127 606C56 537 20 452 20 350C20 248 56 162 127 93C198 24 287 -10 392 -10ZM236 351C236 396 251 434 281 465C311 496 348 512 392 512C437 512 474 496 504 465C534 434 549 396 549 351C549 338 547 323 544 308L465 387L335 257L403 189C304 189 236 252 236 351Z"/><path transform="translate(5086 0)" d="M227 0V319L362 66H499L634 319V0H836V700H634L431 338L227 700H25V0Z"/><path transform="translate(5947 0)" d="M232 0V700H25V0Z"/><path transform="translate(6204 0)" d="M246 357 0 0H246L369 179L492 0H738L492 357L728 700H482L369 536L256 700H10Z"/></g></g></svg>`;
  const idMenu = c('wnav') + '-m';
  return `<header class="${c('wtopo')}"><div class="${c('wwrap')}">
<a class="${c('wmarca')}" href="/">${marca}</a>
<button class="${c('wham')}" type="button" data-wham aria-expanded="false" aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<nav class="${c('wnav')}" id="${idMenu}" aria-label="Editorias">${links}</nav>
</div></header>
<script>(function(){var b=document.querySelector('[data-wham]'),n=document.getElementById('${idMenu}');if(!b||!n)return;
b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

/* A faixa sai das proprias paginas extras, filtrando o prefixo do caminho.
   Sem campo novo no sites.json e sem lista escrita a mao que envelhece. */
function wFerramentas(ctx) {
  const { site, c, H } = ctx;
  const todas = (site.extraPages || [])
    .filter(p => String(p.slug || '').indexOf('ferramentas/') === 0);
  if (todas.length < 3) return '';
  const destaque = todas.slice(0, 10);
  return `<section class="${c('wferr')}"><div class="${c('wwrap')}">
<div><strong>Ferramentas grátis</strong><small>Geradores, calculadoras e validadores que funcionam direto no navegador, sem cadastro.</small></div>
<div class="${c('wpills')}">${destaque.map(p =>
    `<a href="/${H.esc(p.slug)}/">${H.esc(p.title)}</a>`).join('')}<a data-todas href="/ferramentas/">Ver todas as ${todas.length}</a></div>
</div></section>`;
}

function wCard(ctx, a, opt) {
  const { c, H } = ctx;
  const o = opt || {};
  const tag = o.h2 ? 'h2' : 'h3';
  const dest = o.destaque ? ' ' + c('wdest') : '';
  // so o destaque carrega linha fina: no cartao pequeno ela vira ruido
  const dek = (o.destaque && a.excerpt) ? `<p>${H.esc(H.clip(a.excerpt, 150))}</p>` : '';
  return `<a class="${c('wcard')}${dest} ${c('reveal')}" href="${H.url(a)}">
<span data-f>${H.pic(a, !!o.eager)}</span>
<span class="${c('wkick')}">${H.cat(a)}</span>
<${tag}>${H.esc(a.title)}</${tag}>
${dek}
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}

function wHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const abre = arts[0];
  const lado = arts.slice(1, 5);
  const teto = site.postsOnHome || 32;
  const resto = arts.slice(5, teto);

  const capa = abre ? `<div class="${c('wcapa')}">
<a class="${c('wabre')}" href="${H.url(abre)}">
<span data-f>${H.pic(abre, true)}</span>
<span class="${c('wkick')}">${H.cat(abre)}</span>
<h2>${H.esc(abre.title)}</h2>
${abre.excerpt ? `<p>${H.esc(H.clip(abre.excerpt, 210))}</p>` : ''}</a>
${lado.length ? `<div class="${c('wnum')}"><b>Também nesta edição</b>${lado.map((a, i) =>
    `<a href="${H.url(a)}"><em>${i + 2}</em><span><h3>${H.esc(a.title)}</h3>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></span></a>`).join('')}</div>` : ''}
</div>` : '';

  // secao por editoria de verdade, em multiplo de quatro, que e a grade
  const ordem = [], porCat = new Map();
  for (const a of resto) {
    const nome = H.cat(a);
    if (!porCat.has(nome)) { porCat.set(nome, []); ordem.push(nome); }
    porCat.get(nome).push(a);
  }
  const sobra = [], blocos = [];
  for (const nome of ordem) {
    const todos = porCat.get(nome);
    // o destaque vale duas celulas, entao a linha de quatro fecha em 3 ou em 7
    const cabe = todos.length >= 5 ? 5 : (todos.length >= 4 ? 4 : 0);
    const comDestaque = cabe === 5;
    if (!cabe) { sobra.push(...todos); continue; }
    sobra.push(...todos.slice(cabe));
    const cs = (todos[0].category && todos[0].category.slug) || '';
    const itens = todos.slice(0, cabe)
      .map((a, i) => wCard(ctx, a, { destaque: comDestaque && i === 0 })).join('');
    blocos.push(`<section class="${c('wsec')}">
<div class="${c('wsech')}"><h2>${nome}</h2><b></b>${cs ? `<a href="${H.curl(cs)}">Ver tudo de ${nome}</a>` : ''}</div>
<div class="${c('wgrid')}">${itens}</div>
</section>`);
  }
  // o bloco final tem tres colunas: linha pela metade deixa buraco do lado
  const falta = sobra.length % 3;
  if (falta) sobra.push(...arts.slice(teto, teto + (3 - falta)));
  if (sobra.length) blocos.push(`<section class="${c('wsec')}">
<div class="${c('wsech')}"><h2>Mais na ${H.esc(site.shortName || site.name)}</h2><b></b></div>
<div class="${c('wtres')}">${sobra.map(a => wCard(ctx, a)).join('')}</div>
</section>`);

  return `${H.head(ctx, H.homeMeta(site))}
${wHeader(ctx, menu)}
<main>
<div class="${c('wwrap')}">${H.h1(ctx)}${capa}</div>
${wFerramentas(ctx)}
<div class="${c('wwrap')}">${blocos.join('')}</div>
</main>
${wFooter(ctx, menu)}
${H.bodyEnd()}`;
}

function wArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const fig = art.image ? `<figure class="${c('wfig')}">${H.pic(art, true)}${art.image.caption ? `<figcaption>${H.esc(art.image.caption)}</figcaption>` : ''}</figure>` : '';
  const rel = (related && related.length) ? `<section class="${c('wrel')}">
<div class="${c('wsech')}"><h2>Leia também</h2><b></b></div>
<div class="${c('wtres')}">${related.slice(0, 3).map(a => wCard(ctx, a)).join('')}</div></section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${wHeader(ctx, menu)}
${H.progressBar(ctx)}
<main><div class="${c('wwrap')}">
<article class="${c('wart')}">
${H.crumbs(ctx, art, P)}
<div class="${c('wahead')}">
<span class="${c('wkick')}"><a href="${H.curl(P.catSlug)}" style="color:inherit;text-decoration:none">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('wdek')}">${H.esc(art.dek)}</p>` : ''}
</div>
${H.metaRow(ctx, art, P)}
${fig}
<div class="${c('wbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${rel}
</div></main>
${wFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function wList(ctx, opts) {
  const { c, H } = ctx;
  const itens = opts.items || [];
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${wHeader(ctx, opts.menu)}
<main><div class="${c('wwrap')}">
<div class="${c('wsech')}" style="margin-top:32px"><h1>${H.esc(opts.title)}</h1><b></b></div>
${itens.length ? `<div class="${c('wgrid')}">${itens.map((a, i) =>
    wCard(ctx, a, { h2: true, eager: i === 0 })).join('')}</div>` : ''}
</div></main>
${wFooter(ctx, opts.menu)}
${H.bodyEnd()}`;
}

function wFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x => `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('wfoot')}"><div class="${c('wwrap')}">
<div class="${c('wcols')}">
<div><div class="${c('wfb')}">`+`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6942 874" role="img" aria-label="Revista QMIX"><g transform="translate(0 770) scale(1 -1)"><g fill="var(--marca-1, currentColor)"><path transform="translate(0 0)" d="M25 700V0H232V195H318L427 0H657L522 241C593 286 635 361 635 448C635 520 609 580 556 628C504 676 439 700 361 700ZM361 510C394 510 420 483 420 448C420 412 394 385 361 385H232V510Z"/><path transform="translate(667 0)" d="M25 700V0H566V190H232V257H499V447H232V510H561V700Z"/><path transform="translate(1248 0)" d="M453 0 734 700H518L368 301L216 700H0L281 0Z"/><path transform="translate(1982 0)" d="M232 0V700H25V0Z"/><path transform="translate(2239 0)" d="M538 532C527 585 496 627 447 660C398 693 341 710 276 710C203 710 144 689 99 648C54 607 32 554 32 487C32 419 57 366 101 331C146 296 182 280 238 260L276 248C293 243 306 238 313 235L339 225C359 217 365 209 365 200C365 184 339 172 307 172C264 172 229 194 221 223L10 187C25 128 59 80 113 44C168 8 232 -10 306 -10C385 -10 449 11 498 52C547 94 572 150 572 220C572 287 548 341 505 374C462 409 424 426 371 443C350 450 310 461 293 466L265 476C246 484 239 493 239 504C239 519 256 529 280 529C305 529 328 517 333 498Z"/><path transform="translate(2796 0)" d="M197 510V0H404V510H587V700H15V510Z"/><path transform="translate(3308 0)" d="M424 270H321L373 402ZM744 0 458 700H286L0 0H216L251 90H493L528 0Z"/></g><g fill="var(--marca-2, #be123c)"><path transform="translate(4302 0)" d="M392 -10C453 -10 510 3 564 28L636 -44L766 86L704 148C744 208 764 275 764 350C764 452 728 537 657 606C586 675 498 710 392 710C287 710 198 675 127 606C56 537 20 452 20 350C20 248 56 162 127 93C198 24 287 -10 392 -10ZM236 351C236 396 251 434 281 465C311 496 348 512 392 512C437 512 474 496 504 465C534 434 549 396 549 351C549 338 547 323 544 308L465 387L335 257L403 189C304 189 236 252 236 351Z"/><path transform="translate(5086 0)" d="M227 0V319L362 66H499L634 319V0H836V700H634L431 338L227 700H25V0Z"/><path transform="translate(5947 0)" d="M232 0V700H25V0Z"/><path transform="translate(6204 0)" d="M246 357 0 0H246L369 179L492 0H738L492 357L728 700H482L369 536L256 700H10Z"/></g></g></svg>`+`</div>
<p style="margin:13px 0 0;max-width:42ch;line-height:1.6;opacity:.88">${H.esc(site.description || '')}</p></div>
<div><div class="${c('wfh')}">Editorias</div>${cats}</div>
<div><div class="${c('wfh')}">Institucional</div>${H.instLinks()}</div>
</div>
<div class="${c('wcp')}">© ${H.year()} ${H.esc(site.name)}. Todos os direitos reservados.</div>
</div></footer>`;
}
