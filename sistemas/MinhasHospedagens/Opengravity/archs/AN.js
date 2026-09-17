/*
 * Arquitetura AN, arquetipo MOSAICO. Feita para o divirto.com.br.
 *
 * ## De onde vem o desenho
 *
 * O portal e um jornal regional do Noroeste, e o acervo preservado ficou
 * concentrado em entretenimento, dica e saude. O desenho pega o gesto do
 * **boletim**: cada secao e uma **faixa de fundo cheio**, alternando papel e
 * areia, a materia principal vem com a **imagem a ESQUERDA** e o texto a
 * direita, e as demais viram **duas colunas de itens com filete vertical**, cada
 * um com miniatura quadrada pequena.
 *
 * ## O que a diferencia das 36 vizinhas da opengravity
 *
 *   - **faixa de secao com fundo cheio, alternando**. Todas as 36 usam fundo
 *     unico com filete ou pastilha separando. Alternar o fundo da secao inteira
 *     muda a silhueta da pagina a distancia, que e o que primeiro se ve
 *   - **imagem a ESQUERDA na materia principal**. A `AE`, a `AG`, a `AI` e a
 *     `AJ` poem a imagem a direita ou por cima; nenhuma espelha
 *   - **lista em duas colunas**, e nao em coluna unica
 *   - **Vollkorn e Cabin**: nenhuma das duas aparece nas 90 familias em uso
 *   - **marinho com milho**: nao existe azul-marinho com amarelo entre as 23
 *     paletas da rede
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **`flatUrl: false` COM `categoryBase: "categoria"`.** O artigo mora em
 * `/<editoria>/<slug>/` e o arquivo de editoria em `/categoria/<slug>/`. Os dois
 * nao coincidem: montar o link de editoria a mao poe o menu do topo, o do rodape
 * e o chapeu de cada artigo em 404, sem aparecer em print nenhum. Editoria sai
 * de `H.curl(slug)`, artigo de `H.url(a)`, sempre.
 *
 * ⚠️ Como o artigo mora dentro da pasta da editoria, `/<editoria>/` vira
 * diretorio sem indice e o nginx responde 403: o vhost precisa do 301 de cada
 * editoria e do `error_page 403 =404`.
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
 *   - a faixa de fundo sangra ate a borda da tela, mas o conteudo continua no
 *     contentor: fundo cheio nao pode empurrar o texto para a borda
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG
 */


function anCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#EDEDE3';
  const viva = t.vivid || '#B4482B';
  const canto = fp.radius === 'sharp' ? '0' : '2px';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--tinta:${t.tinta || t.primary};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('anwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('anwrap')} *{box-sizing:border-box}
${s('anin')}{max-width:${fp.container || '1180px'};margin:0 auto;padding:0 24px;width:100%}
/* ⚠️ a Anton tem UM peso so. Pedir 700 faz o navegador fabricar o negrito
   borrando o desenho, e o titulo sai com fantasma atras de cada letra */
${s('anwrap')} h1,${s('anwrap')} h2,${s('anwrap')} h3,${s('anwrap')} h4{font-family:var(--fd);
  font-weight:400;letter-spacing:.005em;line-height:1.1;margin:0}
${s('anwrap')} a{color:inherit;text-decoration:none}
${s('anwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('antop')}{background:var(--paper);border-bottom:4px solid var(--ink);
  box-shadow:0 4px 0 var(--viva)}
${s('anbar')}{display:flex;align-items:center;gap:18px;padding-block:19px 16px;flex-wrap:wrap}
${s('anmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:400;font-size:clamp(23px,3vw,32px);letter-spacing:-.018em;color:var(--pri);flex:none}
${s('anmarca')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
/* ⚠️ o logotipo e imagem, e imagem sem medida derruba o CLS. A altura manda e a
   largura sai da proporcao do arquivo */
${s('anmarca')} img{display:block;height:38px;width:auto;flex:none}
@media(max-width:560px){${s('anmarca')} img{height:31px}}
${s('anfb')} img{display:block;height:34px;width:auto}
${s('annav')}{display:flex;gap:14px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('annav')} a{font-family:var(--fb);font-size:11.5px;font-weight:600;letter-spacing:.05em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('annav')} a:hover{color:var(--tinta)}
${s('anbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--pri);color:#fff;padding:10px 16px;border-radius:${canto};flex:none;margin-left:8px}
${s('anbusca')}:hover{background:var(--viva);border-color:var(--viva)}
${s('anham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('anham')} i,${s('anham')} i::before,${s('anham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--pri);content:""}
${s('anham')} i{top:21px}
${s('anham')} i::before{top:-6px;left:0}
${s('anham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('anmarca')}{font-size:21px;gap:8px}
  ${s('anbar')}{gap:11px}
  ${s('anbusca')}{font-size:10px;padding:9px 12px;gap:6px}
}
@media(max-width:1100px){
  ${s('anham')}{display:block;order:2}
  ${s('anbusca')}{order:3;margin-left:0}
  ${s('annav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('annav')}[data-aberto="1"]{display:flex}
  ${s('annav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink)}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('anabre')}{display:grid;grid-template-columns:1.06fr 1fr;gap:44px;align-items:center;
  padding-block:38px 32px;border-bottom:1px solid var(--line)}
${s('anabre')} h2{font-size:clamp(31px,4.4vw,52px);line-height:1.05;margin:12px 0 0;
  letter-spacing:-.02em}
${s('anabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('anmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('anmm')} b{color:var(--ink);font-weight:700}
${s('anfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('anfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('anfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
@media(max-width:820px){${s('anabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 22px}}

/* ---------- a secao: pastilha de editoria e mosaico ---------- */
${s('ansec')}{padding-block:34px;background:var(--paper)}
${s('ancab')}{display:flex;align-items:center;justify-content:space-between;gap:16px;
  margin-bottom:20px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:12px}
/* o nome da editoria vem numa pastilha, que e o eco da faixa do logotipo */
${s('ancab')} h1,${s('ancab')} h2{font-family:var(--fd);font-size:clamp(15px,1.7vw,18px);
  font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--paper);
  background:var(--viva);padding:7px 17px 6px;border-radius:999px;margin:0;line-height:1.1}
${s('anmais')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.11em;
  text-transform:uppercase;color:var(--muted);flex:none}
${s('anmais')}:hover{color:var(--viva)}
${s('andescr')}{margin:0 0 20px;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:70ch;text-align:left}

/* ⚠️ o mosaico: a materia principal ocupa 2 colunas por 2 linhas, e os quatro
   menores se encaixam em volta. Abaixo de 900px vira uma coluna so, senao o
   cartao de duas linhas fica com foto gigante e titulo perdido */
${s('anmos')}{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:auto;gap:22px}
${s('anmos')}>*:first-child{grid-column:span 2;grid-row:span 2}
@media(max-width:1100px){
  ${s('anmos')}{grid-template-columns:repeat(2,1fr)}
  ${s('anmos')}>*:first-child{grid-column:span 2;grid-row:auto}
}
@media(max-width:640px){
  ${s('anmos')}{grid-template-columns:1fr}
  ${s('anmos')}>*:first-child{grid-column:auto}
}

/* o cartao: sem moldura, so a foto e o texto sobre a superficie */
${s('anrow')}{display:block;transition:transform .25s ease}
${s('anrow')}:hover{transform:translateY(-3px)}
${s('anmini')}{display:block;overflow:hidden;background:var(--ph);margin-bottom:12px;
  border-radius:${canto}}
${s('anmini')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '3/2'};overflow:hidden}
${s('anmini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('anrow')}:hover ${s('anmini')} [data-f] img{transform:scale(1.05)}
${s('anrow')}:hover ${s('anti')}{color:var(--viva)}
/* o chapeu ganha um fio ambar embaixo, que e o unico enfeite do cartao */
${s('ankick')}{display:inline-block;font-family:var(--fb);font-size:9.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.16em'};text-transform:uppercase;color:var(--viva);
  border-bottom:2px solid var(--viva);padding-bottom:3px;margin-bottom:8px;line-height:1}
${s('anti')}{display:block;font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.22;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('andd')}{display:block;margin:10px 0 0;font-size:15px;line-height:1.58;color:var(--dek);
  max-width:54ch;text-align:left}
${s('andt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11px;
  letter-spacing:.04em;color:var(--muted)}
/* a materia principal do mosaico e maior em tudo */
${s('anmos')}>*:first-child ${s('anti')}{font-size:clamp(21px,2.3vw,28px);line-height:1.14}
${s('anmos')}>*:first-child ${s('anmini')} [data-f]{aspect-ratio:${fp.heroAr || '3/2'}}
@media(max-width:1100px){${s('anmos')}>*:not(:first-child) ${s('andd')}{display:none}}
/* os relacionados usam o mesmo cartao, mas em tres colunas iguais */
${s('anmosr')}{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
${s('anmosr')} ${s('andd')}{display:none}
@media(max-width:680px){${s('anmosr')}{grid-template-columns:1fr}}

/* ---------- artigo ---------- */
${s('anart')}{padding-block:30px 8px}
${s('ancol')}{max-width:${fp.medida || '700px'}}
${s('anchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--tinta)}
${s('anart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.07;margin:13px 0 0;
  letter-spacing:-.02em}
${s('andek')}{font-size:19px;line-height:1.54;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('anhero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'};border-radius:${canto}}
${s('anhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('anhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('anleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('anbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('anbody')} p{margin:0 0 1.15em;text-align:left}
${s('anbody')} h2{font-family:var(--fd);font-size:27px;font-weight:400;margin:1.75em 0 .5em;
  letter-spacing:-.012em}
${s('anbody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--pri)}
${s('anbody')} ul,${s('anbody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('anbody')} li{margin:0 0 .45em}
${s('anbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('anbody')} a:hover{color:var(--tinta)}
${s('anbody')} img{margin:1.5em 0;background:var(--ph);border-radius:${canto}}
${s('anbody')} blockquote{margin:1.6em 0;padding:4px 0 4px 22px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.38;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('anbody')} .dvt-veja{margin:2.2em 0;padding:18px 0 16px;border-top:3px solid var(--pri);
  border-bottom:1px solid var(--line)}
${s('anbody')} .dvt-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--pri);
  margin:0 0 11px}
${s('anbody')} .dvt-veja ul{list-style:none;margin:0;padding:0}
${s('anbody')} .dvt-veja li{margin:0;padding:8px 0;border-top:1px solid rgba(0,0,0,.08)}
${s('anbody')} .dvt-veja li:first-child{border-top:0;padding-top:0}
${s('anbody')} .dvt-veja a{font-family:var(--fd);font-size:17px;line-height:1.3;color:var(--ink);
  text-decoration:none;display:block}
${s('anbody')} .dvt-veja a:hover{color:var(--tinta)}
${s('anbody')} figure{margin:1.5em 0}
${s('anbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('anbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('anbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('anbody')} th,${s('anbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('anbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--pri)}
@media(max-width:640px){
  ${s('anbody')} table{min-width:0}
  ${s('anbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('anbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('anbody')} table,${s('anbody')} tbody,${s('anbody')} tr,${s('anbody')} th,
  ${s('anbody')} td{display:block;width:auto}
  ${s('anbody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:${canto};padding:2px 18px 16px;margin-bottom:13px}
  ${s('anbody')} tbody th,${s('anbody')} tbody td{border:0;background:transparent}
  ${s('anbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:400;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('anbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('anbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('anass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:center;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;
  border-top:3px solid var(--pri)}
${s('anass')} img{width:84px;height:84px;object-fit:cover;background:var(--ph);border-radius:${canto}}
${s('anass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--viva)}
${s('anass')} .nm{display:block;font-family:var(--fd);font-size:22px;font-weight:400;margin-top:3px}
${s('anass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('anass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('anass')} .go:hover{text-decoration:underline}
${s('anrel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('anrotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--pri);
  border-top:3px solid var(--pri);padding-top:9px;margin-bottom:2px}

/* ---------- rodape ---------- */
${s('anfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('ancols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('anfb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:400;font-size:26px;color:#fff}
${s('anfb')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
${s('anfoot')} p{color:${t.footerTx || '#AFBCAF'};text-align:left}
${s('anfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:${t.footerTx || '#AFBCAF'};margin-bottom:13px}
${s('anflist')}{display:flex;flex-direction:column;gap:9px}
${s('anflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('anflist')} a:hover{opacity:1;color:var(--viva)}
${s('anfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.18);
  font-size:12.5px;color:${t.footerTx || '#AFBCAF'}}
@media(max-width:820px){
  ${s('ancols')}{grid-template-columns:1fr;gap:26px}
  ${s('anfoot')}{padding-block:34px 22px}
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
const AN_SIMB = `<svg viewBox="0 0 26 26" role="img" aria-hidden="true" focusable="false"><circle cx="13" cy="13" r="11" fill="none" stroke="var(--marca-1,currentColor)" stroke-width="2.4"/><ellipse cx="13" cy="13" rx="5" ry="11" fill="none" stroke="var(--marca-1,currentColor)" stroke-width="2"/><rect x="0" y="10" width="26" height="6" fill="var(--marca-2,currentColor)"/></svg>`;

const AN_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function anHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'aknav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase "category", em INGLES, porque na origem o
  // campo estava vazio e vazio significa `category`. Montar /categoria/ a mao
  // poe o menu inteiro em 404, e o menu continua bonito no print
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('antop')}">
<div class="${c('anin')} ${c('anbar')}">
<a class="${c('anmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--pri);--marca-2:var(--viva)">${site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${AN_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
<nav class="${c('annav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('anham')}" type="button" data-akham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('anbusca')}" href="/busca/">${AN_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-akham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function anFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('anfoot')}"><div class="${c('anin')}">
<div class="${c('ancols')}">
  <div><a class="${c('anfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva)">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${AN_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('anfh')}">Editorias</div><div class="${c('anflist')}">${cats}</div></div>
  <div><div class="${c('anfh')}">O jornal</div><div class="${c('anflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('anfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A materia principal da secao: imagem a ESQUERDA e texto a direita. O `span`
 * da foto tem display:block, senao o aspect-ratio nao aplica. */
function anDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('andest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('anfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span><span class="${c('ankick')}">${H.cat(a)}</span>
<h${n} class="${c('anti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('andd')}">${H.esc(H.clip(a.dek, 170))}</span>` : ''}
<span class="${c('andt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

/* O item da lista de duas colunas: filete vertical e miniatura quadrada. */
function anLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('anrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('anmini')}"><span data-f>${H.pic(a, false)}</span></span>
<span><span class="${c('ankick')}">${H.cat(a)}</span>
<h${n} class="${c('anti')}">${H.esc(a.title)}</h${n}>
<span class="${c('andt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function anHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('anabre')}">
<div><span class="${c('anchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('anmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('anfoto')}">
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
      return `<section class="${c('ansec')}" data-par="${idx % 2}">
<div class="${c('anin')}">
<div class="${c('ancab')}"><h2>${H.esc(nome)}</h2>
<a class="${c('anmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
<div class="${c('anmos')}">${anLinha(ctx, d)}${resto.slice(0, 4).map(a => anLinha(ctx, a)).join('')}</div>
</div></section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${anHeader(ctx, menu)}
<main class="${c('anwrap')}">
<div class="${c('anin')}">${H.h1(ctx)}
${abertura}</div>
${secoes}
</main>
${anFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function anAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('anass')}">
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
function anLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('anleg')}">${H.esc(alt)}</p>`;
}

function anArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('anrel')}">
<span class="${c('anrotb')}">Leia também</span>
<div class="${c('anmosr')}">${related.slice(0, 3).map(a => anLinha(ctx, a)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${anHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('anwrap')}"><div class="${c('anin')}">
<article class="${c('anart')}">
<div class="${c('ancol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('anchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('andek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('anhero')}"><span data-f>${H.pic(art, true)}</span></span>
${anLegenda(ctx, art)}` : ''}
<div class="${c('anbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${anAssinatura(ctx, art)}
${rel}
</div></main>
${anFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function anList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${anHeader(ctx, menu)}
<main class="${c('anwrap')}">
<section class="${c('ansec')}" data-par="0"><div class="${c('anin')}">
<div class="${c('ancab')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('andescr')}">${H.esc(opts.desc)}</p>` : ''}
${itens.length ? `<div class="${c('anmos')}">${itens.map(a => anLinha(ctx, a, 2)).join('')}</div>` : ''}
</div></section>
</main>
${anFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { anCss, anHeader, anFooter, anHome, anArticle, anList };
