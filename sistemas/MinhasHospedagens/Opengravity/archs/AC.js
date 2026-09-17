/*
 * Arquitetura AC, arquetipo ALMANAQUE. Feita para o curiosododia.com.br.
 *
 * ## De onde vem o desenho
 *
 * O nome promete uma curiosidade por dia, e o acervo preservado e de almanaque
 * mesmo: games, dicas, entretenimento, casa, curiosidades. O desenho pega esse
 * gesto: **entrada numerada**. Cada materia entra numa linha com o numero na
 * margem, editoria e data logo abaixo dele, miniatura no meio e o texto a
 * direita, do jeito que um almanaque lista verbete.
 *
 * ## O que a diferencia das 28 vizinhas da opengravity
 *
 *   - **linha numerada em vez de grade de cartoes.** Nenhuma vizinha lista por
 *     linha com numero na margem: a `AB` usa tarja de legenda, a `AA` bloco de
 *     cor, a `Z` faixa dupla, e as antigas usam grade. Aqui a home inteira,
 *     a editoria e o "leia tambem" sao a mesma linha numerada
 *   - **Petrona e Figtree**: nenhum portal da rede usa qualquer uma das duas
 *   - **indigo e magenta**: as vizinhas ja ocupam grafite, marinho, esmeralda,
 *     violeta claro, ocre, vinho, cobalto, terracota, petroleo, carmim, lima,
 *     turquesa, azul-ferrugem, azul-royal e sepia
 *   - **simbolo de marcador de pagina**, e nao quadro, pagina ou barra
 *   - **filete acima da linha**, e nao sombra nem cartao com borda: a pagina le
 *     como pauta de almanaque
 *
 * ## Por que linha e nao grade
 *
 * Grade de N colunas tem dois defeitos que ja custaram tempo na rede: a ultima
 * linha fica com buraco quando o numero de itens nao fecha, e a grade de duas
 * colunas preenchida por linha faz a data pular para quem le de cima para baixo.
 * A linha numerada nao tem nenhum dos dois: a ordem e sempre vertical e a
 * ultima entrada nunca deixa vao.
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por `H.curl(slug)`, nunca montado a mao
 *   - menu sanfonado abaixo de 1100px, com aria-expanded, aria-controls e rotulo
 *     que muda ao abrir
 *   - todo `span` com aspect-ratio tem `display:block`, e o `a` da linha tem
 *     `display`
 *   - body aberto no cabecalho e `H.bodyEnd()` nos tres caminhos de pagina
 *   - nada centralizado alem da marca, e a chamada de abertura tem texto a
 *     esquerda e imagem a direita
 *   - lista de editoria abre em h1, e a linha dela sobe para h2
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento
 *     principal: cabecalho e rodape sao irmaos dele e nao enxergariam
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo, que zera
 *     o `padding-inline` do contentor e cola a marca na borda do celular
 *   - o cabecalho de secao usa `order`, senao o filete cai depois do "ver tudo"
 *   - nenhuma crase dentro de comentario do CSS: o CSS mora num template
 *     literal e a crase o fecha, derrubando o archs.js inteiro
 */

function acCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#EAE4F2';
  const viva = t.vivid || '#CF2E7A';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('acwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.7;-webkit-font-smoothing:antialiased}
${s('acwrap')} *{box-sizing:border-box}
${s('acin')}{max-width:${fp.container || '1120px'};margin:0 auto;padding:0 24px;width:100%}
${s('acwrap')} h1,${s('acwrap')} h2,${s('acwrap')} h3,${s('acwrap')} h4{font-family:var(--fd);
  font-weight:600;letter-spacing:-.012em;line-height:1.14;margin:0}
${s('acwrap')} a{color:inherit;text-decoration:none}
${s('acwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho: marca a esquerda, navegacao a direita, filete grosso ---------- */
${s('actop')}{background:var(--paper);border-bottom:3px solid var(--ink)}
${s('acbar')}{display:flex;align-items:center;gap:20px;padding-block:18px 16px;flex-wrap:wrap}
${s('acmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:800;font-size:clamp(25px,3.2vw,33px);letter-spacing:-.022em;color:var(--ink);
  flex:none}
${s('acmarca')} svg{display:block;height:.9em;width:auto;flex:none;align-self:center}
/* a navegacao e quem estica, e nao a marca: com margin-right auto na marca o
   botao de busca era empurrado para uma segunda linha assim que a lista de
   editorias crescia. Aqui ela ocupa a folga e encolhe antes de quebrar.
   Sem crase neste comentario: o CSS mora num template literal */
${s('acnav')}{display:flex;gap:15px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('acnav')} a{font-family:var(--fb);font-size:11.5px;font-weight:600;letter-spacing:.04em;
  text-transform:uppercase;color:var(--ink);padding-bottom:3px;
  border-bottom:2px solid transparent;transition:border-color .2s ease}
${s('acnav')} a:hover{border-bottom-color:var(--viva)}
${s('acbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:12.5px;font-weight:600;letter-spacing:.045em;text-transform:uppercase;
  background:var(--ink);color:var(--paper);padding:9px 15px;flex:none}
${s('acham')}{display:none;width:46px;height:46px;border:2px solid var(--ink);background:none;
  cursor:pointer;padding:0;position:relative}
${s('acham')} i,${s('acham')} i::before,${s('acham')} i::after{position:absolute;left:11px;
  width:20px;height:2px;background:var(--ink);content:"";transition:transform .2s ease}
${s('acham')} i{top:21px}
${s('acham')} i::before{top:-6px;left:0}
${s('acham')} i::after{top:6px;left:0}
@media(max-width:1100px){
  ${s('acham')}{display:block;order:2}
  ${s('acbusca')}{order:3}
  ${s('acnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('acnav')}[data-aberto="1"]{display:flex}
  ${s('acnav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line)}
}
/* no celular o botao de busca caia sozinho numa segunda linha embaixo da marca.
   A busca continua acessivel pelo rodape e pela URL /busca/. */
@media(max-width:760px){${s('acbusca')}{display:none}}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('acabre')}{display:grid;grid-template-columns:1fr 1fr;gap:34px;align-items:center;
  padding-block:38px 34px;border-bottom:3px solid var(--ink)}
${s('acabre')} h2{font-size:clamp(31px,4.3vw,50px);letter-spacing:-.026em;line-height:1.06;
  margin:11px 0 0;font-weight:800}
${s('acabre')} p{font-size:17.5px;line-height:1.62;color:var(--dek);margin:15px 0 0;
  max-width:46ch;text-align:left}
${s('acmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:17px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted);letter-spacing:.02em}
${s('acmm')} b{color:var(--ink);font-weight:600}
@media(max-width:820px){${s('acabre')}{grid-template-columns:1fr;gap:22px}}

/* ---------- cabecalho de secao: numero, nome, filete, ver tudo ---------- */
${s('acsec')}{padding-block:34px 8px}
${s('acsh')}{display:flex;align-items:baseline;gap:15px;margin-bottom:4px}
${s('acsh')} h2,${s('acsh')} h1{font-size:clamp(20px,2.5vw,27px);font-weight:800;
  letter-spacing:-.014em;order:1;flex:none}
/* o filete e um ::after e por isso e sempre o ultimo filho. Sem a propriedade
   order ele cairia depois do "ver tudo" e o link ficaria colado no titulo */
${s('acsh')}::after{content:"";flex:1;height:3px;background:var(--ink);align-self:center;order:2}
${s('acsh')} .more{order:3;flex:none;font-family:var(--fb);font-size:11.5px;font-weight:700;
  letter-spacing:.09em;text-transform:uppercase;color:var(--viva)}
${s('acsh')} .more:hover{text-decoration:underline}
${s('acsh1')} h1{font-size:clamp(26px,3.6vw,38px)}

/* ---------- a linha numerada, que e a assinatura desta arquitetura ---------- */
${s('aclinhas')}{display:block}
${s('aclinha')}{display:grid;grid-template-columns:46px 168px 1fr;gap:20px;align-items:start;
  padding-block:20px;border-top:1px solid var(--line)}
${s('aclinha')}:first-child{border-top:2px solid var(--ink)}
${s('aclinha')}:hover ${s('acti')}{color:var(--viva)}
${s('acnum')}{display:block;font-family:var(--fd);font-size:31px;font-weight:800;line-height:1;
  color:var(--viva);font-variant-numeric:tabular-nums;letter-spacing:-.03em}
/* editoria e data ficam na coluna do texto, e nao ao lado do numero: numa
   coluna de 46px uma palavra como "Entretenimento" quebra em tres pedacos e a
   linha inteira fica ilegivel */
${s('acmeta')}{display:block;margin:0 0 6px;font-family:var(--fb);font-size:10.5px;
  font-weight:700;letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;
  color:var(--muted);line-height:1.4}
${s('acmeta')} b{color:var(--viva);font-weight:700}
${s('acfoto')}{display:block;position:relative;overflow:hidden;background:var(--ph)}
${s('acfoto')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '16/10'};overflow:hidden}
${s('acfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;
  transition:transform .45s ease}
${s('aclinha')}:hover ${s('acfoto')} [data-f] img{transform:scale(1.045)}
${s('acti')}{display:block;font-family:var(--fd);font-weight:600;font-size:21px;line-height:1.2;
  letter-spacing:-.012em;color:var(--ink);margin:0;transition:color .2s ease}
${s('acdd')}{display:block;margin:9px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);
  max-width:62ch;text-align:left}
${s('acsel')}{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--viva)}
@media(max-width:760px){
  ${s('aclinha')}{grid-template-columns:30px 96px 1fr;gap:12px;padding-block:15px}
  ${s('acnum')}{font-size:19px}
  ${s('acmeta')}{font-size:9.5px;margin-bottom:4px}
  ${s('acti')}{font-size:16.5px}
  ${s('acdd')}{display:none}
}

/* ---------- chapeu, artigo, coluna medida ---------- */
${s('ackick')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--viva)}
${s('acart')}{padding-block:30px 8px}
${s('accol')}{max-width:${fp.medida || '700px'}}
${s('acart')} h1{font-size:clamp(29px,4.1vw,45px);font-weight:800;letter-spacing:-.026em;
  line-height:1.07;margin:12px 0 0}
${s('acdek')}{font-size:19px;line-height:1.56;color:var(--dek);margin:15px 0 0;
  max-width:58ch;text-align:left}
${s('accapa')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '840px'}}
${s('accapa')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/10'};overflow:hidden}
${s('accapa')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('acleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '840px'};line-height:1.5;text-align:left}
${s('acbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:28px}
${s('acbody')} p{margin:0 0 1.16em;text-align:left}
${s('acbody')} h2{font-size:26px;font-weight:800;letter-spacing:-.016em;margin:1.7em 0 .5em;
  padding-top:.5em;border-top:3px solid var(--ink)}
${s('acbody')} h3{font-size:20.5px;font-weight:600;margin:1.5em 0 .4em;color:var(--pri)}
${s('acbody')} ul,${s('acbody')} ol{margin:0 0 1.16em;padding-left:1.25em;text-align:left}
${s('acbody')} li{margin:0 0 .45em}
${s('acbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('acbody')} a:hover{color:var(--viva)}
${s('acbody')} img{margin:1.5em 0;background:var(--ph)}
${s('acbody')} blockquote{margin:1.5em 0;padding:2px 0 2px 20px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:21px;line-height:1.42;color:var(--ink)}
${s('acbody')} figure{margin:1.5em 0}
${s('acbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('acbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('acbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('acbody')} th,${s('acbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('acbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--ink)}
@media(max-width:640px){
  ${s('acbody')} table{min-width:0}
  ${s('acbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('acbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('acbody')} table,${s('acbody')} tbody,${s('acbody')} tr,${s('acbody')} th,
  ${s('acbody')} td{display:block;width:auto}
  ${s('acbody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    padding:2px 18px 16px;margin-bottom:13px}
  ${s('acbody')} tbody th,${s('acbody')} tbody td{border:0;background:transparent}
  ${s('acbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:16px;
    font-family:var(--fd);font-weight:600;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('acbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('acbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('acass')}{display:grid;grid-template-columns:76px minmax(0,1fr);gap:17px;align-items:start;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;border-top:3px solid var(--ink)}
${s('acass')} img{width:76px;height:76px;object-fit:cover;background:var(--ph)}
${s('acass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.11em;color:var(--viva)}
${s('acass')} .nm{display:block;font-family:var(--fd);font-size:21px;font-weight:800;
  letter-spacing:-.014em;margin-top:3px}
${s('acass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('acass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;color:var(--pri)}
${s('acass')} .go:hover{text-decoration:underline}
${s('acrel')}{max-width:${fp.medida || '700px'};padding-block:30px 10px}

/* ---------- rodape ---------- */
${s('acfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:46px;padding-block:44px 26px}
${s('accols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('acfb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:800;font-size:26px;letter-spacing:-.022em;color:#fff}
${s('acfb')} svg{display:block;height:.9em;width:auto;flex:none;align-self:center}
${s('acfoot')} p{color:${t.footerTx || '#A9A2BA'};text-align:left}
${s('acfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:${t.footerTx || '#A9A2BA'};margin-bottom:13px}
${s('acflist')}{display:flex;flex-direction:column;gap:9px}
${s('acflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('acflist')} a:hover{opacity:1;color:var(--viva)}
${s('acfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12.5px;color:${t.footerTx || '#A9A2BA'}}
@media(max-width:820px){
  ${s('accols')}{grid-template-columns:1fr;gap:26px}
  ${s('acfoot')}{padding-block:34px 22px}
}

/* ---------- animacao de entrada, respeitando quem pediu menos movimento ---------- */
@media(prefers-reduced-motion:no-preference){
  ${s('reveal')}{opacity:0;transform:translateY(12px);
    transition:opacity .5s ease,transform .5s ease}
  ${s('reveal')}[data-vis="1"]{opacity:1;transform:none}
}`;
}

/* Marcador de pagina, o gesto de almanaque: a fita que guarda o verbete do dia.
 * Sem letra dentro, porque o nome vem como texto na fonte de titulo ao lado. */
const AC_SIMB = `<svg viewBox="0 0 22 30" role="img" aria-hidden="true" focusable="false"><path d="M1 1h20v28l-10-7-10 7Z" fill="var(--marca-2,currentColor)"/><path d="M1 1h20v28l-10-7-10 7Z" fill="none" stroke="var(--marca-1,currentColor)" stroke-width="2"/><rect x="8" y="7" width="6" height="6" fill="var(--marca-3,#fff)"/></svg>`;

const AC_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function acHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'acnav-' + (site.slug || 'p');
  // link de editoria por H.curl: montado a mao ele quebra quando ha categoryBase
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('actop')}">
<div class="${c('acin')} ${c('acbar')}">
<a class="${c('acmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--ink);--marca-2:var(--viva);--marca-3:var(--paper)">${AC_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<nav class="${c('acnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('acham')}" type="button" data-acham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('acbusca')}" href="/busca/">${AC_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-acham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function acFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('acfoot')}"><div class="${c('acin')}">
<div class="${c('accols')}">
  <div><a class="${c('acfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva);--marca-3:var(--ink)">${AC_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('acfh')}">Editorias</div><div class="${c('acflist')}">${cats}</div></div>
  <div><div class="${c('acfh')}">O almanaque</div><div class="${c('acflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('acfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A entrada numerada. O `span` do retrato tem display:block, senao o
 * aspect-ratio nao aplica e a imagem passa por cima do titulo.
 * O nivel do titulo vem de quem chama: h3 sob um h2 de secao na home, h2 na
 * lista de editoria, onde o titulo da pagina e h1. */
function acLinha(ctx, a, n, eager, nivel) {
  const { c, H } = ctx;
  const nv = nivel || 3;
  const num = String(n).padStart(2, '0');
  return `<a class="${c('aclinha')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('acnum')}">${num}</span>
<span class="${c('acfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span><span class="${c('acmeta')}"><b>${H.cat(a)}</b> &middot; ${H.esc(H.dateShort(a.date))}</span>
<h${nv} class="${c('acti')}">${H.esc(a.title)}</h${nv}>
${a.dek ? `<span class="${c('acdd')}">${H.esc(H.clip(a.dek, 165))}</span>` : ''}</span>
</a>`;
}

function acHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('acabre')}">
<div><span class="${c('ackick')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 210))}</p>` : ''}
<div class="${c('acmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('acfoto')}">
<span data-f>${H.pic(abre, true)}</span></span></a>
</section>` : '';

  // secoes por editoria de verdade, ordenadas por data, e nao por fatia de N
  const porCat = new Map();
  for (const a of arts) {
    if (usados.has(a.slug)) continue;
    const k = a.category ? a.category.slug : 'noticias';
    if (!porCat.has(k)) porCat.set(k, []);
    porCat.get(k).push(a);
  }

  const secoes = [...porCat.entries()]
    .filter(([, v]) => v.length >= 2)
    .slice(0, 7)
    .map(([cs, v]) => {
      const nome = v[0].category ? v[0].category.name : cs;
      const topo = `<div class="${c('acsh')}"><h2>${H.esc(nome)}</h2>
<a class="more" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>`;
      // a lista nunca deixa vao na ultima linha, porque nao e grade
      const corpo = `<div class="${c('aclinhas')}">${v.slice(0, 5)
        .map((a, i) => acLinha(ctx, a, i + 1, false)).join('')}</div>`;
      return `<section class="${c('acsec')}">${topo}${corpo}</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${acHeader(ctx, menu)}
<main class="${c('acwrap')}"><div class="${c('acin')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${acFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. Inventar `bio` ou `editorias` nao da erro em lugar
 * nenhum, so nao gera nada. */
function acAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('acass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="76" height="76" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

function acArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema. Nao ha helper para calcular isso na arquitetura.
  const rel = (related && related.length) ? `<section class="${c('acrel')}">
<div class="${c('acsh')}"><h2>Leia também</h2></div>
<div class="${c('aclinhas')}">${related.slice(0, 3)
    .map((a, i) => acLinha(ctx, a, i + 1, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${acHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('acwrap')}"><div class="${c('acin')}">
<article class="${c('acart')}">
<div class="${c('accol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('ackick')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('acdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('accapa')}"><span data-f>${H.pic(art, true)}</span></span>
<p class="${c('acleg')}">${H.esc(art.image && art.image.alt ? art.image.alt : art.title)}</p>` : ''}
<div class="${c('acbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${acAssinatura(ctx, art)}
${rel}
</div></main>
${acFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function acList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  return `${H.head(ctx, meta)}
${acHeader(ctx, menu)}
<main class="${c('acwrap')}"><div class="${c('acin')}">
<section class="${c('acsec')}">
<div class="${c('acsh')} ${c('acsh1')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('acdek')}" style="max-width:66ch;margin-top:2px">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('aclinhas')}">${itens
    .map((a, i) => acLinha(ctx, a, i + 1, i === 0, 2)).join('')}</div>
</section>
</div></main>
${acFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { acCss, acHeader, acFooter, acHome, acArticle, acList };
