/*
 * Arquitetura BA, arquetipo CAIXA. Feita para o matogrossosaude.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca do Mato Grosso Saude e **MATO GROSSO em grotesco preto muito pesado**
 * e, embaixo, **SAUDE em letra vazada de contorno azul**, cada letra desenhada
 * como uma caixa com fio de 2px. Nao ha simbolo nenhum: a palavra e a marca.
 *
 * O gesto que sai dai e a **caixa de fio**: todo cartao mora dentro de um
 * retangulo de contorno, com uma marca quadrada azul no canto de cima. Ao passar
 * o mouse a caixa se preenche de azul e o texto inverte, que e a mesma troca que
 * a marca faz entre a linha preta cheia e a linha azul vazada.
 *
 * ## O que a diferencia das 52 vizinhas da opengravity
 *
 *   - **contorno em todo cartao, sem sombra e sem preenchimento**, e inversao no
 *     hover. As vizinhas usam filete de topo, fundo lavado ou sombra
 *   - **quadrado de canto** no alto de cada caixa, que e a citacao direta da
 *     letra vazada do logotipo
 *   - **preto puro com azul de engenharia**, tirados dos pixels do arquivo. As
 *     paletas escuras vizinhas sao marinho ou chumbo, nunca preto
 *   - **Anybody e Overpass**: nenhuma das duas esta nas 86 familias em uso
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **Este portal responde no `www`, e nao no apex.** O `siteurl` da origem e
 * `https://www.matogrossosaude.com.br`, e cada backlink e cada URL indexada
 * aponta para essa forma. Trocar para o apex invalida tudo: o `baseUrl` do
 * `sites.json` tem que trazer o `www`, e quem redireciona e o apex, ao contrario
 * de todos os outros portais da rede.
 *
 * 🔴 **O acervo deste portal e pequeno e foi RECUPERADO de backup.** As paginas
 * que ranqueavam tinham sido apagadas na origem e respondiam 404; voltaram do
 * dump de 23/04/2026. A home nunca tera muitas secoes, entao a arquitetura
 * precisa ficar boa com uma so, e nao contar com faixa atras de faixa.
 *
 * ⚠️ **Inversao no hover exige contraste nos DOIS estados.** O azul de fundo com
 * texto branco e o branco com texto preto passam; azul com preto, que seria o
 * meio-termo preguicoso, nao passa.
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

function baCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#F1F5F9';
  const viva = t.vivid || '#00549C';
  const canto = fp.radius === 'sharp' ? '0' : '2px';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--tinta:${t.tinta || t.primary};--sob:${t.onPrimary || '#fff'};
  --footer-bg:${t.footerBg || '#0B0B0B'};--footer-tx:${t.footerTx || '#C6CDD4'};
  --fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('bawrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.68;-webkit-font-smoothing:antialiased}
${s('bawrap')} *{box-sizing:border-box}
${s('bain')}{max-width:${fp.container || '1130px'};margin:0 auto;padding:0 24px;width:100%}
${s('bawrap')} h1,${s('bawrap')} h2,${s('bawrap')} h3,${s('bawrap')} h4{font-family:var(--fd);
  font-weight:800;letter-spacing:-.026em;line-height:1.1;margin:0}
${s('bawrap')} a{color:inherit;text-decoration:none}
${s('bawrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('batop')}{background:var(--paper);border-bottom:2px solid var(--ink)}
${s('babar')}{display:flex;align-items:center;gap:18px;padding-block:16px 18px;flex-wrap:wrap}
${s('bamarca')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:900;font-size:clamp(20px,2.7vw,29px);letter-spacing:-.042em;text-transform:uppercase;
  color:var(--ink);flex:none}
${s('bamarca')} svg{display:block;height:1em;width:auto;flex:none;align-self:center}
/* imagem sem medida derruba o CLS: a altura manda, a largura sai da proporcao */
${s('bamarca')} img{display:block;height:44px;width:auto;flex:none}
@media(max-width:560px){${s('bamarca')} img{height:34px}}
${s('bafb')} img{display:block;height:40px;width:auto}
${s('banav')}{display:flex;gap:16px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('banav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.05em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('banav')} a:hover{color:var(--viva)}
${s('babusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  border:2px solid var(--ink);color:var(--ink);padding:8px 15px;border-radius:${canto};
  flex:none;margin-left:6px;transition:background .2s ease,color .2s ease}
${s('babusca')}:hover{background:var(--viva);border-color:var(--viva);color:#fff}
${s('baham')}{display:none;width:46px;height:46px;border:2px solid var(--ink);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('baham')} i,${s('baham')} i::before,${s('baham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--ink);content:""}
${s('baham')} i{top:21px}
${s('baham')} i::before{top:-6px;left:0}
${s('baham')} i::after{top:6px;left:0}
@media(max-width:560px){${s('bamarca')}{font-size:18.5px;gap:8px}${s('babar')}{gap:11px}
  ${s('babusca')}{font-size:10.5px;padding:8px 12px;gap:6px}}
@media(max-width:1100px){
  ${s('baham')}{display:block;order:2}
  ${s('babusca')}{order:3;margin-left:0}
  ${s('banav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('banav')}[data-aberto="1"]{display:flex}
  ${s('banav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink);
    font-size:13.5px}
}

/* ---------- abertura: texto a esquerda, imagem a direita ---------- */
${s('baabre')}{display:grid;grid-template-columns:1.06fr 1fr;gap:42px;align-items:center;
  padding-block:38px 34px;border-bottom:2px solid var(--ink)}
${s('baabre')} h2{font-size:clamp(30px,4.4vw,52px);line-height:1.02;margin:14px 0 0;
  letter-spacing:-.044em;text-transform:uppercase}
${s('baabre')} h2 a:hover{color:var(--viva)}
${s('baabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('bamm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:18px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('bamm')} b{color:var(--ink);font-weight:700}
${s('bachap')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;color:var(--viva);border:2px solid var(--viva);
  padding:5px 12px;border-radius:${canto}}
${s('bachap')} a{color:var(--viva)}
@media(max-width:820px){${s('baabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 24px}}

/* ---------- secao ---------- */
${s('basec')}{padding-block:40px}
${s('bacab')}{display:flex;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap}
${s('bacab')} h1,${s('bacab')} h2{font-family:var(--fd);font-weight:900;
  font-size:clamp(19px,2.2vw,26px);letter-spacing:-.034em;text-transform:uppercase;
  color:var(--ink);margin:0;line-height:1.05;flex:none;border:2px solid var(--ink);
  padding:8px 16px;border-radius:${canto}}
${s('bafio')}{flex:1 1 60px;height:2px;background:var(--ink);min-width:30px}
${s('bamais')}{font-family:var(--fb);font-size:11.5px;font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--viva);flex:none;border-bottom:2px solid var(--viva);
  padding-bottom:3px}
${s('bamais')}:hover{color:var(--ink);border-bottom-color:var(--ink)}
${s('badescr')}{margin:0 0 26px;font-size:15.5px;line-height:1.64;color:var(--dek);
  max-width:72ch;text-align:left}

/* a CAIXA: contorno, quadrado azul no canto, e inversao no hover. O contraste
   passa nos dois estados: branco sobre azul e preto sobre branco */
${s('bacx')}{display:block;position:relative;border:2px solid var(--ink);border-radius:${canto};
  padding:16px 18px 18px;background:var(--paper);transition:background .22s ease,
  border-color .22s ease}
${s('bacx')}::before{content:"";position:absolute;top:-2px;left:22px;width:16px;height:7px;
  background:var(--viva)}
${s('bacx')}:hover{background:var(--viva);border-color:var(--viva)}
${s('bacx')}:hover ${s('bati')},${s('bacx')}:hover ${s('badd')},
${s('bacx')}:hover ${s('badt')},${s('bacx')}:hover ${s('bakick')}{color:#fff}
${s('bacx')}:hover::before{background:#fff}

${s('badest')}{display:grid;grid-template-columns:1fr 1.04fr;gap:26px;align-items:center}
${s('badest')} ${s('bati')}{font-size:clamp(21px,2.6vw,31px);line-height:1.06;margin-top:11px;
  letter-spacing:-.04em;text-transform:uppercase}
${s('bakick')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.14em'};text-transform:uppercase;color:var(--viva);
  transition:color .22s ease}
${s('bati')}{display:block;font-family:var(--fd);font-weight:800;font-size:19px;line-height:1.14;
  color:var(--ink);margin:0;transition:color .22s ease;letter-spacing:-.03em}
${s('badd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.6;color:var(--dek);
  max-width:56ch;text-align:left;transition:color .22s ease}
${s('badt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  color:var(--muted);transition:color .22s ease}
${s('bafoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('bafoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('bafoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('badest')}:hover ${s('bafoto')} [data-f] img{transform:scale(1.04)}
@media(max-width:780px){${s('badest')}{grid-template-columns:1fr;gap:16px}
  ${s('badest')} ${s('bafoto')}{order:-1}}

/* a grade da secao: tres caixas por linha */
${s('bagrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:26px}
${s('bagrade')} ${s('bamini')}{display:block;overflow:hidden;background:var(--ph);
  margin-bottom:12px;border-radius:${canto}}
${s('bagrade')} ${s('bamini')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '16/9'};
  overflow:hidden}
${s('bagrade')} ${s('bamini')} [data-f] img{width:100%;height:100%;object-fit:cover;
  transition:transform .5s ease}
${s('bagrade')} ${s('bacx')}:hover ${s('bamini')} [data-f] img{transform:scale(1.05)}
${s('bagrade')} ${s('bati')}{font-size:18px;line-height:1.16;margin-top:7px}
${s('bagrade')} ${s('badd')}{display:none}
@media(max-width:900px){${s('bagrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:600px){${s('bagrade')}{grid-template-columns:1fr;gap:20px}}

/* ---------- artigo ---------- */
${s('baart')}{padding-block:30px 12px}
${s('bacol')}{max-width:70ch}
${s('baart')} h1{font-size:clamp(28px,4.1vw,45px);line-height:1.04;letter-spacing:-.044em;
  margin:14px 0 0;text-transform:uppercase}
${s('badek')}{font-size:19px;line-height:1.55;color:var(--dek);margin:16px 0 0;max-width:62ch}
${s('bahero')}{display:block;overflow:hidden;background:var(--ph);border:2px solid var(--ink);
  border-radius:${canto};margin-top:26px}
${s('bahero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('bahero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('baleg')}{margin:10px 0 0;font-size:12.5px;line-height:1.5;color:var(--muted);
  max-width:70ch;text-align:left}
${s('babody')}{max-width:70ch;margin-top:26px;font-size:${fp.corpoFs || '18px'};line-height:1.78}
${s('babody')} p{margin:0 0 21px}
${s('babody')} a{color:var(--viva);text-decoration:underline;text-underline-offset:3px}
${s('babody')} a:hover{color:var(--ink)}
${s('babody')} h2{font-family:var(--fd);font-weight:900;font-size:25px;letter-spacing:-.036em;
  text-transform:uppercase;margin:36px 0 12px;padding-bottom:8px;border-bottom:2px solid var(--ink)}
${s('babody')} h3{font-family:var(--fd);font-weight:800;font-size:20px;margin:28px 0 10px;
  letter-spacing:-.028em}
${s('babody')} ul,${s('babody')} ol{margin:0 0 21px;padding-left:22px}
${s('babody')} li{margin:0 0 9px}
${s('babody')} img{max-width:100%;height:auto;border-radius:${canto};margin:8px 0}
${s('babody')} figure{margin:22px 0}
${s('babody')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px}
${s('babody')} blockquote{margin:28px 0;padding:18px 20px;border:2px solid var(--ink);
  border-radius:${canto};font-family:var(--fd);font-size:20px;line-height:1.36;
  letter-spacing:-.024em}
${s('babody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}
${s('babody')} th,${s('babody')} td{border:0;border-bottom:1px solid var(--line);
  padding:11px 12px 11px 0;text-align:left;vertical-align:top}
${s('babody')} th{font-family:var(--fb);font-weight:700;background:transparent}
${s('babody')} caption{text-align:left;font-size:13px;color:var(--muted);padding-bottom:8px}

/* a tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. O thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('babody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('babody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('babody')} table caption{display:none}
  ${s('babody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;
    clip:rect(0 0 0 0)}
  ${s('babody')} table tbody,${s('babody')} table tr,
  ${s('babody')} table th,${s('babody')} table td{display:block;width:auto}
  ${s('babody')} table tbody tr{background:var(--paper);border:2px solid var(--ink);
    border-radius:${canto};padding:2px 18px 16px;margin-bottom:13px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('babody')} table tbody th,${s('babody')} table tbody td{border:0;background:transparent;
    padding:0}
  ${s('babody')} table tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;
    font-weight:700;text-align:left}
  ${s('babody')} table tbody td{padding:13px 0 0;text-align:left;line-height:1.55}
  ${s('babody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);
    margin-bottom:2px}
}

${s('baass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:start;
  max-width:70ch;margin-top:38px;padding:20px;border:2px solid var(--ink);border-radius:${canto}}
${s('baass')} img{border-radius:${canto}}
${s('baass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--viva)}
${s('baass')} .nm{display:block;font-family:var(--fd);font-weight:800;font-size:19px;
  margin-top:4px;letter-spacing:-.028em}
${s('baass')} p{margin:8px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek)}
${s('baass')} .go{display:inline-block;margin-top:10px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--viva);
  border-bottom:2px solid var(--viva);padding-bottom:2px}
@media(max-width:560px){${s('baass')}{grid-template-columns:1fr;gap:12px}}

/* relacionados com a MESMA largura da coluna do artigo */
${s('barel')}{max-width:70ch;margin-top:44px;padding-top:22px;border-top:2px solid var(--ink)}
${s('barotb')}{display:inline-block;font-family:var(--fd);font-weight:900;font-size:19px;
  letter-spacing:-.034em;text-transform:uppercase;color:var(--ink);border:2px solid var(--ink);
  padding:7px 14px;border-radius:${canto};margin-bottom:20px}
${s('barel')} ${s('bagrade')}{grid-template-columns:1fr 1fr;gap:20px;margin-top:0}
@media(max-width:600px){${s('barel')} ${s('bagrade')}{grid-template-columns:1fr}}

/* ---------- rodape ---------- */
${s('bafoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:56px;
  padding-block:38px 22px}
${s('bacols')}{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:34px}
${s('bafoot')} p{font-size:14.5px;color:var(--footer-tx)}
${s('bafb')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:900;font-size:22px;letter-spacing:-.042em;text-transform:uppercase;color:#fff}
${s('bafh')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:#fff;margin-bottom:12px}
${s('baflist')} a{display:block;font-size:14.5px;padding:4px 0;color:var(--footer-tx)}
${s('baflist')} a:hover{color:#fff}
${s('bafim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:28px;padding-top:15px;border-top:1px solid rgba(255,255,255,.18);
  font-size:12.5px;opacity:.85}
@media(max-width:820px){${s('bacols')}{grid-template-columns:1fr;gap:26px}}

${s('reveal')}{opacity:1}
@media(prefers-reduced-motion:reduce){
  ${s('bawrap')} *{transition:none !important;animation:none !important}
}`;
}

/* A marca nao tem simbolo: a palavra E a marca. Quando falta o arquivo, entra
 * uma caixa vazada, que e a citacao da letra de contorno do logotipo. */
const BA_SIMB = `<svg viewBox="0 0 26 26" width="26" height="26" aria-hidden="true">
<rect x="1.5" y="1.5" width="23" height="23" fill="none" stroke="var(--marca-1,#00549C)"
  stroke-width="3"/>
<rect x="8" y="8" width="10" height="10" fill="var(--marca-2,#111111)"/>
</svg>`;

const BA_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function baHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'banav-' + (site.slug || 'p');
  // a listagem deste portal mora em /categoria/<slug>/, em portugues. Quem monta
  // o caminho e o H.curl, nunca uma string escrita a mao
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('batop')}">
<div class="${c('bain')} ${c('babar')}">
<a class="${c('bamarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--viva);--marca-2:var(--ink)">${site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${BA_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
<nav class="${c('banav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('baham')}" type="button" data-baham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('babusca')}" href="/busca/">${BA_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-baham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function baFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('bafoot')}"><div class="${c('bain')}">
<div class="${c('bacols')}">
  <div><a class="${c('bafb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#4C9BE0;--marca-2:#FFFFFF">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${BA_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('bafh')}">Editorias</div><div class="${c('baflist')}">${cats}</div></div>
  <div><div class="${c('bafh')}">O portal</div><div class="${c('baflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('bafim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* Caixa de abertura da secao: texto a esquerda, foto a direita. */
function baDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('bacx')} ${c('badest')} ${c('reveal')}" href="${H.url(a)}">
<span><span class="${c('bakick')}">${H.cat(a)}</span>
<h${n} class="${c('bati')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('badd')}">${H.esc(H.clip(a.dek, 180))}</span>` : ''}
<span class="${c('badt')}">${H.esc(H.dateShort(a.date))}</span></span>
<span class="${c('bafoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
</a>`;
}

/* Caixa pequena da grade: foto em cima, texto embaixo. */
function baCartao(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('bacx')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('bamini')}"><span data-f>${H.pic(a, false)}</span></span>
<span class="${c('bakick')}">${H.cat(a)}</span>
<h${n} class="${c('bati')}">${H.esc(a.title)}</h${n}>
<span class="${c('badt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

function baHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('baabre')}">
<div><span class="${c('bachap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('bamm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('bafoto')}">
<span data-f>${H.pic(abre, true)}</span></span></a>
</section>` : '';

  // secoes por editoria de verdade, ordenadas por data. O acervo aqui e pequeno,
  // entao uma secao so ja precisa ficar boa
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
      return `<section class="${c('basec')}">
<div class="${c('bacab')}"><h2>${H.esc(nome)}</h2><span class="${c('bafio')}"></span>
<a class="${c('bamais')}" href="${H.curl(cs)}">Ver tudo</a></div>
${baDestaque(ctx, d, idx === 0)}
${resto.length ? `<div class="${c('bagrade')}">${resto.slice(0, 6).map(a => baCartao(ctx, a)).join('')}</div>` : ''}
</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${baHeader(ctx, menu)}
<main class="${c('bawrap')}"><div class="${c('bain')}">${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${baFooter(ctx, menu)}
${H.bodyEnd()}`;
}

function baAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('baass')}">
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
function baLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const chato = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const cSlug = chato(art.slug), cAlt = chato(alt);
  const pref = cAlt.length >= 25 && (cSlug.indexOf(cAlt) === 0 || cAlt.indexOf(cSlug) === 0);
  if (!alt || cAlt === chato(t) || cAlt === cSlug || pref) return '';
  return `<p class="${c('baleg')}">${H.esc(alt)}</p>`;
}

/* A linha fina do artigo so aparece quando NAO esta no corpo. A limpeza da
 * importacao tira a frase do proprio texto quando o `excerpt` da origem vem
 * vazio, o que salva o cartao da home; aqui o mesmo campo seria repeticao. */
function baDekVale(art) {
  const d = String(art.dek || '').trim();
  if (!d) return false;
  const nu = (x) => String(x || '').toLowerCase().replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const chave = nu(d).slice(0, 60);
  return !!chave && nu(art.content).indexOf(chave) < 0;
}

function baArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const rel = (related && related.length) ? `<section class="${c('barel')}">
<h2 class="${c('barotb')}">Leia também</h2>
<div class="${c('bagrade')}">${related.slice(0, 4).map(a => baCartao(ctx, a)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${baHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('bawrap')}"><div class="${c('bain')}">
<article class="${c('baart')}">
<div class="${c('bacol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('bachap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${baDekVale(art) ? `<p class="${c('badek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('bahero')}"><span data-f>${H.pic(art, true)}</span></span>
${baLegenda(ctx, art)}` : ''}
<div class="${c('babody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${baAssinatura(ctx, art)}
${rel}
</div></main>
${baFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function baList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  // a grade pula o destaque, e nao o repete: `resto`, nunca `itens`
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${baHeader(ctx, menu)}
<main class="${c('bawrap')}"><div class="${c('bain')}">
<section class="${c('basec')}">
<div class="${c('bacab')}"><h1>${H.esc(opts.title)}</h1><span class="${c('bafio')}"></span></div>
${opts.desc ? `<p class="${c('badescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? baDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('bagrade')}">${resto.map(a => baCartao(ctx, a, 2)).join('')}</div>` : ''}
</section>
</div></main>
${baFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { baCss, baHeader, baFooter, baHome, baArticle, baList };
