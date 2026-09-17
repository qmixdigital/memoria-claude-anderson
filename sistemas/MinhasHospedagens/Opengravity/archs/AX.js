/*
 * Arquitetura AX, arquetipo NUMERAL. Feita para o saudicas.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca do Saude Dicas e uma **lampada acesa com uma cruz dentro**, em ciano e
 * verde, ao lado de SAUDEDICAS em duas cores: SAUDE em ciano, DICAS em verde.
 *
 * O que o nome promete e **dica**, e dica se conta. O gesto que sai dai e o
 * **numeral**: cada linha da secao carrega um numero grande em contorno, vazado,
 * como item de lista. O numero e desenhado pelo CSS com `counter`, entao ele
 * acompanha a ordem real e nunca sai errado ao reordenar.
 *
 * ## O que a diferencia das 49 vizinhas da opengravity
 *
 *   - **numeral vazado grande** (`-webkit-text-stroke`) como ancora visual de
 *     cada linha. A AT numera com `counter` mas em numero cheio e pequeno, dentro
 *     do ::before de um item de lista escura
 *   - **grade de duas colunas que preenche por COLUNA**, com o numero de linhas
 *     calculado no render. Ler descendo a coluna mantem a data em ordem
 *   - **cabecalho de secao com a lampada de contorno** ao lado do nome
 *   - **Reddit Sans e Sarabun**: nenhuma das duas esta nas 86 familias em uso
 *   - ciano-clinico com verde-folha, os dois tirados dos pixels do logotipo
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **O `--l` da grade de duas colunas NAO da para cravar no CSS.** Ele muda de
 * 3, no bloco da home, para dezenas, na listagem de editoria. Sem ele o
 * `grid-auto-flow:column` nao tem quantas linhas usar e a grade volta a
 * preencher por linha: o segundo item mais recente vai para o topo da coluna da
 * direita e quem le descendo ve a data pular. O HTML fica identico nos dois
 * casos, entao **so a captura de tela mostra**. Cada chamada passa o proprio
 * valor no atributo `style`.
 *
 * 🔴 **O portal NAO e plano, e o `category_base` da origem estava VAZIO**, o que
 * no WordPress significa `category`, em ingles. Artigo em `/<editoria>/<slug>/`,
 * listagem em `/category/<slug>/`, e todo link de editoria sai de `H.curl`.
 *
 * ⚠️ **O numeral vazado precisa de cor de traco propria.** Herdando `--muted`
 * ele some no fundo lavado das secoes pares.
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
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 */

function axCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#EEF7FA';
  const viva = t.vivid || '#4C8A2E';
  const canto = fp.radius === 'sharp' ? '0' : '10px';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--tinta:${t.tinta || t.primary};--sob:${t.onPrimary || '#fff'};
  --num:${t.numeral || t.line};
  --footer-bg:${t.footerBg || '#0B3A4A'};--footer-tx:${t.footerTx || '#CFE4EC'};
  --fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('axwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.68;-webkit-font-smoothing:antialiased}
${s('axwrap')} *{box-sizing:border-box}
${s('axin')}{max-width:${fp.container || '1150px'};margin:0 auto;padding:0 24px;width:100%}
${s('axwrap')} h1,${s('axwrap')} h2,${s('axwrap')} h3,${s('axwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.014em;line-height:1.15;margin:0}
${s('axwrap')} a{color:inherit;text-decoration:none}
${s('axwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('axtop')}{background:var(--paper);border-bottom:1px solid var(--line)}
${s('axbar')}{display:flex;align-items:center;gap:18px;padding-block:15px 17px;flex-wrap:wrap}
${s('axmarca')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:800;font-size:clamp(21px,2.8vw,30px);letter-spacing:-.026em;color:var(--pri);flex:none}
${s('axmarca')} svg{display:block;height:1.05em;width:auto;flex:none;align-self:center}
/* imagem sem medida derruba o CLS: a altura manda e a largura sai da proporcao */
${s('axmarca')} img{display:block;height:44px;width:auto;flex:none}
@media(max-width:560px){${s('axmarca')} img{height:34px}}
${s('axfb')} img{display:block;height:40px;width:auto}
${s('axnav')}{display:flex;gap:18px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('axnav')} a{font-family:var(--fb);font-size:13px;font-weight:600;color:var(--dek);
  transition:color .2s ease;position:relative;padding-bottom:3px}
${s('axnav')} a::after{content:"";position:absolute;left:0;right:100%;bottom:0;height:2px;
  background:var(--viva);transition:right .25s ease}
${s('axnav')} a:hover{color:var(--pri)}
${s('axnav')} a:hover::after{right:0}
${s('axbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:12px;font-weight:700;background:var(--pri);color:var(--sob);padding:10px 16px;
  border-radius:${canto};flex:none;margin-left:6px}
${s('axbusca')}:hover{background:var(--viva)}
${s('axham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('axham')} i,${s('axham')} i::before,${s('axham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--pri);content:""}
${s('axham')} i{top:21px}
${s('axham')} i::before{top:-6px;left:0}
${s('axham')} i::after{top:6px;left:0}
@media(max-width:560px){${s('axmarca')}{font-size:19.5px;gap:8px}${s('axbar')}{gap:11px}
  ${s('axbusca')}{font-size:11px;padding:9px 13px;gap:6px}}
@media(max-width:1100px){
  ${s('axham')}{display:block;order:2}
  ${s('axbusca')}{order:3;margin-left:0}
  ${s('axnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:13px}
  ${s('axnav')}[data-aberto="1"]{display:flex}
  ${s('axnav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink);
    font-size:14px}
  ${s('axnav')} a::after{display:none}
}

/* ---------- abertura: texto a esquerda, imagem a direita ---------- */
${s('axabre')}{display:grid;grid-template-columns:1.02fr 1fr;gap:42px;align-items:center;
  padding-block:36px 32px;border-bottom:1px solid var(--line)}
${s('axabre')} h2{font-size:clamp(29px,4.2vw,49px);line-height:1.05;margin:13px 0 0;
  letter-spacing:-.03em}
${s('axabre')} h2 a:hover{color:var(--pri)}
${s('axabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('axmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:18px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('axmm')} b{color:var(--ink);font-weight:700}
${s('axchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.11em;text-transform:uppercase;color:var(--pri);border:2px solid var(--pri);
  padding:5px 12px;border-radius:${canto}}
${s('axchap')} a{color:var(--pri)}
@media(max-width:820px){${s('axabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 24px}}

/* ---------- secao ---------- */
${s('axsec')}{padding-block:44px;background:var(--paper)}
${s('axsec')}[data-par="1"]{background:var(--wash)}
${s('axcab')}{display:flex;align-items:center;gap:14px;margin-bottom:26px;flex-wrap:wrap}
${s('axcab')} svg{flex:none;width:30px;height:30px;color:var(--viva)}
${s('axcab')} h1,${s('axcab')} h2{font-family:var(--fd);font-weight:800;
  font-size:clamp(22px,2.6vw,31px);letter-spacing:-.028em;color:var(--pri);margin:0;
  line-height:1.08;flex:none}
${s('axmais')}{margin-left:auto;font-family:var(--fb);font-size:12px;font-weight:700;
  color:var(--viva);flex:none;border-bottom:2px solid var(--viva);padding-bottom:3px}
${s('axmais')}:hover{color:var(--pri);border-bottom-color:var(--pri)}
${s('axdescr')}{margin:0 0 28px;font-size:15.5px;line-height:1.66;color:var(--dek);
  max-width:72ch;text-align:left}

/* materia de abertura da secao: foto larga em cima, texto embaixo */
${s('axdest')}{display:block}
${s('axdest')} ${s('axti')}{font-size:clamp(21px,2.5vw,30px);line-height:1.12;margin-top:13px;
  letter-spacing:-.022em}
${s('axkick')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.11em'};text-transform:uppercase;color:var(--viva)}
${s('axti')}{display:block;font-family:var(--fd);font-weight:700;font-size:19px;line-height:1.2;
  color:var(--ink);margin:0;transition:color .2s ease;letter-spacing:-.018em}
${s('axdd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:58ch;text-align:left}
${s('axdt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:12px;color:var(--muted)}
${s('axfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('axfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('axfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('axdest')}:hover ${s('axti')}{color:var(--pri)}
${s('axdest')}:hover ${s('axfoto')} [data-f] img{transform:scale(1.04)}

/* a lista numerada, em DUAS colunas preenchidas por COLUNA. O numero de linhas
   vem no atributo style de cada chamada: cravado no CSS ele erraria em todo
   lugar menos num */
${s('axlista')}{display:grid;grid-template-columns:1fr 1fr;gap:0 40px;margin-top:34px;
  grid-auto-flow:column;grid-template-rows:repeat(var(--l,3),auto);counter-reset:ax}
${s('axrow')}{display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:start;
  padding-block:17px;border-top:1px solid var(--line);counter-increment:ax}
${s('axrow')}::before{content:counter(ax,decimal-leading-zero);font-family:var(--fd);
  font-weight:800;font-size:34px;line-height:1;color:transparent;
  -webkit-text-stroke:1.5px var(--num);letter-spacing:-.04em;padding-top:2px}
${s('axrow')}:hover::before{-webkit-text-stroke-color:var(--viva)}
${s('axrow')}:hover ${s('axti')}{color:var(--pri)}
${s('axrow')} ${s('axti')}{font-size:17.5px;line-height:1.26;margin-top:2px}
${s('axrow')} ${s('axdd')}{display:none}
@media(max-width:820px){
  ${s('axlista')}{grid-template-columns:1fr;grid-auto-flow:row;grid-template-rows:none;
    gap:0;margin-top:28px}
}

/* listagem de editoria e relacionados: grade de tres cartoes */
${s('axgrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:36px 28px}
${s('axgrade')} ${s('axti')}{font-size:19px;line-height:1.22;margin-top:12px}
${s('axgrade')} ${s('axdd')}{display:none}
${s('axgrade')} ${s('axfoto')} [data-f]{aspect-ratio:${fp.cardAr || '16/9'}}
@media(max-width:900px){${s('axgrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:600px){${s('axgrade')}{grid-template-columns:1fr;gap:28px}}

/* ---------- artigo ---------- */
${s('axart')}{padding-block:30px 12px}
${s('axcol')}{max-width:${fp.medida || '70ch'}}
${s('axart')} h1{font-size:clamp(28px,4vw,44px);line-height:1.07;letter-spacing:-.032em;
  margin:14px 0 0}
${s('axdek')}{font-size:19px;line-height:1.55;color:var(--dek);margin:16px 0 0;max-width:62ch}
${s('axhero')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto};
  margin-top:26px}
${s('axhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('axhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('axleg')}{margin:10px 0 0;font-size:12.5px;line-height:1.5;color:var(--muted);
  max-width:70ch;text-align:left}
${s('axbody')}{max-width:70ch;margin-top:26px;font-size:${fp.corpoFs || '18px'};line-height:1.8}
${s('axbody')} p{margin:0 0 21px}
${s('axbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:3px}
${s('axbody')} a:hover{color:var(--viva)}
${s('axbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.026em;
  margin:36px 0 12px;color:var(--pri)}
${s('axbody')} h3{font-family:var(--fd);font-weight:700;font-size:20px;margin:28px 0 10px}
${s('axbody')} ul,${s('axbody')} ol{margin:0 0 21px;padding-left:22px}
${s('axbody')} li{margin:0 0 9px}
${s('axbody')} img{max-width:100%;height:auto;border-radius:${canto};margin:8px 0}
${s('axbody')} figure{margin:22px 0}
${s('axbody')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px}
${s('axbody')} blockquote{margin:28px 0;padding:18px 22px;background:var(--wash);
  border-radius:${canto};border-left:5px solid var(--viva);font-family:var(--fd);
  font-size:20px;line-height:1.45}
${s('axbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}
${s('axbody')} th,${s('axbody')} td{border:0;border-bottom:1px solid var(--line);
  padding:11px 12px 11px 0;text-align:left;vertical-align:top}
${s('axbody')} th{font-family:var(--fb);font-weight:700;background:transparent}
${s('axbody')} caption{text-align:left;font-size:13px;color:var(--muted);padding-bottom:8px}

/* a tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. O thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('axbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('axbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('axbody')} table caption{display:none}
  ${s('axbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;
    clip:rect(0 0 0 0)}
  ${s('axbody')} table tbody,${s('axbody')} table tr,
  ${s('axbody')} table th,${s('axbody')} table td{display:block;width:auto}
  ${s('axbody')} table tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:14px;padding:2px 18px 16px;margin-bottom:13px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('axbody')} table tbody th,${s('axbody')} table tbody td{border:0;background:transparent;
    padding:0}
  ${s('axbody')} table tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;
    font-weight:700;text-align:left}
  ${s('axbody')} table tbody td{padding:13px 0 0;text-align:left;line-height:1.55}
  ${s('axbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);
    margin-bottom:2px}
}

${s('axass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:start;
  max-width:70ch;margin-top:38px;padding:20px;border:2px solid var(--line);
  border-radius:${canto}}
${s('axass')} img{border-radius:${canto}}
${s('axass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--viva)}
${s('axass')} .nm{display:block;font-family:var(--fd);font-weight:700;font-size:19px;margin-top:4px}
${s('axass')} p{margin:8px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek)}
${s('axass')} .go{display:inline-block;margin-top:10px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;color:var(--pri);border-bottom:2px solid var(--pri);padding-bottom:2px}
@media(max-width:560px){${s('axass')}{grid-template-columns:1fr;gap:12px}}

/* relacionados com a MESMA largura da coluna do artigo */
${s('axrel')}{max-width:70ch;margin-top:44px;padding-top:24px;border-top:3px solid var(--pri)}
${s('axrotb')}{display:inline-block;font-family:var(--fd);font-weight:800;font-size:20px;
  letter-spacing:-.024em;color:var(--pri);margin-bottom:20px}
${s('axrel')} ${s('axgrade')}{grid-template-columns:1fr 1fr;gap:26px 22px}
@media(max-width:600px){${s('axrel')} ${s('axgrade')}{grid-template-columns:1fr}}

/* ---------- rodape ---------- */
${s('axfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:56px;
  padding-block:38px 22px}
${s('axcols')}{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:34px}
${s('axfoot')} p{font-size:14.5px;color:var(--footer-tx)}
${s('axfb')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:800;font-size:23px;letter-spacing:-.026em;color:#fff}
${s('axfh')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:#fff;margin-bottom:12px}
${s('axflist')} a{display:block;font-size:14.5px;padding:4px 0;color:var(--footer-tx)}
${s('axflist')} a:hover{color:#fff}
${s('axfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:28px;padding-top:15px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12.5px;opacity:.85}
@media(max-width:820px){${s('axcols')}{grid-template-columns:1fr;gap:26px}}

${s('reveal')}{opacity:1}
@media(prefers-reduced-motion:reduce){
  ${s('axwrap')} *{transition:none !important;animation:none !important}
}`;
}

/* A lampada da marca, desenhada. So entra quando o portal nao tem arquivo de
 * logotipo: com arquivo, quem manda e a imagem da origem. */
const AX_SIMB = `<svg viewBox="0 0 24 30" width="24" height="30" aria-hidden="true" fill="none"
 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 2a8 8 0 0 0-4.6 14.6c.6.5.9 1.2.9 2V20h7.4v-1.4c0-.8.3-1.5.9-2A8 8 0 0 0 12 2Z"/>
<path d="M9 24h6M10 27h4"/><path d="M12 9v5M9.5 11.5h5" stroke="var(--marca-2,currentColor)"/>
</svg>`;

const AX_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function axHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'axnav-' + (site.slug || 'p');
  // 🔴 a listagem mora em /category/<slug>/, em INGLES: na origem o
  // `category_base` estava vazio, e vazio significa `category`
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('axtop')}">
<div class="${c('axin')} ${c('axbar')}">
<a class="${c('axmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-2:var(--viva)">${site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${AX_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
<nav class="${c('axnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('axham')}" type="button" data-axham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('axbusca')}" href="/busca/">${AX_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-axham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function axFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('axfoot')}"><div class="${c('axin')}">
<div class="${c('axcols')}">
  <div><a class="${c('axfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-2:#8CC63F">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${AX_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('axfh')}">Editorias</div><div class="${c('axflist')}">${cats}</div></div>
  <div><div class="${c('axfh')}">O portal</div><div class="${c('axflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('axfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* Cartao com foto em cima. O `span` da foto tem display:block, senao o
 * aspect-ratio nao aplica. */
function axDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('axdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('axfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span class="${c('axkick')}">${H.cat(a)}</span>
<h${n} class="${c('axti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('axdd')}">${H.esc(H.clip(a.dek, 180))}</span>` : ''}
<span class="${c('axdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

/* Linha numerada. O numeral sai do `counter` do CSS, entao acompanha a ordem
 * real e nunca sai errado ao reordenar. */
function axLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('axrow')} ${c('reveal')}" href="${H.url(a)}">
<span><span class="${c('axkick')}">${H.cat(a)}</span>
<h${n} class="${c('axti')}">${H.esc(a.title)}</h${n}>
<span class="${c('axdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function axHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('axabre')}">
<div><span class="${c('axchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('axmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('axfoto')}">
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
    .map(([cs, v], idx) => {
      const nome = v[0].category ? v[0].category.name : cs;
      const [d, ...resto] = v;
      const lista = resto.slice(0, 6);
      // 🔴 o numero de linhas vai no style: cravado no CSS a grade volta a
      // preencher por linha e a data pula ao ler descendo a coluna
      const linhas = Math.max(1, Math.ceil(lista.length / 2));
      return `<section class="${c('axsec')}" data-par="${idx % 2}">
<div class="${c('axin')}">
<div class="${c('axcab')}">${AX_SIMB}<h2>${H.esc(nome)}</h2>
<a class="${c('axmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${axDestaque(ctx, d, idx === 0)}
${lista.length ? `<div class="${c('axlista')}" style="--l:${linhas}">${lista.map(a => axLinha(ctx, a)).join('')}</div>` : ''}
</div></section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${axHeader(ctx, menu)}
<main class="${c('axwrap')}">
<div class="${c('axin')}">${H.h1(ctx)}
${abertura}</div>
${secoes}
</main>
${axFooter(ctx, menu)}
${H.bodyEnd()}`;
}

function axAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('axass')}">
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
function axLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const chato = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const cSlug = chato(art.slug), cAlt = chato(alt);
  const pref = cAlt.length >= 25 && (cSlug.indexOf(cAlt) === 0 || cAlt.indexOf(cSlug) === 0);
  if (!alt || cAlt === chato(t) || cAlt === cSlug || pref) return '';
  return `<p class="${c('axleg')}">${H.esc(alt)}</p>`;
}

/* A linha fina do artigo so aparece quando NAO esta no corpo. A limpeza da
 * importacao tira a frase do proprio texto quando o `excerpt` da origem vem
 * vazio, o que salva o cartao da home; aqui o mesmo campo seria repeticao. */
function axDekVale(art) {
  const d = String(art.dek || '').trim();
  if (!d) return false;
  const nu = (x) => String(x || '').toLowerCase().replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const chave = nu(d).slice(0, 60);
  return !!chave && nu(art.content).indexOf(chave) < 0;
}

function axArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const rel = (related && related.length) ? `<section class="${c('axrel')}">
<h2 class="${c('axrotb')}">Leia também</h2>
<div class="${c('axgrade')}">${related.slice(0, 4).map(a => axDestaque(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${axHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('axwrap')}"><div class="${c('axin')}">
<article class="${c('axart')}">
<div class="${c('axcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('axchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${axDekVale(art) ? `<p class="${c('axdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('axhero')}"><span data-f>${H.pic(art, true)}</span></span>
${axLegenda(ctx, art)}` : ''}
<div class="${c('axbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${axAssinatura(ctx, art)}
${rel}
</div></main>
${axFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function axList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  // a grade pula o destaque, e nao o repete: `resto`, nunca `itens`
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${axHeader(ctx, menu)}
<main class="${c('axwrap')}">
<section class="${c('axsec')}" data-par="0"><div class="${c('axin')}">
<div class="${c('axcab')}">${AX_SIMB}<h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('axdescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? axDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('axgrade')}" style="margin-top:36px">${resto.map(a => axDestaque(ctx, a, false, 2)).join('')}</div>` : ''}
</div></section>
</main>
${axFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { axCss, axHeader, axFooter, axHome, axArticle, axList };
