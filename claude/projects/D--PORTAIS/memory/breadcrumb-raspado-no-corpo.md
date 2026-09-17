---
name: breadcrumb-raspado-no-corpo
description: O corpo trazia a trilha de navegação do site raspado, com BreadcrumbList e link para domínio de terceiro
metadata:
  type: project
---

Artigos vindos de raspagem trazem no `content` um bloco `evte-breadcrumbs`
inteiro: a trilha do site de onde o texto foi copiado, com **microdados
`BreadcrumbList`** e **link para um domínio que não é da rede**
(`auto.docsbrasil.work`, no folhar).

Três problemas de uma vez: trilha visível no meio do texto, `BreadcrumbList`
duplicado (o motor já emite o dele) e link externo para domínio de terceiro que
ninguém contratou.

Junto costuma vir o `<div id="post-NNN">` do tema embrulhando o texto todo, e um
bloco `entry-featured-image` / `ct-featured-image` com a **foto de abertura
repetida**, que o motor já renderiza no topo.

**Why:** nada disso aparece em auditoria de HTML, é markup válido. O que denuncia
é ler o começo do artigo — foi assim que apareceu, ao conferir os artigos sem
imagem.

**How to apply:** procurar `evte-breadcrumbs`, `BreadcrumbList` e
`<div id="post-` no corpo de todo acervo importado. O `div` do tema sai por
contagem de profundidade, nunca com regex não-guloso, que levaria o conteúdo
junto.

Ver [[lixo-de-tema-no-corpo-importado]], [[pagina-renderizada-dentro-do-content]]
e [[imagem-hospedada-por-terceiro-no-corpo]].
