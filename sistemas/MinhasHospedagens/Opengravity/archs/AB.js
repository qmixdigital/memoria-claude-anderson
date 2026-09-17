/*
 * Arquitetura AB, arquetipo FOLHA DE CONTATO. Feita para o cameracotidiana.com.br.
 *
 * ## De onde vem o desenho
 *
 * O nome e fotografico e o acervo preservado e de revista geral: dicas,
 * entretenimento, casa, negocios e saude. O desenho pega o **gesto** do nome, e
 * nao o assunto: folha de contato de laboratorio, com a imagem emoldurada por um
 * filete fino e uma **tarja de legenda** logo abaixo, do jeito que se anotava a
 * margem da prova.
 *
 * ## O que a diferencia das 27 vizinhas da opengravity
 *
 *   - **cabecalho de uma linha so**: marca a esquerda e navegacao a direita, no
 *     mesmo eixo. A `Y` centraliza a marca, a `Z` usa duas faixas e a `AA` poe a
 *     marca dentro de um bloco de cor. Aqui e uma linha e um filete
 *   - **Instrument Serif e Archivo**: nenhum portal da rede usa qualquer uma
 *   - **sepia e vermelho de filme**: as vizinhas ja ocupam grafite, marinho,
 *     esmeralda, violeta, ocre, vinho, cobalto, terracota, petroleo, carmim,
 *     lima, turquesa, azul-ferrugem e azul-royal
 *   - **tarja de legenda sob cada imagem**, com editoria e data, que e a
 *     assinatura visual da folha de contato. Nenhuma vizinha faz isso
 *   - **h2 com filete acima**, e nao abaixo nem com marcador na margem
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
 *   - a grade fecha a ultima linha conforme o numero de itens da editoria
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *
 * ## Quatro defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - **variaveis de cor em `:root`**, e nao no seletor do elemento principal:
 *     cabecalho e rodape sao irmaos dele e ali `var(--pri)` nao resolveria. Na
 *     `Z` isso deixou o botao do menu invisivel no celular
 *   - **`padding-block` em classe que divide elemento com o contentor**: o zero
 *     do meio de um `padding` completo apaga o respiro lateral, e isso so aparece
 *     no celular
 *   - **nenhum literal de tag dentro de comentario do CSS**: engana parser
 *     ingenuo, e enganou o auditor de linkagem
 *   - **o wordmark sai como texto**, e nao em curvas: a `Y` foi ao ar como
 *     "Viaje no Det" porque faltavam glifos no desenho e nada acusou
 *
 * ## Uma coisa que so este portal tem
 *
 * O permalink da origem e **plano**, `/%postname%/`. Isso nao muda nada aqui
 * dentro, porque todo link de editoria sai de `H.curl` e todo link de artigo sai
 * de `H.url`, e os dois ja sabem o formato do portal. Montar qualquer um na mao
 * quebraria justamente neste caso.
 */

function abCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#EDE6DA';
  const viva = t.vivid || '#D3222A';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('abwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.72;-webkit-font-smoothing:antialiased}
${s('abwrap')} *{box-sizing:border-box}
${s('abin')}{max-width:${fp.container || '1140px'};margin:0 auto;padding:0 26px;width:100%}
${s('abwrap')} h1,${s('abwrap')} h2,${s('abwrap')} h3,${s('abwrap')} h4{font-family:var(--fd);
  font-weight:400;letter-spacing:-.008em;line-height:1.1;margin:0}
${s('abwrap')} a{color:inherit;text-decoration:none}
${s('abwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho de uma linha: marca a esquerda, navegacao a direita ---------- */
${s('abtop')}{background:var(--paper);border-bottom:1px solid var(--ink)}
${s('abbar')}{display:flex;align-items:center;gap:26px;padding-block:20px 18px;flex-wrap:wrap}
${s('abmarca')}{display:inline-flex;align-items:baseline;gap:10px;font-family:var(--fd);
  font-weight:400;font-size:clamp(27px,3.4vw,38px);letter-spacing:-.018em;color:var(--ink);
  flex:none;margin-right:auto}
${s('abmarca')} svg{display:block;height:.78em;width:auto;flex:none;align-self:center}
${s('abnav')}{display:flex;gap:19px;align-items:center;flex-wrap:wrap}
${s('abnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.04em;
  text-transform:uppercase;color:var(--ink);padding-bottom:3px;border-bottom:2px solid transparent}
${s('abnav')} a:hover{color:var(--viva);border-bottom-color:var(--viva)}
${s('abbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;
  color:var(--paper);background:var(--ink);padding:9px 15px;min-height:40px}
${s('abbusca')}:hover{background:var(--viva)}
${s('abham')}{display:none;width:46px;height:46px;border:1px solid var(--ink);background:none;
  cursor:pointer;position:relative;padding:0}
${s('abham')} i,${s('abham')}::before,${s('abham')}::after{content:"";position:absolute;left:12px;
  right:12px;height:1.5px;background:var(--ink)}
${s('abham')}::before{top:15px}${s('abham')} i{top:22px}${s('abham')}::after{top:29px}

/* ---------- tarja de legenda: a assinatura do arquetipo ---------- */
${s('abfoto')}{display:block;border:1px solid var(--line);background:var(--surf);padding:7px}
${s('abfoto')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '3/2'};overflow:hidden;
  background:var(--ph)}
${s('abfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .55s ease}
${s('abtarja')}{display:flex;align-items:baseline;gap:9px;padding:8px 1px 1px;
  font-family:var(--fb);font-size:10.5px;font-weight:600;letter-spacing:${fp.kickerLs || '.1em'};
  text-transform:uppercase;color:var(--muted)}
${s('abtarja')} b{color:var(--viva);font-weight:700}
${s('abtarja')} span{margin-left:auto;letter-spacing:.06em}

/* ---------- abertura: texto a esquerda, prova a direita ---------- */
${s('ababre')}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.06fr);
  gap:44px;align-items:center;padding:46px 0 40px;border-bottom:1px solid var(--line)}
${s('ababre')} h2{font-size:clamp(33px,4.4vw,53px);line-height:1.02;letter-spacing:-.02em}
${s('ababre')} h2 a:hover{color:var(--viva)}
${s('ababre')} p{color:var(--dek);font-size:17.5px;margin:17px 0 0;max-width:46ch}
${s('abkick')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.1em'};text-transform:uppercase;color:var(--viva);
  margin-bottom:14px}
${s('abkick')} a{color:inherit}
${s('abmm')}{margin-top:19px;font-family:var(--fb);font-size:12.5px;color:var(--muted);
  display:flex;gap:9px;align-items:center;flex-wrap:wrap}
${s('abmm')} b{color:var(--ink);font-weight:700}

/* ---------- secoes ---------- */
${s('absec')}{padding:36px 0 40px;border-bottom:1px solid var(--line)}
${s('absec')}:last-of-type{border-bottom:0}
${s('absh')}{display:flex;align-items:baseline;gap:14px;margin-bottom:24px}
${s('absh')} h2,${s('absh')} h1{font-family:var(--fb);font-size:13px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;flex:none;color:var(--ink);order:1}
/* o filete e um ::after, que e sempre o ultimo filho: sem a propriedade order
   ele cairia depois do "ver tudo" e o link ficaria colado no titulo.
   Sem crase neste comentario: o CSS mora num template literal e a crase o fecha */
${s('absh')}::after{content:"";flex:1;height:1px;background:var(--ink);align-self:center;order:2}
${s('absh')} .more{font-family:var(--fb);font-size:11.5px;font-weight:600;letter-spacing:.06em;
  text-transform:uppercase;color:var(--muted);flex:none;order:3}
${s('absh')} .more:hover{color:var(--viva)}
${s('absh1')} h1{font-family:var(--fd);font-weight:400;font-size:clamp(28px,3.4vw,40px);
  letter-spacing:-.018em;text-transform:none}

${s('abdup')}{display:grid;grid-template-columns:minmax(0,1.32fr) minmax(0,1fr);gap:34px}
${s('abbig')}{display:block}
${s('abbig')}:hover ${s('abfoto')} [data-f] img{transform:scale(1.035)}
${s('abbig')} h3{font-size:27px;line-height:1.12;letter-spacing:-.014em;margin-top:14px}
${s('abbig')}:hover h3{color:var(--viva)}
${s('abbig')} p{color:var(--dek);font-size:15.5px;margin:9px 0 0;max-width:52ch}

${s('ablista')}{display:flex;flex-direction:column}
${s('abcard')}{display:grid;grid-template-columns:88px minmax(0,1fr);gap:15px;
  padding:15px 0;border-top:1px solid var(--line);align-items:start}
${s('abcard')}:first-child{border-top:0;padding-top:0}
${s('abcard')} [data-f]{display:block;aspect-ratio:1/1;overflow:hidden;background:var(--ph);
  border:1px solid var(--line)}
${s('abcard')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('abcard')} h3{font-size:16px;line-height:1.28;letter-spacing:-.004em}
${s('abcard')}:hover h3{color:var(--viva)}
${s('abcard')} em{display:block;font-family:var(--fb);font-style:normal;font-size:10.5px;
  font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--viva);margin-bottom:5px}
${s('abcard')} time{display:block;font-family:var(--fb);font-size:11.5px;color:var(--muted);margin-top:6px}

${s('abgrade')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px}
${s('abg2')}{grid-template-columns:repeat(2,minmax(0,1fr))}
${s('abg3')}{grid-template-columns:repeat(3,minmax(0,1fr))}
${s('abg4')}{grid-template-columns:repeat(4,minmax(0,1fr))}
${s('abg')}{display:block}
${s('abg')}:hover ${s('abfoto')} [data-f] img{transform:scale(1.035)}
${s('abg')} h2,${s('abg')} h3{font-size:18.5px;line-height:1.22;letter-spacing:-.008em;margin-top:12px}
${s('abg')}:hover h2,${s('abg')}:hover h3{color:var(--viva)}

/* ---------- artigo ---------- */
${s('abart')}{padding:36px 0 8px}
${s('abcol')}{max-width:${fp.medida || '720px'}}
${s('abwrap')} nav[aria-label="Trilha de navegação"]{font-family:var(--fb);font-size:12px;
  color:var(--muted);margin-bottom:18px;letter-spacing:.01em}
${s('abwrap')} nav[aria-label="Trilha de navegação"] a:hover{color:var(--viva)}
${s('abart')} h1{font-size:clamp(32px,4.2vw,48px);line-height:1.04;letter-spacing:-.02em;
  margin-bottom:16px}
${s('abdek')}{font-size:19.5px;line-height:1.55;color:var(--dek);margin:0 0 20px;max-width:58ch}
${s('abcapa')}{display:block;border:1px solid var(--line);background:var(--surf);padding:8px;
  margin:24px 0 0;max-width:${fp.medidaLarga || '860px'}}
${s('abcapa')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden;
  background:var(--ph)}
${s('abcapa')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('ableg')}{font-family:var(--fb);font-size:12px;color:var(--muted);margin:9px 0 30px;
  max-width:60ch;letter-spacing:.01em}

${s('abbody')}{font-size:${fp.corpoFs || '18.5px'};line-height:1.8;max-width:${fp.medida || '720px'}}
${s('abbody')} p{margin:0 0 24px}
${s('abbody')} h2{font-size:26px;margin:44px 0 16px;padding-top:15px;
  border-top:1px solid var(--ink);letter-spacing:-.012em}
${s('abbody')} h3{font-size:21px;margin:32px 0 12px}
${s('abbody')} a{color:var(--viva);text-decoration:underline;text-decoration-thickness:1px;
  text-underline-offset:2.5px}
${s('abbody')} a:hover{background:var(--wash)}
${s('abbody')} ul,${s('abbody')} ol{margin:0 0 24px;padding-left:22px}
${s('abbody')} li{margin-bottom:9px}
${s('abbody')} img{margin:24px 0;border:1px solid var(--line);padding:7px;background:var(--surf)}
${s('abbody')} blockquote{margin:28px 0;padding:2px 0 2px 22px;border-left:2px solid var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.34;color:var(--ink)}
${s('abbody')} figure{margin:24px 0}
${s('abbody')} figcaption{font-family:var(--fb);font-size:12px;color:var(--muted);margin-top:8px}

${s('abbody')} table{width:100%;border-collapse:collapse;margin:26px 0;font-size:15.5px}
${s('abbody')} table caption{font-family:var(--fb);font-size:12px;color:var(--muted);
  text-align:left;margin-bottom:10px}
${s('abbody')} table th,${s('abbody')} table td{border:0;border-bottom:1px solid var(--line);
  padding:12px 14px 12px 0;text-align:left;vertical-align:top;background:transparent}
${s('abbody')} table thead th{font-family:var(--fb);font-size:11px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--ink);border-bottom:1px solid var(--ink)}

${s('abveja')}{margin:32px 0;padding:20px 22px;border:1px solid var(--line);background:var(--surf)}
${s('abveja')} h2{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;margin:0 0 12px;padding:0;border:0;color:var(--viva)}

${s('abass')}{display:grid;grid-template-columns:76px minmax(0,1fr);gap:18px;margin:38px 0 0;
  padding:20px;border-top:1px solid var(--ink);border-bottom:1px solid var(--line);
  max-width:${fp.medida || '720px'}}
${s('abass')} img{width:76px;height:76px;object-fit:cover;border:1px solid var(--line)}
${s('abass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--viva);margin-bottom:5px}
${s('abass')} .nm{font-family:var(--fd);font-weight:400;font-size:22px;letter-spacing:-.012em}
${s('abass')} p{margin:7px 0 0;font-size:14.5px;color:var(--dek);line-height:1.56}
${s('abass')} .go{display:inline-block;margin-top:11px;font-family:var(--fb);font-size:11.5px;
  font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--viva)}
${s('abass')} .go:hover{color:var(--ink)}

/* relacionados na mesma largura da coluna do artigo */
${s('abrel')}{padding:38px 0 8px;max-width:${fp.medida || '720px'}}
${s('abrel')} ${s('abgrade')}{gap:22px}

/* ---------- rodape ---------- */
${s('abfoot')}{background:${t.footerBg || '#191713'};color:${t.footerTx || '#A79C8C'};
  margin-top:54px;padding:48px 0 26px;font-family:var(--fb);font-size:14.5px}
${s('abfoot')} a{color:${t.footerTx || '#A79C8C'}}
${s('abfoot')} a:hover{color:#fff}
${s('abcols')}{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr);
  gap:36px;padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,.13)}
${s('abfb')}{display:inline-flex;align-items:baseline;gap:10px;font-family:var(--fd);
  font-weight:400;font-size:27px;letter-spacing:-.018em;color:#fff}
${s('abfb')} svg{display:block;height:.78em;width:auto;flex:none;align-self:center}
${s('abfh')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:#fff;margin-bottom:14px}
${s('abflist')}{display:flex;flex-direction:column;gap:9px;align-items:flex-start}
${s('abfim')}{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;
  padding-top:20px;font-size:12.5px;color:rgba(255,255,255,.45)}

${s('reveal')}{opacity:1}
@media(prefers-reduced-motion:reduce){${s('abwrap')} *{transition:none!important}}

/* ---------- tablet ---------- */
@media(max-width:1100px){
  ${s('ababre')}{grid-template-columns:1fr;gap:30px}
  ${s('abdup')}{grid-template-columns:1fr;gap:28px}
  ${s('abgrade')},${s('abg3')},${s('abg4')}{grid-template-columns:repeat(2,minmax(0,1fr))}
  ${s('abbusca')}{display:none}
  ${s('abnav')}{display:none;order:3;width:100%;flex-direction:column;gap:0;
    align-items:stretch;padding-bottom:8px}
  ${s('abnav')}[data-aberto="1"]{display:flex}
  ${s('abnav')} a{padding:14px 2px;border-bottom:1px solid var(--line);border-top:0}
  ${s('abham')}{display:block}
  ${s('abbar')}{padding-block:16px 12px}
}

/* ---------- celular ---------- */
@media(max-width:760px){
  ${s('ababre')}{padding:30px 0 28px;gap:26px}
  ${s('ababre')} h2{font-size:clamp(29px,7.8vw,38px)}
  ${s('abgrade')},${s('abg2')},${s('abg3')},${s('abg4')}{grid-template-columns:1fr;gap:26px}
  ${s('abcols')}{grid-template-columns:1fr;gap:28px}
  ${s('absec')}{padding:26px 0 30px}
  ${s('abbody')}{font-size:17.5px}
  ${s('abass')}{grid-template-columns:1fr}
  ${s('abass')} img{width:70px;height:70px}
  ${s('abcard')}{grid-template-columns:74px minmax(0,1fr)}
}

/* ---------- tabela vira cartao, com o rotulo da coluna acima do valor ---------- */
@media(max-width:640px){
  ${s('abbody')} table{min-width:0}
  ${s('abbody')} table caption{display:none}
  ${s('abbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('abbody')} table,${s('abbody')} table tbody,${s('abbody')} table tr,
  ${s('abbody')} table th,${s('abbody')} table td{display:block;width:auto}
  ${s('abbody')} table tbody tr{background:var(--surf);border:1px solid var(--line);
    padding:2px 18px 16px;margin-bottom:14px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('abbody')} table tbody th,${s('abbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('abbody')} table tbody th{border-bottom:1px solid var(--line);padding:15px 0 12px;
    font-family:var(--fd);font-weight:400;font-size:18px;text-transform:none;
    letter-spacing:0;color:var(--ink)}
  ${s('abbody')} table tbody td{padding:14px 0 0;text-align:left;line-height:1.5}
  ${s('abbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}`;
}

/* Simbolo geometrico, sem letra dentro: o quadro de uma prova de contato, com a
 * marca de enquadramento no canto. O nome vem como texto na fonte de titulo. */
const AB_SIMB = `<svg viewBox="0 0 30 30" role="img" aria-hidden="true" focusable="false"><rect x="1" y="1" width="28" height="28" fill="none" stroke="var(--marca-1,currentColor)" stroke-width="2"/><rect x="7" y="7" width="16" height="16" fill="var(--marca-2,currentColor)"/><rect x="12" y="12" width="6" height="6" fill="var(--marca-3,#fff)"/></svg>`;

const AB_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function abHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'abnav-' + (site.slug || 'p');
  // link de editoria por H.curl: montado a mao ele quebra quando ha categoryBase
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('abtop')}">
<div class="${c('abin')} ${c('abbar')}">
<a class="${c('abmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--ink);--marca-2:var(--viva);--marca-3:var(--paper)">${AB_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<nav class="${c('abnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('abham')}" type="button" data-abham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('abbusca')}" href="/busca/">${AB_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-abham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function abFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('abfoot')}"><div class="${c('abin')}">
<div class="${c('abcols')}">
  <div><a class="${c('abfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva);--marca-3:#191713">${AB_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('abfh')}">Editorias</div><div class="${c('abflist')}">${cats}</div></div>
  <div><div class="${c('abfh')}">A revista</div><div class="${c('abflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('abfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A prova de contato: moldura fina, imagem dentro e tarja de legenda abaixo.
 * O `span` do retrato tem display:block, senao o aspect-ratio nao aplica e a
 * imagem passa por cima do titulo. */
function abProva(ctx, a, eager) {
  const { c, H } = ctx;
  return `<span class="${c('abfoto')}">
<span data-f>${H.pic(a, !!eager)}</span>
<span class="${c('abtarja')}"><b>${H.cat(a)}</b><span>${H.esc(H.dateShort(a.date))}</span></span>
</span>`;
}

/* O nivel de titulo vem de quem chama: h3 sob um h2 de secao na home, h2 na lista
 * de editoria, onde o titulo da pagina e h1. */
function abGrid(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('abg')} ${c('reveal')}" href="${H.url(a)}">
${abProva(ctx, a, eager)}
<h${n}>${H.esc(a.title)}</h${n}></a>`;
}

function abCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('abcard')}" href="${H.url(a)}">
<span data-f>${H.pic(a, false)}</span>
<div><em>${H.cat(a)}</em><h3>${H.esc(a.title)}</h3>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></div></a>`;
}

function abHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre, ...resto] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('ababre')}">
<div><span class="${c('abkick')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 200))}</p>` : ''}
<div class="${c('abmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}">${abProva(ctx, abre, true)}</a>
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
      const topo = `<div class="${c('absh')}"><h2>${H.esc(nome)}</h2>
<a class="more" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>`;
      let corpo;
      if (v.length >= 5) {
        // destaque mais quatro compactos: consome exatamente 5, sem sobra
        const [d, ...r] = v;
        corpo = `<div class="${c('abdup')}">
<a class="${c('abbig')} ${c('reveal')}" href="${H.url(d)}">
${abProva(ctx, d, false)}
<h3>${H.esc(d.title)}</h3>
${d.dek ? `<p>${H.esc(H.clip(d.dek, 140))}</p>` : ''}</a>
<div class="${c('ablista')}">${r.slice(0, 4).map(a => abCard(ctx, a)).join('')}</div>
</div>`;
      } else {
        // 2, 3 ou 4 itens: a grade recebe exatamente esse numero de colunas e a
        // ultima linha fecha, sem buraco ao lado do ultimo cartao
        const n = v.length;
        corpo = `<div class="${c('abgrade')} ${c('abg' + n)}">
${v.slice(0, n).map(a => abGrid(ctx, a, false)).join('')}</div>`;
      }
      return `<section class="${c('absec')}">${topo}${corpo}</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${abHeader(ctx, menu)}
<main class="${c('abwrap')}"><div class="${c('abin')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${abFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. Inventar `bio` ou `editorias` nao da erro em lugar
 * nenhum, so nao gera nada. */
function abAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('abass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="76" height="76" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

function abArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema. Nao ha helper para calcular isso na arquitetura.
  const rel = (related && related.length) ? `<section class="${c('abrel')}">
<div class="${c('absh')}"><h2>Leia também</h2></div>
<div class="${c('abgrade')} ${c('abg' + Math.min(related.length, 3))}">${related.slice(0, 3).map(a =>
    abGrid(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${abHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('abwrap')}"><div class="${c('abin')}">
<article class="${c('abart')}">
<div class="${c('abcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('abkick')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('abdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('abcapa')}"><span data-f>${H.pic(art, true)}</span></span>
<p class="${c('ableg')}">${H.esc(art.image && art.image.alt ? art.image.alt : art.title)}</p>` : ''}
<div class="${c('abbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${abAssinatura(ctx, art)}
${rel}
</div></main>
${abFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function abList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  return `${H.head(ctx, meta)}
${abHeader(ctx, menu)}
<main class="${c('abwrap')}"><div class="${c('abin')}">
<section class="${c('absec')}">
<div class="${c('absh')} ${c('absh1')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('abdek')}" style="max-width:66ch;margin-top:-10px">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('abgrade')}">${itens.map((a, i) => abGrid(ctx, a, i === 0, 2)).join('')}</div>
</section>
</div></main>
${abFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { abCss, abHeader, abFooter, abHome, abArticle, abList };
