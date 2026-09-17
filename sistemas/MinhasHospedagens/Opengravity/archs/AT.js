/*
 * Arquitetura AT, arquetipo MANCHETE. Feita para o folhar.com.br.
 *
 * ## De onde vem o desenho
 *
 * A marca do Folha R e a palavra FOLHA em grotesco pesado com extrusao, e um R
 * atravessado por uma seta que sobe. A assinatura da origem e "noticias e
 * conteudos 24 horas". O favicon dela e so esse R, branco sobre preto.
 *
 * Dois gestos saem dai: a **barra chumbo** no topo e no rodape, e a **lista
 * numerada** de cada secao, com o numeral grande em contorno prata a esquerda do
 * titulo, que le como ordem de chegada.
 *
 * ## O que a diferencia das 45 vizinhas da opengravity
 *
 *   - 🔴 **cabecalho e rodape escuros**. Todas as 45 tem barra clara. Aqui nao e
 *     escolha estetica: a versao "preta" do logotipo da origem tem a palavra
 *     preta mas **o R continua branco**, e sobre papel branco o simbolo some.
 *     A barra escura e o que deixa a marca aparecer inteira
 *   - **lista numerada sem miniatura**. A AO usa marcador redondo de linha do
 *     tempo, a AS arcos, a AM caixas: nenhuma numera
 *   - **manchete horizontal com imagem a esquerda**, e o filete que corre da
 *     editoria ate a borda do contentor
 *   - **Oswald e Barlow**: nenhuma das duas esta nas 55 familias em uso
 *   - **chumbo com brasa**: nao existe quase-preto com laranja-brasa na maquina
 *
 * ## A armadilha desta arquitetura, dita por extenso
 *
 * 🔴 **`flatUrl: true` COM `categoryBase: "categoria"`.** O artigo mora em
 * `/<slug>/`, na raiz, e a editoria em `/categoria/<slug>/`. Montar o link de
 * editoria a mao poe o menu do topo, o do rodape e o chapeu de cada artigo em
 * 404. Editoria sai de `H.curl(slug)`, artigo de `H.url(a)`, sempre.
 *
 * ⚠️ Como tudo divide a raiz, **slug podado colide com pagina que o motor
 * regenera**: contato, politica-de-privacidade, termos-de-uso e quem-somos ficam
 * fora do 410.
 *
 * ⚠️ **O `--barbg` e o `--bartx` sao declarados no `:root`.** Variavel de cor
 * definida no seletor do elemento principal nao alcanca o cabecalho, e o botao
 * do menu fica invisivel no celular.
 *
 * ⚠️ **O numeral da lista sai de `counter` em `::before`**, e nao de texto no
 * HTML: assim leitor de tela nao anuncia "zero dois" no meio do titulo. O
 * contorno usa `-webkit-text-stroke`, com reserva para quem nao tem suporte.
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


function atCss(ctx) {
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

${s('atwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.66;-webkit-font-smoothing:antialiased}
${s('atwrap')} *{box-sizing:border-box}
${s('atin')}{max-width:${fp.container || '1180px'};margin:0 auto;padding:0 24px;width:100%}
${s('atwrap')} h1,${s('atwrap')} h2,${s('atwrap')} h3,${s('atwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.004em;line-height:1.17;margin:0}
${s('atwrap')} a{color:inherit;text-decoration:none}
${s('atwrap')} img{max-width:100%;height:auto;display:block}

/* ---------- cabecalho: barra chumbo, que e onde a marca da origem vive ---------- */
/* 🔴 a marca do portal e branca com o R branco: sobre papel ela some. A barra
   escura nao e enfeite, e o que deixa o simbolo aparecer */
${s('attop')}{background:var(--barbg);color:var(--bartx);
  border-bottom:4px solid var(--viva)}
${s('atbar')}{display:flex;align-items:center;gap:18px;padding-block:16px;flex-wrap:wrap}
${s('atmarca')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:600;font-size:clamp(23px,3vw,31px);letter-spacing:.02em;
  text-transform:uppercase;color:var(--bartx);flex:none}
${s('atmarca')} svg{display:block;height:.7em;width:auto;flex:none;align-self:center}
/* ⚠️ o logotipo e imagem, e imagem sem medida derruba o CLS. A altura manda e a
   largura sai da proporcao do arquivo */
/* ⚠️ o logotipo tem a assinatura "noticias e conteudos 24 horas" embaixo do
   nome, em corpo pequeno: abaixo de 46px ela vira borrao */
${s('atmarca')} img{display:block;height:46px;width:auto;flex:none}
@media(max-width:560px){${s('atmarca')} img{height:36px}}
${s('atfb')} img{display:block;height:36px;width:auto}
${s('atnav')}{display:flex;gap:16px;align-items:center;flex-wrap:wrap;flex:1 1 auto;
  min-width:0;justify-content:flex-end}
${s('atnav')} a{font-family:var(--fd);font-size:13.5px;font-weight:500;letter-spacing:.06em;
  text-transform:uppercase;color:var(--bartx);opacity:.82;transition:opacity .2s ease}
${s('atnav')} a:hover{opacity:1;text-decoration:underline;text-underline-offset:5px;
  text-decoration-color:var(--viva);text-decoration-thickness:2px}
${s('atbusca')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fd);
  font-size:12.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  background:var(--viva);color:#fff;padding:10px 16px;border-radius:${canto};flex:none;
  margin-left:8px}
${s('atbusca')}:hover{filter:brightness(1.08)}
${s('atham')}{display:none;width:46px;height:46px;border:2px solid rgba(255,255,255,.5);
  background:none;cursor:pointer;padding:0;position:relative;border-radius:${canto}}
${s('atham')} i,${s('atham')} i::before,${s('atham')} i::after{position:absolute;left:12px;
  width:20px;height:2px;background:var(--bartx);content:""}
${s('atham')} i{top:21px}
${s('atham')} i::before{top:-6px;left:0}
${s('atham')} i::after{top:6px;left:0}
@media(max-width:560px){
  ${s('atmarca')}{font-size:21px;gap:8px}
  ${s('atbar')}{gap:11px}
  ${s('atbusca')}{font-size:11px;padding:9px 12px;gap:6px}
}
@media(max-width:1100px){
  ${s('atham')}{display:block;order:2}
  ${s('atbusca')}{order:3;margin-left:0}
  ${s('atnav')}{order:4;flex-basis:100%;display:none;flex-direction:column;align-items:flex-start;
    gap:0;border-top:1px solid rgba(255,255,255,.18);margin-top:14px}
  ${s('atnav')}[data-aberto="1"]{display:flex}
  ${s('atnav')} a{width:100%;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.14);
    opacity:1;font-size:14.5px}
}
/* no celular o botao de busca disputava a linha com a marca, que aparecia
   comprimida. A busca continua no rodape e na URL /busca/. */
@media(max-width:760px){${s('atbusca')}{display:none}}

/* ---------- chamada de abertura: texto a esquerda, imagem a direita ---------- */
${s('atabre')}{display:grid;grid-template-columns:1.06fr 1fr;gap:44px;align-items:center;
  padding-block:38px 32px;border-bottom:1px solid var(--line)}
${s('atabre')} h2{font-size:clamp(31px,4.4vw,52px);line-height:1.05;margin:12px 0 0;
  letter-spacing:-.02em}
${s('atabre')} p{font-size:17.5px;line-height:1.6;color:var(--dek);margin:16px 0 0;
  max-width:48ch;text-align:left}
${s('atmm')}{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:19px;
  font-family:var(--fb);font-size:12.5px;color:var(--muted)}
${s('atmm')} b{color:var(--ink);font-weight:700}
${s('atfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('atfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('atfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
@media(max-width:820px){${s('atabre')}{grid-template-columns:1fr;gap:22px;padding-block:26px 22px}}

/* ---------- a secao: manchete larga e lista numerada ---------- */
${s('atsec')}{padding-block:38px;background:var(--paper)}
${s('atsec')}[data-par="1"]{background:var(--wash)}

/* o nome da editoria com a seta da marca e o filete que corre ate a borda */
${s('atcab')}{display:flex;align-items:center;gap:14px;margin-bottom:24px}
${s('atcab')} h1,${s('atcab')} h2{font-family:var(--fd);font-weight:600;
  font-size:clamp(19px,2.2vw,25px);letter-spacing:.06em;text-transform:uppercase;
  color:var(--ink);margin:0;line-height:1.2;flex:none}
${s('atseta')}{display:block;width:30px;height:23px;color:var(--viva);flex:none}
${s('atseta')} svg{display:block;width:100%;height:100%}
/* o filete come o espaco que sobra: e o que da a silhueta de manchete */
${s('atfio')}{flex:1 1 auto;height:3px;background:var(--viva);min-width:24px}
${s('atmais')}{font-family:var(--fd);font-size:12px;font-weight:600;letter-spacing:.1em;
  text-transform:uppercase;color:var(--tinta);flex:none}
${s('atmais')}:hover{text-decoration:underline;text-underline-offset:4px}
${s('atdescr')}{margin:0 0 24px;font-size:15.5px;line-height:1.64;color:var(--dek);
  max-width:72ch;text-align:left}

/* ⚠️ a manchete e horizontal: imagem a ESQUERDA e texto a direita */
${s('atdest')}{display:grid;grid-template-columns:1.15fr 1fr;gap:28px;align-items:center;
  padding-bottom:26px;border-bottom:1px solid var(--line)}
${s('atdest')} ${s('atti')}{font-size:clamp(22px,2.7vw,33px);line-height:1.1;margin-top:11px;
  letter-spacing:-.012em}
${s('atkick')}{display:inline-block;font-family:var(--fd);font-size:11.5px;font-weight:600;
  letter-spacing:${fp.kickerLs || '.12em'};text-transform:uppercase;color:var(--tinta)}
${s('atti')}{display:block;font-family:var(--fd);font-weight:600;font-size:18px;
  line-height:1.18;color:var(--ink);margin:0;transition:color .2s ease;
  letter-spacing:-.004em}
${s('atdd')}{display:block;margin:11px 0 0;font-size:15.5px;line-height:1.6;color:var(--dek);
  max-width:52ch;text-align:left}
${s('atdt')}{display:block;margin-top:10px;font-family:var(--fb);font-size:12px;color:var(--muted)}
${s('atfoto')}{display:block;overflow:hidden;background:var(--ph);border-radius:${canto}}
${s('atfoto')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '16/9'};overflow:hidden}
${s('atfoto')} [data-f] img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${s('atdest')}:hover ${s('atti')}{color:var(--tinta)}
${s('atdest')}:hover ${s('atfoto')} [data-f] img{transform:scale(1.03)}
@media(max-width:820px){
  ${s('atdest')}{grid-template-columns:1fr;gap:16px;align-items:start}
}

/* a lista numerada: o "24 horas" da marca vira ordem de chegada */
${s('atlista')}{counter-reset:at;display:grid;grid-template-columns:1fr 1fr;gap:0 40px;
  margin-top:6px}
${s('atrow')}{counter-increment:at;display:grid;grid-template-columns:58px minmax(0,1fr);
  gap:14px;align-items:start;padding-block:18px;border-bottom:1px solid var(--line)}
/* ⚠️ o numeral e decoracao: sai de counter em ::before, e nao de texto no HTML,
   para o leitor de tela nao anunciar "zero dois" no meio do titulo */
${s('atrow')}::before{content:counter(at,decimal-leading-zero);font-family:var(--fd);
  font-size:34px;font-weight:600;line-height:.9;color:transparent;
  -webkit-text-stroke:1.5px var(--ph);letter-spacing:-.04em}
@supports not ((-webkit-text-stroke:1px red)){
  ${s('atrow')}::before{color:var(--ph);-webkit-text-stroke:0}
}
${s('atrow')}:hover::before{-webkit-text-stroke-color:var(--viva);color:transparent}
${s('atrow')}:hover ${s('atti')}{color:var(--tinta)}
${s('atrow')} ${s('atti')}{font-size:17px;line-height:1.24}
${s('atrow')} ${s('atkick')}{font-size:10.5px;margin-bottom:5px}
${s('atrow')} ${s('atdd')}{display:none}
@media(max-width:760px){
  ${s('atlista')}{grid-template-columns:1fr;gap:0}
  ${s('atrow')}{grid-template-columns:46px minmax(0,1fr);gap:12px}
  ${s('atrow')}::before{font-size:27px}
}

/* a listagem de editoria e os relacionados usam grade de tres cartoes */
${s('atgrade')}{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 28px}
${s('atgrade')} ${s('atdest')}{display:block;padding-bottom:0;border-bottom:0}
${s('atgrade')} ${s('atti')}{font-size:19px;line-height:1.2;margin-top:10px}
${s('atgrade')} ${s('atdd')}{display:none}
@media(max-width:900px){${s('atgrade')}{grid-template-columns:1fr 1fr}}
@media(max-width:560px){${s('atgrade')}{grid-template-columns:1fr}}

/* ---------- artigo ---------- */
${s('atart')}{padding-block:30px 8px}
${s('atcol')}{max-width:${fp.medida || '700px'}}
${s('atchap')}{display:inline-block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--tinta)}
/* ⚠️ a Darker Grotesque tem ascendente alto: abaixo de 1,16 o titulo de duas
   linhas encosta na assinatura, que vem logo abaixo e nao tem margem propria */
${s('atart')} h1{font-size:clamp(30px,4.2vw,47px);line-height:1.16;margin:13px 0 15px;
  letter-spacing:-.02em}
${s('atdek')}{font-size:19px;line-height:1.54;color:var(--dek);margin:16px 0 0;
  max-width:58ch;text-align:left}
${s('athero')}{display:block;margin:26px 0 0;background:var(--ph);overflow:hidden;
  max-width:${fp.medidaLarga || '880px'};border-radius:${canto}}
${s('athero')} [data-f]{display:block;aspect-ratio:${fp.heroAr || '3/2'};overflow:hidden}
${s('athero')} [data-f] img{width:100%;height:100%;object-fit:cover}
${s('atleg')}{font-family:var(--fb);font-size:12.5px;color:var(--muted);margin:9px 0 0;
  max-width:${fp.medidaLarga || '880px'};line-height:1.5;text-align:left}
${s('atbody')}{max-width:${fp.medida || '700px'};font-size:${fp.corpoFs || '18.5px'};
  line-height:1.78;margin-top:26px}
${s('atbody')} p{margin:0 0 1.15em;text-align:left}
${s('atbody')} h2{font-family:var(--fd);font-size:27px;font-weight:700;margin:1.75em 0 .5em;
  letter-spacing:-.012em}
${s('atbody')} h3{font-size:20px;margin:1.5em 0 .4em;color:var(--pri)}
${s('atbody')} ul,${s('atbody')} ol{margin:0 0 1.15em;padding-left:1.25em;text-align:left}
${s('atbody')} li{margin:0 0 .45em}
${s('atbody')} a{color:var(--pri);text-decoration:underline;text-underline-offset:2px}
${s('atbody')} a:hover{color:var(--tinta)}
${s('atbody')} img{margin:1.5em 0;background:var(--ph);border-radius:${canto}}
${s('atbody')} blockquote{margin:1.6em 0;padding:4px 0 4px 22px;border-left:4px solid var(--viva);
  font-family:var(--fd);font-size:22px;line-height:1.38;color:var(--ink)}
/* bloco Veja tambem da malha interna: a classe vem gravada no corpo do artigo,
   entao e literal de proposito, com o prefixo deste portal */
${s('atbody')} .flr-veja{margin:2.2em 0;padding:18px 0 16px;border-top:3px solid var(--pri);
  border-bottom:1px solid var(--line)}
${s('atbody')} .flr-veja h2{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:${fp.kickerLs || '.19em'};text-transform:uppercase;color:var(--pri);
  margin:0 0 11px}
${s('atbody')} .flr-veja ul{list-style:none;margin:0;padding:0}
${s('atbody')} .flr-veja li{margin:0;padding:8px 0;border-top:1px solid rgba(0,0,0,.08)}
${s('atbody')} .flr-veja li:first-child{border-top:0;padding-top:0}
${s('atbody')} .flr-veja a{font-family:var(--fd);font-size:17px;line-height:1.3;color:var(--ink);
  text-decoration:none;display:block}
${s('atbody')} .flr-veja a:hover{color:var(--tinta)}
${s('atbody')} figure{margin:1.5em 0}
${s('atbody')} figcaption{font-size:13px;color:var(--muted);margin-top:7px;text-align:left}

/* ---------- tabela: vira cartao no celular, com rotulo de coluna ---------- */
${s('atbody')} table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:15.5px}
${s('atbody')} caption{font-size:13px;color:var(--muted);text-align:left;padding-bottom:8px}
${s('atbody')} th,${s('atbody')} td{border:0;background:transparent;text-align:left;
  padding:12px 14px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
${s('atbody')} thead th{font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--pri)}
@media(max-width:640px){
  ${s('atbody')} table{min-width:0}
  ${s('atbody')} caption{display:none}
  /* o cabecalho sai da tela mas continua no DOM, acessivel ao leitor de tela */
  ${s('atbody')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('atbody')} table,${s('atbody')} tbody,${s('atbody')} tr,${s('atbody')} th,
  ${s('atbody')} td{display:block;width:auto}
  ${s('atbody')} tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:${canto};padding:2px 18px 16px;margin-bottom:13px}
  ${s('atbody')} tbody th,${s('atbody')} tbody td{border:0;background:transparent}
  ${s('atbody')} tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;font-size:17px;
    font-family:var(--fd);font-weight:700;letter-spacing:normal;text-transform:none;color:var(--ink)}
  ${s('atbody')} tbody td{padding:14px 0 0;line-height:1.55}
  ${s('atbody')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;
    font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
    margin-bottom:3px}
}

/* ---------- ficha de assinatura ---------- */
${s('atass')}{display:grid;grid-template-columns:84px minmax(0,1fr);gap:18px;align-items:center;
  max-width:${fp.medida || '700px'};margin:34px 0 0;padding-top:22px;
  border-top:3px solid var(--pri)}
${s('atass')} img{width:84px;height:84px;object-fit:cover;background:var(--ph);border-radius:${canto}}
${s('atass')} .ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--viva)}
${s('atass')} .nm{display:block;font-family:var(--fd);font-size:22px;font-weight:700;margin-top:3px}
${s('atass')} p{margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--dek);text-align:left}
${s('atass')} .go{display:inline-block;margin-top:9px;font-family:var(--fb);font-size:11.5px;
  font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pri)}
${s('atass')} .go:hover{text-decoration:underline}
${s('atrel')}{max-width:${fp.medida || '700px'};padding-block:26px 10px}
${s('atrotb')}{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--pri);
  border-top:3px solid var(--pri);padding-top:9px;margin-bottom:2px}

/* ---------- rodape ---------- */
${s('atfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'};margin-top:44px;padding-block:44px 26px}
${s('atcols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:34px}
${s('atfb')}{display:inline-flex;align-items:center;gap:11px;font-family:var(--fd);
  font-weight:700;font-size:26px;color:#fff}
${s('atfb')} svg{display:block;height:.84em;width:auto;flex:none;align-self:center}
${s('atfoot')} p{color:${t.footerTx || '#AFBCAF'};text-align:left}
${s('atfh')}{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:${t.footerTx || '#AFBCAF'};margin-bottom:13px}
${s('atflist')}{display:flex;flex-direction:column;gap:9px}
${s('atflist')} a{font-size:14.5px;color:#fff;opacity:.9}
${s('atflist')} a:hover{opacity:1;color:var(--viva)}
${s('atfim')}{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  margin-top:34px;padding-top:17px;border-top:1px solid rgba(255,255,255,.18);
  font-size:12.5px;color:${t.footerTx || '#AFBCAF'}}
@media(max-width:820px){
  ${s('atcols')}{grid-template-columns:1fr;gap:26px}
  ${s('atfoot')}{padding-block:34px 22px}
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
const AT_SIMB = `<svg viewBox="0 0 30 24" role="img" aria-hidden="true" focusable="false" fill="none" stroke="var(--marca-1,currentColor)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19 C10 19 19 14 26 5"/><path d="M19 4.5 L26.5 4 L26 11.5"/></svg>`;

const AT_SETA = `<svg viewBox="0 0 40 30" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 25 C13 25 25 18 34 5"/><path d="M25 3.5 L35 3 L34.5 13"/></svg>`;

const AT_LUPA = `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function atHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'atnav-' + (site.slug || 'p');
  // 🔴 este portal tem categoryBase "category", em INGLES, porque na origem o
  // campo estava vazio e vazio significa `category`. Montar /categoria/ a mao
  // poe o menu inteiro em 404, e o menu continua bonito no print
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('attop')}">
<div class="${c('atin')} ${c('atbar')}">
<a class="${c('atmarca')}" href="/" aria-label="${H.esc(site.name)}, página inicial"
  style="--marca-1:var(--pri);--marca-2:var(--viva)">${site.logoImg
    ? `<img src="${site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" fetchpriority="high">`
    : `${AT_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
<nav class="${c('atnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<button class="${c('atham')}" type="button" data-atham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<a class="${c('atbusca')}" href="/busca/">${AT_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-atham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function atFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('atfoot')}"><div class="${c('atin')}">
<div class="${c('atcols')}">
  <div><a class="${c('atfb')}" href="/" aria-label="${H.esc(site.name)}"
      style="--marca-1:#fff;--marca-2:var(--viva)">${(site.logoImgDark || site.logoImg)
        ? `<img src="${site.logoImgDark || site.logoImg}" alt="${H.esc(site.name)}" width="${site.logoW}" height="${site.logoH}" loading="lazy">`
        : `${AT_SIMB}<span>${H.esc(site.shortName || site.name)}</span>`}</a>
    <p style="margin:15px 0 0;max-width:42ch;line-height:1.62">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('atfh')}">Editorias</div><div class="${c('atflist')}">${cats}</div></div>
  <div><div class="${c('atfh')}">O jornal</div><div class="${c('atflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('atfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* A materia principal da secao: imagem a ESQUERDA e texto a direita. O `span`
 * da foto tem display:block, senao o aspect-ratio nao aplica. */
function atDestaque(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // manchete horizontal: imagem a esquerda, texto a direita. Na grade da
  // listagem o CSS desmancha o grid e ela vira cartao de coluna
  return `<a class="${c('atdest')} ${c('reveal')}" href="${H.url(a)}">
<span class="${c('atfoto')}"><span data-f>${H.pic(a, !!eager)}</span></span>
<span><span class="${c('atkick')}">${H.cat(a)}</span>
<h${n} class="${c('atti')}">${H.esc(a.title)}</h${n}>
${a.dek ? `<span class="${c('atdd')}">${H.esc(H.clip(a.dek, 175))}</span>` : ''}
<span class="${c('atdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function atLinha(ctx, a, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  // sem miniatura de proposito: o numeral e a coluna da esquerda, e e ele que
  // da a leitura de lista de plantao
  return `<a class="${c('atrow')} ${c('reveal')}" href="${H.url(a)}">
<span><span class="${c('atkick')}">${H.cat(a)}</span>
<h${n} class="${c('atti')}">${H.esc(a.title)}</h${n}>
<span class="${c('atdt')}">${H.esc(H.dateShort(a.date))}</span></span>
</a>`;
}

function atHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre] = arts;
  const usados = new Set([abre].filter(Boolean).map(a => a.slug));

  const abertura = abre ? `<section class="${c('atabre')}">
<div><span class="${c('atchap')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 215))}</p>` : ''}
<div class="${c('atmm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span>&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a href="${H.url(abre)}" aria-label="${H.esc(abre.title)}"><span class="${c('atfoto')}">
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
      return `<section class="${c('atsec')}" data-par="${idx % 2}">
<div class="${c('atin')}">
<div class="${c('atcab')}"><span class="${c('atseta')}">${AT_SETA}</span>
<h2>${H.esc(nome)}</h2><span class="${c('atfio')}"></span>
<a class="${c('atmais')}" href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>
${atDestaque(ctx, d, true)}
${resto.length ? `<div class="${c('atlista')}">${resto.slice(0, 6).map(a => atLinha(ctx, a)).join('')}</div>` : ''}
</div></section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${atHeader(ctx, menu)}
<main class="${c('atwrap')}">
<div class="${c('atin')}">${H.h1(ctx)}
${abertura}</div>
${secoes}
</main>
${atFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Ficha do autor no fim da materia. Os campos sao os do motor: `nome`, `slug`,
 * `editoria` e `lead`. */
function atAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('atass')}">
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
function atLegenda(ctx, art) {
  const { c, H } = ctx;
  const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
  const t = String(art.title || '').trim();
  const igual = alt.replace(/\s+/g, ' ').toLowerCase() === t.replace(/\s+/g, ' ').toLowerCase();
  if (!alt || igual) return '';
  return `<p class="${c('atleg')}">${H.esc(alt)}</p>`;
}

function atArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema.
  const rel = (related && related.length) ? `<section class="${c('atrel')}">
<span class="${c('atrotb')}">Leia também</span>
<div class="${c('atgrade')}">${related.slice(0, 3).map(a => atDestaque(ctx, a, false)).join('')}</div>
</section>` : '';
  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${atHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('atwrap')}"><div class="${c('atin')}">
<article class="${c('atart')}">
<div class="${c('atcol')}">
${H.crumbs(ctx, art, P)}
<span class="${c('atchap')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('atdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
</div>
${P.imgUrl ? `<span class="${c('athero')}"><span data-f>${H.pic(art, true)}</span></span>
${atLegenda(ctx, art)}` : ''}
<div class="${c('atbody')}">${art.content}</div>
${H.share(ctx, P)}
</article>
${atAssinatura(ctx, art)}
${rel}
</div></main>
${atFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function atList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  const [primeiro, ...resto] = itens;
  return `${H.head(ctx, meta)}
${atHeader(ctx, menu)}
<main class="${c('atwrap')}">
<section class="${c('atsec')}" data-par="0"><div class="${c('atin')}">
<div class="${c('atcab')}"><span class="${c('atseta')}">${AT_SETA}</span>
<h1>${H.esc(opts.title)}</h1><span class="${c('atfio')}"></span></div>
${opts.desc ? `<p class="${c('atdescr')}">${H.esc(opts.desc)}</p>` : ''}
${primeiro ? atDestaque(ctx, primeiro, true, 2) : ''}
${resto.length ? `<div class="${c('atgrade')}">${resto.map(a => atDestaque(ctx, a, false, 2)).join('')}</div>` : ''}
</div></section>
</main>
${atFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { atCss, atHeader, atFooter, atHome, atArticle, atList };
