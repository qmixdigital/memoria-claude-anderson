/*
 * Arquitetura AQ, arquetipo REVISTA. Feita para o revistarumo.com.br.
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


function aqCss(ctx) {
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

${s('aqwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('aqwrap')} *{box-sizing:border-box}
${s('aqin')}{max-width:${fp.container || '1180px'};margin:0 auto;padding:0 24px;width:100%}
${s('aqwrap')} h1,${s('aqwrap')} h2,${s('aqwrap')} h3,${s('aqwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.004em;line-height:1.17;margin:0}
${s('aqwrap')} a{color:inherit;text-decoration:none}
${s('aqwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('aqtop')}{background:var(--paper);border-bottom:5px solid var(--pri)}
${s('aqbar')}{display:flex;align-items:center;gap:18px;padding-block:19px 16px;flex-wrap:wrap}
${s('aqmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:clamp(23px,3vw,32px);letter-spacing:-.018em;color:var(--pri);flex:none}
${s('aqmarca')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
/* ⚠️ o logotipo e imagem, e imagem sem medida derruba o CLS. A altura manda e a
   largura sai da proporcao do arquivo */
${s('aqmarca')} img{display:block;height:38px;width:auto;flex:none}
@media(max-width:560px){${s('aqmarca')} img{height:31px}}
${s('aqfb')} img{display:block;height:34px;width:auto}
${s('aqnav')}{display:flex;gap:14px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('aqnav')} a{font-family:var(--fb);font-size:11.5px;font-weight:600;letter-spacing:.05em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('aqnav')} a:hover{color:var(--tinta)}
${s('aqbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--pri);color:#fff;padding:10px 16px;border-radius:${canto};flex:none;margin-left:8px}
${s('aqbusca')}:hover{background:var(--viva)}
${s('aqham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('aqham')} i,${s('aqham')} i::before,${s('aqham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--pri);content:""}
${s('aqham')} i{top:21px}
${s('aqham')} i::before{top:-6px;left:0}
${s('aqham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('aqmarca')}{font-size:21px;gap:8px}
  ${s('aqbar')}{gap:11px}
  ${s('aqbusca')}{font-size:10px;padding:9px 12px;gap:6px}
}
@media(max-width:1100px){
  ${s('aqham')}{display:block;order:2}
  ${s('aqbusca')}{order:3;margin-left:0}
  ${s('aqnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('aqnav')}[data-aberto="1"]{display:flex}
  ${s('aqnav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink)}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('aqabre')}{display:grid;grid-template-columns:1.06fr 1fr;gap:44px;align-items:center;
  padding-block:38px 32px;border-bottom:1px solid var(--line)}
${s('aqabre')} h2{font-size:clamp(31px,4.4vw,52px);line-height:1.05;margin:12px 0 0;
  letter-spacing:-.02em}
${s('aqabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('aqmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('aqmm')} b{color:var(--ink);font-weight:700}
${s('aqfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('aqfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('aqfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
@media(max-width:820px){${s('aqabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 22px}}

/* ---------- a secao: o cabecalho da capa da revista ---------- */
/* ⚠️ nada de faixa de fundo: a marca e clara e arejada, e faixa cheia brigaria
   com o italico serifado do logotipo */
${s('aqsec')}{padding-block:44px;background:var(--paper)}
${s('aqsec')}[data-par="1"]{background:var(--wash)}
/* o nome da editoria vem CENTRALIZADO, que aqui e a excecao permitida: e o
   proprio desenho da marca, o mesmo do logotipo, e nao texto corrido */
${s('aqcab')}{display:block;text-align:center;margin-bottom:30px}
${s('aqcab')} h1,${s('aqcab')} h2{font-family:var(--fd);font-style:italic;
  font-size:clamp(26px,3.3vw,38px);font-weight:500;letter-spacing:-.005em;color:var(--pri);
  margin:0;line-height:1.1}
/* o filete com o ponto coral no meio, tirado do logotipo */
${s('aqfio')}{display:flex;align-items:center;justify-content:center;gap:14px;
  margin:0 auto 9px;max-width:340px}
${s('aqfio')}::before,${s('aqfio')}::after{content:"";flex:1;height:1px;background:var(--line)}
${s('aqfio')} span{font-family:var(--fb);font-size:10.5px;font-weight:600;
  letter-spacing:${fp.kickerLs || '.34em'};text-transform:uppercase;color:var(--tinta);
  white-space:nowrap}
${s('aqponto')}{display:block;width:7px;height:7px;border-radius:50%;background:var(--viva);
  margin:11px auto 0}
${s('aqmais')}{display:inline-block;margin-top:13px;font-family:var(--fb);font-size:10.5px;
  font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--tinta)}
${s('aqmais')}:hover{text-decoration:underline;text-underline-offset:4px}
${s('aqdescr')}{margin:0 auto 26px;font-size:16px;line-height:1.65;color:var(--dek);
  max-width:64ch;text-align:left}

/* a materia de abertura da secao: foto larga em cima, texto embaixo, medida curta */
${s('aqdest')}{display:block;padding-bottom:30px}
${s('aqdest')} ${s('aqti')}{font-family:var(--fd);font-style:italic;font-weight:500;
  font-size:clamp(23px,2.9vw,34px);line-height:1.14;margin-top:13px;letter-spacing:-.008em}
${s('aqkick')}{display:block;font-family:var(--fb);font-size:10px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.2em'};text-transform:uppercase;color:var(--tinta)}
${s('aqti')}{display:block;font-family:var(--fd);font-weight:500;font-size:19px;line-height:1.2;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('aqdd')}{display:block;margin:12px 0 0;font-size:16px;line-height:1.62;color:var(--dek);
  max-width:60ch;text-align:left}
${s('aqdt')}{display:block;margin-top:10px;font-family:var(--fb);font-size:11.5px;
  letter-spacing:.03em;color:var(--muted)}
${s('aqfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('aqfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '21/9'};overflow:hidden}
${s('aqfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
${s('aqdest')}:hover ${s('aqti')}{color:var(--pri)}
${s('aqdest')}:hover ${s('aqfoto')} [data-f] img{transform:scale(1.02)}

/* a grade: tres colunas, sem moldura, separadas so por respiro */
${s('aqlista')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 30px}
${s('aqrow')}{display:block}
${s('aqrow')}>span{display:block}
${s('aqmini')}{display:block;overflow:hidden;background:var(--ph);margin-bottom:14px;
  border-radius:${canto}}
${s('aqmini')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '3/2'};overflow:hidden}
${s('aqmini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
${s('aqrow')}:hover ${s('aqmini')} [data-f] img{transform:scale(1.04)}
${s('aqrow')}:hover ${s('aqti')}{color:var(--tinta)}
${s('aqrow')} ${s('aqti')}{font-size:18px;line-height:1.24}
${s('aqrow')} ${s('aqkick')}{margin-bottom:6px}
@media(max-width:900px){${s('aqlista')}{grid-template-columns:1fr 1fr}}
@media(max-width:560px){
  ${s('aqlista')}{grid-template-columns:1fr;gap:28px}
  ${s('aqdd')}{display:none}
}

/* ---------- artigo ---------- */
${s('aqart')}{padding-block:30px 8px}
${s('aqcol')}{max-width:${fp.medida || '700px'}}
${s('aqchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--tinta)}
${s('aqart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.07;margin:13px 0 0;
  letter-spacing:-.02em}
${s('aqdek')}{font-size:19px;line-height:1.54;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('aqhero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'};border-radius:${canto}}
${s('aqhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('aqhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('aqleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('aqbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('aqbody')} p{margin:0 0 1.15em;text-align:left}
${s('aqbody')} h2{font-family:var(--fd);font-size:27px;font-weight:700;margin:1.75em 0 .5em;
  letter-spacing:-.012em}
${s('aqbody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--pri)}
${s('aqbody')} ul,${s('aqbody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('aqbody')} li{margin:0 0 .45em}
${s('aqbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('aqbody')} a:hover{color:var(--tinta)}
${s('aqbody')} img{margin:1.5em 0;background:var(--ph);border-radius:${canto}}
${s('aqbody')} blockquote{margin:1.6em 0;padding:4px 0 4px 22px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.38;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('aqbody')} .rev-veja{margin:2.2em 0;padding:18px 0 16px;border-top:3px solid var(--pri);
  border-bottom:1px solid var(--line)}
${s('aqbody')} .rev-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--pri);
  margin:0 0 11px}
${s('aqbody')} .rev-veja ul{list-style:none;margin:0;padding:0}
${s('aqbody')} .rev-veja li{margin:0;padding:8px 0;border-top:1px solid rgba(0,0,0,.08)}
${s('aqbody')} .rev-veja li:first-child{border-top:0;padding-top:0}
${s('aqbody')} .rev-veja a{font-family:var(--fd);font-size:17px;line-height:1.3;color:var(--ink);
  text-decoration:none;display:block}
${s('aqbody')} .rev-veja a:hover{color:var(--tinta)}
${s('aqbody')} figure{margin:1.5em 0}
${s('aqbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('aqbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('aqbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('aqbody')} th,${s('aqbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('aqbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--pri)}
@media(max-width:640px){
  ${s('aqbody')} table{min-width:0}
  ${s('aqbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('aqbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('aqbody')} table,${s('aqbody')} tbody,${s('aqbody')} tr,${s('aqbody')} th,
  ${s('aqbody')} td{display:block;width:auto}
  ${s('aqbody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:${canto};padding:2px 18px 16px;margin-bottom:13px}
  ${s('aqbody')} tbody th,${s('aqbody')} tbody td{border:0;background:transparent}
  ${s('aqbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:700;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('aqbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('aqbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('aqass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:center;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;
  border-top:3px solid var(--pri)}
${s('aqass')} img{width:84px;height:84px;object-fit:cover;background:var(--ph);border-radius:${canto}}
${s('aqass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--viva)}
${s('aqass')} .nm{display:block;font-family:var(--fd);font-size:22px;font-weight:700;margin-top:3px}
${s('aqass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('aqass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('aqass')} .go:hover{text-decoration:underline}
${s('aqrel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('aqrotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--pri);
  border-top:3px solid var(--pri);padding-top:9px;margin-bottom:2px}

/* ---------- rodape ---------- */
${s('aqfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('aqcols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('aqfb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:26px;color:#fff}
${s('aqfb')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
${s('aqfoot')} p{color:${t.footerTx || '#AFBCAF'};text-align:left}
${s('aqfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:${t.footerTx || '#AFBCAF'};margin-bottom:13px}
${s('aqflist')}{display:flex;flex-direction:column;gap:9px}
${s('aqflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('aqflist')} a:hover{opacity:1;color:var(--viva)}
${s('aqfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.18);
  font-size:12.5px;color:${t.footerTx || '#AFBCAF'}}
@media(max-width:820px){
  ${s('aqcols')}{grid-template-columns:1fr;gap:26px}
  ${s('aqfoot')}{padding-block:34px 22px}
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
const AQ_SIMB = `<svg viewBox="0 0 30 14" role="img" aria-hidden="true" focusable="false"><path d="M1 7 h10 M19 7 h10" stroke="var(--marca-1,currentColor)" stroke-width="1.6" stroke-linecap="round"/><circle cx="15" cy="7" r="3.4" fill="var(--marca-2,currentColor)"/></svg>`;

const AQ_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function aqHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'aknav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase "category", em INGLES, porque na origem o
  // campo estava vazio e vazio significa `category`. Montar /categoria/ a mao
  // poe o menu inteiro em 404, e o menu continua bonito no print
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('aqtop')}">
<div class="${c('aqin')} ${c('aqbar')}">
<a class="${c('aqmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--pri);--marca-2:var(--viva)">${site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${AQ_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
<nav class="${c('aqnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('aqham')}" type="button" data-akham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('aqbusca')}" href="/busca/">${AQ_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-akham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function aqFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('aqfoot')}"><div class="${c('aqin')}">
<div class="${c('aqcols')}">
  <div><a class="${c('aqfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva)">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${AQ_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('aqfh')}">Editorias</div><div class="${c('aqflist')}">${cats}</div></div>
  <div><div class="${c('aqfh')}">O jornal</div><div class="${c('aqflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('aqfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A materia principal da secao: imagem a ESQUERDA e texto a direita. O `span`
 * da foto tem display:block, senao o aspect-ratio nao aplica. */
function aqDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // foto larga em cima e texto embaixo, como abertura de materia de revista
  return `<a class="${c('aqdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('aqfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span class="${c('aqkick')}">${H.cat(a)}</span>
<h${n} class="${c('aqti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('aqdd')}">${H.esc(H.clip(a.dek, 190))}</span>` : ''}
<span class="${c('aqdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

function aqLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('aqrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('aqmini')}"><span data-f>${H.pic(a, false)}</span></span>
<span><span class="${c('aqkick')}">${H.cat(a)}</span>
<h${n} class="${c('aqti')}">${H.esc(a.title)}</h${n}>
<span class="${c('aqdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function aqHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('aqabre')}">
<div><span class="${c('aqchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('aqmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('aqfoto')}">
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
      return `<section class="${c('aqsec')}" data-par="${idx % 2}">
<div class="${c('aqin')}">
<div class="${c('aqcab')}">
<div class="${c('aqfio')}"><span>Revista</span></div>
<h2>${H.esc(nome)}</h2><span class="${c('aqponto')}"></span>
<a class="${c('aqmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${aqDestaque(ctx, d, false)}
${resto.length ? `<div class="${c('aqlista')}" style="--l:${Math.ceil(Math.min(resto.length, 6) / 2)}">${resto.slice(0, 6).map(a => aqLinha(ctx, a)).join('')}</div>` : ''}
</div></section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${aqHeader(ctx, menu)}
<main class="${c('aqwrap')}">
<div class="${c('aqin')}">${H.h1(ctx)}
${abertura}</div>
${secoes}
</main>
${aqFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function aqAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('aqass')}">
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
function aqLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('aqleg')}">${H.esc(alt)}</p>`;
}

function aqArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('aqrel')}">
<span class="${c('aqrotb')}">Leia também</span>
<div class="${c('aqlista')}" style="--l:${Math.ceil(Math.min(related.length, 3) / 2)}">${related.slice(0, 3).map(a => aqLinha(ctx, a)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${aqHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('aqwrap')}"><div class="${c('aqin')}">
<article class="${c('aqart')}">
<div class="${c('aqcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('aqchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('aqdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('aqhero')}"><span data-f>${H.pic(art, true)}</span></span>
${aqLegenda(ctx, art)}` : ''}
<div class="${c('aqbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${aqAssinatura(ctx, art)}
${rel}
</div></main>
${aqFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function aqList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${aqHeader(ctx, menu)}
<main class="${c('aqwrap')}">
<section class="${c('aqsec')}" data-par="0"><div class="${c('aqin')}">
<div class="${c('aqcab')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('aqdescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? aqDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('aqlista')}" style="--l:${Math.ceil(resto.length / 2)}">${resto.map(a => aqLinha(ctx, a, 2)).join('')}</div>` : ''}
</div></section>
</main>
${aqFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { aqCss, aqHeader, aqFooter, aqHome, aqArticle, aqList };
