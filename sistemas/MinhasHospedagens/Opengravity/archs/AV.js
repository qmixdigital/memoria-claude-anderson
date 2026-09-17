/*
 * Arquitetura AV, arquetipo SELO. Feita para o saberdefato.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca do Saber de Fato e um **mascote de oculos e gravata-borboleta
 * apontando**, dentro de um circulo laranja, ao lado de SABER DE FATO em
 * grotesco pesado marinho, com o "DE" em laranja.
 *
 * O gesto que sai dai e o **selo**: o nome de cada editoria vem dentro de um
 * bloco laranja **levemente girado**, como carimbo de conferido, que e o que o
 * nome do portal promete.
 *
 * ## O que a diferencia das 47 vizinhas da opengravity
 *
 *   - **bloco girado**. Nenhuma das 47 usa rotacao: a AL gira texto na vertical,
 *     que e outra coisa. Um grau e meio muda a leitura da pagina inteira
 *   - **dois cartoes grandes por linha**, cada um com filete marinho grosso no
 *     topo. A AK usa lista de duas colunas, a AQ grade de tres, a AN mosaico
 *   - **Rokkitt e Cabin**: nenhuma das duas esta nas 55 familias em uso
 *   - **marinho quase preto com laranja-mel**: os outros azuis da maquina sao
 *     bem mais claros
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **`flatUrl: true` COM `categoryBase: "category"`, em INGLES.** Na origem o
 * `category_base` estava **vazio**, e vazio significa `category`. Cravar
 * "categoria" por analogia com os vizinhos poria a editoria inteira em 404.
 * Artigo em `/<slug>/`, na raiz; listagem em `/category/<slug>/`.
 *
 * ⚠️ Como tudo divide a raiz, **slug podado colide com pagina que o motor
 * regenera**: contato, politica-de-privacidade, termos-de-uso e quem-somos ficam
 * fora do 410.
 *
 * ⚠️ **O selo gira pela ESQUERDA** (`transform-origin: left center`). Girado
 * pelo centro, ele avanca sobre o texto vizinho em tela estreita.
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
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG
 *   - a classe do bloco "Veja tambem" leva o prefixo DESTE portal
 */


function avCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#EDEDE3';
  const viva = t.vivid || '#B4482B';
  const canto = fp.radius === 'sharp' ? '0' : '2px';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--tinta:${t.tinta || t.primary};--sob:${t.onPrimary || '#fff'};
  --barbg:${t.barBg || t.ink};--bartx:${t.barTx || '#fff'};
  --fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('avwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('avwrap')} *{box-sizing:border-box}
${s('avin')}{max-width:${fp.container || '1180px'};margin:0 auto;padding:0 24px;width:100%}
${s('avwrap')} h1,${s('avwrap')} h2,${s('avwrap')} h3,${s('avwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.004em;line-height:1.17;margin:0}
${s('avwrap')} a{color:inherit;text-decoration:none}
${s('avwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho: papel claro com o filete laranja da marca ---------- */
${s('avtop')}{background:var(--paper);border-bottom:1px solid var(--line);
  box-shadow:inset 0 -6px 0 var(--viva)}
${s('avbar')}{display:flex;align-items:center;gap:18px;padding-block:17px 20px;flex-wrap:wrap}
${s('avmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:800;font-size:clamp(23px,3vw,32px);letter-spacing:-.015em;color:var(--pri);flex:none}
${s('avmarca')} svg{display:block;height:.92em;width:auto;flex:none;align-self:center}
/* ⚠️ o logotipo e imagem, e imagem sem medida derruba o CLS. A altura manda e a
   largura sai da proporcao do arquivo */
${s('avmarca')} img{display:block;height:48px;width:auto;flex:none}
@media(max-width:560px){${s('avmarca')} img{height:37px}}
${s('avfb')} img{display:block;height:42px;width:auto}
${s('avnav')}{display:flex;gap:16px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('avnav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.04em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('avnav')} a:hover{color:var(--tinta)}
${s('avbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--pri);color:#fff;padding:10px 17px;border-radius:${canto};flex:none;
  margin-left:8px}
${s('avbusca')}:hover{background:var(--tinta)}
${s('avham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('avham')} i,${s('avham')} i::before,${s('avham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--pri);content:""}
${s('avham')} i{top:21px}
${s('avham')} i::before{top:-6px;left:0}
${s('avham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('avmarca')}{font-size:21px;gap:8px}
  ${s('avbar')}{gap:11px}
  ${s('avbusca')}{font-size:10.5px;padding:9px 13px;gap:6px}
}
@media(max-width:1100px){
  ${s('avham')}{display:block;order:2}
  ${s('avbusca')}{order:3;margin-left:0}
  ${s('avnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('avnav')}[data-aberto="1"]{display:flex}
  ${s('avnav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink);
    font-size:13.5px}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('avabre')}{display:grid;grid-template-columns:1.06fr 1fr;gap:44px;align-items:center;
  padding-block:38px 32px;border-bottom:1px solid var(--line)}
${s('avabre')} h2{font-size:clamp(31px,4.4vw,52px);line-height:1.05;margin:12px 0 0;
  letter-spacing:-.02em}
${s('avabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('avmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('avmm')} b{color:var(--ink);font-weight:700}
${s('avfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('avfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('avfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
@media(max-width:820px){${s('avabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 22px}}

/* ---------- a secao: o selo carimbado e a grade de dois ---------- */
${s('avsec')}{padding-block:42px;background:var(--paper)}
${s('avsec')}[data-par="1"]{background:var(--wash)}

${s('avcab')}{display:flex;align-items:center;gap:16px;margin-bottom:26px;flex-wrap:wrap}
/* ⚠️ o selo gira pela ESQUERDA: girado pelo centro ele avanca sobre o texto
   vizinho em tela estreita */
${s('avcab')} h1,${s('avcab')} h2{font-family:var(--fd);font-weight:800;
  font-size:clamp(19px,2.2vw,26px);letter-spacing:-.005em;text-transform:uppercase;
  color:var(--pri);margin:0;line-height:1.1;flex:none;
  background:var(--viva);padding:9px 18px 8px;border-radius:${canto};
  transform:rotate(-1.6deg);transform-origin:left center}
${s('avmais')}{margin-left:auto;font-family:var(--fb);font-size:11.5px;font-weight:700;
  letter-spacing:.09em;text-transform:uppercase;color:var(--tinta);flex:none;
  border-bottom:2px solid var(--viva);padding-bottom:3px}
${s('avmais')}:hover{color:var(--pri)}
${s('avdescr')}{margin:0 0 26px;font-size:15.5px;line-height:1.64;color:var(--dek);
  max-width:72ch;text-align:left}

/* a materia de abertura: foto larga em cima, texto embaixo */
${s('avdest')}{display:block}
${s('avdest')} ${s('avti')}{font-size:clamp(21px,2.6vw,30px);line-height:1.14;margin-top:12px;
  letter-spacing:-.012em}
${s('avkick')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--tinta)}
${s('avti')}{display:block;font-family:var(--fd);font-weight:700;font-size:19px;line-height:1.22;
  color:var(--ink);margin:0;transition:color .2s ease;letter-spacing:-.006em}
${s('avdd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:58ch;text-align:left}
${s('avdt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('avfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('avfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('avfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('avdest')}:hover ${s('avti')}{color:var(--tinta)}
${s('avdest')}:hover ${s('avfoto')} [data-f] img{transform:scale(1.03)}

/* a lista: DOIS cartoes grandes por linha, cada um com filete marinho no topo */
${s('avlista')}{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:34px}
${s('avrow')}{display:block;border-top:4px solid var(--pri);padding-top:16px}
${s('avmini')}{display:block;overflow:hidden;background:var(--ph);margin-bottom:13px;
  border-radius:${canto}}
${s('avmini')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '16/9'};overflow:hidden}
${s('avmini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('avrow')}:hover ${s('avmini')} [data-f] img{transform:scale(1.05)}
${s('avrow')}:hover ${s('avti')}{color:var(--tinta)}
${s('avrow')} ${s('avti')}{font-size:18px;line-height:1.24;margin-top:7px}
${s('avrow')} ${s('avdd')}{display:none}
@media(max-width:700px){
  ${s('avlista')}{grid-template-columns:1fr;gap:26px;margin-top:28px}
}

/* a listagem de editoria e os relacionados usam grade de tres cartoes */
${s('avgrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 28px}
${s('avgrade')} ${s('avti')}{font-size:19px;line-height:1.22;margin-top:11px}
${s('avgrade')} ${s('avdd')}{display:none}
@media(max-width:900px){${s('avgrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('avgrade')}{grid-template-columns:1fr}}

/* ---------- artigo ---------- */
${s('avart')}{padding-block:30px 8px}
${s('avcol')}{max-width:${fp.medida || '700px'}}
${s('avchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--tinta)}
/* ⚠️ a Darker Grotesque tem ascendente alto: abaixo de 1,16 o titulo de duas
   linhas encosta na assinatura, que vem logo abaixo e nao tem margem propria */
${s('avart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.16;margin:13px 0 15px;
  letter-spacing:-.02em}
${s('avdek')}{font-size:19px;line-height:1.54;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('avhero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'};border-radius:${canto}}
${s('avhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('avhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('avleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('avbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('avbody')} p{margin:0 0 1.15em;text-align:left}
${s('avbody')} h2{font-family:var(--fd);font-size:27px;font-weight:700;margin:1.75em 0 .5em;
  letter-spacing:-.012em}
${s('avbody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--pri)}
${s('avbody')} ul,${s('avbody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('avbody')} li{margin:0 0 .45em}
${s('avbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('avbody')} a:hover{color:var(--tinta)}
${s('avbody')} img{margin:1.5em 0;background:var(--ph);border-radius:${canto}}
${s('avbody')} blockquote{margin:1.6em 0;padding:4px 0 4px 22px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.38;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('avbody')} .sab-veja{margin:2.2em 0;padding:18px 0 16px;border-top:3px solid var(--pri);
  border-bottom:1px solid var(--line)}
${s('avbody')} .sab-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--pri);
  margin:0 0 11px}
${s('avbody')} .sab-veja ul{list-style:none;margin:0;padding:0}
${s('avbody')} .sab-veja li{margin:0;padding:8px 0;border-top:1px solid rgba(0,0,0,.08)}
${s('avbody')} .sab-veja li:first-child{border-top:0;padding-top:0}
${s('avbody')} .sab-veja a{font-family:var(--fd);font-size:17px;line-height:1.3;color:var(--ink);
  text-decoration:none;display:block}
${s('avbody')} .sab-veja a:hover{color:var(--tinta)}
${s('avbody')} figure{margin:1.5em 0}
${s('avbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('avbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('avbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('avbody')} th,${s('avbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('avbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--pri)}
@media(max-width:640px){
  ${s('avbody')} table{min-width:0}
  ${s('avbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('avbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('avbody')} table,${s('avbody')} tbody,${s('avbody')} tr,${s('avbody')} th,
  ${s('avbody')} td{display:block;width:auto}
  ${s('avbody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:${canto};padding:2px 18px 16px;margin-bottom:13px}
  ${s('avbody')} tbody th,${s('avbody')} tbody td{border:0;background:transparent}
  ${s('avbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:700;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('avbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('avbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('avass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:center;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;
  border-top:3px solid var(--pri)}
${s('avass')} img{width:84px;height:84px;object-fit:cover;background:var(--ph);border-radius:${canto}}
${s('avass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--viva)}
${s('avass')} .nm{display:block;font-family:var(--fd);font-size:22px;font-weight:700;margin-top:3px}
${s('avass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('avass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('avass')} .go:hover{text-decoration:underline}
${s('avrel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('avrotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--pri);
  border-top:3px solid var(--pri);padding-top:9px;margin-bottom:2px}

/* ---------- rodape ---------- */
${s('avfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('avcols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('avfb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:26px;color:#fff}
${s('avfb')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
${s('avfoot')} p{color:${t.footerTx || '#AFBCAF'};text-align:left}
${s('avfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:${t.footerTx || '#AFBCAF'};margin-bottom:13px}
${s('avflist')}{display:flex;flex-direction:column;gap:9px}
${s('avflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('avflist')} a:hover{opacity:1;color:var(--viva)}
${s('avfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.18);
  font-size:12.5px;color:${t.footerTx || '#AFBCAF'}}
@media(max-width:820px){
  ${s('avcols')}{grid-template-columns:1fr;gap:26px}
  ${s('avfoot')}{padding-block:34px 22px}
}

/* ---------- animacao de entrada, respeitando quem pediu menos movimento ---------- */
@media(prefers-reduced-motion:no-preference){
  ${s('reveal')}{opacity:0;transform:translateY(12px);
    transition:opacity .5s ease,transform .5s ease}
  ${s('reveal')}[data-vis="1"]{opacity:1;transform:none}
}`;
}

/* Boletim: tres faixas empilhadas de larguras diferentes, que e o proprio ritmo
 * das faixas de secao.
 * Sem letra dentro: o nome vem como texto ao lado. */
const AV_SIMB = `<svg viewBox="0 0 26 26" role="img" aria-hidden="true" focusable="false"><circle cx="13" cy="13" r="12" fill="var(--marca-1,currentColor)"/><path d="M7.5 16.5 L12 8.5 L16.5 16.5" fill="none" stroke="var(--marca-2,#fff)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="19" cy="9" r="2.1" fill="var(--marca-2,#fff)"/></svg>`;


const AV_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function avHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'avnav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase "category", em INGLES, porque na origem o
  // campo estava vazio e vazio significa `category`. Montar /categoria/ a mao
  // poe o menu inteiro em 404, e o menu continua bonito no print
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('avtop')}">
<div class="${c('avin')} ${c('avbar')}">
<a class="${c('avmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--viva);--marca-2:var(--paper)">${site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${AV_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
<nav class="${c('avnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('avham')}" type="button" data-avham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('avbusca')}" href="/busca/">${AV_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-avham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function avFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('avfoot')}"><div class="${c('avin')}">
<div class="${c('avcols')}">
  <div><a class="${c('avfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:var(--viva);--marca-2:var(--ink)">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${AV_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('avfh')}">Editorias</div><div class="${c('avflist')}">${cats}</div></div>
  <div><div class="${c('avfh')}">O jornal</div><div class="${c('avflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('avfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A materia principal da secao: imagem a ESQUERDA e texto a direita. O `span`
 * da foto tem display:block, senao o aspect-ratio nao aplica. */
function avDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // foto larga em cima e texto embaixo. Na grade da listagem o CSS so tira o
  // filete de baixo, e o mesmo cartao serve nos dois lugares
  return `<a class="${c('avdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('avfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span class="${c('avkick')}">${H.cat(a)}</span>
<h${n} class="${c('avti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('avdd')}">${H.esc(H.clip(a.dek, 180))}</span>` : ''}
<span class="${c('avdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

function avLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // cartao grande com filete marinho no topo: dois por linha
  return `<a class="${c('avrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('avmini')}"><span data-f>${H.pic(a, false)}</span></span>
<span class="${c('avkick')}">${H.cat(a)}</span>
<h${n} class="${c('avti')}">${H.esc(a.title)}</h${n}>
<span class="${c('avdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

function avHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('avabre')}">
<div><span class="${c('avchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('avmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('avfoto')}">
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
      return `<section class="${c('avsec')}" data-par="${idx % 2}">
<div class="${c('avin')}">
<div class="${c('avcab')}"><h2>${H.esc(nome)}</h2>
<a class="${c('avmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${avDestaque(ctx, d, true)}
${resto.length ? `<div class="${c('avlista')}">${resto.slice(0, 4).map(a => avLinha(ctx, a)).join('')}</div>` : ''}
</div></section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${avHeader(ctx, menu)}
<main class="${c('avwrap')}">
<div class="${c('avin')}">${H.h1(ctx)}
${abertura}</div>
${secoes}
</main>
${avFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function avAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('avass')}">
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
function avLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('avleg')}">${H.esc(alt)}</p>`;
}

function avArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('avrel')}">
<span class="${c('avrotb')}">Leia também</span>
<div class="${c('avgrade')}">${related.slice(0, 3).map(a => avDestaque(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${avHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('avwrap')}"><div class="${c('avin')}">
<article class="${c('avart')}">
<div class="${c('avcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('avchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('avdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('avhero')}"><span data-f>${H.pic(art, true)}</span></span>
${avLegenda(ctx, art)}` : ''}
<div class="${c('avbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${avAssinatura(ctx, art)}
${rel}
</div></main>
${avFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function avList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${avHeader(ctx, menu)}
<main class="${c('avwrap')}">
<section class="${c('avsec')}" data-par="0"><div class="${c('avin')}">
<div class="${c('avcab')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('avdescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? avDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('avgrade')}">${resto.map(a => avDestaque(ctx, a, false, 2)).join('')}</div>` : ''}
</div></section>
</main>
${avFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { avCss, avHeader, avFooter, avHome, avArticle, avList };
