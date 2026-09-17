/*
 * Arquitetura AJ, arquetipo GAZETA. Feita para o jornaldobairroalto.com.br.
 *
 * ## De onde vem o desenho
 *
 * O portal e um jornal de bairro, e o acervo preservado e de servico: dica,
 * saude, negocio local, casa e entretenimento. O desenho pega o gesto da
 * **gazeta**: cada secao abre com **fio duplo** e o nome em versalete, as duas
 * materias principais vem **lado a lado separadas por um fio vertical**, e as
 * demais viram **teletipo**, com a data numa coluna a esquerda e **sem
 * miniatura nenhuma**.
 *
 * ## O que a diferencia das 35 vizinhas da opengravity
 *
 *   - **lista sem miniatura**, com coluna de data a esquerda. Todas as 35 usam
 *     imagem na lista: retangulo, circulo ou quadrado. Tirar a imagem muda a
 *     silhueta da pagina inteira, e e o que um jornal de bairro faz
 *   - **duas materias lado a lado com fio vertical** na abertura da secao, em
 *     vez de uma materia principal so
 *   - **fio duplo sobre o nome da secao**, contra o filete grosso da `AI`, a
 *     pastilha da `AH`, a regua da `AF` e a coluna de margem da `AE`
 *   - **Alegreya e Commissioner**: nenhuma das duas aparece nas 88 familias em
 *     uso na maquina
 *   - **musgo com telha**: nao existe verde escuro entre as 22 paletas da rede
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **A origem tem `category_base` VAZIO, e vazio significa `category`, em
 * ingles.** O arquivo de editoria mora em `/category/<slug>/`, e nao em
 * `/categoria/<slug>/`. Cravar "categoria" por analogia com os vizinhos poe a
 * editoria inteira em 404. O `categoryBase` deste portal e `category`, e todo
 * link de editoria sai de `H.curl(slug)`.
 *
 * ⚠️ Como o artigo mora em `/<editoria>/<slug>/`, `/<editoria>/` vira diretorio
 * sem indice e o nginx responde 403: o vhost precisa do 301 de cada editoria e
 * do `error_page 403 =404`.
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por `H.curl(slug)` e de artigo por `H.url(a)`
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
 *   - a legenda da imagem so aparece quando o `alt` descreve a foto
 *   - a grade de duas materias vira uma coluna abaixo de 820px, e o fio vertical
 *     vira fio horizontal, para nao sobrar risco solto
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG
 */

function ajCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#EDEDE3';
  const viva = t.vivid || '#B4482B';
  const canto = fp.radius === 'sharp' ? '0' : '2px';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('ajwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('ajwrap')} *{box-sizing:border-box}
${s('ajin')}{max-width:${fp.container || '1180px'};margin:0 auto;padding:0 24px;width:100%}
${s('ajwrap')} h1,${s('ajwrap')} h2,${s('ajwrap')} h3,${s('ajwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.004em;line-height:1.17;margin:0}
${s('ajwrap')} a{color:inherit;text-decoration:none}
${s('ajwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('ajtop')}{background:var(--paper);border-bottom:3px double var(--ink)}
${s('ajbar')}{display:flex;align-items:center;gap:18px;padding-block:19px 16px;flex-wrap:wrap}
${s('ajmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:clamp(23px,3vw,32px);letter-spacing:-.018em;color:var(--pri);flex:none}
${s('ajmarca')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
${s('ajnav')}{display:flex;gap:14px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('ajnav')} a{font-family:var(--fb);font-size:11.5px;font-weight:600;letter-spacing:.05em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('ajnav')} a:hover{color:var(--viva)}
${s('ajbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--pri);color:#fff;padding:10px 16px;border-radius:${canto};flex:none;margin-left:8px}
${s('ajbusca')}:hover{background:var(--viva)}
${s('ajham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('ajham')} i,${s('ajham')} i::before,${s('ajham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--pri);content:""}
${s('ajham')} i{top:21px}
${s('ajham')} i::before{top:-6px;left:0}
${s('ajham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('ajmarca')}{font-size:21px;gap:8px}
  ${s('ajbar')}{gap:11px}
  ${s('ajbusca')}{font-size:10px;padding:9px 12px;gap:6px}
}
@media(max-width:1100px){
  ${s('ajham')}{display:block;order:2}
  ${s('ajbusca')}{order:3;margin-left:0}
  ${s('ajnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('ajnav')}[data-aberto="1"]{display:flex}
  ${s('ajnav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink)}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('ajabre')}{display:grid;grid-template-columns:1.06fr 1fr;gap:44px;align-items:center;
  padding-block:38px 32px;border-bottom:1px solid var(--line)}
${s('ajabre')} h2{font-size:clamp(31px,4.4vw,52px);line-height:1.05;margin:12px 0 0;
  letter-spacing:-.02em}
${s('ajabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('ajmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('ajmm')} b{color:var(--ink);font-weight:700}
${s('ajfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('ajfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('ajfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
@media(max-width:820px){${s('ajabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 22px}}

/* ---------- a secao: fio duplo e nome em versalete ---------- */
${s('ajsec')}{padding-block:32px}
${s('ajsec')}+${s('ajsec')}{border-top:1px solid var(--line)}
${s('ajcab')}{display:flex;align-items:baseline;justify-content:space-between;gap:16px;
  margin-bottom:22px;flex-wrap:wrap;border-top:4px double var(--ink);padding-top:10px}
${s('ajcab')} h1,${s('ajcab')} h2{font-family:var(--fb);font-size:13px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--pri)}
${s('ajmais')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--viva);flex:none}
${s('ajmais')}:hover{text-decoration:underline}
${s('ajdescr')}{margin:0 0 20px;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:70ch;text-align:left}

/* duas materias lado a lado, com fio vertical entre elas */
${s('ajduas')}{display:grid;grid-template-columns:1fr 1fr;gap:30px;padding-bottom:24px}
${s('ajduas')}>*+*{border-left:1px solid var(--line);padding-left:30px}
${s('ajdest')}{display:block}
${s('ajdest')} ${s('ajti')}{font-size:clamp(20px,2.2vw,25px);line-height:1.18;margin-top:11px}
${s('ajkick')}{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--viva)}
${s('ajti')}{display:block;font-family:var(--fd);font-weight:700;font-size:19.5px;line-height:1.2;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('ajdd')}{display:block;margin:10px 0 0;font-size:15.5px;line-height:1.58;color:var(--dek);
  max-width:52ch;text-align:left}
${s('ajdt')}{display:block;margin-top:10px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('ajdest')}:hover ${s('ajti')}{color:var(--pri)}
${s('ajdest')}:hover ${s('ajfoto')} [data-f] img{transform:scale(1.03)}
@media(max-width:820px){
  ${s('ajduas')}{grid-template-columns:1fr;gap:24px}
  /* o fio vertical vira horizontal, senao sobra um risco solto na coluna */
  ${s('ajduas')}>*+*{border-left:0;padding-left:0;border-top:1px solid var(--line);padding-top:24px}
}

/* teletipo: data na coluna da esquerda e NENHUMA miniatura.
   E a assinatura desta arquitetura: as 35 vizinhas todas usam imagem na lista. */
${s('ajlista')}{display:block;border-top:1px solid var(--ink)}
${s('ajrow')}{display:grid;grid-template-columns:96px minmax(0,1fr);gap:20px;
  align-items:baseline;padding-block:14px;border-bottom:1px solid var(--line)}
${s('ajquando')}{display:block;font-family:var(--fb);font-size:11.5px;font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;color:var(--viva);
  font-variant-numeric:tabular-nums;padding-top:3px}
${s('ajrow')}:hover ${s('ajti')}{color:var(--pri)}
${s('ajrow')} ${s('ajti')}{font-size:18px}
${s('ajrow')} ${s('ajkick')}{color:var(--muted);margin-bottom:4px}
@media(max-width:680px){
  ${s('ajrow')}{grid-template-columns:1fr;gap:4px}
  ${s('ajquando')}{padding-top:0}
  ${s('ajdd')}{display:none}
}

/* ---------- artigo ---------- */
${s('ajart')}{padding-block:30px 8px}
${s('ajcol')}{max-width:${fp.medida || '700px'}}
${s('ajchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--viva)}
${s('ajart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.07;margin:13px 0 0;
  letter-spacing:-.02em}
${s('ajdek')}{font-size:19px;line-height:1.54;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('ajhero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'};border-radius:${canto}}
${s('ajhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('ajhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('ajleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('ajbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('ajbody')} p{margin:0 0 1.15em;text-align:left}
${s('ajbody')} h2{font-family:var(--fd);font-size:27px;font-weight:700;margin:1.75em 0 .5em;
  letter-spacing:-.012em}
${s('ajbody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--pri)}
${s('ajbody')} ul,${s('ajbody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('ajbody')} li{margin:0 0 .45em}
${s('ajbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('ajbody')} a:hover{color:var(--viva)}
${s('ajbody')} img{margin:1.5em 0;background:var(--ph);border-radius:${canto}}
${s('ajbody')} blockquote{margin:1.6em 0;padding:4px 0 4px 22px;border-left:3px double var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.38;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('ajbody')} .jba-veja{margin:2.2em 0;padding:18px 0 16px;border-top:4px double var(--ink);
  border-bottom:1px solid var(--line)}
${s('ajbody')} .jba-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--pri);
  margin:0 0 11px}
${s('ajbody')} .jba-veja ul{list-style:none;margin:0;padding:0}
${s('ajbody')} .jba-veja li{margin:0;padding:8px 0;border-top:1px solid rgba(0,0,0,.08)}
${s('ajbody')} .jba-veja li:first-child{border-top:0;padding-top:0}
${s('ajbody')} .jba-veja a{font-family:var(--fd);font-size:17px;line-height:1.3;color:var(--ink);
  text-decoration:none;display:block}
${s('ajbody')} .jba-veja a:hover{color:var(--viva)}
${s('ajbody')} figure{margin:1.5em 0}
${s('ajbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('ajbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('ajbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('ajbody')} th,${s('ajbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('ajbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:3px double var(--ink)}
@media(max-width:640px){
  ${s('ajbody')} table{min-width:0}
  ${s('ajbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('ajbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('ajbody')} table,${s('ajbody')} tbody,${s('ajbody')} tr,${s('ajbody')} th,
  ${s('ajbody')} td{display:block;width:auto}
  ${s('ajbody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:${canto};padding:2px 18px 16px;margin-bottom:13px}
  ${s('ajbody')} tbody th,${s('ajbody')} tbody td{border:0;background:transparent}
  ${s('ajbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:700;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('ajbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('ajbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('ajass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:center;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;
  border-top:4px double var(--ink)}
${s('ajass')} img{width:84px;height:84px;object-fit:cover;background:var(--ph);border-radius:${canto}}
${s('ajass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--viva)}
${s('ajass')} .nm{display:block;font-family:var(--fd);font-size:22px;font-weight:700;margin-top:3px}
${s('ajass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('ajass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('ajass')} .go:hover{text-decoration:underline}
${s('ajrel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('ajrotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--pri);
  border-top:4px double var(--ink);padding-top:9px;margin-bottom:2px}

/* ---------- rodape ---------- */
${s('ajfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('ajcols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('ajfb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:26px;color:#fff}
${s('ajfb')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
${s('ajfoot')} p{color:${t.footerTx || '#AFBCAF'};text-align:left}
${s('ajfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:${t.footerTx || '#AFBCAF'};margin-bottom:13px}
${s('ajflist')}{display:flex;flex-direction:column;gap:9px}
${s('ajflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('ajflist')} a:hover{opacity:1;color:var(--viva)}
${s('ajfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.18);
  font-size:12.5px;color:${t.footerTx || '#AFBCAF'}}
@media(max-width:820px){
  ${s('ajcols')}{grid-template-columns:1fr;gap:26px}
  ${s('ajfoot')}{padding-block:34px 22px}
}

/* ---------- animacao de entrada, respeitando quem pediu menos movimento ---------- */
@media(prefers-reduced-motion:no-preference){
  ${s('reveal')}{opacity:0;transform:translateY(12px);
    transition:opacity .5s ease,transform .5s ease}
  ${s('reveal')}[data-vis="1"]{opacity:1;transform:none}
}`;
}

/* Gazeta: duas colunas com um fio entre elas, que e o proprio arranjo da secao.
 * Sem letra dentro: o nome vem como texto ao lado. */
const AJ_SIMB = `<svg viewBox="0 0 30 26" role="img" aria-hidden="true" focusable="false"><rect x="1" y="5" width="11" height="16" fill="var(--marca-1,currentColor)"/><rect x="14.5" y="5" width="2" height="16" fill="var(--marca-2,currentColor)"/><rect x="19" y="5" width="10" height="16" fill="none" stroke="var(--marca-1,currentColor)" stroke-width="2.5"/></svg>`;

const AJ_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function ajHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'ajnav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase "category", em INGLES, porque na origem o
  // campo estava vazio e vazio significa `category`. Montar /categoria/ a mao
  // poe o menu inteiro em 404, e o menu continua bonito no print
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('ajtop')}">
<div class="${c('ajin')} ${c('ajbar')}">
<a class="${c('ajmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--pri);--marca-2:var(--viva)">${AJ_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<nav class="${c('ajnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('ajham')}" type="button" data-ajham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('ajbusca')}" href="/busca/">${AJ_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-ajham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function ajFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('ajfoot')}"><div class="${c('ajin')}">
<div class="${c('ajcols')}">
  <div><a class="${c('ajfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva)">${AJ_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('ajfh')}">Editorias</div><div class="${c('ajflist')}">${cats}</div></div>
  <div><div class="${c('ajfh')}">O jornal</div><div class="${c('ajflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('ajfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* Uma das duas materias de abertura da secao: imagem em cima, texto abaixo. O
 * `span` da foto tem display:block, senao o aspect-ratio nao aplica. */
function ajDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('ajdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('ajfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span class="${c('ajkick')}" style="margin-top:13px;display:block">${H.cat(a)}</span>
<h${n} class="${c('ajti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('ajdd')}">${H.esc(H.clip(a.dek, 165))}</span>` : ''}
<span class="${c('ajdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

/* O teletipo: data na coluna da esquerda e nenhuma miniatura. */
function ajLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('ajrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('ajquando')}">${H.esc(H.dateShort(a.date))}</span>
<span><span class="${c('ajkick')}">${H.cat(a)}</span>
<h${n} class="${c('ajti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('ajdd')}">${H.esc(H.clip(a.dek, 150))}</span>` : ''}</span>
</a>`;
}

function ajHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('ajabre')}">
<div><span class="${c('ajchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('ajmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('ajfoto')}">
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
      const duas = v.slice(0, 2);
      const resto = v.slice(2, 7);
      return `<section class="${c('ajsec')}">
<div class="${c('ajcab')}"><h2>${H.esc(nome)}</h2>
<a class="${c('ajmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
<div class="${c('ajduas')}">${duas.map(a => ajDestaque(ctx, a, false)).join('')}</div>
${resto.length ? `<div class="${c('ajlista')}">${resto.map(a => ajLinha(ctx, a)).join('')}</div>` : ''}
</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${ajHeader(ctx, menu)}
<main class="${c('ajwrap')}"><div class="${c('ajin')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${ajFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function ajAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('ajass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="84" height="84" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

/* A legenda so aparece quando o `alt` da imagem descreve a FOTO. Em metade do
 * acervo importado ele e copia do titulo, e ai a legenda repetiria o `h1`. */
function ajLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('ajleg')}">${H.esc(alt)}</p>`;
}

function ajArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('ajrel')}">
<span class="${c('ajrotb')}">Leia também</span>
<div class="${c('ajlista')}">${related.slice(0, 3).map(a => ajLinha(ctx, a)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${ajHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('ajwrap')}"><div class="${c('ajin')}">
<article class="${c('ajart')}">
<div class="${c('ajcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('ajchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('ajdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('ajhero')}"><span data-f>${H.pic(art, true)}</span></span>
${ajLegenda(ctx, art)}` : ''}
<div class="${c('ajbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${ajAssinatura(ctx, art)}
${rel}
</div></main>
${ajFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function ajList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const duas = itens.slice(0, 2);
  const resto = itens.slice(2);
  return `${H.head(ctx, meta)}
${ajHeader(ctx, menu)}
<main class="${c('ajwrap')}"><div class="${c('ajin')}">
<section class="${c('ajsec')}">
<div class="${c('ajcab')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('ajdescr')}">${H.esc(opts.desc)}</p>` : ''}
${duas.length ? `<div class="${c('ajduas')}">${duas.map((a, i) => ajDestaque(ctx, a, i === 0, 2)).join('')}</div>` : ''}
${resto.length ? `<div class="${c('ajlista')}">${resto.map(a => ajLinha(ctx, a, 2)).join('')}</div>` : ''}
</section>
</div></main>
${ajFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { ajCss, ajHeader, ajFooter, ajHome, ajArticle, ajList };
