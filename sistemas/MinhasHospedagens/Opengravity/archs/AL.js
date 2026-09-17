/*
 * Arquitetura AL, arquetipo ALMANAQUE. Feita para o diariopernambucano.com.br.
 *
 * ## De onde vem o desenho
 *
 * O acervo preservado e de almanaque: dica, entretenimento, saude, negocio,
 * curso, turismo. O desenho pega esse gesto: cada secao tem o **nome da editoria
 * escrito na VERTICAL**, numa coluna estreita a esquerda, e o conteudo corre a
 * direita dela. A materia principal vem com texto a esquerda e imagem a direita,
 * e as demais viram **duas colunas de itens com miniatura em retrato**.
 *
 * ## O que a diferencia das 37 vizinhas da opengravity
 *
 *   - **nome da editoria na vertical**, com `writing-mode`. Nenhuma das 37 gira
 *     texto: a `AE` tem coluna de margem, mas com o rotulo deitado. E o que mais
 *     muda a pagina de longe, porque cria uma faixa vertical constante
 *   - **miniatura em RETRATO 3/4** na lista, contra o quadrado da `AK`, o
 *     circulo da `AH` e a ausencia de imagem na `AJ`
 *   - **Literata e Rubik**: nenhuma das duas aparece nas 92 familias em uso
 *   - **roxo-tinta com ambar**: nao existe roxo com amarelo entre as 24 paletas
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **`flatUrl: true` MAIS `categoryBase: "categoria"`.** O artigo mora em
 * `/<slug>/`, na raiz, e o arquivo de editoria em `/categoria/<slug>/`. E o
 * segundo portal da maquina com esse par. Duas consequencias:
 *
 *   - **nao existe aqui o 403 de diretorio sem indice**: `/dicas/` nunca foi
 *     diretorio de artigo
 *   - ⚠️ **slug podado colide com pagina que o motor regenera**, porque tudo
 *     divide a raiz: `contato`, `politica-de-privacidade` e `termos-de-uso`
 *     precisam ficar fora do 410
 *
 * Editoria sai de `H.curl(slug)`, artigo de `H.url(a)`, sempre.
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
 *   - ⚠️ **a coluna vertical desaparece abaixo de 900px**: texto girado em tela
 *     estreita rouba largura da materia e nao se le
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS
 *   - a marca do cabecalho e desenho, e nao texto dentro de SVG
 */

function alCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#EDEDE3';
  const viva = t.vivid || '#B4482B';
  const canto = fp.radius === 'sharp' ? '0' : '2px';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('alwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('alwrap')} *{box-sizing:border-box}
${s('alin')}{max-width:${fp.container || '1180px'};margin:0 auto;padding:0 24px;width:100%}
${s('alwrap')} h1,${s('alwrap')} h2,${s('alwrap')} h3,${s('alwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.004em;line-height:1.17;margin:0}
${s('alwrap')} a{color:inherit;text-decoration:none}
${s('alwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho: mastro de jornal, em dois niveis ---------- */
/* ⚠️ nivel de baixo some abaixo de 1100px: editoria em faixa cheia quebra em
   tres linhas no celular e empurra a abertura para baixo da dobra */
${s('altop')}{background:var(--paper)}
${s('albar')}{display:flex;align-items:center;justify-content:space-between;gap:18px;
  padding-block:20px 17px}
${s('almarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:800;font-size:clamp(25px,3.4vw,36px);letter-spacing:-.01em;color:var(--pri);flex:none}
${s('almarca')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
/* ⚠️ o logotipo e imagem, e imagem sem medida derruba o CLS */
${s('almarca')} img{display:block;height:44px;width:auto;flex:none}
@media(max-width:560px){${s('almarca')} img{height:34px}}
${s('alfb')} img{display:block;height:40px;width:auto}

${s('alfaixa')}{background:var(--pri)}
${s('alnav')}{display:flex;gap:26px;align-items:center;flex-wrap:wrap;padding-block:11px}
${s('alnav')} a{font-family:var(--fb);font-size:12px;font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:rgba(255,255,255,.88);transition:color .2s ease}
${s('alnav')} a:hover{color:#fff;text-decoration:underline;text-underline-offset:4px}
${s('albusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  color:var(--pri);border:2px solid var(--pri);padding:8px 15px;border-radius:${canto};flex:none;
  transition:background .2s ease,color .2s ease}
${s('albusca')}:hover{background:var(--pri);color:var(--sob)}
${s('albusca')} svg{display:block;width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.2}
${s('alham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  border-radius:${canto};cursor:pointer;padding:0;flex:none}
${s('alham')} i,${s('alham')} i::before,${s('alham')} i::after{display:block;height:2.5px;
  background:var(--pri);border-radius:2px;content:""}
${s('alham')} i{position:relative;width:20px;margin:0 auto}
${s('alham')} i::before{position:absolute;left:0;right:0;top:-7px}
${s('alham')} i::after{position:absolute;left:0;right:0;top:7px}
@media(max-width:1100px){
  ${s('alfaixa')}{display:none}
  ${s('alham')}{display:block}
  ${s('albar')}{flex-wrap:wrap}
  /* o menu sanfonado do nivel de cima: papel, e nao a faixa carmim */
  ${s('almenu')}{flex:1 1 100%;display:none;padding-bottom:14px}
  ${s('almenu')}[data-aberto="1"]{display:block}
  ${s('almenu')} a{display:block;font-family:var(--fb);font-size:13px;font-weight:700;
    letter-spacing:.07em;text-transform:uppercase;color:var(--ink);
    padding:12px 2px;border-top:1px solid var(--line)}
  ${s('almenu')} a:hover{color:var(--pri)}
}
@media(min-width:1101px){${s('almenu')}{display:none}}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('alabre')}{display:grid;grid-template-columns:1.06fr 1fr;gap:44px;align-items:center;
  padding-block:38px 32px;border-bottom:1px solid var(--line)}
${s('alabre')} h2{font-size:clamp(31px,4.4vw,52px);line-height:1.05;margin:12px 0 0;
  letter-spacing:-.02em}
${s('alabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('almm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('almm')} b{color:var(--ink);font-weight:700}
${s('alfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('alfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('alfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
@media(max-width:820px){${s('alabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 22px}}

/* ---------- a secao: nome da editoria na VERTICAL ---------- */
/* ⚠️ a coluna girada desaparece abaixo de 900px: texto na vertical em tela
   estreita rouba largura da materia e ninguem le */
${s('alsec')}{display:grid;grid-template-columns:58px minmax(0,1fr);gap:26px;
  padding-block:36px;border-top:1px solid var(--line)}
${s('alrot')}{display:flex;flex-direction:column;align-items:center;gap:14px}
${s('alrot')} h1,${s('alrot')} h2{writing-mode:vertical-rl;transform:rotate(180deg);
  font-family:var(--fb);font-size:12.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.2em'};text-transform:uppercase;color:var(--pri);
  margin:0;white-space:nowrap}
/* o fio que desce sob o nome, e o que amarra a coluna vertical */
${s('alrot')}::after{content:"";display:block;width:2px;flex:1 1 auto;background:var(--viva);
  min-height:34px}
${s('alcab')}{display:flex;align-items:baseline;justify-content:flex-end;gap:16px;
  margin-bottom:18px}
${s('almais')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--viva);flex:none}
${s('almais')}:hover{text-decoration:underline}
${s('aldescr')}{margin:0 0 20px;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:70ch;text-align:left}

/* materia principal: texto a esquerda, imagem a direita */
${s('aldest')}{display:grid;grid-template-columns:1fr .78fr;gap:28px;align-items:center;
  padding-bottom:24px}
${s('aldest')} ${s('alti')}{font-size:clamp(21px,2.4vw,28px);line-height:1.16;margin-top:9px}
${s('alkick')}{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.2em'};text-transform:uppercase;color:var(--viva)}
${s('alti')}{display:block;font-family:var(--fd);font-weight:700;font-size:18px;line-height:1.24;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('aldd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.58;color:var(--dek);
  max-width:54ch;text-align:left}
${s('aldt')}{display:block;margin-top:10px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('alfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('alfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '4/3'};overflow:hidden}
${s('alfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('aldest')}:hover ${s('alti')}{color:var(--pri)}
${s('aldest')}:hover ${s('alfoto')} [data-f] img{transform:scale(1.03)}

/* lista em duas colunas, miniatura em RETRATO a esquerda de cada item */
${s('allista')}{display:grid;grid-template-columns:1fr 1fr;gap:0 30px;grid-auto-flow:column;grid-template-rows:repeat(var(--l,3),auto)}
${s('alrow')}{display:grid;grid-template-columns:64px minmax(0,1fr);gap:15px;align-items:center;
  padding-block:14px;border-top:1px solid var(--line)}
${s('almini')}{display:block;width:64px;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('almini')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '3/4'};overflow:hidden}
${s('almini')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('alrow')}:hover ${s('almini')} [data-f] img{transform:scale(1.07)}
${s('alrow')}:hover ${s('alti')}{color:var(--pri)}
${s('alrow')} ${s('alti')}{font-size:16.5px}
${s('alrow')} ${s('alkick')}{color:var(--muted);margin-bottom:3px}
@media(max-width:900px){
  ${s('alsec')}{grid-template-columns:1fr;gap:0}
  ${s('alrot')}{display:none}
  ${s('alcab')}{justify-content:space-between;border-top:3px solid var(--pri);padding-top:9px}
  /* sem a coluna vertical, o nome da editoria volta na horizontal */
  ${s('alcab')}::before{content:attr(data-nome);font-family:var(--fb);font-size:12.5px;
    font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--pri)}
  ${s('aldest')}{grid-template-columns:1fr;gap:18px}
  ${s('allista')}{grid-template-columns:1fr;grid-auto-flow:row;grid-template-rows:none}
}
@media(max-width:680px){
  ${s('alrow')}{grid-template-columns:54px minmax(0,1fr);gap:12px}
  ${s('almini')}{width:54px}
  ${s('aldd')}{display:none}
}

/* ---------- artigo ---------- */
${s('alart')}{padding-block:30px 8px}
${s('alcol')}{max-width:${fp.medida || '700px'}}
${s('alchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--viva)}
${s('alart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.07;margin:13px 0 0;
  letter-spacing:-.02em}
${s('aldek')}{font-size:19px;line-height:1.54;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('alhero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'};border-radius:${canto}}
${s('alhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('alhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('alleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('albody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('albody')} p{margin:0 0 1.15em;text-align:left}
${s('albody')} h2{font-family:var(--fd);font-size:27px;font-weight:700;margin:1.75em 0 .5em;
  letter-spacing:-.012em}
${s('albody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--pri)}
${s('albody')} ul,${s('albody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('albody')} li{margin:0 0 .45em}
${s('albody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('albody')} a:hover{color:var(--viva)}
${s('albody')} img{margin:1.5em 0;background:var(--ph);border-radius:${canto}}
${s('albody')} blockquote{margin:1.6em 0;padding:4px 0 4px 22px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.38;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('albody')} .dpe-veja{margin:2.2em 0;padding:18px 0 16px;border-top:3px solid var(--pri);
  border-bottom:1px solid var(--line)}
${s('albody')} .dpe-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--pri);
  margin:0 0 11px}
${s('albody')} .dpe-veja ul{list-style:none;margin:0;padding:0}
${s('albody')} .dpe-veja li{margin:0;padding:8px 0;border-top:1px solid rgba(0,0,0,.08)}
${s('albody')} .dpe-veja li:first-child{border-top:0;padding-top:0}
${s('albody')} .dpe-veja a{font-family:var(--fd);font-size:17px;line-height:1.3;color:var(--ink);
  text-decoration:none;display:block}
${s('albody')} .dpe-veja a:hover{color:var(--viva)}
${s('albody')} figure{margin:1.5em 0}
${s('albody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('albody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('albody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('albody')} th,${s('albody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('albody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--pri)}
@media(max-width:640px){
  ${s('albody')} table{min-width:0}
  ${s('albody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('albody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('albody')} table,${s('albody')} tbody,${s('albody')} tr,${s('albody')} th,
  ${s('albody')} td{display:block;width:auto}
  ${s('albody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:${canto};padding:2px 18px 16px;margin-bottom:13px}
  ${s('albody')} tbody th,${s('albody')} tbody td{border:0;background:transparent}
  ${s('albody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:700;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('albody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('albody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('alass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:center;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;
  border-top:3px solid var(--pri)}
${s('alass')} img{width:84px;height:84px;object-fit:cover;background:var(--ph);border-radius:${canto}}
${s('alass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--viva)}
${s('alass')} .nm{display:block;font-family:var(--fd);font-size:22px;font-weight:700;margin-top:3px}
${s('alass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('alass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('alass')} .go:hover{text-decoration:underline}
${s('alrel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('alrotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--pri);
  border-top:3px solid var(--pri);padding-top:9px;margin-bottom:2px}

/* ---------- rodape ---------- */
${s('alfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('alcols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('alfb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:26px;color:#fff}
${s('alfb')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
${s('alfoot')} p{color:${t.footerTx || '#AFBCAF'};text-align:left}
${s('alfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:${t.footerTx || '#AFBCAF'};margin-bottom:13px}
${s('alflist')}{display:flex;flex-direction:column;gap:9px}
${s('alflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('alflist')} a:hover{opacity:1;color:var(--viva)}
${s('alfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.18);
  font-size:12.5px;color:${t.footerTx || '#AFBCAF'}}
@media(max-width:820px){
  ${s('alcols')}{grid-template-columns:1fr;gap:26px}
  ${s('alfoot')}{padding-block:34px 22px}
}

/* ---------- animacao de entrada, respeitando quem pediu menos movimento ---------- */
@media(prefers-reduced-motion:no-preference){
  ${s('reveal')}{opacity:0;transform:translateY(12px);
    transition:opacity .5s ease,transform .5s ease}
  ${s('reveal')}[data-vis="1"]{opacity:1;transform:none}
}`;
}

/* Almanaque: tres barras verticais de alturas diferentes, que e o proprio gesto
 * da coluna girada de cada secao.
 * Sem letra dentro: o nome vem como texto ao lado. */
const AL_SIMB = `<svg viewBox="0 0 30 26" role="img" aria-hidden="true" focusable="false"><rect x="3" y="4" width="5" height="18" fill="var(--marca-1,currentColor)"/><rect x="11" y="8" width="5" height="14" fill="var(--marca-2,currentColor)"/><rect x="19" y="2" width="5" height="20" fill="var(--marca-1,currentColor)"/></svg>`;

const AL_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function alHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'alnav-' + (site.slug || 'p');
  // 🔴 o link de editoria sai de H.curl: este portal tem categoryBase, e a
  // lista mora em /categoria/<slug>/. Montar /<slug>/ a mao poe o menu inteiro
  // em 404 sem estragar nenhuma captura de tela
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  const marca = site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${AL_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`;
  return `<body>
<header class="${c('altop')}">
<div class="${c('alin')} ${c('albar')}">
<a class="${c('almarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--pri);--marca-2:var(--viva)">${marca}</a>
<a class="${c('albusca')}" href="/busca/">${AL_LUPA}Buscar</a>
<button class="${c('alham')}" type="button" data-alham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<nav class="${c('almenu')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
</div>
<div class="${c('alfaixa')}"><nav class="${c('alin')} ${c('alnav')}" aria-label="Editorias">${links}</nav></div>
</header>
<script>(function(){var b=document.querySelector('[data-alham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function alFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('alfoot')}"><div class="${c('alin')}">
<div class="${c('alcols')}">
  <div><a class="${c('alfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva)">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${AL_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('alfh')}">Editorias</div><div class="${c('alflist')}">${cats}</div></div>
  <div><div class="${c('alfh')}">O jornal</div><div class="${c('alflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('alfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A materia principal da secao: imagem a ESQUERDA e texto a direita. O `span`
 * da foto tem display:block, senao o aspect-ratio nao aplica. */
function alDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('aldest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('alfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span><span class="${c('alkick')}">${H.cat(a)}</span>
<h${n} class="${c('alti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('aldd')}">${H.esc(H.clip(a.dek, 170))}</span>` : ''}
<span class="${c('aldt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

/* O item da lista de duas colunas: miniatura em retrato a esquerda. */
function alLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('alrow')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('almini')}"><span data-f>${H.pic(a, false)}</span></span>
<span><span class="${c('alkick')}">${H.cat(a)}</span>
<h${n} class="${c('alti')}">${H.esc(a.title)}</h${n}>
<span class="${c('aldt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function alHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('alabre')}">
<div><span class="${c('alchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('almm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('alfoto')}">
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
      // o nome da editoria fica na coluna girada; no celular ele volta pelo
      // data-nome do cabecalho, que o CSS imprime com ::before
      return `<section class="${c('alsec')}">
<div class="${c('alrot')}"><h2>${H.esc(nome)}</h2></div>
<div>
<div class="${c('alcab')}" data-nome="${H.esc(nome)}">
<a class="${c('almais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${alDestaque(ctx, d, false)}
${resto.length ? `<div class="${c('allista')}" style="--l:${Math.ceil(Math.min(resto.length, 6) / 2)}">${resto.slice(0, 6).map(a => alLinha(ctx, a)).join('')}</div>` : ''}
</div></section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${alHeader(ctx, menu)}
<main class="${c('alwrap')}"><div class="${c('alin')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${alFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function alAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('alass')}">
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
function alLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('alleg')}">${H.esc(alt)}</p>`;
}

function alArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('alrel')}">
<span class="${c('alrotb')}">Leia também</span>
<div class="${c('allista')}" style="--l:${Math.ceil(Math.min(related.length, 3) / 2)}">${related.slice(0, 3).map(a => alLinha(ctx, a)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${alHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('alwrap')}"><div class="${c('alin')}">
<article class="${c('alart')}">
<div class="${c('alcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('alchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('aldek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('alhero')}"><span data-f>${H.pic(art, true)}</span></span>
${alLegenda(ctx, art)}` : ''}
<div class="${c('albody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${alAssinatura(ctx, art)}
${rel}
</div></main>
${alFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function alList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${alHeader(ctx, menu)}
<main class="${c('alwrap')}"><div class="${c('alin')}">
<section class="${c('alsec')}">
<div class="${c('alrot')}"><h1>${H.esc(opts.title)}</h1></div>
<div>
<div class="${c('alcab')}" data-nome="${H.esc(opts.title)}"></div>
${opts.desc ? `<p class="${c('aldescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? alDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('allista')}" style="--l:${Math.ceil(resto.length / 2)}">${resto.map(a => alLinha(ctx, a, 2)).join('')}</div>` : ''}
</div></section>
</div></main>
${alFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { alCss, alHeader, alFooter, alHome, alArticle, alList };
