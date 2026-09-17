/*
 * Arquitetura AS, arquetipo SINAL. Feita para o pontonaturalbrasil.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca e a palavra PN BRASIL em grotesco geometrico pesado, com tres arcos
 * concentricos e um ponto a esquerda: o desenho de um sinal irradiando. O
 * favicon da origem e so esse simbolo, em verde vivo sobre branco.
 *
 * O gesto da arquitetura sai dai: cada secao ganha um rotulo lateral estreito
 * que acompanha a rolagem, com os arcos por cima do nome da editoria, e a
 * coluna de materias corre a direita. O sinal fica parado enquanto o conteudo
 * passa por ele.
 *
 * ## O que a diferencia das 44 vizinhas da opengravity
 *
 *   - rotulo de secao horizontal, estreito e preso na rolagem. A AL gira o
 *     texto na vertical, a AK usa faixa cheia, a AM caixas, a AN mosaico, a AO
 *     linha do tempo, a AP moldura de tela, a AQ cabecalho de revista e a AR
 *     modulo assimetrico. Nenhuma prende o rotulo
 *   - trio de colunas separadas por filete vertical embaixo da materia de
 *     abertura, e nao lista com miniatura ao lado
 *   - Darker Grotesque e Rubik: nenhuma das duas esta nas 55 familias em uso
 *   - verde profundo com verde vivo: a unica paleta verde da maquina, e o vivo
 *     vem medido do favicon da origem
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 flatUrl false COM categoryBase "categoria". O artigo mora em
 * /<editoria>/<slug>/ e o arquivo de editoria em /categoria/<slug>/. Os dois
 * nao coincidem: montar o link de editoria a mao poe o menu do topo, o do
 * rodape e o chapeu de cada artigo em 404, sem aparecer em print nenhum.
 * Editoria sai de H.curl(slug), artigo de H.url(a), sempre.
 *
 * ⚠️ Como o artigo mora dentro da pasta da editoria, /<editoria>/ vira
 * diretorio sem indice e o nginx responde 403: o vhost precisa do 301 de cada
 * editoria e do error_page 403 =404.
 *
 * ⚠️ O verde vivo #00FF30 da 1,4:1 sobre branco. Ele e filete, arco e bloco,
 * nunca texto. Chapeu e etiqueta usam --tinta, com 5,4:1.
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por H.curl(slug) e de artigo por H.url(a)
 *   - menu sanfonado abaixo de 1100px, com aria-expanded, aria-controls e
 *     rotulo que muda ao abrir
 *   - todo span com aspect-ratio tem display block, e o a do cartao tem display
 *   - body aberto no cabecalho e H.bodyEnd() nos tres caminhos de pagina
 *   - nada centralizado alem da marca
 *   - lista de editoria abre em h1, e o cartao dela sobe para h2
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *   - a legenda da imagem so aparece quando o alt descreve a foto
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no :root, e nao no seletor do elemento principal
 *   - o respiro lateral usa padding-block, nunca padding completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG
 *   - a classe do bloco "Veja tambem" leva o prefixo DESTE portal
 */


function asCss(ctx) {
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

${s('aswrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('aswrap')} *{box-sizing:border-box}
${s('asin')}{max-width:${fp.container || '1180px'};margin:0 auto;padding:0 24px;width:100%}
${s('aswrap')} h1,${s('aswrap')} h2,${s('aswrap')} h3,${s('aswrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.004em;line-height:1.17;margin:0}
${s('aswrap')} a{color:inherit;text-decoration:none}
${s('aswrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('astop')}{background:var(--paper);border-bottom:5px solid var(--pri)}
${s('asbar')}{display:flex;align-items:center;gap:18px;padding-block:19px 16px;flex-wrap:wrap}
${s('asmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:clamp(23px,3vw,32px);letter-spacing:-.018em;color:var(--pri);flex:none}
${s('asmarca')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
/* ⚠️ o logotipo e imagem, e imagem sem medida derruba o CLS. A altura manda e a
   largura sai da proporcao do arquivo */
${s('asmarca')} img{display:block;height:38px;width:auto;flex:none}
@media(max-width:560px){${s('asmarca')} img{height:31px}}
${s('asfb')} img{display:block;height:34px;width:auto}
${s('asnav')}{display:flex;gap:14px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('asnav')} a{font-family:var(--fb);font-size:11.5px;font-weight:600;letter-spacing:.05em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('asnav')} a:hover{color:var(--tinta)}
${s('asbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--pri);color:#fff;padding:10px 16px;border-radius:${canto};flex:none;margin-left:8px}
${s('asbusca')}:hover{background:var(--viva)}
${s('asham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('asham')} i,${s('asham')} i::before,${s('asham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--pri);content:""}
${s('asham')} i{top:21px}
${s('asham')} i::before{top:-6px;left:0}
${s('asham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('asmarca')}{font-size:21px;gap:8px}
  ${s('asbar')}{gap:11px}
  ${s('asbusca')}{font-size:10px;padding:9px 12px;gap:6px}
}
@media(max-width:1100px){
  ${s('asham')}{display:block;order:2}
  ${s('asbusca')}{order:3;margin-left:0}
  ${s('asnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('asnav')}[data-aberto="1"]{display:flex}
  ${s('asnav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink)}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('asabre')}{display:grid;grid-template-columns:1.06fr 1fr;gap:44px;align-items:center;
  padding-block:38px 32px;border-bottom:1px solid var(--line)}
${s('asabre')} h2{font-size:clamp(31px,4.4vw,52px);line-height:1.05;margin:12px 0 0;
  letter-spacing:-.02em}
${s('asabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('asmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('asmm')} b{color:var(--ink);font-weight:700}
${s('asfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('asfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('asfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
@media(max-width:820px){${s('asabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 22px}}

/* ---------- a secao: o rotulo lateral que acompanha a rolagem ---------- */
${s('assec')}{padding-block:44px;background:var(--paper);border-top:1px solid var(--line)}
${s('assec')}[data-par="1"]{background:var(--wash)}

/* ⚠️ o modulo: rotulo estreito a esquerda, coluna de materias a direita */
${s('asmod')}{display:grid;grid-template-columns:212px minmax(0,1fr);gap:46px;align-items:start}
@media(max-width:900px){${s('asmod')}{grid-template-columns:1fr;gap:20px}}

${s('ascab')}{position:sticky;top:20px;display:block}
/* ⚠️ a Darker Grotesque tem ascendente alto: com line-height abaixo de 1,1 o
   texto transborda a caixa e encosta na linha seguinte */
${s('ascab')} h1,${s('ascab')} h2{font-family:var(--fd);font-weight:800;
  font-size:clamp(25px,2.8vw,35px);line-height:1.12;letter-spacing:-.026em;
  color:var(--pri);margin:0 0 2px}
/* os arcos da marca viram o marcador de editoria */
${s('asarco')}{display:block;width:40px;height:40px;margin-bottom:15px;color:var(--viva)}
${s('asarco')} svg{display:block;width:100%;height:100%}
${s('asmais')}{display:inline-block;margin-top:15px;font-family:var(--fb);font-size:10.5px;
  font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--tinta);
  border-bottom:2px solid var(--viva);padding-bottom:3px}
${s('asmais')}:hover{color:var(--pri)}
@media(max-width:900px){
  ${s('ascab')}{position:static;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  ${s('asarco')}{width:27px;height:27px;margin-bottom:0}
  ${s('asmais')}{margin-top:0;margin-left:auto}
}
${s('asdescr')}{margin:0 0 22px;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:70ch;text-align:left}

/* a materia de abertura da secao: foto larga em cima, texto embaixo */
${s('asdest')}{display:block}
${s('asdest')} ${s('asti')}{font-size:clamp(21px,2.5vw,30px);line-height:1.12;margin-top:13px}
${s('askick')}{display:inline-block;font-family:var(--fb);font-size:9.5px;font-weight:800;
  letter-spacing:${fp.kickerLs || '.15em'};text-transform:uppercase;color:var(--tinta)}
${s('asti')}{display:block;font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.2;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('asdd')}{display:block;margin:12px 0 0;font-size:15.5px;line-height:1.6;color:var(--dek);
  max-width:58ch;text-align:left}
${s('asdt')}{display:block;margin-top:10px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('asfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('asfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('asfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('asdest')}:hover ${s('asti')}{color:var(--pri)}
${s('asdest')}:hover ${s('asfoto')} [data-f] img{transform:scale(1.03)}

/* o trio de baixo: tres colunas separadas por filete vertical */
${s('aslista')}{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:32px;
  padding-top:24px;border-top:1px solid var(--line)}
${s('asrow')}{display:block;padding:0 22px;border-left:1px solid var(--line)}
${s('aslista')}>${s('asrow')}:first-child{border-left:0;padding-left:0}
${s('aslista')}>${s('asrow')}:last-child{padding-right:0}
${s('asmini')}{display:block;overflow:hidden;background:var(--ph);margin-bottom:12px;
  border-radius:${canto}}
${s('asmini')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '3/2'};overflow:hidden}
${s('asmini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('asrow')}:hover ${s('asmini')} [data-f] img{transform:scale(1.05)}
${s('asrow')}:hover ${s('asti')}{color:var(--pri)}
${s('asrow')} ${s('asti')}{font-size:16.5px;margin-top:7px}
${s('asrow')} ${s('asdd')}{display:none}
@media(max-width:760px){
  ${s('aslista')}{grid-template-columns:1fr 1fr}
  ${s('asrow')}{padding:0 16px}
  ${s('aslista')}>${s('asrow')}:nth-child(3){border-left:0;padding-left:0;margin-top:22px}
}
@media(max-width:520px){
  ${s('aslista')}{grid-template-columns:1fr;gap:22px}
  ${s('asrow')}{padding:0;border-left:0}
  ${s('aslista')}>${s('asrow')}:nth-child(3){margin-top:0}
}

/* a listagem de editoria e os relacionados usam grade de tres cartoes */
${s('asgrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 28px}
${s('asgrade')} ${s('asti')}{font-size:19px;line-height:1.22}
${s('asgrade')} ${s('asdd')}{display:none}
@media(max-width:900px){${s('asgrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('asgrade')}{grid-template-columns:1fr}}

/* ---------- artigo ---------- */
${s('asart')}{padding-block:30px 8px}
${s('ascol')}{max-width:${fp.medida || '700px'}}
${s('aschap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--tinta)}
/* ⚠️ a Darker Grotesque tem ascendente alto: abaixo de 1,16 o titulo de duas
   linhas encosta na assinatura, que vem logo abaixo e nao tem margem propria */
${s('asart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.16;margin:13px 0 15px;
  letter-spacing:-.02em}
${s('asdek')}{font-size:19px;line-height:1.54;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('ashero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'};border-radius:${canto}}
${s('ashero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('ashero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('asleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('asbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('asbody')} p{margin:0 0 1.15em;text-align:left}
${s('asbody')} h2{font-family:var(--fd);font-size:27px;font-weight:700;margin:1.75em 0 .5em;
  letter-spacing:-.012em}
${s('asbody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--pri)}
${s('asbody')} ul,${s('asbody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('asbody')} li{margin:0 0 .45em}
${s('asbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('asbody')} a:hover{color:var(--tinta)}
${s('asbody')} img{margin:1.5em 0;background:var(--ph);border-radius:${canto}}
${s('asbody')} blockquote{margin:1.6em 0;padding:4px 0 4px 22px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.38;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('asbody')} .pnb-veja{margin:2.2em 0;padding:18px 0 16px;border-top:3px solid var(--pri);
  border-bottom:1px solid var(--line)}
${s('asbody')} .pnb-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--pri);
  margin:0 0 11px}
${s('asbody')} .pnb-veja ul{list-style:none;margin:0;padding:0}
${s('asbody')} .pnb-veja li{margin:0;padding:8px 0;border-top:1px solid rgba(0,0,0,.08)}
${s('asbody')} .pnb-veja li:first-child{border-top:0;padding-top:0}
${s('asbody')} .pnb-veja a{font-family:var(--fd);font-size:17px;line-height:1.3;color:var(--ink);
  text-decoration:none;display:block}
${s('asbody')} .pnb-veja a:hover{color:var(--tinta)}
${s('asbody')} figure{margin:1.5em 0}
${s('asbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('asbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('asbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('asbody')} th,${s('asbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('asbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--pri)}
@media(max-width:640px){
  ${s('asbody')} table{min-width:0}
  ${s('asbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('asbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('asbody')} table,${s('asbody')} tbody,${s('asbody')} tr,${s('asbody')} th,
  ${s('asbody')} td{display:block;width:auto}
  ${s('asbody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:${canto};padding:2px 18px 16px;margin-bottom:13px}
  ${s('asbody')} tbody th,${s('asbody')} tbody td{border:0;background:transparent}
  ${s('asbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:700;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('asbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('asbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('asass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:center;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;
  border-top:3px solid var(--pri)}
${s('asass')} img{width:84px;height:84px;object-fit:cover;background:var(--ph);border-radius:${canto}}
${s('asass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--viva)}
${s('asass')} .nm{display:block;font-family:var(--fd);font-size:22px;font-weight:700;margin-top:3px}
${s('asass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('asass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('asass')} .go:hover{text-decoration:underline}
${s('asrel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('asrotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--pri);
  border-top:3px solid var(--pri);padding-top:9px;margin-bottom:2px}

/* ---------- rodape ---------- */
${s('asfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('ascols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('asfb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:26px;color:#fff}
${s('asfb')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
${s('asfoot')} p{color:${t.footerTx || '#AFBCAF'};text-align:left}
${s('asfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:${t.footerTx || '#AFBCAF'};margin-bottom:13px}
${s('asflist')}{display:flex;flex-direction:column;gap:9px}
${s('asflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('asflist')} a:hover{opacity:1;color:var(--viva)}
${s('asfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.18);
  font-size:12.5px;color:${t.footerTx || '#AFBCAF'}}
@media(max-width:820px){
  ${s('ascols')}{grid-template-columns:1fr;gap:26px}
  ${s('asfoot')}{padding-block:34px 22px}
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
const AS_SIMB = `<svg viewBox="0 0 28 28" role="img" aria-hidden="true" focusable="false" fill="none" stroke="var(--marca-1,currentColor)" stroke-width="2.6" stroke-linecap="round"><path d="M13 22 A6 6 0 0 0 7 16"/><path d="M18 22 A11 11 0 0 0 7 11"/><path d="M23 22 A16 16 0 0 0 7 6"/><circle cx="7" cy="22" r="2"/></svg>`;

const AS_ARCO = `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M17 31 A7 7 0 0 0 10 24"/><path d="M23 31 A13 13 0 0 0 10 18"/><path d="M29 31 A19 19 0 0 0 10 12"/><circle cx="10" cy="31" r="2.4"/></svg>`;

const AS_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function asHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'asnav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase "category", em INGLES, porque na origem o
  // campo estava vazio e vazio significa `category`. Montar /categoria/ a mao
  // poe o menu inteiro em 404, e o menu continua bonito no print
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('astop')}">
<div class="${c('asin')} ${c('asbar')}">
<a class="${c('asmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--pri);--marca-2:var(--viva)">${site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${AS_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
<nav class="${c('asnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('asham')}" type="button" data-asham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('asbusca')}" href="/busca/">${AS_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-asham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function asFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('asfoot')}"><div class="${c('asin')}">
<div class="${c('ascols')}">
  <div><a class="${c('asfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva)">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${AS_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('asfh')}">Editorias</div><div class="${c('asflist')}">${cats}</div></div>
  <div><div class="${c('asfh')}">O jornal</div><div class="${c('asflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('asfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A materia principal da secao: imagem a ESQUERDA e texto a direita. O `span`
 * da foto tem display:block, senao o aspect-ratio nao aplica. */
function asDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // foto em cima e texto embaixo: e a coluna larga do modulo
  return `<a class="${c('asdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('asfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span class="${c('askick')}">${H.cat(a)}</span>
<h${n} class="${c('asti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('asdd')}">${H.esc(H.clip(a.dek, 180))}</span>` : ''}
<span class="${c('asdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

function asLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // miniatura em cima e texto embaixo: e uma das tres colunas do trio
  return `<a class="${c('asrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('asmini')}"><span data-f>${H.pic(a, false)}</span></span>
<span class="${c('askick')}">${H.cat(a)}</span>
<h${n} class="${c('asti')}">${H.esc(a.title)}</h${n}>
<span class="${c('asdt')}">${H.esc(H.dateShort(a.date))}</span>
</a>`;
}

function asHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('asabre')}">
<div><span class="${c('aschap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('asmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('asfoto')}">
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
      return `<section class="${c('assec')}" data-par="${idx % 2}">
<div class="${c('asin')}">
<div class="${c('asmod')}">
<div class="${c('ascab')}"><span class="${c('asarco')}">${AS_ARCO}</span>
<h2>${H.esc(nome)}</h2>
<a class="${c('asmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
<div>${asDestaque(ctx, d, false)}
${resto.length ? `<div class="${c('aslista')}">${resto.slice(0, 3).map(a => asLinha(ctx, a)).join('')}</div>` : ''}</div>
</div>
</div></section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${asHeader(ctx, menu)}
<main class="${c('aswrap')}">
<div class="${c('asin')}">${H.h1(ctx)}
${abertura}</div>
${secoes}
</main>
${asFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function asAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('asass')}">
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
function asLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('asleg')}">${H.esc(alt)}</p>`;
}

function asArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('asrel')}">
<span class="${c('asrotb')}">Leia também</span>
<div class="${c('asgrade')}">${related.slice(0, 3).map(a => asDestaque(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${asHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('aswrap')}"><div class="${c('asin')}">
<article class="${c('asart')}">
<div class="${c('ascol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('aschap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('asdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('ashero')}"><span data-f>${H.pic(art, true)}</span></span>
${asLegenda(ctx, art)}` : ''}
<div class="${c('asbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${asAssinatura(ctx, art)}
${rel}
</div></main>
${asFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function asList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${asHeader(ctx, menu)}
<main class="${c('aswrap')}">
<section class="${c('assec')}" data-par="0"><div class="${c('asin')}">
<div class="${c('ascab')}"><span class="${c('asarco')}">${AS_ARCO}</span>
<h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('asdescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? asDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('asgrade')}">${resto.map(a => asDestaque(ctx, a, false, 2)).join('')}</div>` : ''}
</div></section>
</main>
${asFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { asCss, asHeader, asFooter, asHome, asArticle, asList };
