---
name: reference_portal_engine_pages_deploy_apos_publicar
description: "Desde 17/09/2026 os portais do portal-engine (104 nos 3 hosts) são servidos pelo Cloudflare Pages; publicar por script one-shot deixa o artigo 404 até rodar `node /opt/portal-engine/pages_pack.js <slug>` (ou /root/deploy_pages.sh)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 11d63bfc-1400-4f76-816e-cd634e1dbc24
  modified: 2026-09-18T15:35:19.931Z
---

Em 18/09/2026 um guest post publicado no opopularjornal (opengravity) ficou **404 no domínio** apesar de `public/<slug>/index.html` existir e o origin (`--resolve` no IP da VPS) responder 200. Causa: o DNS dos portais aponta para o **Cloudflare Pages** (Direct Upload), não mais para o nginx da VPS. A lista está em `/opt/portal-engine/pages.json` → `contas` (opengravity 40, srv1166087 27, clinicas-vps 37 = todos os portais do motor).

O deploy automático do motor (render.js ~linha 1663, `pages_pack.js` com debounce de 25 s, fire-and-forget) só dispara dentro do processo do receptor; um script one-shot (pub_*.js) sai antes e nada sobe. O `systemctl restart portal-engine` também não deploya.

**Fix:** depois de publicar + rebuild, rodar `bash /root/deploy_pages.sh <slug...>` (helper instalado nos 3 hosts em 18/09; chama `node pages_pack.js` com HOME=/opt/portal-engine, que faz `wrangler pages deploy` e purge da zona). O `pub.sh` de `D:/tmp/jmt2` já chama; o `run.sh` agendado de `/root/agenda/dm2` (sábado 19/09) foi corrigido para chamar também. Deploy leva ~2 s por portal; conferir com `?nc=` depois.

**Why:** os lotes anteriores (dm lote 1, Revista Dedução) saíram 200 na hora porque a migração de DNS para o Pages foi depois (pages.json.bak-editoras-20260917-1737); hoje todos os 30 respondem 200 porque algum deploy posterior os incluiu.

**How to apply:** todo pipeline de publicação na rede própria termina com deploy no Pages; `verif.py`/`auditar ar` sem esse passo dá 404 falso. Ver [[reference_portal_engine_pub_sem_rebuild]] e [[reference_portal_engine_publish_articles]].
