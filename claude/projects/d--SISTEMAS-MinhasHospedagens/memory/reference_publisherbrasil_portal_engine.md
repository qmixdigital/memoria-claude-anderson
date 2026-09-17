---
name: reference_publisherbrasil_portal_engine
description: "publisherbrasil.com.br é portal-engine no opengravity (não WP, não está no conector MCP); categoryMap, autor por editoria e a armadilha de arquivo root que quebra o rebuildIndexes"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 11d63bfc-1400-4f76-816e-cd634e1dbc24
  modified: 2026-09-09T18:42:49.558Z
---

`publisherbrasil.com.br` roda **portal-engine no opengravity**, em
`/srv/portais/publisherbrasil`. Não é WordPress, **não** está no conector MCP
"Sites Jean" e **não** está mais na hostinger-anderson-gna (a doc
`Hostinger-anderson.gna/CONEXAO.md` ainda o lista, mas a conta só tem 2 domínios
hoje). Zona Cloudflare `bf7cb6ba8e833b6590a987c2a021228b`, IndexNow key
`<<REMOVIDO>>`.

**categoryMap** (o id que o Antônio/publicador manda): `1` Livros (`/livros/`),
`3` Resumo (`/resumo/`), 12 marketing, 13 cursos, 15 e 64 dicas, 29 moda,
30 saude, 31 negocios, 32 tecnologia, 33 casa, 34 curiosidades, 49 iptv,
61 insights, 62 entretenimento, 63 e 65 noticias. `flatUrl: false` e
`categoryBase: "categoria"`, então artigo é `/<cat>/<slug>/` e a listagem é
`/categoria/<cat>/`.

**Assinatura é automática por editoria** (`_assina`): categoria `livros`,
`resumo`, `entretenimento`, `curiosidades` e `iptv` saem como **Batista
Figueiro**. Mandar `author` no payload sobrescreve.

**ARMADILHA que custou um deploy pela metade:** `rebuildIndexes` rodando como
`runuser -u portais` **estoura EACCES** se alguém já rodou um rebuild como root
antes, porque os `index.html` que o root escreveu ficam dele. Os artigos são
gravados normalmente e só o rebuild morre, então o lote parece publicado e fica
fora do sitemap. O serviço (`systemctl cat portal-engine`) roda como
**`portais`**, então a correção é `chown -R portais:portais /srv/portais/<slug>`
e **nunca** rodar o motor como root. Conferir com
`find /srv/portais/<slug> -user root | wc -l` antes de publicar lote.

**Esta versão do motor aceita `payload.slug`** (regex `^[a-z0-9][a-z0-9-]*$`),
corrigindo o que diz [[reference_portal_engine_publish_articles]]: o slug só cai
para `slugify(title)` quando não é enviado. Payload aceita ainda `metaTitle`
(o motor corta em 60 já com o sufixo ` - Publisher Brasil`, então sobram ~41
chars), `subtitle` → dek/linha fina, `meta_description`, `tags`, `status`,
`image_base64` (converte pra WebP com ImageMagick, resize 1000px) e
`import: true`, que **suprime o ping IndexNow e o purge CF por artigo**, útil
quando não se quer contaminar teste de indexação.

**FAQ vira schema sozinho:** o motor gera `FAQPage` quando acha um
`<h2>` contendo "perguntas frequentes", "dúvidas frequentes" ou "faq", seguido de
pares `<h3>` pergunta + `<p>` resposta (mínimo 2 pares, resposta > 30 chars).
Tabela responsiva também é nativa: basta `<table>` com `data-rotulo` em cada
`<td>`, que abaixo de 640px cada linha vira cartão.

**autoLink: o `map` estava VAZIO e o fallback sabotava o cluster.** Com
`autoLink.map: []`, `autoLinkContent` cai no `fallback.pool` e anexa em TODO
artigo um "Veja também" com 2 links de CATEGORIA sorteados por hash do slug, com
âncora fraca ("o que reunimos sobre negócios"). Resultado: artigo de Vidas Secas
terminava apontando para Negócios e Marketing, drenando sinal temático da
editoria. Corrigido em 09/09/2026 com 16 entradas `{url, terms[]}` de literatura
(backup `sites.json.bak-autolink-202609091846`).

**BUG do motor corrigido no mesmo dia:** a trava anti-autolink era
`url === '/' + slug + '/'`, que **só funciona em site com `flatUrl`**. Em site
com `/categoria/slug/` o próprio artigo casava o termo e ganhava link para si
mesmo. Patch em `/opt/portal-engine/src/render.js` (~linha 1730) acrescentando
`|| url.replace(/\/+$/, '').endsWith('/' + slug)`; backup
`render.js.bak-selflink-*`. Vale para os 19 portais do opengravity, mas ficava
dormente porque os outros têm o `map` vazio.

**O autoLink roda no PUBLISH, não no rebuild.** O conteúdo é gravado já linkado,
então mudar `autoLink.map` não altera artigo nenhum que já existe: é preciso
**republicar** (idempotente por slug). Atenção: republicar **reseta o `date`**
para agora, o motor não preserva a data anterior.

Ver [[reference_portal_engine_pub_sem_rebuild]] (o rebuild precisa ser chamado
explicitamente em script one-shot) e [[reference_portal_engine_dedup_por_host]].
