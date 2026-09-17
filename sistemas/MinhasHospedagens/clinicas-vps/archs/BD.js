/* ===================== ARCH BD =====================
   Portal: seuguiadesaude.com.br  ("Seu Guia de Saúde")

   Conceito: FICHARIO. O portal nao e noticiario, e consulta: o leitor chega do
   Google com uma duvida objetiva (para que serve, quanto custa, faz mal) e quer
   achar a resposta e sair. Entao a pagina se organiza como uma FICHA, e o unico
   motivo grafico e o INDICE NUMERADO: um numero de dois digitos na cor de
   acento, que abre cada chamada e volta como contador nos subtitulos do artigo.

   Deliberadamente diferente da BC, que e a vizinha mais proxima na tabela:
   - a BC tem cabecalho em FAIXA ESCURA de sangria total. Aqui o cabecalho e
     claro, em duas linhas, com a marca em cima e as editorias embaixo,
     separadas por um filete;
   - a BC embrulha TUDO em cartao com moldura de 1px. Aqui nao existe moldura
     nenhuma: o que separa e filete horizontal e ar;
   - a BC abre com a foto A ESQUERDA e o texto a direita. Aqui e o contrario,
     texto a esquerda e foto a direita, que e a ordem que o CLAUDE.md pede;
   - a BC monta grade de 3 e 4 colunas de cartao vertical. Aqui a grade e de 2
     colunas de ficha DEITADA, miniatura a esquerda e texto a direita;
   - a BC nao numera nada. Aqui o indice de dois digitos e o assunto da pagina.

   A chave tem DUAS letras: o deploy precisa casar a marca ARCH BD inteira,
   nunca so ARCH B.

   Nao existe aria-expanded no cabecalho de proposito: e o motor que injeta o
   menu sanfonado, no funil unico, e ele desiste se achar um. Ver _menuSanfona
   no render.js.
*/
function bdCss(ctx) {
  const { s, c } = ctx;
  return `
:root{
--bdac:var(--p);--bdink:var(--ink);--bdpaper:var(--paper);
--bdfio:color-mix(in srgb,var(--ink) 13%,transparent);
--bdfio2:color-mix(in srgb,var(--ink) 7%,transparent);
/* 65% e o piso: a 55% a razao com o papel cai para 3,69:1, abaixo da regua,
   e este e o tom do resumo, da data e do rodape, ou seja, meia pagina */
--bdfraco:color-mix(in srgb,var(--ink) 70%,transparent);
--bdlavado:color-mix(in srgb,var(--p) 7%,var(--paper));
--bdpad:22px;--bdgap:30px
}
body{background:var(--bdpaper);color:var(--bdink)}
${s('folha')}{max-width:var(--maxw);margin:0 auto;padding:0 var(--bdpad);box-sizing:border-box;width:100%}
${s('folha')} > *{min-width:0}

/* ---------- cabecalho claro, em duas linhas ---------- */
${s('topo')}{background:var(--bdpaper);border-bottom:1px solid var(--bdfio)}
${s('topoin')}{max-width:var(--maxw);margin:0 auto;padding:20px var(--bdpad) 0;box-sizing:border-box}
${s('linha1')}{display:flex;align-items:center;gap:14px 20px}
${s('marca')}{display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:inherit;flex:none}
${s('marca')} ${s('sim')}{display:block;flex:none;line-height:0}
${s('marca')} ${s('sim')} svg{display:block;width:44px;height:44px}
${s('marca')} ${s('nom')}{display:flex;flex-direction:column;gap:3px;min-width:0}
${s('marca')} b{font-family:var(--fd);font-weight:700;font-size:26px;line-height:1.05;letter-spacing:-.024em;color:var(--bdink);white-space:nowrap}
/* a ultima palavra do nome carrega a cor da marca, como a metade de baixo da
   capsula carrega o tom claro */
${s('marca')} b em{font-style:normal;color:var(--bdac)}
${s('marca')} i{font-style:normal;font-family:var(--fb);font-size:9.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--bdfraco);white-space:nowrap}
${s('marca')}:hover b{color:var(--bdac)}
${s('marca')}:hover ${s('sim')} svg{transform:translateY(-1px)}
${s('marca')} ${s('sim')} svg{transition:transform .18s ease}
${s('nav')}{display:flex;flex-wrap:wrap;align-items:center;gap:2px 26px;margin:16px 0 0;padding:12px 0 0;border-top:1px solid var(--bdfio2)}
${s('nav')} a{font-family:var(--fb);font-size:13.5px;font-weight:500;color:var(--bdfraco);text-decoration:none;padding:6px 0;position:relative;transition:color .16s ease}
${s('nav')} a::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--bdac);transform:scaleX(0);transform-origin:left;transition:transform .16s ease}
${s('nav')} a:hover{color:var(--bdink)}
${s('nav')} a:hover::after{transform:scaleX(1)}

/* ---------- atomos ---------- */
/* o INDICE de dois digitos e o motivo grafico do portal */
${s('num')}{font-family:var(--fd);font-weight:700;font-size:13px;line-height:1;letter-spacing:.02em;color:var(--bdac);flex:none;font-variant-numeric:tabular-nums}
${s('kick')}{display:inline-flex;align-items:center;gap:9px;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:var(--kls);text-transform:uppercase;color:var(--bdac)}
${s('kick')} span{color:var(--bdfraco);font-weight:500;letter-spacing:.08em}
${s('kick')} a{color:inherit;text-decoration:none}
${s('sec')}{display:flex;align-items:baseline;justify-content:space-between;gap:10px 20px;flex-wrap:wrap;margin:0 0 20px;padding:0 0 10px;border-bottom:2px solid var(--bdink)}
${s('sec')} h1,${s('sec')} h2{font-family:var(--fd);font-weight:700;font-size:clamp(19px,2vw,24px);line-height:1.2;letter-spacing:-.016em;color:var(--bdink);margin:0;text-align:left}
${s('sec')} .more{font-family:var(--fb);font-size:12.5px;font-weight:600;color:var(--bdfraco);text-decoration:none}
${s('sec')} .more:hover{color:var(--bdac)}
${s('bloco')}{margin:0 0 48px}

/* ---------- abertura partida: texto a esquerda, foto a direita ---------- */
${s('abre')}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:0 38px;align-items:center;margin:30px 0 42px;padding:0 0 34px;border-bottom:1px solid var(--bdfio);text-decoration:none;color:inherit}
${s('abre')} .tx{display:flex;flex-direction:column;gap:14px;text-align:left;order:1}
${s('abre')} .im{display:block;overflow:hidden;background:var(--ph);aspect-ratio:var(--hero-ar,4/3);border-radius:var(--rad-lg,4px);order:2}
${s('abre')} .im img{width:100%;height:100%;object-fit:cover;display:block}
${s('abre')} .h{font-family:var(--fd);font-weight:700;font-size:clamp(26px,3.1vw,39px);line-height:1.12;letter-spacing:-.023em;color:var(--bdink);margin:0;text-align:left}
${s('abre')}:hover .h{color:var(--bdac)}
${s('abre')} .d{font-family:var(--fb);font-size:16.5px;font-weight:400;line-height:1.7;color:var(--bdfraco);margin:0;text-align:left;max-width:52ch}

/* ---------- a grade de fichas deitadas ---------- */
${s('grade')}{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 var(--bdgap)}
${s('ficha')}{display:grid;grid-template-columns:104px minmax(0,1fr);gap:0 16px;align-items:start;padding:20px 0;border-top:1px solid var(--bdfio2);text-decoration:none;color:inherit}
${s('ficha')}:hover .h{color:var(--bdac)}
${s('ficha')} .im{display:block;width:100%;aspect-ratio:1/1;overflow:hidden;background:var(--ph);border-radius:var(--rad-sm,3px)}
${s('ficha')} .im img{width:100%;height:100%;object-fit:cover;display:block}
${s('ficha')} .tx{display:flex;flex-direction:column;gap:7px;text-align:left;min-width:0}
${s('ficha')} .lin{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
${s('ficha')} .h{font-family:var(--fd);font-weight:600;font-size:17px;line-height:1.29;letter-spacing:-.011em;color:var(--bdink);margin:0;text-align:left}
${s('ficha')} .d{font-family:var(--fb);font-size:13.5px;font-weight:400;line-height:1.62;color:var(--bdfraco);margin:0;text-align:left}
/* a ficha sem foto ocupa a calha da miniatura com o indice, e nao fica torta */
${s('semfoto')} .vaga{display:flex;align-items:flex-start;justify-content:flex-start;padding-top:2px}
${s('semfoto')} .vaga span{font-family:var(--fd);font-weight:700;font-size:34px;line-height:1;color:var(--bdfio);font-variant-numeric:tabular-nums}

/* ---------- artigo: coluna unica larga ---------- */
${s('peca')}{max-width:74ch;margin:26px auto 0}
${s('peca')} h1{font-family:var(--fd);font-weight:700;font-size:clamp(28px,3.4vw,42px);line-height:1.12;letter-spacing:-.024em;color:var(--bdink);margin:8px 0 14px;text-align:left}
${s('dek')}{display:block;font-family:var(--fb);font-size:18.5px;font-weight:400;line-height:1.64;color:var(--bdfraco);margin:0 0 22px;text-align:left}
${s('apoio')}{display:flex;align-items:center;gap:14px 18px;flex-wrap:wrap;padding:0 0 20px;margin:0 0 26px;border-bottom:1px solid var(--bdfio)}
${s('pena')}{display:flex;align-items:center;gap:11px;text-decoration:none;color:inherit}
${s('pena')} img{width:42px;height:42px;object-fit:cover;background:var(--ph);flex:none;border-radius:50%}
${s('pena')} b{display:block;font-family:var(--fd);font-weight:700;font-size:14.5px;line-height:1.24;color:var(--bdink)}
${s('pena')}:hover b{color:var(--bdac)}
${s('pena')} i{display:block;font-style:normal;font-family:var(--fb);font-size:11px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:var(--bdfraco);margin-top:3px}
${s('data')}{font-family:var(--fb);font-size:12.5px;font-weight:600;letter-spacing:.06em;color:var(--bdfraco);text-transform:uppercase;margin-left:auto}
${s('gravura')}{margin:0 0 28px}
/* 🔴 height:auto NAO e enfeite, e nenhuma crase pode entrar neste comentario.
   A tag ja traz width e height, mas o navegador so usa esse par para reservar
   a altura quando o CSS deixa a altura livre. Com width:100% sozinho a reserva
   nao acontece, a pagina pula quando a foto chega, e o CLS desta pagina era
   0,128. A crase fecharia o template literal e derrubaria o archs.js. */
${s('gravura')} img{width:100%;height:auto;display:block;border-radius:var(--rad-lg,4px)}
${s('gravura')} figcaption{font-family:var(--fb);font-size:12.5px;line-height:1.62;color:var(--bdfraco);padding:9px 0 0;text-align:left}

/* o contador dos subtitulos e a volta do indice de dois digitos da capa */
${s('texto')}{font-family:var(--fb);font-size:17.5px;line-height:1.78;color:var(--bdink);counter-reset:bdsec}
${s('texto')} p{margin:0 0 1.25em;text-align:left}
${s('texto')} h2{counter-increment:bdsec;font-family:var(--fd);font-weight:700;font-size:25px;line-height:1.24;letter-spacing:-.017em;color:var(--bdink);margin:2.1em 0 .6em;scroll-margin-top:20px;text-align:left}
${s('texto')} h2::before{content:counter(bdsec,decimal-leading-zero);display:block;font-size:13px;line-height:1;letter-spacing:.02em;color:var(--bdac);margin:0 0 9px;font-variant-numeric:tabular-nums}
${s('texto')} h3{font-family:var(--fd);font-weight:600;font-size:19.5px;line-height:1.32;color:var(--bdink);margin:1.7em 0 .5em;scroll-margin-top:20px;text-align:left}
${s('texto')} a{color:var(--bdac);text-decoration:underline;text-underline-offset:3px}
${s('texto')} ul,${s('texto')} ol{margin:0 0 1.25em;padding-left:1.35em;text-align:left}
${s('texto')} li{margin-bottom:.5em}
/* a imagem do corpo vem de acervo de WordPress, com miniatura de 300, 400 e
   450 pixels misturada com foto de 1024. Sem regra, cada uma aparece no tamanho
   nativo e a coluna vira uma pilha de retangulos de tamanhos diferentes. A
   larga ocupa a coluna inteira; a estreita fica como esta, porque esticar ate
   os 700 da coluna borra. O corte entre as duas e feito no conteudo, que e o
   unico lugar que conhece a medida do arquivo */
${s('texto')} img{display:block;height:auto;margin:0;border-radius:var(--rad-sm,3px)}
/* 🔴 o alvo e ATRIBUTO, e nao classe: o motor troca todo nome de classe da
   pagina por um hash, e classe literal gravada no corpo do artigo nao passa
   por essa troca. A regra nunca casaria e a imagem subiria sem estilo */
${s('texto')} img[data-fig="larga"]{width:100%;max-width:100%}
/* a que nao e deitada para em 460px: foto quadrada ocupando a coluna inteira
   vira um bloco de 700px de altura no meio do texto */
${s('texto')} img[data-fig="estreita"]{width:100%;max-width:min(100%,460px)}
${s('texto')} figure{margin:1.9em 0}
${s('texto')} figure img{margin:0}
${s('texto')} figure figcaption{font-family:var(--fb);font-size:12.5px;line-height:1.6;color:var(--bdfraco);padding:8px 0 0;text-align:left}
${s('texto')} p > img{margin:1.9em 0}
${s('texto')} blockquote{margin:1.8em 0;padding:4px 0 4px 20px;border-left:3px solid var(--bdac);font-family:var(--fd);font-size:20px;line-height:1.5;color:var(--bdink);text-align:left}
${s('texto')} blockquote p{margin:0;font:inherit;text-align:left}
${s('escoa')}{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;margin:1.7em 0}
${s('texto')} table{width:100%;border-collapse:collapse;font-family:var(--fb);font-size:14.5px;min-width:440px}
${s('texto')} caption{font-family:var(--fb);font-size:12.5px;color:var(--bdfraco);text-align:left;padding:0 0 9px}
${s('texto')} th,${s('texto')} td{border:0;border-bottom:1px solid var(--bdfio2);background:transparent;padding:11px 14px 11px 0;text-align:left;vertical-align:top}
${s('texto')} thead th{border-bottom:2px solid var(--bdink);font-weight:700;font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:var(--bdink)}

/* ---------- relacionados ---------- */
${s('depois')}{max-width:74ch;margin:44px auto 0;padding:26px 0 0;border-top:2px solid var(--bdink)}
${s('depois')} h2{font-family:var(--fd);font-weight:700;font-size:19px;line-height:1.2;color:var(--bdink);margin:0 0 6px;text-align:left}
${s('lista')}{display:flex;flex-direction:column}
${s('item')}{display:flex;align-items:baseline;gap:12px;padding:14px 0;border-bottom:1px solid var(--bdfio2);text-decoration:none;color:inherit}
${s('item')} .h{font-family:var(--fd);font-weight:600;font-size:16px;line-height:1.32;color:var(--bdink);text-align:left}
${s('item')}:hover .h{color:var(--bdac)}

/* ---------- rodape ---------- */
${s('rodape')}{margin-top:60px;border-top:3px solid var(--bdink);background:var(--bdlavado)}
${s('rodapein')}{max-width:var(--maxw);margin:0 auto;padding:38px var(--bdpad) 26px;box-sizing:border-box}
${s('rgrid')}{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:26px 30px}
${s('rgrid')} h2{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--bdfraco);margin:0 0 12px;text-align:left}
/* 🔴 o :not e obrigatorio, e nenhuma crase pode entrar neste comentario.
   Sem o :not, esta regra tambem pega o proprio logotipo, que e um link
   dentro da mesma grade: o display:block ganha do inline-flex da marca e o
   simbolo cai para cima do nome, em duas linhas, so no rodape.
   A crase fecharia o template literal e derrubaria o archs.js inteiro. */
${s('rgrid')} a:not(${s('marca')}){display:block;font-family:var(--fb);font-size:14px;color:var(--bdink);text-decoration:none;padding:5px 0;text-align:left}
${s('rgrid')} a:not(${s('marca')}):hover{color:var(--bdac)}
${s('rsobre')}{font-family:var(--fb);font-size:14px;line-height:1.68;color:var(--bdfraco);margin:12px 0 0;max-width:42ch;text-align:left}
${s('rbase')}{font-family:var(--fb);font-size:12.5px;color:var(--bdfraco);margin-top:28px;padding-top:18px;border-top:1px solid var(--bdfio);text-align:left}
${s('crumbs')}{font-family:var(--fb);font-size:12.5px;color:var(--bdfraco);margin:20px 0 0}
${s('crumbs')} a{color:var(--bdfraco);text-decoration:none}
${s('crumbs')} a:hover{color:var(--bdac)}
${s('crumbs')} .sep{margin:0 6px;color:var(--bdfio)}
${s('crumbs')} .cur{color:var(--bdink)}

@media(max-width:900px){
${s('abre')}{grid-template-columns:minmax(0,1fr);gap:20px}
${s('abre')} .tx{order:2}
${s('abre')} .im{order:1}
${s('grade')}{grid-template-columns:minmax(0,1fr);gap:0}
${s('rgrid')}{grid-template-columns:1fr 1fr}
}
@media(max-width:640px){
${s('linha1')}{flex-wrap:wrap}
${s('ficha')}{grid-template-columns:78px minmax(0,1fr);gap:0 13px}
${s('peca')},${s('depois')}{max-width:none}
${s('data')}{margin-left:0}
${s('rgrid')}{grid-template-columns:1fr}
/* a tabela vira ficha: sem isto ela sai da tela e o gesto de arrastar nao e
   descoberto. O thead sai da tela mas continua no DOM, para o leitor de tela */
${s('escoa')}{overflow:visible}
${s('texto')} table{min-width:0}
${s('texto')} caption{display:none}
${s('texto')} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
${s('texto')} table,${s('texto')} tbody,${s('texto')} tr,${s('texto')} th,${s('texto')} td{display:block;width:auto}
${s('texto')} tbody tr{border:1px solid var(--bdfio);border-radius:12px;padding:2px 18px 16px;margin-bottom:13px;background:var(--bdpaper)}
${s('texto')} tbody th,${s('texto')} tbody td{border:0;background:transparent}
${s('texto')} tbody th{border-bottom:1px solid var(--bdfio);padding:14px 0 12px;font-size:16px}
${s('texto')} tbody td{padding:14px 0 0;text-align:left;line-height:1.55}
${s('texto')} tbody td::before{content:attr(data-rotulo);display:block;font-weight:700;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--bdfraco);margin-bottom:3px}
}
`;
}

/* O logotipo e o SIMBOLO mais o nome, e o simbolo sai do mesmo `site.iconSvg`
   que gera o favicon. Fonte unica: o que esta na aba do navegador e o que esta
   no cabecalho sao literalmente o mesmo desenho, e nao dois parecidos.

   A ultima palavra do nome fica na cor da marca e o resto na tinta do texto. E
   o mesmo par de tons das duas metades da capsula, entao o logotipo repete a
   ideia do simbolo em vez de so ficar do lado dele. */
function bdLogo(ctx, cls) {
  const { c, H } = ctx;
  const nome = String(ctx.site.shortName || ctx.site.name).trim();
  const i = nome.lastIndexOf(' ');
  const cabeca = i > 0 ? H.esc(nome.slice(0, i)) + ' ' : '';
  const fim = H.esc(i > 0 ? nome.slice(i + 1) : nome);
  const bruto = String(ctx.site.iconSvg || '');
  const sim = bruto
    ? '<span class="' + c('sim') + '" aria-hidden="true">'
      + bruto.replace(/\swidth="[^"]*"/, ' width="44"')
             .replace(/\sheight="[^"]*"/, ' height="44"')
             .replace(/\srole="[^"]*"/, '')
             .replace(/\saria-label="[^"]*"/, '')
      + '</span>'
    : '';
  const tag = ctx.site.tagline ? `<i>${H.esc(ctx.site.tagline)}</i>` : '';
  return `<a class="${c(cls)}" href="/">${sim}`
    + `<span class="${c('nom')}"><b>${cabeca}<em>${fim}</em></b>${tag}</span></a>`;
}

function bdHeader(ctx, menu) {
  const { c, H } = ctx;
  const links = (menu || []).map(m => `<a href="${H.curl(m.slug)}">${H.esc(m.name)}</a>`).join('');
  return `<body>
<header class="${c('topo')}"><div class="${c('topoin')}">
<div class="${c('linha1')}">${bdLogo(ctx, 'marca')}</div>
<nav class="${c('nav')}" aria-label="Editorias">${links}</nav>
</div></header>
<main class="${c('folha')}">`;
}

function bdFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const eds = (menu || []).map(m => `<a href="${H.curl(m.slug)}">${H.esc(m.name)}</a>`).join('');
  return `</main>
<footer class="${c('rodape')}"><div class="${c('rodapein')}">
<div class="${c('rgrid')}">
<div>${bdLogo(ctx, 'marca')}<p class="${c('rsobre')}">${H.esc(site.description || site.tagline || '')}</p></div>
<div><h2>Editorias</h2>${eds}</div>
<div><h2>Institucional</h2>${H.instLinks()}</div>
<div><h2>Redação</h2>
<a href="/contato/">Falar com a redação</a>
<a href="/contato/">Sugerir uma pauta de saúde</a>
<a href="/contato/">Corrigir uma informação</a>
<a href="/busca/">Buscar no acervo</a></div>
</div>
<div class="${c('rbase')}">&copy; ${H.year()} ${H.esc(site.name)}. Conteúdo informativo, não substitui consulta médica. ${H.esc(site.domain)}</div>
</div></footer>
${H.bodyEnd()}`;
}

/* A legenda so vale quando diz algo que o titulo nao disse. Metade do acervo
   importado traz o alt como copia do titulo ou do slug, e imprimir isso poe a
   mesma frase duas vezes na tela. */
function bdLegenda(ctx, art) {
  const alt = art.image && art.image.alt ? String(art.image.alt).trim() : '';
  const t = String(art.title || '');
  const chato = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const cSlug = chato(art.slug), cAlt = chato(alt);
  const pref = cAlt.length >= 25 && (cSlug.indexOf(cAlt) === 0 || cAlt.indexOf(cSlug) === 0);
  if (!alt || cAlt === chato(t) || cAlt === cSlug || pref) return '';
  return alt;
}

/* A linha fina so entra se nao repetir a abertura do corpo. */
function bdDekVale(art) {
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

/* A ficha e a unidade da pagina: indice, editoria, titulo e resumo. Sem foto ela
   continua ficha, com o indice ocupando a calha da miniatura. */
function bdFicha(ctx, a, i) {
  const { c, H } = ctx;
  const d = bdDekVale(a) || a.excerpt || '';
  const n = String(i + 1).padStart(2, '0');
  const tx = `<span class="tx">`
    + `<span class="lin"><span class="${c('num')}">${n}</span>`
    + `<span class="${c('kick')}">${H.cat(a)}<span>${H.esc(H.dateShort(a.date))}</span></span></span>`
    + `<span class="h">${H.esc(a.title)}</span>`
    + `${d ? `<span class="d">${H.esc(H.corta(d, 96))}</span>` : ''}`
    + `</span>`;
  if (a.image) {
    return `<a class="${c('ficha')}" href="${H.url(a)}"><span class="im">${H.pic(a, false)}</span>${tx}</a>`;
  }
  return `<a class="${c('ficha')} ${c('semfoto')}" href="${H.url(a)}">`
    + `<span class="vaga"><span>${n}</span></span>${tx}</a>`;
}

function bdSecHead(ctx, nome, cs) {
  const { c, H } = ctx;
  return `<div class="${c('sec')}"><h2>${H.esc(nome)}</h2>`
    + `${cs ? `<a class="more" href="${H.curl(cs)}">Tudo em ${H.esc(nome)}</a>` : ''}</div>`;
}

function bdHome(ctx, arts, menu) {
  const { c, H } = ctx;
  const pref = ctx.site.heroFrom;
  const lista = arts.slice();
  let top = lista[0];
  if (pref) {
    const i = lista.findIndex(a => a.category && a.category.slug === pref);
    if (i > 0) top = lista[i];
  }
  const resto = lista.filter(a => a !== top);
  const dTop = bdDekVale(top) || (top && top.excerpt) || '';
  const abre = top
    ? `<a class="${c('abre')}" href="${H.url(top)}">`
      + `<span class="tx"><span class="${c('kick')}">${H.cat(top)}<span>${H.esc(H.dateShort(top.date))}</span></span>`
      + `<span class="h">${H.esc(top.title)}</span>`
      + `${dTop ? `<span class="d">${H.esc(H.corta(dTop, 180))}</span>` : ''}</span>`
      + `${top.image ? `<span class="im">${H.pic(top, true)}</span>` : ''}`
      + `</a>`
    : '';

  const usados = new Set(top ? [top.slug] : []);
  const primeiros = resto.slice(0, 8);
  primeiros.forEach(a => usados.add(a.slug));
  const grade = `<div class="${c('grade')}">`
    + primeiros.map((a, i) => bdFicha(ctx, a, i)).join('') + `</div>`;

  const fixas = Array.isArray(ctx.site.homeSections) ? ctx.site.homeSections : null;
  const porCat = new Map();
  for (const a of resto.slice(8)) {
    if (!a.category) continue;
    const k = a.category.slug;
    if (!porCat.has(k)) porCat.set(k, { nome: a.category.name, itens: [] });
    porCat.get(k).itens.push(a);
  }
  const ordem = fixas
    ? fixas.filter(k => porCat.has(k))
    : Array.from(porCat.keys()).sort((a, b) => porCat.get(b).itens.length - porCat.get(a).itens.length);
  const blocos = ordem.slice(0, 5).map(k => {
    const g = porCat.get(k);
    const itens = g.itens.filter(a => !usados.has(a.slug)).slice(0, 6);
    if (!itens.length) return '';
    itens.forEach(a => usados.add(a.slug));
    return `<section class="${c('bloco')}">${bdSecHead(ctx, g.nome, k)}`
      + `<div class="${c('grade')}">${itens.map((a, i) => bdFicha(ctx, a, i)).join('')}</div></section>`;
  }).join('\n');

  return `${H.head(ctx, H.homeMeta(ctx.site))}
${bdHeader(ctx, menu)}
${H.h1(ctx)}
${abre}
${grade}
${blocos}
${bdFooter(ctx, menu)}`;
}

function bdArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;

  const corpo = String(art.content).replace(/<table\b/gi, '<table role="table"');

  const eq = (ctx.site.equipe || []).find(x => x.nome === art.author);
  const pena = eq
    ? `<a class="${c('pena')}" rel="author" href="/autor/${H.esc(eq.slug)}/"><img src="/img/autores/${H.esc(eq.slug)}.webp" width="42" height="42" alt="" aria-hidden="true" loading="lazy"><span><b>${H.esc(eq.nome)}</b><i>${P.readMin} min de leitura</i></span></a>`
    : `<span class="${c('pena')}"><span><b>${H.esc(art.author || ctx.site.name)}</b><i>${P.readMin} min de leitura</i></span></span>`;

  const leg = bdLegenda(ctx, art);
  const figura = art.image
    ? `<figure class="${c('gravura')}">${H.pic(art, true)}${leg ? `<figcaption>${H.esc(leg)}</figcaption>` : ''}</figure>`
    : '';
  const dek = bdDekVale(art);

  const depois = (related || []).length
    ? `<section class="${c('depois')}"><h2>Veja também em ${H.esc(P.catName)}</h2>`
      + `<div class="${c('lista')}">`
      + related.slice(0, 5).map((a, i) => `<a class="${c('item')}" href="${H.url(a)}">`
        + `<span class="${c('num')}">${String(i + 1).padStart(2, '0')}</span>`
        + `<span class="h">${H.esc(a.title)}</span></a>`).join('')
      + `</div></section>`
    : '';

  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${bdHeader(ctx, menu)}
${H.progressBar(ctx)}
${H.crumbs(ctx, art, P)}
<article class="${c('peca')}">
<span class="${c('kick')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${dek ? `<span class="${c('dek')}">${H.esc(dek)}</span>` : ''}
<div class="${c('apoio')}">${pena}<span class="${c('data')}">${H.esc(P.dstr)}</span></div>
${figura}
<div class="${c('texto')}">${corpo}</div>
${H.share(ctx, P)}
</article>
${depois}
${bdFooter(ctx, menu)}
${H.progressScript(ctx)}`;
}

/* A listagem precisa de h1 proprio: sem ele a pagina de editoria sobe sem
   titulo de nivel 1, e o cartao vira o primeiro heading da pagina. */
function bdList(ctx, opts) {
  const { c, H } = ctx;
  const itens = opts.items || [];
  return `${H.head(ctx, H.listMeta(ctx, opts))}
${bdHeader(ctx, opts.menu)}
<div class="${c('sec')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('rsobre')}">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('grade')}">${itens.map((a, i) => bdFicha(ctx, a, i)).join('')}</div>
${bdFooter(ctx, opts.menu)}`;
}
