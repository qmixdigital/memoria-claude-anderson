---
name: reference_portal_engine_dek_copia_meta
description: "No portal-engine, publicar sem o campo dek faz a linha fina sair como cópia da meta description, o que viola a regra de linha fina"
metadata:
  type: reference
---

Publicar no portal-engine sem passar o campo `dek` **não deixa o artigo sem
linha fina**: o motor cai para o `excerpt` / `metaDescription`, e a linha fina
publicada vira uma **cópia literal da meta description**.

Isso passa despercebido porque a página fica visualmente correta, com linha
fina no lugar certo, tamanho certo e cor certa. Só comparando o texto com a
`<meta name="description">` é que aparece.

Viola direto a regra de linha fina do CLAUDE.md: ela não pode repetir o title
nem a meta description. Aconteceu nos 5 guest posts do danfemax em 01/09/2026,
nos 5 portais, e só foi pego na auditoria de SEO depois de publicado.

**How to apply:** sempre passar `dek` explícito no payload de publicação, com
uma frase de 10 a 20 palavras que entregue informação nova, diferente do title
e da meta, sem travessão. Conferir depois de publicar comparando o texto logo
após o `</h1>` com o conteúdo da meta description.

Correção depois do fato é barata: o `dek` fica gravado no JSON do artigo em
`/srv/portais/<slug>/data/<slug>.json`, então basta editar o campo e rodar
`rebuildIndexes`. Ver também [[feedback_padrao_links_guest_post]] e
[[reference_portal_engine_publish_articles]].
