---
name: migracao-blog-pages
description: "Blog WP (blog.ombrogoiania.com.br) virou HTML estático em /blog/ no Pages em 19/09/2026; como regenerar, o que ficou na Function e o que falta (Redirect Rule do subdomínio, desligar WP)"
metadata: 
  node_type: memory
  type: project
  originSessionId: dac55fc5-0b53-42ff-87c9-3a320ad11434
  modified: 2026-09-19T10:10:35.344Z
---

Em 19/09/2026 os 231 artigos e 7 categorias do WordPress foram publicados como HTML
estático em `ombrogoiania.com.br/blog/` (commits 99059f2..0a3583b). Fonte única:
`blog/dados/wp-export.json` (gerado por `D:\tmp\exportar-wp.php` via `wp eval-file`);
`python build/gerar-blog.py` regenera tudo, depois `npm run build`. Artigo novo entra no
JSON, nunca mais no WordPress.

**Why:** o `_redirects` do Pages aplica só 100 regras e as linhas de `/blog/` passaram
disso; e o Pages recusa `_routes.json` com regra sobreposta por `/*` (deploy falha com
"Overlapping rules"). Por isso `functions/[[path]].js` cobre tudo menos assets
(`_routes.json` exclui só css/js/fonts/img e extensões) e trata: slugs antigos da raiz,
posts renomeados/apagados (`RENOMEADOS`, 62), tag/page/feed/author/paginação de categoria,
e serve o original quando pedem `-780x470.webp`. Os uploads que o Google indexou (lista
`blog/dados/uploads-indexados.txt`, tirada do GSC) são cópias estáticas em
`blog/wp-content/uploads/`, porque Function em caminho excluído nunca roda.

**How to apply:**
- Virada feita em 19/09/2026 com autorização do Anderson: Redirect Rule na zona
  `273d1aeb06ffda98885f0879303a11e5` (ruleset `70693dcffd0b4644a46c0b5f7dca2fd8`), host
  `blog.ombrogoiania.com.br` → `concat("https://ombrogoiania.com.br/blog", http.request.uri.path)`
  301. O A record do blog (77.37.69.175, proxied) FICA: sem ele a regra não dispara. As duas
  Cache Rules "Blog WP" foram apagadas. O classificador do auto mode nega essa chamada
  (DNS/domínio); rodar só depois do OK dele.
- WordPress APAGADO em 19/09/2026 com autorização do Anderson (v-delete-web-domain +
  v-delete-database qmix_75188 no Hestia da opengravity). Ele não quis backup do WP: o
  backup válido é o site em HTML (repo GitHub, Pages, cópia local). A cópia dos uploads em
  `D:	mp\ombro-uploads` também foi apagada. O `blog.` segue só como A record + Redirect Rule.
- Sitemap índice `sitemap.xml` (→ `sitemap-paginas.xml` + `sitemap-blog.xml`) reenviado
  no GSC em 19/09/2026 e os 8 sitemaps antigos (blog. e wp-sitemap) removidos de lá.
- A zona devolve 429 em rajada de requisições (12 threads); testar com 1 por vez.
- CSP e X-Frame-Options vistos na borda não são os do `_headers` (algo na zona
  sobrescreve); é anterior à migração, não mexer sem pedir.
- Layout do blog é PRÓPRIO, por ordem do Anderson (19/09/2026): não repetir a estrutura nem
  as classes do drtiagobernardes (footprint no Google). CSS em `css/artigos.css`, prefixos
  `pr-` (artigo: abertura+ficha, faixa de imagem, trilho de capítulos à esquerda, assinatura
  no fim) e `rv-` (índice/categoria: capa com sumário, destaque, últimos, mais lidos, arquivo).
  Em novas migrações de blog de cliente, variar de novo: estrutura, nomes de classe e arquivo CSS.
- AEO (19/09/2026): cada artigo tem "Resposta rápida" (44 a 70 palavras) em
  `blog/dados/respostas-diretas.json` (escritas à mão, uma por slug; artigo novo precisa de
  entrada lá), também como `abstract`/`speakable` no BlogPosting. `llms.txt` é gerado pelo
  gerar-blog.py. robots.txt libera os bots de IA. Chave IndexNow na raiz
  (`8b7d4cdeaa51dc993973a80a69cff2ef.txt`); envio: POST api.indexnow.org/IndexNow com o
  urlList dos sitemaps (a verificação da chave leva ~2 min depois do deploy; 403 antes disso).
- Crawler Hints (IndexNow automático) ligado em 19/09/2026. A API pública não tem esse
  setting: é `POST /zones/{zone}/flags/products/cache/changes` com
  `{"feature":"crawlhints_enabled","value":true}` (o token master funciona; PATCH em
  `/flags` dá 405). Conferir em `GET /zones/{zone}/flags` → `cache.crawlhints_enabled`.
- Bing Webmaster Tools: chave em `C:/Users/User/Documents/APIs/bing-webmaster-tools.txt`
  (conta com ~40 sites da rede). API: `https://ssl.bing.com/webmaster/api.svc/json/<Metodo>?apikey=`;
  GET GetUserSites/GetFeeds(siteUrl), POST SubmitFeed/RemoveFeed/SubmitUrlBatch (cota 10k/dia).
  Em 19/09/2026: sitemap índice reenviado, 7 sitemaps antigos (WP, www, blog.) removidos,
  264 URLs enviadas em lote.
- Ver também [[cloudflare-pages-redirects-sem-exclamacao]].
