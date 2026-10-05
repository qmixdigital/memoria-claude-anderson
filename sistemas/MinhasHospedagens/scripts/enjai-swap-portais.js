// Troca de dominio enjai.com.br -> enjai.social nos portais portal-engine (JSON em data/), preserva modified, backup, rebuild.
// Uso: runuser -u portais -- node enjai-swap-portais.js <slug> ; env DRY=1 so conta
const fs = require('fs');
const path = require('path');
const cfg = JSON.parse(fs.readFileSync('/opt/portal-engine/sites.json', 'utf8'));
const { rebuildIndexes } = require('/opt/portal-engine/src/render');
const DRY = process.env.DRY === '1';
const slug = process.argv[2];
const site = cfg.sites.find((s) => s.slug === slug);
if (!site) { console.error('site nao encontrado: ' + slug); process.exit(1); }
const dataDir = path.join(cfg.sitesRoot, site.slug, 'data');
const bakDir = path.join(dataDir, '.swapbak-enjai-' + Date.now());
const PAIRS = [
  [/https?:\/\/(?:www\.)?enjai\.com\.br/gi, 'https://enjai.social'],
  [/https?:(\?\/){2}(?:www\.)?enjai\.com\.br/gi, (m) => m.replace(/^https?/i, 'https').replace(/(?:www\.)?enjai\.com\.br$/i, 'enjai.social')],
  [/\/\/(?:www\.)?enjai\.com\.br/gi, '//enjai.social'],
  [/(?<![A-Za-z0-9-])(?:www\.)?enjai\.com\.br/gi, 'enjai.social'],
];
let files = 0, hits = 0;
for (const f of fs.readdirSync(dataDir).filter((x) => x.endsWith('.json'))) {
  const p = path.join(dataDir, f);
  const orig = fs.readFileSync(p, 'utf8');
  if (!/enjai\.com\.br/i.test(orig)) continue;
  let out = orig, n = 0;
  for (const [re, rep] of PAIRS) out = out.replace(re, (...a) => { n++; return typeof rep === 'function' ? rep(a[0]) : rep; });
  if (out === orig) continue;
  JSON.parse(out); // valida
  files++; hits += n;
  if (!DRY) {
    if (!fs.existsSync(bakDir)) fs.mkdirSync(bakDir, { recursive: true });
    fs.writeFileSync(path.join(bakDir, f), orig);
    fs.writeFileSync(p, out);
  }
}
console.log((DRY ? '[DRY] ' : '[DONE] ') + slug + ' arquivos=' + files + ' trocas=' + hits);
if (!DRY && files > 0) { rebuildIndexes(cfg, site); console.log('  rebuild OK ' + slug); }
