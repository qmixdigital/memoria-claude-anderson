/*
 * Arquitetura X, arquetipo BANCA. Feita para o adonline.com.br.
 *
 * ## De onde vem o desenho
 *
 * A primeira versao era escura com verde eletrico. Funcionava como painel de
 * ferramenta, mas o Anderson pediu claro: e o que o leitor brasileiro espera de
 * portal de noticia, e o escuro empurrava o texto longo para um contraste que
 * cansa em artigo de 2.000 palavras.
 *
 * O caminho aqui e **banca de revista**: papel morno, tinta quente quase preta,
 * um unico verde profundo herdado do quadrado da marca, e hierarquia resolvida
 * por tipografia em vez de por caixa colorida.
 *
 * ## O par tipografico
 *
 *   - **Newsreader** nos titulos. Serifa de texto com eixo optico, desenhada
 *     para ler bem tanto em 48px quanto em 17px, o que permite usar serifa ate
 *     no titulo de cartao sem perder legibilidade
 *   - **Instrument Sans** no corpo, no chapeu e na navegacao
 *
 * Serifa no titulo e sans no corpo e a divisao classica de jornal digital, e
 * nenhum dos 61 portais da rede usa qualquer uma das duas familias.
 *
 * ## O que a diferencia das outras 23 do servidor
 *
 *   - **serifa em todo titulo**, inclusive no cartao pequeno: as vizinhas sao
 *     todas sans em tudo
 *   - **abertura dividida** com moldura menta deslocada atras da foto
 *   - **trilho numerado** de mais recentes, com algarismo em serifa grande
 *   - **secao que muda de forma conforme o tamanho da editoria**: destaque mais
 *     grade 2x2 quando ha 5 ou mais, e grade exata quando ha 2, 3 ou 4. Nunca
 *     sobra buraco ao lado do ultimo cartao, que era o defeito visivel na home
 *     antiga na secao de TikTok, com dois cartoes numa grade de quatro
 *   - **sumario fixo** na materia, montado a partir dos h2 do proprio texto
 *   - **capitular verde** no primeiro paragrafo
 *   - **ficha do autor** no fim da materia, com retrato, frente de cobertura e
 *     link para a pagina dele
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
 *   - bloco de relacionados com a mesma largura da coluna do artigo
 *   - tabela vira cartao abaixo de 640px, com rotulo de coluna
 */

function xCss(ctx) {
  const { s, fp, site } = ctx;
  const t = site.theme || {};
  const wash = t.accent2 || '#eafbe5';
  const lima = t.lime || '#06F100';
  const rad = fp.radius === 'sharp' ? '0' : '14px';
  const radSm = fp.radius === 'sharp' ? '0' : '10px';
  return `
${s('xwrap')}{--pri:${t.primary};--ink:${t.ink};--paper:${t.paper};--surf:${t.surface};
  --ph:${t.ph};--dek:${t.dek};--muted:${t.muted};--line:${t.line};--wash:${wash};
  --lima:${lima};--fd:${t.fontDisplay};--fb:${t.fontBody}}

${s('xwrap')}{background:var(--paper);color:var(--ink);font-family:var(--fb);
  font-size:${fp.baseFs || '17px'};line-height:1.62;-webkit-font-smoothing:antialiased}
${s('xwrap')} *{box-sizing:border-box}
${s('xin')}{max-width:${fp.container || '1240px'};margin:0 auto;padding:0 24px;width:100%}
${s('xwrap')} h1,${s('xwrap')} h2,${s('xwrap')} h3,${s('xwrap')} h4{font-family:var(--fd);
  font-weight:700;letter-spacing:-.012em;line-height:1.18;margin:0}
${s('xwrap')} a{color:inherit;text-decoration:none}

/* ---------- chapeu de editoria: risco curto e versalete, sem pilula ---------- */
${s('xkick')}{display:inline-flex;align-items:center;gap:7px;font-family:var(--fb);
  font-size:11px;font-weight:700;letter-spacing:${fp.kickerLs || '.11em'};
  text-transform:uppercase;color:var(--pri)}
${s('xkick')}::before{content:"";width:14px;height:2px;background:var(--pri);flex:none}

/* ---------- cabecalho ---------- */
${s('xtop')}{position:sticky;top:0;z-index:60;background:rgba(251,250,247,.92);
  border-bottom:1px solid var(--line);backdrop-filter:saturate(1.4) blur(9px)}
${s('xbar')}{display:flex;align-items:center;gap:18px;min-height:80px;flex-wrap:wrap}
${s('xmarca')}{display:flex;align-items:center;margin-right:auto}
${s('xmarca')} img{display:block;height:clamp(34px,3.4vw,42px);width:auto}
${s('xnav')}{display:flex;gap:20px;align-items:center;flex-wrap:wrap}
${s('xnav')} a{font-size:14px;font-weight:600;color:var(--ink);padding:7px 0;
  border-bottom:2px solid transparent;transition:color .18s,border-color .18s}
${s('xnav')} a:hover{color:var(--pri);border-bottom-color:var(--pri)}
${s('xbusca')}{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;
  color:var(--dek);border:1px solid var(--line);border-radius:999px;padding:8px 15px;
  background:var(--surf);transition:border-color .18s,color .18s}
${s('xbusca')}:hover{border-color:var(--pri);color:var(--pri)}
${s('xham')}{display:none;width:46px;height:46px;border-radius:11px;align-items:center;
  justify-content:center;background:var(--surf);border:1px solid var(--line);
  cursor:pointer;color:var(--ink)}
${s('xham')} i{display:block;width:18px;height:2px;background:currentColor;position:relative}
${s('xham')} i::before,${s('xham')} i::after{content:"";position:absolute;left:0;width:18px;
  height:2px;background:currentColor}
${s('xham')} i::before{top:-6px}${s('xham')} i::after{top:6px}

/* ---------- abertura: texto a esquerda, foto a direita ---------- */
${s('xhero')}{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr);
  gap:46px;align-items:center;padding:38px 0 34px;border-bottom:1px solid var(--line)}
${s('xht')} h2{font-size:clamp(30px,3.9vw,48px);margin:13px 0 14px;letter-spacing:-.022em}
/* marca-texto em lima: preto sobre lima da 11,9:1, entao o titulo continua
   legivel enquanto a faixa sobe */
${s('xht')} h2 a{background-image:linear-gradient(var(--lima),var(--lima));
  background-size:100% 0;background-repeat:no-repeat;background-position:0 88%;
  transition:background-size .34s cubic-bezier(.2,.7,.2,1);
  -webkit-box-decoration-break:clone;box-decoration-break:clone}
${s('xht')}:hover h2 a{background-size:100% 34%}
${s('xht')} p{margin:0 0 18px;font-size:18px;line-height:1.55;color:var(--dek);max-width:52ch}
${s('xhm')}{display:flex;flex-wrap:wrap;gap:9px;align-items:center;font-size:13px;
  color:var(--muted)}
${s('xhm')} b{color:var(--ink);font-weight:600}
${s('xhm')} .pt{opacity:.5}
/* moldura menta deslocada atras da foto: da profundidade sem sombra pesada */
${s('xhf')}{position:relative;display:block}
${s('xhf')}::before{content:"";position:absolute;inset:20px -18px -18px 20px;
  background:var(--wash);border-radius:${rad};z-index:0}
${s('xhi')}{display:block;position:relative;z-index:1;width:100%;aspect-ratio:${fp.heroAr || '4/3'};
  overflow:hidden;border-radius:${rad};background:var(--ph)}
${s('xhi')} img{width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .5s cubic-bezier(.2,.7,.2,1)}
${s('xhf')}:hover ${s('xhi')} img{transform:scale(1.035)}

/* ---------- faixa abaixo da abertura: 3 cartoes + trilho numerado ---------- */
${s('xsub')}{display:grid;grid-template-columns:minmax(0,2.15fr) minmax(0,1fr);
  gap:44px;padding:34px 0 0;align-items:start}
${s('xtres')}{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px 24px}
${s('xtrilho')} h2{font-size:15px;letter-spacing:.02em;padding-bottom:11px;
  border-bottom:2px solid var(--ink);margin-bottom:4px}
${s('xlin')}{display:grid;grid-template-columns:auto minmax(0,1fr);gap:0 15px;
  align-items:baseline;padding:15px 0;border-bottom:1px solid var(--line)}
${s('xlin')}:last-child{border-bottom:0}
${s('xnum')}{font-family:var(--fd);font-size:26px;font-weight:700;line-height:1;
  color:var(--pri);opacity:.32;font-variant-numeric:tabular-nums}
${s('xlin')} h3{font-size:16.5px;line-height:1.3;margin:0 0 5px;transition:color .18s}
${s('xlin')}:hover h3{color:var(--pri)}
${s('xlin')} time{font-size:11.5px;color:var(--muted);letter-spacing:.03em}

/* ---------- cartao com foto em cima ---------- */
${s('xg')}{display:block}
${s('xg')} span[data-f]{display:block;position:relative;width:100%;
  aspect-ratio:${fp.cardAr || '16/10'};overflow:hidden;border-radius:${radSm};
  background:var(--ph);margin-bottom:13px}
${s('xg')} span[data-f] img{width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .45s cubic-bezier(.2,.7,.2,1)}
${s('xg')}:hover span[data-f] img{transform:scale(1.05)}
${s('xg')} h2,${s('xg')} h3{font-size:18px;line-height:1.26;margin:9px 0 7px;
  transition:color .18s}
${s('xg')}:hover h2,${s('xg')}:hover h3{color:var(--pri)}
${s('xg')} time{font-size:11.5px;color:var(--muted);letter-spacing:.03em}

/* ---------- cartao compacto: retrato quadrado a esquerda ---------- */
${s('xcard')}{display:grid;grid-template-columns:88px minmax(0,1fr);gap:0 15px;
  align-items:start;padding:15px 0;border-bottom:1px solid var(--line)}
${s('xcard')}:last-child{border-bottom:0}
${s('xcard')} span[data-f]{display:block;position:relative;width:88px;aspect-ratio:1/1;
  overflow:hidden;border-radius:${radSm};background:var(--ph)}
${s('xcard')} span[data-f] img{width:100%;height:100%;object-fit:cover;display:block}
${s('xcard')} div{min-width:0}
${s('xcard')} h3{font-size:16px;line-height:1.3;margin:8px 0 6px;transition:color .18s}
${s('xcard')}:hover h3{color:var(--pri)}
${s('xcard')} time{font-size:11.5px;color:var(--muted)}

/* ---------- secao de editoria ---------- */
${s('xsec')}{padding:52px 0 0}
${s('xsh')}{display:flex;align-items:center;gap:13px;margin:0 0 20px;padding-bottom:12px;
  border-bottom:3px solid var(--ink)}
${s('xsh')} h2{font-size:22px;letter-spacing:-.015em}
${s('xsh')}::before{content:"";width:12px;height:12px;background:var(--lima);flex:none;
  border-radius:3px}
${s('xsh1')} h1{font-size:clamp(25px,3.2vw,34px);letter-spacing:-.02em;margin:0}
${s('xsh')} a{margin-left:auto;font-size:13px;font-weight:600;color:var(--pri);
  white-space:nowrap}
${s('xsh')} a:hover{text-decoration:underline;text-underline-offset:3px}

/* destaque a esquerda, quatro compactos a direita */
${s('xdup')}{display:grid;grid-template-columns:minmax(0,1.18fr) minmax(0,1fr);gap:40px;
  align-items:stretch}
/* a coluna dos compactos espalha os quatro pela altura do destaque: empilhados no
   topo, eles terminavam bem antes e deixavam um vazio do lado da foto */
${s('xlista')}{display:flex;flex-direction:column;justify-content:space-between;min-width:0}
${s('xbig')} span[data-f]{display:block;position:relative;width:100%;aspect-ratio:16/9;
  overflow:hidden;border-radius:${rad};background:var(--ph);margin-bottom:16px}
${s('xbig')} span[data-f] img{width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .45s cubic-bezier(.2,.7,.2,1)}
${s('xbig')}:hover span[data-f] img{transform:scale(1.04)}
${s('xbig')} h3{font-size:clamp(21px,2.3vw,27px);line-height:1.2;margin:11px 0 9px;
  transition:color .18s}
${s('xbig')}:hover h3{color:var(--pri)}
${s('xbig')} p{margin:0 0 9px;font-size:15.5px;line-height:1.5;color:var(--dek);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
${s('xbig')} time{font-size:11.5px;color:var(--muted)}

/* grade que se ajusta ao numero de itens: nunca sobra buraco na ultima linha */
${s('xgrade')}{display:grid;gap:26px 24px;grid-template-columns:repeat(4,minmax(0,1fr))}
${s('xg4')}{grid-template-columns:repeat(4,minmax(0,1fr))}
${s('xg3')}{grid-template-columns:repeat(3,minmax(0,1fr))}
${s('xg2')}{grid-template-columns:repeat(2,minmax(0,1fr))}

/* ---------- materia ---------- */
${s('xpost')}{display:grid;grid-template-columns:minmax(0,1fr) 292px;gap:52px;
  align-items:start;padding:34px 0 0}
${s('xart')}{max-width:740px;min-width:0}
${s('xart')} h1{font-size:clamp(31px,4.3vw,50px);margin:12px 0 14px;letter-spacing:-.022em}
${s('xdek')}{font-size:20px;line-height:1.5;color:var(--dek);margin:0 0 20px;
  max-width:60ch;font-family:var(--fb)}
${s('xcapa')}{display:block;position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;
  border-radius:${rad};background:var(--ph);margin:22px 0 8px}
${s('xcapa')} img{width:100%;height:100%;object-fit:cover;display:block}
${s('xleg')}{font-size:12.5px;color:var(--muted);margin:0 0 26px;line-height:1.5;
  padding-left:13px;border-left:2px solid var(--line)}

${s('xbody')}{font-size:17.5px;line-height:1.74}
${s('xbody')} p{margin:0 0 22px}
/* capitular: so no primeiro paragrafo, e so onde a tela comporta */
@media(min-width:700px){
  ${s('xbody')}>p:first-of-type::first-letter{float:left;font-family:var(--fd);
    font-weight:700;font-size:66px;line-height:.82;padding:7px 12px 0 0;color:var(--pri)}
}
${s('xbody')} h2{font-size:27px;margin:42px 0 15px;letter-spacing:-.018em;
  scroll-margin-top:88px}
${s('xbody')} h2::after{content:"";display:block;width:44px;height:3px;background:var(--pri);
  margin-top:13px}
${s('xbody')} h3{font-size:21px;margin:30px 0 11px}
${s('xbody')} a{color:var(--pri);text-decoration:underline;text-decoration-thickness:1px;
  text-underline-offset:3px}
${s('xbody')} a:hover{background:var(--wash)}
${s('xbody')} img{max-width:100%;height:auto;border-radius:${radSm};margin:24px 0}
${s('xbody')} ul,${s('xbody')} ol{margin:0 0 22px;padding-left:24px}
${s('xbody')} li{margin:0 0 10px}
${s('xbody')} blockquote{margin:32px 0;padding:4px 0 4px 30px;position:relative;
  font-family:var(--fd);font-size:24px;line-height:1.4;color:var(--ink)}
${s('xbody')} blockquote::before{content:"\\201C";position:absolute;left:-4px;top:-10px;
  font-family:var(--fd);font-size:64px;line-height:1;color:var(--pri);opacity:.28}
${s('xbody')} .qmix-aviso{margin:26px 0;padding:16px 19px;border-left:3px solid var(--pri);
  background:var(--wash);border-radius:0 ${radSm} ${radSm} 0;font-size:15px;line-height:1.6}
/* bloco de leitura relacionada dentro do texto */
${s('xbody')} .qmix-veja,${s('xbody')} .malha{margin:30px 0;padding:20px 24px;
  background:var(--surf);border:1px solid var(--line);border-left:4px solid var(--pri);
  border-radius:0 ${radSm} ${radSm} 0}
${s('xbody')} .qmix-veja b{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:13px}
${s('xbody')} .qmix-veja ul,${s('xbody')} .malha ul{list-style:none;margin:0;padding:0;
  display:grid;gap:11px}
${s('xbody')} .qmix-veja li,${s('xbody')} .malha li{margin:0;padding-left:19px;position:relative;
  font-size:16px;line-height:1.45}
${s('xbody')} .qmix-veja li::before,${s('xbody')} .malha li::before{content:"";position:absolute;
  left:0;top:.58em;width:7px;height:7px;background:var(--pri);border-radius:2px}
${s('xbody')} .qmix-veja li a,${s('xbody')} .malha li a{text-decoration:none;color:var(--ink);
  font-weight:600}
${s('xbody')} .qmix-veja li a:hover,${s('xbody')} .malha li a:hover{color:var(--pri);
  background:none}

${s('xbody')} .tabwrap{width:100%;overflow-x:auto}
${s('xbody')} table{width:100%;border-collapse:collapse;margin:28px 0;font-size:15.5px}
${s('xbody')} table caption{text-align:left;font-family:var(--fb);font-size:13px;
  color:var(--muted);padding-bottom:10px}
${s('xbody')} table th,${s('xbody')} table td{border:0;border-bottom:1px solid var(--line);
  padding:12px 14px;text-align:left;vertical-align:top}
${s('xbody')} table thead th{background:transparent;font-family:var(--fb);font-weight:700;
  font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  border-bottom:2px solid var(--ink)}

/* ---------- trilho lateral da materia ---------- */
${s('xrail')}{position:sticky;top:94px;min-width:0}
${s('xtoc')}{border-top:3px solid var(--ink);padding-top:15px;margin-bottom:30px}
${s('xtoc')} b{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
${s('xtoc')} ol{list-style:none;margin:0;padding:0;counter-reset:toc}
${s('xtoc')} li{counter-increment:toc;margin:0 0 11px;padding-left:26px;position:relative;
  font-size:14.5px;line-height:1.4}
${s('xtoc')} li::before{content:counter(toc,decimal-leading-zero);position:absolute;left:0;
  top:1px;font-family:var(--fd);font-size:12.5px;font-weight:700;color:var(--pri);opacity:.55}
${s('xtoc')} a{color:var(--dek)}
${s('xtoc')} a:hover{color:var(--pri)}
${s('xrm')} b{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--muted);
  padding-bottom:11px;border-bottom:2px solid var(--ink);margin-bottom:2px}
${s('xsr')}{border-top:3px solid var(--ink);padding-top:15px}
${s('xsr')} b{display:block;font-family:var(--fb);font-size:11px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
${s('xsr')} div{display:grid;gap:8px}
${s('xsr')} a,${s('xsr')} button{display:flex;align-items:center;gap:9px;font:inherit;
  font-size:13.5px;font-weight:600;color:var(--ink);background:var(--surf);
  border:1px solid var(--line);border-radius:999px;padding:9px 15px;cursor:pointer;
  text-align:left;transition:border-color .18s,color .18s,background .18s}
${s('xsr')} a:hover,${s('xsr')} button:hover{border-color:var(--pri);color:var(--pri);
  background:var(--wash)}
${s('xsr')} svg{flex:none;opacity:.75}

/* ---------- ficha do autor ---------- */
${s('xass')}{display:grid;grid-template-columns:76px minmax(0,1fr);gap:0 20px;
  align-items:start;margin:40px 0 0;padding:24px;background:var(--surf);
  border:1px solid var(--line);border-radius:${rad};max-width:740px}
${s('xass')} img{width:76px;height:76px;border-radius:50%;object-fit:cover;display:block;
  background:var(--ph)}
${s('xass')} .ed{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.11em;
  text-transform:uppercase;color:var(--pri);margin:0 0 6px}
${s('xass')} .nm{display:block;font-family:var(--fd);font-weight:700;font-size:19px;
  line-height:1.2;margin:0 0 8px;color:var(--ink)}
${s('xass')} p{margin:0 0 10px;font-size:15px;line-height:1.6;color:var(--dek)}
${s('xass')} .go{font-size:13.5px;font-weight:600;color:var(--pri)}
${s('xass')} .go:hover{text-decoration:underline;text-underline-offset:3px}

${s('xrel')}{margin:46px 0 0;padding-top:26px;border-top:3px solid var(--ink);max-width:740px}

/* ---------- rodape ---------- */
${s('xfoot')}{background:${t.footerBg};color:${t.footerTx};margin-top:64px;padding:48px 0 28px;
  font-family:var(--fb);font-size:14px}
${s('xfoot')} h2,${s('xfoot')} h3{color:#fff}
${s('xcols')}{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:36px}
${s('xfb')}{display:inline-block}
${s('xfb')} img{display:block;height:38px;width:auto}
${s('xfh')}{font-family:var(--fb);font-size:11px;font-weight:700;color:#fff;margin:0 0 13px;
  letter-spacing:.13em;text-transform:uppercase}
${s('xfoot')} a{color:${t.footerTx}}
${s('xfoot')} a:hover{color:var(--pri)}
${s('xflist')}{display:grid;gap:9px}
${s('xfim')}{margin-top:34px;padding-top:19px;border-top:1px solid rgba(255,255,255,.11);
  font-size:12.5px;display:flex;flex-wrap:wrap;gap:14px}

/* ---------- telas menores ---------- */
@media(max-width:1180px){
  ${s('xpost')}{grid-template-columns:minmax(0,1fr);gap:0}
  ${s('xrail')}{position:static;margin:38px 0 0;max-width:740px}
  ${s('xtoc')}{margin-bottom:24px}
}
@media(max-width:1100px){
  ${s('xham')}{display:flex}
  ${s('xbusca')}{display:none}
  ${s('xnav')}{display:none;order:3;width:100%;flex-direction:column;gap:0;
    /* o align-items:center da barra horizontal vazava para a coluna e centralizava
       os itens, contra a regra de nada centralizado alem da marca */
    align-items:stretch;text-align:left;
    padding:0 0 10px;margin-top:4px;border-top:1px solid var(--line)}
  ${s('xnav')}[data-aberto="1"]{display:flex}
  ${s('xnav')} a{padding:15px 2px;border-bottom:1px solid var(--line);border-top:0}
  ${s('xsub')}{grid-template-columns:minmax(0,1fr);gap:34px}
  ${s('xdup')}{grid-template-columns:minmax(0,1fr);gap:30px}
  ${s('xgrade')},${s('xg4')}{grid-template-columns:repeat(3,minmax(0,1fr))}
  ${s('xcols')}{grid-template-columns:1fr 1fr}
}
@media(max-width:900px){
  ${s('xhero')}{grid-template-columns:minmax(0,1fr);gap:26px;padding:30px 0 32px}
  /* no empilhado a moldura deslocada sairia da tela pela direita */
  ${s('xhf')}::before{inset:12px -12px -12px 12px}
  ${s('xht')}{order:2}
  ${s('xhf')}{order:1}
}
@media(max-width:820px){
  ${s('xtres')}{grid-template-columns:repeat(2,minmax(0,1fr))}
  ${s('xgrade')},${s('xg4')},${s('xg3')}{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:560px){
  ${s('xtres')},${s('xgrade')},${s('xg4')},${s('xg3')},${s('xg2')}{
    grid-template-columns:minmax(0,1fr)}
  ${s('xcols')}{grid-template-columns:1fr}
  ${s('xht')} h2{font-size:27px}
  ${s('xbig')} p{display:none}
  ${s('xass')}{grid-template-columns:minmax(0,1fr);gap:15px}
  ${s('xass')} img{width:64px;height:64px}
}
@media(max-width:640px){
  /* tabela vira cartao: sem isto ela sai da tela e o gesto de arrastar nao e
     descoberto. thead sai da tela mas continua no DOM, para leitor de tela */
  ${s('xbody')} .tabwrap{overflow:visible;border:0;background:transparent}
  ${s('xbody')} table{min-width:0;display:block;width:auto;overflow:visible}
  ${s('xbody')} table caption{display:none}
  ${s('xbody')} table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  ${s('xbody')} table tbody,${s('xbody')} table tr,
  ${s('xbody')} table th,${s('xbody')} table td{display:block;width:auto}
  ${s('xbody')} table tbody tr{background:var(--surf);border:1px solid var(--line);
    border-radius:13px;padding:2px 17px 15px;margin-bottom:13px}
  /* zerar borda e fundo herdados, senao sobra risco cortando o cartao */
  ${s('xbody')} table tbody th,${s('xbody')} table tbody td{border:0;background:transparent;padding:0}
  ${s('xbody')} table tbody th{border-bottom:1px solid var(--line);padding:14px 0 12px;
    font-family:var(--fd);font-weight:700;font-size:16px;text-transform:none;letter-spacing:0;
    color:var(--ink)}
  ${s('xbody')} table tbody td{padding:13px 0 0;text-align:left;line-height:1.5}
  ${s('xbody')} table tbody td::before{content:attr(data-rotulo);display:block;font-weight:600;
    font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);
    margin-bottom:2px}
}`;
}

/* A marca vai em curvas: nao carrega fonte, nao pesa no LCP e nao expoe nome de
 * familia no HTML, que e um dos sinais comparados entre portais da rede.
 * O quadrado verde com "AD" e a forma da marca original. */
/* A logomarca e o arquivo original do WordPress, e nao um desenho aproximado: o
 * monograma AD com a vassourada cruzando as letras e o que da identidade a marca,
 * e redesenhar de memoria perde exatamente isso. Duas variantes, porque o rodape
 * e escuro. Largura e altura vao no atributo para nao gerar deslocamento. */
function xMarca(clara) {
  const arq = clara ? '/marca-adonline-clara.webp' : '/marca-adonline.webp';
  return `<img src="${arq}" alt="AdOnline" width="101" height="30" decoding="async"` +
    (clara ? ' loading="lazy"' : ' fetchpriority="high"') + '>';
}

const X_LUPA = `<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4" stroke-linecap="round"/></svg>`;

function xHeader(ctx, menu) {
  const { site, c, H } = ctx;
  const idMenu = 'xnav-' + (site.slug || 'p');
  // link de editoria por H.curl: montado a mao ele quebra quando ha categoryBase
  const links = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<body>
<header class="${c('xtop')}"><div class="${c('xin')} ${c('xbar')}">
<a class="${c('xmarca')}" href="/" aria-label="AdOnline, página inicial">${xMarca(false)}</a>
<button class="${c('xham')}" type="button" data-xham aria-expanded="false"
  aria-controls="${idMenu}" aria-label="Abrir o menu de editorias"><i></i></button>
<nav class="${c('xnav')}" id="${idMenu}" data-aberto="0" aria-label="Editorias">${links}</nav>
<a class="${c('xbusca')}" href="/busca/">${X_LUPA}Buscar</a>
</div></header>
<script>(function(){var b=document.querySelector('[data-xham]'),n=document.getElementById('${idMenu}');
if(!b||!n)return;b.addEventListener('click',function(){var a=b.getAttribute('aria-expanded')==='true';
b.setAttribute('aria-expanded',a?'false':'true');n.setAttribute('data-aberto',a?'0':'1');
b.setAttribute('aria-label',a?'Abrir o menu de editorias':'Fechar o menu de editorias')})})();</script>`;
}

function xFooter(ctx, menu) {
  const { site, c, H } = ctx;
  const cats = (menu || []).map(x =>
    `<a href="${H.curl(x.slug)}">${H.esc(x.name)}</a>`).join('');
  return `<footer class="${c('xfoot')}"><div class="${c('xin')}">
<div class="${c('xcols')}">
  <div><a class="${c('xfb')}" href="/" aria-label="AdOnline, página inicial">${xMarca(true)}</a>
    <p style="margin:15px 0 0;max-width:40ch;line-height:1.65">${H.esc(site.description || '')}</p></div>
  <div><div class="${c('xfh')}">Editorias</div><div class="${c('xflist')}">${cats}</div></div>
  <div><div class="${c('xfh')}">O portal</div><div class="${c('xflist')}">${H.instLinks()}</div></div>
</div>
<div class="${c('xfim')}"><span>&copy; ${new Date().getFullYear()} ${H.esc(site.name)}</span>
<span>${H.esc(site.tagline || '')}</span></div>
</div></footer>`;
}

/* Cartao com foto em cima. O `<a>` tem display e o `<span>` do retrato tem
 * display:block, senao o aspect-ratio nao aplica e a imagem passa por cima do
 * titulo. O nivel de titulo vem de quem chama: h3 sob um h2 de secao na home,
 * h2 na lista de editoria, onde o titulo da pagina e h1. */
function xGrid(ctx, a, eager, nivel) {
  const { c, H } = ctx;
  const n = nivel || 3;
  return `<a class="${c('xg')} ${c('reveal')}" href="${H.url(a)}">
<span data-f>${H.pic(a, !!eager)}</span>
<span class="${c('xkick')}">${H.cat(a)}</span>
<h${n}>${H.esc(a.title)}</h${n}>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></a>`;
}

/* Cartao compacto: retrato quadrado a esquerda, texto a direita. */
function xCard(ctx, a) {
  const { c, H } = ctx;
  return `<a class="${c('xcard')}" href="${H.url(a)}">
<span data-f>${H.pic(a, false)}</span>
<div><span class="${c('xkick')}">${H.cat(a)}</span>
<h3>${H.esc(a.title)}</h3>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></div></a>`;
}

/* Linha do trilho numerado: sem foto, so algarismo, titulo e data. */
function xLinha(ctx, a, i) {
  const { c, H } = ctx;
  return `<a class="${c('xlin')}" href="${H.url(a)}">
<span class="${c('xnum')}">${String(i + 1).padStart(2, '0')}</span>
<span><h3>${H.esc(a.title)}</h3>
<time datetime="${H.esc(a.date)}">${H.esc(H.dateShort(a.date))}</time></span></a>`;
}

function xHome(ctx, arts, menu) {
  const { site, c, H } = ctx;
  const meta = H.homeMeta(site);
  const [abre, ...resto] = arts;
  // seis cartoes fecham na altura do trilho de cinco linhas
  const tres = resto.slice(0, 6);
  const trilho = resto.slice(6, 11);
  const usados = new Set([abre, ...tres, ...trilho].filter(Boolean).map(a => a.slug));

  const hero = abre ? `<section class="${c('xhero')}">
<div class="${c('xht')}"><span class="${c('xkick')}">${H.cat(abre)}</span>
<h2><a href="${H.url(abre)}">${H.esc(abre.title)}</a></h2>
${abre.dek ? `<p>${H.esc(H.clip(abre.dek, 190))}</p>` : ''}
<div class="${c('xhm')}">${abre.author ? `<b>${H.esc(abre.author)}</b><span class="pt">&middot;</span>` : ''}
<time datetime="${H.esc(abre.date)}">${H.esc(H.dateShort(abre.date))}</time></div></div>
<a class="${c('xhf')}" href="${H.url(abre)}" aria-label="${H.esc(abre.title)}">
<span class="${c('xhi')}">${H.pic(abre, true)}</span></a>
</section>` : '';

  const sub = (tres.length || trilho.length) ? `<section class="${c('xsub')}">
<div class="${c('xtres')}">${tres.map(a => xGrid(ctx, a, false)).join('')}</div>
<div class="${c('xtrilho')}"><h2>Mais recentes</h2>
${trilho.map((a, i) => xLinha(ctx, a, i)).join('')}</div>
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
      const topo = `<div class="${c('xsh')}"><h2>${H.esc(nome)}</h2>
<a href="${H.curl(cs)}">Ver tudo de ${H.esc(nome)}</a></div>`;
      let corpo;
      if (v.length >= 5) {
        // destaque mais quatro compactos: consome exatamente 5, sem sobra
        const [d, ...r] = v;
        corpo = `<div class="${c('xdup')}">
<a class="${c('xbig')} ${c('reveal')}" href="${H.url(d)}">
<span data-f>${H.pic(d, false)}</span>
<span class="${c('xkick')}">${H.cat(d)}</span>
<h3>${H.esc(d.title)}</h3>
${d.dek ? `<p>${H.esc(H.clip(d.dek, 130))}</p>` : ''}
<time datetime="${H.esc(d.date)}">${H.esc(H.dateShort(d.date))}</time></a>
<div class="${c('xlista')}">${r.slice(0, 4).map(a => xCard(ctx, a)).join('')}</div>
</div>`;
      } else {
        // 2, 3 ou 4 itens: a grade recebe exatamente esse numero de colunas, e a
        // ultima linha fecha. Era aqui que a home antiga deixava buraco: dois
        // cartoes de TikTok numa grade fixa de quatro
        const n = v.length;
        corpo = `<div class="${c('xgrade')} ${c('xg' + n)}">
${v.slice(0, n).map(a => xGrid(ctx, a, false)).join('')}</div>`;
      }
      return `<section class="${c('xsec')}">${topo}${corpo}</section>`;
    }).join('');

  return `${H.head(ctx, meta)}
${xHeader(ctx, menu)}
<main class="${c('xwrap')}"><div class="${c('xin')}">
${H.h1(ctx)}
${hero}
${sub}
${secoes}
</div></main>
${xFooter(ctx, menu)}
${H.bodyEnd()}`;
}

/* Sumario montado a partir dos h2 do proprio texto.
 *
 * Recebe o conteudo, poe `id` nos h2 que ainda nao tem e devolve o texto alterado
 * junto com a lista. O bloco "Veja tambem" da malha interna fica de fora: ele e
 * navegacao, nao secao da materia. */
/* Resolve entidade HTML em texto que vai ser escapado de novo.
 * Lista fechada: so letra acentuada, espaco duro e simbolo tipografico. `&amp;`,
 * `&lt;` e `&gt;` continuam como estao, senao a saida deixa de ser segura. */
const X_ENT = {
  nbsp: ' ', ccedil: 'ç', Ccedil: 'Ç', aacute: 'á', eacute: 'é',
  iacute: 'í', oacute: 'ó', uacute: 'ú', atilde: 'ã', otilde: 'õ',
  acirc: 'â', ecirc: 'ê', ocirc: 'ô', agrave: 'à', uuml: 'ü',
  ntilde: 'ñ', hellip: '…', ndash: '–', mdash: '—',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', deg: '°',
};
function _semEntidade(s) {
  return String(s || '')
    .replace(/&#(\d{2,5});/g, (m, n) => String.fromCharCode(Number(n)))
    // entidade escrita errada, do tipo &cccedil;, vira a letra certa
    .replace(/&c{2,}edil;/g, 'ç')
    .replace(/&([a-zA-Z]{2,8});/g, (m, k) => (k in X_ENT ? X_ENT[k] : m));
}

function xToc(conteudo) {
  const itens = [];
  let i = 0;
  const html = String(conteudo || '').replace(
    /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi,
    (todo, attrs, dentro) => {
      // O texto do h2 pode trazer entidade (`&nbsp;`, `&ccedil;`), que dentro do
      // proprio titulo renderiza certo. No sumario ele passa por `H.esc()` de
      // novo e sai `&amp;nbsp;` na tela. Resolver a entidade antes de rotular.
      const texto = _semEntidade(dentro.replace(/<[^>]+>/g, '')).trim();
      if (!texto || /^(veja tamb[ée]m|leia tamb[ée]m)$/i.test(texto)) return todo;
      i++;
      const jaTem = /\sid=/i.test(attrs || '');
      const id = jaTem
        ? (attrs.match(/\sid="([^"]*)"/i) || [])[1]
        : 'sec-' + i;
      itens.push({ id, texto });
      return jaTem ? todo : `<h2${attrs || ''} id="${id}">${dentro}</h2>`;
    });
  return { html, itens };
}

/* Ficha do autor no fim da materia: retrato, frente de cobertura e link.
 * Os campos sao os do motor: `nome`, `slug`, `editoria` e `lead`. Inventar
 * `bio` ou `editorias` nao da erro em lugar nenhum, so nao gera nada. */
function xAssinatura(ctx, art) {
  const { site, c, H } = ctx;
  const nome = (art.author || '').trim();
  if (!nome) return '';
  const e = (site.equipe || []).find(x => x.nome === nome);
  if (!e) return '';
  return `<aside class="${c('xass')}">
<img src="/img/autores/${H.esc(e.slug)}.webp" alt="Ilustração de ${H.esc(e.nome)}"
  width="76" height="76" loading="lazy" decoding="async">
<div>${e.editoria ? `<div class="ed">${H.esc(e.editoria)}</div>` : ''}
<span class="nm">${H.esc(e.nome)}</span>
${e.lead ? `<p>${H.esc(e.lead)}</p>` : ''}
<a class="go" href="/autor/${H.esc(e.slug)}/">Ver tudo de ${H.esc(e.nome.split(' ')[0])}</a></div>
</aside>`;
}

/* Icones em curva, para nao carregar biblioteca de icone nem expor nome de fonte. */
const X_IC = {
  zap: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="currentColor"><path d="M8 0a8 8 0 0 0-6.9 12L0 16l4.1-1.1A8 8 0 1 0 8 0m0 14.6a6.6 6.6 0 0 1-3.4-.9l-.2-.2-2.5.7.7-2.4-.2-.3A6.6 6.6 0 1 1 8 14.6m3.6-4.9c-.2-.1-1.2-.6-1.3-.6-.2-.1-.3-.1-.4.1l-.6.7c-.1.1-.2.2-.4.1a5.4 5.4 0 0 1-2.7-2.3c-.2-.3.2-.3.5-1 0-.1 0-.2-.1-.3l-.6-1.3c-.1-.3-.3-.3-.4-.3h-.4c-.1 0-.3 0-.5.3a2 2 0 0 0-.6 1.5 3.6 3.6 0 0 0 .7 1.8 8 8 0 0 0 3.1 2.7c1.1.5 1.6.5 2.2.4.3 0 1.1-.4 1.3-.9s.2-.9.1-1z"/></svg>',
  fb: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="currentColor"><path d="M16 8a8 8 0 1 0-9.2 7.9v-5.6H4.7V8h2.1V6.2c0-2.1 1.2-3.2 3.1-3.2.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.3V8h2.2l-.3 2.3H9.4v5.6A8 8 0 0 0 16 8"/></svg>',
  x: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="currentColor"><path d="M12.6 1h2.4l-5.3 6 6.2 8.2h-4.9L7.2 10 2.9 15.2H.5l5.6-6.4L.2 1h5l3.4 4.5zm-.8 12.8h1.3L4.3 2.3H2.9z"/></svg>',
  lk: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6.4 8.6a2.5 2.5 0 0 0 3.8.3l1.5-1.5a2.5 2.5 0 0 0-3.6-3.6l-.9.9"/><path d="M9.6 7.4a2.5 2.5 0 0 0-3.8-.3L4.3 8.6a2.5 2.5 0 0 0 3.6 3.6l.9-.9"/></svg>',
};

/* Compartilhar fixo no trilho. Vertical, porque a coluna e estreita, e com as
 * classes da arquitetura: o `.share` do motor e uma fileira horizontal. */
function xShareRail(ctx, P) {
  const { c, H } = ctx;
  const u = encodeURIComponent(P.absUrl);
  const tt = encodeURIComponent(P.title);
  return `<div class="${c('xsr')}"><b>Compartilhar</b><div>
<a href="https://api.whatsapp.com/send/?text=${tt}%20${u}" target="_blank" rel="noopener">${X_IC.zap}WhatsApp</a>
<a href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener">${X_IC.fb}Facebook</a>
<a href="https://twitter.com/intent/tweet?url=${u}&text=${tt}" target="_blank" rel="noopener">${X_IC.x}X</a>
<button class="cp" type="button" data-url="${H.esc(P.absUrl)}">${X_IC.lk}Copiar link</button>
</div></div>`;
}

function xArticle(ctx, art, menu, related, P) {
  const { c, H } = ctx;
  // o P vem pronto do motor: url, imgUrl, desc, readMin, catSlug, catName e os
  // blocos de schema. Nao ha helper para calcular isso na arquitetura.
  const { html: corpo, itens } = xToc(art.content);
  const toc = itens.length >= 3 ? `<nav class="${c('xtoc')}" aria-label="Sumário da matéria">
<b>Neste guia</b><ol>${itens.map(x =>
    `<li><a href="#${H.esc(x.id)}">${H.esc(x.texto)}</a></li>`).join('')}</ol></nav>` : '';
  const maisLidas = (related && related.length > 3) ? `<div class="${c('xrm')}">
<b>Continue lendo</b>${related.slice(3, 7).map(a => xCard(ctx, a)).join('')}</div>` : '';
  const rel = (related && related.length) ? `<section class="${c('xrel')}">
<div class="${c('xsh')}"><h2>Leia também</h2></div>
<div class="${c('xgrade')} ${c('xg3')}">${related.slice(0, 3).map(a =>
    xGrid(ctx, a, false)).join('')}</div>
</section>` : '';

  return `${H.head(ctx, H.artMeta(ctx, art, P))}
${xHeader(ctx, menu)}
${H.progressBar(ctx)}
<main class="${c('xwrap')}"><div class="${c('xin')}">
<div class="${c('xpost')}">
<article class="${c('xart')}">
${H.crumbs(ctx, art, P)}
<span class="${c('xkick')}"><a href="${H.curl(P.catSlug)}">${H.esc(P.catName)}</a></span>
<h1>${H.esc(art.title)}</h1>
${art.dek ? `<p class="${c('xdek')}">${H.esc(art.dek)}</p>` : ''}
${H.metaRow(ctx, art, P)}
${P.imgUrl ? `<span class="${c('xcapa')}">${H.pic(art, true)}</span>
<p class="${c('xleg')}">${H.esc(art.image && art.image.alt ? art.image.alt : art.title)}</p>` : ''}
<div class="${c('xbody')}">${corpo}</div>
${H.share(ctx, P)}
${xAssinatura(ctx, art)}
</article>
<aside class="${c('xrail')}">${toc}${maisLidas}${xShareRail(ctx, P)}</aside>
</div>
${rel}
</div></main>
${xFooter(ctx, menu)}
${H.progressScript(ctx)}
${H.bodyEnd()}`;
}

function xList(ctx, opts) {
  const { c, H } = ctx;
  const menu = ctx.menu || opts.menu;
  const meta = H.listMeta(ctx, opts);
  const itens = opts.items || [];
  return `${H.head(ctx, meta)}
${xHeader(ctx, menu)}
<main class="${c('xwrap')}"><div class="${c('xin')}">
<section class="${c('xsec')}">
<div class="${c('xsh')} ${c('xsh1')}"><h1>${H.esc(opts.title)}</h1></div>
${opts.desc ? `<p class="${c('xdek')}" style="max-width:68ch;margin-top:-6px">${H.esc(opts.desc)}</p>` : ''}
<div class="${c('xgrade')}">${itens.map((a, i) => xGrid(ctx, a, i === 0, 2)).join('')}</div>
</section>
</div></main>
${xFooter(ctx, menu)}
${H.bodyEnd()}`;
}

module.exports = { xCss, xHeader, xFooter, xHome, xArticle, xList };
