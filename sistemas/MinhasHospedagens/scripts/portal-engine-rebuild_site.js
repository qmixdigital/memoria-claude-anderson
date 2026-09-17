const cfg = require("/opt/portal-engine/sites.json");
const R = require("/opt/portal-engine/src/render.js");
const dom = process.argv[2];
const site = cfg.sites.find(s => s.domain === dom || s.slug === dom);
if (!site) { console.log("SITE? " + dom); process.exit(1); }
R.rebuildIndexes(cfg, site);
console.log("REBUILD OK " + site.domain);
