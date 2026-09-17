/*
 * Arquitetura AA, arquetipo CADERNO. Feita para o azulmagazine.com.br.
 *
 * ## De onde vem o desenho
 *
 * O portal se chama "Revista Eletronica" e o acervo preservado e de revista
 * geral: insights, entretenimento, dicas, marketing e casa. O desenho e de
 * **caderno encadernado**: a marca mora dentro de um bloco de cor cheia, as
 * secoes sao numeradas e o artigo corre ao lado de um filete continuo, como
 * margem de caderno.
 *
 * ## O que a diferencia das 26 vizinhas da opengravity
 *
 *   - **marca dentro de bloco de cor cheia**, com a navegacao numa faixa tingida
 *     logo abaixo. A vizinha `Z` tem marca sobre papel e filete fino; a `Y`
 *     centraliza a marca entre filetes. Aqui o topo e um bloco solido
 *   - **Bricolage Grotesque e Source Serif 4**: nenhum portal da rede usa
 *     qualquer uma das duas
 *   - **azul-royal e areia**: as vizinhas ja ocupam grafite, marinho, esmeralda,
 *     violeta, ocre, vinho, cobalto, terracota, petroleo, carmim, lima, turquesa
 *     e azul-ferrugem. Aqui o azul e **superficie**, e nao filete
 *   - **abertura com imagem deslocada sobre bloco de cor**, em vez de imagem
 *     emoldurada (`Y`) ou esticada (`Z`)
 *   - **secao numerada** com filete vertical, e nao regua horizontal
 *   - **artigo com margem de caderno**: filete continuo a esquerda da coluna
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por `H.curl(slug)`, nunca montado a mao
 *   - menu sanfonado abaixo de 1100px, com aria-expanded, aria-controls e rotulo
 *     que muda ao abrir
 *   - todo `span` com aspect-ratio tem `display:block`, e o `a` do cartao tem
 *     `display`
 *   - body aberto no cabecalho e `H.bodyEnd()` nos tres caminhos de pagina
 *   - nada centralizado alem da marca
 *   - lista de editoria abre em h1, e o cartao dela sobe para h2
 *   - a grade fecha a ultima linha conforme o numero de itens da editoria
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *
 * ## Tres defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - **as variaveis de cor vao em `:root`**, e nao no seletor do elemento
 *     principal. Cabecalho e rodape sao irmaos dele: ali `var(--pri)` nao
 *     resolveria, e variavel indefinida descarta a declaracao inteira. Na `Z`
 *     isso deixou o botao do menu invisivel no celular
 *   - **classe que divide elemento com o contentor usa `padding-block`**, nunca
 *     `padding` completo: o zero do meio apaga o respiro lateral, e isso so
 *     aparece no celular
 *   - **nenhum literal de tag dentro de comentario do CSS**: engana parser
 *     ingenuo, e enganou o auditor de linkagem
 */

function aaCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#E7EBF7';
  const viva = t.vivid || '#FFB020';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('aawrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17.5px'};line-height:1.7;-webkit-font-smoothing:antialiased}
${s('aawrap')} *{box-sizing:border-box}
${s('aain')}{max-width:${fp.container || '1160px'};margin:0 auto;padding:0 24px;width:100%}
${s('aawrap')} h1,${s('aawrap')} h2,${s('aawrap')} h3,${s('aawrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.018em;line-height:1.13;margin:0}
${s('aawrap')} a{color:inherit;text-decoration:none}
${s('aawrap')} img{max-width:100%;height:auto;display:block}

/* ---------- topo: marca dentro de bloco de cor cheia ---------- */
${s('aatop')}{background:var(--pri);color:var(--sob)}
${s('aacapa')}{display:flex;align-items:center;justify-content:space-between;gap:20px;
  padding-block:22px 20px;flex-wrap:wrap}
${s('aamarca')}{display:inline-flex;align-items:center;gap:12px;font-family:var(--fd);
  font-weight:700;font-size:clamp(26px,3.3vw,36px);letter-spacing:-.03em;color:var(--sob)}
${s('aamarca')} svg{display:block;height:1em;width:auto;flex:none}
${s('aatag')}{font-family:var(--fb);font-size:12.5px;letter-spacing:.08em;
  text-transform:uppercase;color:rgba(255,255,255,.72)}

/* faixa tingida da navegacao, logo abaixo do bloco */
${s('aafaixa')}{background:var(--wash);border-bottom:1px solid var(--line)}
${s('aabar')}{display:flex;align-items:center;gap:20px;min-height:48px;flex-wrap:wrap}
${s('aanav')}{display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin-right:auto}
${s('aanav')} a{font-family:var(--fb);font-size:13.5px;font-weight:600;color:var(--pri);
  padding:13px 0;border-bottom:2px solid transparent}
${s('aanav')} a:hover{border-bottom-color:var(--viva)}
${s('aabusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:13px;font-weight:600;color:var(--sob);background:var(--pri);
  padding:9px 16px;min-height:40px}
${s('aabusca')}:hover{background:var(--ink)}
${s('aaham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);
  background:none;cursor:pointer;position:relative;padding:0}
${s('aaham')} i,${s('aaham')}::before,${s('aaham')}::after{content:"";position:absolute;
  left:11px;right:11px;height:2px;background:var(--pri)}
${s('aaham')}::before{top:14px}${s('aaham')} i{top:21px}${s('aaham')}::after{top:28px}

/* ---------- chapeu de editoria ---------- */
${s('aakick')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.13em'};text-transform:uppercase;color:var(--pri);
  border-bottom:2px solid var(--viva);padding-bottom:3px;margin-bottom:12px}
${s('aakick')} a{color:inherit}

/* ---------- abertura: imagem deslocada sobre bloco de cor ---------- */
${s('aaabre')}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);
  gap:46px;align-items:center;padding:44px 0 38px}
${s('aaabre')} h2{font-size:clamp(31px,4.1vw,49px);line-height:1.05;letter-spacing:-.03em}
${s('aaabre')} h2 a:hover{color:var(--pri)}
${s('aaabre')} p{color:var(--dek);font-size:17.5px;margin:16px 0 0;max-width:46ch}
${s('aamm')}{margin-top:18px;font-family:var(--fb);font-size:13px;color:var(--muted);
  display:flex;gap:9px;align-items:center;flex-wrap:wrap}
${s('aamm')} b{color:var(--ink);font-weight:700}
${s('aafoto')}{position:relative;display:block}
${s('aafoto')}::before{content:"";position:absolute;left:-16px;top:-16px;right:16px;
  bottom:16px;background:var(--wash);z-index:0}
${s('aafoto')} span{position:relative;z-index:1;display:block;aspect-ratio:${fp.heroAr || '5/4'};
  overflow:hidden;background:var(--ph)}
${s('aafoto')} img{width:100%;height:100%;object-fit:cover}

/* ---------- secao numerada, com filete vertical ---------- */
${s('aasec')}{padding:34px 0 38px;border-top:1px solid var(--line)}
${s('aash')}{display:flex;align-items:baseline;gap:14px;margin-bottom:24px;
  padding-left:16px;border-left:4px solid var(--pri)}
${s('aash')} h2,${s('aash')} h1{font-size:22px;letter-spacing:-.02em;flex:none}
${s('aanum')}{font-family:var(--fb);font-size:12px;font-weight:700;letter-spacing:.1em;
  color:var(--viva)}
${s('aash')} .more{margin-left:auto;font-family:var(--fb);font-size:12.5px;font-weight:600;
  color:var(--pri);flex:none;border-bottom:1px solid var(--viva);padding-bottom:1px}
${s('aash')} .more:hover{color:var(--ink)}
${s('aash1')}{border-left-width:6px}
${s('aash1')} h1{font-size:clamp(26px,3.2vw,36px)}

${s('aadup')}{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:34px}
${s('aabig')}{display:block}
${s('aabig')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '3/2'};overflow:hidden;
  background:var(--ph);margin-bottom:15px}
${s('aabig')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('aabig')}:hover [data-f] img{transform:scale(1.04)}
${s('aabig')} h3{font-size:25px;line-height:1.15;letter-spacing:-.022em}
${s('aabig')}:hover h3{color:var(--pri)}
${s('aabig')} p{color:var(--dek);font-size:16px;margin:10px 0 0;max-width:52ch}
${s('aabig')} time{display:block;font-family:var(--fb);font-size:12.5px;color:var(--muted);margin-top:11px}

${s('aalista')}{display:flex;flex-direction:column;gap:0}
${s('aacard')}{display:grid;grid-template-columns:minmax(0,1fr) 104px;gap:16px;
  padding:16px 0;border-bottom:1px solid var(--line);align-items:start}
${s('aacard')}:first-child{padding-top:0}
${s('aacard')}:last-child{border-bottom:0}
${s('aacard')} [data-f]{display:block;aspect-ratio:1/1;overflow:hidden;background:var(--ph)}
${s('aacard')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('aacard')} h3{font-size:16px;line-height:1.32;letter-spacing:-.008em}
${s('aacard')}:hover h3{color:var(--pri)}
${s('aacard')} time{display:block;font-family:var(--fb);font-size:12px;color:var(--muted);margin-top:7px}

${s('aagrade')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px}
${s('aag2')}{grid-template-columns:repeat(2,minmax(0,1fr))}
${s('aag3')}{grid-template-columns:repeat(3,minmax(0,1fr))}
${s('aag4')}{grid-template-columns:repeat(4,minmax(0,1fr))}
${s('aag')}{display:block}
${s('aag')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '3/2'};overflow:hidden;
  background:var(--ph);margin-bottom:13px}
${s('aag')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('aag')}:hover [data-f] img{transform:scale(1.04)}
${s('aag')} h2,${s('aag')} h3{font-size:18px;line-height:1.26;letter-spacing:-.012em}
${s('aag')}:hover h2,${s('aag')}:hover h3{color:var(--pri)}
${s('aag')} time{display:block;font-family:var(--fb);font-size:12px;color:var(--muted);margin-top:9px}

/* ---------- artigo: margem de caderno ---------- */
${s('aaart')}{padding:34px 0 8px}
${s('aacol')}{max-width:${fp.medida || '730px'}}
${s('aawrap')} nav[aria-label="Trilha de navegação"]{font-family:var(--fb);font-size:12.5px;
  color:var(--muted);margin-bottom:18px}
${s('aawrap')} nav[aria-label="Trilha de navegação"] a:hover{color:var(--pri)}
${s('aaart')} h1{font-size:clamp(30px,3.9vw,45px);line-height:1.08;letter-spacing:-.03em;
  margin-bottom:16px}
${s('aadek')}{font-family:var(--fd);font-weight:400;font-size:20px;line-height:1.48;
  color:var(--dek);margin:0 0 20px;max-width:58ch}
${s('aacapaimg')}{display:block;aspect-ratio:${fp.heroAr || '5/4'};max-height:520px;
  overflow:hidden;background:var(--ph);margin:22px 0 0}
${s('aacapaimg')} img{width:100%;height:100%;object-fit:cover}
${s('aaleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:10px 0 28px;
  max-width:60ch}

${s('aabody')}{font-size:${fp.corpoFs || '18.5px'};line-height:1.78;
  max-width:${fp.medida || '730px'};padding-left:22px;border-left:2px solid var(--wash)}
${s('aabody')} p{margin:0 0 23px}
${s('aabody')} h2{font-size:26px;margin:42px 0 16px;letter-spacing:-.022em;
  padding-bottom:9px;border-bottom:2px solid var(--wash)}
${s('aabody')} h3{font-size:21px;margin:32px 0 13px}
${s('aabody')} a{color:var(--pri);text-decoration:underline;text-decoration-thickness:1px;
  text-underline-offset:2.5px}
${s('aabody')} a:hover{background:var(--wash)}
${s('aabody')} ul,${s('aabody')} ol{margin:0 0 23px;padding-left:22px}
${s('aabody')} li{margin-bottom:9px}
${s('aabody')} img{margin:24px 0}
${s('aabody')} blockquote{margin:28px 0;padding:2px 0 2px 20px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:21px;line-height:1.42;color:var(--ink)}
${s('aabody')} figure{margin:24px 0}
${s('aabody')} figcaption{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin-top:8px}

${s('aabody')} table{width:100%;border-collapse:collapse;margin:26px 0;font-size:16px}
${s('aabody')} table caption{font-family:var(--fb);font-size:12.5px;color:var(--muted);
  text-align:left;margin-bottom:10px}
${s('aabody')} table th,${s('aabody')} table td{border:0;border-bottom:1px solid var(--line);
  padding:12px 14px 12px 0;text-align:left;vertical-align:top;background:transparent}
${s('aabody')} table thead th{font-family:var(--fb);font-size:11.5px;letter-spacing:.07em;
  text-transform:uppercase;color:var(--pri);border-bottom:2px solid var(--pri)}

${s('aaveja')}{margin:32px 0;padding:20px 22px;background:var(--wash)}
${s('aaveja')} h2{font-family:var(--fb);font-size:11.5px;font-weight:800;letter-spacing:.12em;
  text-transform:uppercase;margin:0 0 11px;padding:0;border:0;color:var(--pri)}

${s('aaass')}{display:grid;grid-template-columns:80px minmax(0,1fr);gap:18px;margin:36px 0 0;
  padding:22px;border:1px solid var(--line);background:var(--surf);
  max-width:${fp.medida || '730px'}}
${s('aaass')} img{width:80px;height:80px;object-fit:cover}
${s('aaass')} .ed{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--viva);margin-bottom:5px}
${s('aaass')} .nm{font-family:var(--fd);font-weight:700;font-size:20px;letter-spacing:-.018em}
${s('aaass')} p{margin:8px 0 0;font-size:15px;color:var(--dek);line-height:1.56}
${s('aaass')} .go{display:inline-block;margin-top:12px;font-family:var(--fb);font-size:12.5px;
  font-weight:600;color:var(--pri);border-bottom:1px solid var(--viva)}
${s('aaass')} .go:hover{color:var(--ink)}

/* relacionados na mesma largura da coluna do artigo */
${s('aarel')}{padding:36px 0 8px;max-width:${fp.medida || '730px'}}
${s('aarel')} ${s('aagrade')}{gap:24px}

/* ---------- rodape ---------- */
${s('aafoot')}{background:${t.footerBg || '#12151C'};color:${t.footerTx || '#9AA2B0'};
  margin-top:52px;padding:46px 0 26px;font-family:var(--fb);font-size:14.5px}
${s('aafoot')} a{color:${t.footerTx || '#9AA2B0'}}
${s('aafoot')} a:hover{color:#fff}
${s('aacols')}{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr);
  gap:36px;padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,.13)}
${s('aafb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:25px;letter-spacing:-.03em;color:#fff}
${s('aafb')} svg{display:block;height:1em;width:auto;flex:none}
${s('aafh')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:#fff;margin-bottom:14px}
${s('aaflist')}{display:flex;flex-direction:column;gap:9px;align-items:flex-start}
${s('aafim')}{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;
  padding-top:20px;font-size:12.5px;color:rgba(255,255,255,.45)}

${s('reveal')}{opacity:1}
@media(prefers-reduced-motion:reduce){${s('aawrap')} *{transition:none!important}}

/* ---------- tablet ---------- */
@media(max-width:1100px){
  ${s('aaabre')}{grid-template-columns:1fr;gap:30px}
  ${s('aadup')}{grid-template-columns:1fr;gap:28px}
  ${s('aagrade')},${s('aag3')},${s('aag4')}{grid-template-columns:repeat(2,minmax(0,1fr))}
  ${s('aabusca')}{display:none}
  ${s('aanav')}{display:none;order:3;width:100%;flex-direction:column;gap:0;
    align-items:stretch;margin-right:0;padding-bottom:8px}
  ${s('aanav')}[data-aberto="1"]{display:flex}
  ${s('aanav')} a{padding:14px 2px;border-bottom:1px solid var(--line);border-top:0}
  ${s('aaham')}{display:block;margin-left:auto}
  ${s('aabar')}{padding-block:7px}
}

/* ---------- celular ---------- */
@media(max-width:760px){
  ${s('aaabre')}{padding:30px 0 26px;gap:26px}
  ${s('aaabre')} h2{font-size:clamp(27px,7.4vw,36px)}
  ${s('aafoto')}::before{left:-10px;top:-10px;right:10px;bottom:10px}
  ${s('aagrade')},${s('aag2')},${s('aag3')},${s('aag4')}{grid-template-columns:1fr;gap:26px}
  ${s('aacols')}{grid-template-columns:1fr;gap:28px}
  ${s('aasec')}{padding:26px 0 30px}
  ${s('aabody')}{font-size:17.5px;padding-left:16px}
  ${s('aaass')}{grid-template-columns:1fr}
  ${s('aaass')} img{width:72px;height:72px}
  ${s('aacapa')}{padding-block:18px 16px}
  ${s('aacard')}{grid-template-columns:minmax(0,1fr) 84px}
}

/* ---------- tabela vira cartao, com o rotulo da coluna acima do valor ---------- */
@media(max-width:640px){
  ${s('aabody')} table{min-width:0}
  ${s('aabody')} table caption{display:none}
  ${s('aabody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('aabody')} table,${s('aabody')} table tbody,${s('aabody')} table tr,
  ${s('aabody')} table th,${s('aabody')} table td{display:block;width:auto}
  ${s('aabody')} table tbody tr{background:var(--surf);border:1px solid var(--line);
    padding:2px 18px 16px;margin-bottom:14px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('aabody')} table tbody th,${s('aabody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('aabody')} table tbody th{border-bottom:1px solid var(--line);padding:15px 0 12px;
    font-family:var(--fd);font-weight:700;font-size:16px;text-transform:none;
    letter-spacing:0;color:var(--ink)}
  ${s('aabody')} table tbody td{padding:14px 0 0;text-align:left;line-height:1.5}
  ${s('aabody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}`;
}

/* Simbolo geometrico, sem letra dentro: pagina dobrada, que e a leitura de
 * caderno. O nome vem como texto na fonte de titulo, e nao em curvas: a vizinha
 * Y foi ao ar como "Viaje no Det" porque faltavam glifos no desenho, e nada
 * acusou. Texto nao tem como perder letra. */
const AA_SIMB = `<svg viewBox="0 0 32 32" role="img" aria-hidden="true" focusable="false"><path d="M4 3h16l8 8v18H4z" fill="var(--marca-1,currentColor)"/><path d="M20 3v8h8z" fill="var(--marca-2,rgba(0,0,0,.35))"/><rect x="9" y="16" width="14" height="2.6" fill="var(--marca-3,#fff)"/><rect x="9" y="21" width="9" height="2.6" fill="var(--marca-3,#fff)"/></svg>`;

const AA_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function aaHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'aanav-' + (site.slug || 'p');
  // link de editoria por H.curl: montado a mao ele quebra quando ha categoryBase
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('aatop')}">
<div class="${c('aain')} ${c('aacapa')}">
<a class="${c('aamarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:#fff;--marca-2:rgba(0,0,0,.28);--marca-3:${(site.theme || {}).primary || '#1B3FA0'}">${AA_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<span class="${c('aatag')}">${H.esc(site.tagline || '')}</span>
</div></header>
<div class="${c('aafaixa')}"><div class="${c('aain')} ${c('aabar')}">
<nav class="${c('aanav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('aaham')}" type="button" data-aaham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('aabusca')}" href="/busca/">${AA_LUPA}Buscar</a>
</div></div>
<script>(function(){var b=document.querySelector('[data-aaham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function aaFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('aafoot')}"><div class="${c('aain')}">
<div class="${c('aacols')}">
  <div><a class="${c('aafb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:rgba(0,0,0,.4);--marca-3:#12151C">${AA_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('aafh')}">Editorias</div><div class="${c('aaflist')}">${cats}</div></div>
  <div><div class="${c('aafh')}">A revista</div><div class="${c('aaflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('aafim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* O `a` tem display e o `span` do retrato tem display:block, senao o
 * aspect-ratio nao aplica e a imagem passa por cima do titulo. O nivel de titulo
 * vem de quem chama: h3 sob um h2 de secao na home, h2 na lista de editoria,
 * onde o titulo da pagina e h1. */
function aaGrid(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('aag')} ${c('reveal')}" href="${H.url(a)}">
<span data-f>${H.pic(a, !!eager)}</span>
<span class="${c('aakick')}">${H.cat(a)}</span>
<h${n}>${H.esc(a.title)}</h${n}>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}

function aaCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('aacard')}" href="${H.url(a)}">
<div><h3>${H.esc(a.title)}</h3>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></div>
<span data-f>${H.pic(a, false)}</span></a>`;
}

function aaHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre, ...resto] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('aaabre')}">
<div><span class="${c('aakick')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 200))}</p>` : ''}
<div class="${c('aamm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a class="${c('aafoto')}" href="${H.url(abre)}" aria-label="${H.esc(abre.title)}">
<span>${H.pic(abre, true)}</span></a>
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
    .map(([cs, v], i) => {
      const nome = v[0].category ? v[0].category.name : cs;
      const topo = `<div class="${c('aash')}">
<span class="${c('aanum')}">${String(i + 1).padStart(2, '0')}</span>
<h2>${H.esc(nome)}</h2>
<a class="more" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>`;
      let corpo;
      if (v.length >= 5) {
        // destaque mais quatro compactos: consome exatamente 5, sem sobra
        const [d, ...r] = v;
        corpo = `<div class="${c('aadup')}">
<a class="${c('aabig')} ${c('reveal')}" href="${H.url(d)}">
<span data-f>${H.pic(d, false)}</span>
<span class="${c('aakick')}">${H.cat(d)}</span>
<h3>${H.esc(d.title)}</h3>
${d.dek ? `<p>${H.esc(H.clip(d.dek, 145))}</p>` : ''}
<time datetime="${H.esc(d.date)}">${H.esc(H.dateShort(d.date))}</time></a>
<div class="${c('aalista')}">${r.slice(0, 4).map(a => aaCard(ctx, a)).join('')}</div>
</div>`;
      } else {
        // 2, 3 ou 4 itens: a grade recebe exatamente esse numero de colunas e a
        // ultima linha fecha, sem buraco ao lado do ultimo cartao
        const n = v.length;
        corpo = `<div class="${c('aagrade')} ${c('aag' + n)}">
${v.slice(0, n).map(a => aaGrid(ctx, a, false)).join('')}</div>`;
      }
      return `<section class="${c('aasec')}">${topo}${corpo}</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${aaHeader(ctx, menu)}
<main class="${c('aawrap')}"><div class="${c('aain')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${aaFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. Inventar `bio` ou `editorias` nao da erro em lugar
 * nenhum, so nao gera nada. */
function aaAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('aaass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="80" height="80" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

function aaArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema. Nao ha helper para calcular isso na arquitetura.
  const rel = (related && related.length) ? `<section class="${c('aarel')}">
<div class="${c('aash')}"><h2>Leia também</h2></div>
<div class="${c('aagrade')} ${c('aag' + Math.min(related.length, 3))}">${related.slice(0, 3).map(a =>
    aaGrid(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${aaHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('aawrap')}"><div class="${c('aain')}">
<article class="${c('aaart')}">
<div class="${c('aacol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('aakick')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('aadek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('aacapaimg')}">${H.pic(art, true)}</span>
<p class="${c('aaleg')}">${H.esc(art.image && art.image.alt ? art.image.alt : art.title)}</p>` : ''}
<div class="${c('aabody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${aaAssinatura(ctx, art)}
${rel}
</div></main>
${aaFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function aaList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  return `${H.head(ctx, meta)}
${aaHeader(ctx, menu)}
<main class="${c('aawrap')}"><div class="${c('aain')}">
<section class="${c('aasec')}" style="border-top:0">
<div class="${c('aash')} ${c('aash1')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('aadek')}" style="max-width:66ch;margin-top:-12px">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('aagrade')}">${itens.map((a, i) => aaGrid(ctx, a, i === 0, 2)).join('')}</div>
</section>
</div></main>
${aaFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { aaCss, aaHeader, aaFooter, aaHome, aaArticle, aaList };
