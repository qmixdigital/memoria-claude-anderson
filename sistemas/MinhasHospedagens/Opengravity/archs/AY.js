/*
 * Arquitetura AY, arquetipo ESCUDO. Feita para o saudeemalta.net.br.
 *
 * ## De onde vem o desenho
 *
 * A marca do Saude em Alta e **so simbolo, sem palavra**: um escudo vermelho com
 * a linha de batimento cardiaco atravessando, contornado de azul, com uma folha
 * verde saindo do canto de baixo. Nao existe wordmark, entao o cabecalho
 * desenha o simbolo e escreve o nome ao lado.
 *
 * O gesto que sai dai e a **ponta do escudo**: uma faixa que fecha em bico para
 * baixo. Ela aparece no cabecalho de cada editoria e no pe da foto de abertura
 * do artigo, por `clip-path`.
 *
 * ## O que a diferencia das 50 vizinhas da opengravity
 *
 *   - **faixa em bico** por `clip-path` no rotulo de editoria e no pe da foto de
 *     abertura. Nenhuma das 50 corta forma com clip-path
 *   - **lista sem miniatura**: depois da materia de abertura vem uma lista densa
 *     so de manchetes, com marcador em bico. A AV usa dois cartoes grandes, a AW
 *     linha com miniatura, a AX lista numerada
 *   - **materia de abertura horizontal**, foto a direita, com o bico no pe
 *   - **Hepta Slab e Prompt**: nenhuma das duas esta nas 86 familias em uso
 *   - vermelho-escudo com verde-folha, tirados dos pixels do simbolo
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **Este portal e PLANO e a listagem mora em `/categoria/<slug>/`, em
 * portugues.** E o inverso dos vizinhos saudeacessivel e saudicas, cujo
 * `category_base` estava vazio e por isso responde em ingles. Copiar a
 * configuracao de um para o outro poe a editoria inteira em 404. Como tudo
 * divide a raiz, **slug podado colide com pagina que o motor regenera**:
 * contato, politica-de-privacidade, termos-de-uso e quem-somos ficam fora do 410.
 *
 * ⚠️ **`clip-path` no pe da foto come altura de verdade.** O `padding-bottom` do
 * bloco seguinte tem que compensar o bico, senao o texto sobe para dentro do
 * corte.
 *
 * ⚠️ **A marca nao tem wordmark**, entao o `logoImg` da origem e apenas o
 * simbolo: o nome do portal continua sendo texto ao lado dele, e nao pode sumir
 * quando o arquivo existe.
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

function ayCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#F6F1EF';
  const viva = t.vivid || '#3C7A1E';
  const canto = fp.radius === 'sharp' ? '0' : '4px';
  const bico = 'polygon(0 0,100% 0,100% calc(100% - 26px),50% 100%,0 calc(100% - 26px))';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--tinta:${t.tinta || t.primary};--sob:${t.onPrimary || '#fff'};
  --footer-bg:${t.footerBg || '#3A0D08'};--footer-tx:${t.footerTx || '#E6CFCB'};
  --fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('aywrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.7;-webkit-font-smoothing:antialiased}
${s('aywrap')} *{box-sizing:border-box}
${s('ayin')}{max-width:${fp.container || '1140px'};margin:0 auto;padding:0 24px;width:100%}
${s('aywrap')} h1,${s('aywrap')} h2,${s('aywrap')} h3,${s('aywrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.002em;line-height:1.16;margin:0}
${s('aywrap')} a{color:inherit;text-decoration:none}
${s('aywrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho ---------- */
${s('aytop')}{background:var(--paper);border-bottom:1px solid var(--line);
  box-shadow:inset 0 -5px 0 var(--pri)}
${s('aybar')}{display:flex;align-items:center;gap:18px;padding-block:15px 19px;flex-wrap:wrap}
${s('aymarca')}{display:inline-flex;align-items:center;gap:12px;font-family:var(--fd);
  font-weight:800;font-size:clamp(21px,2.7vw,29px);letter-spacing:-.01em;color:var(--pri);flex:none}
${s('aymarca')} svg{display:block;height:1.35em;width:auto;flex:none;align-self:center}
/* o simbolo da origem nao tem palavra: a imagem entra ao lado do nome, nunca no
   lugar dele. Imagem sem medida derruba o CLS */
${s('aymarca')} img{display:block;height:46px;width:auto;flex:none}
@media(max-width:560px){${s('aymarca')} img{height:36px}}
${s('ayfb')} img{display:block;height:42px;width:auto}
/* ⚠️ com oito editorias o botao Buscar quebrava para a segunda linha e o
   cabecalho ficava com duas alturas. O menu encolhe, o botao fica */
${s('aynav')}{display:flex;gap:15px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
@media(min-width:1101px){${s('aynav')} a{font-size:11.5px;letter-spacing:.02em}}
${s('aynav')} a{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.03em;
  text-transform:uppercase;color:var(--dek);transition:color .2s ease}
${s('aynav')} a:hover{color:var(--pri)}
${s('aybusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
  background:var(--pri);color:var(--sob);padding:10px 17px;border-radius:${canto};
  flex:none;margin-left:6px}
${s('aybusca')}:hover{background:var(--viva)}
${s('ayham')}{display:none;width:46px;height:46px;border:2px solid var(--pri);background:none;
  cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('ayham')} i,${s('ayham')} i::before,${s('ayham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--pri);content:""}
${s('ayham')} i{top:21px}
${s('ayham')} i::before{top:-6px;left:0}
${s('ayham')} i::after{top:6px;left:0}
@media(max-width:560px){${s('aymarca')}{font-size:19px;gap:9px}${s('aybar')}{gap:11px}
  ${s('aybusca')}{font-size:10.5px;padding:9px 13px;gap:6px}}
@media(max-width:1100px){
  ${s('ayham')}{display:block;order:2}
  ${s('aybusca')}{order:3;margin-left:0}
  ${s('aynav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:14px}
  ${s('aynav')}[data-aberto="1"]{display:flex}
  ${s('aynav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink);
    font-size:13.5px}
}

/* ---------- abertura: texto a esquerda, imagem a direita ---------- */
${s('ayabre')}{display:grid;grid-template-columns:1.05fr 1fr;gap:42px;align-items:center;
  padding-block:38px 34px;border-bottom:1px solid var(--line)}
${s('ayabre')} h2{font-size:clamp(30px,4.2vw,50px);line-height:1.06;margin:14px 0 0;
  letter-spacing:-.014em}
${s('ayabre')} h2 a:hover{color:var(--pri)}
${s('ayabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('aymm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:18px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('aymm')} b{color:var(--ink);font-weight:700}
${s('aychap')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:.13em;text-transform:uppercase;color:var(--sob);background:var(--pri);
  padding:6px 14px;border-radius:${canto}}
${s('aychap')} a{color:var(--sob)}
@media(max-width:820px){${s('ayabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 24px}}

/* ---------- secao: rotulo em faixa de bico ---------- */
${s('aysec')}{padding-block:42px;background:var(--paper)}
${s('aysec')}[data-par="1"]{background:var(--wash)}
${s('aycab')}{display:flex;align-items:flex-start;gap:16px;margin-bottom:26px;flex-wrap:wrap}
/* a faixa fecha em bico para baixo: e a ponta do escudo da marca. O bico come
   altura de verdade, entao o padding de baixo compensa */
${s('aycab')} h1,${s('aycab')} h2{font-family:var(--fd);font-weight:800;
  font-size:clamp(18px,2.1vw,25px);letter-spacing:.004em;text-transform:uppercase;
  color:var(--sob);margin:0;line-height:1.1;flex:none;background:var(--pri);
  padding:11px 24px 34px;clip-path:${bico}}
${s('aymais')}{margin-left:auto;margin-top:10px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--viva);flex:none;
  border-bottom:2px solid var(--viva);padding-bottom:3px}
${s('aymais')}:hover{color:var(--pri);border-bottom-color:var(--pri)}
${s('aydescr')}{margin:0 0 26px;font-size:15.5px;line-height:1.66;color:var(--dek);
  max-width:72ch;text-align:left}

/* materia de abertura da secao: texto a esquerda, foto a direita com bico no pe */
${s('aydest')}{display:grid;grid-template-columns:1fr 1.02fr;gap:32px;align-items:center}
${s('aydest')} ${s('ayti')}{font-size:clamp(21px,2.5vw,30px);line-height:1.14;margin-top:11px;
  letter-spacing:-.01em}
${s('aykick')}{display:inline-block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.13em'};text-transform:uppercase;color:var(--viva)}
${s('ayti')}{display:block;font-family:var(--fd);font-weight:700;font-size:19px;line-height:1.22;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('aydd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.62;color:var(--dek);
  max-width:56ch;text-align:left}
${s('aydt')}{display:block;margin-top:9px;font-family:var(--fb);font-size:11.5px;color:var(--muted)}
${s('ayfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('ayfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '4/3'};overflow:hidden}
${s('ayfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('aydest')}:hover ${s('ayti')}{color:var(--pri)}
${s('aydest')}:hover ${s('ayfoto')} [data-f] img{transform:scale(1.04)}
@media(max-width:780px){${s('aydest')}{grid-template-columns:1fr;gap:16px}
  ${s('aydest')} ${s('ayfoto')}{order:-1}}

/* a lista: densa, so manchete, com marcador em bico. Sem miniatura de proposito */
${s('aylista')}{margin-top:32px;border-top:2px solid var(--pri);
  display:grid;grid-template-columns:1fr 1fr;gap:0 44px;
  grid-auto-flow:column;grid-template-rows:repeat(var(--l,3),auto)}
${s('ayrow')}{display:grid;grid-template-columns:auto minmax(0,1fr);gap:13px;align-items:start;
  padding-block:15px;border-bottom:1px solid var(--line)}
${s('ayrow')}::before{content:"";width:11px;height:13px;margin-top:6px;flex:none;
  background:var(--viva);clip-path:polygon(0 0,100% 0,100% 58%,50% 100%,0 58%)}
${s('ayrow')}:hover::before{background:var(--pri)}
${s('ayrow')}:hover ${s('ayti')}{color:var(--pri)}
${s('ayrow')} ${s('ayti')}{font-size:17px;line-height:1.28}
${s('ayrow')} ${s('aydd')}{display:none}
@media(max-width:820px){
  ${s('aylista')}{grid-template-columns:1fr;grid-auto-flow:row;grid-template-rows:none;
    gap:0;margin-top:26px}
}

/* listagem de editoria e relacionados: grade de tres cartoes empilhados */
${s('aygrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 28px}
${s('aygrade')} ${s('aydest')}{display:block}
${s('aygrade')} ${s('ayti')}{font-size:19px;line-height:1.24;margin-top:11px}
${s('aygrade')} ${s('aydd')}{display:none}
${s('aygrade')} ${s('ayfoto')} [data-f]{aspect-ratio:${fp.cardAr || '16/10'}}
@media(max-width:900px){${s('aygrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:600px){${s('aygrade')}{grid-template-columns:1fr;gap:28px}}

/* ---------- artigo ---------- */
${s('ayart')}{padding-block:30px 12px}
${s('aycol')}{max-width:70ch}
${s('ayart')} h1{font-size:clamp(28px,4vw,44px);line-height:1.1;letter-spacing:-.016em;
  margin:14px 0 0}
${s('aydek')}{font-size:19px;line-height:1.55;color:var(--dek);margin:16px 0 0;max-width:62ch}
/* o bico no pe da foto de abertura: o padding do bloco seguinte compensa a
   altura comida pelo corte */
${s('ayhero')}{display:block;overflow:hidden;background:var(--ph);margin-top:26px;
  clip-path:${bico}}
${s('ayhero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('ayhero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('ayleg')}{margin:6px 0 0;font-size:12.5px;line-height:1.5;color:var(--muted);
  max-width:70ch;text-align:left}
${s('aybody')}{max-width:70ch;margin-top:22px;font-size:${fp.corpoFs || '18px'};line-height:1.8}
${s('aybody')} p{margin:0 0 21px}
${s('aybody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:3px}
${s('aybody')} a:hover{color:var(--viva)}
${s('aybody')} h2{font-family:var(--fd);font-weight:800;font-size:25px;letter-spacing:-.008em;
  margin:36px 0 12px;color:var(--pri);padding-bottom:8px;border-bottom:2px solid var(--line)}
${s('aybody')} h3{font-family:var(--fd);font-weight:700;font-size:20px;margin:28px 0 10px}
${s('aybody')} ul,${s('aybody')} ol{margin:0 0 21px;padding-left:22px}
${s('aybody')} li{margin:0 0 9px}
${s('aybody')} img{max-width:100%;height:auto;border-radius:${canto};margin:8px 0}
${s('aybody')} figure{margin:22px 0}
${s('aybody')} figcaption{font-size:12.5px;color:var(--muted);margin-top:8px}
${s('aybody')} blockquote{margin:28px 0;padding:4px 0 4px 22px;border-left:5px solid var(--pri);
  font-family:var(--fd);font-size:21px;line-height:1.44}
${s('aybody')} table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}
${s('aybody')} th,${s('aybody')} td{border:0;border-bottom:1px solid var(--line);
  padding:11px 12px 11px 0;text-align:left;vertical-align:top}
${s('aybody')} th{font-family:var(--fb);font-weight:700;background:transparent}
${s('aybody')} caption{text-align:left;font-size:13px;color:var(--muted);padding-bottom:8px}

/* a tabela vira cartao no celular: sem isto ela sai da tela e o gesto de
   arrastar nao e descoberto. O thead sai da tela mas continua no DOM */
@media(max-width:640px){
  ${s('aybody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('aybody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('aybody')} table caption{display:none}
  ${s('aybody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;
    clip:rect(0 0 0 0)}
  ${s('aybody')} table tbody,${s('aybody')} table tr,
  ${s('aybody')} table th,${s('aybody')} table td{display:block;width:auto}
  ${s('aybody')} table tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:12px;padding:2px 18px 16px;margin-bottom:13px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('aybody')} table tbody th,${s('aybody')} table tbody td{border:0;background:transparent;
    padding:0}
  ${s('aybody')} table tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;
    font-weight:700;text-align:left}
  ${s('aybody')} table tbody td{padding:13px 0 0;text-align:left;line-height:1.55}
  ${s('aybody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);
    margin-bottom:2px}
}

${s('ayass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:start;
  max-width:70ch;margin-top:38px;padding:20px;background:var(--wash);border-radius:${canto};
  border-left:5px solid var(--pri)}
${s('ayass')} img{border-radius:${canto}}
${s('ayass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--viva)}
${s('ayass')} .nm{display:block;font-family:var(--fd);font-weight:700;font-size:19px;margin-top:4px}
${s('ayass')} p{margin:8px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek)}
${s('ayass')} .go{display:inline-block;margin-top:10px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--pri);
  border-bottom:2px solid var(--pri);padding-bottom:2px}
@media(max-width:560px){${s('ayass')}{grid-template-columns:1fr;gap:12px}}

/* relacionados com a MESMA largura da coluna do artigo */
${s('ayrel')}{max-width:70ch;margin-top:44px;padding-top:24px;border-top:2px solid var(--pri)}
${s('ayrotb')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.13em;text-transform:uppercase;color:var(--sob);background:var(--pri);
  padding:8px 18px 22px;clip-path:${bico};margin-bottom:14px}
${s('ayrel')} ${s('aygrade')}{grid-template-columns:1fr 1fr;gap:26px 22px}
@media(max-width:600px){${s('ayrel')} ${s('aygrade')}{grid-template-columns:1fr}}

/* ---------- rodape ---------- */
${s('ayfoot')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:56px;
  padding-block:38px 22px}
${s('aycols')}{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:34px}
${s('ayfoot')} p{font-size:14.5px;color:var(--footer-tx)}
${s('ayfb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:800;font-size:23px;letter-spacing:-.01em;color:#fff}
${s('ayfh')}{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:#fff;margin-bottom:12px}
${s('ayflist')} a{display:block;font-size:14.5px;padding:4px 0;color:var(--footer-tx)}
${s('ayflist')} a:hover{color:#fff}
${s('ayfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:28px;padding-top:15px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12.5px;opacity:.85}
@media(max-width:820px){${s('aycols')}{grid-template-columns:1fr;gap:26px}}

${s('reveal')}{opacity:1}
@media(prefers-reduced-motion:reduce){
  ${s('aywrap')} *{transition:none !important;animation:none !important}
}`;
}

/* O escudo da marca, desenhado. Ele acompanha o nome mesmo quando existe arquivo
 * de logotipo, porque o arquivo da origem e SO o simbolo, sem palavra. */
const AY_SIMB = `<svg viewBox="0 0 26 30" width="26" height="30" aria-hidden="true">
<path d="M13 1 2 5v11c0 7 5 11.4 11 13 6-1.6 11-6 11-13V5Z" fill="var(--marca-1,#B81C10)"/>
<path d="M13 1 2 5v11c0 7 5 11.4 11 13 6-1.6 11-6 11-13V5Z" fill="none"
  stroke="var(--marca-3,#124A80)" stroke-width="2"/>
<path d="M6 15h3.4l2-4.2 2.6 8 2.2-5.4 1.4 1.6H20" fill="none" stroke="#fff"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 20c0 4-3.6 7.4-7.6 8.6 1-4.4 4-7.6 7.6-8.6Z" fill="var(--marca-2,#3C7A1E)"/>
</svg>`;

const AY_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function ayHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'aynav-' + (site.slug || 'p');
  // 🔴 aqui a listagem e /categoria/<slug>/, em PORTUGUES, ao contrario dos
  // vizinhos saudeacessivel e saudicas. Quem monta o caminho e o H.curl
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('aytop')}">
<div class="${c('ayin')} ${c('aybar')}">
<a class="${c('aymarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial">${site.logoImg
    ? `<img src="${site.logoImg}" alt="" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : AY_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<nav class="${c('aynav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('ayham')}" type="button" data-ayham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('aybusca')}" href="/busca/">${AY_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-ayham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function ayFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('ayfoot')}"><div class="${c('ayin')}">
<div class="${c('aycols')}">
  <div><a class="${c('ayfb')}" href="/" aria-label="${H.esc(site.name)}">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : AY_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('ayfh')}">Editorias</div><div class="${c('ayflist')}">${cats}</div></div>
  <div><div class="${c('ayfh')}">O portal</div><div class="${c('ayflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('ayfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* Materia de abertura: texto a esquerda, foto a direita. Dentro da grade de tres
 * o CSS troca para empilhado, e o mesmo cartao serve nos dois lugares. */
function ayDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('aydest')} ${c('reveal')}" href="${H.url(a)}">
<span><span class="${c('aykick')}">${H.cat(a)}</span>
<h${n} class="${c('ayti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('aydd')}">${H.esc(H.clip(a.dek, 180))}</span>` : ''}
<span class="${c('aydt')}">${H.esc(H.dateShort(a.date))}</span></span>
<span class="${c('ayfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
</a>`;
}

/* Linha densa, so manchete, com marcador em bico. Sem miniatura de proposito. */
function ayLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('ayrow')} ${c('reveal')}" href="${H.url(a)}">
<span><span class="${c('aykick')}">${H.cat(a)}</span>
<h${n} class="${c('ayti')}">${H.esc(a.title)}</h${n}>
<span class="${c('aydt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function ayHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('ayabre')}">
<div><span class="${c('aychap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('aymm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('ayfoto')}">
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
      const lista = resto.slice(0, 8);
      // o numero de linhas vai no style: cravado no CSS a grade volta a
      // preencher por linha e a data pula ao ler descendo a coluna
      const linhas = Math.max(1, Math.ceil(lista.length / 2));
      return `<section class="${c('aysec')}" data-par="${idx % 2}">
<div class="${c('ayin')}">
<div class="${c('aycab')}"><h2>${H.esc(nome)}</h2>
<a class="${c('aymais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${ayDestaque(ctx, d, idx === 0)}
${lista.length ? `<div class="${c('aylista')}" style="--l:${linhas}">${lista.map(a => ayLinha(ctx, a)).join('')}</div>` : ''}
</div></section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${ayHeader(ctx, menu)}
<main class="${c('aywrap')}">
<div class="${c('ayin')}">${H.h1(ctx)}
${abertura}</div>
${secoes}
</main>
${ayFooter(ctx, menu)}
${H.bodyEnd()}`;
}

function ayAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('ayass')}">
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
function ayLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const chato = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const cSlug = chato(art.slug), cAlt = chato(alt);
  const pref = cAlt.length >= 25 && (cSlug.indexOf(cAlt) === 0 || cAlt.indexOf(cSlug) === 0);
  if (!alt || cAlt === chato(t) || cAlt === cSlug || pref) return '';
  return `<p class="${c('ayleg')}">${H.esc(alt)}</p>`;
}

/* A linha fina do artigo so aparece quando NAO esta no corpo. A limpeza da
 * importacao tira a frase do proprio texto quando o `excerpt` da origem vem
 * vazio, o que salva o cartao da home; aqui o mesmo campo seria repeticao. */
function ayDekVale(art) {
  const d = String(art.dek || '').trim();
  if (!d) return false;
  const nu = (x) => String(x || '').toLowerCase().replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const chave = nu(d).slice(0, 60);
  return !!chave && nu(art.content).indexOf(chave) < 0;
}

function ayArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  const rel = (related && related.length) ? `<section class="${c('ayrel')}">
<h2 class="${c('ayrotb')}">Leia também</h2>
<div class="${c('aygrade')}">${related.slice(0, 4).map(a => ayDestaque(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${ayHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('aywrap')}"><div class="${c('ayin')}">
<article class="${c('ayart')}">
<div class="${c('aycol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('aychap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${ayDekVale(art) ? `<p class="${c('aydek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('ayhero')}"><span data-f>${H.pic(art, true)}</span></span>
${ayLegenda(ctx, art)}` : ''}
<div class="${c('aybody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${ayAssinatura(ctx, art)}
${rel}
</div></main>
${ayFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function ayList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  // a grade pula o destaque, e nao o repete: `resto`, nunca `itens`
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${ayHeader(ctx, menu)}
<main class="${c('aywrap')}">
<section class="${c('aysec')}" data-par="0"><div class="${c('ayin')}">
<div class="${c('aycab')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('aydescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? ayDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('aygrade')}" style="margin-top:34px">${resto.map(a => ayDestaque(ctx, a, false, 2)).join('')}</div>` : ''}
</div></section>
</main>
${ayFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { ayCss, ayHeader, ayFooter, ayHome, ayArticle, ayList };
