// Publica artigo direto no portal-engine.
const fs = require('fs');
const cfg = require('/opt/portal-engine/sites.json');
const R = require('/opt/portal-engine/src/render.js');
const p = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const site = cfg.sites.find(s => s.domain === p.dominio);
if (!site) { console.log('SITE?'); process.exit(1); }
const r = R.publishArticle(cfg, site, {
  title: p.titulo, content: fs.readFileSync(p.arqHtml, 'utf8'),
  excerpt: p.meta, meta_description: p.meta, slug: p.slug,
  category: p.categoria, categories: [p.categoria],
  imagem: p.slug + '.webp', image_alt: p.alt, image_caption: p.caption, image_title: p.titulo,
  image_base64: 'data:image/webp;base64,' + fs.readFileSync(p.arqImg).toString('base64'),
});
console.log('RESULTADO ' + JSON.stringify(r).slice(0, 300));
console.log("rebuild"); R.rebuildIndexes(cfg, site);
