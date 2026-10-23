/**
 * Receptor do sistema Antônio para site estático no Cloudflare Pages.
 *
 * O site é HTML puro (sem servidor). Este worker, em modo avançado do Pages,
 * fica na frente dos arquivos estáticos e faz só quatro coisas:
 *
 *  1. POST /api/antonio/artigos  — recebe o artigo da cron do Antônio (mesmo
 *     contrato do WordPress/portal-engine), guarda artigo e imagem no KV e
 *     responde 201 com a URL, que é o que a cron espera para dar baixa.
 *  2. GET /<slug>/               — se não existe arquivo estático, monta a
 *     página a partir de /_antonio/modelo.html (um artigo real do site com
 *     placeholders) e do artigo no KV.
 *  3. Listagens                   — injeta os artigos novos nos cards do /blog,
 *     em /novos-artigos.json, /search-index.json e num /sitemap-antonio.xml
 *     referenciado pelo /sitemap.xml. Sem isso a página nova ficaria órfã.
 *  4. Imagens                     — serve /media/antonio/<slug>.webp (ou
 *     /uploads/antonio/ na PMS) a partir do KV quando não há arquivo.
 *
 * Tudo que não é isso vai direto para os arquivos estáticos (env.ASSETS).
 * Bindings: ANTONIO_KV (KV), ANTONIO_API_KEY (secret), SITE_HOST (texto).
 * Configuração por site em /_antonio/config.json.
 */

const JSON_HEAD = { 'content-type': 'application/json; charset=utf-8' };

export default {
  async fetch(request, env, ctx) {
    try {
      return await roteia(request, env);
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: 'erro interno no receptor: ' + (e && e.message) }), { status: 500, headers: JSON_HEAD });
    }
  },
};

async function roteia(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const semBarra = path.length > 1 ? path.replace(/\/+$/, '') : path;

  // ── API ────────────────────────────────────────────────────────────────
  if (semBarra === '/api/antonio/saude') {
    return json({ ok: true, host: env.SITE_HOST || url.hostname, kv: !!env.ANTONIO_KV });
  }
  if (semBarra === '/api/antonio/artigos' || semBarra.startsWith('/api/antonio/artigos/')) {
    const erroAuth = autentica(request, env);
    if (erroAuth) return erroAuth;
    const cfg = await lerConfig(env, request);
    if (request.method === 'POST' && semBarra === '/api/antonio/artigos') return publicar(request, env, cfg);
    if (request.method === 'GET' && semBarra === '/api/antonio/artigos') return json(await lerLista(env));
    if (request.method === 'DELETE' && semBarra.startsWith('/api/antonio/artigos/')) {
      return remover(decodeURIComponent(semBarra.slice('/api/antonio/artigos/'.length)), env);
    }
    return json({ ok: false, error: 'método não suportado' }, 405);
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);

  // ── Listagens e índices ─────────────────────────────────────────────────
  if (semBarra === '/novos-artigos.json') return novosArtigos(env, request);
  if (semBarra === '/search-index.json') return searchIndex(env, request);
  if (semBarra === '/sitemap.xml') return sitemapIndex(env, request);
  if (semBarra === '/sitemap-antonio.xml') return sitemapAntonio(env, request);
  if (semBarra === '/blog') return blogComNovos(env, request);

  // ── Imagem guardada no KV ───────────────────────────────────────────────
  const mImg = /^\/(media|uploads)\/antonio\/([a-z0-9-]+)\.webp$/.exec(semBarra);
  if (mImg) {
    const estatico = await env.ASSETS.fetch(request);
    if (estatico.status !== 404) return estatico;
    const bytes = await env.ANTONIO_KV.get('img:' + mImg[2], 'arrayBuffer');
    if (!bytes) return estatico;
    return new Response(bytes, { headers: { 'content-type': 'image/webp', 'cache-control': 'public, max-age=31536000, immutable' } });
  }

  // ── Página de artigo vinda do KV (só quando não existe arquivo estático) ──
  const mSlug = /^\/([a-z0-9-]+)$/.exec(semBarra);
  if (mSlug) {
    const estatico = await env.ASSETS.fetch(request);
    if (estatico.status !== 404) return estatico;
    const art = await env.ANTONIO_KV.get('art:' + mSlug[1], 'json');
    if (!art) return estatico;
    const cfg = await lerConfig(env, request);
    const modelo = await lerAsset(env, request, '/_antonio/modelo.html');
    if (!modelo) return new Response('modelo do artigo ausente', { status: 500 });
    const html = renderizar(modelo, art, cfg);
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
  }

  return env.ASSETS.fetch(request);
}

// ── Autenticação ──────────────────────────────────────────────────────────
function autentica(request, env) {
  const chave = request.headers.get('x-api-key') || '';
  if (!env.ANTONIO_API_KEY || chave !== env.ANTONIO_API_KEY) {
    return json({ ok: false, error: 'chave de API inválida' }, 401);
  }
  return null;
}

// ── Publicação ────────────────────────────────────────────────────────────
async function publicar(request, env, cfg) {
  let p;
  try { p = await request.json(); } catch (e) { return json({ ok: false, error: 'JSON inválido' }, 400); }

  const titulo = limpa(decodeEntidades(String(p.title || '')));
  if (!titulo) return json({ ok: false, error: 'title obrigatório' }, 400);
  const corpo = decodeEntidades(String(p.content || ''));
  if (!corpo.trim()) return json({ ok: false, error: 'content obrigatório' }, 400);

  const slug = slugify(titulo);
  const base = 'https://' + (env.SITE_HOST || new URL(request.url).hostname);
  const urlDe = (s) => base + '/' + s + (cfg.urlBarra ? '/' : '');

  // Já existe como arquivo estático ou no KV: devolve a URL existente e não
  // duplica. É a mesma regra do portal-engine, e evita que a cron reenvie.
  const jaKv = await env.ANTONIO_KV.get('art:' + slug, 'json');
  if (jaKv) return json({ ok: true, id: jaKv.id, post_id: jaKv.id, url: urlDe(slug), duplicado: true }, 201);
  const jaEstatico = await env.ASSETS.fetch(new Request(base + '/' + slug + '/', { method: 'HEAD' }));
  if (jaEstatico.status === 200) {
    const idEst = Math.floor(Date.now() / 1000);
    return json({ ok: true, id: idEst, post_id: idEst, url: urlDe(slug), duplicado: true }, 201);
  }

  // Data: a escolhida pelo editor (ISO em UTC) ou agora.
  let iso = new Date().toISOString();
  if (p.scheduled_date && !isNaN(Date.parse(p.scheduled_date))) iso = new Date(p.scheduled_date).toISOString();

  // Categoria pelo id do Antônio; cai na padrão do site quando não casa.
  let catId = Array.isArray(p.categories) ? p.categories[0] : p.categories;
  if (typeof catId === 'string' && catId.includes(',')) catId = catId.split(',')[0];
  const cat = (catId != null && cfg.categorias[String(catId)]) || null;
  const categoria = cat ? cat.nome : cfg.categoriaPadrao;
  const catAnchor = cat ? cat.anchor : 'cat-' + slugify(cfg.categoriaPadrao);

  const autor = limpa(decodeEntidades(String(p.author_name || ''))) || 'Redação';
  const descricao = limpa(decodeEntidades(String(p.meta_description || p.subtitle || ''))) || resumo(corpo, 155);

  // Imagem: vem em base64 (webp já tratado pelo Antônio). Guarda no KV.
  let temImagem = false;
  if (typeof p.image_base64 === 'string' && p.image_base64.length > 100) {
    const b64 = p.image_base64.replace(/^data:[^,]*,/, '');
    try {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      await env.ANTONIO_KV.put('img:' + slug, bytes.buffer);
      temImagem = true;
    } catch (e) { temImagem = false; }
  }

  // Id numérico pequeno: a coluna wp_post_id do Antônio é INT e milissegundos
  // (1,79 trilhão) estouram; segundos cabem até 2038.
  const id = Math.floor(Date.now() / 1000);
  const art = { id, slug, t: titulo, d: descricao, html: corpo, a: autor, c: categoria, ca: catAnchor, cid: catId == null ? null : String(catId), iso, img: temImagem, criado: new Date().toISOString() };
  await env.ANTONIO_KV.put('art:' + slug, JSON.stringify(art));

  const lista = await lerLista(env);
  lista.unshift({ slug, t: titulo, d: descricao, a: autor, c: categoria, ca: catAnchor, iso, img: temImagem });
  await env.ANTONIO_KV.put('lista', JSON.stringify(lista.slice(0, 5000)));

  return json({ ok: true, id, post_id: id, url: urlDe(slug), slug }, 201);
}

async function remover(slug, env) {
  const art = await env.ANTONIO_KV.get('art:' + slug, 'json');
  if (!art) return json({ ok: false, error: 'não encontrado' }, 404);
  await env.ANTONIO_KV.delete('art:' + slug);
  await env.ANTONIO_KV.delete('img:' + slug);
  const lista = (await lerLista(env)).filter((x) => x.slug !== slug);
  await env.ANTONIO_KV.put('lista', JSON.stringify(lista));
  return json({ ok: true, removido: slug });
}

async function lerLista(env) {
  return (await env.ANTONIO_KV.get('lista', 'json')) || [];
}

// ── Página do artigo ──────────────────────────────────────────────────────
function renderizar(modelo, art, cfg) {
  const ymd = dataYmd(art.iso);
  const v = {
    TITULO: art.t, DESCRICAO: art.d, SLUG: art.slug, DATA_ISO: art.iso, DATA_YMD: ymd,
    DATA_BR: dataBr(ymd, cfg.dataLonga), AUTOR: art.a, AUTOR_INICIAL: (art.a || 'R').charAt(0).toUpperCase(),
    CATEGORIA: art.c, CAT_ANCHOR: art.ca, MINUTOS: String(minutosLeitura(art.html)),
  };
  let out = modelo;
  for (const k of Object.keys(v)) out = out.split('{{' + k + '_JSON}}').join(JSON.stringify(v[k]).slice(1, -1));
  for (const k of Object.keys(v)) out = out.split('{{' + k + '}}').join(escapeHtml(v[k]));
  // Caminho da imagem: o modelo traz "<media><slug>.webp"; sem imagem, troca pelo padrão do site.
  if (!art.img) out = out.split(cfg.media + art.slug + '.webp').join(cfg.imagemPadrao || '/apple-touch-icon.png');
  out = out.replace('{{CORPO}}', art.html);
  return out;
}

// ── Listagens ─────────────────────────────────────────────────────────────
async function novosArtigos(env, request) {
  const cfg = await lerConfig(env, request);
  const lista = await lerLista(env);
  let estatico = [];
  const r = await env.ASSETS.fetch(request);
  if (r.status === 200) { try { estatico = await r.json(); } catch (e) { estatico = []; } }
  const novos = lista.map((x) => ({ t: x.t, u: urlRel(x.slug, cfg), p: dataYmd(x.iso), i: imagemDe(x, cfg), c: x.c, a: x.a }));
  const vistos = new Set(novos.map((x) => x.u.replace(/\/$/, '')));
  const merged = novos.concat((estatico || []).filter((x) => x && x.u && !vistos.has(String(x.u).replace(/\/$/, ''))));
  return new Response(JSON.stringify(merged), { headers: { ...JSON_HEAD, 'cache-control': 'public, max-age=120' } });
}

async function searchIndex(env, request) {
  const cfg = await lerConfig(env, request);
  const lista = await lerLista(env);
  let estatico = [];
  const r = await env.ASSETS.fetch(request);
  if (r.status === 200) { try { estatico = await r.json(); } catch (e) { estatico = []; } }
  if (!lista.length) return new Response(JSON.stringify(estatico), { headers: JSON_HEAD });
  const novos = lista.map((x) => ({ t: x.t, u: urlRel(x.slug, cfg), d: x.d, p: dataYmd(x.iso) }));
  const vistos = new Set(novos.map((x) => x.u.replace(/\/$/, '')));
  const merged = novos.concat((estatico || []).filter((x) => x && x.u && !vistos.has(String(x.u).replace(/\/$/, ''))));
  return new Response(JSON.stringify(merged), { headers: { ...JSON_HEAD, 'cache-control': 'public, max-age=120' } });
}

async function sitemapIndex(env, request) {
  const r = await env.ASSETS.fetch(request);
  const lista = await lerLista(env);
  if (r.status !== 200 || !lista.length) return r;
  const base = 'https://' + (env.SITE_HOST || new URL(request.url).hostname);
  let xml = await r.text();
  const extra = '<sitemap><loc>' + base + '/sitemap-antonio.xml</loc></sitemap>';
  if (!xml.includes('/sitemap-antonio.xml')) xml = xml.replace('</sitemapindex>', extra + '</sitemapindex>');
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=600' } });
}

async function sitemapAntonio(env, request) {
  const cfg = await lerConfig(env, request);
  const lista = await lerLista(env);
  const base = 'https://' + (env.SITE_HOST || new URL(request.url).hostname);
  const urls = lista.map((x) =>
    '<url><loc>' + base + urlRel(x.slug, cfg) + '</loc><lastmod>' + dataYmd(x.iso) + '</lastmod>' +
    (x.img ? '<image:image><image:loc>' + base + imagemDe(x, cfg) + '</image:loc><image:title>' + escapeXml(x.t) + '</image:title></image:image>' : '') +
    '</url>').join('');
  const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' + urls + '</urlset>';
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=600' } });
}

async function blogComNovos(env, request) {
  const r = await env.ASSETS.fetch(request);
  const lista = await lerLista(env);
  if (r.status !== 200 || !lista.length) return r;
  const cfg = await lerConfig(env, request);
  let html = await r.text();
  const grade = cfg.flavor === 'pms' ? '<div class="pms-blog-grid">' : '<div class="iort-blog-grid">';
  const i = html.indexOf(grade);
  if (i < 0) return new Response(html, r);
  const cards = lista
    .filter((x) => !html.includes('href="' + urlRel(x.slug, cfg) + '"'))
    .map((x) => cardBlog(x, cfg)).join('');
  html = html.slice(0, i + grade.length) + cards + html.slice(i + grade.length);
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}

function cardBlog(x, cfg) {
  const u = urlRel(x.slug, cfg), img = imagemDe(x, cfg), ymd = dataYmd(x.iso), br = dataBr(ymd, cfg.dataLonga);
  const t = escapeHtml(x.t), a = escapeHtml(x.a), c = escapeHtml(x.c);
  const estilo = 'position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;object-fit:cover;color:transparent';
  if (cfg.flavor === 'pms') {
    return '<a class="pms-post" href="' + u + '"><span class="pms-post-capa"><img alt="' + t + '" loading="lazy" decoding="async" style="' + estilo + '" src="' + img + '"/></span>' +
      '<span class="pms-post-corpo"><span class="pms-post-meta"><span class="pms-post-cat">' + c + '</span><time dateTime="' + ymd + '">' + br + '</time></span>' +
      '<h3>' + t + '</h3><span class="pms-post-resumo">' + escapeHtml(x.d) + '</span><span class="pms-post-ler">Por ' + a + ' →</span></span></a>';
  }
  return '<a class="iort-post" href="' + u + '"><span class="iort-thumb iort-thumb--card"><img alt="' + t + '" loading="lazy" decoding="async" class="iort-thumb-img" style="' + estilo + '" src="' + img + '"/></span>' +
    '<div class="iort-post-body"><p class="iort-post-kicker"><b>' + c + '</b><time dateTime="' + ymd + '">' + br + '</time></p><h3>' + t + '</h3>' +
    '<p class="iort-post-author"><i>' + escapeHtml((x.a || 'R').charAt(0).toUpperCase()) + '</i><span>Por <b>' + a + '</b></span></p></div></a>';
}

// ── Utilidades ────────────────────────────────────────────────────────────
let _cfg = null;
async function lerConfig(env, request) {
  if (_cfg) return _cfg;
  const txt = await lerAsset(env, request, '/_antonio/config.json');
  _cfg = txt ? JSON.parse(txt) : { categorias: {}, categoriaPadrao: 'Notícias', media: '/media/antonio/', flavor: 'iort', urlBarra: false };
  return _cfg;
}
async function lerAsset(env, request, caminho) {
  const u = new URL(request.url); u.pathname = caminho; u.search = '';
  const r = await env.ASSETS.fetch(new Request(u.toString(), { method: 'GET' }));
  return r.status === 200 ? r.text() : null;
}
function urlRel(slug, cfg) { return '/' + slug + (cfg.urlBarra ? '/' : ''); }
function imagemDe(x, cfg) { return x.img ? cfg.media + x.slug + '.webp' : (cfg.imagemPadrao || '/apple-touch-icon.png'); }
function json(obj, status = 200) { return new Response(JSON.stringify(obj), { status, headers: JSON_HEAD }); }
function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function escapeXml(s) { return escapeHtml(s); }
function limpa(s) { return s.replace(/\s+/g, ' ').trim(); }
// O Antônio manda title/content passados por htmlspecialchars(ENT_QUOTES): desfaz só esses cinco.
function decodeEntidades(s) { return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&'); }
function slugify(s) {
  let t = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (t.length > 80) t = t.slice(0, 80).replace(/-+$/, '');
  return t || 'artigo';
}
function resumo(html, n) {
  const txt = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  return txt.length > n ? txt.slice(0, n).replace(/\s+\S*$/, '') + '…' : txt;
}
function minutosLeitura(html) {
  const palavras = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
}
function dataYmd(iso) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
}
function dataBr(ymd, longa) {
  const [y, m, d] = ymd.split('-').map(Number);
  const curtos = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  const longos = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return d + ' de ' + (longa ? longos[m - 1] : curtos[m - 1]) + ' de ' + y;
}
