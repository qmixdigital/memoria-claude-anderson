/* ===================== ARCH BF =====================
   Portal: ortopedistadeombro.com.br  ("Ortopedista Ombro")

   Conceito: PAUTA CORRIDA. O portal responde duvida de consultorio, e a home e
   uma PAUTA: uma unica chamada grande no alto e, embaixo dela, o acervo inteiro
   em DUAS COLUNAS DE LINHAS separadas por filete, cada linha com miniatura
   quadrada pequena, chapeu, titulo e data. Nao ha cartao, nao ha fundo pintado
   e nao ha grade de foto: o que organiza e o FILETE e a repeticao da linha.

   O unico bloco solido da pagina e o TITULO DE EDITORIA, que sai em tarja
   cheia da cor da marca com o texto vazado em branco. E o unico lugar em que a
   cor aparece em area, e por isso ele ancora a pagina inteira.

   🔴 AS DUAS COLUNAS PREENCHEM POR COLUNA, e nao por linha. Com o fluxo padrao
   o segundo item mais recente vai para o TOPO DA COLUNA DA DIREITA, e quem le
   descendo a esquerda ve a data pular. O numero de linhas nao da para cravar no
   CSS, porque muda de bloco para bloco, entao ele vai numa variavel calculada
   no render e a media query devolve o fluxo por linha no celular.

   Deliberadamente diferente das vizinhas na mesma maquina:
   - a BD e um FICHARIO com indice de dois digitos e ficha deitada de 104px, em
     grade de 2 colunas, e cabecalho em duas linhas. Aqui nao ha numero nenhum,
     a miniatura e de 64px e o cabecalho e uma linha so com a marca centrada a
     esquerda e a nav embaixo dela na mesma faixa;
   - a BE monta a home em FAIXAS de sangria total que alternam o fundo, com
     cartao vertical de foto 16/9 em grade de 3. Aqui nao existe faixa, nao
     existe alternancia de fundo e nao existe cartao: e uma pauta de linhas;
   - a BD e a BE usam filete fino no titulo de secao. Aqui o titulo e TARJA
     SOLIDA com texto vazado;
   - o artigo da BD e coluna de 74ch corrida e o da BE abre em faixa lavada.
     Aqui o artigo tem CALHA A DIREITA, fixa na rolagem, com autor, data, tempo
     de leitura e compartilhar, e o texto em 66ch a esquerda dela.

   A chave tem DUAS letras: o deploy precisa casar a marca ARCH BF inteira,
   nunca so ARCH B.

   Nao existe aria-expanded no cabecalho de proposito: e o motor que injeta o
   menu sanfonado, no funil unico, e ele desiste se achar um.

   Nada centralizado alem da marca. Paragrafo, lista e FAQ sempre a esquerda.
*/
function bfCss(ctx) {
  const { s } = ctx;
  return `
:root{
--bfac:var(--p);--bfink:var(--ink);--bfpaper:var(--paper);
--bffio:color-mix(in srgb,var(--ink) 14%,transparent);
--bffio2:color-mix(in srgb,var(--ink) 7%,transparent);
/* 68% e o piso medido: abaixo disso a razao com o papel cai da regua de 4,5:1,
   e este e o tom do resumo, da data e da assinatura */
--bffraco:color-mix(in srgb,var(--ink) 68%,transparent);
--bflavado:color-mix(in srgb,var(--p) 6%,var(--paper));
--bfpad:24px
}
body{background:var(--bfpaper);color:var(--bfink)}
${s('area')}{max-width:var(--maxw);margin:0 auto;padding:0 var(--bfpad);box-sizing:border-box;width:100%}
${s('area')} > *{min-width:0}

/* ---------- cabecalho: marca em cima, editorias embaixo, mesma faixa ---------- */
${s('capa')}{background:var(--bfpaper);border-bottom:1px solid var(--bffio)}
${s('capain')}{max-width:var(--maxw);margin:0 auto;padding:20px var(--bfpad) 0;box-sizing:border-box}
${s('firma')}{display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:inherit}
${s('firma')} img{display:block;height:34px;width:auto;flex:none}
${s('firma')} ${s('marc')}{display:block;flex:none;line-height:0}
${s('firma')} ${s('marc')} svg{display:block;width:36px;height:36px}
${s('firma')} span{display:flex;flex-direction:column;gap:3px;min-width:0}
${s('firma')} b{font-family:var(--fd);font-weight:700;font-size:25px;line-height:1.04;letter-spacing:-.024em;color:var(--bfink);white-space:nowrap}
${s('firma')} i{font-style:normal;font-family:var(--fb);font-size:9.5px;font-weight:600;letter-spacing:.19em;text-transform:uppercase;color:var(--bffraco);white-space:nowrap}
${s('firma')}:hover b{color:var(--bfac)}
${s('rota')}{display:flex;flex-wrap:wrap;align-items:center;gap:2px 24px;margin:15px 0 0;padding:11px 0 0;border-top:1px solid var(--bffio2)}
${s('rota')} a{font-family:var(--fb);font-size:13.5px;font-weight:600;color:var(--bffraco);text-decoration:none;padding:7px 0;border-bottom:3px solid transparent;transition:color .16s ease,border-color .16s ease}
${s('rota')} a:hover{color:var(--bfac);border-bottom-color:var(--bfac)}

/* ---------- atomos ---------- */
${s('etiq')}{display:inline-flex;align-items:center;gap:8px;font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:var(--kls,.14em);text-transform:uppercase;color:var(--bfac)}
${s('etiq')} span{color:var(--bffraco);font-weight:500;letter-spacing:.06em}
${s('etiq')} a{color:inherit;text-decoration:none}
${s('etiq')} a:hover{text-decoration:underline;text-underline-offset:3px}
/* o unico bloco solido da pagina: tarja cheia com o texto vazado */
${s('tarja')}{display:flex;align-items:center;justify-content:space-between;gap:10px 18px;flex-wrap:wrap;background:var(--bfac);padding:9px 15px;margin:0 0 4px}
${s('tarja')} h1,${s('tarja')} h2{font-family:var(--fd);font-weight:700;font-size:clamp(16px,1.7vw,20px);line-height:1.2;letter-spacing:-.01em;color:var(--onp,#fff);margin:0;text-align:left}
${s('tarja')} .ver{font-family:var(--fb);font-size:11.5px;font-weight:600;letter-spacing:.06em;color:var(--onp,#fff);text-decoration:none;opacity:.86;white-space:nowrap}
${s('tarja')} .ver:hover{opacity:1;text-decoration:underline;text-underline-offset:3px}
${s('bloco')}{margin:0 0 40px}

/* ---------- a chamada unica do alto ---------- */
${s('chamada')}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.02fr);gap:0 36px;align-items:center;margin:28px 0 38px;padding:0 0 32px;border-bottom:3px solid var(--bfink);text-decoration:none;color:inherit}
${s('chamada')} .tx{display:flex;flex-direction:column;gap:13px;text-align:left}
${s('chamada')} .im{display:block;overflow:hidden;background:var(--ph);aspect-ratio:var(--hero-ar,3/2);border-radius:var(--rad,3px)}
${s('chamada')} .im img{width:100%;height:100%;object-fit:cover;display:block}
${s('chamada')} .h{font-family:var(--fd);font-weight:700;font-size:clamp(26px,3vw,38px);line-height:1.12;letter-spacing:-.024em;color:var(--bfink);margin:0;text-align:left}
${s('chamada')}:hover .h{color:var(--bfac)}
${s('chamada')} .d{font-family:var(--fb);font-size:16px;font-weight:400;line-height:1.68;color:var(--bffraco);margin:0;text-align:left;max-width:50ch}

/* ---------- a pauta: duas colunas de linhas, preenchidas POR COLUNA ---------- */
/* o --l vem do render, calculado por bloco: sem ele o segundo item mais recente
   vai para o topo da coluna da direita e a data pula para quem le descendo */
${s('pauta')}{display:grid;grid-template-columns:1fr 1fr;gap:0 38px;grid-auto-flow:column;grid-template-rows:repeat(var(--l,4),auto)}
${s('linha')}{display:grid;grid-template-columns:64px minmax(0,1fr);gap:0 14px;align-items:start;padding:15px 0;border-bottom:1px solid var(--bffio2);text-decoration:none;color:inherit}
${s('linha')} .im{display:block;width:64px;height:64px;overflow:hidden;background:var(--ph);border-radius:var(--rad-sm,3px)}
${s('linha')} .im img{width:100%;height:100%;object-fit:cover;display:block}
/* sem foto a calha vira um quadrado da cor lavada, e a coluna nao entorta */
${s('linha')} .vaga{display:block;width:64px;height:64px;background:var(--bflavado);border-left:3px solid var(--bfac);border-radius:var(--rad-sm,3px)}
${s('linha')} .tx{display:flex;flex-direction:column;gap:6px;min-width:0;text-align:left}
${s('linha')} .h{font-family:var(--fd);font-weight:600;font-size:16.5px;line-height:1.29;letter-spacing:-.011em;color:var(--bfink);margin:0;text-align:left}
${s('linha')}:hover .h{color:var(--bfac)}

/* ---------- artigo: calha A DIREITA, fixa na rolagem ---------- */
${s('obra')}{display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:0 44px;align-items:start;margin:24px 0 0}
${s('miolo')}{min-width:0;max-width:66ch}
${s('miolo')} h1{font-family:var(--fd);font-weight:700;font-size:clamp(27px,3.3vw,41px);line-height:1.12;letter-spacing:-.025em;color:var(--bfink);margin:9px 0 15px;text-align:left}
${s('olho')}{display:block;font-family:var(--fb);font-size:18px;font-weight:400;line-height:1.64;color:var(--bffraco);margin:0 0 22px;text-align:left}
${s('calha')}{position:sticky;top:22px;border-top:3px solid var(--bfink);padding-top:14px;min-width:0}
${s('calha')} dt{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:var(--bffraco);margin:0 0 5px}
${s('calha')} dd{font-family:var(--fb);font-size:13.5px;font-weight:500;line-height:1.5;color:var(--bfink);margin:0 0 17px}
${s('calha')} dd a{color:var(--bfink);text-decoration:none}
${s('calha')} dd a:hover{color:var(--bfac);text-decoration:underline;text-underline-offset:3px}
${s('rosto')}{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit}
${s('rosto')} img{width:38px;height:38px;object-fit:cover;background:var(--ph);flex:none;border-radius:50%}
${s('espalha')}{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
${s('espalha')} a{font-family:var(--fb);font-size:13px;font-weight:500;color:var(--bffraco);text-decoration:underline;text-underline-offset:4px}
${s('espalha')} a:hover{color:var(--bfink)}
${s('quadro')}{margin:0 0 26px}
/* 🔴 height:auto nao e enfeite: a tag ja traz width e height, mas o navegador
   so usa esse par para reservar altura quando o CSS deixa a altura livre. Com
   width:100% sozinho a pagina pula quando a foto chega, e isso conta como CLS. */
${s('quadro')} img{width:100%;height:auto;display:block;border-radius:var(--rad,3px)}
${s('quadro')} figcaption{font-family:var(--fb);font-size:12.5px;font-weight:400;line-height:1.6;color:var(--bffraco);padding:9px 0 0;text-align:left}

${s('prosa')}{font-family:var(--fb);font-size:17.5px;font-weight:400;line-height:1.76;color:var(--bfink)}
${s('prosa')} p{margin:0 0 1.22em;text-align:left}
/* o h2 repete a tarja da editoria, em versao fina: e o mesmo gesto grafico */
${s('prosa')} h2{font-family:var(--fd);font-weight:700;font-size:21px;line-height:1.3;letter-spacing:-.015em;color:var(--bfink);margin:1.9em 0 .6em;padding-left:13px;border-left:5px solid var(--bfac);scroll-margin-top:22px;text-align:left}
${s('prosa')} h3{font-family:var(--fb);font-weight:700;font-size:16.5px;line-height:1.44;color:var(--bfink);margin:1.6em 0 .5em;scroll-margin-top:22px;text-align:left}
${s('prosa')} a{color:var(--bfac);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
${s('prosa')} a:hover{color:var(--bfink)}
${s('prosa')} ul,${s('prosa')} ol{margin:0 0 1.22em;padding-left:1.3em;text-align:left}
${s('prosa')} li{margin-bottom:.48em}
${s('prosa')} img{max-width:100%;height:auto;display:block;margin:1.6em 0;border-radius:var(--rad,3px)}
${s('prosa')} blockquote{margin:1.8em 0;padding:12px 0 12px 20px;background:var(--bflavado);border-left:5px solid var(--bfac);font-family:var(--fd);font-weight:500;font-size:18.5px;line-height:1.5;color:var(--bfink);text-align:left}
${s('prosa')} blockquote p{margin:0 0 .45em;font-family:inherit;font-size:inherit;line-height:inherit}
${s('prosa')} blockquote p:last-child{margin-bottom:0}
${s('prosa')} table{width:100%;border-collapse:collapse;margin:0;font-family:var(--fb);font-size:14.5px;min-width:420px}
${s('prosa')} table caption{font-family:var(--fb);font-size:12.5px;color:var(--bffraco);text-align:left;padding-bottom:9px}
${s('prosa')} table th,${s('prosa')} table td{border:0;border-bottom:1px solid var(--bffio);padding:11px 13px 11px 0;text-align:left;vertical-align:top}
${s('prosa')} table thead th{border-bottom:3px solid var(--bfac);font-weight:700}
${s('escorre')}{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%;margin:1.6em 0}
${s('prosa')} pre{margin:0;padding:16px 18px;background:var(--bflavado);border-radius:var(--rad,3px);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:1.6}
${s('prosa')} code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.88em;background:var(--bflavado);padding:2px 6px;border-radius:3px}
${s('prosa')} pre code{background:none;padding:0}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de arrastar
   nao e descoberto. O cabecalho sai da tela mas continua no DOM */
@media(max-width:640px){
${s('prosa')} table{min-width:0;display:block;width:auto;overflow:visible}
${s('prosa')} table caption{display:none}
${s('prosa')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
${s('prosa')} table tbody,${s('prosa')} table tr,${s('prosa')} table th,${s('prosa')} table td{display:block;width:auto}
${s('prosa')} table tbody tr{background:var(--bfpaper);border:1px solid var(--bffio);border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
${s('prosa')} table tbody th,${s('prosa')} table tbody td{border:0;background:transparent;padding:0}
${s('prosa')} table tbody th{border-bottom:1px solid var(--bffio);padding:13px 0 11px;font-weight:700;text-align:left}
${s('prosa')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
${s('prosa')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--bffraco)}
}

/* relacionados com a MESMA largura da coluna do artigo */
${s('depois')}{max-width:66ch;margin:40px 0 0}

/* ---------- rodape ---------- */
/* fundo e texto saem de footerBg e footerTx, nunca de ink e do tom legivel
   sobre a primaria: usar aqueles dois deixa o rodape claro com texto claro */
${s('base')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:60px}
${s('basein')}{max-width:var(--maxw);margin:0 auto;padding:44px var(--bfpad) 24px;box-sizing:border-box}
${s('bgrade')}{display:grid;grid-template-columns:1.7fr 1fr 1fr 1fr;gap:34px;margin-bottom:28px}
${s('bgrade')} h2{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:.19em;text-transform:uppercase;color:#fff;margin:0 0 13px}
${s('bgrade')} a{display:block;font-family:var(--fb);font-size:13.5px;font-weight:400;color:var(--footer-tx);text-decoration:none;padding:5px 0}
${s('bgrade')} a:hover{color:#fff}
${s('base')} ${s('firma')} b{color:#fff}
${s('base')} ${s('firma')} i{color:var(--footer-tx)}
${s('bsobre')}{font-family:var(--fb);font-size:13.5px;font-weight:400;line-height:1.72;color:var(--footer-tx);margin-top:15px;max-width:44ch;text-align:left}
${s('bfim')}{border-top:1px solid color-mix(in srgb,var(--footer-tx) 22%,transparent);padding-top:17px;font-family:var(--fb);font-size:12.5px;font-weight:400;line-height:1.72;color:var(--footer-tx);text-align:left}

/* ---------- respiro ---------- */
@media(max-width:1000px){
${s('obra')}{grid-template-columns:minmax(0,1fr);gap:0}
${s('miolo')}{max-width:none}
/* a calha deixa de ser coluna e vira faixa ACIMA do texto */
${s('calha')}{position:static;order:-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 22px;margin:0 0 28px}
${s('calha')} dd{margin-bottom:13px}
${s('espalha')}{flex-direction:row;flex-wrap:wrap;gap:7px 18px}
${s('bgrade')}{grid-template-columns:1fr 1fr;gap:28px}
}
@media(max-width:760px){
${s('chamada')}{grid-template-columns:minmax(0,1fr);gap:18px}
${s('chamada')} .tx{order:2}
${s('chamada')} .im{order:1}
${s('chamada')} .h{font-size:27px}
${s('chamada')} .d{max-width:none;font-size:15.5px}
/* no celular a pauta volta a preencher por LINHA, em coluna unica */
${s('pauta')}{grid-template-columns:minmax(0,1fr);grid-auto-flow:row;grid-template-rows:none;gap:0}
${s('prosa')}{font-size:16.5px;line-height:1.74}
${s('prosa')} h2{font-size:19.5px}
${s('bgrade')}{grid-template-columns:1fr;gap:22px}
}
@media(max-width:520px){
:root{--bfpad:16px}
${s('firma')} b{font-size:21px}
${s('firma')} img,${s('firma')} ${s('marc')} svg{height:30px;width:auto}
${s('miolo')} h1{font-size:26px}
${s('calha')}{grid-template-columns:minmax(0,1fr)}
}
${s('chamada')} > *,${s('pauta')} > *,${s('linha')} > *,${s('obra')} > *,${s('bgrade')} > *{min-width:0}
${s('chamada')} .h,${s('linha')} .h,${s('miolo')} h1{overflow-wrap:break-word}
html,body{max-width:100%;overflow-x:hidden}
`;
}

/* A marca prefere o arquivo que veio do WordPress da origem. So quando o portal
   nao tem arquivo e que entra o simbolo, um ombro esquematico em tres tracos. */
function bfLogo(ctx, cls, usarArquivo) {
  const { c, H, site } = ctx;
  const nome = String(site.shortName || site.name).trim();
  const legenda = site.tagline ? `<i>${H.esc(site.tagline)}</i>` : '';
  // Com arquivo de logotipo, o NOME NAO se repete ao lado dele: a imagem ja
  // traz a marca escrita, e os dois juntos leem como erro de montagem.
  if (usarArquivo && site.logoFile) {
    return `<a class="${c(cls)}" href="/" aria-label="${H.esc(nome)}">`
      + `<img src="/img/${H.esc(site.logoFile)}" width="${site.logoW || 160}" `
      + `height="${site.logoH || 34}" alt="${H.esc(nome)}" decoding="async">`
      + (legenda ? `<span>${legenda}</span>` : '') + `</a>`;
  }
  // No rodape escuro o arquivo nao serve: o logotipo da origem e escuro sobre
  // transparente e a metade escura dele desaparece no fundo. Ali vale a marca
  // escrita, que herda a cor clara do rodape.
  return `<a class="${c(cls)}" href="/"><span><b>${H.esc(nome)}</b>${legenda}</span></a>`;
}

function bfHeader(ctx, menu) {
  const { c, H } = ctx;
  const links = (menu || []).map(m => `<a href="${H.curl(m.slug)}">${H.esc(m.name)}</a>`).join('');
  return `<body>
<header class="${c('capa')}"><div class="${c('capain')}">
${bfLogo(ctx, 'firma', true)}
<nav class="${c('rota')}" aria-label="Editorias">${links}</nav>
</div></header>
<main class="${c('area')}">`;
}

function bfFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const eds = (menu || []).map(m => `<a href="${H.curl(m.slug)}">${H.esc(m.name)}</a>`).join('');
  return `</main>
<footer class="${c('base')}"><div class="${c('basein')}">
<div class="${c('bgrade')}">
<div>${bfLogo(ctx, 'firma')}<p class="${c('bsobre')}">${H.esc(site.description || site.tagline || '')}</p></div>
<div><h2>Editorias</h2>${eds}</div>
<div><h2>Institucional</h2>${H.instLinks()}</div>
<div><h2>Redação</h2>
<a href="/contato/">Falar com a redação</a>
<a href="/contato/">Sugerir uma pauta</a>
<a href="/contato/">Apontar uma correção</a>
<a href="/busca/">Buscar no acervo</a></div>
</div>
<div class="${c('bfim')}">&copy; ${H.year()} ${H.esc(site.name)}. Conteúdo informativo, não substitui consulta médica. ${H.esc(site.domain)}</div>
</div></footer>
${H.bodyEnd()}`;
}

/* A linha fina so vale quando diz algo que o corpo ainda nao disse. A importacao
   grava o dek copiando o comeco do texto. O campo NAO e apagado do dado: as
   chamadas usam o mesmo dek, e apagar deixaria o cartao so com titulo. */
function bfOlhoVale(art) {
  if (!art) return '';
  const d = String(art.dek || '').trim();
  if (!d) return '';
  const chato = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const corpo = chato(String(art.content || '').replace(/<[^>]+>/g, ' ')).slice(0, 600);
  const cd = chato(d);
  if (cd.length >= 30 && corpo.indexOf(cd.slice(0, 60)) >= 0) return '';
  return d;
}

function bfLegenda(ctx, art) {
  const alt = art.image && art.image.alt ? String(art.image.alt).trim() : '';
  if (!alt) return '';
  const chato = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const cAlt = chato(alt), cTit = chato(art.title), cSlug = chato(art.slug);
  if (cAlt === cTit || cAlt === cSlug) return '';
  if (cAlt.length >= 20 && (cTit.indexOf(cAlt) === 0 || cAlt.indexOf(cTit) === 0)) return '';
  return alt;
}

function bfLinha(ctx, a) {
  const { c, H } = ctx;
  const calha = a.image
    ? `<span class="im">${H.pic(a, false)}</span>`
    : `<span class="vaga"></span>`;
  return `<a class="${c('linha')}" href="${H.url(a)}">${calha}`
    + `<span class="tx"><span class="${c('etiq')}">${H.cat(a)}<span>${H.esc(H.dateShort(a.date))}</span></span>`
    + `<span class="h">${H.esc(a.title)}</span></span></a>`;
}

function bfTarja(ctx, nome, cs, nivel) {
  const { c, H } = ctx;
  const t = nivel === 1 ? 'h1' : 'h2';
  return `<div class="${c('tarja')}"><${t}>${H.esc(nome)}</${t}>`
    + `${cs ? `<a class="ver" href="${H.curl(cs)}">Ver tudo</a>` : ''}</div>`;
}

/* A pauta preenche por COLUNA, e o numero de linhas vai numa variavel calculada
   aqui: cada chamada tem a sua, porque o bloco da home corta em 8 e a listagem
   usa a lista inteira. */
function bfPauta(ctx, itens) {
  const { c } = ctx;
  const linhas = Math.ceil(itens.length / 2);
  return `<div class="${c('pauta')}" style="--l:${linhas}">`
    + itens.map(a => bfLinha(ctx, a)).join('') + `</div>`;
}

function bfHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const pref = ctx.site.heroFrom;
  const lista = arts.slice();
  let top = lista[0];
  if (pref) {
    const i = lista.findIndex(a => a.category && a.category.slug === pref);
    if (i > 0) top = lista[i];
  }
  const resto = lista.filter(a => a !== top);
  const dTop = bfOlhoVale(top) || (top && top.excerpt) || '';
  const chamada = top
    ? `<a class="${c('chamada')}" href="${H.url(top)}">`
      + `<span class="tx"><span class="${c('etiq')}">${H.cat(top)}<span>${H.esc(H.dateShort(top.date))}</span></span>`
      + `<span class="h">${H.esc(top.title)}</span>`
      + `${dTop ? `<span class="d">${H.esc(H.corta(dTop, 185))}</span>` : ''}</span>`
      + `${top.image ? `<span class="im">${H.pic(top, true)}</span>` : ''}</a>`
    : '';

  const usados = new Set(top ? [top.slug] : []);
  const porCat = new Map();
  for (const a of resto) {
    if (!a.category) continue;
    const k = a.category.slug;
    if (!porCat.has(k)) porCat.set(k, { nome: a.category.name, itens: [] });
    porCat.get(k).itens.push(a);
  }
  const fixas = Array.isArray(ctx.site.homeSections) ? ctx.site.homeSections : null;
  const ordem = fixas
    ? fixas.filter(k => porCat.has(k))
    : Array.from(porCat.keys()).sort((a, b) => porCat.get(b).itens.length - porCat.get(a).itens.length);

  const blocos = ordem.map(k => {
    const g = porCat.get(k);
    const livres = g.itens.filter(a => !usados.has(a.slug));
    if (!livres.length) return '';
    // par, para as duas colunas fecharem sem buraco na ultima linha
    const n = Math.min(livres.length - (livres.length % 2), 8) || livres.length;
    const itens = livres.slice(0, n);
    itens.forEach(a => usados.add(a.slug));
    return `<section class="${c('bloco')}">${bfTarja(ctx, g.nome, k, 2)}${bfPauta(ctx, itens)}</section>`;
  }).filter(Boolean).slice(0, 8).join('\n');

  return `${H.head(ctx, H.homeMeta(ctx.site))}
${bfHeader(ctx, menu)}
${H.h1(ctx)}
${chamada}
${blocos}
${bfFooter(ctx, menu)}`;
}

function bfArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;

  let corpo = String(art.content).replace(/<table\b/gi, '<table role="table"');
  corpo = corpo
    .replace(/<table\b[\s\S]*?<\/table>/gi, m => `<div class="${c('escorre')}">${m}</div>`)
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, m => `<div class="${c('escorre')}">${m}</div>`);

  const eq = (ctx.site.equipe || []).find(x => x.nome === art.author);
  const rosto = eq
    ? `<a class="${c('rosto')}" rel="author" href="/autor/${H.esc(eq.slug)}/">`
      + `<img src="/img/autores/${H.esc(eq.slug)}.webp" width="38" height="38" alt="" aria-hidden="true" loading="lazy">`
      + `<span>${H.esc(eq.nome)}</span></a>`
    : `<span class="${c('rosto')}"><span>${H.esc(art.author || ctx.site.name)}</span></span>`;

  const u = encodeURIComponent(P.absUrl), t = encodeURIComponent(art.title);
  const calha = `<dl class="${c('calha')}">`
    + `<dt>Assina</dt><dd>${rosto}</dd>`
    + `<dt>Publicado</dt><dd>${H.esc(P.dstr)}</dd>`
    + `<dt>Leitura</dt><dd>${P.readMin} minutos</dd>`
    + `<dt>Compartilhar</dt><dd><span class="${c('espalha')}">`
    + `<a href="https://api.whatsapp.com/send/?text=${t}%20${u}" target="_blank" rel="noopener">WhatsApp</a>`
    + `<a href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener">Facebook</a>`
    + `<a href="https://twitter.com/intent/tweet?url=${u}&text=${t}" target="_blank" rel="noopener">X</a>`
    + `</span></dd></dl>`;

  const leg = bfLegenda(ctx, art);
  const quadro = art.image
    ? `<figure class="${c('quadro')}">${H.pic(art, true)}${leg ? `<figcaption>${H.esc(leg)}</figcaption>` : ''}</figure>`
    : '';
  const olho = bfOlhoVale(art);

  const depois = (related || []).length
    ? `<section class="${c('depois')}">${bfTarja(ctx, 'Veja também', null, 2)}`
      + bfPauta(ctx, related.slice(0, 4)) + `</section>`
    : '';

  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${bfHeader(ctx, menu)}
${H.progressBar(ctx)}
${H.crumbs(ctx, art, P)}
<article class="${c('obra')}">
<div class="${c('miolo')}">
<span class="${c('etiq')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${olho ? `<span class="${c('olho')}">${H.esc(olho)}</span>` : ''}
${quadro}
<div class="${c('prosa')}">${corpo}</div>
${depois}
</div>
${calha}
</article>
${bfFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

/* A listagem precisa de h1 proprio: sem ele a pagina de editoria sobe sem
   titulo de nivel 1 e o cartao vira o primeiro heading da pagina. */
function bfList(ctx, opts) {
  const { c, H } = ctx;
  const itens = opts.items || [];
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${bfHeader(ctx, opts.menu)}
<div style="margin-top:26px">
${bfTarja(ctx, opts.title, null, 1)}
${opts.desc ? `<p class="${c('olho')}" style="margin:16px 0 8px">${H.esc(opts.desc)}</p>` : ''}
${bfPauta(ctx, itens)}
</div>
${bfFooter(ctx, opts.menu)}`;
}
