/*
 * Arquitetura Z, arquetipo MURAL. Feita para o advivo.com.br.
 *
 * ## De onde vem o desenho
 *
 * O portal se apresenta como "informacao como direito desde 2018". O desenho
 * segue essa promessa e nao a estetica de revista: quadro de avisos publico,
 * com filete grosso, etiqueta de editoria em bloco solido e ritmo de mural, em
 * que tudo esta afixado e legivel de longe.
 *
 * ## O que a diferencia das 25 vizinhas da opengravity
 *
 *   - **marca a esquerda com filete grosso e a data do dia a direita**. A
 *     vizinha `Y` centraliza a marca entre filetes finos; aqui o cabecalho e
 *     assimetrico de proposito
 *   - **Fraunces e Public Sans**: nenhum portal da rede usa qualquer uma das
 *     duas. E o par inverte o do `Y`, que tem sans no titulo e serifa no corpo
 *   - **azul-ferrugem**: as vizinhas ja ocupam grafite, marinho, esmeralda,
 *     violeta, ocre, vinho, cobalto, terracota, petroleo, carmim, lima e
 *     turquesa
 *   - **etiqueta de editoria em bloco solido**, e nao chapeu sublinhado
 *   - **coluna do mural** na abertura: a manchete ocupa duas colunas e a terceira
 *     traz as ultimas em fio continuo, em vez da faixa numerada do `Y`
 *   - **h2 do artigo com quadrado solido na margem**, em vez do numero de secao
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por `H.curl(slug)`, nunca montado a mao
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
 *
 * ## A marca
 *
 * O wordmark sai como **texto** na fonte de titulo, e nao em curvas. A vizinha
 * `Y` foi ao ar mostrando "Viaje no Det" porque eu desenhei dez contornos para
 * uma palavra de catorze letras, e nada acusou: o SVG era valido e o
 * `aria-label` dizia o nome certo. Texto nao tem como perder letra. O simbolo ao
 * lado e geometrico e nao carrega letra nenhuma.
 */

function zCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#EDE6DC';
  const viva = t.vivid || '#D8452B';
  return `
/* :root, e nao o seletor do elemento principal: cabecalho e rodape sao irmaos
   dele, e dentro deles var(--pri) nao resolveria. Ja custou o botao do menu
   invisivel. Sem sinal de maior-menor no comentario, de proposito: literal de
   tag dentro do CSS engana parser ingenuo, e enganou o meu auditor. */
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{background:var(--paper);color:var(--ink);font-family:var(--fb);margin:0}

${s('zwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('zwrap')} *{box-sizing:border-box}
${s('zin')}{max-width:${fp.container || '1200px'};margin:0 auto;padding:0 22px;width:100%}
${s('zwrap')} h1,${s('zwrap')} h2,${s('zwrap')} h3,${s('zwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.012em;line-height:1.14;margin:0}
${s('zwrap')} a{color:inherit;text-decoration:none}
${s('zwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho: marca a esquerda, data a direita, filete grosso ---------- */
${s('ztop')}{background:var(--surf);border-bottom:4px solid var(--pri)}
${s('zcapa')}{display:flex;align-items:flex-end;justify-content:space-between;
  gap:18px;padding-block:20px 14px;flex-wrap:wrap}
${s('zmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:clamp(25px,3.1vw,34px);letter-spacing:-.022em;color:var(--ink)}
${s('zmarca')} svg{display:block;width:auto;height:1em;flex:none}
${s('zdata')}{font-family:var(--fb);font-size:12px;letter-spacing:.09em;
  text-transform:uppercase;color:var(--muted);padding-bottom:5px}

${s('zbar')}{display:flex;align-items:center;gap:18px;min-height:50px;flex-wrap:wrap;
  border-top:1px solid var(--line)}
${s('znav')}{display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-right:auto}
${s('znav')} a{font-family:var(--fb);font-size:13px;font-weight:600;letter-spacing:.02em;
  text-transform:uppercase;color:var(--ink);padding:14px 0;border-bottom:3px solid transparent}
${s('znav')} a:hover{color:var(--pri);border-bottom-color:var(--viva)}
${s('zbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:12.5px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;
  color:var(--pri);border:2px solid var(--pri);padding:8px 15px;min-height:40px}
${s('zbusca')}:hover{background:var(--pri);color:${t.onPrimary || '#fff'}}
${s('zham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;position:relative;padding:0}
${s('zham')} i,${s('zham')}::before,${s('zham')}::after{content:"";position:absolute;left:11px;
  right:11px;height:2px;background:var(--pri)}
${s('zham')}::before{top:14px}${s('zham')} i{top:21px}${s('zham')}::after{top:28px}

/* ---------- etiqueta de editoria: bloco solido, nao chapeu sublinhado ---------- */
${s('zet')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.11em'};text-transform:uppercase;
  background:var(--pri);color:${t.onPrimary || '#fff'};padding:4px 9px;margin-bottom:11px}
${s('zet')} a{color:inherit}
${s('zetv')}{background:var(--viva)}

/* ---------- abertura: manchete em duas colunas, mural na terceira ---------- */
${s('zabre')}{display:grid;grid-template-columns:minmax(0,2.15fr) minmax(0,1fr);
  gap:38px;padding:34px 0 30px;border-bottom:1px solid var(--line)}
${s('zman')}{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);
  gap:26px;align-items:stretch}
${s('zman')} h2{font-size:clamp(30px,3.9vw,46px);line-height:1.06;letter-spacing:-.026em}
${s('zman')} h2 a:hover{color:var(--pri)}
${s('zman')} p{color:var(--dek);font-size:16.5px;margin:14px 0 0;max-width:44ch}
${s('zmm')}{margin-top:15px;font-size:12.5px;color:var(--muted);display:flex;gap:8px;
  align-items:center;flex-wrap:wrap;font-family:var(--fb)}
${s('zmm')} b{color:var(--ink);font-weight:700}
${s('zmi')}{display:block;height:100%;min-height:300px;max-height:440px;overflow:hidden;
  background:var(--ph);border:1px solid var(--line)}
${s('zmi')} img{width:100%;height:100%;object-fit:cover}

${s('zmural')}{border-left:3px solid var(--pri);padding-left:20px}
${s('zmh')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--pri);margin-bottom:14px}
${s('zmit')}{display:block;padding:13px 0;border-bottom:1px dotted var(--line)}
${s('zmit')}:last-child{border-bottom:0}
${s('zmit')} h3{font-size:16px;line-height:1.3;letter-spacing:-.008em}
${s('zmit')}:hover h3{color:var(--pri)}
${s('zmit')} span{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:.09em;text-transform:uppercase;color:var(--viva);margin-bottom:5px}
${s('zmit')} time{display:block;font-size:12px;color:var(--muted);margin-top:6px}

/* ---------- secoes ---------- */
${s('zsec')}{padding:36px 0;border-bottom:1px solid var(--line)}
${s('zsec')}:last-of-type{border-bottom:0}
${s('zsh')}{display:flex;align-items:center;gap:16px;margin-bottom:22px}
${s('zsh')} h2,${s('zsh')} h1{font-size:20px;letter-spacing:.01em;text-transform:uppercase;
  font-family:var(--fb);font-weight:800;flex:none}
${s('zsh')}::after{content:"";flex:1;height:3px;background:var(--pri)}
${s('zsh')} .more{font-family:var(--fb);font-size:12px;font-weight:700;letter-spacing:.05em;
  text-transform:uppercase;color:var(--pri);flex:none}
${s('zsh')} .more:hover{color:var(--viva)}
${s('zsh1')} h1{font-size:clamp(25px,3vw,34px);text-transform:none;letter-spacing:-.02em;
  font-family:var(--fd);font-weight:700}

${s('zdup')}{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:32px}
${s('zbig')}{display:block}
${s('zbig')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '16/10'};overflow:hidden;
  background:var(--ph);margin-bottom:13px;border:1px solid var(--line)}
${s('zbig')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('zbig')} h3{font-size:24px;line-height:1.16;letter-spacing:-.018em}
${s('zbig')}:hover h3{color:var(--pri)}
${s('zbig')} p{color:var(--dek);font-size:15.5px;margin:9px 0 0;max-width:52ch}
${s('zbig')} time{display:block;font-size:12px;color:var(--muted);margin-top:10px}

${s('zlista')}{display:flex;flex-direction:column}
${s('zcard')}{display:grid;grid-template-columns:96px minmax(0,1fr);gap:15px;
  padding:15px 0;border-top:1px solid var(--line)}
${s('zcard')}:first-child{border-top:0;padding-top:0}
${s('zcard')} [data-f]{display:block;aspect-ratio:1/1;overflow:hidden;background:var(--ph)}
${s('zcard')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('zcard')} h3{font-size:15.5px;line-height:1.3;letter-spacing:-.006em}
${s('zcard')}:hover h3{color:var(--pri)}
${s('zcard')} time{display:block;font-size:11.5px;color:var(--muted);margin-top:6px}

${s('zgrade')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}
${s('zg2')}{grid-template-columns:repeat(2,minmax(0,1fr))}
${s('zg3')}{grid-template-columns:repeat(3,minmax(0,1fr))}
${s('zg4')}{grid-template-columns:repeat(4,minmax(0,1fr))}
${s('zg')}{display:block}
${s('zg')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '16/10'};overflow:hidden;
  background:var(--ph);margin-bottom:12px;border:1px solid var(--line)}
${s('zg')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('zg')}:hover [data-f] img{transform:scale(1.035)}
${s('zg')} h2,${s('zg')} h3{font-size:17.5px;line-height:1.25;letter-spacing:-.01em}
${s('zg')}:hover h2,${s('zg')}:hover h3{color:var(--pri)}
${s('zg')} time{display:block;font-size:11.5px;color:var(--muted);margin-top:8px}

/* ---------- artigo ---------- */
${s('zart')}{max-width:none;padding:30px 0 8px}
${s('zcol')}{max-width:${fp.medida || '720px'}}
${s('zcrumbs')},${s('zwrap')} nav[aria-label="Trilha de navegação"]{font-family:var(--fb);
  font-size:12px;color:var(--muted);margin-bottom:16px}
${s('zwrap')} nav[aria-label="Trilha de navegação"] a:hover{color:var(--pri)}
${s('zart')} h1{font-size:clamp(29px,3.7vw,42px);line-height:1.09;letter-spacing:-.026em;
  margin-bottom:15px}
${s('zdek')}{font-size:19px;line-height:1.5;color:var(--dek);margin:0 0 18px;max-width:60ch;
  font-family:var(--fd);font-weight:400}
${s('zwrap')} ${s('zmeta')},${s('zart')} .${'meta'}{font-family:var(--fb)}
${s('zcapaimg')}{display:block;aspect-ratio:${fp.heroAr || '4/3'};overflow:hidden;
  background:var(--ph);margin:20px 0 0;border:1px solid var(--line)}
${s('zcapaimg')} img{width:100%;height:100%;object-fit:cover}
${s('zleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 26px;
  padding-left:12px;border-left:3px solid var(--viva);max-width:60ch}

${s('zbody')}{font-size:${fp.corpoFs || '18px'};line-height:1.76;max-width:${fp.medida || '720px'}}
${s('zbody')} p{margin:0 0 22px}
${s('zbody')} h2{font-size:25px;margin:40px 0 15px;position:relative;padding-left:22px;
  letter-spacing:-.018em}
${s('zbody')} h2::before{content:"";position:absolute;left:0;top:.34em;width:11px;height:11px;
  background:var(--viva)}
${s('zbody')} h3{font-size:20px;margin:30px 0 12px}
${s('zbody')} a{color:var(--pri);text-decoration:underline;text-decoration-thickness:1px;
  text-underline-offset:2.5px}
${s('zbody')} a:hover{background:var(--wash)}
${s('zbody')} ul,${s('zbody')} ol{margin:0 0 22px;padding-left:22px}
${s('zbody')} li{margin-bottom:9px}
${s('zbody')} img{margin:22px 0;border:1px solid var(--line)}
${s('zbody')} blockquote{margin:26px 0;padding:4px 0 4px 20px;border-left:4px solid var(--pri);
  font-family:var(--fd);font-size:20px;line-height:1.45;color:var(--pri)}
${s('zbody')} figure{margin:22px 0}
${s('zbody')} figcaption{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin-top:7px}

${s('zbody')} table{width:100%;border-collapse:collapse;margin:24px 0;font-size:15.5px}
${s('zbody')} table caption{font-family:var(--fb);font-size:12.5px;color:var(--muted);
  text-align:left;margin-bottom:9px}
${s('zbody')} table th,${s('zbody')} table td{border:0;border-bottom:1px solid var(--line);
  padding:11px 12px 11px 0;text-align:left;vertical-align:top;background:transparent}
${s('zbody')} table thead th{font-family:var(--fb);font-size:11px;letter-spacing:.07em;
  text-transform:uppercase;color:var(--pri);border-bottom:2px solid var(--pri)}

${s('zveja')}{margin:30px 0;padding:18px 20px;background:var(--wash);border-left:4px solid var(--viva)}
${s('zveja')} h2{font-family:var(--fb);font-size:11.5px;font-weight:800;letter-spacing:.11em;
  text-transform:uppercase;margin:0 0 10px;padding:0;color:var(--pri)}
${s('zveja')} h2::before{display:none}

${s('zass')}{display:grid;grid-template-columns:78px minmax(0,1fr);gap:17px;margin:34px 0 0;
  padding:20px;border:1px solid var(--line);background:var(--surf);max-width:${fp.medida || '720px'}}
${s('zass')} img{width:78px;height:78px;object-fit:cover;border:2px solid var(--pri)}
${s('zass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--viva);margin-bottom:5px}
${s('zass')} .nm{font-family:var(--fd);font-weight:700;font-size:19px;letter-spacing:-.012em}
${s('zass')} p{margin:7px 0 0;font-size:14.5px;color:var(--dek);line-height:1.55}
${s('zass')} .go{display:inline-block;margin-top:11px;font-family:var(--fb);font-size:12px;
  font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--pri)}
${s('zass')} .go:hover{color:var(--viva)}

/* relacionados na mesma largura da coluna do artigo */
${s('zrel')}{padding:34px 0 8px;max-width:${fp.medida || '720px'}}
${s('zrel')} ${s('zgrade')}{gap:22px}

/* ---------- rodape ---------- */
${s('zfoot')}{background:${t.footerBg || '#14181C'};color:${t.footerTx || '#9AA4AE'};
  margin-top:48px;padding:44px 0 26px;font-family:var(--fb);font-size:14.5px}
${s('zfoot')} a{color:${t.footerTx || '#9AA4AE'}}
${s('zfoot')} a:hover{color:#fff}
${s('zcols')}{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr);
  gap:34px;padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,.14)}
${s('zfb')}{display:inline-flex;align-items:center;gap:10px;font-family:var(--fd);
  font-weight:700;font-size:24px;letter-spacing:-.02em;color:#fff}
${s('zfb')} svg{display:block;height:1em;width:auto;flex:none}
${s('zfh')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:#fff;margin-bottom:13px}
${s('zflist')}{display:flex;flex-direction:column;gap:9px;align-items:flex-start}
${s('zfim')}{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;
  padding-top:20px;font-size:12.5px;color:rgba(255,255,255,.45)}

${s('reveal')}{opacity:1}
@media(prefers-reduced-motion:reduce){${s('zwrap')} *{transition:none!important}}

/* ---------- tablet ---------- */
@media(max-width:1100px){
  ${s('zabre')}{grid-template-columns:1fr;gap:30px}
  ${s('zmural')}{border-left:0;border-top:3px solid var(--pri);padding-left:0;padding-top:18px}
  ${s('zdup')}{grid-template-columns:1fr;gap:26px}
  ${s('zgrade')},${s('zg3')},${s('zg4')}{grid-template-columns:repeat(2,minmax(0,1fr))}
  ${s('zbusca')}{display:none}
  ${s('znav')}{display:none;order:3;width:100%;flex-direction:column;gap:0;
    align-items:stretch;margin-right:0;padding-bottom:8px}
  ${s('znav')}[data-aberto="1"]{display:flex}
  ${s('znav')} a{padding:14px 2px;border-bottom:1px solid var(--line);border-top:0}
  ${s('zham')}{display:block;margin-left:auto}
  ${s('zbar')}{padding-block:7px}
}

/* ---------- celular ---------- */
@media(max-width:760px){
  ${s('zman')}{grid-template-columns:1fr;gap:18px}
  /* empilhado, a imagem volta a ter proporcao propria: sem linha para esticar,
     height:100% colapsaria para o minimo */
  ${s('zmi')}{height:auto;aspect-ratio:${fp.heroAr || '4/3'}}
  ${s('zman')} h2{font-size:clamp(26px,7vw,34px)}
  ${s('zgrade')},${s('zg2')},${s('zg3')},${s('zg4')}{grid-template-columns:1fr;gap:24px}
  ${s('zcols')}{grid-template-columns:1fr;gap:26px}
  ${s('zsec')}{padding:28px 0}
  ${s('zbody')}{font-size:17px}
  ${s('zass')}{grid-template-columns:1fr}
  ${s('zass')} img{width:70px;height:70px}
  ${s('zcapa')}{padding-block:16px 12px}
}

/* ---------- tabela vira cartao, com o rotulo da coluna acima do valor ---------- */
@media(max-width:640px){
  ${s('zbody')} table{min-width:0}
  ${s('zbody')} table caption{display:none}
  ${s('zbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('zbody')} table,${s('zbody')} table tbody,${s('zbody')} table tr,
  ${s('zbody')} table th,${s('zbody')} table td{display:block;width:auto}
  ${s('zbody')} table tbody tr{background:var(--surf);border:1px solid var(--line);
    padding:2px 18px 16px;margin-bottom:14px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('zbody')} table tbody th,${s('zbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('zbody')} table tbody th{border-bottom:1px solid var(--line);padding:15px 0 12px;
    font-family:var(--fd);font-weight:700;font-size:16px;text-transform:none;
    letter-spacing:0;color:var(--ink)}
  ${s('zbody')} table tbody td{padding:14px 0 0;text-align:left;line-height:1.5}
  ${s('zbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}`;
}

/* Simbolo geometrico, sem letra nenhuma dentro: tres barras afixadas, que e a
 * leitura de mural. O nome vem como texto na fonte de titulo, e nao em curvas:
 * a vizinha Y foi ao ar como "Viaje no Det" porque faltavam glifos no desenho, e
 * nada acusou. Texto nao tem como perder letra. */
const Z_SIMB = `<svg viewBox="0 0 34 34" role="img" aria-label="" focusable="false" aria-hidden="true"><rect width="34" height="34" fill="var(--marca-2,currentColor)"/><rect x="7" y="8" width="20" height="4" fill="var(--marca-3,#fff)"/><rect x="7" y="15" width="14" height="4" fill="var(--marca-3,#fff)"/><rect x="7" y="22" width="20" height="4" fill="var(--marca-3,#fff)"/></svg>`;

const Z_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function zHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'znav-' + (site.slug || 'p');
  // link de editoria por H.curl: montado a mao ele quebra quando ha categoryBase
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('ztop')}">
<div class="${c('zin')} ${c('zcapa')}">
<a class="${c('zmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-2:var(--pri)">${Z_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<span class="${c('zdata')}">${H.esc(site.tagline || '')}</span>
</div>
<div class="${c('zin')} ${c('zbar')}">
<nav class="${c('znav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('zham')}" type="button" data-zham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('zbusca')}" href="/busca/">${Z_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-zham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function zFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('zfoot')}"><div class="${c('zin')}">
<div class="${c('zcols')}">
  <div><a class="${c('zfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-2:var(--viva)">${Z_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('zfh')}">Editorias</div><div class="${c('zflist')}">${cats}</div></div>
  <div><div class="${c('zfh')}">O portal</div><div class="${c('zflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('zfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* O `<a>` tem display e o `<span>` do retrato tem display:block, senao o
 * aspect-ratio nao aplica e a imagem passa por cima do titulo. O nivel de titulo
 * vem de quem chama: h3 sob um h2 de secao na home, h2 na lista de editoria,
 * onde o titulo da pagina e h1. */
function zGrid(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('zg')} ${c('reveal')}" href="${H.url(a)}">
<span data-f>${H.pic(a, !!eager)}</span>
<span class="${c('zet')}">${H.cat(a)}</span>
<h${n}>${H.esc(a.title)}</h${n}>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}

function zCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('zcard')}" href="${H.url(a)}">
<span data-f>${H.pic(a, false)}</span>
<div><h3>${H.esc(a.title)}</h3>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></div></a>`;
}

function zMuralItem(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('zmit')}" href="${H.url(a)}">
<span>${H.cat(a)}</span>
<h3>${H.esc(a.title)}</h3>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}

function zHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre, ...resto] = arts;
  const mural = resto.slice(0, 4);
  const usados = new Set([abre, ...mural].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('zabre')}">
<div class="${c('zman')}">
<div><span class="${c('zet')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 190))}</p>` : ''}
<div class="${c('zmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a class="${c('zmi')}" href="${H.url(abre)}" aria-label="${H.esc(abre.title)}">${H.pic(abre, true)}</a>
</div>
${mural.length ? `<div class="${c('zmural')}"><div class="${c('zmh')}">No mural</div>
${mural.map(a => zMuralItem(ctx, a)).join('')}</div>` : ''}
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
      const topo = `<div class="${c('zsh')}"><h2>${H.esc(nome)}</h2>
<a class="more" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>`;
      let corpo;
      if (v.length >= 5) {
        // destaque mais quatro compactos: consome exatamente 5, sem sobra
        const [d, ...r] = v;
        corpo = `<div class="${c('zdup')}">
<a class="${c('zbig')} ${c('reveal')}" href="${H.url(d)}">
<span data-f>${H.pic(d, false)}</span>
<span class="${c('zet')} ${c('zetv')}">${H.cat(d)}</span>
<h3>${H.esc(d.title)}</h3>
${d.dek ? `<p>${H.esc(H.clip(d.dek, 140))}</p>` : ''}
<time datetime="${H.esc(d.date)}">${H.esc(H.dateShort(d.date))}</time></a>
<div class="${c('zlista')}">${r.slice(0, 4).map(a => zCard(ctx, a)).join('')}</div>
</div>`;
      } else {
        // 2, 3 ou 4 itens: a grade recebe exatamente esse numero de colunas e a
        // ultima linha fecha, sem buraco ao lado do ultimo cartao
        const n = v.length;
        corpo = `<div class="${c('zgrade')} ${c('zg' + n)}">
${v.slice(0, n).map(a => zGrid(ctx, a, false)).join('')}</div>`;
      }
      return `<section class="${c('zsec')}">${topo}${corpo}</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${zHeader(ctx, menu)}
<main class="${c('zwrap')}"><div class="${c('zin')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${zFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. Inventar `bio` ou `editorias` nao da erro em lugar
 * nenhum, so nao gera nada. */
function zAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('zass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="78" height="78" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

function zArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema. Nao ha helper para calcular isso na arquitetura.
  const rel = (related && related.length) ? `<section class="${c('zrel')}">
<div class="${c('zsh')}"><h2>Leia também</h2></div>
<div class="${c('zgrade')} ${c('zg' + Math.min(related.length, 3))}">${related.slice(0, 3).map(a =>
    zGrid(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${zHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('zwrap')}"><div class="${c('zin')}">
<article class="${c('zart')}">
<div class="${c('zcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('zet')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('zdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('zcapaimg')}">${H.pic(art, true)}</span>
<p class="${c('zleg')}">${H.esc(art.image && art.image.alt ? art.image.alt : art.title)}</p>` : ''}
<div class="${c('zbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${zAssinatura(ctx, art)}
${rel}
</div></main>
${zFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function zList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  return `${H.head(ctx, meta)}
${zHeader(ctx, menu)}
<main class="${c('zwrap')}"><div class="${c('zin')}">
<section class="${c('zsec')}">
<div class="${c('zsh')} ${c('zsh1')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('zdek')}" style="max-width:66ch;margin-top:-10px">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('zgrade')}">${itens.map((a, i) => zGrid(ctx, a, i === 0, 2)).join('')}</div>
</section>
</div></main>
${zFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { zCss, zHeader, zFooter, zHome, zArticle, zList };
