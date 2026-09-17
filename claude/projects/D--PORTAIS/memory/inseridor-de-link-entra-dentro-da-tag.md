---
name: inseridor-de-link-entra-dentro-da-tag
description: Proteger link, script e título não basta; sem proteger a própria tag o link abre dentro de um atributo src e quebra a imagem
metadata:
  type: feedback
---

O inseridor de links de contexto protegia `<a>`, `<script>`, `<h1>` a `<h6>` e
`<figcaption>`, mas **não protegia a tag em si**. Quando o nome do arquivo da
imagem continha o termo procurado, ele abriu um link dentro do `src`:

    <img src="/img/<a href="/pele-acne-micose-e-candidiase/">candidiase</a>.webp"

Imagem quebrada e âncora aninhada, em 5 artigos. O auditor só pegou porque a
`<img>` resultante ficou sem `alt` e sem `width`.

**Why:** nome de arquivo de imagem quase sempre contém o assunto do artigo, que
é exatamente o termo que o inseridor procura. A colisão não é rara, é esperada.

**How to apply:** a lista de trechos proibidos tem que incluir **`<[^>]+>`**. Só
o texto ENTRE tags pode ser tocado. E, depois de rodar, procurar
`<[a-zA-Z][^<>]*?<a\s` para provar que não sobrou nenhum. Ver
[[ancora-dentro-de-ancora]] e [[autolink-dentro-de-script]].
