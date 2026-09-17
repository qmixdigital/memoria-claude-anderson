#!/usr/bin/env node
'use strict';
// Baixa as fontes do Google que o tema do portal usa e grava em public/<pasta>/,
// com um CSS local de @font-face. O render (V.fontes) passa a linkar o CSS local
// em vez de fonts.googleapis.com, que aparecia igual nos 104 portais.
//
// uso: node fontes_locais.js <slug> [--forcar]
// Idempotente: se o manifesto (fontes.json) ja cobre a googleUrl atual, nao refaz.
const fs = require('fs'), path = require('path'), https = require('https');
const cfg = JSON.parse(fs.readFileSync('/opt/portal-engine/sites.json', 'utf8'));
const render = require('/opt/portal-engine/src/render');
const slug = process.argv[2];
const forcar = process.argv.includes('--forcar');
const site = (cfg.sites || []).find(s => s.slug === slug);
if (!site) { console.error('portal nao esta no sites.json: ' + slug); process.exit(1); }
const raiz = path.join(cfg.sitesRoot || '/srv/portais', slug);
const pub = path.join(raiz, 'public');
const manifesto = path.join(raiz, 'fontes.json');
const url = render.theme(site).googleUrl;
if (!url) { console.log(slug + ': tema sem googleUrl'); process.exit(0); }
let atual = null;
try { atual = JSON.parse(fs.readFileSync(manifesto, 'utf8')); } catch (e) {}
if (atual && atual.googleUrl === url && !forcar && fs.existsSync(path.join(pub, atual.css))) {
  console.log(slug + ': fontes locais em dia (' + atual.css + ')'); process.exit(0);
}
function h32(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
// pasta e nomes por portal: a pasta "fonts/" igual em todos tambem seria assinatura
const PASTAS = ['f', 'fontes', 'type', 'tipografia', 'assets/f', 'static/fontes', 'ui/f', 'letras', 'fnt', 'estilo/f', 'media/fontes', 'tp'];
const pasta = PASTAS[parseInt(h32(slug + '#fontes'), 36) % PASTAS.length];
function baixa(u, ua) {
  return new Promise((res, rej) => {
    https.get(u, { headers: { 'User-Agent': ua || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36' } }, r => {
      if (r.statusCode !== 200) { rej(new Error('HTTP ' + r.statusCode + ' em ' + u)); r.resume(); return; }
      const b = []; r.on('data', d => b.push(d)); r.on('end', () => res(Buffer.concat(b)));
    }).on('error', rej);
  });
}
(async () => {
  const css = (await baixa(url)).toString('utf8');
  const urls = [...new Set((css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) || []))];
  if (!urls.length) { console.error(slug + ': CSS do Google sem arquivos'); process.exit(2); }
  fs.mkdirSync(path.join(pub, pasta), { recursive: true });
  let local = css;
  for (const u of urls) {
    const nome = h32(slug + u) + '.woff2';
    const alvo = path.join(pub, pasta, nome);
    if (!fs.existsSync(alvo)) fs.writeFileSync(alvo, await baixa(u));
    local = local.split(u).join('/' + pasta + '/' + nome);
  }
  // sem comentarios do Google ("/* latin */") e sem linhas em branco: menos assinatura
  local = local.replace(/\/\*[^*]*\*\//g, '').replace(/\n{2,}/g, '\n').trim() + '\n';
  const cssNome = h32(slug + url) + '.css';
  fs.writeFileSync(path.join(pub, pasta, cssNome), local);
  // limpa arquivos de uma googleUrl anterior
  if (atual && atual.css && atual.css !== '/' + pasta + '/' + cssNome) { try { fs.unlinkSync(path.join(pub, atual.css)); } catch (e) {} }
  fs.writeFileSync(manifesto, JSON.stringify({ googleUrl: url, css: '/' + pasta + '/' + cssNome, arquivos: urls.length, em: new Date().toISOString() }, null, 2));
  console.log(slug + ': ' + urls.length + ' arquivos em /' + pasta + '/, css /' + pasta + '/' + cssNome);
})().catch(e => { console.error(slug + ': ' + e.message); process.exit(3); });
