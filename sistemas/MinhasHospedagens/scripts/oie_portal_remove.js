// Remocao de links nos portais portal-engine (estaticos, nao-WP) — VPS srv1166087.
// Edita os data JSON (content/dek/excerpt), preserva modified/date, backup, e rebuilda o site.
// Parametros: argv[2]=slug; env OIE_DOMAINS (csv, obrigatorio), OIE_DRY=1, OIE_TS.
// Rodar SEMPRE como user portais: runuser -u portais -- node oie_portal_remove.js <slug>
const fs = require('fs');
const path = require('path');
const CFG_PATH = '/opt/portal-engine/sites.json';
const cfg = JSON.parse(fs.readFileSync(CFG_PATH, 'utf8'));
const { rebuildIndexes } = require('/opt/portal-engine/src/render');

const DOMAINS = String(process.env.OIE_DOMAINS || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!DOMAINS.length) { console.error('ERRO: defina OIE_DOMAINS'); process.exit(1); }
const DRY = process.env.OIE_DRY === '1';
const slug = process.argv[2];
const ts = process.env.OIE_TS || String(Date.now());

const site = cfg.sites.find((s) => s.slug === slug);
if (!site) { console.error('site nao encontrado: ' + slug); process.exit(1); }

const dataDir = path.join(cfg.sitesRoot, site.slug, 'data');
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
const bakDir = path.join(dataDir, '.linkbak-' + ts);

function strip(html) {
  let cnt = 0;
  let out = String(html || '');
  for (const dm of DOMAINS) {
    const re = new RegExp('<a\\s[^>]*href\\s*=\\s*["\\\'][^"\\\']*' + dm.replace(/\./g, '\\.') + '[^"\\\']*["\\\'][^>]*>([\\s\\S]*?)<\\/a>', 'gi');
    out = out.replace(re, (m, inner) => { cnt++; return inner; });
  }
  return { out, cnt };
}

let changedFiles = 0, totalLinks = 0;
for (const f of files) {
  const p = path.join(dataDir, f);
  let art;
  try { art = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { continue; }
  const orig = fs.readFileSync(p, 'utf8');
  let fileCnt = 0, touched = false;
  for (const field of ['content', 'dek', 'excerpt']) {
    if (typeof art[field] === 'string' && art[field]) {
      const r = strip(art[field]);
      if (r.cnt > 0) { art[field] = r.out; fileCnt += r.cnt; touched = true; }
    }
  }
  if (touched && fileCnt > 0) {
    changedFiles++; totalLinks += fileCnt;
    if (!DRY) {
      if (!fs.existsSync(bakDir)) fs.mkdirSync(bakDir, { recursive: true });
      fs.writeFileSync(path.join(bakDir, f), orig);
      fs.writeFileSync(p, JSON.stringify(art, null, 2));
    }
  }
}
console.log((DRY ? '[DRY] ' : '[DONE] ') + slug + ' -> arquivos: ' + changedFiles + ' | links: ' + totalLinks);
if (!DRY && changedFiles > 0) {
  rebuildIndexes(cfg, site);
  console.log('   rebuild OK (' + slug + ')');
}
