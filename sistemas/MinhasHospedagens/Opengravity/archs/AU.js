/*
 * Arquitetura AU, arquetipo ANEL. Feita para o publisherbrasil.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca do Publisher Brasil e um **anel de crescente verde-limao** sobre
 * preto, com um segundo crescente cinza por dentro e a palavra Publisher em
 * branco. O favicon da origem e uma lampada acesa segurada por uma mao.
 *
 * Dois gestos saem dai: o **anel abre cada secao**, ao lado do nome da
 * editoria, e as **miniaturas da lista sao circulares**, com um anel limao em
 * volta.
 *
 * ## O que a diferencia das 46 vizinhas da opengravity
 *
 *   - **foto redonda**. Nenhuma das 46 usa miniatura circular: e o que muda a
 *     silhueta da secao a distancia
 *   - **anel desenhado abrindo a editoria**, e nao pastilha, faixa ou filete
 *   - o "ver tudo" e uma **pilula limao cheia**, e nao texto sublinhado
 *   - **Bricolage Grotesque e Public Sans**: as duas ja existem na maquina, mas
 *     nunca juntas, e nenhuma outra combina display variavel com grotesca de
 *     interface
 *   - **preto com limao**: o folhadonoroeste tem lima, mas sobre marinho. Preto
 *     com limao nao existe na maquina
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
 * ⚠️ **O limao `#DFFB00` da 1,1:1 sobre branco.** Ele e anel, filete e pilula,
 * nunca texto. Chapeu, link e etiqueta usam o `--tinta`, uma azeitona escura.
 *
 * ⚠️ **A miniatura redonda precisa de `border-radius` no `span` E no `[data-f]`**:
 * o `overflow:hidden` do pai nao recorta o filho que tem `aspect-ratio` proprio
 * em todos os navegadores.
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


function auCss(ctx) {
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

${s('auwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('auwrap')} *{box-sizing:border-box}
${s('auin')}{max-width:${fp.container || '1180px'};margin:0 auto;padding:0 24px;width:100%}
${s('auwrap')} h1,${s('auwrap')} h2,${s('auwrap')} h3,${s('auwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.004em;line-height:1.17;margin:0}
${s('auwrap')} a{color:inherit;text-decoration:none}
${s('auwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho: papel claro com o filete limao da marca ---------- */
${s('autop')}{background:var(--paper);border-bottom:6px solid var(--viva)}
${s('aubar')}{display:flex;align-items:center;gap:18px;padding-block:18px 15px;flex-wrap:wrap}
${s('aumarca')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:700;font-size:clamp(22px,3vw,30px);letter-spacing:-.02em;color:var(--ink);flex:none}
${s('aumarca')} svg{display:block;height:1em;width:auto;flex:none;align-self:center}
/* ⚠️ o logotipo e imagem, e imagem sem medida derruba o CLS. A altura manda e a
   largura sai da proporcao do arquivo */
${s('aumarca')} img{display:block;height:42px;width:auto;flex:none}
@media(max-width:560px){${s('aumarca')} img{height:33px}}
${s('aufb')} img{display:block;height:38px;width:auto}
${s('aunav')}{display:flex;gap:15px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('aunav')} a{font-family:var(--fb);font-size:12px;font-weight:600;letter-spacing:.06em;
  text-transform:uppercase;color:var(--dek);padding-bottom:3px;
  border-bottom:2px solid transparent;transition:border-color .2s ease,color .2s ease}
${s('aunav')} a:hover{color:var(--ink);border-bottom-color:var(--viva)}
${s('aubusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  background:var(--ink);color:var(--paper);padding:10px 17px;border-radius:999px;flex:none;
  margin-left:8px}
${s('aubusca')}:hover{background:var(--tinta)}
${s('auham')}{display:none;width:46px;height:46px;border:2px solid var(--ink);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:999px}
${s('auham')} i,${s('auham')} i::before,${s('auham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--ink);content:""}
${s('auham')} i{top:21px}
${s('auham')} i::before{top:-6px;left:0}
${s('auham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('aumarca')}{font-size:20px;gap:8px}
  ${s('aubar')}{gap:11px}
  ${s('aubusca')}{font-size:10.5px;padding:9px 13px;gap:6px}
}
@media(max-width:1100px){
  ${s('auham')}{display:block;order:2}
  ${s('aubusca')}{order:3;margin-left:0}
  ${s('aunav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('aunav')}[data-aberto="1"]{display:flex}
  ${s('aunav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink);
    border-left:0;font-size:13px}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('auabre')}{display:grid;grid-template-columns:1.06fr 1fr;gap:44px;align-items:center;
  padding-block:38px 32px;border-bottom:1px solid var(--line)}
${s('auabre')} h2{font-size:clamp(31px,4.4vw,52px);line-height:1.05;margin:12px 0 0;
  letter-spacing:-.02em}
${s('auabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('aumm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('aumm')} b{color:var(--ink);font-weight:700}
${s('aufoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('aufoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('aufoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
@media(max-width:820px){${s('auabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 22px}}

/* ---------- a secao: o anel da marca abre, a lista vem em circulos ---------- */
${s('ausec')}{padding-block:40px;background:var(--paper)}
${s('ausec')}[data-par="1"]{background:var(--wash)}

${s('aucab')}{display:flex;align-items:center;gap:13px;margin-bottom:26px;flex-wrap:wrap}
${s('auanel')}{display:block;width:34px;height:34px;color:var(--viva);flex:none}
${s('auanel')} svg{display:block;width:100%;height:100%}
${s('aucab')} h1,${s('aucab')} h2{font-family:var(--fd);font-weight:700;
  font-size:clamp(21px,2.4vw,28px);letter-spacing:-.018em;color:var(--ink);margin:0;
  line-height:1.18;flex:none}
${s('aumais')}{margin-left:auto;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:var(--tinta);flex:none;
  background:var(--viva);padding:7px 14px;border-radius:999px}
${s('aumais')}:hover{filter:brightness(.94)}
${s('audescr')}{margin:0 0 24px;font-size:15.5px;line-height:1.64;color:var(--dek);
  max-width:72ch;text-align:left}

/* a materia de abertura: foto larga em cima, texto embaixo */
${s('audest')}{display:block;padding-bottom:28px;border-bottom:1px solid var(--line)}
${s('audest')} ${s('auti')}{font-size:clamp(22px,2.7vw,32px);line-height:1.12;margin-top:13px;
  letter-spacing:-.014em}
${s('aukick')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.13em'};text-transform:uppercase;color:var(--tinta)}
${s('auti')}{display:block;font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.2;
  color:var(--ink);margin:0;transition:color .2s ease;letter-spacing:-.008em}
${s('audd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:60ch;text-align:left}
${s('audt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('aufoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('aufoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('aufoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('audest')}:hover ${s('auti')}{color:var(--tinta)}
${s('audest')}:hover ${s('aufoto')} [data-f] img{transform:scale(1.03)}

/* a lista: duas colunas, miniatura REDONDA com anel limao */
${s('aulista')}{display:grid;grid-template-columns:1fr 1fr;gap:0 40px;margin-top:8px}
${s('aurow')}{display:grid;grid-template-columns:88px minmax(0,1fr);gap:16px;align-items:center;
  padding-block:18px;border-bottom:1px solid var(--line)}
${s('aumini')}{display:block;width:88px;height:88px;overflow:hidden;background:var(--ph);
  border-radius:50%;box-shadow:0 0 0 3px var(--viva);flex:none}
${s('aumini')} [data-f]{display:block;aspect-ratio:1/1;overflow:hidden;border-radius:50%}
${s('aumini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('aurow')}:hover ${s('aumini')} [data-f] img{transform:scale(1.08)}
${s('aurow')}:hover ${s('auti')}{color:var(--tinta)}
${s('aurow')} ${s('auti')}{font-size:16.5px;line-height:1.26;margin-top:5px}
${s('aurow')} ${s('audd')}{display:none}
@media(max-width:760px){
  ${s('aulista')}{grid-template-columns:1fr;gap:0}
  ${s('aurow')}{grid-template-columns:72px minmax(0,1fr);gap:14px}
  ${s('aumini')}{width:72px;height:72px}
}

/* a listagem de editoria e os relacionados usam grade de tres cartoes */
${s('augrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 28px}
${s('augrade')} ${s('audest')}{padding-bottom:0;border-bottom:0}
${s('augrade')} ${s('auti')}{font-size:19px;line-height:1.22;margin-top:11px}
${s('augrade')} ${s('audd')}{display:none}
@media(max-width:900px){${s('augrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('augrade')}{grid-template-columns:1fr}}

/* ---------- artigo ---------- */
${s('auart')}{padding-block:30px 8px}
${s('aucol')}{max-width:${fp.medida || '700px'}}
${s('auchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--tinta)}
/* ⚠️ a Darker Grotesque tem ascendente alto: abaixo de 1,16 o titulo de duas
   linhas encosta na assinatura, que vem logo abaixo e nao tem margem propria */
${s('auart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.16;margin:13px 0 15px;
  letter-spacing:-.02em}
${s('audek')}{font-size:19px;line-height:1.54;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('auhero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'};border-radius:${canto}}
${s('auhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('auhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('auleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('aubody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('aubody')} p{margin:0 0 1.15em;text-align:left}
${s('aubody')} h2{font-family:var(--fd);font-size:27px;font-weight:700;margin:1.75em 0 .5em;
  letter-spacing:-.012em}
${s('aubody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--pri)}
${s('aubody')} ul,${s('aubody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('aubody')} li{margin:0 0 .45em}
${s('aubody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('aubody')} a:hover{color:var(--tinta)}
${s('aubody')} img{margin:1.5em 0;background:var(--ph);border-radius:${canto}}
${s('aubody')} blockquote{margin:1.6em 0;padding:4px 0 4px 22px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.38;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('aubody')} .pub-veja{margin:2.2em 0;padding:18px 0 16px;border-top:3px solid var(--pri);
  border-bottom:1px solid var(--line)}
${s('aubody')} .pub-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--pri);
  margin:0 0 11px}
${s('aubody')} .pub-veja ul{list-style:none;margin:0;padding:0}
${s('aubody')} .pub-veja li{margin:0;padding:8px 0;border-top:1px solid rgba(0,0,0,.08)}
${s('aubody')} .pub-veja li:first-child{border-top:0;padding-top:0}
${s('aubody')} .pub-veja a{font-family:var(--fd);font-size:17px;line-height:1.3;color:var(--ink);
  text-decoration:none;display:block}
${s('aubody')} .pub-veja a:hover{color:var(--tinta)}
${s('aubody')} figure{margin:1.5em 0}
${s('aubody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('aubody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('aubody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('aubody')} th,${s('aubody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('aubody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--pri)}
@media(max-width:640px){
  ${s('aubody')} table{min-width:0}
  ${s('aubody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('aubody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('aubody')} table,${s('aubody')} tbody,${s('aubody')} tr,${s('aubody')} th,
  ${s('aubody')} td{display:block;width:auto}
  ${s('aubody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:${canto};padding:2px 18px 16px;margin-bottom:13px}
  ${s('aubody')} tbody th,${s('aubody')} tbody td{border:0;background:transparent}
  ${s('aubody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:700;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('aubody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('aubody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('auass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:center;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;
  border-top:3px solid var(--pri)}
${s('auass')} img{width:84px;height:84px;object-fit:cover;background:var(--ph);border-radius:${canto}}
${s('auass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--viva)}
${s('auass')} .nm{display:block;font-family:var(--fd);font-size:22px;font-weight:700;margin-top:3px}
${s('auass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('auass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('auass')} .go:hover{text-decoration:underline}
${s('aurel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('aurotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--pri);
  border-top:3px solid var(--pri);padding-top:9px;margin-bottom:2px}

/* ---------- rodape ---------- */
${s('aufoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('aucols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('aufb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:26px;color:#fff}
${s('aufb')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
${s('aufoot')} p{color:${t.footerTx || '#AFBCAF'};text-align:left}
${s('aufh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:${t.footerTx || '#AFBCAF'};margin-bottom:13px}
${s('auflist')}{display:flex;flex-direction:column;gap:9px}
${s('auflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('auflist')} a:hover{opacity:1;color:var(--viva)}
${s('aufim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.18);
  font-size:12.5px;color:${t.footerTx || '#AFBCAF'}}
@media(max-width:820px){
  ${s('aucols')}{grid-template-columns:1fr;gap:26px}
  ${s('aufoot')}{padding-block:34px 22px}
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
const AU_SIMB = `<svg viewBox="0 0 26 26" role="img" aria-hidden="true" focusable="false"><circle cx="13" cy="13" r="12" fill="var(--marca-1,currentColor)"/><circle cx="16.5" cy="15" r="9.6" fill="var(--marca-2,#fff)"/></svg>`;

const AU_ANEL = `<svg viewBox="0 0 34 34" aria-hidden="true" focusable="false"><circle cx="17" cy="17" r="14" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="17" cy="17" r="5" fill="currentColor"/></svg>`;

const AU_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function auHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'aunav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase "category", em INGLES, porque na origem o
  // campo estava vazio e vazio significa `category`. Montar /categoria/ a mao
  // poe o menu inteiro em 404, e o menu continua bonito no print
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('autop')}">
<div class="${c('auin')} ${c('aubar')}">
<a class="${c('aumarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--viva);--marca-2:var(--paper)">${site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${AU_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
<nav class="${c('aunav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('auham')}" type="button" data-auham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('aubusca')}" href="/busca/">${AU_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-auham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function auFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('aufoot')}"><div class="${c('auin')}">
<div class="${c('aucols')}">
  <div><a class="${c('aufb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:var(--viva);--marca-2:var(--ink)">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${AU_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('aufh')}">Editorias</div><div class="${c('auflist')}">${cats}</div></div>
  <div><div class="${c('aufh')}">O jornal</div><div class="${c('auflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('aufim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A materia principal da secao: imagem a ESQUERDA e texto a direita. O `span`
 * da foto tem display:block, senao o aspect-ratio nao aplica. */
function auDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // foto larga em cima e texto embaixo. Na grade da listagem o CSS so tira o
  // filete de baixo, e o mesmo cartao serve nos dois lugares
  return `<a class="${c('audest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('aufoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span class="${c('aukick')}">${H.cat(a)}</span>
<h${n} class="${c('auti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('audd')}">${H.esc(H.clip(a.dek, 180))}</span>` : ''}
<span class="${c('audt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

function auLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // miniatura redonda com anel limao: e o gesto da marca, e nenhuma vizinha usa
  // foto circular
  return `<a class="${c('aurow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('aumini')}"><span data-f>${H.pic(a, false)}</span></span>
<span><span class="${c('aukick')}">${H.cat(a)}</span>
<h${n} class="${c('auti')}">${H.esc(a.title)}</h${n}>
<span class="${c('audt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function auHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('auabre')}">
<div><span class="${c('auchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('aumm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('aufoto')}">
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
      return `<section class="${c('ausec')}" data-par="${idx % 2}">
<div class="${c('auin')}">
<div class="${c('aucab')}"><span class="${c('auanel')}">${AU_ANEL}</span>
<h2>${H.esc(nome)}</h2>
<a class="${c('aumais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${auDestaque(ctx, d, true)}
${resto.length ? `<div class="${c('aulista')}">${resto.slice(0, 6).map(a => auLinha(ctx, a)).join('')}</div>` : ''}
</div></section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${auHeader(ctx, menu)}
<main class="${c('auwrap')}">
<div class="${c('auin')}">${H.h1(ctx)}
${abertura}</div>
${secoes}
</main>
${auFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function auAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('auass')}">
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
function auLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('auleg')}">${H.esc(alt)}</p>`;
}

function auArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('aurel')}">
<span class="${c('aurotb')}">Leia também</span>
<div class="${c('augrade')}">${related.slice(0, 3).map(a => auDestaque(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${auHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('auwrap')}"><div class="${c('auin')}">
<article class="${c('auart')}">
<div class="${c('aucol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('auchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('audek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('auhero')}"><span data-f>${H.pic(art, true)}</span></span>
${auLegenda(ctx, art)}` : ''}
<div class="${c('aubody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${auAssinatura(ctx, art)}
${rel}
</div></main>
${auFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function auList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${auHeader(ctx, menu)}
<main class="${c('auwrap')}">
<section class="${c('ausec')}" data-par="0"><div class="${c('auin')}">
<div class="${c('aucab')}"><span class="${c('auanel')}">${AU_ANEL}</span>
<h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('audescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? auDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('augrade')}">${resto.map(a => auDestaque(ctx, a, false, 2)).join('')}</div>` : ''}
</div></section>
</main>
${auFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { auCss, auHeader, auFooter, auHome, auArticle, auList };
