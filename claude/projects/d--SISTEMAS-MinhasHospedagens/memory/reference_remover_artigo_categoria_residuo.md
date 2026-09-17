---
name: reference_remover_artigo_categoria_residuo
description: "remover_artigo.js do portal-engine não apaga a pasta publicada quando a URL tem categoria; artigo continua 200 no ar depois de 'removido'"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-07T03:49:22.486Z
---

`/opt/portal-engine/remover_artigo.js` apaga `data/<slug>.json`, `public/<slug>` e
`public/img/<slug>.webp`, libera o slug no `_dedup/owners.json` e reconstrói os
índices. O buraco: **portal cujo permalink tem categoria publica em
`public/<categoria>/<slug>/`**, e esse caminho o script não conhece. Ele imprime
`ausente /srv/portais/<site>/public/<slug>` e segue, dando a impressão de sucesso.

Sintoma: o JSON some, o artigo sai do sitemap e da home, mas a URL continua
respondendo **200 com `cf-cache-status: DYNAMIC`**, ou seja, é a origem servindo
o HTML estático antigo, não cache do Cloudflare. Medido em 05/09/2026: de 24
remoções, **17 continuaram no ar** por esse motivo.

Correção depois de rodar o script:

```python
for h in glob.glob('/srv/portais/<site>/public/*/<slug>') + glob.glob('/srv/portais/<site>/public/<slug>'):
    if os.path.isdir(h): shutil.rmtree(h)
```

Depois `systemctl restart portal-engine.service` e conferir a URL com `?nc=`.

**Irmão do mesmo problema no unlink:** corrigir só o `data/<slug>.json` não muda a
página, porque o HTML publicado continua com o link antigo até o próximo render.
Em artigo que fica no ar, aplicar o mesmo strip também em
`public/<categoria>/<slug>/index.html`, guardando `.linkbak-<data>`.

Relacionado: [[reference_portal_engine_motor_cache_404]],
[[reference_link_removal_system]], [[reference_iptv_backlink_scan_removal]].
