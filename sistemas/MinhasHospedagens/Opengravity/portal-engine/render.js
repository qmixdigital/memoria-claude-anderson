'use strict';
/**
 * render.js — nucleo do motor (orquestrador). Sem dependencias externas.
 *
 * Responsabilidades: decode/sanitize/dek do conteudo do Antonio, IO atomico,
 * SEO/schema, sitemap, robots, manifest, favicons, IndexNow, idempotencia,
 * catLock, publish/rebuild. A APARENCIA (DOM/CSS/classes) vive em archs.js e a
 * IDENTIDADE divergente (fingerprint) em tokens.js. Este arquivo monta o `ctx`
 * (com classes prefixadas + tokens) e despacha pro arquetipo do site.
 *
 * Exporta: slugify, publishArticle, rebuildIndexes, readAllArticles,
 *          decodeEntities, extractDek, pingIndexNow.
 */

// ---------- limite de 60 caracteres no title ----------
// O Google corta em 60. Cortar aqui, na ultima palavra cheia, e melhor do que
// deixar ele cortar no meio de uma palavra.

// ---------- assinatura clicavel e pacote editorial ----------
// A assinatura so vira link quando o nome consta na equipe do portal. Nome que
// nao esta na equipe sai como texto: link para pagina que nao existe e pior que
// assinatura sem link.
function autorLink(site, nome) {
  const eq = (site.equipe || []).find(e => e.nome === nome);
  if (!eq) return esc(nome || site.name);
  return '<a rel="author" href="/autor/' + esc(eq.slug) + '/">' + esc(eq.nome) + '</a>';
}

const _TITLE_VAZIA = new Set(('de da do das dos e ou a o as os um uma no na nos nas em por para com que se '
  + 'ao aos pelo pela como sobre entre apos ante mais menos seu sua sem sob ate '
  + 'e sao foi era sera vai tem ha nao ja so '
  // Interrogativo, imperativo de chamada e pronome atono nunca terminam um
  // titulo: se sobraram no fim, a frase foi partida pelo teto. O caso que
  // custou caro foi "Tabela de preco para desentupimento: quanto", que rendeu
  // 8 cliques em 2056 impressoes na posicao 2,9. O leitor le a pergunta sem
  // fim na SERP e passa reto.
  + 'quanto quantos quanta quantas quando qual quais quem onde porque '
  + 'veja saiba entenda confira descubra vem eis '
  + 'ele ela eles elas isso isto aquilo lhe lhes').split(' '));

// Verbo de terceira pessoa e caso diferente: ele PODE fechar um titulo bom,
// como em "Como o marketing de influencia funciona". So e cauda quebrada
// quando o que vem antes dele tambem e palavra vazia, como em "Fluminense
// perde para Mirassol e fica". Por isso a poda dele e condicional.
// Verbo que exige complemento nao fecha frase em portugues: "semana fica",
// "morador faz", "Campo Grande-Rio custa" sao todos meio de frase. Sobrou no
// fim do title, foi o teto que partiu. Poda sempre.
const _TITLE_EXIGE = new Set(('fica ficam custa custam faz fazem pode podem deve devem '
  + 'vale valem vira viram torna tornam leva levam poe poem').split(' '));

// Ja estes fecham frase legitima: "Como o marketing de influencia funciona",
// "para que serve". So sao cauda quebrada quando vem depois de palavra vazia
// ("Mirassol e fica") ou logo apos separador de clausula ("Californ1a: Melhor").
// Por isso a poda deles e condicional.
const _TITLE_TALVEZ = new Set(('funciona funcionam serve servem sai saem usa usam '
  + 'melhor melhores pior piores').split(' '));
const _FIM_CLAUSULA = /[:;–—]$/;

// Verbo transitivo fecha frase legitima em oracao relativa que tem sujeito
// proprio: "Os sinais que o algoritmo usa" esta inteiro. Ja "As tecnicas que
// tornam" e "filmes que so fazem" estao pela metade. O que separa os dois casos
// e existir palavra de conteudo entre o "que" e o verbo.
function _relativaCompleta(pal) {
  for (let k = pal.length - 2; k >= 0 && k >= pal.length - 5; k--) {
    if (_semAcento(pal[k]) !== 'que') continue;
    for (let j = k + 1; j < pal.length - 1; j++)
      if (!_TITLE_VAZIA.has(_semAcento(pal[j]))) return true;
    return false;
  }
  return false;
}

function _podaCauda(pal) {
  for (;;) {
    if (pal.length <= 3) return pal;
    const u = _semAcento(pal[pal.length - 1]);
    if (_TITLE_VAZIA.has(u)) { pal.pop(); continue; }
    if (_TITLE_EXIGE.has(u)) {
      if (_relativaCompleta(pal)) return pal;
      pal.pop(); continue;
    }
    const ant = pal.length > 1 ? pal[pal.length - 2] : '';
    if (_TITLE_TALVEZ.has(u) && pal.length > 4
        && (_TITLE_VAZIA.has(_semAcento(ant)) || _FIM_CLAUSULA.test(ant))) { pal.pop(); continue; }
    return pal;
  }
}

// A lista acima foi escrita SEM acento, mas a comparacao usava so
// toLowerCase(): 'apos', 'ate' e 'e' nunca casavam com "apos", "ate" e
// "e" reais. O title saia com a copula pendurada, cortada pelo teto de 60:
//   Mega-Sena 3047 acumula; proximo premio e - Viaje no Detalhe
// Normalizar o acento na comparacao conserta esse caso e os latentes.
const _semAcento = s => String(s).toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[.,;:]$/, '');

// Corte de titulo nao enxergava aspas, e citacao truncada saia aberta na SERP:
// `Guto Miguel: "Meu sonho e ser o maior`. Se sobrou numero impar de aspas,
// recua ate antes da que abriu: perde-se um pedaco e ganha-se frase inteira.
function _fechaAspas(s) {
  const ASPAS = '“”«»"';
  let n = 0;
  for (const ch of s) if (ASPAS.includes(ch)) n++;
  if (n % 2 === 0) return s;
  let i = -1;
  for (let k = 0; k < s.length; k++) if (ASPAS.includes(s[k])) i = k;
  if (i <= 0) return s.replace(new RegExp('[' + ASPAS + ']', 'g'), '').trim();
  return s.slice(0, i).replace(/[\s:,;\-–]+$/, '').trim();
}

// "do Revista QMIX" saia errado: os modelos escreviam o artigo fixo. Campo
// opcional `nomeArtigo` no sites.json, com "do" como padrao.
function _artigoDe(site) { return (site.nomeArtigo || 'do') + ' ' + site.name; }

function _cortaTitle(titulo, sufixo, teto) {
  teto = teto || 60;
  const full = titulo + sufixo;
  if (full.length <= teto) return _fechaAspas(titulo) + sufixo;
  // Titulo inteiro sem a marca informa mais do que titulo cortado com a marca:
  // a palavra-chave cai justamente no fim ("custa quanto em 2026"), e era ela
  // que o sufixo empurrava para fora. Medido na rede: 57% dos titulos hoje
  // cortados cabem inteiros assim. O Google acrescenta o nome do site por conta
  // propria quando julga necessario.
  if (titulo.length <= teto) return _fechaAspas(titulo);
  const cabe = teto - sufixo.length;
  if (cabe < 24) return _fechaAspas(titulo.slice(0, Math.max(24, teto)).trim());
  let corte = titulo.slice(0, cabe + 1);
  const i = corte.lastIndexOf(' ');
  let pal = (i > 0 ? corte.slice(0, i) : corte).trim().split(/\s+/);
  const inteiro = pal.slice();   // corte em palavra cheia, antes da poda
  pal = _podaCauda(pal);
  // O laco para em 3 palavras para nao comer o titulo, mas isso deixava
  // preposicao pendurada quando sobravam exatamente tres: "Industria 4.0: o".
  // Aqui so a cauda vazia cai, e nunca abaixo de duas palavras.
  while (pal.length > 1 && _TITLE_VAZIA.has(_semAcento(pal[pal.length - 1]))) pal.pop();
  // inclui travessao curto e longo, e parentese aberto: titulo de WordPress
  // importado costuma trazer justamente esses na emenda do corte
  let curto = pal.join(' ').replace(/[\s,;:\-–—(]+$/, '').trim();
  // Corte em palavra cheia sempre: partir palavra no meio na SERP e pior do que
  // entregar um titulo curto. A poda para em 3 palavras, entao curto nunca vem
  // vazio; o inteiro so entra se o titulo original tinha menos que isso.
  if (!curto) curto = inteiro.join(' ').replace(/[\s,;:\-–—(]+$/, '').trim();
  return _fechaAspas(curto) + sufixo;
}

function faqSchema(art) {
  const c = String(art.content || '');
  const i = c.search(/<h2[^>]*>[^<]*(perguntas frequentes|d[uú]vidas frequentes|faq)[^<]*<\/h2>/i);
  if (i < 0) return null;
  const bloco = c.slice(i);
  const pares = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*((?:<p[^>]*>[\s\S]*?<\/p>\s*)+)/gi;
  let m;
  while ((m = re.exec(bloco)) && pares.length < 10) {
    const q = String(m[1]).replace(/<[^>]+>/g, '').trim();
    const a = String(m[2]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (q.length > 8 && a.length > 30) pares.push({ q: q, a: a });
  }
  if (pares.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pares.map(function (p) {
      return { '@type': 'Question', name: p.q, acceptedAnswer: { '@type': 'Answer', text: p.a } };
    }),
  };
}

const fs = require('fs');
const path = require('path');
const { getArch } = require('./archs');
const { rollFingerprint, resolveTokens, hashSeed, PREFIXES } = require('./tokens');

// ---------- helpers de texto/io ----------
function slugify(str) {
  return String(str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80) || 'post';
}
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function stripTags(html) { return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
function clip(s, n) {
  const t = stripTags(s).trim();
  if (t.length <= n) return t;
  const corte = t.slice(0, n);
  const esp = corte.lastIndexOf(' ');
  return (esp > n * 0.6 ? corte.slice(0, esp) : corte).replace(/[\s,;:.\-]+$/, '') + '...';
}
function decodeEntities(s) {
  let str = String(s == null ? '' : s);
  const pass = (x) => x
    .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => { try { return String.fromCodePoint(parseInt(h, 16)); } catch (e) { return m; } })
    .replace(/&#(\d+);/g, (m, d) => { try { return String.fromCodePoint(parseInt(d, 10)); } catch (e) { return m; } })
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&lsquo;/g, '‘').replace(/&rsquo;/g, '’')
    .replace(/&amp;/g, '&');
  for (let i = 0; i < 3; i++) { const b = str; str = pass(str); if (str === b) break; }
  return str;
}
function extractDek(content) {
  let c = String(content || ''); let dek = '';
  const m = c.match(/^\s*(?:<p>\s*)?<(?:i|em)>([\s\S]*?)<\/(?:i|em)>(?:\s*<\/p>)?/i);
  if (m) { dek = stripTags(m[1]).trim(); c = c.slice(m[0].length).replace(/^\s+/, ''); }
  return { dek, content: c };
}
function sanitizeHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?(?:script|iframe|object|embed|form|base|meta|link)\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');
}
function metaDesc(a) {
  // descricao enviada pelo Antonio (campo opcional meta_description) tem prioridade
  if (a.metaDescription) return stripTags(a.metaDescription).slice(0, 200);
  return (a.excerpt ? stripTags(a.excerpt) : stripTags(a.content)).slice(0, 158);
}
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
let _wc = 0;
function writeAtomic(p, data) { const t = `${p}.tmp.${process.pid}.${++_wc}`; fs.writeFileSync(t, data); fs.renameSync(t, p); }
function siteRoot(cfg, s) { return path.join(cfg.sitesRoot, s.slug); }
function pub(cfg, s, ...p) { return path.join(siteRoot(cfg, s), 'public', ...p); }
function dataDir(cfg, s) { return path.join(siteRoot(cfg, s), 'data'); }
// --- exclusividade entre portais (1 conteudo/slug = 1 portal dono) ---------------
// indice global de donos: { slug: portalDono }. Impede o mesmo artigo (mesmo slug,
// vindo do feed/Antonio) cair em varios dominios = conteudo duplicado na rede.
function dedupPath(cfg) { return path.join(cfg.sitesRoot, '_dedup', 'owners.json'); }
let _ownersCache = null, _ownersMtime = -1;
function loadOwners(cfg) {
  const p = dedupPath(cfg);
  try {
    const st = fs.statSync(p);
    if (_ownersCache && st.mtimeMs === _ownersMtime) return _ownersCache;
    _ownersCache = JSON.parse(fs.readFileSync(p, 'utf8')); _ownersMtime = st.mtimeMs;
  } catch (e) { if (!_ownersCache) _ownersCache = {}; }
  return _ownersCache;
}
function ownerOf(cfg, slug) { return loadOwners(cfg)[slug]; }
function claimOwner(cfg, slug, siteSlug) {
  const p = dedupPath(cfg); const o = loadOwners(cfg); o[slug] = siteSlug;
  try { ensureDir(path.dirname(p)); writeAtomic(p, JSON.stringify(o)); _ownersCache = o; _ownersMtime = fs.statSync(p).mtimeMs; } catch (e) {}
}

// ---------- tema (cores + fontes) ----------
function theme(site) {
  const t = site.theme || {};
  return {
    primary: t.primary || site.primary || '#b4232a',
    ink: t.ink || '#1a1714',
    paper: t.paper || '#fbf9f5',
    muted: t.muted || '#4f483f',
    line: t.line || '#e7e1d6',
    surface: t.surface || '#ffffff',
    ph: t.ph || '#eceae4',
    dek: t.dek || '#3b352e',
    barBg: t.barBg || t.ink || '#1a1714',
    barTx: t.barTx || '#f4efe6',
    footerBg: t.footerBg || t.ink || '#1a1714',
    footerTx: t.footerTx || '#cfc8bc',
    onPrimary: t.onPrimary || '#ffffff',
    // cor do bloco fixado no Windows. Vazio de proposito: o head cai no
    // primario quando o portal nao define, que e o comportamento antigo
    tileColor: t.tileColor || '',
    fontDisplay: t.fontDisplay || '"Fraunces", Georgia, "Times New Roman", serif',
    fontBody: t.fontBody || '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
    googleUrl: t.googleUrl || 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=IBM+Plex+Sans:<<REMOVIDO>>;500;600;700&display=swap',
  };
}

// ---------- fingerprint do site (arch + prefixo de classe + tokens) ----------
function fpOf(site) {
  const base = site.fp || {};
  const arch = base.arch || (site.layout && site.layout.arch) || 'A';
  const prefix = base.prefix || PREFIXES[hashSeed(site.slug) % PREFIXES.length];
  const tok = resolveTokens(base);
  const mode = base.paletteMode || (theme(site).paper && /^#0|^#1/.test(theme(site).paper) ? 'dark' : 'light');
  // os campos crus do sites.json passam junto: as arquiteturas leem
  // fp.container, fp.medida, fp.heroAr, fp.radius e companhia direto, e sem
  // isto todas caiam na medida de reserva escrita na propria arquitetura
  return Object.assign({}, base, { arch, prefix, paletteMode: mode, T: tok });
}

// ---------- token de classe OPACO e unico por portal (anti-fingerprint) ----------
// Em vez de "prefixo-nomesemantico" (ex.: pxm-card / tsg-card, onde so o prefixo de
// 3 letras diverge e o sufixo "card" e identico em toda a rede), cada elemento vira
// um token opaco derivado do slug: mesmo elemento => classe DIFERENTE em cada portal,
// sem prefixo comum p/ um detector normalizar e sem vocabulario semantico p/ grepar.
// Deterministico por (slug, chave) => estavel entre rebuilds; HTML e CSS sempre batem
// (ambos passam pelo mesmo c()/s() do ctx).
function classToken(salt, k) {
  const a = hashSeed(salt + '|' + k) >>> 0;
  const b = hashSeed(k + '#' + salt) >>> 0;
  const lead = 'cdfghjkmnpqrstvwxz'[a % 18]; // consoante: ident CSS valido (nunca comeca com digito)
  return lead + a.toString(36) + (b % 1296).toString(36);
}

// ---------- CSS base (tokens + reset + atomos compartilhados, prefixados) ----------
function baseCss(ctx) {
  const { s } = ctx; const t = theme(ctx.site); const T = ctx.fp.T;
  return `:root{--p:${t.primary};--ink:${t.ink};--paper:${t.paper};--muted:${t.muted};--line:${t.line};--surface:${t.surface};--ph:${t.ph};--dek:${t.dek};--bar-bg:${t.barBg};--bar-tx:${t.barTx};--footer-bg:${t.footerBg};--footer-tx:${t.footerTx};--onp:${t.onPrimary};--fd:${t.fontDisplay};--fb:${t.fontBody};--maxw:${T.container};--fs:${T.baseFs};--rad-sm:${T.radius.sm};--rad:${T.radius.md};--rad-lg:${T.radius.lg};--shadow:${T.shadow.card};--shadow-soft:${T.shadow.soft};--gap:${T.spacing.gap};--col:${T.spacing.col};--sec:${T.spacing.sec};--block:${T.spacing.block};--hero-ar:${T.heroAr};--card-ar:${T.cardAr};--kls:${T.kickerLs}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
/* pagina de equipe e de autor: o HTML traz estas classes e nenhuma
   arquitetura destas instancias as estiliza, entao a pagina saia crua */
.eq-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:22px 0 10px}
.eq-card{display:grid;grid-template-columns:72px minmax(0,1fr);gap:0 15px;align-items:start;border:1px solid var(--line);padding:15px;text-decoration:none;color:inherit;background:var(--surface)}
.eq-card:hover{border-color:var(--p)}
.eq-card img{width:72px;height:72px;object-fit:cover;background:var(--ph);display:block}
.eq-card b,.eq-card h3{font-family:var(--fd);font-weight:700;font-size:16.5px;line-height:1.24;color:var(--ink);margin:0 0 6px}
.eq-card:hover b,.eq-card:hover h3{color:var(--p)}
.eq-card h3 a{color:inherit;text-decoration:none}
.eq-area,.eq-ed{display:block;font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;color:var(--p);margin:0 0 6px}
.eq-res{display:block;font-family:var(--fb);font-size:13.5px;font-weight:400;line-height:1.66;color:var(--muted);margin:0;text-transform:none;letter-spacing:normal;text-align:left}
.pf-topo{display:flex;gap:16px;align-items:center;margin:0 0 24px;padding:16px;border:1px solid var(--line);background:var(--surface)}
.pf-topo img{width:88px;height:88px;object-fit:cover;flex:none;background:var(--ph)}
.pf-ed{font-family:var(--fb);font-size:10.5px;font-weight:700;letter-spacing:.14em;color:var(--p);margin:0 0 7px}
.pf-lead{font-family:var(--fd);font-weight:600;font-size:18px;line-height:1.34;color:var(--ink);margin:0;text-align:left}
.pf-obs{font-family:var(--fb);font-size:13.5px;line-height:1.7;color:var(--muted);padding-left:15px;border-left:3px solid var(--line);margin:24px 0 0;text-align:left}
.autor-posts{list-style:none;padding:0;margin:16px 0 6px}
/* pular para o conteudo: fora da tela ate receber foco. Sem ele, quem usa
   teclado ou leitor de tela reatravessa cabecalho e menu em cada pagina */
.pular-conteudo{position:absolute;left:-9999px;top:0;z-index:9999;background:var(--p);color:var(--onp);padding:12px 20px;border-radius:0 0 var(--rad-sm,4px) 0;font-family:var(--fb);font-size:15px;font-weight:600;text-decoration:none}
.pular-conteudo:focus{left:0}
.autor-posts li{display:flex;align-items:baseline;gap:16px;padding:11px 0;border-bottom:1px solid var(--line)}
.autor-posts li:last-child{border-bottom:0}
.autor-posts li a{flex:1;min-width:0}
.autor-posts li span{flex:none;font-family:var(--fb);font-size:10.5px;font-weight:600;letter-spacing:.14em;color:var(--muted);white-space:nowrap}
@media(max-width:700px){.eq-grid{grid-template-columns:1fr}.pf-topo{flex-direction:column;align-items:flex-start}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb);font-size:var(--fs);line-height:1.65;font-feature-settings:"kern","liga";overflow-wrap:break-word;-webkit-tap-highlight-color:rgba(0,0,0,.06)}
a{color:inherit;text-decoration:none;touch-action:manipulation}
button{touch-action:manipulation}
[id]{scroll-margin-top:70px}
img{max-width:100%}
${s('wrap')}{max-width:var(--maxw);margin:0 auto;padding:0 24px}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
${s('kicker')}{font-size:12px;font-weight:700;letter-spacing:var(--kls);color:var(--p)}
${s('kicker')} a{color:var(--p)}
${s('dek')}{font-size:clamp(17px,2.1vw,20px);line-height:1.5;color:var(--dek);margin:0 0 22px;max-width:62ch}
${s('crumbs')}{font-size:12px;letter-spacing:.03em;color:var(--muted);margin-bottom:18px}
${s('crumbs')} a{color:var(--muted)}${s('crumbs')} a:hover{color:var(--p)}${s('crumbs')} .sep{opacity:.55}${s('crumbs')} .cur{color:var(--ink);font-weight:600;opacity:1}
${s('meta')}{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:13px;letter-spacing:.02em;color:var(--muted);margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid var(--line)}
${s('meta')} .by{color:var(--ink);font-weight:600}${s('meta')} .sep{opacity:.5}${s('meta')} .rt{color:var(--p);font-weight:600}
${s('share')}{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:36px 0 0;padding-top:24px;border-top:1px solid var(--line)}
${s('share')} .lb{font-size:12px;font-weight:700;letter-spacing:.12em;color:var(--muted)}
${s('share')} .bt{font-size:13px;font-weight:600;padding:8px 14px;border:1px solid var(--line);border-radius:999px;color:var(--ink);background:var(--surface);cursor:pointer;transition:all .2s;line-height:1}
${s('share')} .bt:hover{background:var(--p);color:var(--onp);border-color:var(--p)}
${s('progress')}{position:fixed;top:0;left:0;height:3px;width:100%;background:var(--p);transform:scaleX(0);transform-origin:0 50%;z-index:50;transition:transform .05s linear}
header .google-auto-placed,nav .google-auto-placed,footer .google-auto-placed,body > .google-auto-placed:has(~ header){display:none!important}
.page{max-width:760px;margin:0 auto;padding:var(--block) 0 10px}
.page h1{font-family:var(--fd);font-weight:900;font-size:clamp(30px,4.6vw,44px);line-height:1.08;letter-spacing:-.02em;margin:0 0 8px}
.page .upd{color:var(--muted);font-size:13px;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--line)}
.avatar-autor{display:block;width:120px;height:120px;object-fit:cover;border-radius:50%;margin:0 0 18px;background:var(--ph);border:3px solid var(--p)}
.page h2{font-family:var(--fd);font-weight:700;font-size:24px;margin:32px 0 12px}
.page p{margin:0 0 16px}.page ul{margin:0 0 16px;padding-left:20px}.page li{margin:0 0 8px}.page a{color:var(--p);text-decoration:underline}
.cform{display:flex;flex-direction:column;gap:14px;max-width:560px;margin-top:8px}
.cform label{display:flex;flex-direction:column;gap:6px;font-size:14px;font-weight:600;color:var(--ink)}
.cform input,.cform textarea{font:inherit;font-size:16px;padding:11px 13px;border:1px solid var(--line);border-radius:var(--rad);background:var(--surface);color:var(--ink)}
.cform input:focus,.cform textarea:focus{outline:none;border-color:var(--p)}
.cform button{align-self:flex-start;background:var(--p);color:var(--onp);border:0;border-radius:999px;padding:12px 30px;font-weight:600;font-size:15px;cursor:pointer}
.cform button:disabled{opacity:.6;cursor:default}
.cform-msg{font-size:14px;margin:4px 0 0;padding:11px 13px;border-radius:var(--rad)}
.cform-msg.ok{background:#e7f6ec;color:#1c6b3a}.cform-msg.err{background:#fbe7e7;color:#a12020}
.notfound{text-align:center;padding:64px 0 48px}
.nf-code{font-family:var(--fd);font-weight:900;font-size:clamp(86px,18vw,168px);line-height:.9;color:var(--p);letter-spacing:-.03em}
.notfound h1{font-family:var(--fd);font-weight:900;font-size:clamp(24px,4vw,34px);margin:6px 0 12px}
.notfound p{color:var(--muted);margin:0 0 6px}
.nf-home{display:inline-block;margin-top:16px;font-weight:600;color:var(--p);border:1px solid var(--p);border-radius:999px;padding:10px 22px}
.nf-home:hover{background:var(--p);color:var(--onp)}
@media(prefers-reduced-motion:no-preference){
${s('reveal')}{opacity:0;transform:translateY(14px);animation:rv .55s cubic-bezier(.2,.7,.2,1) forwards}
${s('reveal')}:nth-child(2){animation-delay:.05s}${s('reveal')}:nth-child(3){animation-delay:.1s}${s('reveal')}:nth-child(4){animation-delay:.15s}${s('reveal')}:nth-child(n+5){animation-delay:.2s}
@keyframes rv{to{opacity:1;transform:none}}
}
@media(max-width:600px){
${s('wrap')}{padding:0 16px}
nav a{display:inline-flex;align-items:center;min-height:46px}
footer a{padding-top:11px;padding-bottom:11px}
${s('share')}{gap:8px 10px}
${s('share')} .bt{padding:0 18px;min-height:46px;font-size:14px;display:inline-flex;align-items:center}
${s('meta')}{font-size:12.5px}
${s('crumbs')}{font-size:11.5px}
.page{padding-top:30px}
.cform button{align-self:stretch;text-align:center;min-height:48px}
}`;
}

// ---------- AdSense (por site: campos "adsense" e "adsSlots" no sites.json) ----
// O mesmo publisher id tem DUAS formas e elas NAO sao intercambiaveis: o ads.txt
// quer "pub-XXXX" e o client= do loader quer "ca-pub-XXXX". Com a forma errada no
// client o script carrega, responde 200 e nao serve anuncio nenhum, em silencio.
// Por isso a normalizacao mora aqui, e nao no sites.json.
function pubIdCa(site) { const v = String(site.adsense || '').trim(); return v ? (v.indexOf('ca-') === 0 ? v : 'ca-' + v) : ''; }
function pubIdRaw(site) { return String(site.adsense || '').trim().replace(/^ca-/, ''); }

// Meta de verificacao de propriedade, uma por provedor, vinda do sites.json.
// A Impact usa `value=` no lugar de `content=`: nao e o atributo padrao de
// <meta>, mas o verificador dela procura a string exata, entao sai como ela pede.
const _ATRIB_VERIF = { impact: 'value' };
const _NOME_VERIF = {
  impact: 'impact-site-verification',
  google: 'google-site-verification',
  bing: 'msvalidate.01',
  pinterest: 'p:domain_verify',
  facebook: 'facebook-domain-verification',
  yandex: 'yandex-verification',
};
function verificacaoTags(site) {
  const v = site.verificacoes;
  if (!v || typeof v !== 'object') return '';
  return Object.keys(v).map(k => {
    const valor = String(v[k] || '').trim();
    if (!valor) return '';
    const nome = _NOME_VERIF[k] || k;
    const atrib = _ATRIB_VERIF[k] || 'content';
    return '<meta name="' + esc(nome) + '" ' + atrib + '="' + esc(valor) + '">';
  }).join('');
}

// Consent Mode v2 tem que rodar ANTES de qualquer tag do Google, senao o padrao
// nao vale. O banner de LGPD faz o `update` quando o visitante aceita.
function adsenseTags(site) {
  const id = pubIdCa(site);
  if (!id) return '';
  const consent = '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}'
    + 'var _ok=document.cookie.indexOf("cookie_consent=todos")>=0;'
    + 'gtag("consent","default",{ad_storage:_ok?"granted":"denied",ad_user_data:_ok?"granted":"denied",'
    + 'ad_personalization:_ok?"granted":"denied",analytics_storage:_ok?"granted":"denied",wait_for_update:500});</script>';
  // Unidade sem anuncio para servir some, em vez de deixar buraco no meio do
  // texto. O `min-height` segura o pouco de espaco que evita o salto de layout
  // enquanto o Google decide.
  const estilo = '<style>ins.adsbygoogle[data-ad-status="unfilled"]{display:none!important}'
    + 'ins.adsbygoogle{min-height:0}</style>';
  return consent + estilo
    + '<meta name="google-adsense-account" content="' + esc(id) + '">'
    + '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='
    + esc(id) + '" crossorigin="anonymous"></script>';
}

function _unidade(site, slot, tipo) {
  const id = pubIdCa(site);
  if (!id || !slot) return '';
  const ins = tipo === 'artigo'
    ? '<ins class="adsbygoogle" style="display:block;text-align:center" data-ad-layout="in-article"'
      + ' data-ad-format="fluid" data-ad-client="' + esc(id) + '" data-ad-slot="' + esc(slot) + '"></ins>'
    : '<ins class="adsbygoogle" style="display:block" data-ad-client="' + esc(id) + '"'
      + ' data-ad-slot="' + esc(slot) + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
  // Sem classe propria de proposito: nome de classe literal igual entre portais
  // e impressao digital de rede. `adsbygoogle` e exigencia do Google e universal.
  return '<div style="margin:26px 0" data-a="' + esc(tipo) + '">' + ins
    + '<script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>';
}

// Dentro do corpo do artigo, e nao entre blocos da arquitetura: o anuncio entra
// depois de um paragrafo inteiro, nunca no meio de uma lista ou de uma tabela.
function adsNoCorpo(site, html) {
  const s = (site.adsSlots || {});
  if (!pubIdCa(site) || !s.artigo) return html;
  // So paragrafo de primeiro nivel: dentro de FAQ, tabela, lista ou citacao o
  // bloco de anuncio quebra o itemprop do schema e o desenho da tabela.
  //
  // A pilha guarda o NOME da tag, e nao um contador: o HTML do WordPress vem
  // cheio de <li> sem </li>, que fecha sozinho, e com contador o nivel nunca
  // voltaria a zero, deixando o artigo inteiro sem anuncio.
  //
  // `div` e `section` de embrulho NAO contam: o texto vindo do WordPress vem
  // dentro de um `<div id="post-NNN">` do tema, e trata-lo como contentor
  // zerava o artigo inteiro. Bloqueia so o que tem semantica propria, mais o
  // `div` de resposta de FAQ, que carrega `itemprop`.
  const CONT = 'div|section|aside|details|table|thead|tbody|tr|td|th|ul|ol|li|blockquote|figure';
  const BLOQUEIA = /^(table|thead|tbody|tr|td|th|ul|ol|li|blockquote|figure)$/;
  const rxTag = new RegExp('<(/?)(' + CONT + '|p)\\b([^>]*?)(/?)>', 'gi');
  // Toda tag entra na pilha, para o fechamento casar com a certa; o que muda e
  // se ela bloqueia ou nao. Empilhar so as que bloqueiam faria um `</div>` de
  // embrulho fechar por engano o `div` da resposta de FAQ.
  const fim = [];
  const pilha = [];
  let travas = 0, m;
  while ((m = rxTag.exec(html)) !== null) {
    const fecha = m[1] === '/';
    const nome = m[2].toLowerCase();
    if (nome === 'p') {
      if (fecha && !travas) fim.push(m.index + m[0].length);
      continue;
    }
    if (fecha) {
      let i = -1;
      for (let k = pilha.length - 1; k >= 0; k--) if (pilha[k].nome === nome) { i = k; break; }
      if (i >= 0) {
        for (let k = i; k < pilha.length; k++) if (pilha[k].trava) travas--;
        pilha.length = i;
      }
    } else if (m[4] !== '/') {
      const trava = BLOQUEIA.test(nome) || /itemprop\s*=/i.test(m[3] || '');
      pilha.push({ nome: nome, trava: trava });
      if (trava) travas++;
    }
  }
  if (fim.length < 4) return html;
  const pontos = [];
  pontos.push({ pos: fim[Math.min(2, fim.length - 1)], slot: s.artigo });
  if (s.artigo2 && fim.length >= 9) pontos.push({ pos: fim[Math.floor(fim.length * 0.62)], slot: s.artigo2 });
  let out = html;
  for (let i = pontos.length - 1; i >= 0; i--) {
    const p = pontos[i];
    out = out.slice(0, p.pos) + _unidade(site, p.slot, 'artigo') + out.slice(p.pos);
  }
  return _lcpEager(out);
}

// Na home e nas listas o anuncio fica no fim do conteudo, antes do rodape, para
// nao empurrar a materia de abertura para baixo da dobra.
function adsNaLista(site, html) {
  const s = (site.adsSlots || {});
  if (!pubIdCa(site) || !s.lista) return html;
  const bloco = '<div style="width:100%;max-width:var(--maxw,1200px);margin:0 auto;padding:0 26px">'
    + _unidade(site, s.lista, 'lista') + '</div>';
  const i = html.lastIndexOf('</main>');
  if (i >= 0) return html.slice(0, i) + bloco + html.slice(i);
  const j = html.indexOf('<footer');
  return j >= 0 ? html.slice(0, j) + bloco + html.slice(j) : html;
}

// ---------- <head> (ordem varia por fp.headOrder; 3 variantes) ----------
function buildHead(ctx, meta) {
  const t = theme(ctx.site); const site = ctx.site;
  const order = ctx.fp.T.headOrder % 3;
  const ld = (meta.jsonld || []).map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  const titleB = `<title>${esc(meta.title)}</title>`;
  const seo = [
    `<meta name="description" content="${esc(meta.desc)}">`,
    `<meta name="robots" content="${esc(meta.robots || 'index, follow')}">`,
    `<link rel="canonical" href="${esc(meta.canonical)}">`,
  ].join('\n');
  const og = {
    type: `<meta property="og:type" content="${esc(meta.ogType || 'website')}">`,
    title: `<meta property="og:title" content="${esc(meta.title)}">`,
    desc: `<meta property="og:description" content="${esc(meta.desc)}">`,
    url: `<meta property="og:url" content="${esc(meta.canonical)}">`,
    locale: `<meta property="og:locale" content="pt_BR">`,
    site: `<meta property="og:site_name" content="${esc(site.name)}">`,
    image: meta.image ? `<meta property="og:image" content="${esc(meta.image)}">` : '',
  };
  const ogOrder = [
    [og.type, og.title, og.desc, og.url, og.locale, og.site, og.image],
    [og.type, og.url, og.title, og.image, og.desc, og.site, og.locale],
    [og.type, og.title, og.url, og.site, og.desc, og.image, og.locale],
  ][order].filter(Boolean).join('\n');
  const twC = `<meta name="twitter:card" content="summary_large_image">`;
  const twT = `<meta name="twitter:title" content="${esc(meta.title)}">`;
  const twD = `<meta name="twitter:description" content="${esc(meta.desc)}">`;
  const twI = meta.image ? `<meta name="twitter:image" content="${esc(meta.image)}">` : '';
  const twBlock = [[twC, twT, twD, twI], [twC, twI, twT, twD], [twC, twT, twI, twD]][order].filter(Boolean).join('\n');
  const ic = {
    svg: `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    // 96px porque o Google exige quadrado e multiplo de 48 para mostrar na SERP,
    // e o `.ico` com o tamanho real em vez de "any", que nao diz resolucao nenhuma
    // ⚠️ os ARQUIVOS continuam todos sendo gerados. O que varia por portal e
    // quais sao declarados e em que ordem. Declarar arquivo que nao existe poe
    // 404 no <head>, defeito que a rede ja teve. O de 48px nunca sai: e o que o
    // Google le para a SERP
    ico: (() => {
      const l48 = `<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">`;
      const opc = [
        `<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png">`,
        `<link rel="icon" type="image/png" sizes="144x144" href="/favicon-144.png">`,
        `<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">`,
        `<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png">`,
      ];
      let h = _hashSemente(site, '#ic#');
      const quantos = 2 + (h % 3);
      for (let i = opc.length - 1; i > 0; i--) {
        h = Math.imul(h ^ i, 16777619) >>> 0;
        const j = h % (i + 1); const x = opc[i]; opc[i] = opc[j]; opc[j] = x;
      }
      const linhas = [l48].concat(opc.slice(0, quantos));
      const _ico = `<link rel="icon" href="/favicon.ico" sizes="48x48">`;
      if ((h % 2) === 0) linhas.push(_ico); else linhas.unshift(_ico);
      return linhas.join(String.fromCharCode(10));
    })(),
    // bloco fixado no menu Iniciar do Windows; sem estas duas o sistema
    // cai no icone generico
    tile: `<meta name="msapplication-TileColor" content="${t.tileColor || t.primary}">
<meta name="msapplication-TileImage" content="/icon-192.png">`,
    apple: `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`,
    manifest: `<link rel="manifest" href="/site.webmanifest">`,
    theme: `<meta name="theme-color" content="${t.primary}">`,
  };
  const iconBlock = _embaralha(site,
    [ic.svg, ic.ico, ic.apple, ic.manifest, ic.theme, ic.tile], '#ico#').join('\n');
  const fonts = [
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link rel="preload" as="style" href="${esc(t.googleUrl)}">`,
    `<link rel="stylesheet" href="${esc(t.googleUrl)}" media="print" onload="this.media='all'">`,
    `<noscript><link rel="stylesheet" href="${esc(t.googleUrl)}"></noscript>`,
  ].join('\n');
  // a hero e o LCP: descobri-la so quando o parser chega nela desperdica a
  // conexao. A URL tem que ser IDENTICA a do <img>, senao baixa duas vezes
  const heroPre = meta.heroPreload
    ? `\n<link rel="preload" as="image" href="${esc(meta.heroPreload)}" fetchpriority="high">`
    : '';
  const top = `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">${heroPre}`;
  // 🔴 o <title> fica sempre no inicio do miolo: e onde toda ferramenta espera
  // encontra-lo. O que embaralha sao os blocos de meta depois dele.
  const mid = [titleB].concat(
    _embaralha(site, [seo, ogOrder, twBlock, iconBlock, fonts], '#head#')).join('\n');
  if (!ctx._css) ctx._css = baseCss(ctx) + getArch(ctx.fp.arch).css(ctx);
  return `<!DOCTYPE html>
<html lang="${esc(site.lang || 'pt-BR')}">
<head>
${top}
${verificacaoTags(site)}
${mid}
<style>${ctx._css}</style>
${ld}
${adsenseTags(site)}
</head>`;
}

// ---------- schema ----------
function newsSchema(ctx, art, P) {
  const site = ctx.site; const v = ctx.fp.T.schemaVariant % 3;
  const o = {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: art.title, description: P.desc,
    datePublished: art.date, dateModified: art.modified || art.date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': P.url },
    publisher: { '@type': 'NewsMediaOrganization', name: site.name, url: `${site.baseUrl}/`, logo: { '@type': 'ImageObject', url: `${site.baseUrl}/icon-512.png` } },
  };
  // O tipo do autor nao pode sair do sorteio do variant: quem assina e uma
  // pessoa da equipe, e tipar pessoa como Organization desliga o E-E-A-T. A
  // variacao entre portais continua nos outros campos do variant.
  const _pessoa = (Array.isArray(site.equipe) ? site.equipe : []).find(e => e.nome === art.author);
  if (_pessoa) o.author = { '@type': 'Person', name: _pessoa.nome, url: site.baseUrl + '/autor/' + _pessoa.slug + '/' };
  else o.author = { '@type': 'Organization', name: art.author || site.name, url: site.baseUrl + '/' };
  if (v === 1) o.articleSection = P.catName;
  if (v === 2) { o.wordCount = stripTags(art.content).split(/\s+/).filter(Boolean).length; if (art.tags && art.tags.length) o.keywords = art.tags.join(', '); }
  if (P.imgUrl) o.image = [P.imgUrl];
  return _ordLd(site, o);
}
function breadcrumbSchema(site, art, P) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: (site.shortName || site.name), item: site.baseUrl + '/' },
      { '@type': 'ListItem', position: 2, name: P.catName, item: `${site.baseUrl}${catUrl(P.catSlug)}` },
      { '@type': 'ListItem', position: 3, name: art.title, item: P.url },
    ],
  };
}
function trilhaSchema(site, itens) {
  // itens: [[nome, url], ...] sem a home, que entra sempre em primeiro
  const lista = [{ '@type': 'ListItem', position: 1, name: (site.shortName || site.name), item: site.baseUrl + '/' }];
  itens.forEach((p, i) => lista.push({ '@type': 'ListItem', position: i + 2, name: p[0], item: p[1] }));
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: lista };
}
function _trilhaPagina(site, page, url) {
  const s = String(page.slug || '');
  // /equipe/ e extraPage e nem todo portal tem: sem a guarda o degrau do
  // meio apontaria para 404 dentro do proprio dado estruturado
  const temEquipe = (site.extraPages || []).some(p => p.slug === 'equipe');
  if (s.indexOf('autor/') === 0 && temEquipe) return [['Equipe', site.baseUrl + '/equipe/'], [page.title, url]];
  return [[page.title, url]];
}
function collectionSchema(site, title, canonical, items) {
  return {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: canonical,
    isPartOf: { '@type': 'WebSite', name: site.name, url: site.baseUrl + '/' },
    mainEntity: { '@type': 'ItemList', itemListElement: (items || []).slice(0, 30).map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: site.flatUrl ? `${site.baseUrl}/${a.slug}/` : `${site.baseUrl}/${a.category ? a.category.slug : 'noticias'}/${a.slug}/`, name: a.title })) },
  };
}

// ---------- helpers compartilhados passados aos arquetipos ----------
let _RAIZ = '/srv/portais'; // raiz dos portais, capturada do cfg no primeiro build
let _FLAT = false; // permalink plano (/slug/, igual WP) quando site.flatUrl=true
let _SMAP = '';    // link do mapa do site no rodape (por site em buildCtx; anti-footprint)
let _EXTRA = '';    // equipe e politica editorial, marcadas com inFooter no sites.json
let _CATBASE = ''; // base de categoria (ex: 'categoria') quando site.categoryBase setado; '' = raiz (igual antes)
function catUrl(slug) { return '/' + (_CATBASE ? _CATBASE + '/' : '') + esc(slug) + '/'; }
// ---------------------------------------------------------------- fonte preferida
// Botao que leva o visitante a marcar o portal como fonte preferida na Pesquisa
// Google. Especificacao em D:\PORTAIS\fontes-preferidas-portal-engine.md.
//
// A variante sai de hash do dominio: o mesmo portal renderiza sempre a mesma
// coisa e a rede fica heterogenea. Sem requisicao nova: SVG e CSS embutidos.
const _FP_TEXTOS = [
  'Nos torne uma fonte preferida no Google',
  'Prefira {ARTIGO} {NOME} no Google',
  'Adicione {ARTIGO} {NOME} como fonte preferida',
  'Quer ver mais publicações nossas? Marque como fonte preferida',
  'Siga {ARTIGO} {NOME} na Pesquisa Google',
  'Marque nosso portal como fonte preferida no Google',
];
const _FP_BASES = ['fp-btn', 'src-google', 'gpref', 'prefer'];
function _fpHash(d) {
  let h = 0;
  for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0;
  return h;
}
function _fpDados(site) {
  const dom = String(site.baseUrl || '').replace(/^https?:\/\//, '').replace(/^www\./, '')
    .replace(/\/$/, '') || String(site.domain || '');
  const h = _fpHash(dom);
  const t = site.theme || {};
  const nome = site.shortName || site.name || dom;
  // "o" ou "a" pelo genero que o proprio registro ja declara em nomeArtigo
  const artigo = String(site.nomeArtigo || 'do').trim() === 'da' ? 'a' : 'o';
  // ⚠️ nome que ja comeca com artigo ("A Capital") nao recebe outro
  const _jaTem = /^(a|o|as|os)\s/i.test(nome);
  const texto = _FP_TEXTOS[h % _FP_TEXTOS.length]
    .replace('{ARTIGO} ', _jaTem ? '' : artigo + ' ')
    .replace('{ARTIGO}', _jaTem ? '' : artigo).replace('{NOME}', nome);
  const sufixo = (((site.fp || {}).prefix) || 'p') + '-' + (h % 4096).toString(16);
  const cls = _FP_BASES[Math.floor(h / 7) % _FP_BASES.length] + '-' + sufixo;
  const estilo = Math.floor(h / 13) % 4;
  const icone = Math.floor(h / 17) % 3;
  return { dom, nome, texto, cls, estilo, icone, t,
           url: 'https://google.com/preferences/source?q=' + dom };
}
const _FP_G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">'
  + '<path fill="currentColor" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13'
  + 'c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></svg>';
const _FP_ESTRELA = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
  + '<path fill="currentColor" d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
function _fpBotao(site) {
  const d = _fpDados(site);
  const ic = d.icone === 0 ? _FP_G : (d.icone === 1 ? _FP_ESTRELA : '');
  return '<a class="' + d.cls + '" href="' + esc(d.url) + '" target="_blank" rel="noopener"'
    + ' data-' + _vocab(site).atrFp + '="1">' + ic + '<span>' + esc(d.texto) + '</span></a>';
}
// o bloco do fim da materia leva uma linha de contexto; o do rodape vai solto,
// junto dos demais links institucionais
function _fpArtigo(site) {
  const d = _fpDados(site);
  return '<aside class="' + d.cls + '-box">'
    + '<p>Gostou do que leu? Diga ao Google que quer ver mais publicações '
    + esc(String(site.nomeArtigo || 'do')) + ' ' + esc(d.nome) + '.</p>'
    + _fpBotao(site) + '</aside>';
}
// Escolhe o texto legivel para um fundo qualquer: branco no escuro,
// quase-preto no claro. Usado no hover da variante que pinta com a cor do tema.
function _fpSobre(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return '#fff';
  const n = parseInt(m[1], 16);
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
  const claro = (1.05) / (L + 0.05);
  const escuro = (L + 0.05) / (0.0722);
  return claro >= escuro ? '#fff' : '#111111';
}
// Escurece a cor ate o branco alcancar 4,5:1, preservando o matiz. Usado
// quando a cor viva nao passa nem com branco nem com quase-preto: ai quem cede
// e o fundo, e nao o texto.
function _fpFundoHover(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return hex;
  let n = parseInt(m[1], 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const contra = () => 1.05 / (0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) + 0.05);
  let voltas = 0;
  while (contra() < 4.6 && voltas < 40) {
    r = Math.round(r * 0.93); g = Math.round(g * 0.93); b = Math.round(b * 0.93);
    voltas++;
  }
  const h2 = (x) => ('0' + x.toString(16)).slice(-2);
  return '#' + h2(r) + h2(g) + h2(b);
}
// A melhor razao que a cor alcanca, entre branco e quase-preto.
function _fpContra(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return 21;
  const n = parseInt(m[1], 16);
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
  return Math.max(1.05 / (L + 0.05), (L + 0.05) / 0.05605);
}
function _fpEstilo(site) {
  const d = _fpDados(site);
  const t = d.t || {};
  const pri = t.primary || '#1a73e8';
  const sob = t.onPrimary || '#fff';
  const viva = t.vivid || pri;
  const c = '.' + d.cls;
  let base = c + '{display:inline-flex;align-items:center;gap:8px;font-weight:600;'
    + 'font-size:15px;line-height:1.25;text-decoration:none;'
    + 'transition:background .25s ease,color .25s ease,transform .25s ease,box-shadow .25s ease}'
    + c + ' svg{flex:none}'
    + c + '-box{margin:30px 0 0;padding:18px 20px;border-radius:12px;'
    + 'background:rgba(0,0,0,.035);border:1px solid rgba(0,0,0,.08)}'
    + c + '-box p{margin:0 0 13px;font-size:14.5px;line-height:1.55;text-align:left}';
  if (d.estilo === 0) {
    base += c + '{background:#1a73e8 !important;color:#fff !important;padding:12px 22px;border-radius:8px}'
      + c + ':hover{background:#188038 !important;color:#fff !important;transform:translateY(-2px);'
      + 'box-shadow:0 4px 12px rgba(0,0,0,.2)}';
  } else if (d.estilo === 1) {
    base += c + '{background:#fff !important;color:#1a73e8 !important;border:2px solid #1a73e8;padding:10px 20px;'
      + 'border-radius:8px}'
      + c + ':hover{background:#1a73e8 !important;color:#fff !important;transform:translateY(-2px);'
      + 'box-shadow:0 4px 12px rgba(0,0,0,.18)}';
  } else if (d.estilo === 2) {
    base += c + '{background:#202124 !important;color:#fff !important;padding:12px 24px;border-radius:24px}'
      + c + ':hover{background:#1a73e8 !important;color:#fff !important;transform:translateY(-2px);'
      + 'box-shadow:0 4px 14px rgba(0,0,0,.24)}';
  } else {
    // a cor primaria do proprio tema, com a viva no hover
    base += c + '{background:' + pri + ' !important;color:' + sob + ' !important;padding:12px 22px;border-radius:10px}'
      + c + ':hover{background:' + (_fpSobre(viva) === '#fff' && _fpContra(viva) < 4.5 ? _fpFundoHover(viva) : viva) + ' !important;color:' + (_fpSobre(viva) === '#fff' && _fpContra(viva) < 4.5 ? '#fff' : _fpSobre(viva)) + ' !important;transform:translateY(-2px);'
      + 'box-shadow:0 4px 12px rgba(0,0,0,.2)}';
  }
  // no rodape o botao herda o respiro dos links institucionais
  base += '.' + d.cls + '-fim{display:block;margin-top:12px}';
  return '<style>' + base + '</style>';
}
// o popup e progressivo: com ele bloqueado, o proprio href abre em nova aba
function _fpScript(site) {
  return '<script>(function(){document.addEventListener("click",function(e){'
    + 'var a=e.target&&e.target.closest?e.target.closest("[data-' + _vocab(site || {}).atrFp + ']"):null;if(!a)return;'
    + 'var w=480,h=640,l=(screen.width-w)/2,t=(screen.height-h)/2;'
    + 'var p=window.open(a.href,"gpref","width="+w+",height="+h+",top="+t+",left="+l);'
    + 'if(p){e.preventDefault();try{p.focus();}catch(x){}}},false);})();<\/script>';
}

let _SITE_ATUAL = null;
// ---------------------------------------------------------------- menu sanfonado
// 🔴 68 dos 101 portais usam arquitetura sem botao de menu, e no celular as
// editorias quebram em duas ou tres linhas antes de qualquer conteudo. Editar
// as 135 arquiteturas seria caro e fragil: o botao entra aqui, no funil unico,
// e so quando a arquitetura ainda nao tem um.
const _MH_ROTULOS = ['Editorias', 'Seções', 'Menu', 'Navegação'];
// ⚠️ o rotulo entra numa frase que ja diz "menu": com a variante "Menu"
// saia "Abrir o menu de menu". Cada variante traz a frase inteira
const _MH_ABRIR = ['Abrir o menu de editorias', 'Abrir o menu de seções',
                   'Abrir o menu', 'Abrir a navegação'];
const _MH_FECHAR = ['Fechar o menu de editorias', 'Fechar o menu de seções',
                    'Fechar o menu', 'Fechar a navegação'];
function _mhDados(site) {
  const dom = String(site.baseUrl || site.domain || '').replace(/^https?:\/\//, '')
    .replace(/^www\./, '').replace(/\/$/, '');
  let h = 0;
  for (let i = 0; i < dom.length; i++) h = (h * 31 + dom.charCodeAt(i)) >>> 0;
  const pre = ((site.fp || {}).prefix) || 'p';
  return { id: pre + 'mn' + (h % 4096).toString(16),
           rot: _MH_ROTULOS[h % _MH_ROTULOS.length],
           abrir: _MH_ABRIR[h % _MH_ABRIR.length],
           fechar: _MH_FECHAR[h % _MH_FECHAR.length],
           raio: (h % 3) === 0 ? '999px' : ((h % 3) === 1 ? '8px' : '2px') };
}
function _menuSanfona(site, html) {
  // a barra de editorias nem sempre esta dentro do <header>: a busca vai ate o <main>
  const iMain = html.indexOf('<main');
  const iCab = html.indexOf('</header>');
  const fimBusca = iMain > 0 ? iMain : iCab;
  if (fimBusca < 0) return html;
  const cab = html.slice(0, fimBusca);
  // arquitetura que ja resolveu o menu fica como esta, nos tres padroes:
  // botao com aria-expanded, truque de checkbox sem JS, ou injecao anterior
  if (/aria-expanded/.test(cab)) return html;
  if (/<input[^>]+type="checkbox"/i.test(cab) && /<label/i.test(cab)) return html;
  const _va = _vocab(site);
  if (new RegExp('data-' + _va.atrMh + '=').test(cab)) return html;
  // a nav das editorias: preferir a que se identifica, senao a primeira
  let m = /<nav\b[^>]*aria-label="Editorias"[^>]*>/i.exec(cab);
  if (!m) m = /<nav\b[^>]*>/i.exec(cab);
  if (!m) return html;
  const d = _mhDados(site);
  // 🔴 saber ONDE o botao vai antes de montar o CSS: com a nav em faixa propria
  // o botao entra no cabecalho, e ali a linha nao pode quebrar, senao ele cai
  // embaixo da marca. Com a nav ao lado, a linha PRECISA quebrar, para a nav
  // aberta descer inteira
  const dentro = iCab > 0 && m.index < iCab;
  const quebra = dentro ? 'wrap' : 'nowrap';
  const tagNav = m[0];
  const novaNav = tagNav.replace(/^<nav\b/i, '<nav id="' + d.id + '" data-' + _va.atrAb + '="0"');
  const botao = '<button type="button" class="' + d.id + '-b" data-' + _va.atrMh + '="' + d.id + '"'
    + ' aria-expanded="false" aria-controls="' + d.id + '"'
    + ' aria-label="' + esc(d.abrir) + '"><i></i></button>';
  const est = '<style>'
    + '.' + d.id + '-b{display:none;width:46px;height:46px;flex:none;padding:0;'
    + 'position:relative;background:none;border:2px solid currentColor;color:inherit;'
    + 'cursor:pointer;border-radius:' + d.raio + ';margin-left:auto}'
    + '.' + d.id + '-b i,.' + d.id + '-b i::before,.' + d.id + '-b i::after{position:absolute;'
    + 'left:11px;width:20px;height:2px;background:currentColor;content:"";border-radius:2px}'
    + '.' + d.id + '-b i{top:21px}'
    + '.' + d.id + '-b i::before{top:-6px;left:0}'
    + '.' + d.id + '-b i::after{top:6px;left:0}'
    + '@media(max-width:1100px){'
    // 🔴 a regra mira o PAI DO BOTAO, e nunca o pai da nav: no arranjo em que a
    // nav e filha direta do corpo, mirar nela poria display:flex no <body>
    + ':not(body):not(html):has(> .' + d.id + '-b){display:flex !important;'
    + 'flex-direction:row !important;align-items:center !important;'
    + 'flex-wrap:' + quebra + ' !important;gap:12px}'
    + '.' + d.id + '-b{display:block}'
    + '#' + d.id + '{display:none;flex-basis:100%;width:100%;'
    + 'flex-direction:column;align-items:flex-start;gap:0;margin-top:12px;'
    + 'border-top:1px solid currentColor;overflow:visible;max-height:none}'
    + '#' + d.id + '[data-' + _va.atrAb + '="1"]{display:flex}'
    + '#' + d.id + ' a{display:block;width:100%;padding:13px 0;'
    + 'border-bottom:1px solid rgba(128,128,128,.32);white-space:normal}'
    + '}</style>';
  const js = '<script>(function(){var b=document.querySelector(\'[data-' + _va.atrMh + '="' + d.id + '"]\');'
    + 'var n=document.getElementById("' + d.id + '");if(!b||!n)return;'
    + 'b.addEventListener("click",function(){var a=b.getAttribute("aria-expanded")==="true";'
    + 'b.setAttribute("aria-expanded",a?"false":"true");n.setAttribute("data-' + _va.atrAb + '",a?"0":"1");'
    + 'b.setAttribute("aria-label",a?' + JSON.stringify(d.abrir) + ':'
    + JSON.stringify(d.fechar) + ');});})();<\/script>';
  const html2 = html.slice(0, m.index) + novaNav
    + html.slice(m.index + tagNav.length, fimBusca) + est + js + html.slice(fimBusca);
  // onde entra o botao: com a nav dentro do cabecalho, logo antes dela; com a
  // nav em faixa propria, como ultimo filho da linha da marca, dentro do header
  if (dentro) {
    return html2.slice(0, m.index) + botao + html2.slice(m.index);
  }
  const fecha = html2.indexOf('</header>');
  if (fecha < 0) return html2.slice(0, m.index) + botao + html2.slice(m.index);
  const ultimoDiv = html2.lastIndexOf('</div>', fecha);
  const onde = ultimoDiv > 0 ? ultimoDiv : fecha;
  return html2.slice(0, onde) + botao + html2.slice(onde);
}

const H = {
  esc, stripTags, clip,
  year: () => new Date().getFullYear(),
  dateFull: () => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
  dateShort: (d) => new Date(d || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
  url: (a) => _FLAT ? `/${esc(a.slug)}/` : `/${esc(a.category ? a.category.slug : 'noticias')}/${esc(a.slug)}/`,
  cat: (a) => esc(a.category ? a.category.name : 'Notícias'),
  curl: (slug) => catUrl(slug),
  pic: (a, eager) => {
    if (!a.image) return '';
    const v = a.image.w ? `?${_vocab(_SITE_ATUAL || {}).qp}=${a.image.w}x${a.image.h}` : '';
    const ld = eager ? `fetchpriority="high" decoding="async"` : `loading="lazy" decoding="async"`;
    return `<img src="/img/${esc(a.image.file)}${v}" alt="${esc(a.image.alt || a.title)}" width="${a.image.w || 1200}" height="${a.image.h || 675}" ${ld}>`;
  },
  instLinks: () => `<a href="/quem-somos/">${esc(_vocab(_SITE_ATUAL||{}).quem)}</a>${_EXTRA}<a href="/contato/">${esc(_vocab(_SITE_ATUAL||{}).contato)}</a><a href="/politica-de-privacidade/">${esc(_vocab(_SITE_ATUAL||{}).priv)}</a><a href="/termos-de-uso/">${esc(_vocab(_SITE_ATUAL||{}).termos)}</a>${_SMAP}` + `<!--fp--><span class="${_fpDados(_SITE_ATUAL||{}).cls}-fim" data-${_vocab(_SITE_ATUAL||{}).atrRod}="1">` + _fpBotao(_SITE_ATUAL||{}) + '</span>' + _fpEstilo(_SITE_ATUAL||{}) + _fpScript(_SITE_ATUAL||{}) + '<!--/fp-->',
  bodyEnd: () => '</body></html>',
  h1: (ctx) => `<h1 class="sr-only">${esc(ctx.site.name)}: ${esc(ctx.site.description || 'Notícias')}</h1>`,
  head: (ctx, meta) => buildHead(ctx, meta),
  homeMeta: (site) => {
    // a ordem das chaves tambem saia identica: o JSON preserva a ordem de
    // insercao, entao ela e comparavel. Aqui cada portal tem a sua
    const _ord = (base, extra) => {
      let h = _hashSemente(site, '#ld#');
      const chaves = Object.keys(extra);
      for (let i = chaves.length - 1; i > 0; i--) {
        h = Math.imul(h ^ i, 16777619) >>> 0;
        const j = h % (i + 1);
        const x = chaves[i]; chaves[i] = chaves[j]; chaves[j] = x;
      }
      const o = Object.assign({}, base);
      for (const k of chaves) o[k] = extra[k];
      return o;
    };
    const org = _ord({ '@context': 'https://schema.org', '@type': 'Organization' },
      { name: site.name, url: site.baseUrl + '/', logo: `${site.baseUrl}/icon-512.png` });
    const web = _ord({ '@context': 'https://schema.org', '@type': 'WebSite' },
      { name: site.name, url: site.baseUrl + '/', inLanguage: site.lang || 'pt-BR' });
    const title = site.metaTitle || (site.description ? `${site.description} | ${site.name}` : site.name);
    return { title, desc: _descNaRegua(site, site.metaDescription || site.description || site.name), canonical: site.baseUrl + '/', ogType: 'website', image: site._ogHome || `${site.baseUrl}/icon-512.png`, jsonld: [web, org] };
  },
  artMeta: (ctx, art, P) => ({ title: _cortaTitle(art.metaTitle || art.title, ' - ' + (ctx.site.shortName || ctx.site.name), ctx.site.titleMax || 60), desc: P.desc, canonical: P.absUrl, ogType: 'article', image: P.imgUrl, heroPreload: P.imgUrl, jsonld: [P.news, P.crumbs, P.faq].filter(Boolean) }),
  listMeta: (ctx, opts) => ({ title: _cortaTitle(String(opts.title), ' - ' + (ctx.site.shortName || ctx.site.name), (ctx.site.titleMax || 60)), desc: _descNaRegua(ctx.site, opts.desc), canonical: opts.canonical, ogType: 'website', image: _capaDe(ctx.site, opts.items), jsonld: [collectionSchema(ctx.site, opts.title, opts.canonical, opts.items), trilhaSchema(ctx.site, [[String(opts.title), opts.canonical]])] }),
  crumbs: (ctx, art, P) => `<nav class="${ctx.c('crumbs')}" aria-label="Trilha de navegação"><a href="/">${esc(ctx.site.shortName || ctx.site.name)}</a> <span class="sep">›</span> <a href="${catUrl(P.catSlug)}">${esc(P.catName)}</a> <span class="sep">›</span> <span class="cur">${esc(art.title)}</span></nav>`,
  metaRow: (ctx, art, P) => `<div class="${ctx.c('meta')}"><span class="by">Por ${autorLink(ctx.site, art.author)}</span> <span class="sep">·</span> <time datetime="${esc(art.date)}">${esc(P.dstr)}</time> <span class="sep">·</span> <span class="rt">${P.readMin} min de leitura</span></div>`,
  progressBar: (ctx) => `<div class="${ctx.c('progress')}" id="${ctx.c('rdp')}"></div>`,
  share: (ctx, P) => {
    const enc = encodeURIComponent(P.url.startsWith('http') ? P.url : P.absUrl), encT = encodeURIComponent(P.title);
    return `<div class="${ctx.c('share')}">
<span class="lb">${esc(_vocab(ctx.site).shareLb)}</span>
<a class="bt" href="https://api.whatsapp.com/send/?text=${encT}%20${enc}" target="_blank" rel="noopener">WhatsApp</a>
<a class="bt" href="https://www.facebook.com/sharer/sharer.php?u=${enc}" target="_blank" rel="noopener">Facebook</a>
<a class="bt" href="https://twitter.com/intent/tweet?url=${enc}&text=${encT}" target="_blank" rel="noopener">X</a>
<button class="bt cp" data-${_vocab(ctx.site).atrUrl}="${esc(P.absUrl)}">${esc(_vocab(ctx.site).shareCp)}</button>
</div>`;
  },
  progressScript: (ctx) => `<script>(function(){var b=document.getElementById('${ctx.c('rdp')}');if(b){var m=0,y=0,tk=false;function calc(){m=document.documentElement.scrollHeight-window.innerHeight;}function upd(){b.style.transform='scaleX('+(m>0?Math.min(1,y/m):0)+')';tk=false;}addEventListener('scroll',function(){y=window.scrollY||window.pageYOffset||0;if(!tk){tk=true;requestAnimationFrame(upd);}},{passive:true});addEventListener('resize',function(){calc();upd();},{passive:true});calc();upd();}var c=document.querySelector('.${ctx.c('share')} .cp');if(c)c.addEventListener('click',function(){try{navigator.clipboard.writeText(c.getAttribute('data-${_vocab(ctx.site).atrUrl}'));}catch(e){}var t=c.textContent;c.textContent='${esc(_vocab(ctx.site).shareOk)}';setTimeout(function(){c.textContent=t;},1600);});})();</script>`,
};

// ---------- contexto de render por site ----------
function buildCtx(site) {
  _FLAT = !!site.flatUrl;
  _SITE_ATUAL = site;
  _CATBASE = site.categoryBase ? esc(site.categoryBase) : '';
  const _smm = sitemapMeta(site);
  _SMAP = `<a href="/${_smm.slug}/">${esc(_smm.anchor)}</a>`;
  _EXTRA = (site.extraPages || []).filter(x => x.inFooter)
    .map(x => `<a href="/${esc(x.slug)}/">${esc(x.title)}</a>`).join('');
  const fp = fpOf(site);
  const salt = site.slug || fp.prefix || 'p';
  const cache = Object.create(null);
  const tok = (k) => (cache[k] || (cache[k] = classToken(salt, k)));
  const c = (k) => tok(k);
  const s = (k) => '.' + tok(k);
  return { site, fp, c, s, H, _css: null };
}

// ---------- mapa do site (pagina HTML crawlavel; identidade varia por dominio) ----------
// slug/ancora/titulo derivam de hashSeed(slug) => cada portal expoe strings diferentes
// (mesma logica anti-footprint do mu-plugin WP da rede). Link INTERNO permanente, NAO backlink send-remove.
const SMAP_SLUGS = ['mapa-do-site', 'indice', 'todos-os-artigos', 'arquivo-de-noticias', 'conteudo', 'mapa-de-conteudo', 'indice-de-artigos', 'todo-o-conteudo', 'central-de-conteudo', 'navegacao', 'indice-geral', 'arquivo-completo', 'lista-de-materias', 'indice-de-materias', 'mapa-de-navegacao', 'todas-as-noticias', 'indice-do-site', 'sumario'];
const SMAP_ANCHORS = ['Mapa do Site', 'Todos os artigos', 'Índice de conteúdo', 'Mapa do portal', 'Ver todo o conteúdo', 'Arquivo de notícias', 'Índice de artigos', 'Navegue por todo o conteúdo', 'Central de conteúdo', 'Índice geral', 'Todas as matérias', 'Lista completa de artigos', 'Explore todo o conteúdo', 'Arquivo completo', 'Índice de matérias', 'Mapa de navegação', 'Todas as notícias', 'Sumário do site'];
const SMAP_TITLES = ['Mapa do Site', 'Índice de Conteúdo', 'Todo o Conteúdo do Portal', 'Arquivo Completo de Artigos', 'Central de Conteúdo', 'Índice de Publicações', 'Índice Geral do Site', 'Sumário de Matérias'];
function sitemapMeta(site) {
  const h = hashSeed(site.slug) >>> 0;
  return {
    slug: SMAP_SLUGS[h % SMAP_SLUGS.length],
    anchor: SMAP_ANCHORS[Math.floor(h / 7) % SMAP_ANCHORS.length],
    title: SMAP_TITLES[Math.floor(h / 13) % SMAP_TITLES.length],
  };
}
function _raw_sitemapPageHtml(site, arts, menu) {
  const ctx = buildCtx(site); const arch = getArch(ctx.fp.arch);
  const sm = sitemapMeta(site);
  const url = `${site.baseUrl}/${sm.slug}/`;
  const byCat = new Map();
  for (const a of arts) {
    const cs = a.category ? a.category.slug : 'noticias';
    if (!byCat.has(cs)) byCat.set(cs, { name: a.category ? a.category.name : 'Notícias', slug: cs, items: [] });
    byCat.get(cs).items.push(a);
  }
  const cats = [...byCat.values()].sort((x, y) => y.items.length - x.items.length);
  let body = `<p class="upd">Todo o conteúdo do ${esc(site.name)} organizado por editoria.</p>`;
  body += `<h2>Páginas</h2><ul><li><a href="/">${esc(site.name)}</a></li>`;
  for (const p of staticPages(site)) body += `<li><a href="/${esc(p.slug)}/">${esc(p.title)}</a></li>`;
  body += `</ul>`;
  for (const c of cats) {
    body += `<h2><a href="${ctx.H.curl(c.slug)}">${esc(c.name)}</a></h2><ul>`;
    for (const a of c.items) body += `<li><a href="${ctx.H.url(a)}">${esc(a.title)}</a></li>`;
    body += `</ul>`;
  }
  const meta = { title: `${sm.title} - ${site.name}`, desc: `Mapa do site ${_artigoDe(site)}: todo o conteúdo publicado, organizado por editoria, para você encontrar rápido o que procura e navegar sem depender da busca.`, canonical: url, ogType: 'website', image: (site._ogHome || `${site.baseUrl}/icon-512.png`), jsonld: [collectionSchema(site, sm.title, url, arts), trilhaSchema(site, [[sm.title, url]])] };
  return `${buildHead(ctx, meta)}
${arch.header(ctx, menu)}
<main><article class="page">
<h1>${esc(sm.title)}</h1>
${body}
</article></main>
${arch.footer(ctx, menu)}
${H.bodyEnd()}`;
}


// monta o objeto P (urls/desc/schema/datas) usado no single
function buildP(ctx, art) {
  const site = ctx.site;
  const catSlug = art.category ? art.category.slug : 'noticias';
  const catName = art.category ? art.category.name : 'Notícias';
  const absUrl = site.flatUrl ? `${site.baseUrl}/${art.slug}/` : `${site.baseUrl}/${catSlug}/${art.slug}/`;
  const url = site.flatUrl ? `/${art.slug}/` : `/${catSlug}/${art.slug}/`;
  const imgUrl = art.image ? `${site.baseUrl}/img/${art.image.file}${art.image.w ? `?${_vocab(site).qp}=${art.image.w}x${art.image.h}` : ''}` : null;
  const desc = metaDesc(art);
  const dstr = new Date(art.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const readMin = Math.max(1, Math.round(stripTags(art.content).split(/\s+/).filter(Boolean).length / 200));
  const P = { url, absUrl, imgUrl, desc, dstr, readMin, catSlug, catName, title: art.title };
  // canonical do schema usa URL absoluta
  const Pabs = Object.assign({}, P, { url: absUrl });
  P.news = newsSchema(ctx, art, Pabs);
  P.crumbs = breadcrumbSchema(site, art, Pabs);
  P.faq = faqSchema(art);
  return P;
}

// ---------- paginas (despacho pro arquetipo) ----------
function _raw_homePage(site, arts, menu) { const ctx = buildCtx(site); return getArch(ctx.fp.arch).home(ctx, arts, menu); }
// A linha fina nao pode repetir a abertura do texto: o acervo importado gravou
// `dek` copiando um paragrafo do corpo, e na pagina do artigo o leitor le a
// mesma frase duas vezes. O cartao continua usando o campo, entao a limpeza e
// so aqui, na hora de renderizar o artigo.
function _achata(t) {
  return String(t || '').replace(/<[^>]+>/g, ' ')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function _dekRepetido(art) {
  const dek = _achata(art && art.dek);
  if (dek.length < 40) return false;
  const alvo = dek.slice(0, 90);
  const paras = String((art && art.content) || '').match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
  const seis = paras.slice(0, 6);
  if (seis.some(p => _achata(p).indexOf(alvo) >= 0)) return true;
  // a linha fina as vezes e a colagem de dois paragrafos seguidos: ali a
  // frase nao cabe inteira em nenhum deles, e so aparece no texto emendado
  return _achata(seis.join(' ')).indexOf(alvo) >= 0;
}
function _semDekRepetido(art) {
  return _dekRepetido(art) ? Object.assign({}, art, { dek: '' }) : art;
}

function _raw_articleHtml(site, art, menu, related) {
  const ctx = buildCtx(site);
  // 🔴 COPIA: escrever no art.content original poria o bloco na descricao,
  //    no resumo e na busca, e ele acabaria gravado no JSON
  const _a = Object.assign({}, art, { content: (art.content || "") + _fpArtigo(site) });
  return getArch(ctx.fp.arch).article(ctx, _a, menu, related, buildP(ctx, art));
}
function _raw_listPage(site, opts) { const ctx = buildCtx(site); return getArch(ctx.fp.arch).list(ctx, opts); }

function _raw_notFoundPage(site, menu) {
  const ctx = buildCtx(site); const arch = getArch(ctx.fp.arch);
  const meta = { title: `Página não encontrada - ${site.name}`, desc: 'A página que você procura não existe ou foi removida.', canonical: site.baseUrl + '/', ogType: 'website', image: null, jsonld: [], robots: 'noindex, follow' };
  return `${buildHead(ctx, meta)}
${arch.header(ctx, menu)}
<script>(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;</script>
<main><div class="${ctx.c('wrap')}"><div class="notfound">
<div class="nf-code">404</div>
<h1>Página não encontrada</h1>
<p>A página que você procura pode ter sido movida ou não existe mais.</p>
<p><a class="nf-home" href="/">Ir para a home ${_artigoDe(site)}</a></p>
</div></div></main>
${arch.footer(ctx, menu)}
${H.bodyEnd()}`;
}

// ---------- paginas institucionais ----------
// primeira imagem real de uma lista, para servir de og:image; sem ela a pagina
// compartilhada em rede social sai sem miniatura nenhuma
function _capaDe(site, itens) {
  const a = (itens || []).find(x => x && x.image && x.image.file);
  return a ? `${site.baseUrl}/img/${a.image.file}` : `${site.baseUrl}/icon-512.png`;
}

function _raw_pageHtml(site, page, menu) {
  const ctx = buildCtx(site); const arch = getArch(ctx.fp.arch);
  const url = `${site.baseUrl}/${page.slug}/`;
  const _eq = (page.slug || '').startsWith('autor/')
    ? (site.equipe || []).find(e => 'autor/' + e.slug === page.slug) : null;
  const _av = _eq ? `${site.baseUrl}/img/autores/${_eq.slug}.webp` : null;
  const _ld = [];
  if (_eq) {
    const pessoa = {
      '@type': 'Person', '@id': url + '#pessoa', name: _eq.nome, url,
      description: page.desc || page.title,
      worksFor: { '@type': 'NewsMediaOrganization', name: site.name, url: site.baseUrl + '/' },
    };
    if (site._temAvatar && site._temAvatar[_eq.slug]) pessoa.image = _av;
    _ld.push({
      '@context': 'https://schema.org', '@type': 'ProfilePage', '@id': url + '#perfil',
      url, name: _eq.nome, inLanguage: site.lang || 'pt-BR',
      isPartOf: { '@type': 'WebSite', name: site.name, url: site.baseUrl + '/' },
      mainEntity: pessoa,
    });
  }
  const meta = { title: _cortaTitle(page.metaTitle || page.title, ' - ' + (site.shortName || site.name), site.titleMax || 60), desc: page.desc || page.title, canonical: url, ogType: 'website',
    image: (_eq && site._temAvatar && site._temAvatar[_eq.slug]) ? _av : (site._ogHome || `${site.baseUrl}/icon-512.png`), jsonld: _ld.concat([trilhaSchema(site, _trilhaPagina(site, page, url))]) };
  return `${buildHead(ctx, meta)}
${arch.header(ctx, menu)}
<main><article class="page">
${(_eq && site._temAvatar && site._temAvatar[_eq.slug]) ? `<img class="avatar-autor" src="${esc(_av)}" alt="Ilustração de ${esc(_eq.nome)}" width="160" height="160" loading="eager" decoding="async">` : ''}
<h1>${esc(page.title)}</h1>
<p class="upd">Última atualização: ${esc(page.updated)}</p>
${page.content}
</article></main>
${arch.footer(ctx, menu)}
${H.bodyEnd()}`;
}
// A meta description das paginas institucionais dentro da regua de 100 a 175.
// ⚠️ O complemento sai do `metaDescription` do PROPRIO site: molde igual em
// dezenas de portais e assinatura de rede.
function _descNaRegua(site, d) {
  const limpa = x => String(x || '').replace(/\s+/g, ' ').trim();
  let t = limpa(d);
  if (t.length >= 100 && t.length <= 175) return t;
  if (t.length > 175) {
    const corte = t.slice(0, 172);
    const p = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('; '));
    return p > 100 ? corte.slice(0, p + 1) : corte.replace(/\s+\S*$/, '');
  }
  const extra = limpa(site.metaDescription || site.description || '');
  if (!extra) return t;
  let junto = t ? (t.replace(/[.\s]+$/, '') + '. ' + extra) : extra;
  if (junto.length > 175) {
    const corte = junto.slice(0, 172);
    const p = corte.lastIndexOf('. ');
    junto = p > 100 ? corte.slice(0, p + 1) : corte.replace(/\s+\S*$/, '');
  }
  return junto;
}

function staticPages(site) {
  // as paginas do sites.json (equipe, politica editorial, autores) entram junto
  // com as fixas. Ficam por ultimo para nao empurrar as institucionais no menu.
  const extra = (site.extraPages || []).map(p => {
    const pg = Object.assign({
      updated: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    }, p);
    // HTML grande mora em arquivo, para nao inchar o sites.json que todo
    // portal do servidor le a cada renderizacao
    if (pg.contentFile) {
      const alvo = path.join(_RAIZ, site.slug, 'paginas', pg.contentFile);
      try {
        pg.content = fs.readFileSync(alvo, 'utf8');
      } catch (e) {
        console.warn('[paginas] nao consegui ler ' + alvo + ': ' + e.message);
        pg.content = pg.content || '';
      }
    }
    return pg;
  });
  // ⚠️ a regua vale para as extras tambem: equipe, politica editorial e as
  // paginas de autor nascem com `desc` curta, tirada do `lead`
  return _staticFixas(site).concat(extra)
    .map(x => Object.assign({}, x, { desc: _descNaRegua(site, x.desc) }));
}
function _staticFixas(site) {
  const n = esc(site.name);
  const d = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const _lista = [
    { slug: 'quem-somos', title: 'Quem Somos', updated: d,
      desc: site.aboutDesc || `Conheça o ${site.name}: portal de notícias e conteúdos atualizados, com curadoria e linguagem acessível.`,
      content: site.about || `<p>O <strong>${n}</strong> é um portal de notícias e conteúdos atualizados sobre os assuntos que mais interessam aos nossos leitores. Reunimos informação de leitura agradável e confiável para informar e inspirar.</p>
<h2>Nossa proposta</h2><p>Acreditamos que informação de qualidade aproxima pessoas de ideias e novidades relevantes. Por isso publicamos textos claros, bem apurados e pensados para o leitor brasileiro.</p>
<h2>O que você encontra aqui</h2><p>Notícias, reportagens e artigos com curadoria e linguagem acessível, atualizados ao longo do dia.</p>
<h2>Compromisso editorial</h2><p>Prezamos por precisão, respeito ao leitor e transparência. Nosso conteúdo é revisado e atualizado sempre que necessário. Quer falar com a gente? Acesse a nossa página de <a href="/contato/">contato</a>.</p>` },
    { slug: 'contato', title: 'Contato', updated: d,
      desc: `Fale com a redação ${_artigoDe(site)}: envie sugestão de pauta, correção, dúvida ou proposta comercial. Respondemos as mensagens em dias úteis.`,
      content: `<p>Quer falar com a redação do <strong>${n}</strong>? Envie sua mensagem pelo formulário abaixo: sugestões, dúvidas, correções ou parcerias. Respondemos assim que possível. Antes de escrever, vale conhecer <a href="/quem-somos/">quem faz o ${n}</a> e como a redação trabalha.</p>
<form id="contato-form" class="cform" novalidate>
<label>Nome<input name="nome" type="text" required maxlength="120" autocomplete="name"></label>
<label>E-mail<input name="email" type="email" required maxlength="160" autocomplete="email"></label>
<label>Assunto<input name="assunto" type="text" maxlength="160"></label>
<label>Mensagem<textarea name="mensagem" rows="6" required maxlength="4000"></textarea></label>
<button type="submit">Enviar mensagem</button>
<p class="cform-msg" hidden></p>
</form>
<script>(function(){var f=document.getElementById('contato-form');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var b=f.querySelector('button'),m=f.querySelector('.cform-msg'),t=b.textContent;b.disabled=true;b.textContent='Enviando...';fetch('/api/contato',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:f.nome.value,email:f.email.value,assunto:f.assunto.value,mensagem:f.mensagem.value})}).then(function(r){return r.json()}).then(function(j){m.hidden=false;if(j&&j.success){m.textContent='Mensagem enviada! Obrigado pelo contato.';m.className='cform-msg ok';f.reset();}else{m.textContent=(j&&j.message)||'Não foi possível enviar. Tente novamente.';m.className='cform-msg err';}}).catch(function(){m.hidden=false;m.textContent='Erro de conexão. Tente novamente.';m.className='cform-msg err';}).finally(function(){b.disabled=false;b.textContent=t;});});})();</script>` },
    { slug: 'politica-de-privacidade', title: 'Política de Privacidade', updated: d,
      desc: `Política de Privacidade ${_artigoDe(site)}: quais dados coletamos, para que usamos, com quem compartilhamos, quanto tempo guardamos e como exercer seus direitos na lei.`,
      content: `<p>O ${n} respeita a sua privacidade e está comprometido em proteger os dados pessoais dos visitantes, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).</p>
<h2>1. Dados que coletamos</h2><p>Ao navegar no ${n}, podemos coletar automaticamente informações como endereço IP, tipo de navegador, páginas visitadas, tempo de permanência e dados de cookies. Não solicitamos dados pessoais identificáveis para a simples leitura do conteúdo.</p>
<h2>2. Cookies e tecnologias semelhantes</h2><p>Utilizamos cookies para melhorar a experiência de navegação, lembrar preferências e gerar estatísticas de acesso. Você pode gerenciar ou desativar os cookies nas configurações do seu navegador.</p>
<h2>3. Ferramentas de análise</h2><p>Podemos utilizar serviços de análise de tráfego para entender como os visitantes interagem com o site. Esses serviços podem coletar dados de forma anonimizada.</p>
<h2>4. Compartilhamento de dados</h2><p>O ${n} não vende nem aluga seus dados pessoais. Informações podem ser compartilhadas apenas com prestadores de serviço essenciais à operação do site ou quando exigido por lei.</p>
<h2>5. Seus direitos (LGPD)</h2><p>Você tem o direito de confirmar a existência de tratamento, acessar, corrigir, anonimizar, portar ou solicitar a exclusão dos seus dados, além de revogar o consentimento a qualquer momento.</p>
<h2>6. Segurança</h2><p>Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, perda ou alteração.</p>
<h2>7. Retenção</h2><p>Os dados são mantidos apenas pelo tempo necessário às finalidades descritas ou conforme exigência legal.</p>
<h2>8. Alterações nesta política</h2><p>Esta Política de Privacidade pode ser atualizada periodicamente. A versão vigente estará sempre disponível nesta página.</p>
<h2>9. Contato</h2><p>Em caso de dúvidas sobre esta política ou sobre o tratamento dos seus dados, entre em contato pelos canais oficiais do ${n}.</p>
<p>Este documento faz parte das políticas do ${n}. Veja também os <a href="/termos-de-uso/">termos de uso do ${n}</a>.</p>` },
    { slug: 'termos-de-uso', title: 'Termos de Uso', updated: d,
      desc: `Termos de Uso ${_artigoDe(site)}: as condições para usar o site, o que você pode fazer com o conteúdo publicado, os limites de responsabilidade e como falar conosco.`,
      content: `<p>Ao acessar e utilizar o ${n}, você concorda com os termos descritos abaixo. Caso não concorde, recomendamos que não utilize o site.</p>
<h2>1. Uso do site</h2><p>O conteúdo do ${n} tem caráter informativo e jornalístico. O uso é permitido para fins pessoais e não comerciais, salvo autorização expressa.</p>
<h2>2. Propriedade intelectual</h2><p>Textos, imagens, marcas e demais materiais publicados são protegidos por direitos autorais. A reprodução total ou parcial sem autorização é proibida.</p>
<h2>3. Conteúdo de terceiros e links</h2><p>O site pode conter links para páginas externas. Não nos responsabilizamos pelo conteúdo, políticas ou práticas de sites de terceiros.</p>
<h2>4. Isenção de responsabilidade</h2><p>Empenhamo-nos para manter as informações corretas e atualizadas, mas não garantimos a ausência de erros. O ${n} não se responsabiliza por decisões tomadas com base no conteúdo publicado.</p>
<h2>5. Alterações</h2><p>Estes Termos podem ser modificados a qualquer momento, sendo a versão atualizada publicada nesta página.</p>
<h2>6. Legislação aplicável</h2><p>Estes Termos são regidos pela legislação brasileira, elegendo-se o foro competente para dirimir eventuais conflitos.</p>
<p>Este documento faz parte das políticas do ${n}. Veja também a <a href="/politica-de-privacidade/">política de privacidade do ${n}</a>.</p>` },
  ];
  return _lista.map(x => Object.assign({}, x, { desc: _descNaRegua(site, x.desc) }));
}
function generateStaticPages(cfg, site, menu) {
  if (cfg && cfg.sitesRoot) _RAIZ = cfg.sitesRoot;
  const pages = staticPages(site);
  // pagina de autor sem a lista do que a pessoa assina e pagina vazia
  const arts = readAllArticles(cfg, site);
  for (const pg of pages) {
    if (!pg.slug || !pg.slug.startsWith('autor/')) continue;
    const eq = (site.equipe || []).find(e => 'autor/' + e.slug === pg.slug);
    if (!eq) continue;
    const meus = arts.filter(a => a.author === eq.nome)
      .sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 30);
    if (!meus.length) continue;
    const itens = meus.map(a => '<li><a href="' + (site.flatUrl === false && a.category
      ? '/' + a.category.slug + '/' + a.slug + '/' : '/' + a.slug + '/') + '">' + esc(a.title) + '</a></li>').join('');
    pg.content = (pg.content || '') + '<h2>Últimas de ' + esc(eq.nome.split(' ')[0]) + '</h2><ul>' + itens + '</ul>';
  }
  for (const p of pages) {
    ensureDir(pub(cfg, site, p.slug));
    writeAtomic(pub(cfg, site, p.slug, 'index.html'), pageHtml(site, p, menu));
  }
  return pages.map(p => `${site.baseUrl}/${p.slug}/`);
}

// ---------- favicons tematicos ----------
function generateFavicons(cfg, site) {
  const svgPath = pub(cfg, site, 'favicon.svg');
  const t = theme(site);
  const cp = require('child_process');
  ensureDir(pub(cfg, site));
  const i512 = pub(cfg, site, 'icon-512.png');
  // Se o site tem um badge proprio (logo), usa o MESMO desenho no favicon (ex: mao branca em fundo teal)
  const iconSvg = site.iconSvg || site.logoSvg;
  if (iconSvg) {
    const tmp = pub(cfg, site, '_favsrc.svg');
    try {
      const svg512 = iconSvg.replace(/\swidth="[^"]*"/, ' width="512"').replace(/\sheight="[^"]*"/, ' height="512"');
      writeAtomic(tmp, svg512);
      cp.execFileSync('convert', ['-background', 'none', tmp, '-resize', '512x512', i512], { stdio: 'ignore', timeout: 20000 });
      cp.execFileSync('convert', [i512, '-resize', '192x192', pub(cfg, site, 'icon-192.png')], { stdio: 'ignore', timeout: 15000 });
      cp.execFileSync('convert', [i512, '-resize', '96x96', pub(cfg, site, 'favicon-96.png')], { stdio: 'ignore', timeout: 15000 });
      // o head declara 48 e 144; sem estas duas linhas os dois respondem 404,
      // e o de 48 e o tamanho que o Google le para o favicon do resultado
      cp.execFileSync('convert', [i512, '-resize', '48x48', pub(cfg, site, 'favicon-48.png')], { stdio: 'ignore', timeout: 15000 });
      cp.execFileSync('convert', [i512, '-resize', '144x144', pub(cfg, site, 'favicon-144.png')], { stdio: 'ignore', timeout: 15000 });
      cp.execFileSync('convert', ['-background', t.primary, tmp, '-resize', '180x180', '-flatten', pub(cfg, site, 'apple-touch-icon.png')], { stdio: 'ignore', timeout: 15000 });
      cp.execFileSync('convert', [i512, '-define', 'icon:auto-resize=48,32,16', pub(cfg, site, 'favicon.ico')], { stdio: 'ignore', timeout: 15000 });
      try { fs.unlinkSync(tmp); } catch (e) {}
      writeAtomic(svgPath, iconSvg);
      return;
    } catch (e) { try { fs.unlinkSync(tmp); } catch (_) {} }
  }
  if (fs.existsSync(svgPath)) return;
  const letter = ((String(site.name).trim().match(/[A-Za-z0-9À-ÿ]/) || ['N'])[0]).toUpperCase();
  const FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const glyph = ['-font', FONT, '-pointsize', '300', '-fill', t.onPrimary, '-gravity', 'center', '-annotate', '+0-8', letter];
  try {
    cp.execFileSync('convert', ['-size', '512x512', 'xc:none', '-fill', t.primary, '-draw', 'roundrectangle 0,0,511,511,112,112', ...glyph, i512], { stdio: 'ignore', timeout: 20000 });
    cp.execFileSync('convert', [i512, '-resize', '192x192', pub(cfg, site, 'icon-192.png')], { stdio: 'ignore', timeout: 15000 });
    cp.execFileSync('convert', [i512, '-resize', '96x96', pub(cfg, site, 'favicon-96.png')], { stdio: 'ignore', timeout: 15000 });
    // o head declara 48 e 144; sem estas duas linhas os dois respondem 404,
    // e o de 48 e o tamanho que o Google le para o favicon do resultado
    cp.execFileSync('convert', [i512, '-resize', '48x48', pub(cfg, site, 'favicon-48.png')], { stdio: 'ignore', timeout: 15000 });
    cp.execFileSync('convert', [i512, '-resize', '144x144', pub(cfg, site, 'favicon-144.png')], { stdio: 'ignore', timeout: 15000 });
    cp.execFileSync('convert', ['-size', '512x512', 'xc:' + t.primary, ...glyph, '-resize', '180x180', pub(cfg, site, 'apple-touch-icon.png')], { stdio: 'ignore', timeout: 15000 });
    cp.execFileSync('convert', [i512, '-define', 'icon:auto-resize=48,32,16', pub(cfg, site, 'favicon.ico')], { stdio: 'ignore', timeout: 15000 });
  } catch (e) { return; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${t.primary}"/><text x="32" y="34" font-family="system-ui,Arial,sans-serif" font-size="38" font-weight="800" fill="${t.onPrimary}" text-anchor="middle" dominant-baseline="central">${esc(letter)}</text></svg>`;
  writeAtomic(svgPath, svg);
}

// ---------- io ----------
function readAllArticles(cfg, site) {
  const dir = dataDir(cfg, site);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json'))
    .map(f => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { return null; } })
    .filter(Boolean).filter(a => (a.status || 'publish') === 'publish')
    .map(a => {
      // cartao sem resumo fica so com o titulo, e desalinha da fileira vizinha.
      // Campo vazio passa a receber o comeco do proprio texto.
      if (a.excerpt && String(a.excerpt).trim()) return a;
      const base = stripTags(String(a.metaDescription || a.content || '')).trim();
      return base ? Object.assign({}, a, { excerpt: clip(base, 180) }) : a;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
function buildMenu(articles, hide) {
  const h = new Set(hide || []);
  const seen = new Map();
  const quantos = new Map();
  for (const a of articles) {
    if (!a.category || h.has(a.category.slug)) continue;
    const k = a.category.slug;
    if (!seen.has(k)) seen.set(k, a.category);
    quantos.set(k, (quantos.get(k) || 0) + 1);
  }
  // ordenar pela data do artigo mais recente deixava a maior editoria
  // fora do menu: no curiosododia, Games tinha 298 dos 898 artigos e nao
  // aparecia em lugar nenhum, com a pagina respondendo 200.
  // o desempate le a posicao ORIGINAL, guardada antes do sort: usar
  // indexOf no proprio array durante o sort devolve valor que muda a
  // cada troca, o comparador fica inconsistente e a ordem sai embaralhada
  const ordem = [...seen.keys()];
  const pos = new Map(ordem.map((k, i) => [k, i]));
  ordem.sort((a, b) => (quantos.get(b) - quantos.get(a))
    || (pos.get(a) - pos.get(b)));
  return ordem.slice(0, 8).map(k => seen.get(k));
}

function pingIndexNow(site, urls) {
  if (!site.indexnowKey || !urls || !urls.length || typeof fetch !== 'function') return;
  try {
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: site.domain, key: site.indexnowKey, keyLocation: `${site.baseUrl}/${site.indexnowKey}.txt`, urlList: urls.slice(0, 10000) }),
    }).then(() => {}).catch(() => {});
  } catch (e) {}
}

// purga o cache do Cloudflare das URLs afetadas (so se o site tiver cf.zone+cf.token).
// Fire-and-forget: nunca lanca nem bloqueia a publicacao.
function cfPurge(site, urls) {
  try {
    if (!site.cf || !site.cf.zone || !site.cf.token || typeof fetch !== 'function') return;
    const files = (urls || []).filter(Boolean).slice(0, 30);
    if (!files.length) return;
    fetch(`https://api.cloudflare.com/client/v4/zones/${site.cf.zone}/purge_cache`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + site.cf.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ files }),
    }).then(r => { if (!r.ok) r.text().then(t => process.stdout.write(`[${site.slug}] cfPurge ${r.status}: ${String(t).slice(0, 120)}\n`)).catch(() => {}); }).catch(() => {});
  } catch (e) {}
}


// ---------- busca (site estatico: indice JSON + filtro no cliente) ----------
// Só existe para site com "search": true no sites.json. A página é noindex:
// resultado de busca interna não deve entrar no índice do Google, mas os links
// que ela expõe são rastreáveis (follow).
function searchIndex(arts) {
  return arts.map(a => [
    a.slug,
    a.title,
    a.category ? a.category.name : 'Notícias',
    (a.date || '').slice(0, 10),
  ]);
}

function searchPageHtml(site, menu) {
  const ctx = buildCtx(site); const arch = getArch(ctx.fp.arch);
  const url = `${site.baseUrl}/busca/`;
  const meta = {
    title: `Busca - ${site.name}`,
    desc: `Pesquise em todo o conteúdo ${_artigoDe(site)}: digite um termo e encontre matérias, guias e ferramentas publicados em qualquer editoria do site.`,
    canonical: url, ogType: 'website', image: (site._ogHome || `${site.baseUrl}/icon-512.png`), jsonld: [], robots: 'noindex, follow',
  };
  const flat = site.flatUrl ? 1 : 0;
  const js = `(function(){
var cx=document.getElementById('bx'),cr=document.getElementById('br'),ci=document.getElementById('bi'),dados=null,FLAT=${flat};
function norm(t){return (t||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');}
function url(r){return FLAT?'/'+r[0]+'/':'/'+norm(r[2]).replace(/[^a-z0-9]+/g,'-')+'/'+r[0]+'/';}
function pinta(lista,termo){
  if(!termo){cr.innerHTML='';return;}
  if(!lista.length){cr.innerHTML='<p class="bs-vazio">Nada encontrado para <b>'+termo.replace(/[<>&]/g,'')+'</b>.</p>';return;}
  cr.innerHTML='<p class="bs-cont">'+lista.length+(lista.length===1?' resultado':' resultados')+'</p><ul class="bs-lista">'+
    lista.slice(0,80).map(function(r){return '<li><a href="'+url(r)+'"><span class="bs-cat">'+r[2]+'</span>'+r[1]+'<span class="bs-data">'+r[3].split('-').reverse().join('/')+'</span></a></li>';}).join('')+'</ul>';
}
function busca(){
  var termo=ci.value.trim();
  if(!termo||!dados){pinta([],termo);return;}
  var termos=norm(termo).split(/\\s+/).filter(Boolean);
  pinta(dados.filter(function(r){var alvo=norm(r[1]+' '+r[2]);return termos.every(function(t){return alvo.indexOf(t)>=0;});}),termo);
}
function carrega(){
  if(dados)return Promise.resolve();
  return fetch('/busca.json').then(function(r){return r.json();}).then(function(j){dados=j;});
}
ci.addEventListener('input',function(){carrega().then(busca);});
cx.addEventListener('submit',function(e){e.preventDefault();carrega().then(busca);});
var q=new URLSearchParams(location.search).get('q');
if(q){ci.value=q;carrega().then(busca);}
ci.focus();
})();`;
  const body = `<h1>Busca</h1>
<p class="bs-ajuda">Procure por título ou editoria. A pesquisa cobre todo o acervo do site, inclusive o que não aparece na página inicial.</p>
<form id="bx" class="bs-form" role="search" action="/busca/" method="get">
<input id="bi" class="bs-input" type="search" name="q" placeholder="O que você procura?" aria-label="Buscar no site" autocomplete="off">
<button class="bs-btn" type="submit" aria-label="Buscar">Buscar</button>
</form>
<div id="br" class="bs-res" aria-live="polite"></div>
<style>
.bs-form{display:flex;gap:.5rem;margin:1rem 0 1.5rem}
.bs-input{flex:1;padding:.8rem 1rem;font:inherit;border:1px solid rgba(128,128,128,.45);border-radius:8px;background:transparent;color:inherit}
.bs-btn{padding:.8rem 1.2rem;font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:8px;background:currentColor}
.bs-btn{color:inherit}.bs-btn{background:rgba(128,128,128,.18)}
.bs-cont{opacity:.7;font-size:.9rem;margin:.5rem 0}
.bs-lista{list-style:none;padding:0;margin:0}
.bs-lista li{border-bottom:1px solid rgba(128,128,128,.2)}
.bs-lista a{display:block;padding:.85rem 0;text-decoration:none;color:inherit}
.bs-cat{display:block;font-size:.72rem;letter-spacing:.06em;opacity:.65}
.bs-data{display:block;font-size:.78rem;opacity:.55;margin-top:.2rem}
.bs-vazio{opacity:.75}
</style>
<script>${js}</script>`;
  return `${buildHead(ctx, meta)}
${arch.header(ctx, menu)}
<main><article class="page">
${body}
</article></main>
${arch.footer(ctx, menu)}
${H.bodyEnd()}`;
}

// ---------- bloco opcional por site na home ----------
// A home so lista artigo COM imagem (ver o filtro de homeArts acima). Pagina de
// referencia sem imagem, como a tabela dos 25 grupos do jogo do bicho e o
// resultado do dia, ficava invisivel na home mesmo sendo o conteudo mais
// procurado do portal. Este bloco entra depois do hero e antes da primeira
// secao de categoria.
//
// So age se /srv/portais/<slug>/bloco-home.html existir. Portal sem o arquivo
// nao muda em nada, e qualquer erro aqui devolve a home intacta: um bloco
// extra nunca pode derrubar a home.
function injetaBlocoHome(cfg, site, html) {
  try {
    const f = path.join(cfg.sitesRoot, site.slug, 'bloco-home.html');
    if (!fs.existsSync(f)) return html;
    const bloco = fs.readFileSync(f, 'utf8').trim();
    if (!bloco) return html;
    const m = html.indexOf('<main');
    if (m < 0) return html;
    const p1 = html.indexOf('<section', m);
    if (p1 < 0) return html;
    // ponto de insercao: inicio da 2a section (fim do hero). Sem 2a section,
    // cai para logo depois do fechamento da 1a.
    let pos = html.indexOf('<section', p1 + 8);
    if (pos < 0) {
      const fim = html.indexOf('</section>', p1);
      pos = fim < 0 ? -1 : fim + 10;
    }
    if (pos <= 0) return html;
    return html.slice(0, pos) + bloco + html.slice(pos);
  } catch (e) {
    return html;
  }
}

function rebuildIndexes(cfg, site) {
  const arts = readAllArticles(cfg, site);
  const hide = new Set(site.hideCategories || []); // categorias ocultas da home (secoes + menu + hero)
  let menu = buildMenu(arts, site.hideCategories);
  const _depMenu = new Set(site.homeDeprioritizeCats || []);
  if (_depMenu.size) menu = [...menu].sort((a, b) => (_depMenu.has(a.slug) ? 1 : 0) - (_depMenu.has(b.slug) ? 1 : 0));
  ensureDir(pub(cfg, site));
  // Home so com posts que tem imagem real (esconde placeholders/gradientes); cai pra lista cheia se sobrar pouco
  let homeArts = arts.filter(a => a.image && a.image.file && !a.placeholder && !(a.image.w === 1200 && a.image.h === 675));
  if (hide.size) homeArts = homeArts.filter(a => !(a.category && hide.has(a.category.slug))); // tira categorias ocultas da home
  // categorias despriorizadas (ex: catch-all "Saúde geral") descem pro fim da home, mantendo data desc dentro de cada grupo
  const deprio = new Set(site.homeDeprioritizeCats || []);
  if (deprio.size) homeArts = homeArts.slice().sort((a, b) => {
    const da = deprio.has(a.category && a.category.slug) ? 1 : 0;
    const db = deprio.has(b.category && b.category.slug) ? 1 : 0;
    if (da !== db) return da - db;
    return new Date(b.date) - new Date(a.date);
  });
  const homeFallback = hide.size ? arts.filter(a => !(a.category && hide.has(a.category.slug))) : arts;
  // og:image da home e das paginas institucionais: primeira materia com imagem.
  // sem isso a home compartilhada em rede social sai sem miniatura.
  const _capa = (homeArts.length ? homeArts : arts).find(a => a.image && a.image.file);
  site._ogHome = _capa ? `${site.baseUrl}/img/${_capa.image.file}` : `${site.baseUrl}/icon-512.png`;
  // avatares ilustrados das assinaturas, quando o arquivo existe no disco
  site._temAvatar = {};
  for (const e of (site.equipe || [])) {
    try { if (fs.existsSync(pub(cfg, site, 'img', 'autores', `${e.slug}.webp`))) site._temAvatar[e.slug] = true; } catch (err) {}
  }
  writeAtomic(pub(cfg, site, 'index.html'), injetaBlocoHome(cfg, site, homePage(site, homeArts.length >= 8 ? homeArts : homeFallback, menu)));
  for (const a of arts) {
    const acs = a.category ? a.category.slug : 'noticias';
    const related = _relacionados(arts.filter(x => x.category && x.category.slug === acs), a.slug);
    const ap = site.flatUrl ? [a.slug] : [acs, a.slug];
    ensureDir(pub(cfg, site, ...ap));
    writeAtomic(pub(cfg, site, ...ap, 'index.html'), articleHtml(site, a, menu, related));
  }
  const byCat = new Map();
  for (const a of arts) { const s = a.category ? a.category.slug : 'noticias'; if (!byCat.has(s)) byCat.set(s, []); byCat.get(s).push(a); }
  const cbSeg = site.categoryBase ? [site.categoryBase] : []; // base de categoria (ex: 'categoria') p/ preservar URL
  const cbPfx = site.categoryBase ? `${site.categoryBase}/` : '';
  for (const [cslug, items] of byCat) {
    ensureDir(pub(cfg, site, ...cbSeg, cslug));
    const cname = items[0].category ? items[0].category.name : 'Notícias';
    writeAtomic(pub(cfg, site, ...cbSeg, cslug, 'index.html'),
      listPage(site, { title: cname, desc: _descNaRegua(site, (site.catDesc || {})[cslug] || `Últimas de ${cname} no ${site.name}.`), canonical: `${site.baseUrl}/${cbPfx}${cslug}/`, items, menu }));
  }
  const pageUrls = generateStaticPages(cfg, site, menu);
  const _sm = sitemapMeta(site);
  ensureDir(pub(cfg, site, _sm.slug));
  writeAtomic(pub(cfg, site, _sm.slug, 'index.html'), sitemapPageHtml(site, arts, menu));
  // busca no cliente: índice compacto + página, só para quem tem "search": true
  if (site.search) {
    writeAtomic(pub(cfg, site, 'busca.json'), JSON.stringify(searchIndex(arts)));
    ensureDir(pub(cfg, site, 'busca'));
    writeAtomic(pub(cfg, site, 'busca', 'index.html'), searchPageHtml(site, menu));
  }
  const dnow = new Date().toISOString();
  const entries = [{ loc: site.baseUrl + '/', lastmod: arts[0] ? (arts[0].modified || arts[0].date) : dnow }];
  for (const [cslug, items] of byCat) entries.push({ loc: `${site.baseUrl}/${cbPfx}${cslug}/`, lastmod: items[0] ? (items[0].modified || items[0].date) : dnow });
  for (const u of pageUrls) entries.push({ loc: u, lastmod: dnow });
  entries.push({ loc: `${site.baseUrl}/${_sm.slug}/`, lastmod: dnow });
  for (const a of arts) {
    const acs = a.category ? a.category.slug : 'noticias';
    const e = { loc: site.flatUrl ? `${site.baseUrl}/${a.slug}/` : `${site.baseUrl}/${acs}/${a.slug}/`, lastmod: a.modified || a.date };
    if (a.image) e.image = { loc: `${site.baseUrl}/img/${a.image.file}`, title: a.image.title || a.title, caption: a.image.caption || a.image.alt || a.title };
    entries.push(e);
  }
  const smXml = entries.map(e => {
    const img = e.image ? `<image:image><image:loc>${esc(e.image.loc)}</image:loc><image:title>${esc(e.image.title)}</image:title>${e.image.caption ? `<image:caption>${esc(e.image.caption)}</image:caption>` : ''}</image:image>` : '';
    return `<url><loc>${esc(e.loc)}</loc><lastmod>${esc(e.lastmod)}</lastmod>${img}</url>`;
  }).join('\n');
  writeAtomic(pub(cfg, site, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${smXml}\n</urlset>\n`);
  // sitemap de noticias: so materia dos ultimos 2 dias, que e o que o Google
  // aceita nesse formato. Fica vazio se o portal passar dois dias sem publicar,
  // o que e valido e melhor do que listar materia velha.
  {
    const _corte = Date.now() - 2 * 864e5;
    const _rec = arts.filter(a => a && a.date && Date.parse(a.date) >= _corte).slice(0, 1000);
    const _nsXml = _rec.map(a => {
      const _cs = a.category ? a.category.slug : 'noticias';
      const _u = site.flatUrl ? `${site.baseUrl}/${a.slug}/` : `${site.baseUrl}/${_cs}/${a.slug}/`;
      return `<url><loc>${esc(_u)}</loc><news:news><news:publication>`
        + `<news:name>${esc(site.name)}</news:name>`
        + `<news:language>${esc((site.lang || 'pt-BR').slice(0, 2))}</news:language>`
        + `</news:publication>`
        + `<news:publication_date>${esc(new Date(a.date).toISOString())}</news:publication_date>`
        + `<news:title>${esc(a.title)}</news:title></news:news></url>`;
    }).join('\n');
    writeAtomic(pub(cfg, site, 'news-sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${_nsXml}\n</urlset>\n`);
  }
  writeAtomic(pub(cfg, site, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\nSitemap: ${site.baseUrl}/news-sitemap.xml\n`);
  if (pubIdRaw(site)) writeAtomic(pub(cfg, site, 'ads.txt'), 'google.com, ' + pubIdRaw(site) + ', DIRECT, f08c47fec0942fa0\n');
  if (site.indexnowKey) writeAtomic(pub(cfg, site, `${site.indexnowKey}.txt`), site.indexnowKey);
  const tm = theme(site);
  writeAtomic(pub(cfg, site, 'site.webmanifest'), JSON.stringify({
    name: site.name, short_name: site.name.slice(0, 18), description: site.description || site.name,
    start_url: '/', display: 'standalone', background_color: tm.paper, theme_color: tm.primary,
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
  }, null, 2));
  writeAtomic(pub(cfg, site, '404.html'), notFoundPage(site, menu));
  generateFavicons(cfg, site);
  // purga CF dos indices (home + categorias + sitemap) DEPOIS de escrever os arquivos novos
  cfPurge(site, [site.baseUrl + '/', ...[...byCat.keys()].map(cs => `${site.baseUrl}/${cbPfx}${cs}/`), `${site.baseUrl}/sitemap.xml`]);
  return { count: arts.length };
}

// rebuild dos indices com DEBOUNCE (coalesce de rajadas) + teto de espera, para o
// publish responder rapido e nao bloquear a resposta HTTP no rebuild de sites grandes
// (ex.: diariodegoiania ~3.2k artigos = ~30s de rebuild sincrono -> estourava o
// proxy_read_timeout do Nginx -> 504 e o Antonio marcava falha). A pagina do artigo
// novo ja e escrita de forma sincrona no publish; aqui so os INDICES (home/categoria/
// sitemap/etc.) reconstroem em background.
const _rbState = new Map(); // slug -> { timer, firstAt }
function scheduleRebuild(cfg, site) {
  const key = site.slug || site.domain;
  const st = _rbState.get(key) || { timer: null, firstAt: 0 };
  if (st.timer) clearTimeout(st.timer);
  const nowMs = Date.now();
  if (!st.firstAt) st.firstAt = nowMs;
  // carga continua (esperando ha >6s) -> reconstroi ja; senao espera 1.2s de silencio
  const delay = (nowMs - st.firstAt) > 6000 ? 0 : 1200;
  st.timer = setTimeout(() => {
    _rbState.delete(key);
    try { rebuildIndexes(cfg, site); } catch (e) { try { console.error('[rebuild]', site.slug, e.message); } catch (_) {} }
  }, delay);
  if (st.timer && typeof st.timer.unref === 'function') st.timer.unref();
  _rbState.set(key, st);
}

// ---------- publicacao ----------
// ---- auto-linkagem interna (opt-in por site via site.autoLink) ----
// Insere links internos na primeira ocorrencia natural de termos mapeados.
// Regras: max N links, 1 por destino, nunca dentro de <a> ou headings,
// nunca para a propria pagina, pula destinos ja linkados no conteudo.
// Destino de link interno tem que existir no disco antes de virar link.
// Sem isso, URL errada no mapa do autoLink vira link 404 gravado dentro do
// conteudo, e nenhuma auditoria de pagina pega: a origem responde 200.
function _destinoVivo(site, url) {
  try {
    const u = String(url || '').split('#')[0].split('?')[0].replace(/^\/+|\/+$/g, '');
    if (!u) return true;                       // a home sempre existe
    return fs.existsSync(path.join('/srv/portais', site.slug, 'public', u, 'index.html'));
  } catch (e) { return false; }
}

function autoLinkContent(site, slug, content) {
  const conf = site.autoLink;
  if (!conf || !conf.enabled || !Array.isArray(conf.map) || !content) return content;
  const max = conf.maxLinks || 4;
  let added = 0;
  const parts = String(content).split(/(<[^>]+>)/);
  const linked = new Set();
  (String(content).match(/href="([^"]+)"/g) || []).forEach(h => linked.add(h.slice(6, -1)));
  for (const entry of conf.map) {
    if (added >= max) break;
    const url = entry.url;
    if (!url || linked.has(url) || url === '/' + slug + '/') continue;
    if (!_destinoVivo(site, url)) continue;    // URL errada no mapa: nao vira link
    let done = false;
    for (const term of (entry.terms || [])) {
      if (done) break;
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('(^|[\\s(>\\u00A0])(' + esc + ')(?=[\\s),;:.!?<]|$)', 'i');
      let inA = 0, inH = 0;
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        if (seg.startsWith('<')) {
          const t = seg.toLowerCase();
          if (t.startsWith('<a')) inA++;
          else if (t.startsWith('</a')) inA = Math.max(0, inA - 1);
          else if (/^<h[1-6]/.test(t)) inH++;
          else if (/^<\/h[1-6]/.test(t)) inH = Math.max(0, inH - 1);
            // script/style/code/pre: texto literal. Link dentro de um bloco
            // de JSON-LD quebra o JSON com as aspas do href.
            else if (/^<(script|style|code|pre)\b/.test(t)) inH++;
            else if (/^<\/(script|style|code|pre)\b/.test(t)) inH = Math.max(0, inH - 1);
          continue;
        }
        if (inA || inH || !seg.trim()) continue;
        const m = seg.match(re);
        if (m) {
          parts[i] = seg.replace(re, function (all, pre, word) {
            return pre + '<a href="' + url + '">' + word + '</a>';
          });
          linked.add(url); added++; done = true;
          break;
        }
      }
    }
  }
  // fallback: nenhum termo casou -> anexa "Leia também" com 2 links rotacionados
  // por hash do slug (destinos e ancoras variam entre artigos)
  if (added === 0 && conf.fallback && Array.isArray(conf.fallback.pool) && conf.fallback.pool.length) {
    let h = 0;
    for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const pool = conf.fallback.pool.filter(e => e.url && e.url !== '/' + slug + '/'
      && !linked.has(e.url) && _destinoVivo(site, e.url));
    if (pool.length) {
      const pick = (e, n) => '<a href="' + e.url + '">' + e.anchors[n % e.anchors.length] + '</a>';
      const a = pool[h % pool.length];
      const b = pool.length > 1 ? pool[(h + 3) % pool.length] : null;
      let extra = '<p>' + esc(_vocab(site).leiaTb) + ': ' + pick(a, h);
      if (b && b.url !== a.url) extra += ' e ' + pick(b, (h >>> 3));
      extra += '.</p>';
      return parts.join('') + '\n' + extra;
    }
  }
  return parts.join('');
}

/* A plataforma do Antonio nao manda `author`, e ate aqui todo conteudo novo
   nascia assinado com o nome do site: sem rel=author, fora da pagina do editor
   e sem o E-E-A-T que o pacote editorial existe para sustentar. O `equipe` do
   sites.json ja diz qual editor responde por qual editoria, no campo `cats`,
   entao a assinatura sai dali. Portal sem equipe continua como estava. */
function _assina(site, autorDoPayload, category) {
  if (autorDoPayload && isNaN(Number(autorDoPayload))) return String(autorDoPayload);
  const eq = Array.isArray(site.equipe) ? site.equipe : [];
  if (!eq.length) return site.name;
  const cs = (category && category.slug) || '';
  const dono = eq.find(e => Array.isArray(e.cats) && e.cats.indexOf(cs) >= 0);
  return (dono && dono.nome) || eq[0].nome || site.name;
}

function publishArticle(cfg, site, payload) {
  if (!payload || !payload.title || !payload.content) { const e = new Error('title e content obrigatorios'); e.code = 400; throw e; }
  const cats = Array.isArray(payload.categories) ? payload.categories : (payload.categories ? [payload.categories] : []);
  // normaliza categoria recebida: aceita id numerico, nome string, ou mapeamento p/ {name,slug} via site.categoryMap
  const normCat = (v) => {
    const s = String(v).trim();
    let m = (site.categoryMap && Object.prototype.hasOwnProperty.call(site.categoryMap, s)) ? site.categoryMap[s]
          : (!isNaN(Number(s)) ? (site.defaultCategory || 'Notícias') : s);
    if (m && typeof m === 'object') return { name: String(m.name), slug: String(m.slug || slugify(m.name)) };
    return { name: String(m), slug: slugify(String(m)) };
  };
  // preserva o slug enviado (import WP com permalink %postname%); senao deriva do titulo
  const slug = (payload.slug && /^[a-z0-9][a-z0-9-]*$/.test(String(payload.slug))) ? String(payload.slug) : slugify(payload.title);
  let category = cats.length ? normCat(cats[0]) : normCat(site.defaultCategory || 'Notícias');
  let catLock = false;
  // GUARDA DE EXCLUSIVIDADE: 1o portal a receber este slug vira dono; os demais recusam
  // (responde sucesso "pulado" -> Antonio marca como entregue, sem retry). Mantem o
  // owner livre pra re-publicar/atualizar. Bypass opcional via payload.dedupBypass.
  if (!payload.dedupBypass) {
    const _own = ownerOf(cfg, slug);
    if (_own && _own !== site.slug) {
      return { slug, url: site.flatUrl ? `${site.baseUrl}/${slug}/` : `${site.baseUrl}/${category.slug}/${slug}/`, status: 'skipped', duplicate: true, owner: _own };
    }
    if (!_own) claimOwner(cfg, slug, site.slug);
  }
  const _ex = extractDek(sanitizeHtml(decodeEntities(String(payload.content))));
  let content = _ex.content;
  try { content = autoLinkContent(site, slug, content); } catch (e) {}
  const _sub = payload.subtitle ? decodeEntities(String(payload.subtitle)).trim() : '';
  const dek = _sub || (payload.excerpt ? decodeEntities(String(payload.excerpt)) : _ex.dek);
  const _metaDesc = payload.meta_description ? decodeEntities(String(payload.meta_description)).trim() : '';
  let prev = null;
  try { const _pp = path.join(dataDir(cfg, site), `${slug}.json`); if (fs.existsSync(_pp)) prev = JSON.parse(fs.readFileSync(_pp, 'utf8')); } catch (e) {}
  if (prev && prev.catLock && prev.category) { category = prev.category; catLock = true; }
  if (prev && prev.content === content && prev.title === String(payload.title) && prev.dek === dek
      && (prev.metaDescription || '') === _metaDesc
      && prev.category && prev.category.slug === category.slug
      && (!payload.image_base64 || (prev.image && prev.image.file))) {
    return { slug, url: site.flatUrl ? `${site.baseUrl}/${slug}/` : `${site.baseUrl}/${category.slug}/${slug}/`, status: prev.status || 'publish', unchanged: true };
  }

  let image = null;
  if (payload.image_base64) {
    const buf = Buffer.from(String(payload.image_base64).replace(/^data:image\/\w+;base64,/i, ''), 'base64');
    if (buf.length > 0 && buf.length <= 5 * 1024 * 1024) {
      const file = `${slug}.webp`;                       // SEMPRE WebP (padrao da rede + Core Web Vitals)
      ensureDir(pub(cfg, site, 'img'));
      const imgPath = pub(cfg, site, 'img', file);
      const tmpPath = pub(cfg, site, 'img', `_src_${slug}`); // fonte temporaria (qualquer formato que o Antonio enviar)
      writeAtomic(tmpPath, buf);
      let iw = 0, ih = 0;
      try {
        const cp = require('child_process');
        // converte p/ WebP (resize max 1000px, qualidade 82). Output .webp => ImageMagick encoda WebP.
        cp.execFileSync('convert', [tmpPath, '-resize', '1000x>', '-strip', '-quality', '82', imgPath], { stdio: 'ignore', timeout: 25000 });
        const dim = cp.execFileSync('identify', ['-format', '%w %h', imgPath], { timeout: 10000 }).toString().trim().split(/\s+/);
        iw = parseInt(dim[0], 10) || 0; ih = parseInt(dim[1], 10) || 0;
      } catch (e) {}
      try { fs.unlinkSync(tmpPath); } catch (e) {}
      if (iw > 0) image = { file, w: iw, h: ih, alt: payload.image_alt || payload.title, caption: payload.image_caption || '', title: payload.image_title || payload.title };
    }
  }
  const now = new Date();
  const article = {
    slug, title: String(payload.title), metaTitle: payload.metaTitle ? String(payload.metaTitle) : null, content, dek,
    excerpt: dek,
    metaDescription: _metaDesc || null,
    category, catLock, categories: catLock ? [category] : (cats.length ? cats.map(normCat) : [category]),
    tags: Array.isArray(payload.tags) ? payload.tags.map(String) : [], image,
    status: ['publish', 'draft'].includes(payload.status) ? payload.status : 'publish',
    author: _assina(site, payload.author, category),
    date: payload.scheduled_date ? new Date(payload.scheduled_date).toISOString() : now.toISOString(),
    modified: now.toISOString(),
  };
  ensureDir(dataDir(cfg, site));
  writeAtomic(path.join(dataDir(cfg, site), `${slug}.json`), JSON.stringify(article, null, 2));

  if (article.status === 'publish') {
    const all = readAllArticles(cfg, site);
    const menu = buildMenu(all, site.hideCategories);
    const related = _relacionados(all.filter(a => a.category && a.category.slug === category.slug), slug);
    const ap = site.flatUrl ? [slug] : [category.slug, slug];
    ensureDir(pub(cfg, site, ...ap));
    writeAtomic(pub(cfg, site, ...ap, 'index.html'), articleHtml(site, article, menu, related));
    scheduleRebuild(cfg, site); // reconstroi indices em background -> resposta HTTP rapida (evita 504 em sites grandes)
    const _catU = `${site.baseUrl}/${site.categoryBase ? site.categoryBase + '/' : ''}${category.slug}/`;
    const _artU = site.flatUrl ? `${site.baseUrl}/${slug}/` : `${site.baseUrl}/${category.slug}/${slug}/`;
    if (!payload.import) { // no import em massa: nao pinga IndexNow nem purga por-artigo (evita N chamadas)
      pingIndexNow(site, [_artU, `${site.baseUrl}/`, _catU]);
      cfPurge(site, [_artU]); // home+categoria sao purgados no fim do rebuild (apos reescrever)
    }
  }
  return { slug, url: site.flatUrl ? `${site.baseUrl}/${slug}/` : `${site.baseUrl}/${category.slug}/${slug}/`, status: article.status };
}


// ---------- impressao digital: nomes de classe proprios de cada portal ----------
// As classes literais do motor saiam identicas em todos os portais deste
// servidor, o que permite identificar a rede comparando o vocabulario de
// classes. Aqui elas passam a derivar do slug do site, no markup e no CSS.
const _CLS_LIT = ['cct-veja', 'malha', 'tabwrap', 'schema-section', 'pe-leia-meio', 'nm', 'go', 'de', 'veja', 'not-veja', 'internos-qmix', 'qmix-veja', 'expansao-qmix', 'expansao2-qmix', 'leia-tambem-qmix', 'page', 'upd', 'sep', 'by', 'rt', 'bt', 'sr-only', 'notfound', 'nf-home', 'nf-code', 'nf-txt', 'lb', 'cur', 'cform', 'cform-msg', 'im', 'ov', 'cx', 'ln', 'more', 'kick', 'kicker', 'b', 'h', 'd', 'k', 'n', 't', 'ok', 'ct', 'bx', 'tx', 'lv', 'cp', 'tb', 'g', 'l', 'i', 'eq-grid', 'eq-card', 'eq-area', 'eq-res', 'eq-ed', 'autor-posts', 'avatar-autor', 'err', 'nota', 'pf-topo', 'pf-ed', 'pf-lead', 'pf-eds', 'pf-obs', 'rd-lista', 'rd-ficha', 'rd-ed', 'rd-txt', 'autor-hero', 'autor-area', 'autor-lead', 'autor-cats', 'autor-nota', 'pular-conteudo', 'ds', 'dt', 'e', 'fb', 'ck', 'ed', 'live', 'vln'];
// ---------- vocabulario por portal (anti-footprint) ----------
// Texto de interface, id, nome de atributo e convencao de URL saiam IGUAIS em
// todos os portais da maquina, e e isso que uma ferramenta de deteccao compara.
// Cada portal passa a receber uma variante estavel, escolhida pelo mesmo hash de
// slug que ja gera os nomes de classe.
// ⚠️ Nao usar cadeia aleatoria: "?k7=" denuncia geracao automatica. O objetivo e
// parecer sites diferentes, nao sites estranhos.
const _VOC_OPC = {
  pularTx: ['Pular para o conteúdo', 'Ir para o conteúdo', 'Pular para a matéria',
            'Ir direto ao conteúdo', 'Pular a navegação', 'Ir para o texto',
            'Ir ao conteúdo principal', 'Pular menu e ir ao texto', 'Começar a leitura',
            'Ir para a reportagem', 'Saltar para o conteúdo', 'Ir para o corpo da página',
            'Pular para a leitura', 'Acessar o conteúdo'],
  pularId: ['conteudo', 'principal', 'materia', 'corpo', 'texto', 'leitura', 'inicio-conteudo',
            'area-principal', 'miolo', 'reportagem', 'pagina', 'centro', 'conteudo-principal',
            'bloco-principal'],
  quem:    ['Quem Somos', 'Sobre nós', 'Sobre o portal', 'Quem faz', 'A redação', 'Sobre',
            'Nossa história', 'Conheça a redação', 'Sobre o site', 'Quem escreve',
            'A equipe', 'Nossa proposta', 'O portal', 'Apresentação'],
  contato: ['Contato', 'Fale conosco', 'Fale com a gente', 'Contato da redação',
            'Escreva para nós', 'Envie uma mensagem', 'Canal de contato', 'Contato e sugestões',
            'Entre em contato', 'Nosso contato', 'Comunique-se', 'Mande um recado'],
  priv:    ['Política de Privacidade', 'Privacidade', 'Aviso de Privacidade',
            'Política de privacidade e dados', 'Privacidade e dados', 'Como tratamos seus dados',
            'Proteção de dados', 'Política de dados', 'Privacidade e cookies',
            'Uso dos seus dados', 'Dados e privacidade', 'Nossa política de privacidade'],
  termos:  ['Termos de Uso', 'Termos', 'Condições de uso', 'Termos e condições',
            'Regras de uso', 'Termos do site', 'Condições gerais', 'Termos de utilização',
            'Regras e condições', 'Termos de serviço', 'Uso do site', 'Condições'],
  ckNec:   ['Apenas necessários', 'Só os necessários', 'Somente essenciais',
            'Apenas essenciais', 'Recusar opcionais', 'Só o essencial', 'Manter só o básico',
            'Recusar os opcionais', 'Apenas o indispensável', 'Somente o necessário',
            'Rejeitar opcionais', 'Só os essenciais'],
  ckSim:   ['Aceitar todos', 'Aceitar', 'Aceitar tudo', 'Concordar', 'Permitir todos',
            'Aceito', 'Permitir tudo', 'Concordo', 'Aceitar cookies', 'Pode aceitar',
            'Autorizar todos', 'Tudo bem'],
  ckAria:  ['Aviso de cookies', 'Consentimento de cookies', 'Preferências de cookies',
            'Aviso de privacidade', 'Consentimento de dados', 'Escolha de cookies',
            'Aviso sobre cookies', 'Configuração de cookies', 'Permissão de cookies',
            'Aviso de dados', 'Opções de privacidade', 'Consentimento'],
  buscaPh: ['O que você procura?', 'Digite o que procura', 'Buscar por título ou editoria',
            'Pesquise no site', 'O que quer ler?', 'Busque um assunto', 'Procurar no acervo',
            'Digite um assunto', 'Buscar uma matéria', 'O que está buscando?',
            'Pesquisar por assunto', 'Encontre uma matéria', 'Digite sua busca', 'Procure aqui'],
  buscaAr: ['Buscar no site', 'Campo de busca', 'Pesquisar no site', 'Buscar conteúdo',
            'Campo de pesquisa', 'Busca do site', 'Pesquisa no acervo', 'Buscar matéria',
            'Campo para buscar', 'Pesquisar conteúdo'],
  menuAria:['Editorias', 'Seções', 'Navegação principal', 'Menu principal', 'Assuntos',
            'Menu de editorias', 'Navegação do site', 'Categorias', 'Menu', 'Seções do site',
            'Navegação', 'Editorias do portal'],
  menuFechar:['Fechar o menu de editorias', 'Fechar o menu', 'Esconder as editorias',
              'Fechar a navegação', 'Ocultar o menu', 'Fechar as seções',
              'Recolher o menu', 'Esconder a navegação'],
  menuAbrir: ['Abrir o menu de editorias', 'Abrir o menu de seções', 'Abrir o menu',
              'Abrir a navegação', 'Abrir as editorias', 'Ver as seções',
              'Abrir o menu do site', 'Mostrar as editorias', 'Abrir a lista de seções',
              'Ver o menu', 'Abrir os assuntos', 'Mostrar a navegação'],
  ariaRodape:['Rodapé', 'Institucional', 'Rodapé do site', 'Links do rodapé', 'Mais do portal',
              'Informações do site', 'Serviço', 'Páginas do site'],
  ariaNeste: ['Neste artigo', 'Sumário', 'Índice do texto', 'Tópicos do artigo',
              'O que tem aqui', 'Seções desta matéria'],
  ariaTrilha:['Trilha de navegação', 'Você está em', 'Caminho', 'Navegação estrutural',
              'Localização', 'Trilha'],
  shareLb: ['Compartilhar:', 'Compartilhe:', 'Enviar para:', 'Mandar para:',
            'Divulgue:', 'Compartilhar em:', 'Passe adiante:', 'Espalhe:'],
  shareCp: ['Copiar link', 'Copiar o endereço', 'Copiar URL', 'Levar o link',
            'Pegar o link', 'Copiar endereço', 'Guardar o link'],
  shareOk: ['Link copiado!', 'Copiado!', 'Endereço copiado!', 'Pronto, copiado!',
            'Link na área de transferência!', 'Copiei!'],
  leiaTb:  ['Leia também', 'Veja também', 'Leia mais', 'Também sobre o tema',
            'Continue por aqui', 'Relacionado', 'Vale ler', 'Mais sobre isso'],
  atrUrl:  ['url', 'end', 'lk', 'href2', 'alvo', 'dest', 'ln', 'src2'],
  atrFp:   ['fp', 'pref', 'ext', 'fnt', 'gp', 'pf', 'opt', 'wg', 'lk', 'sv', 'ic', 'ui', 'cta', 'src'],
  atrRod:  ['rod', 'foot', 'fim', 'base', 'pe', 'bl', 'end', 'low', 'ft', 'zz'],
  atrCk:   ['v', 'ck', 'op', 'ac', 'sel', 'val', 'esc', 'cc', 'lg', 'cs', 'pr', 'dc'],
  atrMh:   ['mh', 'nav', 'mn', 'tg', 'ab', 'menu', 'drop', 'exp', 'ctl', 'sw', 'md', 'bx'],
  atrAb:   ['aberto', 'vis', 'ativo', 'exp', 'estado', 'st', 'on', 'mostra', 'ab', 'sit'],
  qp:      ['v', 'r', 'i', 'c', 'u', 'x', 'k', 'w', 'm', 'g', 'd', 'z', 'q', 's', 'n', 'p',
            'ver', 'rev', 'im', 'dim'],
};
// ---------- ordem do <head> por portal ----------
// `headOrder % 3` dava so tres arranjos para uma rede de 103 portais: o
// esqueleto do <head> saia identico em ate 12 sites. Com o embaralhamento por
// slug sao ate 720 ordens para os seis blocos.
function _embaralha(site, lista, marca) {
  const a = lista.slice();
  let h = _hashSemente(site, marca);
  for (let i = a.length - 1; i > 0; i--) {
    h = Math.imul(h ^ i, 16777619) >>> 0;
    const j = h % (i + 1);
    const x = a[i]; a[i] = a[j]; a[j] = x;
  }
  return a;
}

const _vocCache = new Map();
function _vocab(site) {
  const slug = String((site && (site.slug || site.domain)) || '');
  if (_vocCache.has(slug)) return _vocCache.get(slug);
  const o = {};
  for (const chave of Object.keys(_VOC_OPC)) {
    let h = 2166136261;
    const semente = slug + '#voc#' + chave;
    for (let i = 0; i < semente.length; i++) { h ^= semente.charCodeAt(i); h = Math.imul(h, 16777619); }
    const lista = _VOC_OPC[chave];
    o[chave] = lista[(h >>> 0) % lista.length];
  }
  _vocCache.set(slug, o);
  return o;
}
// frase do banner de LGPD: saia identica em todos, ancora inclusive
const _CK_FRASES = [
  'Usamos cookies necessários para o site funcionar e, com a sua permissão, cookies de medição de audiência e de conteúdo de terceiros. Você escolhe. Detalhes na <a href="/politica-de-privacidade/">política de privacidade</a>.',
  'Este site usa cookies essenciais para funcionar. Com a sua autorização, também usamos cookies de audiência e de conteúdo de parceiros. A escolha é sua, e os detalhes estão no <a href="/politica-de-privacidade/">aviso de privacidade</a>.',
  'Alguns cookies são indispensáveis para a navegação. Outros, de medição e de conteúdo externo, só entram se você permitir. Saiba como tratamos seus dados em <a href="/politica-de-privacidade/">proteção de dados</a>.',
  'Para o site funcionar usamos cookies essenciais. Os de audiência e os de terceiros dependem do seu aceite. Você decide agora e pode rever depois. Veja a <a href="/politica-de-privacidade/">nossa política de dados</a>.',
  'Guardamos apenas os cookies necessários à navegação. Medição de audiência e conteúdo incorporado ficam para quando você autorizar. Entenda em <a href="/politica-de-privacidade/">privacidade e cookies</a>.',
  'Cookies essenciais mantêm o site de pé. Os demais, de audiência e de parceiros, esperam a sua permissão. A decisão é sua e está explicada em <a href="/politica-de-privacidade/">como usamos seus dados</a>.',
  'Usamos cookies para o site funcionar e, se você concordar, para medir audiência e exibir conteúdo de terceiros. Nada disso acontece sem o seu aceite. Leia o <a href="/politica-de-privacidade/">aviso sobre dados</a>.',
  'O site depende de cookies técnicos. Já os de medição e os de conteúdo externo entram só com a sua permissão. Todos os detalhes ficam em <a href="/politica-de-privacidade/">tratamento de dados pessoais</a>.',
];
function _hashSemente(site, marca) {
  let h = 2166136261;
  const s = String((site && (site.slug || site.domain)) || '') + marca;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function _ckFrase(site) { return _CK_FRASES[_hashSemente(site, '#ck#') % _CK_FRASES.length]; }
// ---------- rotulo de interface vindo das arquiteturas ----------
// Estes textos estao escritos nas arquiteturas e saiam identicos em todos os
// portais. Trocar la seria dezenas de arquivos; aqui e um ponto so, e
// arquitetura nova ja entra coberta. Casa o texto INTEIRO entre duas tags.
// ⚠️ "Redacao" NAO entra: nas arquiteturas ele tambem e assinatura de materia
// sem autor ("Da Redacao"), e trocar mudaria autoria, nao rotulo.
const _ROT_OPC = {
  'Institucional': ['Institucional', 'O portal', 'Sobre o site', 'Páginas do site',
                    'Serviço', 'Informações', 'O site', 'Mais do portal'],
  'Editorias': ['Editorias', 'Seções', 'Assuntos', 'Categorias', 'Temas', 'Áreas', 'Cadernos'],
  'Buscar no acervo': ['Buscar no acervo', 'Buscar no site', 'Pesquisar', 'Busca',
                       'Procurar matéria', 'Buscar conteúdo', 'Pesquisa', 'Buscar'],
  'Corrigir uma informação': ['Corrigir uma informação', 'Corrigir um erro', 'Reportar um erro',
                              'Pedir uma correção', 'Apontar uma correção', 'Errata',
                              'Solicitar correção'],
  'Fale com a redação': ['Fale com a redação', 'Fale conosco', 'Escreva para a redação',
                         'Contato com a redação', 'Enviar mensagem', 'Falar com a equipe',
                         'Escreva para nós'],
  'Sugerir uma pauta': ['Sugerir uma pauta', 'Sugira uma pauta', 'Enviar uma sugestão',
                        'Indicar um assunto', 'Propor uma pauta', 'Mandar uma sugestão',
                        'Sugestão de pauta'],
};
const _ROT_PAGINA = { 'Equipe editorial': 'equipe', 'Política editorial': 'politica-editorial' };
function _trocaRotulos(site, html) {
  let n = _hashSemente(site, '#rot#');
  for (const canon of Object.keys(_ROT_OPC)) {
    const lista = _ROT_OPC[canon];
    n = Math.imul(n ^ lista.length, 16777619) >>> 0;
    const novo = lista[n % lista.length];
    if (novo !== canon) html = html.split('>' + canon + '<').join('>' + novo + '<');
  }
  for (const canon of Object.keys(_ROT_PAGINA)) {
    const alvo = (site.extraPages || []).find(p => p.slug === _ROT_PAGINA[canon]);
    if (alvo && alvo.title && alvo.title !== canon) {
      html = html.split('>' + canon + '<').join('>' + esc(alvo.title) + '<');
    }
  }
  const pf = ['Ver tudo em', 'Tudo de', 'Mais de', 'Ver mais de', 'Todas as matérias de',
              'Ir para', 'Ver a editoria', 'Acompanhe'];
  const novoPf = pf[_hashSemente(site, '#pf#') % pf.length];
  if (novoPf !== 'Ver tudo em') html = html.replace(/>Ver tudo em /g, '>' + novoPf + ' ');
  return html;
}

// ---------- assinatura escrita pelas proprias arquiteturas ----------
// Varias arquiteturas montam a sanfona do menu por conta propria e escrevem
// `data-aberto`, `data-v` e `aria-label="Editorias"` elas mesmas, sem passar
// pelo menu do motor. Comparando os 103 portais das tres maquinas, esses eram os
// itens mais espalhados que restavam.
//
// ⚠️ A troca acontece no DOCUMENTO INTEIRO, de proposito. O atributo, o seletor
// `[data-aberto="1"]` do CSS e o `setAttribute("data-aberto", ...)` do JS estao
// todos na mesma pagina, entao mudam juntos e a sanfona continua funcionando.
// Trocar apenas o ponto de emissao quebraria o menu em todos os portais.
const _ASS_JS = [
  ["'Abrir o menu de editorias'", 'menuAbrir'],
  ["'Abrir menu de editorias'", 'menuAbrir'],
  ["'Fechar o menu de editorias'", 'menuFechar'],
  ["'Fechar menu de editorias'", 'menuFechar'],
];
const _ASS_ATR = [
  ['data-fp-rodape', 'atrRod'],   // o mais longo primeiro: `data-fp` casaria dentro dele
  ['data-aberto', 'atrAb'],
  ['data-mh', 'atrMh'],
  ['data-fp', 'atrFp'],
  ['data-v', 'atrCk'],
];
const _ASS_ARIA = {
  'Editorias': 'menuAria',
  'Menu': 'menuAria',
  'Abrir o menu de editorias': 'menuAbrir',
  'Abrir menu de editorias': 'menuAbrir',
  'Abrir menu': 'menuAbrir',
  'Rodapé': 'ariaRodape',
  'Institucional': 'ariaRodape',
  'Neste artigo': 'ariaNeste',
  'Trilha de navegação': 'ariaTrilha',
};
function _trocaAssinatura(site, html) {
  const v = _vocab(site);
  const usados = new Set();
  for (const [orig, chave] of _ASS_ATR) {
    if (html.indexOf(orig) < 0) continue;
    let novo = 'data-' + (v[chave] || 'x');
    // dois originais nao podem cair no mesmo nome dentro do mesmo portal
    let n = 0;
    while (usados.has(novo)) { n++; novo = 'data-' + (v[chave] || 'x') + n; }
    usados.add(novo);
    if (novo === orig) continue;
    html = html.replace(new RegExp(orig + '(?![-\\w])', 'g'), novo);
  }
  // rotulo que o JS troca no clique: comecava variado e voltava a ser igual
  for (const [lit, chave] of _ASS_JS) {
    const novo = v[chave];
    if (!novo) continue;
    html = html.split(lit).join("'" + novo.replace(/'/g, "") + "'");
  }
  for (const rot of Object.keys(_ASS_ARIA)) {
    const novo = v[_ASS_ARIA[rot]];
    if (!novo || novo === rot) continue;
    html = html.split('aria-label="' + rot + '"').join('aria-label="' + esc(novo) + '"');
  }
  return html;
}

// ---------- ordem das chaves do JSON-LD, por portal ----------
// O JSON preserva a ordem de insercao, entao ela e comparavel entre sites. A
// home ja variava; artigo e trilha saiam identicos em 63 de 63.
// ⚠️ `@context` e `@type` NAO entram no embaralhamento: sao a convencao que todo
// validador espera na frente, e mexer nisso chamaria atencao em vez de esconder.
function _ordLd(site, obj) {
  const fixas = ['@context', '@type'];
  const resto = Object.keys(obj).filter(k => fixas.indexOf(k) < 0);
  let h = _hashSemente(site, '#ldart#');
  for (let i = resto.length - 1; i > 0; i--) {
    h = Math.imul(h ^ i, 16777619) >>> 0;
    const j = h % (i + 1);
    const x = resto[i]; resto[i] = resto[j]; resto[j] = x;
  }
  const o = {};
  for (const k of fixas) if (k in obj) o[k] = obj[k];
  for (const k of resto) o[k] = obj[k];
  return o;
}

const _clsCache = new Map();
function _clsMapa(site) {
  const slug = String((site && (site.slug || site.domain)) || '');
  if (_clsCache.has(slug)) return _clsCache.get(slug);
  const m = new Map();
  for (const nome of _CLS_LIT) {
    let h = 2166136261;
    const semente = slug + '#cls#' + nome;
    for (let i = 0; i < semente.length; i++) { h ^= semente.charCodeAt(i); h = Math.imul(h, 16777619); }
    h = h >>> 0;
    m.set(nome, String.fromCharCode(97 + (h % 26)) + h.toString(36));
  }
  _clsCache.set(slug, m);
  return m;
}
// banner de cookies: regra da casa, e este motor nao tinha
function _lgpd(site) {
  const t = (site && site.theme) || {};
  // 🔴 o fundo do banner e fixo em #111. Pintar o botao com a primaria deixa o
  // "Aceitar todos" PRETO SOBRE PRETO nos portais de paleta escura: ele existe,
  // e clicavel, e some da tela. So a captura mostra
  const _lum = (h) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '').trim());
    if (!m) return 1;
    const n = parseInt(m[1], 16);
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
  };
  const _contra = (h) => (Math.max(_lum(h), 0.0134) + 0.05) / (Math.min(_lum(h), 0.0134) + 0.05);
  let cor = t.primary || '#111', sob = '#fff';
  if (_contra(cor) < 2.2) cor = t.vivid || cor;
  if (_contra(cor) < 2.2) { cor = '#f5f5f5'; sob = '#111'; }
  const id = 'lgpd-' + String(site.slug || 'p');
  return '<div id="' + id + '" style="position:fixed;left:0;right:0;bottom:0;z-index:9999;display:none;'
    + 'background:#111;color:#f5f5f5;padding:14px 18px;font:14px/1.5 system-ui,sans-serif">'
    + '<div style="max-width:1100px;margin:0 auto;display:flex;gap:16px;align-items:center;flex-wrap:wrap">'
    + '<p style="margin:0;flex:1 1 340px;text-align:left">'
    + _ckFrase(site).replace('<a href="/politica-de-privacidade/">', '<a href="/politica-de-privacidade/" style="color:#fff">')
    + '</p>'
    + '<button type="button" data-' + _vocab(site).atrCk + '="necessarios" style="background:none;border:1px solid #666;color:#f5f5f5;'
    + 'padding:9px 16px;cursor:pointer">' + esc(_vocab(site).ckNec) + '</button>'
    + '<button type="button" data-' + _vocab(site).atrCk + '="todos" style="background:' + cor + ';border:1px solid ' + cor + ';'
    + 'color:' + sob + ';padding:9px 16px;cursor:pointer">' + esc(_vocab(site).ckSim) + '</button>'
    + '</div></div>'
    + '<script>(function(){var b=document.getElementById("' + id + '");if(!b)return;'
    + 'if(document.cookie.indexOf("cookie_consent=")<0){b.style.display="block";}'
    + 'b.addEventListener("click",function(e){var v=e.target&&e.target.getAttribute("data-' + _vocab(site).atrCk + '");if(!v)return;'
    + 'document.cookie="cookie_consent="+v+";path=/;max-age=31536000;SameSite=Lax";b.style.display="none";'
    + 'if(v==="todos"&&window.gtag){gtag("consent","update",{ad_storage:"granted",ad_user_data:"granted",'
    + 'ad_personalization:"granted",analytics_storage:"granted"});}'
    + '});})();</script>';
}
// A primeira imagem larga da pagina e quase sempre o LCP. Servi-la com
// loading="lazy" adia justamente a metrica que o Google mede. Retrato de autor
// e marca ficam de fora pelo width declarado.
function _lcpEager(html) {
  let feito = false;
  return String(html).replace(/<img\b[^>]*>/gi, (tag) => {
    if (feito) return tag;
    const w = tag.match(/\bwidth="(\d+)"/i);
    if (w && Number(w[1]) < 200) return tag;      // avatar, marca, icone
    feito = true;
    if (!/loading="lazy"/i.test(tag)) return tag; // ja esta eager
    let novo = tag.replace(/\s*loading="lazy"/i, '');
    if (!/fetchpriority=/i.test(novo)) novo = novo.replace(/<img\b/i, '<img fetchpriority="high"');
    return novo;
  });
}

function _renomClasses(site, html) {
  const m = _clsMapa(site);
  // a11y: link de pular, e o alvo dele no <main>. Entra aqui, e nao na
  // arquitetura, para valer em todas de uma vez e nas futuras
  if (!/<a[^>]*class="pular-conteudo"/.test(html) && /<main[\s>]/i.test(html)) {
    const _v = _vocab(site);
    if (!/<main[^>]*\sid=/i.test(html)) {
      html = html.replace(/<main\b/i, '<main id="' + _v.pularId + '"');
    }
    html = html.replace(/(<body[^>]*>)/i,
      '$1<a class="pular-conteudo" href="#' + _v.pularId + '">' + esc(_v.pularTx) + '</a>');
  }
  // a marca e o id do PROPRIO banner, e nao a palavra cookie_consent: o
  // Consent Mode do AdSense tambem a escreve no head, e com ela o guard
  // pulava o banner em todo portal com anuncio
  const _marcaLgpd = 'id="lgpd-' + String((site && site.slug) || 'p') + '"';
  if (html.indexOf(_marcaLgpd) < 0 && html.indexOf('</body>') > 0) {
    try { html = html.replace('</body>', _lgpd(site) + '</body>'); } catch (e) {}
  }
  let out = String(html).replace(/class="([^"]*)"/g, (todo, v) => {
    const t = v.split(/\s+/).map(x => m.get(x) || x).join(' ');
    return t === v ? todo : 'class="' + t + '"';
  });
  out = out.replace(/<style>([\s\S]*?)<\/style>/g, (todo, css) =>
    '<style>' + css.replace(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g, (a, t) => m.has(t) ? '.' + m.get(t) : a) + '</style>');
  // 🔴 arquitetura que chama instLinks TAMBEM no cabecalho fazia o botao de
  // fonte preferida sair ali, contra o que a documentacao pede. O que estiver
  // antes do fim do </header> sai
  const _fimCab = out.indexOf('</header>');
  if (_fimCab > 0) {
    const _cab = out.slice(0, _fimCab);
    const _limpo = _cab.replace(/<!--fp-->[\s\S]*?<!--\/fp-->/g, '');
    if (_limpo !== _cab) out = _limpo + out.slice(_fimCab);
  }
  out = _menuSanfona(site, out);
  // o marcador <!--fp--> ja cumpriu o papel de delimitar o bloco. Deixa-lo no
  // HTML entregue e o achado mais facil de todos: comentario identico em dois
  // sites nao acontece por acaso
  out = out.replace(/<!--\/?fp-->/g, '');
  // o rotulo do menu vem da arquitetura, e o _menuSanfona ACHA o menu por ele.
  // A troca so pode ser aqui, depois que o localizador ja fez o trabalho
  out = out.replace(/(<nav[^>]*aria-label=")Editorias(")/gi,
    '$1' + esc(_vocab(site).menuAria) + '$2');
  out = _trocaRotulos(site, out);
  out = _trocaAssinatura(site, out);
  return out;
}

function homePage(site, arts, menu) { return adsNaLista(site, _renomClasses(site, _raw_homePage(site, arts, menu))); }
// ---------- "Leia tambem" no MEIO do corpo ----------
// O tema ja monta relacionados no RODAPE, mas o corpo saia sem nenhum link
// interno. Link no meio do texto vale mais: o leitor ainda esta engajado, e o
// Google da mais peso a link dentro do conteudo do que a bloco de navegacao.
//
// Montado no RENDER, nao na publicacao, entao ele se atualiza sozinho a cada
// reconstrucao e sempre aponta para o que ha de mais recente na categoria. O
// autoLink, que existe desde antes, depende de um mapa escrito a mao, e foi
// justamente onde apareceram ancoras quebradas como "teste completo avaliar".
//
// Recebe SEIS relacionados: os tres primeiros vao para o meio, os tres
// seguintes para o rodape, entao os dois blocos nunca repetem o mesmo link.
function _leiaTambemNoMeio(site, art, doMeio) {
  try {
    const c = String((art && art.content) || "");
    if (!c || !Array.isArray(doMeio) || !doMeio.length) return c;
    if (c.indexOf("pe-leia-meio") >= 0) return c;
    // posicao: logo antes do 3o <h2>, ou do 2o se o texto for curto
    const hs = [];
    const re = /<h2[^>]*>/gi;
    let m;
    while ((m = re.exec(c))) hs.push(m.index);
    if (hs.length < 2) return c;
    const pos = hs.length >= 3 ? hs[2] : hs[1];
    const itens = doMeio.slice(0, 3).map(function (r) {
      const cs = r.category ? r.category.slug : "noticias";
      const url = site.flatUrl ? "/" + r.slug + "/" : "/" + cs + "/" + r.slug + "/";
      return '<li><a href="' + url + '">' + esc(r.title || r.slug) + "</a></li>";
    }).join("");
    const bloco = '<aside class="pe-leia-meio"><p><strong>Leia também</strong></p><ul>'
      + itens + "</ul></aside>";
    return c.slice(0, pos) + bloco + c.slice(pos);
  } catch (e) {
    return String((art && art.content) || "");
  }
}

// ---------- relacionados com rodizio ----------
// Pegar sempre os 6 mais recentes da editoria faz a MESMA manchete virar ancora
// em todo artigo dela: no jornaldebarcelos um unico texto recebia 641 links
// internos com o mesmo texto ancora, e a regra da rede e no maximo 8. A janela
// desliza por artigo, com deslocamento tirado de um hash do slug: deterministico,
// entao a reconstrucao nao embaralha nada, e uniforme, entao cada alvo passa a
// receber cerca de 6 links.
function _relacionados(todos, slug) {
  if (!Array.isArray(todos)) return [];
  const i = todos.findIndex(x => x && x.slug === slug);
  const pool = todos.filter(x => x && x.slug !== slug);
  if (pool.length <= 6) return pool;
  // duas metades com passos PROPRIOS: o bloco do meio sai de i*3 e o do rodape
  // do outro lado da lista. Assim cada alvo recebe exatamente 3 links de cada
  // bloco, e nao de 0 a 6 conforme a posicao dele dentro de uma janela unica.
  // Com janela unica um alvo do desassossegada apareceu 6 vezes so no bloco do
  // meio, e somado aos 3 da malha do portal passou do teto de 8 usos por ancora
  const n = pool.length;
  const p = (i < 0 ? 0 : i) * 3;
  const meio = [0, 1, 2].map(k => pool[(p + k) % n]);
  const rodape = [0, 1, 2].map(k => pool[(p + Math.floor(n / 2) + k) % n])
    .filter(x => meio.indexOf(x) < 0);
  return meio.concat(rodape).slice(0, 6);
}

function articleHtml(site, art, menu, related) {
  let a = art, coube = false;
  // seis relacionados chegam: 0-2 vao para o meio, 3-5 para o rodape. Com
  // menos de quatro, o rodape reusa a lista toda e o meio fica sem bloco.
  const rel = Array.isArray(related) ? related : [];
  const doMeio = rel.length >= 4 ? rel.slice(0, 3) : [];
  const doRodape = rel.length >= 4 ? rel.slice(3, 6) : rel;
  if (art && art.content && doMeio.length) {
    const comLinks = _leiaTambemNoMeio(site, art, doMeio);
    if (comLinks !== art.content) a = Object.assign({}, a, { content: comLinks });
  }
  if (a && a.content && (site.adsSlots || {}).artigo) {
    const novo = adsNoCorpo(site, a.content);
    coube = novo !== a.content;
    if (coube) a = Object.assign({}, a, { content: novo });
  }
  // ⚠️ a decisao sai do artigo ORIGINAL: o bloco do meio e o anuncio ja
  // entraram em `a` e empurraram a numeracao dos paragrafos
  if (_dekRepetido(art)) a = Object.assign({}, a, { dek: '' });
  const html = _renomClasses(site, _raw_articleHtml(site, a, menu, doRodape));
  // Texto curto demais para receber bloco no meio ainda pode monetizar no fim.
  return coube ? html : adsNaLista(site, html);
}
function listPage(site, opts) { return adsNaLista(site, _renomClasses(site, _raw_listPage(site, opts))); }
function notFoundPage(site, menu) { return _renomClasses(site, _raw_notFoundPage(site, menu)); }
function pageHtml(site, page, menu) {
  const p = (page && page.content && (site.adsSlots || {}).artigo)
    ? Object.assign({}, page, { content: adsNoCorpo(site, page.content) })
    : page;
  return adsNaLista(site, _renomClasses(site, _raw_pageHtml(site, p, menu)));
}
function sitemapPageHtml(site, arts, menu) { return _renomClasses(site, _raw_sitemapPageHtml(site, arts, menu)); }

module.exports = { sanitizeHtml, slugify, publishArticle, autoLinkContent, rebuildIndexes, readAllArticles, decodeEntities, extractDek, pingIndexNow, theme, fpOf, buildCtx, homePage, articleHtml, listPage, notFoundPage, pageHtml, sitemapMeta, sitemapPageHtml };
