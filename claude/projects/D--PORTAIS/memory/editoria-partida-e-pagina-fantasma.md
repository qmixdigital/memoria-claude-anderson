---
name: editoria-partida-e-pagina-fantasma
description: "Trocar a categoria de um artigo deixa a URL antiga no ar com canonical próprio; e nome fora do categoryMap cria editoria acidental"
metadata:
  node_type: memory
  type: project
---

Dois defeitos irmãos, os dois descobertos na auditoria de 29/08/2026 e os dois
invisíveis em qualquer conferência que olhe só o artigo novo.

## Página fantasma

Quando a categoria de um artigo muda, o motor escreve `public/<nova>/<slug>/` e
**não apaga** `public/<antiga>/<slug>/`. A URL velha continua respondendo 200, com
title, h1 e meta idênticos e **canonical apontando para ela mesma**, então ela não
consolida: compete.

Eram **35 páginas em 10 portais**. O conserto é 301 da antiga para a atual em
`/srv/portais/<portal>/redirects.json` e remoção da cópia, **nessa ordem** — com o
arquivo no disco o nginx serve pelo `try_files` e nunca chega ao motor.

Trava contra falso positivo: só é fantasma se o `h1` da cópia for igual ao do artigo
vivo. Sem isso, listagem de editoria cujo slug coincide com o de um artigo entra na
lista (6 casos na rede).

## Editoria partida

Quando a plataforma manda uma categoria cujo nome **não está no `categoryMap`**, o
motor gera o slug a partir do nome e cria uma editoria nova. O portal fica com dois
slugs de mesmo nome de exibição, duas listagens com `<title>` idêntico e o acervo do
assunto dividido.

Eram **60 casos, 89 artigos**, sempre no mesmo formato: o slug legado com o acervo
(`/noticias/` com 626) e o acidental com 1 a 5 (`/atualidades/` com 1).

Tratar só os artigos não resolve: sem acrescentar o nome ao `categoryMap`, a próxima
publicação recria a editoria. Ver [[default-category-fora-do-mapa]] e
[[editoria-vem-da-url-nao-de-cats0]].

Scripts no scratchpad: `fantasmas.py`, `corrige_fantasmas.py`,
`editoria_partida.py`, `corrige_editoria_partida.py`. O relatório está em
`D:\PORTAIS\AUDITORIA-SEO-20260829.md`.

⚠️ **A imagem de capa não leva `loading="lazy"`** e isso está certo: ela é o LCP e
tem `fetchpriority="high"`. Auditor que exige lazy em toda imagem depois da primeira
acusa falso positivo, porque a primeira é o logotipo do cabeçalho.
