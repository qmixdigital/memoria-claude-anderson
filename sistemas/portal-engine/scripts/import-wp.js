'use strict';
/**
 * import-wp.js — importa o conteúdo de um site WordPress (via WP REST API) para um
 * portal já provisionado neste motor, enviando cada post pelo MESMO endpoint que o
 * Antônio usa (POST /<ns>/v1/artigos, header X-API-KEY).
 *
 * O motor cuida de: decode/sanitize, extração da linha fina, otimização da imagem
 * para WebP, slug, dedupe por slug, rebuild e IndexNow. Este script só TRADUZ o
 * formato WP → payload do Antônio e preserva a DATA original de cada post.
 *
 * Preserva URLs: para cada post importado, registra o par {URL antiga do WP → URL
 * nova no motor} num arquivo de redirects (use-o para gerar 301 no vhost — regra da
 * rede: nunca perder URL indexada).
 *
 * Requisitos: Node 18+ (fetch global). NÃO precisa rodar na VPS — roda na máquina local.
 *
 * Uso:
 *   node scripts/import-wp.js \
 *     --source=https://site-antigo.com.br \
 *     --endpoint=https://novo-portal.com.br/novoportal-api/v1/artigos \
 *     --key=<X-API-KEY do portal novo> \
 *     [--cat-map='{"Atualidade":"Notícias","Vida":"Entretenimento"}'] \
 *     [--keep-authors] [--limit=0] [--delay=400] [--dry-run] \
 *     [--redirects=redirects-novoportal.txt]
 *
 * Dica: rode primeiro com --dry-run --limit=3 para conferir a tradução antes de importar tudo.
 */

const fs = require('fs');

// ---------- args ----------
const args = {};
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) args[m[1]] = m[2] === undefined ? true : m[2];
}
const SOURCE = (args.source || '').replace(/\/+$/, '');
const ENDPOINT = args.endpoint || '';
const KEY = args.key || '';
const DRY = !!args['dry-run'];
const KEEP_AUTHORS = !!args['keep-authors'];
const LIMIT = parseInt(args.limit || '0', 10) || 0; // 0 = todos
const DELAY = parseInt(args.delay || '400', 10);
const REDIRECTS = args.redirects || 'redirects-import.txt';
let CATMAP = {};
try { CATMAP = args['cat-map'] ? JSON.parse(args['cat-map']) : {}; } catch (e) { console.error('cat-map inválido (JSON):', e.message); process.exit(1); }

if (!SOURCE || (!DRY && (!ENDPOINT || !KEY))) {
  console.error('Faltam args. Mínimo: --source=... e (--endpoint=... --key=...) [ou --dry-run].');
  process.exit(1);
}

// ---------- helpers ----------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function decodeEntities(s) {
  return String(s == null ? '' : s)
    .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => { try { return String.fromCodePoint(parseInt(h, 16)); } catch (e) { return m; } })
    .replace(/&#(\d+);/g, (m, d) => { try { return String.fromCodePoint(parseInt(d, 10)); } catch (e) { return m; } })
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&hellip;/g, '…').replace(/&#8211;/g, '–').replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘').replace(/&#8217;/g, '’').replace(/&#8220;/g, '“').replace(/&#8221;/g, '”')
    .replace(/&amp;/g, '&');
}
function stripTags(h) { return String(h || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }

async function fetchJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'portal-engine-import/1.0' } });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' em ' + url);
  return { json: await r.json(), totalPages: parseInt(r.headers.get('x-wp-totalpages') || '1', 10), total: parseInt(r.headers.get('x-wp-total') || '0', 10) };
}
async function imgToB64(url) {
  try { const r = await fetch(url); if (!r.ok) return null; const b = Buffer.from(await r.arrayBuffer()); return { b64: b.toString('base64'), name: (url.split('/').pop() || 'img').split('?')[0] }; }
  catch (e) { return null; }
}

// ---------- importação ----------
(async () => {
  console.log('Origem WP:', SOURCE);
  console.log('Destino  :', DRY ? '(dry-run, nada será enviado)' : ENDPOINT);
  let page = 1, totalPages = 1, imported = 0, skipped = 0, sent = 0;
  const redirectLines = [];
  do {
    let res;
    const api = `${SOURCE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed&status=publish`;
    try { res = await fetchJson(api); }
    catch (e) { console.error('Falha ao listar posts (página ' + page + '):', e.message); break; }
    totalPages = res.totalPages;
    if (page === 1) console.log('Total de posts publicados:', res.total, '(' + totalPages + ' páginas)');
    for (const post of res.json) {
      if (LIMIT && imported >= LIMIT) { page = totalPages; break; }
      imported++;
      const title = decodeEntities(post.title && post.title.rendered).trim();
      const content = post.content && post.content.rendered || '';
      const excerpt = stripTags(decodeEntities(post.excerpt && post.excerpt.rendered || '')).slice(0, 300);
      // categoria: primeiro termo da taxonomia category (via _embed), com cat-map opcional
      let catName = '';
      const terms = post._embedded && post._embedded['wp:term'] || [];
      const cats = (terms[0] || []).filter(t => t.taxonomy === 'category');
      if (cats.length) catName = cats[0].name;
      if (catName && CATMAP[catName]) catName = CATMAP[catName];
      // imagem destacada
      const media = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
      const imgUrl = media && (media.source_url || (media.media_details && media.media_details.sizes && media.media_details.sizes.full && media.media_details.sizes.full.source_url));
      const payload = {
        title,
        content,
        excerpt,
        status: 'publish',
        scheduled_date: (post.date_gmt ? post.date_gmt + 'Z' : post.date), // preserva a data original
        categories: catName ? [catName] : [],
      };
      if (KEEP_AUTHORS) {
        const au = post._embedded && post._embedded.author && post._embedded.author[0];
        if (au && au.name) payload.author = au.name;
      }
      if (imgUrl) {
        const im = await imgToB64(imgUrl);
        if (im) { payload.image_base64 = im.b64; payload.imagem = im.name; payload.image_alt = decodeEntities(media.alt_text || title); payload.image_title = title; }
      }
      if (DRY) {
        console.log(`[dry] ${title}  | cat:${catName || '(default)'} | img:${imgUrl ? 'sim' : 'não'} | data:${payload.scheduled_date}`);
        skipped++;
        continue;
      }
      try {
        const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-KEY': KEY }, body: JSON.stringify(payload) });
        const j = await r.json().catch(() => ({}));
        if (r.status === 201 && j.url) {
          sent++;
          // mapa de redirect: URL antiga (WP) -> URL nova (motor)
          if (post.link) {
            const oldPath = '/' + post.link.replace(/^https?:\/\/[^/]+\//, '').replace(/\/+$/, '/') ;
            const newPath = '/' + j.url.replace(/^https?:\/\/[^/]+\//, '');
            if (oldPath !== newPath) redirectLines.push(`${oldPath}\t${newPath}`);
          }
          console.log(`OK  ${j.slug}  (${sent})`);
        } else {
          console.log(`ERRO HTTP ${r.status} em "${title}": ${JSON.stringify(j).slice(0, 160)}`);
        }
      } catch (e) { console.log(`ERRO rede em "${title}": ${e.message}`); }
      await sleep(DELAY);
    }
    page++;
  } while (page <= totalPages);

  if (!DRY && redirectLines.length) {
    fs.writeFileSync(REDIRECTS, redirectLines.join('\n') + '\n');
    console.log(`\nMapa de redirects (URL antiga -> nova) salvo em: ${REDIRECTS} (${redirectLines.length} linhas)`);
    console.log('Use-o para gerar 301 no vhost do portal (ver CONVERSAO-WORDPRESS.md, passo de URLs/301).');
  }
  console.log(`\nResumo: ${imported} posts lidos | ${sent} enviados | ${skipped} dry | redirects: ${redirectLines.length}`);
})();
