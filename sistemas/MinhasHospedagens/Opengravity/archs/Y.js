/*
 * Arquitetura Y, arquetipo REVISTA DE BORDO. Feita para o viajenodetalhe.com.br.
 *
 * ## De onde vem o desenho
 *
 * O nome promete viagem e detalhe, mas o acervo preservado e de revista geral:
 * entretenimento, insights, marketing e saude. O desenho segue o que o portal e
 * de verdade, e nao o que o nome sugere: **revista**, com cabecalho de capa e
 * ritmo de caderno.
 *
 * ## O que a diferencia das 24 vizinhas da opengravity
 *
 *   - **cabecalho de capa**: a marca fica centralizada entre dois filetes, que e
 *     o unico elemento centralizado permitido. Todas as vizinhas alinham a marca
 *     a esquerda
 *   - **Familjen Grotesk e Spectral**: nenhum portal da rede usa qualquer uma
 *     das duas, e o par inverte o do vizinho `adonline`, que tem serifa no
 *     titulo e sans no corpo. Aqui e o contrario
 *   - **tinta-turquesa**: as vizinhas ja ocupam grafite, marinho, esmeralda,
 *     violeta, ocre, vinho, cobalto, terracota, petroleo, carmim e lima
 *   - **numero na margem**: cada `h2` do artigo recebe o numero da secao na
 *     margem esquerda, como caderno numerado. O `adonline` resolve o mesmo
 *     problema com sumario fixo no trilho, que e o oposto
 *   - **faixa numerada** abaixo da abertura, com quatro chamadas em fileira
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por `H.curl(slug)`, nunca montado a mao. Este portal serve
 *     `/<editoria>/<slug>/` sem prefixo, e o `H.curl` ja sabe disso
 *   - menu sanfonado abaixo de 1100px, com aria-expanded, aria-controls e rotulo
 *     que muda ao abrir
 *   - todo `<span>` com aspect-ratio tem `display:block`, e o `<a>` do cartao tem
 *     `display`
 *   - `<body>` aberto no cabecalho e `H.bodyEnd()` nos tres caminhos de pagina
 *   - nada centralizado alem da marca
 *   - lista de editoria abre em h1, e o cartao dela sobe para h2
 *   - a grade fecha a ultima linha conforme o numero de itens da editoria
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 */

function yCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#dff3f4';
  const viva = t.vivid || '#0AC4CE';
  const rad = fp.radius === 'sharp' ? '0' : '4px';
  return `
${s('ywrap')}{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--fd:${t.fontDisplay};--fb:${t.fontBody}}

${s('ywrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17.5px'};line-height:1.68;-webkit-font-smoothing:antialiased}
${s('ywrap')} *{box-sizing:border-box}
${s('yin')}{max-width:${fp.container || '1180px'};margin:0 auto;padding:0 24px;width:100%}
${s('ywrap')} h1,${s('ywrap')} h2,${s('ywrap')} h3,${s('ywrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.015em;line-height:1.17;margin:0}
${s('ywrap')} a{color:inherit;text-decoration:none}

/* ---------- chapeu: versalete com filete embaixo ---------- */
${s('ykick')}{display:inline-block;font-family:var(--fd);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.14em'};text-transform:uppercase;color:var(--pri);
  padding-bottom:3px;border-bottom:2px solid var(--viva)}

/* ---------- cabecalho de capa: a marca e o unico centralizado ---------- */
${s('ytop')}{background:var(--paper);border-bottom:1px solid var(--line)}
${s('ycapa')}{padding:22px 0 14px;text-align:center;border-bottom:3px double var(--line)}
${s('ymarca')}{display:inline-flex;align-items:center;gap:10px;
  --marca-1:var(--ink);--marca-2:var(--pri)}
${s('ymarca')} svg{display:block;height:clamp(26px,3.2vw,38px);width:auto}
${s('ybar')}{display:flex;align-items:center;gap:20px;min-height:52px;flex-wrap:wrap}
${s('ynav')}{display:flex;gap:19px;align-items:center;flex-wrap:wrap;margin-right:auto}
${s('ynav')} a{font-family:var(--fd);font-size:13.5px;font-weight:600;letter-spacing:.01em;
  color:var(--ink);padding:5px 0;border-bottom:2px solid transparent;transition:.18s}
${s('ynav')} a:hover{color:var(--pri);border-bottom-color:var(--viva)}
${s('ybusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fd);
  font-size:12.5px;font-weight:600;color:var(--dek);border:1px solid var(--line);
  padding:7px 14px;background:var(--surf);transition:.18s}
${s('ybusca')}:hover{border-color:var(--pri);color:var(--pri)}
${s('yham')}{display:none;width:46px;height:46px;align-items:center;justify-content:center;
  background:var(--surf);border:1px solid var(--line);cursor:pointer;color:var(--ink)}
${s('yham')} i{display:block;width:18px;height:2px;background:currentColor;position:relative}
${s('yham')} i::before,${s('yham')} i::after{content:"";position:absolute;left:0;width:18px;
  height:2px;background:currentColor}
${s('yham')} i::before{top:-6px}${s('yham')} i::after{top:6px}

/* ---------- abertura: texto a esquerda, foto a direita ---------- */
${s('yhero')}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.06fr);
  gap:44px;align-items:center;padding:42px 0 38px}
${s('yht')} h2{font-size:clamp(29px,4vw,47px);margin:15px 0 15px;letter-spacing:-.028em}
${s('yht')} h2 a{background-image:linear-gradient(var(--viva),var(--viva));
  background-size:100% 0;background-repeat:no-repeat;background-position:0 90%;
  transition:background-size .34s cubic-bezier(.2,.7,.2,1)}
${s('yht')}:hover h2 a{background-size:100% 32%}
${s('yht')} p{margin:0 0 18px;font-size:18px;line-height:1.6;color:var(--dek);max-width:50ch}
${s('yhm')}{display:flex;flex-wrap:wrap;gap:9px;align-items:center;font-family:var(--fd);
  font-size:12.5px;color:var(--muted)}
${s('yhm')} b{color:var(--ink);font-weight:600}
/* filete duplo na foto, do mesmo vocabulario do cabecalho de capa */
${s('yhf')}{display:block;position:relative;padding:9px;border:1px solid var(--line)}
${s('yhf')}::after{content:"";position:absolute;inset:3px;border:1px solid var(--line);
  pointer-events:none}
${s('yhi')}{display:block;position:relative;width:100%;aspect-ratio:${fp.heroAr || '3/2'};
  overflow:hidden;background:var(--ph)}
${s('yhi')} img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
${s('yhf')}:hover ${s('yhi')} img{transform:scale(1.04)}

/* ---------- faixa numerada ---------- */
${s('yfaixa')}{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;
  border-top:3px double var(--line);border-bottom:1px solid var(--line)}
${s('yfx')}{display:block;padding:20px 22px 22px;border-left:1px solid var(--line);
  transition:background .2s}
${s('yfaixa')} ${s('yfx')}:first-child{border-left:0;padding-left:0}
${s('yfx')}:hover{background:var(--wash)}
${s('ynum')}{display:block;font-family:var(--fd);font-size:12px;font-weight:700;
  letter-spacing:.16em;color:var(--viva);margin-bottom:9px}
${s('yfx')} h3{font-size:16.5px;line-height:1.32;margin:0 0 8px}
${s('yfx')} time{font-family:var(--fd);font-size:11.5px;color:var(--muted);letter-spacing:.04em}

/* ---------- cartao com foto ---------- */
${s('yg')}{display:block}
${s('yg')} span[data-f]{display:block;position:relative;width:100%;
  aspect-ratio:${fp.cardAr || '3/2'};overflow:hidden;background:var(--ph);margin-bottom:14px}
${s('yg')} span[data-f] img{width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .45s}
${s('yg')}:hover span[data-f] img{transform:scale(1.05)}
${s('yg')} h2,${s('yg')} h3{font-size:19px;line-height:1.28;margin:10px 0 8px;transition:color .18s}
${s('yg')}:hover h2,${s('yg')}:hover h3{color:var(--pri)}
${s('yg')} time{font-family:var(--fd);font-size:11.5px;color:var(--muted);letter-spacing:.04em}

/* ---------- cartao compacto de lista ---------- */
${s('ycard')}{display:grid;grid-template-columns:82px minmax(0,1fr);gap:0 16px;
  align-items:start;padding:16px 0;border-bottom:1px solid var(--line)}
${s('ycard')}:last-child{border-bottom:0}
${s('ycard')} span[data-f]{display:block;position:relative;width:82px;aspect-ratio:1/1;
  overflow:hidden;background:var(--ph)}
${s('ycard')} span[data-f] img{width:100%;height:100%;object-fit:cover;display:block}
${s('ycard')} div{min-width:0}
${s('ycard')} h3{font-size:16px;line-height:1.32;margin:8px 0 6px;transition:color .18s}
${s('ycard')}:hover h3{color:var(--pri)}
${s('ycard')} time{font-family:var(--fd);font-size:11.5px;color:var(--muted)}

/* ---------- secao ---------- */
${s('ysec')}{padding:48px 0 0}
${s('ysh')}{display:flex;align-items:baseline;gap:14px;margin:0 0 22px;padding-bottom:10px;
  border-bottom:3px double var(--ink)}
${s('ysh')} h2{font-size:21px;letter-spacing:.01em;text-transform:uppercase;
  font-size:15px;letter-spacing:.15em}
${s('ysh1')} h1{font-size:clamp(26px,3.4vw,36px);letter-spacing:-.025em;text-transform:none;
  margin:0}
${s('ysh')} a{margin-left:auto;font-family:var(--fd);font-size:12.5px;font-weight:600;
  color:var(--pri);white-space:nowrap;letter-spacing:.02em}
${s('ysh')} a:hover{text-decoration:underline;text-underline-offset:3px}

${s('ydup')}{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:42px;
  align-items:stretch}
${s('ylista')}{display:flex;flex-direction:column;justify-content:space-between;min-width:0}
${s('ybig')} span[data-f]{display:block;position:relative;width:100%;aspect-ratio:16/9;
  overflow:hidden;background:var(--ph);margin-bottom:16px}
${s('ybig')} span[data-f] img{width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .45s}
${s('ybig')}:hover span[data-f] img{transform:scale(1.04)}
${s('ybig')} h3{font-size:clamp(21px,2.4vw,28px);line-height:1.22;margin:12px 0 10px;
  transition:color .18s}
${s('ybig')}:hover h3{color:var(--pri)}
${s('ybig')} p{margin:0 0 10px;font-size:16px;line-height:1.55;color:var(--dek);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
${s('ybig')} time{font-family:var(--fd);font-size:11.5px;color:var(--muted)}

${s('ygrade')}{display:grid;gap:30px 26px;grid-template-columns:repeat(3,minmax(0,1fr))}
${s('yg4')}{grid-template-columns:repeat(4,minmax(0,1fr))}
${s('yg3')}{grid-template-columns:repeat(3,minmax(0,1fr))}
${s('yg2')}{grid-template-columns:repeat(2,minmax(0,1fr))}

/* ---------- materia: coluna unica, com numero na margem ---------- */
${s('yart')}{max-width:730px;margin:34px auto 0;counter-reset:sec}
${s('yart')} h1{font-size:clamp(30px,4.3vw,48px);margin:14px 0 16px;letter-spacing:-.028em}
${s('ydek')}{font-size:20.5px;line-height:1.55;color:var(--dek);margin:0 0 22px;
  max-width:58ch;font-family:var(--fb);font-style:italic}
${s('ycapaimg')}{display:block;position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;
  background:var(--ph);margin:24px 0 8px}
${s('ycapaimg')} img{width:100%;height:100%;object-fit:cover;display:block}
${s('yleg')}{font-family:var(--fd);font-size:12px;color:var(--muted);margin:0 0 28px;
  line-height:1.5;padding-left:12px;border-left:2px solid var(--viva)}

${s('ybody')}{font-size:18px;line-height:1.78}
${s('ybody')} p{margin:0 0 23px}
${s('ybody')} h2{counter-increment:sec;position:relative;font-size:26px;margin:44px 0 16px;
  padding-top:14px;border-top:1px solid var(--line);scroll-margin-top:80px}
/* o numero da secao vai para a margem, como caderno numerado */
${s('ybody')} h2::before{content:counter(sec,decimal-leading-zero);position:absolute;
  left:-62px;top:16px;font-family:var(--fd);font-size:13px;font-weight:700;
  letter-spacing:.1em;color:var(--viva)}
${s('ybody')} h3{font-size:20.5px;margin:30px 0 11px}
${s('ybody')} a{color:var(--pri);text-decoration:underline;text-decoration-thickness:1px;
  text-underline-offset:3px}
${s('ybody')} a:hover{background:var(--wash)}
${s('ybody')} img{max-width:100%;height:auto;margin:26px 0}
${s('ybody')} ul,${s('ybody')} ol{margin:0 0 23px;padding-left:24px}
${s('ybody')} li{margin:0 0 10px}
${s('ybody')} blockquote{margin:32px 0;padding:0 0 0 26px;border-left:3px solid var(--viva);
  font-size:21px;line-height:1.5;font-style:italic;color:var(--ink)}
${s('ybody')} .qmix-aviso{margin:26px 0;padding:17px 20px;border-left:3px solid var(--pri);
  background:var(--wash);font-size:15.5px;line-height:1.6}
${s('ybody')} .qmix-veja,${s('ybody')} .malha{margin:30px 0;padding:20px 24px;
  background:var(--surf);border:1px solid var(--line);border-top:3px solid var(--pri)}
${s('ybody')} .qmix-veja b{display:block;font-family:var(--fd);font-size:11px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:13px}
${s('ybody')} .qmix-veja ul,${s('ybody')} .malha ul{list-style:none;margin:0;padding:0;
  display:grid;gap:11px}
${s('ybody')} .qmix-veja li,${s('ybody')} .malha li{margin:0;padding-left:18px;position:relative;
  font-size:16px;line-height:1.45}
${s('ybody')} .qmix-veja li::before,${s('ybody')} .malha li::before{content:"";position:absolute;
  left:0;top:.62em;width:8px;height:2px;background:var(--pri)}
${s('ybody')} .qmix-veja li a,${s('ybody')} .malha li a{text-decoration:none;color:var(--ink);
  font-weight:600}
${s('ybody')} .qmix-veja li a:hover,${s('ybody')} .malha li a:hover{color:var(--pri);background:none}

${s('ybody')} .tabwrap{width:100%;overflow-x:auto}
${s('ybody')} table{width:100%;border-collapse:collapse;margin:28px 0;font-size:16px}
${s('ybody')} table caption{text-align:left;font-family:var(--fd);font-size:12.5px;
  color:var(--muted);padding-bottom:10px;letter-spacing:.03em}
${s('ybody')} table th,${s('ybody')} table td{border:0;border-bottom:1px solid var(--line);
  padding:12px 14px;text-align:left;vertical-align:top}
${s('ybody')} table thead th{background:transparent;font-family:var(--fd);font-weight:700;
  font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--ink)}

/* ---------- ficha do autor ---------- */
${s('yass')}{display:grid;grid-template-columns:72px minmax(0,1fr);gap:0 20px;align-items:start;
  margin:40px auto 0;padding:24px;background:var(--surf);border:1px solid var(--line);
  border-top:3px solid var(--pri);max-width:730px}
${s('yass')} img{width:72px;height:72px;object-fit:cover;display:block;background:var(--ph)}
${s('yass')} .ed{font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:var(--pri);margin:0 0 6px}
${s('yass')} .nm{display:block;font-family:var(--fd);font-weight:700;font-size:19px;
  line-height:1.2;margin:0 0 8px;color:var(--ink)}
${s('yass')} p{margin:0 0 10px;font-size:15.5px;line-height:1.6;color:var(--dek)}
${s('yass')} .go{font-family:var(--fd);font-size:13px;font-weight:600;color:var(--pri)}
${s('yass')} .go:hover{text-decoration:underline;text-underline-offset:3px}
${s('yrel')}{margin:46px auto 0;padding-top:26px;border-top:3px double var(--ink);max-width:730px}

/* ---------- rodape ---------- */
${s('yfoot')}{background:${t.footerBg};color:${t.footerTx};margin-top:64px;padding:46px 0 26px;
  font-family:var(--fb);font-size:14.5px}
${s('ycols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:36px}
${s('yfb')}{display:inline-block;--marca-1:#fff;--marca-2:var(--viva)}
${s('yfb')} svg{display:block;height:26px;width:auto}
${s('yfh')}{font-family:var(--fd);font-size:11px;font-weight:700;color:#fff;margin:0 0 13px;
  letter-spacing:.14em;text-transform:uppercase}
${s('yfoot')} a{color:${t.footerTx}}
${s('yfoot')} a:hover{color:var(--viva)}
${s('yflist')}{display:grid;gap:9px}
${s('yfim')}{margin-top:32px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12);
  font-size:12.5px;display:flex;flex-wrap:wrap;gap:14px}

/* ---------- telas menores ---------- */
@media(max-width:1100px){
  ${s('yham')}{display:flex}
  ${s('ybusca')}{display:none}
  ${s('ynav')}{display:none;order:3;width:100%;flex-direction:column;gap:0;
    /* o align-items:center da barra horizontal vazava para a coluna e
       centralizava os itens, contra a regra de nada centralizado alem da marca */
    align-items:stretch;text-align:left;
    padding:0 0 10px;margin-top:4px;border-top:1px solid var(--line)}
  ${s('ynav')}[data-aberto="1"]{display:flex}
  ${s('ynav')} a{padding:15px 2px;border-bottom:1px solid var(--line);border-top:0}
  ${s('ydup')}{grid-template-columns:minmax(0,1fr);gap:32px}
  ${s('ygrade')},${s('yg4')}{grid-template-columns:repeat(3,minmax(0,1fr))}
  ${s('ycols')}{grid-template-columns:1fr 1fr}
  /* o numero da secao nao cabe na margem: entra acima do titulo */
  ${s('ybody')} h2::before{position:static;display:block;margin-bottom:5px}
}
@media(max-width:900px){
  ${s('yhero')}{grid-template-columns:minmax(0,1fr);gap:26px;padding:30px 0 30px}
  ${s('yht')}{order:2}${s('yhf')}{order:1}
  ${s('yfaixa')}{grid-template-columns:repeat(2,minmax(0,1fr))}
  ${s('yfaixa')} ${s('yfx')}:nth-child(odd){border-left:0;padding-left:0}
}
@media(max-width:820px){
  ${s('ygrade')},${s('yg4')},${s('yg3')}{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:560px){
  ${s('yfaixa')},${s('ygrade')},${s('yg4')},${s('yg3')},${s('yg2')}{
    grid-template-columns:minmax(0,1fr)}
  ${s('yfaixa')} ${s('yfx')}{border-left:0;padding-left:0;border-top:1px solid var(--line)}
  ${s('yfaixa')} ${s('yfx')}:first-child{border-top:0}
  ${s('ycols')}{grid-template-columns:1fr}
  ${s('yht')} h2{font-size:27px}
  ${s('ybig')} p{display:none}
  ${s('yass')}{grid-template-columns:minmax(0,1fr);gap:15px}
}
@media(max-width:640px){
  /* tabela vira cartao: sem isto ela sai da tela e o gesto de arrastar nao e
     descoberto. thead sai da tela mas continua no DOM, para leitor de tela */
  ${s('ybody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('ybody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('ybody')} table caption{display:none}
  ${s('ybody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('ybody')} table tbody,${s('ybody')} table tr,
  ${s('ybody')} table th,${s('ybody')} table td{display:block;width:auto}
  ${s('ybody')} table tbody tr{background:var(--surf);border:1px solid var(--line);
    padding:2px 18px 16px;margin-bottom:14px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('ybody')} table tbody th,${s('ybody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('ybody')} table tbody th{border-bottom:1px solid var(--line);padding:15px 0 12px;
    font-family:var(--fd);font-weight:700;font-size:16px;text-transform:none;
    letter-spacing:0;color:var(--ink)}
  ${s('ybody')} table tbody td{padding:14px 0 0;text-align:left;line-height:1.5}
  ${s('ybody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}`;
}

/* A marca vai em curvas: nao carrega fonte, nao pesa no LCP e nao expoe nome de
 * familia no HTML, que e um dos sinais comparados entre portais da rede.
 * O losango com o V e a inicial de "Viaje", e o texto sai da mesma familia
 * geometrica, desenhado a mao para nao depender da fonte. */
const Y_MARCA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 412 56" role="img" aria-label="Viaje no Detalhe"><g fill="var(--marca-2,#066B71)"><path d="M26 4 48 28 26 52 4 28z"/></g><path d="M18.5 20h5.2l4.3 12.4L32.3 20h5.2l-7 18.5h-4z" fill="#fff"/><g fill="var(--marca-1,currentColor)"><path d="M66 12h6.2l7.5 22.6L87.2 12h6.2L83 42h-6.6z"/><path d="M97 42V20h5.6v22zm2.8-25.3q-1.5 0-2.5-.9t-1-2.3.9-2.3 2.5-.9 2.5.9 1 2.3-1 2.3-2.4.9"/><path d="M115.4 42.5q-2.6 0-4.5-1t-3-2.8q-1-1.8-1-4.1 0-3.6 2.6-5.5t7.4-2l5-.5v-.7q0-1.8-1.1-2.7t-3.1-.9q-1.9 0-3 .8t-1.4 2.3h-5.3q.3-3.4 2.8-5.3t6.9-1.9q4.6 0 7.1 2.2t2.5 6.2V42h-5.3v-3.2q-1 1.7-2.9 2.7t-4.2 1zm1.7-4.2q2.2 0 3.7-1.4t1.5-3.5v-1l-4.3.4q-2.2.2-3.2 1t-1 2.1q0 1.1.9 1.8t2.4.6"/><path d="M131.6 50.6v-4.6q.6.1 1.2.1 1.5 0 2.2-.7t.7-2.4V20h5.6v23.5q0 3.7-2 5.6t-5.9 1.9q-1 0-1.8-.1zm6.9-33.9q-1.5 0-2.5-.9t-1-2.3.9-2.3 2.5-.9 2.5.9 1 2.3-1 2.3-2.4.9"/><path d="M157.4 42.5q-3.4 0-6-1.4t-4-4q-1.4-2.5-1.4-5.9t1.4-5.9q1.4-2.5 4-3.9t5.8-1.4q3.3 0 5.8 1.4t3.9 3.9q1.4 2.5 1.4 6v1.7h-16q.3 2.4 1.8 3.7t3.8 1.3q1.8 0 3-.6t1.8-1.9h5.4q-.7 3.3-3.5 5.2t-6.9 1.9zm-5.1-13h10.1q-.2-2.1-1.6-3.3t-3.4-1.2q-2 0-3.4 1.2t-1.7 3.3"/><path d="M186 42V20h5.5v3.4q1-1.9 2.8-2.9t4.2-1.1q3.7 0 5.8 2.2t2.1 6.2V42h-5.6V28.9q0-2.2-1-3.4t-2.9-1.2q-2 0-3.2 1.3t-1.2 3.6V42z"/><path d="M221.6 42.5q-3.4 0-6.1-1.4t-4.1-4q-1.5-2.5-1.5-5.9t1.5-5.9q1.5-2.5 4.1-3.9t6.1-1.4q3.4 0 6 1.4t4.1 3.9q1.5 2.5 1.5 5.9t-1.5 5.9q-1.5 2.5-4.1 4t-6 1.4m0-4.6q2.5 0 4-1.8t1.5-4.9-1.5-4.9-4-1.8q-2.6 0-4.1 1.8t-1.5 4.9 1.5 4.9 4.1 1.8"/><path d="M254 42V12h11.2q4.6 0 8 1.8t5.2 5.2q1.9 3.3 1.9 7.9t-1.9 8q-1.8 3.3-5.2 5.2T265.2 42zm5.9-5.2h5q4.4 0 6.7-2.5t2.3-7.3-2.3-7.3-6.7-2.5h-5z"/><path d="M294.6 42.5q-3.4 0-6-1.4t-4-4q-1.4-2.5-1.4-5.9t1.4-5.9q1.4-2.5 4-3.9t5.8-1.4q3.3 0 5.8 1.4t3.9 3.9q1.4 2.5 1.4 6v1.7h-16q.3 2.4 1.8 3.7t3.8 1.3q1.8 0 3-.6t1.8-1.9h5.4q-.7 3.3-3.5 5.2t-6.9 1.9zm-5.1-13h10.1q-.2-2.1-1.6-3.3t-3.4-1.2q-2 0-3.4 1.2t-1.7 3.3"/><path d="M317.6 42.3q-3.5 0-5.2-1.7t-1.7-5.2V24.6h-3.6V20h3.6v-5.6h5.6V20h5v4.6h-5v10.2q0 1.5.6 2.1t2 .7q1.1 0 2.4-.2v4.6q-1.8.3-3.7.3"/><g transform="translate(218.4,0)"><path d="M115.4 42.5q-2.6 0-4.5-1t-3-2.8q-1-1.8-1-4.1 0-3.6 2.6-5.5t7.4-2l5-.5v-.7q0-1.8-1.1-2.7t-3.1-.9q-1.9 0-3 .8t-1.4 2.3h-5.3q.3-3.4 2.8-5.3t6.9-1.9q4.6 0 7.1 2.2t2.5 6.2V42h-5.3v-3.2q-1 1.7-2.9 2.7t-4.2 1zm1.7-4.2q2.2 0 3.7-1.4t1.5-3.5v-1l-4.3.4q-2.2.2-3.2 1t-1 2.1q0 1.1.9 1.8t2.4.6"/></g><path d="M349.7 42V11h5.6v31z"/><path d="M359.3 42V11h5.5v12.4q1-1.9 2.8-2.9t4.2-1.1q3.7 0 5.8 2.2t2.1 6.2V42h-5.6V28.9q0-2.2-1-3.4t-2.9-1.2q-2 0-3.2 1.3t-1.2 3.6V42z"/><g transform="translate(100.5,0)"><path d="M294.6 42.5q-3.4 0-6-1.4t-4-4q-1.4-2.5-1.4-5.9t1.4-5.9q1.4-2.5 4-3.9t5.8-1.4q3.3 0 5.8 1.4t3.9 3.9q1.4 2.5 1.4 6v1.7h-16q.3 2.4 1.8 3.7t3.8 1.3q1.8 0 3-.6t1.8-1.9h5.4q-.7 3.3-3.5 5.2t-6.9 1.9zm-5.1-13h10.1q-.2-2.1-1.6-3.3t-3.4-1.2q-2 0-3.4 1.2t-1.7 3.3"/></g></g></svg>`;

const Y_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function yHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'ynav-' + (site.slug || 'p');
  // link de editoria por H.curl: montado a mao ele quebra quando ha categoryBase
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('ytop')}">
<div class="${c('yin')} ${c('ycapa')}"><a class="${c('ymarca')}" href="/"
  aria-label="${H.esc(site.name)}, página inicial">${Y_MARCA}</a></div>
<div class="${c('yin')} ${c('ybar')}">
<nav class="${c('ynav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('yham')}" type="button" data-yham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('ybusca')}" href="/busca/">${Y_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-yham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function yFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('yfoot')}"><div class="${c('yin')}">
<div class="${c('ycols')}">
  <div><a class="${c('yfb')}" href="/" aria-label="${H.esc(site.name)}">${Y_MARCA}</a>
    <p style="margin:15px 0 0;max-width:40ch;line-height:1.65">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('yfh')}">Editorias</div><div class="${c('yflist')}">${cats}</div></div>
  <div><div class="${c('yfh')}">O portal</div><div class="${c('yflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('yfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* O `<a>` tem display e o `<span>` do retrato tem display:block, senao o
 * aspect-ratio nao aplica e a imagem passa por cima do titulo. O nivel de titulo
 * vem de quem chama: h3 sob um h2 de secao na home, h2 na lista de editoria,
 * onde o titulo da pagina e h1. */
function yGrid(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('yg')} ${c('reveal')}" href="${H.url(a)}">
<span data-f>${H.pic(a, !!eager)}</span>
<span class="${c('ykick')}">${H.cat(a)}</span>
<h${n}>${H.esc(a.title)}</h${n}>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}

function yCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('ycard')}" href="${H.url(a)}">
<span data-f>${H.pic(a, false)}</span>
<div><span class="${c('ykick')}">${H.cat(a)}</span>
<h3>${H.esc(a.title)}</h3>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></div></a>`;
}

function yFaixa(ctx, a, i) {
  const { c, H } = ctx;
  return `<a class="${c('yfx')}" href="${H.url(a)}">
<span class="${c('ynum')}">${String(i + 1).padStart(2, '0')} &middot; ${H.cat(a)}</span>
<h3>${H.esc(a.title)}</h3>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}

function yHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre, ...resto] = arts;
  const faixa = resto.slice(0, 4);
  const usados = new Set([abre, ...faixa].filter(Boolean).map(a => a.slug));

  const hero = abre ? `<section class="${c('yhero')}">
<div class="${c('yht')}"><span class="${c('ykick')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 185))}</p>` : ''}
<div class="${c('yhm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a class="${c('yhf')}" href="${H.url(abre)}" aria-label="${H.esc(abre.title)}">
<span class="${c('yhi')}">${H.pic(abre, true)}</span></a>
</section>` : '';

  const tira = faixa.length
    ? `<div class="${c('yfaixa')}">${faixa.map((a, i) => yFaixa(ctx, a, i)).join('')}</div>`
    : '';

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
      const topo = `<div class="${c('ysh')}"><h2>${H.esc(nome)}</h2>
<a href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>`;
      let corpo;
      if (v.length >= 5) {
        // destaque mais quatro compactos: consome exatamente 5, sem sobra
        const [d, ...r] = v;
        corpo = `<div class="${c('ydup')}">
<a class="${c('ybig')} ${c('reveal')}" href="${H.url(d)}">
<span data-f>${H.pic(d, false)}</span>
<span class="${c('ykick')}">${H.cat(d)}</span>
<h3>${H.esc(d.title)}</h3>
${d.dek ? `<p>${H.esc(H.clip(d.dek, 135))}</p>` : ''}
<time datetime="${H.esc(d.date)}">${H.esc(H.dateShort(d.date))}</time></a>
<div class="${c('ylista')}">${r.slice(0, 4).map(a => yCard(ctx, a)).join('')}</div>
</div>`;
      } else {
        // 2, 3 ou 4 itens: a grade recebe exatamente esse numero de colunas e a
        // ultima linha fecha, sem buraco ao lado do ultimo cartao
        const n = v.length;
        corpo = `<div class="${c('ygrade')} ${c('yg' + n)}">
${v.slice(0, n).map(a => yGrid(ctx, a, false)).join('')}</div>`;
      }
      return `<section class="${c('ysec')}">${topo}${corpo}</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${yHeader(ctx, menu)}
<main class="${c('ywrap')}"><div class="${c('yin')}">
${H.h1(ctx)}
${hero}
${tira}
${secoes}
</div></main>
${yFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. Inventar `bio` ou `editorias` nao da erro em lugar
 * nenhum, so nao gera nada. */
function yAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('yass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="72" height="72" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

function yArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema. Nao ha helper para calcular isso na arquitetura.
  const rel = (related && related.length) ? `<section class="${c('yrel')}">
<div class="${c('ysh')}"><h2>Leia também</h2></div>
<div class="${c('ygrade')} ${c('yg3')}">${related.slice(0, 3).map(a =>
    yGrid(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${yHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('ywrap')}"><div class="${c('yin')}">
<article class="${c('yart')}">
${H.crumbs(ctx, art, P)}
<span class="${c('ykick')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('ydek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${P.imgUrl ? `<span class="${c('ycapaimg')}">${H.pic(art, true)}</span>
<p class="${c('yleg')}">${H.esc(art.image && art.image.alt ? art.image.alt : art.title)}</p>` : ''}
<div class="${c('ybody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${yAssinatura(ctx, art)}
${rel}
</div></main>
${yFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function yList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  return `${H.head(ctx, meta)}
${yHeader(ctx, menu)}
<main class="${c('ywrap')}"><div class="${c('yin')}">
<section class="${c('ysec')}">
<div class="${c('ysh')} ${c('ysh1')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('ydek')}" style="max-width:66ch;margin-top:-8px">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('ygrade')}">${itens.map((a, i) => yGrid(ctx, a, i === 0, 2)).join('')}</div>
</section>
</div></main>
${yFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { yCss, yHeader, yFooter, yHome, yArticle, yList };
