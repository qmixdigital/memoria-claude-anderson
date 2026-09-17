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

// ---------- schema de FAQ ----------
// Le o proprio HTML do artigo: cada h3 dentro do bloco de perguntas frequentes
// vira uma Question, e o primeiro paragrafo depois dele vira a Answer.
function faqSchema(art) {
  const c = String(art.content || '');
  const i = c.search(/<h2[^>]*>[^<]*(perguntas frequentes|d[uú]vidas frequentes|faq)[^<]*<\/h2>/i);
  if (i < 0) return null;
  const bloco = c.slice(i);
  const pares = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*((?:<p[^>]*>[\s\S]*?<\/p>\s*)+)/gi;
  let m;
  while ((m = re.exec(bloco)) && pares.length < 10) {
    const q = stripTags(m[1]).trim();
    const a = stripTags(m[2]).replace(/\s+/g, ' ').trim();
    if (q.length > 8 && a.length > 30) pares.push({ q, a });
  }
  if (pares.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pares.map(p => ({
      '@type': 'Question',
      name: p.q,
      acceptedAnswer: { '@type': 'Answer', text: p.a },
    })),
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
function clip(s, n) { return stripTags(s).slice(0, n); }
// Corta em fim de palavra e nao deixa a frase morrer numa preposicao.
// O corte cru deixava "no dia a di..." e "viraram itens de..." nos cartoes.
const _RABO = /\s+(?:de|da|do|das|dos|em|no|na|nos|nas|a|o|as|os|um|uma|uns|umas|e|ou|que|com|por|para|pra|ao|aos|se|sua|seu|suas|seus|pelo|pela|entre|sobre|como|mais|muito|ja|nao)$/i;
function corta(s, n) {
  const t = stripTags(s == null ? '' : s).trim();
  if (t.length <= n) return t;
  const p = t.lastIndexOf(' ', n);
  let out = t.slice(0, p > n * 0.6 ? p : n).replace(/[\s,;:.!?\u2013\u2014-]+$/, '');
  for (let i = 0; i < 3; i++) {
    const menor = out.replace(_RABO, '');
    if (menor === out || menor.length < n * 0.5) break;
    out = menor.replace(/[\s,;:.!?\u2013\u2014-]+$/, '');
  }
  return out + '\u2026';
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
  return { arch, prefix, paletteMode: mode, T: tok };
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
/* lista de materias da pagina de autor: sem esta regra a editoria encosta no
   fim do titulo, porque o markup entrega link e rotulo sem separador */
.autor-posts{list-style:none;padding:0;margin:16px 0 6px}
.autor-posts li{display:flex;align-items:baseline;gap:16px;padding:11px 0;border-bottom:1px solid var(--line)}
.autor-posts li:last-child{border-bottom:0}
.autor-posts li a{flex:1;min-width:0}
.autor-posts li span{flex:none;font-family:var(--fb);font-size:10.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb);font-size:var(--fs);line-height:1.65;font-feature-settings:"kern","liga";overflow-wrap:break-word;-webkit-tap-highlight-color:rgba(0,0,0,.06)}
a{color:inherit;text-decoration:none;touch-action:manipulation}
button{touch-action:manipulation}
[id]{scroll-margin-top:70px}
img{max-width:100%}
${s('wrap')}{max-width:var(--maxw);margin:0 auto;padding:0 24px}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
${s('kicker')}{font-size:12px;font-weight:700;letter-spacing:var(--kls);text-transform:uppercase;color:var(--p)}
${s('kicker')} a{color:var(--p)}
${s('dek')}{font-size:clamp(17px,2.1vw,20px);line-height:1.5;color:var(--dek);margin:0 0 22px;max-width:62ch}
${s('crumbs')}{font-size:12px;letter-spacing:.03em;color:var(--muted);margin-bottom:18px}
${s('crumbs')} a{color:var(--muted)}${s('crumbs')} a:hover{color:var(--p)}${s('crumbs')} .sep{opacity:.55}${s('crumbs')} .cur{color:var(--ink);font-weight:600;opacity:1}
${s('meta')}{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:13px;letter-spacing:.02em;color:var(--muted);margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid var(--line)}
${s('meta')} .by{color:var(--ink);font-weight:600}${s('meta')} .sep{opacity:.5}${s('meta')} .rt{color:var(--p);font-weight:600}
${s('share')}{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:36px 0 0;padding-top:24px;border-top:1px solid var(--line)}
${s('share')} .lb{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
${s('share')} .bt{font-size:13px;font-weight:600;padding:8px 14px;border:1px solid var(--line);border-radius:999px;color:var(--ink);background:var(--surface);cursor:pointer;transition:all .2s;line-height:1}
${s('share')} .bt:hover{background:var(--p);color:var(--onp);border-color:var(--p)}
${s('progress')}{position:fixed;top:0;left:0;height:3px;width:100%;background:var(--p);transform:scaleX(0);transform-origin:0 50%;z-index:50;transition:transform .05s linear}
.page{max-width:760px;margin:0 auto;padding:var(--block) 0 10px}
.page h1{font-family:var(--fd);font-weight:900;font-size:clamp(30px,4.6vw,44px);line-height:1.08;letter-spacing:-.02em;margin:0 0 8px}
.page .upd{color:var(--muted);font-size:13px;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--line)}
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
    ico: `<link rel="icon" href="/favicon.ico" sizes="any">`,
    apple: `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    manifest: `<link rel="manifest" href="/site.webmanifest">`,
    theme: `<meta name="theme-color" content="${t.primary}">`,
  };
  const iconBlock = [
    [ic.svg, ic.ico, ic.apple, ic.manifest, ic.theme],
    [ic.theme, ic.svg, ic.ico, ic.apple, ic.manifest],
    [ic.svg, ic.apple, ic.ico, ic.theme, ic.manifest],
  ][order].join('\n');
  const fonts = [
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link rel="preload" as="style" href="${esc(t.googleUrl)}">`,
    `<link rel="stylesheet" href="${esc(t.googleUrl)}" media="print" onload="this.media='all'">`,
    `<noscript><link rel="stylesheet" href="${esc(t.googleUrl)}"></noscript>`,
  ].join('\n');
  const top = `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  const mid = [
    [titleB, seo, ogOrder, twBlock, iconBlock, fonts],
    [titleB, ogOrder, seo, twBlock, fonts, iconBlock],
    [titleB, twBlock, seo, iconBlock, ogOrder, fonts],
  ][order].join('\n');
  if (!ctx._css) ctx._css = baseCss(ctx) + getArch(ctx.fp.arch).css(ctx);
  return `<!DOCTYPE html>
<html lang="${esc(site.lang || 'pt-BR')}">
<head>
${top}
${mid}
<style>${ctx._css}</style>
${ld}
</head>`;
}

// ---------- schema ----------
function newsSchema(ctx, art, P) {
  const site = ctx.site; const v = ctx.fp.T.schemaVariant % 3;
  const o = {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: art.title, description: P.desc,
    datePublished: art.date, dateModified: art.modified || art.date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': P.url },
    publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `${site.baseUrl}/icon-512.png` } },
  };
  const _eq = (site.equipe || []).find(x => x.nome === art.author);
  if (_eq) o.author = { '@type': 'Person', name: art.author, url: `${site.baseUrl}/autor/${_eq.slug}/` };
  else if (v === 1) o.author = { '@type': 'Person', name: art.author || site.name };
  else o.author = { '@type': 'Organization', name: art.author || site.name };
  if (v === 1) o.articleSection = P.catName;
  if (v === 2) { o.wordCount = stripTags(art.content).split(/\s+/).filter(Boolean).length; if (art.tags && art.tags.length) o.keywords = art.tags.join(', '); }
  if (P.imgUrl) o.image = [P.imgUrl];
  return o;
}
function breadcrumbSchema(site, art, P) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: site.baseUrl + '/' },
      { '@type': 'ListItem', position: 2, name: P.catName, item: `${site.baseUrl}${catUrl(P.catSlug)}` },
      { '@type': 'ListItem', position: 3, name: art.title, item: P.url },
    ],
  };
}
function collectionSchema(site, title, canonical, items) {
  return {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: canonical,
    isPartOf: { '@type': 'WebSite', name: site.name, url: site.baseUrl + '/' },
    mainEntity: { '@type': 'ItemList', itemListElement: (items || []).slice(0, 30).map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: site.flatUrl ? `${site.baseUrl}/${a.slug}/` : `${site.baseUrl}/${a.category ? a.category.slug : 'noticias'}/${a.slug}/`, name: a.title })) },
  };
}

// ---------- helpers compartilhados passados aos arquetipos ----------
let _FLAT = false; // permalink plano (/slug/, igual WP) quando site.flatUrl=true
let _SMAP = '';
let _EXTRA = '';    // link do mapa do site no rodape (por site em buildCtx; anti-footprint)
let _CATBASE = ''; // base de categoria (ex: 'categoria') quando site.categoryBase setado; '' = raiz (igual antes)
function catUrl(slug) { return '/' + (_CATBASE ? _CATBASE + '/' : '') + esc(slug) + '/'; }
const H = {
  esc, stripTags, clip, corta,
  year: () => new Date().getFullYear(),
  dateFull: () => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
  dateShort: (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
  url: (a) => _FLAT ? `/${esc(a.slug)}/` : `/${esc(a.category ? a.category.slug : 'noticias')}/${esc(a.slug)}/`,
  cat: (a) => esc(a.category ? a.category.name : 'Notícias'),
  curl: (slug) => catUrl(slug),
  pic: (a, eager) => {
    if (!a.image) return '';
    const v = a.image.w ? `?v=${a.image.w}x${a.image.h}` : '';
    const ld = eager ? `fetchpriority="high" decoding="async"` : `loading="lazy" decoding="async"`;
    return `<img src="/img/${esc(a.image.file)}${v}" alt="${esc(a.image.alt || a.title)}" width="${a.image.w || 1200}" height="${a.image.h || 675}" ${ld}>`;
  },
  instLinks: () => `<a href="/quem-somos/">Quem Somos</a>${_EXTRA}<a href="/contato/">Contato</a><a href="/politica-de-privacidade/">Política de Privacidade</a><a href="/termos-de-uso/">Termos de Uso</a>${_SMAP}`,
  bodyEnd: () => '</body></html>',
  h1: (ctx) => `<h1 class="sr-only">${esc(ctx.site.name)}: ${esc(ctx.site.description || 'Notícias')}</h1>`,
  head: (ctx, meta) => buildHead(ctx, meta),
  homeMeta: (site) => {
    const org = { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: site.baseUrl + '/', logo: `${site.baseUrl}/icon-512.png` };
    const web = { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.baseUrl + '/', inLanguage: site.lang || 'pt-BR' };
    const title = site.metaTitle || (site.description ? `${site.description} | ${site.name}` : site.name);
    const _ogHome = _ogMarca(site);
    return { title, desc: site.metaDescription || site.description || site.name, canonical: site.baseUrl + '/', ogType: 'website', image: _ogHome, jsonld: [web, org] };
  },
  artMeta: (ctx, art, P) => ({ title: tituloArt(ctx.site, art.metaTitle || art.title), desc: P.desc, canonical: P.absUrl, ogType: 'article', image: P.imgUrl, jsonld: [P.news, P.crumbs].concat(P.faq ? [P.faq] : []) }),
  listMeta: (ctx, opts) => ({ title: opts.title, desc: opts.desc, canonical: opts.canonical, ogType: 'website', image: _ogLista(ctx.site, opts.items), jsonld: [collectionSchema(ctx.site, opts.title, opts.canonical, opts.items)] }),
  crumbs: (ctx, art, P) => `<nav class="${ctx.c('crumbs')}" aria-label="Trilha de navegação"><a href="/">Início</a> <span class="sep">›</span> <a href="${catUrl(P.catSlug)}">${esc(P.catName)}</a> <span class="sep">›</span> <span class="cur">${esc(art.title)}</span></nav>`,
  metaRow: (ctx, art, P) => `<div class="${ctx.c('meta')}"><span class="by">Por ${autorLink(ctx.site, art.author)}</span> <span class="sep">·</span> <time datetime="${esc(art.date)}">${esc(P.dstr)}</time> <span class="sep">·</span> <span class="rt">${P.readMin} min de leitura</span></div>`,
  progressBar: (ctx) => `<div class="${ctx.c('progress')}" id="${ctx.c('rdp')}"></div>`,
  share: (ctx, P) => {
    const enc = encodeURIComponent(P.url.startsWith('http') ? P.url : P.absUrl), encT = encodeURIComponent(P.title);
    return `<div class="${ctx.c('share')}">
<span class="lb">Compartilhar:</span>
<a class="bt" href="https://api.whatsapp.com/send/?text=${encT}%20${enc}" target="_blank" rel="noopener">WhatsApp</a>
<a class="bt" href="https://www.facebook.com/sharer/sharer.php?u=${enc}" target="_blank" rel="noopener">Facebook</a>
<a class="bt" href="https://twitter.com/intent/tweet?url=${enc}&text=${encT}" target="_blank" rel="noopener">X</a>
<button class="bt" data-url="${esc(P.absUrl)}">Copiar link</button>
</div>`;
  },
  progressScript: (ctx) => `<script>(function(){var b=document.getElementById('${ctx.c('rdp')}');if(b){var m=0,y=0,tk=false;function calc(){m=document.documentElement.scrollHeight-window.innerHeight;}function upd(){b.style.transform='scaleX('+(m>0?Math.min(1,y/m):0)+')';tk=false;}addEventListener('scroll',function(){y=window.scrollY||window.pageYOffset||0;if(!tk){tk=true;requestAnimationFrame(upd);}},{passive:true});addEventListener('resize',function(){calc();upd();},{passive:true});calc();upd();}var c=document.querySelector('.${ctx.c('share')} [data-url]');if(c)c.addEventListener('click',function(){try{navigator.clipboard.writeText(c.dataset.url);}catch(e){}var t=c.textContent;c.textContent='Link copiado!';setTimeout(function(){c.textContent=t;},1600);});})();</script>`,
};

// ---------- contexto de render por site ----------
function buildCtx(site) {
  _FLAT = !!site.flatUrl;
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
  body += `<h2>Páginas</h2><ul><li><a href="/">Página inicial</a></li>`;
  for (const p of staticPages(site)) body += `<li><a href="/${esc(p.slug)}/">${esc(p.title)}</a></li>`;
  body += `</ul>`;
  for (const c of cats) {
    body += `<h2><a href="${ctx.H.curl(c.slug)}">${esc(c.name)}</a></h2><ul>`;
    for (const a of c.items) body += `<li><a href="${ctx.H.url(a)}">${esc(a.title)}</a></li>`;
    body += `</ul>`;
  }
  const meta = { title: `${sm.title} - ${site.name}`, desc: `Mapa do site do ${site.name}: todo o conteúdo organizado por editoria para navegação rápida.`, canonical: url, ogType: 'website', image: null, jsonld: [collectionSchema(site, sm.title, url, arts)] };
  return `${buildHead(ctx, meta)}
${arch.header(ctx, menu)}
<main><article class="page">
<h1>${esc(sm.title)}</h1>
${body}
</article></main>
${arch.footer(ctx, menu)}`;
}


// monta o objeto P (urls/desc/schema/datas) usado no single
function buildP(ctx, art) {
  const site = ctx.site;
  const catSlug = art.category ? art.category.slug : 'noticias';
  const catName = art.category ? art.category.name : 'Notícias';
  const absUrl = site.flatUrl ? `${site.baseUrl}/${art.slug}/` : `${site.baseUrl}/${catSlug}/${art.slug}/`;
  const url = site.flatUrl ? `/${art.slug}/` : `/${catSlug}/${art.slug}/`;
  const imgUrl = art.image ? `${site.baseUrl}/img/${art.image.file}${art.image.w ? `?v=${art.image.w}x${art.image.h}` : ''}` : null;
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


// ---------- og:image de marca ----------
// site.ogImage aceita caminho relativo ou URL. Sem ele, cai no icone 512.
function _ogMarca(site) {
  const v = site.ogImage;
  if (!v) return site.baseUrl + '/icon-512.png';
  return /^https?:/.test(v) ? v : site.baseUrl + v;
}

// listagem: usa a imagem do primeiro item que tiver, senao a da marca
function _ogLista(site, itens) {
  const a = (itens || []).find(x => x && x.image && x.image.file);
  return a ? site.baseUrl + '/img/' + a.image.file : _ogMarca(site);
}

// ---------- consentimento de cookies (LGPD) ----------
// Obrigatorio em todo portal. Preferencia em `cookie_consent` por 1 ano, sem
// reexibir depois da escolha. Desliga com site.cookieBanner: false.
function cookieBanner(ctx) {
  if (ctx.site.cookieBanner === false) return '';
  const c = ctx.c;
  const css = '<style>'
    + '.' + c('lgpd') + '{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:var(--footer-bg,#141414);color:var(--footer-tx,#e8e4dd);padding:16px 20px;box-shadow:0 -2px 18px rgba(0,0,0,.18);transform:translateY(110%);transition:transform .45s cubic-bezier(.2,.7,.2,1)}'
    + '.' + c('lgpd') + '.' + c('lgpdon') + '{transform:translateY(0)}'
    + '.' + c('lgpdin') + '{max-width:var(--maxw,1180px);margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:14px 22px}'
    + '.' + c('lgpdtx') + '{flex:1;min-width:260px;font-size:13.5px;line-height:1.5;margin:0}'
    + '.' + c('lgpdtx') + ' a{color:inherit;text-decoration:underline;text-underline-offset:3px}'
    + '.' + c('lgpdbt') + '{display:flex;gap:10px;flex-wrap:wrap}'
    + '.' + c('lgpdbt') + ' button{font:inherit;font-size:13px;font-weight:600;padding:10px 18px;min-height:44px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer;transition:background .2s,color .2s}'
    + '.' + c('lgpdbt') + ' button:hover{background:#fff;border-color:#fff;color:#141414}'
    + '.' + c('lgpdok') + '{background:#fff!important;border-color:#fff!important;color:#141414!important}'
    + '@media(max-width:640px){.' + c('lgpdin') + '{flex-direction:column;align-items:stretch}.' + c('lgpdbt') + ' button{width:100%}}'
    + '@media(prefers-reduced-motion:reduce){.' + c('lgpd') + '{transition:none}}'
    + '</style>';
  const html = '<div class="' + c('lgpd') + '" id="' + c('lgpd') + '" role="dialog" aria-live="polite" aria-label="Aviso de cookies" hidden>'
    + '<div class="' + c('lgpdin') + '">'
    + '<p class="' + c('lgpdtx') + '">Usamos cookies necessários para o site funcionar e, com a sua permissão, cookies de medição de audiência e de conteúdo de terceiros. Você escolhe. Detalhes na <a href="/politica-de-privacidade/">política de privacidade</a>.</p>'
    + '<div class="' + c('lgpdbt') + '">'
    + '<button type="button" data-v="necessarios">Apenas necessários</button>'
    + '<button type="button" class="' + c('lgpdok') + '" data-v="todos">Aceitar todos</button>'
    + '</div></div></div>';
  const js = '<script>(function(){'
    + 'var b=document.getElementById("' + c('lgpd') + '");if(!b)return;'
    + 'if(/(?:^|;\\s*)cookie_consent=/.test(document.cookie)){b.parentNode.removeChild(b);return;}'
    + 'b.hidden=false;'
    + 'requestAnimationFrame(function(){requestAnimationFrame(function(){b.className+=" ' + c('lgpdon') + '";});});'
    + 'function grava(v){document.cookie="cookie_consent="+v+";path=/;max-age=31536000;SameSite=Lax";'
    + 'b.className="' + c('lgpd') + '";'
    + 'setTimeout(function(){if(b.parentNode)b.parentNode.removeChild(b);},500);'
    + 'try{window.dispatchEvent(new CustomEvent("consentimento",{detail:v}));}catch(e){}}'
    + 'var bs=b.getElementsByTagName("button");'
    + 'for(var i=0;i<bs.length;i++){(function(x){x.addEventListener("click",function(){grava(x.getAttribute("data-v"));});})(bs[i]);}'
    + '})();</script>';
  return css + html + js;
}

// ---------- impressao digital: nomes de classe proprios de cada portal ----------
// As classes literais do motor sairiam identicas nos 22 portais, o que permite
// identificar a rede comparando o vocabulario de classes. Aqui elas passam a
// derivar do slug do site, tanto no markup quanto no CSS ja montado.
const _CLS_LIT = ['cp', 'page', 'upd', 'sep', 'by', 'rt', 'bt', 'sr-only', 'notfound', 'nf-home', 'nf-code', 'lb', 'cur', 'cform', 'cform-msg', 'bs-form', 'bs-input', 'bs-lista', 'bs-res', 'bs-cat', 'bs-data', 'bs-vazio', 'eq-grid', 'eq-card', 'eq-area', 'eq-res', 'rd-lista', 'rd-ficha', 'rd-ed', 'rd-txt', 'pf-topo', 'pf-ed', 'pf-lead', 'pf-eds', 'pf-obs', 'autor-hero', 'autor-area', 'autor-lead', 'autor-cats', 'autor-nota', 'im', 'ov', 'cx', 'ln', 'more', 'kick', 'kicker', 'b', 'nf-txt', 'h', 'd', 'ok', 'ct', 'bx', 'tx', 'bs-btn', 'bs-ajuda', 'bs-titulo', 'bs-item', 'bs-cont', 'lgpd', 'lgpdon', 'lgpdin', 'lgpdtx', 'lgpdbt', 'lgpdok', 'n', 'tb', 'k'];
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

function _renomClasses(site, html) {
  const m = _clsMapa(site);
  // banner de cookies: entra antes do </body> de qualquer pagina do portal
  if (html.indexOf('lgpd') < 0 && html.indexOf('</body>') > 0) {
    try {
      const b = cookieBanner(buildCtx(site));
      if (b) html = html.replace('</body>', b + '</body>');
    } catch (e) {}
  }
  let out = String(html).replace(/class="([^"]*)"/g, (todo, v) => {
    const t = v.split(/\s+/).map(x => m.get(x) || x).join(' ');
    return t === v ? todo : 'class="' + t + '"';
  });
  out = out.replace(/<style>([\s\S]*?)<\/style>/g, (todo, css) =>
    '<style>' + css.replace(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g, (a, t) => m.has(t) ? '.' + m.get(t) : a) + '</style>');
  return out;
}

function homePage(site, arts, menu) { return _renomClasses(site, _raw_homePage(site, arts, menu)); }
function searchPageHtml(site, menu) { return _renomClasses(site, _raw_searchPageHtml(site, menu)); }
function articleHtml(site, art, menu, related) { return _renomClasses(site, _raw_articleHtml(site, art, menu, related)); }
function listPage(site, opts) { return _renomClasses(site, _raw_listPage(site, opts)); }
function notFoundPage(site, menu) { return _renomClasses(site, _raw_notFoundPage(site, menu)); }
function pageHtml(site, page, menu) { return _renomClasses(site, _raw_pageHtml(site, page, menu)); }
function sitemapPageHtml(site, arts, menu) { return _renomClasses(site, _raw_sitemapPageHtml(site, arts, menu)); }

function _raw_homePage(site, arts, menu) { const ctx = buildCtx(site); return getArch(ctx.fp.arch).home(ctx, arts, menu); }
function _raw_articleHtml(site, art, menu, related) { const ctx = buildCtx(site); return getArch(ctx.fp.arch).article(ctx, art, menu, related, buildP(ctx, art)); }
function _raw_listPage(site, opts) { const ctx = buildCtx(site); return getArch(ctx.fp.arch).list(ctx, opts); }

function _raw_notFoundPage(site, menu) {
  const ctx = buildCtx(site); const arch = getArch(ctx.fp.arch);
  const meta = { title: `Página não encontrada - ${site.name}`, desc: 'A página que você procura não existe ou foi removida.', canonical: site.baseUrl + '/', ogType: 'website', image: null, jsonld: [], robots: 'noindex, follow' };
  return `${buildHead(ctx, meta)}
${arch.header(ctx, menu)}
<main><div class="${ctx.c('wrap')}"><div class="notfound">
<div class="nf-code">404</div>
<h1>Página não encontrada</h1>
<p>A página que você procura pode ter sido movida ou não existe mais.</p>
<p><a class="nf-home" href="/">Voltar para a página inicial</a></p>
</div></div></main>
${arch.footer(ctx, menu)}`;
}

// ---------- paginas institucionais ----------
function _raw_pageHtml(site, page, menu) {
  // paginas extras podem trazer JSON-LD proprio (ex.: Person nas de autor)
  const ctx = buildCtx(site); const arch = getArch(ctx.fp.arch);
  const url = `${site.baseUrl}/${page.slug}/`;
  const meta = { title: `${page.title} - ${site.name}`, desc: page.desc || page.title, canonical: url, ogType: 'website', image: null, jsonld: page.jsonld ? [page.jsonld] : [] };
  return `${buildHead(ctx, meta)}
${arch.header(ctx, menu)}
<main><article class="page">
<h1>${esc(page.title)}</h1>
<p class="upd">Última atualização: ${esc(page.updated)}</p>
${page.content}
</article></main>
${arch.footer(ctx, menu)}`;
}
function staticPages(site) {
  const n = esc(site.name);
  const d = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  return [
    { slug: 'quem-somos', title: 'Quem Somos', updated: d,
      desc: site.aboutDesc || `Conheça o ${site.name}: portal de notícias e conteúdos atualizados, com curadoria e linguagem acessível.`,
      content: site.about || `<p>O <strong>${n}</strong> é um portal de notícias e conteúdos atualizados sobre os assuntos que mais interessam aos nossos leitores. Reunimos informação de leitura agradável e confiável para informar e inspirar.</p>
<h2>Nossa proposta</h2><p>Acreditamos que informação de qualidade aproxima pessoas de ideias e novidades relevantes. Por isso publicamos textos claros, bem apurados e pensados para o leitor brasileiro.</p>
<h2>O que você encontra aqui</h2><p>Notícias, reportagens e artigos com curadoria e linguagem acessível, atualizados ao longo do dia.</p>
<h2>Compromisso editorial</h2><p>Prezamos por precisão, respeito ao leitor e transparência. Nosso conteúdo é revisado e atualizado sempre que necessário. Quer falar com a gente? Acesse a nossa página de <a href="/contato/">contato</a>.</p>` },
    { slug: 'contato', title: 'Contato', updated: d,
      desc: `Fale com a redação do ${site.name}. Envie sua mensagem, sugestão ou dúvida.`,
      content: `<p>Quer falar com a redação do <strong>${n}</strong>? Envie sua mensagem pelo formulário abaixo: sugestões, dúvidas, correções ou parcerias. Respondemos assim que possível.</p>
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
      desc: `Política de Privacidade do ${site.name}: como coletamos, usamos e protegemos seus dados conforme a LGPD.`,
      content: `<p>O ${n} respeita a sua privacidade e está comprometido em proteger os dados pessoais dos visitantes, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).</p>
<h2>1. Dados que coletamos</h2><p>Ao navegar no ${n}, podemos coletar automaticamente informações como endereço IP, tipo de navegador, páginas visitadas, tempo de permanência e dados de cookies. Não solicitamos dados pessoais identificáveis para a simples leitura do conteúdo.</p>
<h2>2. Cookies e tecnologias semelhantes</h2><p>Utilizamos cookies para melhorar a experiência de navegação, lembrar preferências e gerar estatísticas de acesso. Você pode gerenciar ou desativar os cookies nas configurações do seu navegador.</p>
<h2>3. Ferramentas de análise</h2><p>Podemos utilizar serviços de análise de tráfego para entender como os visitantes interagem com o site. Esses serviços podem coletar dados de forma anonimizada.</p>
<h2>4. Compartilhamento de dados</h2><p>O ${n} não vende nem aluga seus dados pessoais. Informações podem ser compartilhadas apenas com prestadores de serviço essenciais à operação do site ou quando exigido por lei.</p>
<h2>5. Seus direitos (LGPD)</h2><p>Você tem o direito de confirmar a existência de tratamento, acessar, corrigir, anonimizar, portar ou solicitar a exclusão dos seus dados, além de revogar o consentimento a qualquer momento.</p>
<h2>6. Segurança</h2><p>Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, perda ou alteração.</p>
<h2>7. Retenção</h2><p>Os dados são mantidos apenas pelo tempo necessário às finalidades descritas ou conforme exigência legal.</p>
<h2>8. Alterações nesta política</h2><p>Esta Política de Privacidade pode ser atualizada periodicamente. A versão vigente estará sempre disponível nesta página.</p>
<h2>9. Contato</h2><p>Em caso de dúvidas sobre esta política ou sobre o tratamento dos seus dados, entre em contato pelos canais oficiais do ${n}.</p>` },
    { slug: 'termos-de-uso', title: 'Termos de Uso', updated: d,
      desc: `Termos de Uso do ${site.name}: condições para utilização do site e do conteúdo.`,
      content: `<p>Ao acessar e utilizar o ${n}, você concorda com os termos descritos abaixo. Caso não concorde, recomendamos que não utilize o site.</p>
<h2>1. Uso do site</h2><p>O conteúdo do ${n} tem caráter informativo e jornalístico. O uso é permitido para fins pessoais e não comerciais, salvo autorização expressa.</p>
<h2>2. Propriedade intelectual</h2><p>Textos, imagens, marcas e demais materiais publicados são protegidos por direitos autorais. A reprodução total ou parcial sem autorização é proibida.</p>
<h2>3. Conteúdo de terceiros e links</h2><p>O site pode conter links para páginas externas. Não nos responsabilizamos pelo conteúdo, políticas ou práticas de sites de terceiros.</p>
<h2>4. Isenção de responsabilidade</h2><p>Empenhamo-nos para manter as informações corretas e atualizadas, mas não garantimos a ausência de erros. O ${n} não se responsabiliza por decisões tomadas com base no conteúdo publicado.</p>
<h2>5. Alterações</h2><p>Estes Termos podem ser modificados a qualquer momento, sendo a versão atualizada publicada nesta página.</p>
<h2>6. Legislação aplicável</h2><p>Estes Termos são regidos pela legislação brasileira, elegendo-se o foro competente para dirimir eventuais conflitos.</p>` },
    // paginas extras definidas no sites.json (equipe, politica editorial, autores)
    ...(Array.isArray(site.extraPages) ? site.extraPages.map(x => ({
      slug: x.slug, title: x.title, updated: x.updated || d,
      desc: x.desc || '', content: x.content || '', jsonld: x.jsonld || null,
    })) : []),
  ];
}
function generateStaticPages(cfg, site, menu, arts) {
  const pages = staticPages(site);
  // paginas de autor recebem a lista de materias que a pessoa assina
  for (const pg of pages) {
    if (!pg.slug.startsWith('autor/') || !Array.isArray(arts)) continue;
    const nome = pg.title;
    const meus = arts.filter(a => a.author === nome).slice(0, 12);
    if (!meus.length) continue;
    const itens = meus.map(a => {
      const cat = a.category ? esc(a.category.name) : '';
      return `<li><a href="${site.flatUrl ? `/${esc(a.slug)}/` : `/${esc(a.category ? a.category.slug : "noticias")}/${esc(a.slug)}/`}">${esc(a.title)}</a><span>${cat}</span></li>`;
    }).join('');
    pg.content += `<h2>Últimas de ${esc(nome.split(' ')[0])}</h2><ul class="autor-posts">${itens}</ul>`;
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
      cp.execFileSync('convert', ['-background', t.primary, tmp, '-resize', '180x180', '-flatten', pub(cfg, site, 'apple-touch-icon.png')], { stdio: 'ignore', timeout: 15000 });
      cp.execFileSync('convert', [i512, '-define', 'icon:auto-resize=48,32,16', pub(cfg, site, 'favicon.ico')], { stdio: 'ignore', timeout: 15000 });
      // maskable: Android recorta em circulo/squircle, entao o desenho fica a 80%
      for (const [sz, out] of [[512, 'icon-512-maskable.png'], [192, 'icon-192-maskable.png']]) {
        const inner = Math.round(sz * 0.8);
        cp.execFileSync('convert', [i512, '-resize', inner + 'x' + inner, '-background', t.primary, '-gravity', 'center', '-extent', sz + 'x' + sz, pub(cfg, site, out)], { stdio: 'ignore', timeout: 15000 });
      }
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
    cp.execFileSync('convert', ['-size', '512x512', 'xc:' + t.primary, ...glyph, '-resize', '180x180', pub(cfg, site, 'apple-touch-icon.png')], { stdio: 'ignore', timeout: 15000 });
    cp.execFileSync('convert', [i512, '-define', 'icon:auto-resize=48,32,16', pub(cfg, site, 'favicon.ico')], { stdio: 'ignore', timeout: 15000 });
  } catch (e) { return; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${t.primary}"/><text x="32" y="34" font-family="system-ui,Arial,sans-serif" font-size="38" font-weight="800" fill="${t.onPrimary}" text-anchor="middle" dominant-baseline="central">${esc(letter)}</text></svg>`;
  writeAtomic(svgPath, svg);
}

// corta o nome curto do manifest em fronteira de palavra (o corte cego em 18
// caracteres produzia coisas como "Agencia Nacional d")
// Sufixo da marca no <title> so quando cabe no limite de exibicao do Google.
// site.titleMax (ex.: 62) liga o comportamento; sem ele, sufixo sempre, como antes.
function tituloArt(site, titulo) {
  const marca = site.shortName || site.name;
  const cheio = titulo + ' - ' + marca;
  const lim = Number(site.titleMax) || 0;
  return (lim && cheio.length > lim) ? titulo : cheio;
}

function shortNameOf(nome) {
  const n = String(nome || '').trim();
  if (n.length <= 18) return n;
  const corte = n.slice(0, 19);
  const esp = corte.lastIndexOf(' ');
  return (esp > 6 ? corte.slice(0, esp) : n.slice(0, 18)).trim();
}

// assinatura clicavel quando o autor consta na equipe editorial do sites.json
function autorLink(site, autor) {
  const nome = autor || site.name;
  const eq = (site.equipe || []).find(x => x.nome === nome);
  return eq ? `<a href="/autor/${esc(eq.slug)}/" rel="author">${esc(nome)}</a>` : esc(nome);
}

// ---------- io ----------
function readAllArticles(cfg, site) {
  const dir = dataDir(cfg, site);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json'))
    .map(f => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { return null; } })
    .filter(Boolean).filter(a => (a.status || 'publish') === 'publish')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
function buildMenu(articles, hide) {
  const h = new Set(hide || []);
  const seen = new Map();
  for (const a of articles) if (a.category && !seen.has(a.category.slug) && !h.has(a.category.slug)) seen.set(a.category.slug, a.category);
  return [...seen.values()].slice(0, 8);
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

function _raw_searchPageHtml(site, menu) {
  const ctx = buildCtx(site); const arch = getArch(ctx.fp.arch);
  const url = `${site.baseUrl}/busca/`;
  const meta = {
    title: `Busca - ${site.name}`,
    desc: `Pesquise em todo o conteúdo do ${site.name}.`,
    canonical: url, ogType: 'website', image: null, jsonld: [], robots: 'noindex, follow',
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
.bs-cat{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;opacity:.65}
.bs-data{display:block;font-size:.78rem;opacity:.55;margin-top:.2rem}
.bs-vazio{opacity:.75}
</style>
<script>${js}</script>`;
  return `${buildHead(ctx, meta)}
${arch.header(ctx, menu)}
<main><article class="page">
${body}
</article></main>
${arch.footer(ctx, menu)}`;
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
  writeAtomic(pub(cfg, site, 'index.html'), homePage(site, homeArts.length >= 8 ? homeArts : homeFallback, menu));
  for (const a of arts) {
    const acs = a.category ? a.category.slug : 'noticias';
    const related = arts.filter(x => x.slug !== a.slug && x.category && x.category.slug === acs).slice(0, 3);
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
      listPage(site, { title: cname, desc: `Últimas de ${cname} no ${site.name}.`, canonical: `${site.baseUrl}/${cbPfx}${cslug}/`, items, menu }));
  }
  const pageUrls = generateStaticPages(cfg, site, menu, arts);
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
  writeAtomic(pub(cfg, site, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
  if (site.indexnowKey) writeAtomic(pub(cfg, site, `${site.indexnowKey}.txt`), site.indexnowKey);
  const tm = theme(site);
  writeAtomic(pub(cfg, site, 'site.webmanifest'), JSON.stringify({
    name: site.name, short_name: site.shortName || shortNameOf(site.name), description: site.description || site.name,
    start_url: '/', display: 'standalone', background_color: tm.paper, theme_color: tm.primary,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
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
// contador global de ancoras por portal: a regra do Anderson e no maximo 2 usos
// da mesma ancora no site inteiro, senao vira over-optimization
function _ancPath(site) { return `/srv/portais/${site.slug}/anchors.json`; }
function _ancLoad(site) {
  try { return JSON.parse(fs.readFileSync(_ancPath(site), 'utf8')) || {}; } catch (e) { return {}; }
}
function _ancSave(site, obj) {
  try { writeAtomic(_ancPath(site), JSON.stringify(obj)); } catch (e) {}
}
function autoLinkContent(site, slug, content) {
  const conf = site.autoLink;
  if (!conf || !conf.enabled || !Array.isArray(conf.map) || !content) return content;
  const max = conf.maxLinks || 4;
  const _teto = conf.maxSameAnchor || 2;
  const _anc = _ancLoad(site);
  let _sujo = false;
  let added = 0;
  const parts = String(content).split(/(<[^>]+>)/);
  const linked = new Set();
  (String(content).match(/href="([^"]+)"/g) || []).forEach(h => linked.add(h.slice(6, -1)));
  // rotaciona a ordem dos termos por hash de (slug + destino): artigos
  // diferentes usam ancoras diferentes para o mesmo destino, em vez de o
  // primeiro termo do mapa dominar o site inteiro
  const _h = (str) => { let x = 0; for (const c of str) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; };
  for (const entry of conf.map) {
    if (added >= max) break;
    const url = entry.url;
    if (!url || linked.has(url) || url === '/' + slug + '/') continue;
    let done = false;
    const _t = (entry.terms || []).filter(t => (_anc[t.toLowerCase()] || 0) < _teto);
    if (!_t.length) continue;
    const _ini = _t.length > 1 ? _h(slug + '|' + url) % _t.length : 0;
    const _ordem = _t.map((_, i) => _t[(_ini + i) % _t.length]);
    for (const term of _ordem) {
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
          continue;
        }
        if (inA || inH || !seg.trim()) continue;
        const m = seg.match(re);
        if (m) {
          parts[i] = seg.replace(re, function (all, pre, word) {
            return pre + '<a href="' + url + '">' + word + '</a>';
          });
          _anc[term.toLowerCase()] = (_anc[term.toLowerCase()] || 0) + 1; _sujo = true;
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
    const pool = conf.fallback.pool.filter(e => e.url && e.url !== '/' + slug + '/' && !linked.has(e.url));
    if (pool.length) {
      // escolhe a ancora MENOS usada do destino, com desempate por hash:
      // escolher por hash puro fazia o modulo cair sempre na mesma quando a
      // lista de livres encolhia, e a ancora estourava o teto de 2 usos
      const pick = (e, n) => {
        const cand = e.anchors.slice().map((a, i) => ({ a, i, c: _anc[a.toLowerCase()] || 0 }));
        cand.sort((x, y) => x.c - y.c || ((n + x.i) % cand.length) - ((n + y.i) % cand.length));
        const a = cand[0].a;
        _anc[a.toLowerCase()] = (_anc[a.toLowerCase()] || 0) + 1; _sujo = true;
        return '<a href="' + e.url + '">' + a + '</a>';
      };
      const a = pool[h % pool.length];
      const b = pool.length > 1 ? pool[(h + 3) % pool.length] : null;
      let extra = '<p>Leia também: ' + pick(a, h);
      if (b && b.url !== a.url) extra += ' e ' + pick(b, (h >>> 3));
      extra += '.</p>';
      if (_sujo) _ancSave(site, _anc);
      return parts.join('') + '\n' + extra;
    }
  }
  if (_sujo) _ancSave(site, _anc);
  return parts.join('');
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
  const _metaTitle = (payload.metaTitle || payload.meta_title) ? decodeEntities(String(payload.metaTitle || payload.meta_title)).trim() : '';
  let prev = null;
  try { const _pp = path.join(dataDir(cfg, site), `${slug}.json`); if (fs.existsSync(_pp)) prev = JSON.parse(fs.readFileSync(_pp, 'utf8')); } catch (e) {}
  if (prev && prev.catLock && prev.category) { category = prev.category; catLock = true; }
  if (prev && prev.content === content && prev.title === String(payload.title) && prev.dek === dek
      && (prev.metaDescription || '') === _metaDesc
      && (prev.metaTitle || '') === _metaTitle
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
  // republicar sem mandar imagem de novo nao pode apagar a que ja existe
  if (!image && prev && prev.image && prev.image.file) image = prev.image;
  const now = new Date();
  const article = {
    slug, title: String(payload.title), content, dek,
    excerpt: dek,
    metaTitle: _metaTitle || null,
    metaDescription: _metaDesc || null,
    category, catLock, categories: catLock ? [category] : (cats.length ? cats.map(normCat) : [category]),
    tags: Array.isArray(payload.tags) ? payload.tags.map(String) : [], image,
    status: (!image && site.exigeImagem !== false) ? 'draft'
      : (['publish', 'draft'].includes(payload.status) ? payload.status : 'publish'),
    author: (payload.author && isNaN(Number(payload.author))) ? String(payload.author) : site.name,
    date: payload.scheduled_date ? new Date(payload.scheduled_date).toISOString() : now.toISOString(),
    modified: now.toISOString(),
  };
  if (!image && site.exigeImagem !== false) {
    try { process.stdout.write(`[${site.slug}] SEM IMAGEM, guardado como rascunho: ${slug}\n`); } catch (e) {}
  }
  ensureDir(dataDir(cfg, site));
  writeAtomic(path.join(dataDir(cfg, site), `${slug}.json`), JSON.stringify(article, null, 2));

  if (article.status === 'publish') {
    const all = readAllArticles(cfg, site);
    const menu = buildMenu(all, site.hideCategories);
    const related = all.filter(a => a.slug !== slug && a.category && a.category.slug === category.slug).slice(0, 3);
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

module.exports = { sanitizeHtml, slugify, publishArticle, autoLinkContent, rebuildIndexes, readAllArticles, decodeEntities, extractDek, pingIndexNow, theme, fpOf, buildCtx, homePage, articleHtml, listPage, notFoundPage, pageHtml, sitemapMeta, sitemapPageHtml };
