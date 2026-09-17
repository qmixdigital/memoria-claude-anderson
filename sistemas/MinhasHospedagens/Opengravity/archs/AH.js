/*
 * Arquitetura AH, arquetipo CADERNO. Feita para o desassossegada.com.br.
 *
 * ## De onde vem o desenho
 *
 * O nome vem do desassossego, e o acervo preservado e de caderno de revista:
 * entretenimento, dica, moda, saude, casa e beleza. O desenho pega o gesto do
 * **caderno**: cada secao abre com uma **etiqueta em pastilha cheia**, a materia
 * principal vem com a **faixa de imagem por cima do texto**, e as demais viram
 * **linhas com miniatura redonda**.
 *
 * ## O que a diferencia das 33 vizinhas da opengravity
 *
 *   - **miniatura redonda**. Todas as vizinhas usam retangulo com
 *     `aspect-ratio`: a `AD` em retrato, a `AE` e a `AF` deitada, a `AG` mista.
 *     Circulo nao aparece em nenhuma, e e o que mais muda a silhueta da pagina
 *   - **etiqueta de secao em pastilha cheia**, e nao filete, coluna de margem
 *     nem titulo corrido
 *   - **faixa de imagem por cima do texto** na materia principal de cada secao,
 *     em vez de imagem ao lado
 *   - **Bodoni Moda e Sen**: nenhuma das duas aparece nas 79 famílias em uso
 *   - **carvao com rosa-envelhecido**: os acentos das vizinhas sao todos quentes
 *     e saturados, ou frios e vivos. Um rosa dessaturado nao existe na rede
 *   - **sem grade em nenhum caminho**: home, editoria e relacionados sao listas
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **Este portal tem permalink PLANO e `categoryBase` ao mesmo tempo.** O
 * artigo mora em `/<slug>/`, na raiz, e o arquivo de editoria em
 * `/categoria/<slug>/`. E o unico par assim da maquina: os outros tem os dois
 * campos casados. Montar qualquer um dos dois a mao quebra metade do site sem
 * aparecer em print. O link de artigo sai de `H.url(a)` e o de editoria de
 * `H.curl(slug)`, sempre.
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
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG
 */

function ahCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#F0E9E6';
  const viva = t.vivid || '#A65A78';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('ahwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.7;-webkit-font-smoothing:antialiased}
${s('ahwrap')} *{box-sizing:border-box}
${s('ahin')}{max-width:${fp.container || '1140px'};margin:0 auto;padding:0 24px;width:100%}
${s('ahwrap')} h1,${s('ahwrap')} h2,${s('ahwrap')} h3,${s('ahwrap')} h4{font-family:var(--fd);
  font-weight:600;letter-spacing:-.006em;line-height:1.18;margin:0}
${s('ahwrap')} a{color:inherit;text-decoration:none}
${s('ahwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('ahtop')}{background:var(--paper);border-bottom:1px solid var(--line)}
${s('ahbar')}{display:flex;align-items:center;gap:18px;padding-block:20px 18px;flex-wrap:wrap}
${s('ahmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:600;font-size:clamp(24px,3vw,33px);letter-spacing:-.01em;color:var(--ink);flex:none}
${s('ahmarca')} svg{display:block;height:.9em;width:auto;flex:none;align-self:center}
${s('ahnav')}{display:flex;gap:13px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('ahnav')} a{font-family:var(--fb);font-size:11px;font-weight:600;letter-spacing:.05em;
  text-transform:uppercase;color:var(--muted);transition:color .2s ease}
${s('ahnav')} a:hover{color:var(--viva)}
${s('ahbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--viva);color:#fff;padding:9px 15px;border-radius:999px;flex:none;margin-left:8px}
${s('ahham')}{display:none;width:46px;height:46px;border:1px solid var(--line);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:999px}
${s('ahham')} i,${s('ahham')} i::before,${s('ahham')} i::after{position:absolute;left:13px;
  width:19px;height:2px;background:var(--ink);content:""}
${s('ahham')} i{top:22px}
${s('ahham')} i::before{top:-6px;left:0}
${s('ahham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('ahmarca')}{font-size:21px;gap:8px}
  ${s('ahbar')}{gap:11px}
  ${s('ahbusca')}{font-size:10px;padding:8px 12px;gap:6px}
}
@media(max-width:1100px){
  ${s('ahham')}{display:block;order:2}
  ${s('ahbusca')}{order:3;margin-left:0}
  ${s('ahnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('ahnav')}[data-aberto="1"]{display:flex}
  ${s('ahnav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink)}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('ahabre')}{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;
  padding-block:42px 36px;border-bottom:1px solid var(--line)}
${s('ahabre')} h2{font-size:clamp(30px,4.3vw,50px);line-height:1.06;margin:13px 0 0;
  letter-spacing:-.018em}
${s('ahabre')} p{font-size:17.5px;line-height:1.62;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('ahmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('ahmm')} b{color:var(--ink);font-weight:700}
${s('ahabre')} ${s('ahfaixa')}{border-radius:${fp.radius === 'sharp' ? '0' : '18px'}}
@media(max-width:820px){${s('ahabre')}{grid-template-columns:1fr;gap:22px;padding-block:28px 24px}}

/* ---------- a secao: etiqueta em pastilha, materia principal e linhas ---------- */
${s('ahsec')}{padding-block:34px;border-bottom:1px solid var(--line)}
${s('ahcab')}{display:flex;align-items:center;justify-content:space-between;gap:16px;
  margin-bottom:20px;flex-wrap:wrap}
/* pastilha cheia: nenhuma vizinha usa etiqueta assim */
${s('ahpast')}{display:inline-block;background:var(--pri);color:var(--sob);border-radius:999px;
  padding:8px 19px}
${s('ahpast')} h1,${s('ahpast')} h2{font-family:var(--fb);font-size:12px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.13em'};text-transform:uppercase;color:var(--sob)}
${s('ahmais')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--viva);flex:none}
${s('ahmais')}:hover{text-decoration:underline}
${s('ahdescr')}{margin:0 0 18px;font-size:15px;line-height:1.62;color:var(--dek);
  max-width:70ch;text-align:left}

/* materia principal: faixa de imagem por cima do texto */
${s('ahdest')}{display:block;margin-bottom:6px}
${s('ahfaixa')}{display:block;overflow:hidden;background:var(--ph)}
${s('ahfaixa')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '21/9'};overflow:hidden}
${s('ahfaixa')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('ahdest')}:hover ${s('ahfaixa')} [data-f] img{transform:scale(1.03)}
${s('ahdest')} ${s('ahti')}{font-size:28px;margin-top:15px;max-width:24ch}
${s('ahkick')}{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.13em'};text-transform:uppercase;color:var(--viva);
  margin-bottom:6px}
${s('ahti')}{display:block;font-family:var(--fd);font-weight:600;font-size:19px;line-height:1.24;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('ahdd')}{display:block;margin:10px 0 0;font-size:15px;line-height:1.6;color:var(--dek);
  max-width:62ch;text-align:left}
${s('ahdt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}

/* linha com miniatura redonda, que e a assinatura desta arquitetura */
${s('ahlista')}{display:block;margin-top:18px}
${s('ahrow')}{display:grid;grid-template-columns:92px minmax(0,1fr);gap:18px;align-items:center;
  padding-block:15px;border-top:1px solid var(--line)}
${s('ahredondo')}{display:block;width:92px;height:92px;border-radius:50%;overflow:hidden;
  background:var(--ph);flex:none}
${s('ahredondo')} [data-f]{display:block;width:92px;height:92px;overflow:hidden;border-radius:50%}
${s('ahredondo')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('ahrow')}:hover ${s('ahredondo')} [data-f] img{transform:scale(1.08)}
${s('ahrow')}:hover ${s('ahti')}{color:var(--viva)}
@media(max-width:680px){
  ${s('ahrow')}{grid-template-columns:66px minmax(0,1fr);gap:14px}
  ${s('ahredondo')},${s('ahredondo')} [data-f]{width:66px;height:66px}
  ${s('ahdest')} ${s('ahti')}{font-size:22px}
  ${s('ahdd')}{display:none}
}

/* ---------- artigo ---------- */
${s('ahart')}{padding-block:30px 8px}
${s('ahcol')}{max-width:${fp.medida || '700px'}}
${s('ahchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.13em'};text-transform:uppercase;color:var(--viva)}
${s('ahart')} h1{font-size:clamp(29px,4.1vw,46px);line-height:1.08;margin:13px 0 0;
  letter-spacing:-.018em}
${s('ahdek')}{font-size:19px;line-height:1.56;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('ahhero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '870px'}}
${s('ahhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '21/9'};overflow:hidden}
${s('ahhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('ahleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '870px'};line-height:1.5;text-align:left}
${s('ahbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.8;margin-top:26px}
${s('ahbody')} p{margin:0 0 1.15em;text-align:left}
${s('ahbody')} h2{font-family:var(--fd);font-size:27px;font-weight:600;margin:1.75em 0 .5em}
${s('ahbody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--pri)}
${s('ahbody')} ul,${s('ahbody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('ahbody')} li{margin:0 0 .45em}
${s('ahbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('ahbody')} a:hover{color:var(--viva)}
${s('ahbody')} img{margin:1.5em 0;background:var(--ph)}
${s('ahbody')} blockquote{margin:1.6em 0;padding:2px 0 2px 24px;border-left:2px solid var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.4;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('ahbody')} .des-veja{margin:2.2em 0;padding:20px 24px 18px;background:var(--wash);
  border-radius:${fp.radius === 'sharp' ? '0' : '16px'}}
${s('ahbody')} .des-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.13em'};text-transform:uppercase;color:var(--pri);
  margin:0 0 11px}
${s('ahbody')} .des-veja ul{list-style:none;margin:0;padding:0}
${s('ahbody')} .des-veja li{margin:0;padding:9px 0;border-top:1px solid rgba(0,0,0,.08)}
${s('ahbody')} .des-veja li:first-child{border-top:0;padding-top:0}
${s('ahbody')} .des-veja a{font-family:var(--fd);font-size:17px;line-height:1.32;color:var(--ink);
  text-decoration:none;display:block}
${s('ahbody')} .des-veja a:hover{color:var(--viva)}
${s('ahbody')} figure{margin:1.5em 0}
${s('ahbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('ahbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('ahbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('ahbody')} th,${s('ahbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('ahbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--ink)}
@media(max-width:640px){
  ${s('ahbody')} table{min-width:0}
  ${s('ahbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('ahbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('ahbody')} table,${s('ahbody')} tbody,${s('ahbody')} tr,${s('ahbody')} th,
  ${s('ahbody')} td{display:block;width:auto}
  ${s('ahbody')} tbody tr{background:var(--surf);border:1px solid var(--line);border-radius:14px;
    padding:2px 18px 16px;margin-bottom:13px}
  ${s('ahbody')} tbody th,${s('ahbody')} tbody td{border:0;background:transparent}
  ${s('ahbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:600;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('ahbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('ahbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('ahass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:center;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;border-top:1px solid var(--line)}
${s('ahass')} img{width:84px;height:84px;object-fit:cover;background:var(--ph);border-radius:50%}
${s('ahass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:var(--viva)}
${s('ahass')} .nm{display:block;font-family:var(--fd);font-size:22px;font-weight:600;margin-top:3px}
${s('ahass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('ahass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('ahass')} .go:hover{text-decoration:underline}
${s('ahrel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('ahrotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}

/* ---------- rodape ---------- */
${s('ahfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('ahcols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('ahfb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:600;font-size:26px;color:#fff}
${s('ahfb')} svg{display:block;height:.9em;width:auto;flex:none;align-self:center}
${s('ahfoot')} p{color:${t.footerTx || '#B3A7A4'};text-align:left}
${s('ahfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:${t.footerTx || '#B3A7A4'};margin-bottom:13px}
${s('ahflist')}{display:flex;flex-direction:column;gap:9px}
${s('ahflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('ahflist')} a:hover{opacity:1;color:var(--viva)}
${s('ahfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12.5px;color:${t.footerTx || '#B3A7A4'}}
@media(max-width:820px){
  ${s('ahcols')}{grid-template-columns:1fr;gap:26px}
  ${s('ahfoot')}{padding-block:34px 22px}
}

/* ---------- animacao de entrada, respeitando quem pediu menos movimento ---------- */
@media(prefers-reduced-motion:no-preference){
  ${s('reveal')}{opacity:0;transform:translateY(12px);
    transition:opacity .5s ease,transform .5s ease}
  ${s('reveal')}[data-vis="1"]{opacity:1;transform:none}
}`;
}

/* Caderno: tres circulos de tamanhos diferentes, que e o proprio gesto da lista.
 * Sem letra dentro: o nome vem como texto ao lado. */
const AH_SIMB = `<svg viewBox="0 0 30 26" role="img" aria-hidden="true" focusable="false"><circle cx="8" cy="13" r="7" fill="var(--marca-1,currentColor)"/><circle cx="19" cy="13" r="5" fill="var(--marca-2,currentColor)"/><circle cx="27" cy="13" r="3" fill="var(--marca-3,currentColor)"/></svg>`;

const AH_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function ahHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'ahnav-' + (site.slug || 'p');
  // 🔴 permalink plano E categoryBase: o artigo mora em /<slug>/ e a editoria em
  // /categoria/<slug>/. H.curl resolve a editoria; montar a mao poe o menu em 404.
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('ahtop')}">
<div class="${c('ahin')} ${c('ahbar')}">
<a class="${c('ahmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--ink);--marca-2:var(--viva);--marca-3:var(--pri)">${AH_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<nav class="${c('ahnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('ahham')}" type="button" data-ahham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('ahbusca')}" href="/busca/">${AH_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-ahham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function ahFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('ahfoot')}"><div class="${c('ahin')}">
<div class="${c('ahcols')}">
  <div><a class="${c('ahfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva);--marca-3:rgba(255,255,255,.5)">${AH_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('ahfh')}">Editorias</div><div class="${c('ahflist')}">${cats}</div></div>
  <div><div class="${c('ahfh')}">O caderno</div><div class="${c('ahflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('ahfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A materia principal da secao: faixa de imagem por cima do texto. O `span` da
 * faixa tem display:block, senao o aspect-ratio nao aplica. */
function ahDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('ahdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('ahfaixa')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span class="${c('ahkick')}" style="margin-top:14px">${H.cat(a)}</span>
<h${n} class="${c('ahti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('ahdd')}">${H.esc(H.clip(a.dek, 175))}</span>` : ''}
<span class="${c('ahdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

/* A linha com miniatura redonda. */
function ahLinha(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('ahrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('ahredondo')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span><span class="${c('ahkick')}">${H.cat(a)}</span>
<h${n} class="${c('ahti')}">${H.esc(a.title)}</h${n}>
<span class="${c('ahdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function ahHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('ahabre')}">
<div><span class="${c('ahchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('ahmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('ahfaixa')}">
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
      // lista, e nao grade: a ultima linha nunca fica com buraco
      return `<section class="${c('ahsec')}">
<div class="${c('ahcab')}"><span class="${c('ahpast')}"><h2>${H.esc(nome)}</h2></span>
<a class="${c('ahmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${ahDestaque(ctx, d, false)}
<div class="${c('ahlista')}">${resto.slice(0, 4).map(a => ahLinha(ctx, a, false)).join('')}</div>
</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${ahHeader(ctx, menu)}
<main class="${c('ahwrap')}"><div class="${c('ahin')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${ahFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function ahAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('ahass')}">
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
function ahLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('ahleg')}">${H.esc(alt)}</p>`;
}

function ahArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('ahrel')}">
<span class="${c('ahrotb')}">Leia também</span>
<div class="${c('ahlista')}">${related.slice(0, 3).map(a => ahLinha(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${ahHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('ahwrap')}"><div class="${c('ahin')}">
<article class="${c('ahart')}">
<div class="${c('ahcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('ahchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('ahdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('ahhero')}"><span data-f>${H.pic(art, true)}</span></span>
${ahLegenda(ctx, art)}` : ''}
<div class="${c('ahbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${ahAssinatura(ctx, art)}
${rel}
</div></main>
${ahFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function ahList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${ahHeader(ctx, menu)}
<main class="${c('ahwrap')}"><div class="${c('ahin')}">
<section class="${c('ahsec')}">
<div class="${c('ahcab')}"><span class="${c('ahpast')}"><h1>${H.esc(opts.title)}</h1></span></div>
${opts.desc ? `<p class="${c('ahdescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? ahDestaque(ctx, primeiro, true, 2) : ''}
<div class="${c('ahlista')}">${resto.map(a => ahLinha(ctx, a, false, 2)).join('')}</div>
</section>
</div></main>
${ahFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { ahCss, ahHeader, ahFooter, ahHome, ahArticle, ahList };
