---
name: receptor-slugifica-o-nome-da-categoria
description: "Publicar pelo receptor com o NOME da editoria cria a pasta pelo slug do nome (Mídia → /midia/), não pelo slug do categoryMap (marketing); o artigo nasce na URL errada"
metadata:
  type: project
---

Em 15/09/2026, no qmixdigital, `categories: ["Mídia"]` no POST do receptor
gerou `/midia/frases-50-anos-engracadas/`, enquanto o categoryMap diz que
"Mídia" mora em `marketing` (é a editoria de `/marketing/frases-para-vender-mel/`).
O receptor slugificou o nome em vez de procurar no mapa. No EuVo não apareceu
porque "Dicas" e `dicas` coincidem.

**Why:** os links de "Veja também" dos textos novos apontavam para
`/marketing/<slug>/` e ficaram em 404 até a correção, e a pasta `/public/midia`
e a listagem `/public/categoria/midia` ficaram no disco (ver
[[editoria-vazia-deixa-listagem-velha]]).

**How to apply:** quando o nome da editoria não coincide com o slug, conferir
a URL devolvida pelo receptor na hora; se vier errada, corrigir `category` e
`categories` (lista de `{name, slug}`) no JSON do artigo, apagar as pastas
criadas, reiniciar o motor e reconstruir. Melhor ainda: antes de publicar,
olhar um artigo já existente da editoria e copiar o par `{name, slug}` dele.
Ver [[editoria-vem-da-url-nao-de-cats0]] e [[default-category-fora-do-mapa]].
