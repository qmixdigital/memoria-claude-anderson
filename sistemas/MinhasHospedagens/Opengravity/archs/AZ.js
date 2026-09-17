/*
 * Arquitetura AZ, arquetipo RAIL. Feita para o revistatopsaude.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca da Revista Top Saude e um **documento azul com linhas de texto**, com
 * uma lupa vermelha de cruz medica no canto, ao lado de "revista" em cursiva e
 * TOP SAUDE em grotesco pesado, TOP em vermelho e SAUDE em azul-marinho.
 *
 * O que o nome promete e **revista**, e revista tem sumario. O gesto que sai dai
 * e o **rail**: uma coluna estreita a direita, grudada na rolagem, com a lista
 * do que mais se le, numerada em vermelho. A home vira duas colunas de verdade,
 * e nao uma pilha de faixas.
 *
 * ## O que a diferencia das 51 vizinhas da opengravity
 *
 *   - **home em duas colunas com rail grudado** (`position:sticky`). A AD tem
 *     rail de "ultimas", mas solto e sem sticky, e a coluna principal dela e
 *     faixa cheia
 *   - **numeracao do rail em vermelho cheio, grande, a esquerda do titulo**
 *   - **serifada de revista no titulo** (Piazzolla) contra grotesca estreita no
 *     corpo (Encode Sans): nenhuma das duas esta nas 86 familias em uso
 *   - marinho com vermelho-tijolo, tirados dos pixels do logotipo
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **`position:sticky` so gruda se o PAI nao tiver `overflow` escondido e
 * tiver altura maior que o rail.** Numa grade de duas colunas o pai e a celula,
 * e ela cresce com o conteudo: o rail gruda. Mas basta alguem por
 * `overflow:hidden` no wrapper para o sticky virar `static` **sem nenhum aviso**,
 * e a coluna passa a rolar junto. Por isso o wrapper desta arquitetura nao tem
 * `overflow` em lugar nenhum.
 *
 * 🔴 **O portal NAO e plano e o `category_base` da origem estava VAZIO**, o que
 * significa `category`, em ingles. Artigo em `/<editoria>/<slug>/`, listagem em
 * `/category/<slug>/`, e todo link de editoria sai de `H.curl`.
 *
 * ⚠️ **Abaixo de 1000px o rail vira uma faixa comum**, embaixo da coluna
 * principal, e o `sticky` sai: grudado em tela estreita ele cobre o texto.
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por `H.curl(slug)` e de artigo por `H.url(a)`
 *   - menu sanfonado abaixo de 1100px, com aria-expanded, aria-controls e
 *     rotulo que muda ao abrir
 *   - todo `span` com aspect-ratio tem `display:block`, e o `a` do cartao tem
 *     `display`
 *   - body aberto no cabecalho e `H.bodyEnd()` nos tres caminhos de pagina
 *   - nada centralizado alem da marca
 *   - lista de editoria abre em h1, e o cartao dela sobe para h2
 *   - a grade da listagem pula o destaque, e nao o repete
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *   - a legenda da imagem so aparece quando o `alt` descreve a foto
 *   - as variaveis de cor vao no `:root`, e o respiro usa `padding-block`
 */

function azCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#F2F3F9';
  const viva = t.vivid || '#B01C28';
  const canto = fp.radius === 'sharp' ? '0' : '3px';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--tinta:${t.tinta || t.primary};--sob:${t.onPrimary || '#fff'};
  --footer-bg:${t.footerBg || '#141A48'};--footer-tx:${t.footerTx || '#BEC4E4'};
  --fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('azwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('azwrap')} *{box-sizing:border-box}
${s('azin')}{max-width:${fp.container || '1200px'};margin:0 auto;padding:0 24px;width:100%}
${s('azwrap')} h1,${s('azwrap')} h2,${s('azwrap')} h3,${s('azwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.006em;line-height:1.14;margin:0}
${s('azwrap')} a{color:inherit;text-decoration:none}
${s('azwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('aztop')}{background:var(--paper);border-bottom:3px double var(--pri)}
${s('azbar')}{display:flex;align-items:center;gap:18px;padding-block:16px 18px;flex-wrap:wrap}
${s('azmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:800;font-size:clamp(22px,2.9vw,32px);letter-spacing:-.02em;color:var(--pri);flex:none}
${s('azmarca')} svg{display:block;height:1.15em;width:auto;flex:none;align-self:center}
/* imagem sem medida derruba o CLS: a altura manda, a largura sai da proporcao */
${s('azmarca')} img{display:block;height:46px;width:auto;flex:none}
@media(max-width:560px){${s('azmarca')} img{height:36px}}
${s('azfb')} img{display:block;height:42px;width:auto}
${s('aznav')}{display:flex;gap:17px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('aznav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.05em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('aznav')} a:hover{color:var(--viva)}
${s('azbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--viva);color:#fff;padding:10px 17px;border-radius:${canto};
  flex:none;margin-left:6px}
${s('azbusca')}:hover{background:var(--pri)}
${s('azham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('azham')} i,${s('azham')} i::before,${s('azham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--pri);content:""}
${s('azham')} i{top:21px}
${s('azham')} i::before{top:-6px;left:0}
${s('azham')} i::after{top:6px;left:0}
@media(max-width:560px){${s('azmarca')}{font-size:20px;gap:8px}${s('azbar')}{gap:11px}
  ${s('azbusca')}{font-size:10.5px;padding:9px 13px;gap:6px}}
@media(max-width:1100px){
  ${s('azham')}{display:block;order:2}
  ${s('azbusca')}{order:3;margin-left:0}
  ${s('aznav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('aznav')}[data-aberto="1"]{display:flex}
  ${s('aznav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink);
    font-size:13.5px}
}

/* ---------- home em duas colunas: miolo e rail grudado ----------
   nenhum overflow no caminho: basta um overflow:hidden no pai para o sticky
   virar static, sem aviso nenhum */
${s('azduas')}{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:46px;
  padding-block:34px 12px;align-items:start}
${s('azrail')}{position:sticky;top:22px;border-top:3px solid var(--viva);padding-top:16px}
${s('azrailh')}{font-family:var(--fd);font-weight:800;font-size:19px;letter-spacing:-.014em;
  color:var(--pri);margin:0 0 14px}
${s('azrail')} ol{list-style:none;margin:0;padding:0;counter-reset:az}
${s('azrail')} li{counter-increment:az;border-bottom:1px solid var(--line)}
${s('azrail')} li a{display:grid;grid-template-columns:auto minmax(0,1fr);gap:13px;
  align-items:start;padding-block:13px}
${s('azrail')} li a::before{content:counter(az);font-family:var(--fd);font-weight:800;
  font-size:25px;line-height:1;color:var(--viva);letter-spacing:-.03em;padding-top:1px}
${s('azrail')} li a span{font-family:var(--fd);font-weight:700;font-size:15.5px;line-height:1.3;
  color:var(--ink);transition:color .2s ease}
${s('azrail')} li a:hover span{color:var(--viva)}
@media(max-width:1000px){
  ${s('azduas')}{grid-template-columns:1fr;gap:34px}
  /* grudado em tela estreita ele cobre o texto */
  ${s('azrail')}{position:static}
}

/* ---------- abertura: texto a esquerda, imagem a direita ---------- */
${s('azabre')}{display:grid;grid-template-columns:1.04fr 1fr;gap:36px;align-items:center;
  padding-bottom:30px;border-bottom:1px solid var(--line)}
${s('azabre')} h2{font-size:clamp(29px,3.9vw,46px);line-height:1.05;margin:13px 0 0;
  letter-spacing:-.022em}
${s('azabre')} h2 a:hover{color:var(--viva)}
${s('azabre')} p{font-size:17px;line-height:1.6;color:var(--dek);margin:15px 0 0;
  max-width:46ch;text-align:left}
${s('azmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:17px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('azmm')} b{color:var(--ink);font-weight:700}
${s('azchap')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;color:#fff;background:var(--viva);
  padding:6px 13px;border-radius:${canto}}
${s('azchap')} a{color:#fff}
@media(max-width:820px){${s('azabre')}{grid-template-columns:1fr;gap:20px}}

/* ---------- secao dentro do miolo ---------- */
${s('azsec')}{padding-block:34px 0}
${s('azcab')}{display:flex;align-items:baseline;gap:14px;margin-bottom:22px;flex-wrap:wrap;
  border-bottom:2px solid var(--pri);padding-bottom:9px}
${s('azcab')} h1,${s('azcab')} h2{font-family:var(--fd);font-weight:800;
  font-size:clamp(21px,2.4vw,28px);letter-spacing:-.02em;color:var(--pri);margin:0;
  line-height:1.1;flex:none}
${s('azmais')}{margin-left:auto;font-family:var(--fb);font-size:11.5px;font-weight:700;
  letter-spacing:.08em;text-transform:uppercase;color:var(--viva);flex:none}
${s('azmais')}:hover{color:var(--pri)}
${s('azdescr')}{margin:0 0 24px;font-size:15.5px;line-height:1.64;color:var(--dek);
  max-width:70ch;text-align:left}

/* materia de abertura da secao: foto larga em cima, texto embaixo */
${s('azdest')}{display:block}
${s('azdest')} ${s('azti')}{font-size:clamp(20px,2.4vw,28px);line-height:1.13;margin-top:12px;
  letter-spacing:-.018em}
${s('azkick')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.14em'};text-transform:uppercase;color:var(--viva)}
${s('azti')}{display:block;font-family:var(--fd);font-weight:700;font-size:19px;line-height:1.2;
  color:var(--ink);margin:0;transition:color .2s ease;letter-spacing:-.01em}
${s('azdd')}{display:block;margin:10px 0 0;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:56ch;text-align:left}
${s('azdt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('azfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('azfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('azfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('azdest')}:hover ${s('azti')}{color:var(--viva)}
${s('azdest')}:hover ${s('azfoto')} [data-f] img{transform:scale(1.04)}

/* a lista do miolo: dois cartoes por linha, com filete marinho fino em cima */
${s('azlista')}{display:grid;grid-template-columns:1fr 1fr;gap:28px 26px;margin-top:26px}
${s('azrow')}{display:block;border-top:2px solid var(--line);padding-top:13px}
${s('azrow')}:hover{border-top-color:var(--viva)}
${s('azmini')}{display:block;overflow:hidden;background:var(--ph);margin-bottom:11px;
  border-radius:${canto}}
${s('azmini')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '16/9'};overflow:hidden}
${s('azmini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('azrow')}:hover ${s('azmini')} [data-f] img{transform:scale(1.05)}
${s('azrow')}:hover ${s('azti')}{color:var(--viva)}
${s('azrow')} ${s('azti')}{font-size:17.5px;line-height:1.24;margin-top:6px}
${s('azrow')} ${s('azdd')}{display:none}
@media(max-width:640px){${s('azlista')}{grid-template-columns:1fr;gap:24px}}

/* listagem de editoria e relacionados: grade de tres cartoes */
${s('azgrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 26px}
${s('azgrade')} ${s('azti')}{font-size:18.5px;line-height:1.22;margin-top:11px}
${s('azgrade')} ${s('azdd')}{display:none}
${s('azgrade')} ${s('azfoto')} [data-f]{aspect-ratio:${fp.cardAr || '16/9'}}
@media(max-width:900px){${s('azgrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:600px){${s('azgrade')}{grid-template-columns:1fr;gap:28px}}

/* ---------- artigo ---------- */
${s('azart')}{padding-block:28px 12px}
${s('azcol')}{max-width:70ch}
${s('azart')} h1{font-size:clamp(28px,3.9vw,43px);line-height:1.08;letter-spacing:-.024em;
  margin:14px 0 0}
${s('azdek')}{font-size:19px;line-height:1.55;color:var(--dek);margin:16px 0 0;max-width:62ch}
${s('azhero')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto};
  margin-top:26px}
${s('azhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('azhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('azleg')}{margin:10px 0 0;font-size:12.5px;line-height:1.5;color:var(--muted);
  max-width:70ch;text-align:left}
${s('azbody')}{max-width:70ch;margin-top:26px;font-size:${fp.corpoFs || '18px'};line-height:1.78}
${s('azbody')} p{margin:0 0 21px}
${s('azbody')} a{color:var(--viva);text-decoration:underline;text-underline-offset:3px}
${s('azbody')} a:hover{color:var(--pri)}
${s('azbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.02em;
  margin:36px 0 12px;color:var(--pri)}
${s('azbody')} h3{font-family:var(--fd);font-weight:700;font-size:20px;margin:28px 0 10px}
${s('azbody')} ul,${s('azbody')} ol{margin:0 0 21px;padding-left:22px}
${s('azbody')} li{margin:0 0 9px}
${s('azbody')} img{max-width:100%;height:auto;border-radius:${canto};margin:8px 0}
${s('azbody')} figure{margin:22px 0}
${s('azbody')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px}
${s('azbody')} blockquote{margin:28px 0;padding:0 0 0 22px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:21px;line-height:1.44;font-style:italic}
${s('azbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}
${s('azbody')} th,${s('azbody')} td{border:0;border-bottom:1px solid var(--line);
  padding:11px 12px 11px 0;text-align:left;vertical-align:top}
${s('azbody')} th{font-family:var(--fb);font-weight:700;background:transparent}
${s('azbody')} caption{text-align:left;font-size:13px;color:var(--muted);padding-bottom:8px}

/* a tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. O thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('azbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('azbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('azbody')} table caption{display:none}
  ${s('azbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;
    clip:rect(0 0 0 0)}
  ${s('azbody')} table tbody,${s('azbody')} table tr,
  ${s('azbody')} table th,${s('azbody')} table td{display:block;width:auto}
  ${s('azbody')} table tbody tr{background:var(--wash);border:1px solid var(--line);
    border-radius:10px;padding:2px 18px 16px;margin-bottom:13px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('azbody')} table tbody th,${s('azbody')} table tbody td{border:0;background:transparent;
    padding:0}
  ${s('azbody')} table tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;
    font-weight:700;text-align:left}
  ${s('azbody')} table tbody td{padding:13px 0 0;text-align:left;line-height:1.55}
  ${s('azbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);
    margin-bottom:2px}
}

${s('azass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:start;
  max-width:70ch;margin-top:38px;padding:20px;background:var(--wash);border-radius:${canto}}
${s('azass')} img{border-radius:${canto}}
${s('azass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--viva)}
${s('azass')} .nm{display:block;font-family:var(--fd);font-weight:700;font-size:19px;margin-top:4px}
${s('azass')} p{margin:8px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek)}
${s('azass')} .go{display:inline-block;margin-top:10px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--pri);
  border-bottom:2px solid var(--viva);padding-bottom:2px}
@media(max-width:560px){${s('azass')}{grid-template-columns:1fr;gap:12px}}

/* relacionados com a MESMA largura da coluna do artigo */
${s('azrel')}{max-width:70ch;margin-top:44px;padding-top:22px;border-top:3px double var(--pri)}
${s('azrotb')}{display:inline-block;font-family:var(--fd);font-weight:800;font-size:20px;
  letter-spacing:-.02em;color:var(--pri);margin-bottom:18px}
${s('azrel')} ${s('azgrade')}{grid-template-columns:1fr 1fr;gap:26px 22px}
@media(max-width:600px){${s('azrel')} ${s('azgrade')}{grid-template-columns:1fr}}

/* ---------- rodape ---------- */
${s('azfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:56px;
  padding-block:38px 22px}
${s('azcols')}{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:34px}
${s('azfoot')} p{font-size:14.5px;color:var(--footer-tx)}
${s('azfb')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:800;font-size:23px;letter-spacing:-.02em;color:#fff}
${s('azfh')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:#fff;margin-bottom:12px}
${s('azflist')} a{display:block;font-size:14.5px;padding:4px 0;color:var(--footer-tx)}
${s('azflist')} a:hover{color:#fff}
${s('azfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:28px;padding-top:15px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12.5px;opacity:.85}
@media(max-width:820px){${s('azcols')}{grid-template-columns:1fr;gap:26px}}

${s('reveal')}{opacity:1}
@media(prefers-reduced-motion:reduce){
  ${s('azwrap')} *{transition:none !important;animation:none !important}
}`;
}

/* O documento com a lupa da marca, desenhado. So entra quando o portal nao tem
 * arquivo de logotipo. */
const AZ_SIMB = `<svg viewBox="0 0 26 30" width="26" height="30" aria-hidden="true">
<path d="M4 2h11l7 7v19H4Z" fill="none" stroke="var(--marca-1,#232E86)" stroke-width="2"
  stroke-linejoin="round"/>
<path d="M15 2v7h7" fill="none" stroke="var(--marca-1,#232E86)" stroke-width="2"
  stroke-linejoin="round"/>
<path d="M8 14h10M8 18h10M8 22h6" stroke="var(--marca-1,#232E86)" stroke-width="1.6"
  stroke-linecap="round"/>
<circle cx="19" cy="21" r="6" fill="var(--marca-2,#B01C28)"/>
<path d="M19 18v6M16 21h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const AZ_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function azHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'aznav-' + (site.slug || 'p');
  // 🔴 a listagem mora em /category/<slug>/, em INGLES: o `category_base` da
  // origem estava vazio, e vazio significa `category`
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('aztop')}">
<div class="${c('azin')} ${c('azbar')}">
<a class="${c('azmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--pri);--marca-2:var(--viva)">${site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${AZ_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
<nav class="${c('aznav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('azham')}" type="button" data-azham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('azbusca')}" href="/busca/">${AZ_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-azham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function azFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('azfoot')}"><div class="${c('azin')}">
<div class="${c('azcols')}">
  <div><a class="${c('azfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#8E97D8;--marca-2:var(--viva)">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${AZ_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('azfh')}">Editorias</div><div class="${c('azflist')}">${cats}</div></div>
  <div><div class="${c('azfh')}">A revista</div><div class="${c('azflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('azfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* Cartao com foto em cima. O `span` da foto tem display:block, senao o
 * aspect-ratio nao aplica. */
function azDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('azdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('azfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span class="${c('azkick')}">${H.cat(a)}</span>
<h${n} class="${c('azti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('azdd')}">${H.esc(H.clip(a.dek, 180))}</span>` : ''}
<span class="${c('azdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

function azLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('azrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('azmini')}"><span data-f>${H.pic(a, false)}</span></span>
<span class="${c('azkick')}">${H.cat(a)}</span>
<h${n} class="${c('azti')}">${H.esc(a.title)}</h${n}>
<span class="${c('azdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

function azHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('azabre')}">
<div><span class="${c('azchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('azmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('azfoto')}">
<span data-f>${H.pic(abre, true)}</span></span></a>
</section>` : '';

  // o rail pega os mais recentes que nao entraram na abertura. Nao e "mais
  // lidas" de verdade: o motor nao guarda audiencia, e inventar numero seria
  // mentir para o leitor. O rotulo diz o que e
  const rail = arts.filter(a => !usados.has(a.slug)).slice(0, 8);
  const railHtml = rail.length ? `<aside class="${c('azrail')}">
<div class="${c('azrailh')}">Publicado agora</div>
<ol>${rail.map(a => `<li><a href="${H.url(a)}"><span>${H.esc(a.title)}</span></a></li>`).join('')}</ol>
</aside>` : '';

  const porCat = new Map();
  for (const a of arts) {
    if (usados.has(a.slug)) continue;
    const k = a.category ? a.category.slug : 'noticias';
    if (!porCat.has(k)) porCat.set(k, []);
    porCat.get(k).push(a);
  }

  const secoes = [...porCat.entries()]
    .filter(([, v]) => v.length >= 2)
    .slice(0, 6)
    .map(([cs, v], idx) => {
      const nome = v[0].category ? v[0].category.name : cs;
      const [d, ...resto] = v;
      return `<section class="${c('azsec')}">
<div class="${c('azcab')}"><h2>${H.esc(nome)}</h2>
<a class="${c('azmais')}" href="${H.curl(cs)}">Ver tudo</a></div>
${azDestaque(ctx, d, idx === 0)}
${resto.length ? `<div class="${c('azlista')}">${resto.slice(0, 4).map(a => azLinha(ctx, a)).join('')}</div>` : ''}
</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${azHeader(ctx, menu)}
<main class="${c('azwrap')}">
<div class="${c('azin')}">${H.h1(ctx)}
<div class="${c('azduas')}">
<div>${abertura}${secoes}</div>
${railHtml}
</div></div>
</main>
${azFooter(ctx, menu)}
${H.bodyEnd()}`;
}

function azAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('azass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="84" height="84" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

/* A legenda so aparece quando o `alt` descreve a FOTO. Em metade do acervo
 * importado ele e copia do titulo, ou do slug, e ai repetiria o `h1`. */
function azLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const chato = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const cSlug = chato(art.slug), cAlt = chato(alt);
  const pref = cAlt.length >= 25 && (cSlug.indexOf(cAlt) === 0 || cAlt.indexOf(cSlug) === 0);
  if (!alt || cAlt === chato(t) || cAlt === cSlug || pref) return '';
  return `<p class="${c('azleg')}">${H.esc(alt)}</p>`;
}

/* A linha fina do artigo so aparece quando NAO esta no corpo. A limpeza da
 * importacao tira a frase do proprio texto quando o `excerpt` da origem vem
 * vazio, o que salva o cartao da home; aqui o mesmo campo seria repeticao. */
function azDekVale(art) {
  const d = String(art.dek || '').trim();
  if (!d) return false;
  const nu = (x) => String(x || '').toLowerCase().replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const chave = nu(d).slice(0, 60);
  return !!chave && nu(art.content).indexOf(chave) < 0;
}

function azArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const rel = (related && related.length) ? `<section class="${c('azrel')}">
<h2 class="${c('azrotb')}">Leia também</h2>
<div class="${c('azgrade')}">${related.slice(0, 4).map(a => azDestaque(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${azHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('azwrap')}"><div class="${c('azin')}">
<article class="${c('azart')}">
<div class="${c('azcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('azchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${azDekVale(art) ? `<p class="${c('azdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('azhero')}"><span data-f>${H.pic(art, true)}</span></span>
${azLegenda(ctx, art)}` : ''}
<div class="${c('azbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${azAssinatura(ctx, art)}
${rel}
</div></main>
${azFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function azList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  // a grade pula o destaque, e nao o repete: `resto`, nunca `itens`
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${azHeader(ctx, menu)}
<main class="${c('azwrap')}"><div class="${c('azin')}">
<section class="${c('azsec')}">
<div class="${c('azcab')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('azdescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? azDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('azgrade')}" style="margin-top:32px">${resto.map(a => azDestaque(ctx, a, false, 2)).join('')}</div>` : ''}
</section>
</div></main>
${azFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { azCss, azHeader, azFooter, azHome, azArticle, azList };
