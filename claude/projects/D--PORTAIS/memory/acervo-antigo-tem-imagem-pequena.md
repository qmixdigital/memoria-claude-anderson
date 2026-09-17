---
name: acervo-antigo-tem-imagem-pequena
description: Site de 2014 a 2017 sobe foto de 300 a 450px; na coluna de 700 elas ficam pequenas e de tamanhos diferentes, e o original não existe
metadata:
  type: project
---

No seuguiadesaude, 446 das 520 imagens de corpo tinham 500px ou menos, e a
página parecia desorganizada: cada imagem no tamanho nativo, de 300, 400 ou
450px, numa coluna de ~700px.

**Duas causas, e as duas foram medidas antes de agir:**

- 114 vinham da **miniatura** do WordPress (`foto-300x160.jpg`). Pedi o arquivo
  sem o sufixo e os 114 respondem **404**: o original foi apagado do `uploads`.
- as outras 406 já eram o original. O site é de 2014 a 2017, quando se subia
  foto de 400px.

**How to apply:** não há o que recuperar, então o conserto é ampliar o arquivo
uma vez, com `-filter Lanczos` e `-unsharp 0x0.7+0.7+0.02`, o que fica
visivelmente melhor do que deixar o navegador ampliar na hora de desenhar.
Limites que valeram: teto de **2,4×** (300 → 700 conferido na tela, sem
artefato), e **só imagem deitada** ocupa a coluna inteira. Quadrada ou em pé
para em 460px, senão uma foto de produto vira um bloco de 700px de altura no
meio do texto. Guardar o arquivo de origem: ampliação não se desfaz.
