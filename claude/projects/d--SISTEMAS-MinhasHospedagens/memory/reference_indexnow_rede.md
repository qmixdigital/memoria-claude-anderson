---
name: reference_indexnow_rede
description: "IndexNow instalado em toda a rede (2026-07-13): WP via mu-plugin qmix-indexnow.php (75 sites); portal-engine nativo. Submete no publish. Não reinstalar."
metadata:
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

**IndexNow ativo em toda a rede desde 2026-07-13** — submete URLs a `api.indexnow.org` (Bing/Yandex; Google consome como sinal de descoberta) a cada publish/update. NÃO reinstalar.

**WordPress (75 sites, anderson/vps1/qmix/hostverge):** mu-plugin **`wp-content/mu-plugins/qmix-indexnow.php`**. Key aleatória única por site em `wp_options` `qmix_indexnow_key`, servida em `/{key}.txt` (arquivo estático em ABSPATH + fallback via hook init). Pinga no `transition_post_status`→publish (post/page), non-blocking. **Sem footprint** (server-side, key única/site). Deploy reusa o orquestrador de pruning (allowlist+hosts). Keys de cada site: `D:\SISTEMAS\MinhasHospedagens\indexnow-keys.txt`. Fonte: `scratchpad\qmix-indexnow.php` + `deploy_indexnow.py`. Rank Math tem módulo instant-indexing mas a key IndexNow dele fica VAZIA (não usar — o mu-plugin cobre).

**Portal-engine (opengravity 9/9, srv1166087 12/13; o "teste" não conta):** NATIVO do motor — `pingIndexNow(site,urls)` em `/opt/portal-engine/src/render.js` (POST api.indexnow.org com host/key/keyLocation/urlList), key em `sites.json` campo `indexnowKey`, arquivo `{key}.txt` escrito no public. Pinga no publish (menos import em massa). Já estava ativo.

Verificado: `{key}.txt` HTTP 200 + API IndexNow retorna 202 (aceito). Ver [[reference_portal_engine_publish_articles]].

## Publicar por scp + rebuild_site.js NÃO dispara o IndexNow (07/09/2026)

O `pingIndexNow` só é chamado **dentro de `publishArticle`** (render.js). Quem publica
gravando o JSON direto em `/srv/portais/<portal>/data/` e rodando `node rebuild_site.js`,
que é o caminho usado nas campanhas de guest post, **não passa por ali**: o artigo entra no
ar, entra no sitemap, e nenhum ping sai. Nada no log denuncia, porque a função é
fire-and-forget e silenciosa.

Duas campanhas inteiras (calistenia e enjai, 20 artigos) foram entregues com a afirmação
errada de que o IndexNow já havia disparado.

**Correção:** disparar à mão depois do rebuild, com um script que reusa a mesma chamada
(`scratchpad/wc/ping_indexnow.js`, uso `node ping_indexnow.js <portal> <url...>`), mandando
a URL do artigo, a home e a categoria, como o motor faria.

## Cinco domínios recusam o ping com 403

`wtw19`, `gdsnoticias`, `folhaum`, `entrenoticia` e `edenoticias` devolvem
`UserForbiddedToAccessSite`, **mesmo com a chave publicada e correta** (o `/{key}.txt`
responde 200 com o próprio valor). Provável associação anterior do host a outra chave, da
época em que eram WordPress. Pendência da rede, não de lote.

`ortopediacoluna` e `ortopedistadeombro` não têm `indexnowKey` no `sites.json`.
