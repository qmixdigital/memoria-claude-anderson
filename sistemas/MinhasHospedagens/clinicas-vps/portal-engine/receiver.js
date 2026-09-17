'use strict';
/**
 * receiver.js — endpoint multi-site que recebe artigos do Sistema Antonio
 * e publica HTML estatico. Sem dependencias externas (Node puro).
 *
 * Compativel com o receptor WP atual:
 *   POST /<ns>/artigos   (ex: /teste-api/v1/artigos)
 *   Header: X-API-KEY: <chave do site>
 *   Body JSON: { title, content, excerpt, image_base64, imagem,
 *                image_alt, image_caption, image_title, categories[], tags[],
 *                status, scheduled_date, author }
 *   Resposta: 201 { success:true, slug, url } | erro { success:false, message }
 *
 * Escuta SOMENTE em 127.0.0.1 (Nginx faz o proxy). Nao exposto a internet.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { publishArticle } = require('./render');

const CFG_PATH = path.join(__dirname, '..', 'sites.json');
let cfg = load();

function load() {
  return JSON.parse(fs.readFileSync(CFG_PATH, 'utf8'));
}
// recarrega config se o arquivo mudar (sem reiniciar o servico)
fs.watchFile(CFG_PATH, { interval: 2000 }, () => {
  try { cfg = load(); log('sites.json recarregado'); } catch (e) { log('erro ao recarregar sites.json: ' + e.message); }
});

function log(msg) { process.stdout.write(`[${new Date().toISOString()}] ${msg}\n`); }

function timingSafeEq(a, b) {
  const ba = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
function findSiteByKey(key) {
  if (!key) return null;
  return cfg.sites.find(s => timingSafeEq(s.apikey, key)) || null;
}
function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}
function findSiteByDomain(host) {
  if (!host) return null;
  const h = String(host).split(':')[0].replace(/^www\./i, '').toLowerCase();
  return cfg.sites.find(s => s.domain && s.domain.replace(/^www\./i, '').toLowerCase() === h) || null;
}
function escTxt(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ----- 301 de URLs antigas (migracao WordPress -> motor) -----
// Cada site pode ter /srv/portais/<slug>/redirects.json = { "/url-antiga/": "/categoria/url-nova/" }.
// O Nginx do site convertido manda os 404 (try_files ... @oldredir) pro receptor; aqui devolvemos 301.
// So afeta sites cujo vhost usa @oldredir (os portais live usam =404 e nunca chegam aqui).
const _redirCache = {}; // slug -> { mtimeMs, map }
function loadRedirects(site) {
  const file = path.join('/srv/portais', site.slug, 'redirects.json');
  try {
    const st = fs.statSync(file);
    const c = _redirCache[site.slug];
    if (c && c.mtimeMs === st.mtimeMs) return c.map;
    const map = JSON.parse(fs.readFileSync(file, 'utf8'));
    _redirCache[site.slug] = { mtimeMs: st.mtimeMs, map };
    return map;
  } catch (e) { return null; }
}
function lookupRedirect(site, urlPath) {
  const map = loadRedirects(site);
  if (!map) return null;
  const tryKeys = [urlPath];
  if (urlPath.endsWith('/')) tryKeys.push(urlPath.slice(0, -1)); else tryKeys.push(urlPath + '/');
  for (const k of tryKeys) { if (map[k]) return map[k]; }
  return null;
}
function handleOldRedirect(req, res) {
  const site = findSiteByDomain(req.headers.host);
  const urlPath = req.url.split('?')[0];
  if (site) {
    const to = lookupRedirect(site, urlPath);
    if (to) {
      const loc = /^https?:\/\//.test(to) ? to : (site.baseUrl || '') + to;
      res.writeHead(301, { Location: loc });
      log(`[${site.slug}] 301 ${urlPath} -> ${loc}`);
      return res.end();
    }
  }
  // nao e uma URL antiga conhecida -> 404 (o Nginx troca pelo 404 branded via proxy_intercept_errors)
  return send(res, 404, { success: false, message: 'nao encontrado' });
}
function handleContato(req, res) {
  const site = findSiteByDomain(req.headers.host);
  if (!site || !site.contactTo || !cfg.resendKey || !cfg.resendFrom) return send(res, 503, { success: false, message: 'Contato indisponível no momento.' });
  let chunks = [], total = 0, big = false;
  req.on('data', c => { chunks.push(c); total += c.length; if (total > 64 * 1024) { big = true; req.destroy(); } });
  req.on('end', () => {
    if (big) return;
    // juntar como Buffer e decodificar UTF-8 de uma vez so: concatenar chunk a
    // chunk quebrava acento quando o caractere multibyte caia na fronteira
    const raw = Buffer.concat(chunks).toString('utf8');
    let p; try { p = JSON.parse(raw || '{}'); } catch (e) { return send(res, 400, { success: false, message: 'Dados inválidos.' }); }
    const nome = String(p.nome || '').trim().slice(0, 120);
    const email = String(p.email || '').trim().slice(0, 160);
    const assunto = String(p.assunto || '').trim().slice(0, 160);
    const msg = String(p.mensagem || '').trim().slice(0, 4000);
    if (!nome || !msg || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return send(res, 400, { success: false, message: 'Preencha nome, e-mail válido e mensagem.' });
    const html = `<h3>Nova mensagem de contato: ${escTxt(site.name)}</h3>
<p><strong>Nome:</strong> ${escTxt(nome)}</p>
<p><strong>E-mail:</strong> ${escTxt(email)}</p>
<p><strong>Assunto:</strong> ${escTxt(assunto || '(sem assunto)')}</p>
<p><strong>Mensagem:</strong></p><p>${escTxt(msg).replace(/\n/g, '<br>')}</p>`;
    const text = `Nova mensagem de contato: ${site.name}\n\nNome: ${nome}\nE-mail: ${email}\nAssunto: ${assunto || '(sem assunto)'}\n\nMensagem:\n${msg}`;
    if (typeof fetch !== 'function') return send(res, 503, { success: false, message: 'Indisponível.' });
    fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + cfg.resendKey, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ from: `${site.name} <${cfg.resendFrom}>`, to: [site.contactTo], reply_to: email, replyTo: email, subject: `[Contato ${site.name}] ${assunto || nome}`, html, text, headers: { 'Content-Language': 'pt-BR' } }),
    }).then(r => r.json().then(j => ({ ok: r.ok, j })).catch(() => ({ ok: r.ok, j: {} })))
      .then(({ ok, j }) => {
        if (ok) { log(`[${site.slug}] contato enviado (de ${email})`); send(res, 200, { success: true }); }
        else { log(`[${site.slug}] contato FALHOU: ${JSON.stringify(j).slice(0, 200)}`); send(res, 502, { success: false, message: 'Falha no envio. Tente novamente.' }); }
      }).catch(e => { log(`[${site.slug}] contato ERRO: ${e.message}`); send(res, 502, { success: false, message: 'Falha no envio. Tente novamente.' }); });
  });
}

const server = http.createServer((req, res) => {
  // healthcheck simples
  if (req.method === 'GET' && req.url === '/_health') return send(res, 200, { ok: true, sites: cfg.sites.length });

  // formulario de contato publico (envia via Resend)
  if (req.method === 'POST' && req.url.split('?')[0] === '/api/contato') return handleContato(req, res);

  // GET de fallback (@oldredir do Nginx): 301 de URL antiga migrada do WordPress
  if (req.method === 'GET') return handleOldRedirect(req, res);

  if (req.method !== 'POST' || !/\/artigos\/?$/.test(req.url.split('?')[0])) {
    return send(res, 404, { success: false, message: 'rota nao encontrada' });
  }
  const key = req.headers['x-api-key'];
  const site = findSiteByKey(key);
  if (!site) { log(`AUTH FAIL ${req.url} (key ${key ? 'len=' + String(key).length : 'ausente'})`); return send(res, 401, { success: false, message: 'X-API-KEY ausente ou invalida' }); }

  let raw = '';
  let tooBig = false;
  req.on('data', c => {
    raw += c;
    if (raw.length > 8 * 1024 * 1024) { tooBig = true; req.destroy(); } // 8MB cap (imagem base64)
  });
  req.on('end', () => {
    if (tooBig) return;
    let payload;
    try { payload = JSON.parse(raw || '{}'); } catch (e) { return send(res, 400, { success: false, message: 'JSON invalido' }); }
    if (process.env.PE_DEBUG_RAW) log(`[${site.slug}] RAW categories=${JSON.stringify(payload.categories)} author=${JSON.stringify(payload.author)} status=${JSON.stringify(payload.status)} contentLen=${String(payload.content||'').length} title=${JSON.stringify(String(payload.title||'').slice(0,50))}`);
    try {
      const r = publishArticle(cfg, site, payload);
      log(`[${site.slug}] ${r.duplicate ? 'pulado/dup (dono: ' + r.owner + ')' : (r.unchanged ? 'sem mudanca' : 'publicado')}: ${r.slug}`);
      // post_id deterministico (estavel por slug): o Antonio exige este campo p/ marcar a transferencia como sucesso (igual ao receptor WP)
      const pid = parseInt(crypto.createHash('md5').update(site.slug + '/' + r.slug).digest('hex').slice(0, 7), 16);
      return send(res, 201, { success: true, post_id: pid, id: pid, slug: r.slug, url: r.url, link: r.url, status: r.status });
    } catch (err) {
      log(`[${site.slug}] ERRO: ${err.message}`);
      return send(res, err.code === 400 ? 400 : 500, { success: false, message: err.message });
    }
  });
});

const PORT = cfg.port || 8791;
const HOST = cfg.host || '127.0.0.1';
server.listen(PORT, HOST, () => log(`receptor on http://${HOST}:${PORT} (${cfg.sites.length} sites)`));
