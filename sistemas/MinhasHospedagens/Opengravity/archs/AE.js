/*
 * Arquitetura AE, arquetipo SUMARIO. Feita para o revistadeducao.com.br.
 *
 * ## De onde vem o desenho
 *
 * O nome e de revista e o acervo preservado puxa para negocio, investimento e
 * dica pratica. O desenho pega o gesto de **sumario de revista**: a editoria nao
 * fica em cima do bloco, fica **numa coluna estreita a esquerda**, ao lado das
 * materias dela, como o indice impresso que lista a secao na margem.
 *
 * ## O que a diferencia das 30 vizinhas da opengravity
 *
 *   - **rotulo de secao na margem esquerda**, e nao acima do bloco. Todas as
 *     vizinhas poem o nome da editoria em cima, com filete: `AB`, `AC`, `AD`, e
 *     as antigas. Aqui a pagina inteira le como um sumario, e nao como uma pilha
 *     de secoes
 *   - **ficha horizontal**: miniatura a esquerda e texto a direita, com filete
 *     embaixo. A `AD` usa capa em retrato, a `AC` linha numerada, a `AB` grade
 *     com tarja
 *   - **Faustina e Sora**: nenhum portal da rede usa qualquer uma das duas
 *   - **ardosia com ambar**: as vizinhas ja ocupam grafite, marinho, esmeralda,
 *     violeta, ocre, vinho, cobalto, terracota, petroleo, carmim, lima,
 *     turquesa, azul-ferrugem, azul-royal, sepia, indigo e verde
 *   - **sem grade em nenhum caminho**: home, editoria e relacionados sao listas,
 *     entao nunca sobra buraco na ultima linha e a data nunca pula de coluna
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **Este portal tem `categoryBase`.** O arquivo de editoria mora em
 * `/categoria/<slug>/` e o artigo em `/<editoria>/<slug>/`. Montar o link de
 * editoria a mao com `/${slug}/` derruba **o menu do topo, o menu do rodape, o
 * rotulo de cada secao e o chapeu de cada artigo**, tudo em 404, e nao aparece em
 * print nenhum porque o menu fica bonito e so quebra no clique. Todo link de
 * editoria aqui sai de `H.curl(slug)`, sem excecao.
 *
 * ## O que o checklist exige e esta aqui
 *
 *   - link de editoria por `H.curl(slug)`, nunca montado a mao
 *   - menu sanfonado abaixo de 1100px, com aria-expanded, aria-controls e rotulo
 *     que muda ao abrir
 *   - todo `span` com aspect-ratio tem `display:block`, e o `a` da ficha tem
 *     `display`
 *   - body aberto no cabecalho e `H.bodyEnd()` nos tres caminhos de pagina
 *   - nada centralizado alem da marca, e a chamada de abertura tem texto a
 *     esquerda e imagem a direita
 *   - lista de editoria abre em h1, e a ficha dela sobe para h2
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 *
 * ## Defeitos de vizinhas que aqui ja nascem resolvidos
 *
 *   - as variaveis de cor vao no `:root`, e nao no seletor do elemento principal
 *   - o respiro lateral usa `padding-block`, nunca `padding` completo
 *   - nenhuma crase e nenhum cifrao com chave dentro de comentario do CSS: o CSS
 *     mora num template literal, a crase o fecha e a chave interpola de verdade
 *   - titulo e linha fina saem escapados por `H.esc`, entao tag que tenha
 *     sobrado no dado apareceria: a limpeza tira antes, na Fase 7
 */

function aeCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#E7E3DB';
  const viva = t.vivid || '#D97A2B';
  return `
:root{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --viva:${viva};--sob:${t.onPrimary || '#fff'};--fd:${t.fontDisplay};--fb:${t.fontBody}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb)}

${s('aewrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.72;-webkit-font-smoothing:antialiased}
${s('aewrap')} *{box-sizing:border-box}
${s('aein')}{max-width:${fp.container || '1180px'};margin:0 auto;padding:0 24px;width:100%}
${s('aewrap')} h1,${s('aewrap')} h2,${s('aewrap')} h3,${s('aewrap')} h4{font-family:var(--fd);
  font-weight:600;letter-spacing:-.008em;line-height:1.2;margin:0}
${s('aewrap')} a{color:inherit;text-decoration:none}
${s('aewrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho: marca a esquerda, navegacao a direita ---------- */
${s('aetop')}{background:var(--paper);border-bottom:1px solid var(--line)}
${s('aebar')}{display:flex;align-items:center;gap:20px;padding-block:20px 18px;flex-wrap:wrap}
${s('aemarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:clamp(24px,3vw,32px);letter-spacing:-.016em;color:var(--ink);
  flex:none}
${s('aemarca')} svg{display:block;height:.94em;width:auto;flex:none;align-self:center}
${s('aenav')}{display:flex;gap:12px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('aenav')} a{font-family:var(--fb);font-size:11px;font-weight:600;letter-spacing:.04em;
  text-transform:uppercase;color:var(--muted);transition:color .2s ease}
${s('aenav')} a:hover{color:var(--pri)}
${s('aebusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
  background:var(--pri);color:var(--sob);padding:9px 13px;flex:none;margin-left:10px}
${s('aeham')}{display:none;width:46px;height:46px;border:1px solid var(--line);background:none;
  cursor:pointer;padding:0;position:relative}
${s('aeham')} i,${s('aeham')} i::before,${s('aeham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--ink);content:""}
${s('aeham')} i{top:22px}
${s('aeham')} i::before{top:-6px;left:0}
${s('aeham')} i::after{top:6px;left:0}
/* num celular de 360 a 412px a marca, o botao de menu e o de busca somados
   passam da largura, e o de busca cai sozinho numa segunda linha. A folga sai
   de marca menor e botao com menos respiro, e nao de esconder o rotulo */
@media(max-width:560px){
  ${s('aemarca')}{font-size:21px;gap:8px}
  ${s('aebar')}{gap:12px}
  ${s('aebusca')}{font-size:10.5px;padding:9px 11px;gap:6px}
}
@media(max-width:1100px){
  ${s('aeham')}{display:block;order:2}
  ${s('aebusca')}{order:3;margin-left:0}
  ${s('aenav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid var(--line);margin-top:15px}
  ${s('aenav')}[data-aberto="1"]{display:flex}
  ${s('aenav')} a{width:100%;padding:13px 0;border-bottom:1px solid var(--line);color:var(--ink)}
}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('aeabre')}{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;
  padding-block:40px 36px;border-bottom:1px solid var(--line)}
${s('aeabre')} h2{font-size:clamp(30px,4.2vw,48px);letter-spacing:-.02em;line-height:1.1;
  margin:12px 0 0;font-weight:700}
${s('aeabre')} p{font-size:17.5px;line-height:1.64;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('aemm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:18px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('aemm')} b{color:var(--ink);font-weight:700}
@media(max-width:820px){${s('aeabre')}{grid-template-columns:1fr;gap:22px}}

/* ---------- a secao com rotulo na margem, que e a assinatura desta arquitetura ---------- */
${s('aesec')}{display:grid;grid-template-columns:210px minmax(0,1fr);gap:34px;
  padding-block:34px;border-bottom:1px solid var(--line)}
${s('aerot')}{position:relative;padding-top:4px}
${s('aerot')} h2,${s('aerot')} h1{font-size:clamp(19px,2.2vw,23px);line-height:1.16;font-weight:700;
  letter-spacing:-.014em;color:var(--ink)}
${s('aerot')}::before{content:"";display:block;width:34px;height:3px;background:var(--viva);
  margin-bottom:13px}
${s('aerot')} .more{display:inline-block;margin-top:12px;font-family:var(--fb);font-size:11px;
  font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--pri)}
${s('aerot')} .more:hover{color:var(--viva);text-decoration:underline}
@media(max-width:900px){
  ${s('aesec')}{grid-template-columns:1fr;gap:18px;padding-block:26px}
  ${s('aerot')}::before{margin-bottom:9px}
}

/* ---------- a ficha: miniatura a esquerda, texto a direita ---------- */
${s('aelista')}{display:block}
${s('aeficha')}{display:grid;grid-template-columns:200px minmax(0,1fr);gap:20px;
  align-items:start;padding-block:18px;border-top:1px solid var(--line)}
${s('aelista')} ${s('aeficha')}:first-child{border-top:0;padding-top:0}
${s('aefoto')}{display:block;overflow:hidden;background:var(--ph)}
${s('aefoto')} [data-f]{display:block;aspect-ratio:${fp.cardAr || '16/10'};overflow:hidden}
${s('aefoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .45s ease}
${s('aeficha')}:hover ${s('aefoto')} [data-f] img{transform:scale(1.045)}
${s('aekick')}{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.11em'};text-transform:uppercase;color:var(--viva);
  margin-bottom:6px}
${s('aeti')}{display:block;font-family:var(--fd);font-weight:600;font-size:20px;line-height:1.26;
  color:var(--ink);margin:0;transition:color .2s ease}
${s('aeficha')}:hover ${s('aeti')}{color:var(--pri)}
${s('aedd')}{display:block;margin:8px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);
  max-width:64ch;text-align:left}
${s('aedt')}{display:block;margin-top:8px;font-family:var(--fb);font-size:11.5px;
  color:var(--muted)}
@media(max-width:680px){
  ${s('aeficha')}{grid-template-columns:110px minmax(0,1fr);gap:14px;padding-block:15px}
  ${s('aeti')}{font-size:16.5px}
  ${s('aedd')}{display:none}
}

/* ---------- artigo ---------- */
${s('aeart')}{padding-block:30px 8px}
${s('aecol')}{max-width:${fp.medida || '710px'}}
${s('aechap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.11em'};text-transform:uppercase;color:var(--viva)}
${s('aeart')} h1{font-size:clamp(28px,4vw,44px);font-weight:700;letter-spacing:-.02em;
  line-height:1.12;margin:12px 0 0}
${s('aedek')}{font-size:19px;line-height:1.58;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('aehero')}{display:block;margin:28px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'}}
${s('aehero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('aehero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('aeleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('aebody')}{max-width:${fp.medida || '710px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:28px}
${s('aebody')} p{margin:0 0 1.15em;text-align:left}
${s('aebody')} h2{font-size:25px;font-weight:700;letter-spacing:-.012em;margin:1.7em 0 .5em;
  padding-left:14px;border-left:4px solid var(--viva)}
${s('aebody')} h3{font-size:20px;font-weight:600;margin:1.5em 0 .4em;color:var(--pri)}
${s('aebody')} ul,${s('aebody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('aebody')} li{margin:0 0 .45em}
${s('aebody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('aebody')} a:hover{color:var(--viva)}
${s('aebody')} img{margin:1.5em 0;background:var(--ph)}
${s('aebody')} blockquote{margin:1.5em 0;padding:4px 0 4px 22px;border-left:3px solid var(--pri);
  font-family:var(--fd);font-size:20px;line-height:1.5;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do
   artigo, entao e literal de proposito, com o prefixo deste portal */
${s('aebody')} .rde-veja{margin:2.2em 0;padding:20px 24px 18px;
  background:var(--sur);border:1px solid var(--line);border-left:4px solid var(--viva)}
${s('aebody')} .rde-veja h2{font-family:var(--fb);font-size:11.5px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.11em'};text-transform:uppercase;color:var(--muted);
  margin:0 0 11px}
${s('aebody')} .rde-veja ul{list-style:none;margin:0;padding:0}
${s('aebody')} .rde-veja li{margin:0;padding:9px 0;border-top:1px solid var(--line)}
${s('aebody')} .rde-veja li:first-child{border-top:0;padding-top:0}
${s('aebody')} .rde-veja a{font-family:var(--fd);font-size:17px;line-height:1.35;
  color:var(--ink);text-decoration:none;display:block}
${s('aebody')} .rde-veja a:hover{color:var(--viva)}
${s('aebody')} figure{margin:1.5em 0}
${s('aebody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('aebody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('aebody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('aebody')} th,${s('aebody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('aebody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--ink)}
@media(max-width:640px){
  ${s('aebody')} table{min-width:0}
  ${s('aebody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('aebody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('aebody')} table,${s('aebody')} tbody,${s('aebody')} tr,${s('aebody')} th,
  ${s('aebody')} td{display:block;width:auto}
  ${s('aebody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    padding:2px 18px 16px;margin-bottom:13px}
  ${s('aebody')} tbody th,${s('aebody')} tbody td{border:0;background:transparent}
  ${s('aebody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:16px;
    font-family:var(--fd);font-weight:600;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('aebody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('aebody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('aeass')}{display:grid;grid-template-columns:76px minmax(0,1fr);gap:17px;align-items:start;
  max-width:${fp.medida || '710px'};margin:34px 0 0;padding-top:22px;border-top:1px solid var(--line)}
${s('aeass')} img{width:76px;height:76px;object-fit:cover;background:var(--ph)}
${s('aeass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.11em;
  text-transform:uppercase;color:var(--viva)}
${s('aeass')} .nm{display:block;font-family:var(--fd);font-size:21px;font-weight:700;margin-top:3px}
${s('aeass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('aeass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('aeass')} .go:hover{text-decoration:underline}
${s('aerel')}{max-width:${fp.medida || '710px'};padding-block:28px 10px}
${s('aerel')} ${s('aerotb')}{margin-bottom:10px}
${s('aerotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}

/* ---------- rodape ---------- */
${s('aefoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('aecols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('aefb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:25px;color:#fff}
${s('aefb')} svg{display:block;height:.94em;width:auto;flex:none;align-self:center}
${s('aefoot')} p{color:${t.footerTx || '#A9AFB8'};text-align:left}
${s('aefh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:${t.footerTx || '#A9AFB8'};margin-bottom:13px}
${s('aeflist')}{display:flex;flex-direction:column;gap:9px}
${s('aeflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('aeflist')} a:hover{opacity:1;color:var(--viva)}
${s('aefim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12.5px;color:${t.footerTx || '#A9AFB8'}}
@media(max-width:820px){
  ${s('aecols')}{grid-template-columns:1fr;gap:26px}
  ${s('aefoot')}{padding-block:34px 22px}
}

/* ---------- animacao de entrada, respeitando quem pediu menos movimento ---------- */
@media(prefers-reduced-motion:no-preference){
  ${s('reveal')}{opacity:0;transform:translateY(12px);
    transition:opacity .5s ease,transform .5s ease}
  ${s('reveal')}[data-vis="1"]{opacity:1;transform:none}
}`;
}

/* Sumario: tres filetes de larguras diferentes, como as linhas de um indice, com
 * o marcador do topo em destaque. Sem letra dentro: o nome vem como texto ao lado. */
const AE_SIMB = `<svg viewBox="0 0 30 26" role="img" aria-hidden="true" focusable="false"><rect x="1" y="2" width="10" height="4" fill="var(--marca-2,currentColor)"/><rect x="13" y="2" width="16" height="4" fill="var(--marca-1,currentColor)"/><rect x="1" y="11" width="10" height="4" fill="var(--marca-1,currentColor)"/><rect x="13" y="11" width="11" height="4" fill="var(--marca-1,currentColor)"/><rect x="1" y="20" width="10" height="4" fill="var(--marca-1,currentColor)"/><rect x="13" y="20" width="16" height="4" fill="var(--marca-3,currentColor)"/></svg>`;

const AE_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function aeHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'aenav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase: a editoria mora em /categoria/<slug>/.
  // H.curl resolve isso; montar o link a mao poe o menu inteiro em 404.
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('aetop')}">
<div class="${c('aein')} ${c('aebar')}">
<a class="${c('aemarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--ink);--marca-2:var(--viva);--marca-3:var(--pri)">${AE_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
<nav class="${c('aenav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('aeham')}" type="button" data-aeham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('aebusca')}" href="/busca/">${AE_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-aeham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function aeFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('aefoot')}"><div class="${c('aein')}">
<div class="${c('aecols')}">
  <div><a class="${c('aefb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva);--marca-3:var(--viva)">${AE_SIMB}<span>${H.esc(site.shortName || site.name)}</span></a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('aefh')}">Editorias</div><div class="${c('aeflist')}">${cats}</div></div>
  <div><div class="${c('aefh')}">A revista</div><div class="${c('aeflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('aefim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A ficha. O `span` do retrato tem display:block, senao o aspect-ratio nao aplica
 * e a imagem passa por cima do titulo.
 * O nivel do titulo vem de quem chama: h3 sob um h2 de secao na home, h2 na lista
 * de editoria, onde o titulo da pagina e h1. */
function aeFicha(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('aeficha')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('aefoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span><span class="${c('aekick')}">${H.cat(a)}</span>
<h${n} class="${c('aeti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('aedd')}">${H.esc(H.clip(a.dek, 160))}</span>` : ''}
<span class="${c('aedt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function aeHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('aeabre')}">
<div><span class="${c('aechap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('aemm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('aefoto')}">
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
      // lista, e nao grade: a ultima linha nunca fica com buraco
      return `<section class="${c('aesec')}">
<div class="${c('aerot')}"><h2>${H.esc(nome)}</h2>
<a class="more" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
<div class="${c('aelista')}">${v.slice(0, 4).map(a => aeFicha(ctx, a, false)).join('')}</div>
</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${aeHeader(ctx, menu)}
<main class="${c('aewrap')}"><div class="${c('aein')}">
${H.h1(ctx)}
${abertura}
${secoes}
</div></main>
${aeFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. Inventar `bio` ou `editorias` nao da erro em lugar
 * nenhum, so nao gera nada. */
function aeAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('aeass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="76" height="76" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

/* A legenda so aparece quando o `alt` da imagem descreve a FOTO. Em metade do
 * acervo importado ele e uma copia do titulo, e ai a legenda repetiria o `h1`
 * palavra por palavra logo abaixo dele, que e duplicacao a esmo. O `alt` do
 * proprio `img` continua saindo por `H.pic`, para quem nao ve a imagem. */
function aeLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('aeleg')}">${H.esc(alt)}</p>`;
}

function aeArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema. Nao ha helper para calcular isso na arquitetura.
  const rel = (related && related.length) ? `<section class="${c('aerel')}">
<span class="${c('aerotb')}">Leia também</span>
<div class="${c('aelista')}">${related.slice(0, 3).map(a => aeFicha(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${aeHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('aewrap')}"><div class="${c('aein')}">
<article class="${c('aeart')}">
<div class="${c('aecol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('aechap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('aedek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('aehero')}"><span data-f>${H.pic(art, true)}</span></span>
${aeLegenda(ctx, art)}` : ''}
<div class="${c('aebody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${aeAssinatura(ctx, art)}
${rel}
</div></main>
${aeFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function aeList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  return `${H.head(ctx, meta)}
${aeHeader(ctx, menu)}
<main class="${c('aewrap')}"><div class="${c('aein')}">
<section class="${c('aesec')}">
<div class="${c('aerot')}"><h1>${H.esc(opts.title)}</h1>
${opts.desc ? `<p class="${c('aedd')}" style="margin-top:10px">${H.esc(opts.desc)}</p>` : ''}</div>
<div class="${c('aelista')}">${itens.map((a, i) => aeFicha(ctx, a, i === 0, 2)).join('')}</div>
</section>
</div></main>
${aeFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { aeCss, aeHeader, aeFooter, aeHome, aeArticle, aeList };
