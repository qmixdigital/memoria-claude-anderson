/* ===================== ARCH BE =====================
   Portal: ortopediacoluna.com.br  ("Ortopedia Coluna")

   Conceito: CAMADAS. O portal trata de coluna, e a pagina se organiza como um
   corte em estratos: FAIXAS horizontais de sangria total que se alternam entre
   o papel e um tom lavado da cor da marca. Cada faixa e uma editoria, e o
   unico ornamento e uma BARRA CURTA E GROSSA da cor viva acima do titulo da
   faixa. Nao ha moldura, nao ha sombra e nao ha cartao: o que separa um assunto
   do proximo e a troca de fundo.

   🔴 A COR VIVA NAO VIRA TEXTO. O ciano do logotipo (#00d0f0) da 1,86:1 sobre
   branco, menos da metade da regua da WCAG. Ele existe aqui para a barra da
   faixa, o filete e a borda, e nada mais. Todo texto de acento usa o azul
   #2050a0 do proprio logotipo, que da 7,73:1. Quem pinta o link do corpo, que
   e o backlink do cliente, e esse azul.

   Deliberadamente diferente da BD, que e a vizinha na mesma maquina:
   - a BD tem cabecalho em DUAS linhas com filete separando marca e editorias.
     Aqui e UMA linha, marca a esquerda e editorias a direita, fechada por uma
     regua de 3px na cor viva;
   - a BD e um FICHARIO: indice de dois digitos abrindo cada chamada e ficha
     deitada com miniatura quadrada de 104px. Aqui nao ha numero nenhum e o
     cartao e VERTICAL, com foto 16/9 em cima;
   - a BD monta a home em grade de 2 colunas de ficha. Aqui a home e uma pilha
     de FAIXAS de sangria total, e a grade dentro de cada faixa e de 3 colunas;
   - a BD nao pinta fundo em lugar nenhum. Aqui a alternancia de fundo e o
     assunto da pagina;
   - a BD resolve o artigo em coluna de 74ch corrida. Aqui a abertura do artigo
     mora dentro de uma faixa lavada, de sangria total, e so o corpo volta para
     a coluna.

   A chave tem DUAS letras: o deploy precisa casar a marca ARCH BE inteira,
   nunca so ARCH B.

   Nao existe aria-expanded no cabecalho de proposito: e o motor que injeta o
   menu sanfonado, no funil unico, e ele desiste se achar um. Ver _menuSanfona
   no render.js.

   Nada centralizado alem da marca. Paragrafo, lista e FAQ sempre a esquerda.
*/
function beCss(ctx) {
  const { s } = ctx;
  return `
:root{
--beac:var(--p);--beink:var(--ink);--bepaper:var(--paper);
/* a cor viva do logotipo, so para barra, filete e borda. Ela nunca pinta texto */
--bevivo:#00d0f0;
--befio:color-mix(in srgb,var(--ink) 12%,transparent);
--befio2:color-mix(in srgb,var(--ink) 6%,transparent);
/* 68% e o piso medido: a 55% a razao com o papel cai abaixo de 4,5:1, e este e
   o tom do resumo, da data e da assinatura, ou seja, meia pagina */
--befraco:color-mix(in srgb,var(--ink) 68%,transparent);
--belavado:color-mix(in srgb,var(--p) 5%,var(--paper));
--bepad:24px;--begap:32px
}
body{background:var(--bepaper);color:var(--beink)}
${s('cx')}{max-width:var(--maxw);margin:0 auto;padding:0 var(--bepad);box-sizing:border-box;width:100%}
${s('cx')} > *{min-width:0}

/* ---------- cabecalho: uma linha, fechada por regua da cor viva ---------- */
${s('alto')}{background:var(--bepaper);border-bottom:3px solid var(--bevivo)}
${s('altoin')}{max-width:var(--maxw);margin:0 auto;padding:18px var(--bepad);box-sizing:border-box;display:flex;align-items:center;gap:14px 32px;flex-wrap:wrap}
${s('sinete')}{display:inline-flex;align-items:center;gap:11px;text-decoration:none;color:inherit;flex:none}
${s('sinete')} img{display:block;height:38px;width:auto;flex:none}
${s('sinete')} ${s('gliv')}{display:block;flex:none;line-height:0}
${s('sinete')} ${s('gliv')} svg{display:block;width:38px;height:38px}
${s('sinete')} span{display:flex;flex-direction:column;gap:2px;min-width:0}
${s('sinete')} b{font-family:var(--fd);font-weight:700;font-size:24px;line-height:1.05;letter-spacing:-.022em;color:var(--beink);white-space:nowrap}
${s('sinete')} i{font-style:normal;font-family:var(--fb);font-size:9.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--befraco);white-space:nowrap}
${s('sinete')}:hover b{color:var(--beac)}
${s('trilho')}{display:flex;flex-wrap:wrap;align-items:center;gap:4px 26px;flex:1}
${s('trilho')} a{font-family:var(--fb);font-size:14px;font-weight:600;color:var(--befraco);text-decoration:none;padding:7px 0;position:relative;transition:color .16s ease}
${s('trilho')} a::after{content:"";position:absolute;left:0;right:0;bottom:2px;height:3px;background:var(--bevivo);transform:scaleX(0);transform-origin:left;transition:transform .16s ease}
${s('trilho')} a:hover{color:var(--beink)}
${s('trilho')} a:hover::after{transform:scaleX(1)}

/* ---------- atomos ---------- */
${s('chapeu')}{display:inline-flex;align-items:center;gap:9px;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:var(--kls,.14em);text-transform:uppercase;color:var(--beac)}
${s('chapeu')} span{color:var(--befraco);font-weight:500;letter-spacing:.07em}
${s('chapeu')} a{color:inherit;text-decoration:none}
${s('chapeu')} a:hover{text-decoration:underline;text-underline-offset:3px}
/* a barra curta e grossa e o unico ornamento da arquitetura */
/* a barra fica ACIMA da linha do titulo, e o titulo divide essa linha com o
   link de ver tudo, encostado a direita. Solto embaixo o link lia como
   subtitulo da editoria, e nao como link */
${s('titulo')}{margin:0 0 26px}
${s('titulo')}::before{content:"";display:block;width:46px;height:5px;background:var(--bevivo);margin:0 0 13px}
${s('titulo')} .lin{display:flex;align-items:baseline;justify-content:space-between;gap:10px 22px;flex-wrap:wrap}
${s('titulo')} h1,${s('titulo')} h2{font-family:var(--fd);font-weight:700;font-size:clamp(20px,2.1vw,26px);line-height:1.18;letter-spacing:-.018em;color:var(--beink);margin:0;text-align:left}
${s('titulo')} .mais{flex:none;font-family:var(--fb);font-size:12.5px;font-weight:600;color:var(--befraco);text-decoration:none;white-space:nowrap}
${s('titulo')} .mais:hover{color:var(--beac);text-decoration:underline;text-underline-offset:3px}

/* ---------- a faixa de sangria total, que se alterna ---------- */
${s('faixa')}{padding:46px 0}
${s('faixa')}${s('par')}{background:var(--belavado)}
${s('faixain')}{max-width:var(--maxw);margin:0 auto;padding:0 var(--bepad);box-sizing:border-box}

/* ---------- abertura: texto a esquerda, foto a direita ---------- */
${s('largo')}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);gap:0 40px;align-items:center;margin:36px 0 8px;text-decoration:none;color:inherit}
${s('largo')} .tx{display:flex;flex-direction:column;gap:15px;text-align:left}
${s('largo')} .im{display:block;overflow:hidden;background:var(--ph);aspect-ratio:var(--hero-ar,16/9);border-radius:var(--rad-lg,4px)}
${s('largo')} .im img{width:100%;height:100%;object-fit:cover;display:block}
${s('largo')} .h{font-family:var(--fd);font-weight:700;font-size:clamp(27px,3.2vw,40px);line-height:1.11;letter-spacing:-.024em;color:var(--beink);margin:0;text-align:left}
${s('largo')}:hover .h{color:var(--beac)}
${s('largo')} .d{font-family:var(--fb);font-size:16.5px;font-weight:400;line-height:1.68;color:var(--befraco);margin:0;text-align:left;max-width:52ch}

/* ---------- o cartao vertical, foto em cima ---------- */
${s('grelha')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:34px var(--begap)}
${s('carta')}{display:flex;flex-direction:column;gap:11px;text-decoration:none;color:inherit;min-width:0}
${s('carta')} .im{display:block;width:100%;overflow:hidden;background:var(--ph);aspect-ratio:var(--card-ar,16/9);border-radius:var(--rad,4px)}
${s('carta')} .im img{width:100%;height:100%;object-fit:cover;display:block}
${s('carta')} .h{font-family:var(--fd);font-weight:600;font-size:19px;line-height:1.26;letter-spacing:-.012em;color:var(--beink);margin:0;text-align:left}
${s('carta')}:hover .h{color:var(--beac)}
${s('carta')} .d{font-family:var(--fb);font-size:14px;font-weight:400;line-height:1.64;color:var(--befraco);margin:0;text-align:left}
/* sem foto o cartao ganha uma tarja da cor viva no lugar da imagem, e a fileira
   nao fica com um buraco no meio */
${s('semfoto')} .vaga{display:block;width:100%;aspect-ratio:var(--card-ar,16/9);background:var(--belavado);border-top:5px solid var(--bevivo);border-radius:var(--rad,4px)}

/* ---------- artigo: abertura em faixa lavada, corpo em coluna ---------- */
${s('abertura')}{background:var(--belavado);border-bottom:1px solid var(--befio);padding:30px 0 34px;margin:0 0 34px}
${s('aberturain')}{max-width:74ch;margin:0 auto;padding:0 var(--bepad);box-sizing:border-box}
${s('aberturain')} h1{font-family:var(--fd);font-weight:700;font-size:clamp(28px,3.5vw,43px);line-height:1.11;letter-spacing:-.025em;color:var(--beink);margin:9px 0 15px;text-align:left}
${s('linhafina')}{display:block;font-family:var(--fb);font-size:18.5px;font-weight:400;line-height:1.63;color:var(--befraco);margin:0 0 20px;text-align:left}
${s('credito')}{display:flex;align-items:center;gap:13px 18px;flex-wrap:wrap}
${s('pluma')}{display:flex;align-items:center;gap:11px;text-decoration:none;color:inherit}
${s('pluma')} img{width:40px;height:40px;object-fit:cover;background:var(--ph);flex:none;border-radius:50%}
${s('pluma')} b{display:block;font-family:var(--fd);font-weight:700;font-size:14.5px;line-height:1.24;color:var(--beink)}
${s('pluma')}:hover b{color:var(--beac)}
${s('pluma')} i{display:block;font-style:normal;font-family:var(--fb);font-size:11px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:var(--befraco);margin-top:3px}
${s('quando')}{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.06em;color:var(--befraco);text-transform:uppercase;margin-left:auto}
${s('peca')}{max-width:74ch;margin:0 auto;padding:0 var(--bepad);box-sizing:border-box}
${s('foto')}{margin:0 0 28px}
/* 🔴 height:auto nao e enfeite. A tag ja traz width e height, mas o navegador
   so usa esse par para reservar a altura quando o CSS deixa a altura livre.
   Com width:100% sozinho a reserva nao acontece e a pagina pula quando a foto
   chega, o que conta como CLS. */
${s('foto')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg,4px)}
${s('foto')} figcaption{font-family:var(--fb);font-size:12.5px;font-weight:400;line-height:1.6;color:var(--befraco);padding:10px 0 0;text-align:left}

${s('texto')}{font-family:var(--fb);font-size:18px;font-weight:400;line-height:1.78;color:var(--beink)}
${s('texto')} p{margin:0 0 1.25em;text-align:left}
/* o h2 do corpo repete a barra curta da faixa, em tamanho menor: e o mesmo
   ornamento, e por isso a pagina inteira le como uma coisa so */
${s('texto')} h2{font-family:var(--fd);font-weight:700;font-size:23px;line-height:1.3;letter-spacing:-.016em;color:var(--beink);margin:2em 0 .6em;scroll-margin-top:22px;text-align:left}
${s('texto')} h2::before{content:"";display:block;width:34px;height:4px;background:var(--bevivo);margin:0 0 11px}
${s('texto')} h3{font-family:var(--fb);font-weight:700;font-size:17px;line-height:1.45;color:var(--beink);margin:1.7em 0 .5em;scroll-margin-top:22px;text-align:left}
${s('texto')} a{color:var(--beac);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
${s('texto')} a:hover{color:var(--beink)}
${s('texto')} ul,${s('texto')} ol{margin:0 0 1.25em;padding-left:1.35em;text-align:left}
${s('texto')} li{margin-bottom:.5em}
${s('texto')} img{max-width:100%;height:auto;display:block;margin:1.7em 0;border-radius:var(--rad,4px)}
${s('texto')} blockquote{margin:1.9em 0;padding:0 0 0 22px;border-left:5px solid var(--bevivo);font-family:var(--fd);font-weight:500;font-size:19.5px;line-height:1.5;color:var(--beink);text-align:left}
${s('texto')} blockquote p{margin:0 0 .5em;font-family:inherit;font-size:inherit;line-height:inherit}
${s('texto')} blockquote p:last-child{margin-bottom:0}
${s('texto')} table{width:100%;border-collapse:collapse;margin:0;font-family:var(--fb);font-size:14.5px;min-width:440px}
${s('texto')} table caption{font-family:var(--fb);font-size:12.5px;color:var(--befraco);text-align:left;padding-bottom:9px}
${s('texto')} table th,${s('texto')} table td{border:0;border-bottom:1px solid var(--befio);padding:11px 14px 11px 0;text-align:left;vertical-align:top}
${s('texto')} table thead th{border-bottom:3px solid var(--bevivo);font-weight:700}
${s('rola')}{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%;margin:1.7em 0}
${s('texto')} pre{margin:0;padding:16px 18px;background:var(--belavado);border-radius:var(--rad,4px);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:1.62}
${s('texto')} code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.88em;background:var(--belavado);padding:2px 6px;border-radius:3px}
${s('texto')} pre code{background:none;padding:0}

/* tabela vira cartao no celular: sem isto ela sai da tela e o gesto de arrastar
   nao e descoberto. O cabecalho sai da tela mas continua no DOM */
@media(max-width:640px){
${s('texto')} table{min-width:0;display:block;width:auto;overflow:visible}
${s('texto')} table caption{display:none}
${s('texto')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
${s('texto')} table tbody,${s('texto')} table tr,${s('texto')} table th,${s('texto')} table td{display:block;width:auto}
${s('texto')} table tbody tr{background:var(--bepaper);border:1px solid var(--befio);border-radius:12px;padding:2px 16px 14px;margin-bottom:12px}
${s('texto')} table tbody th,${s('texto')} table tbody td{border:0;background:transparent;padding:0}
${s('texto')} table tbody th{border-bottom:1px solid var(--befio);padding:13px 0 11px;font-weight:700;text-align:left}
${s('texto')} table tbody td{padding:12px 0 0;text-align:left;line-height:1.5}
${s('texto')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--befraco)}
}

/* ---------- relacionados: mesma largura da coluna do artigo ---------- */
${s('adiante')}{max-width:74ch;margin:44px auto 0;padding:0 var(--bepad);box-sizing:border-box}
${s('adiante')} h2{font-family:var(--fd);font-weight:700;font-size:20px;line-height:1.22;letter-spacing:-.016em;color:var(--beink);margin:0 0 16px;text-align:left}
${s('adiante')} h2::before{content:"";display:block;width:34px;height:4px;background:var(--bevivo);margin:0 0 11px}
${s('fila')}{display:flex;flex-direction:column}
${s('elo')}{display:grid;grid-template-columns:76px minmax(0,1fr);gap:0 15px;align-items:center;padding:14px 0;border-top:1px solid var(--befio2);text-decoration:none;color:inherit}
${s('elo')} .im{display:block;width:100%;aspect-ratio:1/1;overflow:hidden;background:var(--ph);border-radius:var(--rad-sm,3px)}
${s('elo')} .im img{width:100%;height:100%;object-fit:cover;display:block}
${s('elo')} .h{font-family:var(--fd);font-weight:600;font-size:16px;line-height:1.28;color:var(--beink);text-align:left}
${s('elo')}:hover .h{color:var(--beac)}

/* ---------- listagem ---------- */
${s('rol')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:34px var(--begap)}

/* ---------- rodape ---------- */
/* em paleta escura o fundo e o texto do rodape saem de footerBg e footerTx, e
   nunca de ink e do tom legivel sobre a primaria: usar aqueles dois deixa o
   rodape claro com texto claro */
${s('rodape')}{background:var(--footer-bg);color:var(--footer-tx);margin-top:64px;border-top:5px solid var(--bevivo)}
${s('rodapein')}{max-width:var(--maxw);margin:0 auto;padding:46px var(--bepad) 26px;box-sizing:border-box}
${s('rgrid')}{display:grid;grid-template-columns:1.7fr 1fr 1fr 1fr;gap:36px;margin-bottom:30px}
${s('rgrid')} h2{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.19em;text-transform:uppercase;color:#fff;margin:0 0 14px}
${s('rgrid')} a{display:block;font-family:var(--fb);font-size:14px;font-weight:400;color:var(--footer-tx);text-decoration:none;padding:5px 0}
${s('rgrid')} a:hover{color:#fff}
${s('rodape')} ${s('sinete')} b{color:#fff}
${s('rodape')} ${s('sinete')} i{color:var(--footer-tx)}
${s('rodape')} ${s('sinete')}:hover b{color:var(--bevivo)}
${s('rsobre')}{font-family:var(--fb);font-size:14px;font-weight:400;line-height:1.75;color:var(--footer-tx);margin-top:16px;max-width:44ch;text-align:left}
${s('rbase')}{border-top:1px solid color-mix(in srgb,var(--footer-tx) 22%,transparent);padding-top:18px;font-family:var(--fb);font-size:12.5px;font-weight:400;line-height:1.75;color:var(--footer-tx);text-align:left}

/* ---------- respiro ---------- */
@media(max-width:1000px){
${s('grelha')},${s('rol')}{grid-template-columns:repeat(2,minmax(0,1fr))}
${s('rgrid')}{grid-template-columns:1fr 1fr;gap:30px}
}
@media(max-width:760px){
${s('largo')}{grid-template-columns:minmax(0,1fr);gap:20px}
${s('largo')} .tx{order:2}
${s('largo')} .im{order:1}
${s('largo')} .h{font-size:28px}
${s('largo')} .d{max-width:none;font-size:15.5px}
${s('grelha')},${s('rol')}{grid-template-columns:minmax(0,1fr);gap:30px}
${s('faixa')}{padding:34px 0}
${s('texto')}{font-size:17px;line-height:1.75}
${s('texto')} h2{font-size:21px}
${s('rgrid')}{grid-template-columns:1fr;gap:24px}
}
@media(max-width:520px){
:root{--bepad:16px}
${s('sinete')} b{font-size:21px}
${s('sinete')} img,${s('sinete')} ${s('gliv')} svg{height:32px;width:auto}
${s('aberturain')} h1{font-size:27px}
${s('quando')}{margin-left:0}
}
${s('largo')} > *,${s('grelha')} > *,${s('rol')} > *,${s('elo')} > *,${s('rgrid')} > *{min-width:0}
${s('largo')} .h,${s('carta')} .h,${s('elo')} .h,${s('aberturain')} h1{overflow-wrap:break-word}
html,body{max-width:100%;overflow-x:hidden}
`;
}

/* A marca prefere o arquivo que veio do WordPress da origem: ele foi feito por
   designer e le melhor que qualquer glifo que eu desenhe. So quando o portal
   nao tem arquivo e que entra o simbolo, uma cruz com o eixo da coluna. */
function beLogo(ctx, cls, usarArquivo) {
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

function beHeader(ctx, menu) {
  const { c, H } = ctx;
  const links = (menu || []).map(m => `<a href="${H.curl(m.slug)}">${H.esc(m.name)}</a>`).join('');
  return `<body>
<header class="${c('alto')}"><div class="${c('altoin')}">
${beLogo(ctx, 'sinete', true)}
<nav class="${c('trilho')}" aria-label="Editorias">${links}</nav>
</div></header>
<main>`;
}

function beFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const eds = (menu || []).map(m => `<a href="${H.curl(m.slug)}">${H.esc(m.name)}</a>`).join('');
  return `</main>
<footer class="${c('rodape')}"><div class="${c('rodapein')}">
<div class="${c('rgrid')}">
<div>${beLogo(ctx, 'sinete')}<p class="${c('rsobre')}">${H.esc(site.description || site.tagline || '')}</p></div>
<div><h2>Editorias</h2>${eds}</div>
<div><h2>Institucional</h2>${H.instLinks()}</div>
<div><h2>Redação</h2>
<a href="/contato/">Falar com a redação</a>
<a href="/contato/">Sugerir uma pauta</a>
<a href="/contato/">Corrigir uma informação</a>
<a href="/busca/">Buscar no acervo</a></div>
</div>
<div class="${c('rbase')}">&copy; ${H.year()} ${H.esc(site.name)}. Conteúdo informativo, não substitui consulta médica. ${H.esc(site.domain)}</div>
</div></footer>
${H.bodyEnd()}`;
}

/* A linha fina so vale quando diz algo que o corpo ainda nao disse. A importacao
   grava o dek copiando o comeco do texto, e ai o leitor le a mesma frase duas
   vezes. O campo NAO e apagado do dado: as chamadas da home e da listagem usam
   o mesmo dek, e apagar deixaria o cartao so com titulo. A decisao mora aqui. */
function beDekVale(art) {
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

/* A legenda so entra quando diz algo que o titulo nao disse. Metade do acervo
   importado traz o alt como copia do titulo ou do slug. */
function beLegenda(ctx, art) {
  const alt = art.image && art.image.alt ? String(art.image.alt).trim() : '';
  if (!alt) return '';
  const chato = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const cAlt = chato(alt), cTit = chato(art.title), cSlug = chato(art.slug);
  if (cAlt === cTit || cAlt === cSlug) return '';
  if (cAlt.length >= 20 && (cTit.indexOf(cAlt) === 0 || cAlt.indexOf(cTit) === 0)) return '';
  return alt;
}

function beCarta(ctx, a) {
  const { c, H } = ctx;
  const d = beDekVale(a) || a.excerpt || '';
  const capa = a.image
    ? `<span class="im">${H.pic(a, false)}</span>`
    : `<span class="vaga"></span>`;
  return `<a class="${c('carta')}${a.image ? '' : ' ' + c('semfoto')}" href="${H.url(a)}">`
    + capa
    + `<span class="${c('chapeu')}">${H.cat(a)}<span>${H.esc(H.dateShort(a.date))}</span></span>`
    + `<span class="h">${H.esc(a.title)}</span>`
    + `${d ? `<span class="d">${H.esc(H.corta(d, 104))}</span>` : ''}</a>`;
}

function beTitulo(ctx, nome, cs, nivel) {
  const { c, H } = ctx;
  const t = nivel === 1 ? 'h1' : 'h2';
  return `<div class="${c('titulo')}"><div class="lin"><${t}>${H.esc(nome)}</${t}>`
    + `${cs ? `<a class="mais" href="${H.curl(cs)}">Tudo em ${H.esc(nome)}</a>` : ''}</div></div>`;
}

function beHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const pref = ctx.site.heroFrom;
  const lista = arts.slice();
  let top = lista[0];
  if (pref) {
    const i = lista.findIndex(a => a.category && a.category.slug === pref);
    if (i > 0) top = lista[i];
  }
  const resto = lista.filter(a => a !== top);
  const dTop = beDekVale(top) || (top && top.excerpt) || '';
  const abre = top
    ? `<a class="${c('largo')}" href="${H.url(top)}">`
      + `<span class="tx"><span class="${c('chapeu')}">${H.cat(top)}<span>${H.esc(H.dateShort(top.date))}</span></span>`
      + `<span class="h">${H.esc(top.title)}</span>`
      + `${dTop ? `<span class="d">${H.esc(H.corta(dTop, 190))}</span>` : ''}</span>`
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

  // a grade e de 3 colunas: a faixa entra com 3 ou 6, para a ultima fileira
  // nunca ficar com buraco ao lado dos ultimos cartoes
  let n = 0;
  const faixas = ordem.map(k => {
    const g = porCat.get(k);
    const livres = g.itens.filter(a => !usados.has(a.slug));
    const quantos = livres.length >= 6 ? 6 : (livres.length >= 3 ? 3 : 0);
    if (!quantos) return '';
    const itens = livres.slice(0, quantos);
    itens.forEach(a => usados.add(a.slug));
    n += 1;
    return `<section class="${c('faixa')}${n % 2 === 0 ? ' ' + c('par') : ''}">`
      + `<div class="${c('faixain')}">${beTitulo(ctx, g.nome, k, 2)}`
      + `<div class="${c('grelha')}">${itens.map(a => beCarta(ctx, a)).join('')}</div></div></section>`;
  }).filter(Boolean).slice(0, 6).join('\n');

  return `${H.head(ctx, H.homeMeta(ctx.site))}
${beHeader(ctx, menu)}
${H.h1(ctx)}
<div class="${c('cx')}">${abre}</div>
${faixas}
${beFooter(ctx, menu)}`;
}

function beArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;

  let corpo = String(art.content).replace(/<table\b/gi, '<table role="table"');
  corpo = corpo
    .replace(/<table\b[\s\S]*?<\/table>/gi, m => `<div class="${c('rola')}">${m}</div>`)
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, m => `<div class="${c('rola')}">${m}</div>`);

  const eq = (ctx.site.equipe || []).find(x => x.nome === art.author);
  const pluma = eq
    ? `<a class="${c('pluma')}" rel="author" href="/autor/${H.esc(eq.slug)}/">`
      + `<img src="/img/autores/${H.esc(eq.slug)}.webp" width="40" height="40" alt="" aria-hidden="true" loading="lazy">`
      + `<span><b>${H.esc(eq.nome)}</b><i>${P.readMin} min de leitura</i></span></a>`
    : `<span class="${c('pluma')}"><span><b>${H.esc(art.author || ctx.site.name)}</b><i>${P.readMin} min de leitura</i></span></span>`;

  const leg = beLegenda(ctx, art);
  const figura = art.image
    ? `<figure class="${c('foto')}">${H.pic(art, true)}${leg ? `<figcaption>${H.esc(leg)}</figcaption>` : ''}</figure>`
    : '';
  const dek = beDekVale(art);

  const adiante = (related || []).length
    ? `<section class="${c('adiante')}"><h2>Veja também em ${H.esc(P.catName)}</h2><div class="${c('fila')}">`
      + related.slice(0, 4).map(a => `<a class="${c('elo')}" href="${H.url(a)}">`
        + `${a.image ? `<span class="im">${H.pic(a, false)}</span>` : `<span class="im"></span>`}`
        + `<span class="h">${H.esc(a.title)}</span></a>`).join('')
      + `</div></section>`
    : '';

  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${beHeader(ctx, menu)}
${H.progressBar(ctx)}
<div class="${c('cx')}">${H.crumbs(ctx, art, P)}</div>
<div class="${c('abertura')}"><div class="${c('aberturain')}">
<span class="${c('chapeu')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${dek ? `<span class="${c('linhafina')}">${H.esc(dek)}</span>` : ''}
<div class="${c('credito')}">${pluma}<span class="${c('quando')}">${H.esc(P.dstr)}</span></div>
</div></div>
<article class="${c('peca')}">
${figura}
<div class="${c('texto')}">${corpo}</div>
${H.share(ctx, P)}
</article>
${adiante}
${beFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

/* A listagem precisa de h1 proprio: sem ele a pagina de editoria sobe sem
   titulo de nivel 1 e o cartao vira o primeiro heading da pagina. */
function beList(ctx, opts) {
  const { c, H } = ctx;
  const itens = opts.items || [];
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${beHeader(ctx, opts.menu)}
<div class="${c('cx')}" style="padding-top:34px">
${beTitulo(ctx, opts.title, null, 1)}
${opts.desc ? `<p class="${c('rsobre')}" style="color:var(--befraco);margin:-14px 0 26px">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('rol')}">${itens.map(a => beCarta(ctx, a)).join('')}</div>
</div>
${beFooter(ctx, opts.menu)}`;
}
