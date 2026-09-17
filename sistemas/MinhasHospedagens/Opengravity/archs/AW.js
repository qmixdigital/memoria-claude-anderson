/*
 * Arquitetura AW, arquetipo CAPSULA. Feita para o saudeacessivel.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca do Saude Acessivel e uma **capsula deitada, meio verde e meio azul**,
 * ao lado de SAUDE em verde pesado com "acessivel" em azul, menor, embaixo.
 *
 * O gesto que sai dai e a **capsula**: raio de canto assimetrico, redondo de um
 * lado e quase reto do outro. Ele aparece no rotulo de editoria, na miniatura de
 * cada linha e no botao de busca. Nenhuma das 48 vizinhas da opengravity usa
 * raio assimetrico: elas escolhem entre canto reto e canto redondo, dos dois
 * lados.
 *
 * ## O que a diferencia das 48 vizinhas
 *
 *   - **raio assimetrico** (`border-radius:999px 8px 8px 999px`), que e a
 *     silhueta da capsula da marca
 *   - **linha de cartao horizontal**: miniatura quadrada a esquerda e texto a
 *     direita, uma por linha. A AV usa dois cartoes grandes, a AK lista de duas
 *     colunas, a AQ grade de tres
 *   - **a materia de abertura da secao tem foto a ESQUERDA**, e nao em cima
 *   - **Wittgenstein e Gantari**: nenhuma das duas esta nas 86 familias em uso
 *   - verde-folha escuro com azul-clinico, os dois tirados dos pixels do
 *     logotipo
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **O portal NAO e plano, e o `category_base` da origem estava VAZIO.** Vazio
 * significa `category`, em ingles. O artigo mora em `/<editoria>/<slug>/` e a
 * listagem em `/category/<slug>/`. Montar `/categoria/` a mao poe o menu do
 * topo, o do rodape e o chapeu de cada artigo em 404, e nada disso aparece em
 * captura de tela: o menu continua bonito e so quebra no clique. Por isso todo
 * link de editoria sai de `H.curl(slug)`.
 *
 * ⚠️ **O raio assimetrico precisa da mesma mao nos dois lados.** Miniatura
 * redonda a esquerda com texto colado nela fica ilegivel: o `gap` da linha nunca
 * pode ser menor que o raio.
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
 *   - a classe do bloco "Leia tambem" leva o prefixo DESTE portal
 */

function awCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#F0F6F1';
  const viva = t.vivid || '#0A5AA0';
  const capsula = '999px 8px 8px 999px';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--tinta:${t.tinta || t.primary};--sob:${t.onPrimary || '#fff'};
  --footer-bg:${t.footerBg || '#12351C'};--footer-tx:${t.footerTx || '#D8E6DA'};
  --fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('awwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('awwrap')} *{box-sizing:border-box}
${s('awin')}{max-width:${fp.container || '1170px'};margin:0 auto;padding:0 24px;width:100%}
${s('awwrap')} h1,${s('awwrap')} h2,${s('awwrap')} h3,${s('awwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.006em;line-height:1.16;margin:0}
${s('awwrap')} a{color:inherit;text-decoration:none}
${s('awwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho: papel claro, filete verde fino, marca a esquerda ---------- */
${s('awtop')}{background:var(--paper);border-bottom:3px solid var(--pri)}
${s('awbar')}{display:flex;align-items:center;gap:18px;padding-block:16px 18px;flex-wrap:wrap}
${s('awmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:800;font-size:clamp(22px,2.9vw,31px);letter-spacing:-.02em;color:var(--pri);flex:none}
${s('awmarca')} svg{display:block;height:.9em;width:auto;flex:none;align-self:center}
/* o logotipo e imagem, e imagem sem medida derruba o CLS: a altura manda e a
   largura sai da proporcao do arquivo */
${s('awmarca')} img{display:block;height:46px;width:auto;flex:none}
@media(max-width:560px){${s('awmarca')} img{height:36px}}
${s('awfb')} img{display:block;height:40px;width:auto}
${s('awnav')}{display:flex;gap:17px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('awnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.045em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('awnav')} a:hover{color:var(--pri)}
${s('awbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--pri);color:var(--sob);padding:10px 19px 10px 15px;
  border-radius:${capsula};flex:none;margin-left:8px}
${s('awbusca')}:hover{background:var(--viva)}
${s('awham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${capsula}}
${s('awham')} i,${s('awham')} i::before,${s('awham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--pri);content:""}
${s('awham')} i{top:21px}
${s('awham')} i::before{top:-6px;left:0}
${s('awham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('awmarca')}{font-size:20px;gap:8px}
  ${s('awbar')}{gap:11px}
  ${s('awbusca')}{font-size:10.5px;padding:9px 15px 9px 12px;gap:6px}
}
@media(max-width:1100px){
  ${s('awham')}{display:block;order:2}
  ${s('awbusca')}{order:3;margin-left:0}
  ${s('awnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('awnav')}[data-aberto="1"]{display:flex}
  ${s('awnav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink);
    font-size:13.5px}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('awabre')}{display:grid;grid-template-columns:1.04fr 1fr;gap:44px;align-items:center;
  padding-block:38px 34px;border-bottom:1px solid var(--line)}
${s('awabre')} h2{font-size:clamp(30px,4.3vw,50px);line-height:1.06;margin:12px 0 0;
  letter-spacing:-.024em}
${s('awabre')} h2 a:hover{color:var(--pri)}
${s('awabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('awmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('awmm')} b{color:var(--ink);font-weight:700}
${s('awchap')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:.13em;text-transform:uppercase;color:var(--sob);background:var(--pri);
  padding:6px 15px 6px 12px;border-radius:${capsula}}
${s('awchap')} a{color:var(--sob)}
@media(max-width:820px){${s('awabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 24px}}

/* ---------- secao: rotulo em capsula e linhas horizontais ---------- */
${s('awsec')}{padding-block:42px;background:var(--paper)}
${s('awsec')}[data-par="1"]{background:var(--wash)}
${s('awcab')}{display:flex;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap}
${s('awcab')} h1,${s('awcab')} h2{font-family:var(--fd);font-weight:800;
  font-size:clamp(17px,2vw,23px);letter-spacing:.005em;text-transform:uppercase;
  color:var(--sob);margin:0;line-height:1.1;flex:none;background:var(--pri);
  padding:9px 22px 9px 16px;border-radius:${capsula}}
${s('awmais')}{margin-left:auto;font-family:var(--fb);font-size:11.5px;font-weight:700;
  letter-spacing:.09em;text-transform:uppercase;color:var(--viva);flex:none;
  border-bottom:2px solid var(--viva);padding-bottom:3px}
${s('awmais')}:hover{color:var(--pri);border-bottom-color:var(--pri)}
${s('awdescr')}{margin:0 0 26px;font-size:15.5px;line-height:1.64;color:var(--dek);
  max-width:72ch;text-align:left}

/* materia de abertura da secao: foto a ESQUERDA, texto a direita */
${s('awdest')}{display:grid;grid-template-columns:1.02fr 1fr;gap:30px;align-items:center}
${s('awdest')} ${s('awti')}{font-size:clamp(21px,2.6vw,31px);line-height:1.13;
  letter-spacing:-.015em;margin-top:11px}
${s('awkick')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.13em'};text-transform:uppercase;color:var(--viva)}
${s('awti')}{display:block;font-family:var(--fd);font-weight:700;font-size:19px;line-height:1.2;
  color:var(--ink);margin:0;transition:color .2s ease;letter-spacing:-.008em}
${s('awdd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:56ch;text-align:left}
${s('awdt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
/* ⚠️ a capsula recorta meia foto grande num semicirculo: em foto ela vira um
   raio discreto, e a capsula fica no rotulo, no botao e na miniatura quadrada */
${s('awfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:14px}
${s('awfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '4/3'};overflow:hidden}
${s('awfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('awdest')}:hover ${s('awti')}{color:var(--pri)}
${s('awdest')}:hover ${s('awfoto')} [data-f] img{transform:scale(1.04)}
@media(max-width:780px){${s('awdest')}{grid-template-columns:1fr;gap:16px}}

/* a lista: UMA linha por item, miniatura quadrada a esquerda em capsula.
   O gap nunca pode ser menor que o raio, senao o texto cola no arredondado */
${s('awlista')}{display:flex;flex-direction:column;gap:0;margin-top:32px;
  border-top:1px solid var(--line)}
${s('awrow')}{display:grid;grid-template-columns:118px minmax(0,1fr);gap:22px;
  align-items:center;padding-block:18px;border-bottom:1px solid var(--line)}
${s('awmini')}{display:block;overflow:hidden;background:var(--ph);border-radius:${capsula}}
${s('awmini')} [data-f]{display:block;aspect-ratio:1/1;overflow:hidden}
${s('awmini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('awrow')}:hover ${s('awmini')} [data-f] img{transform:scale(1.06)}
${s('awrow')}:hover ${s('awti')}{color:var(--pri)}
${s('awrow')} ${s('awti')}{font-size:18.5px;line-height:1.22;margin-top:6px}
${s('awrow')} ${s('awdd')}{display:none}
@media(max-width:620px){
  ${s('awrow')}{grid-template-columns:84px minmax(0,1fr);gap:16px;padding-block:15px}
  ${s('awrow')} ${s('awti')}{font-size:16.5px}
}

/* a listagem de editoria e os relacionados usam grade de tres cartoes */
${s('awgrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 28px}
${s('awgrade')} ${s('awdest')}{display:block}
${s('awgrade')} ${s('awti')}{font-size:19px;line-height:1.22;margin-top:11px}
${s('awgrade')} ${s('awdd')}{display:none}
${s('awgrade')} ${s('awfoto')} [data-f]{aspect-ratio:${fp.cardAr || '16/10'}}
@media(max-width:900px){${s('awgrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:600px){${s('awgrade')}{grid-template-columns:1fr;gap:28px}}

/* ---------- artigo ---------- */
${s('awart')}{padding-block:30px 12px}
${s('awcol')}{max-width:70ch}
${s('awart')} h1{font-size:clamp(28px,4vw,44px);line-height:1.08;letter-spacing:-.026em;
  margin:14px 0 0}
${s('awdek')}{font-size:19px;line-height:1.55;color:var(--dek);margin:16px 0 0;max-width:62ch}
${s('awhero')}{display:block;overflow:hidden;background:var(--ph);border-radius:14px;
  margin-top:26px}
${s('awhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('awhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('awleg')}{margin:10px 0 0;font-size:12.5px;line-height:1.5;color:var(--muted);
  max-width:70ch;text-align:left}
${s('awbody')}{max-width:70ch;margin-top:26px;font-size:calc(${fp.baseFs || '17px'} + 1px);
  line-height:1.78}
${s('awbody')} p{margin:0 0 21px}
${s('awbody')} a{color:var(--viva);text-decoration:underline;text-underline-offset:3px}
${s('awbody')} a:hover{color:var(--pri)}
${s('awbody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.014em;
  margin:36px 0 12px;padding-left:14px;border-left:5px solid var(--pri)}
${s('awbody')} h3{font-family:var(--fd);font-weight:700;font-size:20px;margin:28px 0 10px}
${s('awbody')} ul,${s('awbody')} ol{margin:0 0 21px;padding-left:22px}
${s('awbody')} li{margin:0 0 9px}
${s('awbody')} img{max-width:100%;height:auto;border-radius:12px;margin:8px 0}
${s('awbody')} figure{margin:22px 0}
${s('awbody')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px}
${s('awbody')} blockquote{margin:28px 0;padding:4px 0 4px 22px;border-left:5px solid var(--viva);
  font-family:var(--fd);font-size:21px;line-height:1.42;color:var(--ink)}
${s('awbody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}
${s('awbody')} th,${s('awbody')} td{border:0;border-bottom:1px solid var(--line);
  padding:11px 12px 11px 0;text-align:left;vertical-align:top}
${s('awbody')} th{font-family:var(--fb);font-weight:700;background:transparent}
${s('awbody')} caption{text-align:left;font-size:13px;color:var(--muted);padding-bottom:8px}

/* a tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. O thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('awbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('awbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('awbody')} table caption{display:none}
  ${s('awbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;
    clip:rect(0 0 0 0)}
  ${s('awbody')} table tbody,${s('awbody')} table tr,
  ${s('awbody')} table th,${s('awbody')} table td{display:block;width:auto}
  ${s('awbody')} table tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:14px;padding:2px 18px 16px;margin-bottom:13px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('awbody')} table tbody th,${s('awbody')} table tbody td{border:0;background:transparent;
    padding:0}
  ${s('awbody')} table tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;
    font-weight:700;text-align:left}
  ${s('awbody')} table tbody td{padding:13px 0 0;text-align:left;line-height:1.55}
  ${s('awbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);
    margin-bottom:2px}
}

${s('awass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:start;
  max-width:70ch;margin-top:38px;padding:20px;background:var(--wash);border-radius:16px}
${s('awass')} img{border-radius:${capsula}}
${s('awass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--viva)}
${s('awass')} .nm{display:block;font-family:var(--fd);font-weight:700;font-size:19px;margin-top:4px}
${s('awass')} p{margin:8px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek)}
${s('awass')} .go{display:inline-block;margin-top:10px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri);
  border-bottom:2px solid var(--pri);padding-bottom:2px}
@media(max-width:560px){${s('awass')}{grid-template-columns:1fr;gap:12px}}

/* o bloco de relacionados tem a MESMA largura da coluna do artigo */
${s('awrel')}{max-width:70ch;margin-top:44px;padding-top:24px;border-top:3px solid var(--pri)}
${s('awrotb')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.13em;text-transform:uppercase;color:var(--sob);background:var(--pri);
  padding:6px 16px 6px 12px;border-radius:${capsula};margin-bottom:20px}
${s('awrel')} ${s('awgrade')}{grid-template-columns:1fr 1fr;gap:26px 22px}
@media(max-width:600px){${s('awrel')} ${s('awgrade')}{grid-template-columns:1fr}}

/* ---------- rodape ---------- */
${s('awfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:56px;
  padding-block:38px 22px}
${s('awcols')}{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:34px}
${s('awfoot')} p{font-size:14.5px;color:var(--footer-tx)}
${s('awfb')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:800;font-size:23px;letter-spacing:-.02em;color:#fff}
${s('awfh')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:#fff;margin-bottom:12px}
${s('awflist')} a{display:block;font-size:14.5px;padding:4px 0;color:var(--footer-tx)}
${s('awflist')} a:hover{color:#fff}
${s('awfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:28px;padding-top:15px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12.5px;opacity:.85}
@media(max-width:820px){${s('awcols')}{grid-template-columns:1fr;gap:26px}}

${s('reveal')}{opacity:1}
@media(prefers-reduced-motion:reduce){
  ${s('awwrap')} *{transition:none !important;animation:none !important}
}`;
}

/* A capsula da marca, desenhada. So entra quando o portal nao tem arquivo de
 * logotipo: com arquivo, quem manda e a imagem da origem. */
const AW_SIMB = `<svg viewBox="0 0 40 24" width="40" height="24" aria-hidden="true">
<rect x="1" y="1" width="38" height="22" rx="11" fill="var(--marca-1,#0A5AA0)"/>
<path d="M20 1h8a11 11 0 0 1 0 22h-8z" fill="var(--marca-2,#2F7D3E)"/>
<rect x="1" y="1" width="38" height="22" rx="11" fill="none" stroke="rgba(0,0,0,.14)"/>
</svg>`;

const AW_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function awHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'awnav-' + (site.slug || 'p');
  // 🔴 este portal serve a listagem em /category/<slug>/, em INGLES, porque o
  // `category_base` da origem estava vazio. Montar o caminho a mao poe o menu
  // inteiro em 404 e o print continua bonito
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('awtop')}">
<div class="${c('awin')} ${c('awbar')}">
<a class="${c('awmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--viva);--marca-2:var(--pri)">${site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${AW_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
<nav class="${c('awnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('awham')}" type="button" data-awham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('awbusca')}" href="/busca/">${AW_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-awham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function awFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('awfoot')}"><div class="${c('awin')}">
<div class="${c('awcols')}">
  <div><a class="${c('awfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:var(--viva);--marca-2:#7FBF8C">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${AW_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('awfh')}">Editorias</div><div class="${c('awflist')}">${cats}</div></div>
  <div><div class="${c('awfh')}">O portal</div><div class="${c('awflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('awfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A materia de abertura da secao: foto a ESQUERDA e texto a direita. O `span`
 * da foto tem display:block, senao o aspect-ratio nao aplica. Dentro da grade
 * de tres o CSS troca para empilhado, e o mesmo cartao serve nos dois lugares. */
function awDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('awdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('awfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span><span class="${c('awkick')}">${H.cat(a)}</span>
<h${n} class="${c('awti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('awdd')}">${H.esc(H.clip(a.dek, 180))}</span>` : ''}
<span class="${c('awdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

/* Linha horizontal: miniatura quadrada em capsula a esquerda, texto a direita. */
function awLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('awrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('awmini')}"><span data-f>${H.pic(a, false)}</span></span>
<span><span class="${c('awkick')}">${H.cat(a)}</span>
<h${n} class="${c('awti')}">${H.esc(a.title)}</h${n}>
<span class="${c('awdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function awHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('awabre')}">
<div><span class="${c('awchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('awmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('awfoto')}">
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
      // a faixa alterna o fundo: e o que muda a silhueta da pagina a distancia
      return `<section class="${c('awsec')}" data-par="${idx % 2}">
<div class="${c('awin')}">
<div class="${c('awcab')}"><h2>${H.esc(nome)}</h2>
<a class="${c('awmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${awDestaque(ctx, d, idx === 0)}
${resto.length ? `<div class="${c('awlista')}">${resto.slice(0, 4).map(a => awLinha(ctx, a)).join('')}</div>` : ''}
</div></section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${awHeader(ctx, menu)}
<main class="${c('awwrap')}">
<div class="${c('awin')}">${H.h1(ctx)}
${abertura}</div>
${secoes}
</main>
${awFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function awAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('awass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="84" height="84" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

/* A legenda so aparece quando o `alt` da imagem descreve a FOTO. Em metade do
 * acervo importado ele e copia do titulo, ou do slug, e ai a legenda repetiria
 * o `h1` logo abaixo dele. */
function awLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const chato = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const cSlug = chato(art.slug), cAlt = chato(alt);
  const pref = cAlt.length >= 25 && (cSlug.indexOf(cAlt) === 0 || cAlt.indexOf(cSlug) === 0);
  const igual = cAlt === chato(t) || cAlt === cSlug || pref;
  if (!alt || igual) return '';
  return `<p class="${c('awleg')}">${H.esc(alt)}</p>`;
}

/* A linha fina do artigo so aparece quando NAO esta no corpo. A limpeza da
 * importacao tira a frase do proprio texto quando o `excerpt` da origem vem
 * vazio, o que salva o cartao da home; aqui o mesmo campo seria repeticao. */
function awDekVale(art) {
  const d = String(art.dek || '').trim();
  if (!d) return false;
  const nu = (x) => String(x || '').toLowerCase().replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const chave = nu(d).slice(0, 60);
  return !!chave && nu(art.content).indexOf(chave) < 0;
}

function awArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema
  const rel = (related && related.length) ? `<section class="${c('awrel')}">
<h2 class="${c('awrotb')}">Leia também</h2>
<div class="${c('awgrade')}">${related.slice(0, 4).map(a => awDestaque(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${awHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('awwrap')}"><div class="${c('awin')}">
<article class="${c('awart')}">
<div class="${c('awcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('awchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${awDekVale(art) ? `<p class="${c('awdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('awhero')}"><span data-f>${H.pic(art, true)}</span></span>
${awLegenda(ctx, art)}` : ''}
<div class="${c('awbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${awAssinatura(ctx, art)}
${rel}
</div></main>
${awFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function awList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  // a grade pula o destaque, e nao o repete: `resto`, nunca `itens`
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${awHeader(ctx, menu)}
<main class="${c('awwrap')}">
<section class="${c('awsec')}" data-par="0"><div class="${c('awin')}">
<div class="${c('awcab')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('awdescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? awDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('awgrade')}" style="margin-top:34px">${resto.map(a => awDestaque(ctx, a, false, 2)).join('')}</div>` : ''}
</div></section>
</main>
${awFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { awCss, awHeader, awFooter, awHome, awArticle, awList };
