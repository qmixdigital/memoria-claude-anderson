/*
 * Arquitetura AF, arquetipo COMPENDIO. Feita para o sabedoriaglobal.com.br.
 *
 * ## De onde vem o desenho
 *
 * O nome promete saber reunido, e o acervo preservado e de almanaque largo:
 * dica, entretenimento, curiosidade, casa, saude, turismo. O desenho pega o
 * gesto do **compendio**: a secao abre como **titulo corrido de pagina**, com
 * filete que atravessa ate a borda e a contagem de verbetes na ponta, e cada
 * item e um **verbete**, com o texto mandando e a miniatura pequena na direita.
 *
 * ## O que a diferencia das 31 vizinhas da opengravity
 *
 *   - **titulo corrido com filete atravessado e contagem na ponta**. A `AE` poe
 *     o rotulo numa coluna de margem, a `AB`, a `AC` e a `AD` poem em cima com
 *     filete curto. Nenhuma leva o filete ate a borda nem conta os itens
 *   - **verbete com texto a esquerda e miniatura a direita**, o inverso da
 *     ficha da `AE`. A imagem vira apoio, e nao abertura de linha
 *   - **capitular na chamada de abertura**: a linha fina comeca com uma letra em
 *     corpo grande, na cor de acento, flutuando a esquerda. E gesto de livro, e
 *     nenhuma vizinha usa capitular em lugar nenhum
 *   - **Eczar e Lexend**: nenhuma das duas aparece nas 75 famílias em uso na rede
 *   - **ameixa-carvao com oliva**: as vizinhas ja ocupam grafite, marinho,
 *     esmeralda, violeta, ocre, vinho, cobalto, terracota, petroleo, carmim,
 *     turquesa, azul-ferrugem, azul-royal, sepia, indigo, verde e ardosia
 *   - **sem grade em nenhum caminho**: home, editoria e relacionados sao listas,
 *     entao nunca sobra buraco na ultima linha e a data nunca pula de coluna
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **Este portal tem `categoryBase`.** O WordPress servia o arquivo de editoria
 * em `/category/<slug>/`, porque `category_base` estava vazio e o padrao do
 * WordPress e `category`. O artigo mora em `/<editoria>/<slug>/`. Montar o link
 * de editoria a mao com `/${'$'}{slug}/` derruba **o menu do topo, o menu do
 * rodape, o titulo de cada secao e o chapeu de cada artigo**, tudo em 404, e nao
 * aparece em print nenhum porque o menu fica bonito e so quebra no clique. Todo
 * link de editoria aqui sai de `H.curl(slug)`, sem excecao.
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por `H.curl(slug)`, nunca montado a mao
 *   - menu sanfonado abaixo de 1100px, com aria-expanded, aria-controls e rotulo
 *     que muda ao abrir
 *   - todo `span` com aspect-ratio tem `display:block`, e o `a` do verbete tem
 *     `display`
 *   - body aberto no cabecalho e `H.bodyEnd()` nos tres caminhos de pagina
 *   - nada centralizado alem da marca, e a chamada de abertura tem texto a
 *     esquerda e imagem a direita
 *   - lista de editoria abre em h1, e o verbete dela sobe para h2
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal,
 *     senao o botao do menu fica invisivel no celular
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS: o CSS
 *     mora num template literal, a crase o fecha e a chave interpola de verdade
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG: wordmark em SVG
 *     ja foi ao ar com letra faltando e nem leitor de tela acusou
 */

function afCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#EDEAE4';
  const viva = t.vivid || '#6E8F2A';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('afwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.72;-webkit-font-smoothing:antialiased}
${s('afwrap')} *{box-sizing:border-box}
${s('afin')}{max-width:${fp.container || '1160px'};margin:0 auto;padding:0 24px;width:100%}
${s('afwrap')} h1,${s('afwrap')} h2,${s('afwrap')} h3,${s('afwrap')} h4{font-family:var(--fd);
  font-weight:600;letter-spacing:-.004em;line-height:1.2;margin:0}
${s('afwrap')} a{color:inherit;text-decoration:none}
${s('afwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho: marca a esquerda, navegacao a direita ---------- */
${s('aftop')}{background:var(--paper);border-bottom:2px solid var(--ink)}
${s('afbar')}{display:flex;align-items:center;gap:18px;padding-block:19px 17px;flex-wrap:wrap}
${s('afmarca')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:700;font-size:clamp(23px,2.9vw,31px);letter-spacing:-.012em;color:var(--ink);
  flex:none}
${s('afmarca')} svg{display:block;height:1em;width:auto;flex:none;align-self:center}
${s('afnav')}{display:flex;gap:12px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('afnav')} a{font-family:var(--fb);font-size:11px;font-weight:600;letter-spacing:.05em;
  text-transform:uppercase;color:var(--muted);transition:color .2s ease}
${s('afnav')} a:hover{color:var(--pri)}
${s('afbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  border:2px solid var(--ink);color:var(--ink);padding:8px 13px;flex:none;margin-left:10px}
${s('afbusca')}:hover{background:var(--ink);color:var(--paper)}
${s('afham')}{display:none;width:46px;height:46px;border:2px solid var(--ink);background:none;
  cursor:pointer;padding:0;position:relative}
${s('afham')} i,${s('afham')} i::before,${s('afham')} i::after{position:absolute;left:11px;
  width:20px;height:2px;background:var(--ink);content:""}
${s('afham')} i{top:21px}
${s('afham')} i::before{top:-6px;left:0}
${s('afham')} i::after{top:6px;left:0}
/* num celular de 360 a 412px a marca, o botao de menu e o de busca somados
   passam da largura e o de busca cai sozinho numa segunda linha */
@media(max-width:560px){
  ${s('afmarca')}{font-size:20px;gap:8px}
  ${s('afbar')}{gap:11px}
  ${s('afbusca')}{font-size:10px;padding:8px 10px;gap:6px}
}
@media(max-width:1100px){
  ${s('afham')}{display:block;order:2}
  ${s('afbusca')}{order:3;margin-left:0}
  ${s('afnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('afnav')}[data-aberto="1"]{display:flex}
  ${s('afnav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink)}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('afabre')}{display:grid;grid-template-columns:1fr 1fr;gap:38px;align-items:center;
  padding-block:40px 34px;border-bottom:1px solid var(--line)}
${s('afabre')} h2{font-size:clamp(29px,4.1vw,46px);letter-spacing:-.014em;line-height:1.12;
  margin:11px 0 0;font-weight:700}
/* capitular: gesto de livro, e nenhuma vizinha usa em lugar nenhum */
${s('afcap')}{font-size:17.5px;line-height:1.64;color:var(--dek);margin:17px 0 0;
  max-width:48ch;text-align:left}
${s('afcap')}::first-letter{float:left;font-family:var(--fd);font-weight:700;font-size:3.1em;
  line-height:.84;color:var(--viva);padding:4px 11px 0 0}
${s('afmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('afmm')} b{color:var(--ink);font-weight:700}
@media(max-width:820px){
  ${s('afabre')}{grid-template-columns:1fr;gap:22px;padding-block:28px 24px}
  ${s('afcap')}::first-letter{font-size:2.7em}
}

/* ---------- titulo corrido da secao: a assinatura desta arquitetura ---------- */
${s('afsec')}{padding-block:32px;border-bottom:1px solid var(--line)}
${s('afcab')}{display:flex;align-items:baseline;gap:16px;margin-bottom:6px}
${s('afcab')} h1,${s('afcab')} h2{font-size:clamp(21px,2.5vw,27px);font-weight:700;
  letter-spacing:.01em;color:var(--ink);flex:none;text-transform:uppercase}
${s('affilete')}{flex:1 1 auto;height:2px;background:var(--ink);min-width:20px}
${s('afconta')}{flex:none;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:var(--viva)}
${s('afmais')}{display:inline-block;margin-top:4px;font-family:var(--fb);font-size:11px;
  font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--pri)}
${s('afmais')}:hover{color:var(--viva);text-decoration:underline}
${s('afdescr')}{margin:9px 0 0;font-size:15px;line-height:1.62;color:var(--dek);
  max-width:70ch;text-align:left}

/* ---------- o verbete: texto a esquerda, miniatura pequena a direita ---------- */
${s('aflista')}{display:block;margin-top:16px}
${s('afverb')}{display:grid;grid-template-columns:minmax(0,1fr) 168px;gap:22px;
  align-items:start;padding-block:17px;border-top:1px solid var(--line)}
${s('aflista')} ${s('afverb')}:first-child{border-top:0;padding-top:4px}
${s('affoto')}{display:block;overflow:hidden;background:var(--ph)}
${s('affoto')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '4/3'};overflow:hidden}
${s('affoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .45s ease}
${s('afverb')}:hover ${s('affoto')} [data-f] img{transform:scale(1.05)}
${s('afkick')}{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--viva);
  margin-bottom:6px}
${s('afti')}{display:block;font-family:var(--fd);font-weight:600;font-size:21px;line-height:1.25;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('afverb')}:hover ${s('afti')}{color:var(--pri)}
${s('afdd')}{display:block;margin:9px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);
  max-width:66ch;text-align:left}
${s('afdt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  color:var(--muted)}
@media(max-width:680px){
  ${s('afverb')}{grid-template-columns:minmax(0,1fr) 96px;gap:14px;padding-block:15px}
  ${s('afti')}{font-size:16.5px}
  ${s('afdd')}{display:none}
  ${s('afcab')}{gap:11px}
}

/* ---------- artigo ---------- */
${s('afart')}{padding-block:28px 8px}
${s('afcol')}{max-width:${fp.medida || '700px'}}
${s('afchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--viva)}
${s('afart')} h1{font-size:clamp(28px,3.9vw,43px);font-weight:700;letter-spacing:-.014em;
  line-height:1.13;margin:12px 0 0}
${s('afdek')}{font-size:19px;line-height:1.58;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('afhero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '870px'}}
${s('afhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('afhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('afleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '870px'};line-height:1.5;text-align:left}
${s('afbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('afbody')} p{margin:0 0 1.15em;text-align:left}
${s('afbody')} h2{font-size:25px;font-weight:700;letter-spacing:-.008em;margin:1.75em 0 .5em;
  padding-bottom:8px;border-bottom:2px solid var(--ink)}
${s('afbody')} h3{font-size:20px;font-weight:600;margin:1.5em 0 .4em;color:var(--pri)}
${s('afbody')} ul,${s('afbody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('afbody')} li{margin:0 0 .45em}
${s('afbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('afbody')} a:hover{color:var(--viva)}
${s('afbody')} img{margin:1.5em 0;background:var(--ph)}
${s('afbody')} blockquote{margin:1.5em 0;padding:4px 0 4px 22px;border-left:3px solid var(--viva);
  font-family:var(--fd);font-size:20px;line-height:1.5;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('afbody')} .sab-veja{margin:2.2em 0;padding:19px 23px 17px;background:var(--wash);
  border-top:2px solid var(--ink)}
${s('afbody')} .sab-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--muted);
  margin:0 0 11px;padding:0;border:0}
${s('afbody')} .sab-veja ul{list-style:none;margin:0;padding:0}
${s('afbody')} .sab-veja li{margin:0;padding:9px 0;border-top:1px solid var(--line)}
${s('afbody')} .sab-veja li:first-child{border-top:0;padding-top:0}
${s('afbody')} .sab-veja a{font-family:var(--fd);font-size:17px;line-height:1.35;
  color:var(--ink);text-decoration:none;display:block}
${s('afbody')} .sab-veja a:hover{color:var(--viva)}
${s('afbody')} figure{margin:1.5em 0}
${s('afbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('afbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('afbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('afbody')} th,${s('afbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('afbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--ink)}
@media(max-width:640px){
  ${s('afbody')} table{min-width:0}
  ${s('afbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('afbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('afbody')} table,${s('afbody')} tbody,${s('afbody')} tr,${s('afbody')} th,
  ${s('afbody')} td{display:block;width:auto}
  ${s('afbody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    padding:2px 18px 16px;margin-bottom:13px}
  ${s('afbody')} tbody th,${s('afbody')} tbody td{border:0;background:transparent}
  ${s('afbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:16px;
    font-family:var(--fd);font-weight:600;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('afbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('afbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('afass')}{display:grid;grid-template-columns:76px minmax(0,1fr);gap:17px;align-items:start;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;border-top:2px solid var(--ink)}
${s('afass')} img{width:76px;height:76px;object-fit:cover;background:var(--ph)}
${s('afass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--viva)}
${s('afass')} .nm{display:block;font-family:var(--fd);font-size:21px;font-weight:700;margin-top:3px}
${s('afass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('afass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('afass')} .go:hover{text-decoration:underline}
${s('afrel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('afrotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.11em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}

/* ---------- rodape ---------- */
${s('affoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('afcols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('affb')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:700;font-size:25px;color:#fff}
${s('affb')} svg{display:block;height:1em;width:auto;flex:none;align-self:center}
${s('affoot')} p{color:${t.footerTx || '#ABA3A9'};text-align:left}
${s('affh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:${t.footerTx || '#ABA3A9'};margin-bottom:13px}
${s('afflist')}{display:flex;flex-direction:column;gap:9px}
${s('afflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('afflist')} a:hover{opacity:1;color:var(--viva)}
${s('affim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12.5px;color:${t.footerTx || '#ABA3A9'}}
@media(max-width:820px){
  ${s('afcols')}{grid-template-columns:1fr;gap:26px}
  ${s('affoot')}{padding-block:34px 22px}
}

/* ---------- animacao de entrada, respeitando quem pediu menos movimento ---------- */
@media(prefers-reduced-motion:no-preference){
  ${s('reveal')}{opacity:0;transform:translateY(12px);
    transition:opacity .5s ease,transform .5s ease}
  ${s('reveal')}[data-vis="1"]{opacity:1;transform:none}
}`;
}

/* Compendio: tres cadernos empilhados de larguras iguais e alturas diferentes,
 * com o do meio em destaque. Sem letra dentro: o nome vem como texto ao lado, e
 * wordmark em SVG ja foi ao ar com letra faltando sem ninguem notar. */
const AF_SIMB = `<svg viewBox="0 0 26 26" role="img" aria-hidden="true" focusable="false"><rect x="1" y="3" width="7" height="20" fill="var(--marca-1,currentColor)"/><rect x="10" y="7" width="7" height="16" fill="var(--marca-2,currentColor)"/><rect x="19" y="11" width="6" height="12" fill="var(--marca-3,currentColor)"/></svg>`;

const AF_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function afHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'afnav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase: a editoria mora em /category/<slug>/.
  // H.curl resolve isso; montar o link a mao poe o menu inteiro em 404.
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('aftop')}">
<div class="${c('afin')} ${c('afbar')}">
<a class="${c('afmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--ink);--marca-2:var(--viva);--marca-3:var(--pri)">${AF_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<nav class="${c('afnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('afham')}" type="button" data-afham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('afbusca')}" href="/busca/">${AF_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-afham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function afFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('affoot')}"><div class="${c('afin')}">
<div class="${c('afcols')}">
  <div><a class="${c('affb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva);--marca-3:var(--viva)">${AF_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('affh')}">Editorias</div><div class="${c('afflist')}">${cats}</div></div>
  <div><div class="${c('affh')}">O compêndio</div><div class="${c('afflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('affim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* O verbete. O `span` da miniatura tem display:block, senao o aspect-ratio nao
 * aplica e a imagem passa por cima do titulo.
 * O nivel do titulo vem de quem chama: h3 sob um h2 de secao na home, h2 na
 * lista de editoria, onde o titulo da pagina e h1. */
function afVerbete(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('afverb')} ${c('reveal')}" href="${H.url(a)}">
<span><span class="${c('afkick')}">${H.cat(a)}</span>
<h${n} class="${c('afti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('afdd')}">${H.esc(H.clip(a.dek, 165))}</span>` : ''}
<span class="${c('afdt')}">${H.esc(H.dateShort(a.date))}</span></span>
<span class="${c('affoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
</a>`;
}

/* O titulo corrido da secao: nome, filete que atravessa ate a borda e a contagem
 * de verbetes na ponta. E a assinatura desta arquitetura. */
function afCabeca(ctx, nome, quantos, nivel) {
  const { c, H } = ctx;
  const n = nivel === 1 ? 'h1' : 'h2';
  const conta = quantos > 0
    ? `<span class="${c('afconta')}">${quantos} ${quantos === 1 ? 'verbete' : 'verbetes'}</span>`
    : '';
  return `<div class="${c('afcab')}"><${n}>${H.esc(nome)}</${n}>
<span class="${c('affilete')}"></span>${conta}</div>`;
}

function afHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('afabre')}">
<div><span class="${c('afchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p class="${c('afcap')}">${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('afmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('affoto')}">
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
      // lista, e nao grade: a ultima linha nunca fica com buraco
      return `<section class="${c('afsec')}">
${afCabeca(ctx, nome, v.length, 2)}
<a class="${c('afmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a>
<div class="${c('aflista')}">${v.slice(0, 4).map(a => afVerbete(ctx, a, false)).join('')}</div>
</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${afHeader(ctx, menu)}
<main class="${c('afwrap')}"><div class="${c('afin')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${afFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. Inventar `bio` ou `editorias` nao da erro em lugar
 * nenhum, so nao gera nada. */
function afAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('afass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="76" height="76" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

/* A legenda so aparece quando o `alt` da imagem descreve a FOTO. Em metade do
 * acervo importado ele e uma copia do titulo, e ai a legenda repetiria o `h1`
 * palavra por palavra logo abaixo dele, que e duplicacao a esmo. O `alt` do
 * proprio `img` continua saindo por `H.pic`, para quem nao ve a imagem. */
function afLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('afleg')}">${H.esc(alt)}</p>`;
}

function afArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema. Nao ha helper para calcular isso na arquitetura.
  const rel = (related && related.length) ? `<section class="${c('afrel')}">
<span class="${c('afrotb')}">Leia também</span>
<div class="${c('aflista')}">${related.slice(0, 3).map(a => afVerbete(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${afHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('afwrap')}"><div class="${c('afin')}">
<article class="${c('afart')}">
<div class="${c('afcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('afchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('afdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('afhero')}"><span data-f>${H.pic(art, true)}</span></span>
${afLegenda(ctx, art)}` : ''}
<div class="${c('afbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${afAssinatura(ctx, art)}
${rel}
</div></main>
${afFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function afList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  return `${H.head(ctx, meta)}
${afHeader(ctx, menu)}
<main class="${c('afwrap')}"><div class="${c('afin')}">
<section class="${c('afsec')}">
${afCabeca(ctx, opts.title, itens.length, 1)}
${opts.desc ? `<p class="${c('afdescr')}">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('aflista')}">${itens.map((a, i) => afVerbete(ctx, a, i === 0, 2)).join('')}</div>
</section>
</div></main>
${afFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { afCss, afHeader, afFooter, afHome, afArticle, afList };
