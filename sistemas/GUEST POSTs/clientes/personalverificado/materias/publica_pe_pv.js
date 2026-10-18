const fs = require('fs');
const { publishArticle, rebuildIndexes } = require('/opt/portal-engine/src/render.js');
const cfg = require('/opt/portal-engine/sites.json');
const sites = Array.isArray(cfg) ? cfg : cfg.sites;

const DIR = '/tmp/pv_pe';
const manifest = JSON.parse(fs.readFileSync(`${DIR}/manifest_portalengine.json`, 'utf8'));
const HOST_FILTER = process.argv[2]; // 'opengravity' ou 'clinicas-vps'
const outPath = `${DIR}/resultado_${HOST_FILTER}.json`;
const out = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : {};

(async () => {
  for (const item of manifest) {
    if (item.host !== HOST_FILTER) continue;
    const site = sites.find(s => s.slug === item.site);
    if (!site) { console.log(item.n, 'SITE NAO ENCONTRADO', item.site); continue; }
    try {
      const imgBuf = fs.readFileSync(`${DIR}/${item.img}`);
      const payload = {
        title: item.titulo,
        content: item.html,
        subtitle: item.resumo,
        slug: item.slug,
        categories: [item.cat_id],
        tags: [],
        status: 'publish',
        image_base64: imgBuf.toString('base64'),
        image_alt: item.alt, meta_description: item.meta, metaTitle: item.metaTitle,
      };
      const r = publishArticle(cfg, site, payload);
      await Promise.resolve(rebuildIndexes(cfg, site));
      out[item.n] = { site: item.site, url: r.url, status: r.status };
      console.log(item.n, 'OK', item.site, r.url);
    } catch (e) {
      console.log(item.n, 'ERRO', item.site, e.message);
      out[item.n] = { erro: e.message };
    }
    fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
  }
  console.log('FIM', HOST_FILTER);
})();
