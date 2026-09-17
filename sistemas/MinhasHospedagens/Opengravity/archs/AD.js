/*
 * Arquitetura AD, arquetipo ESTANTE. Feita para o ebookcult.com.br.
 *
 * ## De onde vem o desenho
 *
 * O nome e de livro, e o acervo preservado e de revista geral: dicas,
 * entretenimento, marketing, jogos. O desenho pega o **gesto** do nome, e nao o
 * assunto: capa em **retrato**, lado a lado, como lombada e capa numa estante.
 *
 * ## O que a diferencia das 29 vizinhas da opengravity
 *
 *   - **capa em retrato, 3 por 4.** Todas as vizinhas usam 16 por 9, 16 por 10
 *     ou 3 por 2. Uma parede de capas verticais nao se confunde com nenhuma
 *     delas nem de longe, e e o unico traco que se le antes de qualquer texto
 *   - **Lora e Mulish**: nenhum portal da rede usa qualquer uma das duas
 *   - **verde de encadernacao com latao**: as vizinhas ja ocupam grafite,
 *     marinho, esmeralda, violeta, ocre, vinho, cobalto, terracota, petroleo,
 *     carmim, lima, turquesa, azul-ferrugem, azul-royal, sepia e indigo
 *   - **chapeu de editoria dentro da capa**, no rodape da imagem, e nao acima do
 *     titulo nem em tarja separada
 *   - **cabecalho sem filete de largura inteira**: o filete acompanha so a
 *     largura do conteudo, e a navegacao se separa por divisor vertical
 *
 * ## Uma armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **Este portal tem `categoryBase`.** O arquivo de editoria mora em
 * `/categoria/<slug>/`, e nao em `/<slug>/`. Montar o link na mao com
 * `/${slug}/` derruba **o menu do topo inteiro, o menu do rodape e o chapeu de
 * cada artigo**, tudo em 404, e nao aparece em print nenhum porque o menu fica
 * bonito e so quebra no clique. Por isso todo link de editoria aqui sai de
 * `H.curl(slug)`, sem excecao.
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por `H.curl(slug)`, nunca montado a mao
 *   - menu sanfonado abaixo de 1100px, com aria-expanded, aria-controls e rotulo
 *     que muda ao abrir
 *   - todo `span` com aspect-ratio tem `display:block`, e o `a` do cartao tem
 *     `display`
 *   - body aberto no cabecalho e `H.bodyEnd()` nos tres caminhos de pagina
 *   - nada centralizado alem da marca, e a chamada de abertura tem texto a
 *     esquerda e imagem a direita
 *   - lista de editoria abre em h1, e o cartao dela sobe para h2
 *   - a secao da home consome exatamente o numero de itens da grade, entao a
 *     ultima linha nunca fica com buraco
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento
 *     principal: cabecalho e rodape sao irmaos dele e nao enxergariam
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - o cabecalho de secao usa a propriedade order, senao o filete cai depois do
 *     "ver tudo"
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS: o CSS
 *     mora num template literal, a crase o fecha e a chave interpola de verdade
 */

function adCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#E8E4D6';
  const viva = t.vivid || '#C9A227';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('adwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.72;-webkit-font-smoothing:antialiased}
${s('adwrap')} *{box-sizing:border-box}
${s('adin')}{max-width:${fp.container || '1160px'};margin:0 auto;padding:0 24px;width:100%}
${s('adwrap')} h1,${s('adwrap')} h2,${s('adwrap')} h3,${s('adwrap')} h4{font-family:var(--fd);
  font-weight:600;letter-spacing:-.006em;line-height:1.18;margin:0}
${s('adwrap')} a{color:inherit;text-decoration:none}
${s('adwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho: filete so na largura do conteudo, nav com divisor ---------- */
${s('adtop')}{background:var(--paper)}
${s('adbar')}{display:flex;align-items:center;gap:22px;padding-block:20px 17px;
  flex-wrap:wrap;border-bottom:2px solid var(--ink)}
${s('admarca')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:700;font-size:clamp(24px,3.1vw,32px);letter-spacing:-.014em;color:var(--ink);
  flex:none}
${s('admarca')} svg{display:block;height:.96em;width:auto;flex:none;align-self:center}
${s('adnav')}{display:flex;align-items:center;flex-wrap:wrap;flex:1 1 auto;min-width:0;
  justify-content:flex-end;gap:0}
${s('adnav')} a{font-family:var(--fb);font-size:11.5px;font-weight:700;letter-spacing:.05em;
  text-transform:uppercase;color:var(--ink);padding:2px 13px;border-left:1px solid var(--line)}
${s('adnav')} a:first-child{border-left:0}
${s('adnav')} a:hover{color:var(--pri)}
${s('adbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
  border:2px solid var(--ink);color:var(--ink);padding:8px 14px;flex:none;margin-left:16px}
${s('adbusca')}:hover{background:var(--ink);color:var(--paper)}
${s('adham')}{display:none;width:46px;height:46px;border:2px solid var(--ink);background:none;
  cursor:pointer;padding:0;position:relative}
${s('adham')} i,${s('adham')} i::before,${s('adham')} i::after{position:absolute;left:11px;
  width:20px;height:2px;background:var(--ink);content:""}
${s('adham')} i{top:21px}
${s('adham')} i::before{top:-6px;left:0}
${s('adham')} i::after{top:6px;left:0}
@media(max-width:1100px){
  ${s('adham')}{display:block;order:2}
  ${s('adbusca')}{order:3;margin-left:0}
  ${s('adnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    border-top:1px solid var(--line);margin-top:15px}
  ${s('adnav')}[data-aberto="1"]{display:flex}
  ${s('adnav')} a{width:100%;padding:13px 0;border-left:0;border-bottom:1px solid var(--line)}
}

/* ---------- a capa em retrato, que e a assinatura desta arquitetura ---------- */
${s('adcapa')}{display:block;position:relative;overflow:hidden;background:var(--ph)}
${s('adcapa')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '3/4'};overflow:hidden}
${s('adcapa')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('adcapa')} b{position:absolute;left:0;bottom:0;font-family:var(--fb);font-size:10px;
  font-weight:700;letter-spacing:${fp.kickerLs || '.11em'};text-transform:uppercase;
  background:var(--ink);color:var(--paper);padding:6px 11px}
${s('adlivro')}:hover ${s('adcapa')} [data-f] img{transform:scale(1.05)}
${s('adlivro')}{display:block}
${s('adti')}{display:block;font-family:var(--fd);font-weight:600;font-size:18px;line-height:1.28;
  color:var(--ink);margin:13px 0 0;transition:color .2s ease}
${s('adlivro')}:hover ${s('adti')}{color:var(--pri)}
${s('addt')}{display:block;font-family:var(--fb);font-size:11.5px;color:var(--muted);
  margin-top:7px;letter-spacing:.02em}

/* a estante: 4 colunas, e a secao da home consome exatamente 4, entao a ultima
   linha nunca fica com buraco */
${s('adestante')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:26px 22px}
${s('adg2')}{grid-template-columns:repeat(2,minmax(0,1fr))}
${s('adg3')}{grid-template-columns:repeat(3,minmax(0,1fr))}
@media(max-width:980px){${s('adestante')}{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:680px){
  ${s('adestante')}{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 16px}
  ${s('adti')}{font-size:15.5px;margin-top:10px}
}

/* ---------- chamada de abertura: texto a esquerda, capa a direita ---------- */
${s('adabre')}{display:grid;grid-template-columns:1.35fr .65fr;gap:38px;align-items:center;
  padding-block:40px 36px;border-bottom:1px solid var(--line)}
${s('adabre')} h2{font-size:clamp(30px,4.2vw,48px);letter-spacing:-.018em;line-height:1.1;
  margin:12px 0 0;font-weight:700}
${s('adabre')} p{font-size:17.5px;line-height:1.65;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('admm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:18px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('admm')} b{color:var(--ink);font-weight:700}
@media(max-width:820px){${s('adabre')}{grid-template-columns:1fr;gap:24px}}

/* ---------- cabecalho de secao ---------- */
${s('adsec')}{padding-block:36px 6px}
${s('adsh')}{display:flex;align-items:baseline;gap:16px;margin-bottom:22px}
${s('adsh')} h2,${s('adsh')} h1{font-size:clamp(20px,2.4vw,26px);font-weight:700;
  letter-spacing:-.01em;order:1;flex:none}
/* o filete e um ::after e por isso e sempre o ultimo filho. Sem a propriedade
   order ele cairia depois do "ver tudo" e o link ficaria colado no titulo */
${s('adsh')}::after{content:"";flex:1;height:1px;background:var(--line);align-self:center;order:2}
${s('adsh')} .more{order:3;flex:none;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.09em;text-transform:uppercase;color:var(--pri)}
${s('adsh')} .more:hover{color:var(--viva);text-decoration:underline}
${s('adsh1')} h1{font-size:clamp(26px,3.5vw,37px)}

/* ---------- chapeu, artigo, coluna medida ---------- */
${s('adkick')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.11em'};text-transform:uppercase;color:var(--pri)}
${s('adart')}{padding-block:30px 8px}
${s('adcol')}{max-width:${fp.medida || '700px'}}
${s('adart')} h1{font-size:clamp(28px,4vw,44px);font-weight:700;letter-spacing:-.018em;
  line-height:1.12;margin:12px 0 0}
${s('addek')}{font-size:19px;line-height:1.58;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('adhero')}{display:block;margin:28px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '860px'}}
${s('adhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('adhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('adleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '860px'};line-height:1.5;text-align:left}
${s('adbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.8;margin-top:28px}
${s('adbody')} p{margin:0 0 1.15em;text-align:left}
${s('adbody')} h2{font-size:25px;font-weight:700;letter-spacing:-.01em;margin:1.7em 0 .5em;
  color:var(--pri)}
${s('adbody')} h3{font-size:20px;font-weight:600;margin:1.5em 0 .4em}
${s('adbody')} ul,${s('adbody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('adbody')} li{margin:0 0 .45em}
${s('adbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('adbody')} a:hover{color:var(--viva)}
${s('adbody')} img{margin:1.5em 0;background:var(--ph)}
${s('adbody')} blockquote{margin:1.5em 0;padding:4px 0 4px 22px;border-left:3px solid var(--viva);
  font-family:var(--fd);font-size:20px;line-height:1.5;color:var(--ink);font-style:italic}
${s('adbody')} figure{margin:1.5em 0}
${s('adbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('adbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('adbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('adbody')} th,${s('adbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('adbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--ink)}
@media(max-width:640px){
  ${s('adbody')} table{min-width:0}
  ${s('adbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('adbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('adbody')} table,${s('adbody')} tbody,${s('adbody')} tr,${s('adbody')} th,
  ${s('adbody')} td{display:block;width:auto}
  ${s('adbody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    padding:2px 18px 16px;margin-bottom:13px}
  ${s('adbody')} tbody th,${s('adbody')} tbody td{border:0;background:transparent}
  ${s('adbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:16px;
    font-family:var(--fd);font-weight:600;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('adbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('adbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('adass')}{display:grid;grid-template-columns:76px minmax(0,1fr);gap:17px;align-items:start;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;border-top:2px solid var(--ink)}
${s('adass')} img{width:76px;height:76px;object-fit:cover;background:var(--ph)}
${s('adass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.11em;
  text-transform:uppercase;color:var(--viva)}
${s('adass')} .nm{display:block;font-family:var(--fd);font-size:21px;font-weight:700;
  margin-top:3px}
${s('adass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('adass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('adass')} .go:hover{text-decoration:underline}
${s('adrel')}{max-width:${fp.medida || '700px'};padding-block:30px 10px}

/* ---------- rodape ---------- */
${s('adfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:48px;padding-block:44px 26px}
${s('adcols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('adfb')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:700;font-size:25px;color:#fff}
${s('adfb')} svg{display:block;height:.96em;width:auto;flex:none;align-self:center}
${s('adfoot')} p{color:${t.footerTx || '#A7AE9F'};text-align:left}
${s('adfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:${t.footerTx || '#A7AE9F'};margin-bottom:13px}
${s('adflist')}{display:flex;flex-direction:column;gap:9px}
${s('adflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('adflist')} a:hover{opacity:1;color:var(--viva)}
${s('adfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12.5px;color:${t.footerTx || '#A7AE9F'}}
@media(max-width:820px){
  ${s('adcols')}{grid-template-columns:1fr;gap:26px}
  ${s('adfoot')}{padding-block:34px 22px}
}

/* ---------- animacao de entrada, respeitando quem pediu menos movimento ---------- */
@media(prefers-reduced-motion:no-preference){
  ${s('reveal')}{opacity:0;transform:translateY(12px);
    transition:opacity .5s ease,transform .5s ease}
  ${s('reveal')}[data-vis="1"]{opacity:1;transform:none}
}`;
}

/* Livro aberto visto de topo: duas paginas e a lombada no meio. Sem letra
 * dentro, porque o nome vem como texto na fonte de titulo ao lado. */
const AD_SIMB = `<svg viewBox="0 0 32 26" role="img" aria-hidden="true" focusable="false"><path d="M2 3h12v20H2Z" fill="var(--marca-2,currentColor)"/><path d="M18 3h12v20H18Z" fill="var(--marca-2,currentColor)"/><rect x="14" y="1" width="4" height="24" fill="var(--marca-1,currentColor)"/><rect x="5" y="8" width="6" height="2" fill="var(--marca-3,#fff)"/><rect x="21" y="8" width="6" height="2" fill="var(--marca-3,#fff)"/></svg>`;

const AD_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function adHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'adnav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase: a editoria mora em /categoria/<slug>/.
  // H.curl resolve isso; montar o link a mao poe o menu inteiro em 404.
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('adtop')}">
<div class="${c('adin')} ${c('adbar')}">
<a class="${c('admarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--ink);--marca-2:var(--pri);--marca-3:var(--viva)">${AD_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<nav class="${c('adnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('adham')}" type="button" data-adham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('adbusca')}" href="/busca/">${AD_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-adham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function adFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('adfoot')}"><div class="${c('adin')}">
<div class="${c('adcols')}">
  <div><a class="${c('adfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--pri);--marca-3:var(--viva)">${AD_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('adfh')}">Editorias</div><div class="${c('adflist')}">${cats}</div></div>
  <div><div class="${c('adfh')}">A casa</div><div class="${c('adflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('adfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A capa em retrato. O `span` do retrato tem display:block, senao o
 * aspect-ratio nao aplica e a imagem passa por cima do titulo.
 * O nivel do titulo vem de quem chama: h3 sob um h2 de secao na home, h2 na
 * lista de editoria, onde o titulo da pagina e h1. */
function adLivro(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('adlivro')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('adcapa')}"><span data-f>${H.pic(a, !!eager)}</span><b>${H.cat(a)}</b></span>
<h${n} class="${c('adti')}">${H.esc(a.title)}</h${n}>
<span class="${c('addt')}">${H.esc(H.dateShort(a.date))}</span></a>`;
}

function adHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('adabre')}">
<div><span class="${c('adkick')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('admm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('adcapa')}">
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
      const topo = `<div class="${c('adsh')}"><h2>${H.esc(nome)}</h2>
<a class="more" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>`;
      // consome exatamente 4, 3 ou 2, e a grade recebe esse mesmo numero de
      // colunas: a ultima linha nunca fica com buraco ao lado do ultimo cartao
      const n = v.length >= 4 ? 4 : v.length;
      const extra = n === 4 ? '' : ' ' + c('adg' + n);
      const corpo = `<div class="${c('adestante')}${extra}">${v.slice(0, n)
        .map(a => adLivro(ctx, a, false)).join('')}</div>`;
      return `<section class="${c('adsec')}">${topo}${corpo}</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${adHeader(ctx, menu)}
<main class="${c('adwrap')}"><div class="${c('adin')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${adFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. Inventar `bio` ou `editorias` nao da erro em lugar
 * nenhum, so nao gera nada. */
function adAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('adass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="76" height="76" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

function adArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema. Nao ha helper para calcular isso na arquitetura.
  const rel = (related && related.length) ? `<section class="${c('adrel')}">
<div class="${c('adsh')}"><h2>Leia também</h2></div>
<div class="${c('adestante')} ${c('adg' + Math.min(related.length, 3))}">${related.slice(0, 3)
    .map(a => adLivro(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${adHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('adwrap')}"><div class="${c('adin')}">
<article class="${c('adart')}">
<div class="${c('adcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('adkick')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('addek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('adhero')}"><span data-f>${H.pic(art, true)}</span></span>
<p class="${c('adleg')}">${H.esc(art.image && art.image.alt ? art.image.alt : art.title)}</p>` : ''}
<div class="${c('adbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${adAssinatura(ctx, art)}
${rel}
</div></main>
${adFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function adList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const extra = (itens.length && itens.length < 4) ? ' ' + c('adg' + itens.length) : '';
  return `${H.head(ctx, meta)}
${adHeader(ctx, menu)}
<main class="${c('adwrap')}"><div class="${c('adin')}">
<section class="${c('adsec')}">
<div class="${c('adsh')} ${c('adsh1')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('addek')}" style="max-width:66ch;margin:-12px 0 24px">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('adestante')}${extra}">${itens
    .map((a, i) => adLivro(ctx, a, i === 0, 2)).join('')}</div>
</section>
</div></main>
${adFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { adCss, adHeader, adFooter, adHome, adArticle, adList };
