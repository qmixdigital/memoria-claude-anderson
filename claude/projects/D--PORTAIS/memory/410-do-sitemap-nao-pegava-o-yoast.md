---
name: 410-do-sitemap-nao-pegava-o-yoast
description: "A regra cobria `sitemap-<x>.xml` e o Yoast nomeia `<x>-sitemap.xml`; a correção quase derrubou o news-sitemap do motor"
metadata:
  node_type: memory
  type: project
---

A regra de 410 da rede cobre `wp-sitemap*.xml`, `sitemap_index.xml`,
`sitemap-news.xml` e `sitemap-<x>.xml`. O **Yoast nomeia ao contrário**:
`post-sitemap.xml`, `category-sitemap.xml`, `page-sitemap.xml`,
`author-sitemap.xml`. Nenhum casava, e eles respondiam **404**.

Os dois tiram do índice, mas o 410 tira mais rápido, e o `sitemap_index.xml` que
o Google conhece aponta justamente para esses.

🔴 **A armadilha da correção:** `[a-z0-9_-]+-sitemap\.xml` casa também com
**`news-sitemap.xml`**, que é do próprio motor. Sem a negativa, o patch
derrubaria o sitemap do Google News de **todo portal da rede**:

```nginx
|sitemap-[a-z0-9-]+\.xml|(?!news-)[a-z0-9_-]+-sitemap\.xml|
```

Conferência obrigatória depois de aplicar, nos dois sentidos:
`/news-sitemap.xml` em **200** e `/post-sitemap.xml` em **410**.

Aplicado em 22/08/2026 nos 10 vhosts da opengravity que tinham a regra. **Nove
vhosts antigos nunca tiveram bloco de sitemap** e respondem 404: wtw19,
girodasnoticias, jornaldebarcelos, nerddahora, noticias9, noticiasdasemana,
noticiasgoias, osertaoenoticia e portalnoticiasbh.

Ver [[news-sitemap-vazio-da-erro]] e [[cifrao-escapado-no-regex-do-nginx]].
