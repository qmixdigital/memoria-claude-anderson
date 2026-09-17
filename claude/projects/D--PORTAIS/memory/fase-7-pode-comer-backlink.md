---
name: fase-7-pode-comer-backlink
description: a limpeza do conteúdo importado remove blocos inteiros, e o backlink pago pode estar dentro de um deles
metadata:
  node_type: memory
  type: feedback
---

A Fase 7 tira lixo removendo **blocos inteiros**: `<figure>` de imagem morta,
`<script>`, comentário de tema, `<img>` de terceiro. O backlink de cliente pode
estar **dentro de um desses blocos**, e some junto sem aparecer em conta nenhuma.

Achados em 22/08/2026 comparando origem e motor, artigo por artigo:

- `cadernoseletronicosdisf.com.br`, âncora "teste IPTV em 4K", vinha num
  `<figcaption>` de um `<figure>` com `<video>` hospedado no cliente. O embed saiu
  e a legenda com o link foi junto. Aconteceu em **três portais**
- `portugaldigital.com.br`, âncora "comprar seguidores brasileiro", tinha o `href`
  quebrado na origem (`//www.dominio.com.br/&quot;`, com aspas escapadas dentro
  do atributo). O texto ficou no parágrafo, a tag não

**Why:** o artigo foi preservado **por causa daquele link**. Perdê-lo é entregar
um portal que parece bom e não cumpre o combinado. E o defeito é silencioso: o
artigo continua no ar, bonito, sem o produto dentro.

**How to apply:** ao fim de toda conversão, comparar o conjunto de domínios de
cliente do corpo da **origem** com o do **motor**, artigo por artigo. Descontar o
que foi desembrulhado de propósito por domínio morto, e provar isso **consultando
o DNS**, não uma lista, porque a lista pode ter sido sobrescrita. O que sobra é
perda de verdade e se repõe: volta a **frase com o link**, nunca o vídeo ou a
imagem de terceiro. Ver [[backlink-de-cliente-fora-do-ar]] e
[[lixo-de-tema-no-corpo-importado]].
