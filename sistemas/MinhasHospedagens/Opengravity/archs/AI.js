/*
 * Arquitetura AI, arquetipo BALCAO. Feita para o oiempreendedores.com.br.
 *
 * ## De onde vem o desenho
 *
 * O nome do portal e sobre quem empreende, e o acervo preservado e de balcao:
 * entretenimento, marketing, negocios, saude e dica pratica. O desenho pega o
 * gesto do **balcao de loja**: cada secao abre com o nome da editoria sob um
 * **filete grosso**, a materia principal vem com **texto a esquerda e imagem a
 * direita**, e as demais viram **linhas numeradas**, com o ordinal grande em
 * serifa a esquerda e a miniatura quadrada a direita.
 *
 * ## O que a diferencia das 34 vizinhas da opengravity
 *
 *   - **ordinal grande como ancora visual da linha** (01, 02, 03). Nenhuma
 *     vizinha numera item: a `AF` conta verbetes no cabecalho da secao, o que e
 *     outra coisa. E o ordinal que muda a leitura, porque vira indice
 *   - **miniatura a DIREITA do texto**, e nao a esquerda como em todas as outras
 *   - **filete grosso sob o nome da editoria**, em vez de pastilha cheia (`AH`),
 *     coluna de margem (`AE`), titulo corrido com regua (`AF`) ou etiqueta
 *     enviesada (`AG`)
 *   - **Fraunces e Archivo**: nenhuma das duas aparece nas 84 familias em uso
 *   - **bordo com dourado**: nenhuma vizinha usa vinho. Os acentos da rede sao
 *     ambar, oliva, coral e rosa
 *   - **quadrado de canto vivo** na miniatura, contra o circulo da `AH` e o
 *     retangulo deitado das demais
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **Este portal tem `flatUrl: false` E `categoryBase: "categoria"`.** O artigo
 * mora em `/<editoria>/<slug>/` e o arquivo de editoria em `/categoria/<slug>/`.
 * Os dois nao coincidem: montar o link de editoria como `/<slug>/` poe **o menu
 * do topo inteiro, o do rodape e o chapeu de cada artigo** em 404, e isso nao
 * aparece em print nenhum, porque o menu continua bonito. Editoria sai de
 * `H.curl(slug)`, artigo de `H.url(a)`, sempre.
 *
 * ⚠️ E como o artigo mora dentro da pasta da editoria, `/<editoria>/` vira
 * **diretorio sem indice** e o nginx responde 403 nele: o vhost precisa do 301
 * de cada editoria e do `error_page 403 =404`.
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
 *   - o ordinal e decorativo: vai com aria-hidden, para o leitor de tela nao
 *     ouvir "zero um" antes de cada titulo
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG
 */

function aiCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#F3EBE2';
  const viva = t.vivid || '#C9A227';
  const canto = fp.radius === 'sharp' ? '0' : '3px';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('aiwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.68;-webkit-font-smoothing:antialiased}
${s('aiwrap')} *{box-sizing:border-box}
${s('aiin')}{max-width:${fp.container || '1160px'};margin:0 auto;padding:0 24px;width:100%}
${s('aiwrap')} h1,${s('aiwrap')} h2,${s('aiwrap')} h3,${s('aiwrap')} h4{font-family:var(--fd);
  font-weight:600;letter-spacing:-.008em;line-height:1.16;margin:0}
${s('aiwrap')} a{color:inherit;text-decoration:none}
${s('aiwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('aitop')}{background:var(--paper);border-bottom:2px solid var(--ink)}
${s('aibar')}{display:flex;align-items:center;gap:18px;padding-block:19px 17px;flex-wrap:wrap}
${s('aimarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:clamp(23px,3vw,32px);letter-spacing:-.015em;color:var(--ink);flex:none}
${s('aimarca')} svg{display:block;height:.82em;width:auto;flex:none;align-self:center}
${s('ainav')}{display:flex;gap:14px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('ainav')} a{font-family:var(--fb);font-size:11.5px;font-weight:600;letter-spacing:.045em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('ainav')} a:hover{color:var(--pri)}
${s('aibusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--ink);color:#fff;padding:10px 16px;border-radius:${canto};flex:none;margin-left:8px}
${s('aibusca')}:hover{background:var(--pri)}
${s('aiham')}{display:none;width:46px;height:46px;border:2px solid var(--ink);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('aiham')} i,${s('aiham')} i::before,${s('aiham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--ink);content:""}
${s('aiham')} i{top:21px}
${s('aiham')} i::before{top:-6px;left:0}
${s('aiham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('aimarca')}{font-size:21px;gap:8px}
  ${s('aibar')}{gap:11px}
  ${s('aibusca')}{font-size:10px;padding:9px 12px;gap:6px}
}
@media(max-width:1100px){
  ${s('aiham')}{display:block;order:2}
  ${s('aibusca')}{order:3;margin-left:0}
  ${s('ainav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('ainav')}[data-aberto="1"]{display:flex}
  ${s('ainav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink)}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('aiabre')}{display:grid;grid-template-columns:1.05fr 1fr;gap:44px;align-items:center;
  padding-block:40px 34px;border-bottom:1px solid var(--line)}
${s('aiabre')} h2{font-size:clamp(31px,4.4vw,52px);line-height:1.04;margin:12px 0 0;
  letter-spacing:-.022em}
${s('aiabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('aimm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('aimm')} b{color:var(--ink);font-weight:700}
${s('aifoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('aifoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '4/3'};overflow:hidden}
${s('aifoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
@media(max-width:820px){${s('aiabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 22px}}

/* ---------- a secao: nome da editoria sob filete grosso ---------- */
${s('aisec')}{padding-block:34px}
${s('aisec')}+${s('aisec')}{border-top:1px solid var(--line)}
${s('aicab')}{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;
  margin-bottom:22px;flex-wrap:wrap;border-bottom:4px solid var(--ink);padding-bottom:9px}
${s('aicab')} h1,${s('aicab')} h2{font-family:var(--fd);font-size:clamp(22px,2.7vw,29px);
  font-weight:700;letter-spacing:-.015em;color:var(--ink)}
${s('aimais')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--pri);flex:none;padding-bottom:3px}
${s('aimais')}:hover{text-decoration:underline}
${s('aidescr')}{margin:0 0 20px;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:70ch;text-align:left}

/* materia principal da secao: texto a esquerda, imagem a direita */
${s('aidest')}{display:grid;grid-template-columns:1fr .82fr;gap:30px;align-items:center;
  padding-bottom:22px}
${s('aidest')} ${s('aiti')}{font-size:clamp(23px,2.6vw,30px);line-height:1.14;margin-top:9px}
${s('aikick')}{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.11em'};text-transform:uppercase;color:var(--pri)}
${s('aiti')}{display:block;font-family:var(--fd);font-weight:600;font-size:19.5px;line-height:1.22;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('aidd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.6;color:var(--dek);
  max-width:56ch;text-align:left}
${s('aidt')}{display:block;margin-top:10px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('aidest')}:hover ${s('aiti')}{color:var(--pri)}
${s('aidest')}:hover ${s('aifoto')} [data-f] img{transform:scale(1.03)}
@media(max-width:820px){${s('aidest')}{grid-template-columns:1fr;gap:18px}}

/* linha numerada: ordinal grande a esquerda, miniatura quadrada a direita.
   E a assinatura desta arquitetura. */
${s('ailista')}{display:block}
${s('airow')}{display:grid;grid-template-columns:58px minmax(0,1fr) 108px;gap:18px;
  align-items:center;padding-block:15px;border-top:1px solid var(--line)}
${s('ainum')}{display:block;font-family:var(--fd);font-size:30px;font-weight:600;
  line-height:1;color:var(--viva);letter-spacing:-.03em;font-variant-numeric:tabular-nums}
${s('aiquad')}{display:block;width:108px;overflow:hidden;background:var(--ph);
  border-radius:${canto}}
${s('aiquad')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '4/3'};overflow:hidden}
${s('aiquad')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('airow')}:hover ${s('aiquad')} [data-f] img{transform:scale(1.07)}
${s('airow')}:hover ${s('aiti')}{color:var(--pri)}
@media(max-width:680px){
  ${s('airow')}{grid-template-columns:38px minmax(0,1fr) 78px;gap:13px}
  ${s('ainum')}{font-size:21px}
  ${s('aiquad')}{width:78px}
  ${s('aidd')}{display:none}
}

/* ---------- artigo ---------- */
${s('aiart')}{padding-block:30px 8px}
${s('aicol')}{max-width:${fp.medida || '710px'}}
${s('aichap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.11em'};text-transform:uppercase;color:var(--pri)}
${s('aiart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.06;margin:13px 0 0;
  letter-spacing:-.022em}
${s('aidek')}{font-size:19px;line-height:1.54;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('aihero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'};border-radius:${canto}}
${s('aihero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '4/3'};overflow:hidden}
${s('aihero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('aileg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('aibody')}{max-width:${fp.medida || '710px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('aibody')} p{margin:0 0 1.15em;text-align:left}
${s('aibody')} h2{font-family:var(--fd);font-size:27px;font-weight:700;margin:1.75em 0 .5em;
  letter-spacing:-.015em}
${s('aibody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--pri)}
${s('aibody')} ul,${s('aibody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('aibody')} li{margin:0 0 .45em}
${s('aibody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('aibody')} a:hover{color:var(--viva)}
${s('aibody')} img{margin:1.5em 0;background:var(--ph);border-radius:${canto}}
${s('aibody')} blockquote{margin:1.6em 0;padding:14px 0 14px 22px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.38;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('aibody')} .oie-veja{margin:2.2em 0;padding:20px 24px 18px;background:var(--wash);
  border-radius:${canto};border-left:4px solid var(--pri)}
${s('aibody')} .oie-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.11em'};text-transform:uppercase;color:var(--pri);
  margin:0 0 11px}
${s('aibody')} .oie-veja ul{list-style:none;margin:0;padding:0}
${s('aibody')} .oie-veja li{margin:0;padding:9px 0;border-top:1px solid rgba(0,0,0,.09)}
${s('aibody')} .oie-veja li:first-child{border-top:0;padding-top:0}
${s('aibody')} .oie-veja a{font-family:var(--fd);font-size:17px;line-height:1.3;color:var(--ink);
  text-decoration:none;display:block}
${s('aibody')} .oie-veja a:hover{color:var(--pri)}
${s('aibody')} figure{margin:1.5em 0}
${s('aibody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('aibody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('aibody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('aibody')} th,${s('aibody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('aibody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:3px solid var(--ink)}
@media(max-width:640px){
  ${s('aibody')} table{min-width:0}
  ${s('aibody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('aibody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('aibody')} table,${s('aibody')} tbody,${s('aibody')} tr,${s('aibody')} th,
  ${s('aibody')} td{display:block;width:auto}
  ${s('aibody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:${canto};padding:2px 18px 16px;margin-bottom:13px}
  ${s('aibody')} tbody th,${s('aibody')} tbody td{border:0;background:transparent}
  ${s('aibody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:700;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('aibody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('aibody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('aiass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:center;
  max-width:${fp.medida || '710px'};margin:34px 0 0;padding-top:22px;border-top:3px solid var(--ink)}
${s('aiass')} img{width:84px;height:84px;object-fit:cover;background:var(--ph);border-radius:${canto}}
${s('aiass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--pri)}
${s('aiass')} .nm{display:block;font-family:var(--fd);font-size:22px;font-weight:700;margin-top:3px}
${s('aiass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('aiass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('aiass')} .go:hover{text-decoration:underline}
${s('airel')}{max-width:${fp.medida || '710px'};padding-block:26px 10px}
${s('airotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--muted);
  border-bottom:3px solid var(--ink);padding-bottom:7px;margin-bottom:2px}

/* ---------- rodape ---------- */
${s('aifoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('aicols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('aifb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:26px;color:#fff}
${s('aifb')} svg{display:block;height:.82em;width:auto;flex:none;align-self:center}
${s('aifoot')} p{color:${t.footerTx || '#B9AAA2'};text-align:left}
${s('aifh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:${t.footerTx || '#B9AAA2'};margin-bottom:13px}
${s('aiflist')}{display:flex;flex-direction:column;gap:9px}
${s('aiflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('aiflist')} a:hover{opacity:1;color:var(--viva)}
${s('aifim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.18);
  font-size:12.5px;color:${t.footerTx || '#B9AAA2'}}
@media(max-width:820px){
  ${s('aicols')}{grid-template-columns:1fr;gap:26px}
  ${s('aifoot')}{padding-block:34px 22px}
}

/* ---------- animacao de entrada, respeitando quem pediu menos movimento ---------- */
@media(prefers-reduced-motion:no-preference){
  ${s('reveal')}{opacity:0;transform:translateY(12px);
    transition:opacity .5s ease,transform .5s ease}
  ${s('reveal')}[data-vis="1"]{opacity:1;transform:none}
}`;
}

/* Balcao: dois quadrados deslocados, um cheio e um vazado, que e o gesto de
 * duas peças sobre o balcao. Sem letra dentro: o nome vem como texto ao lado. */
const AI_SIMB = `<svg viewBox="0 0 30 26" role="img" aria-hidden="true" focusable="false"><rect x="1" y="5" width="15" height="15" fill="var(--marca-1,currentColor)"/><rect x="14.5" y="9.5" width="14" height="14" fill="none" stroke="var(--marca-2,currentColor)" stroke-width="3"/></svg>`;

const AI_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function aiHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'ainav-' + (site.slug || 'p');
  // 🔴 flatUrl false COM categoryBase: o artigo mora em /<editoria>/<slug>/ e a
  // editoria em /categoria/<slug>/. H.curl resolve a editoria; montar a mao poe
  // o menu inteiro em 404 sem aparecer em print
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('aitop')}">
<div class="${c('aiin')} ${c('aibar')}">
<a class="${c('aimarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--pri);--marca-2:var(--viva)">${AI_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<nav class="${c('ainav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('aiham')}" type="button" data-aiham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('aibusca')}" href="/busca/">${AI_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-aiham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function aiFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('aifoot')}"><div class="${c('aiin')}">
<div class="${c('aicols')}">
  <div><a class="${c('aifb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva)">${AI_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('aifh')}">Editorias</div><div class="${c('aiflist')}">${cats}</div></div>
  <div><div class="${c('aifh')}">O portal</div><div class="${c('aiflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('aifim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A materia principal da secao: texto a esquerda, imagem a direita. O `span` da
 * foto tem display:block, senao o aspect-ratio nao aplica. */
function aiDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('aidest')} ${c('reveal')}" href="${H.url(a)}">
<span><span class="${c('aikick')}">${H.cat(a)}</span>
<h${n} class="${c('aiti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('aidd')}">${H.esc(H.clip(a.dek, 180))}</span>` : ''}
<span class="${c('aidt')}">${H.esc(H.dateShort(a.date))}</span></span>
<span class="${c('aifoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
</a>`;
}

/* A linha numerada: ordinal a esquerda, miniatura quadrada a direita.
 * O ordinal e decorativo, entao vai com aria-hidden. */
function aiLinha(ctx, a, i, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  const ord = String(i + 1).padStart(2, '0');
  return `<a class="${c('airow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('ainum')}" aria-hidden="true">${ord}</span>
<span><span class="${c('aikick')}">${H.cat(a)}</span>
<h${n} class="${c('aiti')}">${H.esc(a.title)}</h${n}>
<span class="${c('aidt')}">${H.esc(H.dateShort(a.date))}</span></span>
<span class="${c('aiquad')}"><span data-f>${H.pic(a, !!eager)}</span></span>
</a>`;
}

function aiHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('aiabre')}">
<div><span class="${c('aichap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('aimm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('aifoto')}">
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
      // lista numerada, e nao grade: a ultima linha nunca fica com buraco
      return `<section class="${c('aisec')}">
<div class="${c('aicab')}"><h2>${H.esc(nome)}</h2>
<a class="${c('aimais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${aiDestaque(ctx, d, false)}
<div class="${c('ailista')}">${resto.slice(0, 4).map((a, i) => aiLinha(ctx, a, i, false)).join('')}</div>
</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${aiHeader(ctx, menu)}
<main class="${c('aiwrap')}"><div class="${c('aiin')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${aiFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function aiAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('aiass')}">
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
function aiLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('aileg')}">${H.esc(alt)}</p>`;
}

function aiArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('airel')}">
<span class="${c('airotb')}">Leia também</span>
<div class="${c('ailista')}">${related.slice(0, 3).map((a, i) => aiLinha(ctx, a, i, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${aiHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('aiwrap')}"><div class="${c('aiin')}">
<article class="${c('aiart')}">
<div class="${c('aicol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('aichap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('aidek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('aihero')}"><span data-f>${H.pic(art, true)}</span></span>
${aiLegenda(ctx, art)}` : ''}
<div class="${c('aibody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${aiAssinatura(ctx, art)}
${rel}
</div></main>
${aiFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function aiList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${aiHeader(ctx, menu)}
<main class="${c('aiwrap')}"><div class="${c('aiin')}">
<section class="${c('aisec')}">
<div class="${c('aicab')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('aidescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? aiDestaque(ctx, primeiro, true, 2) : ''}
<div class="${c('ailista')}">${resto.map((a, i) => aiLinha(ctx, a, i, false, 2)).join('')}</div>
</section>
</div></main>
${aiFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { aiCss, aiHeader, aiFooter, aiHome, aiArticle, aiList };
