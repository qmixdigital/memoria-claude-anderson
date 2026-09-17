/*
 * Arquitetura AG, arquetipo VITRINE. Feita para o exquisito.com.br.
 *
 * ## De onde vem o desenho
 *
 * O nome promete o que sai do comum, e o acervo preservado puxa forte para
 * **entretenimento**, que sozinho e 40% do que sobrou, seguido de marketing,
 * dica, viagem e estilo. O desenho pega o gesto da **vitrine**: cada secao abre
 * com **uma peca grande a esquerda e as menores empilhadas a direita**, como
 * montra de loja, em vez de lista corrida.
 *
 * ## O que a diferencia das 32 vizinhas da opengravity
 *
 *   - **secao em vitrine, com destaque grande ao lado dos menores**. A `AF` e a
 *     `AE` sao listas do comeco ao fim, a `AD` e capa em retrato, a `AC` e linha
 *     numerada, a `AB` e grade com tarja. Nenhuma abre a secao com um destaque
 *   - **etiqueta de editoria em tarja inclinada** sobre a foto do destaque, e
 *     nao acima do titulo
 *   - **numeracao romana na coluna dos menores**, que amarra a vitrine e nao se
 *     repete em vizinha nenhuma
 *   - **Yeseva One e Onest**: nenhuma das duas aparece nas 77 famílias em uso
 *   - **oceano profundo com coral**: as vizinhas ja ocupam grafite, marinho,
 *     esmeralda, violeta, ocre, vinho, cobalto, terracota, petroleo, carmim,
 *     turquesa, azul-ferrugem, azul-royal, sepia, indigo, verde, ardosia e
 *     ameixa
 *   - **a ultima linha nunca fica com buraco**: a vitrine consome exatamente
 *     1 + 3, e o que sobra vai para a lista abaixo dela
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **Este portal tem `categoryBase`.** O `category_base` da origem e
 * `categoria`, entao o arquivo de editoria mora em `/categoria/<slug>/` e o
 * artigo em `/<editoria>/<slug>/`. Montar o link de editoria a mao derruba **o
 * menu do topo, o menu do rodape, a etiqueta de cada destaque e o chapeu de cada
 * artigo**, tudo em 404, e nao aparece em print nenhum porque o menu fica bonito
 * e so quebra no clique. Todo link de editoria aqui sai de `H.curl(slug)`.
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
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *   - a legenda da imagem so aparece quando o `alt` descreve a foto, e nao
 *     quando ele e copia do titulo
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG
 */

function agCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#E4EBEE';
  const viva = t.vivid || '#E4572E';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('agwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.7;-webkit-font-smoothing:antialiased}
${s('agwrap')} *{box-sizing:border-box}
${s('agin')}{max-width:${fp.container || '1200px'};margin:0 auto;padding:0 24px;width:100%}
${s('agwrap')} h1,${s('agwrap')} h2,${s('agwrap')} h3,${s('agwrap')} h4{font-family:var(--fd);
  font-weight:400;letter-spacing:0;line-height:1.16;margin:0}
${s('agwrap')} a{color:inherit;text-decoration:none}
${s('agwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('agtop')}{background:var(--pri);color:var(--sob)}
${s('agbar')}{display:flex;align-items:center;gap:18px;padding-block:17px;flex-wrap:wrap}
${s('agmarca')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:400;font-size:clamp(23px,2.9vw,31px);color:var(--sob);flex:none}
${s('agmarca')} svg{display:block;height:.92em;width:auto;flex:none;align-self:center}
${s('agnav')}{display:flex;gap:13px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('agnav')} a{font-family:var(--fb);font-size:11px;font-weight:600;letter-spacing:.05em;
  text-transform:uppercase;color:var(--sob);opacity:.82;transition:opacity .2s ease}
${s('agnav')} a:hover{opacity:1}
${s('agbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--viva);color:#fff;padding:9px 14px;flex:none;margin-left:8px}
${s('agham')}{display:none;width:46px;height:46px;border:1px solid rgba(255,255,255,.4);
  background:none;cursor:pointer;padding:0;position:relative}
${s('agham')} i,${s('agham')} i::before,${s('agham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--sob);content:""}
${s('agham')} i{top:22px}
${s('agham')} i::before{top:-6px;left:0}
${s('agham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('agmarca')}{font-size:20px;gap:8px}
  ${s('agbar')}{gap:11px}
  ${s('agbusca')}{font-size:10px;padding:8px 11px;gap:6px}
}
@media(max-width:1100px){
  ${s('agham')}{display:block;order:2}
  ${s('agbusca')}{order:3;margin-left:0}
  ${s('agnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid rgba(255,255,255,.22);margin-top:14px}
  ${s('agnav')}[data-aberto="1"]{display:flex}
  ${s('agnav')} a{width:100%;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.14);opacity:1}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('agabre')}{display:grid;grid-template-columns:1fr 1.1fr;gap:38px;align-items:center;
  padding-block:40px 34px;border-bottom:3px solid var(--ink)}
${s('agabre')} h2{font-size:clamp(30px,4.2vw,48px);line-height:1.1;margin:12px 0 0}
${s('agabre')} p{font-size:17.5px;line-height:1.62;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('agmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:18px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('agmm')} b{color:var(--ink);font-weight:700}
@media(max-width:820px){${s('agabre')}{grid-template-columns:1fr;gap:22px;padding-block:28px 24px}}

/* ---------- a vitrine: destaque grande a esquerda, menores a direita ---------- */
${s('agsec')}{padding-block:34px;border-bottom:1px solid var(--line)}
${s('agcab')}{display:flex;align-items:center;justify-content:space-between;gap:16px;
  margin-bottom:19px;flex-wrap:wrap}
${s('agcab')} h1,${s('agcab')} h2{font-size:clamp(22px,2.6vw,30px);color:var(--ink)}
${s('agmais')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--viva);flex:none}
${s('agmais')}:hover{text-decoration:underline}
${s('agdescr')}{margin:0 0 17px;font-size:15px;line-height:1.62;color:var(--dek);
  max-width:70ch;text-align:left}
${s('agvit')}{display:grid;grid-template-columns:1.35fr 1fr;gap:30px;align-items:start}
@media(max-width:900px){${s('agvit')}{grid-template-columns:1fr;gap:22px}}

${s('agdest')}{display:block}
${s('agfoto')}{display:block;overflow:hidden;background:var(--ph);position:relative}
${s('agfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('agfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('agdest')}:hover ${s('agfoto')} [data-f] img{transform:scale(1.04)}
/* etiqueta em tarja inclinada sobre a foto: nenhuma vizinha poe a editoria ali */
${s('agtarja')}{position:absolute;left:0;top:15px;display:inline-block;background:var(--viva);
  color:#fff;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;padding:6px 15px 6px 12px;
  transform:skewX(-12deg);transform-origin:left center}
${s('agtarja')} span{display:block;transform:skewX(12deg)}
${s('agdt')}{display:block;margin-top:11px;font-family:var(--fb);font-size:11.5px;
  color:var(--muted)}
${s('agdest')} ${s('agti')}{font-size:26px;margin-top:9px}
${s('agti')}{display:block;font-family:var(--fd);font-weight:400;font-size:19px;line-height:1.22;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('agdd')}{display:block;margin:9px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);
  max-width:60ch;text-align:left}

${s('aglado')}{display:block;counter-reset:ag}
${s('agmini')}{display:grid;grid-template-columns:34px minmax(0,1fr);gap:14px;align-items:start;
  padding-block:15px;border-top:1px solid var(--line)}
${s('aglado')} ${s('agmini')}:first-child{border-top:0;padding-top:0}
/* numeracao romana, que amarra a vitrine */
${s('agnum')}{display:block;font-family:var(--fd);font-size:17px;color:var(--viva);
  line-height:1.1;padding-top:2px}
${s('agmini')}:hover ${s('agti')}{color:var(--pri)}
${s('agkick')}{display:block;font-family:var(--fb);font-size:10px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--muted);
  margin-bottom:5px}

/* a lista que recolhe o que sobra da vitrine */
${s('aglista')}{display:block;margin-top:22px;border-top:1px solid var(--line)}
${s('agitem')}{display:grid;grid-template-columns:132px minmax(0,1fr);gap:18px;align-items:start;
  padding-block:15px;border-bottom:1px solid var(--line)}
${s('agitem')}:hover ${s('agti')}{color:var(--pri)}
@media(max-width:680px){
  ${s('agitem')}{grid-template-columns:96px minmax(0,1fr);gap:13px}
  ${s('agdest')} ${s('agti')}{font-size:21px}
  ${s('agdd')}{display:none}
}

/* ---------- artigo ---------- */
${s('agart')}{padding-block:28px 8px}
${s('agcol')}{max-width:${fp.medida || '700px'}}
${s('agchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--viva)}
${s('agart')} h1{font-size:clamp(29px,4vw,45px);line-height:1.1;margin:12px 0 0}
${s('agdek')}{font-size:19px;line-height:1.56;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('aghero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'}}
${s('aghero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('aghero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('agleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('agbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('agbody')} p{margin:0 0 1.15em;text-align:left}
${s('agbody')} h2{font-family:var(--fd);font-size:26px;font-weight:400;margin:1.7em 0 .5em;
  color:var(--pri)}
${s('agbody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--ink)}
${s('agbody')} ul,${s('agbody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('agbody')} li{margin:0 0 .45em}
${s('agbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('agbody')} a:hover{color:var(--viva)}
${s('agbody')} img{margin:1.5em 0;background:var(--ph)}
${s('agbody')} blockquote{margin:1.5em 0;padding:4px 0 4px 22px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:21px;line-height:1.42;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('agbody')} .exq-veja{margin:2.2em 0;padding:19px 23px 17px;background:var(--wash)}
${s('agbody')} .exq-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--muted);
  margin:0 0 11px;color:var(--pri)}
${s('agbody')} .exq-veja ul{list-style:none;margin:0;padding:0}
${s('agbody')} .exq-veja li{margin:0;padding:9px 0;border-top:1px solid rgba(0,0,0,.09)}
${s('agbody')} .exq-veja li:first-child{border-top:0;padding-top:0}
${s('agbody')} .exq-veja a{font-family:var(--fd);font-size:17px;line-height:1.32;
  color:var(--ink);text-decoration:none;display:block}
${s('agbody')} .exq-veja a:hover{color:var(--viva)}
${s('agbody')} figure{margin:1.5em 0}
${s('agbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('agbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('agbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('agbody')} th,${s('agbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('agbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--ink)}
@media(max-width:640px){
  ${s('agbody')} table{min-width:0}
  ${s('agbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('agbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('agbody')} table,${s('agbody')} tbody,${s('agbody')} tr,${s('agbody')} th,
  ${s('agbody')} td{display:block;width:auto}
  ${s('agbody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    padding:2px 18px 16px;margin-bottom:13px}
  ${s('agbody')} tbody th,${s('agbody')} tbody td{border:0;background:transparent}
  ${s('agbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:400;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('agbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('agbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('agass')}{display:grid;grid-template-columns:76px minmax(0,1fr);gap:17px;align-items:start;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;border-top:3px solid var(--ink)}
${s('agass')} img{width:76px;height:76px;object-fit:cover;background:var(--ph)}
${s('agass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--viva)}
${s('agass')} .nm{display:block;font-family:var(--fd);font-size:22px;margin-top:3px}
${s('agass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('agass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('agass')} .go:hover{text-decoration:underline}
${s('agrel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('agrotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.11em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}

/* ---------- rodape ---------- */
${s('agfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('agcols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('agfb')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-size:26px;color:#fff}
${s('agfb')} svg{display:block;height:.92em;width:auto;flex:none;align-self:center}
${s('agfoot')} p{color:${t.footerTx || '#9FB0B7'};text-align:left}
${s('agfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:${t.footerTx || '#9FB0B7'};margin-bottom:13px}
${s('agflist')}{display:flex;flex-direction:column;gap:9px}
${s('agflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('agflist')} a:hover{opacity:1;color:var(--viva)}
${s('agfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12.5px;color:${t.footerTx || '#9FB0B7'}}
@media(max-width:820px){
  ${s('agcols')}{grid-template-columns:1fr;gap:26px}
  ${s('agfoot')}{padding-block:34px 22px}
}

/* ---------- animacao de entrada, respeitando quem pediu menos movimento ---------- */
@media(prefers-reduced-motion:no-preference){
  ${s('reveal')}{opacity:0;transform:translateY(12px);
    transition:opacity .5s ease,transform .5s ease}
  ${s('reveal')}[data-vis="1"]{opacity:1;transform:none}
}`;
}

/* Vitrine: um retangulo grande e tres pequenos ao lado, que e o proprio arranjo
 * da secao. Sem letra dentro: o nome vem como texto ao lado. */
const AG_SIMB = `<svg viewBox="0 0 30 26" role="img" aria-hidden="true" focusable="false"><rect x="1" y="3" width="15" height="20" fill="var(--marca-1,currentColor)"/><rect x="18" y="3" width="11" height="5" fill="var(--marca-2,currentColor)"/><rect x="18" y="10.5" width="11" height="5" fill="var(--marca-3,currentColor)"/><rect x="18" y="18" width="11" height="5" fill="var(--marca-2,currentColor)"/></svg>`;

const AG_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

const AG_ROMANO = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function agHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'agnav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase: a editoria mora em /categoria/<slug>/.
  // H.curl resolve isso; montar o link a mao poe o menu inteiro em 404.
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('agtop')}">
<div class="${c('agin')} ${c('agbar')}">
<a class="${c('agmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:#fff;--marca-2:var(--viva);--marca-3:rgba(255,255,255,.55)">${AG_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<nav class="${c('agnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('agham')}" type="button" data-agham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('agbusca')}" href="/busca/">${AG_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-agham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function agFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('agfoot')}"><div class="${c('agin')}">
<div class="${c('agcols')}">
  <div><a class="${c('agfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva);--marca-3:rgba(255,255,255,.5)">${AG_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('agfh')}">Editorias</div><div class="${c('agflist')}">${cats}</div></div>
  <div><div class="${c('agfh')}">A vitrine</div><div class="${c('agflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('agfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* O destaque da vitrine. O `span` da foto tem display:block, senao o
 * aspect-ratio nao aplica e a imagem passa por cima do titulo. */
function agDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('agdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('agfoto')}"><span data-f>${H.pic(a, !!eager)}</span>
<span class="${c('agtarja')}"><span>${H.esc(H.cat(a))}</span></span></span>
<h${n} class="${c('agti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('agdd')}">${H.esc(H.clip(a.dek, 165))}</span>` : ''}
<span class="${c('agdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

function agMini(ctx, a, i, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('agmini')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('agnum')}">${AG_ROMANO[i] || (i + 1)}</span>
<span><span class="${c('agkick')}">${H.cat(a)}</span>
<h${n} class="${c('agti')}">${H.esc(a.title)}</h${n}>
<span class="${c('agdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function agItem(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('agitem')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('agfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span><span class="${c('agkick')}">${H.cat(a)}</span>
<h${n} class="${c('agti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('agdd')}">${H.esc(H.clip(a.dek, 150))}</span>` : ''}
<span class="${c('agdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function agHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('agabre')}">
<div><span class="${c('agchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('agmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('agfoto')}">
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
      const [d, ...resto] = v;
      // a vitrine consome 1 + 3; o que sobra vai para a lista, entao a ultima
      // linha nunca fica com buraco
      const lado = resto.slice(0, 3);
      const sobra = resto.slice(3, 6);
      return `<section class="${c('agsec')}">
<div class="${c('agcab')}"><h2>${H.esc(nome)}</h2>
<a class="${c('agmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
<div class="${c('agvit')}">${agDestaque(ctx, d, false)}
<div class="${c('aglado')}">${lado.map((a, i) => agMini(ctx, a, i)).join('')}</div></div>
${sobra.length ? `<div class="${c('aglista')}">${sobra.map(a => agItem(ctx, a, false)).join('')}</div>` : ''}
</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${agHeader(ctx, menu)}
<main class="${c('agwrap')}"><div class="${c('agin')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${agFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function agAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('agass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="76" height="76" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

/* A legenda so aparece quando o `alt` da imagem descreve a FOTO. Em metade do
 * acervo importado ele e copia do titulo, e ai a legenda repetiria o `h1`
 * palavra por palavra logo abaixo dele. */
function agLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('agleg')}">${H.esc(alt)}</p>`;
}

function agArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('agrel')}">
<span class="${c('agrotb')}">Leia também</span>
<div class="${c('aglista')}">${related.slice(0, 3).map(a => agItem(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${agHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('agwrap')}"><div class="${c('agin')}">
<article class="${c('agart')}">
<div class="${c('agcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('agchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('agdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('aghero')}"><span data-f>${H.pic(art, true)}</span></span>
${agLegenda(ctx, art)}` : ''}
<div class="${c('agbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${agAssinatura(ctx, art)}
${rel}
</div></main>
${agFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function agList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  return `${H.head(ctx, meta)}
${agHeader(ctx, menu)}
<main class="${c('agwrap')}"><div class="${c('agin')}">
<section class="${c('agsec')}">
<div class="${c('agcab')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('agdescr')}">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('aglista')}">${itens.map((a, i) => agItem(ctx, a, i === 0, 2)).join('')}</div>
</section>
</div></main>
${agFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { agCss, agHeader, agFooter, agHome, agArticle, agList };
