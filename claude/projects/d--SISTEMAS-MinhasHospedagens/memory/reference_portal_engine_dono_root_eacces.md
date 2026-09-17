---
name: reference_portal_engine_dono_root_eacces
description: rebuild_site.js do portal-engine aborta com EACCES quando arquivos de /srv/portais viraram dono root; corrigido nos 3 hosts em 07/09/2026
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-07T07:09:25.161Z
---

O `rebuild_site.js` roda como usuário `portais` e **aborta o site inteiro** no primeiro
arquivo cujo dono seja `root`. O erro é `EACCES: permission denied, open
.../index.html.tmp.NNN` e vem de `writeAtomic` em `src/render.js`, apontando um artigo
qualquer que nada tem a ver com o que se estava publicando.

**Como aparece:** você publica um artigo novo, roda o rebuild, e ele estoura citando um
slug antigo e sem relação. O artigo novo não entra na home, na categoria nem no sitemap.

**Causa:** qualquer operação anterior feita direto como root dentro de
`/srv/portais/<portal>/` (cópia de arquivo, edição de JSON, `cp` de imagem) deixa o
arquivo com dono root, e o rebuild seguinte quebra.

**Conserto:**

```bash
chown -R portais:portais /srv/portais/
```

**Como conferir antes:**

```bash
for d in /srv/portais/*/; do n=$(find "$d" -not -user portais | wc -l); [ "$n" -gt 0 ] && echo "$(basename $d): $n"; done
```

Varredura de 07/09/2026 encontrou o problema em escala: **26 portais no srv1166087**
(folhaum 2.140 arquivos, gdsnoticias 2.019, diariodegoiania 1.665, diariodobrejo 1.430),
**5 no opengravity** e **~25 na clinicas-vps**. Todos corrigidos na mesma data. Ou seja,
não era caso isolado: a maioria desses portais teria falhado no próximo rebuild.

**Regra prática:** ao copiar JSON ou imagem para dentro de `/srv/portais/` por SSH como
root, sempre rodar o `chown portais:portais` nos arquivos tocados **antes** do rebuild.

Ver [[reference_portal_engine_publish_articles]], [[reference_portal_engine_pub_sem_rebuild]].
