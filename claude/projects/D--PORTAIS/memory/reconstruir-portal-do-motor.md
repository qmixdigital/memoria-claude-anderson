---
name: reconstruir-portal-do-motor
description: "Não existe script de rebuild no servidor; rebuildIndexes(cfg, site) refaz home, editorias e todos os artigos"
metadata:
  node_type: memory
  type: reference
---

Depois de mexer numa arquitetura, o HTML no disco continua o antigo até o portal
ser reconstruído. **Não existe script pronto** em `/opt/portal-engine`. O que
resolve é `rebuildIndexes(cfg, site)` do `render.js`: ele reescreve a home e
percorre `for (const a of arts)` refazendo **todos** os artigos, não só os
índices, apesar do nome.

```js
/* /tmp/reconstroi.js  —  node /tmp/reconstroi.js <slug> */
const fs = require('fs');
const { rebuildIndexes } = require('/opt/portal-engine/src/render');
const cfg  = JSON.parse(fs.readFileSync('/opt/portal-engine/sites.json', 'utf8'));
const site = cfg.sites.find(s => s.slug === process.argv[2]);
if (!site) { console.error('portal nao encontrado'); process.exit(2); }
rebuildIndexes(cfg, site);
```

Ordem: `systemctl restart portal-engine` antes (ver
[[reiniciar-motor-depois-de-editar]]), depois o rebuild. E comparar o md5 do
`public/index.html` antes e depois, senão não dá para saber se rodou: ver
[[rebuild-exit-code-antes-de-comparar]].

Cada arquitetura pode servir um portal só. Conferir antes de editar, com
`fp.arch` do `sites.json`, senão a mudança pega vizinho sem querer.
